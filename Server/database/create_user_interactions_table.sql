-- 📊 Tạo bảng tracking hành vi người dùng

CREATE TABLE IF NOT EXISTS user_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,                           -- NULL nếu khách chưa login
    session_id VARCHAR(50) NULL,                -- Session ID cho khách không login
    product_id INT NOT NULL,
    category_id INT NULL,
    interaction_type ENUM('hover', 'view', 'add_to_cart') DEFAULT 'view',
    dwell_time INT DEFAULT 0,                  -- Thời gian ở lại (giây)
    interaction_weight DECIMAL(5,2) DEFAULT 1, -- Trọng số tương tác (1-10)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    
    -- Indexes để tăng tốc độ query
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_product_id (product_id),
    INDEX idx_category_id (category_id),
    INDEX idx_created_at (created_at),
    INDEX idx_interaction_type (interaction_type)
);

-- ✅ Tạo view để dễ dàng phân tích dữ liệu
CREATE OR REPLACE VIEW user_behavior_summary AS
SELECT 
    u.user_id,
    u.username,
    COUNT(*) as total_interactions,
    SUM(CASE WHEN ui.interaction_type = 'view' THEN 1 ELSE 0 END) as view_count,
    SUM(CASE WHEN ui.interaction_type = 'add_to_cart' THEN 1 ELSE 0 END) as cart_count,
    SUM(ui.interaction_weight) as total_engagement_score,
    MAX(ui.created_at) as last_interaction
FROM users u
LEFT JOIN user_interactions ui ON u.user_id = ui.user_id
GROUP BY u.user_id, u.username;

-- 📋 Query ví dụ: Lấy sản phẩm nổi bật nhất (được xem nhiều nhất)
-- SELECT 
--     p.product_id, 
--     p.name, 
--     COUNT(*) as view_count,
--     SUM(ui.interaction_weight) as total_weight
-- FROM user_interactions ui
-- JOIN products p ON ui.product_id = p.product_id
-- WHERE ui.interaction_type IN ('view', 'add_to_cart')
-- GROUP BY p.product_id, p.name
-- ORDER BY total_weight DESC
-- LIMIT 20;
