const express = require('express');
const productRoutes = require('./routes/productRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => res.json({ success: true, message: 'Inventory Management API is running', endpoints: '/api/products' }));
app.get('/api/health', (req, res) => res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() }));
app.use('/api/products', productRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
