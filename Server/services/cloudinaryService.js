/**
 * @file cloudinaryService.js
 * @description Service xử lý tất cả các thao tác liên quan đến Cloudinary
 * Single Responsibility: Chỉ chịu trách nhiệm upload ảnh lên Cloudinary
 * @category Service
 */

const cloudinary = require('../config/cloudinary');
const { log } = require('./helpers');

const MAX_RETRIES = 5; // Retry 5 lần
const INITIAL_DELAY = 2000; // 2 giây
const MAX_DELAY = 30000; // 30 giây max
const TIMEOUT_MS = 60000; // 60 giây timeout per upload

/**
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upload một file ảnh lên Cloudinary với retry logic
 * @param {string} filePath - Đường dẫn file ảnh
 * @param {string} folderName - Tên thư mục trên Cloudinary
 * @param {number} retryCount - Số lần retry (để tracking)
 * @returns {Promise<string|null>} URL của ảnh hoặc null nếu lỗi
 */
async function uploadImageToCloudinary(filePath, folderName, retryCount = 0) {
  try {
    // Tạo timeout promise
    const uploadPromise = cloudinary.uploader.upload(filePath, {
      folder: `shopweb_products/${folderName}`,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      timeout: TIMEOUT_MS,
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout')), TIMEOUT_MS)
    );

    const result = await Promise.race([uploadPromise, timeoutPromise]);
    return result.secure_url;
    
  } catch (error) {
    const errorMsg = error.message || error.toString();
    const isNetworkError = errorMsg.includes('ENOTFOUND') || 
                          errorMsg.includes('ECONNREFUSED') ||
                          errorMsg.includes('ETIMEDOUT') ||
                          errorMsg.includes('EHOSTUNREACH') ||
                          errorMsg.includes('timeout') ||
                          errorMsg.includes('socket hang up');

    if (isNetworkError && retryCount < MAX_RETRIES) {
      // Exponential backoff: 2s, 4s, 8s, 16s, 30s, 30s...
      const delay = Math.min(INITIAL_DELAY * Math.pow(2, retryCount), MAX_DELAY);
      log('WARNING', `⚠️ Lỗi mạng (${errorMsg}). Retry ${retryCount + 1}/${MAX_RETRIES} sau ${delay}ms...`);
      
      await sleep(delay);
      return uploadImageToCloudinary(filePath, folderName, retryCount + 1);
    }

    // Nếu là lỗi khác hoặc hết retry
    if (isNetworkError) {
      log('ERROR', `❌ Lỗi mạng sau ${MAX_RETRIES} lần thử: ${errorMsg}`);
    } else {
      log('ERROR', `❌ Lỗi upload file: ${errorMsg}`);
    }
    return null;
  }
}

/**
 * Kiểm tra kết nối Cloudinary với retry
 * @returns {Promise<boolean>}
 */
async function testCloudinaryConnection() {
  try {
    // Thử kết nối với timeout
    const testPromise = cloudinary.api.resources({ max_results: 1 });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection test timeout')), TIMEOUT_MS)
    );

    await Promise.race([testPromise, timeoutPromise]);
    return true;
  } catch (error) {
    const errorMsg = error.message || error.toString();
    const isNetworkError = errorMsg.includes('ENOTFOUND') || 
                          errorMsg.includes('ECONNREFUSED') ||
                          errorMsg.includes('timeout');
    
    if (isNetworkError) {
      log('ERROR', `🔴 Không thể kết nối Cloudinary (lỗi mạng): ${errorMsg}`);
      log('WARNING', `💡 Kiểm tra:\n   - Kết nối Internet có ổn không?\n   - Tường lửa có chặn không?\n   - Proxy settings?`);
    } else {
      log('ERROR', `❌ Không thể kết nối Cloudinary: ${errorMsg}`);
    }
    return false;
  }
}

module.exports = {
  uploadImageToCloudinary,
  testCloudinaryConnection,
};
