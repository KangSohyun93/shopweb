require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../config/db'); 
const cloudinary = require('../config/cloudinary');

const PRODUCTS_CSV = path.join(__dirname, '../../datasets/products_expanded.csv');
const IMAGES_CSV = path.join(__dirname, '../../datasets/product_images_expanded.csv');
const IMG_BASE_PATH = path.join(__dirname, '../../datasets');

async function getFirstImageMap() {
    const imageMap = {}; 
    return new Promise((resolve, reject) => {
        fs.createReadStream(IMAGES_CSV)
            .pipe(csv())
            .on('data', (row) => {
                if (!imageMap[row.product_id]) {
                    imageMap[row.product_id] = row.image_path;
                }
            })
            .on('end', () => resolve(imageMap))
            .on('error', reject);
    });
}

async function getOrCreateCategory(name) {
    const [rows] = await db.query('SELECT category_id FROM categories WHERE name = ?', [name]);
    if (rows.length > 0) return rows[0].category_id;
    const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
    return result.insertId;
}

async function uploadImage(imagePath, legacyId) {
    try {
        const fullPath = path.join(IMG_BASE_PATH, imagePath);
        if (!fs.existsSync(fullPath)) return null;
        
        const result = await cloudinary.uploader.upload(fullPath, {
            folder: 'shopweb_products',
            public_id: `prod_${legacyId}`,
            overwrite: true
        });
        return result.secure_url;
    } catch (error) {
        console.error(`- Lỗi upload ảnh SP ${legacyId}:`, error.message);
        return null;
    }
}

async function start() {
    try {
        // --- BƯỚC DỌN DẸP RÁC (AUTO-CLEANUP) ---
        console.log('🧹 Đang dọn dẹp dữ liệu cũ bị kẹt trong Database...');
        // Xóa variant trước (ràng buộc khóa ngoại)
        await db.query('DELETE FROM product_variants WHERE sku LIKE "SKU-%"');
        // Xóa product có legacy_id
        await db.query('DELETE FROM products WHERE legacy_id IS NOT NULL');
        console.log('✅ Dọn dẹp thành công! Database đã sạch sẽ.');
        // ---------------------------------------

        console.log('⏳ Đang chuẩn bị dữ liệu ảnh...');
        const imageMap = await getFirstImageMap();
        
        const products = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(PRODUCTS_CSV)
                .pipe(csv())
                .on('data', (row) => products.push(row))
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`🚀 Bắt đầu migrate ${products.length} sản phẩm...`);
        
        let countSuccess = 0;

        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            const legacyId = p.product_id;
            
            try {
                const catId = await getOrCreateCategory(p.category);
                const imageUrl = imageMap[legacyId] ? await uploadImage(imageMap[legacyId], legacyId) : null;

                const [prodResult] = await db.query(
                    `INSERT INTO products (name, description, category_id, brand_id, primary_image_url, legacy_id) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [p.name, p.description, catId, 1, imageUrl, legacyId]
                );
                
                const newProductId = prodResult.insertId;

                const skuCode = `SKU-${legacyId}-${newProductId}`;
                const priceValue = parseFloat(p.price) || 0;
                
                await db.query(
                    `INSERT INTO product_variants (product_id, sku, size, price, stock_quantity) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [newProductId, skuCode, 'Free Size', priceValue, 100]
                );

                countSuccess++;
                if (countSuccess % 10 === 0) {
                    console.log(`✅ Đã xong ${countSuccess}/${products.length} sản phẩm...`);
                }
            } catch (err) {
                console.error(`❌ Lỗi tại sản phẩm legacy_id=${legacyId}:`, err.message);
            }
        }
        
        console.log(` Đã import thành công: ${countSuccess}`);
        process.exit(0);

    } catch (err) {
        console.error('❌ Lỗi hệ thống:', err);
        process.exit(1);
    }
}

start();