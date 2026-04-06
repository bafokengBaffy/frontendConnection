// @ts-nocheck
/* eslint-disable no-undef */
// Import commands
import './commands';

// Hide fetch/XHR requests in command log
const app = window.top;
if (app) {
  app.console.log = () => {};
}

// Cypress.on('uncaught:exception', (err, runnable) => {
//   return false;
// });

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

afterEach(() => {
  // Clean up after tests
});
