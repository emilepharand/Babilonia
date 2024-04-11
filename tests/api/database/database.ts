import fs from 'fs';
import {
	currentVersion,
	databaseVersionErrorCode,
	memoryDatabasePath,
	minimumExpectedExpressions, minimumExpectedIdeas,
	minimumExpectedLanguages,
} from '../../../server/const';
import * as ApiUtils from '../../utils/api-utils';
import {allVersions, getTestDatabaseVersionPath, previousVersions} from '../../utils/const';
import * as FetchUtils from '../../utils/fetch-utils';
import {basicTests} from '../../utils/utils';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('change database', () => {
	test('change database to a valid database', async () => {
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
		const currentVersionPath = getTestDatabaseVersionPath(currentVersion);
		await ApiUtils.changeDatabase(currentVersionPath);
		expect(await ApiUtils.getDatabasePath()).toEqual(currentVersionPath);
	});

	test('change database to a db to be created', async () => {
		const newDbPath = 'tests/db/new.db';
		await ApiUtils.changeDatabase(newDbPath);
		expect(await ApiUtils.getDatabasePath()).toEqual(newDbPath);
		expect(await ApiUtils.fetchLanguages()).toHaveLength(0);
		await ApiUtils.addAnyLanguage();
		expect(await ApiUtils.fetchLanguages()).toHaveLength(1);
	});

	test.each(previousVersions)('change database to old database version %s', async version => {
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

describe('invalid cases', () => {
	const invalidDatabasePaths = [
		'',
		' ',
		'/doesnotexist/db.db',
		'tests/db/unwriteable.db',
		'tests/doesnotexist/db.db',
		'tests/dir.db',
		'/tmp/invalid.db',
	];

	invalidDatabasePaths.forEach(path => {
		test(`wrong path as database path: ${path}`, async () => {
			await testInvalidDatabase(path, FetchUtils.changeDatabase);
			await testInvalidDatabase(path, FetchUtils.migrateDatabase);
			await testInvalidDatabase(JSON.stringify({file: path}), FetchUtils.changeDatabaseRaw);
			await testInvalidDatabase(JSON.stringify({file: path}), FetchUtils.migrateDatabaseRaw);
		});
	});
});

async function testInvalidDatabase(path: any, testFunction: (_: string) => any) {
	const res = await testFunction(path);
	expect(res.status).toEqual(400);
	expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
}
