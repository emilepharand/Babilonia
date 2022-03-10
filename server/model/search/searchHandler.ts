import { Database } from 'sqlite';
import LanguageManager from '../languages/languageManager';
import IdeaManager from '../ideas/ideaManager';
import { Idea } from '../ideas/idea';
import { SearchContext } from './searchContext';

type SearchResultRow = {
  ideaId: number;
  expressionId: number;
};

export default class SearchHandler {
  private db: Database;

  private lm: LanguageManager;

  private im: IdeaManager;

  constructor(db: Database, lm: LanguageManager, im: IdeaManager) {
    this.db = db;
    this.lm = lm;
    this.im = im;
  }

  public async executeQueryForSearchContext(sc: SearchContext): Promise<SearchResultRow[]> {
    let query = 'select e.id as expressionId, ideaId from expressions as e join languages as l on l.id=e.languageId';
    const whereCondition = [];
    const params = [];
    if (sc.pattern) {
      const pattern = sc.strict ? sc.pattern : `%${sc.pattern}%`;
      whereCondition.push('e.text LIKE ?');
      params.push(pattern);
    }
    if (sc.language) {
      whereCondition.push('l.id=?');
      params.push(sc.language);
    }
    if (sc.ideaHas && sc.ideaHasOperator === 'or') {
      whereCondition.push(
        `ideaId in (select * from ideas where id in (select distinct ideaId from expressions where languageId
            in (${sc.ideaHas.join(',')})))`,
      );
    }
    if (whereCondition.length > 0) {
      query += ` where ${whereCondition.join(' and ')}`;
    }
    console.log(query);
    return this.db.all(query, ...params);
  }

  public async executeSearch(sc: SearchContext): Promise<Idea[]> {
    const rows = (await this.executeQueryForSearchContext(sc)) as SearchResultRow[];
    const matchedExpressions: number[] = rows.map((row) => row.expressionId);
    const ideaPromises: Promise<Idea>[] = [];
    const alreadyAddedIdeas = new Set<number>();
    rows.forEach((row) => {
      if (!alreadyAddedIdeas.has(row.ideaId)) {
        ideaPromises.push(this.im.getIdea(row.ideaId));
      }
      alreadyAddedIdeas.add(row.ideaId);
    });
    const ideas = await Promise.all(ideaPromises);
    ideas.forEach((idea) => {
      idea.ee.forEach((e) => {
        e.matched = matchedExpressions.includes(e.id);
      });
    });
    return ideas;
  }
}
