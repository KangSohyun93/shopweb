import pymysql
import random

DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'Sohyun280697.',
    'database': 'shopweb',
    'cursorclass': pymysql.cursors.DictCursor
}

def seed_associations():
    connection = pymysql.connect(**DB_CONFIG)
    try:
        with connection.cursor() as cursor:
            # 1. Get 40 products that have variants
            cursor.execute("""
                SELECT p.product_id, pv.variant_id, pv.price 
                FROM products p
                JOIN product_variants pv ON p.product_id = pv.product_id
                LIMIT 40
            """)
            items = cursor.fetchall()
            if len(items) < 20:
                print("Không đủ sản phẩm để tạo cặp.")
                return
            
            # Create 10 pairs of products
            pairs = []
            for i in range(0, 20, 2):
                pairs.append((items[i], items[i+1]))
            
            # Get valid user IDs
            cursor.execute("SELECT user_id FROM users LIMIT 10")
            users = [r['user_id'] for r in cursor.fetchall()]
            if not users:
                users = [1]
                
            print(f"Bắt đầu tạo đơn hàng giả lập cho {len(pairs)} cặp sản phẩm...")
            
            # Insert 15 co-occurrence orders for each pair
            orders_inserted = 0
            for prod1, prod2 in pairs:
                # Print the pair for verification
                print(f"  Tạo liên kết: Sản phẩm {prod1['product_id']} <-> Sản phẩm {prod2['product_id']}")
                
                for _ in range(15):
                    user_id = random.choice(users)
                    total_amount = prod1['price'] + prod2['price']
                    
                    # Insert order
                    cursor.execute("""
                        INSERT INTO orders (user_id, address_id, total_amount, status, created_at)
                        VALUES (%s, NULL, %s, 'delivered', NOW())
                    """, (user_id, total_amount))
                    
                    order_id = cursor.lastrowid
                    
                    # Insert order_item 1
                    cursor.execute("""
                        INSERT INTO order_items (order_id, variant_id, quantity, price)
                        VALUES (%s, %s, 1, %s)
                    """, (order_id, prod1['variant_id'], prod1['price']))
                    
                    # Insert order_item 2
                    cursor.execute("""
                        INSERT INTO order_items (order_id, variant_id, quantity, price)
                        VALUES (%s, %s, 1, %s)
                    """, (order_id, prod2['variant_id'], prod2['price']))
                    
                    orders_inserted += 1
            
            connection.commit()
            print(f"🎉 Thành công: Đã thêm {orders_inserted} đơn hàng chứa các cặp sản phẩm mua chung vào cơ sở dữ liệu.")
            
    except Exception as e:
        connection.rollback()
        print(f"Lỗi khi insert dữ liệu: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    seed_associations()
