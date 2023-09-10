import {ExpressionForAdding} from '../../../../server/model/ideas/expression';
import {IdeaForAdding} from '../../../../server/model/ideas/ideaForAdding';
import {
	addLanguages,
	apiUrl,
} from '../../cy-utils';
import {assertIsTyped, assertRowMatchIsFullMatch, assertRowMatchIsPartialMatch, getResetButton, getRowHintButton, getRowShowButton, typeInRow, waitForTableToLoad} from './utils';

context('Context', () => {
	specify('Context', () => {
		addLanguages();
		const e1: ExpressionForAdding = {languageId: 1, text: '(bien le) bonjour (à vous)'};
		const e2: ExpressionForAdding = {languageId: 1, text: 'salut (mon) cher'};
		const e3: ExpressionForAdding = {languageId: 1, text: 'salut (mon) (bel) ami'};
		const e4: ExpressionForAdding = {languageId: 2, text: 'hello'};
		const e5: ExpressionForAdding = {languageId: 3, text: 'buenos días'};
		const e6: ExpressionForAdding = {languageId: 4, text: 'buongiorno'};
		const e7: ExpressionForAdding = {languageId: 5, text: 'guten Tag'};
		const i1: IdeaForAdding = {ee: [e1, e2, e3, e4, e5, e6, e7]};
		cy.request({
			url: `${apiUrl}/ideas`,
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: `${JSON.stringify(i1)}`,
		});

		// Make some languages practiceable
		const json
			= '[{"id":1,"name":"français","ordering":0,"isPractice":true},'
			+ '{"id":2,"name":"english","ordering":1,"isPractice":false},'
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

		cy.get('#practice-link').click();

		waitForTableToLoad(7);

		// Context at beginning of expression is shown
		assertIsTyped(1, '(bien le) ');
		assertRowMatchIsPartialMatch(1);

		// Start to type
		typeInRow(1, 'b');
		assertIsTyped(1, '(bien le) b');

		// Complete
		assertRowMatchIsPartialMatch(1);
		typeInRow(1, 'onjour');
		assertRowMatchIsFullMatch(1, '(bien le) bonjour (à vous)');

		// Context appears
		typeInRow(2, 'salu');
		assertIsTyped(2, 'salu');
		typeInRow(2, 't');
		assertIsTyped(2, 'salut (mon) ');
		assertRowMatchIsPartialMatch(2);

		// Don't have to type space
		typeInRow(2, 'c');
		assertIsTyped(2, 'salut (mon) c');
		assertRowMatchIsPartialMatch(2);

		// Complete
		assertRowMatchIsPartialMatch(2);
		typeInRow(2, 'her');
		assertRowMatchIsFullMatch(2, 'salut (mon) cher');

		// Two contexts in a row
		typeInRow(3, 'salut');
		assertIsTyped(3, 'salut (mon) (bel) ');
		assertRowMatchIsPartialMatch(3);
		typeInRow(3, 'ami');
		assertRowMatchIsFullMatch(3, 'salut (mon) (bel) ami');

		getResetButton().click();

		// Hinting
		getRowHintButton(1).click();
		assertIsTyped(1, '(bien le) b');
		assertRowMatchIsPartialMatch(1);
		typeInRow(1, 'onjou');
		assertIsTyped(1, '(bien le) bonjou');
		assertRowMatchIsPartialMatch(1);
		getRowHintButton(1).click();
		assertRowMatchIsFullMatch(1, '(bien le) bonjour (à vous)');

		typeInRow(2, 'salu');
		getRowHintButton(2).click();
		assertIsTyped(2, 'salut (mon) ');
		getRowHintButton(2).click();
		assertIsTyped(2, 'salut (mon) c');
		getRowShowButton(2).click();
		assertRowMatchIsFullMatch(2, 'salut (mon) cher');

		typeInRow(3, 'salu');
		getRowHintButton(3).click();
		assertIsTyped(3, 'salut (mon) (bel) ');
		getRowHintButton(3).click();
		assertIsTyped(3, 'salut (mon) (bel) a');
		getRowShowButton(3).click();
		assertRowMatchIsFullMatch(3, 'salut (mon) (bel) ami');
	});
});
