import Language from '../../server/model/language';
import { app } from '../../server';

import('supertest')
  .then((r) => {
    describe('POST lang', () => {
      it('responds with json', (done) => {
        const l: Language = new Language();
        l.name = 'français';
        l.ordering = 0;
        l.isPractice = true;
        console.log(JSON.stringify(l));
        r.default(app)
          .post('/add')
          .send(JSON.stringify(l))
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done);
      });
    });
  });
