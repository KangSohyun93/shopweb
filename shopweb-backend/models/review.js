const pool = require('../config/db');

const Review = {
    // Tạo đánh giá mới
    create: async (review) => {
        const { product_id, user_id, rating, comment } = review;
        const [result] = await pool.query(
            `INSERT INTO reviews (product_id, user_id, rating, comment)
             VALUES (?, ?, ?, ?)`,
            [product_id, user_id, rating, comment]
        );
        return result.insertId;
    },

    // Lấy tất cả đánh giá (có thể lọc theo product_id)
    getAll: async (product_id = null) => {
        let query = `
            SELECT r.*, u.username, p.name as product_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.user_id
            LEFT JOIN products p ON r.product_id = p.product_id
        `;
        const params = [];

        if (product_id) {
            query += ` WHERE r.product_id = ?`;
            params.push(product_id);
        }

        query += ` ORDER BY r.created_at DESC`;
        const [rows] = await pool.query(query, params);
        return rows;
    },

    // Lấy đánh giá theo ID
    getById: async (id) => {
        const [rows] = await pool.query(
            `SELECT r.*, u.username, p.name as product_name
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.user_id
             LEFT JOIN products p ON r.product_id = p.product_id
             WHERE r.review_id = ?`,
            [id]
        );
        return rows[0];
    },

    // Cập nhật đánh giá
    update: async (id, user_id, updateData) => {
        const { rating, comment } = updateData;
        const [result] = await pool.query(
            `UPDATE reviews SET rating = ?, comment = ?
             WHERE review_id = ? AND user_id = ?`,
            [rating, comment, id, user_id]
        );
        return result.affectedRows > 0;
    },

    // Xóa đánh giá
    delete: async (id, user_id) => {
        const [result] = await pool.query(
            `DELETE FROM reviews WHERE review_id = ? AND user_id = ?`,
            [id, user_id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Review;