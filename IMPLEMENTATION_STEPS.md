# 🚀 Refactoring Implementation Guide

## ⚠️ QUAN TRỌNG: Upload Đang Chạy

**Không sửa đổi file:**
- `scripts/upload_all_images.js` - ✅ An toàn (refactored, vẫn chạy)
- `services/productImageService.js` - ✅ An toàn
- `services/cloudinaryService.js` - ✅ An toàn

**Những gì an toàn thay đổi:**
- Controllers (chỉ handle routes)
- Repositories (database abstraction)
- Middleware (error handling)
- Routes (mapping)

---

## 📋 Danh Sách Files Đã Tạo

```
✅ Server/services/
   ├── validationService.js      (Mới) - Validation tập trung
   ├── errorService.js           (Mới) - Error handling
   ├── responseService.js        (Mới) - Response formatting
   └── constants.js              (Cũ) - Update thêm hằng số

✅ Server/repositories/
   └── productRepository.js      (Mới) - Product data abstraction

✅ Server/controllers/
   └── productController_NEW.js  (Mới) - Refactored controller

✅ Server/middleware/
   └── errorHandler.js           (Mới) - Global error handler

✅ Server/
   └── REFACTORING_GUIDE.md      (Mới) - Tài liệu chi tiết
```

---

## 🔄 Cách Implement Từng Bước

### BƯỚC 1: Kiểm Tra Upload Vẫn Chạy ✅

```bash
# Upload process vẫn chạy
# Kiểm tra terminal đang chạy node scripts/upload_all_images.js
# Output vẫn phải hiển thị tiến độ
```

**✅ Không cần làm gì - Upload an toàn**

---

### BƯỚC 2: Tạo Repositories Cho Các Models Khác

Bước này không ảnh hưởng đến upload.

```bash
# Tạo repositories cho các models
Server/repositories/
├── productRepository.js       (Đã có)
├── userRepository.js          (Tạo mới)
├── orderRepository.js         (Tạo mới)
├── cartRepository.js          (Tạo mới)
└── ...
```

**Template Tạo Repository:**

```javascript
/**
 * @file userRepository.js
 * @description User repository - tập trung database queries
 * @category Repository
 */

const db = require('../config/db');

const userRepository = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  create: async (data) => {
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [data.username, data.email, data.password_hash]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    await db.query(
      'UPDATE users SET username = ?, email = ? WHERE user_id = ?',
      [data.username, data.email, id]
    );
  },

  delete: async (id) => {
    await db.query('DELETE FROM users WHERE user_id = ?', [id]);
  }
};

module.exports = userRepository;
```

---

### BƯỚC 3: Refactor Controllers Một Cái Một

**Không sửa controller cũ, tạo controller mới:**

```bash
# Ví dụ với Product (đã có)
controllers/
├── productController.js       (Cũ - Keep)
└── productController_NEW.js   (Mới - Use this)

# Sau đó với User
controllers/
├── userController.js          (Cũ)
└── userController_NEW.js      (Mới)
```

**Cách refactor controller:**

```javascript
/**
 * @file userController_NEW.js (Refactored)
 */

const userRepository = require('../repositories/userRepository');
const validationService = require('../services/validationService');
const responseService = require('../services/responseService');
const errorService = require('../services/errorService');

async function getAllUsers(req, res) {
  try {
    const users = await userRepository.getAll();
    responseService.sendSuccess(res, users);
  } catch (error) {
    errorService.logError('getAllUsers', error);
    responseService.sendError(res, 500, 'Failed to fetch users');
  }
}

async function createUser(req, res) {
  try {
    // 1. Validate
    const validation = validationService.validateUserCreation(req.body);
    if (!validation.isValid) {
      return responseService.sendJson(
        res,
        400,
        responseService.validationErrorResponse(validation.errors)
      );
    }

    // 2. Create
    const userId = await userRepository.create(req.body);

    // 3. Response
    responseService.sendJson(
      res,
      201,
      responseService.createdResponse({id: userId})
    );
  } catch (error) {
    errorService.logError('createUser', error);
    responseService.sendError(res, 500, 'Failed to create user');
  }
}

module.exports = { getAllUsers, createUser };
```

---

### BƯỚC 4: Update Routes

**Chỉ thay đổi import:**

```javascript
// routes/productRoutes.js

// ❌ TRƯỚC
const productController = require('../controllers/productController');

// ✅ SAU
const productController = require('../controllers/productController_NEW');
const { asyncHandler } = require('../middleware/errorHandler');

// Wrap async functions
router.get('/', asyncHandler(productController.getAllProducts));
router.post('/', asyncHandler(productController.createProduct));
```

---

### BƯỚC 5: Update Main App (index.js)

```javascript
// Server/index.js

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// ... existing code ...

// Routes
app.use('/api/products', productRoutes);
// ... other routes ...

// ⚠️ ERROR HANDLERS - PHẢI Ở DƯỚI CÙNG
app.use(notFoundHandler);      // 404
app.use(errorHandler);         // Global error handler

const server = http.createServer(app);
server.listen(port, ...);
```

---

## 🧪 Testing Sau Mỗi Bước

### Test 1: Upload Vẫn Chạy

```bash
# Terminal 1 - Check upload
tail -f server.log  # hoặc xem terminal

# Phải thấy output tiếp tục
```

### Test 2: API Vẫn Work

```bash
# Terminal 2 - Test API
curl http://localhost:5000/api/products

# Phải trả về 200 OK
```

### Test 3: Error Handling

```bash
# Test 404
curl http://localhost:5000/api/products/999

# Phải trả về:
{
  "success": false,
  "status": 404,
  "message": "Product not found"
}
```

---

## 📊 Order Refactoring

**Thứ tự khuyên:** Từ ít quan trọng → nhiều quan trọng

1. ✅ **Product** (Đã làm)
   - Controllers: productController.js
   - Repository: productRepository.js

2. **Category** (Tiếp theo)
   - Controllers: categoryController.js
   - Repository: categoryRepository.js

3. **Brand**
   - Controllers: brandController.js
   - Repository: brandRepository.js

4. **Cart**
   - Controllers: cartController.js
   - Repository: cartRepository.js

5. **Order** (Quan trọng)
   - Controllers: orderController.js
   - Repository: orderRepository.js

6. **User** (Nhạy cảm - cuối cùng)
   - Controllers: userController.js
   - Repository: userRepository.js

---

## ⚡ Rollback Nếu Cần

Nếu có vấn đề:

```bash
# Quay lại controller cũ
routes/productRoutes.js: 
  - Thay ../controllers/productController_NEW.js
  - Về ../controllers/productController

# Xóa error handler khỏi index.js nếu cần
```

---

## 📈 Progress Tracking

Dùng checklist này:

- [ ] Product refactored
- [ ] Category refactored
- [ ] Brand refactored
- [ ] Cart refactored
- [ ] Order refactored
- [ ] User refactored
- [ ] Test toàn bộ
- [ ] Xóa file _NEW.js cũ
- [ ] Xóa model files cũ
- [ ] Deploy

---

## 🎯 Khi Hoàn Thành

```
Server/
├── controllers/              ✅ Clean, mỏng
├── repositories/             ✅ Data abstraction
├── services/                 ✅ Business logic
├── models/ (DELETE)          ❌ Sẽ được xóa
└── middleware/               ✅ Cross-cutting
```

---

**Cấu trúc sạch, dễ maintain, dễ test!** 🎯
