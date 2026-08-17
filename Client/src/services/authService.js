import api from './api';

/**
 * @file authService.js
 * @description Xử lý tất cả API liên quan đến Authentication
 * Single Responsibility: Quản lý login, signup, OTP, password reset
 */

export const login = (email, password) =>
  api.post('/users/login', { email, password });

export const signup = (userData) =>
  api.post('/users/signup', userData);

export const verifyOTP = (email, otp) =>
  api.post('/users/verify-otp', { email, otp });

export const resendOTP = (email) =>
  api.post('/users/resend-otp', { email });

export const forgotPassword = (email) =>
  api.post('/users/forgot-password', { email });

export const resetPassword = (email, otp, newPassword) =>
  api.post('/users/reset-password', { email, otp, newPassword });

export default {
  login,
  signup,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
};
