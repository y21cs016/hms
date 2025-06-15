const mysql = require("mysql2");

// MySQL Connection Configuration
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Likita@m25",
    database: "hms",
    port: 3306
});
const mysql = require('mysql2');
const url = require('url');

// Get DATABASE_URL from environment
const dbUrl = process.env.DATABASE_URL;

const parsedUrl = new URL(dbUrl);

const connection = mysql.createConnection({
  host: parsedUrl.hostname,
  user: parsedUrl.username,
  password: parsedUrl.password,
  database: parsedUrl.pathname.slice(1),
  port: parsedUrl.port || 3306
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL database!');
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to MySQL database.");
    }
});

module.exports = db; // Export database connection
