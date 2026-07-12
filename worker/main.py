import pymysql
import redis
import time
import json

# IMPORT CÁC THUẬT TOÁN VIẾT TAY CỦA BẠN
from apriori import base_apriori, dic_apriori, hash_apriori, partition_apriori, sampling_apriori, transaction_reduction
from fpgrowth import fp_growth

import os

# ==========================================
# 1. CẤU HÌNH HỆ THỐNG (ĐỌC ĐỘNG TỪ SERVER/.ENV)
# ==========================================
def load_env(env_path):
    env_vars = {}
    if os.path.exists(env_path):
        try:
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        k, v = line.split('=', 1)
                        # Loại bỏ dấu ngoặc đơn hoặc ngoặc kép bao quanh nếu có
                        v_val = v.strip().strip("'").strip('"')
                        env_vars[k.strip()] = v_val
        except Exception as e:
            print(f"⚠️ Không thể đọc file .env: {e}")
    return env_vars

# Xác định đường dẫn tới file .env của Server
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_file_path = os.path.join(base_dir, 'Server', '.env')
env_config = load_env(env_file_path)

if env_config:
    print(f"✅ Đã tải cấu hình kết nối từ: Server/.env")
else:
    print(f"⚠️ Không tìm thấy Server/.env, sử dụng cấu hình mặc định.")

DB_CONFIG = {
    'host': env_config.get('DB_HOST', '127.0.0.1'),
    'user': env_config.get('DB_USER', 'root'),
    'password': env_config.get('DB_PASSWORD', 'Sohyun280697.'),
    'database': env_config.get('DB_NAME', 'shopweb'),
    'port': int(env_config.get('DB_PORT', 3306)),
    'cursorclass': pymysql.cursors.DictCursor
}

REDIS_CONFIG = {
    'host': env_config.get('REDIS_HOST', '127.0.0.1'),
    'port': int(env_config.get('REDIS_PORT', 6379)),
    'db': 0,
    'decode_responses': True
}

# 🎯 Đọc toàn bộ cấu hình từ MySQL
def get_ai_settings():
    print("🔍 Đang đọc toàn bộ cấu hình gợi ý từ MySQL...")
    settings = {
        'active_algorithm': 'fpgrowth',
        'min_support_count': 2,
        'min_confidence': 0.05,
        'max_recs_per_product': 5
    }
    try:
        connection = pymysql.connect(**DB_CONFIG)
        with connection.cursor() as cursor:
            cursor.execute("SELECT setting_key, setting_value FROM ai_settings")
            rows = cursor.fetchall()
            for row in rows:
                key = row['setting_key']
                val = row['setting_value']
                if key == 'active_algorithm':
                    settings[key] = val
                elif key == 'min_support_count':
                    settings[key] = int(val)
                elif key == 'min_confidence':
                    settings[key] = float(val)
                elif key == 'max_recs_per_product':
                    settings[key] = int(val)
    except Exception as e:
        print(f"⚠️ Lỗi đọc cấu hình từ DB, sử dụng các giá trị mặc định. Chi tiết: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()
    return settings


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

def build_recommendation_map(rules, max_recs_per_product):
    print("⏳ [3/4] Đang xây dựng cấu trúc Map Gợi ý...")
    recom_map = {}
    for rule in rules:
        prod_id = rule['antecedent']
        if prod_id not in recom_map:
            recom_map[prod_id] = []
            
        for c in rule['consequents']:
            if c not in recom_map[prod_id] and len(recom_map[prod_id]) < max_recs_per_product:
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

def save_mining_stats_to_mysql(algorithm, runtime, num_itemsets, num_rules):
    print("💾 Đang lưu thống kê lượt chạy vào MySQL...")
    connection = pymysql.connect(**DB_CONFIG)
    try:
        with connection.cursor() as cursor:
            stats = {
                'algorithm': algorithm,
                'runtime': round(runtime, 4),
                'num_itemsets': num_itemsets,
                'num_rules': num_rules,
                'timestamp': time.strftime("%Y-%m-%d %H:%M:%S")
            }
            stats_json = json.dumps(stats)
            cursor.execute(
                "UPDATE ai_settings SET setting_value = %s WHERE setting_key = 'last_mining_stats'",
                (stats_json,)
            )
        connection.commit()
        print("✅ Đã cập nhật thống kê vào MySQL!")
    except Exception as e:
        print(f"⚠️ Lỗi lưu thống kê: {e}")
    finally:
        connection.close()

def save_benchmark_log(algorithm, runtime, num_itemsets, num_rules, min_sup, min_conf, num_transactions):
    """Lưu lịch sử benchmark vào bảng benchmark_logs để hiển thị biểu đồ so sánh trên Dashboard."""
    print("📊 Đang lưu lịch sử benchmark vào bảng benchmark_logs...")
    connection = pymysql.connect(**DB_CONFIG)
    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO benchmark_logs 
                     (algorithm, runtime, num_frequent_itemsets, num_rules, 
                      min_support_count, min_confidence, num_transactions)
                     VALUES (%s, %s, %s, %s, %s, %s, %s)"""
            cursor.execute(sql, (
                algorithm, round(runtime, 4), num_itemsets, num_rules,
                min_sup, min_conf, num_transactions
            ))
        connection.commit()
        print("✅ Đã lưu benchmark log thành công!")
    except Exception as e:
        print(f"⚠️ Lỗi lưu benchmark log (bảng có thể chưa tồn tại): {e}")
    finally:
        connection.close()

# ==========================================
# CHƯƠNG TRÌNH CHÍNH
# ==========================================
if __name__ == "__main__":
    # Đọc cấu hình động từ DB
    settings = get_ai_settings()
    ACTIVE_ALGORITHM = settings['active_algorithm']
    MIN_SUPPORT_COUNT = settings['min_support_count']
    MIN_CONFIDENCE = settings['min_confidence']
    MAX_RECS_PER_PRODUCT = settings['max_recs_per_product']
    
    print(f"\n{'='*50}\n🚀 HỆ THỐNG GỢI Ý ĐANG CHẠY (Thuật toán: {ACTIVE_ALGORITHM.upper()})\n{'='*50}")
    print(f"   ⚙️ Cấu hình: Min Support Count = {MIN_SUPPORT_COUNT}, Min Confidence = {MIN_CONFIDENCE}, Max Recs = {MAX_RECS_PER_PRODUCT}")
    
    transactions = get_transactions()
    
    if transactions:
        print(f"🧠 [2/4] Đang chạy thuật toán {ACTIVE_ALGORITHM.upper()}...")
        
        # 1. Gọi thẳng vào code của bạn
        if ACTIVE_ALGORITHM == 'apriori':
            frequent_itemsets, stats = base_apriori.run(transactions, MIN_SUPPORT_COUNT)
        elif ACTIVE_ALGORITHM == 'dic_apriori':
            frequent_itemsets, stats = dic_apriori.run(transactions, MIN_SUPPORT_COUNT)
        elif ACTIVE_ALGORITHM == 'hash_apriori':
            frequent_itemsets, stats = hash_apriori.run(transactions, MIN_SUPPORT_COUNT)
        elif ACTIVE_ALGORITHM == 'partition_apriori':
            frequent_itemsets, stats = partition_apriori.run(transactions, MIN_SUPPORT_COUNT)
        elif ACTIVE_ALGORITHM == 'sampling_apriori':
            frequent_itemsets, stats = sampling_apriori.run(transactions, MIN_SUPPORT_COUNT)
        elif ACTIVE_ALGORITHM == 'transaction_reduction':
            frequent_itemsets, stats = transaction_reduction.run(transactions, MIN_SUPPORT_COUNT)
        elif ACTIVE_ALGORITHM == 'fpgrowth':
            frequent_itemsets, stats = fp_growth.run(transactions, MIN_SUPPORT_COUNT)
        else:
            raise ValueError("Thuật toán không hợp lệ!")
            
        print(f"   📊 Thống kê: Tìm thấy {stats['num_frequent_itemsets']} tập phổ biến. Thời gian: {round(stats['runtime'], 3)}s")
        
        if not frequent_itemsets:
            print("⚠️ Không tìm thấy tập phổ biến nào. Hãy giảm MIN_SUPPORT_COUNT xuống (VD: 2 hoặc 3).")
            # Cập nhật thống kê rỗng
            save_mining_stats_to_mysql(ACTIVE_ALGORITHM, stats['runtime'], stats['num_frequent_itemsets'], 0)
            save_benchmark_log(ACTIVE_ALGORITHM, stats['runtime'], stats['num_frequent_itemsets'], 0, MIN_SUPPORT_COUNT, MIN_CONFIDENCE, len(transactions))
        else:
            # 2. Sinh luật bằng tay
            rules = generate_rules_from_frequent_itemsets(frequent_itemsets, MIN_CONFIDENCE)
            print(f"✅ Đã sinh thành công {len(rules)} luật kết hợp (Association Rules).")
            
            # 3. Xây dựng Map và Lưu Redis
            recommendations = build_recommendation_map(rules, MAX_RECS_PER_PRODUCT)
            
            if recommendations:
                print("\n👉 In thử 3 luật gợi ý đầu tiên để kiểm tra:")
                sample_keys = list(recommendations.keys())[:3]
                for k in sample_keys:
                    print(f"   [Khách xem Sản phẩm ID {k}] ---> [Gợi ý mua kèm ID {recommendations[k]}]")
                
                save_to_redis(recommendations)
                save_rules_to_mysql(rules)
                
            # Lưu thống kê thành công
            save_mining_stats_to_mysql(ACTIVE_ALGORITHM, stats['runtime'], stats['num_frequent_itemsets'], len(rules))
            save_benchmark_log(ACTIVE_ALGORITHM, stats['runtime'], stats['num_frequent_itemsets'], len(rules), MIN_SUPPORT_COUNT, MIN_CONFIDENCE, len(transactions))