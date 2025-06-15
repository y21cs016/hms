// Fetch and display all patients on page load
function fetchPatients() {
    fetch("http://localhost:3000/patients")
        .then(response => response.json())
        .then(data => {
            console.log("Patients received:", data);
            window.allPatients = data; // Store globally for filtering
            displayPatients(data);
        })
        .catch(error => console.error("Error fetching patients:", error));
}

// Display patients in table
function displayPatients(patients) {
    let tableBody = document.querySelector("#patientTable tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    patients.forEach(patient => {
        let row = `<tr>
            <td>${patient.uqid}</td>
            <td>${patient.name}</td>
            <td>${patient.phone}</td>
            <td>${patient.age_years}</td>
            <td>${patient.gender}</td>
            <td>${patient.address}</td>
            <td>
                <button onclick="bookOPD(${patient.id})">OPD Booking</button>
                <button onclick="openEditForm(${patient.id})">Edit</button>
            </td>
            
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Navigate to OPD booking
function bookOPD(patientId) {
    window.location.href = `opd-booking.html?patientId=${patientId}`;
}

// 🔍 Unified live filtering by name, UQID, and date  

function liveFilterPatients() {
    let nameInput = document.getElementById("searchPatient").value.toLowerCase();
    let uqidInput = document.getElementById("searchUqid").value.toLowerCase();
    let phoneInput = document.getElementById("searchPhone").value;
    let from = document.getElementById("fromDate").value;
    let to = document.getElementById("toDate").value;

    let filtered = window.allPatients.filter(p => {
        let matchesName = nameInput ? p.name.toLowerCase().includes(nameInput) : true;
        let matchesUqid = uqidInput ? p.uqid.toLowerCase().includes(uqidInput) : true;
        let matchesPhone = phoneInput ? p.phone.includes(phoneInput) : true;

        let matchesDate = true;
        if (from && to) {
            let createdAt = new Date(p.created_at);
            let fromDate = new Date(from);
            let toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999); // include full 'to' day
            matchesDate = createdAt >= fromDate && createdAt <= toDate;
        }

        return matchesName && matchesUqid && matchesPhone && matchesDate;
    });

    displayPatients(filtered);
}


// Attach live event listeners
window.onload = function () {
    fetchPatients();

    document.getElementById("searchPatient").addEventListener("input", liveFilterPatients);
    document.getElementById("searchUqid").addEventListener("input", liveFilterPatients);
    document.getElementById("fromDate").addEventListener("change", liveFilterPatients);
    document.getElementById("toDate").addEventListener("change", liveFilterPatients);
    document.getElementById("searchPhone").addEventListener("input", liveFilterPatients);

};  
function openEditForm(patientId) {
    window.location.href = `edit-patient.html?patientId=${patientId}`;
}

