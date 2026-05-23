import api from './api';

/**
 * @file reviewService.js
 * @description Xử lý tất cả API liên quan đến Reviews
 * Single Responsibility: Quản lý đánh giá sản phẩm
 */

export const getReviews = (product_id) =>
  api.get(`/reviews${product_id ? `?product_id=${product_id}` : ''}`);

export const createReview = (reviewData) =>
  api.post('/reviews', reviewData);

export const updateReview = (reviewId, reviewData) =>
  api.put(`/reviews/${reviewId}`, reviewData);

export const getUserReview = (product_id, order_id) =>
  api.get(`/reviews/user-review?product_id=${product_id}&order_id=${order_id}`);

export default {
  getReviews,
  createReview,
  updateReview,
  getUserReview,
};
