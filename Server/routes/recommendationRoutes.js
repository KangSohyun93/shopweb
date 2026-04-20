const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Route: GET /api/recommendations/homepage (Phải đặt trước :product_id để tránh nhầm lẫn)
router.get('/homepage', recommendationController.getHomepageRecommendations);

// Route: GET /api/recommendations/product/:product_id (ProductDetail recommendations)
router.get('/product/:product_id', recommendationController.getRecommendations);

// Route: GET /api/recommendations/:product_id (Fallback - compatibility)
router.get('/:product_id', recommendationController.getRecommendations);

module.exports = router;