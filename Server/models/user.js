const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    // Tạo người dùng mới với OTP
    create: async (userData) => {
        const { username, email, password, first_name, last_name, phone, role, otp_code, otp_expires } = userData;
        const password_hash = await bcrypt.hash(password, 10);
        
        console.log('📝 Model User.create - Dữ liệu nhận được:');
        console.log('  - Email:', email);
        console.log('  - OTP Code:', otp_code);
        console.log('  - OTP Expires:', otp_expires);
        
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role, otp_code, otp_expires, is_verified)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
            [username, email, password_hash, first_name, last_name, phone, role || 'customer', otp_code, otp_expires]
        );
        
        console.log('✅ User đã được insert với ID:', result.insertId);
        return result.insertId;
    },

    // Hàm xác minh người dùng thành công
    verifyUser: async (email) => {
        await pool.query(
            `UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires = NULL WHERE email = ?`,
            [email]
        );
    },

    // Cập nhật OTP cho forgot password
    updateOTP: async (userId, otp, expires) => {
        await pool.query(
            `UPDATE users SET otp_code = ?, otp_expires = ? WHERE user_id = ?`,
            [otp, expires, userId]
        );
    },

    // Cập nhật OTP với số lần gửi lại
    updateOTPWithResendCount: async (email, otp, expires, resendCount) => {
        // Lấy giờ hiện tại Việt Nam
        const nowLocal = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).replace('T', ' ');
        await pool.query(
            `UPDATE users SET otp_code = ?, otp_expires = ?, otp_resend_count = ?, otp_last_sent = ? WHERE email = ?`,
            [otp, expires, resendCount, nowLocal, email]
        );
    },

    // Cập nhật mật khẩu mới
    updatePassword: async (userId, hashedPassword) => {
        await pool.query(
            `UPDATE users SET password_hash = ?, otp_code = NULL, otp_expires = NULL WHERE user_id = ?`,
            [hashedPassword, userId]
        );
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