import request from 'supertest';
import assert from 'assert';

request('http://localhost:5555/api/language')
  .post('/add')
  .send({ name: 'john' })
  .expect('Content-Type', /json/)
  .expect('Content-Length', '15')
  .expect(200)
  .end((err, res) => {
    if (err) throw err;
  });
