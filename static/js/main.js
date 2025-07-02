import { showToast, confirmDelete } from './ui-utils.js';

// Export functions to window for inline scripts
window.showToast = showToast;
window.confirmDelete = confirmDelete;

// Authentication is now handled by the backend (HttpOnly cookies).

// Toggle mobile menu
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Active menu item based on current URL
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
    
    // Notifications
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotifications();
        });
    }
    
    // Set current date for date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        if (!input.value && !input.min) {
            input.value = today;
        }
    });
    
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Show notifications dropdown
function showNotifications() {
    const notifications = [
        { message: 'Estoque baixo: Parafuso M8', type: 'warning', time: '5 min' },
        { message: 'Nova entrada registrada', type: 'success', time: '10 min' },
        { message: 'Produto crítico: Martelo 500g', type: 'danger', time: '15 min' }
    ];
    
    showToast('3 novas notificações', 'info');
}

// Global utility functions
window.validateForm = function(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    form.classList.add('was-validated');
    return form.checkValidity();
};

window.clearForm = function(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
    }
};

// Format currency
window.formatCurrency = function(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

// Format date
window.formatDate = function(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};