import React, { useState, useEffect, useRef } from 'react';
import { getUserConversation, getChatMessages } from '../services/api';
import { useSocket } from '../contexts/SocketContext';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket, connected } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversationId) {
      loadConversation();
    }

    if (isOpen && conversationId) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, conversationId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data]);
        
        // Mark as read
        socket.emit('chat:mark-read', conversationId);
      }
    };

    // Listen for message sent confirmation
    const handleMessageSent = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    // Listen for typing indicator
    const handleTypingIndicator = (data) => {
      if (data.conversationId === conversationId && data.isAdmin) {
        setIsTyping(data.isTyping);
      }
    };

    // Listen for messages marked as read
    const handleMessagesRead = (convId) => {
      if (convId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => ({ ...msg, is_read: 1 }))
        );
      }
    };

    socket.on('chat:new-message', handleNewMessage);
    socket.on('chat:message-sent', handleMessageSent);
    socket.on('chat:typing', handleTypingIndicator);
    socket.on('chat:messages-read', handleMessagesRead);

    // Mark messages as read when opening chat
    if (isOpen) {
      socket.emit('chat:mark-read', conversationId);
    }

    return () => {
      socket.off('chat:new-message', handleNewMessage);
      socket.off('chat:message-sent', handleMessageSent);
      socket.off('chat:typing', handleTypingIndicator);
      socket.off('chat:messages-read', handleMessagesRead);
    };
  }, [socket, conversationId, isOpen]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const response = await getUserConversation();
      console.log('📦 Conversation response:', response.data);
      setConversationId(response.data.conversation_id);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const response = await getChatMessages(conversationId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log('🔵 handleSendMessage called');
    console.log('🔵 newMessage:', newMessage);
    console.log('🔵 conversationId:', conversationId);
    console.log('🔵 sending:', sending);
    console.log('🔵 socket:', socket);
    
    if (!newMessage.trim() || !conversationId || sending || !socket) {
      console.log('❌ Validation failed - cannot send message');
      return;
    }

    try {
      setSending(true);
      
      // Get user info from token
      const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      console.log('✅ Emitting chat:send-message with:', {
        conversationId,
        message: newMessage.trim(),
        senderType: 'user',
        senderId: payload.user_id
      });
      
      // Send via socket
      socket.emit('chat:send-message', {
        conversationId,
        message: newMessage.trim(),
        senderType: 'user',
        senderId: payload.user_id
      });
      
      setNewMessage('');
      
      // Stop typing indicator
      socket.emit('chat:typing', { conversationId, isTyping: false });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !conversationId) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Emit typing start
    socket.emit('chat:typing', { conversationId, isTyping: true });
    
    // Set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', { conversationId, isTyping: false });
    }, 2000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + ' ' +
             date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50 transition-transform hover:scale-110"
        aria-label="Chat với admin"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Hỗ trợ khách hàng</h3>
              <p className="text-xs text-blue-100">Chúng tôi thường trả lời trong vài phút</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 rounded-full p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-center">Gửi tin nhắn để bắt đầu cuộc trò chuyện</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        message.sender_type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      {message.sender_type === 'admin' && (
                        <p className="text-xs font-semibold mb-1 text-blue-600">
                          {message.sender_name || 'Admin'}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={sending || !connected}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending || !connected}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
            {!connected && (
              <p className="text-xs text-red-500 mt-1">Đang kết nối lại...</p>
            )}
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
