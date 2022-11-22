import * as dotenv from 'dotenv';
import {ExpressionForAdding} from '../../server/model/ideas/expression';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {Settings} from '../../server/model/settings/settings';

dotenv.config();

export const apiUrl = Cypress.env('VITE_API_URL');

export function addLanguages() {
	const languageNames = [
		'français',
		'english',
		'español',
		'italiano',
		'deutsch',
		'português',
	];
	for (const languageName of languageNames) {
		cy.request({
			url: `${apiUrl}/languages`,
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: `{"name":"${languageName}"}`,
		});
	}
}

export function addIdeasDifferentSet() {
	addLanguages();
	// Idea 1: fr, en, es, de, it, pt
	const fr1: ExpressionForAdding = {text: 'bonjour', languageId: 1, known: true};
	const en1: ExpressionForAdding = {text: 'hello', languageId: 2, known: true};
	const es1: ExpressionForAdding = {text: 'buenos días', languageId: 3, known: true};
	const de1: ExpressionForAdding = {text: 'guten Tag', languageId: 5, known: true};
	const pt1: ExpressionForAdding = {text: 'bom Dia', languageId: 6, known: true};
	const it1: ExpressionForAdding = {text: 'buongiorno', languageId: 4, known: true};
	const i1: IdeaForAdding = {ee: [fr1, en1, es1, de1, pt1, it1]};

	// Idea 2: fr, en, es, de, pt
	const fr2: ExpressionForAdding = {text: 'bonne nuit', languageId: 1};
	const en2: ExpressionForAdding = {text: 'good night', languageId: 2};
	const es2: ExpressionForAdding = {text: 'buenas noches', languageId: 3};
	const pt2: ExpressionForAdding = {text: 'boa noite', languageId: 6};
	const de2: ExpressionForAdding = {text: 'gute Natch', languageId: 5};
	const i2: IdeaForAdding = {ee: [fr2, en2, es2, pt2, de2]};

	// Idea 3: fr, en, es
	const fr3: ExpressionForAdding = {text: 'bonsoir', languageId: 1};
	const fr4: ExpressionForAdding = {text: 'bonsoir 2', languageId: 1};
	const en3: ExpressionForAdding = {text: 'good evening', languageId: 2};
	const en4: ExpressionForAdding = {text: 'good evening 2', languageId: 2};
	const es3: ExpressionForAdding = {text: 'buenas noches', languageId: 3};
	const es4: ExpressionForAdding = {text: 'buenas noches 2', languageId: 3};
	const i3: IdeaForAdding = {ee: [fr3, fr4, en3, en4, es3, es4]};
	cy.request({
		url: `${apiUrl}/ideas`,
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: `${JSON.stringify(i1)}`,
	});
	cy.request({
		url: `${apiUrl}/ideas`,
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: `${JSON.stringify(i2)}`,
	});
	cy.request({
		url: `${apiUrl}/ideas`,
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: `${JSON.stringify(i3)}`,
	});
}

export function addIdeas() {
	addLanguages();
	const e1: ExpressionForAdding = {languageId: 1, text: 'bonjour'};
	const e2: ExpressionForAdding = {languageId: 2, text: 'hello'};
	const e3: ExpressionForAdding = {languageId: 3, text: 'buenos días'};
	const e4: ExpressionForAdding = {languageId: 4, text: 'buongiorno'};
	const e5: ExpressionForAdding = {languageId: 5, text: 'guten Tag'};
	const i1: IdeaForAdding = {ee: [e1, e2, e3, e4, e5]};
	const e6: ExpressionForAdding = {languageId: 1, text: 'salut'};
	const e7: ExpressionForAdding = {languageId: 1, text: 'allô'};
	const e8: ExpressionForAdding = {languageId: 2, text: 'hi'};
	const e9: ExpressionForAdding = {languageId: 2, text: 'hey'};
	const e10: ExpressionForAdding = {languageId: 3, text: 'HOLA éàíôüáéíóú'};
	const e11: ExpressionForAdding = {languageId: 4, text: 'ciao'};
	const e12: ExpressionForAdding = {languageId: 4, text: 'salve'};
	const e13: ExpressionForAdding = {languageId: 5, text: 'Hallo'};
	const i2: IdeaForAdding = {ee: [e6, e7, e8, e9, e10, e11, e12, e13]};
	cy.request({
		url: `${apiUrl}/ideas`,
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: `${JSON.stringify(i1)}`,
	});
	cy.request({
		url: `${apiUrl}/ideas`,
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: `${JSON.stringify(i2)}`,
	});
	// Make some languages practiceable
	const json
    = '[{"id":1,"name":"français","ordering":0,"isPractice":false},'
    + '{"id":2,"name":"english","ordering":1,"isPractice":true},'
    + '{"id":3,"name":"español","ordering":2,"isPractice":true},'
    + '{"id":4,"name":"italiano","ordering":3,"isPractice":true},'
    + '{"id":5,"name":"deutsch","ordering":4,"isPractice":true},'
    + '{"id":6,"name":"português","ordering":5,"isPractice":true}]';
	cy.request({
		url: `${apiUrl}/languages`,
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: `${json}`,
	});
}

export function assertFetchIdeaReturnsStatus(id: number, status: number, contains?: string[]) {
	cy.request({
		url: `${apiUrl}/ideas/${id}`,
		failOnStatusCode: false,
	}).then(r => {
		cy.wrap(r).its('status').should('equal', status);
		if (contains) {
			for (const c of contains) {
				cy.wrap(JSON.stringify(r.body)).should('contain', c);
			}
		}
	});
}

export function assertFetchIdeaDoesNotContain(id: number, notContains: string[]) {
	cy.request({
		url: `${apiUrl}/ideas/${id}`,
	}).then(r => {
		for (const c of notContains) {
			cy.wrap(JSON.stringify(r.body)).should('not.contain', c);
		}
	});
}

export function getExpressionTextInputRow(n: number) {
	return cy.get('.expression-text').eq(n);
}

export function getKnownExpressionToggle(n: number) {
	return cy.get('.expression-known-toggle').eq(n);
}

export function getLanguageSelect(n: number) {
	return cy.get('.expression-language').eq(n);
}

export function assertAllInputsEmpty() {
	cy.get('.expression-text').each(e => cy.wrap(e).should('have.value', ''));
}

export function getAddRowsButton() {
	return cy.get('#add-rows');
}

export function getSaveButton() {
	return cy.get('#save-idea');
}

export function waitForTableToLoad(length: number) {
	cy.get('#ideas')
		.find('.expression')
		.should('have.length', length);
}

export function getEditButton() {
	return cy.get('#edit-button');
}

export function getDeleteButton() {
	return cy.get('#delete-button');
}

export function inputExpression(rowNbr: number, language: string, text: string) {
	getLanguageSelect(rowNbr)
		.select(language);
	getExpressionTextInputRow(rowNbr)
		.clear()
		.type(text);
}

export function toggleExpressionKnown(rowNbr: number) {
	cy.get('#ideas')
		.find('.expression')
		.eq(rowNbr)
		.find('.expression-known-toggle')
		.click();
}

export function assertExpressionIsKnown(rowNbr: number, known: boolean) {
	cy.get('#ideas')
		.find('.expression')
		.eq(rowNbr)
		.find('.expression-known-toggle')
		.should(known ? 'be.checked' : 'not.be.checked');
}

export function assertExpressionHasValues(rowNbr: number, languageName: string, text: string) {
	cy.get(`#ideas .expression:nth-child(${rowNbr + 1}) .expression-language option:checked`).should('have.text', languageName);
	cy.get(`#ideas .expression:nth-child(${rowNbr + 1}) .expression-text`).should('have.value', text);
}

export async function setSettings(partialSettings: Partial<Settings>) {
	cy.request({
		url: `${apiUrl}/settings`,
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: `${JSON.stringify(settingsFromPartial(partialSettings))}`,
	});
}

export function settingsFromPartial(partialSettings: Partial<Settings>) {
	return {
		passiveMode: partialSettings.passiveMode ? partialSettings.passiveMode : false,
		practiceOnlyNotKnown: partialSettings.practiceOnlyNotKnown ? partialSettings.practiceOnlyNotKnown : false,
		randomPractice: partialSettings.randomPractice ? partialSettings.randomPractice : false,
		strictCharacters: partialSettings.strictCharacters ? partialSettings.strictCharacters : false,
	};
}
