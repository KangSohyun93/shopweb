import time
from collections import Counter
from itertools import combinations

def run(transactions, min_support):
    start_time = time.time()
    num_candidates = 0
    all_frequent_itemsets = {}
    
    # Chuyển transactions sang dạng set để xử lý nhanh hơn
    current_transactions = [set(t) for t in transactions]
    
    # --- Vòng 1: L1 ---
    c1_counts = Counter()
    for t in current_transactions:
        c1_counts.update(t)
    
    current_l = {frozenset([item]): count for item, count in c1_counts.items() 
                 if count >= min_support}
    all_frequent_itemsets.update(current_l)
    num_candidates += len(c1_counts)
    
    k = 2
    while len(current_l) > 0:
        # Sinh ứng viên (Join & Prune)
        prev_items = list(current_l.keys())
        candidates = []
        for i in range(len(prev_items)):
            for j in range(i + 1, len(prev_items)):
                it1, it2 = sorted(list(prev_items[i])), sorted(list(prev_items[j]))
                if it1[:k-2] == it2[:k-2]:
                    c = prev_items[i] | prev_items[j]
                    if all(frozenset(sub) in current_l for sub in combinations(c, k-1)):
                        candidates.append(c)
        
        num_candidates += len(candidates)
        if not candidates: break
        
        # --- TRANSACTION REDUCTION ---
        next_transactions = []
        current_counts = {c: 0 for c in candidates}
        
        for t_set in current_transactions:
            found_any = False
            for c in candidates:
                if c.issubset(t_set):
                    current_counts[c] += 1
                    found_any = True
            
            # Chỉ giữ lại transaction nếu nó chứa ít nhất một ứng viên phổ biến
            if found_any:
                next_transactions.append(t_set)
        
        current_transactions = next_transactions
        
        # Lọc Lk
        current_l = {c: count for c, count in current_counts.items() if count >= min_support}
        all_frequent_itemsets.update(current_l)
        k += 1

    return all_frequent_itemsets, {
        "runtime": time.time() - start_time,
        "num_candidates": num_candidates,
        "num_frequent_itemsets": len(all_frequent_itemsets),
        "final_transaction_count": len(current_transactions)
    }