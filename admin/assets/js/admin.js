class AdminDashboard {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
    }

    initializeElements() {
        // Client management
        this.clientSelect = document.getElementById('clientSelect');
        this.clientDetails = document.querySelector('.client-details');
        this.progressBar = document.getElementById('progressBar');
        this.progressValue = document.getElementById('progressValue');
        this.tierSelect = document.getElementById('tierSelect');
        this.creditScore = document.getElementById('creditScore');
        this.totalBalance = document.getElementById('totalBalance');
        this.dailyBalance = document.getElementById('dailyBalance');
        this.frozenBalance = document.getElementById('frozenBalance');
        this.updateButton = document.getElementById('updateClient');

        // Product assignment
        this.assignmentClient = document.getElementById('assignmentClient');
        this.setNumber = document.getElementById('setNumber');
        this.assignButton = document.getElementById('assignProducts');
        this.productGrid = document.querySelector('.product-grid');

        // Transaction messages
        this.messageType = document.getElementById('messageType');
        this.messageList = document.querySelector('.message-list');
    }

    attachEventListeners() {
        this.clientSelect.addEventListener('change', () => this.loadClientDetails());
        this.progressBar.addEventListener('input', () => this.updateProgressValue());
        this.updateButton.addEventListener('click', () => this.updateClientData());
        this.assignButton.addEventListener('click', () => this.assignProductsToClient());
        this.messageType.addEventListener('change', () => this.loadTransactionMessages());
    }

    async loadInitialData() {
        await Promise.all([
            this.loadClients(),
            this.loadProducts(),
            this.loadTransactionMessages()
        ]);
    }

    async loadClients() {
        try {
            const response = await fetch('/api/admin/clients');
            const clients = await response.json();
            
            this.clientSelect.innerHTML = '<option value="">Select Client</option>';
            this.assignmentClient.innerHTML = '<option value="">Select Client</option>';
            
            clients.forEach(client => {
                const option = new Option(client.username, client.id);
                this.clientSelect.add(option.cloneNode(true));
                this.assignmentClient.add(option);
            });
        } catch (error) {
            console.error('Failed to load clients:', error);
            alert('Failed to load clients');
        }
    }

    async loadClientDetails() {
        const clientId = this.clientSelect.value;
        if (!clientId) {
            this.clientDetails.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch(`/api/admin/clients/${clientId}`);
            const client = await response.json();

            this.progressBar.value = client.progressPercentage;
            this.progressValue.textContent = `${client.progressPercentage}%`;
            this.tierSelect.value = client.tier;
            this.creditScore.value = client.creditScore;
            this.totalBalance.value = client.totalBalance;
            this.dailyBalance.value = client.dailyBalance;
            this.frozenBalance.value = client.frozenBalance;

            this.clientDetails.classList.remove('hidden');
        } catch (error) {
            console.error('Failed to load client details:', error);
            alert('Failed to load client details');
        }
    }

    async updateClientData() {
        const clientId = this.clientSelect.value;
        if (!clientId) return;

        const data = {
            progressPercentage: parseInt(this.progressBar.value),
            tier: this.tierSelect.value,
            creditScore: parseInt(this.creditScore.value),
            totalBalance: parseFloat(this.totalBalance.value),
            dailyBalance: parseFloat(this.dailyBalance.value),
            frozenBalance: parseFloat(this.frozenBalance.value)
        };

        try {
            const response = await fetch(`/api/admin/clients/${clientId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Client updated successfully');
            } else {
                throw new Error('Failed to update client');
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update client');
        }
    }

    updateProgressValue() {
        this.progressValue.textContent = `${this.progressBar.value}%`;
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/admin/products');
            const products = await response.json();
            
            this.productGrid.innerHTML = products.map(product => `
                <div class="product-item" data-id="${product.id}">
                    <h3>${product.name}</h3>
                    <p>Price: $${product.price}</p>
                </div>
            `).join('');

            this.productGrid.querySelectorAll('.product-item').forEach(item => {
                item.addEventListener('click', () => {
                    item.classList.toggle('selected');
                });
            });
        } catch (error) {
            console.error('Failed to load products:', error);
            alert('Failed to load products');
        }
    }

    async assignProductsToClient() {
        const clientId = this.assignmentClient.value;
        const setNumber = this.setNumber.value;
        if (!clientId) return;

        const selectedProducts = Array.from(
            this.productGrid.querySelectorAll('.product-item.selected')
        ).map(item => item.dataset.id);

        if (selectedProducts.length !== 40) {
            alert('Please select exactly 40 products');
            return;
        }

        try {
            const response = await fetch('/api/admin/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    setNumber,
                    productIds: selectedProducts,
                    assignmentDate: new Date().toISOString().split('T')[0]
                })
            });

            if (response.ok) {
                alert('Products assigned successfully');
                this.productGrid.querySelectorAll('.selected').forEach(item => {
                    item.classList.remove('selected');
                });
            } else {
                throw new Error('Failed to assign products');
            }
        } catch (error) {
            console.error('Assignment failed:', error);
            alert('Failed to assign products');
        }
    }

    async loadTransactionMessages() {
        const type = this.messageType.value;
        try {
            const response = await fetch(`/api/admin/transactions${type !== 'all' ? `?type=${type}` : ''}`);
            const messages = await response.json();
            
            this.messageList.innerHTML = messages.map(msg => `
                <div class="message-item ${msg.type}">
                    <strong>${msg.type.toUpperCase()}</strong>
                    <p>${msg.message}</p>
                    <small>Amount: $${msg.amount} - Status: ${msg.status}</small>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load messages:', error);
            alert('Failed to load transaction messages');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AdminDashboard();
});

// back/routes/admin.js
const express = require('express');
const router = express.Router();
const { Client } = require('pg');
const auth = require('../middleware/auth');
const db = require('../database/connection');

// Get all clients
router.get('/clients', auth, async (req, res) => {
  try {
    const clients = await db.query('SELECT id, username FROM Clients');
    res.json(clients.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client details
router.get('/clients/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await db.query(
      'SELECT * FROM Clients WHERE id = $1', 
      [id]
    );
    if (client.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update client
router.put('/clients/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { progressPercentage, tier, creditScore, totalBalance, dailyBalance, frozenBalance } = req.body;
    
    await db.query(
      `UPDATE Clients 
       SET progress_percentage = $1, tier = $2, credit_score = $3, 
           total_balance = $4, daily_balance = $5, frozen_balance = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [progressPercentage, tier, creditScore, totalBalance, dailyBalance, frozenBalance, id]
    );
    
    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export the router
module.exports = router;
