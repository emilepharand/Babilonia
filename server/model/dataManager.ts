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
  console.log('Database was opened.');
})();

export default class DataManager {
  public static ideas: Idea[] = [];

  public static i = 1;

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

    return new Idea(ideaExpressions);
  }

  static async getLanguages(): Promise<Language[]> {
    return db.all('select * from languages');
  }
}
