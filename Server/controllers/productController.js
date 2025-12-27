const Product = require('../models/product');
const ProductVariant = require('../models/productVariant');
const cloudinary = require('../config/cloudinary');
const pool = require('../config/db');

const productController = {
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.getAll();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await Product.getById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, description, category_id, brand_id, primary_image_url, additional_images, variants } = req.body;
      if (!name || !variants || !variants.length) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      for (const variant of variants) {
        if (!variant.sku || !variant.size || !variant.price || variant.price <= 0 || !variant.stock_quantity || variant.stock_quantity < 0) {
          return res.status(400).json({ error: 'Invalid variant data' });
        }
      }
      const productId = await Product.create({ name, description, category_id, brand_id, primary_image_url, additional_images, variants });
      res.status(201).json({ id: productId, message: 'Product created successfully' });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { product_id } = req.params;
      const { name, description, category_id, brand_id, primary_image_url, additional_images, variants } = req.body;
      if (!name || !variants || !variants.length) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      for (const variant of variants) {
        if (!variant.sku || !variant.size || !variant.price || variant.price <= 0 || !variant.stock_quantity || variant.stock_quantity < 0) {
          return res.status(400).json({ error: 'Invalid variant data' });
        }
      }
      await Product.update(product_id, { name, description, category_id, brand_id, primary_image_url, additional_images, variants });
      res.json({ message: 'Product updated successfully' });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { product_id } = req.params;
      await Product.delete(product_id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  },

  uploadPrimaryImage: async (req, res) => {
    try {
      const { productId } = req.params;
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng chọn file ảnh.' });
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'shopweb', upload_preset: 'shopweb-upload' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      const imageUrl = result.secure_url;
      await pool.query(
        'UPDATE products SET primary_image_url = ? WHERE product_id = ?',
        [imageUrl, productId]
      );
      res.status(200).json({ message: 'Upload ảnh chính thành công', image_url: imageUrl });
    } catch (err) {
      console.error('Error uploading primary image:', err);
      res.status(500).json({ message: 'Lỗi server khi upload ảnh chính' });
    }
  },

  uploadAdditionalImage: async (req, res) => {
    try {
      const { productId } = req.params;
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng chọn file ảnh.' });
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'shopweb', upload_preset: 'shopweb-upload' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      const imageUrl = result.secure_url;
      const [resultInsert] = await pool.query(
        'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
        [productId, imageUrl]
      );
      res.status(200).json({ message: 'Upload ảnh phụ thành công', image_url: imageUrl, image_id: resultInsert.insertId });
    } catch (err) {
      console.error('Error uploading additional image:', err);
      res.status(500).json({ message: 'Lỗi server khi upload ảnh phụ' });
    }
  },

  uploadVariantImage: async (req, res) => {
    try {
      const { variantId } = req.params;
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng chọn file ảnh.' });
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'shopweb', upload_preset: 'shopweb-upload' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      const imageUrl = result.secure_url;
      const updated = await ProductVariant.update(variantId, { image_url: imageUrl });
      if (updated) {
        res.status(200).json({ message: 'Upload ảnh biến thể thành công', image_url: imageUrl });
      } else {
        res.status(404).json({ message: 'Biến thể không tồn tại' });
      }
    } catch (err) {
      console.error('Error uploading variant image:', err);
      res.status(500).json({ message: 'Lỗi server khi upload ảnh biến thể' });
    }
  },

  deletePrimaryImage: async (req, res) => {
    try {
      const { productId } = req.params;
      const [rows] = await pool.query(
        'SELECT primary_image_url FROM products WHERE product_id = ?',
        [productId]
      );
      if (!rows.length || !rows[0].primary_image_url) {
        return res.status(404).json({ message: 'Không tìm thấy ảnh chính để xóa' });
      }

      const imageUrl = rows[0].primary_image_url;
      const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0]; // Lấy public_id từ URL
      await cloudinary.uploader.destroy(`shopweb/${publicId}`);

      await pool.query(
        'UPDATE products SET primary_image_url = NULL WHERE product_id = ?',
        [productId]
      );
      res.status(200).json({ message: 'Xóa ảnh chính thành công' });
    } catch (err) {
      console.error('Error deleting primary image:', err);
      res.status(500).json({ message: 'Lỗi server khi xóa ảnh chính' });
    }
  },

  deleteAdditionalImage: async (req, res) => {
    try {
      const { imageId } = req.params;
      const [rows] = await pool.query(
        'SELECT image_url FROM product_images WHERE image_id = ?',
        [imageId]
      );
      if (!rows.length) {
        return res.status(404).json({ message: 'Không tìm thấy ảnh phụ để xóa' });
      }

      const imageUrl = rows[0].image_url;
      const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`shopweb/${publicId}`);

      await pool.query('DELETE FROM product_images WHERE image_id = ?', [imageId]);
      res.status(200).json({ message: 'Xóa ảnh phụ thành công' });
    } catch (err) {
      console.error('Error deleting additional image:', err);
      res.status(500).json({ message: 'Lỗi server khi xóa ảnh phụ' });
    }
  },

  deleteVariantImage: async (req, res) => {
    try {
      const { variantId } = req.params;
      const variant = await ProductVariant.getById(variantId);
      if (!variant || !variant.image_url) {
        return res.status(404).json({ message: 'Không tìm thấy ảnh biến thể để xóa' });
      }

      const imageUrl = variant.image_url;
      const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`shopweb/${publicId}`);

      const updated = await ProductVariant.update(variantId, { image_url: null });
      if (updated) {
        res.status(200).json({ message: 'Xóa ảnh biến thể thành công' });
      } else {
        res.status(404).json({ message: 'Biến thể không tồn tại' });
      }
    } catch (err) {
      console.error('Error deleting variant image:', err);
      res.status(500).json({ message: 'Lỗi server khi xóa ảnh biến thể' });
    }
  },

searchProducts: async (req, res) => {
  try {
    const { q } = req.query;
    console.log('Search query received in controller:', q, 'Full URL:', req.originalUrl);
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    console.log('Before calling searchByName with query:', q);
    const products = await Product.searchByName(q);
    console.log('After searchByName - Results:', products);
    if (!products || products.length === 0) {
      return res.status(200).json([]); 
    }
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products', details: error.message });
  }
},
};

module.exports = productController;