const pool = require('../config/db');

const Chat = {
    // Get or create conversation for user
    getOrCreateConversation: async (userId) => {
        // Check if user already has an active conversation
        let [conversations] = await pool.query(
            'SELECT * FROM chat_conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
            [userId]
        );

        if (conversations.length > 0) {
            return conversations[0];
        }

        // Create new conversation
        const [result] = await pool.query(
            'INSERT INTO chat_conversations (user_id) VALUES (?)',
            [userId]
        );

        const [newConversation] = await pool.query(
            'SELECT * FROM chat_conversations WHERE conversation_id = ?',
            [result.insertId]
        );

        return newConversation[0];
    },

    // Get all messages in a conversation
    getMessages: async (conversationId) => {
        const [messages] = await pool.query(
            `SELECT cm.*, CONCAT(u.first_name, ' ', u.last_name) as sender_name, u.email as sender_email
             FROM chat_messages cm
             LEFT JOIN users u ON cm.sender_id = u.user_id
             WHERE cm.conversation_id = ?
             ORDER BY cm.created_at ASC`,
            [conversationId]
        );
        return messages;
    },

    // Send a message
    sendMessage: async (conversationId, senderType, senderId, message) => {
        const [result] = await pool.query(
            'INSERT INTO chat_messages (conversation_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)',
            [conversationId, senderType, senderId, message]
        );

        const messageId = result.insertId;

        // Update conversation's updated_at
        await pool.query(
            'UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE conversation_id = ?',
            [conversationId]
        );

        // Get the full message with sender details
        const [messages] = await pool.query(
            `SELECT cm.*, CONCAT(u.first_name, ' ', u.last_name) as sender_name, u.email as sender_email
             FROM chat_messages cm
             LEFT JOIN users u ON cm.sender_id = u.user_id
             WHERE cm.message_id = ?`,
            [messageId]
        );

        return messages[0];
    },

    // Mark messages as read
    markAsRead: async (conversationId, senderType) => {
        // Mark all messages from the opposite sender as read
        const oppositeSenderType = senderType === 'user' ? 'admin' : 'user';
        await pool.query(
            'UPDATE chat_messages SET is_read = TRUE WHERE conversation_id = ? AND sender_type = ?',
            [conversationId, oppositeSenderType]
        );
    },

    // Get all conversations (for admin)
    getAllConversations: async () => {
        const [conversations] = await pool.query(
            `SELECT cc.*, CONCAT(u.first_name, ' ', u.last_name) as name, u.email,
                    (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = cc.conversation_id AND sender_type = 'user' AND is_read = FALSE) as unread_count,
                    (SELECT message FROM chat_messages WHERE conversation_id = cc.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM chat_messages WHERE conversation_id = cc.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message_at
             FROM chat_conversations cc
             JOIN users u ON cc.user_id = u.user_id
             ORDER BY cc.updated_at DESC`
        );
        return conversations;
    },

    // Get conversation by ID
    getConversationById: async (conversationId) => {
        const [conversations] = await pool.query(
            `SELECT cc.*, CONCAT(u.first_name, ' ', u.last_name) as name, u.email
             FROM chat_conversations cc
             JOIN users u ON cc.user_id = u.user_id
             WHERE cc.conversation_id = ?`,
            [conversationId]
        );
        return conversations[0];
    },

    // Close conversation
    closeConversation: async (conversationId) => {
        // Toggle status: if open -> closed, if closed -> open
        await pool.query(
            `UPDATE chat_conversations 
             SET status = CASE 
                WHEN status = 'open' THEN 'closed' 
                ELSE 'open' 
             END 
             WHERE conversation_id = ?`,
            [conversationId]
        );
    }
};

module.exports = Chat;
