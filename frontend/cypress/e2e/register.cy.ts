describe('register page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/registration');
  });

  it('should show error when all the fields are blank', () => {
    cy.get('[data-cy="register"]').click();
    cy.get('[data-cy="error"]').should('exist');
  })

  it('should show error when password is too short ', () => {
    cy.get('[data-cy="lastname"]').type('test');
    cy.get('[data-cy="firstname"]').type('test');
    cy.get('[data-cy="username"]').type('test');
    cy.get('[data-cy="email"]').type('test@test.test');
    cy.get('[data-cy="password"]').type('test');
    cy.get('[data-cy="passwordagain"]').type('test');
    cy.get('[data-cy="gender-male"]').click();
    cy.get('label').contains('Születési dátum').parent().find('input').click().type('02/10/2024');
    cy.get('[data-cy="register"]').click();
    cy.get('[data-cy="error"]').should('contain', 'Password should be at least 6 characters');
  })

  it('should redirect ', () => {
    cy.get('[data-cy="lastname"]').type('test');
    cy.get('[data-cy="firstname"]').type('test');
    cy.get('[data-cy="username"]').type('test');
    cy.get('[data-cy="email"]').type('test@test.test');
    cy.get('[data-cy="password"]').type('testtest');
    cy.get('[data-cy="passwordagain"]').type('testtest');
    cy.get('[data-cy="gender-male"]').click();
    cy.get('label').contains('Születési dátum').parent().find('input').click().type('02/10/2024');
    // cy.get('[data-cy="register"]').click();
    cy.url().should('include', '/login')
  })
})