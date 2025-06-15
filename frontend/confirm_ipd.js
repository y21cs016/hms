document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const uqid = params.get("uqid");
    const ipd_id = params.get("ipd_id");
    

    document.getElementById("uqid").innerText = uqid;
    document.getElementById("ipdId").innerText = ipd_id;

    fetch(`/get-ipd-details/${uqid}/${ipd_id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("patientName").innerText = data.name;
            document.getElementById("disease").innerText = data.disease;
            document.getElementById("department").innerText = data.department;
            document.getElementById("doctor").innerText = data.doctor;
            document.getElementById("companyStatus").innerText = data.company_status;

            document.getElementById("phone").innerText = data.phone;
            document.getElementById("gender").innerText = data.gender;
            document.getElementById("age").innerText = data.age;
            document.getElementById("address").innerText = data.address;

            document.getElementById("confirmForm").addEventListener("submit", function (e) {
                e.preventDefault();

                const confirmData = {
                    uqid,
                    ipd_id,
                    name: data.name,
                    phone: data.phone,
                    gender: data.gender,
                    age: data.age,
                    address: data.address,
                    disease: data.disease,
                    department: data.department,
                    doctor: data.doctor,
                    company_status: data.company_status,
                    room_type: document.getElementById("roomType").value,
                    room_no: document.getElementById("roomNo").value,
                    bed_no: document.getElementById("bedNo").value
                };

                fetch('/confirm-ipd', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(confirmData)
                })
                    .then(res => res.json())
                    .then(response => {
                        alert(response.message);
                        window.location.href = "ipd_booking.html";
                    })
                    .catch(err => console.error("Error:", err));
            });
        });


    fetch('/get-available-rooms')
    .then(res => res.json())
    .then(rooms => {
        const roomTypeSelect = document.getElementById("roomType");
        const roomNoSelect = document.getElementById("roomNo");
        const bedNoSelect = document.getElementById("bedNo");

        // Optional: Clear existing options
        roomTypeSelect.innerHTML = "";
        roomNoSelect.innerHTML = "";
        bedNoSelect.innerHTML = "";

        rooms.forEach(room => {
            const option1 = new Option(room.room_type, room.room_type);
            const option2 = new Option(room.room_no, room.room_no);
            const option3 = new Option(room.bed_no, room.bed_no);

            if (!Array.from(roomTypeSelect.options).some(opt => opt.value === room.room_type)) {
                roomTypeSelect.appendChild(option1);
            }
            if (!Array.from(roomNoSelect.options).some(opt => opt.value === room.room_no)) {
                roomNoSelect.appendChild(option2);
            }
            bedNoSelect.appendChild(option3);
        });
    })
    .catch(err => console.error("Room fetch error:", err));

});
document.addEventListener("DOMContentLoaded", function () {
    const roomTypeSelect = document.getElementById("roomType");
    const roomNoSelect = document.getElementById("roomNo");
    const bedNoSelect = document.getElementById("bedNo");

    roomTypeSelect.addEventListener("change", function () {
        const roomType = this.value;
        roomNoSelect.innerHTML = "<option value=''>-- Select Room No --</option>";
        bedNoSelect.innerHTML = "<option value=''>-- Select Bed No --</option>";

        if (roomType) {
            fetch(`/available-rooms/${roomType}`)
                .then(res => res.json())
                .then(data => {
                    const roomNos = [...new Set(data.map(r => r.room_no))];
                    roomNos.forEach(roomNo => {
                        roomNoSelect.appendChild(new Option(roomNo, roomNo));
                    });
                });
        }
    });

    roomNoSelect.addEventListener("change", function () {
        const roomNo = this.value;
        bedNoSelect.innerHTML = "<option value=''>-- Select Bed No --</option>";

        if (roomNo) {
            fetch(`/available-beds/${roomNo}`)
                .then(res => res.json())
                .then(data => {
                    data.forEach(bed => {
                        bedNoSelect.appendChild(new Option(bed.bed_no, bed.bed_no));
                    });
                });
        }
    });
});

