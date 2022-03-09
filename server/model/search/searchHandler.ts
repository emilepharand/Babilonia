import { Database } from 'sqlite';
import LanguageManager from '../languages/languageManager';
import IdeaManager from '../ideas/ideaManager';
import { Idea } from '../ideas/idea';
import { SearchContext } from './searchContext';

export default class SearchHandler {
  private db: Database;

  private lm: LanguageManager;

  private im: IdeaManager;

  constructor(db: Database, lm: LanguageManager, im: IdeaManager) {
    this.db = db;
    this.lm = lm;
    this.im = im;
  }

  public async executeSearch(sc: SearchContext): Promise<Idea[]> {
    const query = `
      select e.id as expressionId, ideaId from expressions as e
      join languages as l
      on l.id=e.languageId
      where e.text LIKE ?
      and l.id=?`;
    const pattern = sc.strict ? sc.pattern : `%${sc.pattern}%`;
    const rows = (await this.db.all(query, pattern, sc.language)) as {
      ideaId: number;
      expressionId: number;
    }[];
    const matchedExpressions: number[] = rows.map((row) => row.expressionId);
    const ideaPromises: Promise<Idea>[] = [];
    rows.forEach((row) => ideaPromises.push(this.im.getIdea(row.ideaId)));
    const ideas = await Promise.all(ideaPromises);
    ideas.forEach((idea) => {
      idea.ee.forEach((e) => {
        e.matched = matchedExpressions.includes(e.id);
      });
    });
    return ideas;
  }
}
