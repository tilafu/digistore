class UIHelpers {
    constructor() {
        this.toastContainer = null;
        this.initializeToastContainer();
    }

    initializeToastContainer() {
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .toast-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                }

                .toast {
                    min-width: 250px;
                    margin-bottom: 10px;
                    padding: 15px;
                    border-radius: 4px;
                    color: white;
                    animation: slideIn 0.3s ease-in-out;
                }

                .toast.error {
                    background-color: #f44336;
                }

                .toast.success {
                    background-color: #4CAF50;
                }

                .toast.warning {
                    background-color: #ff9800;
                }

                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showError(message, duration = 5000) {
        this.showToast(message, 'error', duration);
    }

    showSuccess(message, duration = 3000) {
        this.showToast(message, 'success', duration);
    }

    showWarning(message, duration = 4000) {
        this.showToast(message, 'warning', duration);
    }

    showToast(message, type, duration) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        this.toastContainer.appendChild(toast);

        // Remove toast after duration
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-in-out';
            toast.addEventListener('animationend', () => {
                this.toastContainer.removeChild(toast);
            });
        }, duration);
    }

    // Loading indicator
    showLoading(container, message = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'loading-spinner';
        loader.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-text">${message}</div>
        `;

        // Add styles if not already present
        if (!document.querySelector('#loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                .loading-spinner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .loading-text {
                    margin-top: 10px;
                    color: #666;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(loader);
        return loader;
    }

    hideLoading(loader) {
        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }
}

// Export singleton instance
window.uiHelpers = new UIHelpers();