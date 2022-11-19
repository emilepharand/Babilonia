import {
	addIdeas,
	addLanguages,
	apiUrl,
	assertExpressionHasValues,
	assertExpressionIsKnown,
	assertFetchIdeaDoesNotContain,
	assertFetchIdeaReturnsStatus,
	getAddRowsButton,
	getDeleteButton,
	getEditButton,
	getExpressionTextInputRow,
	getKnownExpressionToggle,
	getLanguageSelect,
	inputExpression,
	toggleExpressionKnown,
	waitForTableToLoad,
} from '../cy-utils';
import {ExpressionForAdding} from '../../../server/model/ideas/expression';
import {IdeaForAdding} from '../../../server/model/ideas/ideaForAdding';

beforeEach(() => {
	cy.request('DELETE', `${apiUrl}/everything`);
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('The idea page', () => {
	specify('Editing ideas', () => {
		addIdeas();

		cy.visit('/ideas/100');
		cy.contains('not found');
		cy.get('button').should('not.be.visible');

		cy.visit('/ideas/1');

		waitForTableToLoad(5);

		assertFetchIdeaReturnsStatus(1, 200, ['bonjour']);

		// Test editing an idea works
		inputExpression(0, 'deutsch', 'was');
		cy.get('#success-text').should('not.exist');
		getEditButton().click();
		cy.get('#success-text').should('be.visible');
		assertFetchIdeaReturnsStatus(1, 200, ['was']);

		waitForTableToLoad(5);

		// Expressions should be reordered
		assertExpressionHasValues(0, 'english', 'hello');
		assertExpressionHasValues(3, 'deutsch', 'was');

		getAddRowsButton().click();
		cy.get('#ideas').find('.expression').should('have.length', 10);

		// Expressions should not change
		assertExpressionHasValues(3, 'deutsch', 'was');

		// Delete an expression
		inputExpression(3, 'deutsch', '');
		getEditButton().click();
		assertFetchIdeaDoesNotContain(1, ['was']);

		getAddRowsButton().click();

		// Empty idea (not valid)
		for (let i = 0; i < 5; i++) {
			inputExpression(i, 'deutsch', '');
		}
		getEditButton().click();
		cy.get('#error-text').should('contain.text', 'Empty');

		// Invalid parenthesis context
		inputExpression(3, 'english', 'to play sport)');
		getEditButton().click();
		cy.get('#error-text').should('contain.text', 'context');

		assertFetchIdeaReturnsStatus(1, 200, ['hello']);

		// Delete but cancel
		cy.get('#confirm-delete-modal').should('not.be.visible');
		cy.get('#delete-button').click();
		cy.get('#confirm-delete-modal').should('be.visible');
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.wait(500).get('#modal-cancel-button').click();
		assertFetchIdeaReturnsStatus(1, 200, ['hello']);

		// Test delete
		cy.get('#confirm-delete-modal').should('not.be.visible');
		cy.get('#delete-button').click();
		cy.get('#confirm-delete-modal').should('be.visible');
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.wait(500).get('#modal-delete-button').click();
		assertFetchIdeaReturnsStatus(1, 404, []);
	});

	specify.only('Interactivity', () => {
		addLanguages();

		const e1: ExpressionForAdding = {languageId: 1, text: 'bonjour'};
		const i1: IdeaForAdding = {ee: [e1]};

		cy.request({
			url: `${apiUrl}/ideas`,
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: `${JSON.stringify(i1)}`,
		});

		cy.visit('/ideas/1');

		waitForTableToLoad(1);

		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('{home}{leftArrow}');
		getLanguageSelect(0)
			.should('be.focused')
			.type('{rightArrow}');
		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('{rightArrow}');
		getKnownExpressionToggle(0)
			.should('be.focused')
			.type('{downArrow}')
			.should('be.focused')
			.type('{downArrow}')
			.should('be.focused')
			.type('{leftArrow}');
		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('{downArrow}');
		getAddRowsButton()
			.should('be.focused')
			.type('{downArrow}');
		getEditButton()
			.should('be.focused')
			.type('{downArrow}');
		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('{upArrow}');
		getEditButton()
			.should('be.focused')
			.type('{rightArrow}');
		getDeleteButton()
			.should('be.focused')
			.type('{downArrow}');
		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('{upArrow}');
		getEditButton()
			.should('be.focused')
			.type('{upArrow}');
		getAddRowsButton()
			.should('be.focused')
			.click();
		waitForTableToLoad(6);
		getExpressionTextInputRow(1)
			.should('be.focused')
			.type('{upArrow}');
		for (let i = 0; i < 6; i++) {
			getExpressionTextInputRow(i)
				.should('have.focus')
				.type('{downArrow}');
		}
		getExpressionTextInputRow(1).type('hello');
		getEditButton().click();
		cy.reload();
		waitForTableToLoad(2);
		getExpressionTextInputRow(0)
			.should('have.focus');
	});

	specify('Known expressions', () => {
		addIdeas();
		cy.visit('/ideas/1');

		toggleExpressionKnown(3);

		getEditButton().click();

		assertFetchIdeaReturnsStatus(1, 200, ['"known":true', '"known":false']);

		cy.visit('/').visit('/ideas/1');

		assertExpressionIsKnown(3, true);
		assertExpressionIsKnown(0, false);
	});
});
