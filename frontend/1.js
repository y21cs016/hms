function showContent(page) {
    document.getElementById("contentFrame").src = page;
}
function toggleDropdown(element) {
    const dropdown = element.nextElementSibling;
    const allDropdowns = document.querySelectorAll('.dropdown');

    // Close other dropdowns
    allDropdowns.forEach(d => {
        if (d !== dropdown) {
            d.style.display = 'none';
        }
    });

    // Toggle clicked one
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
    }
}

function toggleSubmenu(element) {
    const allSubmenus = document.querySelectorAll('.submenu');

    // Close all other submenus first
    allSubmenus.forEach(submenu => {
        if (submenu !== element.nextElementSibling) {
            submenu.style.display = "none";
            if (submenu.previousElementSibling) {
                submenu.previousElementSibling.classList.remove('active');
            }
        }
    });

    // Toggle the clicked one
    element.classList.toggle('active');
    const nextUl = element.nextElementSibling;
    if (nextUl && nextUl.classList.contains('submenu')) {
        if (nextUl.style.display === "block") {
            nextUl.style.display = "none";
        } else {
            nextUl.style.display = "block";
        }
    }
}

