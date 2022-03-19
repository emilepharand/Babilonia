import {Database} from 'sqlite';
import {getEmptyLanguage, Language} from '../model/languages/language';
import LanguageManager from '../model/languages/languageManager';

export interface NumberIdeasInLanguage {
  language: Language;
  count: number;
}

export function getEmptyNumberIdeasInLanguage(): NumberIdeasInLanguage[] {
	return [{
		language: getEmptyLanguage(),
		count: 0,
	}];
}

export class Stats {
	private db: Database;
	private lm: LanguageManager;

	constructor(db: Database, lm: LanguageManager) {
		this.db = db;
		this.lm = lm;
	}

	public async getIdeasPerLanguage(): Promise<NumberIdeasInLanguage[]> {
		const ideasPerLanguage:NumberIdeasInLanguage[] = [];
		const query = `
		select languageId, count(distinct ideaId) as count, ordering
    from expressions
    join languages on languageId = languages.id
    group by languageId
    order by ordering`;
		const rows: [{ languageId: number; count: number; ordering: number }] = await this.db.all(
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
