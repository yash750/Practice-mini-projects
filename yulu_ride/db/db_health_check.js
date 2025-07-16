import dotenv from 'dotenv'
dotenv.config()

import pool from './connectDatabase.js';
const db_health_check = async () => {
    let connection;
    try {
        // 1. Get a connection to test the database link
        connection = await pool.getConnection();
        console.log('Successfully connected to the database.');
    } catch (err) {
        console.error('Failed to connect to the database. Server is not starting.', err);
        // 3. Exit the process with an error code if the connection fails
        process.exit(1);
    } finally {
        // 4. Ensure the connection is always released
        if (connection) connection.release();
    }
};
export default db_health_check