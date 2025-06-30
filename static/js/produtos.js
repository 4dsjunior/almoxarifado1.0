/**
 * @file produtos.js
 * @description Handles the logic for the products page, including API integration.
 */

import { get, del } from './api.js';
import { showLoadingState, showEmptyState, showErrorState, showToast, confirmDelete } from './ui-utils.js';

// Cache for products to enable client-side filtering
let productsCache = [];

document.addEventListener('DOMContentLoaded', () => {
    // Ensure the table body exists before adding listeners
    const tableBody = document.getElementById('productsTable')?.querySelector('tbody');
    if (tableBody) {
        loadProducts();
        tableBody.addEventListener('click', handleTableClick);
    }

    // Set up filter event listeners to reload data from the server
    document.getElementById('searchInput')?.addEventListener('input', debounce(loadProducts, 300));
    document.getElementById('categoryFilter')?.addEventListener('change', loadProducts);
    document.getElementById('statusFilter')?.addEventListener('change', loadProducts);
    document.getElementById('clearFiltersBtn')?.addEventListener('click', clearAndReload);
});

/**
 * Loads products from the API and populates the table.
 */
async function loadProducts() {
    const tableBody = document.getElementById('productsTable').querySelector('tbody');
    showLoadingState(tableBody);

    const searchInput = document.getElementById('searchInput').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const params = new URLSearchParams({
        search: searchInput,
        category: categoryFilter,
        status: statusFilter,
        // TODO: Add page and per_page for pagination
    });

    try {
        const data = await get(`products?${params.toString()}`); 
        
        // The API now returns an object { products: [], total: 0, ... }
        productsCache = data.products;
        populateProductsTable(productsCache);

        // TODO: Update pagination controls with total count

    } catch (error) {
        showErrorState(tableBody, 'Erro ao carregar produtos.');
        if (typeof showToast === 'function') {
            showToast('Falha ao buscar produtos.', 'error');
        }
    }
}

/**
 * Populates the products table with data using safe DOM manipulation.
 * @param {Array<object>} products - The list of products.
 */
function populateProductsTable(products) {
    const tableBody = document.getElementById('productsTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    if (products.length === 0) {
        showEmptyState(tableBody, 'Nenhum produto encontrado.');
        return;
    }

    products.forEach(product => {
        const row = tableBody.insertRow();
        row.dataset.productId = product.id;
        row.dataset.productName = product.name;

        // Use textContent for security
        row.insertCell(0).textContent = product.code;
        row.insertCell(1).textContent = product.name;
        row.insertCell(2).textContent = product.category;
        row.insertCell(3).textContent = product.stock;
        row.insertCell(4).textContent = product.minStock;
        row.insertCell(5).textContent = product.location;
        row.insertCell(6).innerHTML = getStatusBadge(product.stock, product.minStock); // Badge is safe HTML

        const actionsCell = row.insertCell(7);
        actionsCell.innerHTML = `
            <button class="btn btn-sm btn-outline-primary" data-action="edit" title="Editar">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-info" data-action="history" title="Histórico">
                <i class="bi bi-clock-history"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" title="Excluir">
                <i class="bi bi-trash"></i>
            </button>
        `;
    });
}

/**
 * Handles clicks on the products table using event delegation.
 * @param {Event} event - The click event.
 */
function handleTableClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const row = button.closest('tr');
    const productId = row.dataset.productId;
    const productName = row.dataset.productName;
    const action = button.dataset.action;

    switch (action) {
        case 'edit':
            editProduct(productId);
            break;
        case 'history':
            viewHistory(productId);
            break;
        case 'delete':
            deleteProduct(productId, productName);
            break;
    }
}

/**
 * Deletes a product after confirmation.
 * @param {string} productId - The ID of the product to delete.
 * @param {string} productName - The name of the product.
 */
function deleteProduct(productId, productName) {
    // Assumes confirmDelete and showToast are globally available from main.js
    confirmDelete(productName, async () => {
        try {
            await del(`products/${productId}`);
            
            // Optimistically remove from UI
            const row = document.querySelector(`tr[data-product-id="${productId}"]`);
            if (row) row.remove();

            if (typeof showToast === 'function') {
                showToast(`Produto "${productName}" excluído com sucesso.`, 'success');
            }
        } catch (error) {
            if (typeof showToast === 'function') {
                showToast(`Erro ao excluir o produto: ${error.message}`, 'error');
            }
        }
    });
}

/**
 * Navigates to the edit page for a product.
 * @param {string} productId - The ID of the product.
 */
function editProduct(productId) {
    window.location.href = `item-detalhes.html?id=${productId}`;
}

/**
 * Navigates to the history page for a product.
 * @param {string} productId - The ID of the product.
 */
function viewHistory(productId) {
    window.location.href = `movimentacoes.html?product=${productId}`;
}

/**
 * Clears all filters and reloads the product list.
 */
function clearAndReload() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    populateProductsTable(allProducts);
}

/**
 * Gets the stock status based on current and minimum stock.
 * @param {number} stock - Current stock.
 * @param {number} minStock - Minimum stock.
 * @returns {string} - The status ('normal', 'baixo', 'critico').
 */
function getStatus(stock, minStock) {
    const stockLevel = (stock / minStock) * 100;
    if (stockLevel < 50) return 'critico';
    if (stockLevel < 100) return 'baixo';
    return 'normal';
}

/**
 * Gets the corresponding badge for a stock status.
 * @param {number} stock - Current stock.
 * @param {number} minStock - Minimum stock.
 * @returns {string} - The HTML for the badge.
 */
function getStatusBadge(stock, minStock) {
    const status = getStatus(stock, minStock);
    switch (status) {
        case 'critico':
            return `<span class="badge bg-danger">Crítico</span>`;
        case 'baixo':
            return `<span class="badge bg-warning">Baixo</span>`;
        default:
            return `<span class="badge bg-success">Normal</span>`;
    }
}

/**
 * Debounce function to limit the rate at which a function gets called.
 * @param {function} func - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {function} - The debounced function.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
