const db = require('../config/db');

exports.getAiRules = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        // 1. Đếm tổng số luật
        const countQuery = `
            SELECT COUNT(*) AS total 
            FROM ai_rules r
            JOIN products p1 ON r.antecedent_id = p1.product_id
            JOIN products p2 ON r.consequent_id = p2.product_id
        `;
        const [[{ total }]] = await db.query(countQuery);

        // 2. Lấy luật phân trang và JOIN với bảng products để lấy tên và ảnh cho đẹp
        const query = `
            SELECT 
                r.id, 
                p1.name AS ant_name, p1.primary_image_url AS ant_img,
                p2.name AS cons_name, p2.primary_image_url AS cons_img,
                r.confidence, r.support_count
            FROM ai_rules r
            JOIN products p1 ON r.antecedent_id = p1.product_id
            JOIN products p2 ON r.consequent_id = p2.product_id
            ORDER BY r.confidence DESC, r.support_count DESC
            LIMIT ? OFFSET ?
        `;
        const [rules] = await db.query(query, [limit, offset]);
        
        res.status(200).json({ 
            success: true, 
            data: rules,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Lỗi lấy AI Rules:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};