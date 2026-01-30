const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

router.post('/apply', authenticateJWT, promotionController.applyPromotion); 
router.get('/', authenticateJWT, isAdmin, promotionController.getPromotions);
router.post('/', authenticateJWT, isAdmin, promotionController.createPromotion);
router.put('/:id', authenticateJWT, isAdmin, promotionController.updatePromotion); 
router.delete('/:id', authenticateJWT, isAdmin, promotionController.deletePromotion); 
router.get('/:id', authenticateJWT, isAdmin, promotionController.getPromotionById);

module.exports = router;
