# 📖 Hướng dẫn Chạy ShopWeb

Hướng dẫn chi tiết cách thiết lập và chạy ứng dụng ShopWeb với 3 thành phần: Frontend, Backend, và Worker.

---

## 📋 Yêu cầu hệ thống

- **Node.js** >= 16.x ([tải tại](https://nodejs.org/))
- **MySQL** >= 8.0 ([tải tại](https://dev.mysql.com/downloads/mysql/))
- **Python** >= 3.8 ([tải tại](https://www.python.org/downloads/))
- **Git** ([tải tại](https://git-scm.com/))
- **Redis** (tùy chọn, nếu dùng worker)

### Kiểm tra phiên bản đã cài

```bash
node --version      # v16.x.x hoặc cao hơn
npm --version       # 8.x.x hoặc cao hơn
mysql --version     # 8.0.x hoặc cao hơn
python --version    # 3.8.x hoặc cao hơn
```

---

## 🔧 Bước 1: Cải Đặt Dependencies

### 1.1 Backend (Node.js)

```bash
# Từ thư mục gốc shopweb
cd Server
npm install
cd ..
```

### 1.2 Frontend (React)

```bash
cd Client
npm install
cd ..
```

### 1.3 Worker (Python)

```bash
cd worker

# Tạo virtual environment (khuyến nghị)
# Windows:
python -m venv venv
venv\Scripts\activate

# macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

---

## 🗄️ Bước 2: Thiết Lập Database

### 2.1 Đảm Bảo MySQL Đang Chạy

**Windows:**
- Nhấn `Win + R`, gõ `services.msc`
- Tìm dòng "MySQL" (ví dụ: "MySQL80") và đảm bảo trạng thái là **Running**
- Nếu chưa chạy, click chuột phải > **Start**

**macOS:**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo systemctl start mysql
```

### 2.2 Tạo Database và Bảng

**Cách 1: Chạy SQL script từ terminal (KHUYẾN NGHỊ)**

```bash
# Từ thư mục gốc shopweb
mysql -u root -p < Server/database/init.sql
```

Bạn sẽ được yêu cầu nhập password MySQL của root. Hãy nhập và chờ script hoàn tất.

**Cách 2: Chạy từ MySQL Command Line**

```bash
# Mở MySQL shell
mysql -u root -p

# Nhập password của MySQL root

# Chạy lệnh (thay đường dẫn phù hợp):
# Windows:
source C:/Users/YourName/shopweb/Server/database/init.sql

# macOS/Linux:
source /home/username/shopweb/Server/database/init.sql

# Thoát
exit
```

**Cách 3: Dùng MySQL Workbench (GUI)**

1. Mở MySQL Workbench
2. Kết nối tới MySQL server của bạn
3. Vào **File → Open SQL Script**
4. Chọn file `Server/database/init.sql`
5. Nhấn nút **Execute (⚡)** hoặc `Ctrl+Shift+Enter`
6. Đợi hoàn tất

### 2.3 Kiểm Tra Database

```bash
# Kiểm tra database đã được tạo
mysql -u root -p -e "SHOW DATABASES;"

# Kiểm tra các bảng trong database shopweb_db
mysql -u root -p -e "USE shopweb_db; SHOW TABLES;"
```

Bạn sẽ thấy các bảng: `users`, `products`, `orders`, `cart`, `reviews`, `messages`, v.v.

---

## ⚙️ Bước 3: Cấu Hình Môi Trường

### 3.1 Tạo File .env cho Backend

```bash
# Từ thư mục Server
cd Server
```

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**macOS/Linux:**
```bash
touch .env
```

### 3.2 Điền Nội Dung .env

Mở file `Server/.env` bằng editor (VSCode, Sublime, v.v.) và dán nội dung:

```env
# ===== DATABASE =====
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=shopweb_db
DB_PORT=3306

# ===== JWT =====
# Tạo chuỗi bất kỳ, tối thiểu 32 ký tự
JWT_SECRET=your_super_secret_key_min_32_characters_change_this
JWT_EXPIRE=7d

# ===== SERVER =====
PORT=5000
NODE_ENV=development

# ===== CLIENT =====
CLIENT_URL=http://localhost:3001

# ===== CLOUDINARY (nếu dùng upload ảnh) =====
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ===== EMAIL (cho OTP/Password Reset) =====
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
# Hướng dẫn App Password Gmail: https://support.google.com/accounts/answer/185833

# ===== REDIS (nếu dùng cache/worker) =====
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 3.3 Giải Thích Các Biến Quan Trọng

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `DB_PASSWORD` | Password MySQL của user root | `your_password` |
| `JWT_SECRET` | Chuỗi bí mật mã hóa token | `abc@xyz#123...` |
| `PORT` | Port backend chạy | `5000` |
| `CLIENT_URL` | Địa chỉ frontend | `http://localhost:3001` |
| `EMAIL_USER` | Email gửi OTP | `your@gmail.com` |

---

## 🚀 Bước 4: Chạy Ứng Dụng

### Cách 1: Chạy Tất Cả Cùng Lúc (Khuyến Nghị)

Mở **3 terminal riêng biệt** từ VS Code hoặc Command Prompt:

#### Terminal 1: Backend (Node.js)

```bash
cd Server
npm run dev
# hoặc npm start
```

Output sẽ giống như:
```
Server is running on http://localhost:5000
Database connected successfully
Socket.IO server listening on port 5000
```

#### Terminal 2: Frontend (React)

```bash
cd Client
npm start
```

Output sẽ giống như:
```
Compiled successfully!

You can now view shopweb-frontend in the browser.

Local:            http://localhost:3001
```

#### Terminal 3: Worker (Python) - Tùy Chọn

```bash
cd worker

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Chạy worker
python main.py
```

### Cách 2: Chạy Từng Phần Riêng

Nếu bạn chỉ muốn chạy frontend hoặc backend:

```bash
# Chỉ chạy Backend
cd Server
npm run dev

# Chỉ chạy Frontend
cd Client
npm start
```

---

## 📱 Truy Cập Ứng Dụng

Sau khi tất cả đã chạy, mở trình duyệt và truy cập:

- **Frontend:** [http://localhost:3001](http://localhost:3001)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Socket.IO:** ws://localhost:5000 (cho real-time chat)

---

## 🔐 Tài Khoản Test (Mẫu)

Nếu database đã được seed, bạn có thể đăng nhập bằng:

```
Email: test@example.com
Password: 123456
```

Hoặc tạo tài khoản mới qua giao diện đăng ký.

---

## 🛠️ Các Lệnh Hữu Ích

### Backend

```bash
cd Server

# Chạy chế độ development (tự restart khi có thay đổi)
npm run dev

# Chạy chế độ production
npm start

# Tạo database
mysql -u root -p < database/init.sql

# Seed dữ liệu mẫu
npm run seed

# Chạy cleanup scripts
node cleanupNullUserIds.js
```

### Frontend

```bash
cd Client

# Chạy development server
npm start

# Build production
npm run build

# Chạy test
npm test
```

### Worker

```bash
cd worker

# Kích hoạt virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Chạy worker
python main.py

# Cài thêm package
pip install <package_name>
```

---

## 🐛 Troubleshooting - Khắc Phục Lỗi

### 1. Lỗi: "MySQL Connection Error"

**Nguyên nhân:** MySQL chưa chạy hoặc thông tin kết nối sai

**Cách khắc phục:**
```bash
# Kiểm tra MySQL status
mysql --version

# Restart MySQL service
# Windows: services.msc → tìm MySQL → Restart
# macOS: brew services restart mysql
# Linux: sudo systemctl restart mysql

# Kiểm tra có thể kết nối không
mysql -u root -p -e "SELECT 1;"
```

### 2. Lỗi: "Port 3001/5000 already in use"

**Nguyên nhân:** Port đã được sử dụng bởi ứng dụng khác

**Cách khắc phục:**

**Windows:**
```powershell
# Tìm process dùng port 5000
netstat -ano | findstr :5000

# Kill process (thay PID)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Tìm process dùng port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### 3. Lỗi: "npm packages not found"

**Nguyên nhân:** node_modules chưa được cài

**Cách khắc phục:**
```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json  # macOS/Linux
rmdir /s node_modules & del package-lock.json  # Windows

# Cài lại
npm install
```

### 4. Lỗi: "EACCES: permission denied" (macOS/Linux)

**Nguyên nhân:** Lỗi quyền truy cập

**Cách khắc phục:**
```bash
# Cấp quyền cho npm
sudo chown -R $(whoami) ~/.npm

# Hoặc cài npm global packages vào thư mục user
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### 5. Lỗi: "Cannot find module"

**Nguyên nhân:** Thiếu dependency

**Cách khắc phục:**
```bash
# Cài lại dependencies
npm install

# Hoặc cài lại toàn bộ
npm ci  # Clean install - như npm install nhưng chính xác hơn
```

---

## 📊 Kiểm Tra Kết Nối

Nếu bạn không chắc chắn ứng dụng chạy đúng, hãy chạy các lệnh sau:

```bash
# Kiểm tra MySQL
mysql -u root -p -e "SELECT VERSION();"

# Kiểm tra Node.js
node --version

# Kiểm tra Python
python --version

# Kiểm tra ports
# Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :3001

# macOS/Linux:
lsof -i :5000
lsof -i :3001
```

---

## 📝 Thứ Tự Chạy Ứng Dụng

**Khuyến nghị chạy theo thứ tự này:**

1. ✅ Đảm bảo MySQL chạy
2. ✅ Chạy Backend (npm run dev)
3. ✅ Chạy Frontend (npm start)
4. ✅ (Tùy chọn) Chạy Worker (python main.py)
5. ✅ Truy cập http://localhost:3001

---

## 🎯 Kiểm Tra Hoạt Động

Sau khi chạy toàn bộ, kiểm tra các tính năng:

- [ ] Truy cập frontend không lỗi
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập thành công
- [ ] Xem sản phẩm
- [ ] Thêm vào giỏ hàng
- [ ] Chat real-time (nếu có)
- [ ] Upload hình (nếu có)

---

## 💾 Dữ Liệu Mẫu

Nếu cần thêm dữ liệu mẫu vào database:

```bash
cd Server

# Seed reviews
node seedReviews.js

# Tạo test user
node create-test-user.js
```

---

## 🔄 Cập Nhật Database Schema

Nếu schema thay đổi:

```bash
# Backup database hiện tại
mysqldump -u root -p shopweb_db > backup.sql

# Xóa database cũ (cẩn thận!)
mysql -u root -p -e "DROP DATABASE shopweb_db;"

# Chạy init script mới
mysql -u root -p < Server/database/init.sql
```

---

## 📚 Tài Liệu Thêm

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Reference](https://dev.mysql.com/doc/)
- [Node.js Best Practices](https://nodejs.org/en/docs/)
- [Socket.IO Guide](https://socket.io/docs/)

---

## 💬 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra lại các yêu cầu hệ thống
2. Xem lại các lệnh trong phần Troubleshooting
3. Kiểm tra console/terminal để xem lỗi chi tiết
4. Đảm bảo tất cả dependencies đã được cài đủ

---

**Chúc bạn chạy ứng dụng thành công! 🚀**
