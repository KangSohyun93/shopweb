const db = require('./config/db');

async function seedBrands() {
    try {
        const newBrands = [
            'Nike', 'Adidas', 'Gucci', 'Chanel', 'Louis Vuitton', 
            'Mango', "Levi's", 'Calvin Klein', 'Puma', 'Vans',
            'Converse', 'Balenciaga', 'Dior', 'Prada', 'Burberry'
        ];
        
        console.log('Inserting new brands...');
        for (const brand of newBrands) {
            // Check if exists
            const [exist] = await db.query('SELECT brand_id FROM brands WHERE name = ?', [brand]);
            if (exist.length === 0) {
                await db.query('INSERT INTO brands (name) VALUES (?)', [brand]);
            }
        }
        
        console.log('Fetching all brand IDs...');
        const [brands] = await db.query('SELECT brand_id FROM brands');
        const brandIds = brands.map(b => b.brand_id);
        
        console.log('Updating products with random brands...');
        // To be safe and somewhat fast, we can run a single query if MySQL supports it, 
        // but simple loop is fine for a few thousand products. Let's do batches.
        const [products] = await db.query('SELECT product_id FROM products');
        console.log(`Found ${products.length} products to update.`);
        
        let count = 0;
        for (const product of products) {
            const randomBrandId = brandIds[Math.floor(Math.random() * brandIds.length)];
            await db.query('UPDATE products SET brand_id = ? WHERE product_id = ?', [randomBrandId, product.product_id]);
            count++;
            if (count % 500 === 0) console.log(`Updated ${count} products...`);
        }
        
        console.log('Fixing missing primary_image_url for product 4760...');
        await db.query("UPDATE products SET primary_image_url = 'https://res.cloudinary.com/dqc5iquvu/image/upload/v1779377484/shopweb_products/A-line_Dress/img_00000001.jpg' WHERE product_id = 4760");

        console.log('Finished updating brands and missing fields!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seedBrands();
