import api from './api';

/**
 * @file orderService.js
 * @description Xử lý tất cả API liên quan đến Orders
 * Single Responsibility: Quản lý đơn hàng
 */

export const createOrder = (orderData) =>
  api.post('/orders', orderData);

export const getOrders = () =>
  api.get('/orders');

export const getOrderDetails = (id) =>
  api.get(`/orders/${id}`);

export const cancelOrder = (orderId) =>
  api.put(`/orders/${orderId}/cancel`);

export const getAllAdminOrders = () =>
  api.get('/orders/admin/all');

export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });

export const checkCanReturn = (orderId) =>
  api.get(`/orders/${orderId}/can-return`);

export const requestReturn = (orderId, reason) =>
  api.post(`/orders/${orderId}/return`, { reason });

export default {
  createOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
  getAllAdminOrders,
  updateOrderStatus,
  checkCanReturn,
  requestReturn,
};
