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

export const verifyOTP = (email, otp) =>
  api.post('/users/verify-otp', { email, otp });

export const resendOTP = (email) =>
  api.post('/users/resend-otp', { email });

export const forgotPassword = (email) =>
  api.post('/users/forgot-password', { email });

export const resetPassword = (email, otp, newPassword) =>
  api.post('/users/reset-password', { email, otp, newPassword });

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

export const createReview = (reviewData) =>
  api.post('/reviews', reviewData);

export const updateReview = (reviewId, reviewData) =>
  api.put(`/reviews/${reviewId}`, reviewData);

export const getUserReview = (product_id, order_id) =>
  api.get(`/reviews/user-review?product_id=${product_id}&order_id=${order_id}`);

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

// Return APIs
export const checkCanReturn = (orderId) => api.get(`/orders/${orderId}/can-return`);
export const requestReturn = (orderId, reason) => api.post(`/orders/${orderId}/return`, { reason });

// Profile APIs
export const getMyProfile = () => api.get('/users/profile/me');
export const updateProfile = (profileData) => api.put('/users/profile/me', profileData);
export const changePassword = (passwordData) => api.put('/users/profile/change-password', passwordData);
export const deleteAddress = (addressId) => api.delete(`/addresses/${addressId}`);

// Banner APIs
export const getActiveBanners = () => api.get('/banners/active');
export const getAllBanners = () => api.get('/banners');
export const getBannerById = (id) => api.get(`/banners/${id}`);
export const createBanner = (bannerData) => api.post('/banners', bannerData);
export const updateBanner = (id, bannerData) => api.put(`/banners/${id}`, bannerData);
export const updateBannerStatus = (id, isActive) => api.patch(`/banners/${id}/status`, { is_active: isActive });
export const deleteBanner = (id) => api.delete(`/banners/${id}`);
export const uploadBannerImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/banners/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Chat APIs
export const getUserConversation = () => api.get('/chat/my-conversation');
export const getChatMessages = (conversationId) => api.get(`/chat/${conversationId}/messages`);
export const sendChatMessage = (conversationId, message) => api.post(`/chat/${conversationId}/messages`, { message });
export const getAllConversations = () => api.get('/chat/admin/conversations');
export const getConversationDetails = (conversationId) => api.get(`/chat/admin/conversations/${conversationId}`);
export const closeConversation = (conversationId) => api.put(`/chat/admin/conversations/${conversationId}/close`);

export default api;