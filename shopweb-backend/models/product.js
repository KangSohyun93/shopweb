const pool = require('../config/db');

const Product = {
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT p.product_id, p.name, p.description, p.category_id, p.brand_id, p.primary_image_url,
             c.name as category_name, b.name as brand_name,
             pv.variant_id, pv.sku, pv.size, pv.price, pv.stock_quantity, pv.image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_variants pv ON p.product_id = pv.product_id
    `);
    console.log('Raw data from getAll query:', rows);

    const products = {};
    rows.forEach(row => {
      if (!products[row.product_id]) {
        products[row.product_id] = {
          product_id: row.product_id,
          name: row.name,
          description: row.description,
          category_id: row.category_id,
          brand_id: row.brand_id,
          primary_image_url: row.primary_image_url,
          category_name: row.category_name,
          brand_name: row.brand_name,
          additional_images: [],
          variants: []
        };
      }
      if (row.variant_id) {
        products[row.product_id].variants.push({
          variant_id: row.variant_id,
          sku: row.sku,
          size: row.size,
          price: row.price,
          stock_quantity: row.stock_quantity,
          image_url: row.image_url
        });
      }
    });

    const productIds = Object.keys(products).map(id => parseInt(id));
    if (productIds.length > 0) {
      const [productImages] = await pool.query(`
        SELECT image_id, product_id, image_url
        FROM product_images
        WHERE product_id IN (?)
      `, [productIds]);
      productImages.forEach(img => {
        if (products[img.product_id]) {
          products[img.product_id].additional_images.push({
            image_id: img.image_id,
            image_url: img.image_url
          });
        }
      });
    }

    const result = Object.values(products);
    console.log('Processed data from getAll:', result);
    return result;
  },

  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT p.product_id, p.name, p.description, p.category_id, p.brand_id, p.primary_image_url,
             c.name as category_name, b.name as brand_name,
             pv.variant_id, pv.sku, pv.size, pv.price, pv.stock_quantity, pv.image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_variants pv ON p.product_id = pv.product_id
      WHERE p.product_id = ?
    `, [id]);
    if (!rows.length) return null;
    const product = {
      product_id: rows[0].product_id,
      name: rows[0].name,
      description: rows[0].description,
      category_id: rows[0].category_id,
      brand_id: rows[0].brand_id,
      primary_image_url: rows[0].primary_image_url,
      category_name: rows[0].category_name,
      brand_name: rows[0].brand_name,
      additional_images: [],
      variants: []
    };
    rows.forEach(row => {
      if (row.variant_id) {
        product.variants.push({
          variant_id: row.variant_id,
          sku: row.sku,
          size: row.size,
          price: row.price,
          stock_quantity: row.stock_quantity,
          image_url: row.image_url
        });
      }
    });

    const [productImages] = await pool.query(`
      SELECT image_id, image_url
      FROM product_images
      WHERE product_id = ?
    `, [id]);
    product.additional_images = productImages;

    return product;
  },

  create: async ({ name, description, category_id, brand_id, primary_image_url, additional_images, variants }) => {
    const [result] = await pool.query(`
      INSERT INTO products (name, description, category_id, brand_id, primary_image_url)
      VALUES (?, ?, ?, ?, ?)
    `, [name, description, category_id || null, brand_id || null, primary_image_url || null]);
    const productId = result.insertId;

    if (additional_images && additional_images.length > 0) {
      const imageValues = additional_images.map(img => [productId, img.image_url]);
      await pool.query(`
        INSERT INTO product_images (product_id, image_url)
        VALUES ?
      `, [imageValues]);
    }

    for (const variant of variants) {
      await pool.query(`
        INSERT INTO product_variants (product_id, sku, size, price, stock_quantity, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [productId, variant.sku, variant.size, variant.price, variant.stock_quantity, variant.image_url || null]);
    }
    return productId;
  },

  update: async (product_id, { name, description, category_id, brand_id, primary_image_url, additional_images, variants }) => {
    await pool.query(`
      UPDATE products
      SET name = ?, description = ?, category_id = ?, brand_id = ?, primary_image_url = ?
      WHERE product_id = ?
    `, [name, description, category_id || null, brand_id || null, primary_image_url || null, product_id]);
    await pool.query('DELETE FROM product_variants WHERE product_id = ?', [product_id]);
    await pool.query('DELETE FROM product_images WHERE product_id = ?', [product_id]);

    if (additional_images && additional_images.length > 0) {
      const imageValues = additional_images.map(img => [product_id, img.image_url]);
      await pool.query(`
        INSERT INTO product_images (product_id, image_url)
        VALUES ?
      `, [imageValues]);
    }

    for (const variant of variants) {
      await pool.query(`
        INSERT INTO product_variants (product_id, sku, size, price, stock_quantity, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [product_id, variant.sku, variant.size, variant.price, variant.stock_quantity, variant.image_url || null]);
    }
  },

  delete: async (product_id) => {
    await pool.query('DELETE FROM product_variants WHERE product_id = ?', [product_id]);
    await pool.query('DELETE FROM product_images WHERE product_id = ?', [product_id]);
    await pool.query('DELETE FROM products WHERE product_id = ?', [product_id]);
  },

  searchByName: async (query) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT p.product_id, p.name, p.description, p.primary_image_url,
            MIN(pv.price) as price, c.name as category_name, b.name as brand_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.category_id
     LEFT JOIN brands b ON p.brand_id = b.brand_id
     LEFT JOIN product_variants pv ON p.product_id = pv.product_id
     WHERE p.name LIKE ?
     GROUP BY p.product_id, p.name, p.description, p.primary_image_url, c.name, b.name`,
    [`%${query}%`]
  );
  console.log('Raw search results from DB:', rows);

  if (!rows.length) return [];

  const products = {};
  rows.forEach(row => {
    products[row.product_id] = {
      product_id: row.product_id,
      name: row.name,
      description: row.description,
      primary_image_url: row.primary_image_url,
      category_name: row.category_name,
      brand_name: row.brand_name,
      price: row.price || 0
    };
  });

  return Object.values(products);
},
};

module.exports = Product;