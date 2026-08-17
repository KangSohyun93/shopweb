require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../config/db');

// Đường dẫn file
const USERS_CSV = path.join(__dirname, '../../datasets/users_expanded.csv');
const PURCHASES_CSV = path.join(__dirname, '../../datasets/purchases_expanded.csv');

// Hàm đọc CSV dùng Promise
function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

async function start() {
    try {
        console.log('🧹 1. Đang dọn dẹp dữ liệu Orders cũ (nếu có)...');
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('TRUNCATE TABLE order_items');
        await db.query('TRUNCATE TABLE orders');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        // ==========================================
        // PHASE 1: IMPORT USERS
        // ==========================================
        console.log('⏳ 2. Bắt đầu nạp dữ liệu Users...');
        const users = await parseCSV(USERS_CSV);
        const userValues = users.map(u => [
            u.user_id, 
            u.username, 
            u.email, 
            '$2b$10$eiU2mhIRfRz251Sx3OcZ.Oebo6SuSaqMcekrPl1UW5d1qGXyGE5A.', // Pass mặc định chung cho lẹ
            'customer', 
            1, // is_verified
            u.signup_date
        ]);

        // Chia nhỏ mảng để insert (500 user/lần) tránh vượt quá gói tin của MySQL
        for (let i = 0; i < userValues.length; i += 500) {
            const chunk = userValues.slice(i, i + 500);
            // Dùng INSERT IGNORE: Nếu trùng ID admin ở Seed.sql thì bỏ qua
            await db.query(`
                INSERT IGNORE INTO users 
                (user_id, username, email, password_hash, role, is_verified, created_at) 
                VALUES ?
            `, [chunk]);
        }
        console.log(`✅ Đã import xong ${users.length} Users.`);

        // ==========================================
        // PHASE 2: TẠO MAPPING SẢN PHẨM
        // ==========================================
        console.log('⏳ 3. Đang thiết lập Mapping Sản phẩm (Legacy ID -> Variant ID)...');
        const [variantRows] = await db.query(`
            SELECT p.legacy_id, v.variant_id 
            FROM products p 
            JOIN product_variants v ON p.product_id = v.product_id 
            WHERE p.legacy_id IS NOT NULL
        `);
        
        const variantMap = {}; // { 1: 15, 2: 16... }
        variantRows.forEach(r => {
            variantMap[r.legacy_id] = r.variant_id;
        });

        // ==========================================
        // PHASE 3: IMPORT ORDERS & ORDER_ITEMS
        // ==========================================
        console.log('⏳ 4. Đang phân tích file Purchases (Gom nhóm đơn hàng)...');
        const purchases = await parseCSV(PURCHASES_CSV);
        const ordersMap = new Map();

        // Gom nhóm: Mỗi (User + Ngày) là 1 Order
        purchases.forEach(p => {
            const key = `${p.user_id}_${p.purchase_date}`;
            if (!ordersMap.has(key)) {
                ordersMap.set(key, { 
                    user_id: p.user_id, 
                    date: p.purchase_date, 
                    total_amount: 0, 
                    items: [] 
                });
            }
            
            const order = ordersMap.get(key);
            const amount = parseFloat(p.amount) || 0;
            const quantity = parseInt(p.quantity) || 1;
            
            order.total_amount += amount;
            order.items.push({ 
                legacy_id: parseInt(p.product_id), 
                quantity: quantity, 
                price: amount / quantity // Đơn giá
            });
        });

        const ordersArr = Array.from(ordersMap.values());
        console.log(`🚀 Bắt đầu insert ${ordersArr.length} Đơn hàng (đã được gom nhóm từ ${purchases.length} records)...`);

        let countSuccess = 0;

        for (let i = 0; i < ordersArr.length; i++) {
            const o = ordersArr[i];
            
            // 3.1. Insert Bảng Orders
            const [orderRes] = await db.query(`
                INSERT INTO orders (user_id, total_amount, status, delivered_at, created_at) 
                VALUES (?, ?, 'delivered', ?, ?)
            `, [o.user_id, o.total_amount, o.date, o.date]); // Lấy ngày mua làm ngày tạo & ngày giao

            const orderId = orderRes.insertId;
            const itemValues = [];

            // 3.2. Chuẩn bị dữ liệu Order Items
            for (const item of o.items) {
                const variantId = variantMap[item.legacy_id];
                if (variantId) {
                    itemValues.push([orderId, variantId, item.quantity, item.price]);
                }
            }

            // 3.3. Insert Bảng Order Items bằng bulk insert cho lẹ
            if (itemValues.length > 0) {
                await db.query(`
                    INSERT INTO order_items (order_id, variant_id, quantity, price) 
                    VALUES ?
                `, [itemValues]);
            }

            countSuccess++;
            if (countSuccess % 1000 === 0) {
                console.log(`✅ Đã xử lý ${countSuccess}/${ordersArr.length} đơn hàng...`);
            }
        }

        console.log(`Đã tạo thành công ${countSuccess} orders hợp lệ.`);
        process.exit(0);

    } catch (err) {
        console.error('❌ Lỗi hệ thống:', err);
        process.exit(1);
    }
}

start();