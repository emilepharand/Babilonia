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
	const i: IdeaForAdding = {ee: [e1, e2]};
	cy.request({
		url: 'http://localhost:5555/ideas',
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: `${JSON.stringify(i)}`,
	});
}
