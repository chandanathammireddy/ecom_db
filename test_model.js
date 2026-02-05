require('dotenv').config();
const User = require('./models/User');

async function testUser() {
    try {
        console.log('Testing User.findByEmail...');
        const users = await User.findByEmail('test@example.com');
        console.log('User.findByEmail successful. Users found:', users.length);
        process.exit(0);
    } catch (err) {
        console.error('User.findByEmail failed:', err);
        process.exit(1);
    }
}

testUser();
