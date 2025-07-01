const pool = require('../config/db');

const Promotion = {
    create: async (promotion) => {
        const { code, description, discount_type, discount_value, start_date, end_date, min_order_value } = promotion;
        const [result] = await pool.query(
            `INSERT INTO promotions (code, description, discount_type, discount_value, start_date, end_date, min_order_value)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [code, description, discount_type, discount_value, start_date, end_date, min_order_value || null]
        );
        return result.insertId;
    },

    getAll: async () => {
        const [rows] = await pool.query(`SELECT * FROM promotions ORDER BY start_date DESC`);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM promotions WHERE promotion_id = ?`, [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const { code, description, discount_type, discount_value, start_date, end_date, min_order_value } = data;
        const [result] = await pool.query(
            `UPDATE promotions SET code = ?, description = ?, discount_type = ?, discount_value = ?, start_date = ?, end_date = ?, min_order_value = ?
             WHERE promotion_id = ?`,
            [code, description, discount_type, discount_value, start_date, end_date, min_order_value || null, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await pool.query(`DELETE FROM promotions WHERE promotion_id = ?`, [id]);
        return result.affectedRows > 0;
    },

    apply: async (code, total_amount) => {
        const [rows] = await pool.query('SELECT * FROM promotions WHERE code = ?', [code]);
        if (rows.length === 0) {
            throw new Error('Mã khuyến mãi không hợp lệ hoặc không tồn tại.');
        }
        
        const promo = rows[0];
        const now = new Date();
        const startDate = new Date(promo.start_date);
        const endDate = new Date(promo.end_date);

        if (now < startDate) {
            throw new Error('Mã khuyến mãi chưa đến ngày bắt đầu.');
        }
        if (now > endDate) {
            throw new Error('Mã khuyến mãi đã hết hạn.');
        }
        if (total_amount < (promo.min_order_value || 0)) {
            const minOrderValueFormatted = Number(promo.min_order_value).toLocaleString('vi-VN');
            throw new Error(`Đơn hàng phải đạt tối thiểu ${minOrderValueFormatted} VND để sử dụng mã này.`);
        }

        let discount = 0;
        if (promo.discount_type === 'percentage') {
            discount = (total_amount * promo.discount_value) / 100;
        } else if (promo.discount_type === 'fixed') {
            discount = parseFloat(promo.discount_value);
        }

        let new_total = total_amount - discount;
        if (new_total < 0) {
            new_total = 0;
        }

        return {
            promotion_id: promo.promotion_id,
            new_total: new_total,
        };
    }
};

module.exports = Promotion;

