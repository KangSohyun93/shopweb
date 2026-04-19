const pool = require('./config/db');

async function restructure() {
    try {
        console.log('🔄 Bắt đầu tái cấu trúc danh mục...');

        // 1. Reset parent_id về NULL để tránh lỗi nếu chạy lại nhiều lần
        await pool.query('UPDATE categories SET parent_id = NULL');

        // 2. Xóa các danh mục Cha cũ nếu có (để tạo mới sạch sẽ)
        await pool.query(`DELETE FROM categories WHERE name IN ('ÁO', 'QUẦN & VÁY', 'KHÁC')`);

        // 3. Tạo 3 danh mục Cha cốt lõi
        const [res1] = await pool.query(`INSERT INTO categories (name, parent_id) VALUES ('ÁO', NULL)`);
        const aoId = res1.insertId;

        const [res2] = await pool.query(`INSERT INTO categories (name, parent_id) VALUES ('QUẦN & VÁY', NULL)`);
        const quanId = res2.insertId;

        const [res3] = await pool.query(`INSERT INTO categories (name, parent_id) VALUES ('KHÁC', NULL)`);
        const khacId = res3.insertId;

        console.log('✅ Đã tạo 3 danh mục gốc: ÁO, QUẦN & VÁY, KHÁC');

        // 4. Lấy tất cả các danh mục con hiện tại
        const [categories] = await pool.query(`SELECT * FROM categories WHERE category_id NOT IN (?, ?, ?)`, [aoId, quanId, khacId]);

        // 5. Phân loại tự động dựa trên từ khóa (Hỗ trợ cả tên Tiếng Anh của DeepFashion và Tiếng Việt)
        let count = 0;
        for (const cat of categories) {
            const name = cat.name.toLowerCase();
            let newParentId = khacId; // Mặc định cho vào "KHÁC"

            // Nhóm ÁO (Upper)
            if (name.includes('áo') || name.includes('tee') || name.includes('tank') || name.includes('blouse') || 
                name.includes('sweater') || name.includes('jacket') || name.includes('blazer') || name.includes('hoodie') || 
                name.includes('top') || name.includes('coat') || name.includes('cardigan') || name.includes('pullover')) {
                newParentId = aoId;
            } 
            // Nhóm QUẦN & VÁY (Lower & Full body)
            else if (name.includes('quần') || name.includes('váy') || name.includes('đầm') || name.includes('jeans') || 
                     name.includes('shorts') || name.includes('skirt') || name.includes('dress') || name.includes('pants') || 
                     name.includes('leggings') || name.includes('joggers') || name.includes('romper') || name.includes('jumpsuit')) {
                newParentId = quanId;
            }

            // Cập nhật Database
            await pool.query('UPDATE categories SET parent_id = ? WHERE category_id = ?', [newParentId, cat.category_id]);
            count++;
        }

        console.log(`✅ Đã phân loại thành công ${count} danh mục vào đúng vị trí!`);
        console.log('🎉 BẠN CÓ THỂ ĐÓNG TERMINAL NÀY VÀ QUAY LẠI CHẠY WEB ĐƯỢC RỒI!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

restructure();
