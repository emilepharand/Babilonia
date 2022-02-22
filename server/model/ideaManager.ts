import { Database } from 'sqlite';
import { Expression } from './expression';
import { Idea, IdeaForAdding } from './idea';
import LanguageManager from './languageManager';

export default class IdeaManager {
  private db: Database;

  private lm: LanguageManager;

  constructor(db: Database, lm: LanguageManager) {
    this.db = db;
    this.lm = lm;
  }

  public async ideaIdExists(id: number): Promise<boolean> {
    const i = (await this.db.get('SELECT * FROM ideas WHERE id = ?', id)) as Idea;
    return i !== undefined;
  }

  async addIdea(ideaForAdding: IdeaForAdding): Promise<Idea> {
    await this.db.run('insert into ideas("id") VALUES (null)');
    const ideaId = (await this.db.get('SELECT last_insert_rowid()'))['last_insert_rowid()'];
    // eslint-disable-next-line no-restricted-syntax
    for (const e of ideaForAdding.ee) {
      // eslint-disable-next-line no-await-in-loop
      await this.db.run('insert into expressions("ideaId", "languageId", "text") values (?, ?, ?)',
        ideaId, e.languageId, e.text);
    }
    return this.getIdeaById(ideaId);
  }

  async editIdea(idea: IdeaForAdding, id: number): Promise<void> {
    await this.db.run('delete from expressions where ideaId = ?', id);
    // eslint-disable-next-line no-restricted-syntax
    for (const e of idea.ee) {
      // eslint-disable-next-line no-await-in-loop
      await this.db.run('insert into expressions("ideaId", "languageId", "text") values (?, ?, ?)',
        id, e.languageId, e.text);
    }
  }

  async deleteIdea(ideaId: number): Promise<void> {
    await this.db.run('delete from expressions where ideaId = ?', ideaId);
    await this.db.run('delete from ideas where id =  ?', ideaId);
  }

  private async getExpressions(ideaId: number): Promise<Expression[]> {
    const res: [{ id: number, languageId: number, text: string }] = await this.db.all('select id, languageId, text from expressions WHERE ideaId = ?', ideaId);
    const ee: Expression[] = [];
    // beware of Promise.all() because expressions order need to be preserved
    // eslint-disable-next-line no-restricted-syntax
    for (const item of res) {
      ee.push({
        id: item.id,
        // eslint-disable-next-line no-await-in-loop
        text: item.text,
        // eslint-disable-next-line no-await-in-loop
        language: await this.lm.getLanguageById(item.languageId),
      });
    }
    return ee;
  }

  private async getTexts(expressionId: number): Promise<string[]> {
    const texts: string[] = [];
    const txts = await this.db.all('SELECT text FROM texts WHERE expressionId = ?', expressionId);
    txts.forEach((txt) => texts.push(txt.text));
    return texts;
  }

  public async getIdeaById(ideaId: number): Promise<Idea> {
    if (!(await this.ideaIdExists(ideaId))) {
      return Promise.reject();
    }
    const ee: Expression[] = await this.getExpressions(ideaId);
    ee.sort((e1: Expression, e2: Expression) => e1.language.ordering - e2.language.ordering);
    return new Idea({
      id: ideaId,
      ee,
    });
  }
}
