import mysql.connector

try:
    db = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='shopweb'
    )
    cursor = db.cursor(dictionary=True)
    
    print('--- Checking Missing Fields ---')
    cursor.execute('DESCRIBE products')
    columns = cursor.fetchall()
    
    for col in columns:
        col_name = col['Field']
        cursor.execute(f"SELECT COUNT(*) as count FROM products WHERE {col_name} IS NULL OR {col_name} = ''")
        missing = cursor.fetchone()['count']
        if missing > 0:
            print(f"Column '{col_name}' has {missing} missing values.")
    
    print('\n--- Current Brands ---')
    cursor.execute('SELECT brand, COUNT(*) as count FROM products GROUP BY brand ORDER BY count DESC')
    brands = cursor.fetchall()
    for b in brands:
        print(f"{b['brand']}: {b['count']}")
        
    db.close()
except Exception as e:
    print('Error:', e)
