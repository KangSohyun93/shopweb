const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function debug() {
    try {
        // 1. Kiểm tra tổng số sản phẩm
        const [productCount] = await db.query('SELECT COUNT(*) as count FROM products');
        console.log(`📊 Tổng sản phẩm trong DB: ${productCount[0].count}`);

        // 2. Kiểm tra sản phẩm có ảnh
        const [withImages] = await db.query('SELECT COUNT(DISTINCT product_id) as count FROM product_images');
        console.log(`📸 Sản phẩm đã có ảnh: ${withImages[0].count}`);

        // 3. Liệt kê 10 sản phẩm đầu tiên
        const [products] = await db.query('SELECT product_id, name FROM products LIMIT 10');
        console.log(`\n📋 10 sản phẩm đầu:`);
        products.forEach((p, i) => {
            console.log(`  ${i+1}. ${p.name}`);
        });

        // 4. Kiểm tra sản phẩm có 0 ảnh
        const [noImages] = await db.query(`
            SELECT p.product_id, p.name 
            FROM products p 
            LEFT JOIN product_images pi ON p.product_id = pi.product_id 
            WHERE pi.product_id IS NULL 
            LIMIT 10
        `);
        console.log(`\n❌ 10 sản phẩm chưa có ảnh:`);
        noImages.forEach((p, i) => {
            console.log(`  ${i+1}. ${p.name}`);
        });

        // 5. Tìm sản phẩm cụ thể
        const testName = 'Sheer Pleated-Front Blouse';
        const [searchResult] = await db.query('SELECT product_id FROM products WHERE name = ?', [testName]);
        console.log(`\n🔍 Tìm "${testName}": ${searchResult.length > 0 ? '✅ CÓ' : '❌ KHÔNG CÓ'}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

debug();
