import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { Idea } from './idea';
import { Language } from './language';
import { Expression } from './expression';

let db: Database;

(async () => {
  let filename = 'server/model/db.db';
  if (process.argv.length > 2 && process.argv[2] === '--test-mode') {
    filename = 'server/model/db-test.db';
  }
  db = await open({
    filename,
    driver: sqlite3.Database,
  });
  if (process.argv.length > 2 && process.argv[2] === '--test-mode') {
    await db.run('DELETE FROM texts');
    await db.run('DELETE FROM expressions');
    await db.run('DELETE FROM ideas');
    await db.run('DELETE FROM languages');
  }
  console.log('Database was opened.');
})();

export default class DataManager {
  public static ideas: Idea[] = [];

  public static offset = 0;

  static async getNextIdea(): Promise<Idea> {
    return this.nextIdeaId()
      .then((id) => this.getIdeaById(id))
      .catch(() => Promise.reject());
  }

  private static async nextIdeaId(): Promise<number> {
    let idea = await db.get('select id from ideas limit 1 offset ?', DataManager.offset);
    // no more ideas
    if (idea === undefined) {
      DataManager.offset = 0;
      idea = await db.get('select id from ideas limit 1 offset ?', DataManager.offset);
      if (idea === undefined) {
        // there are no ideas in database
        return Promise.reject();
      }
    }
    DataManager.offset += 1;
    return idea.id;
  }

  public static async getIdeaById(ideaId: number): Promise<Idea> {
    const ee: Expression[] = await db.all('select id, languageId from expressions WHERE ideaId = ?', ideaId);
    ee.forEach((e) => {
      e.texts = [];
    });
    await Promise.all(ee.map(async (e) => {
      const txts = await db.all('SELECT text FROM texts WHERE expressionId = ?', e.id);
      txts.forEach((txt) => e.texts.push(txt.text));
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      e.language = (await db.get('SELECT * FROM languages WHERE id = ?', e.languageId))!;
    }));
    ee.sort((e1, e2) => e1.language.ordering - e2.language.ordering);
    return new Idea({ id: ideaId, ee });
  }

  static async getLanguages(): Promise<Language[]> {
    return db.all('select * from languages');
  }

  static async addIdea(ee: Expression[]): Promise<void> {
    await db.run('insert into ideas("id") VALUES (null)');
    const ideaId = (await db.get('SELECT last_insert_rowid()'))['last_insert_rowid()'];
    const idea: Idea = new Idea({ id: ideaId, ee });
    await this.insertExpressions(idea);
  }

  static async editIdea(idea: Idea): Promise<void> {
    await db.run('delete from expressions where ideaId = ?', idea.id);
    await this.insertExpressions(idea);
  }

  static async deleteIdea(ideaId: number): Promise<void> {
    await db.run('delete from expressions where ideaId = ?', ideaId);
    await db.run('delete from ideas where id =  ?', ideaId);
  }

  private static async insertExpressions(idea: Idea): Promise<void> {
    for (let i = 0; i < idea.ee.length; i += 1) {
      // no empty text
      if (!(idea.ee[i].texts.filter((txt) => txt.length > 0).length === 0)) {
        // eslint-disable-next-line no-await-in-loop
        await db.run('insert into expressions("ideaId", "languageId") values (?, ?)',
          idea.id, idea.ee[i].language.id);
        // eslint-disable-next-line no-await-in-loop
        const exprId = (await db.get('SELECT last_insert_rowid()'))['last_insert_rowid()'];
        for (let j = 0; j < idea.ee[i].texts.length; j += 1) {
          const txt = idea.ee[i].texts[j];
          // don't insert empty text
          if (txt) {
            // await in loop to preserve order of expressions
            // eslint-disable-next-line no-await-in-loop
            await db.run('insert into texts("expressionId", "text") values (?, ?)',
              exprId, txt);
          }
        }
      }
    }
  }

  public static async addLanguage(language: Language): Promise<void> {
    await db.run('insert into languages("name", "ordering", "isPractice") values (?, ?, ?)',
      language.name, language.ordering, language.isPractice);
  }

  static async editLanguage(language: Language): Promise<void> {
    await db.run('update languages set "name" = ?, "ordering" = ?, "isPractice" = ? WHERE "id" = ?',
      language.name, language.ordering, language.isPractice, language.id);
  }
}
