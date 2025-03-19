class NavigationWebSocketService {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.heartbeatInterval = null;
        this.reconnectTimeout = null;
        this.baseUrl = process.env.WS_URL || 'ws://localhost:3000/ws/navigation';
        this.backoffDelay = 1000; // Start with 1 second delay
    }

    connect() {
        const token = window.authService?.getToken();
        if (!token) return;

        this.ws = new WebSocket(this.baseUrl);
        
        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.ws.send(JSON.stringify({
                type: 'AUTH',
                token
            }));
            this.startHeartbeat();
            this.updateConnectionStatus('connected');
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onclose = this.handleClose.bind(this);
        this.ws.onerror = this.handleError.bind(this);

        // Custom event for navigation updates
        document.addEventListener('navigationUpdate', (event) => {
            this.sendNavigation(event.detail);
        });
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            switch(data.type) {
                case 'NAVIGATION_UPDATE':
                    this.updateUI(data.data);
                    break;
                case 'ERROR':
                    window.uiHelpers.showError(data.message);
                    break;
                case 'HEARTBEAT_ACK':
                    // Heartbeat acknowledged
                    break;
                default:
                    console.warn('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
            window.uiHelpers.showError('Failed to process server message');
        }
    }

    handleClose(event) {
        clearInterval(this.heartbeatInterval);
        this.updateConnectionStatus('disconnected');

        if (!event.wasClean) {
            window.uiHelpers.showWarning('Connection lost. Attempting to reconnect...');
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            // Exponential backoff
            const delay = Math.min(this.backoffDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
            
            this.reconnectTimeout = setTimeout(() => {
                this.updateConnectionStatus('connecting');
                this.connect();
            }, delay);
        } else {
            window.uiHelpers.showError('Failed to reconnect. Please refresh the page.');
        }
    }

    handleError(error) {
        console.error('WebSocket error:', error);
        window.uiHelpers.showError('Connection error occurred');
    }

    cleanup() {
        clearInterval(this.heartbeatInterval);
        clearTimeout(this.reconnectTimeout);
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    updateUI(navigation) {
        // Update navigation in DOM
        const navContainer = document.querySelector('.menu-sidebar');
        if (navContainer && navigation) {
            navContainer.innerHTML = this.renderNavigation(navigation);
            this.attachEventListeners();
        }
    }

    renderNavigation(navigation) {
        if (!navigation || !navigation.menu) return '';
        
        return `
            <div class="navigation-wrapper">
                <div class="navigation-header">
                    <span class="menu-title">${navigation.title || 'Navigation'}</span>
                    <div class="ws-status"></div>
                </div>
                <nav class="navigation-menu">
                    ${this.renderMenuItems(navigation.menu)}
                </nav>
            </div>
        `;
    }

    renderMenuItems(items) {
        if (!Array.isArray(items)) return '';
        
        return items.map(item => `
            <div class="menu-item ${item.children ? 'has-submenu' : ''} ${item.active ? 'active' : ''}">
                <a href="${item.url || '#'}" class="menu-link" data-id="${item.id}">
                    ${item.icon ? `<i class="menu-icon ${item.icon}"></i>` : ''}
                    <span class="menu-text">${item.label}</span>
                    ${item.children ? '<i class="submenu-indicator fas fa-chevron-right"></i>' : ''}
                </a>
                ${item.children ? `
                    <div class="submenu">
                        ${this.renderMenuItems(item.children)}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    attachEventListeners() {
        const menuItems = document.querySelectorAll('.menu-item.has-submenu');
        menuItems.forEach(item => {
            const link = item.querySelector('.menu-link');
            const submenu = item.querySelector('.submenu');
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                item.classList.toggle('expanded');
                
                if (submenu) {
                    const isExpanded = item.classList.contains('expanded');
                    submenu.style.maxHeight = isExpanded ? `${submenu.scrollHeight}px` : '0';
                }
            });
        });
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'HEARTBEAT' }));
            }
        }, 30000); // Default to 30 seconds
    }

    updateConnectionStatus(status) {
        const statusIndicator = document.querySelector('.ws-status');
        if (statusIndicator) {
            statusIndicator.className = `ws-status ${status}`;
            statusIndicator.textContent = `WebSocket: ${status}`;
        }
    }

    disconnect() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

window.navigationService = new NavigationWebSocketService();