const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    // Tạo người dùng mới
    create: async (user) => {
        const { username, email, password, first_name, last_name, phone, role } = user;
        const password_hash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [username, email, password_hash, first_name, last_name, phone, role || 'customer']
        );
        return result.insertId;
    },

    // Tìm người dùng theo email
    findByEmail: async (email) => {
        const [rows] = await pool.query(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );
        return rows[0];
    },

    // Tìm người dùng theo ID
    findById: async (id) => {
        const [rows] = await pool.query(
            `SELECT * FROM users WHERE user_id = ?`,
            [id]
        );
        return rows[0];
    },

    // Lấy tất cả người dùng
    getAll: async () => {
        const [rows] = await pool.query(`SELECT * FROM users`);
        return rows;
    }
};

module.exports = User;