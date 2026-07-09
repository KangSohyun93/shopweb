import time
from collections import defaultdict

class FPNode:
    def __init__(self, item, count, parent):
        self.item = item
        self.count = count
        self.parent = parent
        self.children = {}
        self.next = None

def run(transactions, min_support):
    start_time = time.time()
    
    header_table = defaultdict(int)
    for t in transactions:
        for item in t:
            header_table[item] += 1
            
    header_table = {k: v for k, v in header_table.items() if v >= min_support}
    if not header_table: return {}, {"runtime": time.time()-start_time, "num_candidates": 0, "num_frequent_itemsets": 0}
    
    # Sắp xếp header table
    for k in header_table:
        header_table[k] = [header_table[k], None] 

    # 2. Xây dựng FP-Tree
    root = FPNode(None, 0, None)
    for t in transactions:
        # Chỉ lấy các item phổ biến và sắp xếp theo tần suất giảm dần
        valid_items = [item for item in t if item in header_table]
        valid_items.sort(key=lambda x: header_table[x][0], reverse=True)
        
        current = root
        for item in valid_items:
            if item in current.children:
                current.children[item].count += 1
            else:
                new_node = FPNode(item, 1, current)
                current.children[item] = new_node
                # Cập nhật liên kết node cùng loại (Node Link)
                if header_table[item][1] is None:
                    header_table[item][1] = new_node
                else:
                    target = header_table[item][1]
                    while target.next is not None:
                        target = target.next
                    target.next = new_node
            current = current.children[item]

    # 3. Khai thác cây (Mining)
    frequent_itemsets = {}
    
    def mine_tree(header_table, prefix, min_support, frequent_itemsets):
        # Sắp xếp các item trong header table theo thứ tự tăng dần của tần suất
        items = sorted(header_table.keys(), key=lambda x: header_table[x][0])
        
        for item in items:
            new_frequent_set = prefix.copy()
            new_frequent_set.add(item)
            frequent_itemsets[frozenset(new_frequent_set)] = header_table[item][0]
            
            # Tìm các đường dẫn điều kiện (Conditional Pattern Base)
            cond_pattern_base = []
            node = header_table[item][1]
            while node is not None:
                path = []
                parent = node.parent
                while parent.item is not None:
                    path.append(parent.item)
                    parent = parent.parent
                if path:
                    for _ in range(node.count):
                        cond_pattern_base.append(path)
                node = node.next
            
            # Xây dựng cây điều kiện
            cond_header = defaultdict(int)
            for path in cond_pattern_base:
                for path_item in path:
                    cond_header[path_item] += 1
            
            cond_header = {k: [v, None] for k, v in cond_header.items() if v >= min_support}
            
            if cond_header:
                cond_root = FPNode(None, 0, None)
                for path in cond_pattern_base:
                    valid_path = [i for i in path if i in cond_header]
                    valid_path.sort(key=lambda x: cond_header[x][0], reverse=True)
                    
                    curr = cond_root
                    for p_item in valid_path:
                        if p_item in curr.children:
                            curr.children[p_item].count += 1
                        else:
                            nn = FPNode(p_item, 1, curr)
                            curr.children[p_item] = nn
                            if cond_header[p_item][1] is None:
                                cond_header[p_item][1] = nn
                            else:
                                tgt = cond_header[p_item][1]
                                while tgt.next is not None: tgt = tgt.next
                                tgt.next = nn
                        curr = curr.children[p_item]
                
                mine_tree(cond_header, new_frequent_set, min_support, frequent_itemsets)

    mine_tree(header_table, set(), min_support, frequent_itemsets)
    
    return frequent_itemsets, {
        "runtime": time.time() - start_time,
        "num_candidates": 0, # FP-Growth không sinh candidate
        "num_frequent_itemsets": len(frequent_itemsets)
    }