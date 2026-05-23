import api from './api';

/**
 * @file cartService.js
 * @description Xử lý tất cả API liên quan đến Cart
 * Single Responsibility: Quản lý giỏ hàng
 */

export const getCart = () => api.get('/cart');

export const addToCart = (variant_id, quantity) =>
  api.post('/cart', { variant_id, quantity });

export const updateCartItem = (cart_item_id, quantity) =>
  api.put(`/cart/${cart_item_id}`, { quantity });

export const updateCartItemVariant = (cart_item_id, variant_id) =>
  api.put(`/cart/${cart_item_id}/variant`, { variant_id });

export const deleteCartItem = (cart_item_id) =>
  api.delete(`/cart/${cart_item_id}`);

export default {
  getCart,
  addToCart,
  updateCartItem,
  updateCartItemVariant,
  deleteCartItem,
};
