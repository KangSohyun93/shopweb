const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

router.get('/', authenticateJWT, isAdmin, brandController.getBrands);
router.get('/:id', authenticateJWT, isAdmin, brandController.getBrandById);
router.post('/', authenticateJWT, isAdmin, brandController.createBrand);
router.put('/:brand_id', authenticateJWT, isAdmin, brandController.updateBrand);
router.delete('/:brand_id', authenticateJWT, isAdmin, brandController.deleteBrand);

module.exports = router;