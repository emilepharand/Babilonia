import {Idea} from '../../server/model/ideas/idea';
import {Language} from '../../server/model/languages/language';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {NumberIdeasInLanguage} from '../../server/stats/stats';

export default class Api {
	public static async getIdea(ideaId: number): Promise<Idea> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/api/idea/${ideaId}`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		return (await response.json()) as Idea;
	}

	static async editIdea(idea: Idea): Promise<Idea> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/api/idea/edit/${idea.id}`;
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(idea),
		});
		return (await response.json()) as Idea;
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
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(ifa),
		});
		return (await response.json()) as Idea;
	}

	static async getNextIdea(): Promise<Idea> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/practice-ideas/next`;
		const res = await fetch(url);
		if (res.status === 404) {
			return Promise.reject();
		}
		return (await res.json()) as Idea;
	}

	public static async addLanguage(name: string): Promise<Language> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/languages`;
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({name}),
		});
		return (await response.json()) as Language;
	}

	public static async editLanguages(languages: Language[]): Promise<Language[]> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/languages`;
		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(languages),
		});
		return (await response.json()) as Language[];
	}

	public static async getLanguage(id: number): Promise<Language> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/languages/${id}`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return (await response.json()) as Language;
	}

	public static async getStats(): Promise<NumberIdeasInLanguage[]> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/stats`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return (await response.json()) as NumberIdeasInLanguage[];
	}

	static async getLanguages(): Promise<Language[]> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/languages`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return (await response.json()) as Language[];
	}

	static async deleteEverything(): Promise<void> {
		await fetch('http://localhost:5555/everything', {method: 'DELETE'});
	}
}
