const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateJWT } = require('../middleware/auth');

router.post('/', authenticateJWT, cartController.addToCart);

router.get('/', authenticateJWT, cartController.getCart);

router.put('/:cart_item_id', authenticateJWT, cartController.updateCartItem);

router.delete('/:cart_item_id', authenticateJWT, cartController.deleteCartItem);

router.put('/:cart_item_id/variant', authenticateJWT, cartController.updateCartItemVariant);

module.exports = router;

