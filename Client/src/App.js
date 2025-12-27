import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AdminLayout from './layouts/AminLayout'; 
import CustomerLayout from './layouts/CustomerLayout'; 

import LoginPage from './pages/public/Login';
import SignUpPage from './pages/public/SignUp';
import HomePage from './pages/customer/HomePage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetail'; 
import SearchResultsPage from './pages/customer/SearchResultsPage';
import AdminDashboardPage from './pages/admin/AdminDashboard';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetail';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
