// Logout function
function logout() {
    window.location.href = 'index.html';
}

// Refresh Form
function refreshForm() {
    document.getElementById('newPatientForm').reset();
   // stopCamera(); 
    //resetPhoto(); 
}

// Update Gender based on Title
/*
function updateGender() {
    const title = document.getElementById('title').value;
    const gender = document.getElementById('gender');

    if (title === 'Mr') {
        gender.value = 'Male';
        gender.disabled = true;
    } else if (title === 'Mrs' || title === 'Miss') {
        gender.value = 'Female';
        gender.disabled = true;
    } else if (title === 'Baby') {
        gender.value = '';
        gender.disabled = false;
    } else {
        gender.disabled = false;
    }
}*/

// Start Camera
/*function startCamera() {
    const video = document.getElementById('cameraFeed');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.style.display = 'block';
        })
        .catch(err => {
            console.error("Camera access error: ", err);
            alert("Please allow camera access.");
        });
}

// Stop Camera
function stopCamera() {
    const video = document.getElementById('cameraFeed');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    video.style.display = 'none';
}

// Capture Photo (Passport Size: 3.5cm x 4.5cm)
function capturePhoto() {
    const video = document.getElementById('cameraFeed');
    const canvas = document.getElementById('photoCanvas');
    const capturedImage = document.getElementById('capturedImage');
    const context = canvas.getContext('2d');

    // Set canvas size for passport dimensions (width: 132px, height: 170px for 3.5cm x 4.5cm at 96dpi)
    canvas.width = 132;  
    canvas.height = 170; 

    // Draw image on canvas and convert to Data URL
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/png');
    capturedImage.src = photoData;

    // Hide video, show image, and stop the camera
    video.style.display = 'none';
    capturedImage.style.display = 'block';
    stopCamera();

    console.log("Captured photo data: ", photoData);
}

// Reset Photo
function resetPhoto() {
    const capturedImage = document.getElementById('capturedImage');
    capturedImage.src = '';
    capturedImage.style.display = 'none';
}
 */