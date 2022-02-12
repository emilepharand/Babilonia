import fetch, { Response } from 'node-fetch';
import { emptyPartialIdea, Idea } from '../../server/model/idea';
import { emptyPartialExpression } from '../../server/model/expression';

function deleteEverything(): Promise<Response> {
  return fetch('http://localhost:5555/everything', { method: 'DELETE' });
}

describe('adding ideas', () => {
  beforeAll(async () => {
    await deleteEverything();
  });

  test('adding an idea', async () => {
    const idea = emptyPartialIdea();
    const e1 = emptyPartialExpression();
    const e2 = emptyPartialExpression();
    // idea.ee = [e1, e2];
  });
});
