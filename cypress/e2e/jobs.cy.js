/* eslint-disable no-undef */
// @ts-ignore
describe('Jobs Functionality', () => {
  // @ts-ignore
  beforeEach(() => {
    // @ts-ignore
    cy.login('student@test.com', 'Test123!@#');
    // @ts-ignore
    cy.visit('/jobs');
  });

  // @ts-ignore
  it('should display jobs list', () => {
    // @ts-ignore
    cy.get('[data-testid="jobs-list"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="job-card"]').should('have.length.at.least', 1);
    // @ts-ignore
    cy.get('[data-testid="job-title"]').first().should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="job-company"]').first().should('be.visible');
  });

  // @ts-ignore
  it('should filter jobs by search', () => {
    // @ts-ignore
    cy.get('[data-testid="search-input"]').type('developer');
    // @ts-ignore
    cy.get('[data-testid="search-button"]').click();
    // @ts-ignore
    cy.get('[data-testid="job-card"]').each(($card) => {
      // @ts-ignore
      cy.wrap($card).should('contain.text', 'developer');
    });
  });

  // @ts-ignore
  it('should filter jobs by category', () => {
    // @ts-ignore
    cy.get('[data-testid="category-filter"]').select('Technology');
    // @ts-ignore
    cy.get('[data-testid="job-card"]').each(($card) => {
      // @ts-ignore
      cy.wrap($card).should('contain.text', 'Technology');
    });
  });

  // @ts-ignore
  it('should view job details', () => {
    // @ts-ignore
    cy.get('[data-testid="job-card"]').first().click();
    // @ts-ignore
    cy.url().should('include', '/jobs/');
    // @ts-ignore
    cy.get('[data-testid="job-details"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="job-description"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="job-requirements"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="apply-button"]').should('be.visible');
  });

  // @ts-ignore
  it('should apply to job', () => {
    // @ts-ignore
    cy.get('[data-testid="job-card"]').first().click();
    // @ts-ignore
    cy.get('[data-testid="apply-button"]').click();
    // @ts-ignore
    cy.get('[data-testid="application-form"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="submit-application"]').click();
    // @ts-ignore
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
