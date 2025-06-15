const reportForm = document.getElementById('reportForm');

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathologyId = urlParams.get("pathology_id");

    if (!pathologyId) {
        alert("Missing pathology_id in URL");
        return;
    }

    fetch(`/get-pathology?id=${pathologyId}`)
        .then(res => res.json())
        .then(patientData => {
            if (!patientData || !patientData.test_names) {
                alert("No test data found.");
                return;
            }

            displayPatientInfo(patientData);
            generateTestSections(patientData.test_names);
            window.submitReports = () => handleSubmit(patientData);
        })
        .catch(err => {
            console.error("Fetch error:", err);
            alert("Failed to load patient data.");
        });
});

function displayPatientInfo(data) {
    const patientInfo = document.getElementById("patientInfo");
    patientInfo.innerHTML = `
        <p><strong>Patient Name:</strong> ${data.name}</p>
        <p><strong>Unique ID:</strong> ${data.uqid}</p>
        <p><strong>Disease:</strong> ${data.disease}</p>
        <p><strong>Referred by:</strong> ${data.doctor}</p>
    `;
}

const testFieldMap = {
    "Blood Test": ["hemoglobin", "wbc", "rbc", "hematocrit", "mcv", "mch", "platelets"],
    "MRI": ["region_scanned", "findings", "impression", "suggestion"],
    "CT Scan": ["region_scanned", "findings", "impression", "contrast_used", "radiologist_comment"],
    "X-Ray": ["region_scanned", "findings", "impression", "exposure_time"],
    "ECG": ["heart_rate", "rhythm", "pr_interval", "qrs_duration", "qt_interval", "interpretation"],
    "Sugar Test": ["fasting_sugar", "postprandial_sugar", "hba1c", "random_sugar"],
    "Lipid Profile": ["total_cholesterol", "hdl", "ldl", "triglycerides", "vldl", "cholesterol_hdl_ratio"],
    "Liver Function Test": ["alt_sgpt", "ast_sgot", "alkaline_phosphatase", "total_bilirubin", "direct_bilirubin", "total_protein", "albumin", "globulin"],
    "Thyroid": ["tsh", "t3", "t4", "ft3", "ft4"],
    "Hemoglobin": ["hemoglobin_level", "reference_range", "comments"],
    "Mammography": ["breast_density", "findings", "impression", "birads_category", "radiologist_comment"],
    "Beta HCG": ["beta_hcg_level", "pregnancy_status", "reference_range"],
    "Pregnancy": ["gestational_age", "fetal_heartbeat", "sac_presence", "crown_rump_length", "estimated_due_date", "sonographer_comment"],
    "Urine Test": [
        "color", "appearance", "specific_gravity", "pH", "proteins",
        "glucose", "ketones", "bilirubin", "urobilinogen", "nitrite",
        "leukocyte_esterase", "impression", "suggestion"
    ]
};

function generateTestSections(testNames) {
    const testList = testNames.split(',').map(t => t.trim());
    testList.forEach(test => {
        const section = document.createElement('div');
        section.classList.add("section");

        section.innerHTML = `<h3>${test}</h3><input type="hidden" name="test_name" value="${test}">`;

        const fields = testFieldMap[test] || [];

        // Create a grid wrapper
        const grid = document.createElement('div');
        grid.classList.add("fields-grid");

        // Add inputs into the grid
        fields.forEach(field => {
            const group = document.createElement('div');
            group.classList.add('input-group');
            group.innerHTML = `
                <label for="${test}-${field}">${field.replace(/_/g, ' ')}</label>
                <input type="text" id="${test}-${field}" name="${field}" placeholder="Enter ${field.replace(/_/g, ' ')}">
            `;
            grid.appendChild(group);
        });

        section.appendChild(grid);
        reportForm.appendChild(section);
    });
}


function handleSubmit(patientData) {
    const sections = document.querySelectorAll(".section");

    sections.forEach(section => {
        const testName = section.querySelector("input[name='test_name']").value;
        const inputs = section.querySelectorAll("input[type='text']");
        const report = {
            uqid: patientData.uqid,
            pathology_id: patientData.id,
            report_date: new Date().toISOString().slice(0, 10),
        };

        inputs.forEach(input => report[input.name] = input.value);

        fetch(`/submit-report/${encodeURIComponent(testName)}`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
        }).then(res => res.json())
          .then(resp => console.log(`${testName} saved`))
          .catch(err => console.error(err));
    });
    // Set status to Submitted in localStorage
   localStorage.setItem(`status_${patientData.id}`, "Submitted");

    alert("All reports submitted!");
    window.location.href = "lab.html";
}
