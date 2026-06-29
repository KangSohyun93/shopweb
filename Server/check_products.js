const db = require('./config/db');

async function checkDb() {
    try {
        console.log('--- Checking Missing Fields ---');
        const [columns] = await db.query('DESCRIBE products');
        
        for (let col of columns) {
            const col_name = col.Field;
            const [result] = await db.query(`SELECT COUNT(*) as count FROM products WHERE ${col_name} IS NULL OR ${col_name} = ''`);
            const missing = result[0].count;
            if (missing > 0) {
                console.log(`Column '${col_name}' has ${missing} missing values.`);
            }
        }
        
        console.log('\n--- Current Brands ---');
        const [brands] = await db.query('SELECT brand, COUNT(*) as count FROM products GROUP BY brand ORDER BY count DESC');
        for (let b of brands) {
            console.log(`${b.brand}: ${b.count}`);
        }
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkDb();
