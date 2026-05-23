import api from './api';

/**
 * @file promotionService.js
 * @description Xử lý tất cả API liên quan đến Promotions
 * Single Responsibility: Quản lý mã giảm giá
 */

export const applyPromotion = (code, total_amount) =>
  api.post('/promotions/apply', { code, total_amount });

export default {
  applyPromotion,
};
