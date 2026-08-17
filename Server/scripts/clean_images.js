const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function cleanDatabase() {
    try {
        console.log('🧹 BẮT ĐẦU LÀM SẠCH DATABASE...\n');

        // 1. Xóa product_images (ảnh cũ)
        console.log('1️⃣ Xóa toàn bộ ảnh sản phẩm cũ...');
        await db.query('DELETE FROM product_images');
        const [imageCount] = await db.query('SELECT COUNT(*) as count FROM product_images');
        console.log(`   ✅ Đã xóa xong! Còn lại: ${imageCount[0].count} ảnh\n`);

        // 2. Reset primary_image_url của products
        console.log('2️⃣ Xóa đường dẫn ảnh đại diện của sản phẩm...');
        await db.query('UPDATE products SET primary_image_url = NULL');
        console.log('   ✅ Đã xóa xong!\n');

        // 3. Kiểm tra số lượng sản phẩm còn lại
        const [productCount] = await db.query('SELECT COUNT(*) as count FROM products');
        console.log(`3️⃣ Thống kê:`);
        console.log(`   📊 Sản phẩm còn lại: ${productCount[0].count}`);
        console.log(`   📸 Ảnh còn lại: 0\n`);

        console.log('✨ HOÀN THÀNH! Database đã được làm sạch.');
        console.log('📌 Bước tiếp theo: Chạy node scripts/upload_all_images.js để upload 3 ảnh/sản phẩm\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

cleanDatabase();
