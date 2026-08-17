const redisClient = require('../config/redis');

async function testRedis() {
    try {
        console.log('⏳ Đang test Lưu (SET) dữ liệu vào Redis...');
        // Set một key có tên 'test_recom' với giá trị là danh sách ID sản phẩm
        await redisClient.set('test_recom', JSON.stringify([15, 20, 99]));
        console.log('✅ SET thành công!');

        console.log('⏳ Đang test Đọc (GET) dữ liệu từ Redis...');
        // Lấy dữ liệu ra
        const value = await redisClient.get('test_recom');
        console.log(`✅ GET thành công! Giá trị lấy được là: ${value}`);
        console.log(`👉 Dạng mảng JavaScript:`, JSON.parse(value));

        // Dọn dẹp trả lại sự trong sáng cho Redis
        await redisClient.del('test_recom');
        console.log('🧹 Đã xóa key test_recom thành công.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi Test Redis:', error);
        process.exit(1);
    }
}

// Đợi 1 giây để Redis kịp thiết lập kết nối xong thì mới chạy hàm test
setTimeout(testRedis, 1000);