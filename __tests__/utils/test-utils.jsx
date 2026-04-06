/* eslint-disable no-unused-vars */
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '../../src/context/AuthContext';
import { ThemeProvider } from '../../src/context/ThemeContext';
import { NotificationProvider } from '../../src/context/NotificationContext';

// Custom render with providers
function render(ui, { route = '/', authState = { user: null, loading: false }, ...options } = {}) {
  window.history.pushState({}, 'Test page', route);

  const Wrapper = ({ children }) => {
    return (
      <BrowserRouter>
        <AuthProvider initialState={authState}>
          <ThemeProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { render };
