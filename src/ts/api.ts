import {Idea} from '../../server/model/ideas/idea';
import {Language} from '../../server/model/languages/language';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {Stats} from '../../server/stats/stats';

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
		return new Idea({id: r.id, ee: r.ee});
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

	static async addIdea(ifa: IdeaForAdding): Promise<Idea> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/api/idea/add`;
		const response = await fetch(url, {
			method: 'POST',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(ifa),
		});
		return response.json();
	}

	static async getNextIdea(): Promise<Idea> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/api/idea/next`;
		// Alert(url);
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

	public static async getLanguage(id: number): Promise<Language> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/languages/${id}`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return response.json();
	}

	public static async getStats(): Promise<Stats> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/stats`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return response.json();
	}
}
