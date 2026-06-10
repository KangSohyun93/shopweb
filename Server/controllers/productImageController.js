
const cloudinary = require('../config/cloudinary');
const pool = require('../config/db');

const productImageController = {
  uploadPrimaryImage: async (req, res) => {
    try {
      const { productId } = req.params;
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng chọn file ảnh.' });
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'shopweb',  /*upload_preset: 'shopweb-upload'*/ },
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
          { folder: 'shopweb', /*upload_preset: 'shopweb-upload'*/ },
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
      const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
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

};

module.exports = productImageController;
