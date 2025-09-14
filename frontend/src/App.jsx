// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Homepage from './components/Homepage.jsx';
import LoginPage from './components/LoginPage.jsx';
import Createacc from './components/Createacc.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import UserList from './components/Userlist.jsx';
import ProductsPage from './components/Productspage.jsx';
import ContactPage from './components/Contactpage.jsx';
import FaqPage from './components/FaqPage.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<Createacc />} />
        <Route path="/products-page" element={<ProductsPage />} />
        <Route path="/contact-page" element={<ContactPage />} />
        <Route path="/faq-page" element={<FaqPage />} />
       
        <Route path="/admin-dashboard" element={
          <AdminRoute>
            <Dashboard />
            </AdminRoute>
            }/>
        <Route path="/userlist" element={
            <AdminRoute>
              <UserList />
            </AdminRoute>
          }/>
      </Routes>
    </Router>
  );
}
export default App;
