const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const { createPaymentUrl, vnpayReturn, vnpayIPN } = require('../controllers/vnpayController');

// Tạo URL thanh toán VNPay (yêu cầu đăng nhập)
router.post('/create-payment', authenticateJWT, createPaymentUrl);

// Return URL — VNPay redirect user về (không cần JWT vì là redirect từ VNPay)
router.get('/return', vnpayReturn);

// IPN — VNPay gọi server-to-server (không cần JWT)
router.get('/ipn', vnpayIPN);

module.exports = router;
