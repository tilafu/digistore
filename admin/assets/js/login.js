document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (authService.isAuthenticated()) {
        window.location.href = './index.html';
        return;
    }

    // Form elements
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginError = document.getElementById('loginError');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginButton = loginForm.querySelector('button[type="submit"]');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const resetPasswordModal = new bootstrap.Modal(document.getElementById('resetPasswordModal'));
    const sendResetLinkButton = document.getElementById('sendResetLink');
    const resetEmailInput = document.getElementById('resetEmail');

    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Form validation
        if (!loginForm.checkValidity()) {
            e.stopPropagation();
            loginForm.classList.add('was-validated');
            return;
        }

        // Show loading state
        loginButton.disabled = true;
        loginSpinner.classList.remove('d-none');
        loginError.classList.add('d-none');
        
        try {
            const username = usernameInput.value;
            const password = passwordInput.value;
            const remember = rememberMeCheckbox.checked;
            
            const success = await authService.login(username, password, remember);
            
            if (success) {
                window.location.href = './index.html';
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            loginError.textContent = 'Invalid username or password';
            loginError.classList.remove('d-none');
            console.error('Login error:', error);
        } finally {
            loginButton.disabled = false;
            loginSpinner.classList.add('d-none');
        }
    });

    // Forgot password link
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            resetPasswordModal.show();
        });
    }

    // Send password reset link
    if (sendResetLinkButton) {
        sendResetLinkButton.addEventListener('click', async function() {
            const email = resetEmailInput.value;
            if (!email) return;

            sendResetLinkButton.disabled = true;
            sendResetLinkButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Sending...';

            try {
                await authService.requestPasswordReset(email);
                resetPasswordModal.hide();
                alert('If an account with this email exists, a reset link has been sent.');
            } catch (error) {
                console.error('Password reset error:', error);
            } finally {
                sendResetLinkButton.disabled = false;
                sendResetLinkButton.textContent = 'Send Reset Link';
            }
        });
    }
});