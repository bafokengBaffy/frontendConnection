import React from 'react';

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './config/chartjs.config'; // Add this line
import ReactDOM from 'react-dom/client';
import App from "./App.jsx'; // Make sure this is './App' not './App.jsx";
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
