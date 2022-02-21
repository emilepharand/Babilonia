import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { Idea, IdeaForAdding } from './idea';
import { equal, Language } from './language';
import { Expression, ExpressionForAdding } from './expression';

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
    const a = 'a';
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

  private static async getExpressions(ideaId: number): Promise<Expression[]> {
    const res: [{ id: number, languageId: number, text: string }] = await
      db.all('select id, languageId, text from expressions WHERE ideaId = ?', ideaId);
    const ee: Expression[] = [];
    // beware of Promise.all() because expressions order need to be preserved
    // eslint-disable-next-line no-restricted-syntax
    for (const item of res) {
      ee.push({
        id: item.id,
        // eslint-disable-next-line no-await-in-loop
        text: item.text,
        // eslint-disable-next-line no-await-in-loop
        language: await DataManager.getLanguageById(item.languageId),
      });
    }
    return ee;
  }

  private static async getTexts(expressionId: number): Promise<string[]> {
    const texts: string[] = [];
    const txts = await db.all('SELECT text FROM texts WHERE expressionId = ?', expressionId);
    txts.forEach((txt) => texts.push(txt.text));
    return texts;
  }

  public static async getIdeaById(ideaId: number): Promise<Idea> {
    if (!(await DataManager.ideaIdExists(ideaId))) {
      return Promise.reject();
    }
    const ee: Expression[] = await DataManager.getExpressions(ideaId);
    ee.sort((e1: Expression, e2: Expression) => e1.language.ordering - e2.language.ordering);
    return new Idea({
      id: ideaId,
      ee,
    });
  }

  public static async getLanguageById(id: number): Promise<Language> {
    const l = (await db.get('SELECT * FROM languages WHERE id = ?', id)) as Language;
    if (l !== undefined) {
      l.isPractice = l.isPractice === '1';
    }
    return l;
  }

  static async getLanguages(): Promise<Language[]> {
    const ll = await db.all('select * from languages');
    // eslint-disable-next-line no-restricted-syntax
    for (const l of ll) {
      l.isPractice = l.isPractice === '1';
    }
    return ll;
  }

  static async addIdea(ideaForAdding: IdeaForAdding): Promise<Idea> {
    await db.run('insert into ideas("id") VALUES (null)');
    const ideaId = (await db.get('SELECT last_insert_rowid()'))['last_insert_rowid()'];
    // eslint-disable-next-line no-restricted-syntax
    for (const e of ideaForAdding.ee) {
      // eslint-disable-next-line no-await-in-loop
      await db.run('insert into expressions("ideaId", "languageId", "text") values (?, ?, ?)',
        ideaId, e.languageId, e.text);
    }
    return DataManager.getIdeaById(ideaId);
  }

  static async editIdea(idea: IdeaForAdding, id: number): Promise<void> {
    await db.run('delete from expressions where ideaId = ?', id);
    // eslint-disable-next-line no-restricted-syntax
    for (const e of idea.ee) {
      // eslint-disable-next-line no-await-in-loop
      await db.run('insert into expressions("ideaId", "languageId", "text") values (?, ?, ?)',
        id, e.languageId, e.text);
    }
  }

  static async deleteIdea(ideaId: number): Promise<void> {
    await db.run('delete from expressions where ideaId = ?', ideaId);
    await db.run('delete from ideas where id =  ?', ideaId);
  }

  static async deleteLanguage(languageId: number): Promise<void> {
    // TODO ordering when unique is enforced:
    // BEGIN TRANSACTION;
    // update languages set ordering = -ordering;
    // update languages set ordering = 0 where id = 6;
    // update languages set ordering = 2 where id = 7;
    // update languages set ordering = 1 where id = 8;
    // COMMIT;
    const l = await DataManager.getLanguageById(languageId);
    await db.run('update languages set ordering = case when ordering > ? then ordering - 1 else ordering END', l.ordering);
    await db.run('delete from languages where id = ?', languageId);
    await db.run('delete from expressions where languageId = ?', languageId);
  }

  // private static async insertExpressions(idea: IdeaForAdding, ideaId: number): Promise<void> {
  //   for (let i = 0; i < idea.ee.length; i += 1) {
  //     // no empty text
  //     if (!(idea.ee[i].texts.filter((txt) => txt.length > 0).length === 0)) {
  //       // eslint-disable-next-line no-await-in-loop
  //       await db.run('insert into expressions("ideaId", "languageId") values (?, ?)',
  //         ideaId, idea.ee[i].languageId);
  //       // eslint-disable-next-line no-await-in-loop
  //       const exprId = (await db.get('SELECT last_insert_rowid()'))['last_insert_rowid()'];
  //       for (let j = 0; j < idea.ee[i].texts.length; j += 1) {
  //         const txt = idea.ee[i].texts[j];
  //         // don't insert empty text
  //         if (txt) {
  //           // await in loop to preserve order of expressions
  //           // eslint-disable-next-line no-await-in-loop
  //           await db.run('insert into texts("expressionId", "text") values (?, ?)',
  //             exprId, txt);
  //         }
  //       }
  //     }
  //   }
  // }

  public static async addLanguage(name: string): Promise<Language> {
    const nextOrdering: number = await this.nextOrdering();
    await db.run('insert into languages("name", "ordering", "isPractice") values (?, ?, ?)',
      name, nextOrdering, false);
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

  public static async languageNameExists(name: string): Promise<boolean> {
    const l = (await db.get('SELECT * FROM languages WHERE name = ?', name)) as Language;
    return l !== undefined;
  }

  public static async ideaIdExists(id: number): Promise<boolean> {
    const i = (await db.get('SELECT * FROM ideas WHERE id = ?', id)) as Idea;
    return i !== undefined;
  }

  static async editLanguages(ll: Language[]): Promise<Language[]> {
    if (!(await DataManager.includesAllLanguages(ll))) {
      return Promise.reject();
    }
    if (!(DataManager.isValidOrdering(ll))) {
      return Promise.reject();
    }
    if (!(DataManager.noDuplicateNames(ll))) {
      return Promise.reject();
    }
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

  static isValidOrdering(ll: Language[]): boolean {
    const orderings = new Set<number>();
    // eslint-disable-next-line no-restricted-syntax
    for (const l of ll) {
      orderings.add(l.ordering);
    }
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < ll.length; i++) {
      if (!(orderings.has(i))) {
        return false;
      }
    }
    return true;
  }

  static async languageExists(id: number): Promise<boolean> {
    const llInDb = await DataManager.getLanguages();
    // eslint-disable-next-line no-restricted-syntax
    for (const l of llInDb) {
      if (l.id === id) return true;
    }
    return false;
  }

  static async includesAllLanguages(ll: Language[]): Promise<boolean> {
    const llInDb = await DataManager.getLanguages();
    const ids = new Set<number>();
    if (llInDb.length !== ll.length) return false;
    // eslint-disable-next-line no-restricted-syntax
    for (const l of ll) {
      // no duplicate ids
      if (ids.has(l.id)) return false;
      ids.add(l.id);
      // eslint-disable-next-line no-await-in-loop
      if ((await DataManager.getLanguageById(l.id) === undefined)) {
        return false;
      }
    }
    return true;
  }

  private static noDuplicateNames(ll: Language[]): boolean {
    const names = new Set<string>();
    // eslint-disable-next-line no-restricted-syntax
    for (const l of ll) {
      if (names.has(l.name)) {
        return false;
      }
      names.add(l.name);
    }
    return true;
  }
}
