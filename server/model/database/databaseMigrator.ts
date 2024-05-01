import type {Database} from 'sqlite';
import type DataServiceProvider from '../dataServiceProvider';
import {version} from '../settings/settingsManager';
import {getExpressionsTableQuery, getIdeasTableQuery, getLanguagesTableQuery} from './databaseInitializer';

export default class DatabaseMigrator {
	constructor(private readonly _databaseToMigrate: Database,
		private readonly _baseDataServiceProvider: DataServiceProvider) {
	}

	async migrate(): Promise<void> {
		try {
			const currentVersion = await this._baseDataServiceProvider.settingsManager.getVersion();
			console.log(`Migrating database to version ${currentVersion}...`);
			await this._databaseToMigrate.exec('BEGIN TRANSACTION;');

			const sql = 'INSERT OR REPLACE INTO settings (name, value) VALUES (?, ?);';
			await this._databaseToMigrate.run(sql, [version, currentVersion]);

			await this.migrateVersion22();

			await this._databaseToMigrate.exec('COMMIT;');
			console.log('Migration complete.');
		} catch (error) {
			console.error('Error migrating database:', error);
			await this._databaseToMigrate.exec('ROLLBACK;');
			throw error;
		}
	}

	async migrateVersion22(): Promise<void> {
		await this.addOrderingToExpressionTable();
		await this.addGuids();
	}

	async addGuids(): Promise<void> {
		if (!(await this.columnExists('ideas', 'guid'))) {
			await this._databaseToMigrate.run('ALTER TABLE ideas ADD COLUMN guid TEXT');
			await this._databaseToMigrate.run('CREATE UNIQUE INDEX "ideas_guid" ON "ideas" ("guid")');
		}
		if (!(await this.columnExists('expressions', 'guid'))) {
			await this._databaseToMigrate.run('ALTER TABLE expressions ADD COLUMN guid TEXT');
			await this._databaseToMigrate.run('CREATE UNIQUE INDEX "expressions_guid" ON "expressions" ("guid")');
		}
		if (!(await this.columnExists('languages', 'guid'))) {
			await this._databaseToMigrate.run('ALTER TABLE languages ADD COLUMN guid TEXT');
			await this._databaseToMigrate.run('CREATE UNIQUE INDEX "languages_guid" ON "languages" ("guid")');
		}

		await this.updateGuids();

		await this.recreateAndCopyTables();
	}

	private async updateGuids(): Promise<void> {
		let sql = '';
		const languages = await this._baseDataServiceProvider.db.all('SELECT id, guid FROM languages');
		for (const language of languages) {
			sql += `UPDATE languages SET guid = '${language.guid}' WHERE id = ${language.id};\n`;
		}
		const ideas = await this._baseDataServiceProvider.db.all('SELECT id, guid FROM ideas');
		for (const idea of ideas) {
			sql += `UPDATE ideas SET guid = '${idea.guid}' WHERE id = ${idea.id};\n`;
		}
		const expressions = await this._baseDataServiceProvider.db.all('SELECT id, guid FROM expressions');
		for (const expression of expressions) {
			sql += `UPDATE expressions SET guid = '${expression.guid}' WHERE id = ${expression.id};\n`;
		}
		await this._databaseToMigrate.exec(sql);
	}

	private async addOrderingToExpressionTable(): Promise<void> {
		const hasOrderingColumn = await this.columnExists('expressions', 'ordering');
		if (!hasOrderingColumn) {
			await this._databaseToMigrate.exec('ALTER TABLE expressions ADD COLUMN ordering INTEGER DEFAULT 0;');
		}
		const query = `
			UPDATE expressions
			SET    ordering = (SELECT Count(*) - 1
							FROM   expressions AS e
							WHERE  e.ideaid = expressions.ideaid
									AND e.id <= expressions.id);`;
		await this._databaseToMigrate.exec(query);
	}

	private async columnExists(tableName: string, columnName: string): Promise<boolean> {
		const query = `
			SELECT 1
			FROM   pragma_table_info('${tableName}')
			WHERE  name = '${columnName}';`;
		return await this._databaseToMigrate.get(query) !== undefined;
	}

	private async recreateAndCopyTables() {
		function getTempTableName(tableTable: string) {
			return `${tableTable}_temp`;
		}
		const languages = 'languages';
		const ideas = 'ideas';
		const expressions = 'expressions';
		const tempLanguages = getTempTableName(languages);
		const tempIdeas = getTempTableName(ideas);
		const tempExpressions = getTempTableName(expressions);

		await this.renameTable(languages, tempLanguages);
		await this.renameTable(ideas, tempIdeas);
		await this.renameTable(expressions, tempExpressions);

		await this._databaseToMigrate.run(getLanguagesTableQuery());
		await this._databaseToMigrate.run(getIdeasTableQuery());
		await this._databaseToMigrate.run(getExpressionsTableQuery());

		await this.copyTable(tempLanguages, languages);
		await this.copyTable(tempIdeas, ideas);
		await this.copyTable(tempExpressions, expressions);

		await this.dropTable(tempLanguages);
		await this.dropTable(tempIdeas);
		await this.dropTable(tempExpressions);
	}

	private async renameTable(tableName: string, newTableName: string) {
		await this._databaseToMigrate.run(`ALTER TABLE ${tableName} RENAME TO ${newTableName}`);
	}

	private async copyTable(tableFrom: string, tableTo: string) {
		await this._databaseToMigrate.run(`INSERT INTO ${tableTo} SELECT * FROM ${tableFrom}`);
	}

	private async dropTable(tableName: string) {
		await this._databaseToMigrate.run(`DROP TABLE ${tableName}`);
	}
}
