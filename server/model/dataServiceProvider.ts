import sqlite3 from 'sqlite3';
import {Database, open} from 'sqlite';
import IdeaManager from './ideas/ideaManager';
import LanguageManager from './languages/languageManager';
import PracticeManager from '../practice/practiceManager';
import InputValidator from './inputValidator';
import SearchHandler from './search/searchHandler';
import {Stats} from '../stats/stats';
import SettingsManager from './settings/settingsManager';
import {databasePath, isTestMode} from '../options';
import * as fs from 'fs';

let dbExists = true;

async function initDb(): Promise<Database> {
	if (databasePath !== ':memory:' && !fs.existsSync(databasePath)) {
		dbExists = false;
	}
	const localDb = await open({
		filename: databasePath,
		driver: sqlite3.Database,
	});
	console.log(`Database ${databasePath} was opened.`);
	return localDb;
}

export const db: Database = await initDb();
export const settingsManager = new SettingsManager(db);
export const languageManager = new LanguageManager(db);
export const ideaManager = new IdeaManager(db, languageManager);
export const practiceManager = new PracticeManager(db, ideaManager, languageManager, settingsManager);
export const inputValidator = new InputValidator(ideaManager, languageManager);
export const searchHandler = new SearchHandler(db, languageManager, ideaManager);
export const stats = new Stats(db, languageManager);

export default class DataServiceProvider {
	public static async deleteAllData(): Promise<void> {
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

	public static getIdeaManager(): IdeaManager {
		return ideaManager;
	}

	public static getLanguageManager(): LanguageManager {
		return languageManager;
	}

	static getPracticeManager(): PracticeManager {
		return practiceManager;
	}

	static getInputValidator(): InputValidator {
		return inputValidator;
	}

	static getSearchHandler(): SearchHandler {
		return searchHandler;
	}

	static getStats(): Stats {
		return stats;
	}

	static getSettingsManager(): SettingsManager {
		return settingsManager;
	}
}

if (isTestMode || !dbExists) {
	await DataServiceProvider.deleteAllData();
}
