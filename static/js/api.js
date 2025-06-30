
const BASE_URL = '/api';

async function apiFetch(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Erro na comunicação com a API');
        }
        
        // Return empty object for 204 No Content responses
        if (response.status === 204) {
            return {};
        }

        return response.json();
    } catch (error) {
        console.error(`API Error: ${error.message}`);
        // Re-throw the error to be caught by the calling function
        throw error;
    }
}

// --- Generic Methods ---

export function get(endpoint, params) {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return apiFetch(url, { method: 'GET' });
}

export function post(endpoint, body) {
    return apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export function put(endpoint, body) {
    return apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

export function del(endpoint) {
    return apiFetch(endpoint, { method: 'DELETE' });
}


// --- Specific Methods ---

async function loginUser(email, password) {
    try {
        // Use the generic post function
        const data = await post('/login', { email, password });
        return { success: true, message: data.message };
    } catch (error) {
        return { success: false, message: error.message || 'Não foi possível conectar ao servidor.' };
    }
}

export { loginUser };
