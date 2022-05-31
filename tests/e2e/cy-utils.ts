import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {ExpressionForAdding} from '../../server/model/ideas/expression';

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
			url: 'http://localhost:5555/languages',
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: `{"name":"${languageName}"}`,
		});
	}
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
	const e10: ExpressionForAdding = {languageId: 3, text: 'hola éàíôüáéíóú'};
	const e11: ExpressionForAdding = {languageId: 4, text: 'ciao'};
	const e12: ExpressionForAdding = {languageId: 4, text: 'salve'};
	const e13: ExpressionForAdding = {languageId: 5, text: 'Hallo'};
	const i2: IdeaForAdding = {ee: [e6, e7, e8, e9, e10, e11, e12, e13]};
	// Make some languages practiceable
	cy.request({
		url: 'http://localhost:5555/ideas',
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: `${JSON.stringify(i1)}`,
	});
	cy.request({
		url: 'http://localhost:5555/ideas',
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: `${JSON.stringify(i2)}`,
	});
	const json
    = '[{"id":1,"name":"français","ordering":0,"isPractice":false},'
    + '{"id":2,"name":"english","ordering":1,"isPractice":true},'
    + '{"id":3,"name":"español","ordering":2,"isPractice":true},'
    + '{"id":4,"name":"italiano","ordering":3,"isPractice":true},'
    + '{"id":5,"name":"deutsch","ordering":4,"isPractice":true},'
    + '{"id":6,"name":"português","ordering":5,"isPractice":true}]';
	cy.request({
		url: 'http://localhost:5555/languages',
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: `${json}`,
	});
}
