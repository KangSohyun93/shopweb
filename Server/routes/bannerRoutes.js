const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Upload image endpoint (admin only)
router.post('/upload-image', authenticateJWT, isAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file nào được tải lên' });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'banners' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Lỗi khi tải ảnh lên' });
    }
});

// Public routes
router.get('/active', bannerController.getActiveBanners);

// Admin routes
router.get('/', authenticateJWT, isAdmin, bannerController.getAllBanners);
router.get('/:id', authenticateJWT, isAdmin, bannerController.getBannerById);
router.post('/', authenticateJWT, isAdmin, bannerController.createBanner);
router.put('/:id', authenticateJWT, isAdmin, bannerController.updateBanner);
router.patch('/:id/status', authenticateJWT, isAdmin, bannerController.updateBannerStatus);
router.delete('/:id', authenticateJWT, isAdmin, bannerController.deleteBanner);

module.exports = router;
