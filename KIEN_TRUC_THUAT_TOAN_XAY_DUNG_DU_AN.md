# KIẾN TRÚC DỰ ÁN, THUẬT TOÁN & HƯỚNG DẪN XÂY DỰNG CHI TIẾT

**Dự án:** Thiết kế và xây dựng nền tảng thương mại điện tử với hệ thống gợi ý sản phẩm thông minh sử dụng kỹ thuật khai phá dữ liệu  
**Ngôn ngữ:** Tiếng Việt  
**Cập nhật:** April 2026

---

## PHẦN 1: KIẾN TRÚC HỆ THỐNG TỔNG QUAN

### 1.1 Kiến Trúc Ba Tầng (Three-Tier Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                        │
│              (Giao diện người dùng - Frontend)              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ReactJS Application                                 │   │
│  │ - Customer Interface (React Components)             │   │
│  │ - Admin Dashboard                                   │   │
│  │ - Real-time Chat UI (Socket.IO Client)             │   │
│  │ - Responsive Design (Tailwind CSS)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS & WebSocket
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│              (Xử lý logic - Backend)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Node.js/Express Server                              │   │
│  │ - RESTful API Endpoints                             │   │
│  │ - Authentication & Authorization                    │   │
│  │ - WebSocket Server (Socket.IO)                      │   │
│  │ - Business Logic                                    │   │
│  │ - File Upload Management (Multer)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Python Worker (Async Processing)                    │   │
│  │ - Data Mining Engine (Apriori, FP-Growth)          │   │
│  │ - Recommendation Engine                             │   │
│  │ - Batch Processing Jobs (APScheduler)              │   │
│  │ - Email Notifications                               │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Database Queries & Cache
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   DATA LAYER                                │
│              (Lưu trữ dữ liệu)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ MySQL 8.0 Database                                  │   │
│  │ - User Management                                   │   │
│  │ - Product Catalog                                   │   │
│  │ - Order Management                                  │   │
│  │ - Browsing History                                  │   │
│  │ - Recommendations Storage                           │   │
│  │ - Association Rules Storage                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Redis Cache                                          │   │
│  │ - Session Management                                │   │
│  │ - Recommendation Cache                              │   │
│  │ - Real-time Data                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ External Services                                   │   │
│  │ - Cloudinary (Image Storage)                        │   │
│  │ - Email Service (Nodemailer/SMTP)                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Các Thành Phần Chi Tiết

#### **A. Frontend (React)**
```
Client/src/
├── pages/
│   ├── HomePage.js                 # Trang chủ
│   ├── ProductListPage.js          # Danh sách sản phẩm
│   ├── ProductDetailPage.js        # Chi tiết sản phẩm
│   ├── CartPage.js                 # Giỏ hàng
│   ├── CheckoutPage.js             # Thanh toán
│   ├── OrderTrackingPage.js        # Theo dõi đơn hàng
│   ├── UserProfilePage.js          # Hồ sơ người dùng
│   ├── AdminDashboard.js           # Quản trị viên
│   ├── LoginPage.js                # Đăng nhập
│   └── RegisterPage.js             # Đăng ký
│
├── components/
│   ├── Header/                     # Header chung
│   ├── Footer/                     # Footer chung
│   ├── ProductCard/                # Thẻ sản phẩm
│   ├── RecommendationWidget/       # Widget gợi ý
│   ├── Chat/                       # Chat widget
│   ├── NotificationCenter/         # Trung tâm thông báo
│   └── ...
│
├── services/
│   ├── api.js                      # Axios instance
│   ├── productService.js           # API sản phẩm
│   ├── orderService.js             # API đơn hàng
│   ├── recommendationService.js    # API gợi ý
│   ├── authService.js              # API xác thực
│   └── ...
│
├── contexts/
│   ├── AuthContext.js              # Quản lý xác thực
│   ├── CartContext.js              # Quản lý giỏ hàng
│   ├── UserContext.js              # Dữ liệu người dùng
│   └── ...
│
├── utils/
│   ├── helpers.js                  # Hàm hỗ trợ
│   ├── validators.js               # Validation
│   └── constants.js                # Hằng số
│
├── App.js                          # Route chính
└── index.js                        # Entry point
```

#### **B. Backend (Node.js/Express)**
```
Server/
├── config/
│   ├── database.js                 # Config MySQL
│   ├── redis.js                    # Config Redis
│   ├── jwt.js                      # Config JWT
│   └── cloudinary.js               # Config Cloudinary
│
├── models/
│   ├── User.js                     # Schema người dùng
│   ├── Product.js                  # Schema sản phẩm
│   ├── Order.js                    # Schema đơn hàng
│   ├── OrderItem.js                # Items trong đơn
│   ├── Cart.js                     # Giỏ hàng
│   ├── Review.js                   # Review sản phẩm
│   ├── BrowsingHistory.js          # Lịch sử duyệt
│   ├── Recommendation.js           # Kết quả gợi ý
│   ├── AssociationRule.js          # Association rules
│   └── ...
│
├── controllers/
│   ├── authController.js           # Xác thực
│   ├── userController.js           # Quản lý người dùng
│   ├── productController.js        # Quản lý sản phẩm
│   ├── orderController.js          # Quản lý đơn hàng
│   ├── cartController.js           # Quản lý giỏ hàng
│   ├── recommendationController.js # Gợi ý sản phẩm
│   ├── reviewController.js         # Review sản phẩm
│   └── ...
│
├── routes/
│   ├── authRoutes.js               # Route xác thực
│   ├── userRoutes.js               # Route người dùng
│   ├── productRoutes.js            # Route sản phẩm
│   ├── orderRoutes.js              # Route đơn hàng
│   ├── cartRoutes.js               # Route giỏ hàng
│   ├── recommendationRoutes.js     # Route gợi ý
│   └── ...
│
├── middleware/
│   ├── authMiddleware.js           # Kiểm tra JWT
│   ├── validationMiddleware.js     # Validation dữ liệu
│   ├── errorHandler.js             # Xử lý lỗi
│   ├── logger.js                   # Logging
│   └── ...
│
├── database/
│   ├── connection.js               # Kết nối DB
│   └── migrations/
│       ├── 001_create_users.sql
│       ├── 002_create_products.sql
│       └── ...
│
├── sockets/
│   └── chatSocket.js               # Socket.IO handlers
│
├── scripts/
│   ├── seedData.js                 # Seed dữ liệu test
│   ├── createIndexes.js            # Tạo indexes
│   └── ...
│
├── index.js                        # Entry point
├── package.json
└── .env
```

#### **C. Worker (Python)**
```
worker/
├── requirements.txt                # Python dependencies
│
├── main.py                         # Entry point
│
├── config/
│   └── settings.py                 # Cấu hình
│
├── database/
│   ├── connection.py               # Kết nối MySQL
│   └── models.py                   # ORM models
│
├── algorithms/
│   ├── apriori.py                  # Apriori Algorithm
│   ├── fp_growth.py                # FP-Growth Algorithm
│   └── utils.py                    # Utility functions
│
├── recommendation/
│   ├── collaborative_filtering.py  # Collaborative Filtering
│   ├── content_based.py            # Content-based Filtering
│   ├── hybrid.py                   # Hybrid Recommendation
│   └── evaluator.py                # Evaluation metrics
│
├── miners/
│   ├── association_miner.py        # Association rules mining
│   ├── pattern_extractor.py        # Pattern extraction
│   └── data_preprocessor.py        # Data preprocessing
│
├── jobs/
│   ├── recommendation_job.py       # Scheduled job: Recommendations
│   ├── mining_job.py               # Scheduled job: Mining
│   ├── email_job.py                # Scheduled job: Email
│   └── ...
│
├── services/
│   ├── cache_service.py            # Redis caching
│   ├── email_service.py            # Email sending
│   ├── notification_service.py     # Notifications
│   └── ...
│
└── logs/
    └── worker.log
```

### 1.3 Mối Liên Kết Giữa Các Thành Phần

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │ HTTP/WebSocket
         ↓
┌─────────────────────────────────────┐
│   Backend (Node.js/Express)         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ API Routes                      │ │
│ │ - /api/products                 │ │
│ │ - /api/orders                   │ │
│ │ - /api/recommendations          │ │
│ │ - /api/browsing-history         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Socket.IO                       │ │
│ │ - Chat realtime                 │ │
│ │ - Notifications                 │ │
│ │ - Order tracking                │ │
│ └─────────────────────────────────┘ │
└────────┬────────────────┬────────────┘
         │                │
         ↓                ↓
    ┌─────────┐     ┌────────────┐
    │ MySQL   │     │ Redis      │
    │ Database│     │ Cache      │
    └─────────┘     └────────────┘
         ↑                
         │ Query & Store
         │
    ┌─────────────────┐
    │   Worker        │
    │   (Python)      │
    │                 │
    │ Apriori/        │
    │ FP-Growth       │
    │ Mining          │
    │ Recommendation  │
    │ & Jobs          │
    └─────────────────┘
```

---

## PHẦN 2: CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

### 2.1 Sơ Đồ Thực Thể Mối Quan Hệ (ER Diagram)

```
┌──────────────┐         ┌─────────────────┐
│    USERS     │         │   CATEGORIES    │
├──────────────┤         ├─────────────────┤
│ user_id (PK)│◄────────┤ category_id(PK) │
│ email       │         │ name            │
│ password    │         │ description     │
│ username    │         └─────────────────┘
│ phone       │                 ▲
│ created_at  │                 │ 1
│ updated_at  │                 │
└──────────────┘           has_many│
       ▲                          │
       │                          ▼
    1  │                     ┌─────────────┐
       │ 1                   │   PRODUCTS  │
  ┌────┴──────────┐          ├─────────────┤
  │               │ M        │product_id(P)│
  │               │◄─────────│category_id  │
  │               │          │name         │
┌─┴───────────┐   │          │description  │
│    CARTS    │   │          │price        │
├─────────────┤   │          │image_url    │
│ cart_id (PK)│   │          │stock        │
│ user_id (FK)│───┘          │ratings      │
│ created_at  │              │created_at   │
└──────┬──────┘              └──┬──────────┘
       │                        │
       │ 1                      │ 1
       │ has                    │ has_many
       │                        │
       ▼ M              ┌───────┴────────┐
 ┌─────────────┐       │                │
 │  CART_ITEMS │       ▼ M              ▼ M
 ├─────────────┤   ┌──────────┐   ┌───────────┐
 │item_id (PK) │   │  REVIEWS │   │  ORDERS   │
 │cart_id (FK) │   ├──────────┤   ├───────────┤
 │product_id   │   │review_id │   │ order_id  │
 │quantity     │   │product_id│   │ user_id   │
 │created_at   │   │user_id   │   │ status    │
 └─────────────┘   │rating    │   │ total     │
                   │comment   │   │ created_at│
                   │created_at│   └────┬──────┘
                   └──────────┘        │
                                       │ 1
                                       │ has
                                       │ many
                                       ▼ M
                                   ┌────────────┐
                                   │ORDER_ITEMS │
                                   ├────────────┤
                                   │item_id (PK)│
                                   │order_id(FK)│
                                   │product_id  │
                                   │quantity    │
                                   │price       │
                                   └────────────┘

┌──────────────────────┐    ┌──────────────────────┐
│BROWSING_HISTORY      │    │RECOMMENDATIONS       │
├──────────────────────┤    ├──────────────────────┤
│history_id (PK)       │    │recommend_id (PK)     │
│user_id (FK)          │    │user_id (FK)          │
│product_id (FK)       │    │product_id (FK)       │
│viewed_at             │    │score                 │
│duration              │    │reason                │
└──────────────────────┘    │created_at            │
                            └──────────────────────┘

┌────────────────────────┐   ┌─────────────────────┐
│ASSOCIATION_RULES       │   │FREQUENT_ITEMSETS    │
├────────────────────────┤   ├─────────────────────┤
│rule_id (PK)            │   │itemset_id (PK)      │
│product_from (FK)       │   │products             │
│product_to (FK)         │   │support              │
│confidence              │   │frequency            │
│support                 │   │updated_at           │
│lift                    │   └─────────────────────┘
│updated_at              │
└────────────────────────┘
```

### 2.2 Các Bảng Chính

| Bảng | Mục Đích | Số Records | Ghi Chú |
|------|----------|-----------|--------|
| `users` | Quản lý người dùng | 1,000+ | Email unique, hashed password |
| `products` | Danh mục sản phẩm | 5,000+ | Indexed by category, name |
| `categories` | Phân loại | 50+ | Parent-child relationships |
| `orders` | Đơn hàng | 10,000+ | Status tracking |
| `order_items` | Chi tiết đơn hàng | 50,000+ | Foreign key to orders & products |
| `browsing_history` | Lịch sử duyệt | 100,000+ | For collaborative filtering |
| `recommendations` | Kết quả gợi ý | 1,000,000+ | Cached recommendations |
| `association_rules` | Quy tắc kết hợp | 1,000+ | From Apriori/FP-Growth |
| `frequent_itemsets` | Tập phổ biến | 5,000+ | From data mining |
| `reviews` | Đánh giá sản phẩm | 10,000+ | Rating 1-5 stars |
| `carts` | Giỏ hàng | 2,000+ | Active carts |
| `cart_items` | Chi tiết giỏ hàng | 5,000+ | Temporary data |

---

## PHẦN 3: CÁC THUẬT TOÁN CHÍNH

### 3.1 Apriori Algorithm (Khai Phá Tập Phổ Biến)

#### **Nguyên Lý Hoạt Động:**
```
Apriori Algorithm: Tìm frequent itemsets & association rules

1. Scan database → Count item frequencies
2. Keep items with support ≥ min_support (tập 1-itemset)
3. Combine itemsets L(k-1) → Generate candidate itemsets C(k)
4. Scan database → Count frequencies of C(k)
5. Keep itemsets with support ≥ min_support → L(k)
6. Repeat until no new itemsets found

7. From frequent itemsets → Generate association rules
   For each itemset X: For each non-empty Y ⊂ X
   If support(X)/support(Y) ≥ min_confidence → Output rule Y → X-Y
```

#### **Công Thức Toán Học:**
```
Support(X) = Count(X) / Total Transactions
Confidence(Y → Z) = Support(Y ∪ Z) / Support(Y)
Lift(Y → Z) = Support(Y ∪ Z) / (Support(Y) × Support(Z))

Quy tắc "mạnh": Support ≥ min_sup AND Confidence ≥ min_conf
```

#### **Pseudocode:**
```
Algorithm: Apriori(D, min_sup)
Input: Database D, minimum support min_sup
Output: All frequent itemsets L

1. L1 = {frequent 1-itemsets}
2. k = 2
3. while Lk-1 ≠ ∅ do
4.    Ck = apriori_gen(Lk-1)  // Generate candidates
5.    for each transaction t in D do
6.        for each candidate c in Ck do
7.            if c ⊆ t then c.count++
8.        end for
9.    end for
10.   Lk = {c ∈ Ck | c.count ≥ min_sup × |D|}
11.   k = k + 1
12. end while
13. return ∪ Lk
```

#### **Ví Dụ Thực Tiễn (E-Commerce):**
```
Database: 
Transaction 1: {Áo sơ mi, Quần, Dây lưng}
Transaction 2: {Áo sơ mi, Quần}
Transaction 3: {Áo sơ mi, Giày}
Transaction 4: {Quần, Dây lưng}
Transaction 5: {Áo sơ mi, Quần, Giày}

min_sup = 40% (2 transactions)

Support counts:
- Áo sơ mi: 4/5 = 80% ✓
- Quần: 4/5 = 80% ✓
- Giày: 2/5 = 40% ✓
- Dây lưng: 2/5 = 40% ✓
- {Áo sơ mi, Quần}: 3/5 = 60% ✓
- {Áo sơ mi, Giày}: 2/5 = 40% ✓
- {Quần, Dây lưng}: 2/5 = 40% ✓
- {Áo sơ mi, Quần, Giày}: 1/5 = 20% ✗

Association Rules (min_conf = 50%):
- Áo sơ mi → Quần: Confidence = 3/4 = 75% ✓
- Quần → Áo sơ mi: Confidence = 3/4 = 75% ✓
- Áo sơ mi → Giày: Confidence = 2/4 = 50% ✓

Kết luận: "Khách hàng mua Áo sơ mi → 75% sẽ mua Quần"
```

#### **Triển Khai Python:**
```python
from itertools import combinations

def apriori(dataset, min_sup):
    # 1. Tính support của từng item
    item_counts = {}
    for transaction in dataset:
        for item in transaction:
            item_counts[item] = item_counts.get(item, 0) + 1
    
    # 2. Lọc items có support >= min_sup
    min_count = min_sup * len(dataset)
    frequent_items = {frozenset([item]): count 
                     for item, count in item_counts.items() 
                     if count >= min_count}
    
    if not frequent_items:
        return frequent_items
    
    # 3. Mở rộng itemsets
    all_frequent = frequent_items.copy()
    k = 2
    
    while True:
        # Generate candidates (k-itemsets)
        candidates = set()
        prev_itemsets = list(all_frequent.keys())
        
        for i in range(len(prev_itemsets)):
            for j in range(i + 1, len(prev_itemsets)):
                union = prev_itemsets[i] | prev_itemsets[j]
                if len(union) == k:
                    candidates.add(union)
        
        # Tính support cho candidates
        candidate_counts = {c: 0 for c in candidates}
        for transaction in dataset:
            for candidate in candidates:
                if candidate.issubset(set(transaction)):
                    candidate_counts[candidate] += 1
        
        # Lọc candidates có support >= min_sup
        new_frequent = {c: count for c, count in candidate_counts.items()
                       if count >= min_count}
        
        if not new_frequent:
            break
        
        all_frequent.update(new_frequent)
        k += 1
    
    return all_frequent
```

### 3.2 FP-Growth Algorithm (Tối Ưu Phiên Bản Apriori)

#### **Nguyên Lý Hoạt Động:**
```
FP-Growth: Xây dựng FP-tree → Mining patterns mà không cần generate candidates

Bước 1: Quét database lần 1 → Tính item frequencies
Bước 2: Sắp xếp items theo tần suất giảm dần
Bước 3: Quét database lần 2 → Xây dựng FP-tree
        - Mỗi transaction → path trong tree
        - Chia sẻ prefix → Tiết kiệm bộ nhớ
Bước 4: Mining từ FP-tree
        - Bắt đầu từ bottom → Recursive mining
        - Tạo conditional pattern bases
        - Xây dựng conditional FP-trees
```

#### **Cấu Trúc FP-Tree:**
```
Ví dụ: Transactions {A,B,C}, {A,B}, {A,C}, {B,C}
Min support = 2

           [Root]
          /      \
      [A:3]    [B:1]
      /    \       \
   [B:2] [C:1]   [C:1]
    /         
[C:1]

Mỗi node lưu:
- Item name
- Count
- Link đến node tiếp theo (header table)
```

#### **Pseudocode:**
```
Algorithm: FP-Growth(FP-tree, min_sup)
Input: FP-tree, minimum support
Output: All frequent patterns

1. if tree contains single path then
2.    generate all combinations of items
3. else
4.    for each item in header table do
5.        generate pattern = current_pattern ∪ item
6.        generate conditional pattern base
7.        construct conditional FP-tree
8.        recursively call FP-Growth
9.    end for
10. end if
```

#### **So Sánh Apriori vs FP-Growth:**

| Tiêu Chí | Apriori | FP-Growth |
|----------|---------|-----------|
| **Candidate Generation** | Có, phức tạp | Không cần |
| **Database Scans** | Nhiều (2n+1) | 2 lần đầu + tree mining |
| **Memory Usage** | Cao | Thấp hơn (FP-tree compact) |
| **Performance** | Chậm với dataset lớn | Nhanh hơn 2-10x |
| **Scalability** | Giới hạn | Tốt hơn |
| **Implementation** | Dễ | Phức tạp hơn |

#### **Triển Khai Python:**
```python
class FPNode:
    def __init__(self, item, count=0, parent=None):
        self.item = item
        self.count = count
        self.parent = parent
        self.children = {}
        self.next = None

def build_fp_tree(dataset, min_sup):
    # Tính item frequencies
    item_counts = {}
    for transaction in dataset:
        for item in transaction:
            item_counts[item] = item_counts.get(item, 0) + 1
    
    # Lọc items
    min_count = min_sup * len(dataset)
    frequent_items = {item for item, count in item_counts.items() 
                     if count >= min_count}
    
    # Xây dựng FP-tree
    root = FPNode(None)
    
    for transaction in dataset:
        # Sắp xếp items theo tần suất
        sorted_items = sorted(
            [item for item in transaction if item in frequent_items],
            key=lambda x: item_counts[x],
            reverse=True
        )
        
        # Insert path vào tree
        current_node = root
        for item in sorted_items:
            if item in current_node.children:
                current_node.children[item].count += 1
                current_node = current_node.children[item]
            else:
                new_node = FPNode(item, 1, current_node)
                current_node.children[item] = new_node
                current_node = new_node
    
    return root, frequent_items, item_counts

def mine_fp_tree(fp_tree, min_sup, prefix=[]):
    # Mining patterns từ FP-tree
    patterns = []
    # ... (chi tiết mining logic)
    return patterns
```

### 3.3 Collaborative Filtering (Gợi Ý Dựa Trên Hành Vi)

#### **Nguyên Lý:**
```
Collaborative Filtering: "Những người có sở thích giống nhau → 
                          sẽ thích những sản phẩm tương tự"

User-based CF:
1. Tìm những người dùng tương tự (có rating patterns giống nhau)
2. Gợi ý những sản phẩm mà những người tương tự thích

Item-based CF:
1. Tìm những sản phẩm tương tự (được rating giống nhau bởi users)
2. Gợi ý những sản phẩm tương tự với những sản phẩm user thích
```

#### **Công Thức Tính Similarity (Cosine Similarity):**
```
Similarity(User A, User B) = (Vector A · Vector B) / (||Vector A|| × ||Vector B||)

Vector A = [rating_product1, rating_product2, ..., rating_productN]
Vector B = [rating_product1, rating_product2, ..., rating_productN]

Ví dụ:
User A: [5, 4, _, 3] (có rating cho sp1,2,4)
User B: [5, 5, _, 4]

similarity = (5×5 + 4×5 + 3×4) / (√(25+16+9) × √(25+25+16))
          = (25 + 20 + 12) / (√50 × √66)
          = 57 / 57.45 ≈ 0.99 (rất tương tự)
```

#### **Triển Khai Python:**
```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def get_recommendations_cf(user_id, user_item_matrix, k=5):
    """
    user_item_matrix: Matrix (n_users × n_items) chứa ratings
    k: số gợi ý trả về
    """
    
    # 1. Tính cosine similarity giữa tất cả users
    similarity_matrix = cosine_similarity(user_item_matrix)
    
    # 2. Lấy similarities cho user hiện tại
    user_similarities = similarity_matrix[user_id]
    
    # 3. Sắp xếp users theo similarity (không tính user chính)
    similar_users_idx = np.argsort(user_similarities)[::-1][1:k+1]
    
    # 4. Lấy items mà similar users thích
    recommendations = {}
    for sim_user_idx in similar_users_idx:
        for item_idx, rating in enumerate(user_item_matrix[sim_user_idx]):
            if rating > 0 and user_item_matrix[user_id][item_idx] == 0:
                # Item chưa được user hiện tại rating
                weight = rating * user_similarities[sim_user_idx]
                recommendations[item_idx] = recommendations.get(item_idx, 0) + weight
    
    # 5. Sắp xếp & trả về top recommendations
    top_recommendations = sorted(
        recommendations.items(),
        key=lambda x: x[1],
        reverse=True
    )[:k]
    
    return [item_idx for item_idx, score in top_recommendations]
```

### 3.4 Content-based Filtering (Gợi Ý Dựa Trên Nội Dung)

#### **Nguyên Lý:**
```
Content-based Filtering: Xác định sản phẩm tương tự dựa trên features/attributes

1. Tạo product feature vectors
   - Category: {áo: 1, quần: 0, giày: 0}
   - Color: {đỏ: 0, xanh: 1, trắng: 0}
   - Brand: {Nike: 1, Adidas: 0, ...}
   - Price: normalized_price

2. Tạo user preference profile
   - Từ sản phẩm user đã xem/mua
   - Tính weighted average của features

3. Tính similarity giữa user profile & products
   - Recommend products tương tự với preferences
```

#### **Công Thức:**
```
User Profile = (Σ(rating_i × feature_vector_i)) / Σ(rating_i)

Score(user, item) = cosine_similarity(user_profile, item_features)
```

#### **Triển Khai Python:**
```python
def create_user_profile(user_history, product_features, ratings):
    """
    user_history: list of (product_id, rating)
    product_features: dict {product_id: feature_vector}
    """
    profile = None
    total_weight = 0
    
    for product_id, rating in user_history:
        features = np.array(product_features[product_id])
        if profile is None:
            profile = rating * features
        else:
            profile = profile + rating * features
        total_weight += rating
    
    if profile is not None:
        profile = profile / total_weight
    
    return profile

def get_recommendations_content_based(user_profile, product_features, k=5):
    """
    Gợi ý sản phẩm có features tương tự với user profile
    """
    
    recommendations = {}
    
    for product_id, features in product_features.items():
        # Cosine similarity
        similarity = np.dot(user_profile, np.array(features)) / (
            np.linalg.norm(user_profile) * np.linalg.norm(np.array(features))
        )
        recommendations[product_id] = similarity
    
    # Sắp xếp & trả về top k
    top_k = sorted(
        recommendations.items(),
        key=lambda x: x[1],
        reverse=True
    )[:k]
    
    return [item_id for item_id, score in top_k]
```

### 3.5 Hybrid Recommendation (Kết Hợp Cả Hai)

#### **Công Thức:**
```
Final_Score(user, item) = α × CF_Score(user, item) + 
                          β × CB_Score(user, item) +
                          γ × Association_Rule_Score(user, item)

Thường: α = 0.6, β = 0.3, γ = 0.1

Ưu điểm:
- Kết hợp sức mạnh của CF & CB
- Tránh cold-start problem
- Tăng diversity của recommendations
```

#### **Triển Khai:**
```python
def hybrid_recommendation(user_id, cf_scores, cb_scores, rule_scores, alpha=0.6, beta=0.3, gamma=0.1):
    """
    Kết hợp 3 loại scores
    """
    
    # Normalize scores to [0, 1]
    cf_norm = normalize(cf_scores)
    cb_norm = normalize(cb_scores)
    rule_norm = normalize(rule_scores)
    
    # Combine
    final_scores = {}
    all_items = set(cf_scores.keys()) | set(cb_scores.keys()) | set(rule_scores.keys())
    
    for item_id in all_items:
        score = (
            alpha * cf_norm.get(item_id, 0) +
            beta * cb_norm.get(item_id, 0) +
            gamma * rule_norm.get(item_id, 0)
        )
        final_scores[item_id] = score
    
    # Trả về top k
    top_k = sorted(
        final_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )[:10]
    
    return top_k
```

---

## PHẦN 4: XÂY DỰNG DỰ ÁN CHI TIẾT

### 4.1 Giai Đoạn 1: Chuẩn Bị & Phân Tích (Tuần 1-3)

#### **Tuần 1:**
```
Công việc:
1. Thiết lập Git Repository
   - Tạo GitHub/GitLab repo
   - Tạo .gitignore, README
   - Tạo branches: main, develop, feature/*

2. Thiết kế Database Schema
   - Vẽ ER diagram
   - Xác định tất cả bảng, cột, constraints
   - Thiết kế indexes

3. Thiết kế API Endpoints
   - Liệt kê tất cả endpoints (100+)
   - Xác định HTTP methods, parameters, responses
   - Tạo OpenAPI/Swagger specification

4. Tạo tài liệu yêu cầu chi tiết
```

#### **Tuần 2:**
```
Công việc:
1. Tìm hiểu Apriori & FP-Growth
   - Đọc papers, tutorials
   - Hiểu pseudocode & complexity analysis
   - Chuẩn bị test data

2. Thiết kế Recommendation Engine
   - Nghiên cứu CF, Content-based, Hybrid approaches
   - Xác định evaluation metrics
   - Vẽ recommendation pipeline

3. Chuẩn bị môi trường dev
   - Cài đặt Node.js, Python, MySQL
   - Cài đặt VS Code extensions
   - Tạo .env templates
```

#### **Tuần 3:**
```
Công việc:
1. Viết Database Scripts
   - SQL CREATE TABLE cho tất cả bảng
   - SQL seed data scripts (5000+ products, etc.)
   - SQL indexes & constraints

2. Tạo seed data
   - 1,000 users (varied profiles)
   - 5,000 products (multiple categories)
   - 10,000 orders (realistic patterns)
   - 100,000 browsing records

3. Chuẩn bị test data cho mining
```

### 4.2 Giai Đoạn 2: Xây Dựng Core (Tuần 4-8)

#### **Tuần 4: Backend - Authentication & Database**
```
Công việc:
1. Thiết lập Express Server
   - Khởi tạo project, install dependencies
   - Tạo folder structure
   - Cấu hình .env files

2. Database Connection
   - Kết nối MySQL, tạo connection pool
   - Implement database models
   - Test queries

3. Authentication Module
   - Implement JWT generation/verification
   - Password hashing (bcrypt)
   - Login/Logout endpoints

Deliverables:
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh-token
- Middleware: authenticateToken
```

#### **Tuần 5: Backend - Product & Order APIs**
```
Công việc:
1. Product Management
   - GET /products (with pagination, filter, sort)
   - GET /products/:id
   - POST /products (admin only)
   - PUT /products/:id (admin)
   - DELETE /products/:id (admin)
   - Search endpoint

2. Order Management
   - POST /orders
   - GET /orders/:userId
   - GET /orders/:orderId
   - PUT /orders/:orderId/status (admin)
   - GET /orders (admin - all orders)

3. Implement validation & error handling

Deliverables:
- 15+ Product endpoints
- 10+ Order endpoints
- Comprehensive error handling
```

#### **Tuần 6: Frontend - Setup & Basic Pages**
```
Công việc:
1. React Project Setup
   - Vite/CRA initialization
   - Install dependencies: React Router, Tailwind, Axios
   - Folder structure creation
   - Tailwind configuration

2. Create Pages
   - HomePage.js (hero + featured products)
   - ProductListPage.js (grid, filters)
   - ProductDetailPage.js
   - CartPage.js
   - LoginPage.js
   - RegisterPage.js

3. Create Components
   - Header/Navigation
   - Footer
   - ProductCard
   - ProductFilters
   - Breadcrumb

Deliverables:
- 6+ pages hoàn thành
- Responsive design
- Basic styling
```

#### **Tuần 7: Recommendation Engine - Backend**
```
Công việc:
1. Python Worker Setup
   - Virtual environment
   - Install requirements: numpy, pandas, PyMySQL, APScheduler
   - Folder structure

2. Implement Apriori
   - Data loading from MySQL
   - Itemset generation
   - Rule generation
   - Performance optimization

3. Implement FP-Growth
   - FP-tree building
   - Pattern mining
   - Comparison with Apriori

4. Implement Collaborative Filtering
   - User similarity calculation
   - Item similarity calculation
   - Get top-k recommendations

Deliverables:
- Apriori algorithm implementation
- FP-Growth algorithm implementation
- CF algorithm implementation
- Test suite với sample data
```

#### **Tuần 8: Frontend - Advanced Pages & APIs**
```
Công việc:
1. Advanced Pages
   - CheckoutPage.js
   - OrderTrackingPage.js
   - UserProfilePage.js
   - AdminDashboard.js

2. Integrate APIs
   - Create API service layer (apiClient.js)
   - Create hooks: useProducts, useOrders, etc.
   - Handle loading, error states

3. State Management
   - Create contexts: AuthContext, CartContext
   - Implement useReducer for complex state

Deliverables:
- 10+ pages fully functional
- All API integrations
- Error handling & loading states
```

### 4.3 Giai Đoạn 3: Feature Completion (Tuần 9-12)

#### **Tuần 9: Real-time Features**
```
Công việc:
1. Socket.IO Setup
   - Server setup
   - Chat handlers
   - Connection management

2. Implement Chat
   - Frontend: ChatWidget.js
   - Backend: chatSocket.js handlers
   - Database: messages storage

3. Implement Notifications
   - Push notifications
   - Email notifications (Nodemailer)

Deliverables:
- Chat system fully functional
- Notifications working
- Real-time updates
```

#### **Tuần 10: Recommendation Integration**
```
Công việc:
1. Backend Endpoints
   - GET /recommendations/:userId
   - GET /recommendations/trending
   - GET /recommendations/similar/:productId

2. Python Worker Jobs
   - APScheduler setup
   - Recommendation job (runs daily)
   - Mining job (Apriori/FP-Growth)
   - Cache results in Redis

3. Frontend Components
   - RecommendationWidget.js
   - Show in HomePage, ProductDetail, etc.

Deliverables:
- Recommendation APIs working
- Scheduled jobs running
- Results cached & served fast
- Frontend displaying recommendations
```

#### **Tuần 11: Admin Features**
```
Công việc:
1. Admin Dashboard Pages
   - Product Management
   - Order Management
   - User Management
   - Analytics/Reports

2. Admin APIs
   - PUT /admin/products/:id
   - DELETE /admin/products/:id
   - GET /admin/analytics/sales
   - GET /admin/analytics/topProducts
   - POST /admin/users/:id/ban

3. Access Control
   - Role-based access (RBAC)
   - Admin middleware

Deliverables:
- Full admin dashboard
- All CRUD operations
- Analytics & reporting
```

#### **Tuần 12: Reviews & File Upload**
```
Công việc:
1. Review System
   - POST /products/:id/reviews
   - GET /products/:id/reviews
   - Rating calculation
   - Frontend review form

2. File Upload
   - Multer setup
   - Cloudinary integration
   - Image optimization
   - Upload endpoints

3. Testing
   - Unit tests
   - API testing (Postman)
   - Frontend component testing

Deliverables:
- Review system complete
- File upload working
- Test suite
```

### 4.4 Giai Đoạn 4: Testing & Deployment (Tuần 13-17)

#### **Tuần 13: Testing**
```
Công việc:
1. Unit Tests
   - Frontend: Jest + React Testing Library (70%+ coverage)
   - Backend: Jest/Mocha (70%+ coverage)

2. Integration Tests
   - API end-to-end tests
   - Database interaction tests
   - Authentication flow tests

3. System Tests
   - User journeys (browse → cart → checkout)
   - Admin workflows
   - Recommendation system accuracy
```

#### **Tuần 14: Performance & Security**
```
Công việc:
1. Performance Optimization
   - Database query optimization
   - Frontend bundle size optimization
   - Lazy loading images
   - Caching strategies

2. Security Audit
   - SQL injection prevention
   - XSS prevention
   - CSRF protection
   - JWT security
   - HTTPS/TLS configuration

3. Load Testing
   - Simulate 100, 1000, 10000 concurrent users
   - Identify bottlenecks
   - Optimize as needed
```

#### **Tuần 15: Deployment**
```
Công việc:
1. Production Setup
   - Cloudinary setup for images
   - Email service configuration
   - Database backup setup
   - SSL/TLS certificates

2. Deploy Frontend
   - Build React app
   - Deploy to Vercel/Netlify/GitHub Pages
   - Configure CDN

3. Deploy Backend
   - Setup Node.js server (AWS/DigitalOcean/Heroku)
   - Configure PM2 for auto-restart
   - Setup nginx reverse proxy
   - Configure logging & monitoring

4. Deploy Worker
   - Setup Python environment on server
   - Configure cron jobs/APScheduler
   - Setup alerts for job failures
```

#### **Tuần 16: Documentation & Fine-tuning**
```
Công việc:
1. Documentation
   - API documentation (Swagger)
   - Architecture documentation
   - Database schema documentation
   - Deployment guide
   - User guide

2. Fine-tuning
   - Bug fixes
   - Performance tuning
   - UX improvements
   - Final testing
```

#### **Tuần 17: Final Presentation**
```
Công việc:
1. Prepare Presentation
   - Create slides
   - Create demo video
   - Prepare talking points

2. Presentation
   - Live demo
   - Q&A session
   - Receive feedback

3. Final Submissions
   - Code repository
   - Complete documentation
   - Deployment guide
   - Demo video
```

---

## PHẦN 5: METRICS & EVALUATION

### 5.1 Metrics cho Recommendation Engine

```
1. Precision@K: % của top-k recommendations mà user sẽ click/buy
   Precision@10 = (# Relevant items in top-10) / 10

2. Recall@K: % của tất cả relevant items mà system tìm được
   Recall@10 = (# Relevant items in top-10) / (Total relevant items)

3. F1-Score: Harmonic mean của precision & recall
   F1 = 2 × (Precision × Recall) / (Precision + Recall)

4. Coverage: % của catalog mà system có thể recommend
   Coverage = (# Recommendable items) / (Total items)

5. Diversity: Variety của recommendations
   Diversity = (1 - Avg_Similarity) / 2
   
6. Novelty: % của recommended items không phải popular items
   Novelty = (# Novel items in recommendations) / K

7. Serendipity: % của recommendations mà user finds surprising
   (Measured through user feedback)

8. NDCG (Normalized Discounted Cumulative Gain):
   DCG = Σ(rel_i / log2(i+1))
   NDCG = DCG / IDCG (ideal DCG)
```

### 5.2 Metrics cho Data Mining

```
1. Support: Proportion of transactions containing itemset
   Support(X) = Count(X) / Total_Transactions
   
2. Confidence: Likelihood of Y given X
   Confidence(X → Y) = Support(X∪Y) / Support(X)
   
3. Lift: Strength of association
   Lift(X → Y) = Confidence(X → Y) / Support(Y)
   - Lift > 1: Positive correlation
   - Lift = 1: No correlation
   - Lift < 1: Negative correlation

4. Rule Quality: Only keep rules with:
   - Support ≥ min_support (e.g., 1%)
   - Confidence ≥ min_confidence (e.g., 50%)
   - Lift ≥ 1.2 (optional, for strength)
```

### 5.3 Performance Metrics

```
1. API Response Time
   - Average: < 200ms
   - P95: < 500ms
   - P99: < 1000ms

2. Recommendation Computation Time
   - Apriori/FP-Growth: < 5 minutes for 10,000 transactions
   - CF scoring: < 100ms per user

3. Database Query Performance
   - Product list: < 100ms
   - Recommendation retrieval: < 50ms (cached)

4. Frontend Performance (Lighthouse)
   - Performance: > 80
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90

5. Load Testing
   - 100 concurrent users: 0% error rate
   - 1,000 concurrent users: < 1% error rate
   - 10,000 concurrent users: < 5% error rate
```

---

## PHẦN 6: TECHNOLOGIES STACK

### 6.1 Frontend Stack
```
├── React 19
│   ├── React Router 7 (routing)
│   ├── React Hooks (state management)
│   └── Context API (global state)
│
├── Styling
│   ├── Tailwind CSS 4
│   ├── PostCSS
│   └── CSS Modules
│
├── HTTP & Real-time
│   ├── Axios (HTTP client)
│   └── Socket.IO Client (WebSocket)
│
├── Build & Dev Tools
│   ├── Vite (build tool)
│   ├── ESLint (code quality)
│   └── Prettier (code formatting)
│
└── Testing
    ├── Jest
    └── React Testing Library
```

### 6.2 Backend Stack
```
├── Runtime
│   └── Node.js 20+
│
├── Framework
│   ├── Express.js
│   ├── Socket.IO (real-time)
│   └── Cors middleware
│
├── Database
│   ├── MySQL 8.0
│   ├── Redis (caching)
│   ├── mysql2/promise (driver)
│   └── Sequelize (optional ORM)
│
├── Authentication
│   ├── jsonwebtoken (JWT)
│   └── bcrypt (password hashing)
│
├── File Management
│   ├── Multer (file upload)
│   └── Cloudinary (image storage)
│
├── Email
│   └── Nodemailer
│
└── Monitoring & Logging
    ├── Winston (logging)
    └── Sentry (error tracking)
```

### 6.3 Python Worker Stack
```
├── Core
│   ├── Python 3.10+
│   ├── PyMySQL (database)
│   └── Redis-py (caching)
│
├── Data Processing
│   ├── Pandas (data manipulation)
│   ├── NumPy (numerical operations)
│   └── Scikit-learn (ML algorithms)
│
├── Data Mining
│   └── Custom implementations:
│       ├── apriori.py
│       └── fp_growth.py
│
├── Recommendation
│   ├── Collaborative Filtering
│   ├── Content-based Filtering
│   └── Hybrid approach
│
├── Scheduling
│   └── APScheduler (background jobs)
│
└── Utilities
    ├── Python-dotenv (config)
    └── Logging (monitoring)
```

### 6.4 DevOps & Deployment
```
├── Version Control
│   └── Git/GitHub
│
├── CI/CD
│   ├── GitHub Actions
│   ├── Docker (containerization)
│   └── Docker Compose
│
├── Deployment
│   ├── Frontend: Vercel/Netlify
│   ├── Backend: AWS/DigitalOcean/Heroku
│   └── Database: AWS RDS/DigitalOcean Managed
│
├── Monitoring
│   ├── PM2 (process manager)
│   ├── Nginx (reverse proxy)
│   └── Cloudflare (CDN)
│
└── Infrastructure
    ├── SSL/TLS Certificates
    ├── Backups & Disaster Recovery
    └── Logging & Monitoring Tools
```

---

## PHẦN 7: GỌI GHI & BEST PRACTICES

### 7.1 Code Organization Best Practices

```
1. Clean Code Principles
   - Meaningful variable/function names
   - DRY (Don't Repeat Yourself)
   - SOLID principles
   - Single Responsibility Principle

2. Frontend Best Practices
   - Component composition (reusable, small components)
   - Proper prop drilling vs Context API
   - Performance optimization (React.memo, useMemo)
   - Error boundaries

3. Backend Best Practices
   - RESTful API design
   - Proper HTTP status codes
   - Input validation & sanitization
   - Error handling (try-catch blocks)
   - Logging at appropriate levels

4. Database Best Practices
   - Normalization (3NF+)
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Transaction management
```

### 7.2 Security Best Practices

```
1. Authentication & Authorization
   - JWT for stateless auth
   - Refresh tokens for extended sessions
   - Role-based access control (RBAC)
   - Secure password hashing (bcrypt)

2. Data Protection
   - SSL/TLS for all communications
   - Input validation & sanitization
   - SQL injection prevention (prepared statements)
   - XSS prevention (HTML escaping)
   - CSRF protection (tokens)

3. API Security
   - Rate limiting
   - CORS configuration
   - API key management
   - Helmet.js for headers
   - MongoDB injection prevention

4. General Security
   - Environment variables for secrets
   - Regular security audits
   - Dependency vulnerability scanning
   - Password strength requirements
   - Account lockout after failed attempts
```

### 7.3 Testing Best Practices

```
1. Unit Tests
   - Test individual functions
   - Cover edge cases
   - Aim for 70%+ code coverage
   - Mock external dependencies

2. Integration Tests
   - Test API endpoints
   - Test database interactions
   - Test authentication flow
   - Test third-party integrations

3. System Tests
   - Test complete user journeys
   - Test in production-like environment
   - Test edge cases
   - Performance testing

4. Regression Tests
   - Automated test suite
   - Run before each deployment
   - Catch unintended changes
```

### 7.4 Performance Best Practices

```
1. Frontend Optimization
   - Code splitting (lazy loading)
   - Image optimization (compression, WebP)
   - Bundle size optimization
   - Efficient re-renders (React.memo, useMemo)
   - Minification & compression

2. Backend Optimization
   - Query optimization (proper indexes)
   - Connection pooling
   - Caching strategies (Redis)
   - Batch operations
   - Async processing for heavy jobs

3. Database Optimization
   - Proper indexing (B-tree indexes)
   - Query analysis (EXPLAIN)
   - Denormalization where appropriate
   - Partitioning for large tables
   - Archive old data

4. Infrastructure Optimization
   - CDN for static assets
   - Load balancing
   - Auto-scaling
   - Monitoring & alerting
```

---

## PHẦN 8: TROUBLESHOOTING & COMMON ISSUES

### 8.1 Recommendation Engine Issues

```
1. Cold Start Problem
   Problem: New users/items have no history
   Solution:
   - Use content-based filtering for new items
   - Use popularity for new users
   - Ask users to rate items on signup

2. Sparsity Problem
   Problem: User-item matrix very sparse
   Solution:
   - Dimensionality reduction (SVD, PCA)
   - Implicit feedback
   - Combine with content-based

3. Slow Recommendation Computation
   Problem: Computing takes too long
   Solution:
   - Pre-compute recommendations (batch jobs)
   - Cache results
   - Reduce dataset size with sampling
   - Use optimized algorithms

4. Poor Recommendation Quality
   Problem: Recommendations not relevant
   Solution:
   - Adjust algorithm weights
   - Change similarity metrics
   - Add more features
   - Collect more training data
```

### 8.2 Data Mining Issues

```
1. Apriori Too Slow
   Problem: Generates too many candidates
   Solution:
   - Increase min_support
   - Use FP-Growth instead
   - Reduce item count (pre-filter)

2. FP-Tree Memory Issues
   Problem: Tree building consumes too much memory
   Solution:
   - Reduce dataset size
   - Increase min_support
   - Use streaming algorithms

3. Rules Not Interesting
   Problem: Generated rules are obvious
   Solution:
   - Increase min_confidence
   - Use interestingness measures (lift)
   - Apply domain knowledge filtering
```

### 8.3 Performance Issues

```
1. Slow API Responses
   Problem: API calls taking too long
   Solution:
   - Add caching (Redis)
   - Optimize database queries
   - Use pagination
   - Add indexes

2. High CPU Usage
   Problem: Server CPU constantly high
   Solution:
   - Profile code
   - Optimize algorithms
   - Use async operations
   - Load balancing

3. High Memory Usage
   Problem: Memory leaks or excessive allocation
   Solution:
   - Find memory leaks (node-inspector)
   - Optimize data structures
   - Implement garbage collection
   - Stream large datasets
```

---

## TỔNG KẾT

Dự án này kết hợp:
- **40%** Xây dựng e-commerce platform (Frontend + Backend)
- **35%** Phân tích dữ liệu lớn (Apriori, FP-Growth)
- **25%** Xây dựng recommendation engine (CF + Content-based)

Sử dụng 17 tuần, 204 tiết để hoàn thành một dự án Capstone toàn diện về Web Development, Database Design, Data Science, và Algorithm Implementation.

---

**Lần cập nhật cuối:** April 25, 2026  
**Tác giả:** Sinh viên Khoa Công Nghệ Thông Tin  
**Trường:** Đại học Bách Khoa Hà Nội
