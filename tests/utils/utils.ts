import fetch, { Response } from 'node-fetch';
import { Idea, IdeaForAdding } from '../../server/model/idea';
import { Language } from '../../server/model/language';

export const FIRST_LANGUAGE_ID = 1;
export const FIRST_IDEA_ID = 1;
export const FIRST_ORDERING = 0;
export const DEFAULT_IS_PRACTICE = false;

export async function addLanguage(name: string): Promise<Response> {
  return fetch('http://localhost:5555/languages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

export async function addLanguageObj(object: any): Promise<Response> {
  return fetch('http://localhost:5555/languages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: object,
  });
}

export async function editLanguagesObj(object: any): Promise<Response> {
  return fetch('http://localhost:5555/languages', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: object,
  });
}

export async function editIdea(idea: unknown, id: number): Promise<Response> {
  return fetch(`http://localhost:5555/ideas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(idea),
  });
}

export async function simplyAddLanguage(name: string): Promise<Language> {
  return await (await fetch('http://localhost:5555/languages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })).json() as Language;
}

export async function editLanguages(newLanguages: Language[]): Promise<Response> {
  return fetch('http://localhost:5555/languages', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLanguages),
  });
}

export async function getLanguage(id: number): Promise<Response> {
  return fetch(`http://localhost:5555/languages/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function simplyGetLanguage(id: number): Promise<Language> {
  return await (await getLanguage(id)).json() as Language;
}

export async function simplyGetLanguages(): Promise<Language[]> {
  const r = await fetch('http://localhost:5555/languages', {
    method: 'GET',
  });
  return await r.json() as Language[];
}

export async function getLanguages(): Promise<Response> {
  return fetch('http://localhost:5555/languages', {
    method: 'GET',
  });
}

export async function deleteLanguage(id: number): Promise<Response> {
  return fetch(`http://localhost:5555/languages/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteEverything(): Promise<Response> {
  return fetch('http://localhost:5555/everything', { method: 'DELETE' });
}

export async function addAndGetIdea(obj: unknown): Promise<Idea> {
  const r = await fetch('http://localhost:5555/ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  });
  return await r.json() as Idea;
}

export async function addIdea(obj: unknown): Promise<Response> {
  return fetch('http://localhost:5555/ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  });
}

export async function simplyAddIdea(idea: IdeaForAdding): Promise<Idea> {
  const r = await fetch('http://localhost:5555/ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(idea),
  });
  return await r.json() as Idea;
}

export async function simplyGetIdea(id: number): Promise<Idea> {
  const r = await fetch(`http://localhost:5555/ideas/${id}`, {
    method: 'GET',
  });
  return await r.json() as Idea;
}

export async function getIdea(id: number): Promise<Response> {
  return fetch(`http://localhost:5555/ideas/${id}`, {
    method: 'GET',
  });
}
