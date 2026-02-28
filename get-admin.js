const { Client } = require('pg');

async function getAdmin() {
    const client = new Client({
        connectionString: 'postgresql://neondb_owner:npg_hxj7qgkZuoI5@ep-nameless-wind-ac3q998i-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
    });

    try {
        await client.connect();
        const res = await client.query('SELECT name, email FROM "AdminUser"');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Database connection error:', err.message);
    } finally {
        await client.end();
    }
}

getAdmin();
