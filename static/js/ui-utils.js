/**
 * @file ui-utils.js
 * @description Utility functions for UI manipulation, especially for table states.
 */

/**
 * Displays a loading state in a table body.
 * @param {HTMLElement} tableBody - The tbody element of the table.
 * @param {number} colspan - The number of columns to span the loading message across.
 */
export function showLoadingState(tableBody, colspan) {
    tableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center">Carregando...</td></tr>`;
}

/**
 * Displays an empty state message in a table body.
 * @param {HTMLElement} tableBody - The tbody element of the table.
 * @param {string} message - The message to display.
 * @param {number} colspan - The number of columns to span the message across.
 */
export function showEmptyState(tableBody, message, colspan) {
    tableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center">${message}</td></tr>`;
}

/**
 * Displays an error state message in a table body.
 * @param {HTMLElement} tableBody - The tbody element of the table.
 * @param {string} message - The error message to display.
 * @param {number} colspan - The number of columns to span the message across.
 */
export function showErrorState(tableBody, message, colspan) {
    tableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center text-danger">${message}</td></tr>`;
}

// Toast notification system
export function showToast(message, type = 'success') {
    const toastHTML = `
        <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = createToastContainer();
    }
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toast = new bootstrap.Toast(toastContainer.lastElementChild);
    toast.show();
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

// Confirm delete
/**
 * Shows a confirmation modal before performing a critical action.
 * @param {string} itemName - The name of the item to be deleted.
 * @param {function} onConfirm - The callback function to execute on confirmation.
 */
export function confirmDelete(itemName, onConfirm) {
    const modalElement = document.getElementById('confirmDeleteModal');
    if (!modalElement) return;

    const modal = new bootstrap.Modal(modalElement);
    const itemNameElement = document.getElementById('itemNameToDelete');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    // Set the item name in the modal body
    itemNameElement.textContent = itemName;

    // Create a new function for the click handler to avoid multiple bindings
    const confirmHandler = () => {
        onConfirm();
        modal.hide();
        // Remove the event listener after it's used
        confirmBtn.removeEventListener('click', confirmHandler);
    };

    // Add the event listener
    confirmBtn.addEventListener('click', confirmHandler, { once: true });

    modal.show();
}

// Format currency
export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Format date
export function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

// Validate form
export function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Clear form
export function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
    }
}