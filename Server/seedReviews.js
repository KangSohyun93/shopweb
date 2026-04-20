const mysql = require('mysql2/promise');
require('dotenv').config();

// Sử dụng thông số kết nối từ file .env của bạn
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shopweb_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const sampleComments = [
    "Sản phẩm chất lượng rất tốt, vải mềm mát.",
    "Form dáng chuẩn, mặc lên cực kỳ tôn dáng nhé mọi người.",
    "Giao hàng nhanh, đóng gói cẩn thận. Rất ưng ý!",
    "Màu sắc giống y như hình, đáng tiền mua.",
    "Hàng chính hãng, đường may tỉ mỉ không có chỉ thừa.",
    "Mặc đi chơi hay đi làm đều hợp, sẽ ủng hộ shop tiếp.",
    "Rất đáng đồng tiền bát gạo, vote 5 sao cho shop!"
];

async function seedFakeReviews() {
    try {
        console.log('🔄 Đang bắt đầu tạo dữ liệu đánh giá giả...');
        
        // 1. Kiểm tra xem có User nào chưa
        const [users] = await pool.query('SELECT user_id FROM users LIMIT 50');
        if (users.length === 0) {
            console.log('❌ Lỗi: Bạn chưa có user nào trong Database. Vui lòng đăng ký ít nhất 1 tài khoản trước!');
            return process.exit(1);
        }

        // 2. Lấy danh sách sản phẩm
        const [products] = await pool.query('SELECT product_id FROM products');
        
        let count = 0;
        
        for (const product of products) {
            // Mỗi sản phẩm sẽ có từ 1 đến 5 đánh giá
            const numReviews = Math.floor(Math.random() * 5) + 1; 
            
            for (let i = 0; i < numReviews; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)].user_id;
                // Random số sao từ 4 đến 5 (để web đẹp, tỷ lệ 5 sao nhiều hơn)
                const rating = Math.random() > 0.3 ? 5 : 4; 
                const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
                
                // Chú ý: order_id để NULL vì đây là review giả, không gắn với đơn hàng cụ thể
                await pool.query(
                    'INSERT INTO reviews (user_id, product_id, rating, comment, order_id) VALUES (?, ?, ?, ?, NULL)',
                    [randomUser, product.product_id, rating, comment]
                );
                count++;
            }
        }

        console.log(`✅ Thành công! Đã bơm ${count} đánh giá 4-5 sao cho toàn bộ sản phẩm.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Có lỗi xảy ra:', error);
        process.exit(1);
    }
}

seedFakeReviews();