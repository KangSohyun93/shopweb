USE shopweb_db;

-- 1. Chèn Categories cơ bản
INSERT INTO categories (category_id, name) VALUES 
(1, 'Áo'), (2, 'Áo sơ mi'), (3, 'Quần'), (4, 'Váy');

-- 2. Chèn Brands cơ bản
INSERT INTO brands (brand_id, name) VALUES 
(1, 'Uniqlo'), (2, 'Zara'), (3, 'H&M');

-- 3. Chèn Users (Bao gồm Admin)
INSERT INTO users (username, email, password_hash, role, is_verified) VALUES
('admin1', 'admin1@example.com', '$2y$10$examplehash2', 'admin', TRUE),
('customer1', 'customer1@example.com', '$2y$10$examplehash1', 'customer', TRUE),
('admin', 'nguyenthinhung29022004@gmail.com', '$2b$10$eiU2mhIRfRz251Sx3OcZ.Oebo6SuSaqMcekrPl1UW5d1qGXyGE5A.', 'admin', TRUE);

-- 4. Chèn Banners mẫu
INSERT INTO banners (title, description, image_url, link_url, is_active, display_order) VALUES
('Khuyến mãi mùa hè', 'Giảm giá lên đến 50% cho tất cả sản phẩm', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop', '/products', TRUE, 1),
('Bộ sưu tập mới', 'Khám phá những mẫu mới nhất năm 2025', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop', '/products/new', TRUE, 2);