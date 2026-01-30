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

## 🚀 Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone https://github.com/KangSohyun93/shopweb

# Hoặc nếu chưa có repo, tải ZIP về và giải nén
# Sau đó cd vào thư mục
cd shopweb
```

### 2. Cài đặt dependencies

#### Cài đặt Backend:
```bash
cd Server
npm install
cd ..
```

#### Cài đặt Frontend:
```bash
cd Client
npm install
cd ..
```

### 3. Cấu hình Database

#### Bước 1: Đảm bảo MySQL đang chạy
```bash
# Windows: Kiểm tra MySQL service
# Nhấn Win + R, gõ: services.msc
# Tìm "MySQL" và đảm bảo đang Running

# Hoặc kiểm tra qua terminal
mysql --version
```

#### Bước 2: Tạo database và chạy script khởi tạo

**Cách 1: Chạy từ MySQL Command Line**
```bash
# Mở MySQL shell
mysql -u root -p

# Trong MySQL shell, gõ lệnh sau (thay đường dẫn bằng thư mục bạn clone về):
source /path/to/shopweb/Server/database/init.sql

# Ví dụ Windows:
# source C:/Users/YourName/shopweb/Server/database/init.sql

# Ví dụ macOS/Linux:
# source /home/username/shopweb/Server/database/init.sql

# Sau đó exit
exit;
```

**Cách 2: Chạy từ terminal (đơn giản hơn)**
```bash
# Đứng tại thư mục gốc shopweb
mysql -u root -p < Server/database/init.sql
```

**Cách 3: Sử dụng MySQL Workbench (GUI)**
- Mở MySQL Workbench
- Kết nối đến MySQL server
- File → Open SQL Script → chọn `Server/database/init.sql`
- Click icon Execute (⚡)

#### Bước 3: (Tùy chọn) Thêm dữ liệu mẫu
```bash
# Nếu có file seed.sql
mysql -u root -p shopweb_db < Server/database/seed.sql
```

#### Bước 4: Kiểm tra database đã tạo thành công
```bash
mysql -u root -p -e "USE shopweb_db; SHOW TABLES;"
```

Bạn sẽ thấy danh sách các bảng: users, products, orders, cart, reviews, v.v.

### 4. Cấu hình môi trường

#### Tạo file môi trường cho Backend

```bash
# Di chuyển vào thư mục Server
cd Server

# Tạo file .env (Windows PowerShell)
New-Item -Path .env -ItemType File

# Hoặc trên macOS/Linux
touch .env
```

Mở file `Server/.env` và thêm nội dung sau:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=shopweb_db

# JWT Secret (Thay bằng chuỗi ngẫu nhiên của bạn)
JWT_SECRET=your_super_secret_key_min_32_characters_change_this

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3001

# Email Configuration (cho chức năng OTP)
# Với Gmail, cần tạo App Password: https://support.google.com/accounts/answer/185833
EMAIL_USER=your_email@gmail.com
**Mở 2 terminal/command prompt riêng biệt:**

#### Terminal 1 - Chạy Backend Server:
```bash
# Từ thư mục gốc shopweb
cd Server
node index.js

# Hoặc (nếu đã cấu hình npm scripts)
npm start
```

✅ **Thành công khi thấy:**
```
Server running at http://localhost:5000
Socket.IO server ready
Connected to MySQL database
```

❌ **Nếu gặp lỗi:**
- `Error: ER_ACCESS_DENIED_ERROR` → Sai DB_USER hoặc DB_PASSWORD trong .env
- `Error: ER_BAD_DB_ERROR` → Database chưa được tạo, chạy lại bước 3
- `Error: Cannot find module` → Chưa chạy `npm install`

---

#### Terminal 2 - Chạy Frontend Client:
```bash
# Từ thư mục gốc shopweb
cd Client
npm start
```

✅ **Thành công khi thấy:**
```
Compiled successfully!
You can now view client in the browser.

Local:            http://localhost:3001
```

Browser sẽ tự động mở trang `http://localhost:3001`

---

### 6. Kiểm tra hoạt động

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:5000
- **Test API:** http://localhost:5000/test-db (kiểm tra kết nối database)
# Di chuyển vào thư mục Client
cd ../Client

# Tạo file .env
# Windows PowerShell:
New-Item -Path .env -ItemType File
ạo tài khoản đầu tiên

### Tạo tài khoản Customer:
1. Mở browser: http://localhost:3001
2. Click **Đăng ký** (hoặc vào `/signup`)
3. Điền thông tin và đăng ký
4. Nhập mã OTP gửi về email (kiểm tra cả Spam)
5. Đăng nhập và sử dụng

### Tạo tài khoản Admin:

**Cách 1: Nâng cấp user thường thành admin (Khuyến nghị)**

```bash
# Đăng ký tài khoản thường trước, sau đó chạy lệnh SQL:
mysql -u root -p shopweb_db

# Trong MySQL shell:
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
exit;
```

**Cách 2: Tạo admin trực tiếp qua SQL**

```bash
mysql -u root -p shopweb_db
```

Trong MySQL shell, chạy:

```sql
-- Tạo password hash cho mật khẩu "admin123"
-- Hash này được tạo bằng bcrypt với salt=10
INSERT INTO users (username, email, password_hash, role, is_verified) 
VALUES (
    'admin', 
    'admin@shopweb.com', 
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
    'admin', 
    TRUE
);
```

**Thông tin đăng nhập:**
- Email: `admin@shopweb.com`
- Password: `admin123`

⚠️ **Lưu ý:** Đổi mật khẩu ngay sau khi đăng nhập lần đầu!

**Cách 3: Sử dụng Node.js để tạo password hash tùy chỉnh**

```bash
# Trong thư mục Server
node

# Trong Node REPL:
const bcrypt = require('bcrypt');
bcrypt.hash('your_password', 10, (err, hash) => {
    console.log(hash);
});

# Copy hash và dùng trong câu lệnh INSERT ở trên
``
```bash
cd Server
node index.js
# hoặc
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

#### Terminal 2 - Frontend:
```bash
cd Client
npm start
```

Client sẽ chạy tại: `http://localhost:3001`

## 👤 Tài khoản test

### Admin:
Sau khi chạy seed.sql, bạn cần tạo tài khoản admin thủ công hoặc đăng ký và cập nhật role trong database:

```sql
-- Tạo tài khoản admin
INSERT INTO users (username, email, password_hash, role, is_verified) 
VALUES ('admin', 'admin@shopweb.com', '$2b$10$encrypted_password', 'admin', TRUE);

-- Hoặc cập nhật user hiện có thành admin
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
```

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

## 🎯 Roadmap

- [ ] Thanh toán online (VNPay, MoMo)
- [ ] Quản lý sản phẩm (CRUD)
- [ ] Báo cáo & thống kê chi tiết
- [ ] Export đơn hàng ra Excel
- [ ] Push notification
- [ ] Mobile app (React Native)


**Version:** 1.0.0  
**Last Updated:** January 30, 2026
