const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

router.get('/', authenticateJWT, isAdmin, promotionController.getPromotions);
router.get('/:id', authenticateJWT, isAdmin, promotionController.getPromotionById);
router.post('/', authenticateJWT, isAdmin, promotionController.createPromotion);
router.put('/:promotion_id', authenticateJWT, isAdmin, promotionController.updatePromotion);
router.delete('/:promotion_id', authenticateJWT, isAdmin, promotionController.deletePromotion);
router.post('/apply', authenticateJWT, promotionController.applyPromotion);

module.exports = router;