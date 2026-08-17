/**
 * @file constants.js
 * @description Chứa tất cả các hằng số được sử dụng trong ứng dụng
 * @category Constants
 */

const UPLOAD_CONFIG = {
  // Cloudinary settings
  CLOUDINARY_FOLDER: 'shopweb_products',
  
  // Upload constraints
  MAX_IMAGES_PER_PRODUCT: 3,      // Số ảnh tối đa trên mỗi sản phẩm
  MAX_TOTAL_IMAGES: 20000,         // Giới hạn tổng ảnh
  UPLOAD_DELAY_MS: 800,            // Delay giữa các upload (ms)
  
  // Supported image formats
  SUPPORTED_FORMATS: ['.jpg', '.png', '.jpeg'],
};

const DATABASE_CONFIG = {
  // Query timeouts
  DEFAULT_TIMEOUT: 30000,
  
  // Error messages
  PRODUCT_NOT_FOUND: 'Sản phẩm không tìm thấy',
  IMAGE_UPLOAD_FAILED: 'Lỗi khi upload ảnh',
};

const LOG_LEVELS = {
  ERROR: '❌',
  SUCCESS: '✅',
  INFO: 'ℹ️',
  WARNING: '⚠️',
  PROGRESS: '⏳',
  COMPLETED: '🎉',
  STOP: '⛔',
  THINKING: '🚀',
};

module.exports = {
  UPLOAD_CONFIG,
  DATABASE_CONFIG,
  LOG_LEVELS,
};
