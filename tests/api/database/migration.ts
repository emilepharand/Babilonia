import fs from 'fs';
import {currentVersion, databaseVersionErrorCode, memoryDatabasePath} from '../../../server/const';
import * as ApiUtils from '../../utils/api-utils';
import {getTestDatabaseVersionPath, previousVersions} from '../../utils/const';
import {addAnyIdeaAndTest, editAnyIdeaAndTest} from '../ideas/utils';
import {addAnyLanguageAndTest, editAnyLanguageAndtest} from '../languages/utils';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('change database', () => {
	test.each(previousVersions)('change database to a version %s database', async version => {
		const res = await changeDatabaseAndCheck(getTestDatabaseVersionPath(version), 400, memoryDatabasePath);
		expect((await res.json() as { error:string }).error).toEqual(databaseVersionErrorCode);
	});
});

describe('migration', () => {
	test.each(previousVersions)('migrating database version %s to current version', async version => {
		const dbToMigratePath = getTestDatabaseVersionPath(version);
		expect(fs.existsSync(dbToMigratePath)).toBe(true);

		const currentVersionPath = getTestDatabaseVersionPath(currentVersion);
		await changeDatabaseAndCheck(currentVersionPath, 200, currentVersionPath);

		const res = await ApiUtils.migrateDatabase(dbToMigratePath);
		expect(res.status).toEqual(200);
		expect(await ApiUtils.getDatabasePath()).toEqual(dbToMigratePath);

		await changeDatabaseAndCheck(memoryDatabasePath, 200, memoryDatabasePath);
		await changeDatabaseAndCheck(dbToMigratePath, 200, dbToMigratePath);

		await addAnyIdeaAndTest();
		await editAnyIdeaAndTest();
		await addAnyLanguageAndTest();
		await editAnyLanguageAndtest();
	});
});

async function changeDatabaseAndCheck(dbPath: string, expectedStatus: number, expectedDbPath: string) {
	const res = await ApiUtils.changeDatabase(dbPath);
	expect(res.status).toEqual(expectedStatus);
	expect(await ApiUtils.getDatabasePath()).toEqual(expectedDbPath);
	return res;
}
