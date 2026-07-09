import time
from itertools import combinations

def run(transactions, min_support, bucket_size=100000):
    """
    Interface chuẩn: (transactions, min_support) -> (frequent_itemsets, stats)
    bucket_size: Độ lớn bảng băm (tăng để giảm xung đột băm).
    """
    start_time = time.time()
    num_candidates = 0
    all_frequent_itemsets = {}
    
    # 1. Quét lần 1: Tìm L1 và xây dựng Hash Table cho C2
    item_counts = {}
    hash_table = [0] * bucket_size
    
    for transaction in transactions:
        # Đếm L1
        for item in transaction:
            item_counts[item] = item_counts.get(item, 0) + 1
        
        if len(transaction) >= 2:
            for pair in combinations(sorted(transaction), 2):
                hash_val = hash(pair) % bucket_size
                hash_table[hash_val] += 1
                
    current_l = {frozenset([item]): count for item, count in item_counts.items() 
                 if count >= min_support}
    all_frequent_itemsets.update(current_l)
    num_candidates += len(item_counts)
    
    items_l1 = sorted(list(current_l.keys()))
    c2_candidates = []
    
    for i in range(len(items_l1)):
        for j in range(i + 1, len(items_l1)):
            item_a = list(items_l1[i])[0]
            item_b = list(items_l1[j])[0]
            pair = tuple(sorted((item_a, item_b)))
            
            hash_val = hash(pair) % bucket_size
            if hash_table[hash_val] >= min_support:
                c2_candidates.append(frozenset(pair))
    
    num_candidates += len(c2_candidates)
    
    # 3. Quét lần 2: Đếm Support thực tế cho C2 đã được cắt tỉa
    c2_counts = {}
    candidates_set = set(c2_candidates)
    
    for transaction in transactions:
        if len(transaction) < 2: continue
        for combo in combinations(sorted(transaction), 2):
            combo_set = frozenset(combo)
            if combo_set in candidates_set:
                c2_counts[combo_set] = c2_counts.get(combo_set, 0) + 1
                
    l2 = {item: count for item, count in c2_counts.items() if count >= min_support}
    all_frequent_itemsets.update(l2)
    
    stats = {
        "runtime": time.time() - start_time,
        "num_candidates": num_candidates,
        "num_frequent_itemsets": len(all_frequent_itemsets)
    }
    
    return all_frequent_itemsets, stats