# PHIẾU GIAO NHIỆM VỤ ĐỒ ÁN TỐT NGHIỆP

**Trường:** Đại học Bách Khoa Hà Nội  
**Khoa:** Công nghệ Thông tin và Truyền thông  
**Năm học:** 2024-2025  
**Học kỳ:** II (Tháng 1 - Tháng 5)

---

## 1. TÊN ĐỀ TÀI

### Tên đề tài (Tiếng Việt):
**Thiết kế và xây dựng nền tảng thương mại điện tử với hệ thống gợi ý sản phẩm thông minh sử dụng kỹ thuật khai phá dữ liệu**

### Tên đề tài (Tiếng Anh):
**Design and Development of E-Commerce Platform with Intelligent Product Recommendation System using Data Mining Techniques**

---

## 2. LĨNH VỰC ĐỀ TÀI VÀ ĐÁNH GIÁ

### 2.1. Đánh giá sự phù hợp với 7 lĩnh vực đề tài

Dự án được đánh giá và sắp xếp theo mức độ phù hợp với 7 lĩnh vực đề tài như sau:

| Thứ tự | Lĩnh vực | Mức độ phù hợp | Điểm số | Giải thích chi tiết |
|--------|---------|----------------|---------|--------------------|
| **1** | **Thương mái điện tử và hậu cần** | **Rất phù hợp** | **100%** | Domain chính của dự án. Xây dựng toàn bộ nền tảng ecommerce hoàn chỉnh: giao diện mua sắm, giỏ hàng, checkout, quản lý đơn hàng, sản phẩm, danh mục, người dùng. Bao gồm các tính năng: quản lý biến thể sản phẩm (size, giá, tồn kho độc lập), tracking trạng thái đơn hàng (realtime updates), hỗ trợ khách hàng realtime (chat, notifications), quản lý inventory. |
| **2** | **Phân tích dữ liệu lớn và ứng dụng** | **Rất phù hợp** | **90%** | Sử dụng kỹ thuật Khai phá dữ liệu (Data Mining): FP-Growth, Apriori Algorithm để phát hiện tập phổ biến (frequent itemsets) và luật kết hợp (association rules) từ lịch sử giao dịch. Xây dựng hệ thống theo dõi hành vi đa chiều (Multi-event Tracking): trọng số cho các tương tác (View, Hover, Add to Cart). Dataset: 5000+ sản phẩm, 1000+ người dùng, 10000+ đơn hàng (~Medium Data). |
| **3** | **Ứng dụng AI khác** | **Phù hợp** | **80%** | Xây dựng Hệ thống Khuyến nghị Lai (Hybrid Recommendation Engine) kết hợp: Content-based Filtering (sử dụng độ đo Jaccard Similarity để so sánh tương đồng vec-tơ thuộc tính sản phẩm), và Luật kết hợp từ Data Mining. Xử lý vấn đề Khởi động lạnh (Item Cold-Start) cho sản phẩm mới. Cơ chế Fallback nhiều tầng đảm bảo kết quả gợi ý không bao giờ rỗng. |
| **4** | **Phần mềm doanh nghiệp** | **Phù hợp** | **75%** | Xây dựng hệ thống phần mềm doanh nghiệp hoàn chỉnh với ba phân hệ: Customer Interface (người mua), Admin Dashboard (quản trị), Support Interface (hỗ trợ). Quản lý: sản phẩm, đơn hàng, người dùng, danh mục, báo cáo doanh số, notifications. |
| **5** | **Trí tuệ nhân tạo ứng dụng** | **Phù hợp** | **70%** | Recommendation Engine có thể xem là ứng dụng AI: tự động học từ dữ liệu lịch sử, đưa ra quyết định cá nhân hóa, cải thiện qua thời gian. Sử dụng các thuật toán thông minh (association rules, similarity scoring) để dự đoán sản phẩm người dùng sẽ quan tâm. |
| **6** | **Tối ưu (Optimization)** | **Phù hợp** | **60%** | Tối ưu hóa nhiều khía cạnh: Database query optimization (indexing, query plans), Frontend rendering optimization (lazy loading, code splitting), Backend performance (caching, connection pooling), Recommendation algorithm optimization (efficient computation), Scalability optimization. |
| **7** | **Công nghệ tài chính (FinTech)** | **Ít phù hợp** | **25%** | Có tính năng thanh toán cơ bản nhưng không phải focus chính của dự án. Checkout process, order payment, nhưng không có payment gateway advanced, cryptocurrency, blockchain, hay các công nghệ FinTech chuyên biệt. |

### 2.2. Ba lĩnh vực phù hợp nhất được chọn

**Dự án này thuộc chủ yếu vào 3 lĩnh vực sau:**

#### **1️⃣ Lĩnh vực 1: THƯƠNG MÁI ĐIỆN TỬ VÀ HẬU CẦN (100% phù hợp)**

**Giải thích chi tiết:**
- **Thương mại điện tử (E-Commerce)**: Dự án xây dựng nền tảng bán hàng trực tuyến hoàn chỉnh với:
  - Giao diện khách hàng: duyệt sản phẩm, tìm kiếm, xem chi tiết, quản lý giỏ hàng, checkout
  - Giao diện quản trị: CRUD sản phẩm, quản lý danh mục, quản lý đơn hàng, quản lý người dùng
  - Xử lý giao dịch: thanh toán, tracking trạng thái, notifications
  
- **Hậu cần (Logistics)**: Dự án bao gồm các tính năng logistics:
  - Tracking đơn hàng realtime: theo dõi trạng thái giao hàng (pending → confirmed → shipped → delivered)
  - Quản lý fulfillment: cập nhật tự động trạng thái từ backend
  - Thông báo tức thời: gửi email/notification khi đơn hàng thay đổi
  - Chat realtime với support staff: hỗ trợ khách hàng tức thời

**Tỷ lệ phân chia công việc:** 45% xây dựng platform, 35% quản trị hệ thống, 20% logistics/support

---

#### **2️⃣ Lĩnh vực 2: PHÂN TÍCH DỮ LIỆU LỚN VÀ ỨNG DỤNG (90% phù hợp)**

**Giải thích chi tiết:**
- **Khai phá dữ liệu (Data Mining)** kết hợp **Theo dõi hành vi đa chiều**:
  - **Apriori Algorithm**: Tìm frequent itemsets và association rules từ lịch sử mua hàng
    - Ví dụ: "Nếu khách hàng mua áo sơ mi, xác suất mua cà vạt là 60%"
    - Metrics: Support, Confidence, Lift (không phải Precision/Recall)
  - **FP-Growth Algorithm**: Phương pháp tối ưu hơn Apriori, xử lý dữ liệu hiệu quả hơn
  - **Association Rules Mining**: Phát hiện mẫu: {Sản phẩm A, B} → {Sản phẩm C}

- **Thu thập & xử lý dữ liệu kinh doanh - Multi-event Tracking System**:
  - Dataset: 5000+ sản phẩm, 1000+ người dùng, 10000+ đơn hàng (~Medium Data, không phải Big Data)
  - Lịch sử tương tác: 100000+ user interaction records
  - Multi-event Tracking: Ghi nhận tương tác đa chiều (Hover >1s, View với Dwell-time, Add to Cart)
  - Weighted Scoring: Tự động phân bổ trọng số cho từng hành vi (Hover=1, View=2-5, Cart=10)
  - Xử lý: data cleaning, preprocessing, backend API tracking, database persistence

- **Ứng dụng thực tiễn**: 
  - Phân tích hành vi khách hàng để tăng AOV (Average Order Value)
  - Phát hiện sản phẩm bán chạy nhất, tổ hợp sản phẩm phổ biến
  - Tối ưu hóa chiến thuật bundle, cross-sell, upsell

**Tỷ lệ phân chia công việc:** 20% data preprocessing, 35% mining algorithms, 45% application & recommendation



### 2.3. Mối liên hệ giữa 3 lĩnh vực

```
┌─────────────────────────────────────────────────────────────┐
│     THƯƠNG MÁI ĐIỆN TỬ & HẬU CẦN (Domain chính)          │
│  Xây dựng nền tảng, quản lý sản phẩm, đơn hàng, người dùng │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
       ┌────────▼────────┐    ┌──────▼─────────┐
       │  PHÂN TÍCH DỮ   │    │  HỌC MÁY       │
       │  LIỆU LỚN       │    │  (ML)          │
       │  - Data Mining  │    │ - Collaborative│
       │  - Apriori      │    │   Filtering    │
       │  - FP-Growth    │    │ - Content-based│
       │  - 10000+ orders│    │ - Hybrid       │
       └────────┬────────┘    └──────┬─────────┘
                │                    │
                └────────┬───────────┘
                         │
                    ┌────▼─────┐
                    │ RECOMMENDATION
                    │ ENGINE
                    └──────────┘
```

---

### 2.4. Các lĩnh vực khác và lý do không chọn

- **Phần mềm doanh nghiệp (75%)**: Dự án có yếu tố này (admin dashboard, business processes) nhưng không phải focus chính
- **Trí tuệ nhân tạo ứng dụng (70%)**: Recommendation engine là ứng dụng AI nhưng quy mô nhỏ hơn lĩnh vực ML cụ thể
- **Tối ưu (60%)**: Có tối ưu hóa nhưng là phụ trong dự án, không phải lĩnh vực chính
- **Công nghệ tài chính (25%)**: Chỉ có payment cơ bản, không phải FinTech chuyên biệt

---

### 2.5. Kết luận về lĩnh vực

Dự án này là một dự án **đa lĩnh vực**, kết hợp:
- **45%** Thương mái điện tử (E-commerce platform building + Logistics)
- **35%** Phân tích dữ liệu kinh doanh (Data mining, FP-Growth, Association Rules)
- **20%** Ứng dụng AI khác (Content-based Recommendation + Hybrid Logic)

Điểm đặc biệt:
- **Tự xây dựng từ cơ bản**: Không phụ thuộc vào AI frameworks đóng gói sẵn (TensorFlow, scikit-learn). Toàn bộ logic từ struct dữ liệu → Jaccard Similarity → Recommendation.
- **Data Mining thực tiễn**: Áp dụng Apriori/FP-Growth trên tập dữ liệu Medium Data (~100K transactions), tìm ra luật kinh doanh có thể hành động.
- **Hybrid Architecture**: Kết hợp 3 approach độc lập (Content + Association + Fallback) để đảm bảo Robustness.

Đây là một dự án **Capstone/Tốt Nghiệp kiểu mẫu** cho ngành Công Nghệ Thông Tin, thể hiện năng lực toàn diện: Web Development, Database Design, Data Science Basics, Algorithm Implementation, System Architecture.

---

## 3. MỤC TIÊU CỦA ĐỒ ÁN TỐT NGHIỆP

### 3.1 Sơ lược - Liên hệ với 3 lĩnh vực chính

Dự án xây dựng **nền tảng thương mại điện tử** (Lĩnh vực 1) với sự hỗ trợ của:
- **Phân tích dữ liệu lớn** (Lĩnh vực 2): Sử dụng Apriori, FP-Growth để khai phá mẫu mua hàng từ 10000+ đơn hàng
- **Học máy** (Lĩnh vực 3): Xây dựng recommendation engine thông minh để cá nhân hóa trải nghiệm khách hàng

### 3.2 Mục tiêu chi tiết

### A. Kiến thức sinh viên thu thập được (Liên hệ 3 lĩnh vực chính):

#### **Từ Lĩnh vực 1 - Thương mái điện tử và hậu cần:**
- **Kiến thức thương mái điện tử**: Quy trình mua sắm online, quản lý sản phẩm/danh mục, xử lý đơn hàng, thanh toán, giao hàng, khách hàng service
- **Kiến thức hậu cần**: Tracking đơn hàng, quản lý tồn kho theo biến thể, warehouse management, logistics optimization
- **Nắm vững kiến trúc ứng dụng web đa tầng** hiện đại bao gồm: Frontend (ReactJS), Backend (Node.js/Express), Realtime Server (Socket.IO), Cơ sở dữ liệu (MySQL 8.0), và Worker xử lý bất đồng bộ (Python).

#### **Từ Lĩnh vực 2 - Phân tích dữ liệu lớn:**
- **Hiểu sâu về các khái niệm và nguyên lý** hoạt động của các thuật toán khai phá dữ liệu:
  - **Apriori Algorithm**: Tìm frequent itemsets, association rules, tính toán support/confidence/lift
  - **FP-Growth Algorithm**: Xây dựng FP-tree, conditional pattern base mining, so sánh hiệu suất với Apriori
- **Kỹ năng xử lý dữ liệu lớn**: Data preprocessing, cleaning, feature engineering, handling datasets với 10000+ records
- **Phân tích hành vi khách hàng**: Segmentation, pattern discovery, market basket analysis

#### **Từ Lĩnh vực 3 - Ứng dụng AI Khác (Hệ thống Khuyến nghị):**
- **Hiểu rõ phân biệt giữa các phương pháp gợi ý**:
  - Content-based Filtering: Tính toán độ tương đồng Jaccard giữa vec-tơ thuộc tính sản phẩm
  - Association Rules: Áp dụng trực tiếp luật kết hợp từ Data Mining (không phải ML dự đoán)
  - ❌ KHÔNG sử dụng: Collaborative Filtering (vì thiếu dữ liệu rating người dùng đủ)
- **Thiết kế Hybrid Architecture**:
  - Kết hợp Content-based (70%) + Association Rules (20%) + Fallback (10%)
  - Xử lý Item Cold-Start: Sản phẩm mới không có lịch sử vẫn được gợi ý qua content
  - Cơ chế Fallback nhiều tầng: Nếu một phương pháp không có kết quả → chuyển sang phương pháp khác
- **Metrics phù hợp**:
  - Support, Confidence, Lift (từ Association Rules)
  - Coverage: Tỷ lệ sản phẩm có thể được gợi ý
  - Diversity: Đa dạng trong tập gợi ý
  - ❌ KHÔNG dùng: Precision, Recall, F1-score (đó là độ đo ML classification, không phải Data Mining)

#### **Tổng hợp - Nắm bắt các nguyên tắc thiết kế hệ thống:**
- SOLID principles, Design Patterns, Software development lifecycle (requirements → design → implementation → testing → deployment)

### B. Công nghệ sinh viên thu thập được (Liên hệ 3 lĩnh vực chính):

#### **Công nghệ Thương mái điện tử & Hậu cần:**
- **Frontend E-commerce**: ReactJS (hooks, state management, component lifecycle), React Router (routing, nested routes), Tailwind CSS (utility-first styling), product galleries, shopping cart, checkout flows
- **Backend E-commerce**: Node.js/Express (middleware, routing, error handling, authentication), RESTful APIs cho products, categories, orders, users, reviews, payments
- **Realtime Features**: WebSocket via Socket.IO (chat, notifications, order tracking, real-time updates)
- **File Handling**: Multer (file upload), Cloudinary (image storage & optimization), file security & validation
- **Communication**: Nodemailer (email notifications), SMS notifications (optional)

#### **Công nghệ Phân tích Dữ liệu Lớn & Data Mining:**
- **Data Processing**: Python libraries (numpy, pandas) cho data manipulation, cleaning, aggregation
- **Data Mining Algorithms**: 
  - Apriori Implementation: itemset generation, pruning strategies, rule generation
  - FP-Growth Implementation: FP-tree construction, pattern mining, recursive mining
- **Database for Analytics**: MySQL queries optimization, indexing strategies cho fast data retrieval, batch processing
- **Big Data Stack**: Redis caching cho miner results, batch job processing, data warehousing concepts
- **Evaluation Tools**: Statistical analysis libraries, algorithm benchmarking tools

#### **Công nghệ Ứng dụng AI - Hệ thống Khuyến nghị:**
- **Thuật toán Content-based Filtering**:
  - Jaccard Similarity: Tính toán độ tương đồng giữa 2 vec-tơ thuộc tính sản phẩm
  - Feature Vectors: Category, Attributes, Price Range, Brand
  - Scoring Function: Combine multiple similarity scores
- **Luật Kết hợp (Association Rules)**:
  - Áp dụng trực tiếp output từ Apriori/FP-Growth
  - Xây dựng Look-up table: Product A → [Product B (confidence: 0.75), Product C (confidence: 0.65)]
  - Weighted scoring: Kết hợp confidence values với user preferences
- **Cơ chế Fallback**:
  - Python: Implement fallback logic trong worker
  - Redis: Cache results từ mỗi method
  - Ranking: Combine multiple scores từ các phương pháp
- **Metrics đánh giá** (Data Mining, không phải ML):
  - Support: Tỷ lệ giao dịch chứa itemset
  - Confidence: Độ tin cậy của rule
  - Lift: Tỷ lệ nâng cao so với baseline
  - Coverage: % sản phẩm có thể gợi ý
  - Diversity: Entropy hoặc Herfindahl index

#### **Database & Cơ sở hạ tầng:**
- **MySQL 8.0**: Schema design cho ecommerce + recommendations, transaction management, advanced indexing
- **Redis**: Caching recommendations, session management, real-time data
- **Connection Pooling**: Efficient database connections, batch operations for mining

### C. Kỹ năng sinh viên phát triển được (Liên hệ 3 lĩnh vực chính):

#### **Kỹ năng Thương mái điện tử:**
- Thiết kế end-to-end user journeys: từ discovery → cart → checkout → order tracking
- Quản lý sản phẩm, danh mục, giá, inventory
- Quản lý đơn hàng, trạng thái, refunds/returns
- Phân tích customer behavior, retention, lifetime value

#### **Kỹ năng Phân tích dữ liệu:**
- **Kỹ năng xử lý, làm sạch và tối ưu** hiệu suất tính toán trên tập dữ liệu lớn:
  - Data preprocessing, validation, transformation
  - Algorithm optimization, performance tuning
  - Handling missing data, outliers, duplicate records
- **Data mining implementation**: Implement từ zero hai thuật toán phổ biến (Apriori, FP-Growth)
- **Pattern discovery**: Tìm frequent itemsets, association rules, interesting patterns
- **Big data handling**: Process 10000+ transactions efficiently, scalable algorithm design

#### **Kỹ năng Ứng dụng AI - Hệ thống Khuyến nghị:**
- **Kỹ năng thiết kế recommendation engine**: So sánh & lựa chọn phương pháp phù hợp (Content-based, Association-based, Hybrid)
- **Kỹ năng tính toán độ tương đồng**: Implement Jaccard Similarity từ cơ bản, xử lý edge cases (empty vectors, sparse data)
- **Kỹ năng áp dụng luật kết hợp**: Xử lý output từ Data Mining, design scoring function, ranking logic
- **Kỹ năng xử lý vấn đề Cold-Start**: Thiết kế fallback strategies để sản phẩm mới vẫn được gợi ý
- **Kỹ năng tối ưu hóa**: Caching strategies (Redis), pre-computing recommendations, batch processing
- **Kỹ năng evaluation (Data Mining level)**: Tính Support/Confidence/Lift, Coverage analysis, Diversity measurement

#### **Kỹ năng lập trình Fullstack:**
- Viết code sạch (clean code), có cấu trúc logic rõ ràng, dễ bảo trì
- Kỹ năng kiểm thử phần mềm (Unit Test, Integration Test, System Test)
- Code organization: modular, reusable, well-documented

#### **Kỹ năng phân tích, thiết kế hệ thống:**
- Mô hình hóa cơ sở dữ liệu quan hệ (ER diagram, normalization, relationship design)
- Thiết kế API RESTful, schema design cho e-commerce + recommendations
- Scalability architecture: horizontal scaling, caching strategies, asynchronous processing

#### **Kỹ năng debug và tối ưu hóa:**
- Giải quyết các vấn đề trong môi trường đa tầng (frontend, backend, database, worker)
- Tối ưu hiệu suất: query optimization, rendering optimization, algorithm optimization
- Performance profiling, bottleneck identification, solution implementation

#### **Kỹ năng quản lý project:**
- Sử dụng version control (Git), commit strategy, branch management
- Quản lý timeline: 17 tuần, 204 tiết, milestone tracking
- Tạo tài liệu kỹ thuật, API documentation, user guides
- Communication với stakeholders, feedback incorporation

### 3.4. Sản phẩm kỳ vọng:

**Một nền tảng Thương mại điện tử hoàn chỉnh, tích hợp hệ thống tracking và trí tuệ nhân tạo, bao gồm 4 khối module chức năng cụ thể:**

#### **Khối 1: Giao diện Thương mái điện tử (Customer Storefront)**
- **Module Trang chủ**: Tích hợp tính năng cuộn vô tận (Infinite Scroll) kết hợp Lazy-loading hình ảnh, hiển thị song song danh mục sản phẩm và danh sách gợi ý cá nhân hóa.
- **Module Mua sắm**: Xem chi tiết sản phẩm với cấu trúc đa biến thể (variants - size, giá, tồn kho độc lập). Tích hợp hiển thị đánh giá (Reviews).
- **Module Giỏ hàng & Thanh toán**: Tự động tính toán tổng tiền, cập nhật trạng thái kho hàng theo biến thể đã chọn và hoàn tất quy trình Checkout.

#### **Khối 2: Hệ thống Tracking đa hành vi (Multi-event Tracking System)**
- **Module Thu thập dữ liệu (Frontend Tracking)**: Bắt các sự kiện ngầm mà không ảnh hưởng hiệu năng: Hover (rê chuột >1 giây), View (tính toán Dwell-time chính xác) và Add-to-Cart. Các sự kiện được gửi đến backend qua API không đồng bộ (Async).
- **Module Tiền xử lý (Backend API)**: Thuật toán tự động phân bổ trọng số điểm (Weight) cho từng hành vi (Hover = 1, View = 2-5 tuỳ dwell_time, Cart = 10) và lưu trữ đồng bộ vào cơ sở dữ liệu MySQL. JWT token được giải mã tự động để liên kết dữ liệu với user_id chính xác.

#### **Khối 3: Hệ thống Khuyến nghị Lai (Hybrid Recommendation Engine)**
- **Module Khai phá dữ liệu (FP-Growth Algorithm)**: Thuật toán tự động phân tích lịch sử giao dịch (10000+ order items) để trích xuất luật kết hợp, phục vụ gợi ý "Sản phẩm thường được mua kèm". Kết quả được lưu trên Redis Cache để tối ưu tốc độ đọc (<100ms).
- **Module Cá nhân hóa (Jaccard Similarity - Code tay)**: Thuật toán tính toán khoảng cách tương đồng giữa vector sở thích của khách hàng (dựa trên hành vi Hover/View/Cart) và vector thuộc tính sản phẩm (category, price range). Công thức: Jaccard = (A ∩ B) / (A ∪ B).
- **Module Dự phòng (Fallback Layer - 3 Tầng)**: Cơ chế tự động điều hướng gợi ý nhằm xử lý triệt để bài toán Khởi động lạnh (Item Cold-start), đảm bảo hệ thống luôn trả về dữ liệu. Tích hợp thuật toán trộn 80/20 (80% cá nhân hóa Jaccard, 20% hàng mới).

#### **Khối 4: Hệ thống Quản trị (Admin Dashboard)**
- **Module Quản lý Vận hành**: Giao diện CRUD (Thêm/Sửa/Xóa) toàn diện cho: Sản phẩm, Biến thể (size, giá, tồn kho độc lập cho mỗi size), Danh mục, Thương hiệu và Người dùng.
- **Module Theo dõi Đơn hàng**: Xem và cập nhật trạng thái các đơn giao dịch.

### E. Vấn đề thực tiễn đồ án giải quyết (Liên hệ 3 lĩnh vực chính):

#### **Từ Lĩnh vực 1 - Thương mái điện tử:**
- **Tối ưu hóa trải nghiệm mua sắm cá nhân hóa** cho người dùng:
  - Giúp khách hàng dễ dàng tiếp cận sản phẩm phù hợp mà không phải tìm kiếm thủ công
  - Tăng conversion rate, giá trị đơn hàng trung bình (AOV), retention rate
  - Giảm bounce rate, tăng session duration, tăng repeat purchases

#### **Từ Lĩnh vực 2 - Phân tích dữ liệu lớn:**
- **Phát hiện mẫu mua hàng**:
  - Tìm frequent itemsets: "Sản phẩm nào thường được mua cùng nhau?"
  - Tìm association rules: "Nếu mua A → có khả năng cao mua B"
  - Tối ưu bố trí kệ, quảng cáo, bundle promotions
  - Tăng cross-sell & upsell opportunities

#### **Từ Lĩnh vực 3 - Ứng dụng AI:**
- **Giải quyết vấn đề Khởi động lạnh cho sản phẩm (Item Cold-Start)**:
  - Vấn đề: Sản phẩm mới (chưa có ai mua) sẽ không xuất hiện trong Association Rules
  - Giải pháp: Dùng Content-based Filtering để gợi ý sản phẩm mới dựa trên nội dung/category
  - Impact: Tất cả sản phẩm mới đều có cơ hội tiếp cận khách hàng, tăng tỷ lệ luân chuyển hàng tồn kho

- **Đảm bảo Robust & Fault-tolerant**:
  - Xây dựng Fallback Strategies nhiều tầng: Nếu phương pháp 1 lỗi → chuyển sang phương pháp 2
  - Đảm bảo gợi ý không bao giờ rỗng, hệ thống luôn trả về kết quả hợp lý
  - Impact: Tăng User Experience, giảm bounce rate

- **Đạt được Personalization ở quy mô vừa**:
  - Áp dụng Content-based để tạo "Hồ sơ ưu tiên" cá nhân cho mỗi user
  - Sử dụng Association Rules để nhận diện mô típ hành vi
  - Impact: Tăng CTR (Click-Through Rate), tăng conversion rate

#### **Tổng hợp - Vấn đề kinh doanh:**
- **Hỗ trợ doanh nghiệp tăng hiệu suất bán hàng**:
  - Tỷ lệ chuyển đổi (conversion rate) từ 2% → 5%+ (impact: +150%)
  - Giá trị đơn hàng trung bình (AOV) từ $50 → $70+ (impact: +40%)
  - Tỷ lệ giữ chân khách hàng (retention rate) từ 30% → 50%+ (impact: +67%)

#### **Vấn đề kỹ thuật:**
- **Giải quyết bài toán xử lý lượng lớn dữ liệu giao dịch và hành vi người dùng**:
  - Xử lý 10000+ transactions hiệu quả, khả năng mở rộng (scalable), dễ bảo trì
  - Thuật toán chạy trong thời gian chấp nhận được (< 5 phút cho 10000 items)
  - Khả năng xử lý realtime updates, caching strategies

- **Xây dựng nền tảng có khả năng mở rộng (scalable)**:
  - Kiến trúc microservices-ready: Frontend, Backend, Worker tách biệt
  - Dễ thêm payment gateway, logistics integration, AI/ML models trong tương lai
  - Database scalability: Sharding, replication strategies
  - API versioning, backward compatibility

---

## 4. KẾ HOẠCH TRIỂN KHAI (17 tuần, 12 tiết/tuần = 204 tiết)

### TỔNG QUAN PHÂN CHIA KHỐI LƯỢNG CÔNG VIỆC

| Giai đoạn | Tuần | Khối lượng công việc | Tỷ lệ |
|-----------|------|-------------------|-------|
| **Nội dung 1: Tổng quan & Hệ thống GPS** | 1-3 | 36 tiết | 17.6% |
| **Nội dung 2: Công nghệ & Phân tích yêu cầu** | 4-6 | 36 tiết | 17.6% |
| **Nội dung 3: Phân tích thiết kế** | 7-10 | 48 tiết | 23.5% |
| **Nội dung 4: Xây dựng chương trình** | 11-14 | 48 tiết | 23.5% |
| **Nội dung 5: Thử nghiệm & Đánh giá** | 15-17 | 36 tiết | 17.6% |
| **TỔNG CỘNG** | **1-17** | **204 tiết** | **100%** |

---

### NƯỚC DÙNG 1: TỔNG QUAN HỆ THỐNG & PHÂN TÍCH KIẾN TRÚC (Tuần 1-3, 36 tiết)

#### Mục tiêu nội dung:
Hiểu rõ bản chất dự án, phân tích kiến trúc hệ thống theo 3 lĩnh vực chính, nghiên cứu các hệ thống thương mại điện tử hiện tại, và chuẩn bị môi trường phát triển.

#### **Tuần 1: Tìm hiểu bổng lốc & lên kế hoạch chi tiết**

**Công việc:**
1. **Đọc và phân tích tài liệu ĐATN** (6 tiết)
   - Đọc kỹ yêu cầu, mục tiêu, và timeline của dự án
   - Xác định deliverables chính cho mỗi tuần
   - Lập danh sách các rủi ro tiềm tàng

2. **Nghiên cứu các hệ thống tương tự** (6 tiết)
   - Phân tích Shopee, Lazada, Tiki: kiến trúc, tính năng chính, UX/UI
   - Phân tích Amazon, eBay: recommendation system, personalization
   - Tổng hợp best practices cho thiết kế ecommerce

3. **Lên kế hoạch chi tiết cho 17 tuần** (6 tiết)
   - Chi tiết hóa các công việc cho từng tuần
   - Xác định milestones và deliverables
   - Chuẩn bị checklist kiểm tra cho mỗi giai đoạn

4. **Lập slide thuyết trình & báo cáo tuần 1** (6 tiết)
   - Thuyết trình tổng quan dự án cho giảng viên
   - Nhận feedback và điều chỉnh kế hoạch
   - Ghi chép các hướng dẫn từ giảng viên

5. **Chuẩn bị môi trường làm việc ban đầu** (6 tiết)
   - Tạo folder dự án, Git repository
   - Cài đặt các công cụ cơ bản (VS Code, Git, Node.js, MySQL, Python)
   - Tạo README.md sơ bộ để mô tả dự án

6. **Tìm kiếm & tổng hợp tài liệu tham khảo** (6 tiết)
   - Tìm kiếm papers về recommendation systems, data mining
   - Tìm tutorials về React, Express.js, MySQL
   - Lưu trữ tài liệu trong folder references

---

#### **Tuần 2: Phân tích Kiến trúc & Lĩnh vực**

**Công việc:**
1. **Phân tích 3 Lĩnh vực: E-Commerce (storefront, admin, variant management), Data Mining (Tracking, Apriori, FP-Growth), AI (Jaccard, Association Rules, Fallback)** (6 tiết)
   - Kiến trúc Lĩnh vực 1 (E-Commerce): Frontend storefront, Admin dashboard, variant management system, order tracking
   - Kiến trúc Lĩnh vực 2 (Data Mining): Multi-event tracking capture, FP-Growth algorithm, Association rules mining
   - Kiến trúc Lĩnh vực 3 (AI): Jaccard similarity scoring, fallback strategies, hybrid recommendation logic
   - Tích hợp giữa 3 lĩnh vực

2. **Nghiên cứu Multi-event Tracking: Hover >1s, View Dwell-time, Add-to-Cart, Weighted Scoring** (6 tiết)
   - Frontend event capture: Hover detection (>1s), View dwell-time calculation, Add-to-Cart triggers
   - Weight assignment algorithm: Hover=1, View=2-5 (based on dwell-time), Cart=10
   - Backend API design: Async event submission, JWT authentication, database persistence
   - Data validation & error handling

3. **Phân tích Recommendation Engine: Jaccard Similarity formula, FP-Growth algorithm, 3-layer Fallback** (6 tiết)
   - Jaccard Similarity: (A ∩ B) / (A ∪ B) formula, vector similarity calculation
   - FP-Growth algorithm: FP-tree construction, pattern mining, rule extraction
   - 3-layer fallback: Content-based → Association rules → Best sellers
   - Scoring & ranking logic

4. **Tạo tài liệu kiến trúc: System diagram, data flow, database schema, module breakdown** (6 tiết)
   - 3-tier architecture diagram: Frontend, Backend, Database, Worker
   - Data flow diagram: User interaction → Tracking → Storage → Mining → Recommendations
   - Database schema: Tables, relationships, indexing
   - Module breakdown: Components, services, controllers, models

5. **So sánh hệ thống tương tự: Shopee, Lazada, Amazon benchmark** (6 tiết)
   - Phân tích kiến trúc Shopee, Lazada: Recommendation system, tracking, personalization
   - Phân tích Amazon: Scale, algorithms, performance optimizations
   - Best practices extraction
   - Benchmarking metrics: Latency, coverage, diversity

6. **Báo cáo: Tổng hợp findings, slide, feedback** (6 tiết)
   - Tổng hợp kiến trúc analysis
   - Chuẩn bị slide thuyết trình (10-15 slides)
   - Nhận feedback từ giảng viên
   - Điều chỉnh kế hoạch dựa trên feedback

---

#### **Tuần 3: Phân tích chi tiết yêu cầu & kiến trúc sơ bộ**

**Công việc:**
1. **Phân tích chi tiết các yêu cầu chức năng** (6 tiết)
   - Xác định các user stories: customer, admin, support staff
   - Liệt kê chi tiết tất cả các tính năng
   - Viết acceptance criteria cho mỗi tính năng
   - Ưu tiên các tính năng theo MoSCoW (Must have, Should have, Could have, Won't have)

2. **Phân tích các yêu cầu phi chức năng** (6 tiết)
   - Performance: response time, load handling (concurrent users)
   - Security: data encryption, authentication, authorization
   - Scalability: cần hỗ trợ bao nhiêu users, products, orders?
   - Reliability: uptime, backup strategy
   - Usability: UI/UX requirements

3. **Vẽ kiến trúc sơ bộ của hệ thống** (6 tiết)
   - Vẽ high-level architecture diagram (Client-Server-Database)
   - Vẽ component diagram cho Frontend (pages, components, services)
   - Vẽ architecture cho Backend (controllers, models, routes, middleware)
   - Vẽ architecture cho Worker (data processing, recommendation engine)

4. **Thiết kế sơ bộ database schema** (6 tiết)
   - Xác định các entity chính: Users, Products, Categories, Orders, etc.
   - Xác định relationships (1-to-many, many-to-many)
   - Vẽ ER diagram
   - Liệt kê các bảng và cột chính

5. **Lập roadmap chi tiết công nghệ** (6 tiết)
   - Confirm frontend stack: React 19, Tailwind CSS, React Router, Socket.IO, Axios, JWT
   - Confirm backend stack: Node.js, Express, MySQL, JWT, Multer, Nodemailer, Cloudinary
   - Confirm worker stack: Python, PyMySQL, Redis, Data Mining libraries
   - Lập danh sách packages cần cài cho mỗi tier

6. **Chuẩn bị cho tuần 4** (6 tiết)
   - Tổng hợp toàn bộ tài liệu phân tích
   - Tạo slide thuyết trình cho giảng viên
   - Nhận feedback từ giảng viên
   - Chuẩn bị môi trường để bắt đầu coding

---

### NỘI DUNG 2: CÔNG NGHỆ VÀ PHÂN TÍCH THIẾT KẾ CƠ SỞ DỮ LIỆU (Tuần 4-6, 36 tiết)

#### Mục tiêu nội dung:
Thiết lập môi trường phát triển, hiểu sâu về các công nghệ sử dụng, thiết kế database toàn diện, và chuẩn bị cơ sở hạ tầng dữ liệu.

#### **Tuần 4: Cấu hình môi trường & Nghiên cứu công nghệ Frontend**

**Công việc:**
1. **Cài đặt và cấu hình các công cụ phát triển** (6 tiết)
   - Cài đặt Node.js, npm/yarn
   - Cài đặt MySQL 8.0, MySQL Workbench
   - Cài đặt Python, pip, virtual environment
   - Cài đặt Git, tạo repository, cấu hình .gitignore

2. **Khởi tạo project React** (6 tiết)
   - Tạo React project với Vite hoặc CRA
   - Cài đặt dependencies: React Router, Tailwind CSS, Axios, Socket.IO client, JWT decode
   - Tạo folder structure: pages, components, services, contexts, layouts
   - Cấu hình Tailwind CSS

3. **Tìm hiểu React 19 & React Router 7 sâu** (6 tiết)
   - Học React Hooks: useState, useEffect, useContext, useCallback, useMemo
   - Tìm hiểu React Router: routing, parameters, nested routes, redirects
   - Tìm hiểu component composition, reusable components
   - Tìm hiểu state management approaches (Context API vs Redux vs Zustand)

4. **Tìm hiểu Socket.IO client & Tailwind CSS** (6 tiết)
   - Học cách setup Socket.IO client
   - Tìm hiểu event-based communication, namespaces, rooms
   - Tìm hiểu Tailwind CSS utility-first approach
   - Tạo reusable Tailwind components (buttons, cards, forms, etc.)

5. **Tạo UI mockup & component library** (6 tiết)
   - Thiết kế UI mockup cho các trang chính (Home, Product List, Product Detail, Cart, Checkout)
   - Tạo component library: Header, Footer, ProductCard, Button, Form, Modal
   - Tạo CSS utilities và Tailwind configurations cho consistent styling
   - Tạo theme colors và spacing system

6. **Tài liệu hóa cấu trúc Frontend** (6 tiết)
   - Viết documentation cho folder structure
   - Tạo guide cho component usage
   - Tạo guide cho routing và state management
   - Lập checklist cho Frontend development

---

#### **Tuần 5: Cấu hình Backend & Thiết kế Database**

**Công việc:**
1. **Khởi tạo project Node.js/Express** (6 tiết)
   - Tạo project structure: config, routes, controllers, models, middleware
   - Cài đặt dependencies: express, mysql2, dotenv, bcrypt, jsonwebtoken, multer, nodemailer
   - Cấu hình .env cho database, JWT secret, email settings
   - Tạo basic server setup với middleware cơ bản

2. **Thiết kế toàn diện Database Schema** (6 tiết)
   - Xác định tất cả các bảng: users, products, categories, orders, order_items, reviews, addresses, carts, cart_items, browsing_history, notifications
   - Thiết kế bảng recommendations để lưu suggestion results
   - Xác định primary keys, foreign keys, indexes
   - Vẽ ER diagram chi tiết

3. **Viết SQL scripts để tạo database** (6 tiết)
   - Viết DDL (CREATE TABLE) cho tất cả bảng
   - Viết constraints (CHECK, UNIQUE, NOT NULL)
   - Viết indexes cho columns hay search (product_name, category, user_id)
   - Tạo stored procedures/functions nếu cần (e.g., calculate total price)

4. **Tạo seed data cho testing** (6 tiết)
   - Viết SQL INSERT scripts để tạo test data
   - Tạo 5000+ products với descriptions, prices, images
   - Tạo 1000+ users với emails, passwords, addresses
   - Tạo 10000+ orders với order items, status, timestamps
   - Tạo browsing history data cho recommendation testing

5. **Tìm hiểu MySQL 8.0 advanced features** (6 tiết)
   - Tìm hiểu transactions, ACID properties
   - Tìm hiểu indexes: B-tree, hash indexes, composite indexes
   - Tìm hiểu query optimization: EXPLAIN, execution plans
   - Tìm hiểu MySQL user management, permissions, security

6. **Tạo database scripts tự động hóa** (6 tiết)
   - Viết Node.js script để auto-create database từ SQL files
   - Viết migration scripts để update schema khi có thay đổi
   - Tạo backup/restore scripts
   - Tạo documentation cho database setup

---

#### **Tuần 6: Thiết kế Architecture Backend & API Endpoints**

**Công việc:**
1. **Thiết kế RESTful API chi tiết** (6 tiết)
   - Xác định tất cả endpoints: Users, Products, Categories, Orders, Reviews, Cart, Recommendations
   - Xác định HTTP methods (GET, POST, PUT, DELETE) cho mỗi endpoint
   - Thiết kế request/response formats (JSON schema)
   - Tạo OpenAPI/Swagger documentation

2. **Thiết kế Authentication & Authorization** (6 tiết)
   - Thiết kế JWT-based authentication flow
   - Xác định JWT payload, expiry times, refresh token mechanism
   - Thiết kế role-based access control (RBAC): Customer, Admin, Support
   - Thiết kế password hashing strategy (bcrypt)

3. **Thiết kế Error Handling & Validation** (6 tiết)
   - Xác định error codes và HTTP status codes
   - Thiết kế input validation (email, password strength, numeric ranges)
   - Thiết kế error response format
   - Thiết kế logging strategy (info, warning, error levels)

4. **Thiết kế caching strategy** (6 tiết)
   - Xác định dữ liệu nào nên cache (products, categories, user profiles)
   - Xác định caching mechanism: in-memory, Redis
   - Thiết kế cache invalidation strategy
   - Tính toán expected cache sizes

5. **Thiết kế file upload & image handling** (6 tiết)
   - Thiết kế file upload flow qua Multer
   - Thiết kế image optimization và resizing
   - Thiết kế Cloudinary integration
   - Xác định file types, size limits, security measures

6. **Thiết kế Socket.IO real-time features** (6 tiết)
   - Thiết kế chat system architecture
   - Thiết kế notification system
   - Thiết kế real-time order status updates
   - Thiết kế connection management, reconnection logic

---

### NỘI DUNG 3: PHÂN TÍCH & THIẾT KẾ CHI TIẾT (Tuần 7-10, 48 tiết)

#### Mục tiêu nội dung:
Xây dựng các thành phần frontend, thiết kế recommendation engine, và chuẩn bị data mining algorithms.

#### **Tuần 7-8: Xây dựng Frontend - Phần 1 (Layout & Pages cơ bản)**

**Công việc:**
1. **Tạo Layout chính cho ứng dụng** (6 tiết)
   - Tạo Header component: logo, search bar, user menu, cart icon
   - Tạo Navigation/Sidebar component
   - Tạo Footer component: links, contact info
   - Tạo responsive layout cho mobile/tablet/desktop

2. **Xây dựng Home page** (6 tiết)
   - Tạo hero section với banner
   - Tạo featured products section
   - Tạo categories section
   - Tạo promotions/deals section
   - Integrate API calls để lấy dữ liệu

3. **Xây dựng Product List page** (6 tiết)
   - Tạo product grid/list view
   - Tạo filter sidebar: category, price range, ratings
   - Tạo sorting options: price, popularity, newest
   - Implement pagination
   - Integrate with search API

4. **Xây dựng Product Detail page** (6 tiết)
   - Tạo image gallery cho sản phẩm
   - Tạo product info section: name, price, description, specs
   - Tạo rating & review section
   - Tạo "Add to Cart" button
   - Tạo recommendation widget dưới cùng

5. **Xây dựng Cart page** (6 tiết)
   - Tạo cart item list dengan options: modify quantity, remove
   - Tạo order summary section
   - Tạo checkout button
   - Implement local storage caching

6. **Xây dựng User authentication pages** (6 tiết)
   - Tạo Login page
   - Tạo Register/Signup page
   - Tạo password reset page
   - Implement form validation
   - Integrate with Auth API

---

#### **Tuần 9: Xây dựng Frontend - Phần 2 (Order & Chat)**

**Công việc:**
1. **Xây dựng Checkout & Order page** (6 tiết)
   - Tạo shipping address selection/entry form
   - Tạo payment method selection
   - Tạo order review before confirmation
   - Implement order submission

2. **Xây dựng Order Tracking page** (6 tiết)
   - Tạo list of past orders
   - Tạo order detail page với timeline
   - Tạo order status tracking
   - Integrate real-time updates via Socket.IO

3. **Xây dựng User Profile page** (6 tiết)
   - Tạo profile info form
   - Tạo address management
   - Tạo wishlist section
   - Tạo notification preferences

4. **Xây dựng Chat interface** (6 tiết)
   - Tạo chat window/component
   - Tạo message list
   - Tạo message input form
   - Integrate Socket.IO cho real-time messaging

5. **Xây dựng Admin Dashboard - Phần 1** (6 tiết)
   - Tạo Admin layout
   - Tạo product management page (list, add, edit, delete)
   - Tạo category management
   - Implement CRUD operations

6. **Tối ưu & Testing Frontend** (6 tiết)
   - Optimize component rendering (React.memo, useMemo)
   - Implement lazy loading cho images
   - Implement code splitting cho routes
   - Test responsive design trên multiple devices

---

#### **Tuần 10: Backend API Implementation - Phần 1**

**Công việc:**
1. **Implement Authentication APIs** (6 tiết)
   - Implement POST /auth/register
   - Implement POST /auth/login
   - Implement POST /auth/refresh-token
   - Implement POST /auth/logout
   - Implement password reset flow

2. **Implement User APIs** (6 tiết)
   - Implement GET /users/:id (get user profile)
   - Implement PUT /users/:id (update user info)
   - Implement GET /users/:id/addresses (get addresses)
   - Implement POST/PUT/DELETE address APIs
   - Implement middleware để verify JWT

3. **Implement Product APIs** (6 tiết)
   - Implement GET /products (list with pagination, filter, sort)
   - Implement GET /products/:id (get product detail)
   - Implement GET /categories (list categories)
   - Implement search API
   - Implement product image upload API

4. **Implement Cart APIs** (6 tiết)
   - Implement GET /carts/:userId
   - Implement POST /carts/:userId/items (add to cart)
   - Implement PUT /carts/:userId/items/:itemId (update quantity)
   - Implement DELETE /carts/:userId/items/:itemId (remove from cart)
   - Implement cart total calculation

5. **Implement Order APIs - Phần 1** (6 tiết)
   - Implement POST /orders (create order)
   - Implement GET /orders/:userId (get user's orders)
   - Implement GET /orders/:orderId (get order detail)
   - Implement PUT /orders/:orderId/status (update order status)

6. **Error Handling & Validation Middleware** (6 tiết)
   - Implement input validation middleware
   - Implement error handling middleware
   - Implement authentication middleware
   - Implement logging middleware

---

### NỘI DUNG 4: XÂY DỰNG CHƯƠNG TRÌNH (Tuần 11-14, 48 tiết)

#### **Tuần 11: Backend API Implementation - Phần 2 & Recommendation Engine**

**Công việc:**
1. **Implement Review & Rating APIs** (6 tiết)
   - Implement POST /products/:id/reviews (create review)
   - Implement GET /products/:id/reviews (get reviews)
   - Implement PUT /reviews/:reviewId (update review)
   - Implement DELETE /reviews/:reviewId (delete review)
   - Implement rating calculation

2. **Implement Browsing History API** (6 tiết)
   - Implement POST /browsing-history (track product views)
   - Implement GET /browsing-history/:userId (get user's browsing history)
   - Implement DELETE /browsing-history/:userId (clear history)
   - Design efficient storage/caching strategy

3. **Implement Recommendation Engine - API Layer** (6 tiết)
   - Implement GET /recommendations/:userId (get recommendations)
   - Implement GET /recommendations/trending (get trending products)
   - Implement GET /recommendations/similar/:productId (get similar products)
   - Design recommendation data retrieval

4. **Implement Chat APIs với Socket.IO** (6 tiết)
   - Implement Socket.IO server setup
   - Implement chat room creation
   - Implement message storage in database
   - Implement online/offline status
   - Implement notification to customers

5. **Implement Admin Order Management APIs** (6 tiết)
   - Implement GET /admin/orders (list all orders)
   - Implement PUT /admin/orders/:orderId/status (update status)
   - Implement GET /admin/orders/stats (order statistics)
   - Implement email notification on order updates

6. **Implement File Upload with Cloudinary** (6 tiết)
   - Integrate Cloudinary SDK
   - Implement image upload/delete APIs
   - Implement image URL response
   - Implement image optimization settings

---

#### **Tuần 12: Python Worker & Data Mining Implementation**

**Công việc:**
1. **Setup Python Environment & Database Connection** (6 tiết)
   - Setup Python virtual environment
   - Install PyMySQL, Redis, numpy, pandas
   - Create connection pool to MySQL
   - Create Redis client
   - Implement error handling & logging

2. **Implement Apriori Algorithm** (6 tiết)
   - Implement frequent itemset generation
   - Implement association rule mining
   - Implement support, confidence, lift calculation
   - Implement min_support, min_confidence thresholds
   - Test với sample data

3. **Implement FP-Growth Algorithm** (6 tiết)
   - Implement FP-tree construction
   - Implement conditional pattern base mining
   - Implement rule generation
   - Compare performance với Apriori
   - Optimize để handle large datasets

4. **Implement Recommendation Engine Logic** (6 tiết)
   - Parse purchase history from database
   - Parse browsing history
   - Calculate user similarity (collaborative filtering)
   - Implement content-based recommendations
   - Combine recommendations from multiple sources

5. **Implement Scheduled Jobs for Recommendations** (6 tiết)
   - Setup APScheduler hoặc cron jobs
   - Schedule daily/weekly recommendation calculation
   - Schedule data mining jobs (Apriori, FP-Growth)
   - Cache results in Redis
   - Implement failure handling & retries

6. **Implement Email Notifications & Data Export** (6 tiết)
   - Implement email sending (Nodemailer từ Node hoặc SMTP từ Python)
   - Implement weekly recommendation emails
   - Implement order status notification emails
   - Implement data export (CSV reports)

---

#### **Tuần 13: Frontend Integration & Admin Dashboard**

**Công việc:**
1. **Integrate APIs vào Frontend** (6 tiết)
   - Update API calls để match actual endpoints
   - Implement loading states & error handling
   - Implement proper authentication headers
   - Test API integration end-to-end

2. **Build Admin Dashboard - Products Management** (6 tiết)
   - Tạo product list dengan pagination
   - Implement add/edit/delete product form
   - Implement bulk actions
   - Implement image upload
   - Implement product status management

3. **Build Admin Dashboard - Orders Management** (6 tiết)
   - Tạo orders list với filters (status, date range, customer)
   - Implement order detail view
   - Implement status update
   - Implement order notes/timeline
   - Implement refund/cancellation

4. **Build Admin Dashboard - Users Management** (6 tiết)
   - Tạo users list
   - Implement user detail view
   - Implement user status (active, banned)
   - Implement email to users
   - Implement user activity logs

5. **Build Admin Dashboard - Analytics** (6 tiết)
   - Create dashboard with key metrics: total sales, orders, users, revenue
   - Create charts: sales over time, top products, top categories
   - Create customer analytics: retention, CLV
   - Create inventory analytics

6. **Integrate Real-time Features** (6 tiết)
   - Integrate Socket.IO chat in customer interface
   - Implement real-time order status updates
   - Implement push notifications
   - Test realtime features

---

#### **Tuần 14: Testing & Bug Fixing**

**Công việc:**
1. **Unit Testing - Frontend** (6 tiết)
   - Write tests cho components (render, props, events)
   - Write tests cho utility functions
   - Setup Jest + React Testing Library
   - Achieve >70% code coverage

2. **Unit Testing - Backend** (6 tiết)
   - Write tests cho controllers
   - Write tests cho models/database queries
   - Write tests cho authentication
   - Setup Jest hoặc Mocha + Chai
   - Achieve >70% code coverage

3. **Integration Testing** (6 tiết)
   - Test API endpoints end-to-end
   - Test database interactions
   - Test authentication flow
   - Test Socket.IO functionality
   - Test payment/checkout flow (mock)

4. **System Testing & Bug Fixing** (6 tiết)
   - Test tất cả user journeys: browse, cart, checkout, order
   - Test admin workflows
   - Test recommendation engine accuracy
   - Identify & log bugs
   - Fix critical bugs

5. **Performance Testing** (6 tiết)
   - Load testing: test với 100, 1000, 10000 concurrent users
   - Database query optimization
   - Frontend rendering optimization
   - API response time testing
   - Identify bottlenecks

6. **Security Testing** (6 tiết)
   - Test SQL injection vulnerabilities
   - Test XSS vulnerabilities
   - Test CSRF protection
   - Test authentication bypass
   - Review security configurations

---

### NỘI DUNG 5: THỬ NGHIỆM & ĐÁNH GIÁ (Tuần 15-17, 36 tiết)

#### **Tuần 15: Kiểm thử Toàn Diện & Tối ưu Hóa**

**Công việc:**
1. **Kiểm thử Chức Năng Toàn Diện** (6 tiết)
   - Test tất cả features theo acceptance criteria
   - Test edge cases (empty data, invalid input, boundary values)
   - Test error scenarios (network errors, server errors)
   - Create test report với test cases và results

2. **Kiểm thử Usability & UX** (6 tiết)
   - Test user interface intuitiveness
   - Test mobile responsiveness
   - Test browser compatibility (Chrome, Firefox, Safari, Edge)
   - Collect feedback từ sample users (nếu có)

3. **Kiểm thử Recommendation Engine** (6 tiết)
   - Validate Apriori results với manual calculation
   - Validate FP-Growth results
   - Evaluate recommendation accuracy: precision, recall, F1-score
   - Test recommendation diversity & serendipity
   - Compare results giữa different algorithms

4. **Tối ưu Hóa Performance** (6 tiết)
   - Database query optimization (add indexes, rewrite queries)
   - Frontend optimization (bundle size, image optimization)
   - Backend optimization (caching, query batching)
   - Implement database connection pooling
   - Optimize recommendation computation

5. **Tối ưu Hóa Security** (6 tiết)
   - Implement HTTPS/TLS
   - Add rate limiting
   - Implement CORS properly
   - Add input sanitization
   - Review & secure environment variables

6. **Documentation & Deployment Preparation** (6 tiết)
   - Create API documentation (Swagger/OpenAPI)
   - Create user guide for customers & admins
   - Create installation & setup guide
   - Create troubleshooting guide
   - Prepare deployment checklist

---

#### **Tuần 16: Triển Khai & Làm Sạch Code**

**Công việc:**
1. **Code Refactoring & Cleanup** (6 tiết)
   - Remove unused code & imports
   - Improve code readability & maintainability
   - Standardize naming conventions
   - Add JSDoc/comments cho complex logic
   - Fix linting warnings

2. **Database Finalization** (6 tiết)
   - Verify all indexes are in place
   - Create backup procedures
   - Test restore from backup
   - Clean up test data
   - Optimize table structures

3. **Environment Setup for Deployment** (6 tiết)
   - Setup production environment variables
   - Configure logging & monitoring
   - Setup error tracking (Sentry, etc.)
   - Configure email services
   - Test file upload paths & permissions

4. **Frontend Build & Optimization** (6 tiết)
   - Create optimized production build
   - Test production build
   - Verify all assets load correctly
   - Test performance metrics (Lighthouse)
   - Setup CDN (if needed)

5. **Backend Deployment** (6 tiết)
   - Setup server environment
   - Configure SSL/TLS certificates
   - Setup reverse proxy (nginx)
   - Configure process management (PM2)
   - Setup auto-restart & monitoring

6. **Worker & Scheduled Jobs Setup** (6 tiết)
   - Configure Python worker
   - Setup job scheduling
   - Configure logging & monitoring
   - Test recommendation generation
   - Setup alerts for job failures

---

#### **Tuần 17: Presentation & Final Documentation**

**Công việc:**
1. **Create Comprehensive Documentation** (6 tiết)
   - Write technical architecture document
   - Write database schema documentation
   - Write API endpoints documentation
   - Write algorithm documentation (Apriori, FP-Growth)
   - Write deployment guide

2. **Prepare Presentation Materials** (6 tiết)
   - Create slides covering project overview
   - Create slides for architecture & design
   - Create slides for technologies used
   - Create slides for results & achievements
   - Create demo video (optional)

3. **Final Testing & Quality Assurance** (6 tiết)
   - Run full regression test suite
   - Verify all deliverables are complete
   - Check code quality metrics
   - Verify documentation completeness
   - Create final bug list & resolutions

4. **Present to Advisor** (4 tiết)
   - Presentation slides
   - Live demo
   - Q&A session
   - Receive feedback

5. **Final Code Review & Submission** (8 tiết)
   - Final code cleanup
   - Create final Git commits
   - Prepare all deliverables
   - Create final documentation package
   - Submit to department

6. **Reflection & Future Improvements** (8 tiết)
   - Reflect on project achievements
   - Document lessons learned
   - List future improvements & enhancements
   - Suggest scaling strategies
   - Document technical debt

---

## 5. TIÊU CHÍ ĐÁNH GIÁ VÀ DELIVERABLES

### Deliverables cho mỗi Nội dung:

**Nội dung 1 (Tuần 1-3):**
- ✓ Project plan & detailed timeline
- ✓ Requirements document (functional & non-functional)
- ✓ High-level architecture diagram
- ✓ GPS/Geolocation research document
- ✓ Technology stack finalization

**Nội dung 2 (Tuần 4-6):**
- ✓ Development environment setup
- ✓ Frontend project initialized with component library
- ✓ Backend project initialized with API structure
- ✓ Database schema & ER diagram
- ✓ Seed data & SQL scripts
- ✓ API endpoint documentation

**Nội dung 3 (Tuần 7-10):**
- ✓ Frontend pages 80% implemented
- ✓ Backend APIs 80% implemented
- ✓ Chat/realtime features foundation
- ✓ Admin dashboard skeleton

**Nội dung 4 (Tuần 11-14):**
- ✓ All features 100% implemented
- ✓ Data mining algorithms (Apriori, FP-Growth) working
- ✓ Recommendation engine fully functional
- ✓ Testing reports (unit, integration, system)
- ✓ Performance metrics documented

**Nội dung 5 (Tuần 15-17):**
- ✓ All tests passing
- ✓ No critical/high severity bugs
- ✓ Code coverage >70%
- ✓ Performance metrics meet targets
- ✓ Security review completed
- ✓ Complete documentation
- ✓ Live deployment
- ✓ Final presentation & demo

### Tiêu chí đánh giá:

| Tiêu chí | Tỷ lệ | Mô tả |
|---------|-------|-------|
| **Functionality** | 30% | Tất cả features hoạt động đúng theo requirements |
| **Code Quality** | 20% | Clean code, well-structured, maintainable |
| **Testing** | 15% | Unit tests, integration tests, test coverage |
| **Documentation** | 15% | API docs, technical docs, user guides |
| **Performance** | 10% | Response time, load handling, optimization |
| **Security** | 10% | Authentication, data protection, vulnerabilities |

---

## 6. TÀI LIỆU THAM KHẢO

### Frontend Technologies:
- React Documentation: https://react.dev
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
- Socket.IO Client: https://socket.io/docs/v4/client-api/
- Axios: https://axios-http.com

### Backend Technologies:
- Express.js: https://expressjs.com
- MySQL 8.0: https://dev.mysql.com/doc/
- Socket.IO Server: https://socket.io/docs/v4/server-api/
- JWT: https://jwt.io
- Nodemailer: https://nodemailer.com

### Data Mining & Recommendation:
- Apriori Algorithm: "Mining Frequent Patterns without Candidate Generation" - Han et al.
- FP-Growth: "FP-growth: A new frequent pattern-mining algorithm" - Han et al.
- Collaborative Filtering: https://en.wikipedia.org/wiki/Collaborative_filtering
- Content-based Filtering: https://en.wikipedia.org/wiki/Recommender_system#Content-based_filtering

### Project Management:
- Git & GitHub: https://git-scm.com/doc
- Agile Development: https://agilemanifesto.org

---

## 7. GHI CHÚ & ĐỀ XUẤT

- **Liên hệ định kỳ** với giảng viên hướng dẫn mỗi tuần để nhận feedback
- **Commit code thường xuyên** lên Git repository với meaningful commit messages
- **Viết documentation song song** với coding để tránh bỏ lại ở cuối
- **Test sớm, test thường xuyên** để phát hiện bugs sớm
- **Plan risk mitigation** cho các công nghệ mới hoặc unknown unknowns
- **Keep backup** của database và code
- **Communicate challenges** với giảng viên sớm nếu gặp vấn đề

---

**Ngày lập:** 2025-01-15  
**Sinh viên:** [Tên sinh viên]  
**Giảng viên hướng dẫn:** [Tên giảng viên]  
**Phòng ban:** Khoa Công nghệ Thông tin và Truyền thông
