const express = require('express');
const controller = require('../controllers/productController');
const validateObjectId = require('../middleware/validateObjectId');
const router = express.Router();

router.post('/', controller.createProduct);
router.get('/', controller.getProducts);
router.get('/reports/low-stock', controller.lowStockReport);
router.get('/reports/category-summary', controller.categorySummary);
router.get('/:id', validateObjectId, controller.getProductById);
router.patch('/:id', validateObjectId, controller.updateProduct);
router.patch('/:id/restock', validateObjectId, controller.restockProduct);
router.patch('/:id/sale', validateObjectId, controller.sellProduct);
router.delete('/:id', validateObjectId, controller.deleteProduct);

module.exports = router;
