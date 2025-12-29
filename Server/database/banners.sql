-- Tạo bảng banners
CREATE TABLE IF NOT EXISTS banners (
    banner_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATETIME,
    end_date DATETIME,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index để tối ưu truy vấn banner active
CREATE INDEX idx_banners_active ON banners(is_active, display_order);
CREATE INDEX idx_banners_dates ON banners(start_date, end_date);

-- Thêm dữ liệu mẫu
INSERT INTO banners (title, description, image_url, link_url, is_active, display_order) VALUES
('Khuyến mãi mùa hè', 'Giảm giá lên đến 50% cho tất cả sản phẩm', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop', '/products', TRUE, 1),
('Bộ sưu tập mới', 'Khám phá những mẫu mới nhất năm 2025', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop', '/products', TRUE, 2);
