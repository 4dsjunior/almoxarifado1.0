import { showToast, confirmDelete } from './ui-utils.js';

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
    
    // Active menu item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const link = item.querySelector('a');
        if (link && link.getAttribute('href') === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
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
        if (!input.value) {
            input.value = today;
        }
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