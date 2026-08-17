const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function resetAllProducts() {
    try {
        console.log('⚠️  ĐỀ CẢO NGUY HIỂM: RESET TOÀN BỘ SẢN PHẨM\n');
        console.log('🧹 BẮT ĐẦU RESET DATABASE...\n');

        // 1. Xóa product_images trước (ràng buộc khóa ngoại)
        console.log('1️⃣ Xóa toàn bộ ảnh sản phẩm...');
        await db.query('DELETE FROM product_images');
        console.log('   ✅ Xóa xong!\n');

        // 2. Xóa product_variants
        console.log('2️⃣ Xóa toàn bộ variant sản phẩm...');
        await db.query('DELETE FROM product_variants');
        console.log('   ✅ Xóa xong!\n');

        // 3. Xóa toàn bộ sản phẩm
        console.log('3️⃣ Xóa toàn bộ sản phẩm...');
        await db.query('DELETE FROM products');
        console.log('   ✅ Xóa xong!\n');

        // 4. Reset AUTO_INCREMENT
        console.log('4️⃣ Reset bộ đếm...');
        await db.query('ALTER TABLE product_images AUTO_INCREMENT = 1');
        await db.query('ALTER TABLE product_variants AUTO_INCREMENT = 1');
        await db.query('ALTER TABLE products AUTO_INCREMENT = 1');
        console.log('   ✅ Reset xong!\n');

        // 5. Thống kê
        const [pCount] = await db.query('SELECT COUNT(*) as count FROM products');
        const [pImages] = await db.query('SELECT COUNT(*) as count FROM product_images');
        const [pVariants] = await db.query('SELECT COUNT(*) as count FROM product_variants');

        console.log('📊 THỐNG KÊ SAU RESET:');
        console.log(`   🏷️ Sản phẩm: ${pCount[0].count}`);
        console.log(`   📸 Ảnh: ${pImages[0].count}`);
        console.log(`   📦 Variant: ${pVariants[0].count}\n`);

        console.log('✨ RESET HOÀN THÀNH!');
        console.log('📌 Bước tiếp theo:');
        console.log('   1. node scripts/migrate_products.js  (Tạo lại sản phẩm từ CSV)');
        console.log('   2. node scripts/upload_all_images.js (Upload 3 ảnh/sản phẩm)\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

resetAllProducts();
