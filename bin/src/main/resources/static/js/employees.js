// ========== EMPLOYEES PAGE LOGIC ==========

document.addEventListener('DOMContentLoaded', function () {
    loadEmployees();
    loadDepartmentDropdown();
});

// ---------- SEARCH ----------
let searchTimeout = null;

function handleSearch(value) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        if (value.trim().length === 0) {
            loadEmployees();
        } else {
            try {
                const employees = await ApiService.searchEmployees(value.trim());
                renderTable(employees);
            } catch (error) {
                showToast('Search failed: ' + error.message, 'error');
            }
        }
    }, 300); // Debounce 300ms
}

// ---------- LOAD EMPLOYEES ----------
async function loadEmployees() {
    try {
        const employees = await ApiService.getAllEmployees();
        renderTable(employees);
    } catch (error) {
        console.error('Error loading employees:', error);
        showToast('Failed to load employees', 'error');
    }
}

function renderTable(employees) {
    const tbody = document.getElementById('employeesTableBody');

    if (employees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p>No employees found.</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = employees.map(emp => `
        <tr>
            <td>${emp.id}</td>
            <td><strong>${emp.name}</strong></td>
            <td>${emp.email}</td>
            <td>${emp.phone || '—'}</td>
            <td><span class="badge badge-accent">${emp.departmentName || '—'}</span></td>
            <td>${emp.designation || '—'}</td>
            <td class="salary-cell">${formatSalary(emp.salary)}</td>
            <td>${formatDate(emp.joiningDate)}</td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-primary" onclick="openEditModal(${emp.id})">✏️ Edit</button>
                <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${emp.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// ---------- LOAD DEPARTMENTS FOR DROPDOWN ----------
async function loadDepartmentDropdown() {
    try {
        const departments = await ApiService.getAllDepartments();
        const select = document.getElementById('empDepartment');
        select.innerHTML = '<option value="">-- Select Department --</option>';
        departments.forEach(dept => {
            select.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
        });
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// ---------- OPEN ADD MODAL ----------
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add Employee';
    document.getElementById('submitBtn').textContent = 'Save';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('employeeModal').classList.add('active');
}

// ---------- OPEN EDIT MODAL ----------
async function openEditModal(id) {
    try {
        const emp = await ApiService.getEmployeeById(id);

        document.getElementById('modalTitle').textContent = 'Edit Employee';
        document.getElementById('submitBtn').textContent = 'Update';
        document.getElementById('employeeId').value = emp.id;
        document.getElementById('empName').value = emp.name;
        document.getElementById('empEmail').value = emp.email;
        document.getElementById('empPhone').value = emp.phone || '';
        document.getElementById('empDepartment').value = emp.departmentId || '';
        document.getElementById('empDesignation').value = emp.designation || '';
        document.getElementById('empSalary').value = emp.salary || '';
        document.getElementById('empJoiningDate').value = emp.joiningDate || '';

        document.getElementById('employeeModal').classList.add('active');
    } catch (error) {
        showToast('Failed to load employee details', 'error');
    }
}

// ---------- CLOSE MODAL ----------
function closeModal() {
    document.getElementById('employeeModal').classList.remove('active');
}

// ---------- HANDLE FORM SUBMIT ----------
async function handleSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('employeeId').value;
    const data = {
        name: document.getElementById('empName').value,
        email: document.getElementById('empEmail').value,
        phone: document.getElementById('empPhone').value || null,
        departmentId: document.getElementById('empDepartment').value || null,
        designation: document.getElementById('empDesignation').value || null,
        salary: document.getElementById('empSalary').value ? parseFloat(document.getElementById('empSalary').value) : null,
        joiningDate: document.getElementById('empJoiningDate').value || null
    };

    try {
        if (id) {
            await ApiService.updateEmployee(id, data);
            showToast('Employee updated successfully!', 'success');
        } else {
            await ApiService.createEmployee(data);
            showToast('Employee added successfully!', 'success');
        }

        closeModal();
        loadEmployees();
    } catch (error) {
        showToast('Failed to save employee: ' + error.message, 'error');
    }
}

// ---------- DELETE ----------
function openDeleteModal(id) {
    document.getElementById('deleteEmployeeId').value = id;
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

async function confirmDelete() {
    const id = document.getElementById('deleteEmployeeId').value;
    try {
        await ApiService.deleteEmployee(id);
        showToast('Employee deleted successfully!', 'success');
        closeDeleteModal();
        loadEmployees();
    } catch (error) {
        showToast('Failed to delete employee', 'error');
    }
}
