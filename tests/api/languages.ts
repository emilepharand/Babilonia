import fetch from 'node-fetch';
import {
  copy,
  emptyPartialLanguage,
  equal,
  Language,
  validate as validateLanguage,
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

async function editLanguage(id: number, newLanguage: Language): Promise<Language> {
  const response = await fetch(`http://localhost:5555/api/language/edit/${id}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLanguage),
    });
  return await response.json() as Language;
}

async function getLanguage(id: number): Promise<Language> {
  const response = await fetch(`http://localhost:5555/api/language/${id}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  return await response.json() as Language;
}

describe('adding languages', () => {
  beforeAll(async () => {
    await fetch('http://localhost:5555/api/reset', { method: 'GET' });
  });

  test('adding first language', async () => {
    const languageName = 'a first language';
    const responseLanguage = await addLanguage(languageName);
    expect(validateLanguage(responseLanguage))
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
    expect(equal(responseLanguage, fetchedLanguage))
      .toBe(true);
  });

  test('adding second language', async () => {
    const languageName = 'a second language';
    const responseLanguage = await addLanguage(languageName);

    expect(validateLanguage(responseLanguage))
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
    expect(equal(responseLanguage, fetchedLanguage))
      .toBe(true);
  });
});

describe('editing languages', () => {
  beforeEach(async () => {
    await fetch('http://localhost:5555/api/reset', { method: 'GET' });
  });

  test('editing the name of a language', async () => {
    const languageName = 'original language';

    // adding a language is already tested
    const oldLanguage = await addLanguage(languageName);

    const newLanguage = copy(oldLanguage);
    newLanguage.name = 'edited language';
    expect(newLanguage.name)
      .not
      .toEqual(oldLanguage.name);

    const responseLanguage = await editLanguage(oldLanguage.id, newLanguage);

    // should have changed
    expect(responseLanguage.name)
      .toEqual(newLanguage.name);

    // should be the same
    expect(responseLanguage.id)
      .toEqual(oldLanguage.id);
    expect(responseLanguage.isPractice)
      .toEqual(oldLanguage.isPractice);
    expect(responseLanguage.ordering)
      .toEqual(oldLanguage.ordering);

    const fetchedLanguaged = await getLanguage(oldLanguage.id);
    expect(equal(responseLanguage, fetchedLanguaged))
      .toBe(true);
  });

  test('editing the isPractice of a language', async () => {
    const languageName = 'original language';

    // response is already tested
    const oldLanguage = await addLanguage(languageName);

    const newLanguage = copy(oldLanguage);
    newLanguage.isPractice = !oldLanguage.isPractice;
    expect(oldLanguage.isPractice)
      .not
      .toEqual(newLanguage.isPractice);

    const responseLanguage = await editLanguage(oldLanguage.id, newLanguage);

    // should have changed
    expect(responseLanguage.isPractice)
      .toEqual(newLanguage.isPractice);

    // should be the same
    expect(responseLanguage.name)
      .toEqual(oldLanguage.name);
    expect(responseLanguage.id)
      .toEqual(oldLanguage.id);
    expect(responseLanguage.ordering)
      .toEqual(oldLanguage.ordering);

    const fetchedLanguaged = await editLanguage(oldLanguage.id, newLanguage);
    expect(equal(responseLanguage, fetchedLanguaged))
      .toBe(true);
  });
});
