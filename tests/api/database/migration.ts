import {databaseVersionErrorCode, memoryDatabasePath} from '../../../server/const';
import * as ApiUtils from '../../utils/api-utils';
import {oldVersionDatabaseToMigratePath} from '../../utils/const';
beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('change database', () => {
	test('change database to a version to be migrated', async () => {
		const res = await ApiUtils.changeDatabase(oldVersionDatabaseToMigratePath);
		expect(res.status).toEqual(400);
		expect((await res.json() as { error:string }).error).toEqual(databaseVersionErrorCode);
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
	});
});

describe('migration', () => {
	test('migrating 2.1 database to 2.2', async () => {
		const dbToMigratePath = oldVersionDatabaseToMigratePath;
		let res = await ApiUtils.changeDatabase(dbToMigratePath);
		expect(res.status).toEqual(400);
		expect((await (await res.json() as any)).error).toEqual(databaseVersionErrorCode);
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);

		res = await ApiUtils.migrateDatabase(dbToMigratePath);
		expect(res.status).toEqual(200);

		res = await ApiUtils.changeDatabase(dbToMigratePath);
		expect(res.status).toEqual(200);
		expect(await ApiUtils.getDatabasePath()).toEqual(dbToMigratePath);
	});
});
