//This test tests if the pool creation works

describe('Create Pool', function () {
  before(() => {
    cy.visit('http://localhost:3001/pools');
    window.localStorage.setItem(
      'address',
      '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284'
    );
    window.localStorage.setItem('wunderId', 't-bitschnau');
    window.localStorage.setItem('loginMethod', 'WunderPass');
    window.localStorage.setItem('CASAMA_HIDEBALANCES_STATE', 'true');
  });

  it('Press Button "Create Pool"', () => {
    cy.contains('Create pool').click();

    //poolname
    cy.get('#poolName').type('PoolName');
    //pooldescription
    cy.get('#poolDescription').type('die description');
    //amount
    cy.get(':nth-child(5) > div > .textfield').type('$ 3');
    //click auf advanced
    cy.get('.ml-3').click();
    //minimum amount
    cy.get(':nth-child(1) > .textfield').type('$ 3');
    //maximum amount
    cy.get('.css-1p5q5e5-MuiStack-root > :nth-child(2) > .textfield').type(
      '$ 3'
    );
    //maxmembers auf 19 wechselns
    cy.get('#maxMembers').type('19');
    //click auf CONTINUE
    cy.get('.MuiDialogActions-root > .flex > .btn-casama').click();
    //Votings ausschalten
    cy.get('.MuiSwitch-input').uncheck();
    //duration of voting ändern
    cy.get('.pb-4.w-full > .flex-row > :nth-child(3) > .text-black').click();
    //votings anschalten
    cy.get('.MuiSwitch-input').check();
    //how many people have to vote ändern
    cy.get(':nth-child(3) > .flex-row > :nth-child(1) > .text-black').click();
    //how many % custom testen
    cy.get(':nth-child(2) > .flex-row > :nth-child(2) > .text-black').click();
    cy.get(':nth-child(2) > .flex-row > :nth-child(3) > .bg-gray-200').clear();
    cy.get(':nth-child(2) > .flex-row > :nth-child(3) > .bg-gray-200').type(
      '2'
    );
    //click auf CONTINUE
    cy.get('.MuiDialogActions-root > .flex > .btn-casama').click();
    //memberliste öffnen
    cy.get('[data-testid="ArrowDropDownIcon"]').click();
    //freund auswählen
    cy.contains('s-tschurilin').click();
    //freund 2 auswählen

    //fremde wunder id suchen

    //fremde wunder id auswählen

    //pool erstellen
  });
});
