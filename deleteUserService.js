// Import the PostgreSQL client
const { Client } = require('pg');

// PostgreSQL connection configuration
const config = {
    user: 'postgres',      // Replace with your PostgreSQL username
    host: 'localhost',          // Replace with your PostgreSQL host
    database: 'user_service_elevate',  // Replace with your database name
    password: 'postgres',  // Replace with your PostgreSQL password
    port: 5432,                 // Replace with your PostgreSQL port (default: 5432)
};

// Array of table names to delete data from
const tablesToClear = ['users', 'entities', 'entity_types', 'users_credentials']; // Replace with your table names

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






