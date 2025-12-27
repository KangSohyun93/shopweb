const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

router.get('/admin/all', authenticateJWT, isAdmin, orderController.getAllOrdersForAdmin);
router.put('/:id/status', authenticateJWT, isAdmin, orderController.updateOrderStatus);
router.post('/', authenticateJWT, orderController.createOrder);
router.get('/', authenticateJWT, orderController.getUserOrders);
router.put('/:id/cancel', authenticateJWT, orderController.cancelOrder);
router.get('/:id', authenticateJWT, orderController.getOrderById);

module.exports = router;
