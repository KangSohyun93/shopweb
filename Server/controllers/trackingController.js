const db = require('../config/db');
const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 

exports.trackBehavior = async (req, res) => {
    try {
        const { product_id, interaction_type, dwell_time, session_id } = req.body;
        let { category_id } = req.body;

        let user_id = null;
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 10) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user_id = decoded.user_id || decoded.id; 
            } catch (e) {
                console.warn('⚠️ Tracking Auth Error:', e.message);
                if (!process.env.JWT_SECRET) {
                    console.error('🔴 CẢNH BÁO: JWT_SECRET chưa được load từ .env!');
                }
            }
        }

        if (!category_id) {
            const [productInfo] = await db.query('SELECT category_id FROM products WHERE product_id = ?', [product_id]);
            if (productInfo.length > 0) {
                category_id = productInfo[0].category_id;
            }
        }

        if (!category_id) {
            return res.status(200).json({ success: false, message: 'Bỏ qua do không xác định được danh mục' });
        }

        let weight = 0;
        switch (interaction_type) {
            case 'hover': weight = 1; break;
            case 'view': 
                weight = 2 + Math.min((dwell_time || 0) / 10, 3); 
                break;
            case 'add_to_cart': weight = 10; break;
            default: weight = 1;
        }

        const query = `
            INSERT INTO user_interactions 
            (user_id, session_id, product_id, category_id, interaction_type, dwell_time, interaction_weight) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.query(query, [
            user_id, session_id || null, product_id, category_id, interaction_type, dwell_time || 0, weight
        ]);

        res.status(200).json({ success: true, message: 'Lưu tương tác thành công!' });
    } catch (error) {
        console.error('Tracking Error:', error);
        res.status(200).json({ success: false, message: 'Lỗi ngầm khi tracking' }); 
    }
};
