import {
  addIdea, addLanguage, deleteEverything, searchAndGetResponse,
} from '../utils/utils';
import { ExpressionForAdding } from '../../server/model/ideas/expression';
import { Idea } from '../../server/model/ideas/idea';

beforeEach(async () => {
  await deleteEverything();
});

describe('searching expressions', () => {
  test('regex', async () => {
    const l1 = await addLanguage('français');
    const l2 = await addLanguage('anglais');
    const i1e1: ExpressionForAdding = { text: 'bonjour', languageId: l1.id };
    const i1e2: ExpressionForAdding = { text: 'hello', languageId: l2.id };
    const i2e1: ExpressionForAdding = { text: 'bonjour', languageId: l1.id };
    const i2e2: ExpressionForAdding = { text: 'hello', languageId: l2.id };
    const i1 = await addIdea({ ee: [i1e1, i1e2] });
    const i2 = await addIdea({ ee: [i2e1, i2e2] });
    const pattern = 'bonjour';
    const languages = [l1.id, l2.id];
    const ideaHas = [l1.id, l2.id];
    const ideaDoesNotHave: number[] = [];
    const r = await searchAndGetResponse(
      'bonjour',
      languages,
      ideaHas,
      'and',
      ideaDoesNotHave,
      'or',
    );
    const ideas = (await r.json()) as Idea[];
    expect(ideas.length).toEqual(2);
    expect(ideas[0].id).toEqual(i1.id);
    expect(ideas[1].id).toEqual(i2.id);
  });
});
