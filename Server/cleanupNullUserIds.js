const db = require('./config/db');
require('dotenv').config();

async function cleanupNullUserIds() {
    try {
        console.log('🔍 Bắt đầu kiểm tra NULL user_id...\n');
        
        // 1. Đếm số record NULL
        const [countResult] = await db.query(
            'SELECT COUNT(*) as count FROM user_interactions WHERE user_id IS NULL'
        );
        const nullCount = countResult[0].count;
        
        if (nullCount === 0) {
            console.log('✅ Không có record nào có user_id = NULL');
            process.exit(0);
        }
        
        console.log(`📊 Tìm thấy ${nullCount} record có user_id = NULL\n`);
        
        // 2. Hiển thị 10 record mẫu trước khi xóa
        const [samples] = await db.query(
            'SELECT interaction_id, product_id, category_id, interaction_type, created_at FROM user_interactions WHERE user_id IS NULL LIMIT 10'
        );
        
        console.log('📋 10 record sẽ bị xóa:');
        console.log(JSON.stringify(samples, null, 2));
        console.log('');
        
        // 3. Xóa tất cả record có user_id = NULL
        const [deleteResult] = await db.query(
            'DELETE FROM user_interactions WHERE user_id IS NULL'
        );
        
        console.log(`🗑️  Đã xóa ${deleteResult.affectedRows} record có user_id = NULL`);
        console.log('✨ Dọn dẹp hoàn tất!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        process.exit(0);
    }
}

cleanupNullUserIds();
