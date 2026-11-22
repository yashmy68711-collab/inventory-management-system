const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Product name is required'],
    trim: true, minlength: [2, 'Name must contain at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  sku: {
    type: String, required: [true, 'SKU is required'], unique: true,
    trim: true, uppercase: true, minlength: 3, maxlength: 30
  },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  category: {
    type: String, required: [true, 'Category is required'],
    trim: true, maxlength: 60
  },
  price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
  quantity: {
    type: Number, required: true, min: [0, 'Quantity cannot be negative'],
    validate: { validator: Number.isInteger, message: 'Quantity must be an integer' }
  },
  reorderLevel: {
    type: Number, default: 10, min: [0, 'Reorder level cannot be negative'],
    validate: { validator: Number.isInteger, message: 'Reorder level must be an integer' }
  },
  supplier: { type: String, trim: true, maxlength: 100, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

productSchema.index({ name: 'text', description: 'text', sku: 'text' });
productSchema.index({ category: 1, quantity: 1 });

module.exports = mongoose.model('Product', productSchema);
