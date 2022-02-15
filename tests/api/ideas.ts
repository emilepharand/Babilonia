import fetch, { Response } from 'node-fetch';
import { Expression, ExpressionForAdding } from '../../server/model/expression';
import { Language } from '../../server/model/language';
import {
  simplyAddLanguage, simplyGetLanguage,
} from './languages';
import { Idea, IdeaForAdding, validate } from '../../server/model/idea';

function deleteEverything(): Promise<Response> {
  return fetch('http://localhost:5555/everything', { method: 'DELETE' });
}

async function addIdea(obj: unknown): Promise<Response> {
  return fetch('http://localhost:5555/ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  });
}

async function getIdea(id: number): Promise<Response> {
  return fetch(`http://localhost:5555/ideas/${id}`, {
    method: 'GET',
  });
}

async function addValidIdeaAndTest(ideaForAdding: IdeaForAdding,
  expressionsInOrder?: ExpressionForAdding[]) {
  let r = await addIdea(ideaForAdding);
  expect(r.status).toEqual(201);

  r = await getIdea(1);
  expect(r.status).toEqual(200);

  const fetchedIdea: Idea = await r.json() as Idea;
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

describe('adding ideas', () => {
  beforeEach(async () => {
    await deleteEverything();
  });

  test('simple test', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const l2: Language = await simplyAddLanguage('language 2');
    const e1: ExpressionForAdding = {
      texts: ['expression 1'],
      languageId: l1.id,
    };
    const e2: ExpressionForAdding = {
      texts: ['expression 2'],
      languageId: l2.id,
    };
    const ideaForAdding: IdeaForAdding = { ee: [e1, e2] };
    await addValidIdeaAndTest(ideaForAdding);
  });

  test('many languages, expressions and spellings', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const l2: Language = await simplyAddLanguage('language 2');
    const l3: Language = await simplyAddLanguage('language 3');
    const ee: ExpressionForAdding[] = [];
    // language 1
    ee.push({
      texts: ['e1 s1', 'e1 s2', 'e1 s3'],
      languageId: l1.id,
    });
    ee.push({
      texts: ['e2 s1', 'e2 s2'],
      languageId: l1.id,
    });
    // language 2
    ee.push({
      texts: ['e3 s1'],
      languageId: l2.id,
    });
    ee.push({
      texts: ['e4 s1', 'e4 s2'],
      languageId: l2.id,
    });
    // language 3
    ee.push({
      texts: ['e5 s1', 'e5 s2', 'e5 s3', 'e5 s4'],
      languageId: l3.id,
    });
    await addValidIdeaAndTest({ ee });
  });

  test('test ordering of expressions', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const l2: Language = await simplyAddLanguage('language 2');
    const l3: Language = await simplyAddLanguage('language 3');
    const l4: Language = await simplyAddLanguage('language 4');
    const ee: ExpressionForAdding[] = [];
    // language 2
    const e4: ExpressionForAdding = {
      texts: ['e4 s1'],
      languageId: l2.id,
    };
    const e5: ExpressionForAdding = {
      texts: ['e5 s1', 'e5 s2'],
      languageId: l2.id,
    };
    // language 1
    const e1: ExpressionForAdding = {
      texts: ['e1 s1', 'e1 s2', 'e1 s3'],
      languageId: l1.id,
    };
    const e2: ExpressionForAdding = {
      texts: ['e2 s1', 'e2 s2'],
      languageId: l1.id,
    };
    const e3: ExpressionForAdding = {
      texts: ['e3 s1', 'e3 s2'],
      languageId: l1.id,
    };
    // language 4
    const e7: ExpressionForAdding = {
      texts: ['e7 s1', 'e7 s2', 'e7 s3', 'e7 s4'],
      languageId: l4.id,
    };
    // language 3
    const e6: ExpressionForAdding = {
      texts: ['e6 s1', 'e6 s2', 'e6 s3', 'e6 s4'],
      languageId: l3.id,
    };
    await addValidIdeaAndTest({ ee }, [e1, e2, e3, e4, e5, e6, e7]);
  });
});

// adding errors
// only 1 expression
// only 1 language
// language doesn't exist
// empty expression
// is re-ordering working right? if the expressions don't follow language ordering
// identical spellings
// blank spelling
