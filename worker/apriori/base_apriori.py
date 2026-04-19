import time
from itertools import combinations
from collections import Counter

def run(transactions, min_support_count):
    start_time = time.time()
    num_candidates = 0
    all_frequent_itemsets = {}
    
    # --- Vòng 1: C1 & L1 ---
    c1_counts = Counter()
    for t in transactions:
        c1_counts.update(t)
    
    current_l = {frozenset([item]): count for item, count in c1_counts.items() 
                 if count >= min_support_count}
    all_frequent_itemsets.update(current_l)
    num_candidates += len(c1_counts)
    
    k = 2
    while len(current_l) > 0:
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
        
        current_counts = {c: 0 for c in candidates}
        for t in [set(tr) for tr in transactions]:
            for c in candidates:
                if c.issubset(t):
                    current_counts[c] += 1
        
        current_l = {c: count for c, count in current_counts.items() if count >= min_support_count}
        all_frequent_itemsets.update(current_l)
        k += 1

    return all_frequent_itemsets, {
        "runtime": time.time() - start_time,
        "num_candidates": num_candidates,
        "num_frequent_itemsets": len(all_frequent_itemsets)
    }