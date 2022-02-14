import fetch, { Response } from 'node-fetch';
import { Expression, ExpressionForAdding } from '../../server/model/expression';
import { Language } from '../../server/model/language';
import { addLanguage, simplyAddLanguage } from './languages';
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

describe('adding ideas', () => {
  beforeEach(async () => {
    await deleteEverything();
  });

  test('1 idea, 2 expressions, 1 text each', async () => {
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
    const i: IdeaForAdding = { ee: [e1, e2] };
    let r = await addIdea(i);
    expect(r.status).toEqual(201);

    r = await getIdea(1);
    expect(r.status).toEqual(200);

    const fetchedIdea: Idea = await r.json() as Idea;
    const fetchedExpression1 = fetchedIdea.ee[0];
    const fetchedExpression2 = fetchedIdea.ee[1];

    expect(fetchedExpression1.texts).toEqual(e1.texts);
    expect(fetchedExpression1.language.id).toEqual(e1.languageId);
    expect(fetchedExpression2.texts).toEqual(e2.texts);
    expect(fetchedExpression2.language.id).toEqual(e2.languageId);

    if (!validate(fetchedIdea)) {
      console.log(validate.errors);
    }
    expect(validate(fetchedIdea)).toEqual(true);
  });
});

// adding errors
// only 1 expression
// only 1 language
// language doesn't exist
// empty expression
