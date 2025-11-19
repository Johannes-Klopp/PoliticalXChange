require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    console.log('🔄 Connecting to Railway MySQL database...');

    // Parse DATABASE_URL from Railway
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL not found in environment variables');
        process.exit(1);
    }

    // Create connection
    const connection = await mysql.createConnection(dbUrl);

    console.log('✅ Connected to database');

    try {
        // Read and execute SQL schema
        const sqlContent = fs.readFileSync(
            path.join(__dirname, 'database-railway.sql'),
            'utf8'
        );

        // Split by semicolons and execute each statement
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📝 Executing ${statements.length} SQL statements...`);

        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }

        console.log('✅ Database schema created successfully');
        console.log('✅ Admin user inserted (username: admin)');
        console.log('');
        console.log('🎉 Database initialization complete!');

    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run initialization
initializeDatabase()
    .then(() => {
        console.log('✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
