import axios from 'axios';
import authService from './authService';
import productService from './productService';
import cartService from './cartService';
import orderService from './orderService';
import reviewService from './reviewService';
import promotionService from './promotionService';
import addressService from './addressService';
import bannerService from './bannerService';
import chatService from './chatService';
import profileService from './profileService';
import recommendationService from './recommendationService';

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

/**
 * Service exports for organized API calls
 * Tách từng chức năng vào file riêng - Single Responsibility Principle
 */
export {
  authService,
  productService,
  cartService,
  orderService,
  reviewService,
  promotionService,
  addressService,
  bannerService,
  chatService,
  profileService,
  recommendationService,
};

/**
 * Backward compatibility - expose individual functions
 * (cho code cũ vẫn hoạt động)
 */
export const login = authService.login;
export const signup = authService.signup;
export const verifyOTP = authService.verifyOTP;
export const resendOTP = authService.resendOTP;
export const forgotPassword = authService.forgotPassword;
export const resetPassword = authService.resetPassword;

export const getAllProducts = productService.getAllProducts;
export const searchProducts = productService.searchProducts;
export const getProductById = productService.getProductById;
export const getVariants = productService.getVariants;
export const getReviews = reviewService.getReviews;
export const createReview = reviewService.createReview;
export const updateReview = reviewService.updateReview;
export const getUserReview = reviewService.getUserReview;

export const getCart = cartService.getCart;
export const addToCart = cartService.addToCart;
export const updateCartItem = cartService.updateCartItem;
export const updateCartItemVariant = cartService.updateCartItemVariant;
export const deleteCartItem = cartService.deleteCartItem;

export const uploadPrimaryImage = productService.uploadPrimaryImage;
export const uploadAdditionalImage = productService.uploadAdditionalImage;
export const deletePrimaryImage = productService.deletePrimaryImage;
export const deleteAdditionalImage = productService.deleteAdditionalImage;

export const applyPromotion = promotionService.applyPromotion;
export const createAddress = addressService.createAddress;
export const getAddresses = addressService.getAddresses;
export const deleteAddress = addressService.deleteAddress;

export const createOrder = orderService.createOrder;
export const getOrders = orderService.getOrders;
export const cancelOrder = orderService.cancelOrder;
export const getAllAdminOrders = orderService.getAllAdminOrders;
export const getOrderDetails = orderService.getOrderDetails;
export const updateOrderStatus = orderService.updateOrderStatus;
export const checkCanReturn = orderService.checkCanReturn;
export const requestReturn = orderService.requestReturn;

export const getActiveBanners = bannerService.getActiveBanners;
export const getAllBanners = bannerService.getAllBanners;
export const getBannerById = bannerService.getBannerById;
export const createBanner = bannerService.createBanner;
export const updateBanner = bannerService.updateBanner;
export const updateBannerStatus = bannerService.updateBannerStatus;
export const deleteBanner = bannerService.deleteBanner;
export const uploadBannerImage = bannerService.uploadBannerImage;

export const getUserConversation = chatService.getUserConversation;
export const getChatMessages = chatService.getChatMessages;
export const sendChatMessage = chatService.sendChatMessage;
export const getAllConversations = chatService.getAllConversations;
export const getConversationDetails = chatService.getConversationDetails;
export const closeConversation = chatService.closeConversation;

export const getRecommendations = recommendationService.getRecommendations;

export const getMyProfile = profileService.getMyProfile;
export const updateProfile = profileService.updateProfile;
export const changePassword = profileService.changePassword;

export default api;