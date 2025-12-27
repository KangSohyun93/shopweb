const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo pool kết nối
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

testConnection();

module.exports = pool;