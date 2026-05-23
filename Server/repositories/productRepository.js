/**
 * @file productRepository.js
 * @description Repository pattern cho Product
 * Single Responsibility: Chỉ xử lý database queries liên quan Product
 * Dependency Inversion: Controllers gọi repository, không trực tiếp query
 * @category Repository
 */

const db = require('../config/db');

const productRepository = {
  /**
   * Lấy tất cả sản phẩm với variants và ảnh
   * @returns {Promise<array>}
   */
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT p.product_id, p.name, p.description, p.category_id, p.brand_id, p.primary_image_url,
             c.name as category_name, b.name as brand_name,
             pv.variant_id, pv.sku, pv.size, pv.price, pv.stock_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_variants pv ON p.product_id = pv.product_id
    `);

    const products = {};
    rows.forEach(row => {
      if (!products[row.product_id]) {
        products[row.product_id] = {
          product_id: row.product_id,
          name: row.name,
          description: row.description,
          category_id: row.category_id,
          brand_id: row.brand_id,
          primary_image_url: row.primary_image_url,
          category_name: row.category_name,
          brand_name: row.brand_name,
          additional_images: [],
          variants: []
        };
      }
      if (row.variant_id) {
        products[row.product_id].variants.push({
          variant_id: row.variant_id,
          sku: row.sku,
          size: row.size,
          price: row.price,
          stock_quantity: row.stock_quantity
        });
      }
    });

    const productIds = Object.keys(products).map(id => parseInt(id));
    if (productIds.length > 0) {
      const [productImages] = await db.query(`
        SELECT image_id, product_id, image_url
        FROM product_images
        WHERE product_id IN (?)
      `, [productIds]);
      
      productImages.forEach(img => {
        if (products[img.product_id]) {
          products[img.product_id].additional_images.push({
            image_id: img.image_id,
            image_url: img.image_url
          });
        }
      });
    }

    return Object.values(products);
  },

  /**
   * Lấy sản phẩm theo ID
   * @param {number} id - Product ID
   * @returns {Promise<object|null>}
   */
  getById: async (id) => {
    const [rows] = await db.query(`
      SELECT p.product_id, p.name, p.description, p.category_id, p.brand_id, p.primary_image_url,
             c.name as category_name, b.name as brand_name,
             pv.variant_id, pv.sku, pv.size, pv.price, pv.stock_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_variants pv ON p.product_id = pv.product_id
      WHERE p.product_id = ?
    `, [id]);
    
    if (!rows.length) return null;

    const product = {
      product_id: rows[0].product_id,
      name: rows[0].name,
      description: rows[0].description,
      category_id: rows[0].category_id,
      brand_id: rows[0].brand_id,
      primary_image_url: rows[0].primary_image_url,
      category_name: rows[0].category_name,
      brand_name: rows[0].brand_name,
      additional_images: [],
      variants: []
    };

    rows.forEach(row => {
      if (row.variant_id) {
        product.variants.push({
          variant_id: row.variant_id,
          sku: row.sku,
          size: row.size,
          price: row.price,
          stock_quantity: row.stock_quantity
        });
      }
    });

    const [images] = await db.query(`
      SELECT image_id, image_url FROM product_images WHERE product_id = ?
    `, [id]);
    
    product.additional_images = images.map(img => ({
      image_id: img.image_id,
      image_url: img.image_url
    }));

    return product;
  },

  /**
   * Tạo sản phẩm mới
   * @param {object} productData - Dữ liệu sản phẩm
   * @returns {Promise<number>} ID của sản phẩm vừa tạo
   */
  create: async (productData) => {
    const { name, description, category_id, brand_id, primary_image_url, variants } = productData;
    
    const [result] = await db.query(
      'INSERT INTO products (name, description, category_id, brand_id, primary_image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, category_id || null, brand_id || null, primary_image_url || null]
    );

    const productId = result.insertId;

    // Thêm variants
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await db.query(
          'INSERT INTO product_variants (product_id, sku, size, price, stock_quantity) VALUES (?, ?, ?, ?, ?)',
          [productId, variant.sku, variant.size, variant.price, variant.stock_quantity]
        );
      }
    }

    return productId;
  },

  /**
   * Cập nhật sản phẩm
   * @param {number} productId - Product ID
   * @param {object} productData - Dữ liệu cập nhật
   * @returns {Promise<void>}
   */
  update: async (productId, productData) => {
    const { name, description, category_id, brand_id, primary_image_url, variants } = productData;
    
    await db.query(
      'UPDATE products SET name = ?, description = ?, category_id = ?, brand_id = ?, primary_image_url = ? WHERE product_id = ?',
      [name, description, category_id || null, brand_id || null, primary_image_url || null, productId]
    );

    // Cập nhật variants
    if (variants && variants.length > 0) {
      await db.query('DELETE FROM product_variants WHERE product_id = ?', [productId]);
      
      for (const variant of variants) {
        await db.query(
          'INSERT INTO product_variants (product_id, sku, size, price, stock_quantity) VALUES (?, ?, ?, ?, ?)',
          [productId, variant.sku, variant.size, variant.price, variant.stock_quantity]
        );
      }
    }
  },

  /**
   * Xóa sản phẩm
   * @param {number} productId - Product ID
   * @returns {Promise<void>}
   */
  delete: async (productId) => {
    await db.query('DELETE FROM products WHERE product_id = ?', [productId]);
  },

  /**
   * Cập nhật ảnh đại diện
   * @param {number} productId - Product ID
   * @param {string} imageUrl - URL ảnh
   * @returns {Promise<void>}
   */
  updatePrimaryImage: async (productId, imageUrl) => {
    await db.query(
      'UPDATE products SET primary_image_url = ? WHERE product_id = ?',
      [imageUrl, productId]
    );
  },

  /**
   * Thêm ảnh phụ
   * @param {number} productId - Product ID
   * @param {string} imageUrl - URL ảnh
   * @returns {Promise<number>} Image ID
   */
  addAdditionalImage: async (productId, imageUrl) => {
    const [result] = await db.query(
      'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
      [productId, imageUrl]
    );
    return result.insertId;
  },

  /**
   * Lấy ảnh phụ
   * @param {number} imageId - Image ID
   * @returns {Promise<object|null>}
   */
  getAdditionalImage: async (imageId) => {
    const [rows] = await db.query(
      'SELECT image_id, image_url FROM product_images WHERE image_id = ?',
      [imageId]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Xóa ảnh phụ
   * @param {number} imageId - Image ID
   * @returns {Promise<void>}
   */
  deleteAdditionalImage: async (imageId) => {
    await db.query('DELETE FROM product_images WHERE image_id = ?', [imageId]);
  },

  /**
   * Cập nhật ảnh biến thể
   * @param {number} variantId - Variant ID
   * @param {string} imageUrl - URL ảnh (null để xóa)
   * @returns {Promise<void>}
   */
  updateVariantImage: async (variantId, imageUrl) => {
    await db.query(
      'UPDATE product_variants SET image_url = ? WHERE variant_id = ?',
      [imageUrl, variantId]
    );
  },

  /**
   * Lấy biến thể theo ID
   * @param {number} variantId - Variant ID
   * @returns {Promise<object|null>}
   */
  getVariantById: async (variantId) => {
    const [rows] = await db.query(
      'SELECT variant_id, sku, size, price, stock_quantity, image_url FROM product_variants WHERE variant_id = ?',
      [variantId]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Tìm kiếm sản phẩm theo tên
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Promise<array>}
   */
  search: async (query) => {
    const [rows] = await db.query(`
      SELECT p.product_id, p.name, p.description, p.category_id, p.brand_id, p.primary_image_url,
             c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      WHERE p.name LIKE ? OR p.description LIKE ?
      LIMIT 20
    `, [`%${query}%`, `%${query}%`]);
    
    return rows;
  }
};

module.exports = productRepository;
