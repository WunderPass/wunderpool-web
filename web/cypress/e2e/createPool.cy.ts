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
    cy.get('#amount').type('$ 3');
    //click auf advanced
    cy.get('#advanced').click();
    //minimum amount
    cy.get('#minAmount').type('$ 3');
    //maximum amount
    cy.get('#maxAmount').type('$ 3');
    //maxmembers auf 19 wechselns
    cy.get('#maxMembers').type('19');
    //click auf CONTINUE
    cy.get('#continue').click();
    //Votings ausschalten
    cy.get('#votingSwitch').uncheck();
    //duration of voting ändern
    cy.get('#durationVotings').click();
    //votings anschalten
    cy.get('#votingSwitch').check();
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
    cy.contains('g-fricke').click();

    //fremde wunder id suchen

    //fremde wunder id auswählen

    //pool erstellen
  });
});
export {};
