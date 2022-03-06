import fetch, { Response } from 'node-fetch';
import { Idea } from '../../server/model/ideas/idea';
import { Language } from '../../server/model/languages/language';
import { IdeaForAdding } from '../../server/model/ideas/ideaForAdding';
import { SearchContext } from '../../server/model/search/searchContext';

export const FIRST_LANGUAGE_ID = 1;
export const FIRST_IDEA_ID = 1;
export const FIRST_ORDERING = 0;
export const DEFAULT_IS_PRACTICE = false;

export async function addLanguageRawObjectAndGetResponse(object: any): Promise<Response> {
  return fetch('http://localhost:5555/languages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: object,
  });
}

export async function addLanguageAndGetResponse(name: string): Promise<Response> {
  return addLanguageRawObjectAndGetResponse(JSON.stringify({ name }));
}

export async function addLanguage(name: string): Promise<Language> {
  return (await (await addLanguageAndGetResponse(name)).json()) as Language;
}

export async function editLanguagesRawObjectAndGetResponse(object: any): Promise<Response> {
  return fetch('http://localhost:5555/languages', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: object,
  });
}

export async function editLanguagesAndGetResponse(newLanguages: Language[]): Promise<Response> {
  return editLanguagesRawObjectAndGetResponse(JSON.stringify(newLanguages));
}

export async function editLanguages(newLanguages: Language[]): Promise<Language[]> {
  return (await (
    await editLanguagesRawObjectAndGetResponse(JSON.stringify(newLanguages))
  ).json()) as Language[];
}

export async function fetchLanguageAndGetResponse(id: number): Promise<Response> {
  return fetch(`http://localhost:5555/languages/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function fetchLanguage(id: number): Promise<Language> {
  return (await (await fetchLanguageAndGetResponse(id)).json()) as Language;
}

export async function fetchLanguagesAndGetResponse(): Promise<Response> {
  return fetch('http://localhost:5555/languages', {
    method: 'GET',
  });
}

export async function fetchLanguages(): Promise<Language[]> {
  return (await (await fetchLanguagesAndGetResponse()).json()) as Language[];
}

export async function deleteLanguage(id: number): Promise<Response> {
  return fetch(`http://localhost:5555/languages/${id}`, {
    method: 'DELETE',
  });
}

export async function addIdeaRawObjectAndGetResponse(obj: any): Promise<Response> {
  return fetch('http://localhost:5555/ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: obj,
  });
}

export async function addIdeaAndGetResponse(idea: IdeaForAdding): Promise<Response> {
  return addIdeaRawObjectAndGetResponse(JSON.stringify(idea));
}

export async function addIdea(idea: IdeaForAdding): Promise<Idea> {
  return (await (await addIdeaRawObjectAndGetResponse(JSON.stringify(idea))).json()) as Idea;
}

export async function editIdeaRawObjectAndGetResponse(idea: any, id: number): Promise<Response> {
  return fetch(`http://localhost:5555/ideas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: idea,
  });
}

export async function editIdeaAndGetResponse(object: any, id: number): Promise<Response> {
  return editIdeaRawObjectAndGetResponse(JSON.stringify(object), id);
}

export async function editIdea(object: any, id: number): Promise<Idea> {
  return (await (await editIdeaRawObjectAndGetResponse(JSON.stringify(object), id)).json()) as Idea;
}

export async function deleteIdea(id: number): Promise<Response> {
  return fetch(`http://localhost:5555/ideas/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchIdeaAndGetResponse(id: number): Promise<Response> {
  return fetch(`http://localhost:5555/ideas/${id}`, {
    method: 'GET',
  });
}

export async function fetchIdea(id: number): Promise<Idea> {
  return (await (await fetchIdeaAndGetResponse(id)).json()) as Idea;
}

export async function searchAndGetResponse(sc: SearchContext): Promise<Response> {
  let params = `pattern=${sc.pattern}`;
  params += `&language=${sc.languages.join('|')}`;
  let separator = sc.ideaHasOperator === 'and' ? ',' : '|';
  params += `&ideaHas=${sc.ideaHas.join(separator)}`;
  separator = sc.ideaDoesNotHaveOperator === 'and' ? ',' : '|';
  params += `&ideaDoesNotHave=${sc.ideaDoesNotHave.join(separator)}`;
  const url = `http://localhost:5555/ideas?${params}`;
  console.log(url);
  return fetch(url, {
    method: 'GET',
  });
}

export async function deleteEverything(): Promise<Response> {
  return fetch('http://localhost:5555/everything', { method: 'DELETE' });
}
