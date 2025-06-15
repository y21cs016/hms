document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const uqid = params.get("uqid");
    const mode = params.get("mode"); // "edit" or null

    if (!uqid) {
        alert("Invalid access. UQID missing.");
        return;
    }

    const uqidField = document.getElementById("uqidField");
    if (uqidField) uqidField.value = uqid;

    // 1. Get patient info
    fetch(`http://localhost:3000/get-patient/${uqid}`)
        .then(res => res.json())
        .then(data => {
            if (data.error || !data.patient) {
                alert("Patient not found.");
                return;
            }

            const infoDiv = document.getElementById("patientInfo");
            infoDiv.innerHTML = `
                <div><strong>UQID:</strong> ${data.patient.uqid}</div>
                <div><strong>Name:</strong> ${data.name}</div>
                <div><strong>Disease:</strong> ${data.opd?.disease || "N/A"}</div>
                <div><strong>Doctor:</strong> ${data.opd?.doctor || "N/A"}</div>
            `;

            // 2. If edit mode, fetch existing pathology and prefill
            if (mode === "edit") {
                fetch(`http://localhost:3000/get-pathology/${uqid}`)
                    .then(res => res.json())
                    .then(pdata => {
                        if (pdata.error) {
                            alert("No existing pathology record found.");
                            return;
                        }

                        // Pre-select tests
                        const selectedTests = pdata.test_names.split(",").map(t => t.trim());
                        selectedTests.forEach(test => {
                            const checkbox = document.querySelector(`input[name="tests"][value="${test}"]`);
                            if (checkbox) checkbox.checked = true;
                        });

                        // Pre-fill remarks
                        document.getElementById("remarks").value = pdata.remarks || "";
                    })
                    .catch(err => {
                        console.error("Failed to fetch pathology:", err);
                        alert("Could not load previous pathology data.");
                    });
            }

            // 3. Handle form submit
            document.getElementById("pathologyForm").addEventListener("submit", function (e) {
                e.preventDefault();

                const selectedTests = Array.from(document.querySelectorAll('input[name="tests"]:checked'))
                    .map(cb => cb.value);
                const remarks = document.getElementById("remarks").value.trim();

                if (selectedTests.length === 0) {
                    alert("Please select at least one test.");
                    return;
                }

                const payload = {
                    uqid: data.patient.uqid,
                    name: data.name,
                    disease: data.opd?.disease || "N/A",
                    doctor: data.opd?.doctor || "N/A",
                    test_names: selectedTests.join(", "),
                    remarks: remarks
                };

                const endpoint = mode === "edit"
                    ? "http://localhost:3000/update-pathology"
                    : "http://localhost:3000/add-pathology";

                const method = mode === "edit" ? "PUT" : "POST";

                fetch(endpoint, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                .then(res => res.json())
                .then(resp => {
                    alert(resp.message || "Success!");
                    window.location.href = "doctor.html";
                })
                .catch(err => {
                    console.error("Submission error:", err);
                    alert("Something went wrong while saving data.");
                });
            });
        })
        .catch(err => {
            console.error("Error fetching patient data:", err);
            alert("Unable to load patient information.");
        });
});
