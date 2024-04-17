import type {Database} from 'sqlite';
import type DataServiceProvider from '../dataServiceProvider';
import {version} from '../settings/settingsManager';

export default class DatabaseMigrator {
	constructor(private readonly _databaseToMigrate: Database,
		private readonly _baseDataServiceProvider: DataServiceProvider) {
	}

	async migrate(): Promise<void> {
		const currentVersion = await this._baseDataServiceProvider.settingsManager.getVersion();
		console.log(`Migrating database to version ${currentVersion}...`);
		await this._databaseToMigrate.exec('BEGIN TRANSACTION;');

		const sql = 'INSERT OR REPLACE INTO settings (name, value) VALUES (?, ?);';
		await this._databaseToMigrate.run(sql, [version, currentVersion]);

		await this.migrateVersion22();

		await this._databaseToMigrate.exec('COMMIT;');
		console.log('Migration complete.');
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
}
