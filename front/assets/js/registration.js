document.addEventListener('DOMContentLoaded', function() {
    // Cookie Consent Functionality
    const cookieConsent = document.getElementById('cookie-consent');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Cookie consent actions
    document.querySelector('.btn-deny').addEventListener('click', () => {
        // Save cookie preferences and hide banner
        saveCookiePreferences({
            necessary: true,
            preferences: false,
            statistics: false,
            marketing: false
        });
    });

    document.querySelector('.btn-allow-selection').addEventListener('click', () => {
        // Get selected preferences
        const preferences = {
            necessary: true, // Always required
            preferences: document.querySelector('input[name="preferences"]').checked,
            statistics: document.querySelector('input[name="statistics"]').checked,
            marketing: document.querySelector('input[name="marketing"]').checked
        };
        saveCookiePreferences(preferences);
    });

    document.querySelector('.btn-allow-all').addEventListener('click', () => {
        // Enable all cookie options
        saveCookiePreferences({
            necessary: true,
            preferences: true,
            statistics: true,
            marketing: true
        });
    });

    function saveCookiePreferences(preferences) {
        // Save preferences to localStorage
        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        // Hide cookie banner
        cookieConsent.style.display = 'none';
    }

    // Registration Form Validation
    const form = document.getElementById('registration-form');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const toggleBtns = document.querySelectorAll('.toggle-password');

    // Password visibility toggle
    toggleBtns.forEach(btn => {
        btn.innerHTML = '👁'; // Using eye emoji instead of SVG
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.style.opacity = '1';
            } else {
                input.type = 'password';
                this.style.opacity = '0.6';
            }
        });
    });

    // Form validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        const errors = {};

        // Clear previous errors
        clearErrors();

        // Revenue source validation
        const revenueSource = form.querySelector('input[name="revenue_source"]:checked');
        if (!revenueSource) {
            isValid = false;
            errors.revenue = 'Please select your main source of revenue';
        }

        // Email validation
        const email = form.querySelector('#email');
        if (!email.value) {
            isValid = false;
            errors.email = 'Email is required';
        } else if (!isValidEmail(email.value)) {
            isValid = false;
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        const password = form.querySelector('#password');
        const repeatPassword = form.querySelector('#repeat-password');
        
        if (!password.value) {
            isValid = false;
            errors.password = 'Password is required';
        } else if (password.value.length < 8) {
            isValid = false;
            errors.password = 'Password must be at least 8 characters long';
        }

        if (!repeatPassword.value) {
            isValid = false;
            errors.repeatPassword = 'Please confirm your password';
        } else if (password.value !== repeatPassword.value) {
            isValid = false;
            errors.repeatPassword = 'Passwords do not match';
        }

        // Terms acceptance validation
        const terms = form.querySelector('input[name="terms"]');
        if (!terms.checked) {
            isValid = false;
            errors.terms = 'You must accept the Terms and Conditions';
        }

        // Display errors or submit form
        if (!isValid) {
            displayErrors(errors);
        } else {
            // Here you would typically send the form data to your server
            console.log('Form submitted successfully');
            // For demo purposes, we'll just show an alert
            alert('Account created successfully!');
        }
    });

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function clearErrors() {
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(el => el.remove());
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

    function displayErrors(errors) {
        for (const [field, message] of Object.entries(errors)) {
            const element = form.querySelector(`#${field}`) || 
                           form.querySelector(`[name="${field}"]`);
            if (element) {
                const formGroup = element.closest('.form-group');
                formGroup.classList.add('error');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                formGroup.appendChild(errorDiv);
            }
        }
    }
});