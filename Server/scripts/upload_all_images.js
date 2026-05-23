/**
 * @file upload_all_images.js (V2 - Với Resume & Error Tracking)
 * @description Upload ảnh sản phẩm lên Cloudinary với:
 * - Lưu progress để resume lần sau
 * - Retry tự động khi gặp lỗi mạng
 * - Log chi tiết lỗi
 * - Kiểm tra kết nối trước
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const productImageService = require('../services/productImageService');

const PROGRESS_FILE = path.join(__dirname, 'upload_progress.json');
const ERROR_LOG_FILE = path.join(__dirname, 'upload_errors.log');
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 giây

/**
 * Lưu progress hiện tại
 */
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Tải progress từ lần chạy trước
 */
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    } catch (err) {
      console.log('⚠️ Không thể tải progress file, bắt đầu từ đầu');
      return null;
    }
  }
  return null;
}

/**
 * Kiểm tra xem sản phẩm có phải là lỗi từ lần trước k
 */
function shouldSkipProduct(productIndex, resumeProgress) {
  if (!resumeProgress || !resumeProgress.failedProducts) return false;
  
  // Nếu là lỗi và chạy lần thứ 2+, skip nó
  if (resumeProgress.failedProducts.includes(productIndex)) {
    console.log(`⏭️ Bỏ qua sản phẩm #${productIndex + 1} (lỗi lần trước)`);
    return true;
  }
  return false;
}

/**
 * Ghi log lỗi chi tiết
 */
function logError(productIndex, productName, errorMsg, errorDetails) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] Sản phẩm #${productIndex}: ${productName}
Lỗi: ${errorMsg}
Chi tiết: ${JSON.stringify(errorDetails, null, 2)}
---\n`;
  
  fs.appendFileSync(ERROR_LOG_FILE, logEntry);
}

/**
 * Kiểm tra kết nối DNS
 */
async function checkConnectivity() {
  return new Promise((resolve) => {
    const dns = require('dns');
    dns.lookup('api.cloudinary.com', (err) => {
      resolve(!err);
    });
  });
}

/**
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry logic với exponential backoff
 */
async function retryOperation(operation, maxRetries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`⏳ Lỗi mạng, retry lần ${attempt}/${maxRetries} sau ${delay}ms...`);
      await sleep(delay);
    }
  }
}

/**
 * Entry point chính
 */
async function start() {
  console.log('🚀 Bắt đầu upload ảnh sản phẩm...\n');
  
  // Xóa progress file cũ (vì credentials sai nên upload cũ có thể invalid)
  if (fs.existsSync(PROGRESS_FILE)) {
    console.log('🔄 Xóa progress file cũ (credentials vừa được fix)...');
    fs.unlinkSync(PROGRESS_FILE);
  }
  
  // Kiểm tra Cloudinary credentials
  console.log('🔑 Kiểm tra Cloudinary credentials...');
  const cloudinaryService = require('../services/cloudinaryService');
  const hasValidCreds = await cloudinaryService.testCloudinaryConnection();
  if (!hasValidCreds) {
    console.error('\n❌ CLOUDINARY CREDENTIALS LỖI!');
    console.error('   Kiểm tra .env file:');
    console.error('   - CLOUDINARY_CLOUD_NAME');
    console.error('   - CLOUDINARY_API_KEY');
    console.error('   - CLOUDINARY_API_SECRET');
    process.exit(1);
  }
  console.log('✅ Cloudinary credentials OK\n');

  // Kiểm tra kết nối
  console.log('🔌 Kiểm tra kết nối Cloudinary API...');
  const isConnected = await checkConnectivity();
  if (!isConnected) {
    console.error('❌ KHÔNG THỂ KẾT NỐI TỚI CLOUDINARY!');
    console.error('   Kiểm tra:');
    console.error('   - Kết nối Internet');
    console.error('   - Cloudinary URL: https://api.cloudinary.com');
    console.error('   - Tường lửa/Proxy settings');
    process.exit(1);
  }
  console.log('✅ Kết nối OK\n');

  // Xóa file error log cũ
  if (fs.existsSync(ERROR_LOG_FILE)) {
    fs.unlinkSync(ERROR_LOG_FILE);
  }

  // Tải progress từ lần trước
  let resumeProgress = loadProgress();
  if (resumeProgress) {
    console.log(`📍 Tiếp tục từ sản phẩm #${resumeProgress.lastProductIndex + 1}`);
    console.log(`   Đã upload: ${resumeProgress.uploaded}/${resumeProgress.total} ảnh\n`);
  }

  try {
    // Gọi service chính với resume
    await retryOperation(async () => {
      await productImageService.uploadAllProductImages(resumeProgress);
    });

    // Xóa progress file khi thành công
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }

    console.log('\n✅ Upload hoàn tát!');
    
    // Kiểm tra file error log
    if (fs.existsSync(ERROR_LOG_FILE)) {
      const errorCount = fs.readFileSync(ERROR_LOG_FILE, 'utf8').split('---').length - 1;
      console.log(`⚠️ Có ${errorCount} sản phẩm bị lỗi - xem chi tiết: ${ERROR_LOG_FILE}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi không mong muốn:', error.message);
    
    // Lưu progress để resume lần sau
    const currentProgress = loadProgress();
    if (currentProgress) {
      console.log(`💾 Progress đã lưu vào: ${PROGRESS_FILE}`);
      console.log(`   Lần sau chạy lệnh này để tiếp tục từ sản phẩm #${currentProgress.lastProductIndex + 1}`);
      
      if (currentProgress.failedProducts && currentProgress.failedProducts.length > 0) {
        console.log(`   Sản phẩm lỗi sẽ bị skip: ${currentProgress.failedProducts.map(i => `#${i + 1}`).join(', ')}`);
      }
    }

    // Log chi tiết lỗi
    logError('SCRIPT', 'upload_all_images.js', error.message, error.stack);
    console.log(`📋 Chi tiết lỗi: ${ERROR_LOG_FILE}`);

    process.exit(1);
  }
}

// Chạy script
start();
