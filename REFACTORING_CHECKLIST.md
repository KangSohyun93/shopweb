# ✅ REFACTORING CHECKLIST

## 📍 STATUS: IN PROGRESS ⏳

Upload đang chạy → Safe to refactor!

---

## 🎯 Phase 1: Core Services (✅ COMPLETED)

- [x] Create `validationService.js`
  - [x] validateVariant()
  - [x] validateVariants()
  - [x] validateProductCreation()
  - [x] validateUserCreation()
  - [x] validateOrderCreation()

- [x] Create `errorService.js`
  - [x] ApiError class
  - [x] badRequest()
  - [x] unauthorized()
  - [x] notFound()
  - [x] formatErrorResponse()
  - [x] handleDatabaseError()

- [x] Create `responseService.js`
  - [x] successResponse()
  - [x] paginatedResponse()
  - [x] createdResponse()
  - [x] validationErrorResponse()
  - [x] sendSuccess()
  - [x] sendError()

- [x] Update `services/index.js` (add new services)

---

## 🎯 Phase 2: Data Layer (✅ COMPLETED)

- [x] Create `repositories/productRepository.js`
  - [x] getAll()
  - [x] getById()
  - [x] create()
  - [x] update()
  - [x] delete()
  - [x] updatePrimaryImage()

---

## 🎯 Phase 3: Controller & Middleware (✅ COMPLETED)

- [x] Create `controllers/productController_NEW.js`
  - [x] getAllProducts()
  - [x] getProductById()
  - [x] createProduct()
  - [x] updateProduct()
  - [x] deleteProduct()
  - [x] uploadPrimaryImage()

- [x] Create `middleware/errorHandler.js`
  - [x] errorHandler()
  - [x] notFoundHandler()
  - [x] asyncHandler()

---

## 📚 Phase 4: Documentation (✅ COMPLETED)

- [x] Create `REFACTORING_GUIDE.md` (detailed)
- [x] Create `IMPLEMENTATION_STEPS.md` (step-by-step)
- [x] Create `CHECKLIST.md` (this file)
- [x] Update `services/README.md`

---

## 🔄 Phase 5: Implement Routes (🔲 PENDING)

- [ ] Update `routes/productRoutes.js`
  - [ ] Import `productController_NEW`
  - [ ] Import `asyncHandler`
  - [ ] Wrap routes with asyncHandler
  - [ ] Test each route

- [ ] Update other routes:
  - [ ] `routes/userRoutes.js`
  - [ ] `routes/orderRoutes.js`
  - [ ] `routes/cartRoutes.js`
  - [ ] `routes/categoryRoutes.js`
  - [ ] `routes/brandRoutes.js`
  - [ ] `routes/reviewRoutes.js`
  - [ ] `routes/promotionRoutes.js`

---

## 🔄 Phase 6: Create More Repositories (🔲 PENDING)

- [ ] Create `repositories/userRepository.js`
- [ ] Create `repositories/orderRepository.js`
- [ ] Create `repositories/cartRepository.js`
- [ ] Create `repositories/categoryRepository.js`
- [ ] Create `repositories/brandRepository.js`
- [ ] Create `repositories/reviewRepository.js`
- [ ] Create `repositories/promotionRepository.js`

---

## 🔄 Phase 7: Refactor Controllers (🔲 PENDING)

- [ ] Refactor `controllers/userController.js`
- [ ] Refactor `controllers/orderController.js`
- [ ] Refactor `controllers/cartController.js`
- [ ] Refactor `controllers/categoryController.js`
- [ ] Refactor `controllers/brandController.js`
- [ ] Refactor `controllers/reviewController.js`
- [ ] Refactor `controllers/promotionController.js`

---

## 🧪 Phase 8: Testing (🔲 PENDING)

- [ ] Test all endpoints (GET, POST, PUT, DELETE)
- [ ] Test validation errors (400)
- [ ] Test not found (404)
- [ ] Test internal errors (500)
- [ ] Test upload functionality
- [ ] Verify upload still running

---

## 📋 Phase 9: Update Main App (🔲 PENDING)

- [ ] Add error handlers to `index.js`
  ```javascript
  app.use(notFoundHandler);
  app.use(errorHandler);
  ```
- [ ] Verify app starts without errors
- [ ] Test all routes

---

## 🧹 Phase 10: Cleanup (🔲 PENDING)

- [ ] Rename `productController_NEW.js` → `productController.js`
- [ ] Delete old `productController.js`
- [ ] Rename other `*_NEW.js` → remove `_NEW` suffix
- [ ] Delete old controller files
- [ ] Consider deleting `models/` (if all migrated to repositories)
- [ ] Update imports everywhere

---

## 📊 Progress Summary

| Phase | Task | Status | Files |
|-------|------|--------|-------|
| 1 | Core Services | ✅ | 3 new |
| 2 | Data Layer | ✅ | 1 new |
| 3 | Controllers | ✅ | 2 new |
| 4 | Documentation | ✅ | 3 new |
| 5 | Routes | 🔲 | ~ |
| 6 | Repositories | 🔲 | 7 new |
| 7 | Controllers | 🔲 | 7 new |
| 8 | Testing | 🔲 | ~ |
| 9 | Main App | 🔲 | 1 update |
| 10 | Cleanup | 🔲 | ~ |

**Total Files Modified/Created: 15+**

---

## 🎯 Next Actions

### Immediate (Safe to do now):

1. ✅ All core services created
2. ✅ Product repository created
3. ✅ Product controller refactored
4. ✅ Error handler created

### Next Steps (Can do anytime):

1. Create remaining repositories (user, order, cart, etc.)
2. Refactor remaining controllers
3. Update routes
4. Test all endpoints
5. Update main app
6. Cleanup

---

## ⚠️ Important Notes

### SAFE TO DO:
- ✅ Create new services
- ✅ Create new repositories
- ✅ Create new controllers (_NEW suffix)
- ✅ Create new middleware
- ✅ Create documentation

### NOT SAFE (Upload running):
- ❌ Modify running upload files directly
- ❌ Delete old controllers yet
- ❌ Update routes without testing

### VERIFICATION:
Always check upload still running after changes:
```bash
# Check terminal with upload
tail -f server.log
# OR check active node processes
ps aux | grep node
```

---

## 📝 File Structure After Refactoring

```
Server/
├── controllers/
│   ├── productController.js        (new - refactored)
│   ├── userController.js           (new - refactored)
│   ├── orderController.js          (new - refactored)
│   └── ... (other refactored)
│
├── repositories/
│   ├── productRepository.js        ✅
│   ├── userRepository.js           (to create)
│   ├── orderRepository.js          (to create)
│   └── ... (others)
│
├── services/
│   ├── validationService.js        ✅
│   ├── errorService.js             ✅
│   ├── responseService.js          ✅
│   ├── productImageService.js      ✅
│   ├── helpers.js                  ✅
│   ├── constants.js                ✅
│   └── index.js                    ✅
│
├── middleware/
│   ├── errorHandler.js             ✅
│   ├── auth.js
│   └── upload.js
│
├── routes/
│   ├── productRoutes.js            (to update)
│   ├── userRoutes.js               (to update)
│   └── ...
│
├── models/                         (will be removed)
│   ├── product.js
│   ├── user.js
│   └── ...
│
└── index.js                        (to update)
```

---

**Status: ON TRACK ✅**

**Upload Safety: SAFE ✅**

**Last Updated: $(date)**

---

🎯 **GOAL: Clean, maintainable, SOLID architecture!**
