import type {Database} from 'sqlite';
import type LanguageManager from '../languages/languageManager';
import {type Manager} from '../manager';
import type {Expression, ExpressionForAdding} from './expression';
import type {Idea} from './idea';
import type {IdeaForAdding} from './ideaForAdding';

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
		function removeContext(textWithContext: string): string {
			return textWithContext.replace(/\(.*?\)/g, '').replace(/\s/g, '');
		}

		const idsInOrder: number[] = [];
		const existingExpressions = await this.getExpressions(id);
		const expressionsWithoutContextMap = new Map<string, Expression>();
		for (const e of existingExpressions) {
			expressionsWithoutContextMap.set(removeContext(e.text), e);
		}

		for (const e of idea.ee) {
			const expressionWithoutContext = removeContext(e.text);
			const existingExpression = expressionsWithoutContextMap.get(expressionWithoutContext);
			if (existingExpression) {
				// eslint-disable-next-line no-await-in-loop
				await this.db.run('update expressions set languageId = ?, text = ?, known = ? where id = ?',
					e.languageId,
					e.text,
					e.known,
					existingExpression.id);
				expressionsWithoutContextMap.delete(expressionWithoutContext);
				idsInOrder.push(existingExpression.id);
			} else {
				// eslint-disable-next-line no-await-in-loop
				await this.insertExpression(e, id);
				// eslint-disable-next-line no-await-in-loop
				idsInOrder.push((await this.db.get('select last_insert_rowid() as id')).id as number);
			}
		}
		for (const e of expressionsWithoutContextMap.values()) {
			// eslint-disable-next-line no-await-in-loop
			await this.db.run('delete from expressions where id = ?', e.id);
		}
		for (let i = 0; i < idsInOrder.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			await this.db.run('update expressions set ordering = ? where id = ?', i, idsInOrder[i]);
		}
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
