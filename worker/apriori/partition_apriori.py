import time
import math
from apriori import base_apriori

def run(transactions, min_support_count, num_partitions=2):
    start_time = time.time()
    total_transactions = len(transactions)
    partition_size = math.ceil(total_transactions / num_partitions)
    
    global_candidates = set()
    
    # --- GIAI ĐOẠN 1: Tìm ứng viên tại từng phần vùng ---
    for i in range(num_partitions):
        start = i * partition_size
        end = min((i + 1) * partition_size, total_transactions)
        partition = transactions[start:end]
        
        # Ngưỡng local tỉ lệ thuận với kích thước phần vùng
        local_min_sup = (len(partition) / total_transactions) * min_support_count
        
        # Chạy base_apriori trên phần vùng (Join + Prune diễn ra bên trong)
        local_frequent_sets, _ = base_apriori.run(partition, local_min_sup)
        global_candidates.update(local_frequent_sets.keys())

    # --- GIAI ĐOẠN 2: Xác nhận toàn cục (Global Scan) ---
    final_counts = {c: 0 for c in global_candidates}
    transaction_sets = [set(t) for t in transactions]
    
    for t_set in transaction_sets:
        for c in global_candidates:
            if c.issubset(t_set):
                final_counts[c] += 1
                
    # Lọc kết quả cuối cùng
    all_frequent_itemsets = {c: count for c, count in final_counts.items() 
                             if count >= min_support_count}
    
    return all_frequent_itemsets, {
        "runtime": time.time() - start_time,
        "num_candidates": len(global_candidates),
        "num_frequent_itemsets": len(all_frequent_itemsets)
    }