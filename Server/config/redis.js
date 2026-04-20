const redis = require('redis');

// Khởi tạo client kết nối tới Redis Server đang chạy ở máy tính (localhost:6379)
const redisClient = redis.createClient({
    url: 'redis://127.0.0.1:6379'
});

// Lắng nghe các sự kiện để dễ debug
redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Đã kết nối tới Redis Server!'));

// Kết nối (Bắt buộc với thư viện redis v4+)
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('❌ Không thể tự động kết nối Redis lúc khởi động:', err.message);
    }
})();

module.exports = redisClient;