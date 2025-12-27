const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateJWT } = require('../middleware/auth');

router.post('/', authenticateJWT, reviewController.createReview);
router.get('/', reviewController.getReviews); // Công khai để xem đánh giá
router.get('/:id', reviewController.getReviewById); // Công khai để xem chi tiết
router.put('/:id', authenticateJWT, reviewController.updateReview);
router.delete('/:id', authenticateJWT, reviewController.deleteReview);

module.exports = router;