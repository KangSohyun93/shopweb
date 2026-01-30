USE shopweb_db;

-- 1. Chèn Categories
INSERT INTO categories (category_id, name) VALUES 
(1, 'Áo'), (2, 'Áo sơ mi'), (3, 'Quần'), (4, 'Váy');

-- 2. Chèn Brands
INSERT INTO brands (brand_id, name) VALUES (1, 'Uniqlo'), (2, 'Zara'), (3, 'H&M');

-- 3. Chèn Users (Mật khẩu giả định, bạn cần hash lại khi code)
INSERT INTO users (username, email, password_hash, role, is_verified) VALUES
('admin1', 'admin1@example.com', '$2y$10$examplehash2', 'admin', TRUE),
('customer1', 'customer1@example.com', '$2y$10$examplehash1', 'customer', TRUE),
('admin', 'nguyenthinhung29022004@gmail.com', '$2b$10$eiU2mhIRfRz251Sx3OcZ.Oebo6SuSaqMcekrPl1UW5d1qGXyGE5A.', 'admin', TRUE);

-- 4. Chèn Products (Danh sách sản phẩm bạn đã cung cấp)
INSERT INTO products (product_id, name, description, category_id, brand_id, primary_image_url) VALUES
(1, 'Váy kẻ sang trọng', 'Váy sang trọng', 4, 1, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1748284568/shopweb/pq51mbeg2yqxvrwmh24y.jpg'),
(2, 'Quần jeans nữ', 'Quần jeans nữ ống suông', 3, 2, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1748284649/shopweb/e09zomal5ixxgkcprysv.jpg'),
(3, 'Váy maxi', 'Váy maxi dài lụa', 4, 3, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1748284772/shopweb/majjr623gsmmo0shwwze.jpg'),
(4, 'Set váy ngắn nhã nhặn', 'Nhã nhặn', 4, 1, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1748284900/shopweb/fsej0obsjsao9ockg1sa.jpg'),
(5, 'Set váy nâu', 'Xinh xắn', 4, 2, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1748285055/shopweb/s3lehoxylypykvmtfnxl.jpg'),
(6, 'Váy liền thân trắng', 'Váy xinh', 4, 1, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1748285223/shopweb/hjvrqkxsahvkjpho1nx5.jpg'),
(7, 'Áo sọc tím', 'Áo xinh', 1, 1, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1748297395/shopweb/kti8t6kjhwxdlzyslir1.jpg'),
(8, 'ÁO MONGTOGHI ĐỎ ĐÔ', 'Áo xinh', 1, 3, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1748300326/shopweb/zs3mayn50ux2lumex6ei.jpg'),
(9, 'Áo 2 dây', 'Xinh', 1, 1, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1748301885/shopweb/l8dsk1inuipx6tm3qh5y.jpg'),
(10, 'Áo trái tim', 'Áo xinh', 1, 1, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1748302345/shopweb/yryagyz7cwythd28zlty.jpg'),
(11, 'Quần baggy xếp ly', 'Quần', 3, 3, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1750597617/shopweb/nevsnnyflwjfz1dyfeh7.jpg'),
(12, 'Khăn phong cách', 'Khăn cá tính', 1, 1, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1750601958/shopweb/qnqtwallx3oiwy9wm7ux.jpg'),
(48, 'ỵtrjrjxdjytrehexhx', 'ỵtrjrjxd', 2, 1, 'https://res.cloudinary.com/dohkcbl1l/image/upload/v1751336036/shopweb/nvshmmvbryabzr6z6fyy.jpg');

-- 5. Chèn Product Variants (Quan trọng: Phải có variant thì sản phẩm mới hiện giá/size)
INSERT INTO product_variants (product_id, sku, size, price, stock_quantity) VALUES
(1, 'VAY-KE-M', 'M', 500000, 100),
(2, 'JEAN-NU-S', 'S', 800000, 50),
(3, 'MAXI-L', 'L', 1100000, 30),
(4, 'SET-VAN-S', 'S', 123456, 19),
(7, 'AO-TIM-S', 'S', 800000, 24),
(48, 'yte', 'M', 54964, 3);