import pymysql
import random

DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'Sohyun280697.',
    'database': 'shopweb',
    'cursorclass': pymysql.cursors.DictCursor
}

def seed_realistic_associations():
    connection = pymysql.connect(**DB_CONFIG)
    try:
        with connection.cursor() as cursor:
            # 1. Lấy 15 sản phẩm có variant
            cursor.execute("""
                SELECT p.product_id, pv.variant_id, pv.price 
                FROM products p
                JOIN product_variants pv ON p.product_id = pv.product_id
                LIMIT 15
            """)
            products = cursor.fetchall()
            if len(products) < 15:
                print("Không đủ sản phẩm để tạo mẫu gợi ý thực tế.")
                return
            
            # Lấy danh sách user IDs hợp lệ
            cursor.execute("SELECT user_id FROM users LIMIT 10")
            users = [r['user_id'] for r in cursor.fetchall()]
            if not users:
                users = [1]
                
            print("Đang gieo dữ liệu mua sắm thực tế...")

            # Định nghĩa các kịch bản mua sắm đa dạng (sử dụng chỉ số index của danh sách products)
            # Tạo các nhóm sản phẩm hay mua kèm nhau với tỷ lệ xuất hiện khác nhau
            scenarios = []

            # Nhóm A: Products 0, 1, 2 (Ví dụ: Combo điện thoại, ốp lưng, sạc dự phòng)
            # [0, 1] xuất hiện 25 lần
            for _ in range(25): scenarios.append([0, 1])
            # [0, 2] xuất hiện 15 lần
            for _ in range(15): scenarios.append([0, 2])
            # [0, 1, 2] xuất hiện 10 lần
            for _ in range(10): scenarios.append([0, 1, 2])
            # Đơn hàng mua riêng lẻ để tạo độ tin cậy thực tế (không phải 100%)
            for _ in range(20): scenarios.append([0])
            for _ in range(15): scenarios.append([1])
            for _ in range(12): scenarios.append([2])

            # Nhóm B: Products 3, 4, 5 (Ví dụ: Giày thể thao, tất thể thao, bình nước)
            # [3, 4] xuất hiện 30 lần
            for _ in range(30): scenarios.append([3, 4])
            # [3, 5] xuất hiện 12 lần
            for _ in range(12): scenarios.append([3, 5])
            for _ in range(25): scenarios.append([3])
            for _ in range(20): scenarios.append([4])

            # Nhóm C: Products 6, 7, 8, 9 (Ví dụ: Laptop, chuột, bàn phím, tai nghe)
            # [6, 7] xuất hiện 22 lần
            for _ in range(22): scenarios.append([6, 7])
            # [6, 8] xuất hiện 18 lần
            for _ in range(18): scenarios.append([6, 8])
            # [6, 7, 8] xuất hiện 8 lần
            for _ in range(8): scenarios.append([6, 7, 8])
            # [6, 9] xuất hiện 10 lần
            for _ in range(10): scenarios.append([6, 9])
            for _ in range(30): scenarios.append([6])
            for _ in range(15): scenarios.append([7])

            # Nhóm D: Products 10, 11 (Ví dụ: Sách A, Sách B)
            # [10, 11] xuất hiện 18 lần
            for _ in range(18): scenarios.append([10, 11])
            for _ in range(10): scenarios.append([10])
            for _ in range(12): scenarios.append([11])

            # Nhóm E: Products 12, 13, 14 (Ví dụ: Áo thun, quần jean, thắt lưng)
            # [12, 13] xuất hiện 20 lần
            for _ in range(20): scenarios.append([12, 13])
            # [12, 14] xuất hiện 8 lần
            for _ in range(8): scenarios.append([12, 14])
            for _ in range(15): scenarios.append([12])
            for _ in range(15): scenarios.append([13])

            random.shuffle(scenarios)
            
            orders_inserted = 0
            for item_indices in scenarios:
                user_id = random.choice(users)
                
                # Tính tổng tiền
                total_amount = sum(products[idx]['price'] for idx in item_indices)
                
                # Insert order
                cursor.execute("""
                    INSERT INTO orders (user_id, address_id, total_amount, status, created_at)
                    VALUES (%s, NULL, %s, 'delivered', NOW())
                """, (user_id, total_amount))
                
                order_id = cursor.lastrowid
                
                # Insert order items
                for idx in item_indices:
                    prod = products[idx]
                    cursor.execute("""
                        INSERT INTO order_items (order_id, variant_id, quantity, price)
                        VALUES (%s, %s, 1, %s)
                    """, (order_id, prod['variant_id'], prod['price']))
                
                orders_inserted += 1

            connection.commit()
            print(f"🎉 Thành công: Đã thêm {orders_inserted} đơn hàng mô phỏng thực tế vào CSDL.")
            print("Sản phẩm mẫu đã dùng:")
            for i, p in enumerate(products):
                print(f"  Index {i}: Product ID {p['product_id']} (Variant ID {p['variant_id']})")
                
    except Exception as e:
        connection.rollback()
        print(f"Lỗi khi gieo dữ liệu: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    seed_realistic_associations()
