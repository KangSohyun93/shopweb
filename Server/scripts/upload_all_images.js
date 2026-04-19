const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const db = require('../config/db');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMG_DIR = path.join(__dirname, '../../datasets/img');
const MAX_IMAGES_PER_PRODUCT = 5;

// Tăng delay lên 800ms để Cloudinary không bị ngợp
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function uploadToCloudinary(filePath, safeFolderName) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `shopweb_products/${safeFolderName}`,
            use_filename: true,
            unique_filename: false,
            overwrite: true
        });
        return result.secure_url;
    } catch (error) {
        // Cải thiện in lỗi rõ ràng hơn thay vì undefined
        console.error(`❌ Lỗi upload file:`, error.message || error);
        return null;
    }
}

async function start() {
    console.log('🚀 BẮT ĐẦU CHẠY LẠI QUÁ TRÌNH TẢI ẢNH (RESUME MODE)...');
    
    try {
        const folders = fs.readdirSync(IMG_DIR, { withFileTypes: true })
                          .filter(dirent => dirent.isDirectory())
                          .map(dirent => dirent.name);

        console.log(`📁 Tìm thấy ${folders.length} thư mục sản phẩm.`);
        
        let successCount = 0;
        let skipCount = 0;

        for (let i = 0; i < folders.length; i++) {
            const folderName = folders[i];
            const folderPath = path.join(IMG_DIR, folderName);
            
            // Tìm tên gốc trong Database (Đổi _ thành dấu cách)
            const searchName = folderName.replace(/_/g, ' ');

            // Làm sạch tên thư mục để Cloudinary không báo lỗi public_id invalid
            // Chỉ giữ lại chữ cái, số, dấu gạch ngang và gạch dưới. Biến & thành And, bỏ các ký tự khác.
            let safeFolderName = folderName.replace(/&/g, 'And').replace(/[^a-zA-Z0-9_-]/g, '');

            const [productRows] = await db.query('SELECT product_id FROM products WHERE name = ? LIMIT 1', [searchName]);
            
            if (productRows.length === 0) {
                skipCount++;
                continue;
            }

            const productId = productRows[0].product_id;

            // KIỂM TRA ĐỂ BỎ QUA CÁC SẢN PHẨM ĐÃ UP RỒI (Tránh trùng lặp 100%)
            const [existingImages] = await db.query('SELECT COUNT(*) as count FROM product_images WHERE product_id = ?', [productId]);
            if (existingImages[0].count > 0) {
                // Đã có ít nhất 1 ảnh trong DB -> Bỏ qua toàn bộ thư mục này, không in ra để Terminal đỡ rối
                skipCount++;
                continue;
            }

            const files = fs.readdirSync(folderPath)
                            .filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))
                            .sort(); 

            if (files.length === 0) continue;

            const selectedFiles = files.slice(0, MAX_IMAGES_PER_PRODUCT);
            console.log(`\n⏳ Đang up MỚI [${i+1}/${folders.length}]: ${folderName} (${selectedFiles.length} ảnh)`);

            for (let j = 0; j < selectedFiles.length; j++) {
                const file = selectedFiles[j];
                const filePath = path.join(folderPath, file);
                const isPrimary = (j === 0);

                const imageUrl = await uploadToCloudinary(filePath, safeFolderName);
                
                if (imageUrl) {
                    await db.query(`
                        INSERT INTO product_images (product_id, image_url, is_primary) 
                        VALUES (?, ?, ?)
                    `, [productId, imageUrl, isPrimary ? 1 : 0]);

                    if (isPrimary) {
                        await db.query(`
                            UPDATE products SET primary_image_url = ? WHERE product_id = ?
                        `, [imageUrl, productId]);
                    }
                } else {
                    // Nếu lỗi do Cloudinary chặn, in ra và dừng cả thư mục để an toàn
                    console.log(`⚠️ Gặp lỗi tại ảnh ${file}. Sẽ chuyển sang sản phẩm tiếp theo...`);
                    break; 
                }
                
                await sleep(800); // Nghỉ 0.8 giây để an toàn qua mặt Rate Limit
            }
            
            successCount++;
        }

        console.log(`\n🎉 HOÀN THÀNH! Đã up mới thành công cho ${successCount} sản phẩm. Đã bỏ qua ${skipCount} sản phẩm.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi hệ thống ngầm định:', error);
        process.exit(1);
    }
}

start();
