const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
// Import middleware xác thực (không bắt buộc login nên dùng phiên bản optional nếu có)
// const { authenticateOptional } = require('../middleware/auth'); 

// POST /api/tracking
// Thêm middleware authenticateOptional vào giữa nếu bạn muốn lấy req.user.user_id
router.post('/', trackingController.trackBehavior);

module.exports = router;
