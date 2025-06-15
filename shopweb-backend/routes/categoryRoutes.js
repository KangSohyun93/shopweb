const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

router.get('/', authenticateJWT, isAdmin, categoryController.getCategories);
router.get('/:id', authenticateJWT, isAdmin, categoryController.getCategoryById);
router.post('/', authenticateJWT, isAdmin, categoryController.createCategory);
router.put('/:category_id', authenticateJWT, isAdmin, categoryController.updateCategory);
router.delete('/:category_id', authenticateJWT, isAdmin, categoryController.deleteCategory);

module.exports = router;