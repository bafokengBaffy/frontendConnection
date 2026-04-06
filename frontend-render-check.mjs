import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Home from './src/pages/Home.jsx';
import { AuthProvider } from './src/context/AuthContext.jsx';

const html = renderToString(
  React.createElement(
    MemoryRouter,
    {},
    React.createElement(AuthProvider, {}, React.createElement(Home))
  )
);
console.log('render ok', html.length);
