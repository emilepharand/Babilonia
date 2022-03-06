import {
  addIdea,
  addLanguage,
  deleteEverything,
  search,
  searchAndGetResponse,
} from '../utils/utils';
import { ExpressionForAdding } from '../../server/model/ideas/expression';
import { Idea } from '../../server/model/ideas/idea';
import { SearchContext } from '../../server/model/search/searchContext';

beforeEach(async () => {
  await deleteEverything();
});

async function testSearch(
  sc: SearchContext,
  ideasThatShouldMatch: Idea[],
  expressionsThatShouldMatchIdeas: string[][],
) {
  const actuallyMatchedIdeas = await search(sc);
  expect(actuallyMatchedIdeas.length).toEqual(ideasThatShouldMatch.length);
  expect(actuallyMatchedIdeas).toMatchObject(ideasThatShouldMatch);
  actuallyMatchedIdeas.forEach((actuallyMatchedIdea, i) => {
    const expressionsThatShouldMatch = expressionsThatShouldMatchIdeas[i];
    const matchedExpressions = actuallyMatchedIdea.ee.filter((e) => e.matched);
    const expressionsWithoutMatchedProperty = actuallyMatchedIdea.ee.filter(
      (e) => e.matched === undefined,
    );
    expect(expressionsWithoutMatchedProperty.length).toEqual(0);
    expect(matchedExpressions.length).toEqual(expressionsThatShouldMatch.length);
    matchedExpressions.forEach((matchedExpression, j) => {
      const expressionThatShouldMatch = expressionsThatShouldMatch[j];
      expect(matchedExpression.text).toEqual(expressionThatShouldMatch);
    });
  });
}

describe('searching expressions', () => {
  test('searching for expressions in a specific language', async () => {
    const fr = await addLanguage('français');
    const en = await addLanguage('anglais');
    const es = await addLanguage('español');
    const fr1: ExpressionForAdding = { text: 'bonjour', languageId: fr.id };
    const en1: ExpressionForAdding = { text: 'hello', languageId: en.id };
    const es1: ExpressionForAdding = { text: 'buenos días', languageId: es.id };
    const fr2: ExpressionForAdding = { text: 'bonne nuit', languageId: fr.id };
    const en2: ExpressionForAdding = { text: 'good night', languageId: en.id };
    const i1 = await addIdea({ ee: [fr1, en1, es1] });
    const i2 = await addIdea({ ee: [fr2, en2] });

    const sc: SearchContext = {
      pattern: 'bonjour',
      language: fr.id,
    };
    await testSearch(sc, [i1], [['bonjour']]);

    sc.pattern = 'bon%';
    await testSearch(sc, [i1, i2], [['bonjour'], ['bonne nuit']]);
  });

  test('ideaHas and ideaDoesNotHave', async () => {
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
      language: fr.id,
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
