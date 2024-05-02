import {open} from 'sqlite';
import sqlite3 from 'sqlite3';
import DatabaseGuidMigrator from '../../server/model/database/databaseGuidMigrator';
import {TestDatabasePath} from '../../tests/utils/versions';

describe('migration', () => {
	test('test database migration', async () => {
		let dbToMigrate;
		let baseDb;
		try {
			dbToMigrate = await open({
				filename: new TestDatabasePath('migration-user-version.db').getActualPath(),
				driver: sqlite3.Database,
			});
			baseDb = await open({
				filename: new TestDatabasePath('migration-current-version.db').getActualPath(),
				driver: sqlite3.Database,
			});
			const guidMigrator = new DatabaseGuidMigrator(dbToMigrate, baseDb, {
				language: 5,
				idea: 4,
				expression: 18,
			});
			await guidMigrator.migrateGuids();
		} finally {
			if (dbToMigrate) {
				await dbToMigrate.close();
			}
		}
	});
});
