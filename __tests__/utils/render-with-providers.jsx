/* eslint-disable no-unused-vars */
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '../../src/context/AuthContext';
import { ThemeProvider } from '../../src/context/ThemeContext';
import { NotificationProvider } from '../../src/context/NotificationContext';
import { SettingsProvider } from '../../src/context/SettingsContext';
import { PaymentProvider } from '../../src/context/PaymentContext';

export const renderWithAllProviders = (ui, options = {}) => {
  const { route = '/', authState = { user: null, loading: false }, ...renderOptions } = options;

  window.history.pushState({}, 'Test page', route);

  const AllProviders = ({ children }) => {
    return (
      <BrowserRouter>
        <AuthProvider initialState={authState}>
          <ThemeProvider>
            <NotificationProvider>
              <SettingsProvider>
                <PaymentProvider>{children}</PaymentProvider>
              </SettingsProvider>
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllProviders, ...renderOptions });
};

export const renderWithAuth = (ui, { user = null, loading = false } = {}) => {
  return renderWithAllProviders(ui, {
    authState: { user, loading },
  });
};

export const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  const RouterWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

  return render(ui, { wrapper: RouterWrapper });
};
