document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('emergencyForm');

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            uqid: generateUqid(),
            ipd_id: generateIpdId(),
            name: formData.get('name'),
            phone: formData.get('phone'),
            gender: formData.get('gender'),
            age: formData.get('age'),
            address: formData.get('address'),
            disease: formData.get('disease'),
            department: formData.get('department'),
            doctor: formData.get('doctor'),
            company_status: formData.get('company_status'),
            room_type: formData.get('room_type'),
            room_no: formData.get('room_no'),
            bed_no: formData.get('bed_no')
        };

        fetch('/confirm-ipd', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(response => {
            alert(response.message);
            window.location.href = "emergency.html"; // Redirect after submission
        })
        .catch(err => {
            console.error("Error:", err);
        });
    });

    function generateUqid() {
        const digits = Math.floor(10000 + Math.random() * 90000); // Ensures 5-digit number
        return 'EME' + digits;
    }
    
    function generateIpdId() {
        const digits = Math.floor(1000 + Math.random() * 9000); // Ensures 4-digit number
        return 'IPD' + digits;
    }
    
    
});
