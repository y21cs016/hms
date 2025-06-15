document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("pharmacyStockForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
      vendor_name: document.getElementById("vendor_name").value,
      address: document.getElementById("vendor_address").value,
      gst_number: document.getElementById("gst_no").value,
      reference_no: document.getElementById("ref_no").value,
      checked_by: document.getElementById("checked_by").value,
      received_date: document.getElementById("date").value,
      medicines: [],
    };

    const rows = document.querySelectorAll("#medicineBody tr");
    rows.forEach((row) => {
      const product_name = row.querySelector(".product_name").value;
      const batch_no = row.querySelector(".batch_no").value;
      const expiry_date = row.querySelector(".expiry_date").value;
      const quantity = parseInt(row.querySelector(".quantity").value);
      data.medicines.push({ product_name, batch_no, expiry_date, quantity });
    });

    fetch("http://localhost:3001/addStock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((response) => {
        alert(response.message);
        form.reset();
        document.querySelector("#medicineBody").innerHTML = "";
        addMedicineRow();
      })
      .catch((err) => console.error("Error:", err));
  });
});

function addMedicineRow() {
  const tbody = document.getElementById("medicineBody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="product_name" required /></td>
    <td><input type="text" class="batch_no" required /></td>
    <td><input type="date" class="expiry_date" required /></td>
    <td><input type="number" class="quantity" required /></td>
    <td><button type="button" onclick="removeRow(this)">Delete</button></td>
  `;
  tbody.appendChild(row);
}

function removeRow(button) {
  button.closest("tr").remove();
}
