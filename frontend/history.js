function renderPatientInfo(patient) {
    const div = document.getElementById("patient-info");
    div.innerHTML = `
      <h2>Basic Info</h2>
      <p><strong>Name:</strong> ${patient.name}</p>
      <p><strong>UQID:</strong> ${patient.uqid}</p>
      <p><strong>Phone:</strong> ${patient.phone}</p>
      <p><strong>Address:</strong> ${patient.address}</p>
      <p><strong>Gender:</strong> ${patient.gender}</p>
      <p><strong>Marital Status:</strong> ${patient.marital_status}</p>
      <p><strong>Age:</strong> ${patient.age_years} years</p>
      <p><strong>Created At:</strong> ${patient.created_at}</p>
    `;
  }
  
  function renderTestReports(reports) {
    const TEST_FIELDS = {
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
  
    const div = document.getElementById("lab-reports");
    let html = `<h2>Lab Reports</h2>`;
  
    for (const [testName, entries] of Object.entries(reports)) {
      if (!entries || entries.length === 0) continue;
  
      html += `<h3>${testName}</h3>`;
  
      // Ensure 'uqid' and 'report_date' come first
      const testKeys = TEST_FIELDS[testName] || Object.keys(entries[0]);
      const keys = ["uqid", "report_date", ...testKeys.filter(k => k !== "uqid" && k !== "report_date")];
  
      html += `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
                <thead><tr>`;
      keys.forEach(k => html += `<th>${k.replace(/_/g, " ")}</th>`);
      html += `</tr></thead><tbody>`;
  
      entries.forEach(entry => {
        html += `<tr>`;
        keys.forEach(k => {
          let val = entry[k];
          if (k === "report_date") {
            val = val ? new Date(val).toLocaleDateString() : "";
          }
          html += `<td>${val || ""}</td>`;
        });
        html += `</tr>`;
      });
  
      html += `</tbody></table>`;
    }
  
    div.innerHTML = html;
  }
  
  function renderPrescriptions(prescriptions) {
    const div = document.getElementById("prescription-history");
    if (!prescriptions || prescriptions.length === 0) {
      div.innerHTML = "<h2>Prescription History</h2><p>No prescriptions found.</p>";
      return;
    }
  
    let html = `<h2>Prescription History</h2>
                <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr>
                    <th>UQID</th>
                    <th>Doctor</th>
                    <th>Medicine</th>
                    <th>Type</th>
                    <th>Dose</th>
                    <th>Duration</th>
                    <th>Frequency</th>
                    <th>Advice</th>
                    <th>Date</th>
                  </tr>
                </thead><tbody>`;
  
    prescriptions.forEach(pres => {
      html += `<tr>
        <td>${pres.uqid || ""}</td>
        <td>${pres.doctor_name || ""}</td>
        <td>${pres.medicine || ""}</td>
        <td>${pres.type || ""}</td>
        <td>${pres.dose || ""}</td>
        <td>${pres.duration || ""}</td>
        <td>${pres.frequency || ""}</td>
        <td>${pres.advice || ""}</td>
        <td>${pres.created_at ? new Date(pres.created_at).toLocaleDateString() : ""}</td>
      </tr>`;
    });
  
    html += `</tbody></table>`;
    div.innerHTML = html;
  }
  
  
  async function searchPatient() {
    const uqid = document.getElementById("uqid").value.trim();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
  
    const params = new URLSearchParams();
    if (uqid) params.append("uqid", uqid);
    if (name) params.append("name", name);
    if (phone) params.append("phone", phone);
    if (address) params.append("address", address);
  
    if ([uqid, name, phone, address].every(val => !val)) {
      alert("Please enter at least one field to search.");
      return;
    }
  
    try {
      const res = await fetch(`/history?${params.toString()}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Unknown error");
      }
  
      const data = await res.json();
      renderPatientInfo(data.patient);
      renderOPDHistory(data.opdBookings);
      renderTestReports(data.testReports);
      renderPrescriptions(data.prescriptions); 
      renderIPDHistory(data.ipdBookings);

    } catch (err) {
      console.error("Error fetching history:", err);
      alert("No patient found or server error: " + err.message);
      document.getElementById("patient-info").innerHTML = "";
      document.getElementById("opd-history").innerHTML = "";
      document.getElementById("lab-reports").innerHTML = "";
      document.getElementById("prescription-history").innerHTML = "";
      document.getElementById("ipd-history").innerHTML = "";

    }
  }
  function renderOPDHistory(opdBookings) {
    const div = document.getElementById("opd-history");
    if (!opdBookings || opdBookings.length === 0) {
      div.innerHTML = "<h2>OPD History</h2><p>No OPD bookings found.</p>";
      return;
    }
  
    let html = `<h2>OPD History</h2>
                <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr>
                    <th>UQID</th>
                    <th>Doctor</th>
                    <th>Disease</th>
                    <th>Department</th>
                    <th>Booking Date</th>
                  </tr>
                </thead><tbody>`;
  
    opdBookings.forEach(entry => {
      html += `<tr>
        <td>${entry.uqid || ""}</td>
        <td>${entry.doctor || ""}</td>
        <td>${entry.disease || ""}</td>
        <td>${entry.department || ""}</td>
        <td>${entry.booking_date ? new Date(entry.booking_date).toLocaleDateString() : ""}</td>
      </tr>`;
    });
  
    html += `</tbody></table>`;
    div.innerHTML = html;
  }
  function renderIPDHistory(ipdBookings) {
    const div = document.getElementById("ipd-history");
    if (!ipdBookings || ipdBookings.length === 0) {
      div.innerHTML = "<h2>IPD History</h2><p>No IPD bookings found.</p>";
      return;
    }
  
    let html = `<h2>IPD History</h2>
                <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr>
                    <th>IPD_ID</th>
                    <th>UQID</th>
                    <th>Doctor</th>
                    <th>Disease</th>
                    <th>Department</th>
                    <th>Room_type</th>
                    <th>Room_no</th>
                    <th>Bed_no</th>
                    <th>Confirmation Date</th>
                  </tr>
                </thead><tbody>`;
  
    ipdBookings.forEach(entry => {
      html += `<tr>
        <td>${entry.ipd_id||""}</td>
        <td>${entry.uqid || ""}</td>
        <td>${entry.doctor || ""}</td>
        <td>${entry.disease || ""}</td>
        <td>${entry.department || ""}</td>
        <td>${entry.room_type || ""}</td>
        <td>${entry.room_no || ""}</td>
        <td>${entry.bed_no || ""}</td>
        <td>${entry.confirmation_date ? new Date(entry.confirmation_date).toLocaleDateString() : ""}</td>
      </tr>`;
    });
  
    html += `</tbody></table>`;
    div.innerHTML = html;
  }
  function resetFields() {
    document.getElementById("uqid").value = "";
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("address").value = "";
  
    document.getElementById("patient-info").innerHTML = "";
    document.getElementById("opd-history").innerHTML = "";
    document.getElementById("lab-reports").innerHTML = "";
    document.getElementById("prescription-history").innerHTML = "";
    document.getElementById("ipd-history").innerHTML = "";

  }
  