import type {Database} from 'sqlite';
import type {Language} from '../model/languages/language';
import {getEmptyLanguageNoAsync} from '../model/languages/language';
import type LanguageManager from '../model/languages/languageManager';

export type StatsPerLanguage = {
	language: Language;
	knownIdeasCount: number;
	totalIdeasCount: number;
	totalExpressionsCount: number;
	knownExpressionsCount: number;
};

export function getEmptyNumberIdeasInLanguage(): StatsPerLanguage[] {
	return [{
		language: getEmptyLanguageNoAsync(),
		knownIdeasCount: 0,
		totalIdeasCount: 0,
		totalExpressionsCount: 0,
		knownExpressionsCount: 0,
	}];
}

export class Stats {
	constructor(private readonly db: Database, private readonly lm: LanguageManager) {
	}

	public async getIdeasPerLanguage(): Promise<StatsPerLanguage[]> {
		const query = `
			select t1.languageId, knownIdeasCount, totalIdeasCount, knownExpressionsCount, totalExpressionsCount
			FROM    (select languages.id as languageId, count(distinct ideaId) as totalIdeasCount, count(distinct expressions.id) as totalExpressionsCount, ordering
			from languages
			left join expressions on languageId = languages.id
			group by languageId
			order by ordering) t1
			LEFT JOIN
					(select languages.id as languageId, count(distinct ideaId) as knownIdeasCount, 
			count(distinct expressions.id) as knownExpressionsCount
			from languages
			left join expressions on languageId = languages.id and expressions.known='1'
			group by languageId) t2
			ON (t1.languageId = t2.languageId)
    `;
		const rows: [{
			languageId: number;
			knownIdeasCount: number;
			totalIdeasCount: number;
			totalExpressionsCount: number;
			knownExpressionsCount: number;
			ordering: number;
		}] = await this.db.all(query);
		const statsPerLanguages: StatsPerLanguage[] = [];
		for (const row of rows) {
			// Allow await in loop because order must be preserved
			// eslint-disable-next-line no-await-in-loop
			const language = await this.lm.getLanguage(row.languageId);
			statsPerLanguages.push({
				language,
				knownIdeasCount: row.knownIdeasCount,
				totalIdeasCount: row.totalIdeasCount,
				totalExpressionsCount: row.totalExpressionsCount,
				knownExpressionsCount: row.knownExpressionsCount,
			});
		}
		return statsPerLanguages;
	}
}
