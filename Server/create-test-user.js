// Script tạo User Test nhanh chóng
const bcrypt = require('bcryptjs');
const db = require('./config/db');

const createTestUser = async () => {
    try {
        // Thông tin user test
        const testUser = {
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'Test@123456', // Password plain text
            role: 'customer'
        };

        // Hash password
        const hashedPassword = await bcrypt.hash(testUser.password, 10);

        // Chèn vào database
        const query = `
            INSERT INTO users (username, email, password_hash, role, is_verified, created_at) 
            VALUES (?, ?, ?, ?, TRUE, NOW())
        `;

        const [result] = await db.query(query, [
            testUser.username,
            testUser.email,
            hashedPassword,
            testUser.role
        ]);

        console.log('\n✅ USER TEST ĐƯỢC TẠO THÀNH CÔNG!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 EMAIL:', testUser.email);
        console.log('🔐 PASSWORD:', testUser.password);
        console.log('👤 USERNAME:', testUser.username);
        console.log('👥 ROLE:', testUser.role);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('💡 Dùng email/password này để login trên website!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi tạo user:', error.message);
        process.exit(1);
    }
};

createTestUser();
