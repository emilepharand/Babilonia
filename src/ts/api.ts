import type {Idea} from '../../server/model/ideas/idea';
import type {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import type {Language} from '../../server/model/languages/language';
import type {SearchContext} from '../../server/model/search/searchContext';
import type {Settings} from '../../server/model/settings/settings';
import type {AllStats} from '../../server/stats/statsCounter';

const apiUrl = `${process.env.VITE_API_URL ?? import.meta.env.VITE_API_URL}`;

export async function getIdea(ideaId: number): Promise<Idea> {
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

export async function editIdea(
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

export async function deleteIdea(ideaId: number): Promise<void> {
	const url = `${apiUrl}/ideas/${ideaId}`;
	await fetch(url, {method: 'DELETE'});
}

export async function deleteLanguage(languageId: number): Promise<void> {
	const url = `${apiUrl}/languages/${languageId}`;
	await fetch(url, {method: 'DELETE'});
}

export async function addIdea(ifa: IdeaForAdding): Promise<Idea> {
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

export async function getNextIdea(): Promise<Idea> {
	const url = `${apiUrl}/practice-ideas/next`;
	const res = await fetch(url);
	if (res.status === 404) {
		return Promise.reject();
	}
	return (await res.json()) as Idea;
}

export async function addLanguage(name: string): Promise<Language> {
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

export async function editLanguages(
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

export async function getLanguage(id: number): Promise<Language> {
	const url = `${apiUrl}/languages/${id}`;
	const response = await fetch(url, {
		method: 'GET',
	});
	return (await response.json()) as Language;
}

export async function getStats(): Promise<AllStats> {
	const url = `${apiUrl}/stats`;
	const response = await fetch(url, {
		method: 'GET',
	});
	return (await response.json()) as AllStats;
}

export async function getLanguages(): Promise<Language[]> {
	const url = `${apiUrl}/languages`;
	const response = await fetch(url, {
		method: 'GET',
	});
	return (await response.json()) as Language[];
}

export async function getSettings(): Promise<Settings> {
	const url = `${apiUrl}/settings`;
	const response = await fetch(url, {
		method: 'GET',
	});
	return (await response.json()) as Settings;
}

export async function setSettings(settings: Settings): Promise<void> {
	const url = `${apiUrl}/settings`;
	await fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(settings),
	});
}

export async function searchIdeas(sc: SearchContext): Promise<Idea[]> {
	const params = paramsFromSearchContext(sc);
	const url = `${apiUrl}/ideas?${params}`;
	const response = await fetch(url, {
		method: 'GET',
	});
	return (await response.json()) as Idea[];
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
	if (sc.knownExpressions !== undefined) {
		params += `&knownExpressions=${sc.knownExpressions ? 'true' : 'false'}`;
	}
	return params;
}
