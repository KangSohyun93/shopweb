const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Log để kiểm tra route
router.use((req, res, next) => {
  console.log('Route hit:', req.path, 'User:', req.user);
  next();
});

// Routes
router.post('/', authenticateJWT, orderController.createOrder);
router.get('/', authenticateJWT, orderController.getOrders);
router.get('/admin', authenticateJWT, isAdmin, (req, res, next) => {
  console.log('Admin route hit, user:', req.user);
  next();
}, orderController.getAllOrders);
router.get('/admin/:id', authenticateJWT, isAdmin, orderController.getById);
router.get('/:id', authenticateJWT, orderController.getById); // Route cho user
router.put('/admin/:id/status', authenticateJWT, isAdmin, orderController.updateOrderStatus);

module.exports = router;