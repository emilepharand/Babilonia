import {currentVersion, databaseVersionErrorCode, memoryDatabasePath} from '../../server/const';
import * as ApiUtils from '../utils/api-utils';
import * as FetchUtils from '../utils/fetch-utils';
import {oldVersionDatabasePath, oldVersionDatabaseToMigratePath} from '../utils/const';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

const db20 = 'tests/db/2.0-simple.db';
const db21 = 'tests/db/2.1-simple.db';

describe('valid cases', () => {
	test('change database to a valid database', async () => {
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
		expect(await ApiUtils.fetchLanguages()).toHaveLength(0);

		await ApiUtils.changeDatabase(db21);
		expect(await ApiUtils.getDatabasePath()).toEqual(db21);
		expect((await ApiUtils.fetchSettings()).version).toEqual(currentVersion);
		const ll = await ApiUtils.fetchLanguages();
		expect(ll).toHaveLength(1);
		expect(ll[0]).toEqual({
			id: 1, name: '2.1-l1', ordering: 0, isPractice: true,
		});

		await ApiUtils.changeDatabase(memoryDatabasePath);
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
		expect(await ApiUtils.fetchLanguages()).toHaveLength(0);
	});

	test('change database to a db to be created', async () => {
		const newDbPath = 'tests/db/new.db';
		await ApiUtils.changeDatabase(newDbPath);
		expect(await ApiUtils.getDatabasePath()).toEqual(newDbPath);
		expect(await ApiUtils.fetchLanguages()).toHaveLength(0);
		await ApiUtils.addAnyLanguage();
		expect(await ApiUtils.fetchLanguages()).toHaveLength(1);
	});

	test('migrating 2.0 database to 2.1', async () => {
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

describe('invalid cases', () => {
	test('change database to another version than the current version', async () => {
		let res = await ApiUtils.changeDatabase(oldVersionDatabasePath);
		expect(res.status).toEqual(400);
		expect((await (await res.json() as any)).error).toEqual(databaseVersionErrorCode);
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);

		res = await ApiUtils.changeDatabase(db20);
		expect(res.status).toEqual(400);
		expect((await (await res.json() as any)).error).toEqual(databaseVersionErrorCode);
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
	});

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
