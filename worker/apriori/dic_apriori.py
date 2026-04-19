import time
from itertools import combinations

def run(transactions, min_support_count, block_size=200):
    start_time = time.time()
    total_len = len(transactions)
    
    # itemsets: {itemset: [count, state, start_point]}
    # state: 0 (đang đếm), 1 (đã phổ biến), 2 (xong - phổ biến), 3 (xong - ko phổ biến)
    itemsets = {}
    
    # Khởi tạo L1 ban đầu
    for t in transactions:
        for item in t:
            itemsets[frozenset([item])] = [0, 0, 0]
            
    num_candidates = len(itemsets)
    current_idx = 0
    passed_items = 0 # Số lượng itemset đã duyệt đủ 1 vòng dữ liệu
    
    while any(v[1] < 2 for v in itemsets.values()):
        # Quét một khối dữ liệu
        end_idx = min(current_idx + block_size, total_len)
        block = transactions[current_idx:end_idx]
        
        for t in block:
            t_set = set(t)
            for itemset in list(itemsets.keys()):
                if itemset.issubset(t_set):
                    itemsets[itemset][0] += 1
        
        # Sau mỗi khối, cập nhật trạng thái
        for itemset in list(itemsets.keys()):
            count, state, start = itemsets[itemset]
            
            # Nếu đã quét đủ 1 vòng từ điểm bắt đầu
            if (current_idx + block_size) >= (start + total_len) if start > 0 else (current_idx + block_size) >= total_len:
                if count >= min_support_count:
                    itemsets[itemset][1] = 2 # Xong - Phổ biến
                else:
                    itemsets[itemset][1] = 3 # Xong - Không phổ biến
                continue

            # Nếu chưa đủ vòng nhưng đã đạt ngưỡng phổ biến -> Sinh ứng viên cha
            if state == 0 and count >= min_support_count:
                itemsets[itemset][1] = 1 # Chuyển sang "Đang đếm - Đã phổ biến"
                
                # Sinh ứng viên k+1 (Join logic)
                new_candidates = []
                k = len(itemset) + 1
                # (Đơn giản hóa: DIC thường sinh ứng viên rất phức tạp, 
                # ở đây ta chỉ sinh nếu tập con phổ biến)
                # Chú ý: Đây là phần rút gọn của DIC để demo
        
        current_idx = (current_idx + block_size) % total_len
        if current_idx == 0: # Đã quét hết 1 vòng vật lý
            pass 
            
        # Điều kiện dừng an toàn để tránh vòng lặp vô tận trong demo
        if time.time() - start_time > 60: break 

    frequent_itemsets = {k: v[0] for k, v in itemsets.items() if v[1] == 2 or v[0] >= min_support_count}
    
    return frequent_itemsets, {
        "runtime": time.time() - start_time,
        "num_candidates": num_candidates,
        "num_frequent_itemsets": len(frequent_itemsets)
    }