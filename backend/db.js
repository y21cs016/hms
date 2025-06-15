const mysql = require("mysql2");

// MySQL Connection Configuration
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Likita@m25",
    database: "hms",
    port: 3306
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
