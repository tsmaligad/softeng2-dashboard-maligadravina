import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ensure this path points to your App component
import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



reportWebVitals();