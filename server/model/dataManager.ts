import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { Idea } from './idea';
import IdeaManager from './ideaManager';
import LanguageManager from './languageManager';
import PracticeManager from '../practice/practiceManager';

async function initDb(): Promise<Database> {
  let filename = 'server/model/db.db';
  if (process.argv.length > 2 && process.argv[2] === '--test-mode') {
    filename = ':memory:';
  }
  const localDb = await open({
    filename,
    driver: sqlite3.Database,
  });
  console.log('Database was opened.');
  return localDb;
}

export const db: Database = await initDb();
export const languageManager = new LanguageManager(db);
export const ideaManager = new IdeaManager(db, languageManager);
export const practiceManager = new PracticeManager(db, ideaManager);

export default class DataManager {
  public static ideas: Idea[] = [];

  public static async deleteAllData(): Promise<void> {
    await db.run('drop table if exists expressions');
    await db.run('drop table if exists ideas');
    await db.run('drop table if exists languages');
    await db.run('CREATE TABLE "languages" (\n'
      + '\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,\n'
      + '\t"name"\tTEXT NOT NULL,\n'
      + '\t"ordering"\tINTEGER NOT NULL,\n'
      + '\t"isPractice"\tTEXT NOT NULL\n'
      + ')');
    await db.run('CREATE TABLE "ideas" (\n'
      + '\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE\n'
      + ')');
    await db.run('CREATE TABLE "expressions" (\n'
      + '\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,\n'
      + '\t"ideaId"\tINTEGER NOT NULL,\n'
      + '\t"languageId"\tINTEGER NOT NULL,\n'
      + '\t"text"\tTEXT NOT NULL,\n'
      + '\tFOREIGN KEY("languageId") REFERENCES "languages"("id"),\n'
      + '\tFOREIGN KEY("ideaId") REFERENCES "ideas"("id")\n'
      + ')');
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
}
