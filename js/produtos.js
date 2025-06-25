// Products page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
});

function initializeProductsPage() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterProducts();
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterProducts();
        });
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterProducts();
        });
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    const rows = document.querySelectorAll('#productsTable tbody tr');
    
    rows.forEach(row => {
        const productName = row.cells[1]?.textContent.toLowerCase() || '';
        const productCode = row.cells[0]?.textContent.toLowerCase() || '';
        const category = row.cells[2]?.textContent || '';
        const status = getStatusFromBadge(row.cells[6]);
        
        const matchesSearch = productName.includes(searchTerm) || productCode.includes(searchTerm);
        const matchesCategory = !categoryFilter || category === categoryFilter;
        const matchesStatus = !statusFilter || status === statusFilter;
        
        if (matchesSearch && matchesCategory && matchesStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function getStatusFromBadge(statusCell) {
    if (!statusCell) return '';
    const badge = statusCell.querySelector('.badge');
    if (!badge) return '';
    
    if (badge.classList.contains('bg-success')) return 'normal';
    if (badge.classList.contains('bg-warning')) return 'baixo';
    if (badge.classList.contains('bg-danger')) return 'critico';
    return '';
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    filterProducts();
    showToast('Filtros limpos', 'info');
}

function editProduct(productId) {
    showToast('Carregando produto para edição...', 'info');
    setTimeout(() => {
        window.location.href = `produto-editar.html?id=${productId}`;
    }, 1000);
}

function viewHistory(productId) {
    showToast('Carregando histórico do produto...', 'info');
    setTimeout(() => {
        window.location.href = `movimentacoes.html?product=${productId}`;
    }, 1000);
}

function deleteProduct(productId, productName) {
    confirmDelete(productName, () => {
        // Simulate product deletion
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (row) {
            row.remove();
        }
    });
}