import pandas as pd
import os

def load_transactions(file_path):
    """
    Đọc dữ liệu từ purchases_expanded.csv và chuyển thành dạng transaction.
    """
    if not os.path.exists(file_path):
        print(f"❌ Không tìm thấy file tại: {file_path}")
        return []
        
    print(f"📂 Đang nạp dữ liệu từ {file_path}...")
    df = pd.read_csv(file_path)
    
    # Gom nhóm sản phẩm theo user_id (mỗi user là một giỏ hàng)
    transactions = df.groupby('user_id')['product_id'].apply(list).tolist()
    
    # Loại bỏ sản phẩm trùng trong cùng 1 user (nếu có)
    transactions = [list(set(t)) for t in transactions]
    
    print(f"✅ Đã tạo {len(transactions)} giỏ hàng từ {len(df)} bản ghi.")
    return transactions