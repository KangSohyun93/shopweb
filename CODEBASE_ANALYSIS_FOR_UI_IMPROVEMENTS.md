# 📋 PHÂN TÍCH CẤU TRÚC CODE HIỆN TẠI - UI/UX IMPROVEMENTS

**Ngày tạo:** April 19, 2026  
**Mục đích:** Xác định cấu trúc code hiện tại trước khi thực hiện cải tiến UI/UX theo yêu cầu:
- Rút gọn danh mục trên trang chủ (tối đa 3 hàng sản phẩm)
- Thêm nút "Xem thêm" cho từng danh mục
- Tạo trang danh mục riêng lẻ (/category/...)
- Thêm menu danh mục vào Header

---

## 1️⃣ FILE HIỂN THỊ GIAO DIỆN - HomePage.jsx

### 📁 Đường dẫn:
```
Client/src/pages/customer/HomePage.jsx
```

### 📊 Cấu trúc hiện tại:

**Phần 1: Fetch dữ liệu**
```javascript
// HomePage.jsx - Lines 16-50
useEffect(() => {
  const fetchData = async () => {
    try {
      const [productsRes, variantsRes, bannersRes] = await Promise.all([
        getAllProducts(),  // ← Gọi API lấy TẤT CẢ sản phẩm
        getVariants(),
        getActiveBanners(),
      ]);

      // Xử lý dữ liệu
      const rawProducts = productsRes.data || [];
      const validVariants = variantsRes.data.filter(v => v.product_id && v.sku && v.price);
      
      // Tạo mảng sản phẩm kết hợp variant
      const combinedProducts = validProducts.map(product => ({
        ...product,
        variants: variantMap[product.product_id] || [],
      }));

      // ⭐ PHẦN QUAN TRỌNG: Nhóm sản phẩm theo danh mục
      const groupedByCategory = combinedProducts.reduce((acc, product) => {
        const category = product.category_name || 'Unknown Category';
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
      }, {});
      
      // Lấy top 5 danh mục
      const topCategories = Object.keys(groupedByCategory).slice(0, 5);
      const limitedCategoryProducts = {};
      topCategories.forEach(category => {
        limitedCategoryProducts[category] = groupedByCategory[category];
      });

      setCategoryProducts(limitedCategoryProducts);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  fetchData();
}, []);
```

**Phần 2: Render danh mục (vòng lặp .map())**
```javascript
// HomePage.jsx - Lines 237-250
Object.keys(categoryProducts).map((category, index) => (
  <div key={index} className="mb-8">
    <h2 className="relative text-4xl md:text-5xl font-extrabold mb-6 ...">
      <span className="relative z-10 ...">
        {category}  {/* ← Tên danh mục */}
      </span>
    </h2>
    
    {/* Render toàn bộ sản phẩm trong danh mục */}
    <ProductList
      products={categoryProducts[category]}  {/* ← TẤT CẢ sản phẩm, không giới hạn */}
      onAddToCart={() => {}}
    />
  </div>
))
```

### 🔴 VẤN ĐỀ HIỆN TẠI:
1. **Hiển thị quá nhiều sản phẩm**: Mỗi danh mục hiển thị TẤT CẢ sản phẩm của category đó
2. **Không có nút "Xem thêm"**: Người dùng không có cách nào để xem trang riêng của danh mục
3. **Trang quá nặng**: Nhiều dòng sản phẩm = render HTML quá lớn
4. **UX không tốt**: Khó tìm sản phẩm khi quá nhiều trong một danh mục

### ✅ CẦN LÀM:
- [ ] Giới hạn hiển thị: Mỗi danh mục chỉ 3 hàng × 4 cột = 12 sản phẩm
- [ ] Thêm nút "Xem tất cả [Danh mục]" dưới mỗi phần
- [ ] Tạo trang `/category/:categoryName` để hiển thị tất cả sản phẩm của danh mục

---

## 2️⃣ FILE HEADER/NAVBAR - Navbar.jsx

### 📁 Đường dẫn:
```
Client/src/components/Navbar.jsx
```

### 📊 Cấu trúc hiện tại:

```javascript
// Navbar.jsx - Lines 1-130
const Navbar = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="bg-gray-800 p-4 fixed top-0 left-0 w-full z-50 shadow">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-white text-xl font-bold">
          ShopWeb
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-md mx-8">
          {/* Input search */}
        </form>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {/* Home */}
          <Link to="/" className="text-white hover:text-gray-300 flex flex-col items-center">
            {/* Icon & text */}
          </Link>
          
          {/* Cart, Orders, Admin, Login, Profile, Logout... */}
          {/* Tất cả các link hiện tại */}
        </div>
      </div>
    </nav>
  );
};
```

### 🔴 VẤN ĐỀ HIỆN TẠI:
1. **Không có menu danh mục**: Navbar chỉ có Home, Cart, Orders, Admin, Login, Profile
2. **Khó điều hướng danh mục**: Người dùng phải cuộn về trang chủ để chọn danh mục
3. **Không có dropdown menu**: Cấu trúc navbar quá đơn giản

### ✅ CẦN LÀM:
- [ ] Thêm dropdown menu "Danh Mục" hoặc "Sản Phẩm" chứa tất cả categories
- [ ] Mỗi category là một link dẫn đến `/category/:categoryName`
- [ ] Cập nhật Navbar để fetch danh sách categories động

---

## 3️⃣ CÁCH LẤY DỮ LIỆU - API Calls

### 📁 Đường dẫn API Service:
```
Client/src/services/api.js
```

### 📊 API hiện tại:

```javascript
// api.js - Lines 32-35
export const getAllProducts = () =>
  api.get('/products');  // ← Lấy TẤT CẢ sản phẩm

export const getVariants = (product_id) =>
  api.get(`/product-variants${product_id ? `?product_id=${product_id}` : ''}`);
```

### 🔍 Phương pháp xử lý hiện tại:
1. **Homepage gọi API**: `getAllProducts()` → Lấy **TẤT CẢ sản phẩm**
2. **Lọc bằng JavaScript**: 
   ```javascript
   groupedByCategory = combinedProducts.reduce((acc, product) => {
     const category = product.category_name;
     if (!acc[category]) acc[category] = [];
     acc[category].push(product);
     return acc;
   }, {});
   ```
3. **Không có API filter**: Không gọi riêng API cho từng category

### ⚠️ LỢI & HẠI:
| Lợi | Hại |
|-----|-----|
| ✅ Có tất cả dữ liệu ngay | ❌ Tải lâu nếu có 1000+ sản phẩm |
| ✅ Dễ xử lý client-side | ❌ Lãng phí bandwidth |
| | ❌ Không tối ưu cho backend |

### ✅ CẦN LÀM:
- [ ] Thêm API: `getProductsByCategory(categoryName)` - lấy sản phẩm của 1 category
- [ ] Sử dụng API này khi người dùng bấm "Xem thêm"
- [ ] Trang category sẽ gọi API này thay vì lấy từ state

---

## 4️⃣ FILE ĐỊNH TUYẾN - App.js

### 📁 Đường dẫn:
```
Client/src/App.js
```

### 📊 Routes hiện tại:

```javascript
// App.js - Lines 27-52
<Router>
  <Routes>
    {/* Public routes (không cần navbar) */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage />} />
    <Route path="/verify-otp" element={<VerifyOTPPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />

    {/* Customer routes (có CustomerLayout + Navbar) */}
    <Route element={<CustomerLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      {/* ❌ KHÔNG CÓ ROUTE CHO CATEGORY */}
    </Route>

    {/* Admin routes */}
    <Route element={<AdminLayout />}>
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/orders" element={<AdminOrdersPage />} />
      {/* ... */}
    </Route>
  </Routes>
</Router>
```

### 🔴 VẤN ĐỀ HIỆN TẠI:
1. **Không có route `/category/:categoryName`**: Không thể vào trang danh mục
2. **Không phân trang category**: Cần thêm `/category/:categoryName?page=1`
3. **Cần tạo CategoryPage component**: Chưa có file này

### ✅ CẦN LÀM:
- [ ] Thêm route: `<Route path="/category/:categoryName" element={<CategoryPage />} />`
- [ ] Tạo file mới: `Client/src/pages/customer/CategoryPage.jsx`
- [ ] CategoryPage sẽ gọi `getProductsByCategory(categoryName)` API

---

## 5️⃣ TÓMT TẮT: CẤU TRÚC HIỆN TẠI VÀ CẦN THÊM

### 📊 Biểu đồ luồng dữ liệu hiện tại:
```
HomePage
    ├── Gọi: getAllProducts() → lấy TẤT CẢ sản phẩm
    ├── Gọi: getVariants() → lấy TẤT CẢ variants
    ├── Gọi: getActiveBanners() → lấy banners
    │
    ├── Xử lý JS: Nhóm sản phẩm theo category_name
    ├── Render: 5 danh mục
    │   └── Mỗi danh mục: ProductList (TẤT CẢ sản phẩm của category)
    │
    └── Kết quả: Trang chủ hiển thị rất dài ❌
```

### 📊 Biểu đồ luồng dữ liệu CẦN THAY ĐỔI:
```
HomePage (NEW)
    ├── Gọi: getAllProducts() → lấy TẤT CẢ sản phẩm
    ├── Gọi: getVariants()
    ├── Gọi: getActiveBanners()
    │
    ├── Xử lý JS: Nhóm sản phẩm theo category_name
    ├── Render: 5 danh mục
    │   ├── Mỗi danh mục: ProductList (CHỈ 12 sản phẩm) ✅
    │   └── Nút "Xem tất cả [Danh Mục]" → Link tới /category/[name] ✅
    │
    ├── Navbar (NEW)
    │   └── Dropdown "Danh Mục" với tất cả categories ✅
    │       └── Mỗi link: /category/[name]
    │
    └── CategoryPage (NEW) - /category/:categoryName
        ├── Gọi: getProductsByCategory(categoryName) → lấy SỬA PHẨM CỦA 1 CATEGORY
        ├── Render: ProductList (phân trang 12/page)
        └── Nút "Trang trước/sau"

SearchResultsPage
    ├── Gọi: searchProducts(query)
    └── Render: ProductList (tất cả kết quả tìm kiếm)
```

---

## 6️⃣ THỐNG KÊ: FILES CẦN THÊM/SỬA

### 📝 Files SỬA:
| File | Thay đổi | Dòng |
|------|---------|------|
| **HomePage.jsx** | Giới hạn sản phẩm/danh mục (12), thêm nút "Xem thêm" | 237-250 |
| **Navbar.jsx** | Thêm dropdown "Danh Mục" | 100+ |
| **App.js** | Thêm route `/category/:categoryName` | 45+ |
| **api.js** | Thêm hàm `getProductsByCategory(categoryName)` | 35+ |

### 📝 Files TẠO MỚI:
| File | Mục đích |
|------|---------|
| **CategoryPage.jsx** | Hiển thị sản phẩm của 1 danh mục với phân trang |
| **(Tuỳ chọn) CategoryDropdown.jsx** | Component dropdown danh mục cho Navbar |

---

## 7️⃣ DANH SÁCH CATEGORIES HIỆN CÓ

Dựa trên code HomePage, danh sách categories từ database:
```javascript
Object.keys(categoryProducts)
// Ví dụ: ['Áo Thun Nam', 'Áo Polo Nam', 'Quần Jeans Nam', ...]
// Số lượng: 5 categories hiển thị (có thể nhiều hơn trong database)
```

**Cần lấy danh sách này từ:**
- Cách 1: Query database trực tiếp: `SELECT DISTINCT category_name FROM products;`
- Cách 2: Tạo API riêng: `GET /api/categories` → trả về list all categories
- Cách 3: Lấy từ `getAllProducts()` rồi extract unique categories (hiện tại)

---

## 📋 CHECKLIST - TÀI LIỆU NÀY ĐÃ CÓ GÌ?

✅ **File hiển thị giao diện**: HomePage.jsx (dòng 237-250)  
✅ **File Navbar/Header**: Navbar.jsx (dòng 1-130)  
✅ **Cách lấy sản phẩm**: getAllProducts() + client-side filtering  
✅ **File định tuyến**: App.js (dòng 27-52)  
✅ **Biểu đồ luồng dữ liệu**: Phần 5️⃣  
✅ **Danh sách cần thay đổi**: Phần 6️⃣  

---

## 🎯 BƯỚC TIẾP THEO

Khi đã xác nhận tài liệu này, tôi sẽ:

1. **Sửa HomePage.jsx**: Giới hạn 12 sản phẩm/danh mục + nút "Xem thêm"
2. **Tạo CategoryPage.jsx**: Component trang danh mục riêng
3. **Sửa Navbar.jsx**: Thêm dropdown menu danh mục
4. **Sửa App.js**: Thêm route `/category/:categoryName`
5. **Sửa api.js**: Thêm API `getProductsByCategory()`
6. **Test**: Kiểm tra luồng điều hướng từ HomePage → CategoryPage

💡 **Bạn có thể confirm hoặc điều chỉnh tài liệu này nếu cần!**
