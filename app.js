// Command Center Platform
class CommandCenter {
    constructor() {
        this.state = {
            currentPage: 'landing',
            isLoggedIn: false,
            user: null,
            services: {
                gmail: { connected: false, name: 'Gmail', icon: '📧' },
                notion: { connected: false, name: 'Notion', icon: '📝' },
                whatsapp: { connected: false, name: 'WhatsApp', icon: '💬' },
                outlook: { connected: false, name: 'Outlook', icon: '📬' },
                slack: { connected: false, name: 'Slack', icon: '💼' },
                trello: { connected: false, name: 'Trello', icon: '📋' }
            },
            emails: [],
            filterPriority: 'all',
            filterTime: 'today'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadMockData();
        this.checkAuthState();
    }

    bindEvents() {
        // Landing page buttons
        document.getElementById('login-btn')?.addEventListener('click', () => this.showAuthModal('login'));
        document.getElementById('signup-btn')?.addEventListener('click', () => this.showAuthModal('signup'));
        document.getElementById('hero-signup')?.addEventListener('click', () => this.showAuthModal('signup'));
        
        // Auth modal
        document.getElementById('auth-close')?.addEventListener('click', () => this.hideAuthModal());
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.tab));
        });
        
        // Auth forms
        document.getElementById('login-email-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signup-email-form')?.addEventListener('submit', (e) => this.handleSignup(e));
        
        // Social auth buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleSocialAuth(btn.classList.contains('google') ? 'google' : 'github'));
        });
        
        // Dashboard navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(item.dataset.section);
            });
        });
        
        // Service connections
        document.querySelectorAll('.service-btn.connect').forEach(btn => {
            btn.addEventListener('click', () => {
                const service = btn.closest('.service-card').dataset.service;
                this.connectService(service);
            });
        });
        
        document.querySelectorAll('.service-btn.disconnect').forEach(btn => {
            btn.addEventListener('click', () => {
                const service = btn.closest('.service-card').dataset.service;
                this.disconnectService(service);
            });
        });
        
        document.querySelectorAll('.service-btn:not(.connect):not(.disconnect)').forEach(btn => {
            btn.addEventListener('click', () => {
                const service = btn.closest('.service-card').dataset.service;
                this.syncService(service);
            });
        });
        
        // Email filters
        document.getElementById('email-priority')?.addEventListener('change', (e) => {
            this.state.filterPriority = e.target.value;
            this.renderEmails();
        });
        
        document.getElementById('email-time')?.addEventListener('change', (e) => {
            this.state.filterTime = e.target.value;
            this.renderEmails();
        });
        
        // Settings
        document.getElementById('settings-btn')?.addEventListener('click', () => this.showSettings());
        document.getElementById('user-settings-btn')?.addEventListener('click', () => this.showSettings());
        document.getElementById('settings-close')?.addEventListener('click', () => this.hideSettings());
        
        // Settings tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchSettingsTab(e.target.dataset.tab));
        });
        
        // Add service button
        document.getElementById('add-service-btn')?.addEventListener('click', () => this.showAddServiceModal());
        
        // Quick actions
        document.getElementById('quick-email')?.addEventListener('click', () => this.showToast('Nouvel email', 'Ouverture du composeur...'));
        document.getElementById('quick-task')?.addEventListener('click', () => this.showToast('Nouvelle tâche', 'Formulaire de tâche ouvert'));
        document.getElementById('quick-event')?.addEventListener('click', () => this.showToast('Nouvel événement', 'Calendrier ouvert'));
        document.getElementById('quick-note')?.addEventListener('click', () => this.showToast('Nouvelle note', 'Éditeur de note ouvert'));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.metaKey || e.ctrlKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        document.querySelector('.search-input')?.focus();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.showToast('Nouvel email', 'Ouverture du composeur...');
                        break;
                    case 't':
                        e.preventDefault();
                        this.showToast('Nouvelle tâche', 'Formulaire de tâche ouvert');
                        break;
                }
            }
        });
    }

    loadMockData() {
        // Mock emails
        this.state.emails = [
            {
                id: 1,
                subject: 'Réunion client demain - Préparation requise',
                preview: 'Bonjour, je vous confirme notre réunion de demain à 14h. Merci de préparer les maquettes finales...',
                sender: 'Sophie Martin',
                time: 'Il y a 2 heures',
                priority: 'high',
                unread: true
            },
            {
                id: 2,
                subject: 'Facture #2024-089 - Paiement en attente',
                preview: 'Votre facture pour le mois de janvier est disponible. Montant total: 1 250€. Échéance: 31 janvier...',
                sender: 'Comptabilité',
                time: 'Il y a 5 heures',
                priority: 'high',
                unread: true
            },
            {
                id: 3,
                subject: 'Rapport hebdomadaire - Résultats positifs',
                preview: 'Chers collègues, voici le rapport de la semaine. Nos objectifs ont été atteints à 115%...',
                sender: 'Direction',
                time: 'Hier',
                priority: 'medium',
                unread: false
            },
            {
                id: 4,
                subject: 'Invitation: Webinar Intelligence Artificielle',
                preview: 'Vous êtes invité à notre webinar sur l\'IA dans les entreprises. Date: 15 février à 10h...',
                sender: 'Event Team',
                time: 'Il y a 2 jours',
                priority: 'low',
                unread: false
            },
            {
                id: 5,
                subject: 'Confirmation de commande #4521',
                preview: 'Votre commande a été confirmée et sera livrée sous 3-5 jours ouvrés...',
                sender: 'Shop Elite',
                time: 'Il y a 3 jours',
                priority: 'low',
                unread: false
            }
        ];
        
        // Mock connected services
        this.state.services.gmail.connected = true;
        this.state.services.notion.connected = true;
        this.state.services.whatsapp.connected = true;
        
        this.updateServiceUI();
        this.renderEmails();
        this.updateStats();
        this.setCurrentDate();
    }

    checkAuthState() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn) {
            this.state.isLoggedIn = true;
            this.state.user = JSON.parse(localStorage.getItem('user') || '{}');
            this.showDashboard();
        }
    }

    showAuthModal(tab = 'login') {
        document.getElementById('auth-modal').classList.remove('hidden');
        this.switchAuthTab(tab);
    }

    hideAuthModal() {
        document.getElementById('auth-modal').classList.add('hidden');
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
        document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
    }

    handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        
        // Simulate login
        this.state.isLoggedIn = true;
        this.state.user = {
            name: 'Mouhamadou',
            email: email,
            initials: 'MT'
        };
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(this.state.user));
        
        this.hideAuthModal();
        this.showDashboard();
        this.showToast('Bienvenue !', 'Connexion réussie');
    }

    handleSignup(e) {
        e.preventDefault();
        const form = e.target;
        const inputs = form.querySelectorAll('input');
        
        // Simulate signup
        this.state.isLoggedIn = true;
        this.state.user = {
            name: inputs[0].value,
            email: inputs[2].value,
            initials: inputs[0].value.charAt(0) + inputs[1].value.charAt(0)
        };
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(this.state.user));
        
        this.hideAuthModal();
        this.showDashboard();
        this.showToast('Compte créé !', 'Bienvenue sur Command Center');
    }

    handleSocialAuth(provider) {
        // Simulate social auth
        this.state.isLoggedIn = true;
        this.state.user = {
            name: 'Mouhamadou',
            email: 'mouhamadou@gmail.com',
            initials: 'MT'
        };
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(this.state.user));
        
        this.hideAuthModal();
        this.showDashboard();
        this.showToast('Bienvenue !', `Connecté avec ${provider}`);
    }

    showDashboard() {
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        this.updateUserUI();
    }

    updateUserUI() {
        const userName = document.querySelector('.user-name');
        const avatar = document.querySelector('.avatar');
        
        if (userName && this.state.user) {
            userName.textContent = this.state.user.name || 'Utilisateur';
        }
        
        if (avatar && this.state.user) {
            avatar.textContent = this.state.user.initials || 'U';
        }
    }

    navigate(section) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
        
        // In a real app, this would load different views
        this.showToast('Navigation', `Section: ${section}`);
    }

    connectService(service) {
        // Simulate OAuth flow
        this.showToast('Connexion...', `Redirection vers ${this.state.services[service].name}`);
        
        setTimeout(() => {
            this.state.services[service].connected = true;
            this.updateServiceUI();
            this.showToast('Connecté !', `${this.state.services[service].name} connecté avec succès`);
        }, 1500);
    }

    disconnectService(service) {
        this.state.services[service].connected = false;
        this.updateServiceUI();
        this.showToast('Déconnecté', `${this.state.services[service].name} déconnecté`);
    }

    syncService(service) {
        this.showToast('Synchronisation...', `Mise à jour de ${this.state.services[service].name}`);
        
        setTimeout(() => {
            this.showToast('Synchronisé !', `${this.state.services[service].name} est à jour`);
        }, 2000);
    }

    updateServiceUI() {
        Object.keys(this.state.services).forEach(service => {
            const card = document.querySelector(`[data-service="${service}"]`);
            if (card) {
                const isConnected = this.state.services[service].connected;
                card.classList.toggle('connected', isConnected);
                
                const status = card.querySelector('.service-status');
                if (status) {
                    status.textContent = isConnected ? 'Connecté' : 'Non connecté';
                }
                
                const actions = card.querySelector('.service-actions');
                if (actions) {
                    if (isConnected) {
                        actions.innerHTML = `
                            <button class="service-btn">Synchroniser</button>
                            <button class="service-btn disconnect">Déconnecter</button>
                        `;
                    } else {
                        actions.innerHTML = `
                            <button class="service-btn connect">Connecter</button>
                        `;
                    }
                    
                    // Rebind events
                    actions.querySelectorAll('.service-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            if (btn.classList.contains('connect')) {
                                this.connectService(service);
                            } else if (btn.classList.contains('disconnect')) {
                                this.disconnectService(service);
                            } else {
                                this.syncService(service);
                            }
                        });
                    });
                }
            }
        });
    }

    renderEmails() {
        const emailList = document.getElementById('email-list');
        if (!emailList) return;
        
        let filteredEmails = [...this.state.emails];
        
        // Apply filters
        if (this.state.filterPriority !== 'all') {
            filteredEmails = filteredEmails.filter(e => e.priority === this.state.filterPriority);
        }
        
        emailList.innerHTML = filteredEmails.map(email => `
            <div class="email-item" data-id="${email.id}">
                <div class="email-priority ${email.priority}"></div>
                <div class="email-content">
                    <div class="email-subject">${email.subject}</div>
                    <div class="email-preview">${email.preview}</div>
                </div>
                <div class="email-meta">
                    <div class="email-time">${email.time}</div>
                    <div class="email-sender">${email.sender}</div>
                </div>
            </div>
        `).join('');
        
        // Add click events
        emailList.querySelectorAll('.email-item').forEach(item => {
            item.addEventListener('click', () => {
                const emailId = parseInt(item.dataset.id);
                this.openEmail(emailId);
            });
        });
    }

    openEmail(id) {
        const email = this.state.emails.find(e => e.id === id);
        if (email) {
            email.unread = false;
            this.showToast('Email ouvert', email.subject);
            this.renderEmails();
            this.updateStats();
        }
    }

    updateStats() {
        const unreadCount = this.state.emails.filter(e => e.unread).length;
        document.getElementById('email-count').textContent = unreadCount;
        
        // Update badge
        const emailBadge = document.querySelector('[data-section="emails"] .nav-badge');
        if (emailBadge) {
            emailBadge.textContent = unreadCount;
        }
    }

    setCurrentDate() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = now.toLocaleDateString('fr-FR', options);
        }
    }

    showSettings() {
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    hideSettings() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    switchSettingsTab(tab) {
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
        
        // In a real app, this would show different settings sections
    }

    showAddServiceModal() {
        this.showToast('Ajouter un service', 'Sélectionnez un service à connecter');
    }

    showToast(title, message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <div class="toast-message">
                <strong>${title}</strong><br>
                ${message}
            </div>
            <button class="toast-close">×</button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.remove();
        }, 5000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CommandCenter();
});