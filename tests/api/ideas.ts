import fetch, { Response } from 'node-fetch';
import { Expression, ExpressionForAdding } from '../../server/model/expression';
import { Language } from '../../server/model/language';
import { Idea, IdeaForAdding, validate } from '../../server/model/idea';
import {
  addIdea,
  deleteEverything, editIdea,
  getIdea, simplyAddIdea,
  simplyAddLanguage,
  simplyGetLanguage,
} from '../utils/utils';

beforeEach(async () => {
  await deleteEverything();
});

async function addValidIdeaAndTest(ideaForAdding: IdeaForAdding,
  expressionsInOrder?: ExpressionForAdding[]): Promise<void> {
  let r = await addIdea(ideaForAdding);
  expect(r.status).toEqual(201);
  const responseIdea = await r.json() as Idea;
  expect(validate(responseIdea)).toEqual(true);

  r = await getIdea(1);
  const fetchedIdea = await r.json() as Idea;
  expect(r.status).toEqual(200);
  expect(validate(fetchedIdea)).toEqual(true);

  for (let i = 0; i < ideaForAdding.ee.length; i += 1) {
    const e: ExpressionForAdding = expressionsInOrder ? expressionsInOrder[i] : ideaForAdding.ee[i];
    const fetchedExpression = fetchedIdea.ee[i];
    expect(fetchedExpression.texts).toEqual(e.texts);
    expect(fetchedExpression.language.id).toEqual(e.languageId);
    // eslint-disable-next-line no-await-in-loop
    const fetchedLanguage = await simplyGetLanguage(fetchedExpression.language.id);
    expect(fetchedLanguage).toEqual(fetchedExpression.language);
  }
}

function makeExpressionForAdding(expressionN: number, howManySpellings: number, languageId: number)
  : ExpressionForAdding {
  const texts = [];
  for (let i = 0; i < howManySpellings; i += 1) {
    texts.push(`e${expressionN} s${i}`);
  }
  return { texts, languageId };
}

describe('adding ideas', () => {
  test('simple test', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const l2: Language = await simplyAddLanguage('language 2');
    const e1: ExpressionForAdding = makeExpressionForAdding(1, 1, l1.id);
    const e2: ExpressionForAdding = makeExpressionForAdding(2, 1, l2.id);
    const ideaForAdding: IdeaForAdding = { ee: [e1, e2] };
    await addValidIdeaAndTest(ideaForAdding);
  });

  test('many languages, expressions and spellings', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const l2: Language = await simplyAddLanguage('language 2');
    const l3: Language = await simplyAddLanguage('language 3');
    const ee: ExpressionForAdding[] = [];
    ee.push(makeExpressionForAdding(1, 3, l1.id));
    ee.push(makeExpressionForAdding(2, 2, l1.id));
    ee.push(makeExpressionForAdding(3, 1, l2.id));
    ee.push(makeExpressionForAdding(4, 2, l2.id));
    ee.push(makeExpressionForAdding(5, 5, l3.id));
    await addValidIdeaAndTest({ ee });
  });

  test('ordering of expressions', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const l2: Language = await simplyAddLanguage('language 2');
    const l3: Language = await simplyAddLanguage('language 3');
    const l4: Language = await simplyAddLanguage('language 4');
    const e4 = makeExpressionForAdding(4, 1, l2.id);
    const e5 = makeExpressionForAdding(5, 2, l2.id);
    const e1 = makeExpressionForAdding(1, 3, l1.id);
    const e2 = makeExpressionForAdding(2, 2, l1.id);
    const e3 = makeExpressionForAdding(3, 2, l1.id);
    const e7 = makeExpressionForAdding(7, 4, l4.id);
    const e6 = makeExpressionForAdding(6, 4, l3.id);
    await addValidIdeaAndTest({ ee: [e4, e5, e1, e2, e3, e7, e6] }, [e1, e2, e3, e4, e5, e6, e7]);
  });
});

describe('editing ideas', () => {
  test('simple test', async () => {
    const l1 = await simplyAddLanguage('language 1');
    const l2 = await simplyAddLanguage('language 2');
    const e1 = makeExpressionForAdding(1, 5, l1.id);
    const e2 = makeExpressionForAdding(2, 3, l2.id);
    const ee = [e1, e2];
    const idea = await simplyAddIdea({ ee });
    e1.texts = ['a new expression'];
    let r = await editIdea(idea);

    expect(r.status).toEqual(200);
    const responseIdea = await r.json() as Idea;
    expect(validate(responseIdea)).toEqual(true);

    r = await getIdea(1);
    const fetchedIdea = await r.json() as Idea;
    expect(r.status).toEqual(200);
    expect(validate(fetchedIdea)).toEqual(true);

    expect(responseIdea.ee[0]).toEqual(e1);
  });
});

// adding errors
// only 1 expression
// only 1 language
// language doesn't exist
// empty expression
// identical spellings
// blank spelling
// deleting a language should delete all ideas that would only be left with one language
// an idea can have only one language. only invalid state is no expressions at all.
