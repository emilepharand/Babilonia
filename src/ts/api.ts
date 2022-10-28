import {Idea} from '../../server/model/ideas/idea';
import {Language} from '../../server/model/languages/language';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {NumberIdeasInLanguage} from '../../server/stats/stats';
import {Settings} from '../../server/model/settings/settings';
import {SearchContext} from '../../server/model/search/searchContext';

const apiUrl = `${process.env.VITE_API_URL}`;

export default class Api {
	public static async getIdea(ideaId: number): Promise<Idea> {
		const url = `${apiUrl}/ideas/${ideaId}`;
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
		const url = `${apiUrl}/ideas/${id}`;
		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(ideaForAdding),
		});
		return (await response.json()) as Idea;
	}

	static async deleteIdea(ideaId: number): Promise<void> {
		const url = `${apiUrl}/ideas/${ideaId}`;
		await fetch(url, {method: 'DELETE'});
	}

	static async deleteLanguage(languageId: number): Promise<void> {
		const url = `${apiUrl}/languages/${languageId}`;
		await fetch(url, {method: 'DELETE'});
	}

	static async addIdea(ifa: IdeaForAdding): Promise<Idea> {
		const url = `${apiUrl}/ideas`;
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
		const url = `${apiUrl}/practice-ideas/next`;
		const res = await fetch(url);
		if (res.status === 404) {
			return Promise.reject();
		}
		return (await res.json()) as Idea;
	}

	public static async addLanguage(name: string): Promise<Language> {
		const url = `${apiUrl}/languages`;
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({name}),
		});
		return (await response.json()) as Language;
	}

	public static async editLanguages(
		languages: Language[],
	): Promise<Language[]> {
		const url = `${apiUrl}/languages`;
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
		const url = `${apiUrl}/languages/${id}`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return (await response.json()) as Language;
	}

	public static async getStats(): Promise<NumberIdeasInLanguage[]> {
		const url = `${apiUrl}/stats`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return (await response.json()) as NumberIdeasInLanguage[];
	}

	static async getLanguages(): Promise<Language[]> {
		const url = `${apiUrl}/languages`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return (await response.json()) as Language[];
	}

	static async getSettings(): Promise<Settings> {
		const url = `${apiUrl}/settings`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return (await response.json()) as Settings;
	}

	public static async setSettings(settings: Settings): Promise<void> {
		const url = `${apiUrl}/settings`;
		await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(settings),
		});
	}

	static async searchIdeas(sc: SearchContext): Promise<Idea[]> {
		const params = paramsFromSearchContext(sc);
		const url = `${apiUrl}/ideas?${params}`;
		const response = await fetch(url, {
			method: 'GET',
		});
		return (await response.json()) as Idea[];
	}
}

export function paramsFromSearchContext(sc: SearchContext): string {
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
