import { addIdea, addLanguage, search } from '../utils/utils';
import { ExpressionForAdding } from '../../server/model/ideas/expression';

describe('searching expressions', () => {
  test('regex', async () => {
    const l1 = await addLanguage('français');
    const l2 = await addLanguage('anglais');
    const e1: ExpressionForAdding = { text: 'bonjour', languageId: l1.id };
    const e2: ExpressionForAdding = { text: 'hello', languageId: l2.id };
    const i1 = await addIdea({ ee: [e1, e2] });
    const pattern = 'bonjour';
    const languages = [l1.id, l2.id];
    const ideaHas = [l1.id, l2.id];
    const ideaDoesNotHave: number[] = [];
    const a = search('bonjour', languages, ideaHas, 'and', ideaDoesNotHave, 'or');
  });
});
