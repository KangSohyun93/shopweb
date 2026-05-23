import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * @file recommendationService.js
 * @description Xử lý tất cả API liên quan đến Recommendations
 * Single Responsibility: Quản lý gợi ý sản phẩm
 */

export const getRecommendations = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/recommendations/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export default {
  getRecommendations,
};
