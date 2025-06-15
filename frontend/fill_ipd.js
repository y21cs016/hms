document.addEventListener("DOMContentLoaded", function () {
    const ipd_id = new URLSearchParams(window.location.search).get("ipd_id");

    fetch(`/get-ipd-by-id?ipd_id=${ipd_id}`)
        .then(response => response.json())
        .then(data => {
            if (data) fillPatientInfo(data);
        });
});

function fillPatientInfo(data) {
    document.getElementById("name").textContent = data.name;
    document.getElementById("gender").textContent = data.gender;
    document.getElementById("age").textContent = data.age;
    document.getElementById("phone").textContent = data.phone;
    document.getElementById("disease").textContent = data.disease;
    document.getElementById("doctor").textContent = data.doctor;
    document.getElementById("department").textContent = data.department;

    populateOperationTypes(data.department);
}

const operationMap = {
    "Cardiology": {
        "Catheter Ablation": ["catheter_position", "ablation_energy", "ablation_duration", "treatment_area", "patient_condition"],
        "Angiogram": ["artery_condition", "stent_placement", "blockage_level", "risk_factor", "patient_condition"],
        "Echocardiogram": ["heart_function", "ejection_fraction", "valve_condition", "patient_condition"]
    },
    "Neurology": {
    "Craniotomy": [
      "indication", "pre_op_imaging", "part_of_brain_accessed", "procedure_done", 
      "bleeding_status", "tumor_or_lesion_removed", "intra_op_findings", 
      "complications", "post_op_monitoring", "outcome", "surgeon_notes"
    ],
    "VP Shunt Placement": [
      "shunt_type", "reason_for_shunt", "shunt_location", "valve_type", 
      "catheter_placement", "intra_op_drainage_status", "infection_control_measures", 
      "post_op_ventricular_size", "complications", "success_status", "remarks"
    ],
    "Thrombolysis": [
      "stroke_type", "ct_findings", "drug_used", "dosage", "time_of_onset", 
      "time_of_administration", "contraindications_checked", "patient_response", 
      "follow_up_imaging", "post_thrombolysis_monitoring", "outcome"
    ],
    "Other_Operation": [
      "operation_name", "pre_op_condition", "anesthesia_used",
      "operation_details", "intra_op_findings", "complications", "post_op_care", "remarks"
    ]
  }, 
    "Gynecology": {
        "Hysterectomy": ["uterus_size", "fibroids_present", "bleeding_severity", "ovary_removal", "surgical_approach", "recovery_plan"],
        "c_section": ["gestational_age_weeks", "baby_position", "placenta_position", "reason_for_c_section", "delivery_time", "baby_weight"],
        "dnc": ["reason_for_procedure", "pregnancy_weeks", "bleeding_status", "anesthesia_type", "tissue_collected", "complications"],
        "Pregnancy Monitoring": ["trimester", "fetal_heart_rate", "mother_blood_sugar", "fetal_position", "ultrasound_findings", "any_complications"],
        "Ovarian Cystectomy": ["cyst_size", "cyst_type", "side_of_cyst", "symptoms_present", "method_used", "biopsy_result"],
        "Tubal Ligation": ["method_used", "reason_for_procedure", "bilateral_or_unilateral", "anesthesia_type", "post_op_status", "recovery_time"]
    },
    "Endocrinology": {
    "thyroid_ultrasound": [
        "thyroid_size", "nodules_present", "nodule_size", "echogenicity",
        "vascularity", "calcifications", "lymph_nodes", "recommendation", "radiologist_comments"
        ],
    "hormone_panel": [
        "tsh_level", "t3_level", "t4_level", "insulin_level", "cortisol_level",
        "lh_level", "fsh_level", "prolactin_level", "androgen_level", "report_summary"
        ],
    "glucose_tolerance_test": [
        "fasting_glucose", "glucose_1hr", "glucose_2hr", "glucose_3hr",
        "insulin_response", "glucose_curve_type"
        ],
    "bone_density_test": [
        "t_score", "z_score", "affected_area", "bone_mass_index", "osteoporosis_risk",
        "fracture_risk", "calcium_level", "vitamin_d_level", "recommended_supplements", "physician_comments"
        ]
    },
    "Pulmonology": {
    "Pulmonary Function Test": [
      "fev1", "fvc", "fev1_fvc_ratio", "pef", "lung_volume", "diffusion_capacity", "test_result_summary"
    ],
    "Bronchoscopy": [
      "indication", "findings", "biopsy_taken", "complications", "visual_observation", "recommendations"
    ],
    "Chest_xray": [
      "lung_opacity", "effusion_presence", "infection_signs", "radiologist_report", "impression"
    ],
    "Sleep Study": [
      "ahi_score", "oxygen_saturation", "sleep_apnea_type", "snore_index", "recommendation"
    ],
    "Pleural Fluid Analysis": [
      "fluid_type", "protein_level", "ldh_level", "glucose_level", "cell_count", "infection_marker", "final_diagnosis"
    ]
  },
  "Orthopedics": {
  "Knee_Replacement": [
    "joint_type", "implant_material", "surgery_side", "pre_op_knee_score", "post_op_knee_score",
    "rehab_plan", "recovery_time"
  ],
  "Hip_Replacement": [
    "implant_type", "surgical_approach", "affected_side", "bone_quality", "range_of_motion", 
    "complications"
  ],
  "Arthroscopy": [
    "joint_involved", "procedure_type", "findings", "repair_done", "surgeon_notes", "recovery_time"
  ],
  "Fracture_Fixation": [
    "bone_involved", "fracture_type", "fixation_method", "surgery_duration", "immobilization_required", 
    "follow_up_plan"
  ],
  "Spinal_Fusion": [
    "fusion_level", "screws_used", "bone_graft_type", "neurological_status", "post_op_mobility",
    "surgery_notes"
  ]
}

    

};

function populateOperationTypes(dept) {
    const typeSelect = document.getElementById("operationType");
    const operations = operationMap[dept] || {};

    for (let op in operations) {
        const option = document.createElement("option");
        option.value = op;
        option.textContent = op;
        typeSelect.appendChild(option);
    }

    typeSelect.addEventListener("change", function () {
        populateOperationFields(dept, this.value);
    });

    if (typeSelect.options.length > 0) {
        typeSelect.dispatchEvent(new Event("change"));
    }
}

function populateOperationFields(dept, operation) {
    const fields = operationMap[dept][operation] || [];
    const container = document.getElementById("operationFields");
    container.innerHTML = "";

    fields.forEach(field => {
        const label = document.createElement("label");
        label.innerHTML = `${field.replace(/_/g, ' ')}: <input type="text" id="${field}">`;
        container.appendChild(label);
    });
}

// Update this function to validate input before submission
function submitReport() {
    const payload = {
        ipd_id: new URLSearchParams(window.location.search).get("ipd_id"),
        weight: document.getElementById("weight").value,
        bp: document.getElementById("bp").value,
        operation_type: document.getElementById("operationType").value,
        department: document.getElementById("department").textContent
    };

    // Validation: Check if all fields are filled in
    if (!payload.weight || !payload.bp || !payload.operation_type) {
        alert("Please fill in all required fields.");
        return;
    }

    const additionalFields = operationMap[payload.department][payload.operation_type];
    additionalFields.forEach(field => {
        payload[field] = document.getElementById(field).value;
        if (!payload[field]) {  // Check if any operation-specific field is empty
            alert(`Please fill in the ${field.replace(/_/g, ' ')} field.`);
            return;
        }
    });

    // Send the data to the backend
    fetch("/submit-ipd-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => alert(data.message))
        .catch(err => alert("Error submitting report"));
}
