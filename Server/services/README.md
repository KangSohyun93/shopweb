# 📁 Server Architecture - SOLID Principles

## 🏗️ Cấu Trúc Thư Mục

```
Server/
├── services/                          # Tất cả các business logic
│   ├── constants.js                   # Hằng số toàn cục
│   ├── helpers.js                     # Hàm tiện ích (formatting, validation)
│   ├── cloudinaryService.js           # Xử lý upload lên Cloudinary
│   ├── databaseService.js             # Xử lý database (queries)
│   ├── fileSystemService.js           # Xử lý file system
│   └── productImageService.js         # Điều phối logic upload (Facade)
│
├── scripts/
│   ├── upload_all_images.js           # Entry point (gọi service)
│   ├── clean_images.js                # Làm sạch ảnh cũ
│   ├── reset_all_products.js          # Reset toàn bộ
│   └── ...
│
├── config/
│   ├── db.js                          # Database connection
│   └── cloudinary.js                  # Cloudinary config
│
└── ...
```

---

## 🎯 SOLID Principles Áp Dụng

### 1️⃣ **Single Responsibility Principle (SRP)**
Mỗi module chỉ có **một trách nhiệm duy nhất**:

| File | Trách Nhiệm |
|------|-------------|
| `constants.js` | Quản lý hằng số |
| `helpers.js` | Các hàm tiện ích |
| `cloudinaryService.js` | Upload lên Cloudinary |
| `databaseService.js` | Tương tác database |
| `fileSystemService.js` | Đọc file/thư mục |
| `productImageService.js` | Điều phối upload (Facade) |

### 2️⃣ **Open/Closed Principle (OCP)**
Mở rộng nhưng không sửa đổi:
- Để thêm service mới, tạo file mới, không sửa file cũ
- `productImageService.js` điều phối các service mà không chỉnh sửa chúng

### 3️⃣ **Dependency Inversion**
Các service độc lập, không phụ thuộc vào chi tiết:
```javascript
// Tốt ✅ - Service chỉ gọi module
const result = cloudinaryService.uploadImageToCloudinary(filePath, folder);

// Tránh ❌ - Upload code trực tiếp
const result = await cloudinary.uploader.upload(filePath, {...});
```

---

## 🔄 Luồng Hoạt Động

```
upload_all_images.js (Entry Point)
    ↓
productImageService.uploadAllProductImages()
    ├─→ fileSystemService.getFolders()         // Lấy danh sách thư mục
    ├─→ fileSystemService.getImagesInFolder()  // Lấy ảnh từ thư mục
    ├─→ databaseService.getProductIdByName()   // Tìm product ID
    ├─→ databaseService.getProductImageCount() // Kiểm tra ảnh cũ
    ├─→ cloudinaryService.uploadImageToCloudinary() // Upload ảnh
    └─→ databaseService.insertProductImage()   // Lưu vào DB
```

---

## 📝 Cách Sử Dụng

### Upload Ảnh (3 ảnh/sản phẩm, max 20k ảnh)
```bash
cd Server
node scripts/upload_all_images.js
```

### Làm Sạch Ảnh Cũ (Giữ Sản Phẩm)
```bash
node scripts/clean_images.js
node scripts/upload_all_images.js
```

### Reset Toàn Bộ
```bash
node scripts/reset_all_products.js
node scripts/migrate_products.js      # Tạo lại sản phẩm
node scripts/upload_all_images.js     # Upload ảnh
```

---

## 🔌 Cách Thêm/Sửa Functionality

### Ví dụ: Thêm API upload từ Frontend

```javascript
// ❌ SAI - Upload trực tiếp
app.post('/api/upload', (req, res) => {
  const url = await cloudinary.uploader.upload(req.file.path);
  // Trực tiếp database
  await db.query('INSERT ...');
});

// ✅ ĐÚNG - Dùng service
const productImageService = require('./services/productImageService');

app.post('/api/upload', async (req, res) => {
  const success = await productImageService.uploadSingleImage(
    req.file.path,
    productId,
    folderName,
    isPrimary
  );
  res.json({ success });
});
```

---

## 📊 Benefits

| Lợi Ích | Chi Tiết |
|--------|---------|
| **Dễ Test** | Mỗi service có thể test riêng lẻ |
| **Dễ Maintain** | Bug trong service nào → tìm file đó |
| **Dễ Mở Rộng** | Thêm service mới không ảnh hưởng cũ |
| **Tái Sử Dụng** | Gọi service từ nhiều chỗ |
| **Rõ Ràng** | Mỗi file, mỗi module có tác dụng rõ ràng |

---

## 🚀 Tiếp Theo

Để tối ưu hơn nữa, có thể thêm:
- [ ] Logger service (centralized logging)
- [ ] Error handler service (centralized error handling)
- [ ] Validation service (validate input)
- [ ] Config service (manage environment variables)
- [ ] Caching service (Redis integration)

---

**Cấu trúc này giúp dự án dễ maintain, test, và mở rộng hơn!** 🎯
