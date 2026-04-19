const db = require('../config/db');
const redisClient = require('../config/redis');

exports.getRecommendations = async (req, res) => {
    try {
        const { product_id } = req.params;
        
        // 1. Cố gắng lấy danh sách ID gợi ý từ Redis (Tốc độ mili-giây)
        const redisKey = `recom:${product_id}`;
        // Redis client v4 trả về mảng string ['3806', '2556']
        const recommendedIdsStr = await redisClient.lRange(redisKey, 0, -1); 
        
        // Chuyển mảng string thành mảng số nguyên
        const recommendedIds = recommendedIdsStr.map(id => parseInt(id, 10));

        let finalProducts = [];

        // 2. NẾU CÓ LUẬT GỢI Ý TỪ AI: Query MySQL lấy chi tiết
        if (recommendedIds && recommendedIds.length > 0) {
            // Lấy thêm thông tin giá và ảnh từ product_variants
            const query = `
                SELECT 
                    p.product_id, 
                    p.name, 
                    p.primary_image_url,
                    v.price,
                    v.variant_id
                FROM products p
                LEFT JOIN product_variants v ON p.product_id = v.product_id
                WHERE p.product_id IN (?)
                GROUP BY p.product_id
            `;
            const [products] = await db.query(query, [recommendedIds]);
            finalProducts = products;
        }

        // 3. LOGIC DỰ PHÒNG (FALLBACK): NẾU AI KHÔNG CÓ GỢI Ý
        // Thuật toán không thể gợi ý cho TẤT CẢ sản phẩm (Cold-start). 
        // Nếu không có, ta gợi ý 5 sản phẩm cùng Category.
        if (finalProducts.length === 0) {
            console.log(`[Recom] Fallback: Không có AI rule cho ID ${product_id}. Gợi ý cùng Category.`);
            
            // Tìm category của sản phẩm hiện tại
            const [currentProd] = await db.query('SELECT category_id FROM products WHERE product_id = ?', [product_id]);
            
            if (currentProd.length > 0) {
                const catId = currentProd[0].category_id;
                const fallbackQuery = `
                    SELECT 
                        p.product_id, 
                        p.name, 
                        p.primary_image_url,
                        v.price,
                        v.variant_id
                    FROM products p
                    LEFT JOIN product_variants v ON p.product_id = v.product_id
                    WHERE p.category_id = ? AND p.product_id != ?
                    GROUP BY p.product_id
                    LIMIT 5
                `;
                const [fallbackProducts] = await db.query(fallbackQuery, [catId, product_id]);
                finalProducts = fallbackProducts;
            }
        }

        // 4. Trả kết quả về cho Frontend
        res.status(200).json({
            success: true,
            data: finalProducts
        });

    } catch (error) {
        console.error('❌ Lỗi getRecommendations:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy gợi ý' });
    }
};