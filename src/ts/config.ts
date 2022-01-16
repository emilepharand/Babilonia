import Idea from '../../server/model/idea';
import Expression from '../../server/model/expression';

export default class Config {
  public static async getAddIdeaTemplate(): Promise<Idea> {
    const ee: Expression[] = [];
    const idea = new Idea(-1, ee);
    // eslint-disable-next-line no-restricted-syntax
    for (const i of [...Array(2)
      .keys()]) {
      idea.ee.push({
        id: i,
        ideaId: -1,
        language: {
          id: 1,
          name: 'français',
          ordering: 1,
          isPractice: true,
        },
        texts: [''],
      });
    }
    return idea;
  }
}
