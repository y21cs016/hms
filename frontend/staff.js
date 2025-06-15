
// Existing functions (unchanged for brevity)
async function fetchStaff() {
    const specialization = document.getElementById("specialization").value;
    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;

    if (!from || !to) {
        try {
            const response = await fetch(`/api/staff?specialization=${encodeURIComponent(specialization)}`);
            const data = await response.json();
            displayStaff(data);
        } catch (err) {
            console.error("Error fetching staff data:", err);
            alert("Failed to load staff data.");
        }
    }
}

function displayStaff(data) {
    const tbody = document.querySelector("#staffTable tbody");
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="8" style="text-align:center;">No staff found.</td>`;
        tbody.appendChild(row);
        return;
    }

    data.forEach(staff => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${staff.staff_id}</td>
            <td>${staff.staff_name}</td>
            <td>${staff.specialization || '-'}</td>
            <td>${staff.age || '-'}</td>
            <td>${staff.address || '-'}</td>
            <td>${staff.mobile_number || '-'}</td>
            <td>${staff.status || '-'}</td>
            <td>
                <button onclick='deleteStaff("${staff.staff_id}")'>Delete</button>
                <button class="edit-btn" data-staff='${JSON.stringify(staff)}'>Edit</button>
            </td>

        `;
        tbody.appendChild(row);
    });
}

async function deleteStaff(staffId) {
    const confirmDelete = confirm("Are you sure you want to delete this staff member?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`/api/delete-staff/${staffId}`, {
            method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            fetchStaff();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (err) {
        console.error("Error deleting staff:", err);
        alert("Failed to delete staff.");
    }
}

function exportStaffRange(format) {
    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;
    const specialization = document.getElementById("specialization").value;

    if (!from || !to) {
        alert("Please select both From and To dates to download.");
        return;
    }

    const url = `/export-staff-range?from=${from}&to=${to}&specialization=${encodeURIComponent(specialization)}&format=${format}`;
    window.location.href = url;
}

function toggleButtons() {
    const panel = document.getElementById("slideButtons");
    panel.classList.toggle("active");
}

window.onload = () => {
    document.getElementById("specialization").addEventListener("change", fetchStaff);
    document.getElementById("fromDate").addEventListener("change", fetchStaff);
    document.getElementById("toDate").addEventListener("change", fetchStaff);
    fetchStaff();
};

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-btn')) {
        const staffData = JSON.parse(e.target.getAttribute('data-staff'));
        editStaff(staffData);
    }
});

async function updateStaff(staffId, updatedData) {
    try {
        const response = await fetch(`/api/update-staff/${staffId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            fetchStaff(); // Refresh list
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (err) {
        console.error("Error updating staff:", err);
        alert("Failed to update staff.");
    }
}

function editStaff(staff) {
  // Fill the form with staff data
  document.getElementById('editStaffId').value = staff.staff_id;
document.getElementById('editStaffName').value = staff.staff_name;
document.getElementById('editSpecialization').value = staff.specialization || '';
document.getElementById('editAge').value = staff.age || '';
document.getElementById('editAddress').value = staff.address || '';
document.getElementById('editMobile').value = staff.mobile_number || '';
document.getElementById('editStatus').value = staff.status || '';

  // Hide the staff table and filters
  document.getElementById('staffTable').style.display = 'none';
  document.querySelector('.top-bar').style.display = 'none';
  document.querySelectorAll('.input-box').forEach(e => e.style.display = 'none');
  document.getElementById('specialization').style.display = 'none';
  document.querySelector('.photo-actions-container').style.display = 'none';

  // Show the form
  document.getElementById('editFormContainer').style.display = 'block';
}

function cancelEdit() {
  // Hide the form
  document.getElementById('editFormContainer').style.display = 'none';

  // Show everything else back
  document.getElementById('staffTable').style.display = 'table';
  document.querySelector('.top-bar').style.display = 'flex';
  document.querySelectorAll('.input-box').forEach(e => e.style.display = 'block');
  document.getElementById('specialization').style.display = 'inline-block';
  document.querySelector('.photo-actions-container').style.display = 'block';
}


document.getElementById("editForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const staffId = document.getElementById("editStaffId").value;

    const updatedData = {
        staff_name: document.getElementById("editStaffName").value,
        specialization: document.getElementById("editSpecialization").value,
        age: document.getElementById("editAge").value,
        address: document.getElementById("editAddress").value,
        mobile_number: document.getElementById("editMobile").value,
        status: document.getElementById("editStatus").value,
    };

    try {
        const response = await fetch(`/api/update-staff/${staffId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            cancelEdit();
            fetchStaff();
        } else {
            alert(`Update failed: ${result.message}`);
        }
    } catch (err) {
        console.error("Error updating staff:", err);
        alert("Failed to update staff.");
    }
});
