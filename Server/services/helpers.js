/**
 * @file helpers.js
 * @description Chứa các hàm tiện ích được sử dụng ở nhiều nơi
 * @category Utilities
 */

const { LOG_LEVELS } = require('./constants');

/**
 * Ngủ một khoảng thời gian (milliseconds)
 * @param {number} ms - Thời gian ngủ (mili giây)
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * In log với formatting
 * @param {string} level - Level của log (ERROR, SUCCESS, INFO, WARNING)
 * @param {string} message - Nội dung message
 */
const log = (level, message) => {
  const icon = LOG_LEVELS[level] || 'ℹ️';
  console.log(`${icon} ${message}`);
};

/**
 * Làm sạch tên thư mục để Cloudinary chấp nhận
 * Chỉ giữ lại chữ cái, số, dấu gạch ngang, gạch dưới
 * @param {string} folderName - Tên thư mục cần làm sạch
 * @returns {string} Tên đã được làm sạch
 */
const sanitizeFolderName = (folderName) => {
  return folderName
    .replace(/&/g, 'And')
    .replace(/[^a-zA-Z0-9_-]/g, '');
};

/**
 * Chuyển đổi tên thư mục thành tên sản phẩm
 * Ví dụ: "Abstract_Animal_Print_Dress" → "Abstract Animal Print Dress"
 * @param {string} folderName - Tên thư mục
 * @returns {string} Tên sản phẩm
 */
const folderNameToProductName = (folderName) => {
  return folderName.replace(/_/g, ' ');
};

/**
 * Kiểm tra file có phải là ảnh không
 * @param {string} filename - Tên file
 * @returns {boolean}
 */
const isImageFile = (filename) => {
  const ext = filename.toLowerCase().slice(-4);
  return ['.jpg', '.jpeg', '.png'].includes(ext);
};

/**
 * Format số để hiển thị (thêm dấu phân cách hàng nghìn)
 * @param {number} num - Số cần format
 * @returns {string}
 */
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

module.exports = {
  sleep,
  log,
  sanitizeFolderName,
  folderNameToProductName,
  isImageFile,
  formatNumber,
};
