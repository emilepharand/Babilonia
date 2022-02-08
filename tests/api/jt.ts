import fetch from 'node-fetch';
import {
  emptyPartialLanguage,
  Language,
  validate as validateLanguage,
} from '../../server/model/language';

describe('adding two languages', () => {
  beforeAll(async () => {
    await fetch('http://localhost:5555/api/reset', { method: 'GET' });
  });

  test('adding first language', async () => {
    const languageName = 'a first language';
    const l1: Partial<Language> = emptyPartialLanguage();
    l1.name = languageName;
    l1.isPractice = true;
    const response = await fetch('http://localhost:5555/api/language/add',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(l1),
      });
    const l2 = await response.json() as Language;
    expect(validateLanguage(l2))
      .toEqual(true);
    expect(l2.id)
      .toEqual(1);
    expect(l2.name)
      .toEqual(languageName);
    expect(l2.isPractice)
      .toEqual(true);
    expect(l2.ordering)
      .toEqual(0);
  });

  test('adding second language', async () => {
    const l: Partial<Language> = emptyPartialLanguage();
    const languageName = 'a second language';
    l.name = languageName;
    l.isPractice = false;
    const response = await fetch('http://localhost:5555/api/language/add',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(l),
      });
    const l2 = await response.json() as Language;
    expect(validateLanguage(l2))
      .toEqual(true);
    expect(l2.id)
      .toEqual(2);
    expect(l2.name)
      .toEqual(languageName);
    expect(l2.isPractice)
      .toEqual(false);
    expect(l2.ordering)
      .toEqual(1);
  });
});
