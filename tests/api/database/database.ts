import fs from 'fs';
import {
	currentVersion,
	databaseVersionErrorCode,
	memoryDatabasePath,
	minimumExpectedExpressions,
	minimumExpectedIdeas,
	minimumExpectedLanguages,
} from '../../../server/const';
import DatabaseHandler from '../../../server/model/database/databaseHandler';
import {getSchemaQueries} from '../../../server/model/database/databaseInitializer';
import * as ApiUtils from '../../utils/api-utils';
import * as FetchUtils from '../../utils/fetch-utils';
import {
	TestDatabasePath,
	allVersions, getBadDatabasePath, getTestDatabaseVersionPath, previousVersions,
} from '../../utils/versions';
import {basicTests} from '../utils/utils';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('change database', () => {
	test('change database to a valid database', async () => {
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
		const currentVersionPath = getTestDatabaseVersionPath(currentVersion);
		await ApiUtils.changeDatabase(currentVersionPath.getPathToProvide());
		expect(await ApiUtils.getDatabasePath()).toEqual(currentVersionPath.getPathToProvide());
	});

	test('change database to a db to be created', async () => {
		const newDbPath = new TestDatabasePath('new.db').getPathToProvide();
		await ApiUtils.changeDatabase(newDbPath);
		expect(await ApiUtils.getDatabasePath()).toEqual(newDbPath);
		expect(await ApiUtils.fetchLanguages()).toHaveLength(0);
		await ApiUtils.addAnyLanguage();
		expect(await ApiUtils.fetchLanguages()).toHaveLength(1);
	});

	test('version.txt', async () => {
		const currentVersionInVersionTxt = fs.readFileSync('version.txt', 'utf8').trim();
		expect(currentVersionInVersionTxt).toEqual(currentVersion);
	});

	test.each(previousVersions)('change database to old database version %s', async version => {
		const res = await changeDatabaseAndCheck(getTestDatabaseVersionPath(version).getPathToProvide(), 400, memoryDatabasePath);
		expect((await res.json() as { error:string }).error).toEqual(databaseVersionErrorCode);
	});

	test('migrate bad database', async () => {
		const res = await ApiUtils.migrateDatabase(getBadDatabasePath().getPathToProvide());
		expect(res.status).toEqual(400);
		expect((await res.json() as { error:string }).error).toEqual('MIGRATION_ERROR');
	});
});

describe('using all database versions', () => {
	test.each(allVersions)('using database version %s (migrating if required)', async version => {
		expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);

		const databasePath = getTestDatabaseVersionPath(version);

		expect(fs.existsSync(databasePath.getActualPath())).toBe(true);

		const currentVersionPath = getTestDatabaseVersionPath(currentVersion).getPathToProvide();
		await changeDatabaseAndCheck(currentVersionPath, 200, currentVersionPath);

		if (version !== currentVersion) {
			const res = await ApiUtils.migrateDatabase(databasePath.getPathToProvide());
			expect(res.status).toEqual(200);
		}

		expect(await ApiUtils.getDatabasePath()).toEqual(databasePath.getPathToProvide());

		testDatabaseSchema(databasePath.getActualPath());

		expect((await ApiUtils.fetchSettings()).version).toEqual(currentVersion);

		await testAllGuidsDefined(databasePath.getActualPath());

		await basicTests();

		const stats = await ApiUtils.getStats();
		const ll = await ApiUtils.fetchLanguages();
		expect(ll.length).toBeGreaterThanOrEqual(minimumExpectedLanguages);
		expect(stats.globalStats.totalExpressionsCount).toBeGreaterThanOrEqual(minimumExpectedExpressions);
		expect(stats.globalStats.totalIdeasCount).toBeGreaterThanOrEqual(minimumExpectedIdeas);

		await changeDatabaseAndCheck(memoryDatabasePath, 200, memoryDatabasePath);
		await changeDatabaseAndCheck(databasePath.getPathToProvide(), 200, databasePath.getPathToProvide());
	}, 30000);
});

describe('updating without content update', () => {
	test('updating without content update', async () => {
		const databasePath = getTestDatabaseVersionPath('another-2.0');
		const res = await ApiUtils.migrateDatabase(databasePath.getPathToProvide(), true);
		expect(res.status).toEqual(200);
		await testNoGuidsDefined(databasePath.getActualPath());
		expect(await ApiUtils.getDatabasePath()).toEqual(databasePath.getPathToProvide());
		testDatabaseSchema(databasePath.getActualPath());
		expect((await ApiUtils.fetchSettings()).version).toEqual(currentVersion);
		const stats = await ApiUtils.getStats();
		expect(stats.globalStats.totalExpressionsCount).toBeGreaterThan(0);
		expect(stats.globalStats.totalIdeasCount).toBeGreaterThan(0);
		await basicTests();
	}, 30000);
});

export async function testAllGuidsDefined(databasePath: string) {
	await testAllGuidsDefinedOrNot(databasePath, true);
}

export async function testNoGuidsDefined(databasePath: string) {
	await testAllGuidsDefinedOrNot(databasePath, false);
}

async function testAllGuidsDefinedOrNot(databasePath: string, defined: boolean) {
	const dbHandler = new DatabaseHandler(databasePath);
	try {
		const db = await dbHandler.open();
		if (defined) {
			const ideasWithNoGuid = await db.all('SELECT * FROM ideas where guid is null');
			const expressionsWithNoGuid = await db.all('SELECT * FROM expressions where guid is null');
			const languagesWithNoGuid = await db.all('SELECT * FROM languages where guid is null');
			expect(ideasWithNoGuid).toHaveLength(0);
			expect(expressionsWithNoGuid).toHaveLength(0);
			expect(languagesWithNoGuid).toHaveLength(0);
		} else {
			const ideasWithGuid = await db.all('SELECT * FROM ideas where guid is not null');
			const expressionsWithGuid = await db.all('SELECT * FROM expressions where guid is not null');
			const languagesWithGuid = await db.all('SELECT * FROM languages where guid is not null');
			expect(ideasWithGuid).toHaveLength(0);
			expect(expressionsWithGuid).toHaveLength(0);
			expect(languagesWithGuid).toHaveLength(0);
		}
	} finally {
		dbHandler.close();
	}
}

async function testDatabaseSchema(databasePath: string) {
	const dbHandler = new DatabaseHandler(databasePath);
	try {
		const db = await dbHandler.open();

		let schema = (await db.all('SELECT * FROM sqlite_master'))
			.filter((s: any) => s.type === 'table' && !s.name.startsWith('sqlite'))
			.map((s: any) => s.sql);

		let expectedSchema = getSchemaQueries();

		const cleanAndSortSchema = (schema: any[]) => schema
			.map((s: string) => s.replace(/\s+/g, ' ').replace(/"/g, ''))
			.sort();

		schema = cleanAndSortSchema(schema);
		expectedSchema = cleanAndSortSchema(expectedSchema);

		expect(schema.length).toEqual(expectedSchema.length);

		for (let i = 0; i < schema.length; i++) {
			expect(schema[i]).toEqual(expectedSchema[i]);
		}
	} finally {
		dbHandler.close();
	}
}

async function changeDatabaseAndCheck(dbPath: string, expectedStatus: number, expectedDbPath: string) {
	const res = await ApiUtils.changeDatabase(dbPath);
	expect(res.status).toEqual(expectedStatus);
	expect(await ApiUtils.getDatabasePath()).toEqual(expectedDbPath);
	return res;
}

describe('invalid cases', () => {
	const invalidDatabasePaths = [
		null,
		'',
		' ',
		'/doesnotexist/db.db',
		new TestDatabasePath('unwriteable.db').getPathToProvide(),
		new TestDatabasePath('doesnotexist/db.db').getPathToProvide(),
		new TestDatabasePath('dir.db').getPathToProvide(),
		'/tmp/invalid.db',
	];

	invalidDatabasePaths.forEach(path => {
		test(`wrong path as database path: ${path}`, async () => {
			await testInvalidDatabase(path, FetchUtils.changeDatabase);
			await testInvalidDatabase(path, FetchUtils.migrateDatabase);
			await testInvalidDatabase(JSON.stringify({file: path, noContentUpdate: false}), FetchUtils.changeDatabaseRaw);
			await testInvalidDatabase(JSON.stringify({file: path, noContentUpdate: false}), FetchUtils.migrateDatabaseRaw);
		});
	});
});

async function testInvalidDatabase(path: any, testFunction: (_: string) => any) {
	const res = await testFunction(path);
	expect(res.status).toEqual(400);
	expect(await ApiUtils.getDatabasePath()).toEqual(memoryDatabasePath);
}
