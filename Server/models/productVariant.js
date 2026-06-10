const pool = require('../config/db');

const ProductVariant = {
    // Lấy tất cả biến thể
    getAll: async (product_id) => {
        let query = `
            SELECT pv.variant_id, pv.product_id, pv.sku, pv.size, pv.price, pv.stock_quantity, pv.weight,
                p.name AS product_name, p.description AS product_description, b.name AS brand_name, c.name AS category_name
            FROM product_variants pv
            LEFT JOIN products p ON pv.product_id = p.product_id
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN categories c ON p.category_id = c.category_id
        `;
        const params = [];
        if (product_id) {
            query += ' WHERE pv.product_id = ?';
            params.push(product_id);
        }
        const [rows] = await pool.query(query, params);
        
        return rows.map(row => ({
            variant_id: row.variant_id,
            product_id: row.product_id,
            sku: row.sku,
            size: row.size,
            price: row.price,
            stock_quantity: row.stock_quantity,
            weight: row.weight
        }));
    },

    // Lấy biến thể theo ID
    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM product_variants WHERE variant_id = ?', [id]);
        if (!rows.length) return null;
        const row = rows[0];
        return {
            variant_id: row.variant_id,
            product_id: row.product_id,
            sku: row.sku,
            size: row.size,
            price: row.price,
            stock_quantity: row.stock_quantity,
            weight: row.weight
        };
    },

    // Tạo biến thể mới
    create: async ({ product_id, sku, size, price, stock_quantity, weight }) => {
        const [result] = await pool.query(
            `INSERT INTO product_variants (product_id, sku, size, price, stock_quantity, weight)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                product_id,
                sku,
                size || null,
                price,
                stock_quantity,
                weight || null
            ]
        );
        return result.insertId;
    },

    // Cập nhật biến thể
    update: async (id, { sku, size, price, stock_quantity, weight }) => {
        const [result] = await pool.query(
            `UPDATE product_variants
             SET sku = ?, size = ?, price = ?, stock_quantity = ?, weight = ?
             WHERE variant_id = ?`,
            [
                sku,
                size || null,
                price,
                stock_quantity,
                weight || null,
                id
            ]
        );
        return result.affectedRows > 0;
    },

    // Xóa biến thể
    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM product_variants WHERE variant_id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = ProductVariant;