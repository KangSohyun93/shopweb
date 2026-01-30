const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Get all users with filters
exports.getAllUsers = async (req, res) => {
    try {
        const { role, is_locked, is_deleted, created_from, created_to, q, page = 1, limit = 10 } = req.query;
        
        let query = `
            SELECT user_id, username, email, first_name, last_name, phone, role, 
                   is_locked, is_deleted, is_verified, created_at, updated_at
            FROM users
            WHERE 1=1
        `;
        const params = [];

        // Filters
        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }
        if (is_locked !== undefined) {
            query += ' AND is_locked = ?';
            params.push(is_locked === 'true' ? 1 : 0);
        }
        if (is_deleted !== undefined) {
            query += ' AND is_deleted = ?';
            params.push(is_deleted === 'true' ? 1 : 0);
        }
        if (created_from) {
            query += ' AND created_at >= ?';
            params.push(created_from);
        }
        if (created_to) {
            query += ' AND created_at <= ?';
            params.push(created_to);
        }
        if (q) {
            query += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Count total
        const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // Pagination
        const offset = (page - 1) * limit;
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [users] = await pool.query(query, params);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Lỗi khi tải danh sách người dùng' });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const [users] = await pool.query(
            `SELECT user_id, username, email, first_name, last_name, phone, role, 
                    is_locked, is_deleted, is_verified, created_at, updated_at
             FROM users WHERE user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Lỗi khi tải thông tin người dùng' });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, phone, role = 'customer' } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email và password là bắt buộc' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email không hợp lệ' });
        }

        // Validate username length
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ error: 'Username phải từ 3-30 ký tự' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        // Check if email or username already exists
        const [existing] = await pool.query(
            'SELECT user_id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email hoặc username đã tồn tại' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role, is_verified)
             VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [username, email, password_hash, first_name, last_name, phone, role]
        );

        res.status(201).json({
            message: 'Tạo người dùng thành công',
            user_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Lỗi khi tạo người dùng' });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email, first_name, last_name, phone, role } = req.body;

        // Check if user exists
        const [users] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        // Check unique constraints if updating email or username
        if (email || username) {
            const [existing] = await pool.query(
                'SELECT user_id FROM users WHERE (email = ? OR username = ?) AND user_id != ?',
                [email || '', username || '', userId]
            );

            if (existing.length > 0) {
                return res.status(409).json({ error: 'Email hoặc username đã tồn tại' });
            }
        }

        // Build update query
        const updates = [];
        const params = [];

        if (username) {
            updates.push('username = ?');
            params.push(username);
        }
        if (email) {
            updates.push('email = ?');
            params.push(email);
        }
        if (first_name !== undefined) {
            updates.push('first_name = ?');
            params.push(first_name);
        }
        if (last_name !== undefined) {
            updates.push('last_name = ?');
            params.push(last_name);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
        }
        if (role) {
            updates.push('role = ?');
            params.push(role);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Không có thông tin để cập nhật' });
        }

        params.push(userId);
        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
            params
        );

        res.json({ message: 'Cập nhật người dùng thành công' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật người dùng' });
    }
};

// Lock/Unlock user
exports.toggleLockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { is_locked } = req.body;

        if (is_locked === undefined) {
            return res.status(400).json({ error: 'Trường is_locked là bắt buộc' });
        }

        // Check if user exists
        const [users] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        await pool.query('UPDATE users SET is_locked = ? WHERE user_id = ?', [is_locked, userId]);

        res.json({ 
            message: is_locked ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản'
        });
    } catch (error) {
        console.error('Error toggling lock user:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái khoá' });
    }
};

// Change user role
exports.changeUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role || !['customer', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Role phải là customer hoặc admin' });
        }

        // Check if user exists
        const [users] = await pool.query('SELECT user_id, role FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        await pool.query('UPDATE users SET role = ? WHERE user_id = ?', [role, userId]);

        res.json({ message: 'Cập nhật vai trò thành công' });
    } catch (error) {
        console.error('Error changing role:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật vai trò' });
    }
};

// Soft delete user
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const [users] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        await pool.query(
            'UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE user_id = ?',
            [userId]
        );

        res.json({ message: 'Đã xoá người dùng' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Lỗi khi xoá người dùng' });
    }
};

// Restore deleted user
exports.restoreUser = async (req, res) => {
    try {
        const { userId } = req.params;

        await pool.query(
            'UPDATE users SET is_deleted = FALSE, deleted_at = NULL WHERE user_id = ?',
            [userId]
        );

        res.json({ message: 'Đã khôi phục người dùng' });
    } catch (error) {
        console.error('Error restoring user:', error);
        res.status(500).json({ error: 'Lỗi khi khôi phục người dùng' });
    }
};
