document.addEventListener("DOMContentLoaded", () => {
  const medicineRows = document.getElementById("medicineRows");
  const addRowBtn = document.getElementById("addRowBtn");
  const dispenseForm = document.getElementById("dispenseForm");
  let stockData = [];

  // Fetch stock data
  function fetchStock() {
    fetch("http://localhost:3001/getStock")
      .then(res => res.json())
      .then(data => {
        stockData = data;
        removeExpiredMedicines();  // Call to remove expired medicines
        updateStockTable();
        populateMedicines();
        addMedicineRow(); // Add first row on load
      });
  }
 // Remove expired medicines
 function removeExpiredMedicines() {
  const today = new Date();

  stockData = stockData.filter(item => {
    const expiryDate = new Date(item.expiry_date);
    return expiryDate >= today; // Keep only medicines that are not expired
  });
}
  // Populate dropdown options with medicine names
  function populateMedicines() {
    document.querySelectorAll(".med_id").forEach(select => {
      select.innerHTML = `<option value="">Select Medicine</option>`;
      stockData.forEach(item => {
        const option = document.createElement("option");
        option.value = item.med_id;
        option.textContent = item.product_name;
        select.appendChild(option);
      });
    });
  }

  // Update current stock table with expiry alerts
  function updateStockTable() {
    const stockBody = document.getElementById("stockBody");
    stockBody.innerHTML = "";

    const today = new Date();
    const searchQuery = document.getElementById("searchMedicine").value.toLowerCase();
    const selectedFilter = document.getElementById("expiryFilter").value;

    stockData.forEach(item => {
      const expiryDate = new Date(item.expiry_date);
      const formattedExpiryDate = formatDate(expiryDate); // Format expiry date
      const diffInTime = expiryDate.getTime() - today.getTime();
      const diffInDays = diffInTime / (1000 * 3600 * 24);

      // Determine color category
      let colorCategory = "none";
      if (diffInDays <= 30) colorCategory = "red";
      else if (diffInDays <= 90) colorCategory = "orange";

      // Apply search filter
      if (!item.product_name.toLowerCase().includes(searchQuery)) {
        return; // skip this item if search doesn't match
      }

      // Apply expiry color filter
      if (selectedFilter === "red" && colorCategory !== "red") {
        return;
      }
      if (selectedFilter === "orange" && colorCategory !== "orange") {
        return;
      }

      // Create row
      const row = document.createElement("tr");

      // Set background color
      if (colorCategory === "red") {
        row.style.backgroundColor = "#ff4d4d";
        row.style.color = "white";
      } else if (colorCategory === "orange") {
        row.style.backgroundColor = "#ff9900";
        row.style.color = "white";
      }

      row.innerHTML = `
        <td>${item.med_id}</td> <!-- Medicine ID -->
        <td>${item.product_name}</td>
        <td>${item.batch_no}</td>
        <td>${formattedExpiryDate}</td> <!-- Formatted Expiry Date -->
        <td>${item.current_stock}</td>
      `;
      stockBody.appendChild(row);
    });
  }

  // Date formatting function to convert to DD/MM/YYYY
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  document.getElementById("searchMedicine").addEventListener("input", updateStockTable);
  document.getElementById("expiryFilter").addEventListener("change", updateStockTable);

  // Add medicine row
  function addMedicineRow() {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <select class="med_id" required>
          <option value="">Select Medicine</option>
        </select>
      </td>
      <td><input type="text" class="batch_no" readonly required></td>
      <td><input type="number" class="quantity" required /></td>
      <td><button type="button" class="remove-row">Remove</button></td>
    `;
    medicineRows.appendChild(tr);
  
    // Re-populate medicine options freshly
    const medSelect = tr.querySelector(".med_id");
    stockData.forEach(item => {
      const option = document.createElement("option");
      option.value = item.med_id;
      option.textContent = item.product_name;
      medSelect.appendChild(option);
    });
  
    // Reset fields
    tr.querySelector(".batch_no").value = "";
    tr.querySelector(".quantity").value = "";
  
    // Add change listener to update batch no
    medSelect.addEventListener("change", function () {
      const selected = stockData.find(item => item.med_id === this.value);
      const batchInput = tr.querySelector(".batch_no");
      batchInput.value = selected ? selected.batch_no : "";
    });
  
    // Remove row
    tr.querySelector(".remove-row").addEventListener("click", () => {
      tr.remove();
    });
  }

  addRowBtn.addEventListener("click", addMedicineRow);

  // Handle form submission
  dispenseForm.addEventListener("submit", e => {
    e.preventDefault();

    const patientInfo = {
      patient_name: document.getElementById("patient_name").value,
      refer_by: document.getElementById("refer_by").value,
      reference_no: document.getElementById("reference_no").value,
      checked_by: document.getElementById("checked_by").value,
      dispense_date: document.getElementById("dispense_date").value
    };

    const medicines = [];
    document.querySelectorAll("#medicineRows tr").forEach(row => {
      const med_id = row.querySelector(".med_id").value;
      const product = stockData.find(m => m.med_id === med_id);
      if (product) {
        medicines.push({
          ...patientInfo,
          med_id,
          product_name: product.product_name,
          batch_no: product.batch_no,
          quantity: parseInt(row.querySelector(".quantity").value)
        });
      }
    });

    // Send each medicine to backend
    // Send the full array to backend
    fetch("http://localhost:3001/dispenseMedicine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(medicines)
    })
    .then(res => res.json())
    .then(response => {
      if (response.message) {
        alert(response.message);
      }
      if (response.details) {
        console.error("Partial errors:", response.details);
        alert("Some medicines could not be dispensed. Check console for details.");
      }
      window.location.reload();
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Something went wrong. Please try again.");
    });
  });

  fetchStock();
});
