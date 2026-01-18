const USERS_API = `${API_BASE_URL}/users`;

document.addEventListener('DOMContentLoaded', () => {
    checkAdmin();
    fetchUsers();
    setupModals();
    setupLogout();
    updateUserGreeting();
});

function updateUserGreeting() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario && usuario.nombre) {
        document.getElementById('saludo-usuario').innerText = usuario.nombre;
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'login.html';
        });
    }
}

function checkAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    if (usuario.rol !== 1) {
        document.querySelector('.table-container').style.display = 'none';
        document.getElementById('btn-new-user').style.display = 'none';
        document.querySelector('.top-bar h1').innerText = 'Mi Perfil';
        
        const header = document.querySelector('.top-bar');
        const btnChangeMyPass = document.createElement('button');
        btnChangeMyPass.className = 'btn-primary';
        btnChangeMyPass.innerText = 'Cambiar Mi Contraseña';
        btnChangeMyPass.onclick = openMyPasswordModal;
        header.appendChild(btnChangeMyPass);
    }
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

async function fetchUsers() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (usuario.rol !== 1) return;

    try {
        const res = await fetch(USERS_API, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Error de permisos');
        
        const users = await res.json();
        const tbody = document.getElementById('users-body');
        let html = '';

        users.forEach(u => {
            html += `
                <tr>
                    <td data-label="ID">#${u.id_usuario}</td>
                    <td data-label="Nombre"><strong>${u.nombre_completo}</strong></td>
                    <td data-label="Email">${u.email}</td>
                    <td data-label="Rol"><span class="badge ${u.nombre_rol === 'admin' ? 'baja' : 'operativo'}">${u.nombre_rol}</span></td>
                    <td>
                        <button class="btn-sm edit-btn" onclick="openEdit(${u.id_usuario}, '${u.nombre_completo}', '${u.email}', '${u.nombre_rol}')">✏️</button>
                        <button class="btn-sm key-btn" onclick="openPassword(${u.id_usuario}, '${u.nombre_completo}')">🔑</button>
                        <button class="btn-sm delete-btn" onclick="deleteUser(${u.id_usuario})">🗑️</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (error) {
        console.error(error);
    }
}

const modalUser = document.getElementById('modal-user');
const modalPass = document.getElementById('modal-password');

function setupModals() {
    document.getElementById('btn-new-user').onclick = () => {
        document.getElementById('form-user').reset();
        document.getElementById('user-id').value = '';
        document.getElementById('modal-title').innerText = 'Nuevo Usuario';
        document.getElementById('password-group').style.display = 'block';
        document.getElementById('password').required = true;
        modalUser.style.display = 'block';
    };

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = (e) => {
            document.getElementById(e.target.dataset.modal).style.display = 'none';
        }
    });
}
document.getElementById('form-user').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('user-id').value;
    const isEdit = !!id;
    
    const data = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        rol: document.getElementById('rol').value
    };

    if (!isEdit) {
        data.password = document.getElementById('password').value;
    }

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${USERS_API}/${id}` : USERS_API;

    try {
        const res = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert(isEdit ? 'Usuario actualizado' : 'Usuario creado');
            modalUser.style.display = 'none';
            fetchUsers();
        } else {
            const err = await res.json();
            alert('Error: ' + err.error);
        }
    } catch (error) {
        alert('Error de conexión');
    }
});

window.openEdit = (id, nombre, email, rolNombre) => {
    document.getElementById('user-id').value = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('email').value = email;
    document.getElementById('rol').value = (rolNombre === 'admin') ? 1 : 2;
    
    document.getElementById('modal-title').innerText = 'Editar Usuario';
    document.getElementById('password-group').style.display = 'none';
    document.getElementById('password').required = false;
    
    modalUser.style.display = 'block';
};

window.openPassword = (id, nombre) => {
    document.getElementById('pass-user-id').value = id;
    document.getElementById('password-user-name').innerText = `Usuario: ${nombre}`;
    document.getElementById('form-password').reset();
    modalPass.style.display = 'block';
};

window.deleteUser = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
        const res = await fetch(`${USERS_API}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (res.ok) {
            alert('Usuario eliminado');
            fetchUsers();
        } else {
            const err = await res.json();
            alert(err.error);
        }
    } catch (error) {
        alert('Error al eliminar');
    }
};


window.openMyPasswordModal = () => {
    document.getElementById('pass-user-id').value = 'ME';
    document.getElementById('password-user-name').innerText = 'Cambiar mi contraseña actual';
    document.getElementById('form-password').reset();
    
    let currentPassGroup = document.getElementById('current-pass-group');
    if (!currentPassGroup) {
        currentPassGroup = document.createElement('div');
        currentPassGroup.id = 'current-pass-group';
        currentPassGroup.className = 'form-group';
        currentPassGroup.innerHTML = `
            <label>Contraseña Actual</label>
            <input type="password" id="current-password" required>`;
        const form = document.getElementById('form-password');
        form.insertBefore(currentPassGroup, form.firstChild.nextSibling); 
    }
    
    modalPass.style.display = 'block';
};

document.getElementById('form-password').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('pass-user-id').value;
    const newPassword = document.getElementById('new-password').value;

    try {
        let url, body;
        
        if (id === 'ME') {
            const currentPassword = document.getElementById('current-password').value;
            url = `${API_BASE_URL}/users/profile/change-password`;
            body = { currentPassword, newPassword };
        } else {
            url = `${USERS_API}/${id}/password`;
            body = { password: newPassword };
        }

        const res = await fetch(url, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(body)
        });

        if (res.ok) {
            alert('Contraseña actualizada correctamente');
            modalPass.style.display = 'none';
            const currentPassGroup = document.getElementById('current-pass-group');
            if (currentPassGroup) currentPassGroup.remove();
        } else {
            const err = await res.json();
            alert('Error: ' + err.error);
        }
    } catch (error) {
        alert('Error de conexión');
    }
});