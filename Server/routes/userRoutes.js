const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

router.post('/signup', userController.register);
router.post('/login', userController.login);
router.get('/', authenticateJWT, isAdmin, userController.getAllUsers);
router.get('/:id', authenticateJWT, userController.getUserById);

module.exports = router;