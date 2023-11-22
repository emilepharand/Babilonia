import {changeDatabase, changeDatabaseRawObjectAndGetResponse, changeDatabaseToMemoryAndDeleteEverything, fetchLanguages, getDatabasePath} from '../utils/fetch-utils';

beforeEach(async () => {
	await changeDatabaseToMemoryAndDeleteEverything();
});

describe('valid cases', () => {
	test('change database to a valid database', async () => {
		expect(await getDatabasePath()).toEqual(':memory:');
		expect(await fetchLanguages()).toHaveLength(0);

		await changeDatabase('tests/db/2.0-simple.db');
		expect(await getDatabasePath()).toEqual('tests/db/2.0-simple.db');
		const ll = await fetchLanguages();
		expect(ll).toHaveLength(1);
		expect(ll[0]).toEqual({id: 1, name: '2.0-l1', ordering: 0, isPractice: true});

		await changeDatabase(':memory:');
		expect(await getDatabasePath()).toEqual(':memory:');
		expect(await fetchLanguages()).toHaveLength(0);
	});
});

describe('invalid cases', () => {
	test('change database to a nonexistent path', async () => {
		expect((await changeDatabaseRawObjectAndGetResponse('/doesnotexist/db.db')).status).toEqual(400);
		expect(await getDatabasePath()).toEqual(':memory:');
	});

	test('change database to an empty path', async () => {
		expect((await changeDatabaseRawObjectAndGetResponse('')).status).toEqual(400);
		expect(await getDatabasePath()).toEqual(':memory:');
		expect((await changeDatabaseRawObjectAndGetResponse(' ')).status).toEqual(400);
		expect(await getDatabasePath()).toEqual(':memory:');
	});
});
