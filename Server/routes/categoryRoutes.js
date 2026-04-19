const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// 📌 Công khai - Khách hàng xem danh mục (không cần token)
router.get('/', categoryController.getCategories);
router.get('/public/:id', categoryController.getCategoryById);

// 🔐 Admin Only - Quản lý danh mục
router.post('/', authenticateJWT, isAdmin, categoryController.createCategory);
router.put('/:category_id', authenticateJWT, isAdmin, categoryController.updateCategory);
router.delete('/:category_id', authenticateJWT, isAdmin, categoryController.deleteCategory);

module.exports = router;