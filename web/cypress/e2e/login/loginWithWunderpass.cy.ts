//This test tests if the right site is called if login with wunderpass is pressed

describe('window open', function () {
  before(() => {
    cy.visit('http://localhost:3001');
  });

  it('Window pop up', () => {
    const pop_url1 =
      'http://localhost:3000/oAuth?name=Casama&imageUrl=undefined&redirectUrl=http://localhost:3001/';
    const pop_url2 = 'http://localhost:3000/auth/create';

    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowopen');
    });
    cy.contains('Login with WunderPass').click();
    cy.get('@windowopen').should('be.calledWith', pop_url1);
    //unfinished
  });
});
