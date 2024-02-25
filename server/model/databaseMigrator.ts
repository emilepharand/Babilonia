import type {Database} from 'sqlite';
import type DataServiceProvider from './dataServiceProvider';
import {version} from './settings/settingsManager';

export default class DatabaseMigrator {
	constructor(private readonly _databaseToMigrate: Database,
		private readonly _baseDataServiceProvider: DataServiceProvider) {
	}

	async migrate(): Promise<void> {
		await this._databaseToMigrate.exec('BEGIN TRANSACTION;');
		const currentVersion = await this._baseDataServiceProvider.settingsManager.getVersion();
		console.log(`Migrating database to version ${currentVersion}...`);
		const sql = 'INSERT OR REPLACE INTO settings (name, value) VALUES (?, ?);';
		await this._databaseToMigrate.run(sql, [version, currentVersion]);
		await this._databaseToMigrate.exec('COMMIT;');
		console.log('Migration complete.');
	}
}
