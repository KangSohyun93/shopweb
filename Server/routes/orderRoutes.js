const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Lấy tất cả đơn hàng (phân trang)
router.get('/admin/all', authenticateJWT, isAdmin, orderController.getAllOrders);
router.put('/:id/status', authenticateJWT, isAdmin, orderController.updateOrderStatus);
router.post('/', authenticateJWT, orderController.createOrder);
router.get('/', authenticateJWT, orderController.getUserOrders);
router.put('/:id/cancel', authenticateJWT, orderController.cancelOrder);
router.get('/:id/can-return', authenticateJWT, orderController.checkCanReturn);
router.post('/:id/return', authenticateJWT, orderController.requestReturn);
router.get('/:id', authenticateJWT, orderController.getOrderById);

module.exports = router;
