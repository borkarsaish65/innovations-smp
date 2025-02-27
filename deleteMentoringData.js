// Import the PostgreSQL client
const { Client } = require('pg');
const { updateSuccessJSON } = require('./util');
require('dotenv').config()

// PostgreSQL connection configuration
const config = {
    user: process.env.POSTGRES_MENTORING,      // Replace with your PostgreSQL username
    host:process.env.POSTGRES_HOST,          // Replace with your PostgreSQL host
    database: process.env.POSTGRES_DB,  // Replace with your database name
    password: process.env.POSTGRES_PASSWORD,  // Replace with your PostgreSQL password
    port: 5432,                 // Replace with your PostgreSQL port (default: 5432)
};

// Array of table names to delete data from

const tablesToClear = process.env.TABLE_NAME_TO_DELETE

async function clearTables() {
    const client = new Client(config);

    try {
        // Connect to the PostgreSQL server
        await client.connect();
        console.log('Connected to PostgreSQL');

        // Loop through the tables and delete all data
        for (const tableName of tablesToClear) {
            const query = `DELETE FROM ${tableName};`;

            // Execute the delete query
            const result = await client.query(query);

            console.log(`Cleared data from table: ${tableName}`);
        }

        console.log('All specified tables have been cleared.');
        updateSuccessJSON('success.json','deleteMentoringData','true')
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Close the connection
        await client.end();
        console.log('Connection to PostgreSQL closed');
    }
}

// Run the function
clearTables();






