// @ts-nocheck
/* eslint-disable no-undef */
import { mount } from 'cypress/react18';
import './commands';

Cypress.Commands.add('mount', mount);

// Example mount with providers
Cypress.Commands.add('mountWithProviders', (component, options = {}) => {
  const { routerProps = {}, ...mountOptions } = options;

  const wrapped = (
    <BrowserRouter {...routerProps}>
      <AuthProvider>
        <ThemeProvider>{component}</ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );

  return mount(wrapped, mountOptions);
});
