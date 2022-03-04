import { Database } from 'sqlite';
import { Language, validate, validateForAdding } from './language';

// Manages languages: getting, adding, editing, deleting and the logic around those actions
// Arguments are assumed to be valid
// Methods to validate arguments are exposed
// Validation is performed at a higher level in the `Controller` class
export default class LanguageManager {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getLanguage(id: number): Promise<Language> {
    const query = 'select * from languages where id = ?';
    const row: Language = (await this.db.get(query, id)) as Language;
    row.isPractice = row.isPractice === '1';
    return row;
  }

  public async getLanguages(): Promise<Language[]> {
    const languages: Language[] = await this.db.all('select * from languages');
    return languages.map((l) => ({ ...l, isPractice: l.isPractice === '1' }));
  }

  async deleteLanguage(languageId: number): Promise<void> {
    // TODO ordering when unique is enforced:
    // BEGIN TRANSACTION;
    // update languages set ordering = -ordering;
    // update languages set ordering = 0 where id = 6;
    // update languages set ordering = 2 where id = 7;
    // update languages set ordering = 1 where id = 8;
    // COMMIT;
    const l = await this.getLanguage(languageId);
    await this.db.run('update languages set ordering = case when ordering > ? then ordering - 1 else ordering END', l.ordering);
    await this.db.run('delete from languages where id = ?', languageId);
    await this.db.run('delete from expressions where languageId = ?', languageId);
  }

  public async addLanguage(name: string): Promise<Language> {
    const nextOrdering = await this.getNextOrdering();
    const query = 'insert into languages("name", "ordering", "isPractice") values (?, ?, ?)';
    await this.db.run(query, name, nextOrdering, false);
    const languageId = (await this.db.get('select last_insert_rowid() as id')).id;
    const l = (await this.db.get('select * from languages where id = ?', languageId)) as Language;
    l.isPractice = l.isPractice === '1';
    return l;
  }

  public async getNextOrdering(): Promise<number> {
    const res = await this.db.get('select max(ordering) as nextOrdering from languages');
    return res.nextOrdering === null ? 0 : res.nextOrdering + 1;
  }

  private async editLanguage(id: number, language: Language): Promise<Language> {
    const query = 'update languages set "name" = ?, "ordering" = ?, "isPractice" = ? WHERE "id" = ?';
    await this.db.run(query, language.name, language.ordering, language.isPractice, language.id);
    return this.getLanguage(id);
  }

  public async languageNameExists(name: string): Promise<boolean> {
    return (await this.db.get('select * from languages where name = ?', name)) !== undefined;
  }

  async languageIdExists(id: number): Promise<boolean> {
    return (await this.db.get('select * from languages where id = ?', id)) !== undefined;
  }

  public async validateLanguagesForEditing(toValidate: unknown): Promise<boolean> {
    // object is an array
    if (!(toValidate instanceof Array)) {
      return false;
    }
    const ll = toValidate as Language[];
    // each language is valid
    if (ll.some((l) => !validate(l))) {
      return false;
    }
    // no language name is blank
    if (ll.some((l) => l.name.trim() === '')) {
      return false;
    }
    // there are no duplicate language ids
    const languageIds = new Set(Array.from(ll.values(), (l) => l.id));
    if (await this.countLanguages() !== ll.length) {
      return false;
    }
    // there are no duplicate language names
    const names = new Set(Array.from(ll.values(), (l) => l.name));
    if (names.size !== ll.length) {
      return false;
    }
    // all languages exist
    const promises: Promise<boolean>[] = [];
    languageIds.forEach((id) => promises.push(this.languageIdExists(id)));
    if (!(await Promise.all(promises)).every((exist) => exist)) {
      return false;
    }
    // ordering is valid
    const orderings = new Set<number>();
    ll.forEach((l) => orderings.add(l.ordering));
    for (let i = 0; i < ll.length; i += 1) {
      if (!(orderings.has(i))) {
        return false;
      }
    }
    return true;
  }

  async editLanguages(ll: Language[]): Promise<Language[]> {
    const promises: Promise<Language>[] = [];
    ll.forEach((l) => promises.push(this.editLanguage(l.id, l)));
    return Promise.all(promises);
  }

  public async countLanguages(): Promise<number> {
    return (await this.db.get('select count(*) as count from languages'))?.count ?? 0;
  }

  public async validateLanguageForAdding(toValidate: unknown): Promise<boolean> {
    if (!validateForAdding(toValidate)) {
      return false;
    }
    const l = toValidate as { name: string };
    if (l.name.trim() === '') {
      return false;
    }
    return !(await this.languageNameExists(l.name));
  }
}
