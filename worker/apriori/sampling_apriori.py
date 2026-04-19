import time
import random
from src.apriori import base_apriori

def run(transactions, min_support_count, sample_ratio=0.2):
    """
    sample_ratio: Tỉ lệ lấy mẫu (ví dụ 0.2 = 20% dữ liệu)
    """
    start_time = time.time()
    total_len = len(transactions)
    sample_size = int(total_len * sample_ratio)
    
    # 1. Lấy mẫu ngẫu nhiên
    sample_transactions = random.sample(transactions, sample_size)
    
    # 2. Hạ ngưỡng support tỉ lệ thuận với mẫu (giảm thêm 10% để vét ứng viên)
    local_min_sup = (sample_size / total_len) * min_support_count * 0.9
    
    # Chạy Apriori trên mẫu
    sample_frequent_sets, _ = base_apriori.run(sample_transactions, local_min_sup)
    
    # 3. Xác nhận lại trên toàn bộ dữ liệu gốc
    global_candidates = list(sample_frequent_sets.keys())
    final_counts = {c: 0 for c in global_candidates}
    transaction_sets = [set(t) for t in transactions]
    
    for t_set in transaction_sets:
        for c in global_candidates:
            if c.issubset(t_set):
                final_counts[c] += 1
                
    # Lọc kết quả cuối cùng theo ngưỡng chuẩn
    all_frequent_itemsets = {c: count for c, count in final_counts.items() 
                             if count >= min_support_count}
    
    return all_frequent_itemsets, {
        "runtime": time.time() - start_time,
        "sample_size": sample_size,
        "num_candidates": len(global_candidates),
        "num_frequent_itemsets": len(all_frequent_itemsets)
    }