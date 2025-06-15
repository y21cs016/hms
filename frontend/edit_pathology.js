document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathologyId = urlParams.get("pathology_id");
  
    if (!pathologyId) {
      document.getElementById("statusMsg").innerText = "No ID provided";
      return;
    }
  
    // Fetch data to populate form
    fetch(`/get-pathology/${pathologyId}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("id").value = data.id;
        document.getElementById("uqid").value = data.uqid;
        document.getElementById("name").value = data.name;
        document.getElementById("disease").value = data.disease;
        document.getElementById("doctor").value = data.doctor;
        document.getElementById("test_names").value = data.test_names;
      });
  
    // Submit only updated test_names
    document.getElementById("editForm").addEventListener("submit", (e) => {
      e.preventDefault();
  
      const test_names = document.getElementById("test_names").value;
  
      fetch(`/update-test-names/${pathologyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_names })
      })
        .then(res => res.text())
        .then(msg => {
          document.getElementById("statusMsg").innerText = msg;
          setTimeout(() => {
            window.location.href = "pathology.html"; // redirect back
          }, 1500);
        });
    });
  });
  