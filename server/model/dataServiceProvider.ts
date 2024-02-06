import {type Database} from 'sqlite';
import {currentVersion} from '../../server/const';
import PracticeManager from '../practice/practiceManager';
import {StatsCounter} from '../stats/statsCounter';
import {databaseNeedsToBeInitialized, openDatabase} from './databaseOpener';
import IdeaManager from './ideas/ideaManager';
import InputValidator from './inputValidator';
import LanguageManager from './languages/languageManager';
import SearchHandler from './search/searchHandler';
import SettingsManager from './settings/settingsManager';

export let settingsManager: SettingsManager;
export let languageManager: LanguageManager;
export let ideaManager: IdeaManager;
export let practiceManager: PracticeManager;
export let inputValidator: InputValidator;
export let searchHandler: SearchHandler;
export let stats: StatsCounter;
export let db: Database;
export let dbPath: string;

export async function initDb(inputPath: string, path: string) {
	const appDatabaseNeedsToBeInitialized = databaseNeedsToBeInitialized(path);
	const database = await openDatabase(path);
	db = database;
	dbPath = inputPath;
	settingsManager = new SettingsManager(database);
	languageManager = new LanguageManager(database);
	ideaManager = new IdeaManager(database, languageManager);
	practiceManager = new PracticeManager(database, settingsManager);
	inputValidator = new InputValidator(languageManager);
	searchHandler = new SearchHandler(database, ideaManager);
	stats = new StatsCounter(database, languageManager);
	if (appDatabaseNeedsToBeInitialized) {
		if (path !== ':memory:') {
			console.log(`Initializing database ${path}...`);
		}
		await clearDatabaseAndCreateSchema();
	} else if (path !== ':memory:') {
		console.log(`Database ${path} does not need to be initialized.`);
	}
	return db;
}

export function getDb(): Database {
	return db;
}

export async function clearDatabaseAndCreateSchema() {
	await db.run('drop table if exists expressions');
	await db.run('drop table if exists ideas');
	await db.run('drop table if exists languages');
	await db.run('drop table if exists settings');
	await db.run(
		'CREATE TABLE "languages" (\n'
        + '\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,\n'
        + '\t"name"\tTEXT NOT NULL,\n'
        + '\t"ordering"\tINTEGER NOT NULL,\n'
        + '\t"isPractice"\tTEXT NOT NULL\n'
        + ')',
	);
	await db.run(
		'CREATE TABLE "ideas" (\n'
        + '\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE\n'
        + ')',
	);
	await db.run(
		'CREATE TABLE "expressions" (\n'
        + '\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,\n'
        + '\t"ideaId"\tINTEGER NOT NULL,\n'
        + '\t"languageId"\tINTEGER NOT NULL,\n'
        + '\t"text"\tTEXT NOT NULL,\n'
				+ '\t"known"\tTEXT DEFAULT 0,\n'
        + '\tFOREIGN KEY("languageId") REFERENCES "languages"("id"),\n'
        + '\tFOREIGN KEY("ideaId") REFERENCES "ideas"("id")\n'
        + ')',
	);
	await db.run(
		'CREATE TABLE "settings" (\n'
      + '"name"\tTEXT NOT NULL UNIQUE,\n'
      + '"value"\tTEXT\n'
      + ')',
	);
	practiceManager.clear();
	await settingsManager.setVersion(currentVersion);
}
