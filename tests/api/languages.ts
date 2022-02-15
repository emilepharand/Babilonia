import fetch, { Response } from 'node-fetch';
import {
  copy,
  Language,
  validate,
} from '../../server/model/language';

function deleteEverything(): Promise<Response> {
  return fetch('http://localhost:5555/everything', { method: 'DELETE' });
}

export async function addLanguage(name: string): Promise<Response> {
  return fetch('http://localhost:5555/languages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

export async function simplyAddLanguage(name: string): Promise<Language> {
  return await (await fetch('http://localhost:5555/languages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })).json() as Language;
}

async function editLanguages(newLanguages: Language[]): Promise<Response> {
  return fetch('http://localhost:5555/languages', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLanguages),
  });
}

export async function getLanguage(id: number): Promise<Response> {
  return fetch(`http://localhost:5555/languages/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function simplyGetLanguage(id: number): Promise<Language> {
  return await (await getLanguage(id)).json() as Language;
}

async function getLanguages(): Promise<Response> {
  return fetch('http://localhost:5555/languages', {
    method: 'GET',
  });
}

async function deleteLanguage(id: number): Promise<Response> {
  return fetch(`http://localhost:5555/languages/${id}`, {
    method: 'DELETE',
  });
}

describe('adding languages', () => {
  beforeAll(async () => {
    await deleteEverything();
  });

  test('adding first language', async () => {
    const languageName = 'a first language';
    let r = await addLanguage(languageName);
    expect(r.status).toEqual(201);
    const responseLanguage = await r.json() as Language;

    expect(validate(responseLanguage)).toEqual(true);
    // id starts at 1
    expect(responseLanguage.id).toEqual(1);
    expect(responseLanguage.name).toEqual(languageName);
    // false is the default
    expect(responseLanguage.isPractice).toEqual(false);
    // ordering starts at 0
    expect(responseLanguage.ordering).toEqual(0);

    r = await getLanguage(1);
    expect(r.status).toEqual(200);
    const fetchedLanguage = await r.json();
    expect(responseLanguage).toEqual(fetchedLanguage);
  });

  test('adding second language', async () => {
    const languageName = 'a second language';
    let r = await addLanguage(languageName);
    expect(r.status).toEqual(201);
    const responseLanguage = await r.json() as Language;

    expect(validate(responseLanguage)).toEqual(true);

    expect(responseLanguage.id).toEqual(2);
    expect(responseLanguage.name).toEqual(languageName);
    expect(responseLanguage.isPractice).toEqual(false);
    expect(responseLanguage.ordering).toEqual(1);

    r = await getLanguage(2);
    const fetchedLanguage = await r.json();
    expect(r.status).toEqual(200);
    expect(responseLanguage).toEqual(fetchedLanguage);
  });
});

describe('adding invalid languages', () => {
  beforeEach(async () => {
    await deleteEverything();
  });

  test('array', async () => {
    let r = await fetch('http://localhost:5555/languages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ name: 'test' }]),
    });
    expect(r.status).toEqual(400);
    // id starts at 1, make sure no language was created
    r = await getLanguage(1);
    expect(r.status).toEqual(404);
  });

  test('name already exists', async () => {
    const name = 'a duplicate language';
    expect((await addLanguage(name)).status).toEqual(201);
    expect((await addLanguage(name)).status).toEqual(400);
    expect((await getLanguage(2)).status).toEqual(404);
  });

  test('empty or blank string name', async () => {
    const cc = ['', ' ', '\t', '\n', '\f', '\r'];
    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    for (const c1 of cc) {
      // eslint-disable-next-line no-restricted-syntax
      for (const c2 of cc) {
        // eslint-disable-next-line no-await-in-loop
        expect((await addLanguage(c1 + c2)).status).toEqual(400);
      }
    }
    // id starts at 1, make sure no language was created
    expect((await getLanguage(1)).status).toEqual(404);
  });

  test('empty object', async () => {
    let r = await fetch('http://localhost:5555/languages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(r.status).toEqual(400);
    // id starts at 1, make sure no language was created
    r = await getLanguage(1);
    expect(r.status).toEqual(404);
  });

  test('object without name key with other keys', async () => {
    let r = await fetch('http://localhost:5555/languages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1 }),
    });
    expect(r.status).toEqual(400);
    // id starts at 1, make sure no language was created
    r = await getLanguage(1);
    expect(r.status).toEqual(404);
  });

  test('object with name key and other possible keys', async () => {
    let r = await fetch('http://localhost:5555/languages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        name: 'a language',
      }),
    });
    expect(r.status).toEqual(400);
    // id starts at 1, make sure no language was created
    r = await getLanguage(1);
    expect(r.status).toEqual(404);
  });

  test('object with name key and other impossible keys', async () => {
    let r = await fetch('http://localhost:5555/languages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'a language',
        plus: 'something',
      }),
    });
    expect(r.status).toEqual(400);
    // id starts at 1, make sure no language was created
    r = await getLanguage(1);
    expect(r.status).toEqual(404);
  });

  test('name is a number', async () => {
    let r = await fetch('http://localhost:5555/languages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 1 }),
    });
    expect(r.status).toEqual(400);
    // id starts at 1, make sure no language was created
    r = await getLanguage(1);
    expect(r.status).toEqual(404);
  });

  test('invalid JSON', async () => {
    let r = await fetch('http://localhost:5555/languages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '<',
    });
    expect(r.status).toEqual(400);
    // id starts at 1, make sure no language was created
    r = await getLanguage(1);
    expect(r.status).toEqual(404);
  });

  test('wrong headers', async () => {
    let r = await fetch('http://localhost:5555/languages', {
      method: 'POST',
      body: JSON.stringify({ name: 'a language' }),
    });
    expect(r.status).toEqual(400);
    // id starts at 1, make sure no language was created
    r = await getLanguage(1);
    expect(r.status).toEqual(404);
  });
});

describe('editing languages', () => {
  beforeEach(async () => {
    await deleteEverything();
  });

  test('editing languages with changes', async () => {
    let r = await addLanguage('old language 1');
    expect(r.status).toEqual(201);
    const oldLanguage1 = await r.json() as Language;
    r = await addLanguage('old language 2');
    expect(r.status).toEqual(201);
    const oldLanguage2 = await r.json() as Language;
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

    const ll: Language[] = [newLanguage1, newLanguage2];
    r = await editLanguages(ll);
    expect(r.status).toEqual(200);
    const [responseLanguage1, responseLanguage2] = await r.json() as Language[];
    r = await getLanguage(oldLanguage1.id);
    expect(r.status).toEqual(200);
    const fetchedLanguage1 = await r.json();
    r = await getLanguage(oldLanguage2.id);
    expect(r.status).toEqual(200);
    const fetchedLanguage2 = await r.json();

    // validity and equality
    expect(validate(responseLanguage1)).toEqual(true);
    expect(validate(responseLanguage2)).toEqual(true);
    expect(responseLanguage1).toEqual(fetchedLanguage1);
    expect(responseLanguage2).toEqual(fetchedLanguage2);

    // check values have changed
    expect(fetchedLanguage1).toEqual(newLanguage1);
    expect(fetchedLanguage2).toEqual(newLanguage2);
  });

  test('editing languages with no changes', async () => {
    let r = await addLanguage('old language 1');
    expect(r.status).toEqual(201);
    const oldLanguage1 = await r.json() as Language;
    r = await addLanguage('old language 2');
    expect(r.status).toEqual(201);
    const oldLanguage2 = await r.json() as Language;

    const ll: Language[] = [oldLanguage1, oldLanguage2];
    r = await editLanguages(ll);
    expect(r.status).toEqual(200);
    const [responseLanguage1, responseLanguage2] = await r.json() as Language[];
    r = await getLanguage(oldLanguage1.id);
    const fetchedLanguage1 = await r.json();
    expect(r.status).toEqual(200);
    r = await getLanguage(oldLanguage2.id);
    expect(r.status).toEqual(200);
    const fetchedLanguage2 = await r.json();

    // validity and equality
    expect(validate(responseLanguage1)).toEqual(true);
    expect(validate(responseLanguage2)).toEqual(true);
    expect(responseLanguage1).toEqual(fetchedLanguage1);
    expect(responseLanguage2).toEqual(fetchedLanguage2);

    // check values have not changed
    expect(fetchedLanguage1).toEqual(oldLanguage1);
    expect(fetchedLanguage2).toEqual(oldLanguage2);
  });
});

describe('editing invalid languages', () => {
  beforeEach(async () => {
    await deleteEverything();
  });

  test('empty or blank name', async () => {
    const oldLanguage1 = await (await addLanguage('old language 1')).json() as Language;
    const newLanguage1 = copy(oldLanguage1);
    const cc = ['', ' ', '\t', '\n', '\f', '\r'];
    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    for (const c1 of cc) {
      // eslint-disable-next-line no-restricted-syntax
      for (const c2 of cc) {
        newLanguage1.name = c1 + c2;
        // eslint-disable-next-line no-await-in-loop
        expect((await editLanguages([newLanguage1])).status).toEqual(400);
      }
    }
    // id starts at 1, make sure no language was created
    expect(await (await getLanguage(1)).json()).toEqual(oldLanguage1);
  });

  test('duplicate names', async () => {
    const oldLanguage1 = await (await addLanguage('language 1')).json() as Language;
    const oldLanguage2 = await (await addLanguage('language 2')).json() as Language;
    const newLanguage1 = copy(oldLanguage1);
    const newLanguage2 = copy(oldLanguage2);
    newLanguage2.name = newLanguage1.name;
    const r = await editLanguages([newLanguage1, newLanguage2]);
    expect(r.status).toEqual(400);
    const responseLanguage1 = await (await getLanguage(1)).json() as Language;
    const responseLanguage2 = await (await getLanguage(2)).json() as Language;
    expect(responseLanguage1).toEqual(oldLanguage1);
    expect(responseLanguage2).toEqual(oldLanguage2);
  });

  test('empty array', async () => {
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(([])),
    });
    expect(r.status).toEqual(400);
  });

  test('empty object', async () => {
    const l1 = await (await addLanguage('a language')).json() as Language;
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(([{}])),
    });
    expect(r.status).toEqual(400);
    const l2 = await (await getLanguage(l1.id)).json();
    expect(l2).toEqual(l1);
  });

  test('language instead of array', async () => {
    const l1 = await (await addLanguage('a language')).json() as Language;
    const l2 = copy(l1);
    l2.name = 'a new language';
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(l2),
    });
    expect(r.status).toEqual(400);
    const l3 = await (await getLanguage(l1.id)).json();
    expect(l3).toEqual(l1);
  });

  test('missing keys', async () => {
    const l = await (await addLanguage('a language')).json() as Language;
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        id: l.id,
        name: 'a new language',
      }]),
    });
    expect(r.status).toEqual(400);
    const l2 = await (await getLanguage(l.id)).json();
    expect(l2).toEqual(l);
  });

  test('object with additional keys', async () => {
    const l1 = await (await addLanguage('a language')).json() as Language;
    const l2 = copy(l1);
    l2.name = 'a new language';
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        ...l2,
        plus: 'something',
      }]),
    });
    expect(r.status).toEqual(400);
    const l3 = await (await getLanguage(l1.id)).json();
    expect(l3).toEqual(l1);
  });

  test('doesn\'t include all languages', async () => {
    const oldLanguage1 = await (await addLanguage('old language 1')).json() as Language;
    const oldLanguage2 = await (await addLanguage('old language 2')).json() as Language;
    const newLanguage1 = copy(oldLanguage1);
    newLanguage1.name = 'a new language';
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([newLanguage1]),
    });
    expect(r.status).toEqual(400);
    const fetchedLanguage1 = await (await getLanguage(oldLanguage1.id)).json();
    const fetchedLanguage2 = await (await getLanguage(oldLanguage2.id)).json();
    expect(fetchedLanguage1).toEqual(oldLanguage1);
    expect(fetchedLanguage2).toEqual(oldLanguage2);
  });

  test('includes nonexisting languages', async () => {
    const oldLanguage1 = await (await addLanguage('old language 1')).json() as Language;
    const oldLanguage2 = await (await addLanguage('old language 2')).json() as Language;
    const newLanguage1 = copy(oldLanguage1);
    const newLanguage2 = copy(oldLanguage2);
    newLanguage1.name = 'a new language';
    newLanguage2.id = 3;
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([newLanguage1, newLanguage2]),
    });
    expect(r.status).toEqual(400);
    const fetchedLanguage1 = await (await getLanguage(oldLanguage1.id)).json();
    const fetchedLanguage2 = await (await getLanguage(oldLanguage2.id)).json();
    expect(fetchedLanguage1).toEqual(oldLanguage1);
    expect(fetchedLanguage2).toEqual(oldLanguage2);
  });

  test('includes duplicate ids', async () => {
    const oldLanguage1 = await (await addLanguage('old language 1')).json() as Language;
    const oldLanguage2 = await (await addLanguage('old language 2')).json() as Language;
    const newLanguage1 = copy(oldLanguage1);
    newLanguage1.name = 'a new language';
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([newLanguage1, newLanguage1]),
    });
    expect(r.status).toEqual(400);
    const fetchedLanguage1 = await (await getLanguage(oldLanguage1.id)).json();
    const fetchedLanguage2 = await (await getLanguage(oldLanguage2.id)).json();
    expect(fetchedLanguage1).toEqual(oldLanguage1);
    expect(fetchedLanguage2).toEqual(oldLanguage2);
  });

  test('ordering has duplicates', async () => {
    const oldLanguage1 = await (await addLanguage('old language 1')).json() as Language;
    const oldLanguage2 = await (await addLanguage('old language 2')).json() as Language;
    const newLanguage1 = copy(oldLanguage1);
    const newLanguage2 = copy(oldLanguage2);
    newLanguage2.ordering = 0;
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([newLanguage1, newLanguage2]),
    });
    expect(r.status).toEqual(400);
    const fetchedLanguage1 = await (await getLanguage(oldLanguage1.id)).json();
    const fetchedLanguage2 = await (await getLanguage(oldLanguage2.id)).json();
    expect(fetchedLanguage1).toEqual(oldLanguage1);
    expect(fetchedLanguage2).toEqual(oldLanguage2);
  });

  test('ordering doesn\'t start at 0', async () => {
    const oldLanguage1 = await (await addLanguage('old language 1')).json() as Language;
    const oldLanguage2 = await (await addLanguage('old language 2')).json() as Language;
    const newLanguage1 = copy(oldLanguage1);
    const newLanguage2 = copy(oldLanguage2);
    newLanguage1.ordering = 1;
    newLanguage2.ordering = 2;
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([newLanguage1, newLanguage2]),
    });
    expect(r.status).toEqual(400);
    const fetchedLanguage1 = await (await getLanguage(oldLanguage1.id)).json();
    const fetchedLanguage2 = await (await getLanguage(oldLanguage2.id)).json();
    expect(fetchedLanguage1).toEqual(oldLanguage1);
    expect(fetchedLanguage2).toEqual(oldLanguage2);
  });

  test('ordering has a gap', async () => {
    const oldLanguage1 = await (await addLanguage('old language 1')).json() as Language;
    const oldLanguage2 = await (await addLanguage('old language 2')).json() as Language;
    const newLanguage1 = copy(oldLanguage1);
    const newLanguage2 = copy(oldLanguage2);
    newLanguage1.ordering = 0;
    newLanguage2.ordering = 2;
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([newLanguage1, newLanguage2]),
    });
    expect(r.status).toEqual(400);
    const fetchedLanguage1 = await (await getLanguage(oldLanguage1.id)).json();
    const fetchedLanguage2 = await (await getLanguage(oldLanguage2.id)).json();
    expect(fetchedLanguage1).toEqual(oldLanguage1);
    expect(fetchedLanguage2).toEqual(oldLanguage2);
  });

  test('name is a number', async () => {
    const l1 = await (await addLanguage('a language')).json() as Language;
    const l2 = copy(l1) as any;
    l2.name = 256;
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([l2]),
    });
    expect(r.status).toEqual(400);
    const l3 = await (await getLanguage(l1.id)).json();
    expect(l3).toEqual(l1);
  });

  test('isPractice is a string', async () => {
    const l1 = await (await addLanguage('a language')).json() as Language;
    const l2 = copy(l1) as any;
    l2.isPractice = '0';
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([l2]),
    });
    expect(r.status).toEqual(400);
    const l3 = await (await getLanguage(l1.id)).json();
    expect(l3).toEqual(l1);
  });

  test('invalid JSON', async () => {
    const l1 = await (await addLanguage('a language')).json() as Language;
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '?',
    });
    expect(r.status).toEqual(400);
    const l2 = await (await getLanguage(l1.id)).json();
    expect(l2).toEqual(l1);
  });

  test('wrong headers', async () => {
    const l1 = await (await addLanguage('a language')).json() as Language;
    const r = await fetch('http://localhost:5555/languages', {
      method: 'PUT',
      body: JSON.stringify(l1),
    });
    expect(r.status).toEqual(400);
    const l2 = await (await getLanguage(l1.id)).json();
    expect(l2).toEqual(l1);
  });
});

describe('deleting languages', () => {
  beforeEach(async () => {
    await deleteEverything();
  });

  test('deleting a language', async () => {
    // language doesn't exist
    expect((await getLanguage(1)).status).toEqual(404);
    expect((await addLanguage('a language')).status).toEqual(201);
    // language exists
    expect((await getLanguage(1)).status).not.toEqual(404);
    expect((await deleteLanguage(1)).status).toEqual(200);
    // language doesn't exist
    expect((await getLanguage(1)).status).toEqual(404);
  });

  test('deleting a language shouuld reorder languages correctly', async () => {
    expect((await addLanguage('language 1')).status).toEqual(201);
    expect((await addLanguage('language 2')).status).toEqual(201);
    expect((await addLanguage('language 3')).status).toEqual(201);
    expect((await addLanguage('language 4')).status).toEqual(201);
    expect((await addLanguage('language 5')).status).toEqual(201);

    expect((await simplyGetLanguage(1)).ordering).toEqual(0);
    expect((await simplyGetLanguage(2)).ordering).toEqual(1);
    expect((await simplyGetLanguage(3)).ordering).toEqual(2);
    expect((await simplyGetLanguage(4)).ordering).toEqual(3);
    expect((await simplyGetLanguage(5)).ordering).toEqual(4);

    await deleteLanguage(3);

    expect((await simplyGetLanguage(1)).ordering).toEqual(0);
    expect((await simplyGetLanguage(2)).ordering).toEqual(1);
    expect((await simplyGetLanguage(4)).ordering).toEqual(2);
    expect((await simplyGetLanguage(5)).ordering).toEqual(3);
  });

  // deleting should delete all expressions of that language
});

describe('deleting invalid languages', () => {
  beforeEach(async () => {
    await deleteEverything();
  });

  test('deleting a nonexisting language', async () => {
    expect((await addLanguage('a language')).status).toEqual(201);
    expect((await deleteLanguage(2)).status).toEqual(404);
    expect((await getLanguage(1)).status).toEqual(200);
  });

  test('id is not numeric', async () => {
    expect((await addLanguage('a language')).status).toEqual(201);
    const r = await fetch('http://localhost:5555/languages/123letters', {
      method: 'DELETE',
    });
    expect(r.status).toEqual(400);
    expect((await getLanguage(1)).status).toEqual(200);
  });
});

describe('getting languages', () => {
  beforeEach(async () => {
    await deleteEverything();
  });

  test('getting the list of languages', async () => {
    const l1 = await (await addLanguage('language 1')).json();
    const l2 = await (await addLanguage('language 2')).json();
    const l3 = await (await addLanguage('language 3')).json();

    const ll = [l1, l2, l3];
    const r = await getLanguages();
    expect(r.status).toEqual(200);
    const responseLl = await r.json();

    expect(responseLl).toEqual(ll);
  });

  test('no languages = empty array', async () => {
    const r = await getLanguages();
    expect(r.status).toEqual(200);
    expect(await r.json()).toEqual([]);
  });
});

describe('getting invalid languages', () => {
  beforeEach(async () => {
    await deleteEverything();
  });

  test('id is not numeric', async () => {
    const r = await fetch('http://localhost:5555/languages/123letters', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(r.status).toEqual(400);
  });
});
