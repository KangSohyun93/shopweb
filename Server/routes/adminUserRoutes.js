const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Get all users with filters
router.get('/', adminUserController.getAllUsers);

// Get user by ID
router.get('/:userId', adminUserController.getUserById);

// Create new user
router.post('/', adminUserController.createUser);

// Update user
router.put('/:userId', adminUserController.updateUser);

// Lock/Unlock user
router.patch('/:userId/lock', adminUserController.toggleLockUser);

// Change user role
router.patch('/:userId/role', adminUserController.changeUserRole);

// Soft delete user
router.delete('/:userId', adminUserController.deleteUser);

// Restore deleted user
router.patch('/:userId/restore', adminUserController.restoreUser);

module.exports = router;
