import {type Database} from 'sqlite';
import PracticeManager from '../practice/practiceManager';
import {StatsCounter} from '../stats/statsCounter';
import IdeaManager from './ideas/ideaManager';
import InputValidator from './inputValidator';
import LanguageManager from './languages/languageManager';
import SearchHandler from './search/searchHandler';
import SettingsManager from './settings/settingsManager';
import {databasePath} from '../options';
import {databaseNeedsToBeInitialized, initDatabase} from './databaseOpener';

export let settingsManager: SettingsManager;
export let languageManager: LanguageManager;
export let ideaManager: IdeaManager;
export let practiceManager: PracticeManager;
export let inputValidator: InputValidator;
export let searchHandler: SearchHandler;
export let stats: StatsCounter;
export const db: Database = await changeDatabase(databasePath);

export async function clearDatabaseAndCreateSchema(db: Database): Promise<void> {
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
}

export function getIdeaManager(): IdeaManager {
	return ideaManager;
}

export function getLanguageManager(): LanguageManager {
	return languageManager;
}

export function getPracticeManager(): PracticeManager {
	return practiceManager;
}

export function getInputValidator(): InputValidator {
	return inputValidator;
}

export function getSearchHandler(): SearchHandler {
	return searchHandler;
}

export function getStats(): StatsCounter {
	return stats;
}

export function getSettingsManager(): SettingsManager {
	return settingsManager;
}

export async function changeDatabase(path: string): Promise<Database> {
	const appDatabaseNeedsToBeInitialized = databaseNeedsToBeInitialized(path);
	const database = await initDatabase(path);
	settingsManager = new SettingsManager(database);
	languageManager = new LanguageManager(database);
	ideaManager = new IdeaManager(database, languageManager);
	practiceManager = new PracticeManager(database, settingsManager);
	inputValidator = new InputValidator(languageManager);
	searchHandler = new SearchHandler(database, ideaManager);
	stats = new StatsCounter(database, languageManager);
	if (appDatabaseNeedsToBeInitialized) {
		await clearDatabaseAndCreateSchema(database);
	}
	return database;
}
