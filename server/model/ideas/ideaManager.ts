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
		await this.db.run('insert into ideas default values');
		const ideaId = (await this.db.get('select last_insert_rowid() as id')).id as number;
		await this.insertExpressions(ideaForAdding.ee, ideaId);
		return this.getIdea(ideaId);
	}

	async editIdea(idea: IdeaForAdding, id: number): Promise<void> {
		const currentUniqueExpressionsMap = await this.getUniqueExpressionsMap(id);

		const promises = this.updateAndInsertExpressions(idea, id, currentUniqueExpressionsMap);

		const idsToDelete = Array.from(currentUniqueExpressionsMap.values()).map(e => e.id);
		promises.push(this.deleteExpressions(idsToDelete));

		// Previous promises must be awaited before updating ordering
		await Promise.all(promises);

		await Promise.all(this.updateOrdering(idea, id));
	}

	async deleteIdea(ideaId: number): Promise<void> {
		await this.db.run('delete from expressions where ideaId = ?', ideaId);
		await this.db.run('delete from ideas where id =  ?', ideaId);
	}

	async getIdea(ideaId: number): Promise<Idea> {
		const ee: Expression[] = await this.getExpressions(ideaId);
		ee.sort((e1, e2) => e1.language.ordering - e2.language.ordering || e1.ordering - e2.ordering);
		return {id: ideaId, ee};
	}

	async getIdeas(): Promise<Idea[]> {
		const ideas: Array<{id: number}> = await this.db.all('select id from ideas');
		return Promise.all(ideas.map(async idea => this.getIdea(idea.id)));
	}

	async idExists(id: number): Promise<boolean> {
		return (await this.db.get('select * from ideas where id = ?', id)) !== undefined;
	}

	async countIdeas(): Promise<number> {
		return (await this.db.get('select count(*) as count from ideas'))?.count as number;
	}

	private async getUniqueExpressionsMap(ideaId: number) {
		const currentExpressions = await this.getExpressions(ideaId);
		const currentUniqueExpressionsMap = new Map<string, Expression>();
		for (const e of currentExpressions) {
			const uniqueExpressionKey = JSON.stringify(UniqueExpression.fromExpression(e));
			currentUniqueExpressionsMap.set(uniqueExpressionKey, e);
		}
		return currentUniqueExpressionsMap;
	}

	private updateAndInsertExpressions(idea: IdeaForAdding, id: number, currentUniqueExpressionsMap: Map<string, Expression>) {
		const promises = [];
		for (const e of idea.ee) {
			const uniqueExpressionKey = JSON.stringify(UniqueExpression.fromExpressionForAdding(e));
			const existingExpression = currentUniqueExpressionsMap.get(uniqueExpressionKey);
			if (existingExpression) {
				const query = 'update expressions set languageId = ?, text = ?, known = ? where id = ?';
				promises.push(this.db.run(query, e.languageId, e.text, e.known, existingExpression.id));
				currentUniqueExpressionsMap.delete(uniqueExpressionKey);
			} else {
				promises.push(this.insertExpression(e, id));
			}
		}
		return promises;
	}

	private updateOrdering(idea: IdeaForAdding, id: number) {
		const query = 'update expressions set ordering = ? where ideaId = ? and languageId = ? and text = ?';
		return idea.ee.map(async (e, i) => this.db.run(query, i, id, e.languageId, e.text));
	}

	private async deleteExpressions(ids: number[]) {
		const sql = `delete from expressions where id in (${ids.map(() => '?').join(',')})`;
		return this.db.run(sql, ids);
	}

	private async insertExpressions(ee: ExpressionForAdding[], ideaId: number): Promise<void> {
		const query = 'insert into expressions("ideaId", "languageId", "text", "known", "ordering") values (?, ?, ?, ?, ?)';
		const promises = ee.map(async (e, i) => this.db.run(query, ideaId, e.languageId, e.text, e.known ? '1' : '0', i));
		await Promise.all(promises);
	}

	private async insertExpression(e: ExpressionForAdding, ideaId: number): Promise<void> {
		await this.insertExpressions([e], ideaId);
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
