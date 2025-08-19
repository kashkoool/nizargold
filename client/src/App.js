import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './login/Login';
import OwnerDashboard from './pages/Owner/Dashboard';
import Home from './pages/Home';
import WelcomePage from './pages/WelcomePage';
import ProtectedRoute from './components/ProtectedRoute';
import Regesiter from './regesiter/Regesiter';
import Dashbaord from './pages/Customer/Dashbaord';
import FavoritesPage from './pages/Customer/FavoritesPage';
import ProfilePage from './pages/Customer/ProfilePage';
import NewProductsPage from './pages/Customer/NewProductsPage';
import AllProductsPage from './pages/Customer/AllProductsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Regesiter />} />
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute role="owner">
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute role="customer">
            <Dashbaord />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/favorites"
        element={
          <ProtectedRoute role="customer">
            <FavoritesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute role="customer">
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/new-products"
        element={
          <ProtectedRoute role="customer">
            <NewProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/all-products"
        element={
          <ProtectedRoute role="customer">
            <AllProductsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
