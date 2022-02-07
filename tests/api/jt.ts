import fetch from 'node-fetch';
import Language, { validate as validateLanguage } from '../../server/model/language';

test('adding positive numbers is not zero', async () => {
  const l1: Language = new Language();
  l1.id = -1;
  const response = await fetch('http://localhost:5555/api/language/add',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(l1),
    });
  const l2 = await response.json() as Language;
  expect(validateLanguage(l2)).toBeTruthy();
  expect(l2.id)
    .toBe(-2);
});
