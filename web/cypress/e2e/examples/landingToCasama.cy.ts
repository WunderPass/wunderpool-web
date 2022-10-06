//This is also more for

describe('Reach CasamaApp from the Landing Page', () => {
  it('Visit Landing Page', () => {
    cy.visit('https://casama.io');
  });
  it('Clicks on LaunchApp', () => {
    cy.contains('Launch App').click();
  });
  it('Should reach Casama', () => {
    cy.url().should('include', 'app.casama.io');
  });
});
export {};
