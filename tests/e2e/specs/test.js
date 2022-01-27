// https://docs.cypress.io/api/introduction/api.html

describe('Empty database', () => {
  it('Practice page', () => {
    cy.visit('/ideas/practice');
    cy.contains('No ideas have been found.');
  });
});
