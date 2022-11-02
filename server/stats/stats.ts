import type {Database} from 'sqlite';
import type {Language} from '../model/languages/language';
import {getEmptyLanguageNoAsync} from '../model/languages/language';
import type LanguageManager from '../model/languages/languageManager';

export type NumberIdeasInLanguage = {
	language: Language;
	count: number;
};

export function getEmptyNumberIdeasInLanguage(): NumberIdeasInLanguage[] {
	return [{
		language: getEmptyLanguageNoAsync(),
		count: 0,
	}];
}

export class Stats {
	constructor(private readonly db: Database, private readonly lm: LanguageManager) {}

	public async getIdeasPerLanguage(): Promise<NumberIdeasInLanguage[]> {
		const ideasPerLanguage: NumberIdeasInLanguage[] = [];
		const query = `
		select languageId, count(distinct ideaId) as count, ordering
    from expressions
    join languages on languageId = languages.id
    group by languageId
    order by ordering`;
		const rows: [{languageId: number; count: number; ordering: number}] = await this.db.all(
			query,
		);
		for (const row of rows) {
			// Allow await in loop because order must be preserved
			// eslint-disable-next-line no-await-in-loop
			const language = await this.lm.getLanguage(row.languageId);
			ideasPerLanguage.push({language, count: row.count});
		}
		return ideasPerLanguage;
	}
}
