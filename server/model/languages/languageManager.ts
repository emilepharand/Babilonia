import { Database } from 'sqlite';
import { Language } from './language';

export default class LanguageManager {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getLanguageById(id: number): Promise<Language> {
    const l = (await this.db.get('SELECT * FROM languages WHERE id = ?', id)) as Language;
    if (l !== undefined) {
      l.isPractice = l.isPractice === '1';
    }
    return l;
  }

  public async getLanguages(): Promise<Language[]> {
    const ll = await this.db.all('select * from languages');
    // eslint-disable-next-line no-restricted-syntax
    for (const l of ll) {
      l.isPractice = l.isPractice === '1';
    }
    return ll;
  }

  async deleteLanguage(languageId: number): Promise<void> {
    // TODO ordering when unique is enforced:
    // BEGIN TRANSACTION;
    // update languages set ordering = -ordering;
    // update languages set ordering = 0 where id = 6;
    // update languages set ordering = 2 where id = 7;
    // update languages set ordering = 1 where id = 8;
    // COMMIT;
    const l = await this.getLanguageById(languageId);
    await this.db.run('update languages set ordering = case when ordering > ? then ordering - 1 else ordering END', l.ordering);
    await this.db.run('delete from languages where id = ?', languageId);
    await this.db.run('delete from expressions where languageId = ?', languageId);
  }

  public async addLanguage(name: string): Promise<Language> {
    const nextOrdering: number = await this.nextOrdering();
    await this.db.run('insert into languages("name", "ordering", "isPractice") values (?, ?, ?)',
      name, nextOrdering, false);
    const languageId = (await this.db.get('SELECT last_insert_rowid()'))['last_insert_rowid()'];
    const l: Language = (await this.db.get('select * from languages where id = ?', languageId)) as Language;
    l.isPractice = l.isPractice === '1';
    return l;
  }

  public async nextOrdering(): Promise<number> {
    const data: any = await this.db.get('select max(ordering) as nextOrdering from languages');
    return data.nextOrdering as number === null ? 0 : data.nextOrdering + 1;
  }

  private async editLanguage(id: number, language: Language): Promise<Language> {
    await this.db.run('update languages set "name" = ?, "ordering" = ?, "isPractice" = ? WHERE "id" = ?',
      language.name, language.ordering, language.isPractice, language.id);
    return this.getLanguageById(id);
  }

  public async languageNameExists(name: string): Promise<boolean> {
    const l = (await this.db.get('SELECT * FROM languages WHERE name = ?', name)) as Language;
    return l !== undefined;
  }

  async editLanguages(ll: Language[]): Promise<Language[]> {
    if (!(await this.includesAllLanguages(ll))) {
      return Promise.reject();
    }
    if (!(LanguageManager.isValidOrdering(ll))) {
      return Promise.reject();
    }
    if (!(LanguageManager.noDuplicateNames(ll))) {
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

  async languageExists(id: number): Promise<boolean> {
    const llInDb = await this.getLanguages();
    // eslint-disable-next-line no-restricted-syntax
    for (const l of llInDb) {
      if (l.id === id) return true;
    }
    return false;
  }

  async includesAllLanguages(ll: Language[]): Promise<boolean> {
    const llInDb = await this.getLanguages();
    const ids = new Set<number>();
    if (llInDb.length !== ll.length) return false;
    // eslint-disable-next-line no-restricted-syntax
    for (const l of ll) {
      // no duplicate ids
      if (ids.has(l.id)) return false;
      ids.add(l.id);
      // eslint-disable-next-line no-await-in-loop
      if ((await this.getLanguageById(l.id) === undefined)) {
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
