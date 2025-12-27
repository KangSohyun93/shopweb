const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
router.get('/search', (req, res, next) => {
  console.log('Entering /search route with query:', req.query);
  next();
}, productController.searchProducts);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticateJWT, isAdmin, productController.createProduct);
router.put('/:product_id', authenticateJWT, isAdmin, productController.updateProduct);
router.delete('/:product_id', authenticateJWT, isAdmin, productController.deleteProduct);
router.post('/upload-primary-image/:productId', authenticateJWT, isAdmin, upload.single('image'), productController.uploadPrimaryImage);
router.post('/upload-additional-image/:productId', authenticateJWT, isAdmin, upload.single('image'), productController.uploadAdditionalImage);
router.post('/upload-variant-image/:variantId', authenticateJWT, isAdmin, upload.single('image'), productController.uploadVariantImage);
router.delete('/delete-primary-image/:productId', authenticateJWT, isAdmin, productController.deletePrimaryImage);
router.delete('/delete-additional-image/:imageId', authenticateJWT, isAdmin, productController.deleteAdditionalImage);
router.delete('/delete-variant-image/:variantId', authenticateJWT, isAdmin, productController.deleteVariantImage);

module.exports = router;