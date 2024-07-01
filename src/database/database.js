const mysql = require('mysql2');
const defaultConfig = require('../defaultConfig.json');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: defaultConfig.host,
    port: defaultConfig.port,
    user: defaultConfig.user,
    password: defaultConfig.password,
    database: defaultConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Use the promise wrapper for the pool
const promisePool = pool.promise();

// Connect to the MySQL database (optional, as pooling handles this)
promisePool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database');
        connection.release(); // release the connection back to the pool
    })
    .catch(err => {
        console.error('Error connecting to MySQL:', err);
    });

module.exports = promisePool;
