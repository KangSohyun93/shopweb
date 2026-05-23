import React, { useState, useEffect, useRef } from 'react';
import { getAllConversations, getConversationDetails, closeConversation } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';

const AdminChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket, connected } = useSocket();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      // Update messages if viewing this conversation
      if (selectedConversation && data.conversationId === selectedConversation.conversation_id) {
        // Chỉ add nếu message ID chưa tồn tại (tránh duplicate)
        setMessages((prev) => {
          const messageExists = prev.some(m => m.message_id === data.message_id);
          if (messageExists) {
            console.log('⚠️ Message already exists, skipping duplicate');
            return prev;
          }
          return [...prev, data];
        });
        socket.emit('chat:mark-read', data.conversationId);
      }
      
      // Update conversations list with unread count
      loadConversations();
    };

    const handleMessageSent = (message) => {
      // Chỉ add nếu message ID chưa tồn tại
      if (selectedConversation && message.conversation_id === selectedConversation.conversation_id) {
        setMessages((prev) => {
          const messageExists = prev.some(m => m.message_id === message.message_id);
          if (messageExists) {
            console.log('⚠️ Message already exists, skipping duplicate');
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    const handleTyping = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation.conversation_id) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          if (data.isTyping) {
            newMap.set(data.userId, true);
          } else {
            newMap.delete(data.userId);
          }
          return newMap;
        });
      }
    };

    const handleMessagesRead = (convId) => {
      if (selectedConversation && convId === selectedConversation.conversation_id) {
        setMessages((prev) =>
          prev.map((msg) => ({ ...msg, is_read: 1 }))
        );
      }
    };

    socket.on('chat:new-message', handleNewMessage);
    socket.on('chat:message-sent', handleMessageSent);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:messages-read', handleMessagesRead);

    return () => {
      socket.off('chat:new-message', handleNewMessage);
      socket.off('chat:message-sent', handleMessageSent);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:messages-read', handleMessagesRead);
    };
  }, [socket, selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await getAllConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;

    try {
      setLoading(true);
      const response = await getConversationDetails(selectedConversation.conversation_id);
      setMessages(response.data.messages);
      
      // Mark as read via socket
      if (socket) {
        socket.emit('chat:mark-read', selectedConversation.conversation_id);
      }
      
      // Update conversation in list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversation_id === selectedConversation.conversation_id ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending || !socket) return;

    try {
      setSending(true);
      
      const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Send with callback to wait for response
      socket.emit('chat:send-message', {
        conversationId: selectedConversation.conversation_id,
        message: newMessage.trim(),
        senderType: 'admin',
        senderId: payload.user_id
      }, (response) => {
        // Callback from server
        if (response.success) {
          console.log('✅ Message sent successfully:', response.data);
          setNewMessage('');
          
          // Stop typing indicator
          socket.emit('chat:typing', { conversationId: selectedConversation.conversation_id, isTyping: false });
        } else {
          console.error('❌ Error sending message:', response.error);
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
    
    if (!socket || !selectedConversation) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    socket.emit('chat:typing', { conversationId: selectedConversation.conversation_id, isTyping: true });
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', { conversationId: selectedConversation.conversation_id, isTyping: false });
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
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-3xl font-bold mb-4">Quản lý Chat</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-lg">Cuộc trò chuyện ({conversations.length})</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.conversation_id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.conversation_id === conv.conversation_id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold">{conv.name}</h3>
                    {conv.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{conv.email}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">{formatTime(conv.updated_at)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        conv.status === 'open'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {conv.status === 'open' ? '' : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg">{selectedConversation.name}</h2>
                  <p className="text-sm text-gray-600">{selectedConversation.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 max-h-[calc(100vh-400px)]">
                {loading && (!messages || messages.length === 0) ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (!messages || messages.length === 0) ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Chưa có tin nhắn nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.message_id}
                        className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            message.sender_type === 'admin'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          {message.sender_type === 'user' && (
                            <p className="text-xs font-semibold mb-1 text-gray-600">
                              {message.sender_name}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_type === 'admin' ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {typingUsers.size > 0 && (
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
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
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
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
                {!connected && (
                  <p className="text-xs text-red-500 mt-1">Đang kết nối lại...</p>
                )}
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto mb-4 text-gray-400"
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
                <p>Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
