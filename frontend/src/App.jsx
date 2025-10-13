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
import ProductDetail from './components/ProductDetail.jsx';
import ContactPage from './components/Contactpage.jsx';
import FaqPage from './components/FaqPage.jsx';
import AboutUs from './components/Aboutus.jsx';
import Inventory from './components/Inventory.jsx';
import RawMaterials from './components/RawMaterials.jsx';
import ScrollToTop from "./components/ScrollToTop";
import MyAccount from './components/Myaccount.jsx';

function App() {
  return (
    <Router>
      <ScrollToTop > 
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<Createacc />} />
        <Route path="/products-page" element={<ProductsPage />} />
        <Route path="/products-page/:id" element={<ProductDetail />} />
        <Route path="/contact-page" element={<ContactPage />} />
        <Route path="/faq-page" element={<FaqPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/my-account" element={<MyAccount />} />

        {/* Admin Routes */}
       
        <Route path="/admin-dashboard" element={
          <AdminRoute>
            <Dashboard />
            </AdminRoute>
            }/>
        <Route path="/inventory" element={
          <AdminRoute>
            <Inventory />
          </AdminRoute>
        }/>

<Route path="/rawmaterials" element={
          <AdminRoute>
            <RawMaterials />
          </AdminRoute>
        }/>
        <Route path="/userlist" element={
            <AdminRoute>
              <UserList />
            </AdminRoute>
          }/>
      </Routes>
      </ScrollToTop>
    </Router>
  );
}
export default App;
