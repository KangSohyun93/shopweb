const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const adminUserStatusController = require('../controllers/adminUserStatusController');
const adminUserRoleController = require('../controllers/adminUserRoleController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// CRUD operations
router.get('/', adminUserController.getAllUsers);
router.get('/:userId', adminUserController.getUserById);
router.post('/', adminUserController.createUser);
router.put('/:userId', adminUserController.updateUser);

// Status management
router.patch('/:userId/lock', adminUserStatusController.toggleLockUser);
router.delete('/:userId', adminUserStatusController.deleteUser);
router.patch('/:userId/restore', adminUserStatusController.restoreUser);

// Role management
router.patch('/:userId/role', adminUserRoleController.changeUserRole);

module.exports = router;
