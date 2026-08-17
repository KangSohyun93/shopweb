"""
Gói thuật toán FP-Growth (Frequent Pattern Growth) sử dụng cấu trúc dữ liệu cây FP-Tree.
Tài liệu hóa ý nghĩa và cấu trúc phục vụ Đồ án tốt nghiệp:

1. fp_growth (FP-Growth Algorithm):
   - Ý nghĩa: Khai phá tập phổ biến dựa trên chiến lược "chia để trị". Nén toàn bộ dữ liệu vào cấu trúc cây nén FP-Tree, duyệt đệ quy và không sinh tập ứng viên trung gian rác.
   - Tham số:
     * transactions (list of lists): Danh sách các hóa đơn giao dịch.
     * min_support (int): Số lần xuất hiện chung tối thiểu của nhóm sản phẩm.

2. Cấu trúc dữ liệu FPNode:
   - Ý nghĩa: Đại diện cho một nút trên cây FP-Tree biểu diễn một sản phẩm và tần suất của nó trên nhánh.
   - Các thuộc tính:
     * item (any): Tên hoặc ID sản phẩm.
     * count (int): Tần suất xuất hiện lũy kế của sản phẩm trên đường đi này.
     * parent (FPNode): Nút cha (dùng để duyệt ngược tìm Conditional Pattern Base).
     * children (dict): Các nút con (định dạng {item: FPNode}).
     * next (FPNode): Con trỏ Node Link trỏ tới nút cùng tên tiếp theo trên cây (dùng để duyệt nhanh từ Header Table).
"""

from . import fp_growth
