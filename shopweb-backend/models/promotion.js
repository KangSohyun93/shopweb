const pool = require('../config/db');

const Promotion = {
    // Tạo khuyến mãi mới
    create: async (promotion) => {
        const { code, description, discount_type, discount_value, start_date, end_date, min_order_value } = promotion;
        const [result] = await pool.query(
            `INSERT INTO promotions (code, description, discount_type, discount_value, start_date, end_date, min_order_value)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [code, description, discount_type, discount_value, start_date, end_date, min_order_value || null]
        );
        return result.insertId;
    },

    // Lấy tất cả khuyến mãi
    getAll: async () => {
        const [rows] = await pool.query(`SELECT * FROM promotions`);
        return rows;
    },

    // Lấy khuyến mãi theo ID
    getById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM promotions WHERE promotion_id = ?`, [id]);
        return rows[0];
    },

    // Cập nhật khuyến mãi
    update: async (promotion_id, { code, description, discount_type, discount_value, start_date, end_date, min_order_value }) => {
        await pool.query(
            `UPDATE promotions
             SET code = ?, description = ?, discount_type = ?, discount_value = ?, start_date = ?, end_date = ?, min_order_value = ?
             WHERE promotion_id = ?`,
            [code, description, discount_type, discount_value, start_date, end_date, min_order_value || null, promotion_id]
        );
    },

    // Xóa khuyến mãi
    delete: async (promotion_id) => {
        await pool.query(`DELETE FROM promotions WHERE promotion_id = ?`, [promotion_id]);
    },

    // Tìm khuyến mãi theo mã
    findByCode: async (code) => {
        const [rows] = await pool.query(
            `SELECT * FROM promotions WHERE code = ? AND start_date <= NOW() AND end_date >= NOW()`,
            [code]
        );
        return rows[0];
    },

    // Áp dụng khuyến mãi
    applyPromotion: async (code, total_amount) => {
        const promotion = await Promotion.findByCode(code);
        if (!promotion) {
            throw new Error('Invalid or expired promotion code');
        }

        if (total_amount < (promotion.min_order_value || 0)) {
            throw new Error(`Order amount must be at least ${promotion.min_order_value}`);
        }

        let discount = 0;
        if (promotion.discount_type === 'percentage') {
            discount = (promotion.discount_value / 100) * total_amount;
        } else if (promotion.discount_type === 'fixed') {
            discount = promotion.discount_value;
        }

        return {
            promotion_id: promotion.promotion_id,
            discount,
            new_total: total_amount - discount
        };
    }
};

module.exports = Promotion;