document.addEventListener('DOMContentLoaded', function() {
    // Check if authenticated
    if (!authService.isAuthenticated()) {
        window.location.href = './login.html';
        return;
    }
    
    // Set up logout functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            authService.logout();
        });
    }
    
    // Display admin username
    const adminUsername = document.getElementById('adminUsername');
    try {
        const token = authService.getToken();
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (adminUsername && payload.username) {
                adminUsername.textContent = payload.username;
            }
        }
    } catch (error) {
        console.error('Error parsing token:', error);
    }
});