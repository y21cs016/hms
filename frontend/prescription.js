document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const uqid = urlParams.get("uqid");

    if (uqid) {
        fetch(`http://localhost:3000/get-patient/${uqid}`)
            .then(response => response.json())
            .then(data => {
                if (!data.patient || !data.opd) {
                    alert("Patient or OPD booking details not found!");
                    return;
                }

                const patient = data.patient;
                const opd = data.opd;

                document.getElementById("uqid").textContent = patient.uqid;
                document.getElementById("name").textContent = patient.name;
                document.getElementById("phone").textContent = patient.phone;
                document.getElementById("address").textContent = patient.address;
                document.getElementById("marital_status").textContent = patient.marital_status;
                document.getElementById("age").textContent = `${patient.age_years} years`;
                document.getElementById("gender").textContent = patient.gender;
                document.getElementById("disease").textContent = opd.disease;
                document.getElementById("department").textContent = opd.department;
                document.getElementById("doctor").textContent = opd.doctor;
                document.getElementById("company_status").textContent = opd.company_status;
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                alert("Failed to fetch patient details!");
            });
    }
});

// Print Prescription
function printPrescription() {
    window.print();
}


function updateSerialNumbers() {
    const tableBody = document.getElementById("prescription-body");
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}
function addPrescriptionRow() {
    const tableBody = document.getElementById("prescription-body");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td></td>
        <td><input type="text" class="small-input" name="medicine"></td>
        <td><input type="text" class="small-input" name="type"></td>
        <td><input type="text" class="small-input" name="dose"></td>
        <td><input type="text" class="small-input" name="duration"></td>
        <td><input type="text" class="small-input" name="frequency"></td>
        <td><input type="text" class="small-input" name="advice"></td>

    `;

    tableBody.appendChild(newRow);
    updateSerialNumbers();
}

function deletePrescriptionRow() {
    const tableBody = document.getElementById("prescription-body");
    if (tableBody.rows.length > 1) {
        tableBody.deleteRow(-1); // delete last row
    } else {
        alert("At least one row must be present.");
    }
}


function savePrescription() {
    const uqid = document.getElementById("uqid").textContent.trim();
    const doctorName = document.getElementById("doctor").textContent.trim();
    const tableBody = document.getElementById("prescription-body");
    const rows = tableBody.querySelectorAll("tr");

    const prescriptions = [];

    rows.forEach(row => {
        const inputs = row.querySelectorAll("input");

        if (inputs.length === 6) {
            const [medicine, type, dose, duration, frequency, advice] = Array.from(inputs).map(cell => cell.value.trim());

            if (medicine && type && dose && duration && frequency && advice) {
                prescriptions.push({ medicine, type, dose, duration, frequency, advice });
            }
        }
    });

    if (prescriptions.length === 0) {
        alert("Please enter valid prescription data.");
        return;
    }

    fetch("http://localhost:3001/save-prescription", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ uqid, doctorName, prescriptions })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Prescription saved successfully!");
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => {
        console.error("Fetch Error:", error);
        alert("Failed to save prescription!");
    });
}