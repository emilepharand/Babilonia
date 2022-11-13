import type {Database} from 'sqlite';
import type {Language} from '../model/languages/language';
import {getEmptyLanguageNoAsync} from '../model/languages/language';
import type LanguageManager from '../model/languages/languageManager';

export type GlobalStats = {
	totalIdeasCount: number;
	totalExpressionsCount: number;
	totalKnownIdeas: number;
	totalKnownExpressions: number;
};

export type LanguageStats = {
	language: Language;
	knownIdeasCount: number;
	totalIdeasCount: number;
	totalExpressionsCount: number;
	knownExpressionsCount: number;
};

export type AllStats = {
	globalStats: GlobalStats;
	allLanguageStats: LanguageStats[];
};

export function getEmptyAllStats(): AllStats {
	return {
		globalStats: getEmptyGlobalStats(),
		allLanguageStats: getEmptyNumberIdeasInLanguage(),
	};
}

function getEmptyGlobalStats() {
	return {
		totalIdeasCount: 0,
		totalExpressionsCount: 0,
		totalKnownIdeas: 0,
		totalKnownExpressions: 0,
	};
}

function getEmptyNumberIdeasInLanguage(): LanguageStats[] {
	return [{
		language: getEmptyLanguageNoAsync(),
		knownIdeasCount: 0,
		totalIdeasCount: 0,
		totalExpressionsCount: 0,
		knownExpressionsCount: 0,
	}];
}

export class StatsCounter {
	constructor(private readonly db: Database, private readonly lm: LanguageManager) {
	}

	public async getStats(): Promise<AllStats> {
		return {
			globalStats: await this.getGlobalStats(),
			allLanguageStats: await this.getAllLanguageStats(),
		};
	}

	private async getGlobalStats(): Promise<GlobalStats> {
		const query = `
with total as (select count (distinct ideas.id) as totalIdeasCount,
count (distinct expressions.id) as totalExpressionsCount
from ideas
left join expressions),

knownExpressions as (select count(distinct expressions.id) as totalKnownExpressions
from languages
join expressions on expressions.languageId = languages.id and expressions.known = '1'),

knownIdeas as (select count(distinct ideaId) as totalKnownIdeas
from languages
join expressions on expressions.languageId = languages.id and expressions.known = '1')

select total.totalIdeasCount, total.totalExpressionsCount, knownExpressions.totalKnownExpressions, knownIdeas.totalKnownIdeas
from total
join knownExpressions
join knownIdeas
		`;
		return (await this.db.get(query))!;
	}

	private async getAllLanguageStats(): Promise<LanguageStats[]> {
		const query = `
			with totalExpressions as (select
			languages.id as languageId,
			count(languageId) as totalExpressionsCount
			from languages
			left join expressions on expressions.languageId = languages.id
			group by languageId),
			
			totalIdeas as (with languageIdeaMapping as (select distinct languages.id as languageId, ideaId
			from languages
			left join expressions on expressions.languageId = languages.id)
			select languageId, count(ideaId) as totalIdeasCount
			from languageIdeaMapping
			group by languageId),
			
			totalKnownExpressions as (select
			languages.id as languageId,
			count(languageId) as knownExpressionsCount
			from languages
			left join expressions on expressions.languageId = languages.id  and expressions.known = '1'
			group by languageId),
			
			totalKnownIdeas as (with languageIdeaMapping as (select distinct languages.id as languageId, ideaId
			from languages
			left join expressions on expressions.languageId = languages.id and expressions.known = '1')
			select languageId, count(ideaId) as knownIdeasCount
			from languageIdeaMapping
			group by languageId)
			
			select totalIdeas.languageId,
			coalesce(totalExpressionsCount, 0) as totalExpressionsCount,
			coalesce(totalIdeasCount, 0) as totalIdeasCount,
			coalesce(knownIdeasCount, 0) as knownIdeasCount,
			coalesce(knownExpressionsCount, 0) as knownExpressionsCount,
			languages.ordering
			from totalIdeas
			left join totalExpressions on totalIdeas.languageId=totalExpressions.languageId
			left join totalKnownIdeas on totalIdeas.languageId=totalKnownIdeas.languageId
			left join totalKnownExpressions on totalIdeas.languageId=totalKnownExpressions.languageId
			left join languages on languages.id=totalIdeas.languageId
			order by ordering
    `;
		const rows: [{
			languageId: number;
			knownIdeasCount: number;
			totalIdeasCount: number;
			totalExpressionsCount: number;
			knownExpressionsCount: number;
			ordering: number;
		}] = await this.db.all(query);
		const languageStats: LanguageStats[] = [];
		for (const row of rows) {
			// Allow await in loop because order must be preserved
			// eslint-disable-next-line no-await-in-loop
			const language = await this.lm.getLanguage(row.languageId);
			languageStats.push({
				language,
				knownIdeasCount: row.knownIdeasCount,
				totalIdeasCount: row.totalIdeasCount,
				totalExpressionsCount: row.totalExpressionsCount,
				knownExpressionsCount: row.knownExpressionsCount,
			});
		}
		return languageStats;
	}
}
