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

		let sql = '';
		const ideas = await this._baseDataServiceProvider.db.all('SELECT id, guid FROM ideas');
		for (const idea of ideas) {
			sql += `UPDATE ideas SET guid = '${idea.guid}' WHERE id = ${idea.id};\n`;
		}
		await this._databaseToMigrate.exec(sql);

		await this.renameTable('languages', 'languages_old');
		await this.renameTable('ideas', 'ideas_old');
		await this.renameTable('expressions', 'expressions_old');

		await this._databaseToMigrate.run(getLanguagesTableQuery());
		await this._databaseToMigrate.run(getIdeasTableQuery());
		await this._databaseToMigrate.run(getExpressionsTableQuery());

		await this.copyTable('languages_old', 'languages');
		await this.copyTable('ideas_old', 'ideas');
		await this.copyTable('expressions_old', 'expressions');

		await this.dropTable('languages_old');
		await this.dropTable('ideas_old');
		await this.dropTable('expressions_old');
	}

	async addOrderingToExpressionTable(): Promise<void> {
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

	async columnExists(tableName: string, columnName: string): Promise<boolean> {
		const query = `
			SELECT 1
			FROM   pragma_table_info('${tableName}')
			WHERE  name = '${columnName}';`;
		return await this._databaseToMigrate.get(query) !== undefined;
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
