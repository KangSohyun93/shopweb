import pymysql
import redis
import time

# IMPORT CÁC THUẬT TOÁN VIẾT TAY CỦA BẠN
from apriori import base_apriori
from fpgrowth import fp_growth

# ==========================================
# 1. CẤU HÌNH HỆ THỐNG
# ==========================================
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'Sohyun280697.',
    'database': 'shopweb_db',
    'cursorclass': pymysql.cursors.DictCursor
}

REDIS_CONFIG = {
    'host': '127.0.0.1',
    'port': 6380,
    'db': 0,
    'decode_responses': True
}

# 🎯 CHỌN THUẬT TOÁN Ở ĐÂY ('fpgrowth' hoặc 'apriori')
ACTIVE_ALGORITHM = 'fpgrowth'

# Thay vì dùng % (0.01), hàm của bạn dùng COUNT (số lượng).
# Ta sẽ cấu hình số lượng đơn hàng tối thiểu có chứa sản phẩm để được coi là phổ biến.
MIN_SUPPORT_COUNT = 2     # Tối thiểu 2 đơn hàng mua chung
MIN_CONFIDENCE = 0.05    # Tỉ lệ mua kèm tối thiểu 5%

# ==========================================
# 2. LẤY DỮ LIỆU TỪ MYSQL
# ==========================================
def get_transactions():
    print("⏳ [1/4] Đang lấy dữ liệu từ MySQL...")
    connection = pymysql.connect(**DB_CONFIG)
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT oi.order_id, pv.product_id 
                FROM order_items oi
                JOIN product_variants pv ON oi.variant_id = pv.variant_id
            """
            cursor.execute(sql)
            rows = cursor.fetchall()
            
            transactions_map = {}
            for row in rows:
                oid = row['order_id']
                pid = row['product_id']
                if oid not in transactions_map:
                    transactions_map[oid] = set()
                transactions_map[oid].add(pid)
            
            return [list(items) for items in transactions_map.values() if len(items) > 1]
    finally:
        connection.close()

# ==========================================
# 3. HÀM TỰ VIẾT: TỪ TẬP PHỔ BIẾN -> LUẬT GỢI Ý
# ==========================================
def generate_rules_from_frequent_itemsets(frequent_itemsets, min_confidence):
    """
    Hàm này thay thế cho thư viện mlxtend. Nó nhận kết quả từ thuật toán của bạn,
    tính toán Confidence và sinh ra luật (1 Sản phẩm -> Nhiều Sản phẩm).
    """
    rules = []
    
    for itemset, count in frequent_itemsets.items():
        # Chỉ xét các tập có từ 2 sản phẩm trở lên để làm luật mua kèm
        if len(itemset) > 1:
            for item in itemset:
                antecedent = frozenset([item]) # Món đồ khách đang xem
                consequents = itemset - antecedent # Các món đồ mua kèm
                
                # Tính độ tin cậy: P(A ∩ B) / P(A)
                if antecedent in frequent_itemsets:
                    support_A = frequent_itemsets[antecedent]
                    confidence = count / support_A
                    
                    if confidence >= min_confidence:
                        rules.append({
                            'antecedent': list(antecedent)[0],
                            'consequents': list(consequents),
                            'confidence': confidence,
                            'support_count': count
                        })
                        
    # Sắp xếp các luật theo thứ tự Confidence giảm dần (Độ tin cậy cao lên đầu)
    rules.sort(key=lambda x: x['confidence'], reverse=True)
    return rules

def build_recommendation_map(rules):
    print("⏳ [3/4] Đang xây dựng cấu trúc Map Gợi ý...")
    recom_map = {}
    for rule in rules:
        prod_id = rule['antecedent']
        if prod_id not in recom_map:
            recom_map[prod_id] = []
            
        for c in rule['consequents']:
            if c not in recom_map[prod_id] and len(recom_map[prod_id]) < 5:
                recom_map[prod_id].append(c)
    return recom_map

# ==========================================
# 4. ĐẨY LÊN REDIS CACHE
# ==========================================
def save_to_redis(recom_map):
    print("⚡ [4/4] Đang đẩy toàn bộ kết quả lên Redis Cache...")
    client = redis.Redis(**REDIS_CONFIG)
    
    keys_to_delete = client.keys("recom:*")
    if keys_to_delete:
        client.delete(*keys_to_delete)
        
    count = 0
    for prod_id, rec_ids in recom_map.items():
        if rec_ids:
            redis_key = f"recom:{prod_id}"
            client.rpush(redis_key, *rec_ids)
            count += 1
            
    print(f"🎉 HOÀN THÀNH! Đã nạp thành công {count} bộ gợi ý vào Redis.")
def save_rules_to_mysql(rules):
    print("💾 Đang lưu chi tiết các Luật vào MySQL cho Admin Dashboard...")
    connection = pymysql.connect(**DB_CONFIG)
    try:
        with connection.cursor() as cursor:
            # Xóa các luật cũ đi để cập nhật luật mới nhất
            cursor.execute("TRUNCATE TABLE ai_rules")
            
            # Thêm luật mới vào
            sql = "INSERT INTO ai_rules (antecedent_id, consequent_id, confidence, support_count) VALUES (%s, %s, %s, %s)"
            for rule in rules:
                ant_id = rule['antecedent']
                for cons_id in rule['consequents']:
                    cursor.execute(sql, (ant_id, cons_id, rule['confidence'], rule['support_count']))
        connection.commit()
        print("✅ Đã lưu xong luật vào MySQL!")
    finally:
        connection.close()
# ==========================================
# CHƯƠNG TRÌNH CHÍNH
# ==========================================
if __name__ == "__main__":
    print(f"\n{'='*50}\n🚀 HỆ THỐNG GỢI Ý ĐANG CHẠY (Thuật toán: {ACTIVE_ALGORITHM.upper()})\n{'='*50}")
    
    transactions = get_transactions()
    
    if transactions:
        print(f"🧠 [2/4] Đang chạy thuật toán {ACTIVE_ALGORITHM.upper()} do sinh viên tự code...")
        
        # 1. Gọi thẳng vào code của bạn
        if ACTIVE_ALGORITHM == 'apriori':
            frequent_itemsets, stats = base_apriori.run(transactions, MIN_SUPPORT_COUNT)
        elif ACTIVE_ALGORITHM == 'fpgrowth':
            frequent_itemsets, stats = fp_growth.run(transactions, MIN_SUPPORT_COUNT)
        else:
            raise ValueError("Thuật toán không hợp lệ!")
            
        print(f"   📊 Thống kê: Tìm thấy {stats['num_frequent_itemsets']} tập phổ biến. Thời gian: {round(stats['runtime'], 3)}s")
        
        if not frequent_itemsets:
            print("⚠️ Không tìm thấy tập phổ biến nào. Hãy giảm MIN_SUPPORT_COUNT xuống (VD: 2 hoặc 3).")
        else:
            # 2. Sinh luật bằng tay
            rules = generate_rules_from_frequent_itemsets(frequent_itemsets, MIN_CONFIDENCE)
            print(f"✅ Đã sinh thành công {len(rules)} luật kết hợp (Association Rules).")
            
            # 3. Xây dựng Map và Lưu Redis
            recommendations = build_recommendation_map(rules)
            
            if recommendations:
                print("\n👉 In thử 3 luật gợi ý đầu tiên để kiểm tra:")
                sample_keys = list(recommendations.keys())[:3]
                for k in sample_keys:
                    print(f"   [Khách xem Sản phẩm ID {k}] ---> [Gợi ý mua kèm ID {recommendations[k]}]")
                
                save_to_redis(recommendations)
                save_rules_to_mysql(rules)