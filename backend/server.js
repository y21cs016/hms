// Import required modules
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const fs = require("fs");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const puppeteer = require("puppeteer");
const XLSX = require('xlsx');
const PdfPrinter = require('pdfmake');
const PDFDocument = require('pdfkit');






// Create the Express app
const app = express();
const port = 3000;


// Run at midnight every day
cron.schedule("0 0 * * *", () => {
    const query = "UPDATE staff SET status = 'Leave'";
    db.query(query, (err, result) => {
        if (err) {
            console.error("Error resetting staff status:", err);
        } else {
            console.log("All staff status reset to Leave.");
        }
    });
});


// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // or 20mb if needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, "../frontend"))); // Serve frontend files
app.use(bodyParser.json({limit:'10mb'}));


// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Likita@m25",
    database: "hms",
    port: 3306
});



db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database.");
    }
});


const fonts = {
    Roboto: {
        normal: path.join(__dirname, 'fonts/Roboto-Regular.ttf'),
        bold: path.join(__dirname, 'fonts/Roboto-Bold.ttf'),
        italics: path.join(__dirname, 'fonts/Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, 'fonts/Roboto-BoldItalic.ttf')
    }
};

const printer = new PdfPrinter(fonts);


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}



// 📤 Route to export patient data by date range
app.get('/export-patients-range', async (req, res) => {
    const { from, to, format } = req.query;

    try {
        const query = `
            SELECT uqid, name, phone, 
                   CONCAT(FLOOR(age_years), 'Y ', FLOOR(age_months), 'M ', FLOOR(age_days), 'D') AS age,

                   gender, address ,marital_status,age_years,age_months,age_days,gender,created_at,photo_path
            FROM patient 
            WHERE DATE(created_at) BETWEEN ? AND ?
        `;

        const [rows] = await db.promise().query(query, [from, to]);

        if (!rows.length) {
            return res.status(404).send('No records found.');
        }
if(format=='pdf'){
        const tableBody = [
            ['UQID', 'Name', 'Phone', 'Age', 'Gender', 'Address', 'Marital Status', 'Created At', 'Photo Path']
        ];
    
        rows.forEach(row => {
            tableBody.push([
                String(row.uqid),
                String(row.name),
                String(row.phone),
                String(row.age),
                String(row.gender),
                String(row.address),
                String(row.marital_status),
                new Date(row.created_at).toLocaleString(),
                row.photo_path ? String(row.photo_path) : 'N/A'

            ]);
            
        });
    
        const docDefinition = {
            content: [
                { text: 'Patient Report', style: 'header' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        body: tableBody
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                }
            },
            pageOrientation: 'landscape'
        };
    
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=patients.pdf");
        pdfDoc.pipe(res);
        pdfDoc.end();
    

        } else if (format === 'csv') {
            const parser = new Parser();
            const csv = parser.parse(rows);
            res.setHeader("Content-Disposition", "attachment; filename=patients.csv");
            res.setHeader("Content-Type", "text/csv");
            res.send(csv);

        } else {
            // Default: Excel
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, 'Patients');

            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.setHeader("Content-Disposition", "attachment; filename=patients.xlsx");
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.send(buffer);
        }

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).send("Server error");
    }
});


// ✅ Login Endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM login WHERE ID = ? AND PW = ?";
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error("Query error:", err);
            return res.status(500).json({ message: "Server error" });
        }
        if (results.length > 0) {
            res.status(200).json({ message: "Login successful" });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });
});

// ✅ Start the server
const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is in use. Trying another port...`);
            startServer(port + 1);
        } else {
            console.error("Server error:", err);
        }
    });
};













app.post("/add-patient", (req, res) => {
    console.log("Incoming Data: ", req.body);

    const { uqid, title, name, phone, address, maritalStatus, ageY, ageM, ageD, gender, photo } = req.body;
    let photoFileName = null;

    const insertIntoDB = () => {
        const query = `
            INSERT INTO patient (uqid, title, name, phone, address, marital_status, age_years, age_months, age_days, gender, photo_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [uqid, title, name, phone, address, maritalStatus, ageY, ageM, ageD, gender, photoFileName], (err, result) => {
            if (err) {
                console.error("Error inserting patient:", err.message);
                return res.status(500).json({ message: "Server error", error: err.message });
            }
            console.log("Insert result:", result);
            res.status(201).json({ message: "Patient registered successfully", patientId: result.insertId });
        });
    };

    if (photo) {
        const base64Data = photo.replace(/^data:image\/png;base64,/, "");
        photoFileName =`_${uqid}.png`;
        const uploadsDir = path.join(__dirname, 'uploads');
        const photoPath = path.join(uploadsDir, photoFileName);

        // Ensure uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        fs.writeFile(photoPath, base64Data, 'base64', (err) => {
            if (err) {
                console.error("Failed to save photo:", err.message);
                return res.status(500).json({ message: "Failed to save photo" });
            }
            console.log("Photo saved:", photoFileName);
            insertIntoDB(); // Insert into DB *after* photo is saved
        });
    } else {
        insertIntoDB(); // Insert without photo
    }
});






// ✅ Get All Patients for OPD Booking
app.get("/patients", (req, res) => {
    console.log("Fetching patients...");

    const query = "SELECT * FROM patient ORDER BY id DESC";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching patients:", err.message);
            return res.status(500).json({ message: "Server error", error: err.message });
        }

        console.log("Patients fetched:", results.length);
        res.status(200).json(results);
    });
});

// GET /patients?name=xxx&uqid=123&phone=98765&from=2024-01-01&to=2024-04-01
app.get("/patients", (req, res) => {
    let { name, uqid, phone, from, to } = req.query;
    let query = "SELECT * FROM patient WHERE 1=1";
    let params = [];

    if (name) {
        query += " AND LOWER(name) LIKE ?";
        params.push(`%${name.toLowerCase()}%`);
    }
    if (uqid) {
        query += " AND LOWER(uqid) LIKE ?";
        params.push(`%${uqid.toLowerCase()}%`);
    }
    if (phone) {
        query += " AND phone LIKE ?";
        params.push(`%${phone}%`);
    }
    if (from && to) {
        query += " AND registration_date BETWEEN ? AND ?";
        params.push(from, to);
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Error", error: err.message });
        res.json(results);
    });
});



// ✅ Update Patient by ID
app.put("/patients/:id", (req, res) => {
    const { id } = req.params;
    const { uqid, title, name, phone, address, maritalStatus, ageY, ageM, ageD, gender } = req.body;

    const query = `
        UPDATE patient
        SET uqid = ?, title = ?, name = ?, phone = ?, address = ?, marital_status = ?,
            age_years = ?, age_months = ?, age_days = ?, gender = ?
        WHERE id = ?
    `;

    db.query(query, [uqid, title, name, phone, address, maritalStatus, ageY, ageM, ageD, gender, id], (err, result) => {
        if (err) {
            console.error("Error updating patient:", err.message);
            return res.status(500).json({ message: "Failed to update patient", error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json({ message: "Patient updated successfully" });
    });
});



// POST /add-staff
app.post('/add-staff', (req, res) => {
    const {
        staff_id,
        staff_name,
        password,
        specialization,
        dob,
        age,
        address,
        email,
        mobile_number
    } = req.body;

    // Log incoming data for debugging
    console.log("Adding new staff:", req.body);

    // Check for required fields
    if (!staff_id || !staff_name || !password || !dob) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `
        INSERT INTO staff (
            staff_id, staff_name, password, specialization, dob, age, address, email, mobile_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        staff_id,
        staff_name,
        password,
        specialization || null,
        dob,
        age || null,
        address || null,
        email || null,
        mobile_number || null
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({ message: "Failed to add staff", error: err.sqlMessage });
        }
        res.json({ message: "Staff added successfully!" });
    });
});


// Fetch staff by specialization (if no dates provided)
app.get("/api/staff", (req, res) => {
    const specialization = req.query.specialization;

    let query = "SELECT staff_id, staff_name, specialization, age, address, mobile_number, status, created_at FROM staff";
    let params = [];

    if (specialization && specialization.trim().toLowerCase()!== "all") {
        query += " WHERE specialization = ?";
        params.push(specialization);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Error fetching staff:", err);
            return res.status(500).json({ error: "Database query error", details: err.message });
        }

        res.json(results);
    });
});

// PUT /api/update-staff/:staffId
// PUT /api/update-staff/:staff_id
app.put("/api/update-staff/:staff_id", (req, res) => {
    const { staff_id } = req.params;
    const {
        staff_name,
        password,
        specialization,
        dob,
        age,
        address,
        email,
        mobile_number,
        status
    } = req.body;

    // Build SQL query
    const sql = `
        UPDATE staff SET
            staff_name = ?,
            password = ?,
            specialization = ?,
            dob = ?,
            age = ?,
            address = ?,
            email = ?,
            mobile_number = ?,
            status = ?
        WHERE staff_id = ?
    `;

    const values = [
        staff_name,
        password,
        specialization || null,
        dob,
        age || null,
        address || null,
        email || null,
        mobile_number || null,
        status || null,
        staff_id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Update error:", err);
            return res.status(500).json({ message: "Failed to update staff", error: err.sqlMessage });
        }
        res.json({ message: "Staff updated successfully!" });
    });
});


app.delete("/api/delete-staff/:id", (req, res) => {
    const staffId = req.params.id;

    if (!staffId) {
        return res.status(400).json({ message: "Staff ID is required" });
    }

    const sql = "DELETE FROM staff WHERE staff_id = ?";
    db.query(sql, [staffId], (err, result) => {
        if (err) {
            console.error("Delete error:", err);
            return res.status(500).json({ message: "Failed to delete staff", error: err.sqlMessage });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Staff not found" });
        }

        res.json({ message: "Staff deleted successfully!" });
    });
});




app.get("/export-staff-range", async (req, res) => {
    const { from, to, specialization, format } = req.query;

    let query = `
        SELECT staff_id, staff_name, specialization, dob, age, address, email, mobile_number, status, created_at
        FROM staff WHERE 1=1
    `;
    const params = [];

    if (from && to) {
        query += " AND DATE(created_at) BETWEEN ? AND ?";
        params.push(from, to);
    }

    if (specialization && specialization.toLowerCase() !== "all") {
        query += " AND specialization = ?";
        params.push(specialization);
    }

    try {
        const [rows] = await db.promise().query(query, params);

        if (!rows.length) return res.status(404).send("No records found.");

        // Format date
        const formattedRows = rows.map(row => ({
            ...row,
            created_at: new Date(row.created_at).toISOString().split("T")[0]
        }));

        // ---- CSV ----
        if (format === "csv") {
            const parser = new Parser();
            const csv = parser.parse(formattedRows);
            res.setHeader("Content-Disposition", "attachment; filename=staff_report.csv");
            res.setHeader("Content-Type", "text/csv");
            return res.send(csv);
        }

        // ---- Excel ----
        else if (format === "excel") {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Staff Report");

            worksheet.columns = [
                { header: "Staff ID", key: "staff_id" },
                { header: "Name", key: "staff_name" },
                { header: "Specialization", key: "specialization" },
                { header: "DOB", key: "dob" },
                { header: "Age", key: "age" },
                { header: "Address", key: "address" },
                { header: "Email", key: "email" },
                { header: "Mobile", key: "mobile_number" },
                { header: "Status", key: "status" },
                { header: "Created At", key: "created_at" },
            ];

            formattedRows.forEach(row => worksheet.addRow(row));

            res.setHeader("Content-Disposition", "attachment; filename=staff_report.xlsx");
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            await workbook.xlsx.write(res);
            res.end();
        }

        // ---- PDF ----
        else if (format === "pdf") {
            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
                        h2 { text-align: center; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #444; padding: 6px; text-align: left; }
                        th { background-color: #f0f0f0; }
                    </style>
                </head>
                <body>
                    <h2>Staff Report</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Staff ID</th>
                                <th>Name</th>
                                <th>Specialization</th>
                                <th>DOB</th>
                                <th>Age</th>
                                <th>Address</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>Status</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formattedRows.map(row => `
                                <tr>
                                    <td>${row.staff_id}</td>
                                    <td>${row.staff_name}</td>
                                    <td>${row.specialization}</td>
                                    <td>${row.dob}</td>
                                    <td>${row.age}</td>
                                    <td>${row.address}</td>
                                    <td>${row.email}</td>
                                    <td>${row.mobile_number}</td>
                                    <td>${row.status}</td>
                                    <td>${row.created_at}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `;
        
            try {
                const browser = await puppeteer.launch({
                    headless: "new", // required for some setups
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
        
                const page = await browser.newPage();
                await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
        
                const pdfBuffer = await page.pdf({
                    format: 'A4',
                    landscape: true,
                    printBackground: true
                });
        
                await browser.close();
        
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", "attachment; filename=staff_report.pdf");
                res.status(200).end(pdfBuffer);  // <- This is key!
            } catch (pdfError) {
                console.error("PDF Generation Error:", pdfError);
                res.status(500).send("Failed to generate PDF.");
            }
        }
        
        // ---- Default ----
        else {
            return res.status(400).send("Invalid format specified");
        }

    } catch (err) {
        console.error("Export Error:", err);
        res.status(500).send("Server error");
    }
});


app.post("/api/staff/login", (req, res) => {
    const { username, password } = req.body;
  
    const query = "SELECT * FROM staff WHERE staff_id = ? AND password = ?";
    db.query(query, [username, password], (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
  
      if (results.length > 0) {
        const updateQuery = "UPDATE staff SET status = 'Active' WHERE staff_id = ?";
        db.query(updateQuery, [results[0].staff_id], () => {
          return res.json({ success: true, message: "Login successful" });
        });
      } else {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    });
  });
  


// Schedule to reset all staff statuses to 'Leave' at 12:00 AM daily
cron.schedule("0 0 * * *", () => {
    const resetQuery = "UPDATE staff SET status = 'Leave'";
    db.query(resetQuery, (err) => {
      if (err) {
        console.error("❌ Error resetting staff status:", err);
      } else {
        console.log("✅ All staff statuses reset to 'Leave'");
      }
    });
  });


// ✅ Get a Single Patient by ID
app.get("/patients/:id", (req, res) => {
    const patientId = req.params.id;  // Get ID from URL

    console.log(`Fetching details for patient ID: ${patientId}`);

    const query = "SELECT * FROM patient WHERE id = ?";
    db.query(query, [patientId], (err, results) => {
        if (err) {
            console.error("Error fetching patient:", err.message);
            return res.status(500).json({ message: "Server error", error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Patient not found" });  // Handle 404 properly
        }

        res.status(200).json(results[0]);  // Return the first patient found
    });
});



app.post("/opd-booking", (req, res) => {
    console.log("Received OPD Booking Request:", req.body); // Debugging log

    const { uqid, disease, department, doctor, company_status, company_id } = req.body;

    if (!uqid || !disease || !department || !doctor) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const checkPatientQuery = "SELECT * FROM patient WHERE uqid = ?";
    db.query(checkPatientQuery, [uqid], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Database error: " + err.message });
        }
        if (results.length === 0) {
            console.log("Patient not found!");
            return res.status(404).json({ error: "Patient not found!" });
        }

        const insertQuery = `
            INSERT INTO opd_booking (uqid, disease, department, doctor, company_status, company_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [uqid, disease, department, doctor, company_status, company_id || null], (err, result) => {
            if (err) {
                console.error("Insert Error:", err.message);
                return res.status(500).json({ error: "Database insert error: " + err.message });
            }

            
            console.log("OPD Booking Successful! Insert ID:", result.insertId);
            res.json({ message: "OPD Booking Successful!", booking_id: result.insertId });
        });
    });
});




app.get("/opd-bookings", (req, res) => {
    const query = `
        SELECT opd_booking.*, patient.name, opd_booking.booking_date 
        FROM opd_booking 
        JOIN patient ON opd_booking.uqid = patient.uqid
        ORDER BY opd_booking.id DESC

    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching OPD bookings:", err.message);
            return res.status(500).json({ message: "Server error", error: err.message });
        }

        res.status(200).json(results);
    });
});




app.get("/get-patient/:uqid", (req, res) => {
    const uqid = decodeURIComponent(req.params.uqid);

    const patientQuery = "SELECT * FROM patient WHERE uqid = ?";
    const opdQuery = "SELECT * FROM opd_booking WHERE uqid = ? ORDER BY booking_date DESC LIMIT 1";

    db.query(patientQuery, [uqid], (err, patientResult) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });
        if (patientResult.length === 0) return res.status(404).json({ error: "Patient not found" });

        db.query(opdQuery, [uqid], (err, opdResult) => {
            if (err) return res.status(500).json({ error: "Database error", details: err.message });

            res.json({ 
                name: patientResult[0].name,  // <-- Add this
                patient: patientResult[0], 
                opd: opdResult.length > 0 ? opdResult[0] : null 
            });
            
        });
    });
});



app.listen(3000, () => {
    console.log("Server running on port 3000");
});



// Save Prescription Route
app.post('/save-prescription', (req, res) => {
    const { uqid, doctorName, prescriptions } = req.body;

    if (!uqid || !doctorName || !prescriptions || prescriptions.length === 0) {
        return res.status(400).json({ success: false, message: "Missing data!" });
    }

    // Verify if doctorName exists in the opd_booking table for the given uqid
    const checkDoctorQuery = `
        SELECT doctor FROM opd_booking 
        WHERE uqid = ? AND doctor = ?
    `;
    
    db.query(checkDoctorQuery, [uqid, doctorName], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Internal server error!" });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Doctor not associated with this patient!" });
        }

        // Proceed to insert prescriptions
        const insertQuery = `
            INSERT INTO prescription 
            (uqid, doctor_name, medicine, type, dose, duration, frequency, advice) 
            VALUES ?
        `;

        const values = prescriptions.map(p => [
            uqid, doctorName, p.medicine, p.type, p.dose, p.duration, p.frequency, p.advice
        ]);

        db.query(insertQuery, [values], (err, result) => {
            if (err) {
                console.error("Insert error:", err.sqlMessage);
                return res.status(500).json({ success: false, message: "Failed to save prescriptions" });
            }
            res.json({ success: true, message: "Prescriptions saved!" });
        });
    });
});






app.post("/add-pathology", (req, res) => {
    const { uqid, name, disease, doctor, test_names, remarks } = req.body;

    if (!uqid || !name || !disease || !doctor || !test_names) {
        return res.status(400).json({ message: "Required fields missing!" });
    }

    const insertQuery = `
        INSERT INTO pre_pathology (uqid, name, disease, doctor, test_names, remarks)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [uqid, name, disease, doctor, test_names, remarks], (err, result) => {
        if (err) {
            console.error("Insert Error:", err.message);
            return res.status(500).json({ error: "Database insert error", details: err.message });
        }

        res.status(201).json({ message: "Pathology data added successfully" });
    });
});





// Routes
// Route to get all pre-pathology data
app.get("/get-pathology", (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ error: "Missing pathology ID" });
    }

    const query = `SELECT * FROM pre_pathology WHERE id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error fetching pathology:", err.message);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "No data found" });
        }

        res.status(200).json(results[0]);
    });
});

app.get('/get-all-pathology', (req, res) => {
    const query = `SELECT id, uqid, name, disease, doctor, test_names, added_on FROM pre_pathology ORDER BY added_on DESC`;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching pathology records:', err);
        return res.status(500).json({ error: 'Database error' });
      }
  
      // Optional: log it
      console.log("Fetched Pathology Records:", results);
  
      res.json(results);
    });
  });
  


  const testTables = {
    "Blood Test": "blood_test_reports",
    "MRI": "mri_reports",
    "CT Scan": "ct_scan_reports",
    "X-Ray": "xray_reports",
    "ECG": "ecg_reports",
    "Sugar Test": "sugar_test_reports",
    "Lipid Profile": "lipid_profile_reports",
    "Liver Function Test": "liver_function_reports",
    "Thyroid": "thyroid_reports",
    "Hemoglobin": "hemoglobin_reports",
    "Mammography": "mammography_reports",
    "Beta HCG": "beta_hcg_reports",
    "Pregnancy": "pregnancy_reports",
    "Urine Test": "urine_reports"     // ✅ Added this line
};

app.post('/submit-report/:test', (req, res) => {
    const testName = req.params.test;
    const table = testTables[testName];
    if (!table) return res.status(400).send({ error: "Invalid test name" });

    const data = req.body;
    const fields = Object.keys(data);
    const values = Object.values(data);

    const sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: "Database error" });
        }
        res.send({ message: `${testName} saved successfully` });
    });
});



app.get('/get-report/:test', (req, res) => {
    const testName = req.params.test;
    const table = testTables[testName];
    if (!table) return res.status(400).send({ error: "Invalid test name" });

    const sql = `SELECT * FROM ${table} ORDER BY id DESC`; // Last 5 entries

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: "Database error" });
        }
        res.send(results);
    });
});



// 🔍 Get Pathology by ID
app.get("/get-pathology/:uqid", (req, res) => {
    const uqid = req.params.uqid;

    const query = "SELECT test_names, remarks FROM pre_pathology WHERE uqid = ?";
    db.query(query, [uqid], (err, results) => {
        if (err) {
            console.error("Error fetching pathology:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "No pathology found for this UQID" });
        }

        res.json(results[0]); // returns { test_names, remarks }
    });
});



app.post("/add-pathology", (req, res) => {
    const { uqid, name, test_names, remarks, disease, doctor } = req.body;

    const query = `
        INSERT INTO pre_pathology (uqid, name, test_names, remarks, disease, doctor)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [uqid, name, test_names, remarks, disease, doctor];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({ message: "Failed to add pathology data" });
        }

        res.json({ message: "Pathology data added successfully" });
    });
});







// ✏️ Update Pathology by ID
app.put("/update-pathology", (req, res) => {
    const { uqid, test_names, remarks } = req.body;

    const query = `
        UPDATE pre_pathology
        SET test_names = ?, remarks = ?
        WHERE uqid = ?
    `;
    const values = [test_names, remarks, uqid];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Update error:", err);
            return res.status(500).json({ message: "Failed to update pathology data" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No record found to update for this UQID" });
        }

        res.json({ message: "Pathology data updated successfully" });
    });
});



// Pharmacy Stock (Vendor info and medicine stock)
function generateMedId() {
    return 'MD' + Math.floor(1000 + Math.random() * 9000);
  }
  
  app.post("/addStock", (req, res) => {
    const { vendor_name, address, gst_number, reference_no, checked_by, received_date, medicines } = req.body;
  
    medicines.forEach((med) => {
      const checkQuery = `
        SELECT * FROM pharmacy_stock 
        WHERE product_name = ? AND batch_no = ? AND expiry_date = ?
      `;
  
      db.query(checkQuery, [med.product_name, med.batch_no, med.expiry_date], (err, results) => {
        if (err) {
          console.error(err);
          return;
        }
  
        if (results.length > 0) {
          // Medicine already exists → Update quantity
          const existingId = results[0].id; // assuming you have an `id` primary key
          const updateQuery = `
            UPDATE pharmacy_stock 
            SET quantity = quantity + ?, current_stock = current_stock + ?
            WHERE id = ?
          `;
          db.query(updateQuery, [med.quantity, med.quantity, existingId], (err, result) => {
            if (err) console.error(err);
          });
        } else {
          // Medicine does not exist → Insert new record
          const med_id = generateMedId();
          const insertQuery = `
            INSERT INTO pharmacy_stock 
            (vendor_name, address, gst_number, reference_no, checked_by, received_date, product_name, batch_no, expiry_date, quantity, current_stock, med_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const values = [
            vendor_name,
            address,
            gst_number,
            reference_no,
            checked_by,
            received_date,
            med.product_name,
            med.batch_no,
            med.expiry_date,
            med.quantity,
            med.quantity,
            med_id,
          ];
          db.query(insertQuery, values, (err, result) => {
            if (err) console.error(err);
          });
        }
      });
    });
  
    res.json({ message: "Stock added successfully!" });
  });
  
 
// Get Stock Route (Used in both stock view and inside)
app.get("/getStock", (req, res) => {
    db.query("SELECT * FROM pharmacy_stock", (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });
  
  // Dispense Medicine Route
  app.post("/dispenseMedicine", (req, res) => {
    const medicines = req.body;
  
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "No medicines provided." });
    }
  
    let processed = 0;
    const errors = [];
  
    medicines.forEach(med => {
      const {
        patient_name,
        refer_by,
        reference_no,
        checked_by,
        dispense_date,
        med_id,
        product_name,
        batch_no,
        quantity
      } = med;
  
      db.query("SELECT * FROM pharmacy_stock WHERE med_id = ?", [med_id], (err, result) => {
        if (err) {
          errors.push({ med_id, error: err.message });
          checkComplete();
          return;
        }
  
        if (result.length > 0) {
          const medicine = result[0];
  
          if (medicine.current_stock >= quantity) {
            const updated_stock = medicine.current_stock - quantity;
  
            db.query("UPDATE pharmacy_stock SET current_stock = ? WHERE med_id = ?", [updated_stock, med_id], (err) => {
              if (err) {
                errors.push({ med_id, error: err.message });
                checkComplete();
                return;
              }
  
              const insertQuery = `
                INSERT INTO pharmacy_inside 
                (patient_name, refer_by, reference_no, checked_by, dispense_date, med_id, product_name, batch_no, quantity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
              const values = [
                patient_name,
                refer_by,
                reference_no,
                checked_by,
                dispense_date,
                med_id,
                product_name,
                batch_no,
                quantity
              ];
  
              db.query(insertQuery, values, (err) => {
                if (err) {
                  errors.push({ med_id, error: err.message });
                }
                checkComplete();
              });
            });
          } else {
            errors.push({ med_id, error: "Not enough stock available." });
            checkComplete();
          }
        } else {
          errors.push({ med_id, error: "Medicine not found." });
          checkComplete();
        }
      });
    });
  
    function checkComplete() {
      processed++;
      if (processed === medicines.length) {
        if (errors.length === 0) {
          res.json({ message: "All medicines dispensed successfully!" });
        } else {
          res.status(207).json({
            message: "Some medicines could not be dispensed.Please check the Stock!!",
            details: errors
          });
        }
      }
    }
  });

// API ROUTE
app.get('/api/patientS/count', (req, res) => {
    db.query('SELECT COUNT(*) AS total FROM patient', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'DB error' });
        }
        res.json(result[0]);
    });
});


// Route to get total counts
app.get('/api/stats', (req, res) => {
    const stats = {
        patients: 0,
        opd: 0,
        ipd: 0
    };

    db.query('SELECT COUNT(*) AS total FROM patient', (err, result1) => {
        if (err) return res.status(500).json({ error: 'DB Error 1' });
        stats.patients = result1[0].total;

        db.query('SELECT COUNT(*) AS total FROM opd_booking', (err, result2) => {
            if (err) return res.status(500).json({ error: 'DB Error 2' });
            stats.opd = result2[0].total;

            db.query('SELECT COUNT(*) AS total FROM ipd_booking', (err, result3) => {
                if (err) return res.status(500).json({ error: 'DB Error 3' });
                stats.ipd = result3[0].total;

                res.json(stats);
            });
        });
    });
});



///ipd_booking  

app.post("/add-ipd", (req, res) => {
    const { uqid, disease, department, doctor, company_status } = req.body;
    const ipdId = 'IPD' + Math.floor(Math.random() * 10000);

    const query = `
        INSERT INTO ipd_booking (ipd_id, uqid, disease, department, doctor, company_status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [ipdId, uqid, disease, department, doctor, company_status], (err, result) => {
        if (err) {
            console.error("Error adding IPD:", err.message);
            return res.status(500).json({ message: "Error adding IPD", error: err.message });
        }

        res.status(200).json({ message: "IPD added successfully!", ipd_id: ipdId });
    });
});
app.get("/ipd-bookings", (req, res) => {
    const query = `
        SELECT ipd_booking.*, patient.name, ipd_booking.booking_date 
        FROM ipd_booking 
        JOIN patient ON ipd_booking.uqid = patient.uqid
        ORDER BY ipd_booking.id DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching IPD bookings:", err.message);
            return res.status(500).json({ message: "Server error", error: err.message });
        }

        res.status(200).json(results);
    });
});


// Node.js + Express
app.get('/get-opd-details/:uqid', (req, res) => {
    const uqid = req.params.uqid;
    const sql = 'SELECT * FROM opd_booking WHERE uqid = ? ORDER BY booking_date DESC LIMIT 1';

    db.query(sql, [uqid], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No OPD data found for this UQID' });
        }
        res.json(results[0]);
    });
});

///confirm ipd


app.get("/get-ipd-details/:uqid/:ipd_id", (req, res) => {
    const { uqid, ipd_id } = req.params;

    const query = `
        SELECT 
            p.name, p.phone, p.gender, p.age_years, p.age_months, p.age_days, p.address,
            i.disease, i.department, i.doctor, i.company_status
        FROM ipd_booking i
        JOIN patient p ON i.uqid = p.uqid
        WHERE i.uqid = ? AND i.ipd_id = ?
    `;

    db.query(query, [uqid, ipd_id], (err, results) => {
        if (err) {
            console.error("Error fetching IPD details:", err.message);
            return res.status(500).json({ message: "Error fetching IPD details", error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No data found for given UQID and IPD ID" });
        }

        const patient = results[0];
        const age = `${patient.age_years}Y ${patient.age_months}M ${patient.age_days}D`;
        

        res.status(200).json({
            name: patient.name,
            phone: patient.phone,
            gender: patient.gender,
            age,
            address: patient.address,
            disease: patient.disease,
            department: patient.department,
            doctor: patient.doctor,
            company_status: patient.company_status
        });
    });
});



app.post('/confirm-ipd', (req, res) => {
    const {
        uqid, ipd_id, name, phone, gender, age, address,
        disease, department, doctor, company_status,
        room_type, room_no, bed_no
    } = req.body;

    const insertQuery = `
        INSERT INTO confirm_ipd
        (uqid, ipd_id, name, phone, gender, age, address, disease, department, doctor, company_status, room_type, room_no, bed_no)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [
        uqid, ipd_id, name, phone, gender, age, address,
        disease, department, doctor, company_status, room_type, room_no, bed_no
    ], (err, result) => {
        if (err) return res.status(500).json({ message: 'DB error', error: err.message });

        res.json({ message: 'IPD successfully confirmed!' });
    });
    // After inserting into confirm_ipd table
    const updateQuery = `UPDATE rooms SET status = 'occupied' 
    WHERE room_type = ? AND room_no = ? AND bed_no = ?`;

    db.query(updateQuery, [room_type, room_no, bed_no], (err, result) => {
    if (err) console.error("Failed to update room status:", err);
});


});

// Endpoint to get all IPD data
app.get("/confirm-ipd-data", (req, res) => {
    const query = `
        SELECT 
            id, uqid, ipd_id, name, phone, gender, age, address, disease,
            department, doctor, company_status, room_type, room_no, bed_no, confirmation_date
        FROM confirm_ipd order by confirmation_date DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching confirm IPD data:", err.message);
            return res.status(500).json({ message: "Database query failed", error: err.message });
        }

        res.status(200).json(results);
    });
});


////fill ipd




// Endpoint to get IPD by ID
app.get("/get-ipd-by-id", (req, res) => {
    const { ipd_id } = req.query;
    const sql = `SELECT * FROM confirm_ipd WHERE ipd_id = ? `;
    db.query(sql, [ipd_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Query failed" });
        res.status(200).json(result[0]);
    });
});

// Predefined valid operation types mapping to table names
const operationTables = {
    "cardiology": {
        "catheter_ablation": "cardiology_catheter_ablation",
        "angiogram": "cardiology_angiogram",
        "echocardiogram": "cardiology_echocardiogram"
    },
    "gynecology": {
        "hysterectomy": "gynecology_hysterectomy",
        "c_section": "gynecology_c_section",
        "dnc": "gynecology_dnc",
        "pregnancy_monitoring": "gynecology_pregnancy_monitoring",
        "ovarian_cystectomy": "gynecology_ovarian_cystectomy",
        "tubal_ligation": "gynecology_tubal_ligation"
    },
    "endocrinology": {
        "thyroid_ultrasound": "endocrinology_thyroid_ultrasound",
        "hormone_panel": "endocrinology_hormone_panel",
        "glucose_tolerance_test": "endocrinology_glucose_tolerance_test",
        "bone_density_test": "endocrinology_bone_density_test"
    },
    "pulmonology": {
        "pulmonary_function_test": "pulmonology_pulmonary_function_test",
        "bronchoscopy": "pulmonology_bronchoscopy",
        "chest_xray": "pulmonology_chest_xray",
        "sleep_study": "pulmonology_sleep_study",
        "pleural_fluid_analysis": "pulmonology_pleural_fluid_analysis"
      },
   "orthopedics": {
        "knee_replacement": "orthopedics_knee_replacement",
        "hip_replacement": "orthopedics_hip_replacement",
        "arthroscopy": "orthopedics_arthroscopy",
        "fracture_fixation": "orthopedics_fracture_fixation",
        "spinal_fusion": "orthopedics_spinal_fusion"
    },
    "neurology":{
        "craniotomy":"neurology_craniotomy",
        "vp_shunt_placement":"neurology_vp_shunt_placement",
        "thrombolysis":"neurology_thrombolysis",
        "other_operation":"neurology_other_operation"

    }


};

// Endpoint to submit report
app.post("/submit-ipd-report", (req, res) => {
    const data = req.body;
    const department = data.department.toLowerCase();
    const operationType = data.operation_type.toLowerCase().replace(/ /g, '_');

    if (!operationTables[department] || !operationTables[department][operationType]) {
        return res.status(400).json({ message: "Invalid operation type for the given department" });
    }

    const table = operationTables[department][operationType];

    // First fetch additional info from confirm_ipd table
    const ipd_id = data.ipd_id;
    const confirmSql = `SELECT name, gender, doctor, disease, uqid FROM confirm_ipd WHERE ipd_id = ?`;

    db.query(confirmSql, [ipd_id], (err, confirmResult) => {
        if (err) return res.status(500).json({ message: "Failed to fetch confirm_ipd details" });

        const confirmData = confirmResult[0] || {};

        // Merge confirm_ipd fields into data
        const fullData = {
            ...data,
            name: confirmData.name,
            gender: confirmData.gender,
            doctor: confirmData.doctor,
            disease: confirmData.disease,
            uqid: confirmData.uqid
        };

        // Build insert query
        let columns = ["ipd_id", "weight", "bp", "operation_type", "department"];
        let values = [fullData.ipd_id, fullData.weight, fullData.bp, fullData.operation_type, fullData.department];

        const opFields = Object.keys(fullData).filter(k => !columns.includes(k) && k !== "department");
        columns.push(...opFields);
        values.push(...opFields.map(k => fullData[k]));

        const insertSql = `INSERT INTO ${table} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`;

        db.query(insertSql, values, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Insert failed" });
            }
            res.status(200).json({ message: "Report submitted successfully" });
        });
    });
});



//room availability


// GET /available-rooms/:roomType
app.get('/available-rooms/:roomType', async (req, res) => {
    const roomType = req.params.roomType;

    const query = `SELECT DISTINCT room_no, bed_no FROM rooms 
                   WHERE room_type = ? AND status = 'available'`;

        
        db.query(query, [roomType], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET /available-beds/:roomNo
app.get('/available-beds/:roomNo', (req, res) => {
    const roomNo = req.params.roomNo;

    const query = `SELECT bed_no FROM rooms 
                   WHERE room_no = ? AND status = 'available'`;

    db.query(query, [roomNo], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// PUT /discharge-ipd/:ipd_id
app.put('/discharge-ipd/:ipd_id', (req, res) => {
    const ipdId = req.params.ipd_id;

    // First get the room info from this ipd_id
    const selectQuery = `SELECT room_type, room_no, bed_no FROM confirm_ipd WHERE ipd_id = ?`;

    db.query(selectQuery, [ipdId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const { room_type, room_no, bed_no } = results[0];

        // 1. Update patient status
        const updatePatientQuery = `UPDATE confirm_ipd SET status = 'discharged' WHERE ipd_id = ?`;

        db.query(updatePatientQuery, [ipdId], (err1) => {
            if (err1) {
                return res.status(500).json({ message: 'Failed to update patient status' });
            }

            // 2. Free the room
            const updateRoomQuery = `UPDATE rooms SET status = 'available' 
                                     WHERE room_type = ? AND room_no = ? AND bed_no = ?`;

            db.query(updateRoomQuery, [room_type, room_no, bed_no], (err2) => {
                if (err2) {
                    return res.status(500).json({ message: 'Failed to update room status' });
                }

                res.json({ message: 'Patient successfully discharged and room freed!' });
            });
        });
    });
});








// Endpoint to fetch patient history
app.get("/history", (req, res) => {
    const { uqid, name, phone, address } = req.query;

    let conditions = [];
    let values = [];

    if (uqid) {
        conditions.push("uqid = ?");
        values.push(uqid);
    }
    if (name) {
        conditions.push("name LIKE ?");
        values.push(`%${name}%`);
    }
    if (phone) {
        conditions.push("phone = ?");
        values.push(phone);
    }
    if (address) {
        conditions.push("address LIKE ?");
        values.push(`%${address}%`);
    }

    if (conditions.length === 0) {
        return res.status(400).json({ message: "At least one search parameter is required." });
    }

    const whereClause = conditions.join(" AND ");
    const patientQuery = `SELECT * FROM patient WHERE ${whereClause} LIMIT 1`;

    db.query(patientQuery, values, (err, patientResults) => {
        if (err) {
            console.error("Error fetching patient:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (patientResults.length === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const patient = patientResults[0];

        // Fetch OPD bookings
        const opdQuery = "SELECT uqid, doctor, disease, department, booking_date FROM opd_booking WHERE uqid = ?";

        db.query(opdQuery, [patient.uqid], (err, opdResults) => {
            if (err) {
                console.error("Error fetching OPD bookings:", err);
                return res.status(500).json({ message: "Server error" });
            }
            // Fetch    IPD bookings
            const ipdQuery = "SELECT ipd_id, uqid, doctor, disease, department, room_type, room_no, bed_no, confirmation_date FROM confirm_ipd WHERE uqid = ?";

                db.query(ipdQuery, [patient.uqid], (err, ipdResults) => {
                    if (err) {
                        console.error("Error fetching IPD bookings:", err);
                        return res.status(500).json({ message: "Server error" });
                    }
            

            // Fetch prescriptions
            const prescriptionQuery = "SELECT * FROM prescription WHERE uqid = ?";

            db.query(prescriptionQuery, [patient.uqid], (err, prescriptionResults) => {
                if (err) {
                    console.error("Error fetching prescriptions:", err);
                    return res.status(500).json({ message: "Server error" });
                }

                // Fetch test reports
                const testReports = {};
                const testNames = Object.keys(testTables);
                let completed = 0;

                if (testNames.length === 0) {
                    return res.json({
                        patient,
                        opdBookings: opdResults,
                        ipdBookings: ipdResults,
                        prescriptions: prescriptionResults,
                        testReports
                    });
                }

                testNames.forEach((testName) => {
                    const tableName = testTables[testName];
                    const reportQuery = `SELECT * FROM ${tableName} WHERE uqid = ?`;

                    db.query(reportQuery, [patient.uqid], (err, reportResults) => {
                        completed++;

                        if (!err && reportResults.length > 0) {
                            testReports[testName] = reportResults.map((report) => ({
                                ...report,
                                report_date: report.report_date || report.test_date || report.date || report.created_at || null
                            }));
                        }

                        if (completed === testNames.length) {
                            res.json({
                                patient,
                                opdBookings: opdResults,
                                ipdBookings:ipdResults,
                                prescriptions: prescriptionResults,
                                testReports
                            });
                        }
                    });
                });
            });
            });
        });
    });
});




  startServer(port);