// ========== API Service Layer ==========
// All fetch() calls to the backend REST API with JWT Authentication

const API_BASE = '/api';

// ========== AUTH HELPERS ==========
function getAuthHeaders() {
    const token = sessionStorage.getItem('jwtToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
}

function checkAuth() {
    if (!sessionStorage.getItem('jwtToken')) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

function logout() {
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('username');
    window.location.href = '/login.html';
}

function getUsername() {
    return sessionStorage.getItem('username') || 'User';
}

// ========== API RESPONSE HANDLER ==========
async function handleResponse(response) {
    if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem('jwtToken');
        sessionStorage.removeItem('username');
        window.location.href = '/login.html';
        throw new Error('Session expired. Please login again.');
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.errors) {
            const msgs = Object.entries(errorData.errors)
                .map(([field, msg]) => `${field}: ${msg}`)
                .join('\n');
            throw new Error(msgs);
        }
        throw new Error(errorData.message || 'Request failed');
    }
    return response;
}

const ApiService = {

    // ========== DEPARTMENT ENDPOINTS ==========

    getAllDepartments: async function () {
        const response = await fetch(`${API_BASE}/departments`, {
            headers: getAuthHeaders()
        });
        await handleResponse(response);
        const data = await response.json();
        return data.content !== undefined ? data.content : data;
    },

    getDepartmentById: async function (id) {
        const response = await fetch(`${API_BASE}/departments/${id}`, {
            headers: getAuthHeaders()
        });
        await handleResponse(response);
        return response.json();
    },

    createDepartment: async function (data) {
        const response = await fetch(`${API_BASE}/departments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        await handleResponse(response);
        return response.json();
    },

    updateDepartment: async function (id, data) {
        const response = await fetch(`${API_BASE}/departments/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        await handleResponse(response);
        return response.json();
    },

    deleteDepartment: async function (id) {
        const response = await fetch(`${API_BASE}/departments/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        await handleResponse(response);
    },

    // ========== EMPLOYEE ENDPOINTS ==========

    getAllEmployees: async function () {
        const response = await fetch(`${API_BASE}/employees`, {
            headers: getAuthHeaders()
        });
        await handleResponse(response);
        const data = await response.json();
        return data.content !== undefined ? data.content : data;
    },

    getEmployeeById: async function (id) {
        const response = await fetch(`${API_BASE}/employees/${id}`, {
            headers: getAuthHeaders()
        });
        await handleResponse(response);
        return response.json();
    },

    getEmployeesByDepartment: async function (departmentId) {
        const response = await fetch(`${API_BASE}/employees/department/${departmentId}`, {
            headers: getAuthHeaders()
        });
        await handleResponse(response);
        return response.json();
    },

    // Search employees by keyword
    searchEmployees: async function (keyword) {
        const response = await fetch(`${API_BASE}/employees/search?keyword=${encodeURIComponent(keyword)}`, {
            headers: getAuthHeaders()
        });
        await handleResponse(response);
        const data = await response.json();
        return data.content !== undefined ? data.content : data;
    },

    createEmployee: async function (data) {
        const response = await fetch(`${API_BASE}/employees`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        await handleResponse(response);
        return response.json();
    },

    updateEmployee: async function (id, data) {
        const response = await fetch(`${API_BASE}/employees/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        await handleResponse(response);
        return response.json();
    },

    deleteEmployee: async function (id) {
        const response = await fetch(`${API_BASE}/employees/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        await handleResponse(response);
    }
};

// ========== TOAST NOTIFICATION ==========
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ========== FORMAT HELPERS ==========
function formatSalary(amount) {
    if (!amount) return '—';
    return '₹' + Number(amount).toLocaleString('en-IN');
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
