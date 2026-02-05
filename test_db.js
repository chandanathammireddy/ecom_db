require('dotenv').config();
const db = require('./config/db');

async function testConnection() {
    try {
        console.log('Testing connection...');
        const [rows] = await db.query('SELECT 1 as val');
        console.log('Connection successful:', rows);
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

testConnection();
