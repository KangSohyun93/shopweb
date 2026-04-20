const db = require('../config/db');
const jwt = require('jsonwebtoken'); // Thêm thư viện giải mã token
require('dotenv').config(); // 🔑 Đảm bảo JWT_SECRET được load từ .env

exports.trackBehavior = async (req, res) => {
    try {
        const { product_id, interaction_type, dwell_time, session_id } = req.body;
        let { category_id } = req.body;

        // ==========================================
        // 1. TỰ ĐỘNG GIẢI MÃ TOKEN LẤY USER_ID
        // Khắc phục lỗi user_id bị NULL dù đã đăng nhập
        // ==========================================
        let user_id = null;
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 10) {
            const token = authHeader.split(' ')[1];
            try {
                // ✅ Sử dụng JWT_SECRET từ .env (bây giờ đã được load)
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user_id = decoded.user_id || decoded.id; 
            } catch (e) {
                // Token lỗi hoặc hết hạn thì bỏ qua, coi như khách vãng lai
                console.warn('⚠️ Tracking Auth Error:', e.message);
                // Dòng debug này để kiểm tra - nếu SECRET undefined thì sẽ thấy ngay
                if (!process.env.JWT_SECRET) {
                    console.error('🔴 CẢNH BÁO: JWT_SECRET chưa được load từ .env!');
                }
            }
        }

        // ==========================================
        // 2. TỰ ĐỘNG TÌM CATEGORY_ID NẾU BỊ THIẾU
        // Khắc phục lỗi Column 'category_id' cannot be null
        // ==========================================
        if (!category_id) {
            const [productInfo] = await db.query('SELECT category_id FROM products WHERE product_id = ?', [product_id]);
            if (productInfo.length > 0) {
                category_id = productInfo[0].category_id;
            }
        }

        // Nếu cố tìm mà vẫn không thấy (vd ID sản phẩm sai), thì bỏ qua không lưu để tránh lỗi DB
        if (!category_id) {
            return res.status(200).json({ success: false, message: 'Bỏ qua do không xác định được danh mục' });
        }

        // ==========================================
        // 3. TÍNH ĐIỂM TRỌNG SỐ VÀ LƯU DATABASE
        // ==========================================
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
