// Movement/Entry page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeMovementPage();
});

function initializeMovementPage() {
    // Product selection change handler
    const productSelect = document.getElementById('produto');
    if (productSelect) {
        productSelect.addEventListener('change', function() {
            updateProductInfo(this.value);
        });
    }
    
    // Entry form submission
    const entradaForm = document.getElementById('entradaForm');
    if (entradaForm) {
        entradaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEntrySubmission();
        });
    }
    
    // Exit form submission
    const saidaForm = document.getElementById('saidaForm');
    if (saidaForm) {
        saidaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleExitSubmission();
        });
    }
    
    // Auto-calculate total value
    const quantityInput = document.getElementById('quantidade');
    const unitValueInput = document.getElementById('valorUnitario');
    
    if (quantityInput && unitValueInput) {
        [quantityInput, unitValueInput].forEach(input => {
            input.addEventListener('input', calculateTotal);
        });
    }
}

function updateProductInfo(productId) {
    if (!productId) {
        hideProductInfo();
        return;
    }
    
    // Simulate fetching product data
    const products = {
        'PRD001': { stock: 150, minStock: 50, location: 'A1-B2' },
        'PRD002': { stock: 25, minStock: 30, location: 'B2-C1' },
        'PRD003': { stock: 8, minStock: 20, location: 'A3-B1' },
        'PRD004': { stock: 200, minStock: 100, location: 'C1-D2' },
        'PRD005': { stock: 75, minStock: 40, location: 'B1-A3' }
    };
    
    const product = products[productId];
    if (product) {
        showProductInfo(product);
    }
}

function showProductInfo(product) {
    const productInfo = document.getElementById('productInfo');
    if (productInfo) {
        document.getElementById('currentStock').textContent = product.stock;
        document.getElementById('minStock').textContent = product.minStock;
        document.getElementById('location').textContent = product.location;
        productInfo.classList.remove('d-none');
    }
}

function hideProductInfo() {
    const productInfo = document.getElementById('productInfo');
    if (productInfo) {
        productInfo.classList.add('d-none');
    }
}

function calculateTotal() {
    const quantity = parseFloat(document.getElementById('quantidade')?.value) || 0;
    const unitValue = parseFloat(document.getElementById('valorUnitario')?.value) || 0;
    const total = quantity * unitValue;
    
    const totalDisplay = document.getElementById('valorTotal');
    if (totalDisplay) {
        totalDisplay.textContent = formatCurrency(total);
    }
}

function handleEntrySubmission() {
    if (!validateForm('entradaForm')) {
        showToast('Por favor, preencha todos os campos obrigatórios', 'danger');
        return;
    }
    
    const formData = {
        produto: document.getElementById('produto').value,
        quantidade: document.getElementById('quantidade').value,
        documento: document.getElementById('documento').value,
        fornecedor: document.getElementById('fornecedor').value,
        valorUnitario: document.getElementById('valorUnitario').value,
        dataEntrada: document.getElementById('dataEntrada').value,
        observacoes: document.getElementById('observacoes').value
    };
    
    // Simulate API call
    showToast('Processando entrada...', 'info');
    
    setTimeout(() => {
        showToast('Entrada registrada com sucesso!', 'success');
        setTimeout(() => {
            window.location.href = 'movimentacoes.html';
        }, 1500);
    }, 2000);
}

function handleExitSubmission() {
    if (!validateForm('saidaForm')) {
        showToast('Por favor, preencha todos os campos obrigatórios', 'danger');
        return;
    }
    
    const formData = {
        produto: document.getElementById('produto').value,
        quantidade: document.getElementById('quantidade').value,
        documento: document.getElementById('documento').value,
        solicitante: document.getElementById('solicitante').value,
        dataSaida: document.getElementById('dataSaida').value,
        observacoes: document.getElementById('observacoes').value
    };
    
    // Simulate API call
    showToast('Processando saída...', 'info');
    
    setTimeout(() => {
        showToast('Saída registrada com sucesso!', 'success');
        setTimeout(() => {
            window.location.href = 'movimentacoes.html';
        }, 1500);
    }, 2000);
}