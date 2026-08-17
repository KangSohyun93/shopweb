import api from './api';

/**
 * @file addressService.js
 * @description Xử lý tất cả API liên quan đến Addresses
 * Single Responsibility: Quản lý địa chỉ giao hàng
 */

export const getAddresses = () =>
  api.get('/addresses');

export const createAddress = (addressData) =>
  api.post('/addresses', addressData);

export const deleteAddress = (addressId) =>
  api.delete(`/addresses/${addressId}`);

export default {
  getAddresses,
  createAddress,
  deleteAddress,
};
