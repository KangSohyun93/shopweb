/**
 * @file fileSystemService.js
 * @description Service xử lý tất cả các thao tác file system
 * Single Responsibility: Chỉ chịu trách nhiệm đọc file và thư mục
 * @category Service
 */

const fs = require('fs');
const path = require('path');
const { isImageFile } = require('./helpers');

/**
 * Lấy danh sách tất cả thư mục con từ một thư mục cha
 * @param {string} dirPath - Đường dẫn thư mục cha
 * @returns {string[]} Mảng tên thư mục
 */
function getFolders(dirPath) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  } catch (error) {
    throw new Error(`Lỗi đọc thư mục: ${error.message}`);
  }
}

/**
 * Lấy danh sách ảnh từ một thư mục
 * @param {string} folderPath - Đường dẫn thư mục
 * @returns {string[]} Mảng tên file ảnh
 */
function getImagesInFolder(folderPath) {
  try {
    return fs.readdirSync(folderPath)
      .filter(file => isImageFile(file))
      .sort();
  } catch (error) {
    throw new Error(`Lỗi đọc ảnh từ thư mục: ${error.message}`);
  }
}

/**
 * Kiểm tra file/thư mục có tồn tại không
 * @param {string} dirPath - Đường dẫn cần kiểm tra
 * @returns {boolean}
 */
function pathExists(dirPath) {
  return fs.existsSync(dirPath);
}

/**
 * Lấy kích thước file (bytes)
 * @param {string} filePath - Đường dẫn file
 * @returns {number}
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

module.exports = {
  getFolders,
  getImagesInFolder,
  pathExists,
  getFileSize,
};
