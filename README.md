<<<<<<< HEAD
# Lab 3 – Inventory and Data Management System

**Course:** Web Dev III | **Unit:** 3 | **CO:** CO3

A RESTful inventory backend built only with the assignment's permitted stack: Node.js, Express.js, MongoDB, Mongoose and dotenv.

## 1. Requirements
- Node.js 18 or newer and npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string

## 2. Installation and run
1. Extract the ZIP and open this project folder in VS Code / terminal.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment file by copying `.env.example` to `.env`.
   - Windows PowerShell: `Copy-Item .env.example .env`
   - Windows CMD: `copy .env.example .env`
4. Open `.env` and set `MONGODB_URI` to your MongoDB connection string. The default is for a local MongoDB server:
   `mongodb://127.0.0.1:27017/lab3_inventory`
5. Start MongoDB if it is installed locally. For MongoDB Atlas, use the connection string provided by Atlas and ensure your IP is allowed.
6. Start the API:
   ```bash
   npm start
   ```
   For development with Node's watch mode: `npm run dev`.
7. Visit `http://localhost:5000` or `http://localhost:5000/api/health`.

Do not share or commit `.env`. The `.gitignore` file excludes it.

## 3. Product schema
| Field | Type | Rules |
|---|---|---|
| name | String | Required, trimmed, 2–100 characters |
| sku | String | Required, unique, uppercase, 3–30 characters |
| description | String | Optional, max 500 characters |
| category | String | Required, max 60 characters |
| price | Number | Required, minimum 0 |
| quantity | Number | Required, integer, minimum 0 |
| reorderLevel | Number | Integer, minimum 0, default 10 |
| supplier | String | Optional, max 100 characters |
| isActive | Boolean | Default true |
| timestamps | Date | Mongoose automatically maintains createdAt and updatedAt |

`reorderLevel` defines the low-stock threshold for each product. A product is low-stock when `quantity <= reorderLevel`.

## 4. API endpoints
Base URL: `http://localhost:5000/api/products`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/` | Create product |
| GET | `/` | List products with filtering, sorting and pagination |
| GET | `/:id` | Get one product |
| PATCH | `/:id` | Update product details (not quantity) |
| PATCH | `/:id/restock` | Add stock |
| PATCH | `/:id/sale` | Record a sale / subtract stock safely |
| DELETE | `/:id` | Delete product |
| GET | `/reports/low-stock` | Low-stock alert report |
| GET | `/reports/category-summary` | Category aggregation report |

### Create product – POST `/`
JSON body:
```json
{
  "name": "Wireless Mouse",
  "sku": "WM-1001",
  "description": "2.4 GHz wireless optical mouse",
  "category": "Electronics",
  "price": 599,
  "quantity": 25,
  "reorderLevel": 5,
  "supplier": "ABC Traders"
}
```

### List / filter / sort / paginate – GET `/`
Examples:
- `/api/products?page=1&limit=10`
- `/api/products?category=Electronics`
- `/api/products?search=wireless`
- `/api/products?minPrice=100&maxPrice=1000`
- `/api/products?inStock=true`
- `/api/products?sort=price` (ascending)
- `/api/products?sort=-price` (descending)
- Combine parameters, e.g. `/api/products?category=Electronics&inStock=true&sort=-price&page=1&limit=5`

Allowed sort fields: `name`, `price`, `quantity`, `createdAt`, `category`. Page defaults to 1; limit defaults to 10 and is capped at 100.

### Get one – GET `/:id`
Example: `GET /api/products/PRODUCT_OBJECT_ID`

### Update details – PATCH `/:id`
JSON body (send only fields to change):
```json
{ "price": 649, "reorderLevel": 8, "supplier": "New Supplier" }
```
Quantity is intentionally changed through the dedicated stock endpoints so stock operations are explicit and safe.

### Restock – PATCH `/:id/restock`
```json
{ "quantity": 10 }
```
### Sale – PATCH `/:id/sale`
```json
{ "quantity": 3 }
```
Stock adjustment uses MongoDB's atomic `$inc` operation. A sale also checks that enough stock exists in the same database operation, preventing quantity from becoming negative under concurrent requests.

### Delete – DELETE `/:id`
Example: `DELETE /api/products/PRODUCT_OBJECT_ID`

### Low-stock report – GET `/reports/low-stock`
Returns active products whose quantity is less than or equal to their reorder level.

### Category summary – GET `/reports/category-summary`
Uses an aggregation pipeline (`$match`, `$group`, `$project`, `$sort`) to calculate product count, total units, inventory value (`price × quantity`) and low-stock product count per category.

## 5. Validation and error handling
- Mongoose validates required fields, lengths, numeric ranges, integer stock and unique SKU.
- Invalid MongoDB IDs return HTTP 400.
- Missing products return HTTP 404.
- Duplicate SKU returns HTTP 409.
- Validation failures return HTTP 400 with validation details.
- Insufficient stock returns HTTP 400 without changing the inventory.
- A centralized error middleware formats unexpected and database errors.

## 6. Suggested practical test sequence
1. Start MongoDB and run `npm start`.
2. Check `GET /api/health`.
3. Create two products in different categories using `POST /api/products`.
4. List products using `GET /api/products?sort=-price&page=1&limit=5`.
5. Get one product by its returned `_id`.
6. Update its price using `PATCH /:id`.
7. Restock it, then record a sale using the stock endpoints.
8. Try a sale larger than available stock and confirm it is rejected.
9. Set a product quantity at or below its reorder level and call the low-stock report.
10. Call category summary and verify category totals and inventory value.
11. Delete a test product.

## 7. Project structure
```text
lab3_inventory_system/
├── src/
│   ├── config/db.js
│   ├── controllers/productController.js
│   ├── middleware/errorHandler.js
│   ├── middleware/validateObjectId.js
│   ├── models/Product.js
│   ├── routes/productRoutes.js
│   ├── utils/asyncHandler.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 8. Concepts demonstrated
Mongoose schema design and field validation; Express routing and middleware; RESTful CRUD; query-string filtering, sorting and pagination; MongoDB aggregation; safe stock increments/decrements; dotenv configuration; and centralized error handling.

**Note:** The assignment PDF names the required features but does not prescribe exact product fields or endpoint paths. This implementation uses the documented schema and REST endpoints above as a clear, consistent design.
=======
# inventory-management-system
Web Dev 3 Ass - 3
>>>>>>> eada60b7ef8f20a7000bcd333c497b9a9c2d665a
