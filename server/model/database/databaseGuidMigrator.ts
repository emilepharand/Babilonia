import type {Database} from 'sqlite';
import {columnExists} from './databaseUtils';

export default class DatabaseGuidMigrator {
	constructor(private readonly _databaseToMigrate: Database,
		private readonly _baseDatabase: Database,
		private readonly _maximumsIdForSimpleGuidUpdate: {language: number; idea: number; expression: number} = {expression: 3146, idea: 523, language: 5}) {
	}

	async migrateGuids(): Promise<void> {
		await this.createColumns();
		await this.updateGuidsForOldIds();
		await this.updateGuids();
		await this.insertGuids();
	}

	private async createColumns() {
		const promises = [];
		for (const table of ['ideas', 'expressions', 'languages']) {
			// eslint-disable-next-line no-await-in-loop
			if (!(await columnExists(this._databaseToMigrate, table, 'guid'))) {
				promises.push(this._databaseToMigrate.run(`
					ALTER TABLE ${table} ADD COLUMN guid TEXT;
					CREATE UNIQUE INDEX "${table}_guid" ON "${table}" ("guid");
				`));
			}
		}
		await Promise.all(promises);
	}

	private async updateGuidsForOldIds(): Promise<void> {
		let sql = '';
		const tables = ['languages', 'ideas', 'expressions'];
		const maximums = [this._maximumsIdForSimpleGuidUpdate.language, this._maximumsIdForSimpleGuidUpdate.idea, this._maximumsIdForSimpleGuidUpdate.expression];
		for (const [index, table] of tables.entries()) {
			// eslint-disable-next-line no-await-in-loop
			const rows = await this._baseDatabase.all(`SELECT id, guid FROM ${table} WHERE id <= ${maximums[index]}`);
			for (const row of rows) {
				sql += `UPDATE ${table} SET guid = '${row.guid}' WHERE id = ${row.id};\n`;
			}
		}
		await this._databaseToMigrate.exec(sql);
	}

	private async updateGuids(): Promise<void> {
		const sql: string[] = [];
		const params: unknown[][] = [];

		await this.updateLanguageGuids(sql, params);
		await this.updateExpressionGuids(sql, params);
		await this.updateIdeaGuids(sql, params);

		await this.execSqlWithParams(sql, params);

		await this._databaseToMigrate.run('DELETE FROM ideas WHERE id NOT IN (SELECT DISTINCT ideaId FROM expressions)');
	}

	private async execSqlWithParams(sql: string[], params: unknown[][]) {
		for (let i = 0; i < sql.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			await this._databaseToMigrate.run(sql[i], params[i]);
		}
	}

	private async updateIdeaGuids(sql: string[], params: unknown[][]) {
		const baseIdeas = await this._baseDatabase.all('SELECT id, guid FROM ideas');
		const ideasToMigrate: Array<{id: number; guid: string}> = await this._databaseToMigrate.all('SELECT id, guid FROM ideas');
		for (const ideaToMigrate of ideasToMigrate) {
			if (ideaToMigrate.guid) {
				if (!baseIdeas.find(baseIdea => baseIdea.guid === ideaToMigrate.guid)) {
					sql.push('DELETE FROM expressions WHERE ideaId = ?');
					params.push([ideaToMigrate.id]);
					sql.push('DELETE FROM ideas WHERE id = ?');
					params.push([ideaToMigrate.id]);
				}
			}
		}
	}

	private async updateExpressionGuids(sql: string[], params: unknown[][]) {
		const baseExpressions: Array<{guid: string; text: string}> = await this._baseDatabase.all('SELECT guid, text FROM expressions');
		const expressionsToMigrate = await this._databaseToMigrate.all('SELECT id, guid FROM expressions');
		for (const expressionToMigrate of expressionsToMigrate) {
			if (expressionToMigrate.guid) {
				const baseExpression = baseExpressions.find(baseExpression => baseExpression.guid === expressionToMigrate.guid);
				if (baseExpression) {
					sql.push('UPDATE expressions SET text = ? WHERE guid = ?');
					params.push([baseExpression.text, expressionToMigrate.guid]);
				} else {
					sql.push('DELETE FROM expressions WHERE id = ?');
					params.push([expressionToMigrate.id]);
				}
			}
		}
	}

	private async updateLanguageGuids(sql: string[], params: unknown[][]) {
		const baseLanguages: Array<{guid: string; name: string}> = await this._baseDatabase.all('SELECT guid, name FROM languages');
		const languagesToMigrate = await this._databaseToMigrate.all('SELECT id, guid FROM languages');
		for (const languageToMigrate of languagesToMigrate) {
			if (languageToMigrate.guid) {
				const baseLanguage = baseLanguages.find(baseLanguage => baseLanguage.guid === languageToMigrate.guid);
				if (baseLanguage) {
					sql.push('UPDATE languages SET name = ? WHERE guid = ?');
					params.push([baseLanguage.name, languageToMigrate.guid]);
				} else {
					sql.push('DELETE FROM expressions WHERE languageId = ?');
					params.push([languageToMigrate.id]);
					sql.push('DELETE FROM languages WHERE id = ?');
					params.push([languageToMigrate.id]);
				}
			}
		}
	}

	private async insertGuids(): Promise<void> {
		const sql: string[] = [];
		const params: unknown[][] = [];

		await this.insertLanguageGuids(sql, params);
		await this.insertIdeaGuids(sql, params);
		await this.insertExpressionGuids(sql, params);

		await this.execSqlWithParams(sql, params);
	}

	private async insertExpressionGuids(sql: string[], params: unknown[][]) {
		const baseExpressions: Array<{guid: string; ideaGuid: string; languageGuid: string; text: string; ordering: number}> = await this._baseDatabase.all(`
			SELECT e.guid, i.guid as ideaGuid, l.guid as languageGuid, text, e.ordering
			FROM expressions e
			INNER JOIN ideas i ON i.id = e.ideaId
			INNER JOIN languages l ON l.id = e.languageId
		`);
		const expressionsToMigrate: Array<{guid: string}> = await this._databaseToMigrate.all('SELECT guid FROM expressions');
		for (const baseExpression of baseExpressions) {
			const expressionToMigrate = expressionsToMigrate.find(expression => expression.guid === baseExpression.guid);
			if (!expressionToMigrate) {
				sql.push('INSERT INTO expressions (guid, ideaId, languageId, text, ordering) VALUES (?, (SELECT id FROM ideas WHERE guid = ?), (SELECT id FROM languages WHERE guid = ?), ?, ?)');
				params.push([baseExpression.guid, baseExpression.ideaGuid, baseExpression.languageGuid, baseExpression.text, baseExpression.ordering]);
			}
		}
	}

	private async insertLanguageGuids(sql: string[], params: unknown[][]) {
		const baseLanguages: Array<{name: string; ordering: number; guid: string}> = await this._baseDatabase.all('SELECT name, ordering, guid FROM languages');
		const languagesToMigrate: Array<{id: number; guid: string}> = await this._databaseToMigrate.all('SELECT id, guid FROM languages');
		for (const baseLanguage of baseLanguages) {
			const languageToMigrate = languagesToMigrate.find(language => language.guid === baseLanguage.guid);
			if (!languageToMigrate) {
				sql.push('INSERT INTO languages (name, ordering, guid, isPractice) VALUES (?, ?, ?, 0)');
				params.push([baseLanguage.name, baseLanguage.ordering, baseLanguage.guid]);
			}
		}
	}

	private async insertIdeaGuids(sql: string[], params: unknown[][]) {
		const baseIdeas = await this._baseDatabase.all('SELECT guid FROM ideas');
		const ideasToMigrate: Array<{guid: string}> = await this._databaseToMigrate.all('SELECT guid FROM ideas');
		for (const baseIdea of baseIdeas) {
			const ideaToMigrate = ideasToMigrate.find(idea => idea.guid === baseIdea.guid);
			if (!ideaToMigrate) {
				sql.push('INSERT INTO ideas (guid) VALUES (?)');
				params.push([baseIdea.guid]);
			}
		}
	}
}
