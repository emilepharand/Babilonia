import {Idea} from '../../server/model/ideas/idea';
import {Language} from '../../server/model/languages/language';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {NumberIdeasInLanguage} from '../../server/stats/stats';
import {Settings} from '../../server/model/settings/settings';
import {SearchContext} from '../../server/model/search/searchContext';

export default class Api {
	public static async getIdea(ideaId: number): Promise<Idea> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/ideas/${ideaId}`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (response.status === 404) {
			return Promise.reject();
		}
		return (await response.json()) as Idea;
	}

	static async editIdea(
		ideaForAdding: IdeaForAdding,
		id: number,
	): Promise<Idea> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/ideas/${id}`;
		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(ideaForAdding),
		});
		return (await response.json()) as Idea;
	}

	static async deleteIdea(ideaId: number): Promise<unknown> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/ideas/${ideaId}`;
		const response = await fetch(url, {
			method: 'DELETE',
		});
		return response.json();
	}

	static async deleteLanguage(languageId: number): Promise<void> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/languages/${languageId}`;
		await fetch(url, {method: 'DELETE'});
	}

	static async addIdea(ifa: IdeaForAdding): Promise<Idea> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/ideas`;
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
		if (response.status !== 201) {
			return Promise.reject();
		}
		return (await response.json()) as Language;
	}

	public static async editLanguages(
		languages: Language[],
	): Promise<Language[]> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/languages`;
		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(languages),
		});
		if (response.status === 400) {
			return Promise.reject();
		}
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

	static async getSettings(): Promise<Settings> {
		const url = `${process.env.VUE_APP_API_BASE_URL}/settings`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return (await response.json()) as Settings;
	}

	// TODO: This is duplicated
	static paramsFromSearchContext(sc: SearchContext): string {
		let params = '';
		if (sc.pattern) {
			params = `pattern=${sc.pattern}`;
		}
		if (sc.strict) {
			params += '&strict=true';
		}
		if (sc.language) {
			params += `&language=${sc.language}`;
		}
		if (sc.ideaHas) {
			params += `&ideaHas=${sc.ideaHas.join(',')}`;
		}
		if (sc.ideaDoesNotHave) {
			params += `&ideaDoesNotHave=${sc.ideaDoesNotHave}`;
		}
		return params;
	}

	static async searchIdeas(sc: SearchContext): Promise<Idea[]> {
		const params = Api.paramsFromSearchContext(sc);
		const url = `${process.env.VUE_APP_API_BASE_URL}/ideas?${params}`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return (await response.json()) as Idea[];
	}
}
