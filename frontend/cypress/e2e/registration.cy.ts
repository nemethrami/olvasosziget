import * as FirebaseService from '@services/FirebaseService';

describe('register page', () => {
  beforeEach(() => {
    cy.visit('/registration');
  });

  it('should show error when all the fields are blank', () => {
    cy.get('[data-cy="register"]').click();
    cy.get('[data-cy="pw_obl"]').should('exist');
  })

  it('should show error when password is too short ', () => {
    cy.get('[data-cy="lastname"]').type('test');
    cy.get('[data-cy="firstname"]').type('test');
    cy.get('[data-cy="username"]').type('test');
    cy.get('[data-cy="email"]').type('test@test.test');
    cy.get('[data-cy="password"]').type('test');
    cy.get('[data-cy="passwordagain"]').type('test');
    cy.get('[data-cy="register"]').click();
    cy.get('[data-cy="error"]').should('contain', 'A megadott jelszó túl rövid! Legalább 6 karakter hosszúnak kell lennie!');
  })

  it('should redirect ', () => {
    const createUser = cy.stub().resolves({uid: 'fakeUid'});
    const addDataToCollection = cy.stub().resolves('success');

    cy.stub(FirebaseService, 'createUser').callsFake(createUser);
    cy.stub(FirebaseService, 'addDataToCollection').callsFake(addDataToCollection);

    cy.get('[data-cy="lastname"]').type('test');
    cy.get('[data-cy="firstname"]').type('test');
    cy.get('[data-cy="username"]').type('test');
    cy.get('[data-cy="email"]').type('test@test.test');
    cy.get('[data-cy="password"]').type('testtest');
    cy.get('[data-cy="passwordagain"]').type('testtest');
    cy.get('[data-cy="gender-male"]').click();
    cy.get('label').contains('Születési dátum').parent().find('input').click().type('02/10/2024');
    //cy.get('[data-cy="register"]').click();
    //cy.wrap(testFnStub).should('have.been.called');
    //cy.url().should('include', '/login');
  })
})