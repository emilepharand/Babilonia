import fetch from 'node-fetch';
import {
  copy,
  emptyPartialLanguage,
  Language,
  validate,
} from '../../server/model/language';

async function addLanguage(name: string): Promise<Language> {
  const l1: Partial<Language> = emptyPartialLanguage();
  l1.name = name;
  const response = await fetch('http://localhost:5555/api/language/add',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(l1),
    });
  return await response.json() as Language;
}

async function editLanguages(newLanguages: Language[]): Promise<Language[]> {
  const response = await fetch('http://localhost:5555/api/languages',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLanguages),
    });
  return await response.json() as Language[];
}

async function getLanguage(id: number): Promise<Language> {
  const response = await fetch(`http://localhost:5555/api/language/${id}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  return await response.json() as Language;
}

// response code
describe('adding languages', () => {
  beforeAll(async () => {
    await fetch('http://localhost:5555/api/reset', { method: 'GET' });
  });

  test('adding first language', async () => {
    const languageName = 'a first language';
    const responseLanguage = await addLanguage(languageName);

    expect(validate(responseLanguage))
      .toEqual(true);
    // id starts at 1
    expect(responseLanguage.id)
      .toEqual(1);
    expect(responseLanguage.name)
      .toEqual(languageName);
    // false is the default
    expect(responseLanguage.isPractice)
      .toEqual(false);
    // ordering starts at 0
    expect(responseLanguage.ordering)
      .toEqual(0);

    const fetchedLanguage = await getLanguage(1);
    expect(responseLanguage)
      .toEqual(fetchedLanguage);
  });

  test('adding second language', async () => {
    const languageName = 'a second language';
    const responseLanguage = await addLanguage(languageName);

    expect(validate(responseLanguage))
      .toEqual(true);

    expect(responseLanguage.id)
      .toEqual(2);
    expect(responseLanguage.name)
      .toEqual(languageName);
    expect(responseLanguage.isPractice)
      .toEqual(false);
    expect(responseLanguage.ordering)
      .toEqual(1);

    const fetchedLanguage = await getLanguage(2);
    expect(responseLanguage)
      .toEqual(fetchedLanguage);
  });
});

describe('editing languages', () => {
  beforeEach(async () => {
    await fetch('http://localhost:5555/api/reset', { method: 'GET' });
  });

  test('editing languages with changes', async () => {
    const oldLanguage1 = await addLanguage('old language 1');
    const oldLanguage2 = await addLanguage('old language 2');
    const newLanguage1 = copy(oldLanguage1);
    const newLanguage2 = copy(oldLanguage2);

    // name
    newLanguage1.name = 'edited language 1';
    newLanguage2.name = 'edited language 2';
    expect(newLanguage1.name)
      .not
      .toEqual(oldLanguage1.name);
    expect(newLanguage2.name)
      .not
      .toEqual(oldLanguage2.name);

    // isPractice
    newLanguage1.isPractice = !oldLanguage1.isPractice;
    newLanguage2.isPractice = !oldLanguage2.isPractice;
    expect(newLanguage1.isPractice)
      .not
      .toEqual(oldLanguage1.isPractice);
    expect(newLanguage2.isPractice)
      .not
      .toEqual(oldLanguage2.isPractice);

    // ordering
    newLanguage1.ordering = 1;
    newLanguage2.ordering = 0;
    expect(newLanguage1.ordering)
      .not
      .toEqual(oldLanguage1.ordering);
    expect(newLanguage2.ordering)
      .not
      .toEqual(oldLanguage2.ordering);

    const ll: Language[] = [newLanguage1, newLanguage2];
    const [responseLanguage1, responseLanguage2] = (await editLanguages(ll));
    const fetchedLanguage1 = await getLanguage(oldLanguage1.id);
    const fetchedLanguage2 = await getLanguage(oldLanguage2.id);

    // sanity checks
    expect(validate(responseLanguage1))
      .toEqual(true);
    expect(validate(responseLanguage2))
      .toEqual(true);
    expect(responseLanguage1)
      .toEqual(fetchedLanguage1);
    expect(responseLanguage2)
      .toEqual(fetchedLanguage2);

    // check values have changed
    expect(fetchedLanguage1.name)
      .toEqual(newLanguage1.name);
    expect(fetchedLanguage2.name)
      .toEqual(newLanguage2.name);
    expect(fetchedLanguage1.isPractice)
      .toEqual(newLanguage1.isPractice);
    expect(fetchedLanguage2.isPractice)
      .toEqual(newLanguage2.isPractice);
    expect(fetchedLanguage1.ordering)
      .toEqual(newLanguage1.ordering);
    expect(fetchedLanguage2.ordering)
      .toEqual(newLanguage2.ordering);
  });

  test('editing languages with no changes', async () => {
    const oldLanguage1 = await addLanguage('old language 1');
    const oldLanguage2 = await addLanguage('old language 2');

    const ll: Language[] = [oldLanguage1, oldLanguage2];
    const [responseLanguage1, responseLanguage2] = (await editLanguages(ll));
    const fetchedLanguage1 = await getLanguage(oldLanguage1.id);
    const fetchedLanguage2 = await getLanguage(oldLanguage2.id);

    // sanity checks
    expect(validate(responseLanguage1))
      .toEqual(true);
    expect(validate(responseLanguage2))
      .toEqual(true);
    expect(responseLanguage1)
      .toEqual(fetchedLanguage1);
    expect(responseLanguage2)
      .toEqual(fetchedLanguage2);

    // check values have not changed
    expect(fetchedLanguage1)
      .toEqual(oldLanguage1);
    expect(fetchedLanguage2)
      .toEqual(oldLanguage2);
  });
});
