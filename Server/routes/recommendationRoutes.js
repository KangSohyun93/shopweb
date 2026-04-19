const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Route: GET /api/recommendations/:product_id
router.get('/:product_id', recommendationController.getRecommendations);

module.exports = router;