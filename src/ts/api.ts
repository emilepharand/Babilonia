import Idea from '../../server/model/idea';

export default class Api {
  public static async getIdea(ideaId: number): Promise<Idea> {
    const url = `http://localhost:5000/api/idea/${ideaId}`;
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const r = await response.json();
    return new Idea(r.id, r.ee);
  }

  static async editIdea(idea: Idea): Promise<Idea> {
    const url = `http://localhost:5000/api/idea/edit/${idea.id}`;
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(idea),
    });
    return response.json();
  }

  static async deleteIdea(ideaId: number): Promise<unknown> {
    const url = `http://localhost:5000/api/ideas/${ideaId}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });
    return response.json();
  }

  static async addIdea(idea: Idea): Promise<Idea> {
    const ee = idea.ee.filter((e) => e.text !== '');
    if (ee.length === 0) return Promise.reject();
    const url = 'http://localhost:5000/api/idea/add';
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ee),
    });
    return response.json();
  }

  static async getNextIdea(): Promise<Idea> {
    const res = await fetch('http://localhost:5000/api/ideas');
    return res.json();
  }
}
