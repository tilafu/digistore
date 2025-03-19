document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password');
    const errorMessages = document.querySelectorAll('.error-message');

    // Password visibility toggle
    toggleButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        toggleButton.querySelector('.eye-icon').classList.toggle('open');
    });

    // Form validation
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Check email field
        const email = document.getElementById('email');
        if (!email.value.trim()) {
            showError(email, 'Email is required');
            isValid = false;
        } else {
            hideError(email);
        }

        // Check password field
        const password = document.getElementById('password');
        if (!password.value.trim()) {
            showError(password, 'Password is required');
            isValid = false;
        } else {
            hideError(password);
        }

        if (isValid) {
            // Submit form logic here (e.g., AJAX request)
            console.log('Form submitted:', new FormData(form));
        }
    });

    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        formGroup.classList.add('error');
    }

    function hideError(input) {
        const formGroup = input.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        errorMessage.style.display = 'none';
        formGroup.classList.remove('error');
    }

    // Back link functionality
    document.querySelector('.back-link').addEventListener('click', (e) => {
        e.preventDefault();
        history.back();
    });
});