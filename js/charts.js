// Chart.js initialization for dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
});

function initializeCharts() {
    // Status Chart for Dashboard
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        new Chart(statusCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Disponível', 'Emprestado', 'Manutenção', 'Atrasado'],
                datasets: [{
                    data: [156, 23, 8, 5],
                    backgroundColor: [
                        '#4CAF50',
                        '#FFC107', 
                        '#17a2b8',
                        '#F44336'
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                family: 'Raleway',
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Movimentações Chart
    const ctx1 = document.getElementById('movimentacoesChart');
    if (ctx1) {
        new Chart(ctx1.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Retiradas',
                    data: [12, 15, 8, 9, 20, 6, 4],
                    borderColor: '#FFC107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Devoluções',
                    data: [8, 12, 14, 10, 16, 13, 11],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            font: {
                                family: 'Raleway'
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }
    
    // Categoria Chart
    const ctx2 = document.getElementById('categoriaChart');
    if (ctx2) {
        new Chart(ctx2.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Ferramentas', 'Equipamentos', 'Máquinas', 'EPI'],
                datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: [
                        '#FF9800',
                        '#232F34', 
                        '#4CAF50',
                        '#FFC107'
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Raleway'
                            }
                        }
                    }
                }
            }
        });
    }
}