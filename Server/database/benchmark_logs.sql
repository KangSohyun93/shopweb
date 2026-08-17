-- Bảng lưu lịch sử benchmark mỗi lần Admin chạy Worker
-- Dùng để hiển thị biểu đồ so sánh trên Dashboard
CREATE TABLE IF NOT EXISTS benchmark_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    algorithm VARCHAR(50) NOT NULL COMMENT 'Tên thuật toán đã chạy',
    runtime DECIMAL(10, 4) NOT NULL COMMENT 'Thời gian thực thi (giây)',
    num_frequent_itemsets INT DEFAULT 0 COMMENT 'Số tập phổ biến tìm được',
    num_rules INT DEFAULT 0 COMMENT 'Số luật kết hợp sinh ra',
    min_support_count INT DEFAULT 2 COMMENT 'Ngưỡng support tối thiểu',
    min_confidence DECIMAL(5, 4) DEFAULT 0.05 COMMENT 'Ngưỡng confidence tối thiểu',
    num_transactions INT DEFAULT 0 COMMENT 'Số giao dịch đầu vào',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm chạy'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Lịch sử benchmark thuật toán khai phá luật kết hợp';
