const express = require('express');
const router = express.Router();
const aiRuleController = require('../controllers/aiRuleController');
const aiSettingsController = require('../controllers/aiSettingsController');

// Route lấy danh sách luật AI
router.get('/', aiRuleController.getAiRules);

// Cấu hình 
router.get('/settings', aiSettingsController.getSettings);
router.put('/settings', aiSettingsController.updateSetting);
router.post('/run-worker', aiSettingsController.runMiningWorker);

// Lịch sử benchmark
router.get('/benchmark-logs', aiSettingsController.getBenchmarkLogs);

module.exports = router;