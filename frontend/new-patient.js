function generateUniqueID() {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // Generate a random number between 100000 and 999999
    return `OP${randomNum}`; // Concatenate 'OP' with the random number
}

document.getElementById('newPatientForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const data = {
        uqid: generateUniqueID(), // Generate and include the unique ID
        title: formData.get('title'),
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        maritalStatus: formData.get('maritalStatus'),
        ageY: formData.get('ageY'),
        ageM: formData.get('ageM') || 0,
        ageD: formData.get('ageD') || 0,
        gender: formData.get('gender'),
        photo: document.getElementById('photoData').value   // base64 string
    };

    try {
        const response = await fetch('http://localhost:3000/add-patient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message);

        // **Now increase new patient count only after submission**
        let today = new Date().toISOString().split('T')[0]; // Get today's date (YYYY-MM-DD)
        let newPatientCount = localStorage.getItem(today) || 0;

        newPatientCount++; // Increase count
        localStorage.setItem(today, newPatientCount);

        // Redirect to home after 2 seconds
        setTimeout(() => {
            window.location.href = "home.html";
        }, 300);

    } catch (err) {
        console.error('Error:', err.message);
        alert('Submission failed. Please check the server.');
    }
});


// Access elements
const video = document.getElementById('cameraFeed');
const canvas = document.getElementById('photoCanvas');
const capturedImage = document.getElementById('capturedImage');
const photoDataInput = document.getElementById('photoData');

let mediaStream = null;

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            mediaStream = stream;
            video.srcObject = stream;
        })
        .catch(err => {
            alert("Unable to access camera: " + err.message);
        });
}

function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth || 132;
    canvas.height = video.videoHeight || 170;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL('image/png');
    capturedImage.src = imageDataURL;
    capturedImage.style.display = 'block';

    // Store the photo in hidden input
    photoDataInput.value = imageDataURL;

    // Stop the camera
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

