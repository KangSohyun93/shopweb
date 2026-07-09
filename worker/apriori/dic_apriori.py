import time
from itertools import combinations

def run(transactions, min_support_count, block_size=200):
    start_time = time.time()
    total_len = len(transactions)
    
    # itemsets: {itemset: [count, state, start_point]}
    # state: 0 (đang đếm), 1 (đã phổ biến), 2 (xong - phổ biến), 3 (xong - ko phổ biến)
    itemsets = {}
    
    for t in transactions:
        for item in t:
            itemsets[frozenset([item])] = [0, 0, 0]
            
    num_candidates = len(itemsets)
    current_idx = 0
    passed_items = 0 
    
    while any(v[1] < 2 for v in itemsets.values()):
        end_idx = min(current_idx + block_size, total_len)
        block = transactions[current_idx:end_idx]
        
        for t in block:
            t_set = set(t)
            for itemset in list(itemsets.keys()):
                if itemset.issubset(t_set):
                    itemsets[itemset][0] += 1
        
        for itemset in list(itemsets.keys()):
            count, state, start = itemsets[itemset]
            
            # Nếu đã quét đủ 1 vòng từ điểm bắt đầu
            if (current_idx + block_size) >= (start + total_len) if start > 0 else (current_idx + block_size) >= total_len:
                if count >= min_support_count:
                    itemsets[itemset][1] = 2 
                else:
                    itemsets[itemset][1] = 3 
                continue

            #đạt ngưỡng phổ biến -> Sinh ứng viên cha
            if state == 0 and count >= min_support_count:
                itemsets[itemset][1] = 1 
                
                new_candidates = []
                k = len(itemset) + 1
                    
        current_idx = (current_idx + block_size) % total_len
        if current_idx == 0: 
            pass 
            
        if time.time() - start_time > 60: break 

    frequent_itemsets = {k: v[0] for k, v in itemsets.items() if v[1] == 2 or v[0] >= min_support_count}
    
    return frequent_itemsets, {
        "runtime": time.time() - start_time,
        "num_candidates": num_candidates,
        "num_frequent_itemsets": len(frequent_itemsets)
    }