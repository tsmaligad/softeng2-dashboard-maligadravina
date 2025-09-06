import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Homepage from './components/Homepage.jsx';
import LoginPage from './components/LoginPage.jsx';
import Createacc from './components/Createacc.jsx';
import LoginAdmin from './components/LoginAdmin.jsx';
import Dashboard from './components/Dashboard.jsx';   
import AdminRoute from './routes/AdminRoute.jsx';   // ✅ now points to routes folder
import UserList from './components/Userlist.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<Createacc />} />

        {/* Admin auth */}
        <Route path="/admin-login" element={<LoginAdmin />} />
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/userlist"
          element={
            <AdminRoute>
              <UserList />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
