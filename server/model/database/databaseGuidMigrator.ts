import type {Database} from 'sqlite';
import {columnExists} from './databaseUtils';

export default class DatabaseGuidMigrator {
	constructor(private readonly _databaseToMigrate: Database,
		private readonly _baseDatabase: Database) {
	}

	async migrateGuids(): Promise<void> {
		if (!(await columnExists(this._databaseToMigrate, 'ideas', 'guid'))) {
			await this._databaseToMigrate.run('ALTER TABLE ideas ADD COLUMN guid TEXT');
			await this._databaseToMigrate.run('CREATE UNIQUE INDEX "ideas_guid" ON "ideas" ("guid")');
		}
		if (!(await columnExists(this._databaseToMigrate, 'expressions', 'guid'))) {
			await this._databaseToMigrate.run('ALTER TABLE expressions ADD COLUMN guid TEXT');
			await this._databaseToMigrate.run('CREATE UNIQUE INDEX "expressions_guid" ON "expressions" ("guid")');
		}
		if (!(await columnExists(this._databaseToMigrate, 'languages', 'guid'))) {
			await this._databaseToMigrate.run('ALTER TABLE languages ADD COLUMN guid TEXT');
			await this._databaseToMigrate.run('CREATE UNIQUE INDEX "languages_guid" ON "languages" ("guid")');
		}

		await this.updateGuids();
	}

	private async updateGuids(): Promise<void> {
		let sql = '';
		const languages = await this._baseDatabase.all('SELECT id, guid FROM languages');
		for (const language of languages) {
			sql += `UPDATE languages SET guid = '${language.guid}' WHERE id = ${language.id};\n`;
		}
		const ideas = await this._baseDatabase.all('SELECT id, guid FROM ideas');
		for (const idea of ideas) {
			sql += `UPDATE ideas SET guid = '${idea.guid}' WHERE id = ${idea.id};\n`;
		}
		const expressions = await this._baseDatabase.all('SELECT id, guid FROM expressions');
		for (const expression of expressions) {
			sql += `UPDATE expressions SET guid = '${expression.guid}' WHERE id = ${expression.id};\n`;
		}
		await this._databaseToMigrate.exec(sql);
	}
}
