/**
 * Pramila Store Backend Server
 * JSON File-based Product Database
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'products.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// ============================================
// JSON DATABASE HELPERS
// ============================================

/**
 * Read all products from the JSON database file
 */
async function readProducts() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist yet, initialize with empty array
      await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
      await fs.writeFile(DB_FILE, '[]', 'utf8');
      return [];
    }
    throw err;
  }
}

/**
 * Write products array to the JSON database file atomically
 */
async function writeProducts(products) {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  const jsonContent = JSON.stringify(products, null, 2);
  const tempFile = `${DB_FILE}.tmp`;
  
  // Write to temporary file first then rename for atomic persistence
  await fs.writeFile(tempFile, jsonContent, 'utf8');
  await fs.rename(tempFile, DB_FILE);
}

/**
 * Helper to generate a unique product ID
 */
function generateId(products) {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `prod_${timestamp}_${randomSuffix}`;
}

// ============================================
// REST API ROUTES
// ============================================

/**
 * GET /api/products
 * Query Params:
 * - category: filter by category (e.g. rice, dals, snacks)
 * - q or search: search in name, description, category
 * - inStock: boolean filter (true/false)
 * - sort: 'price_asc', 'price_desc', 'name', 'newest'
 */
app.get('/api/products', async (req, res) => {
  try {
    let products = await readProducts();
    const { category, q, search, inStock, sort } = req.query;
    const query = (q || search || '').trim().toLowerCase();

    // Filter by Category
    if (category && category !== 'all') {
      products = products.filter(
        p => p.category && p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by In-Stock status
    if (inStock !== undefined) {
      const isStock = inStock === 'true' || inStock === '1';
      products = products.filter(p => Boolean(p.inStock) === isStock);
    }

    // Filter by Search Query
    if (query) {
      products = products.filter(p => {
        const nameMatch = p.name && p.name.toLowerCase().includes(query);
        const descMatch = p.description && p.description.toLowerCase().includes(query);
        const catMatch = p.category && p.category.toLowerCase().includes(query);
        return nameMatch || descMatch || catMatch;
      });
    }

    // Sorting
    if (sort) {
      if (sort === 'price_asc') {
        products.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      } else if (sort === 'price_desc') {
        products.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      } else if (sort === 'name') {
        products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } else if (sort === 'newest') {
        products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }
    }

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to read products database', error: error.message });
  }
});

/**
 * GET /api/products/:id
 * Get single product details by ID
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const products = await readProducts();
    const product = products.find(p => String(p.id) === String(req.params.id));

    if (!product) {
      return res.status(404).json({ success: false, message: `Product with ID '${req.params.id}' not found` });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
  }
});

/**
 * POST /api/products
 * Create a new product and append to the JSON file
 * Body: { name, category, price, unit, badge, image, inStock, description }
 */
app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price, unit, badge, image, inStock, description } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative price is required' });
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Product category is required' });
    }

    const products = await readProducts();

    const now = new Date().toISOString();
    const newProduct = {
      id: req.body.id ? String(req.body.id) : generateId(products),
      name: name.trim(),
      category: category.trim().toLowerCase(),
      price: Number(price),
      unit: unit ? String(unit).trim() : 'item',
      badge: badge ? String(badge).trim() : null,
      image: image ? String(image).trim() : 'images/prod-rice.jpg',
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      description: description ? String(description).trim() : '',
      createdAt: now,
      updatedAt: now
    };

    // Check if duplicate ID exists
    if (products.some(p => String(p.id) === newProduct.id)) {
      return res.status(409).json({ success: false, message: `Product with ID '${newProduct.id}' already exists` });
    }

    products.push(newProduct);
    await writeProducts(products);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to save product', error: error.message });
  }
});

/**
 * PUT /api/products/:id
 * Update an existing product in the JSON file
 */
app.put('/api/products/:id', async (req, res) => {
  try {
    const products = await readProducts();
    const index = products.findIndex(p => String(p.id) === String(req.params.id));

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Product with ID '${req.params.id}' not found` });
    }

    const existing = products[index];
    const { name, category, price, unit, badge, image, inStock, description } = req.body;

    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
    }

    const updatedProduct = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      category: category !== undefined ? category.trim().toLowerCase() : existing.category,
      price: price !== undefined ? Number(price) : existing.price,
      unit: unit !== undefined ? String(unit).trim() : existing.unit,
      badge: badge !== undefined ? (badge ? String(badge).trim() : null) : existing.badge,
      image: image !== undefined ? String(image).trim() : existing.image,
      inStock: inStock !== undefined ? Boolean(inStock) : existing.inStock,
      description: description !== undefined ? String(description).trim() : existing.description,
      updatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    await writeProducts(products);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product from the JSON file
 */
app.delete('/api/products/:id', async (req, res) => {
  try {
    const products = await readProducts();
    const index = products.findIndex(p => String(p.id) === String(req.params.id));

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Product with ID '${req.params.id}' not found` });
    }

    const [deletedProduct] = products.splice(index, 1);
    await writeProducts(products);

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
});

/**
 * GET /api/categories
 * Get all available categories with product counts
 */
app.get('/api/categories', async (req, res) => {
  try {
    const products = await readProducts();
    const counts = {};

    products.forEach(p => {
      const cat = p.category || 'uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const categories = Object.keys(counts).map(key => ({
      name: key,
      productCount: counts[key]
    }));

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to get categories', error: error.message });
  }
});

/**
 * GET /api/stats
 * Overview database statistics
 */
app.get('/api/stats', async (req, res) => {
  try {
    const products = await readProducts();
    const categories = new Set(products.map(p => p.category)).size;
    const inStockCount = products.filter(p => p.inStock).length;
    const outOfStockCount = products.length - inStockCount;

    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        totalCategories: categories,
        inStock: inStockCount,
        outOfStock: outOfStockCount,
        databaseFile: DB_FILE
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to get stats', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛒 Pramila Store Backend running at: http://localhost:${PORT}`);
  console.log(`📁 JSON Database File: ${DB_FILE}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   - GET    /api/products`);
  console.log(`   - GET    /api/products/:id`);
  console.log(`   - POST   /api/products`);
  console.log(`   - PUT    /api/products/:id`);
  console.log(`   - DELETE /api/products/:id`);
  console.log(`   - GET    /api/categories`);
  console.log(`   - GET    /api/stats`);
  console.log(`====================================================`);
});
