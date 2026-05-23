# 🏗️ Server Refactoring - SOLID Architecture

## 📊 Thay Đổi Cấu Trúc

```
Server (Trước Refactoring)
├── controllers/              ❌ Chứa tất cả logic (business, validation, db)
├── models/                   ❌ Chỉ là query functions
├── middleware/
│   ├── auth.js
│   └── upload.js
└── services/                 ❌ Chỉ có upload_all_images logic

Server (Sau Refactoring - SOLID)
├── controllers/              ✅ Chỉ handle HTTP (mỏng)
├── repositories/             ✅ Layer database abstraction
├── models/                   ⚠️  Giữ nguyên (legacy support)
├── services/
│   ├── validationService.js  ✅ NEW - Tất cả validation logic
│   ├── errorService.js       ✅ NEW - Error handling tập trung
│   ├── responseService.js    ✅ NEW - Format response tập trung
│   ├── helpers.js            ✅ Utility functions
│   ├── constants.js          ✅ Constants
│   ├── productImageService.js ✅ Business logic
│   └── ...
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   └── errorHandler.js       ✅ NEW - Global error handler
└── routes/                   ⚠️  Cần update để dùng repositories
```

---

## 🎯 SOLID Principles Áp Dụng

### 1️⃣ **Single Responsibility Principle (SRP)**

**Trước:**
```javascript
// productController.js - 140 dòng, làm nhiều việc
async function createProduct(req, res) {
  // Validate data
  // Create in DB
  // Upload image
  // Return response
}
```

**Sau:**
```javascript
// productController.js - chỉ handle HTTP
async function createProduct(req, res) {
  const validation = validationService.validateProductCreation(data);
  const productId = await productRepository.create(data);
  responseService.sendSuccess(res, product);
}
```

| Layer | Trách Nhiệm |
|-------|-----------|
| `Controller` | HTTP request/response |
| `Repository` | Database queries |
| `Service` | Business logic, validation |
| `Middleware` | Cross-cutting concerns |

### 2️⃣ **Open/Closed Principle (OCP)**

**Mở rộng mà không sửa cũ:**
- Thêm `userRepository.js` → không sửa `productRepository.js`
- Thêm validation mới → không sửa validation cũ
- Thêm service mới → không chạm services khác

### 3️⃣ **Dependency Inversion**

**Trước:**
```javascript
// Controller import trực tiếp model
const Product = require('../models/product');
const result = await Product.create(data);
```

**Sau:**
```javascript
// Controller import repository (abstraction)
const productRepository = require('../repositories/productRepository');
const result = await productRepository.create(data);
```

### 4️⃣ **Interface Segregation**

Services được tách riêng:
- `validationService` - chỉ validate
- `responseService` - chỉ format response
- `errorService` - chỉ handle error

Không có "god service" chứa tất cả.

---

## 📁 Files Được Tạo/Cập Nhật

### ✅ Tạo Mới

| File | Mục Đích |
|------|---------|
| `services/validationService.js` | Validate data |
| `services/errorService.js` | Handle errors |
| `services/responseService.js` | Format responses |
| `repositories/productRepository.js` | Abstract database |
| `controllers/productController_NEW.js` | Clean controller |
| `middleware/errorHandler.js` | Global error handling |

### ⚠️ Cần Update

| File | Thay Đổi |
|------|---------|
| `routes/productRoutes.js` | Import controller mới |
| `index.js` | Thêm error handler middleware |

---

## 🔄 Ví Dụ Transformation

### Tạo Sản Phẩm - Trước vs Sau

**TRƯỚC (140 dòng, mixed concerns):**
```javascript
async createProduct(req, res) {
  // Validation inline
  if (!name || !variants) return res.status(400).json({error: '...'});
  
  // Try-catch không rõ
  try {
    // Direct DB query
    const [result] = await pool.query('INSERT INTO products ...');
    
    // Upload image
    const cloudinaryUrl = await cloudinary.uploader.upload(...);
    
    // Manual response
    res.status(201).json({id: result.insertId, message: '...'});
  } catch (error) {
    // Generic error handling
    console.error(error);
    res.status(500).json({error: 'Failed'});
  }
}
```

**SAU (30 dòng, separated concerns):**
```javascript
async createProduct(req, res) {
  try {
    // Validation via service
    const validation = validationService.validateProductCreation(data);
    if (!validation.isValid) {
      return responseService.sendJson(res, 400, 
        responseService.validationErrorResponse(validation.errors)
      );
    }

    // Create via repository
    const productId = await productRepository.create(data);

    // Response via service
    responseService.sendJson(res, 201, 
      responseService.createdResponse({id: productId})
    );
  } catch (error) {
    errorService.logError('createProduct', error);
    responseService.sendError(res, 500, 'Failed to create product');
  }
}
```

---

## 🚀 Lợi Ích

| Tiêu Chí | Trước | Sau |
|---------|--------|-----|
| **Dòng code/controller** | 140 | 30 |
| **Test khả năng** | Khó | ✅ Dễ |
| **Tái sử dụng code** | Khó | ✅ Dễ |
| **Maintenance** | Khó | ✅ Dễ |
| **Mở rộng** | Khó | ✅ Dễ |
| **Consistent** | ❌ | ✅ |

---

## 📝 Cách Áp Dụng

### 1. Update Route Để Dùng Controller Mới

```javascript
// routes/productRoutes.js
const { asyncHandler } = require('../middleware/errorHandler');
const productController = require('../controllers/productController_NEW');

router.get('/', asyncHandler(productController.getAllProducts));
router.post('/', asyncHandler(productController.createProduct));
router.put('/:product_id', asyncHandler(productController.updateProduct));
```

### 2. Update Main App

```javascript
// index.js
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// ... routes

// Error handlers - phải ở dưới cùng
app.use(notFoundHandler);
app.use(errorHandler);
```

### 3. Tạo Repository Cho Models Khác

```javascript
// repositories/userRepository.js
const userRepository = {
  getAll: async () => {...},
  getById: async (id) => {...},
  create: async (data) => {...},
  update: async (id, data) => {...},
  delete: async (id) => {...}
};
module.exports = userRepository;
```

---

## 🔗 Dependency Graph

```
Request
  ↓
Route Handler
  ↓
Controller (handler HTTP)
  ├─→ ValidationService (validate)
  ├─→ Repository (get/create/update data)
  ├─→ ServiceBusiness Logic (if needed)
  ├─→ ResponseService (format response)
  └─→ ErrorService (on error)
  ↓
Response
```

---

## 📊 Test Coverage

Với SOLID architecture, test dễ hơn:

```javascript
// ✅ Dễ test
describe('productRepository', () => {
  it('should create product', async () => {
    const result = await productRepository.create(mockData);
    expect(result).toBeDefined();
  });
});

describe('validationService', () => {
  it('should validate product', () => {
    const result = validationService.validateProductCreation({...});
    expect(result.isValid).toBe(true);
  });
});
```

---

## 🎯 Next Steps

1. ✅ Tạo repositories cho tất cả models
2. ✅ Refactor tất cả controllers
3. ✅ Update routes để dùng new controllers
4. ✅ Test toàn bộ
5. ✅ Xóa code cũ (models.js → repository)

---

## 💡 Best Practices

1. **Luôn validate** trước khi vào database
2. **Luôn handle error** ở global middleware
3. **Luôn format response** thông qua service
4. **Không bao giờ** mix concerns trong controller
5. **Test riêng lẻ** từng layer

---

**Kiến trúc này giúp dự án dễ maintain, test, và mở rộng!** 🎯
