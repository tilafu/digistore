class ClientsController {
    constructor() {
        this.clients = [];
        this.modal = null;
        this.currentClientId = null;
        this.init();
    }

    async init() {
        this.modal = new bootstrap.Modal(document.getElementById('clientModal'));
        this.setupEventListeners();
        await this.loadClients();
    }

    setupEventListeners() {
        document.getElementById('addClientBtn').addEventListener('click', () => {
            this.currentClientId = null;
            document.getElementById('clientModalTitle').textContent = 'Add New Client';
            document.getElementById('clientForm').reset();
            this.modal.show();
        });

        document.getElementById('saveClientBtn').addEventListener('click', () => {
            this.handleSaveClient();
        });

        document.getElementById('clientSearch').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    async loadClients() {
        try {
            const response = await window.apiService.getClients();
            this.clients = response.data;
            this.renderClients();
        } catch (error) {
            console.error('Failed to load clients:', error);
            this.showError('Failed to load clients');
        }
    }

    getMembershipBadgeClass(tier) {
        return `membership-badge membership-${tier.toLowerCase()}`;
    }

    renderClients(clientsToShow = this.clients) {
        const tbody = document.getElementById('clientsTableBody');
        tbody.innerHTML = clientsToShow.map(client => `
            <tr>
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td><span class="badge bg-${client.status === 'active' ? 'success' : 'warning'}">${client.status}</span></td>
                <td><span class="${this.getMembershipBadgeClass(client.membershipTier)}">${client.membershipTier}</span></td>
                <td>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" 
                             style="width: ${(client.progress / 7) * 100}%"
                             aria-valuenow="${client.progress}" 
                             aria-valuemin="0" 
                             aria-valuemax="7">
                            ${client.progress}/7
                        </div>
                    </div>
                </td>
                <td>${new Date(client.joinDate).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="clientsController.editClient('${client.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="clientsController.deleteClient('${client.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async handleSaveClient() {
        const form = document.getElementById('clientForm');
        const formData = new FormData(form);
        const clientData = Object.fromEntries(formData.entries());

        try {
            if (this.currentClientId) {
                await window.apiService.updateClient(this.currentClientId, clientData);
            } else {
                await window.apiService.createClient(clientData);
            }
            
            await this.loadClients();
            this.modal.hide();
            this.showSuccess('Client saved successfully');
        } catch (error) {
            console.error('Failed to save client:', error);
            this.showError('Failed to save client');
        }
    }

    showError(message) {
        alert(message);
    }

    showSuccess(message) {
        alert(message);
    }
}

const clientsController = new ClientsController();
window.clientsController = clientsController;