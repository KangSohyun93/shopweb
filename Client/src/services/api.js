import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) =>
  api.post('/users/login', { email, password });

export const signup = (userData) =>
  api.post('/users/signup', userData);

export const getAllProducts = () =>
  api.get('/products');

export const searchProducts = async (query) => {
  try {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    console.log('API call success - URL:', api.getUri(), 'Response:', response.data);
    return response;
  } catch (error) {
    console.error('API call error - URL:', api.getUri(), 'Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getVariants = (product_id) =>
  api.get(`/product-variants${product_id ? `?product_id=${product_id}` : ''}`);

export const getCart = () => api.get('/cart');

export const addToCart = (variant_id, quantity) =>
  api.post('/cart', { variant_id, quantity });

export const updateCartItem = (cart_item_id, quantity) =>
  api.put(`/cart/${cart_item_id}`, { quantity });

export const updateCartItemVariant = (cart_item_id, variant_id) =>
  api.put(`/cart/${cart_item_id}/variant`, { variant_id });

export const deleteCartItem = (cart_item_id) =>
  api.delete(`/cart/${cart_item_id}`);

export const getProductById = (product_id) =>
  api.get(`/products/${product_id}`);

export const getReviews = (product_id) =>
  api.get(`/reviews${product_id ? `?product_id=${product_id}` : ''}`);

export const applyPromotion = (code, total_amount) =>
  api.post('/promotions/apply', { code, total_amount });

export const createAddress = (addressData) =>
  api.post('/addresses', addressData);

export const createOrder = (orderData) =>
  api.post('/orders', orderData);

export const getAddresses = () =>
  api.get('/addresses');

export const getOrders = () =>
  api.get('/orders');

export const cancelOrder = (orderId) => api.put(`/orders/${orderId}/cancel`);

export const getAllAdminOrders = () => api.get('/orders/admin/all'); 
export const getOrderDetails = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export default api;