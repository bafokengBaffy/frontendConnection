/* eslint-disable no-undef */
// @ts-ignore
describe('Authentication Flow', () => {
  // @ts-ignore
  beforeEach(() => {
    // @ts-ignore
    cy.visit('/');
  });

  // @ts-ignore
  it('should display login form', () => {
    // @ts-ignore
    cy.get('[data-testid="login-form"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="email-input"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="password-input"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="login-button"]').should('be.visible');
  });

  // @ts-ignore
  it('should show error with invalid credentials', () => {
    // @ts-ignore
    cy.get('[data-testid="email-input"]').type('invalid@email.com');
    // @ts-ignore
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    // @ts-ignore
    cy.get('[data-testid="login-button"]').click();
    // @ts-ignore
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  // @ts-ignore
  it('should login successfully with valid credentials', () => {
    // @ts-ignore
    cy.get('[data-testid="email-input"]').type('student@test.com');
    // @ts-ignore
    cy.get('[data-testid="password-input"]').type('Test123!@#');
    // @ts-ignore
    cy.get('[data-testid="login-button"]').click();
    // @ts-ignore
    cy.url().should('include', '/dashboard');
  });

  // @ts-ignore
  it('should navigate to registration page', () => {
    // @ts-ignore
    cy.get('[data-testid="register-link"]').click();
    // @ts-ignore
    cy.url().should('include', '/register');
    // @ts-ignore
    cy.get('[data-testid="registration-form"]').should('be.visible');
  });

  // @ts-ignore
  it('should logout successfully', () => {
    // @ts-ignore
    cy.login('student@test.com', 'Test123!@#');
    // @ts-ignore
    cy.get('[data-testid="user-menu"]').click();
    // @ts-ignore
    cy.get('[data-testid="logout-button"]').click();
    // @ts-ignore
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    // @ts-ignore
    cy.get('[data-testid="login-form"]').should('be.visible');
  });
});
