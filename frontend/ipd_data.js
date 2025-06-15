document.addEventListener("DOMContentLoaded", function () {
    // Global storage for IPD data
    let allIpdData = [];

    // Fetch IPD data once
    fetch("/confirm-ipd-data")
        .then(response => response.json())
        .then(data => {
            allIpdData = data;
            renderTable(allIpdData);
            restoreDischargeButtons();
        })
        .catch(error => {
            console.error('Error fetching IPD data:', error);
        });

    // Attach listeners to input fields for live filtering
    const filterInputs = document.querySelectorAll("#searchipd_id, #searchUqid, #searchPatient, #searchdepartment, #searchRoomNo, #fromDate, #toDate");
    filterInputs.forEach(input => {
        input.addEventListener("input", applyFilters);
    });

    // Function to render the table based on provided data
    function renderTable(data) {
        const tableBody = document.getElementById('ipdDataTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = ""; // Clear existing rows

        data.forEach(ipd => {
            const formattedDate = formatDate(ipd.confirmation_date);
            const dischargeBtnId = `discharge-btn-${ipd.ipd_id}`;
            const isDischarged = ipd.status === 'Discharged';

            const newRow = tableBody.insertRow();

            newRow.innerHTML = `
                <td>${ipd.ipd_id}</td>
                <td>${ipd.uqid}</td>
                <td>${ipd.name}</td>
                <td>${ipd.gender}</td>
                <td>${ipd.disease}</td>
                <td>${ipd.department}</td>
                <td>${ipd.doctor}</td>
                <td>${ipd.company_status}</td>
                <td>${formattedDate}</td>
                <td>${ipd.room_type}</td>
                <td>${ipd.room_no}</td>
                <td>${ipd.bed_no}</td>
                <td><button onclick="fillReport('${ipd.ipd_id}')">Fill Report</button></td>
                <td>
                    ${isDischarged ? 'Discharged' : `<button id="${dischargeBtnId}" onclick="dischargePatient('${ipd.ipd_id}', this)">Discharge</button>`}
                </td>
            `;
        });
    }

    // Filter function to filter based on inputs
    function applyFilters() {
        const ipdId = document.getElementById("searchipd_id").value.toLowerCase();
        const uqid = document.getElementById("searchUqid").value.toLowerCase();
        const name = document.getElementById("searchPatient").value.toLowerCase();
        const department = document.getElementById("searchdepartment").value.toLowerCase();
        const roomNo = document.getElementById("searchRoomNo").value.toLowerCase();
        const fromDate = document.getElementById("fromDate").value;
        const toDate = document.getElementById("toDate").value;

        const filtered = allIpdData.filter(ipd => {
            const formattedDate = new Date(ipd.confirmation_date);
            const inDateRange = (!fromDate || new Date(fromDate) <= formattedDate) &&
                (!toDate || new Date(toDate) >= formattedDate);

            return (
                ipd.ipd_id.toLowerCase().includes(ipdId) &&
                ipd.uqid.toLowerCase().includes(uqid) &&
                ipd.name.toLowerCase().includes(name) &&
                ipd.department.toLowerCase().includes(department) &&
                ipd.room_no.toLowerCase().includes(roomNo) &&
                inDateRange
            );
        });

        renderTable(filtered);
        restoreDischargeButtons();
    }

    // Restore disabled state of discharge buttons from localStorage
    function restoreDischargeButtons() {
        allIpdData.forEach(ipd => {
            const disabled = localStorage.getItem(`discharge-disabled-${ipd.ipd_id}`);
            if (disabled === 'true') {
                const btn = document.getElementById(`discharge-btn-${ipd.ipd_id}`);
                if (btn) {
                    btn.disabled = true;
                    btn.style.backgroundColor = '#b22211';
                    btn.style.color = 'white';
                }
            }
        });
    }

    // Make these functions globally accessible
    window.dischargePatient = dischargePatient;
    window.fillReport = fillReport;

    // Discharge patient handler
    function dischargePatient(ipdId, buttonElement) {
        // Disable button immediately and change style
        buttonElement.disabled = true;
        buttonElement.style.backgroundColor = '#b22211';
        buttonElement.style.color = 'white';

        // Get today's date in DD/MM/YYYY format
       const dischargeDate = new Date();
       const formattedDischargeDate = `${String(dischargeDate.getDate()).padStart(2, '0')}/${String(dischargeDate.getMonth() + 1).padStart(2, '0')}/${dischargeDate.getFullYear()}`;

        fetch(`/discharge-ipd/${ipdId}`, {
            method: 'PUT'
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);

                // Save button disabled state in localStorage so it persists
                localStorage.setItem(`discharge-disabled-${ipdId}`, 'true');
                localStorage.setItem(`discharge-date-${ipdId}`, formattedDischargeDate);

                // Append discharge date next to the button
                const dischargeCell = buttonElement.parentElement;
                const dateSpan = document.createElement('span');
                dateSpan.textContent = ` (${formattedDischargeDate})`;
                dateSpan.style.marginLeft = '8px';
                dateSpan.style.color = 'green';
                dischargeCell.appendChild(dateSpan);

                // Optionally update status cell or reload table - for now disable button is enough
            })
            .catch(err => {
                console.error('Error:', err);

                // On error revert button state
                buttonElement.disabled = false;
                buttonElement.style.backgroundColor = '';
                buttonElement.style.color = '';
            });
    }

    // Format date helper
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Redirect to fill report page
    function fillReport(ipd_id) {
        window.location.href = `fill_ipd.html?ipd_id=${ipd_id}`;
    }
});
