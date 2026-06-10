# ShopWeb - Ứng dụng Thương mại Điện tử

Ứng dụng web bán hàng trực tuyến với đầy đủ tính năng quản lý sản phẩm, đơn hàng, chat realtime và quản lý người dùng.

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 19.1.0** - Framework UI
- **React Router 7.1.1** - Routing
- **Tailwind CSS** - Styling
- **Socket.IO Client 4.8.3** - Realtime communication
- **Axios** - HTTP client
- **JWT Decode** - Token authentication

### Backend
- **Node.js / Express 5.1.0** - Server framework
- **MySQL2 3.14.1** - Database
- **Socket.IO 4.8.3** - Realtime chat
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **Cloudinary** - Image hosting
- **Nodemailer** - Email service

## 📋 Yêu cầu hệ thống

- **Node.js** >= 16.x
- **MySQL** >= 8.0
- **npm** hoặc **yarn**
- **Git**

## 🚀 Hướng dẫn cài đặt (Setup Guide)

### Step 1️⃣: Clone Repository

```bash
# Clone từ GitHub
git clone https://github.com/KangSohyun93/shopweb
cd shopweb

# Hoặc nếu chưa có GitHub repo, tải ZIP về
# → Giải nén
# → Mở terminal tại thư mục gốc
```

---

### Step 2️⃣: Cài đặt Dependencies

#### Backend:
```bash
cd Server
npm install
cd ..
```

#### Frontend:
```bash
cd Client
npm install
cd ..
```

---

### Step 3️⃣: Cấu hình Database

#### Bước 3.1: Đảm bảo MySQL chạy
```bash
# Windows: Nhấn Win+R → gõ services.msc → tìm MySQL8.0 → Start
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Kiểm tra:
mysql --version
mysql -u root -p  # Enter, nhập password
SHOW DATABASES;
exit;
```

#### Bước 3.2: Khởi tạo Database

**Cách nhanh nhất (Khuyến nghị):**
```bash
# Từ thư mục gốc shopweb
cd Server
mysql -u root -p < database/init.sql
cd ..
```

**Hoặc cách khác:**
```bash
# Mở MySQL shell
mysql -u root -p

# Trong MySQL shell:
source Server/database/init.sql;
exit;
```

**Kiểm tra thành công:**
```bash
mysql -u root -p shopweb_db -e "SHOW TABLES;"
```

Sẽ thấy các bảng: users, products, product_variants, orders, cart, reviews, v.v.

---

### Step 4️⃣: Cấu hình Environment (.env)

#### Backend Configuration (`Server/.env`):

```bash
# Tạo file .env trong thư mục Server
cd Server
# Windows PowerShell:
New-Item -Path .env -ItemType File
# Hoặc macOS/Linux:
touch .env
```

Thêm nội dung sau vào `Server/.env`:

```env
# ========== DATABASE ==========
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=shopweb_db
DB_PORT=3306

# ========== JWT ==========
JWT_SECRET=your_secret_key_at_least_32_characters_long_change_this_in_production

# ========== SERVER ==========
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3001

# ========== EMAIL (OTP) ==========
# Để gửi OTP, cần cấu hình email
# Với Gmail: https://support.google.com/accounts/answer/185833
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# ========== CLOUDINARY (Image Upload) ==========
# Đăng ký tại: https://cloudinary.com
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ========== REDIS (Optional, cho cache) ==========
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ========== SOCKET.IO ==========
SOCKET_IO_CORS_ORIGIN=http://localhost:3001
```

#### Frontend Configuration (`Client/.env`):

```bash
cd ../Client
# Windows PowerShell:
New-Item -Path .env -ItemType File
# Hoặc macOS/Linux:
touch .env
```

Thêm nội dung vào `Client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

### Step 5️⃣: Chạy Application

**Mở 2 Terminal riêng biệt:**

#### Terminal 1 - Backend Server:
```bash
cd Server
node index.js
```

✅ **Thành công khi thấy:**
```
✓ MySQL connected
✓ Redis connected
✓ Socket.IO server running
✓ Server listening on port 5000
```

#### Terminal 2 - Frontend Client:
```bash
cd Client
npm start
```

✅ **Thành công khi thấy:**
```
Compiled successfully!
Local:            http://localhost:3001
```

Browser tự động mở: `http://localhost:3001`

---

### Step 6️⃣: Tạo Tài khoản Admin

#### Cách 1: Nâng cấp user hiện tại (Khuyến nghị)

```bash
# Đăng ký tài khoản bình thường trước, sau đó chạy:
mysql -u root -p shopweb_db

# Trong MySQL shell:
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
exit;
```

#### Cách 2: Tạo admin trực tiếp

```bash
mysql -u root -p shopweb_db
```

Chạy lệnh SQL:
```sql
INSERT INTO users (username, email, password_hash, role, is_verified, created_at) 
VALUES (
    'admin',
    'admin@shopweb.local',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin',
    TRUE,
    NOW()
);
exit;
```

**Đăng nhập:**
- Email: `admin@shopweb.local`
- Password: `admin123`

⚠️ **Đổi mật khẩu ngay lần đầu đăng nhập!**

---

### Step 7️⃣: Kiểm tra Hoạt động

| Thành phần | URL | Mô tả |
|-----------|-----|-------|
| Frontend | http://localhost:3001 | Giao diện khách hàng |
| Backend | http://localhost:5000 | API server |
| API Test | http://localhost:5000/api | Kiểm tra API |
| Docs | Xem `RUNNING_GUIDE.md` | Hướng dẫn chi tiết |

---

## 🔄 Backup & Restore Database

### Tạo Backup:
```bash
cd Server
node backup-database.js
```

File backup sẽ được lưu tại: `Server/backups/backup_database_*.json`

### Restore từ Backup:
```bash
cd Server
node restore-database.js [filename]
# hoặc tự động dùng backup gần nhất:
node restore-database.js
```

### Migrate SKU → COLOR (Nếu cập nhật từ version cũ):
```bash
cd Server
node migrate-sku-to-color.js [backup_filename]
# hoặc tự động dùng backup gần nhất:
node migrate-sku-to-color.js
```

---

## ⚠️ Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|---------|
| `ER_ACCESS_DENIED_ERROR` | Sai mật khẩu MySQL | Kiểm tra `DB_PASSWORD` trong `.env` |
| `ER_BAD_DB_ERROR` | Database không tồn tại | Chạy lại: `mysql -u root -p < Server/database/init.sql` |
| `Cannot find module` | Chưa cài dependencies | Chạy: `npm install` |
| Port 5000 đang dùng | Ứng dụng khác đang chạy | `netstat -ano \| findstr :5000` (Windows) để tìm process |
| Port 3001 đang dùng | Ứng dụng khác đang chạy | Đặt `PORT=3002` trong `.env` của Frontend |
| Lỗi Socket.IO | Redis chưa chạy | Start Redis hoặc disable tạm thời |
| Ảnh không upload | Cloudinary chưa cấu hình | Thêm `CLOUDINARY_*` vào `.env` |

---

## 📊 Thử Nghiệm Features

### 1. Đăng ký & OTP:
- Vào `/signup`
- Điền email hợp lệ
- Kiểm tra email OTP (cả Spam)
- Xác thực và đăng nhập

### 2. Quản lý Sản phẩm (Admin):
- Vào Admin Dashboard
- Thêm/Sửa/Xóa sản phẩm
- Upload ảnh (qua Cloudinary)
- Cập nhật giá, màu sắc

### 3. Giỏ hàng & Thanh toán:
- Thêm sản phẩm vào giỏ
- Kiểm tra tổng giá
- Chọn địa chỉ giao hàng
- Đặt hàng

### 4. Chat Realtime:
- Mở 2 browser (user & admin)
- Kiểm tra chat realtime qua Socket.IO

---

### Customer:
Đăng ký tài khoản mới qua trang `/signup`

## 📱 Các tính năng chính

### Khách hàng (Customer):
✅ Đăng ký / Đăng nhập (với xác thực OTP qua email)  
✅ Quên mật khẩu & Reset password  
✅ Xem danh sách sản phẩm, tìm kiếm, lọc theo danh mục/thương hiệu  
✅ Chi tiết sản phẩm với variants (size, màu sắc)  
✅ Thêm vào giỏ hàng, cập nhật số lượng  
✅ Đặt hàng với địa chỉ giao hàng  
✅ Xem lịch sử đơn hàng  
✅ Yêu cầu trả hàng / hoàn tiền  
✅ Đánh giá sản phẩm  
✅ Chat realtime với admin  
✅ Thông báo tin nhắn chưa đọc  
✅ Quản lý thông tin cá nhân  

### Quản trị viên (Admin):
✅ Dashboard thống kê  
✅ Quản lý đơn hàng (xem, cập nhật trạng thái, xử lý trả hàng)  
✅ **Quản lý người dùng (UC11)**:
   - Xem danh sách users với filter & search
   - Tạo user mới
   - Cập nhật thông tin user
   - Khoá/Mở khoá tài khoản
   - Thay đổi vai trò (customer ↔ admin)
   - Soft delete user
   - Khôi phục user đã xoá
✅ Quản lý banner  
✅ Chat với nhiều khách hàng đồng thời  
✅ Xem danh sách conversation  
✅ Thông báo realtime khi có tin nhắn mới  

## 📁 Cấu trúc dự án

```
shopweb/
├── Server/                      # Backend (Node.js + Express)
│   ├── config/
│   │   ├── db.js               # MySQL connection pool
│   │   ├── cloudinary.js       # Cloudinary config
│   │   └── mailer.js           # Nodemailer config
│   ├── controllers/            # Business logic handlers
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── chatController.js
│   │   └── adminUserController.js  # UC11
│   ├── models/                 # Database query functions
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── order.js
│   │   └── chat.js
│   ├── routes/                 # API route definitions
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── chatRoutes.js
│   │   └── adminUserRoutes.js      # UC11
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── upload.js          # Multer file upload
│   ├── database/
│   │   ├── init.sql           # Database schema
│   │   ├── seed.sql           # Sample data (optional)
│   │   └── migration_uc11.sql # UC11 migration
│   ├── .env                   # ⚠️ Tạo file này (xem bước 4)
│   ├── package.json
│   └── index.js               # Server entry point
│
├── Client/                     # Frontend (React)
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ChatWidget.jsx      # Customer chat
│   │   │   └── admin/
│   │   │       └── AdminNavbar.js
│   │   ├── pages/
│   │   │   ├── public/             # Login, Signup, etc.
│   │   │   ├── customer/           # HomePage, Cart, etc.
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminOrdersPage.jsx
│   │   │       ├── AdminUsersPage.jsx  # UC11
│   │   │       └── AdminChatPage.jsx
│   │   ├── layouts/
│   │   │   ├── CustomerLayout.js
│   │   │   └── AdminLayout.js
│   │   ├── contexts/
│   │   │   └── SocketContext.jsx   # Socket.IO context
│   │   ├── services/
│   │   │   └── api.js             # Axios API calls
│   │   ├── App.js                 # Main app & routes
│   │   └── index.js
│   ├── .env                       # ⚠️ Tạo file này (tùy chọn)
│   └── package.json
│
├── README.md                      # 📖 File này
└── .gitignore
```

**⚠️ File quan trọng cần tạo sau khi clone:**
- `Server/.env` (bắt buộc)
- `Client/.env` (tùy chọn)

## 🔧 Troubleshooting

### Lỗi: "JWT expired" / 403 Forbidden
**Nguyên nhân:** Token đã hết  hoặc thiếu bảng
**Giải pháp:** Drop database và khởi tạo lại

```bash
# Từ terminal
mysql -u root -p

# Trong MySQL shell:
DROP DATABASE IF EXISTS shopweb_db;
exit;

# Chạy lại script init
mysql -u root -p < 
- Thông tin DB_HOST, DB_USER, DB_PASSWORD trong `.env` đúng
- Database `shopweb_db` đã được tạo

```bash
# Kiểm tra MySQL đang chạy
# Windows:
services.msc # Tìm MySQL service

# Kiểm tra database
mysql -u root -p -e "SHOW DATABASES;"
```

### Lỗi: "WebSocket connection failed"
**Nguyên nhân:** Backend chưa chạy hoặc port 5000 bị conflict  
**Giải pháp:** Đảm bảo server đang chạy tại `http://localhost:5000`

### Lỗi: "Cannot find module"
**Giải pháp:** Xóa node_modules và cài lại

```bash
cd Server
rm -rf node_modules package-lock.json
npm install

cd ../Client
rm -rf node_modules package-lock.json
npm install
```

### Không nhận được email OTP
**Kiểm tra:**
- EMAIL_USER và EMAIL_PASS trong Server/.env đã đúng
- Với Gmail, cần tạo App Password (không dùng password thường)
- Kiểm tra log trong terminal để xem lỗi gửi email

**Cách tạo Gmail App Password:**
1. Vào Google Account → Security
2. Bật 2-Step Verification
3. Tạo App Password → chọn "Mail" và "Other"
4. Copy password và paste vào EMAIL_PASS

### Database schema không đúng
**Giải pháp:** Drop database và tạo lại

```sql
DROP DATABASE IF EXISTS shopweb_db;
source d:/tailieuhoctap/2025.1/GR2/shopweb/Server/database/init.sql
```

### Lỗi upload ảnh
**Kiểm tra:**
- Cấu hình Cloudinary trong .env đã đúng
- Test với ảnh dưới 5MB

## 📝 API Endpoints

### Authentication
```
POST   /api/users/signup          - Đăng ký
POST   /api/users/verify-otp      - Xác thực OTP
POST   /api/users/login           - Đăng nhập
POST   /api/users/forgot-password - Quên mật khẩu
POST   /api/users/reset-password  - Reset mật khẩu
```

### Products
```
GET    /api/products              - Danh sách sản phẩm
GET    /api/products/:id          - Chi tiết sản phẩm
GET    /api/products/search       - Tìm kiếm
```

### Cart & Orders
```
GET    /api/cart                  - Xem giỏ hàng
POST   /api/cart/add              - Thêm vào giỏ
POST   /api/orders                - Tạo đơn hàng
GET    /api/orders                - Lịch sử đơn hàng
PATCH  /api/orders/:id/status     - Cập nhật trạng thái
```

### Admin - Users (UC11)
```
GET    /api/admin/users           - Danh sách users
GET    /api/admin/users/:id       - Chi tiết user
POST   /api/admin/users           - Tạo user mới
PUT    /api/admin/users/:id       - Cập nhật user
PATCH  /api/admin/users/:id/lock  - Khoá/mở khoá
PATCH  /api/admin/users/:id/role  - Đổi vai trò
DELETE /api/admin/users/:id       - Soft delete
PATCH  /api/admin/users/:id/restore - Khôi phục
```

### Chat
```
GET    /api/chat/conversations    - Danh sách conversation (admin)
GET    /api/chat/messages/:convId - Tin nhắn
POST   /api/chat/send             - Gửi tin nhắn
PATCH  /api/chat/mark-read        - Đánh dấu đã đọc
```

### Socket Events
```
user:join              - User join chat
admin:join             - Admin join chat
chat:send-message      - Gửi tin nhắn
chat:new-message       - Nhận tin nhắn mới
chat:typing            - Đang gõ...
chat:mark-read         - Đánh dấu đã đọc
```

## 📚 Tài liệu tham khảo

### Hướng dẫn chính
- **[RUNNING_GUIDE.md](RUNNING_GUIDE.md)** - Hướng dẫn chạy ứng dụng chi tiết
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Tham khảo nhanh các lệnh

### Database
- **[Server/README_BACKUP.md](Server/README_BACKUP.md)** - Hướng dẫn backup/restore database
- **[Server/MIGRATION_SKU_TO_COLOR.md](Server/MIGRATION_SKU_TO_COLOR.md)** - Migration từ SKU sang COLOR

### Kiến trúc & Tối ưu
- **[KIEN_TRUC_THUAT_TOAN_XAY_DUNG_DU_AN.md](KIEN_TRUC_THUAT_TOAN_XAY_DUNG_DU_AN.md)** - Kiến trúc dự án
- **[SOLID_REFACTORING_COMPLETE.md](SOLID_REFACTORING_COMPLETE.md)** - SOLID principles

### Lệnh nhanh

```bash
# Backend
cd Server
npm install              # Cài dependencies
node index.js           # Chạy server
node backup-database.js # Backup database
node restore-database.js # Restore from backup
node drop-all-tables.js # Drop all tables
node migrate-sku-to-color.js # Migrate SKU to COLOR

# Frontend  
cd Client
npm install             # Cài dependencies
npm start              # Chạy dev server

# Database
mysql -u root -p < Server/database/init.sql  # Init database
```

---

## 🎯 Roadmap

- [ ] Thanh toán online (VNPay, MoMo)
- [ ] Quản lý sản phẩm (CRUD)
- [ ] Báo cáo & thống kê chi tiết
- [ ] Export đơn hàng ra Excel
- [ ] Push notification
- [ ] Mobile app (React Native)


**Version:** 1.0.0  
**Last Updated:** January 30, 2026
