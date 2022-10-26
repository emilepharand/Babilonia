import {Database} from 'sqlite';
import {Language} from './language';

// Manages languages: getting, adding, editing, deleting and the logic around those actions
// Arguments are assumed to be valid
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
		let languages: Language[] = await this.db.all('select * from languages');
		languages = languages.map(l => ({...l, isPractice: l.isPractice === '1'}));
		languages.sort((l1, l2) => l1.ordering - l2.ordering);
		return languages;
	}

	async deleteLanguage(languageId: number): Promise<void> {
		// eslint-disable-next-line no-warning-comments
		// TODO ordering when unique is enforced: (Issue #76)
		const l = await this.getLanguage(languageId);
		await this.db.run(
			'update languages set ordering = case when ordering > ? then ordering - 1 else ordering END',
			l.ordering,
		);
		await this.db.run('delete from languages where id = ?', languageId);
		await this.db.run('delete from expressions where languageId = ?', languageId);
	}

	public async addLanguage(name: string): Promise<Language> {
		const nextOrdering = await this.getNextOrdering();
		const query = 'insert into languages("name", "ordering", "isPractice") values (?, ?, ?)';
		await this.db.run(query, name.trim(), nextOrdering, false);
		const languageId = (await this.db.get('select last_insert_rowid() as id')).id;
		const l = (await this.db.get('select * from languages where id = ?', languageId)) as Language;
		l.isPractice = l.isPractice === '1';
		return l;
	}

	public async getNextOrdering(): Promise<number> {
		const res = await this.db.get('select max(ordering) as nextOrdering from languages');
		return res.nextOrdering === null ? 0 : res.nextOrdering + 1;
	}

	public async languageNameExists(name: string): Promise<boolean> {
		return (await this.db.get('select * from languages where name = ?', name)) !== undefined;
	}

	async languageIdExists(id: number): Promise<boolean> {
		return (await this.db.get('select * from languages where id = ?', id)) !== undefined;
	}

	async editLanguages(ll: Language[]): Promise<Language[]> {
		const promises: Promise<Language>[] = [];
		ll.forEach(l => promises.push(this.editLanguage(l.id, l)));
		return Promise.all(promises);
	}

	public async countLanguages(): Promise<number> {
		return (await this.db.get('select count(*) as count from languages'))?.count ?? 0;
	}

	private async editLanguage(id: number, language: Language): Promise<Language> {
		const query
      = 'update languages set "name" = ?, "ordering" = ?, "isPractice" = ? WHERE "id" = ?';
		await this.db.run(query, language.name.trim(), language.ordering, language.isPractice, language.id);
		return this.getLanguage(id);
	}
}
