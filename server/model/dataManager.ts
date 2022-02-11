import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { Idea } from './idea';
import { Language } from './language';
import { Expression } from './expression';

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

const db: Database = await initDb();

export default class DataManager {
  public static ideas: Idea[] = [];

  public static offset = 0;

  static async getNextIdea(): Promise<Idea> {
    return this.nextIdeaId()
      .then((id) => this.getIdeaById(id))
      .catch(() => Promise.reject());
  }

  public static async deleteAllData(): Promise<void> {
    await db.run('drop table if exists expressions');
    await db.run('drop table if exists ideas');
    await db.run('drop table if exists texts');
    await db.run('drop table if exists languages');
    await db.run(`CREATE TABLE "expressions" (
\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
\t"ideaId"\tINTEGER NOT NULL,
\t"languageId"\tINTEGER NOT NULL,
\tFOREIGN KEY("ideaId") REFERENCES "ideas"("id"),
\tFOREIGN KEY("languageId") REFERENCES "languages"("id")
)`);
    await db.run(`CREATE TABLE "ideas" (
\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE
)`);
    await db.run(`CREATE TABLE "languages" (
\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
\t"name"\tTEXT NOT NULL,
\t"ordering"\tINTEGER NOT NULL,
\t"isPractice"\tTEXT NOT NULL
)`);
    await db.run(`CREATE TABLE "texts" (
\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
\t"expressionId"\tINTEGER NOT NULL,
\t"text"\tTEXT NOT NULL,
\tFOREIGN KEY("expressionId") REFERENCES "expressions"("id")
)`);
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
    return new Idea({
      id: ideaId,
      ee,
    });
  }

  public static async getLanguageById(id: number): Promise<Language> {
    const l = (await db.get('SELECT * FROM languages WHERE id = ?', id)) as Language;
    l.isPractice = l.isPractice === '1';
    return l;
  }

  static async getLanguages(): Promise<Language[]> {
    return db.all('select * from languages');
  }

  static async addIdea(ee: Expression[]): Promise<void> {
    await db.run('insert into ideas("id") VALUES (null)');
    const ideaId = (await db.get('SELECT last_insert_rowid()'))['last_insert_rowid()'];
    const idea: Idea = new Idea({
      id: ideaId,
      ee,
    });
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

  public static async addLanguage(language: Language): Promise<Language> {
    const nextOrdering: number = await this.nextOrdering();
    await db.run('insert into languages("name", "ordering", "isPractice") values (?, ?, ?)',
      language.name, nextOrdering, false);
    const languageId = (await db.get('SELECT last_insert_rowid()'))['last_insert_rowid()'];
    const l: Language = (await db.get('select * from languages where id = ?', languageId)) as Language;
    l.isPractice = l.isPractice === '1';
    return l;
  }

  public static async nextOrdering(): Promise<number> {
    const data: any = await db.get('select max(ordering) as nextOrdering from languages');
    return data.nextOrdering as number === null ? 0 : data.nextOrdering + 1;
  }

  private static async editLanguage(id: number, language: Language): Promise<Language> {
    await db.run('update languages set "name" = ?, "ordering" = ?, "isPractice" = ? WHERE "id" = ?',
      language.name, language.ordering, language.isPractice, language.id);
    return this.getLanguageById(id);
  }

  static async editLanguages(ll: Language[]): Promise<Language[]> {
    const retLl: Language[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const l of ll) {
      // eslint-disable-next-line no-await-in-loop
      await this.editLanguage(l.id, l);
      // eslint-disable-next-line no-await-in-loop
      retLl.push(await this.getLanguageById(l.id));
    }
    return retLl;
  }
}
