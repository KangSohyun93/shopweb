"""
Gói thuật toán Apriori và các biến thể cải tiến.
Tài liệu hóa ý nghĩa và tham số của từng thuật toán phục vụ Đồ án tốt nghiệp:

1. base_apriori (Apriori Cơ bản):
   - Ý nghĩa: Thuật toán cổ điển duyệt theo chiều rộng (BFS).
   - Tham số:
     * min_support_count (int): Số lần xuất hiện chung tối thiểu của nhóm sản phẩm.

2. dic_apriori (Dynamic Itemset Counting - DIC):
   - Ý nghĩa: Chia nhỏ cơ sở dữ liệu và sinh ứng viên động giữa chu kỳ quét nhằm giảm số lần quét dữ liệu gốc.
   - Tham số:
     * min_support_count (int): Ngưỡng support tối thiểu toàn cục.
     * block_size (int): Kích thước của mỗi khối giao dịch (mặc định 200).

3. hash_apriori (Hash-Based Apriori / DHP):
   - Ý nghĩa: Băm các cặp sản phẩm vào bảng băm ở vòng 1 để cắt tỉa sớm các ứng viên 2 phần tử rác.
   - Tham số:
     * min_support (int): Số lần xuất hiện tối thiểu.
     * bucket_size (int): Độ lớn bảng băm (mặc định 100,000) để giảm xung đột băm.

4. partition_apriori (Partition-Based Apriori):
   - Ý nghĩa: Chia cơ sở dữ liệu thành N phần nhỏ vừa bộ nhớ RAM để tìm tập phổ biến cục bộ trước khi gộp toàn cục.
   - Tham số:
     * min_support_count (int): Ngưỡng support tối thiểu.
     * num_partitions (int): Số phân hoạch dữ liệu (mặc định 2).

5. sampling_apriori (Sampling-Based Apriori):
   - Ý nghĩa: Lấy mẫu ngẫu nhiên dữ liệu, chạy Apriori trên mẫu với ngưỡng support hạ nhẹ để gom ứng viên, sau đó quét dữ liệu gốc 1 lần để xác thực.
   - Tham số:
     * min_support_count (int): Ngưỡng support tối thiểu.
     * sample_ratio (float): Tỉ lệ lấy mẫu (mặc định 0.2 = 20% dữ liệu).

6. transaction_reduction (Rút gọn giao dịch):
   - Ý nghĩa: Loại bỏ các hóa đơn không chứa tập phổ biến nào ở bước lặp k trước khi chuyển sang bước k+1 để thu hẹp dữ liệu quét.
   - Tham số:
     * min_support (int): Ngưỡng support tối thiểu.
"""

from . import base_apriori
from . import dic_apriori
from . import hash_apriori
from . import partition_apriori
from . import sampling_apriori
from . import transaction_reduction
