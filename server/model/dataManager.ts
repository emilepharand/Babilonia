import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import Idea from './ideas/idea';
import Language from './languages/language';
import Expression from './expressions/expression';

let db;

(async () => {
  db = await open({
    filename: './model/db.db',
    driver: sqlite3.Database,
  });
  console.log('Database was opened.');
})();

export default class DataManager {
  public static ideas: Idea[] = [];

  public static offset = 0;

  static async getNextIdea(): Promise<Idea> {
    return this.makeIdeaFromId(await this.nextIdeaId());
  }

  private static async nextIdeaId(): Promise<number> {
    let idea = await db.get('select id from ideas limit 1 offset ?', DataManager.offset);
    if (idea === undefined) {
      DataManager.offset = 0;
      idea = await db.get('select id from ideas limit 1 offset ?', DataManager.offset);
    }
    DataManager.offset += 1;
    return idea.id;
  }

  private static async makeIdeaFromId(ideaId: number): Promise<Idea> {
    const expressions = await db.all('select id, text, languageId from expressions WHERE ideaId = ?', ideaId);
    await Promise.all(expressions.map(async (e) => {
      e.language = await db.get('SELECT * FROM languages WHERE id = ?', e.languageId);
    }));
    return { expressions };
  }

  static async getLanguages(): Promise<Language[]> {
    return db.all('select * from languages');
  }

  static async addIdea(expressions: Expression[]): Promise<void> {
    await db.run('insert into ideas("id") VALUES (null)');
    const ideaId = (await db.get('SELECT last_insert_rowid()'))['last_insert_rowid()'];
    await Promise.all(expressions.map(async (e) => {
      await db.run('insert into expressions("text", "ideaId", "languageId") values (?, ?, ?)',
        e.text, ideaId, e.language.id);
    }));
  }
}
