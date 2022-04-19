import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {ExpressionForAdding} from '../../server/model/ideas/expression';

export function addLanguages() {
	const languageNames = ['français', 'english', 'español', 'italiano', 'deutsch', 'português'];
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
	const i: IdeaForAdding = {ee: [e1, e2, e3, e4, e5]};
	cy.request({
		url: 'http://localhost:5555/ideas',
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: `${JSON.stringify(i)}`,
	});
	const json = '[{"id":1,"name":"français","ordering":0,"isPractice":false},{"id":2,"name":"english","ordering":1,"isPractice":true},{"id":3,"name":"español","ordering":2,"isPractice":false},{"id":4,"name":"italiano","ordering":3,"isPractice":false},{"id":5,"name":"deutsch","ordering":4,"isPractice":false},{"id":6,"name":"português","ordering":5,"isPractice":false}]';
	cy.request({
		url: 'http://localhost:5555/languages',
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: `${json}`,
	});
}
