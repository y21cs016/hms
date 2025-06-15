window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');

    try {
        const response = await fetch(`http://localhost:3000/patients/${patientId}`);
        const patient = await response.json();

        // Fill form with data
        document.getElementById("uqid").value = patient.uqid;
        document.getElementById("name").value = patient.name;
        document.getElementById("phone").value = patient.phone;
        document.getElementById("address").value = patient.address;
        document.getElementById("ageY").value = patient.age_years;
        document.getElementById("ageM").value = patient.age_months || 0;
        document.getElementById("ageD").value = patient.age_days || 0;

        
        document.getElementById("gender").value = patient.gender;

        // ✅ Marital status logic (radio buttons)
        if (patient.maritalStatus === "Married") {
            document.getElementById("marriedOption").checked = true;
        } else if (patient.maritalStatus === "Unmarried") {
            document.getElementById("unmarriedOption").checked = true;
        }

    } catch (err) {
        alert("Failed to load patient details");
        console.error(err);
    }

    // Handle form submission
    document.getElementById("editPatientForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        // Get selected marital status from radio buttons
        const selectedMaritalStatus = document.querySelector('input[name="maritalStatus"]:checked')?.value;

        const updatedData = {
    uqid: document.getElementById("uqid").value,
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    maritalStatus: selectedMaritalStatus,
    ageY: document.getElementById("ageY").value,
    ageM: document.getElementById("ageM").value || 0,
    ageD: document.getElementById("ageD").value || 0,
    gender: document.getElementById("gender").value
};


        try {
            const response = await fetch(`http://localhost:3000/patients/${patientId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();
            alert("Patient updated successfully!");
            window.location.href = "opd-patient.html";
        } catch (err) {
            alert("Update failed!");
            console.error(err);
        }
    });
};
