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
    "Urine Test": ["color", "appearance", "specific_gravity", "pH", "proteins", "glucose", "ketones", "bilirubin", "urobilinogen", "nitrite", "leukocyte_esterase", "impression", "suggestion"]
};

const testGallery = document.getElementById("testGallery");
const testDetails = document.getElementById("testDetails");

const placeholderImages = {
    "Blood Test": "blood-removebg-preview.png", // Local path
    "MRI": "mri-removebg-preview.png",
    "CT Scan": "ct-removebg-preview.png",
    "X-Ray": "xray-removebg-preview.png",
    "ECG": "ecg-removebg-preview.png",
    "Sugar Test": "sugar-removebg-preview.png",
    "Lipid Profile": "lipid-removebg-preview.png",
    "Liver Function Test": "liver-removebg-preview.png",
    "Thyroid": "tyroid-removebg-preview.png",
    "Hemoglobin": "hemo.png",
    "Mammography": "mamo-removebg-preview.png",
    "Beta HCG": "beta-removebg-preview.png",
    "Pregnancy": "preg-removebg-preview.png",
    "Urine Test": "uri-removebg-preview.png"
};



for (let test in testFieldMap) {
    const card = document.createElement("div");
    card.className = "test-card";
    card.innerHTML = `
        <img src="${placeholderImages[test] || 'https://via.placeholder.com/180x120'}" alt="${test}">
        <p>${test}</p>
    `;
    card.onclick = async () => {
        testDetails.innerHTML = ""; // Clear previous content
    
        try {
            const res = await fetch(`/get-report/${encodeURIComponent(test)}`);
            const data = await res.json();
    
            const heading = document.createElement("h3");
            heading.textContent = `${test} Report Data`;
            testDetails.appendChild(heading);
    
            if (data && data.length) {
                const table = document.createElement("table");
                table.style.borderCollapse = "collapse";
                table.style.width = "100%";
                table.style.marginTop = "10px";
    
                // Table header
                const thead = document.createElement("thead");
                const headerRow = document.createElement("tr");
                Object.keys(data[0]).forEach(key => {
                    const th = document.createElement("th");
                    th.textContent = key.replace(/_/g, ' ');
                    th.style.border = "1px solid #ccc";
                    th.style.padding = "8px";
                    th.style.backgroundColor = "#f2f2f2";
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);
    
                // Table body
                const tbody = document.createElement("tbody");
                data.forEach(record => {
                    const row = document.createElement("tr");
                    Object.entries(record).forEach(([key, value]) => {
                        const td = document.createElement("td");
                    
                        if (key.toLowerCase().includes("date") && typeof value === "string") {
                            td.textContent = value.split("T")[0]; // Show only YYYY-MM-DD
                        } else {
                            td.textContent = value;
                        }
                    
                        td.style.border = "1px solid #ccc";
                        td.style.padding = "8px";
                        row.appendChild(td);
                    });
                    
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
    
                testDetails.appendChild(table);
            } else {
                testDetails.innerHTML += "<p>No reports found.</p>";
            }
        } catch (err) {
            console.error(err);
            testDetails.innerHTML += "<p style='color: red;'>Failed to fetch report data.</p>";
        }
    };
    
    testGallery.appendChild(card); // This is missing!

}    
