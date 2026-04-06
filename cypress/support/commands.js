/* eslint-disable no-undef */
// Custom login command
// @ts-ignore
Cypress.Commands.add('login', (email, password) => {
  // @ts-ignore
  cy.session([email, password], () => {
    // @ts-ignore
    cy.visit('/');
    // @ts-ignore
    cy.get('[data-testid="email-input"]').type(email);
    // @ts-ignore
    cy.get('[data-testid="password-input"]').type(password);
    // @ts-ignore
    cy.get('[data-testid="login-button"]').click();
    // @ts-ignore
    cy.url().should('include', '/dashboard');
  });
});

// Custom command to get element by data-testid
// @ts-ignore
Cypress.Commands.add('getByTestId', (testId) => {
  // @ts-ignore
  return cy.get(`[data-testid="${testId}"]`);
});

// Custom command to intercept API calls
// @ts-ignore
Cypress.Commands.add('interceptAPI', (method, url, fixture) => {
  // @ts-ignore
  return cy.intercept(method, url, { fixture });
});

// Custom command to wait for loading to finish
// @ts-ignore
Cypress.Commands.add('waitForLoading', () => {
  // @ts-ignore
  cy.get('[data-testid="loader"]').should('not.exist');
});

// Custom command to upload file
// @ts-ignore
Cypress.Commands.add('uploadFile', (selector, fileName) => {
  // @ts-ignore
  cy.get(selector).selectFile(`cypress/fixtures/${fileName}`, { force: true });
});

// Custom command to check toast message
// @ts-ignore
Cypress.Commands.add('checkToast', (message, type = 'success') => {
  // @ts-ignore
  cy.get(`[data-testid="toast-${type}"]`).should('contain', message);
});
