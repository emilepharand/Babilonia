import Idea from './ideas/idea';
import Language from './languages/language';
import Expression from './expressions/expression';

export default class DataManager {
  public static ideas: Idea[] = [];

  public static createData(): void {
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
    DataManager.ideas.push(new Idea([e1, e2, e3, e4, e5]));

    const e6 = new Expression('Au revoir', fr);
    const e7 = new Expression('Goodbye', en);
    const e8 = new Expression('Adiós', es);
    const e9 = new Expression('Auf wiedersehen', de);
    const e0 = new Expression('Arrivederci', it);
    DataManager.ideas.push(new Idea([e6, e7, e8, e9, e0]));
  }
}
