import {Database} from 'sqlite';
import {Expression, ExpressionForAdding} from './expression';
import {Idea} from './idea';
import LanguageManager from '../languages/languageManager';
import {IdeaForAdding} from './ideaForAdding';

// Manages ideas: getting, adding, editing, deleting and the logic around those actions
// Arguments are assumed to be valid
// Validation is performed at a higher level in the `Controller` class
export default class IdeaManager {
	private db: Database;

	private lm: LanguageManager;

	constructor(db: Database, lm: LanguageManager) {
		this.db = db;
		this.lm = lm;
	}

	async addIdea(ideaForAdding: IdeaForAdding): Promise<Idea> {
		await this.db.run('insert into ideas("id") VALUES (null)');
		const ideaId = (await this.db.get('select last_insert_rowid() as id')).id;
		await this.insertExpressions(ideaForAdding.ee, ideaId);
		return this.getIdea(ideaId);
	}

	async editIdea(idea: IdeaForAdding, id: number): Promise<void> {
		// Old expressions are deleted and new ones added
		// because ids of expressions don't need to be preserved
		// and it is easier to handle editing ideas this way
		// (this might change in the future)
		await this.db.run('delete from expressions where ideaId = ?', id);
		await this.insertExpressions(idea.ee, id);
	}

	async deleteIdea(ideaId: number): Promise<void> {
		await this.db.run('delete from expressions where ideaId = ?', ideaId);
		await this.db.run('delete from ideas where id =  ?', ideaId);
	}

	public async getIdea(ideaId: number): Promise<Idea> {
		const ee: Expression[] = await this.getExpressions(ideaId);
		// Sort ideas by language ordering
		ee.sort((e1: Expression, e2: Expression) => e1.language.ordering - e2.language.ordering);
		return new Idea({id: ideaId, ee});
	}

	public async ideaExists(id: number): Promise<boolean> {
		return (await this.db.get('select * from ideas where id = ?', id)) !== undefined;
	}

	public async countIdeas(): Promise<number> {
		return (await this.db.get('select count(*) as count from ideas'))?.count ?? 0;
	}

	private async insertExpressions(ee: ExpressionForAdding[], ideaId: number): Promise<void> {
		for (const e of ee) {
			const query = 'insert into expressions("ideaId", "languageId", "text") values (?, ?, ?)';
			// Await is needed because order needs to be preserved
			// eslint-disable-next-line no-await-in-loop
			await this.db.run(query, ideaId, e.languageId, e.text);
		}
	}

	private async getExpressions(ideaId: number): Promise<Expression[]> {
		const query = 'select id, languageId, text from expressions where ideaId = ?';
		const rows: [{ id: number; languageId: number; text: string }] = await this.db.all(
			query,
			ideaId,
		);
		return Promise.all(
			rows.map(async row => ({
				id: row.id,
				text: row.text,
				language: await this.lm.getLanguage(row.languageId),
			})),
		);
	}
}
