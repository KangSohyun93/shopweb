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
  // FIX: Track unread count for the collapsed widget badge
  const [unreadCount, setUnreadCount] = useState(0);
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
      // FIX: Clear unread count when user opens the chat
      setUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, conversationId]);
 
  // Socket event listeners
  useEffect(() => {
    if (!socket || !conversationId) return;
 
    // Listen for new messages
    const handleNewMessage = (data) => {
      // FIX: Use == instead of === to handle int/string mismatch from socket
      if (String(data.conversationId) === String(conversationId)) {
        // Only add admin messages (user's own messages are handled via optimistic UI + handleMessageSent)
        if (data.sender_type === 'admin') {
          setMessages((prev) => {
            const messageExists = prev.some(m => String(m.message_id) === String(data.message_id));
            if (messageExists) {
              console.log('⚠️ Message already exists, skipping duplicate');
              return prev;
            }
            return [...prev, data];
          });
 
          if (isOpen) {
            // Mark as read immediately since chat is open
            socket.emit('chat:mark-read', conversationId);
          } else {
            // FIX: Increment unread count when widget is closed
            setUnreadCount(prev => prev + 1);
          }
        }
      }
    };
 
    // Listen for message sent confirmation — replace temp optimistic message with real one
    const handleMessageSent = (message) => {
      // FIX: Use String() comparison for safety
      if (String(message.conversation_id) !== String(conversationId)) return;
 
      setMessages((prev) => {
        // Try to replace temp message first
        const hasTempMessage = prev.some(m => m.pending === true);
        if (hasTempMessage) {
          return prev.map(msg =>
            msg.pending === true && msg.message === message.message
              ? { ...message, pending: false }
              : msg
          );
        }
        // If no temp message found, check for duplicate before adding
        const messageExists = prev.some(m => String(m.message_id) === String(message.message_id));
        if (messageExists) {
          console.log('⚠️ Message already exists, skipping duplicate');
          return prev;
        }
        return [...prev, message];
      });
    };
 
    // Listen for typing indicator
    const handleTypingIndicator = (data) => {
      if (String(data.conversationId) === String(conversationId) && data.isAdmin) {
        setIsTyping(data.isTyping);
      }
    };
 
    // Listen for messages marked as read
    const handleMessagesRead = (convId) => {
      if (String(convId) === String(conversationId)) {
        setMessages((prev) =>
          prev.map((msg) => ({ ...msg, is_read: 1 }))
        );
      }
    };
 
    socket.on('chat:new-message', handleNewMessage);
    socket.on('chat:message-sent', handleMessageSent);
    socket.on('chat:typing', handleTypingIndicator);
    socket.on('chat:messages-read', handleMessagesRead);
 
    // Mark messages as read when chat is open
    if (isOpen) {
      socket.emit('chat:mark-read', conversationId);
    }
 
    return () => {
      socket.off('chat:new-message', handleNewMessage);
      socket.off('chat:message-sent', handleMessageSent);
      socket.off('chat:typing', handleTypingIndicator);
      socket.off('chat:messages-read', handleMessagesRead);
    };
  // FIX: Add isOpen to deps so the handler knows current open state
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
 
  // FIX: When opening the chat, reset unread count and mark as read
  const handleToggleOpen = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      setUnreadCount(0);
      if (socket && conversationId) {
        socket.emit('chat:mark-read', conversationId);
      }
    }
  };
 
  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log('🔵 handleSendMessage called');
 
    if (!newMessage.trim() || !conversationId || sending || !socket) {
      console.log('❌ Validation failed - cannot send message');
      return;
    }
 
    try {
      setSending(true);
 
      const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
 
      const messageText = newMessage.trim();
 
      // Optimistic UI: Add message immediately
      const tempMessage = {
        message_id: `temp_${Date.now()}`,
        message: messageText,
        sender_type: 'user',
        created_at: new Date().toISOString(),
        is_read: 0,
        pending: true,
      };
 
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
 
      // Send via socket with callback
      socket.emit('chat:send-message', {
        conversationId,
        message: messageText,
        senderType: 'user',
        senderId: payload.user_id
      }, (response) => {
        if (response.success) {
          console.log('✅ Message sent successfully:', response.data);
 
          // Replace temp message with real message from server
          setMessages(prev =>
            prev.map(msg =>
              msg.message_id === tempMessage.message_id
                ? { ...response.data, pending: false }
                : msg
            )
          );
 
          socket.emit('chat:typing', { conversationId, isTyping: false });
        } else {
          console.error('❌ Error sending message:', response.error);
          // Remove temp message on error
          setMessages(prev => prev.filter(msg => msg.message_id !== tempMessage.message_id));
          alert(`Lỗi gửi tin nhắn: ${response.error}`);
        }
        setSending(false);
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
      setSending(false);
    }
  };
 
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
 
    if (!socket || !conversationId) return;
 
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
 
    socket.emit('chat:typing', { conversationId, isTyping: true });
 
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
        onClick={handleToggleOpen}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50 transition-transform hover:scale-110"
        aria-label="Chat với admin"
      >
        {/* FIX: Show unread badge on collapsed button */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
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
              onClick={handleToggleOpen}
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
                    key={message.message_id}
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
                      <div className="flex justify-between items-center gap-2 mt-1">
                        <p
                          className={`text-xs ${
                            message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.created_at)}
                        </p>
                        {message.pending && (
                          <span className="text-xs text-blue-100 animate-pulse">Đang gửi...</span>
                        )}
                      </div>
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
 