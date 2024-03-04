import {currentVersion, memoryDatabasePath} from '../../server/const';
import * as ApiUtils from '../utils/api-utils';
import * as FetchUtils from '../utils/fetch-utils';

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
});

describe('invalid cases', () => {
	test('change database without an object with path key', async () => {
		expect((await FetchUtils.changeDatabase(JSON.stringify({file: db21}))).status).toEqual(400);
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
	});

	test('change database to a nonexistent path', async () => {
		await testChangeToInvalidDatabase('/doesnotexist/db.db');
	});

	test('change database to an empty path', async () => {
		await testChangeToInvalidDatabase('');
		await testChangeToInvalidDatabase(' ');
	});

	test('change database to another version than the current version', async () => {
		let res = await ApiUtils.changeDatabase('tests/db/unsupported-version.db');
		expect(res.status).toEqual(400);
		expect((await (await res.json() as any)).error).toEqual('UNSUPPORTED_DATABASE_VERSION');
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);

		res = await ApiUtils.changeDatabase(db20);
		expect(res.status).toEqual(400);
		expect((await (await res.json() as any)).error).toEqual('UNSUPPORTED_DATABASE_VERSION');
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
	});

	test('change database to a file that cannot be written to', async () => {
		await testChangeToInvalidDatabase('tests/db/unwriteable.db');
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
	});

	test('change database to a file in a directory that doesn\'t exist', async () => {
		await testChangeToInvalidDatabase('tests/doesnotexist/db.db');
	});

	test('change database to a directory', async () => {
		await testChangeToInvalidDatabase('tests/dir.db');
	});
});

async function testChangeToInvalidDatabase(path: string) {
	const res = await FetchUtils.changeDatabaseRaw(path);
	expect(res.status).toEqual(400);
	expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
}
