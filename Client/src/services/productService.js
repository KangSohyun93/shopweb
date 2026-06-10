import api from './api';

/**
 * @file productService.js
 * @description Xử lý tất cả API liên quan đến Products
 * Single Responsibility: Quản lý products, search, variants
 */

export const getAllProducts = () =>
  api.get('/products');

export const searchProducts = async (query) => {
  try {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response;
  } catch (error) {
    console.error('Product search error:', error);
    throw error;
  }
};

export const getProductById = (product_id) =>
  api.get(`/products/${product_id}`);

export const getVariants = (product_id) =>
  api.get(`/product-variants${product_id ? `?product_id=${product_id}` : ''}`);

export const createProduct = (productData) =>
  api.post('/products', productData);

export const updateProduct = (product_id, productData) =>
  api.put(`/products/${product_id}`, productData);

export const deleteProduct = (product_id) =>
  api.delete(`/products/${product_id}`);

export const uploadPrimaryImage = (productId, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post(`/products/upload-primary-image/${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadAdditionalImage = (productId, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post(`/products/upload-additional-image/${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deletePrimaryImage = (productId) =>
  api.delete(`/products/delete-primary-image/${productId}`);

export const deleteAdditionalImage = (imageId) =>
  api.delete(`/products/delete-additional-image/${imageId}`);


export default {
  getAllProducts,
  searchProducts,
  getProductById,
  getVariants,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadPrimaryImage,
  uploadAdditionalImage,
  deletePrimaryImage,
  deleteAdditionalImage,
};
