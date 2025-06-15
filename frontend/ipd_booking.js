document.addEventListener("DOMContentLoaded", function() {
    // Fetch IPD bookings from the server to display them
    fetch("/ipd-bookings")
        .then(response => response.json())
        .then(data => {
            data.forEach(ipd => {
                addIpdToTable(ipd);
            });
        })
        .catch(error => {
            console.error('Error fetching IPD bookings:', error);
        });
});

function addIpdToTable(ipdData) {
    const tableBody = document.getElementById('ipdTable').getElementsByTagName('tbody')[0];
    const newRow = tableBody.insertRow();
    const bookingDate = new Date(ipdData.booking_date);
    const formattedDate = `${bookingDate.getDate().toString().padStart(2, '0')}/${
        (bookingDate.getMonth() + 1).toString().padStart(2, '0')}/${
        bookingDate.getFullYear()}`;


    newRow.innerHTML = `
        <td>${ipdData.ipd_id}</td>
        <td>${ipdData.uqid}</td>
        <td>${ipdData.name}</td>
        <td>${ipdData.disease}</td>
        <td>${ipdData.department}</td>
        <td>${ipdData.doctor}</td>
        <td>${ipdData.company_status}</td>
        <td>${formattedDate}</td>
        <td><button onclick="confirmIpd('${ipdData.uqid}', '${ipdData.ipd_id}')">CONFIRM IPD</button></td>
    `;
}

function confirmIpd(uqid, ipd_id) {
    window.location.href = `confirm_ipd.html?uqid=${uqid}&ipd_id=${ipd_id}`;
}
document.addEventListener("DOMContentLoaded", function () {
    fetch("/ipd-bookings")
        .then(response => response.json())
        .then(data => {
            // Store data globally
            window.allPatients = data;

            // Display all patients initially
            displayPatients(window.allPatients);
        })
        .catch(error => {
            console.error('Error fetching IPD bookings:', error);
        });
});

function displayPatients(patients) {
    const tableBody = document.getElementById('ipdTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear previous data

    patients.forEach(ipd => {
        const newRow = tableBody.insertRow();
        const bookingDate = new Date(ipd.booking_date);
        const formattedDate = `${bookingDate.getDate().toString().padStart(2, '0')}/${
            (bookingDate.getMonth() + 1).toString().padStart(2, '0')}/${
            bookingDate.getFullYear()}`;

        newRow.innerHTML = `
            <td>${ipd.ipd_id}</td>
            <td>${ipd.uqid}</td>
            <td>${ipd.name}</td>
            <td>${ipd.disease}</td>
            <td>${ipd.department}</td>
            <td>${ipd.doctor}</td>
            <td>${ipd.company_status}</td>
            <td>${formattedDate}</td>
            <td><button onclick="confirmIpd('${ipd.uqid}', '${ipd.ipd_id}')">CONFIRM IPD</button></td>
        `;
    });
}

function liveFilterPatients() {
    let nameInput = document.getElementById("searchPatient").value.toLowerCase();
    let uqidInput = document.getElementById("searchUqid").value.toLowerCase();
    let ipd_idInput = document.getElementById("searchipd_id").value.toLowerCase();
    let phoneInput = document.getElementById("searchPhone").value;
    let from = document.getElementById("fromDate").value;
    let to = document.getElementById("toDate").value;

    let filtered = window.allPatients.filter(p => {
        let matchesName = nameInput ? p.name.toLowerCase().includes(nameInput) : true;
        let matchesUqid = uqidInput ? p.uqid.toLowerCase().includes(uqidInput) : true;
        let matchesipd_id = ipd_idInput ? p.ipd_id.toLowerCase().includes(ipd_idInput) : true;
        let matchesPhone = phoneInput ? p.phone.includes(phoneInput) : true;

        let matchesDate = true;
        if (from && to) {
            let createdAt = new Date(p.booking_date);
            let fromDate = new Date(from);
            let toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999); // include full 'to' day
            matchesDate = createdAt >= fromDate && createdAt <= toDate;
        }

        return matchesName && matchesUqid && matchesPhone && matchesDate && matchesipd_id;
    });

    displayPatients(filtered);
}

function confirmIpd(uqid, ipd_id) {
    window.location.href = `confirm_ipd.html?uqid=${uqid}&ipd_id=${ipd_id}`;
}

window.onload = function () {
    document.getElementById("searchPatient").addEventListener("input", liveFilterPatients);
    document.getElementById("searchUqid").addEventListener("input", liveFilterPatients);
    document.getElementById("searchipd_id").addEventListener("input", liveFilterPatients);
    document.getElementById("fromDate").addEventListener("change", liveFilterPatients);
    document.getElementById("toDate").addEventListener("change", liveFilterPatients);
    document.getElementById("searchPhone").addEventListener("input", liveFilterPatients);
};
