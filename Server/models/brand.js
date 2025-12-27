const pool = require('../config/db');

const Brand = {
    // Lấy tất cả thương hiệu
    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM brands');
        return rows;
    },

    // Lấy thương hiệu theo ID
    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM brands WHERE brand_id = ?', [id]);
        return rows[0];
    },

    // Tạo thương hiệu mới
    create: async ({ name, description }) => {
        const [result] = await pool.query(`
            INSERT INTO brands (name, description)
            VALUES (?, ?)
        `, [name, description || null]);
        return result.insertId;
    },

    // Cập nhật thương hiệu
    update: async (brand_id, { name, description }) => {
        await pool.query(`
            UPDATE brands
            SET name = ?, description = ?
            WHERE brand_id = ?
        `, [name, description || null, brand_id]);
    },

    // Xóa thương hiệu
    delete: async (brand_id) => {
        await pool.query('DELETE FROM brands WHERE brand_id = ?', [brand_id]);
    },

    // Kiểm tra sản phẩm liên quan
    checkProducts: async (brand_id) => {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM products WHERE brand_id = ?', [brand_id]);
        return rows[0].count;
    }
};

module.exports = Brand;