import {changeDatabase, changeDatabaseRawObjectAndGetResponse, changeDatabaseToMemoryAndDeleteEverything, fetchLanguages, fetchSettings, getDatabasePath} from '../utils/fetch-utils';

beforeEach(async () => {
	await changeDatabaseToMemoryAndDeleteEverything();
});

describe('valid cases', () => {
	test('change database to a valid database', async () => {
		expect(await getDatabasePath()).toEqual(':memory:');
		expect(await fetchLanguages()).toHaveLength(0);

		await changeDatabase('tests/db/2.0-simple.db');
		expect(await getDatabasePath()).toEqual('tests/db/2.0-simple.db');
		expect((await fetchSettings()).version).toEqual('2.0');
		const ll = await fetchLanguages();
		expect(ll).toHaveLength(1);
		expect(ll[0]).toEqual({id: 1, name: '2.0-l1', ordering: 0, isPractice: true});

		await changeDatabase(':memory:');
		expect(await getDatabasePath()).toEqual(':memory:');
		expect(await fetchLanguages()).toHaveLength(0);
	});
});

describe('nvalid cases', () => {
	test('change database without an object with path key', async () => {
		expect((await changeDatabaseRawObjectAndGetResponse('tests/db/2.0-simple.db')).status).toEqual(400);
		expect(await getDatabasePath()).toEqual(':memory:');
	});

	test('change database to a nonexistent path', async () => {
		expect((await changeDatabase('/doesnotexist/db.db')).status).toEqual(400);
		expect(await getDatabasePath()).toEqual(':memory:');
	});

	test('change database to an empty path', async () => {
		expect((await changeDatabase('')).status).toEqual(400);
		expect(await getDatabasePath()).toEqual(':memory:');
		expect((await changeDatabase(' ')).status).toEqual(400);
		expect(await getDatabasePath()).toEqual(':memory:');
	});

	test('change database to another version than the current version', async () => {
		expect((await changeDatabase('tests/db/unsupported-version.db')).status).toEqual(400);
		expect(await getDatabasePath()).toEqual(':memory:');
	});
});
