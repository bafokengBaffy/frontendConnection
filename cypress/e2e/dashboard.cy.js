const { describe, beforeEach } = require('node:test');

/* eslint-disable no-undef */
describe('Dashboard Navigation', () => {
  beforeEach(() => {
    // @ts-ignore
    cy.login('student@test.com', 'Test123!@#');
    // @ts-ignore
    cy.visit('/dashboard');
  });

  // @ts-ignore
  it('should display dashboard correctly', () => {
    // @ts-ignore
    cy.get('[data-testid="dashboard-title"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="sidebar"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="main-content"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="metrics-grid"]').children().should('have.length.at.least', 4);
  });

  // @ts-ignore
  it('should navigate to different sections', () => {
    // Profile section
    // @ts-ignore
    cy.get('[data-testid="nav-profile"]').click();
    // @ts-ignore
    cy.url().should('include', '/profile');
    // @ts-ignore
    cy.get('[data-testid="profile-form"]').should('be.visible');

    // Jobs section
    // @ts-ignore
    cy.get('[data-testid="nav-jobs"]').click();
    // @ts-ignore
    cy.url().should('include', '/jobs');
    // @ts-ignore
    cy.get('[data-testid="jobs-list"]').should('be.visible');

    // Applications section
    // @ts-ignore
    cy.get('[data-testid="nav-applications"]').click();
    // @ts-ignore
    cy.url().should('include', '/applications');
    // @ts-ignore
    cy.get('[data-testid="applications-table"]').should('be.visible');
  });

  // @ts-ignore
  it('should display user info correctly', () => {
    // @ts-ignore
    cy.get('[data-testid="user-name"]').should('contain', 'Test User');
    // @ts-ignore
    cy.get('[data-testid="user-avatar"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="user-role"]').should('contain', 'Student');
  });

  // @ts-ignore
  it('should handle notifications', () => {
    // @ts-ignore
    cy.get('[data-testid="notification-bell"]').click();
    // @ts-ignore
    cy.get('[data-testid="notification-panel"]').should('be.visible');
    // @ts-ignore
    cy.get('[data-testid="notification-item"]').should('have.length.at.least', 1);
  });
});
