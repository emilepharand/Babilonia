import type {Database} from 'sqlite';
import type DataServiceProvider from './dataServiceProvider';
import {version} from './settings/settingsManager';

export default class DatabaseMigrator {
	constructor(private readonly _databaseToMigrate: Database,
		private readonly _baseDataServiceProvider: DataServiceProvider) {
	}

	async migrate(): Promise<void> {
		await this._databaseToMigrate.exec('BEGIN TRANSACTION;');
		try {
			console.log('Migrating database to version', await this._baseDataServiceProvider.settingsManager.getVersion());
			const sql = 'INSERT OR REPLACE INTO settings (name, value) VALUES (?, ?);';
			await this._databaseToMigrate.run(sql, [version, await this._baseDataServiceProvider.settingsManager.getVersion()]);
			await this._databaseToMigrate.exec('COMMIT;');
		} catch (error) {
			await this._databaseToMigrate.exec('ROLLBACK;');
			throw error;
		}
	}
}
