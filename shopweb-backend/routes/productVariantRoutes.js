const express = require('express');
const router = express.Router();
const productVariantController = require('../controllers/productVariantController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

router.get('/', productVariantController.getVariants);
router.get('/:id', productVariantController.getVariantById);
router.post('/', authenticateJWT, isAdmin, productVariantController.createVariant);
router.put('/:id', authenticateJWT, isAdmin, productVariantController.updateVariant);
router.delete('/:id', authenticateJWT, isAdmin, productVariantController.deleteVariant);

module.exports = router;