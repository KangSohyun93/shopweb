const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// User routes
router.get('/my-conversation', authenticateJWT, chatController.getUserConversation);
router.get('/:conversationId/messages', authenticateJWT, chatController.getMessages);
router.post('/:conversationId/messages', authenticateJWT, chatController.sendMessage);

// Admin routes
router.get('/admin/conversations', authenticateJWT, isAdmin, chatController.getAllConversations);
router.get('/admin/conversations/:conversationId', authenticateJWT, isAdmin, chatController.getConversationDetails);
router.put('/admin/conversations/:conversationId/close', authenticateJWT, isAdmin, chatController.closeConversation);

module.exports = router;
