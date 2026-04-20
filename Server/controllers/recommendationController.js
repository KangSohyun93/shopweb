const db = require('../config/db');
const redisClient = require('../config/redis');

// 📐 HÀM CODE TAY: Tính độ tương đồng Jaccard (Jaccard Similarity)
// Jaccard = (A giao B) / (A hợp B)
// Ứng dụng: So sánh sở thích người dùng với thuộc tính sản phẩm
const calculateJaccardSimilarity = (userProfileTags, productTags) => {
    // Tìm phần giao nhau
    const intersection = userProfileTags.filter(tag => productTags.includes(tag));
    
    // Tìm phần hợp (loại bỏ trùng lặp)
    const union = [...new Set([...userProfileTags, ...productTags])];
    
    // Công thức: Jaccard = |A ∩ B| / |A ∪ B|
    if (union.length === 0) return 0;
    return intersection.length / union.length;
};

exports.getRecommendations = async (req, res) => {
    try {
        const { product_id } = req.params;
        
        // 📖 PHÂN TRANG
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let allRecommendedIds = [];
        
        // 1. TRY: Lấy danh sách gợi ý từ Redis (từ AI Worker)
        const redisKey = `recom:${product_id}`;
        const recommendedIdsStr = await redisClient.lRange(redisKey, 0, -1);
        
        if (recommendedIdsStr && recommendedIdsStr.length > 0) {
            // ✅ CÓ AI RULE: Lấy theo thứ tự từ Redis
            allRecommendedIds = recommendedIdsStr.map(id => parseInt(id, 10));
        } else {
            // ❌ FALLBACK: Gợi ý cùng Category với Jaccard + Sales Score
            const [currentProd] = await db.query(
                'SELECT category_id FROM products WHERE product_id = ?', 
                [product_id]
            );
            
            if (currentProd.length > 0) {
                const catId = currentProd[0].category_id;
                
                // Lấy tất cả sản phẩm cùng category
                const [categoryProducts] = await db.query(`
                    SELECT p.product_id, p.name, p.primary_image_url, p.category_id,
                           v.price, COALESCE(SUM(oi.quantity), 0) AS total_sold
                    FROM products p
                    LEFT JOIN product_variants v ON p.product_id = v.product_id
                    LEFT JOIN order_items oi ON v.variant_id = oi.variant_id
                    WHERE p.category_id = ? AND p.product_id != ?
                    GROUP BY p.product_id
                `, [catId, product_id]);
                
                // Chấm điểm Jaccard (giả sử user thích category này)
                const scoredProducts = categoryProducts.map(product => {
                    const userProfileTags = [catId];
                    const productTags = [product.category_id];
                    const jaccardScore = calculateJaccardSimilarity(userProfileTags, productTags);
                    const salesScore = product.total_sold > 0 ? Math.log(product.total_sold + 1) : 0;
                    const finalScore = (jaccardScore * 0.7) + ((salesScore / 10) * 0.3);
                    return { ...product, finalScore };
                });
                
                // Sort theo điểm cao nhất
                scoredProducts.sort((a, b) => b.finalScore - a.finalScore);
                allRecommendedIds = scoredProducts.map(p => p.product_id);
            }
        }

        // 2. PHÂN TRANG & LẤY CHI TIẾT SẢN PHẨM
        const pagedIds = allRecommendedIds.slice(offset, offset + limit);
        let finalProducts = [];

        if (pagedIds.length > 0) {
            const query = `
                SELECT 
                    p.product_id, 
                    p.name, 
                    p.primary_image_url,
                    p.category_id,
                    v.price,
                    v.variant_id,
                    COALESCE(SUM(oi.quantity), 0) AS total_sold
                FROM products p
                LEFT JOIN product_variants v ON p.product_id = v.product_id
                LEFT JOIN order_items oi ON v.variant_id = oi.variant_id
                WHERE p.product_id IN (?)
                GROUP BY p.product_id
            `;
            const [products] = await db.query(query, [pagedIds]);
            finalProducts = products;
        }

        // 3. KIỂM TRA HASMORE
        const hasMore = (offset + limit) < allRecommendedIds.length;

        res.status(200).json({
            success: true,
            hasMore: hasMore,
            page: page,
            total: allRecommendedIds.length,
            data: finalProducts
        });

    } catch (error) {
        console.error('❌ Lỗi getRecommendations:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy gợi ý' });
    }
};

exports.getHomepageRecommendations = async (req, res) => {
    try {
        // 📖 PHÂN TRANG: Nhận page và limit từ Frontend
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const user_id = req.user ? req.user.user_id : null;
        const session_id = req.headers['x-session-id'] || req.query.session_id;

        let targetProducts = [];
        let preferredCategories = [];
        let totalCount = 0;

        // THUẬT TOÁN 1: XÂY DỰNG USER PROFILE (Dựa trên lịch sử tương tác)
        let profileQuery = ``;
        let queryParams = [];

        if (user_id) {
            profileQuery = `SELECT category_id, SUM(interaction_weight) as total_score 
                            FROM user_interactions WHERE user_id = ? 
                            GROUP BY category_id ORDER BY total_score DESC LIMIT 3`;
            queryParams = [user_id];
        } else if (session_id) {
            profileQuery = `SELECT category_id, SUM(interaction_weight) as total_score 
                            FROM user_interactions WHERE session_id = ? 
                            GROUP BY category_id ORDER BY total_score DESC LIMIT 3`;
            queryParams = [session_id];
        }

        if (profileQuery) {
            const [userProfile] = await db.query(profileQuery, queryParams);
            preferredCategories = userProfile.map(p => p.category_id);
        }

        // TẦNG 1: NẾU CÓ SỞ THÍCH (Content-Based + Jaccard Similarity)
        if (preferredCategories.length > 0) {
            // Lấy ALL sản phẩm để score bằng Jaccard (không LIMIT)
            const [allProducts] = await db.query(`
                SELECT p.product_id, p.name, p.primary_image_url, p.category_id, 
                       v.price, COALESCE(SUM(oi.quantity), 0) AS total_sold, p.created_at
                FROM products p
                LEFT JOIN product_variants v ON p.product_id = v.product_id
                LEFT JOIN order_items oi ON v.variant_id = oi.variant_id
                WHERE p.category_id IN (?)
                GROUP BY p.product_id
            `, [preferredCategories]);

            // 📐 ÁPDỤNG JACCARD SIMILARITY: Chấm điểm TOÀN BỘ sản phẩm
            const scoredProducts = allProducts.map(product => {
                const userProfileTags = preferredCategories;
                const productTags = [product.category_id];
                
                const jaccardScore = calculateJaccardSimilarity(userProfileTags, productTags);
                const salesScore = product.total_sold > 0 ? Math.log(product.total_sold + 1) : 0;
                
                // Tổng hợp điểm: 70% Jaccard + 30% Sales
                const finalScore = (jaccardScore * 0.7) + ((salesScore / 10) * 0.3);
                
                return { ...product, finalScore };
            });

            // 🔝 SORT theo finalScore GIẢM DẦN (Gợi ý nhất xuống ít nhất)
            scoredProducts.sort((a, b) => b.finalScore - a.finalScore);

            // Tính tổng số sản phẩm
            totalCount = scoredProducts.length;

            // 📄 PHÂN TRANG: Cắt theo offset
            targetProducts = scoredProducts.slice(offset, offset + limit);
        } 
        
        // TẦNG 2: FALLBACK (Best Sellers)
        else {
            const [countResult] = await db.query(`
                SELECT COUNT(*) as total FROM products
            `);
            totalCount = countResult[0].total;

            const [fallbackProducts] = await db.query(`
                SELECT p.product_id, p.name, p.primary_image_url, p.category_id, 
                       v.price, COALESCE(SUM(oi.quantity), 0) AS total_sold
                FROM products p
                LEFT JOIN product_variants v ON p.product_id = v.product_id
                LEFT JOIN order_items oi ON v.variant_id = oi.variant_id
                GROUP BY p.product_id
                ORDER BY total_sold DESC 
                LIMIT ? OFFSET ?
            `, [limit, offset]);
            
            targetProducts = fallbackProducts;
        }

        // ✅ KIỂM TRA HASMORE
        const hasMore = (offset + limit) < totalCount;

        res.status(200).json({
            success: true,
            is_personalized: preferredCategories.length > 0,
            hasMore: hasMore,
            page: page,
            total: totalCount,
            data: targetProducts
        });

    } catch (error) {
        console.error('❌ Lỗi getHomepageRecommendations:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};