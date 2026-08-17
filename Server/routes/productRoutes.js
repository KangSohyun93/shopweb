const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateJWT, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', asyncHandler(productController.getAllProducts));
router.get('/search', asyncHandler(productController.searchProducts));
router.get('/:id', asyncHandler(productController.getProductById));

// Admin routes - CRUD
router.post('/', authenticateJWT, isAdmin, asyncHandler(productController.createProduct));
router.put('/:product_id', authenticateJWT, isAdmin, asyncHandler(productController.updateProduct));
router.delete('/:product_id', authenticateJWT, isAdmin, asyncHandler(productController.deleteProduct));

// Admin routes - Image upload/delete
router.post('/upload-primary-image/:productId', authenticateJWT, isAdmin, upload.single('image'), asyncHandler(productController.uploadPrimaryImage));
router.post('/upload-additional-image/:productId', authenticateJWT, isAdmin, upload.single('image'), asyncHandler(productController.uploadAdditionalImage));

router.delete('/delete-primary-image/:productId', authenticateJWT, isAdmin, asyncHandler(productController.deletePrimaryImage));
router.delete('/delete-additional-image/:imageId', authenticateJWT, isAdmin, asyncHandler(productController.deleteAdditionalImage));


module.exports = router;