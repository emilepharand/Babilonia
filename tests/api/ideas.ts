import {
  ExpressionForAdding,
  getExpressionForAddingFromExpression
} from '../../server/model/expression';
import { Language } from '../../server/model/language';
import {
  getIdeaForAddingFromIdea,
  Idea,
  IdeaForAdding,
  validate,
} from '../../server/model/idea';
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
    expect(fetchedExpression.text).toEqual(e.text);
    expect(fetchedExpression.language.id).toEqual(e.languageId);
    // eslint-disable-next-line no-await-in-loop
    const fetchedLanguage = await simplyGetLanguage(fetchedExpression.language.id);
    expect(fetchedLanguage).toEqual(fetchedExpression.language);
  }
}

async function editValidIdeaAndTest(idea: Idea, newIdea: IdeaForAdding,
  expressionsInOrder?: ExpressionForAdding[]) {
  let r = await editIdea(newIdea, idea.id);

  expect(r.status).toEqual(200);
  const responseIdea = await r.json() as Idea;
  expect(validate(responseIdea)).toEqual(true);

  r = await getIdea(idea.id);
  const fetchedIdea = await r.json() as Idea;
  expect(r.status).toEqual(200);
  expect(validate(fetchedIdea)).toEqual(true);

  // eslint-disable-next-line no-restricted-syntax
  for (let i = 0; i < responseIdea.ee.length; i += 1) {
    const e: ExpressionForAdding = expressionsInOrder ? expressionsInOrder[i]
      : getExpressionForAddingFromExpression(responseIdea.ee[i]);
    expect(responseIdea.ee[i].text).toEqual(e.text);
    expect(responseIdea.ee[i].language.id).toEqual(e.languageId);
  }
}

describe('adding ideas', () => {
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

    await editValidIdeaAndTest(idea, newIdea, ([newIdea.ee[1], newIdea.ee[3], newIdea.ee[0], newIdea.ee[2]]));
  });
});

// only 1 expression is ok
// only 1 language is ok
// language doesn't exist
// empty expression
// identical spellings
// blank spelling
// an idea can have only one language. only invalid state is no expressions at all.
// POST /ideas IdeaForAdding, PUT /ideas/<id> IdeaForAdding
// put idea instead of ideaforadding
