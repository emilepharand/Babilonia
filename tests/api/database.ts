import {currentVersion, memoryDatabasePath} from '../../server/const';
import {
	addAnyLanguage,
	changeDatabase,
	changeDatabaseRawObjectAndGetResponse,
	changeDatabaseToMemoryAndDeleteEverything,
	fetchLanguages,
	fetchSettings,
	getDatabasePath,
	migrateDatabase,
} from '../utils/fetch-utils';

beforeEach(async () => {
	await changeDatabaseToMemoryAndDeleteEverything();
});

const db20 = 'tests/db/2.0-simple.db';
const db21 = 'tests/db/2.1-simple.db';

describe('valid cases', () => {
	test('change database to a valid database', async () => {
		expect(await getDatabasePath()).toEqual(memoryDatabasePath);
		expect(await fetchLanguages()).toHaveLength(0);

		await changeDatabase(db21);
		expect(await getDatabasePath()).toEqual(db21);
		expect((await fetchSettings()).version).toEqual(currentVersion);
		const ll = await fetchLanguages();
		expect(ll).toHaveLength(1);
		expect(ll[0]).toEqual({
			id: 1, name: '2.1-l1', ordering: 0, isPractice: true,
		});

		await changeDatabase(memoryDatabasePath);
		expect(await getDatabasePath()).toEqual(memoryDatabasePath);
		expect(await fetchLanguages()).toHaveLength(0);
	});

	test('change database to a db to be created', async () => {
		const newDbPath = 'tests/db/new.db';
		await changeDatabase(newDbPath);
		expect(await getDatabasePath()).toEqual(newDbPath);
		expect(await fetchLanguages()).toHaveLength(0);
		await addAnyLanguage();
		expect(await fetchLanguages()).toHaveLength(1);
	});

	test('migrating database with invalid path', async () => {
		await testMigrateInvalidDatabase('/tmp/invalid.db');
	});
});

describe('invalid cases', () => {
	test('change database without an object with path key', async () => {
		expect((await changeDatabaseRawObjectAndGetResponse(JSON.stringify({file: db21}))).status).toEqual(400);
		expect(await getDatabasePath()).toEqual(memoryDatabasePath);
	});

	test('change database to a nonexistent path', async () => {
		await testChangeToInvalidDatabase('/doesnotexist/db.db');
	});

	test('change database to an empty path', async () => {
		await testChangeToInvalidDatabase('');
		await testChangeToInvalidDatabase(' ');
	});

	test('change database to another version than the current version', async () => {
		let res = await changeDatabase('tests/db/unsupported-version.db');
		expect(res.status).toEqual(400);
		expect((await (await res.json() as any)).error).toEqual('UNSUPPORTED_DATABASE_VERSION');
		expect(await getDatabasePath()).toEqual(memoryDatabasePath);

		res = await changeDatabase(db20);
		expect(res.status).toEqual(400);
		expect((await (await res.json() as any)).error).toEqual('UNSUPPORTED_DATABASE_VERSION');
		expect(await getDatabasePath()).toEqual(memoryDatabasePath);
	});

	test('change database to a file that cannot be written to', async () => {
		await testChangeToInvalidDatabase('tests/db/unwriteable.db');
		expect(await getDatabasePath()).toEqual(memoryDatabasePath);
	});

	test('change database to a file in a directory that doesn\'t exist', async () => {
		await testChangeToInvalidDatabase('tests/doesnotexist/db.db');
	});

	test('change database to a directory', async () => {
		await testChangeToInvalidDatabase('tests/dir.db');
	});

	test('migrating 2.0 database to 2.1', async () => {
		let res = await changeDatabase('tests/db/unsupported-version-to-migrate.db');
		expect(res.status).toEqual(400);
		expect((await (await res.json() as any)).error).toEqual('UNSUPPORTED_DATABASE_VERSION');
		expect(await getDatabasePath()).toEqual(memoryDatabasePath);

		res = await migrateDatabase('tests/db/unsupported-version-to-migrate.db');
		expect(res.status).toEqual(200);

		res = await changeDatabase('tests/db/unsupported-version-to-migrate.db');
		expect(res.status).toEqual(200);
		expect(await getDatabasePath()).toEqual('tests/db/unsupported-version-to-migrate.db');
	});
});

async function testChangeToInvalidDatabase(path: string) {
	const res = await changeDatabase(path);
	expect(res.status).toEqual(400);
	expect(await getDatabasePath()).toEqual(memoryDatabasePath);
}

async function testMigrateInvalidDatabase(path: string) {
	const res = await migrateDatabase(path);
	expect(res.status).toEqual(400);
	expect(await getDatabasePath()).toEqual(memoryDatabasePath);
}
