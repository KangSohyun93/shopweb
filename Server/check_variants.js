const db = require('./config/db');
async function check() {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM products p LEFT JOIN product_variants v ON p.product_id = v.product_id WHERE v.variant_id IS NULL');
    console.log('Products WITHOUT variants still:', rows[0].count);
    const [fs] = await db.query("SELECT COUNT(*) as count FROM product_variants WHERE size IN ('Free Size','Freesize','One Size')");
    console.log('Free Size variants in DB:', fs[0].count);
    process.exit(0);
}
check();
