const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Auth endpoints
router.post('/signup', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Profile endpoints
router.get('/', authenticateJWT, isAdmin, profileController.getAllUsers);
router.get('/profile/me', authenticateJWT, profileController.getMyProfile);
router.put('/profile/me', authenticateJWT, profileController.updateProfile);
router.put('/profile/change-password', authenticateJWT, profileController.changePassword);
router.get('/:id', authenticateJWT, profileController.getUserById);

module.exports = router;