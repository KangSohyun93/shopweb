import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';

import AdminLayout from './layouts/AdminLayout'; 
import CustomerLayout from './layouts/CustomerLayout'; 

import LoginPage from './pages/public/Login';
import SignUpPage from './pages/public/SignUp';
import VerifyOTPPage from './pages/public/VerifyOTP';
import ForgotPasswordPage from './pages/public/ForgotPassword';
import ResetPasswordPage from './pages/public/ResetPassword';
import HomePage from './pages/customer/HomePage';
import CategoryPage from './pages/customer/CategoryPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetail'; 
import SearchResultsPage from './pages/customer/SearchResultsPage';
import ProfilePage from './pages/customer/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboard';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetail';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminChatPage from './pages/admin/AdminChatPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AIRulesDashboard from './pages/admin/AIRulesDashboard';
import VNPayReturnPage from './pages/customer/VNPayReturnPage';

import './App.css';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/payment/vnpay-return" element={<VNPayReturnPage />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/banners" element={<AdminBannersPage />} />
            <Route path="/admin/chat" element={<AdminChatPage />} />
            <Route path="/admin/ai-rules" element={<AIRulesDashboard />} />
          </Route>
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
