document.getElementById("staffLoginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
  
    const message = document.getElementById("message");
    message.textContent = "Logging in...";
  
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        message.textContent = "✅ Login successful! Status set to Active.";
        message.style.color = "green";
        setTimeout(() => {
          window.location.href = "staff.html";
        }, 800);
  
        
      }
      
       else {
        message.textContent = data.message || "❌ Login failed.";
        message.style.color = "red";
      }
    } catch (error) {
      console.error("Login error:", error);
      message.textContent = "⚠ Server error. Please try again later.";
      message.style.color = "orange";
    }
  });