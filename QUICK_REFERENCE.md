# 🚀 Quick Reference - SOLID Refactoring

## 📋 Server - Use New Files

### Controllers
```javascript
// ❌ OLD (productController.js)
const productController = require('../controllers/productController');

// ✅ NEW (productController_NEW.js)
const productController = require('../controllers/productController_NEW');
```

### Routes
```javascript
// In productRoutes.js
const productController = require('../controllers/productController_NEW');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/', asyncHandler(productController.getAllProducts));
router.post('/:id/upload', asyncHandler(productController.uploadPrimaryImage));
```

### Error Handling
```javascript
// In index.js
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// At the END of all routes
app.use(notFoundHandler);
app.use(errorHandler);
```

---

## 📋 Client - Use Service Layer

### Import Services
```javascript
// ✅ NEW - Use individual services
import { authService, productService, cartService } from '../services/api';

// Use them
const products = await productService.getAllProducts();
const user = await authService.login(email, password);
const cart = await cartService.getCart();
```

### Services Available
```javascript
authService.login()
authService.signup()
authService.verifyOTP()

productService.getAllProducts()
productService.searchProducts(query)
productService.getProductById(id)
productService.uploadPrimaryImage(id, file)

cartService.getCart()
cartService.addToCart(variant_id, qty)
cartService.updateCartItem(item_id, qty)

orderService.createOrder(data)
orderService.getOrders()
orderService.cancelOrder(id)

reviewService.getReviews(product_id)
reviewService.createReview(data)

profileService.getMyProfile()
profileService.updateProfile(data)

chatService.getUserConversation()
chatService.sendChatMessage(id, msg)

promotionService.applyPromotion(code, amount)
addressService.getAddresses()
bannerService.getActiveBanners()
recommendationService.getRecommendations(id)
```

---

## 🔄 Migration Checklist

### Server
- [x] Create `productController_NEW.js` ✅
- [x] Add all 12 methods to controller ✅
- [x] Create `productRepository.js` ✅
- [x] Add all 12 methods to repository ✅
- [x] Create `errorHandler.js` middleware ✅
- [x] Update `productRoutes.js` ✅
- [x] Update `index.js` ✅

### Client
- [x] Create `authService.js` ✅
- [x] Create `productService.js` ✅
- [x] Create `cartService.js` ✅
- [x] Create `orderService.js` ✅
- [x] Create `reviewService.js` ✅
- [x] Create `promotionService.js` ✅
- [x] Create `addressService.js` ✅
- [x] Create `bannerService.js` ✅
- [x] Create `chatService.js` ✅
- [x] Create `profileService.js` ✅
- [x] Create `recommendationService.js` ✅
- [x] Update `api.js` ✅

---

## 🧪 Test Commands

```bash
# Test Product endpoint
curl http://localhost:5000/api/products

# Test Search
curl "http://localhost:5000/api/products/search?q=dress"

# Test 404
curl http://localhost:5000/api/invalid

# Check error handling
curl -X POST http://localhost:5000/api/products
  -H "Content-Type: application/json"
  -d '{"invalid": "data"}'
```

---

## 📊 File Breakdown

**Server Controllers:** 1 file (12 methods)  
**Server Repositories:** 1 file (12 methods)  
**Client Services:** 11 files (50+ methods)  

**Total:** 13 focused files vs. previous monolithic structure

---

## ⚡ Performance Hints

- Services layer is thin - just API wrappers
- All error handling centralized
- Validation happens before DB operations
- Async/await throughout
- Token auto-added to all requests

---

## 🎯 What This Means

✅ **Easy to find** - Code organized by feature  
✅ **Easy to change** - Change 1 file, not 10  
✅ **Easy to test** - Mock individual services  
✅ **Easy to scale** - Add new features independently  
✅ **Easy to collaborate** - Each dev owns 1-2 services

---

**Ready to use!** Deploy with confidence! 🚀
