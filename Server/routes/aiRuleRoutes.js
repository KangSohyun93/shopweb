const express = require('express');
const router = express.Router();
const aiRuleController = require('../controllers/aiRuleController');
const aiSettingsController = require('../controllers/aiSettingsController');

// Route lấy danh sách luật AI
router.get('/', aiRuleController.getAiRules);

// Cấu hình AI
router.get('/settings', aiSettingsController.getSettings);
router.put('/settings', aiSettingsController.updateSetting);
router.post('/run-worker', aiSettingsController.runMiningWorker);

module.exports = router;