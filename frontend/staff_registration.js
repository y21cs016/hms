// Generate staff ID like DOC001, DOC002
function generateUniqueStaffID() {
    let newId;
    do {
        const randomNum = Math.floor(1000 + Math.random() * 9000); // ensures 4 digits
        newId = 'STF' + randomNum;
    } while (localStorage.getItem(newId)); // optional: to avoid duplicates

    localStorage.setItem(newId, true); // mark this ID as used
    return newId;
}

document.getElementById('staffForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const staff_id = generateUniqueStaffID(); // Generate new ID
    document.getElementById('staff_id').value = staff_id; // Assign to hidden input


    const formData = new FormData(e.target);

    const data = {
    staff_id: staff_id,
    staff_name: formData.get('staff_name'), // ✅ changed from staffName
    password: formData.get("password"),
    specialization: formData.get('specialization'),
    dob: formData.get('dob'),
    age: formData.get('age'),
    address: formData.get('address'),
    email: formData.get('email'),
    mobile_number: formData.get('mobile_number')
};



    try {
        const response = await fetch('http://localhost:3000/add-staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        alert(result.message);
        window.location.href = "staff.html";
        e.target.reset(); // Reset form
    } catch (err) {
        console.error('Error:', err.message);
        alert('Failed to register staff. Please check server.');
    }
});