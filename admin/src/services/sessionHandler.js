class SessionHandler {
    constructor(options = {}) {
        this.timeoutDuration = options.timeout || 3600000; // 1 hour
        this.warningTime = options.warningTime || 300000;  // 5 minutes
        this.activity = null;
        this.timeoutId = null;
        this.warningId = null;
    }

    startTracking() {
        // Track user activity
        document.addEventListener('click', () => this.resetTimer());
        document.addEventListener('keypress', () => this.resetTimer());
        document.addEventListener('mousemove', () => this.resetTimer());
        document.addEventListener('scroll', () => this.resetTimer());

        this.resetTimer();
    }

    resetTimer() {
        this.activity = Date.now();
        clearTimeout(this.timeoutId);
        clearTimeout(this.warningId);

        this.warningId = setTimeout(() => {
            this.showWarning();
        }, this.timeoutDuration - this.warningTime);

        this.timeoutId = setTimeout(() => {
            this.handleTimeout();
        }, this.timeoutDuration);
    }

    showWarning() {
        // Show warning modal
        const warningModal = new bootstrap.Modal(document.getElementById('timeoutWarning'));
        warningModal.show();
    }

    handleTimeout() {
        window.authService.logout();
    }

    stopTracking() {
        clearTimeout(this.timeoutId);
        clearTimeout(this.warningId);
    }
}

window.sessionHandler = new SessionHandler();