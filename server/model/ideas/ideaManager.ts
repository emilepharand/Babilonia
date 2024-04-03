import type {Database} from 'sqlite';
import type LanguageManager from '../languages/languageManager';
import {type Manager} from '../manager';
import {type Expression, type ExpressionForAdding} from './expression';
import type {Idea} from './idea';
import type {IdeaForAdding} from './ideaForAdding';
import * as UniqueExpression from './uniqueExpression';

// Manages ideas: getting, adding, editing, deleting and the logic around those actions
// Arguments are assumed to be valid
// Validation is performed at a higher level in the `Controller` class
export default class IdeaManager implements Manager {
	constructor(private readonly db: Database, private readonly lm: LanguageManager) {
	}

	async addIdea(ideaForAdding: IdeaForAdding): Promise<Idea> {
		await this.db.run('insert into ideas("id") VALUES (null)');
		const ideaId = (await this.db.get('select last_insert_rowid() as id')).id as number;
		await this.insertExpressions(ideaForAdding.ee, ideaId);
		return this.getIdea(ideaId);
	}

	async editIdea(idea: IdeaForAdding, id: number): Promise<void> {
		let promises = [];
		const existingExpressions = await this.getExpressions(id);
		const existingExpressionsMap = new Map<string, Expression>();
		for (const e of existingExpressions) {
			existingExpressionsMap.set(JSON.stringify(UniqueExpression.fromExpression(e)), e);
		}
		for (const e of idea.ee) {
			const uniqueExpression = UniqueExpression.fromExpressionForAdding(e);
			const existingExpression = existingExpressionsMap.get(JSON.stringify(uniqueExpression));
			if (existingExpression) {
				promises.push(this.db.run('update expressions set languageId = ?, text = ?, known = ? where id = ?',
					e.languageId,
					e.text,
					e.known,
					existingExpression.id));
				existingExpressionsMap.delete(JSON.stringify(UniqueExpression.fromExpressionForAdding(e)));
			} else {
				promises.push(this.insertExpression(e, id));
			}
		}
		for (const e of existingExpressionsMap.values()) {
			promises.push(this.db.run('delete from expressions where id = ?', e.id));
		}

		await Promise.all(promises);

		promises = [];
		for (let i = 0; i < idea.ee.length; i++) {
			const e = idea.ee[i];
			promises.push(this.db.run('update expressions set ordering = ? where ideaId = ? and languageId = ? and text = ?',
				i,
				id,
				e.languageId,
				e.text));
		}

		await Promise.all(promises);
	}

	async deleteIdea(ideaId: number): Promise<void> {
		await this.db.run('delete from expressions where ideaId = ?', ideaId);
		await this.db.run('delete from ideas where id =  ?', ideaId);
	}

	public async getIdea(ideaId: number): Promise<Idea> {
		const ee: Expression[] = await this.getExpressions(ideaId);
		ee.sort((e1, e2) => e1.language.ordering - e2.language.ordering || e1.ordering - e2.ordering);
		return {id: ideaId, ee};
	}

	public async idExists(id: number): Promise<boolean> {
		return (await this.db.get('select * from ideas where id = ?', id)) !== undefined;
	}

	public async countIdeas(): Promise<number> {
		return (await this.db.get('select count(*) as count from ideas'))?.count as number;
	}

	private async insertExpressions(ee: ExpressionForAdding[], ideaId: number): Promise<void> {
		for (let i = 0; i < ee.length; i++) {
			const e = ee[i];
			const query = 'insert into expressions("ideaId", "languageId", "text", "known", "ordering") values (?, ?, ?, ?, ?)';
			// eslint-disable-next-line no-await-in-loop
			await this.db.run(query, ideaId, e.languageId, e.text, e.known ? '1' : '0', i);
		}
	}

	private async insertExpression(e: ExpressionForAdding, ideaId: number): Promise<void> {
		const query = 'insert into expressions("ideaId", "languageId", "text", "known") values (?, ?, ?, ?)';
		await this.db.run(query, ideaId, e.languageId, e.text, e.known ? '1' : '0');
	}

	private async getExpressions(ideaId: number): Promise<Expression[]> {
		const query = 'select id, languageId, text, known, ordering from expressions where ideaId = ?';
		const rows: [{id: number; languageId: number; text: string; known: string; ordering: number}] = await this.db.all(
			query,
			ideaId,
		);
		return Promise.all(
			rows.map(async row => ({
				id: row.id,
				text: row.text,
				language: await this.lm.getLanguage(row.languageId),
				ordering: row.ordering,
				known: row.known === '1',
			})),
		);
	}
}
