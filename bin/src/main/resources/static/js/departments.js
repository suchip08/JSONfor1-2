// ========== DEPARTMENTS PAGE LOGIC ==========

document.addEventListener('DOMContentLoaded', function () {
    loadDepartments();
});

// ---------- LOAD DEPARTMENTS ----------
async function loadDepartments() {
    try {
        const departments = await ApiService.getAllDepartments();
        renderDeptTable(departments);
    } catch (error) {
        console.error('Error loading departments:', error);
        showToast('Failed to load departments', 'error');
    }
}

function renderDeptTable(departments) {
    const tbody = document.getElementById('departmentsTableBody');

    if (departments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p>No departments found. Click "Add Department" to get started.</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = departments.map(dept => `
        <tr>
            <td>${dept.id}</td>
            <td><strong>${dept.name}</strong></td>
            <td>${dept.description || '—'}</td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-primary" onclick="openEditDeptModal(${dept.id})">✏️ Edit</button>
                <button class="btn btn-sm btn-danger" onclick="openDeleteDeptModal(${dept.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// ---------- OPEN ADD MODAL ----------
function openAddDeptModal() {
    document.getElementById('deptModalTitle').textContent = 'Add Department';
    document.getElementById('deptSubmitBtn').textContent = 'Save';
    document.getElementById('deptForm').reset();
    document.getElementById('deptId').value = '';
    document.getElementById('deptModal').classList.add('active');
}

// ---------- OPEN EDIT MODAL ----------
async function openEditDeptModal(id) {
    try {
        const dept = await ApiService.getDepartmentById(id);

        document.getElementById('deptModalTitle').textContent = 'Edit Department';
        document.getElementById('deptSubmitBtn').textContent = 'Update';
        document.getElementById('deptId').value = dept.id;
        document.getElementById('deptName').value = dept.name;
        document.getElementById('deptDescription').value = dept.description || '';

        document.getElementById('deptModal').classList.add('active');
    } catch (error) {
        showToast('Failed to load department details', 'error');
    }
}

// ---------- CLOSE MODAL ----------
function closeDeptModal() {
    document.getElementById('deptModal').classList.remove('active');
}

// ---------- HANDLE FORM SUBMIT ----------
async function handleDeptSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('deptId').value;
    const data = {
        name: document.getElementById('deptName').value,
        description: document.getElementById('deptDescription').value || null
    };

    try {
        if (id) {
            await ApiService.updateDepartment(id, data);
            showToast('Department updated successfully!', 'success');
        } else {
            await ApiService.createDepartment(data);
            showToast('Department added successfully!', 'success');
        }

        closeDeptModal();
        loadDepartments();
    } catch (error) {
        showToast('Failed to save department: ' + error.message, 'error');
    }
}

// ---------- DELETE ----------
function openDeleteDeptModal(id) {
    document.getElementById('deleteDeptId').value = id;
    document.getElementById('deleteDeptModal').classList.add('active');
}

function closeDeleteDeptModal() {
    document.getElementById('deleteDeptModal').classList.remove('active');
}

async function confirmDeptDelete() {
    const id = document.getElementById('deleteDeptId').value;
    try {
        await ApiService.deleteDepartment(id);
        showToast('Department deleted successfully!', 'success');
        closeDeleteDeptModal();
        loadDepartments();
    } catch (error) {
        showToast('Failed to delete department', 'error');
    }
}
