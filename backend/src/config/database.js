import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection and log details
pool.on('connect', (client) => {
  console.log('✅ New client connected to database');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected database error:', err);
});

// Test the connection immediately
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connection test successful'))
  .catch(err => {
    console.error('❌ Database connection test failed:', err.message);
    console.error('Stack:', err.stack);
  });

export default pool;