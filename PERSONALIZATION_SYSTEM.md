# 🎯 Hệ Thống Cá Nhân Hóa (Personalization System)

**Cập nhật:** April 20, 2026  
**Phiên bản:** 1.0

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Các Thành Phần Chính](#các-thành-phần-chính)
4. [Quy Trình Hoạt Động](#quy-trình-hoạt-động)
5. [Frontend Implementation](#frontend-implementation)
6. [Backend Implementation](#backend-implementation)
7. [Worker AI Engine](#worker-ai-engine)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [Cách Sử Dụng & Triển Khai](#cách-sử-dụng--triển-khai)
11. [Tối Ưu Hóa & Best Practices](#tối-ưu-hóa--best-practices)

---

## 🎨 Tổng Quan

Hệ thống cá nhân hóa được thiết kế để:
- **Phân tích hành vi mua hàng** của khách hàng
- **Gợi ý sản phẩm liên quan** dựa trên các luật kết hợp (Association Rules)
- **Tăng doanh số bán hàng** thông qua "Mua kèm"
- **Cải thiện UX** bằng cách hiển thị sản phẩm có liên quan

### Các Phương Pháp Personalization:

1. **AI-Powered Recommendations** - Sử dụng FP-Growth & Apriori Algorithm
2. **Category-Based Fallback** - Nếu AI không có gợi ý, hiển thị sản phẩm cùng category
3. **Trending Products** - Gợi ý sản phẩm bán chạy trên Homepage

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  • HomePage - Gợi Ý Cá Nhân (4 sản phẩm/hàng)             │
│  • ProductDetail - Sản Phẩm Liên Quan                       │
│  • CategoryPage - Hiển thị từng category                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                    API Requests
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼──────────────┐    ┌──────────▼─────────────┐
│  Backend (Node.js)    │    │  Redis Cache           │
│  - Express Server     │    │  - Recommendation IDs  │
│  - API Endpoints      │    │  - Luật Gợi Ý        │
└────────┬──────────────┘    └──────────┬─────────────┘
         │                              │
         └──────────────┬───────────────┘
                        │
            ┌───────────▼───────────┐
            │   MySQL Database      │
            │  - ai_rules table     │
            │  - products table     │
            │  - orders/items       │
            └───────────────────────┘
                        │
                        │
        ┌───────────────▼──────────────┐
        │   Worker (Python)            │
        │   AI Mining Engine (Nightly) │
        │  - FP-Growth               │
        │  - Apriori Algorithm       │
        │  - Luật Kết Hợp           │
        └──────────────────────────────┘
```

---

## 🔧 Các Thành Phần Chính

### 1️⃣ Frontend Components

#### `HomePage.jsx` - Gợi Ý Cá Nhân
```jsx
{/* PERSONALIZED RECOMMENDATIONS SECTION */}
{products.length > 0 && (
  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-8">
    <h2>Gợi Ý Cá Nhân</h2>
    {/* Grid 4 sản phẩm / hàng */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.slice(0, 4).map(product => (...))}
    </div>
  </div>
)}
```

**Tính năng:**
- Hiển thị 4 sản phẩm hàng đầu trên homepage
- Responsive: 2 cột trên mobile, 4 cột trên desktop
- Sắp xếp theo giá và độ phổ biến

#### `ProductDetail.jsx` - Sản Phẩm Liên Quan
```jsx
const [recommendations, setRecommendations] = useState([]);

// Gọi API khi load sản phẩm
const recRes = await getRecommendations(id);
if (recRes && recRes.success) {
  setRecommendations(recRes.data);
}

// Hiển thị 4 sản phẩm gợi ý
{recommendations.map(rec => (...))}
```

**Tính năng:**
- Gợi ý sản phẩm khi khách xem chi tiết
- Sử dụng dữ liệu từ AI Rules
- Fallback: Sản phẩm cùng category nếu AI không có gợi ý

### 2️⃣ Backend API

#### Recommendation Controller
```javascript
// GET /api/recommendations/:product_id
exports.getRecommendations = async (req, res) => {
  // 1. Lấy luật gợi ý từ Redis
  const redisKey = `recom:${product_id}`;
  const recommendedIds = await redisClient.lRange(redisKey, 0, -1);
  
  // 2. Query MySQL lấy chi tiết sản phẩm
  // 3. Fallback nếu không có: gợi ý cùng category
}
```

**Logic:**
1. Kiểm tra Redis cache (nhanh)
2. Nếu có, lấy chi tiết sản phẩm từ MySQL
3. Nếu không, gợi ý 5 sản phẩm cùng category
4. Trả về danh sách sản phẩm

### 3️⃣ AI Rules Dashboard
```jsx
// /admin/ai-rules
// Hiển thị các luật kết hợp được AI tìm thấy
// Format: Product A → Product B (Confidence: 85%, Support: 120 đơn)
```

**Dữ liệu hiển thị:**
- Sản phẩm gốc (Antecedent)
- Sản phẩm gợi ý (Consequent)
- Độ tin cậy (Confidence %)
- Lịch sử mua chung (Support Count)

---

## ⚙️ Quy Trình Hoạt Động

### Timeline Hàng Ngày:

```
┌──────────────────────────────────────────────────────────────┐
│ 0. TRẠNG THÁI BAN ĐẦU                                        │
│    • Khách hàng duyệt sản phẩm                               │
│    • Hệ thống ghi nhận hành vi                               │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. WORKER AI MINING (Nightly - 23:00)                        │
│    • Python script chạy /worker/main.py                      │
│    • Lấy tất cả đơn hàng từ order_items table               │
│    • Chạy FP-Growth hoặc Apriori Algorithm                   │
│    • Tìm ra luật kết hợp (A → B)                            │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. LƯỚI LUẬT (Store Rules)                                   │
│    • INSERT INTO ai_rules table                              │
│      (antecedent_id, consequent_id, confidence, support)     │
│    • Cache vào Redis: key=recom:productID, value=[IDs]      │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. RUNTIME - KHÁCH XEM SẢN PHẨM                             │
│    • GET /api/recommendations/:product_id                    │
│    • Backend kiểm tra Redis cache                            │
│    • Trả về danh sách sản phẩm gợi ý                        │
│    • Frontend hiển thị (Mua kèm)                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎬 Frontend Implementation

### 1. Homepage - Gợi Ý Cá Nhân

**File:** `Client/src/pages/customer/HomePage.jsx`

```jsx
// Phần gợi ý cá nhân
{products.length > 0 && (
  <div className="container mx-auto px-4 py-12">
    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-8">
      <h2 className="text-3xl font-extrabold uppercase">Gợi Ý Cá Nhân</h2>
      
      {/* Grid 4 sản phẩm trên 1 hàng (desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.slice(0, 4).map(product => (
          <Link key={product.product_id} to={`/products/${product.product_id}`}>
            <img src={product.primary_image_url} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.variants?.[0]?.price.toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  </div>
)}
```

**Features:**
- ✅ Responsive grid (2 cột mobile, 4 cột desktop)
- ✅ Lấy từ dữ liệu products array
- ✅ Click vào chuyển sang ProductDetail
- ✅ Hiển thị giá đẹp ($)

### 2. ProductDetail - Sản Phẩm Liên Quan

**File:** `Client/src/components/ProductDetail.jsx`

```jsx
// State cho gợi ý
const [recommendations, setRecommendations] = useState([]);

// Lấy dữ liệu khi load trang
useEffect(() => {
  const fetchRec = async () => {
    try {
      const recRes = await getRecommendations(id);
      if (recRes?.success) {
        setRecommendations(recRes.data);
      }
    } catch (err) {
      console.error("Lỗi lấy gợi ý:", err);
    }
  };
  fetchRec();
}, [id]);

// Hiển thị nếu có dữ liệu
{recommendations.length > 0 && (
  <div className="mt-8">
    <h3 className="text-2xl font-bold mb-6">Sản Phẩm Liên Quan</h3>
    <div className="grid grid-cols-4 gap-4">
      {recommendations.map(rec => (...))}
    </div>
  </div>
)}
```

**Features:**
- ✅ Gọi API `/api/recommendations/:product_id`
- ✅ Xử lý lỗi (fallback category)
- ✅ Hiển thị 4-5 sản phẩm
- ✅ Responsive grid

---

## 🗄️ Backend Implementation

### 1. Recommendation Routes

**File:** `Server/routes/recommendationRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// GET /api/recommendations/:product_id
router.get('/:product_id', recommendationController.getRecommendations);

module.exports = router;
```

### 2. Recommendation Controller

**File:** `Server/controllers/recommendationController.js`

```javascript
exports.getRecommendations = async (req, res) => {
    try {
        const { product_id } = req.params;
        
        // Step 1: Kiểm tra Redis cache
        const redisKey = `recom:${product_id}`;
        const recommendedIdsStr = await redisClient.lRange(redisKey, 0, -1); 
        const recommendedIds = recommendedIdsStr.map(id => parseInt(id, 10));

        let finalProducts = [];

        // Step 2: Nếu có trong Redis, lấy chi tiết từ MySQL
        if (recommendedIds && recommendedIds.length > 0) {
            const query = `
                SELECT p.product_id, p.name, p.primary_image_url,
                       v.price, v.variant_id
                FROM products p
                LEFT JOIN product_variants v ON p.product_id = v.product_id
                WHERE p.product_id IN (?)
                GROUP BY p.product_id
            `;
            const [products] = await db.query(query, [recommendedIds]);
            finalProducts = products;
        }

        // Step 3: FALLBACK - Nếu không có AI rule, gợi ý cùng category
        if (finalProducts.length === 0) {
            console.log(`[Recom] Fallback: Không có rule cho ${product_id}`);
            
            const [currentProd] = await db.query(
                'SELECT category_id FROM products WHERE product_id = ?', 
                [product_id]
            );
            
            if (currentProd.length > 0) {
                const catId = currentProd[0].category_id;
                const fallbackQuery = `
                    SELECT p.product_id, p.name, p.primary_image_url, v.price
                    FROM products p
                    LEFT JOIN product_variants v ON p.product_id = v.product_id
                    WHERE p.category_id = ? AND p.product_id != ?
                    GROUP BY p.product_id
                    LIMIT 5
                `;
                const [fallbackProducts] = await db.query(fallbackQuery, [catId, product_id]);
                finalProducts = fallbackProducts;
            }
        }

        // Step 4: Trả kết quả
        res.status(200).json({
            success: true,
            data: finalProducts
        });

    } catch (error) {
        console.error('❌ Lỗi getRecommendations:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
```

**Logic Chi Tiết:**
1. **Redis Cache** - Lấy IDs sản phẩm từ cache (rất nhanh)
2. **MySQL Query** - JOIN với product_variants để lấy giá
3. **Fallback Strategy** - Nếu không có rule AI, gợi ý cùng category
4. **Error Handling** - Try-catch để không crash trang

### 3. AI Rules Management

**File:** `Server/controllers/aiRuleController.js`

```javascript
exports.getAiRules = async (req, res) => {
    const query = `
        SELECT 
            r.id, 
            p1.name AS ant_name, p1.primary_image_url AS ant_img,
            p2.name AS cons_name, p2.primary_image_url AS cons_img,
            r.confidence, r.support_count
        FROM ai_rules r
        JOIN products p1 ON r.antecedent_id = p1.product_id
        JOIN products p2 ON r.consequent_id = p2.product_id
        ORDER BY r.confidence DESC, r.support_count DESC
        LIMIT 100
    `;
    const [rules] = await db.query(query);
    res.status(200).json({ success: true, data: rules });
};
```

---

## 🐍 Worker AI Engine

### Kiến Trúc

**File:** `worker/main.py`

```python
# 🎯 CẤU HÌNH HỆ THỐNG
ACTIVE_ALGORITHM = 'fpgrowth'  # hoặc 'apriori'
MIN_SUPPORT_COUNT = 2          # Tối thiểu 2 đơn mua chung
MIN_CONFIDENCE = 0.05          # Tỉ lệ mua kèm tối thiểu 5%

# 📊 QUY TRÌNH
# 1. Lấy dữ liệu từ MySQL (order_items)
# 2. Chạy FP-Growth/Apriori
# 3. Lọc luật (confidence > 5%)
# 4. Lưu vào ai_rules table
# 5. Cache vào Redis
```

### Quy Trình Hoạt Động:

```
GET TRANSACTIONS (MySQL)
    ↓
    [Order 1: [Product A, Product B, Product C],
     Order 2: [Product A, Product D],
     Order 3: [Product B, Product C, Product D], ...]
    ↓
RUN FP-GROWTH / APRIORI
    ↓
    {A → B: confidence=85%, support=2,
     B → C: confidence=90%, support=3,
     A → C: confidence=75%, support=2, ...}
    ↓
FILTER RULES (confidence > 5%)
    ↓
    ✓ A → B (85%)
    ✓ B → C (90%)
    ✓ A → C (75%)
    ↓
STORE TO DATABASE & REDIS
    ↓
INSERT INTO ai_rules (antecedent_id, consequent_id, confidence, support_count)
ZADD redis_key [consequent_ids]
```

### Chạy Worker:

```bash
# Chạy một lần
python worker/main.py

# Hoặc cấu hình Cron Job (Linux/Mac)
0 23 * * * cd /path/to/shopweb && python worker/main.py

# Hoặc Windows Task Scheduler
```

---

## 🗃️ Database Schema

### Bảng: `ai_rules`

```sql
CREATE TABLE ai_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    antecedent_id INT NOT NULL,      -- Sản phẩm A (người mua)
    consequent_id INT NOT NULL,      -- Sản phẩm B (gợi ý)
    confidence DECIMAL(5,4),         -- Tỉ lệ mua kèm (0-1)
    support_count INT,               -- Số đơn mua chung
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (antecedent_id) REFERENCES products(product_id),
    FOREIGN KEY (consequent_id) REFERENCES products(product_id),
    INDEX idx_ant (antecedent_id),
    INDEX idx_cons (consequent_id)
);

-- Ví dụ dữ liệu:
-- id=1, antecedent_id=5 (Áo T-shirt), 
--       consequent_id=12 (Quần Jean)
--       confidence=0.85, support_count=120
-- → 85% khách mua áo T-shirt cũng mua quần Jean
-- → Được xác nhận từ 120 đơn hàng
```

### Redis Schema

```
# Key: recom:{product_id}
# Value: [Danh sách product_ids được gợi ý]

recom:5 → [12, 18, 7]
# Khi khách xem sản phẩm 5, gợi ý sản phẩm 12, 18, 7

recom:12 → [5, 8]
recom:18 → [5, 12, 25]
```

---

## 📡 API Endpoints

### 1. Lấy Gợi Ý cho Sản Phẩm
```http
GET /api/recommendations/:product_id

Response:
{
  "success": true,
  "data": [
    {
      "product_id": 12,
      "name": "Quần Jean Blue",
      "primary_image_url": "...",
      "price": 45.99
    },
    {
      "product_id": 18,
      "name": "Belt Leather",
      "primary_image_url": "...",
      "price": 15.99
    }
  ]
}
```

### 2. Lấy Tất Cả AI Rules
```http
GET /api/ai-rules

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ant_name": "T-Shirt",
      "ant_img": "...",
      "cons_name": "Quần Jean",
      "cons_img": "...",
      "confidence": 0.85,
      "support_count": 120
    },
    ...
  ]
}
```

---

## 🚀 Cách Sử Dụng & Triển Khai

### Bước 1: Chuẩn Bị Database

```sql
-- Tạo bảng ai_rules
CREATE TABLE ai_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    antecedent_id INT NOT NULL,
    consequent_id INT NOT NULL,
    confidence DECIMAL(5,4),
    support_count INT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (antecedent_id) REFERENCES products(product_id),
    FOREIGN KEY (consequent_id) REFERENCES products(product_id),
    INDEX idx_ant (antecedent_id),
    INDEX idx_cons (consequent_id)
);
```

### Bước 2: Cài Đặt Python Worker

```bash
cd worker/
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Bước 3: Chạy Worker Lần Đầu

```bash
python main.py
# Output:
# ⏳ [1/4] Đang lấy dữ liệu từ MySQL...
# ✓ Lấy 5000 giao dịch
# ⏳ [2/4] Đang chạy FP-Growth...
# ✓ Tìm thấy 250 luật
# ⏳ [3/4] Đang lưu vào Database...
# ✓ Lưu 250 luật
# ⏳ [4/4] Đang cache vào Redis...
# ✓ Cache thành công
# ✅ Hoàn tất!
```

### Bước 4: Cấu Hình Tự Động (Nightly)

**Linux/Mac - Crontab:**
```bash
crontab -e
# Thêm dòng
0 23 * * * cd /home/user/shopweb && python worker/main.py >> worker.log 2>&1
# Chạy mỗi ngày lúc 23:00
```

**Windows - Task Scheduler:**
```
1. Mở Task Scheduler
2. Create Basic Task → "ShopWeb AI Mining"
3. Trigger: Daily at 23:00
4. Action: Start program → python.exe
5. Argument: C:\shopweb\worker\main.py
```

### Bước 5: Kiểm Tra Frontend

Frontend tự động sử dụng khi backend sẵn sàng:
- ✅ HomePage: Gợi Ý Cá Nhân (4 sản phẩm)
- ✅ ProductDetail: Sản Phẩm Liên Quan
- ✅ Admin: AI Rules Dashboard

---

## 📊 Tối Ưu Hóa & Best Practices

### 1. Performance Tuning

**Redis Caching Strategy:**
```javascript
// Lưu cache 24 giờ (TTL)
await redisClient.setex(`recom:${product_id}`, 86400, JSON.stringify(ids));

// Warm-up cache cho hot products
const hotProducts = await db.query('SELECT product_id FROM products ORDER BY views DESC LIMIT 100');
for (const prod of hotProducts) {
  // Pre-cache
}
```

**Database Indexing:**
```sql
-- Tạo index cho tốc độ
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### 2. Algorithm Tuning

**Thay đổi Parameters:**
```python
# worker/main.py

# Tăng MIN_CONFIDENCE để chỉ lấy luật chắc chắn
MIN_CONFIDENCE = 0.10  # từ 0.05 → 0.10 (10%)

# Tăng MIN_SUPPORT để luật phải phổ biến hơn
MIN_SUPPORT_COUNT = 5  # từ 2 → 5 (ít nhất 5 đơn hàng)

# Kết quả:
# - Luật ít hơn nhưng chính xác hơn
# - Gợi ý hữu ích hơn
# - Tốc độ xử lý nhanh hơn
```

### 3. Monitoring & Debugging

**Logs:**
```javascript
// Server logs
console.log(`[Recom] Fetching for product ${product_id}`);
console.log(`[Recom] Found ${recommendations.length} items`);
console.log(`[Recom] Using fallback strategy`);

// Worker logs
print(f"[FP-Growth] Found {len(itemsets)} itemsets")
print(f"[Rules] Extracted {len(rules)} rules")
```

**Metrics:**
```javascript
// Theo dõi hiệu suất
async function trackRecommendationQuality() {
  const stats = await db.query(`
    SELECT 
      COUNT(*) as total_rules,
      AVG(confidence) as avg_confidence,
      MAX(support_count) as max_support,
      MIN(confidence) as min_confidence
    FROM ai_rules
  `);
  console.log("📊 Recommendation Quality:", stats);
}
```

### 4. Fallback Strategies

```javascript
// Ưu tiên lấy gợi ý theo thứ tự:
// 1. AI Rules (từ Redis)
// 2. Cùng Category
// 3. Best Sellers
// 4. Sản phẩm mới

if (aiRecommendations.length === 0) {
  // Fallback 1: Cùng category
  recommendations = await getCategoryFallback(categoryId, productId);
}

if (recommendations.length === 0) {
  // Fallback 2: Best sellers
  recommendations = await getBestSellers(limit: 5);
}

if (recommendations.length === 0) {
  // Fallback 3: Newest products
  recommendations = await getNewestProducts(limit: 5);
}
```

---

## 📈 Use Cases & Examples

### Use Case 1: Khách xem áo T-shirt

```
1. Khách click Áo T-shirt (Product ID: 5)
2. Frontend gọi: GET /api/recommendations/5
3. Backend kiểm tra Redis: recom:5 → [12, 18, 7]
4. Query MySQL lấy chi tiết 3 sản phẩm:
   - 12: Quần Jean (45.99$)
   - 18: Belt (15.99$)
   - 7: Socks (5.99$)
5. Frontend hiển thị "Sản Phẩm Liên Quan"
6. Khách click vào Quần Jean → Thêm giỏ hàng ✨
```

### Use Case 2: Gợi ý trên Homepage

```
1. Trang Homepage load
2. Hiển thị 4 sản phẩm gợi ý cá nhân
   - Áo T-shirt ($25)
   - Quần Jean ($45)
   - Belt ($15)
   - Socks ($5)
3. Grid 4 cột (desktop), 2 cột (mobile)
4. Khách click → ProductDetail
```

---

## 🔍 Troubleshooting

### Problem 1: Gợi ý không hiển thị

**Nguyên nhân:**
- Redis không chạy
- Chưa chạy Worker
- Không có đủ dữ liệu đơn hàng

**Giải pháp:**
```bash
# Kiểm tra Redis
redis-cli ping
# Output: PONG (nếu OK)

# Kiểm tra ai_rules table
SELECT COUNT(*) FROM ai_rules;
# Nếu = 0, chạy: python worker/main.py

# Xem logs
tail -f worker.log
```

### Problem 2: Hiệu suất chậm

**Nguyên nhân:**
- Cache hết hạn
- Quá nhiều luật trong database
- MySQL không optimize

**Giải pháp:**
```javascript
// Warm-up cache
await redisClient.flushdb();  // Clear old cache
await runWorker();             // Re-cache

// Optimize queries
CREATE INDEX idx_ant_cons ON ai_rules(antecedent_id, consequent_id);

// Giảm độ phức tạp
MIN_CONFIDENCE = 0.15;  // Tăng threshold
```

### Problem 3: Luật không chính xác

**Nguyên nhân:**
- Dữ liệu đơn hàng không sạch
- MIN_SUPPORT_COUNT quá thấp

**Giải pháp:**
```python
# worker/main.py

# Lọc dữ liệu tốt hơn
MIN_SUPPORT_COUNT = 10     # Tăng từ 2 → 10
MIN_CONFIDENCE = 0.20      # Tăng từ 0.05 → 0.20

# Bỏ qua sản phẩm hiếm
MIN_PRODUCT_FREQUENCY = 5  # Sản phẩm phải xuất hiện ≥5 đơn
```

---

## 📚 Tài Liệu Tham Khảo

- **FP-Growth Algorithm:** [Wikipedia](https://en.wikipedia.org/wiki/Association_rule_learning)
- **Apriori Algorithm:** [Medium Article](https://medium.com/@pheminy/apriori-algorithm-4d82c98ec4f6)
- **Association Rules:** [ML Tutorial](https://en.wikipedia.org/wiki/Association_rule_learning)

---

## 🎯 Roadmap Tương Lai

- [ ] Content-based filtering (sử dụng mô tả sản phẩm)
- [ ] Collaborative filtering (dựa trên khách hàng tương tự)
- [ ] Real-time recommendations (không chỉ nightly)
- [ ] A/B testing personalization
- [ ] Machine Learning models (TensorFlow)
- [ ] User preference learning

---

**Cập nhật lần cuối:** April 20, 2026  
**Tác giả:** ShopWeb Development Team  
**Phiên bản:** 1.0
