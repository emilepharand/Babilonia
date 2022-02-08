import { Idea } from '../../server/model/idea';
import { Language } from '../../server/model/language';
import { Expression } from '../../server/model/expression';

export default class Api {
  public static async getIdea(ideaId: number): Promise<Idea> {
    const url = `${process.env.VUE_APP_API_BASE_URL}/api/idea/${ideaId}`;
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const r = await response.json();
    return new Idea({ id: r.id, ee: r.ee });
  }

  static async editIdea(idea: Idea): Promise<Idea> {
    const url = `${process.env.VUE_APP_API_BASE_URL}/api/idea/edit/${idea.id}`;
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
    const url = `${process.env.VUE_APP_API_BASE_URL}/api/idea/${ideaId}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });
    return response.json();
  }

  static async addIdea(ee: Expression[]): Promise<Idea> {
    const ee2 = ee.filter((e) => e.texts[0] !== '');
    if (ee2.length === 0) return Promise.reject();
    const url = `${process.env.VUE_APP_API_BASE_URL}/api/idea/add`;
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ee2),
    });
    return response.json();
  }

  static async getNextIdea(): Promise<Idea> {
    const url = `${process.env.VUE_APP_API_BASE_URL}/api/idea/next`;
    // alert(url);
    const res = await fetch(url);
    return res.json();
  }

  public static async addLanguage(newLang: Language): Promise<Language> {
    const url = `${process.env.VUE_APP_API_BASE_URL}/api/language/add`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLang),
    });
    return response.json();
  }

  public static async editLanguage(lang: Language): Promise<Language> {
    const url = `${process.env.VUE_APP_API_BASE_URL}/api/language/edit`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lang),
    });
    return response.json();
  }
}
