const express = require('express');
const pool = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const productVariantRoutes = require('./routes/productVariantRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});
// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/product-variants', productVariantRoutes);
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);


// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ShopWeb API' });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({ message: 'Database connected', result: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});
app.use((req, res, next) => {
  console.log('No route matched:', req.path);
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});