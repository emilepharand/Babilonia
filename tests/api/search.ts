import {
  addIdea, addLanguage, deleteEverything, searchAndGetResponse,
} from '../utils/utils';
import { ExpressionForAdding } from '../../server/model/ideas/expression';
import { Idea } from '../../server/model/ideas/idea';
import { SearchContext } from '../../server/model/search/searchContext';

beforeEach(async () => {
  await deleteEverything();
});

describe('searching expressions', () => {
  test('regex', async () => {
    const fr = await addLanguage('français');
    const en = await addLanguage('anglais');
    const es = await addLanguage('español');
    const it = await addLanguage('italiano');
    const de = await addLanguage('deutsch');
    const fr1: ExpressionForAdding = { text: 'bonjour', languageId: fr.id };
    const en1: ExpressionForAdding = { text: 'hello', languageId: en.id };
    const es1: ExpressionForAdding = { text: 'buenos días', languageId: es.id };
    const it1: ExpressionForAdding = { text: 'buongiorno', languageId: it.id };
    const de1: ExpressionForAdding = { text: 'guten Tag', languageId: de.id };
    const fr2: ExpressionForAdding = { text: 'bonne nuit', languageId: fr.id };
    const en2: ExpressionForAdding = { text: 'good night', languageId: en.id };
    const es2: ExpressionForAdding = { text: 'buenas noches', languageId: es.id };
    const it2: ExpressionForAdding = { text: 'buonanotte', languageId: it.id };
    const de2: ExpressionForAdding = { text: 'gute Natch', languageId: de.id };
    const i1 = await addIdea({ ee: [fr1, en1, es1, it1, de1] });
    const i2 = await addIdea({ ee: [fr2, en2, es2, it2, de2] });
    const sc: SearchContext = {
      pattern: 'bonjour',
      languages: [fr.id],
      ideaHas: [fr.id, en.id, es.id, it.id, de.id],
      ideaHasOperator: 'and',
      ideaDoesNotHave: [],
      ideaDoesNotHaveOperator: 'or',
    };
    const r = await searchAndGetResponse(sc);
    const ideas = (await r.json()) as Idea[];
    expect(ideas.length).toEqual(1);
    expect(ideas[0]).toMatchObject(i1);
  });
});
