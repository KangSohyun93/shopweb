const Chat = require('../models/chat');

// Get or create conversation for current user
exports.getUserConversation = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const conversation = await Chat.getOrCreateConversation(userId);
        res.json(conversation);
    } catch (error) {
        console.error('Error getting conversation:', error);
        res.status(500).json({ error: 'Lỗi khi tải cuộc trò chuyện' });
    }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.user_id;
        const isAdmin = req.user.role === 'admin';

        // Verify user has access to this conversation
        if (!isAdmin) {
            const conversation = await Chat.getConversationById(conversationId);
            if (!conversation || conversation.user_id !== userId) {
                return res.status(403).json({ error: 'Không có quyền truy cập' });
            }
        }

        const messages = await Chat.getMessages(conversationId);
        
        // Mark messages as read
        const senderType = isAdmin ? 'admin' : 'user';
        await Chat.markAsRead(conversationId, senderType);

        res.json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ error: 'Lỗi khi tải tin nhắn' });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { message } = req.body;
        const userId = req.user.user_id;
        const isAdmin = req.user.role === 'admin';

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Tin nhắn không được để trống' });
        }

        // Verify user has access to this conversation
        if (!isAdmin) {
            const conversation = await Chat.getConversationById(conversationId);
            if (!conversation || conversation.user_id !== userId) {
                return res.status(403).json({ error: 'Không có quyền truy cập' });
            }
        }

        const senderType = isAdmin ? 'admin' : 'user';
        const messageId = await Chat.sendMessage(conversationId, senderType, userId, message);

        const [messages] = await Chat.getMessages(conversationId);
        const newMessage = messages.find(m => m.message_id === messageId);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Lỗi khi gửi tin nhắn' });
    }
};

// Get all conversations (admin only)
exports.getAllConversations = async (req, res) => {
    try {
        const conversations = await Chat.getAllConversations();
        res.json(conversations);
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ error: 'Lỗi khi tải danh sách cuộc trò chuyện' });
    }
};

// Get conversation details (admin only)
exports.getConversationDetails = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const conversation = await Chat.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện' });
        }

        // Get messages for this conversation
        const messages = await Chat.getMessages(conversationId);

        res.json({
            ...conversation,
            messages
        });
    } catch (error) {
        console.error('Error getting conversation details:', error);
        res.status(500).json({ error: 'Lỗi khi tải thông tin cuộc trò chuyện' });
    }
};

// Close conversation (admin only)
exports.closeConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        await Chat.closeConversation(conversationId);
        res.json({ message: 'Đã đóng cuộc trò chuyện' });
    } catch (error) {
        console.error('Error closing conversation:', error);
        res.status(500).json({ error: 'Lỗi khi đóng cuộc trò chuyện' });
    }
};
