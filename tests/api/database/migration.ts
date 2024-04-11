import fs from 'fs';
import {
	currentVersion, databaseVersionErrorCode, memoryDatabasePath, minimumExpectedExpressions, minimumExpectedIdeas,
	minimumExpectedLanguages,
} from '../../../server/const';
import * as ApiUtils from '../../utils/api-utils';
import {allVersions, getTestDatabaseVersionPath, previousVersions} from '../../utils/const';
import {basicTests} from '../../utils/utils';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('change database to an old version database', () => {
	test.each(previousVersions)('change database to a version %s database', async version => {
		const res = await changeDatabaseAndCheck(getTestDatabaseVersionPath(version), 400, memoryDatabasePath);
		expect((await res.json() as { error:string }).error).toEqual(databaseVersionErrorCode);
	});
});

describe('using all database versions', () => {
	test.each(allVersions)('using database version %s (migrating if required)', async version => {
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);

		const databasePath = getTestDatabaseVersionPath(version);
		expect(fs.existsSync(`dist/${databasePath}`)).toBe(true);

		const currentVersionPath = getTestDatabaseVersionPath(currentVersion);
		await changeDatabaseAndCheck(currentVersionPath, 200, currentVersionPath);

		if (version !== currentVersion) {
			const res = await ApiUtils.migrateDatabase(databasePath);
			expect(res.status).toEqual(200);
		}

		expect(await ApiUtils.getDatabasePath()).toEqual(databasePath);

		await changeDatabaseAndCheck(memoryDatabasePath, 200, memoryDatabasePath);
		await changeDatabaseAndCheck(databasePath, 200, databasePath);

		expect((await ApiUtils.fetchSettings()).version).toEqual(currentVersion);

		await basicTests();

		if (version === currentVersion) {
			const stats = await ApiUtils.getStats();
			const ll = await ApiUtils.fetchLanguages();
			expect(ll.length).toBeGreaterThanOrEqual(minimumExpectedLanguages);
			expect(stats.globalStats.totalExpressionsCount).toBeGreaterThanOrEqual(minimumExpectedExpressions);
			expect(stats.globalStats.totalIdeasCount).toBeGreaterThanOrEqual(minimumExpectedIdeas);
		}
	});
});

async function changeDatabaseAndCheck(dbPath: string, expectedStatus: number, expectedDbPath: string) {
	const res = await ApiUtils.changeDatabase(dbPath);
	expect(res.status).toEqual(expectedStatus);
	expect(await ApiUtils.getDatabasePath()).toEqual(expectedDbPath);
	return res;
}
