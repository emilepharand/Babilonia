import {
	currentVersion, memoryDatabasePath,
} from '../../../server/const';
import * as ApiUtils from '../../utils/api-utils';
import {getTestDatabaseVersionPath} from '../../utils/const';
import * as FetchUtils from '../../utils/fetch-utils';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('valid cases', () => {
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
});

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
