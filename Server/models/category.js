const pool = require('../config/db');

const Category = {
    // Lấy tất cả danh mục
    getAll: async () => {
        const [rows] = await pool.query(`
            SELECT c1.category_id, c1.name, c1.description, c1.parent_id, c2.name AS parent_name
            FROM categories c1
            LEFT JOIN categories c2 ON c1.parent_id = c2.category_id
        `);
        return rows;
    },

    // Lấy danh mục theo ID
    getById: async (id) => {
        const [rows] = await pool.query(`
            SELECT c1.category_id, c1.name, c1.description, c1.parent_id, c2.name AS parent_name
            FROM categories c1
            LEFT JOIN categories c2 ON c1.parent_id = c2.category_id
            WHERE c1.category_id = ?
        `, [id]);
        return rows[0];
    },

    // Tạo danh mục mới
    create: async ({ name, description, parent_id }) => {
        // Kiểm tra parent_id hợp lệ
        if (parent_id) {
            const [parent] = await pool.query('SELECT category_id FROM categories WHERE category_id = ?', [parent_id]);
            if (!parent[0]) {
                throw new Error('Invalid parent_id');
            }
        }
        const [result] = await pool.query(`
            INSERT INTO categories (name, description, parent_id)
            VALUES (?, ?, ?)
        `, [name, description || null, parent_id || null]);
        return result.insertId;
    },

    // Cập nhật danh mục
    update: async (category_id, { name, description, parent_id }) => {
        // Kiểm tra parent_id hợp lệ và không phải chính nó
        if (parent_id) {
            if (parseInt(parent_id) === parseInt(category_id)) {
                throw new Error('Category cannot be its own parent');
            }
            const [parent] = await pool.query('SELECT category_id FROM categories WHERE category_id = ?', [parent_id]);
            if (!parent[0]) {
                throw new Error('Invalid parent_id');
            }
        }
        await pool.query(`
            UPDATE categories
            SET name = ?, description = ?, parent_id = ?
            WHERE category_id = ?
        `, [name, description || null, parent_id || null, category_id]);
    },

    // Xóa danh mục
    delete: async (category_id) => {
        const productCount = await Category.checkProducts(category_id);
        if (productCount > 0) {
            throw new Error('Cannot delete category with associated products');
        }
        await pool.query('DELETE FROM categories WHERE category_id = ?', [category_id]);
    },

    // Kiểm tra sản phẩm liên quan
    checkProducts: async (category_id) => {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [category_id]);
        return rows[0].count;
    }
};

module.exports = Category;