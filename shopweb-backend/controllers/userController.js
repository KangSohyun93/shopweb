const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userController = {
    // Đăng ký người dùng
    register: async (req, res) => {
        try {
            const { username, email, password, first_name, last_name, phone } = req.body;

            // Kiểm tra email đã tồn tại
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            // Tạo người dùng mới
            const userId = await User.create({
                username,
                email,
                password,
                first_name,
                last_name,
                phone
            });

            res.status(201).json({ id: userId, message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to register user' });
        }
    },

    // Đăng nhập
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Tìm người dùng
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Tạo JWT
            const token = jwt.sign(
                { user_id: user.user_id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } // Token hết hạn sau 1 giờ
            );

            res.json({
                message: 'Login successful',
                user: { id: user.user_id, username: user.username, email: user.email, role: user.role },
                token
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to login' });
        }
    },

    // Lấy tất cả người dùng
    getAllUsers: async (req, res) => {
        try {
            const users = await User.getAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    },

    // Lấy người dùng theo ID
    getUserById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch user' });
        }
    }
};

module.exports = userController;