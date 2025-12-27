const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

router.post('/signup', userController.register);
router.post('/verify-otp', userController.verifyOTP);
router.post('/resend-otp', userController.resendOTP);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.get('/', authenticateJWT, isAdmin, userController.getAllUsers);
router.get('/profile/me', authenticateJWT, userController.getMyProfile);
router.put('/profile/me', authenticateJWT, userController.updateProfile);
router.put('/profile/change-password', authenticateJWT, userController.changePassword);
router.get('/:id', authenticateJWT, userController.getUserById);

module.exports = router;