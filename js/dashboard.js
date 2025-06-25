// Dashboard specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard data
    updateDashboardStats();
    
    // Refresh data every 30 seconds
    setInterval(updateDashboardStats, 30000);
});

function updateDashboardStats() {
    // Simulate real-time data updates
    const stats = {
        totalProducts: Math.floor(Math.random() * 100) + 1200,
        lowStock: Math.floor(Math.random() * 10) + 20,
        todayEntries: Math.floor(Math.random() * 50) + 100,
        todayExits: Math.floor(Math.random() * 40) + 80
    };
    
    // Update stat cards with animation
    animateCounter('totalProducts', stats.totalProducts);
    animateCounter('lowStock', stats.lowStock);
    animateCounter('todayEntries', stats.todayEntries);
    animateCounter('todayExits', stats.todayExits);
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const increment = (targetValue - currentValue) / 20;
    let current = currentValue;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
            current = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString('pt-BR');
    }, 50);
}

// Handle dashboard actions
function quickEntry(productId) {
    showToast('Redirecionando para entrada rápida...', 'info');
    setTimeout(() => {
        window.location.href = `entrada.html?product=${productId}`;
    }, 1000);
}

function viewProductDetails(productId) {
    showToast('Carregando detalhes do produto...', 'info');
    setTimeout(() => {
        window.location.href = `produtos.html?view=${productId}`;
    }, 1000);
}