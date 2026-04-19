const express = require('express');
const router = express.Router();
const aiRuleController = require('../controllers/aiRuleController'); // Dẫn tới file controller đã tạo ở bước trước

// Route lấy danh sách luật AI
router.get('/', aiRuleController.getAiRules);

module.exports = router;