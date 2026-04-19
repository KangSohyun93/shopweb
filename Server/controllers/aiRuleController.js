const db = require('../config/db');

exports.getAiRules = async (req, res) => {
    try {
        // Lấy luật và JOIN với bảng products để lấy tên và ảnh cho đẹp
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
            LIMIT 100
        `;
        const [rules] = await db.query(query);
        res.status(200).json({ success: true, data: rules });
    } catch (error) {
        console.error('Lỗi lấy AI Rules:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};