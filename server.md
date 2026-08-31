# Pramila Store Backend (JSON File Database)

This backend manages product storage using a clean JSON file (`data/products.json`) as the database without needing external databases.

## How to Start the Backend

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the server
npm start
# Or for auto-reload during development:
npm run dev
```

The server runs at: `http://localhost:3000`

---

## JSON Database File Location

- **Database File**: [`data/products.json`](file:///Users/anilmaharjan/Desktop/website/jacksean89k-max.github.io/data/products.json)
- All product creations (`POST`), updates (`PUT`), and deletions (`DELETE`) are automatically saved to this JSON file in real time with atomic writes.

---

## API Endpoints & Examples

### 1. Get All Products (with optional filtering & search)
```bash
# Get all products
curl http://localhost:3000/api/products

# Filter by category
curl "http://localhost:3000/api/products?category=rice"

# Search by keyword
curl "http://localhost:3000/api/products?q=masino"

# Sort by price ascending
curl "http://localhost:3000/api/products?sort=price_asc"
```

### 2. Get Single Product
```bash
curl http://localhost:3000/api/products/prod_1
```

### 3. Add a New Product (Saves to `data/products.json`)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Green Cardamom (50g)",
    "category": "spices",
    "price": 250,
    "unit": "pack",
    "badge": "Fresh",
    "image": "images/prod-rice.jpg",
    "inStock": true,
    "description": "High aromatic organic green cardamom pods."
  }'
```

### 4. Update an Existing Product
```bash
curl -X PUT http://localhost:3000/api/products/prod_1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 2300,
    "inStock": true
  }'
```

### 5. Delete a Product
```bash
curl -X DELETE http://localhost:3000/api/products/prod_1
```

### 6. Get Categories Summary
```bash
curl http://localhost:3000/api/categories
```

### 7. Get Database Statistics
```bash
curl http://localhost:3000/api/stats
```

---

## Running Automated Tests

```bash
npm test
```
