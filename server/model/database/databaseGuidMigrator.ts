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
		await this.updateContent();
		await this.insertContent();
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

	private async updateContent(): Promise<void> {
		const sql: string[] = [];
		const params: unknown[][] = [];

		await this.updateLanguages(sql, params);
		await this.updateExpressions(sql, params);
		await this.updateIdeas(sql, params);

		await this.execSqlWithParams(sql, params);

		await this._databaseToMigrate.run('DELETE FROM ideas WHERE id NOT IN (SELECT DISTINCT ideaId FROM expressions)');
	}

	private async updateLanguages(sql: string[], params: unknown[][]) {
		const baseLanguages: Array<{guid: string; name: string}> = await this._baseDatabase.all('SELECT guid, name FROM languages');
		const languagesInDb = await this._databaseToMigrate.all('SELECT id, guid FROM languages WHERE guid IS NOT NULL');

		for (const languageInDb of languagesInDb) {
			const matchingBaseLanguage = baseLanguages.find(baseLanguage => baseLanguage.guid === languageInDb.guid);
			if (matchingBaseLanguage) {
				sql.push('UPDATE languages SET name = ? WHERE guid = ?');
				params.push([matchingBaseLanguage.name, languageInDb.guid]);
			} else {
				sql.push('DELETE FROM expressions WHERE languageId = ?');
				params.push([languageInDb.id]);
				sql.push('DELETE FROM languages WHERE guid = ?');
				params.push([languageInDb.guid]);
			}
		}
	}

	private async updateExpressions(sql: string[], params: unknown[][]) {
		const commonSelect = 'SELECT guid, text FROM expressions';
		const baseExpressions: Array<{guid: string; text: string}> = await this._baseDatabase.all(commonSelect);
		const expressionsInDb = await this._databaseToMigrate.all(`${commonSelect} WHERE guid IS NOT NULL`);

		for (const expressionInDb of expressionsInDb) {
			const matchingBaseExpression = baseExpressions.find(base => base.guid === expressionInDb.guid);
			if (matchingBaseExpression) {
				sql.push('UPDATE expressions SET text = ? WHERE guid = ?');
				params.push([matchingBaseExpression.text, expressionInDb.guid]);
			} else {
				sql.push('DELETE FROM expressions WHERE guid = ?');
				params.push([expressionInDb.guid]);
			}
		}
	}

	private async updateIdeas(sql: string[], params: unknown[][]) {
		const commonSelect = 'SELECT id, guid FROM ideas';
		const baseIdeas = await this._baseDatabase.all(commonSelect);
		const ideasToMigrate: Array<{id: number; guid: string}> = await this._databaseToMigrate.all(`${commonSelect} WHERE guid IS NOT NULL`);
		const ideasToDelete = ideasToMigrate.filter(ideaToMigrate => !baseIdeas.some(baseIdea => baseIdea.guid === ideaToMigrate.guid));

		sql.push(...ideasToDelete.map(() => 'DELETE FROM expressions WHERE ideaId = ?'));
		params.push(...ideasToDelete.map(idea => [idea.id]));

		sql.push(...ideasToDelete.map(() => 'DELETE FROM ideas WHERE id = ?'));
		params.push(...ideasToDelete.map(idea => [idea.id]));
	}

	private async insertContent(): Promise<void> {
		const sql: string[] = [];
		const params: unknown[][] = [];

		await this.insertBaseLanguages(sql, params);
		await this.insertBaseIdeas(sql, params);
		await this.insertBaseExpressions(sql, params);

		await this.execSqlWithParams(sql, params);
	}

	private async insertBaseLanguages(sql: string[], params: unknown[][]) {
		const baseLanguages = await this._baseDatabase.all('SELECT name, ordering, guid FROM languages');
		const languagesInDb: Array<{id: number; guid: string}> = await this._databaseToMigrate.all('SELECT id, guid FROM languages');
		for (const baseLanguage of baseLanguages) {
			if (!languagesInDb.find(language => language.guid === baseLanguage.guid)) {
				sql.push('INSERT INTO languages (name, ordering, guid, isPractice) VALUES (?, ?, ?, 0)');
				params.push([baseLanguage.name, baseLanguage.ordering, baseLanguage.guid]);
			}
		}
	}

	private async insertBaseIdeas(sql: string[], params: unknown[][]) {
		const baseIdeas = await this._baseDatabase.all('SELECT guid FROM ideas');
		const ideasInDb: Array<{guid: string}> = await this._databaseToMigrate.all('SELECT guid FROM ideas');
		for (const baseIdea of baseIdeas) {
			if (!ideasInDb.find(idea => idea.guid === baseIdea.guid)) {
				sql.push('INSERT INTO ideas (guid) VALUES (?)');
				params.push([baseIdea.guid]);
			}
		}
	}

	private async insertBaseExpressions(sql: string[], params: unknown[][]) {
		const baseExpressions = await this._baseDatabase.all(`
			SELECT e.guid, i.guid as ideaGuid, l.guid as languageGuid, text, e.ordering
			FROM expressions e
			INNER JOIN ideas i ON i.id = e.ideaId
			INNER JOIN languages l ON l.id = e.languageId
		`);
		const expressionsToMigrate: Array<{guid: string}> = await this._databaseToMigrate.all('SELECT guid FROM expressions');
		for (const baseExpression of baseExpressions) {
			if (!expressionsToMigrate.find(expression => expression.guid === baseExpression.guid)) {
				sql.push('INSERT INTO expressions (guid, ideaId, languageId, text, ordering) VALUES (?, (SELECT id FROM ideas WHERE guid = ?), (SELECT id FROM languages WHERE guid = ?), ?, ?)');
				params.push([baseExpression.guid, baseExpression.ideaGuid, baseExpression.languageGuid, baseExpression.text, baseExpression.ordering]);
			}
		}
	}

	private async execSqlWithParams(sql: string[], params: unknown[][]) {
		for (let i = 0; i < sql.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			await this._databaseToMigrate.run(sql[i], params[i]);
		}
	}
}
