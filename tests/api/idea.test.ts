import request from 'supertest';
import Idea from '../../server/model/idea';
import Expression from '../../server/model/expression';
import Language from '../../server/model/language';

describe('GET /user', () => {
  it('responds with json', (done) => {
    request('http://localhost:5555/api/idea/next')
      .get('/user')
      .auth('username', 'password')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
