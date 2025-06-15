document.addEventListener("DOMContentLoaded", () => {
    let originalData = [];
  
    function renderTable(data) {
  const container = document.getElementById("pathologyContainer");
  container.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = "<tr><td colspan='7'>No pathology records found.</td></tr>";
    return;
  }

  data.forEach(entry => {
    const status = localStorage.getItem(`status_${entry.id}`) || "Pending";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.uqid}</td>
      <td>${entry.name}</td>
      <td>${entry.disease}</td>
      <td>${entry.doctor}</td>
      <td>${entry.test_names}</td>
      <td>${status}</td>
      <td><button class="fill-btn" data-id="${entry.id}">Fill Report</button></td>
    `;
    container.appendChild(row);
  });

  document.querySelectorAll('.fill-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const pathologyId = e.target.getAttribute("data-id");
      if (pathologyId) {
        window.location.href = `test_reports.html?pathology_id=${pathologyId}`;
      }
    });
  });
}

  
    function fetchData() {
      fetch('/get-all-pathology')
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch pathology data");
          return res.json();
        })
        .then(data => {
          originalData = data;
          renderTable(data);
        })
        .catch(err => {
          console.error("Error loading pathology data:", err);
          document.getElementById("errorMessage").innerText = "Failed to load pathology records.";
        });
    }
  
    function filterData() {
      let uqid = document.getElementById("searchUqid").value.toLowerCase();
      let name = document.getElementById("searchName").value.toLowerCase();
      let disease = document.getElementById("searchDisease").value.toLowerCase();
      let test = document.getElementById("searchTest").value.toLowerCase();
      let fromDate = document.getElementById("fromDate").value;
      let toDate = document.getElementById("toDate").value;
  
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate + "T23:59:59") : null;
  
      let filtered = originalData.filter(entry => {
        const matchesUqid = entry.uqid.toLowerCase().includes(uqid);
        const matchesName = entry.name.toLowerCase().includes(name);
        const matchesDisease = entry.disease.toLowerCase().includes(disease);
        const matchesTest = entry.test_names.toLowerCase().includes(test);
  
        const addedDate = new Date(entry.added_on);
        const validFrom = !from || addedDate >= from;
        const validTo = !to || addedDate <= to;
  
        return matchesUqid && matchesName && matchesDisease && matchesTest && validFrom && validTo;
      });
  
      renderTable(filtered);
    }
  
    // Input event listeners
    ["searchUqid", "searchName", "searchDisease", "searchTest", "fromDate", "toDate"].forEach(id => {
      document.getElementById(id).addEventListener("input", filterData);
    });
  
    // Refresh button
    document.getElementById("refreshBtn").addEventListener("click", () => {
      document.getElementById("searchUqid").value = "";
      document.getElementById("searchName").value = "";
      document.getElementById("searchDisease").value = "";
      document.getElementById("searchTest").value = "";
      document.getElementById("fromDate").value = "";
      document.getElementById("toDate").value = "";
      renderTable(originalData);
    });
  
    fetchData();
  });
  