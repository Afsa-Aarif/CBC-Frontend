// src/App.jsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// STRIPE INTEGRATION IMPORTS
import { loadStripe } from '@stripe/stripe-js'; 
import { Elements } from '@stripe/react-stripe-js';

import Header from './components/header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; 

// STANDARD PAGES
import Home from './pages/homePage.jsx'; 
import ProductPage from './pages/productPage.jsx'; 
import ProductOverview from './pages/productOverview.jsx'; 
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AdminPromotionsPage from './pages/admin/adminPromotionsPage.jsx'; // <-- NEW PROMOTIONS PAGE IMPORT
import Login from './pages/loginPage.jsx';
import Register from './pages/registerPage.jsx';
import CartPage from './pages/CartPage.jsx';
import Checkout from './pages/checkout.jsx';
import TestPage from './pages/test.jsx'; 

// MOBILE PROFILE COMPONENT & USER PAGES
import UserDataMobile from './components/userDataMobile.jsx'; 
import UserSettings from './pages/UserSettings.jsx';
import ForgetPassword from './pages/forget-password.jsx'; 

// PROFILE NESTED PAGES
import WishlistPage from './pages/profile/WishlistPage.jsx';
import MyOrdersPage from './pages/profile/MyOrdersPage.jsx';
import EditProfilePage from './pages/profile/EditProfilePage.jsx';

const stripePromise = loadStripe("pk_test_51TMDSpKnRpTeeHpYBhzAa5Lk9YRLU2BB3gzBsU9oY1fSMiYHlvL40FUoBN8ODAARRxqEfwj4SWr31Gt19GQz9b2600RYvJs3qQ");

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Header />
      
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Crystal Beauty...</div>}>
        <main className="min-h-screen">
          <Routes>
            {/* Core Features */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductPage />} /> 
            <Route path="/product/:id" element={<ProductOverview />} />

            {/* Navigation Pages */}
            <Route path="/shop" element={<Navigate to="/products" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Cart Page */}
            <Route path="/cart" element={<CartPage />} />
            
            {/* Secure Wrapped Checkout Route */}
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <Elements stripe={stripePromise}>
                  <Checkout />
                </Elements>
              </ProtectedRoute>
            } />
            
            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            
            {/* User Account & Profile Navigation */}
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <UserDataMobile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <UserSettings />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <WishlistPage />
              </ProtectedRoute>
            } />
            <Route path="/my-orders" element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <MyOrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/edit-profile" element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <EditProfilePage />
              </ProtectedRoute>
            } />

            {/* Testing Route */}
            <Route path="/test" element={<TestPage />} />

            {/* Standalone Admin Route for Direct Promotions Access */}
            <Route path="/admin/promotions" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPromotionsPage />
              </ProtectedRoute>
            } />

            {/* Admin Panel Dashboard */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage />
              </ProtectedRoute>
            } />

            {/* 404 Fallback */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <h1 className="text-9xl font-black text-slate-100">404</h1>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400 -mt-10 mb-8">Page Not Found</p>
                <button 
                  onClick={() => window.location.href="/"} 
                  className="bg-slate-900 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all"
                >
                  Back to Home
                </button>
              </div>
            } />
          </Routes>
        </main>
      </Suspense>
    </Router>
  );
}

export default App;