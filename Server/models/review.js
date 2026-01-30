const pool = require('../config/db');

const Review = {
    // Tạo đánh giá mới
    create: async (review) => {
        const { product_id, user_id, rating, comment, order_id } = review;
        const [result] = await pool.query(
            `INSERT INTO reviews (product_id, user_id, rating, comment, order_id)
             VALUES (?, ?, ?, ?, ?)`,
            [product_id, user_id, rating, comment, order_id]
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
            `UPDATE reviews SET rating = ?, comment = ?, edit_count = edit_count + 1
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
    },

    // Kiểm tra user đã mua sản phẩm và đơn hàng đã hoàn thành
    checkUserPurchased: async (user_id, product_id) => {
        const [rows] = await pool.query(
            `SELECT oi.order_item_id 
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.order_id
             JOIN product_variants pv ON oi.variant_id = pv.variant_id
             WHERE o.user_id = ? AND pv.product_id = ? AND o.status = 'delivered'
             LIMIT 1`,
            [user_id, product_id]
        );
        return rows.length > 0;
    },

    // Kiểm tra đơn hàng có thể đánh giá không (delivered + trong 15 ngày)
    checkOrderEligibleForReview: async (order_id, user_id) => {
        const [rows] = await pool.query(
            `SELECT status, delivered_at 
             FROM orders 
             WHERE order_id = ? AND user_id = ?`,
            [order_id, user_id]
        );

        if (rows.length === 0) {
            return { eligible: false, reason: 'Đơn hàng không tồn tại' };
        }

        const order = rows[0];

        if (order.status !== 'delivered') {
            return { eligible: false, reason: 'Chỉ có thể đánh giá đơn hàng đã nhận' };
        }

        if (!order.delivered_at) {
            return { eligible: false, reason: 'Chưa có thông tin ngày giao hàng' };
        }

        // Kiểm tra 15 ngày
        const now = new Date();
        const deliveredAt = new Date(order.delivered_at);
        const daysSinceDelivery = (now - deliveredAt) / (1000 * 60 * 60 * 24);

        if (daysSinceDelivery > 15) {
            return { eligible: false, reason: 'Đã quá 15 ngày kể từ khi nhận hàng' };
        }

        return { eligible: true };
    },

    // Lấy review của user cho sản phẩm trong một đơn hàng cụ thể
    getByUserAndProduct: async (user_id, product_id, order_id) => {
        const [rows] = await pool.query(
            `SELECT r.*, p.name as product_name
             FROM reviews r
             JOIN products p ON r.product_id = p.product_id
             WHERE r.user_id = ? AND r.product_id = ? AND r.order_id = ?`,
            [user_id, product_id, order_id]
        );
        return rows[0];
    },

    // Kiểm tra xem có review nào cho đơn hàng của user này không
    hasReviewsForOrder: async (order_id, user_id) => {
        const [rows] = await pool.query(
            `SELECT r.review_id
             FROM reviews r
             WHERE r.order_id = ? AND r.user_id = ?
             LIMIT 1`,
            [order_id, user_id]
        );
        return rows.length > 0;
    }
};

module.exports = Review;