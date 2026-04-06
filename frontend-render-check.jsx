import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Home from './src/pages/Home.jsx';
import { AuthProvider } from './src/context/AuthContext.jsx';

try {
  const html = renderToString(
    <MemoryRouter>
      <AuthProvider>
        <Home />
      </AuthProvider>
    </MemoryRouter>
  );
  console.log('render ok', html.length);
} catch (error) {
  console.error('render failed');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
}
