import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx'; // Make sure this path is correct
import Dashboard from './components/Dashboard.jsx'; // Make sure this path is correct

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard  />} />  
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;