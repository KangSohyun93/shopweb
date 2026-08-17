import api from './api';

/**
 * @file chatService.js
 * @description Xử lý tất cả API liên quan đến Chat
 * Single Responsibility: Quản lý cuộc trò chuyện (user/admin)
 */

// User chat
export const getUserConversation = () =>
  api.get('/chat/my-conversation');

export const getChatMessages = (conversationId) =>
  api.get(`/chat/${conversationId}/messages`);

export const sendChatMessage = (conversationId, message) =>
  api.post(`/chat/${conversationId}/messages`, { message });

// Admin chat
export const getAllConversations = () =>
  api.get('/chat/admin/conversations');

export const getConversationDetails = (conversationId) =>
  api.get(`/chat/admin/conversations/${conversationId}`);

export const closeConversation = (conversationId) =>
  api.put(`/chat/admin/conversations/${conversationId}/close`);

export default {
  getUserConversation,
  getChatMessages,
  sendChatMessage,
  getAllConversations,
  getConversationDetails,
  closeConversation,
};
