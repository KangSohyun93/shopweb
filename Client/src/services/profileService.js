import api from './api';

/**
 * @file profileService.js
 * @description Xử lý tất cả API liên quan đến User Profile
 * Single Responsibility: Quản lý profile, password
 */

export const getMyProfile = () =>
  api.get('/users/profile/me');

export const updateProfile = (profileData) =>
  api.put('/users/profile/me', profileData);

export const changePassword = (passwordData) =>
  api.put('/users/profile/change-password', passwordData);

export default {
  getMyProfile,
  updateProfile,
  changePassword,
};
