// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

describe('GET / - a simple api endpoint', () => {
  it('Hello API Request', async () => {
    const result = await request('http://localhost:5555/api/language')
      .post('/add')
      .send({ name: 'john' });
    expect(result.text).toEqual('hello');
    expect(result.statusCode).toEqual(200);
  });
});
