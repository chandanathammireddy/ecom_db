const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

const run = async () => {
    try {
        console.log('Attempting login...');
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@example.com', // Try a known or dummy email
            password: 'password'
        });
        console.log('Login success:', res.data);
    } catch (err) {
        console.error('Login Failed!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else if (err.request) {
            console.error('No response received:', err.message);
        } else {
            console.error('Error setup:', err.message);
        }
    }
};

run();
