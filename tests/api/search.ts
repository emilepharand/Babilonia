import {
  addIdea, addLanguage, deleteEverything, search,
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
  expressionsThatShouldMatch2D: string[][],
  languageId?: number,
) {
  const matchedIdeas = await search(sc);
  expect(matchedIdeas.length).toEqual(ideasThatShouldMatch.length);
  expect(matchedIdeas).toMatchObject(ideasThatShouldMatch);
  matchedIdeas.forEach((matchedIdea, i) => {
    const expressionsThatShouldMatch = expressionsThatShouldMatch2D[i];
    expect(matchedIdea.ee.every((e) => typeof e.matched === 'boolean'));
    const matchedExpressions = matchedIdea.ee.filter((e) => e.matched);
    matchedExpressions.forEach((matchedExpression, j) => {
      const expressionThatShouldMatch = expressionsThatShouldMatch[j];
      expect(matchedExpression.text).toEqual(expressionThatShouldMatch);
      expect(matchedExpression.language.id).toEqual(languageId);
      expect(matchedExpression.matched).toEqual(true);
    });
  });
}

describe('searching expressions', () => {
  test('searching for expressions in a language', async () => {
    const fr = await addLanguage('français');
    const en = await addLanguage('anglais');
    const es = await addLanguage('español');
    const fr1: ExpressionForAdding = { text: 'fr lorem ipsum', languageId: fr.id };
    const en1: ExpressionForAdding = { text: 'en lorem ipsum', languageId: en.id };
    const es1: ExpressionForAdding = { text: 'es lorem ipsum', languageId: es.id };
    const fr2: ExpressionForAdding = { text: 'fr ipsum sed', languageId: fr.id };
    const en2: ExpressionForAdding = { text: 'en ipsum sed', languageId: en.id };
    const fr3: ExpressionForAdding = { text: 'fr ipsum sed dolor', languageId: fr.id };
    const i1 = await addIdea({ ee: [fr1, en1, es1] });
    const i2 = await addIdea({ ee: [fr2, en2] });
    const i3 = await addIdea({ ee: [fr3] });

    const sc: SearchContext = {
      pattern: 'lorem ipsum',
      language: fr.id,
    };
    await testSearch(sc, [i1], [['fr lorem ipsum']], fr.id);

    sc.pattern = 'fr';
    await testSearch(
      sc,
      [i1, i2, i3],
      [['fr lorem ipsum'], ['fr ipsum sed'], ['fr ipsum sed dolor']],
      fr.id,
    );

    sc.pattern = 'fr';
    sc.strict = true;
    await testSearch(sc, [], []);

    sc.pattern = 'fr ipsum sed';
    sc.strict = true;
    await testSearch(sc, [i2], [['fr ipsum sed']], fr.id);
  });

  // test('ideaHas and ideaDoesNotHave', async () => {
  //   const fr = await addLanguage('français');
  //   const en = await addLanguage('anglais');
  //   const es = await addLanguage('español');
  //   const it = await addLanguage('italiano');
  //   const de = await addLanguage('deutsch');
  //   const fr1: ExpressionForAdding = { text: 'bonjour', languageId: fr.id };
  //   const en1: ExpressionForAdding = { text: 'hello', languageId: en.id };
  //   const es1: ExpressionForAdding = { text: 'buenos días', languageId: es.id };
  //   const it1: ExpressionForAdding = { text: 'buongiorno', languageId: it.id };
  //   const fr2: ExpressionForAdding = { text: 'bonne nuit', languageId: fr.id };
  //   const en2: ExpressionForAdding = { text: 'good night', languageId: en.id };
  //   const es2: ExpressionForAdding = { text: 'buenas noches', languageId: es.id };
  //   const de2: ExpressionForAdding = { text: 'gute Natch', languageId: de.id };
  //   const i1 = await addIdea({ ee: [fr1, en1, es1, it1] });
  //   const i2 = await addIdea({ ee: [fr2, en2, es2, de2] });
  //   const sc: SearchContext = {
  //     ideaHas: [fr.id, en.id, es.id, it.id, de.id],
  //     ideaHasOperator: 'and',
  //     ideaDoesNotHave: [],
  //     ideaDoesNotHaveOperator: 'or',
  //   };
  //   const r = await searchAndGetResponse(sc);
  //   const ideas = (await r.json()) as Idea[];
  //   expect(ideas.length).toEqual(1);
  //   expect(ideas[0]).toMatchObject(i1);
  // });
});
