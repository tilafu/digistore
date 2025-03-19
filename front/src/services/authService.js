class AuthService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.token = localStorage.getItem('token');
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.baseUrl}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.status === 'success') {
                this.token = data.data.token;
                localStorage.setItem('token', this.token);
                return true;
            }
            throw new Error(data.message || 'Login failed');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    getToken() {
        return this.token;
    }

    isAuthenticated() {
        return !!this.token;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    }
}

window.authService = new AuthService();