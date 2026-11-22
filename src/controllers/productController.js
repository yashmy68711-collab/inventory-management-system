const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, message: 'Product created successfully', data: product });
});

const getProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, inStock, sort = '-createdAt' } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const filter = { isActive: true };

  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  if (search) filter.$text = { $search: search };
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    if (Object.values(filter.price).some(Number.isNaN)) {
      return res.status(400).json({ success: false, message: 'minPrice and maxPrice must be valid numbers' });
    }
  }
  if (inStock === 'true') filter.quantity = { $gt: 0 };
  if (inStock === 'false') filter.quantity = 0;

  const allowedSortFields = ['name', 'price', 'quantity', 'createdAt', 'category'];
  const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
  if (!allowedSortFields.includes(sortField)) {
    return res.status(400).json({ success: false, message: `sort must use one of: ${allowedSortFields.join(', ')}` });
  }
  const sortSpec = { [sortField]: sort.startsWith('-') ? -1 : 1 };
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortSpec).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter)
  ]);

  res.json({ success: true, count: products.length, pagination: {
    total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total,
    hasPreviousPage: page > 1
  }, data: products });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'description', 'category', 'price', 'reorderLevel', 'supplier', 'isActive'];
  const updates = {};
  for (const key of allowedFields) if (req.body[key] !== undefined) updates[key] = req.body[key];
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'Provide at least one editable field. Use stock endpoints to change quantity.' });
  }
  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product updated successfully', data: product });
});

const adjustStock = (operation) => asyncHandler(async (req, res) => {
  const amount = Number(req.body.quantity);
  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'quantity must be a positive integer' });
  }
  const filter = { _id: req.params.id, isActive: true };
  const update = operation === 'restock'
    ? { $inc: { quantity: amount } }
    : { $inc: { quantity: -amount } };
  if (operation === 'sale') filter.quantity = { $gte: amount };
  const product = await Product.findOneAndUpdate(filter, update, { new: true, runValidators: true });
  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    return res.status(exists ? 400 : 404).json({ success: false,
      message: exists ? 'Insufficient stock or product is inactive' : 'Product not found' });
  }
  res.json({ success: true, message: operation === 'restock' ? 'Stock replenished successfully' : 'Sale recorded successfully', data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product deleted successfully', data: { id: product._id, sku: product.sku } });
});

const lowStockReport = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, $expr: { $lte: ['$quantity', '$reorderLevel'] } })
    .sort({ quantity: 1, name: 1 });
  res.json({ success: true, count: products.length, data: products });
});

const categorySummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', productCount: { $sum: 1 }, totalUnits: { $sum: '$quantity' },
      inventoryValue: { $sum: { $multiply: ['$price', '$quantity'] } },
      lowStockProducts: { $sum: { $cond: [{ $lte: ['$quantity', '$reorderLevel'] }, 1, 0] } } } },
    { $project: { _id: 0, category: '$_id', productCount: 1, totalUnits: 1,
      inventoryValue: { $round: ['$inventoryValue', 2] }, lowStockProducts: 1 } },
    { $sort: { category: 1 } }
  ]);
  res.json({ success: true, count: summary.length, data: summary });
});

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'); }

module.exports = { createProduct, getProducts, getProductById, updateProduct,
  restockProduct: adjustStock('restock'), sellProduct: adjustStock('sale'),
  deleteProduct, lowStockReport, categorySummary };
