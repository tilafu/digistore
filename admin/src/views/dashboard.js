class DashboardController {
    constructor() {
        this.init();
    }

    async init() {
        try {
            await this.loadDashboardData();
            this.setupEventListeners();
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
        }
    }

    async loadDashboardData() {
        const stats = await window.apiService.getDashboardStats();
        this.updateDashboardUI(stats);
    }

    updateDashboardUI(stats) {
        document.getElementById('totalClients').textContent = stats.totalClients;
        document.getElementById('activeClients').textContent = stats.activeClients;
        document.getElementById('totalRevenue').textContent = window.utils.formatters.currency(stats.revenue);
        
        const activities = stats.recentActivities
            .map(activity => `
                <div class="activity-item">
                    <span class="activity-time">${window.utils.formatters.date(activity.timestamp)}</span>
                    <span class="activity-text">${activity.description}</span>
                </div>
            `)
            .join('');
        
        document.getElementById('recentActivities').innerHTML = activities;
    }

    setupEventListeners() {
        // Add any dashboard-specific event listeners
    }
}

new DashboardController();