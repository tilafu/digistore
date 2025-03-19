class AuthService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api';
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.apiUrl}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.status === 'success') {
                localStorage.setItem('token', data.data.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    getToken() {
        return localStorage.getItem('token');
    }

    logout() {
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    }
}

window.authService = new AuthService();