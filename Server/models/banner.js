const pool = require('../config/db');

const Banner = {
    // Lấy tất cả banner
    getAll: async () => {
        const query = `SELECT * FROM banners ORDER BY display_order ASC, created_at DESC`;
        const [rows] = await pool.query(query);
        return rows;
    },

    // Lấy banner active
    getActive: async () => {
        const query = `
            SELECT * FROM banners 
            WHERE is_active = true 
            AND (start_date IS NULL OR start_date <= NOW())
            AND (end_date IS NULL OR end_date >= NOW())
            ORDER BY display_order ASC
        `;
        const [rows] = await pool.query(query);
        return rows;
    },

    // Lấy banner theo ID
    getById: async (id) => {
        const query = `SELECT * FROM banners WHERE banner_id = ?`;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    },

    // Tạo banner mới
    create: async (bannerData) => {
        const { title, description, image_url, link_url, is_active, start_date, end_date, display_order } = bannerData;
        const query = `
            INSERT INTO banners (title, description, image_url, link_url, is_active, start_date, end_date, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [
            title,
            description || null,
            image_url,
            link_url || null,
            is_active !== undefined ? is_active : true,
            start_date || null,
            end_date || null,
            display_order || 0
        ]);
        return result.insertId;
    },

    // Cập nhật banner
    update: async (id, bannerData) => {
        const { title, description, image_url, link_url, is_active, start_date, end_date, display_order } = bannerData;
        const query = `
            UPDATE banners 
            SET title = ?, 
                description = ?, 
                image_url = ?, 
                link_url = ?, 
                is_active = ?,
                start_date = ?,
                end_date = ?,
                display_order = ?
            WHERE banner_id = ?
        `;
        const [result] = await pool.query(query, [
            title,
            description || null,
            image_url,
            link_url || null,
            is_active,
            start_date || null,
            end_date || null,
            display_order || 0,
            id
        ]);
        return result.affectedRows > 0;
    },

    // Xóa banner
    delete: async (id) => {
        const query = `DELETE FROM banners WHERE banner_id = ?`;
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0;
    },

    // Cập nhật trạng thái active
    updateStatus: async (id, isActive) => {
        const query = `UPDATE banners SET is_active = ? WHERE banner_id = ?`;
        const [result] = await pool.query(query, [isActive, id]);
        return result.affectedRows > 0;
    }
};

module.exports = Banner;
