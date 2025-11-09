const mysql = require('mysql2/promise');
require('dotenv').config();

// Support both DATABASE_URL and individual env vars
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL directly as connection string
  poolConfig = process.env.DATABASE_URL;
} else {
  poolConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  };
}

const pool = mysql.createPool(poolConfig);

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;
