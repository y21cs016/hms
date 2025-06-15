document.addEventListener("DOMContentLoaded", function () {
    let patientData = [];

    // Fetch and store data
    fetch("http://localhost:3000/opd-bookings")
        .then(response => response.json())
        .then(data => {
            patientData = data;
            renderTable(patientData);
        })
        .catch(error => console.error("Error fetching OPD patients:", error));

    // Render table rows
    function renderTable(data) {
        const tableBody = document.getElementById("tableBody");
        tableBody.innerHTML = "";

        data.forEach(patient => {
            const row = document.createElement("tr");
            row.setAttribute("data-booking-date", patient.booking_date);

            row.innerHTML = `
                <td>${patient.uqid}</td>
                <td>${patient.name}</td>
                <td>${patient.disease}</td>
                <td>${patient.doctor}</td>
                <td>${patient.department}</td>
                <td>${patient.company_status}</td>
                <td>${patient.company_id || "NC"}</td>
                <td>
                    <button onclick="openPrescriptionForm('${patient.uqid}')">Add Prescription</button>
                    <div class="dropdown">
                        <button class="dropbtn" onclick="toggleDropdown(this)">More</button>
                        <div class="dropdown-content">
                            <a href="#" onclick="openPathologyForm('${patient.uqid}')">Add Pathology</a>
                            <a href="#" onclick="editPathology('${patient.uqid}')">Edit Pathology</a>
                            <a href="#" onclick="bookIPD('${patient.uqid}')">Add IPD</a>
                        </div>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Live filter function
    function filterTable() {
        const uqidVal = document.getElementById("searchUqid").value.toLowerCase();
        const nameVal = document.getElementById("searchPatient").value.toLowerCase();
        const diseaseVal = document.getElementById("searchSpecialist").value.toLowerCase();
        const doctorVal = document.getElementById("searchDoctor").value.toLowerCase();
        const fromDate = document.getElementById("fromDate").value;
        const toDate = document.getElementById("toDate").value;

        const filtered = patientData.filter(patient => {
            const bookingDate = patient.booking_date;

            const matchesUqid = patient.uqid.toLowerCase().includes(uqidVal);
            const matchesName = patient.name.toLowerCase().includes(nameVal);
            const matchesDisease = patient.disease.toLowerCase().includes(diseaseVal);
            const matchesDoctor = patient.doctor.toLowerCase().includes(doctorVal);

            let dateInRange = true;
            if (fromDate && toDate) {
                dateInRange = bookingDate >= fromDate && bookingDate <= toDate;
            } else if (fromDate) {
                dateInRange = bookingDate >= fromDate;
            } else if (toDate) {
                dateInRange = bookingDate <= toDate;
            }

            return matchesUqid && matchesName && matchesDisease && matchesDoctor && dateInRange;
        });

        renderTable(filtered);
    }

    // Add event listeners to input fields
    document.getElementById("searchUqid").addEventListener("input", filterTable);
    document.getElementById("searchPatient").addEventListener("input", filterTable);
    document.getElementById("searchSpecialist").addEventListener("input", filterTable);
    document.getElementById("searchDoctor").addEventListener("input", filterTable);
    document.getElementById("fromDate").addEventListener("change", filterTable);
    document.getElementById("toDate").addEventListener("change", filterTable);
});

// Dropdown toggle
function toggleDropdown(button) {
    const dropdown = button.nextElementSibling;
    dropdown.style.display = (dropdown.style.display === "flex") ? "none" : "flex";
}

// Action functions
function openPrescriptionForm(uqid) {
    window.location.href = `prescription.html?uqid=${uqid}`;
}

function openPathologyForm(uqid) {
    window.location.href = `pathology.html?uqid=${uqid}`;
}

function editPathology(uqid) {
    window.location.href = `pathology.html?uqid=${uqid}&mode=edit`;
}

function bookIPD(uqid) {
    fetch(`http://localhost:3000/get-patient/${encodeURIComponent(uqid)}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch patient and OPD details');
            return response.json();
        })
        .then(data => {
            const opd = data.opd;
            if (!opd) throw new Error('No OPD details found for this patient');

            const ipdData = {
                uqid: uqid,
                disease: opd.disease,
                department: opd.department,
                doctor: opd.doctor,
                company_status: opd.company_status,
                company_id: opd.company_id || null,
            };

            return fetch('http://localhost:3000/add-ipd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ipdData),
            });
        })
        .then(res => res.json())
        .then(() => {
            alert('IPD Added Successfully!');
            setTimeout(() => window.location.href = 'doctor.html', 500);
        })
        .catch(err => {
            console.error('Error booking IPD:', err);
            alert('Failed to add IPD: ' + err.message);
        });
}
