describe('Login', () => {
  describe('Unauthorized User', () => {
    // Start from the index page
    cy.visit('http://localhost:3001/');
  });

  describe('Authorized User', () => {});
});
export {};
