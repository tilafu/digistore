class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    getAuthHeaders() {
        const token = window.authService?.getToken();
        return token ? { 
            ...this.defaultHeaders,
            'Authorization': `Bearer ${token}`
        } : this.defaultHeaders;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error: ${error.message}`);
            throw error;
        }
    }

    // Client endpoints
    async getClients() {
        return this.request('/clients');
    }

    async getClientById(id) {
        return this.request(`/clients/${id}`);
    }

    async createClient(clientData) {
        return this.request('/clients', {
            method: 'POST',
            body: JSON.stringify(clientData)
        });
    }

    async updateClient(id, updates) {
        return this.request(`/clients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async updateClientStatus(id, status) {
        return this.request(`/clients/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    // Navigation endpoints
    async getNavigation(clientId) {
        return this.request(`/navigation/${clientId}`);
    }

    async updateNavigation(clientId, menu) {
        return this.request(`/navigation/${clientId}`, {
            method: 'PUT',
            body: JSON.stringify({ menu })
        });
    }

    // Profile endpoints
    async updateProfile(profileData) {
        return this.request('/admin/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(passwordData) {
        return this.request('/admin/password', {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });
    }
}

window.apiService = new ApiService();