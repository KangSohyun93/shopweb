/**
 * @file databaseService.js
 * @description Service xử lý tất cả các thao tác database
 * @category Service
 */

const db = require('../config/db');

/**
 * Tìm sản phẩm theo tên
 * @param {string} productName
 * @returns {Promise<number|null>} 
 */
async function getProductIdByName(productName) {
  try {
    const [rows] = await db.query(
      'SELECT product_id FROM products WHERE name = ? LIMIT 1',
      [productName]
    );
    return rows.length > 0 ? rows[0].product_id : null;
  } catch (error) {
    throw new Error(`Lỗi truy vấn sản phẩm: ${error.message}`);
  }
}

/**
 * Kiểm tra sản phẩm đã có ảnh chưa
 * @param {number} productId - Product ID
 * @returns {Promise<number>} Số lượng ảnh hiện có
 */
async function getProductImageCount(productId) {
  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM product_images WHERE product_id = ?',
      [productId]
    );
    return rows[0].count;
  } catch (error) {
    throw new Error(`Lỗi đếm ảnh: ${error.message}`);
  }
}

/**
 * @param {number} productId - Product ID
 * @param {string} imageUrl - URL của ảnh
 * @param {boolean} isPrimary - Có phải ảnh đại diện không
 * @returns {Promise<number>} Image ID vừa tạo
 */
async function insertProductImage(productId, imageUrl, isPrimary = false) {
  try {
    const [result] = await db.query(
      'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
      [productId, imageUrl, isPrimary ? 1 : 0]
    );
    return result.insertId;
  } catch (error) {
    throw new Error(`Lỗi thêm ảnh: ${error.message}`);
  }
}

/**
 * Cập nhật ảnh đại diện của sản phẩm
 * @param {number} productId - Product ID
 * @param {string} imageUrl - URL của ảnh
 * @returns {Promise<void>}
 */
async function updateProductPrimaryImage(productId, imageUrl) {
  try {
    await db.query(
      'UPDATE products SET primary_image_url = ? WHERE product_id = ?',
      [imageUrl, productId]
    );
  } catch (error) {
    throw new Error(`Lỗi cập nhật ảnh đại diện: ${error.message}`);
  }
}

/**
 * Lấy tổng số sản phẩm trong DB
 * @returns {Promise<number>}
 */
async function getTotalProducts() {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM products');
    return rows[0].count;
  } catch (error) {
    throw new Error(`Lỗi đếm sản phẩm: ${error.message}`);
  }
}

module.exports = {
  getProductIdByName,
  getProductImageCount,
  insertProductImage,
  updateProductPrimaryImage,
  getTotalProducts,
};
