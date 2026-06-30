const db = require('../config/db');
const redisClient = require('../config/redis');

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

// 🔍 Đọc toàn bộ cấu hình từ database
const getSettings = async () => {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM ai_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    return settings;
};

// 🛒 Lấy danh sách product_id trong giỏ hàng của user
const getCartProductIds = async (user_id) => {
    if (!user_id) return [];
    try {
        const [rows] = await db.query(`
            SELECT DISTINCT pv.product_id
            FROM cart c
            JOIN cart_items ci ON c.cart_id = ci.cart_id
            JOIN product_variants pv ON ci.variant_id = pv.variant_id
            WHERE c.user_id = ?
        `, [user_id]);
        return rows.map(r => r.product_id);
    } catch (err) {
        console.error('⚠️ Lỗi lấy giỏ hàng:', err.message);
        return [];
    }
};

// 🔴 Tra Redis recom:<product_id> cho nhiều sản phẩm. Nếu Redis lỗi hoặc trống, tự động fallback truy vấn từ MySQL bảng ai_rules
const getRedisRecsForProducts = async (productIds, excludeIds = []) => {
    let allRecs = [];
    for (const pid of productIds) {
        let recommendedIdsStr = [];
        let redisSuccess = false;
        try {
            recommendedIdsStr = await redisClient.lRange(`recom:${pid}`, 0, -1);
            redisSuccess = true;
        } catch (redisErr) {
            console.error(`⚠️ Lỗi đọc Redis cho sản phẩm ${pid}:`, redisErr.message);
        }

        // Nếu Redis bị lỗi hoặc không có dữ liệu cache, thực hiện fallback đọc từ MySQL
        if (!redisSuccess || !recommendedIdsStr || recommendedIdsStr.length === 0) {
            try {
                // Truy vấn luật kết hợp trực tiếp từ bảng ai_rules
                const [dbRules] = await db.query(
                    `SELECT consequent_id FROM ai_rules WHERE antecedent_id = ? ORDER BY confidence DESC`,
                    [pid]
                );
                if (dbRules && dbRules.length > 0) {
                    recommendedIdsStr = dbRules.map(row => row.consequent_id.toString());
                    console.log(`ℹ️ Fallback thành công: Đã lấy ${recommendedIdsStr.length} gợi ý từ MySQL cho sản phẩm ${pid}`);
                }
            } catch (dbErr) {
                console.error(`⚠️ Lỗi fallback đọc MySQL cho sản phẩm ${pid}:`, dbErr.message);
            }
        }

        if (recommendedIdsStr && recommendedIdsStr.length > 0) {
            recommendedIdsStr.forEach(id => {
                const parsedId = parseInt(id, 10);
                if (!allRecs.includes(parsedId) && !excludeIds.includes(parsedId)) {
                    allRecs.push(parsedId);
                }
            });
        }
    }
    return allRecs;
};

// 📐 Tính độ tương đồng Jaccard
const calculateJaccardSimilarity = (userProfileTags, productTags) => {
    const intersection = userProfileTags.filter(tag => productTags.includes(tag));
    const union = [...new Set([...userProfileTags, ...productTags])];
    if (union.length === 0) return 0;
    return intersection.length / union.length;
};


// 🔍 Lọc loại bỏ các sản phẩm đã hết hàng (tổng stock_quantity của các biến thể = 0)
const filterInStock = async (productIds) => {
    if (!productIds || productIds.length === 0) return [];
    try {
        const [rows] = await db.query(`
            SELECT product_id 
            FROM product_variants 
            WHERE product_id IN (?) 
            GROUP BY product_id 
            HAVING SUM(stock_quantity) > 0
        `, [productIds]);
        const inStockSet = new Set(rows.map(r => r.product_id));
        return productIds.filter(id => inStockSet.has(id));
    } catch (err) {
        console.error('⚠️ Lỗi filterInStock:', err.message);
        return productIds; // Trả về gốc nếu lỗi
    }
};

// 🔀 Thuật toán trộn máng động
const blendRecommendations = (relevantList, trendingList, relevantCount = 4, trendingCount = 1) => {
    const blended = [];
    let rIdx = 0, tIdx = 0;
    relevantCount = parseInt(relevantCount, 10);
    trendingCount = parseInt(trendingCount, 10);
    if (isNaN(relevantCount) || relevantCount < 0) relevantCount = 4;
    if (isNaN(trendingCount) || trendingCount < 0) trendingCount = 1;
    if (relevantCount === 0 && trendingCount === 0) { relevantCount = 4; trendingCount = 1; }
    const uniqueTrending = trendingList.filter(id => !relevantList.includes(id));
    while (rIdx < relevantList.length || tIdx < uniqueTrending.length) {
        for (let i = 0; i < relevantCount && rIdx < relevantList.length; i++) blended.push(relevantList[rIdx++]);
        if (tIdx < uniqueTrending.length) {
            for (let i = 0; i < trendingCount && tIdx < uniqueTrending.length; i++) blended.push(uniqueTrending[tIdx++]);
        }
    }
    return blended;
};

// 🆕 Chèn sản phẩm mới (New Arrivals Boost)
const injectNewArrivals = async (blendedIds, settings, excludeIds = []) => {
    if (settings['new_arrivals_boost_enabled'] === 'false') return blendedIds;
    const interval = parseInt(settings['new_arrivals_interval'], 10) || 10;
    const days = parseInt(settings['new_arrivals_days'], 10) || 14;
    if (interval < 1) return blendedIds;
    try {
        const allExclude = [...new Set([...blendedIds, ...excludeIds])];
        let query, queryParams;
        if (allExclude.length > 0) {
            query = `SELECT p.product_id FROM products p WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND p.product_id NOT IN (${allExclude.map(() => '?').join(',')}) AND (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.product_id) > 0 ORDER BY RAND() LIMIT 20`;
            queryParams = [days, ...allExclude];
        } else {
            query = `SELECT p.product_id FROM products p WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.product_id) > 0 ORDER BY RAND() LIMIT 20`;
            queryParams = [days];
        }
        const [newProducts] = await db.query(query, queryParams);
        const newIds = newProducts.map(p => p.product_id);
        if (newIds.length === 0) return blendedIds;
        const result = [];
        let newIdx = 0;
        for (let i = 0; i < blendedIds.length; i++) {
            result.push(blendedIds[i]);
            if ((i + 1) % interval === 0 && newIdx < newIds.length) result.push(newIds[newIdx++]);
        }
        while (newIdx < newIds.length) result.push(newIds[newIdx++]);
        return result;
    } catch (err) {
        console.error('⚠️ Lỗi injectNewArrivals:', err.message);
        return blendedIds;
    }
};

// 📦 Lấy chi tiết sản phẩm theo danh sách ID (giữ đúng thứ tự)
const getProductDetails = async (pagedIds) => {
    if (pagedIds.length === 0) return [];
    const [products] = await db.query(`
        SELECT p.product_id, p.name, p.primary_image_url, p.category_id,
               v.price, v.variant_id,
               COALESCE(SUM(oi.quantity), 0) AS total_sold
        FROM products p
        LEFT JOIN product_variants v ON p.product_id = v.product_id
        LEFT JOIN order_items oi ON v.variant_id = oi.variant_id
        WHERE p.product_id IN (?)
        GROUP BY p.product_id
    `, [pagedIds]);
    return pagedIds.map(id => products.find(p => p.product_id === id)).filter(Boolean);
};

// 📈 Lấy danh sách trending (bán chạy nhất), loại trừ danh sách chỉ định
const getTrendingIds = async (trendingLimit, excludeIds = []) => {
    let query, queryParams;
    if (excludeIds.length > 0) {
        query = `
            SELECT p.product_id, COALESCE(SUM(oi.quantity), 0) AS total_sold
            FROM products p
            LEFT JOIN product_variants v ON p.product_id = v.product_id
            LEFT JOIN order_items oi ON v.variant_id = oi.variant_id
            WHERE p.product_id NOT IN (${excludeIds.map(() => '?').join(',')})
              AND (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.product_id) > 0
            GROUP BY p.product_id ORDER BY total_sold DESC LIMIT ?
        `;
        queryParams = [...excludeIds, trendingLimit];
    } else {
        query = `
            SELECT p.product_id, COALESCE(SUM(oi.quantity), 0) AS total_sold
            FROM products p
            LEFT JOIN product_variants v ON p.product_id = v.product_id
            LEFT JOIN order_items oi ON v.variant_id = oi.variant_id
            WHERE (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.product_id) > 0
            GROUP BY p.product_id ORDER BY total_sold DESC LIMIT ?
        `;
        queryParams = [trendingLimit];
    }
    const [rows] = await db.query(query, queryParams);
    return rows.map(p => p.product_id);
};


// ═══════════════════════════════════════════════════════════
// API 1: GỢI Ý TRANG CHI TIẾT SẢN PHẨM
// Tầng 1: Redis recom:<SP đang xem>   — luôn bật
// Tầng 2: Redis từ giỏ hàng          — cấu hình: product_use_cart_redis
// Tầng 3: Jaccard cùng danh mục      — cấu hình: product_use_category_jaccard
// Tầng 4: Trending                   — luôn bật (fallback)
// → Blend (product_blend_relevant_count : product_blend_trending_count)
// → Chèn New Arrivals
// ═══════════════════════════════════════════════════════════
exports.getRecommendations = async (req, res) => {
    try {
        const { product_id } = req.params;
        const productIdInt = parseInt(product_id, 10);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const settings = await getSettings();

        // Per-page settings — đọc riêng cho trang Chi tiết SP
        const useItemRedis       = settings['product_use_item_redis'] !== 'false';
        const useCartRedis       = settings['product_use_cart_redis'] !== 'false';
        const useCategoryJaccard = settings['product_use_category_jaccard'] !== 'false';
        const useTrending        = settings['product_use_trending'] !== 'false';
        const blendRelevantCount = parseInt(settings['product_blend_relevant_count'], 10) || parseInt(settings['blend_relevant_count'], 10) || 4;
        const blendTrendingCount = parseInt(settings['product_blend_trending_count'], 10) || parseInt(settings['blend_trending_count'], 10) || 1;

        // Global settings
        const jaccardWeight  = parseFloat(settings['jaccard_weight']) ?? 0.7;
        const salesWeight    = parseFloat(settings['sales_weight']) ?? 0.3;
        const trendingLimit  = parseInt(settings['trending_limit'], 10) || 50;

        const user_id = req.user ? req.user.user_id : null;

        // --- TẦNG 1: Redis Cache cho sản phẩm đang xem ---
        let aiRecommendedIds = [];
        if (useItemRedis) {
            aiRecommendedIds = await getRedisRecsForProducts([productIdInt], [productIdInt]);
            aiRecommendedIds = await filterInStock(aiRecommendedIds);
        }

        // --- TẦNG 2: Redis từ giỏ hàng (theo cấu hình per-page) ---
        const cartProductIds = await getCartProductIds(user_id);
        if (useCartRedis && cartProductIds.length > 0) {
            const cartForLookup = cartProductIds.filter(id => id !== productIdInt);
            if (cartForLookup.length > 0) {
                let cartRecs = await getRedisRecsForProducts(cartForLookup, [productIdInt, ...aiRecommendedIds]);
                cartRecs = await filterInStock(cartRecs);
                aiRecommendedIds = [...aiRecommendedIds, ...cartRecs];
            }
        }

        // --- TẦNG 3: Jaccard cùng danh mục (theo cấu hình per-page) ---
        let categoryRecommendedIds = [];
        if (useCategoryJaccard) {
            const [currentProd] = await db.query('SELECT category_id FROM products WHERE product_id = ?', [product_id]);
            if (currentProd.length > 0) {
                const catId = currentProd[0].category_id;
                const [categoryProducts] = await db.query(`
                    SELECT p.product_id, p.category_id,
                           (SELECT SUM(quantity) FROM order_items oi JOIN product_variants pv ON oi.variant_id = pv.variant_id WHERE pv.product_id = p.product_id) AS total_sold
                    FROM products p
                    WHERE p.category_id = ? AND p.product_id != ?
                      AND (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.product_id) > 0
                `, [catId, product_id]);

                const scoredProducts = categoryProducts.map(product => {
                    const jaccardScore = calculateJaccardSimilarity([catId], [product.category_id]);
                    const salesScore = product.total_sold > 0 ? Math.log(product.total_sold + 1) : 0;
                    const finalScore = (jaccardScore * jaccardWeight) + ((salesScore / 10) * salesWeight);
                    return { product_id: product.product_id, finalScore };
                });
                scoredProducts.sort((a, b) => b.finalScore - a.finalScore);
                categoryRecommendedIds = scoredProducts.map(p => p.product_id);
            }
        }

        // --- TẦNG 4: Trending (fallback) ---
        const trendingRecommendedIds = useTrending ? await getTrendingIds(trendingLimit, [productIdInt]) : [];

        // --- TRỘN: (Tầng 1+2+3) vs (Tầng 4) ---
        let primaryList = aiRecommendedIds.length > 0
            ? [...new Set([...aiRecommendedIds, ...categoryRecommendedIds])]
            : categoryRecommendedIds;

        let allRecommendedIds = [];
        if (primaryList.length > 0) {
            if (useTrending && trendingRecommendedIds.length > 0) {
                allRecommendedIds = blendRecommendations(primaryList, trendingRecommendedIds, blendRelevantCount, blendTrendingCount);
            } else {
                allRecommendedIds = primaryList;
            }
        } else {
            allRecommendedIds = trendingRecommendedIds;
        }

        // --- CHÈN NEW ARRIVALS ---
        allRecommendedIds = await injectNewArrivals(allRecommendedIds, settings, [productIdInt, ...cartProductIds]);

        const pagedIds = allRecommendedIds.slice(offset, offset + limit);
        const finalProducts = await getProductDetails(pagedIds);

        res.status(200).json({
            success: true,
            hasMore: (offset + limit) < allRecommendedIds.length,
            page, total: allRecommendedIds.length,
            data: finalProducts
        });
    } catch (error) {
        console.error('❌ Lỗi getRecommendations:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy gợi ý' });
    }
};


// ═══════════════════════════════════════════════════════════
// API 2: GỢI Ý TRANG CHỦ
// Tầng 0: Redis từ giỏ hàng          — cấu hình: homepage_use_cart_redis
// Tầng 1: Jaccard cá nhân hóa        — cấu hình: recommendation_method = hybrid
// Tầng 2: Trending                   — luôn bật (fallback)
// → Blend (homepage_blend_relevant_count : homepage_blend_trending_count)
// → Chèn New Arrivals
// ═══════════════════════════════════════════════════════════
exports.getHomepageRecommendations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const user_id = req.user ? req.user.user_id : null;
        const session_id = req.headers['x-session-id'] || req.query.session_id;

        const settings = await getSettings();

        // Per-page settings — đọc riêng cho Trang chủ
        const useCartRedis       = settings['homepage_use_cart_redis'] !== 'false';
        const useTrending        = settings['homepage_use_trending'] !== 'false';
        const blendRelevantCount = parseInt(settings['homepage_blend_relevant_count'], 10) || parseInt(settings['blend_relevant_count'], 10) || 4;
        const blendTrendingCount = parseInt(settings['homepage_blend_trending_count'], 10) || parseInt(settings['blend_trending_count'], 10) || 1;

        // Global settings
        const recMethod          = settings['recommendation_method'] || 'hybrid';
        const jaccardWeight      = parseFloat(settings['jaccard_weight']) ?? 0.7;
        const salesWeight        = parseFloat(settings['sales_weight']) ?? 0.3;
        const trendingLimit      = parseInt(settings['trending_limit'], 10) || 50;
        const topCategoriesLimit = parseInt(settings['top_categories_limit'], 10) || 3;

        // --- TẦNG 0: Redis từ giỏ hàng (theo cấu hình per-page) ---
        const cartProductIds = await getCartProductIds(user_id);
        let cartRedisRecs = [];
        if (useCartRedis && cartProductIds.length > 0) {
            cartRedisRecs = await getRedisRecsForProducts(cartProductIds, cartProductIds);
            cartRedisRecs = await filterInStock(cartRedisRecs);
        }

        // --- TẦNG 1: Jaccard cá nhân hóa (theo recommendation_method) ---
        let preferredCategories = [];
        if (recMethod === 'hybrid') {
            let profileQuery = '', queryParams = [];
            if (user_id) {
                profileQuery = `SELECT category_id, SUM(interaction_weight) as total_score FROM user_interactions WHERE user_id = ? GROUP BY category_id ORDER BY total_score DESC LIMIT ?`;
                queryParams = [user_id, topCategoriesLimit];
            } else if (session_id) {
                profileQuery = `SELECT category_id, SUM(interaction_weight) as total_score FROM user_interactions WHERE session_id = ? GROUP BY category_id ORDER BY total_score DESC LIMIT ?`;
                queryParams = [session_id, topCategoriesLimit];
            }
            if (profileQuery) {
                const [userProfile] = await db.query(profileQuery, queryParams);
                preferredCategories = userProfile.map(p => p.category_id);
            }
        }

        let personalizedProducts = [];
        if (preferredCategories.length > 0) {
            const [allProducts] = await db.query(`
                SELECT p.product_id, p.category_id,
                       (SELECT SUM(quantity) FROM order_items oi JOIN product_variants pv ON oi.variant_id = pv.variant_id WHERE pv.product_id = p.product_id) AS total_sold
                FROM products p
                WHERE p.category_id IN (?)
                  AND (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.product_id) > 0
            `, [preferredCategories]);

            const scoredProducts = allProducts.map(product => {
                const jaccardScore = calculateJaccardSimilarity(preferredCategories, [product.category_id]);
                const salesScore = product.total_sold > 0 ? Math.log(product.total_sold + 1) : 0;
                const finalScore = (jaccardScore * jaccardWeight) + ((salesScore / 10) * salesWeight);
                return { product_id: product.product_id, finalScore };
            });
            scoredProducts.sort((a, b) => b.finalScore - a.finalScore);
            personalizedProducts = scoredProducts.map(p => p.product_id);
        }

        // Gộp Tầng 0 + Tầng 1 → primaryList
        const primaryList = [...new Set([...cartRedisRecs, ...personalizedProducts])];

        // --- TẦNG 2: Trending (fallback) ---
        const trendingRecommendedIds = useTrending ? await getTrendingIds(trendingLimit) : [];

        // --- TRỘN ---
        let allRecommendedIds = [];
        if (primaryList.length > 0) {
            if (useTrending && trendingRecommendedIds.length > 0) {
                allRecommendedIds = blendRecommendations(primaryList, trendingRecommendedIds, blendRelevantCount, blendTrendingCount);
            } else {
                allRecommendedIds = primaryList;
            }
        } else {
            allRecommendedIds = trendingRecommendedIds;
        }

        // --- CHÈN NEW ARRIVALS ---
        allRecommendedIds = await injectNewArrivals(allRecommendedIds, settings, cartProductIds);

        const pagedIds = allRecommendedIds.slice(offset, offset + limit);
        const finalProducts = await getProductDetails(pagedIds);

        res.status(200).json({
            success: true,
            is_personalized: preferredCategories.length > 0 || cartRedisRecs.length > 0,
            hasMore: (offset + limit) < allRecommendedIds.length,
            page, total: allRecommendedIds.length,
            data: finalProducts
        });
    } catch (error) {
        console.error('❌ Lỗi getHomepageRecommendations:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};


// ═══════════════════════════════════════════════════════════
// API 3: GỢI Ý TRANG GIỎ HÀNG
// Tầng 1: Redis từ toàn bộ giỏ hàng  — luôn bật
// Tầng 2: Trending                   — luôn bật (fallback)
// → Blend (cart_blend_relevant_count : cart_blend_trending_count)
// → Chèn New Arrivals
// ═══════════════════════════════════════════════════════════
exports.getCartRecommendations = async (req, res) => {
    try {
        const productIdsQuery = req.query.product_ids || '';
        const cartProductIds = productIdsQuery
            .split(',')
            .map(id => parseInt(id.trim(), 10))
            .filter(id => !isNaN(id));

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const settings = await getSettings();

        // Per-page settings — đọc riêng cho trang Giỏ hàng
        const useRedis           = settings['cart_use_redis'] !== 'false';
        const useTrending        = settings['cart_use_trending'] !== 'false';
        const blendRelevantCount = parseInt(settings['cart_blend_relevant_count'], 10) || parseInt(settings['blend_relevant_count'], 10) || 4;
        const blendTrendingCount = parseInt(settings['cart_blend_trending_count'], 10) || parseInt(settings['blend_trending_count'], 10) || 1;
        const trendingLimit      = parseInt(settings['trending_limit'], 10) || 50;

        // --- TẦNG 1: Redis từ toàn bộ giỏ hàng ---
        let aiRecommendedIds = useRedis ? await getRedisRecsForProducts(cartProductIds, cartProductIds) : [];
        if (aiRecommendedIds.length > 0) aiRecommendedIds = await filterInStock(aiRecommendedIds);

        // --- TẦNG 2: Trending ---
        const trendingRecommendedIds = useTrending ? await getTrendingIds(trendingLimit, cartProductIds) : [];

        // --- TRỘN ---
        let allRecommendedIds = [];
        if (aiRecommendedIds.length > 0) {
            if (useTrending && trendingRecommendedIds.length > 0) {
                allRecommendedIds = blendRecommendations(aiRecommendedIds, trendingRecommendedIds, blendRelevantCount, blendTrendingCount);
            } else {
                allRecommendedIds = aiRecommendedIds;
            }
        } else {
            allRecommendedIds = trendingRecommendedIds;
        }

        // --- CHÈN NEW ARRIVALS ---
        allRecommendedIds = await injectNewArrivals(allRecommendedIds, settings, cartProductIds);

        const pagedIds = allRecommendedIds.slice(offset, offset + limit);
        const finalProducts = await getProductDetails(pagedIds);

        res.status(200).json({
            success: true,
            hasMore: (offset + limit) < allRecommendedIds.length,
            page, total: allRecommendedIds.length,
            data: finalProducts
        });
    } catch (error) {
        console.error('❌ Lỗi getCartRecommendations:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy gợi ý giỏ hàng' });
    }
};