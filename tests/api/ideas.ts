import fetch from 'node-fetch';
import {
  ExpressionForAdding,
  getExpressionForAddingFromExpression,
} from '../../server/model/ideas/expression';
import { Language } from '../../server/model/languages/language';
import { Idea, validate } from '../../server/model/ideas/idea';
import {
  addIdea,
  deleteEverything,
  deleteIdea,
  editIdea,
  FIRST_IDEA_ID,
  getIdea,
  getLanguage,
  simplyAddIdea,
  simplyAddLanguage,
  simplyGetIdea,
  simplyGetLanguage,
} from '../utils/utils';
import { getIdeaForAddingFromIdea, IdeaForAdding } from '../../server/model/ideas/ideaForAdding';

beforeEach(async () => {
  await deleteEverything();
});

async function addInvalidIdeaAndTest(invalidIdea: any): Promise<void> {
  const r = await addIdea(invalidIdea);
  expect(r.status).toEqual(400);
  expect((await getIdea(FIRST_IDEA_ID)).status).toEqual(404);
}

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
    expect(fetchedExpression.text).toEqual(e.text);
    expect(fetchedExpression.language.id).toEqual(e.languageId);
    // eslint-disable-next-line no-await-in-loop
    const fetchedLanguage = await simplyGetLanguage(fetchedExpression.language.id);
    expect(fetchedLanguage).toEqual(fetchedExpression.language);
  }
}

async function editValidIdeaAndTest(
  idea: Idea,
  newIdea: IdeaForAdding,
  expressionsInOrder?: ExpressionForAdding[],
) {
  let r = await editIdea(newIdea, idea.id);

  expect(r.status).toEqual(200);
  const responseIdea = await r.json() as Idea;
  expect(validate(responseIdea)).toEqual(true);

  r = await getIdea(idea.id);
  const fetchedIdea = await r.json() as Idea;
  expect(r.status).toEqual(200);
  expect(validate(fetchedIdea)).toEqual(true);
  expect(responseIdea.ee.length).toEqual(idea.ee.length);

  for (let i = 0; i < responseIdea.ee.length; i += 1) {
    const e: ExpressionForAdding = expressionsInOrder ? expressionsInOrder[i]
      : getExpressionForAddingFromExpression(responseIdea.ee[i]);
    expect(responseIdea.ee[i].text).toEqual(e.text);
    expect(responseIdea.ee[i].language.id).toEqual(e.languageId);
  }
}

async function editInvalidIdeaAndTest(ideaForAdding: unknown, id: number): Promise<void> {
  const idea1 = await simplyGetIdea(id);
  expect((await editIdea(ideaForAdding, id)).status).toEqual(400);
  const idea2 = await simplyGetIdea(id);
  expect(idea1).toEqual(idea2);
}

describe('getting invalid ideas', () => {
  test('nonexistent idea returns 404', async () => {
    expect((await getIdea(FIRST_IDEA_ID)).status).toEqual(404);
  });

  test('id is not numeric returns 400', async () => {
    const r = await fetch('http://localhost:5555/ideas/123letters', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(r.status).toEqual(400);
  });
});

describe('adding valid ideas', () => {
  test('one expression', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const e1 = { languageId: l1.id, text: 'language 1 expression 1' };
    const ideaForAdding: IdeaForAdding = { ee: [e1] };
    await addValidIdeaAndTest(ideaForAdding);
  });

  test('one language', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const e1 = { languageId: l1.id, text: 'language 1 expression 1' };
    const e2 = { languageId: l1.id, text: 'language 1 expression 2' };
    const ideaForAdding: IdeaForAdding = { ee: [e1, e2] };
    await addValidIdeaAndTest(ideaForAdding);
  });

  test('simple test', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const l2: Language = await simplyAddLanguage('language 2');
    const l3: Language = await simplyAddLanguage('language 3');
    const e1 = { languageId: l1.id, text: 'language 1 expression 1' };
    const e2 = { languageId: l1.id, text: 'language 1 expression 2' };
    const e3 = { languageId: l2.id, text: 'language 2 expression 1' };
    const e4 = { languageId: l3.id, text: 'language 3 expression 1' };
    const e5 = { languageId: l3.id, text: 'language 3 expression 2' };
    const ideaForAdding: IdeaForAdding = { ee: [e1, e2, e3, e4, e5] };
    await addValidIdeaAndTest(ideaForAdding);
  });

  test('ordering of expressions', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const l2: Language = await simplyAddLanguage('language 2');
    const l3: Language = await simplyAddLanguage('language 3');
    const l4: Language = await simplyAddLanguage('language 4');
    const e4 = { languageId: l2.id, text: 'language 2 expression 1' };
    const e5 = { languageId: l2.id, text: 'language 2 expression 2' };
    const e1 = { languageId: l1.id, text: 'language 1 expression 1' };
    const e2 = { languageId: l1.id, text: 'language 1 expression 2' };
    const e3 = { languageId: l1.id, text: 'language 1 expression 3' };
    const e7 = { languageId: l4.id, text: 'language 4 expression 1' };
    const e6 = { languageId: l3.id, text: 'language 3 expression 1' };
    await addValidIdeaAndTest({ ee: [e4, e5, e1, e2, e3, e7, e6] }, [e1, e2, e3, e4, e5, e6, e7]);
  });
});

describe('adding invalid ideas', () => {
  test('language doesn\'t exist', async () => {
    const l1: Language = await simplyAddLanguage('language');
    const e1 = { languageId: (l1.id + 1), text: 'expression' };
    const ideaForAdding: IdeaForAdding = { ee: [e1] };
    await addInvalidIdeaAndTest(ideaForAdding);
  });

  test('no expression', async () => {
    const ideaForAdding: IdeaForAdding = { ee: [] };
    await addInvalidIdeaAndTest(ideaForAdding);
  });

  test('empty expression text', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    await addInvalidIdeaAndTest({ ee: [{ languageId: l1.id, text: '' }] });
    await addInvalidIdeaAndTest({ ee: [{ languageId: l1.id, text: ' ' }] });
    await addInvalidIdeaAndTest({ ee: [{ languageId: l1.id, text: '  ' }] });
    await addInvalidIdeaAndTest({
      ee: [{ languageId: l1.id, text: 'not empty' }, {
        languageId: l1.id, text: '',
      }],
    });
  });

  test('two identical expressions (language + text)', async () => {
    const l1: Language = await simplyAddLanguage('language');
    const e1 = { languageId: l1.id, text: 'duplicate expression' };
    const e2 = { languageId: l1.id, text: 'duplicate expression' };
    const ideaForAdding: IdeaForAdding = { ee: [e1, e2] };
    await addInvalidIdeaAndTest(ideaForAdding);
  });

  test('array', async () => {
    const l1: Language = await simplyAddLanguage('language');
    const e1 = { languageId: l1.id, text: 'expression' };
    const ideaForAdding: IdeaForAdding = { ee: [e1] };
    await addInvalidIdeaAndTest([ideaForAdding]);
  });

  test('idea: invalid shapes', async () => {
    const l1: Language = await simplyAddLanguage('language');
    const e1 = { languageId: l1.id, text: 'expression' };
    // missing properties
    await addInvalidIdeaAndTest({});
    // additional property
    await addInvalidIdeaAndTest({ id: 1, ee: [e1] });
    // property is of an invalid type
    await addInvalidIdeaAndTest({ ee: 'expression' });
  });

  test('expression: invalid shapes', async () => {
    const l1: Language = await simplyAddLanguage('language');
    // additional property
    await addInvalidIdeaAndTest({ ee: [{ id: 1, languageId: l1.id, text: 'expression' }] });
    // missing required properties (languageId)
    await addInvalidIdeaAndTest({ ee: [{ text: 'a' }] });
    // missing required properties (text)
    await addInvalidIdeaAndTest({ ee: [{ languageId: l1.id }] });
    // property is of an invalid type (languageId)
    await addInvalidIdeaAndTest({ ee: [{ languageId: '1', text: 'a' }] });
    // property is of an invalid type (text)
    await addInvalidIdeaAndTest({ ee: [{ languageId: l1.id, text: 256 }] });
  });
});

describe('editing ideas', () => {
  test('simple test', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const l2: Language = await simplyAddLanguage('language 2');
    const e1 = { languageId: l1.id, text: 'language 1 expression 1' };
    const e2 = { languageId: l2.id, text: 'language 1 expression 2' };
    const ee = [e1, e2];
    const idea = await simplyAddIdea({ ee });
    const newIdea = getIdeaForAddingFromIdea(idea);
    newIdea.ee[0].text = 'a new expression';
    newIdea.ee[1].text = 'a new expression';
    await editValidIdeaAndTest(idea, newIdea);
  });

  test('reordering of expressions', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const l2: Language = await simplyAddLanguage('language 2');
    const l3: Language = await simplyAddLanguage('language 3');
    const e1 = { languageId: l1.id, text: 'language 1 expression 1' };
    const e2 = { languageId: l2.id, text: 'language 2 expression 1' };
    const e3 = { languageId: l2.id, text: 'language 2 expression 2' };
    const e4 = { languageId: l3.id, text: 'language 3 expression 1' };
    const idea = await simplyAddIdea({ ee: [e1, e2, e3, e4] });

    const newIdea = getIdeaForAddingFromIdea(idea);
    newIdea.ee[0].languageId = l2.id;
    newIdea.ee[1].languageId = l1.id;
    newIdea.ee[2].languageId = l3.id;
    newIdea.ee[3].languageId = l1.id;

    await editValidIdeaAndTest(idea, newIdea,
      ([newIdea.ee[1], newIdea.ee[3], newIdea.ee[0], newIdea.ee[2]]));
  });
});

describe('editing invalid ideas', () => {
  test('language doesn\'t exist', async () => {
    const l1: Language = await simplyAddLanguage('language');
    const ideaForAdding: IdeaForAdding = { ee: [{ languageId: (l1.id), text: 'expression' }] };
    const idea = await simplyAddIdea(ideaForAdding);
    ideaForAdding.ee[0].languageId = l1.id + 1;
    await editInvalidIdeaAndTest(ideaForAdding, idea.id);
  });

  test('no expression', async () => {
    const l1: Language = await simplyAddLanguage('language');
    const ideaForAdding: IdeaForAdding = { ee: [{ languageId: (l1.id), text: 'expression' }] };
    const idea = await simplyAddIdea(ideaForAdding);
    ideaForAdding.ee = [];
    await editInvalidIdeaAndTest(ideaForAdding, idea.id);
  });

  test('id is not numeric', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const e1 = { languageId: l1.id, text: 'language 1 expression 1' };
    const ee = [e1];
    const idea = await simplyAddIdea({ ee });
    const ideaForAdding = getIdeaForAddingFromIdea(idea);
    const r = await fetch('http://localhost:5555/ideas/123letters', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ideaForAdding),
    });
    expect(r.status).toEqual(400);
  });

  test('empty expression text', async () => {
    const l1: Language = await simplyAddLanguage('language');
    const ideaForAdding: IdeaForAdding = { ee: [{ languageId: (l1.id), text: 'expression' }] };
    const idea = await simplyAddIdea(ideaForAdding);
    ideaForAdding.ee[0].text = '';
    await editInvalidIdeaAndTest(ideaForAdding, idea.id);
    ideaForAdding.ee[0].text = ' ';
    await editInvalidIdeaAndTest(ideaForAdding, idea.id);
    ideaForAdding.ee[0].text = '  ';
    await editInvalidIdeaAndTest(ideaForAdding, idea.id);
    ideaForAdding.ee[0].text = 'not empty';
    ideaForAdding.ee.push({ languageId: l1.id, text: '' });
    await editInvalidIdeaAndTest(ideaForAdding, idea.id);
  });

  test('two identical expressions (language + text)', async () => {
    const l1: Language = await simplyAddLanguage('language');
    const e1 = { languageId: l1.id, text: 'duplicate expression' };
    const e2 = { languageId: l1.id, text: 'not a duplicate expression' };
    const ideaForAdding: IdeaForAdding = { ee: [e1, e2] };
    const idea = await simplyAddIdea(ideaForAdding);
    ideaForAdding.ee[1].text = 'duplicate expression';
    await editInvalidIdeaAndTest(ideaForAdding, idea.id);
  });

  test('array', async () => {
    const l1: Language = await simplyAddLanguage('language');
    const ideaForAdding: IdeaForAdding = { ee: [{ languageId: (l1.id), text: 'expression' }] };
    const idea = await simplyAddIdea(ideaForAdding);
    await editInvalidIdeaAndTest([ideaForAdding], idea.id);
  });

  test('idea: invalid shapes', async () => {
    const l1: Language = await simplyAddLanguage('language');
    const e1 = { languageId: l1.id, text: 'expression' };
    const ideaForAdding: IdeaForAdding = { ee: [{ languageId: (l1.id), text: 'expression' }] };
    const idea = await simplyAddIdea(ideaForAdding);
    // missing properties
    await editInvalidIdeaAndTest({}, idea.id);
    // additional property
    await editInvalidIdeaAndTest({ id: 1, ee: [e1] }, idea.id);
    // property is of an invalid type
    await editInvalidIdeaAndTest({ ee: 'expression' }, idea.id);
  });

  test('expression: invalid shapes', async () => {
    const l1: Language = await simplyAddLanguage('language');
    const e1 = { languageId: l1.id, text: 'expression' };
    const ideaForAdding: IdeaForAdding = { ee: [{ languageId: (l1.id), text: 'expression' }] };
    const idea = await simplyAddIdea(ideaForAdding);
    // additional property
    await editInvalidIdeaAndTest({
      ee: [{
        id: 1, languageId: l1.id, text: 'expression'
      }]
    }, idea.id);
    // missing required properties (languageId)
    await editInvalidIdeaAndTest({ ee: [{ text: 'a' }] }, idea.id);
    // missing required properties (text)
    await editInvalidIdeaAndTest({ ee: [{ languageId: l1.id }] }, idea.id);
    // property is of an invalid type (languageId)
    await editInvalidIdeaAndTest({ ee: [{ languageId: '1', text: 'a' }] }, idea.id);
    // property is of an invalid type (text)
    await editInvalidIdeaAndTest({ ee: [{ languageId: l1.id, text: 256 }] }, idea.id);
  });
});

describe('deleting ideas', () => {
  test('simple test', async () => {
    const l1: Language = await simplyAddLanguage('language 1');
    const l2: Language = await simplyAddLanguage('language 2');
    const e1 = { languageId: l1.id, text: 'language 1 expression 1' };
    const e2 = { languageId: l1.id, text: 'language 1 expression 2' };
    const ideaForAdding: IdeaForAdding = { ee: [e1, e2] };
    const idea = await simplyAddIdea(ideaForAdding);
    expect((await deleteIdea(idea.id)).status).toEqual(200);
    expect((await getIdea(idea.id)).status).toEqual(404);
    expect((await getLanguage(l1.id)).status).toEqual(200);
    expect((await getLanguage(l2.id)).status).toEqual(200);
  });
});

describe('deleting invalid ideas', () => {
  test('deleting nonexisting idea', async () => {
    expect((await deleteIdea(FIRST_IDEA_ID)).status).toEqual(404);
  });

  test('id is not numeric', async () => {
    const r = await fetch('http://localhost:5555/ideas/123letters', {
      method: 'DELETE',
    });
    expect(r.status).toEqual(400);
  });
});
