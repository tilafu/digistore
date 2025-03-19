const baseUrl = 'http://127.0.0.1:5000';

export const authService = {
    async login(username, password, remember = false) {
        try {
            const response = await fetch(`${baseUrl}/admin/login`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ username, password })
            });

            const data = await this.handleResponse(response);
            if (data.status === 'success') {
                this.setToken(data.data.token, remember);
                return true;
            }
            throw new Error(data.message || 'Login failed');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${baseUrl}/admin/password-reset`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ email })
            });

            const data = await this.handleResponse(response);
            return data.status === 'success';
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
    },

    getToken() {
        return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    },

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        // Check if token is expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch {
            return false;
        }
    },

    setToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('adminToken', token);
        } else {
            sessionStorage.setItem('adminToken', token);
        }
    },

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add CSRF token if available
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken.getAttribute('content');
        }

        // Add auth token if available
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    },

    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                this.logout();
            }
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    }
};
