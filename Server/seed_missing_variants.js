const db = require('./config/db');

async function seedMissingVariants() {
    try {
        // Lấy tất cả sản phẩm chưa có biến thể
        const [products] = await db.query(`
            SELECT p.product_id, p.name 
            FROM products p 
            LEFT JOIN product_variants v ON p.product_id = v.product_id 
            WHERE v.variant_id IS NULL
        `);

        console.log(`Found ${products.length} products without variants. Creating variants...`);

        const colors = ['Black', 'White', 'Red', 'Blue', 'Navy', 'Beige', 'Gray', 'Green', 'Pink', 'Brown'];
        const sizes  = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

        // Mỗi sản phẩm sẽ nhận: 3 màu ngẫu nhiên x 4 size ngẫu nhiên = 12 biến thể
        const variantsPerProduct_colors = 3;
        const variantsPerProduct_sizes  = 4;

        let totalInserted = 0;
        let variantCounter = 90000; // bắt đầu SKU từ số lớn để tránh trùng

        for (const product of products) {
            const pid = product.product_id;

            // Chọn ngẫu nhiên màu và size
            const shuffledColors = [...colors].sort(() => Math.random() - 0.5).slice(0, variantsPerProduct_colors);
            const shuffledSizes  = [...sizes].sort(() => Math.random() - 0.5).slice(0, variantsPerProduct_sizes);

            // Giá ngẫu nhiên 20–200 USD
            const basePrice = (Math.random() * 180 + 20).toFixed(2);

            const values = [];
            for (const color of shuffledColors) {
                for (const size of shuffledSizes) {
                    const sku = `SKU-${variantCounter}-${pid}-${color.toUpperCase().replace(/\s/g,'-')}-${size}`;
                    const stock = Math.floor(Math.random() * 90) + 10; // 10–100
                    // Nhỏ giá theo size: XS/S giảm 5%, XL/XXL tăng 5%
                    let priceMod = parseFloat(basePrice);
                    if (size === 'XS' || size === 'S') priceMod = (priceMod * 0.95).toFixed(2);
                    else if (size === 'XL' || size === 'XXL') priceMod = (priceMod * 1.05).toFixed(2);
                    values.push([pid, sku, color, size, priceMod, stock]);
                    variantCounter++;
                }
            }

            await db.query(
                'INSERT INTO product_variants (product_id, sku, color, size, price, stock_quantity) VALUES ?',
                [values]
            );
            totalInserted += values.length;

            if (totalInserted % 1000 === 0 || totalInserted < 50) {
                console.log(`  Inserted ${totalInserted} variants so far...`);
            }
        }

        console.log(`\nDone! Total variants inserted: ${totalInserted} for ${products.length} products.`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

seedMissingVariants();
