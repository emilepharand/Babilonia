import type {Database} from 'sqlite';
import PracticeManager from '../practice/practiceManager';
import {StatsCounter} from '../stats/statsCounter';
import IdeaManager from './ideas/ideaManager';
import InputValidator from './inputValidator';
import LanguageManager from './languages/languageManager';
import SearchHandler from './search/searchHandler';
import SettingsManager from './settings/settingsManager';
import {databasePath} from '../options';
import {databaseNeedsToBeInitialized, initDatabase} from './databaseOpener';

export const appDatabaseNeedsToBeInitialized = databaseNeedsToBeInitialized(databasePath);
export const db: Database = await initDatabase(databasePath);
export const settingsManager = new SettingsManager(db);
export const languageManager = new LanguageManager(db);
export const ideaManager = new IdeaManager(db, languageManager);
export const practiceManager = new PracticeManager(db, settingsManager);
export const inputValidator = new InputValidator(languageManager);
export const searchHandler = new SearchHandler(db, ideaManager);
export const stats = new StatsCounter(db, languageManager);

export async function clearDatabaseAndCreateSchema(): Promise<void> {
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

if (appDatabaseNeedsToBeInitialized) {
	await clearDatabaseAndCreateSchema();
}
