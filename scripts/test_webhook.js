const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const SECRET = process.env.GITHUB_SECRET || 'test_secret';
const URL = 'http://localhost:5000/api/webhooks/github';

const payload = {
    ref: 'refs/heads/main',
    repository: {
        name: 'ecom_db'
    },
    pusher: {
        name: 'test_user'
    }
};

const payloadString = JSON.stringify(payload);
const hmac = crypto.createHmac('sha256', SECRET);
const signature = 'sha256=' + hmac.update(payloadString).digest('hex');

const run = async () => {
    try {
        console.log(`Sending webhook to ${URL}`);
        console.log(`Using secret: ${SECRET}`);

        const res = await axios.post(URL, payload, {
            headers: {
                'x-hub-signature-256': signature,
                'x-github-event': 'push',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Webhook sent successfully');
        console.log('Response status:', res.status);
        console.log('Response data:', res.data);
    } catch (err) {
        console.error('❌ Webhook failed');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
};

run();
