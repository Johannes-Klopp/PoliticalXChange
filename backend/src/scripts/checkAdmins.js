require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAdmins() {
    console.log('🔍 Checking admins in database...\n');

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL not found');
        process.exit(1);
    }

    const connection = await mysql.createConnection(dbUrl);

    try {
        const [admins] = await connection.query('SELECT id, username, created_at FROM admins');

        if (admins.length === 0) {
            console.log('❌ No admin users found in database');
            console.log('\nCreating default admin...');

            const defaultPasswordHash = '$2a$10$rQUeVhG5yGz6YhqK5xJYWuXMF8qL.nZ7WVZ9xGp0qYvKqF8yL5QZ.';
            await connection.query(
                'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
                ['admin', defaultPasswordHash]
            );

            console.log('✅ Admin user created!');
            console.log('   Username: admin');
            console.log('   Password: ChangeMeNow123!');
        } else {
            console.log(`✅ Found ${admins.length} admin user(s):\n`);
            admins.forEach((admin, index) => {
                console.log(`${index + 1}. Username: ${admin.username}`);
                console.log(`   ID: ${admin.id}`);
                console.log(`   Created: ${admin.created_at}\n`);
            });
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkAdmins()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
