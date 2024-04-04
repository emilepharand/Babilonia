import fs from 'fs';
import {currentVersion, databaseVersionErrorCode, memoryDatabasePath} from '../../../server/const';
import * as ApiUtils from '../../utils/api-utils';
import {oldVersionDatabaseToMigratePath} from '../../utils/const';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

const previousVersions = ['2.0', '2.1'];

describe('change database', () => {
	test('change database to a version to be migrated', async () => {
		const res = await ApiUtils.changeDatabase(oldVersionDatabaseToMigratePath);
		expect(res.status).toEqual(400);
		expect((await res.json() as { error:string }).error).toEqual(databaseVersionErrorCode);
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
	});
});

describe('migration', () => {
	test.each(previousVersions)('migrating database version %s to current version', async version => {
		function getSimpleDatabaseVersionPath(version: string) {
			return `tests/db/${version}-simple.db`;
		}

		const dbToMigratePath = getSimpleDatabaseVersionPath(version);
		expect(fs.existsSync(dbToMigratePath)).toBe(true);

		const currentVersionPath = getSimpleDatabaseVersionPath(currentVersion);
		await ApiUtils.changeDatabase(currentVersionPath);

		let res = await ApiUtils.changeDatabase(dbToMigratePath);
		expect(res.status).toEqual(400);
		expect((await res.json() as { error:string }).error).toEqual(databaseVersionErrorCode);
		expect(await ApiUtils.getDatabasePath()).toEqual(currentVersionPath);

		res = await ApiUtils.migrateDatabase(dbToMigratePath);
		expect(res.status).toEqual(200);

		res = await ApiUtils.changeDatabase(dbToMigratePath);
		expect(res.status).toEqual(200);
		expect(await ApiUtils.getDatabasePath()).toEqual(dbToMigratePath);
	});
});
