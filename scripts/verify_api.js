const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let token = '';
let productId = 1; // Assuming product 1 exists, otherwise we fetch one
let cartId = '';

const testAuth = async () => {
    try {
        const timestamp = Date.now();
        // Signup
        try {
            await axios.post(`${BASE_URL}/auth/signup`, {
                name: `Test User ${timestamp}`,
                email: `test${timestamp}@example.com`,
                password: 'password123'
            });
            console.log('✅ Signup successful');
        } catch (e) {
            console.log('ℹ️ Signup skipped or failed (might exist):', e.response?.data?.message || e.message);
        }

        // Login
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: `test${timestamp}@example.com`,
            password: 'password123'
        });
        token = loginRes.data.token;
        console.log('✅ Login successful');
    } catch (err) {
        console.error('❌ Auth failed:', err.response?.data || err.message);
        process.exit(1);
    }
};

const testProducts = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/products`);
        console.log('✅ Fetched products:', res.data.products?.length || res.data.length);
        if (res.data.products && res.data.products.length > 0) {
            productId = res.data.products[0].id;
        }
    } catch (err) {
        console.error('❌ Products failed:', err.response?.data || err.message);
    }
};

const testCart = async () => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Add to cart
        await axios.post(`${BASE_URL}/cart/add`, {
            productId: productId,
            quantity: 1
        }, config);
        console.log('✅ Added to cart');

        // Get cart
        const res = await axios.get(`${BASE_URL}/cart`, config);
        console.log('✅ Fetched cart:', res.data);
    } catch (err) {
        console.error('❌ Cart failed:', err.response?.data || err.message);
    }
};

const testOrder = async () => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Create order
        const res = await axios.post(`${BASE_URL}/orders`, {}, config);
        console.log('✅ Order created:', res.data);
    } catch (err) {
        console.error('❌ Order failed:', err.response?.data || err.message);
    }
}

const run = async () => {
    await testAuth();
    await testProducts();
    await testCart();
    await testOrder();
};

run();
