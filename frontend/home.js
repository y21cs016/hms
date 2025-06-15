document.addEventListener("DOMContentLoaded", function () {
    let today = new Date().toISOString().split('T')[0]; // Get today's date (YYYY-MM-DD)
    let newPatientCount = localStorage.getItem(today) || 0;
    
    document.getElementById("new-patient-count").innerText = newPatientCount;
});
