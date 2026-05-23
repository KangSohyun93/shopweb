/**
 * @file productImageService.js
 * @description Service xử lý logic upload ảnh sản phẩm
 * Single Responsibility: Điều phối quy trình upload (Facade Pattern)
 * Open/Closed: Mở rộng nhưng không sửa đổi các service khác
 * @category Service
 */

const path = require('path');
const cloudinaryService = require('./cloudinaryService');
const databaseService = require('./databaseService');
const fileSystemService = require('./fileSystemService');
const { 
  sanitizeFolderName, 
  folderNameToProductName, 
  sleep, 
  log 
} = require('./helpers');
const { UPLOAD_CONFIG } = require('./constants');

const IMG_DIR = path.join(__dirname, '../../datasets/img');

/**
 * Upload một ảnh và lưu vào database
 * @param {string} filePath - Đường dẫn file ảnh
 * @param {number} productId - Product ID
 * @param {string} safeFolderName - Tên thư mục đã được làm sạch
 * @param {boolean} isPrimary - Có phải ảnh đại diện không
 * @param {number} maxRetries - Số lần retry
 * @returns {Promise<boolean>} true nếu thành công
 */
async function uploadSingleImage(filePath, productId, safeFolderName, isPrimary = false, maxRetries = 3) {
  const MAX_RETRY_DELAY = 10000; // 10 giây
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Upload lên Cloudinary
      const imageUrl = await cloudinaryService.uploadImageToCloudinary(
        filePath,
        safeFolderName
      );

      if (!imageUrl) {
        log('ERROR', `Không thể upload file: ${path.basename(filePath)}`);
        return false;
      }

      // Lưu vào database
      await databaseService.insertProductImage(productId, imageUrl, isPrimary);

      // Nếu là ảnh đại diện, cập nhật primary_image_url
      if (isPrimary) {
        await databaseService.updateProductPrimaryImage(productId, imageUrl);
      }

      return true;
    } catch (error) {
      if (attempt === maxRetries) {
        log('ERROR', `Lỗi upload ${path.basename(filePath)} sau ${maxRetries} lần thử: ${error.message}`);
        return false;
      }

      // Exponential backoff: 2s, 4s, 8s,...
      const delay = Math.min(MAX_RETRY_DELAY, 2000 * Math.pow(2, attempt - 1));
      log('WARNING', `Retry lần ${attempt}/${maxRetries} sau ${delay}ms...`);
      await sleep(delay);
    }
  }
}

/**
 * Upload tất cả ảnh cho một sản phẩm
 * @param {string} folderName - Tên thư mục sản phẩm
 * @param {string} folderPath - Đường dẫn đến thư mục sản phẩm
 * @param {object} stats - Thống kê upload hiện tại
 * @param {function} onProgress - Callback lưu progress
 * @returns {Promise<boolean>} true nếu thành công
 */
async function uploadProductImages(folderName, folderPath, stats, onProgress) {
  try {
    // Tìm product ID từ tên sản phẩm
    const productName = folderNameToProductName(folderName);
    const productId = await databaseService.getProductIdByName(productName);

    if (!productId) {
      stats.skipped++;
      // Luôn update progress, dù skip
      if (onProgress) {
        onProgress({
          lastProductIndex: stats.current - 1,
          uploaded: stats.uploaded,
          total: stats.total,
          success: stats.success,
          skipped: stats.skipped,
          timestamp: new Date().toISOString(),
          failedProducts: stats.failedProducts || []
        });
      }
      return false;
    }

    // Kiểm tra sản phẩm đã có ảnh chưa (tránh upload lại)
    const existingCount = await databaseService.getProductImageCount(productId);
    if (existingCount > 0) {
      stats.skipped++;
      // Luôn update progress
      if (onProgress) {
        onProgress({
          lastProductIndex: stats.current - 1,
          uploaded: stats.uploaded,
          total: stats.total,
          success: stats.success,
          skipped: stats.skipped,
          timestamp: new Date().toISOString(),
          failedProducts: stats.failedProducts || []
        });
      }
      return false;
    }

    // Lấy danh sách ảnh từ thư mục
    const files = fileSystemService.getImagesInFolder(folderPath);
    if (files.length === 0) {
      // Luôn update progress
      if (onProgress) {
        onProgress({
          lastProductIndex: stats.current - 1,
          uploaded: stats.uploaded,
          total: stats.total,
          success: stats.success,
          skipped: stats.skipped,
          timestamp: new Date().toISOString(),
          failedProducts: stats.failedProducts || []
        });
      }
      return false;
    }

    // Chọn tối đa MAX_IMAGES_PER_PRODUCT ảnh
    const selectedFiles = files.slice(0, UPLOAD_CONFIG.MAX_IMAGES_PER_PRODUCT);
    const safeFolderName = sanitizeFolderName(folderName);

    log('PROGRESS', `⏳ Đang upload MỚI [${stats.current}/${stats.total}]: ${folderName} (${selectedFiles.length} ảnh) | Tổng: ${stats.uploaded}/${UPLOAD_CONFIG.MAX_TOTAL_IMAGES}`);

    // Upload từng ảnh
    let uploadSuccess = true;
    for (let j = 0; j < selectedFiles.length; j++) {
      // Kiểm tra giới hạn tổng ảnh
      if (stats.uploaded >= UPLOAD_CONFIG.MAX_TOTAL_IMAGES) {
        log('STOP', `Đã đạt ${stats.uploaded}/${UPLOAD_CONFIG.MAX_TOTAL_IMAGES} ảnh. DỪNG LẠI!`);
        return false;
      }

      const file = selectedFiles[j];
      const filePath = path.join(folderPath, file);
      const isPrimary = (j === 0);

      const success = await uploadSingleImage(filePath, productId, safeFolderName, isPrimary);
      
      if (success) {
        stats.uploaded++;
      } else {
        // Nếu lỗi, ghi log chi tiết và chuyển sang sản phẩm tiếp theo
        log('WARNING', `⚠️ Gặp lỗi tại ảnh ${file}. Sẽ chuyển sang sản phẩm tiếp theo...`);
        uploadSuccess = false;
        
        // Track sản phẩm bị lỗi
        if (!stats.failedProducts) stats.failedProducts = [];
        if (!stats.failedProducts.includes(stats.current - 1)) {
          stats.failedProducts.push(stats.current - 1);
        }
        break;
      }

      // Delay để tránh rate limit
      await sleep(UPLOAD_CONFIG.UPLOAD_DELAY_MS);
    }

    if (uploadSuccess) {
      stats.success++;
    }
    
    // Luôn lưu progress sau mỗi sản phẩm
    if (onProgress) {
      onProgress({
        lastProductIndex: stats.current - 1,
        uploaded: stats.uploaded,
        total: stats.total,
        success: stats.success,
        skipped: stats.skipped,
        timestamp: new Date().toISOString(),
        failedProducts: stats.failedProducts || []
      });
    }

    return uploadSuccess;

  } catch (error) {
    log('ERROR', `Lỗi xử lý sản phẩm "${folderName}": ${error.message}`);
    
    // Track sản phẩm bị lỗi
    if (!stats.failedProducts) stats.failedProducts = [];
    if (!stats.failedProducts.includes(stats.current - 1)) {
      stats.failedProducts.push(stats.current - 1);
    }

    // Update progress kể cả khi lỗi
    if (onProgress) {
      onProgress({
        lastProductIndex: stats.current - 1,
        uploaded: stats.uploaded,
        total: stats.total,
        success: stats.success,
        skipped: stats.skipped,
        timestamp: new Date().toISOString(),
        failedProducts: stats.failedProducts || []
      });
    }
    return false;
  }
}

/**
 * Upload tất cả ảnh cho tất cả sản phẩm
 * @param {object} resumeProgress - Progress từ lần chạy trước (nếu có)
 * @returns {Promise<void>}
 */
async function uploadAllProductImages(resumeProgress = null) {
  try {
    const fs = require('fs');
    const path = require('path');

    log('THINKING', 'BẮT ĐẦU CHẠY LẠI QUÁ TRÌNH TẢI ẢNH (RESUME MODE)...');
    log('INFO', `Tối đa: ${UPLOAD_CONFIG.MAX_TOTAL_IMAGES} ảnh | Mỗi sản phẩm: ${UPLOAD_CONFIG.MAX_IMAGES_PER_PRODUCT} ảnh\n`);

    // Lấy danh sách thư mục sản phẩm
    const folders = fileSystemService.getFolders(IMG_DIR);
    log('INFO', `Tìm thấy ${folders.length} thư mục sản phẩm.`);

    // Thống kê
    const stats = {
      total: folders.length,
      current: 0,
      success: resumeProgress?.success || 0,
      skipped: resumeProgress?.skipped || 0,
      uploaded: resumeProgress?.uploaded || 0,
      failedProducts: resumeProgress?.failedProducts || [],
    };

    // Xác định điểm bắt đầu
    const startIndex = resumeProgress?.lastProductIndex ? resumeProgress.lastProductIndex + 1 : 0;
    if (resumeProgress) {
      log('INFO', `📍 Tiếp tục từ sản phẩm #${startIndex + 1}\n`);
      if (resumeProgress.failedProducts && resumeProgress.failedProducts.length > 0) {
        log('WARNING', `⏭️ Sẽ bỏ qua các sản phẩm lỗi: ${resumeProgress.failedProducts.map(i => `#${i + 1}`).join(', ')}\n`);
      }
    }

    // Callback lưu progress
    const onProgress = (progress) => {
      const PROGRESS_FILE = path.join(__dirname, '../scripts/upload_progress.json');
      try {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
      } catch (err) {
        log('WARNING', `Không thể lưu progress: ${err.message}`);
      }
    };

    // Upload từng sản phẩm
    for (let i = startIndex; i < folders.length; i++) {
      // Dừng nếu đạt giới hạn
      if (stats.uploaded >= UPLOAD_CONFIG.MAX_TOTAL_IMAGES) {
        break;
      }

      // Skip nếu sản phẩm bị lỗi từ lần trước
      if (stats.failedProducts && stats.failedProducts.includes(i)) {
        log('SKIP', `⏭️ Bỏ qua sản phẩm #${i + 1} (lỗi lần trước)`);
        stats.current = i + 1;
        onProgress({
          lastProductIndex: i,
          uploaded: stats.uploaded,
          total: stats.total,
          success: stats.success,
          skipped: stats.skipped,
          timestamp: new Date().toISOString(),
          failedProducts: stats.failedProducts
        });
        continue;
      }

      stats.current = i + 1;
      const folderName = folders[i];
      const folderPath = path.join(IMG_DIR, folderName);

      await uploadProductImages(folderName, folderPath, stats, onProgress);
    }

    // Xóa progress file khi hoàn tát
    try {
      const PROGRESS_FILE = path.join(__dirname, '../scripts/upload_progress.json');
      if (fs.existsSync(PROGRESS_FILE)) {
        fs.unlinkSync(PROGRESS_FILE);
      }
    } catch (err) {
      // Ignore
    }

    // In thống kê kết thúc
    let finalMsg = `✅ Đã upload mới thành công cho ${stats.success} sản phẩm. Tổng ảnh: ${stats.uploaded}/${UPLOAD_CONFIG.MAX_TOTAL_IMAGES}. Bỏ qua ${stats.skipped} sản phẩm.`;
    if (stats.failedProducts && stats.failedProducts.length > 0) {
      finalMsg += `\n⚠️ Có ${stats.failedProducts.length} sản phẩm gặp lỗi.`;
    }
    log('COMPLETED', finalMsg);

  } catch (error) {
    log('ERROR', `Lỗi hệ thống: ${error.message}`);
    throw error;
  }
}

module.exports = {
  uploadSingleImage,
  uploadProductImages,
  uploadAllProductImages,
};
