import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import Idea from './ideas/idea';
import Language from './languages/language';
import Expression from './expressions/expression';

let db;

(async () => {
  db = await open({
    filename: './model/db.db',
    driver: sqlite3.Database,
  });
})();

export default class DataManager {
  public static ideas: Idea[] = [];

  public static i = 1;

  public static async createData(): Promise<void> {

    const fr = new Language('français');
    const en = new Language('english');
    const es = new Language('español');
    const de = new Language('deutsch');
    const it = new Language('italian');

    const e1 = new Expression('Bonjour', fr);
    const e2 = new Expression('Hello', en);
    const e3 = new Expression('Buenos días', es);
    const e4 = new Expression('Guten tag', de);
    const e5 = new Expression('Buongiorno', it);

    const e6 = new Expression('Au revoir', fr);
    const e7 = new Expression('Goodbye', en);
    const e8 = new Expression('Adiós', es);
    const e9 = new Expression('Auf wiedersehen', de);
    const e0 = new Expression('Arrivederci', it);
    DataManager.ideas.push(new Idea([e6, e7, e8, e9, e0]));

    if (DataManager.i === 0) {
      DataManager.i = 1;
    } else {
      DataManager.i = 0;
    }
  }

  static async getNextIdea(): Promise<Idea> {
    const expressions = await db.all('SELECT * FROM expressions WHERE idea_id = ?', DataManager.i);

    if (DataManager.i === 1) {
      DataManager.i = 2;
    } else {
      DataManager.i = 1;
    }

    const ideaExpressions: Expression[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const expression of expressions) {
      // eslint-disable-next-line no-await-in-loop
      const language = await db.all('SELECT name FROM languages WHERE id = ?', expression.language_id);
      expression.language = language[0].name;
      ideaExpressions.push(expression);
    }
    console.log(ideaExpressions);

    return new Idea(ideaExpressions);
  }
}
