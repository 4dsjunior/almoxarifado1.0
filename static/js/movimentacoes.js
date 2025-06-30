/**
 * @file movimentacoes.js
 * @description Handles the logic for the movements page with asynchronous filtering.
 */

import { get } from './api.js';
import { showLoadingState, showEmptyState, showErrorState, showToast } from './ui-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const movementsTableBody = document.getElementById('movementsTable')?.querySelector('tbody');
    if (movementsTableBody) {
        loadMovements();
    }

    document.getElementById('filterBtn')?.addEventListener('click', applyFilters);
});

/**
 * Loads movements from the API based on URL params and populates the table.
 */
async function loadMovements() {
    const tableBody = document.getElementById('movementsTable').querySelector('tbody');
    showLoadingState(tableBody, 6);

    try {
        const params = new URLSearchParams(window.location.search);
        const movements = await get(`movements?${params.toString()}`);
        
        populateMovementsTable(movements);

    } catch (error) {
        showErrorState(tableBody, 'Erro ao carregar movimentações.', 6);
        if(typeof showToast === 'function') showToast('Falha ao buscar movimentações.', 'error');
    }
}

/**
 * Populates the movements table with data.
 * @param {Array<object>} movements - The list of movements.
 */
function populateMovementsTable(movements) {
    const tableBody = document.getElementById('movementsTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    if (movements.length === 0) {
        showEmptyState(tableBody, 'Nenhuma movimentação encontrada.', 6);
        return;
    }

    movements.forEach(movement => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = movement.id;
        row.insertCell(1).textContent = movement.productName;
        row.insertCell(2).innerHTML = `<span class="badge bg-${movement.type === 'entrada' ? 'success' : 'danger'}">${movement.type}</span>`;
        row.insertCell(3).textContent = movement.quantity;
        row.insertCell(4).textContent = new Date(movement.date).toLocaleString();
        row.insertCell(5).textContent = movement.user;
    });
}

/**
 * Applies filters without reloading the page.
 */
function applyFilters() {
    const params = new URLSearchParams();
    const productFilter = document.getElementById('productFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (productFilter) params.set('product', productFilter);
    if (typeFilter) params.set('type', typeFilter);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    // Update URL without reloading
    history.pushState(null, '', `?${params.toString()}`);
    
    // Reload data asynchronously
    loadMovements();
}
