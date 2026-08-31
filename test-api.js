/**
 * Automated Verification Script for JSON File Backend API
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            raw: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Backend Verification Tests...\n');

  try {
    // 1. Check stats
    console.log('1. Testing GET /api/stats...');
    const statsRes = await request('GET', '/api/stats');
    console.log('   Status:', statsRes.status);
    console.log('   Data:', statsRes.data.data);
    if (statsRes.status !== 200 || !statsRes.data.success) throw new Error('Stats test failed');

    // 2. Fetch all products
    console.log('\n2. Testing GET /api/products...');
    const getAllRes = await request('GET', '/api/products');
    console.log(`   Status: ${getAllRes.status}, Total Products: ${getAllRes.data.count}`);
    if (getAllRes.status !== 200 || getAllRes.data.count < 1) throw new Error('GET /api/products failed');

    // 3. Create a new product
    console.log('\n3. Testing POST /api/products (Adding new product)...');
    const newProductPayload = {
      id: "prod_test_99",
      name: "Organic Himalayan Green Tea (100g)",
      category: "beverages",
      price: 450,
      unit: "pack",
      badge: "Organic",
      image: "images/prod-beverages.jpg",
      inStock: true,
      description: "Hand-plucked high altitude organic green tea leaves."
    };
    const createRes = await request('POST', '/api/products', newProductPayload);
    console.log('   Status:', createRes.status);
    console.log('   Created product:', createRes.data.data.name, 'with ID:', createRes.data.data.id);
    if (createRes.status !== 201 || !createRes.data.success) throw new Error('POST /api/products failed');

    // 4. Fetch the created product by ID
    console.log('\n4. Testing GET /api/products/prod_test_99...');
    const getSingleRes = await request('GET', '/api/products/prod_test_99');
    console.log('   Status:', getSingleRes.status);
    console.log('   Found product:', getSingleRes.data.data.name);
    if (getSingleRes.status !== 200 || getSingleRes.data.data.id !== 'prod_test_99') throw new Error('GET /api/products/:id failed');

    // 5. Update the product
    console.log('\n5. Testing PUT /api/products/prod_test_99 (Updating price & stock)...');
    const updateRes = await request('PUT', '/api/products/prod_test_99', {
      price: 499,
      inStock: false
    });
    console.log('   Status:', updateRes.status);
    console.log('   Updated price:', updateRes.data.data.price, 'inStock:', updateRes.data.data.inStock);
    if (updateRes.status !== 200 || updateRes.data.data.price !== 499 || updateRes.data.data.inStock !== false) {
      throw new Error('PUT /api/products/:id failed');
    }

    // 6. Test Filtering by Category
    console.log('\n6. Testing GET /api/products?category=beverages...');
    const filterRes = await request('GET', '/api/products?category=beverages');
    console.log(`   Found ${filterRes.data.count} beverage items.`);
    if (filterRes.status !== 200) throw new Error('Category filter failed');

    // 7. Test Search Query
    console.log('\n7. Testing GET /api/products?q=Himalayan...');
    const searchRes = await request('GET', '/api/products?q=Himalayan');
    console.log(`   Found ${searchRes.data.count} items matching "Himalayan"`);
    if (searchRes.status !== 200 || searchRes.data.count < 1) throw new Error('Search query failed');

    // 8. Delete the test product
    console.log('\n8. Testing DELETE /api/products/prod_test_99...');
    const deleteRes = await request('DELETE', '/api/products/prod_test_99');
    console.log('   Status:', deleteRes.status);
    console.log('   Deleted:', deleteRes.data.data.name);
    if (deleteRes.status !== 200 || !deleteRes.data.success) throw new Error('DELETE /api/products/:id failed');

    // 9. Confirm deletion
    console.log('\n9. Confirming 404 for deleted product...');
    const confirmDelete = await request('GET', '/api/products/prod_test_99');
    console.log('   Status:', confirmDelete.status);
    if (confirmDelete.status !== 404) throw new Error('Product still exists after deletion');

    console.log('\n✅ ALL BACKEND AND JSON DATABASE TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ Test failure:', err.message);
    process.exit(1);
  }
}

runTests();
