import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import Idea from './idea';
import Language from './language';
import Expression from './expression';

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
    return this.getIdeaById(await this.nextIdeaId());
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

  public static async getIdeaById(ideaId: number): Promise<Idea> {
    const ee = await db.all('select id, text, languageId from expressions WHERE ideaId = ?', ideaId);
    await Promise.all(ee.map(async (e) => {
      e.language = await db.get('SELECT * FROM languages WHERE id = ?', e.languageId);
    }));
    ee.sort((e1, e2) => e1.language.order - e2.language.order);
    return new Idea(ideaId, ee);
  }

  static async getLanguages(): Promise<Language[]> {
    return db.all('select * from languages');
  }

  static async addIdea(ee: Expression[]): Promise<void> {
    await db.run('insert into ideas("id") VALUES (null)');
    const ideaId = (await db.get('SELECT last_insert_rowid()'))['last_insert_rowid()'];
    const idea: Idea = new Idea(ideaId, ee);
    await this.insertExpressions(idea);
  }

  static async editIdea(idea: Idea): Promise<void> {
    await db.run('delete from expressions where ideaId = ?', idea.id);
    await this.insertExpressions(idea);
  }

  private static async insertExpressions(idea: Idea): Promise<void> {
    for (let i = 0; i < idea.ee.length; i += 1) {
      const e = idea.ee[i];
      // await in loop to preserve order of expressions
      // eslint-disable-next-line no-await-in-loop
      await db.run('insert into expressions("text", "ideaId", "languageId") values (?, ?, ?)',
        e.text, idea.id, e.language.id);
    }
  }
}
