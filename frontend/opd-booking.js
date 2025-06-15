// Fetch patient details using URL parameter
// Fetch patient details using URL parameter
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get("patientId");

    if (patientId) {
        fetch(`http://localhost:3000/patients/${patientId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(patient => {
                console.log("Patient details:", patient);
                
                // Populate form fields with patient data
                document.getElementById("uqid").value = patient.uqid;
                document.getElementById("name").value = patient.name;
                document.getElementById("phone").value = patient.phone;
                document.getElementById("age").value = patient.age_years;
                document.getElementById("gender").value = patient.gender;
                document.getElementById("address").value = patient.address;
            })
            .catch(error => {
                console.error("Error fetching patient details:", error.message);
                alert("Patient not found!");
            });
    }
});

// Show/hide company ID field based on selection
function toggleCompanyID() {
    let status = document.getElementById("companyStatus").value;
    let companyIDField = document.getElementById("companyID");
    let companyIDLabel = document.getElementById("companyIDLabel");

    if (status === "company") {
        companyIDField.style.display = "block";
        companyIDLabel.style.display = "block";
    } else {
        companyIDField.style.display = "none";
        companyIDLabel.style.display = "none";
    }
}

// Submit OPD Booking
function submitOPD() {
    const uqid = document.getElementById("uqid").value;
    const disease = document.getElementById("disease").value;
    const department = document.getElementById("department").value;
    const doctor = document.getElementById("doctor").value;
    const company_status = document.getElementById("companyStatus").value;
    const company_id = document.getElementById("companyID").value || null;

    const opdData = { uqid, disease, department, doctor, company_status, company_id };

    console.log("OPD Data to be sent:", opdData); // Debugging log

    fetch("http://localhost:3000/opd-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opdData),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server Response:", data); // Debugging log
        alert(data.message);
        window.location.href = "opd-patient.html";
    })
    .catch(error => {
        console.error("Error submitting OPD booking:", error);
        alert("Failed to submit OPD booking.");
    });
}
// Array of doctors for each department with unique names
const doctors = {
    "Cardiology": ["Dr. Aditi Mehra", "Dr. Rajesh Kumar"],
    "Dermatology": ["Dr. Bhavna Iyer", "Dr. Simran Patel"],
    "Dentistry": ["Dr. Chetan Shah", "Dr. Neha Verma"],
    "Endocrinology": ["Dr. Farhan Ali", "Dr. Priya Singh"],
    "ENT": ["Dr. Hari Krishna", "Dr. Rahul Bansal"],
    "Gastroenterology": ["Dr. Jaya Menon", "Dr. Vikram Gupta"],
    "General Medicine": ["Dr. Lalit Verma", "Dr. Mohan Das", "Dr. Neelima Rao"],
    "Gynecology": ["Dr. Omkar Shetty", "Dr. Ritu Sharma"],
    "Neurology": ["Dr. Arun Deshmukh", "Dr. Radhika Joshi"],
    "Nephrology": ["Dr. Chetan Raj", "Dr. Sushma Reddy"],
    "Ophthalmology": ["Dr. Sandeep Patil", "Dr. Aishwarya Nair"],
    "Orthopedics": ["Dr. Harish Reddy", "Dr. Karan Mehta"],
    "Pediatrics": ["Dr. Aishwarya Mehra", "Dr. Suman Gupta"],
    "Psychiatry": ["Dr. Rahul Chaudhary", "Dr. Shalini Kapoor"],
    "Pulmonology": ["Dr. Neelima Rao", "Dr. Kunal Sharma"],
    "Rheumatology": ["Dr. Aditi Agarwal", "Dr. Shashank Pandey"],
    "Urology": ["Dr. Virendra Chauhan", "Dr. Pradeep Kumar"]
};

// Function to update doctor options based on the selected department
function updateDoctors() {
    const department = document.getElementById("department").value;
    const doctorSelect = document.getElementById("doctor");

    // Clear existing doctor options
    doctorSelect.innerHTML = '';

    // Add the new options based on the selected department
    if (doctors[department]) {
        doctors[department].forEach(function(doctor) {
            const option = document.createElement("option");
            option.value = doctor;
            option.textContent = doctor;
            doctorSelect.appendChild(option);
        });
    }
}

// Initial call to populate doctors for the default department
document.addEventListener("DOMContentLoaded", function () {
    updateDoctors();
});
