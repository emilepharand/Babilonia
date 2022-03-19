describe('Empty database', () => {
	it('Practice page', () => {
		const a: number = 3;
		cy.visit('/');
		cy.contains('No ideas have been found.');
	});
});
