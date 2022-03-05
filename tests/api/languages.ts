import fetch from 'node-fetch';
import { copy, Language, validate } from '../../server/model/languages/language';
import { ExpressionForAdding } from '../../server/model/ideas/expression';
import {
  addIdeaRawObjectAndGetResponse,
  addLanguage,
  addLanguageAndGetResponse,
  addLanguageRawObjectAndGetResponse,
  DEFAULT_IS_PRACTICE,
  deleteEverything,
  deleteLanguage,
  editLanguagesAndGetResponse,
  editLanguagesRawObjectAndGetResponse,
  fetchIdea,
  fetchLanguage,
  fetchLanguageAndGetResponse,
  fetchLanguages,
  fetchLanguagesAndGetResponse,
  FIRST_LANGUAGE_ID,
  FIRST_ORDERING,
} from '../utils/utils';

beforeEach(async () => {
  await deleteEverything();
});

async function addInvalidLanguageAndTest(object: any): Promise<void> {
  const r = await addLanguageRawObjectAndGetResponse(object);
  expect(r.status).toEqual(400);
  expect((await fetchLanguages()).length).toEqual(0);
}

async function editInvalidLanguagesAndTest(object: any, ...languages: Language[]): Promise<void> {
  expect((await editLanguagesRawObjectAndGetResponse(object)).status).toEqual(400);
  // eslint-disable-next-line no-restricted-syntax
  for (const l of languages) {
    // eslint-disable-next-line no-await-in-loop
    expect(await fetchLanguage(l.id)).toEqual(l);
  }
  expect((await fetchLanguages()).length).toEqual(languages.length);
}

async function addValidLanguageAndTest(
  name: string,
  expectedId: number,
  expectedOrdering: number,
): Promise<void> {
  let r = await addLanguageAndGetResponse(name);
  expect(r.status).toEqual(201);
  const responseLanguage = (await r.json()) as Language;

  expect(validate(responseLanguage)).toEqual(true);
  expect(responseLanguage.id).toEqual(expectedId);
  expect(responseLanguage.name).toEqual(name);
  expect(responseLanguage.isPractice).toEqual(DEFAULT_IS_PRACTICE);
  expect(responseLanguage.ordering).toEqual(expectedOrdering);

  r = await fetchLanguageAndGetResponse(expectedId);
  expect(r.status).toEqual(200);
  const fetchedLanguage = await r.json();
  expect(responseLanguage).toEqual(fetchedLanguage);
}

describe('getting languages', () => {
  test('getting the list of languages', async () => {
    const l1 = await (await addLanguageAndGetResponse('language 1')).json();
    const l2 = await (await addLanguageAndGetResponse('language 2')).json();
    const l3 = await (await addLanguageAndGetResponse('language 3')).json();

    const ll = [l1, l2, l3];
    const r = await fetchLanguagesAndGetResponse();
    expect(r.status).toEqual(200);
    const responseLl = await r.json();

    expect(responseLl).toEqual(ll);
  });

  test('no languages = empty array', async () => {
    const r = await fetchLanguagesAndGetResponse();
    expect(r.status).toEqual(200);
    expect(await r.json()).toEqual([]);
  });

  test('getting nonexistent language returns 404', async () => {
    const r = await fetchLanguageAndGetResponse(1);
    expect(r.status).toEqual(404);
  });
});

describe('getting invalid languages', () => {
  test('id is not numeric', async () => {
    const r = await fetch('http://localhost:5555/languages/123letters', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(r.status).toEqual(400);
  });
});

describe('adding languages', () => {
  test('adding two languages', async () => {
    await addValidLanguageAndTest('first language', FIRST_LANGUAGE_ID, FIRST_ORDERING);
    await addValidLanguageAndTest('second language', FIRST_LANGUAGE_ID + 1, FIRST_ORDERING + 1);
  });
});

describe('adding invalid languages', () => {
  test('name already exists', async () => {
    const name = 'duplicate language name';
    expect((await addLanguageAndGetResponse(name)).status).toEqual(201);
    expect((await addLanguageAndGetResponse(name)).status).toEqual(400);
    expect((await fetchLanguageAndGetResponse(FIRST_LANGUAGE_ID + 1)).status).toEqual(404);
    expect((await fetchLanguages()).length).toEqual(1);
  });

  test('empty or blank string name', async () => {
    expect((await addLanguageAndGetResponse('')).status).toEqual(400);
    expect((await addLanguageAndGetResponse(' ')).status).toEqual(400);
    expect((await addLanguageAndGetResponse('  ')).status).toEqual(400);
    expect((await fetchLanguages()).length).toEqual(0);
  });

  test('array', async () => {
    await addInvalidLanguageAndTest(JSON.stringify([{ name: 'array' }]));
  });

  test('empty object', async () => {
    await addInvalidLanguageAndTest(JSON.stringify({}));
  });

  test('object without name key with other keys', async () => {
    await addInvalidLanguageAndTest(JSON.stringify({ id: 1 }));
  });

  test('object with name key and other possible keys', async () => {
    await addInvalidLanguageAndTest(JSON.stringify({ id: 1, name: 'a language' }));
  });

  test('object with name key and other impossible keys', async () => {
    await addInvalidLanguageAndTest(JSON.stringify({ name: 'a language', plus: 'something' }));
  });

  test('name is a number', async () => {
    await addInvalidLanguageAndTest(JSON.stringify({ name: 1 }));
  });

  test('wrong JSON format', async () => {
    await addInvalidLanguageAndTest('<');
  });
});

async function editAndTest(
  newLanguage1: Language,
  newLanguage2: Language,
  changes: boolean,
): Promise<void> {
  const oldLanguage1 = await fetchLanguage(newLanguage1.id);
  const oldLanguage2 = await fetchLanguage(newLanguage2.id);

  const ll: Language[] = [newLanguage1, newLanguage2];
  let r = await editLanguagesAndGetResponse(ll);
  expect(r.status).toEqual(200);

  const [responseLanguage1, responseLanguage2] = (await r.json()) as Language[];

  r = await fetchLanguageAndGetResponse(newLanguage1.id);
  expect(r.status).toEqual(200);
  const fetchedLanguage1 = await r.json();

  r = await fetchLanguageAndGetResponse(newLanguage2.id);
  expect(r.status).toEqual(200);
  const fetchedLanguage2 = await r.json();

  // validate response language
  expect(validate(responseLanguage1)).toEqual(true);
  expect(validate(responseLanguage2)).toEqual(true);
  expect(responseLanguage1).toEqual(fetchedLanguage1);
  expect(responseLanguage2).toEqual(fetchedLanguage2);

  if (changes) {
    // sanity checks
    expect(oldLanguage1).not.toEqual(newLanguage1);
    expect(oldLanguage2).not.toEqual(newLanguage2);
    // check values have changed
    expect(fetchedLanguage1).toEqual(newLanguage1);
    expect(fetchedLanguage2).toEqual(newLanguage2);
  } else {
    // sanity checks
    expect(oldLanguage1).toEqual(newLanguage1);
    expect(oldLanguage2).toEqual(newLanguage2);
    // check values have not changed
    expect(fetchedLanguage1).toEqual(oldLanguage1);
    expect(fetchedLanguage2).toEqual(oldLanguage2);
  }
}

describe('editing languages', () => {
  test('editing languages with no changes', async () => {
    const oldLanguage1 = await addLanguage('old language 1');
    const oldLanguage2 = await addLanguage('old language 2');

    await editAndTest(oldLanguage1, oldLanguage2, false);
  });

  test('editing languages with changes', async () => {
    const oldLanguage1 = await addLanguage('old language 1');
    const oldLanguage2 = await addLanguage('old language 2');

    const newLanguage1 = copy(oldLanguage1);
    const newLanguage2 = copy(oldLanguage2);

    // name
    newLanguage1.name = 'edited language 1';
    newLanguage2.name = 'edited language 2';
    expect(newLanguage1.name).not.toEqual(oldLanguage1.name);
    expect(newLanguage2.name).not.toEqual(oldLanguage2.name);

    // isPractice
    newLanguage1.isPractice = !oldLanguage1.isPractice;
    newLanguage2.isPractice = !oldLanguage2.isPractice;
    expect(newLanguage1.isPractice).not.toEqual(oldLanguage1.isPractice);
    expect(newLanguage2.isPractice).not.toEqual(oldLanguage2.isPractice);

    // ordering
    newLanguage1.ordering = 1;
    newLanguage2.ordering = 0;
    expect(newLanguage1.ordering).not.toEqual(oldLanguage1.ordering);
    expect(newLanguage2.ordering).not.toEqual(oldLanguage2.ordering);

    await editAndTest(newLanguage1, newLanguage2, true);
  });

  test('empty array when database is empty', async () => {
    await expect((await editLanguagesAndGetResponse([])).status).toEqual(200);
  });
});

describe('editing invalid languages', () => {
  test('empty or blank name', async () => {
    const oldLanguage1 = (await (
      await addLanguageAndGetResponse('old language 1')
    ).json()) as Language;
    const newLanguage1 = copy(oldLanguage1);
    newLanguage1.name = '';
    await editInvalidLanguagesAndTest(JSON.stringify([newLanguage1]), oldLanguage1);
    newLanguage1.name = ' ';
    await editInvalidLanguagesAndTest(JSON.stringify([newLanguage1]), oldLanguage1);
    newLanguage1.name = '  ';
    await editInvalidLanguagesAndTest(JSON.stringify([newLanguage1]), oldLanguage1);
  });

  test('duplicate names', async () => {
    const language1 = (await (
      await addLanguageAndGetResponse('duplicate language name')
    ).json()) as Language;
    const language2 = (await (
      await addLanguageAndGetResponse('duplicate language name 2')
    ).json()) as Language;
    const newLanguage2 = copy(language2);
    newLanguage2.name = 'duplicate language name';
    expect((await editLanguagesAndGetResponse([language1, newLanguage2])).status).toEqual(400);
    expect(await fetchLanguage(language1.id)).toEqual(language1);
    expect(await fetchLanguage(language2.id)).toEqual(language2);
  });

  test('empty array when database is not empty', async () => {
    const language = (await (await addLanguageAndGetResponse('language')).json()) as Language;
    await editInvalidLanguagesAndTest(JSON.stringify([]), language);
  });

  test('array with empty object', async () => {
    const language = (await (await addLanguageAndGetResponse('language')).json()) as Language;
    await editInvalidLanguagesAndTest(JSON.stringify([{}]), language);
  });

  test('language instead of array', async () => {
    const l1 = (await (await addLanguageAndGetResponse('a language')).json()) as Language;
    const l2 = copy(l1);
    await editInvalidLanguagesAndTest(JSON.stringify(l2), l1);
  });

  test('missing keys', async () => {
    const l1 = (await (await addLanguageAndGetResponse('a language')).json()) as Language;
    await editInvalidLanguagesAndTest(JSON.stringify([{ id: l1.id, name: 'a new language' }]), l1);
  });

  test('missing id key', async () => {
    const l1 = (await (await addLanguageAndGetResponse('a language')).json()) as Language;
    await editInvalidLanguagesAndTest(JSON.stringify([{ name: 'a new language' }]), l1);
  });

  test('object with additional keys', async () => {
    const l1 = (await (await addLanguageAndGetResponse('a language')).json()) as Language;
    await editInvalidLanguagesAndTest(JSON.stringify([{ ...l1, plus: 'something' }]), l1);
  });

  test("doesn't include all languages", async () => {
    const oldLanguage1 = (await (
      await addLanguageAndGetResponse('old language 1')
    ).json()) as Language;
    const oldLanguage2 = (await (
      await addLanguageAndGetResponse('old language 2')
    ).json()) as Language;
    const newLanguage1 = copy(oldLanguage1);
    newLanguage1.name = 'a new language';
    await editInvalidLanguagesAndTest(JSON.stringify([newLanguage1]), oldLanguage1, oldLanguage2);
  });

  test('includes nonexisting languages', async () => {
    const oldLanguage1 = (await (
      await addLanguageAndGetResponse('old language 1')
    ).json()) as Language;
    const oldLanguage2 = (await (
      await addLanguageAndGetResponse('old language 2')
    ).json()) as Language;
    await deleteLanguage(oldLanguage2.id);
    await editInvalidLanguagesAndTest(JSON.stringify([oldLanguage1, oldLanguage2]), oldLanguage1);
  });

  test('includes duplicate ids', async () => {
    const oldLanguage1 = (await (
      await addLanguageAndGetResponse('old language 1')
    ).json()) as Language;
    const oldLanguage2 = copy(oldLanguage1);
    oldLanguage2.name = 'old language 2';
    oldLanguage2.ordering = FIRST_ORDERING + 1;
    await editInvalidLanguagesAndTest(JSON.stringify([oldLanguage1, oldLanguage2]), oldLanguage1);
  });

  test('ordering has duplicates', async () => {
    const oldLanguage1 = (await (
      await addLanguageAndGetResponse('old language 1')
    ).json()) as Language;
    const oldLanguage2 = (await (
      await addLanguageAndGetResponse('old language 2')
    ).json()) as Language;
    const newLanguage2 = copy(oldLanguage2);
    newLanguage2.ordering = oldLanguage1.ordering;
    await editInvalidLanguagesAndTest(
      JSON.stringify([oldLanguage1, newLanguage2]),
      oldLanguage1,
      oldLanguage2,
    );
  });

  test("ordering doesn't start at 0", async () => {
    const oldLanguage1 = (await (
      await addLanguageAndGetResponse('old language 1')
    ).json()) as Language;
    const oldLanguage2 = (await (
      await addLanguageAndGetResponse('old language 2')
    ).json()) as Language;
    const newLanguage1 = copy(oldLanguage1);
    const newLanguage2 = copy(oldLanguage2);
    newLanguage1.ordering = FIRST_ORDERING + 1;
    newLanguage2.ordering = FIRST_ORDERING + 2;
    await editInvalidLanguagesAndTest(
      JSON.stringify([newLanguage1, newLanguage2]),
      oldLanguage1,
      oldLanguage2,
    );
  });

  test('ordering has a gap', async () => {
    const oldLanguage1 = (await (
      await addLanguageAndGetResponse('old language 1')
    ).json()) as Language;
    const oldLanguage2 = (await (
      await addLanguageAndGetResponse('old language 2')
    ).json()) as Language;
    const newLanguage2 = copy(oldLanguage2);
    newLanguage2.ordering = FIRST_ORDERING + 2;
    await editInvalidLanguagesAndTest(
      JSON.stringify([oldLanguage1, newLanguage2]),
      oldLanguage1,
      oldLanguage2,
    );
  });

  test('name is a number', async () => {
    const oldLanguage = (await (
      await addLanguageAndGetResponse('old language 1')
    ).json()) as Language;
    const newLanguage = copy(oldLanguage) as any;
    newLanguage.name = 256;
    await editInvalidLanguagesAndTest(JSON.stringify([newLanguage]), oldLanguage);
  });

  test('isPractice is a string', async () => {
    const oldLanguage = (await (
      await addLanguageAndGetResponse('old language 1')
    ).json()) as Language;
    const newLanguage = copy(oldLanguage) as any;
    newLanguage.isPractice = 'false';
    await editInvalidLanguagesAndTest(JSON.stringify([newLanguage]), oldLanguage);
  });

  test('invalid JSON', async () => {
    const oldLanguage = (await (
      await addLanguageAndGetResponse('old language')
    ).json()) as Language;
    await editInvalidLanguagesAndTest('?', oldLanguage);
  });
});

async function testLanguageOrder(ids: number[]) {
  for (let i = 0; i < ids.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    expect((await fetchLanguage(ids[i])).ordering).toEqual(FIRST_ORDERING + i);
  }
}

async function addNLanguages(n: number) {
  for (let i = 0; i < n; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    expect((await addLanguageAndGetResponse(`language ${i}`)).status).toEqual(201);
  }
}

describe('deleting languages', () => {
  test('deleting a language', async () => {
    expect((await fetchLanguageAndGetResponse(FIRST_LANGUAGE_ID)).status).toEqual(404);
    expect((await addLanguageAndGetResponse('a language')).status).toEqual(201);
    expect((await fetchLanguageAndGetResponse(FIRST_LANGUAGE_ID)).status).not.toEqual(404);
    expect((await deleteLanguage(FIRST_LANGUAGE_ID)).status).toEqual(200);
    expect((await fetchLanguageAndGetResponse(FIRST_LANGUAGE_ID)).status).toEqual(404);
  });

  test('deleting a language reorders languages: first', async () => {
    await addNLanguages(5);
    await testLanguageOrder([1, 2, 3, 4, 5]);
    await deleteLanguage(1);
    await testLanguageOrder([2, 3, 4, 5]);
  });

  test('deleting a language reorders languages: middle', async () => {
    await addNLanguages(5);
    await testLanguageOrder([1, 2, 3, 4, 5]);
    await deleteLanguage(3);
    await testLanguageOrder([1, 2, 4, 5]);
  });

  test('deleting a language reorders languages: last', async () => {
    await addNLanguages(5);
    await testLanguageOrder([1, 2, 3, 4, 5]);
    await deleteLanguage(5);
    await testLanguageOrder([1, 2, 3, 4]);
  });

  test('deleting should delete all expressions of that language', async () => {
    const l1: Language = await addLanguage('language 1');
    const l2: Language = await addLanguage('language 2');
    const l3: Language = await addLanguage('language 3');

    const e1: ExpressionForAdding = { text: 'e1', languageId: l1.id };
    const e2: ExpressionForAdding = { text: 'e2', languageId: l2.id };
    const e3: ExpressionForAdding = { text: 'e3', languageId: l3.id };
    const e4: ExpressionForAdding = { text: 'e4', languageId: l3.id };
    await addIdeaRawObjectAndGetResponse(JSON.stringify({ ee: [e1, e2, e3, e4] }));

    const e5: ExpressionForAdding = { text: 'e5', languageId: l1.id };
    const e6: ExpressionForAdding = { text: 'e6', languageId: l2.id };
    const e7: ExpressionForAdding = { text: 'e7', languageId: l2.id };
    const e8: ExpressionForAdding = { text: 'e8', languageId: l3.id };
    await addIdeaRawObjectAndGetResponse(JSON.stringify({ ee: [e5, e6, e7, e8] }));

    await deleteLanguage(l3.id);

    const idea1 = await fetchIdea(1);
    expect(idea1.ee.length).toEqual(2);
    expect(idea1.ee[0].text).toEqual(e1.text);
    expect(idea1.ee[1].text).toEqual(e2.text);
    const idea2 = await fetchIdea(2);
    expect(idea2.ee.length).toEqual(3);
    expect(idea2.ee[0].text).toEqual(e5.text);
    expect(idea2.ee[1].text).toEqual(e6.text);
    expect(idea2.ee[2].text).toEqual(e7.text);
  });
});

describe('deleting invalid languages', () => {
  test('deleting a nonexisting language', async () => {
    expect((await addLanguageAndGetResponse('a language')).status).toEqual(201);
    expect((await deleteLanguage(FIRST_LANGUAGE_ID + 1)).status).toEqual(404);
    expect((await fetchLanguageAndGetResponse(FIRST_LANGUAGE_ID)).status).toEqual(200);
  });

  test('id is not numeric', async () => {
    expect((await addLanguageAndGetResponse('a language')).status).toEqual(201);
    const r = await fetch('http://localhost:5555/languages/123letters', {
      method: 'DELETE',
    });
    expect(r.status).toEqual(400);
    expect((await fetchLanguageAndGetResponse(FIRST_LANGUAGE_ID)).status).toEqual(200);
  });
});
