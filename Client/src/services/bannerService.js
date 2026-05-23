import api from './api';

/**
 * @file bannerService.js
 * @description Xử lý tất cả API liên quan đến Banners
 * Single Responsibility: Quản lý banners/slideshow
 */

export const getActiveBanners = () =>
  api.get('/banners/active');

export const getAllBanners = () =>
  api.get('/banners');

export const getBannerById = (id) =>
  api.get(`/banners/${id}`);

export const createBanner = (bannerData) =>
  api.post('/banners', bannerData);

export const updateBanner = (id, bannerData) =>
  api.put(`/banners/${id}`, bannerData);

export const updateBannerStatus = (id, isActive) =>
  api.patch(`/banners/${id}/status`, { is_active: isActive });

export const deleteBanner = (id) =>
  api.delete(`/banners/${id}`);

export const uploadBannerImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/banners/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  updateBannerStatus,
  deleteBanner,
  uploadBannerImage,
};
