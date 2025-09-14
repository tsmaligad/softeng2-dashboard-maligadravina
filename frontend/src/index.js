import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ensure this path points to your App component
import reportWebVitals from './reportWebVitals';
import "@fontsource/kapakana"; // defaults to weight 400

import { api } from './utils/api';   // ⬅ add this
window.api = api;                    // ⬅ now callable from DevTools
console.log('[index] app booted');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



reportWebVitals();