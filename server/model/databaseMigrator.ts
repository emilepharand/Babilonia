import type {Database} from 'sqlite';
import type DataServiceProvider from './dataServiceProvider';
import {version} from './settings/settingsManager';

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

		// Added in version 2.2
		await this.addOrderingToExpressionTable();

		await this._databaseToMigrate.exec('COMMIT;');
		console.log('Migration complete.');
	}

	async addOrderingToExpressionTable(): Promise<void> {
		const sql = 'PRAGMA table_info(expressions);';
		const result = await this._databaseToMigrate.all(sql);
		const hasOrderingColumn = result.some(column => column.name === 'ordering');
		if (!hasOrderingColumn) {
			await this._databaseToMigrate.exec('ALTER TABLE expressions ADD COLUMN ordering INTEGER NOT NULL DEFAULT 0;');
		}
		const query = `
			UPDATE expressions
			SET    ordering = (SELECT Count(*) - 1
							FROM   expressions AS e
							WHERE  e.ideaid = expressions.ideaid
									AND e.id <= expressions.id);`;
		await this._databaseToMigrate.exec(query);
	}
}
