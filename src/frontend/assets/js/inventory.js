const API_URL = `${API_BASE_URL}/equipos`;

document.addEventListener('DOMContentLoaded', () => {
    fetchEquipos();
    configurarFiltros();
    setupModal();
    setupLogout();
    updateUserGreeting();

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario && usuario.rol !== 1) {
        const btnAdd = document.getElementById('btn-add');
        if (btnAdd) btnAdd.style.display = 'none';
    }
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

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

let allEquipos = [];

async function fetchEquipos() {
    try {
        const response = await fetch(API_URL, { headers: getAuthHeaders() });
        allEquipos = await response.json();
        renderTable(allEquipos);
    } catch (error) {
        console.error('Error:', error);
    }
}

function setupFilters() {
    const searchInput = document.getElementById('search-input');
    const filterCategoria = document.getElementById('filter-categoria');
    const filterEstado = document.getElementById('filter-estado');

    function applyFilters() {
        const term = searchInput.value.toLowerCase();
        const cat = filterCategoria.value;
        const status = filterEstado.value;

        const filtros = allEquipos.filter(e => {
            const matchesTerm = e.nombre_equipo.toLowerCase().includes(term) || 
                               (e.numero_serie && e.numero_serie.toLowerCase().includes(term));
            const matchesCat = cat ? e.nombre_categoria === cat : true;
            const matchesStatus = status ? e.estado === status : true;
            return matchesTerm && matchesCat && matchesStatus;
        });

        renderTable(filtros);
    }

    searchInput.addEventListener('input', applyFilters);
    filterCategoria.addEventListener('change', applyFilters);
    filterEstado.addEventListener('change', applyFilters);
}

function renderTable(equipos) {
    const tbody = document.getElementById('table-body');
    const theadRow = document.querySelector('#inventory-table thead tr');
    tbody.innerHTML = ''; 

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const isAdmin = usuario && usuario.rol === 1;
    const isTech = usuario && usuario.rol === 2;

    if (isAdmin || isTech) {
        if (!theadRow.querySelector('.th-actions')) {
            const th = document.createElement('th');
            th.className = 'th-actions';
            th.innerText = 'Acciones';
            theadRow.appendChild(th);
        }
    } else {
        const th = theadRow.querySelector('.th-actions');
        if (th) th.remove();
    }

    equipos.forEach(equipo => {
        const row = document.createElement('tr');
        
        let actionsCell = '';
        if (isAdmin) {
            actionsCell = `
                <td>
                    <button class="btn-sm edit-btn" onclick="openEdit(${equipo.id_equipo}, '${equipo.nombre_equipo}', '${equipo.numero_serie}', ${equipo.id_categoria}, ${equipo.id_ubicacion_actual}, '${equipo.estado}')">✏️</button>
                    <button class="btn-sm delete-btn" onclick="deleteItem(${equipo.id_equipo})">🗑️</button>
                </td>
            `;
        } else if (isTech) {
             actionsCell = `
                <td>
                    <button class="btn-sm delete-btn" onclick="deleteItem(${equipo.id_equipo})">🗑️</button>
                </td>
            `;
        }

        row.innerHTML = `
            <td data-label="ID">#${equipo.id_equipo}</td>
            <td data-label="Nombre"><strong>${equipo.nombre_equipo}</strong></td>
            <td data-label="Serie">${equipo.numero_serie || 'S/N'}</td>
            <td data-label="Categoría">${equipo.nombre_categoria}</td>
            <td data-label="Ubicación">${equipo.nombre_lugar}</td>
            <td data-label="Estado"><span class="badge ${equipo.estado}">${equipo.estado}</span></td>
            ${actionsCell}
        `;
        tbody.appendChild(row);
    });
}

function setupModal() {
    const modal = document.getElementById('modal-equipo');
    const btnOpen = document.getElementById('btn-add');
    const formCreate = document.getElementById('form-equipo');
    
    const modalEdit = document.getElementById('modal-edit-equipo');
    const formEdit = document.getElementById('form-edit-equipo');
    
    const modalAuth = document.getElementById('modal-auth-admin');
    const formAuth = document.getElementById('form-auth-admin');

    const btnClose = document.querySelectorAll('.close-btn');
    btnClose.forEach(btn => {
        btn.onclick = (e) => {
            const modalId = e.target.getAttribute('data-modal');
            if (modalId) {
                document.getElementById(modalId).style.display = 'none';
            }
        }
    });

    if (btnOpen) btnOpen.onclick = () => modal.style.display = 'block';

    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
        if (event.target == modalEdit) modalEdit.style.display = 'none';
        if (event.target == modalAuth) modalAuth.style.display = 'none';
    }
    
    
    formCreate.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoEquipo = {
            nombre: document.getElementById('nombre').value,
            serie: document.getElementById('serie').value,
            categoria: document.getElementById('categoria').value,
            ubicacion: document.getElementById('ubicacion').value,
            estado: document.getElementById('estado').value
        };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(nuevoEquipo)
            });

            if (res.ok) {
                alert('¡Equipo guardado con éxito!');
                modal.style.display = 'none';
                formCreate.reset();
                fetchEquipos();
            } else {
                alert('Error al guardar el equipo');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        }
    });


    if (formEdit) {
        formEdit.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const data = {
                nombre: document.getElementById('edit-nombre').value,
                serie: document.getElementById('edit-serie').value,
                categoria: document.getElementById('edit-categoria').value,
                ubicacion: document.getElementById('edit-ubicacion').value,
                estado: document.getElementById('edit-estado').value
            };

            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    alert('Equipo actualizado correctamente');
                    modalEdit.style.display = 'none';
                    fetchEquipos();
                } else {
                    const err = await res.json();
                    alert('Error: ' + err.error);
                }
            } catch (error) {
                console.error(error);
                alert('Error de conexión');
            }
        });
    }

    if (formAuth) {
        formAuth.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('delete-item-id').value;
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;

            try {
                const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const loginData = await loginRes.json();

                if (!loginRes.ok || loginData.usuario.rol !== 1) {
                    alert('Credenciales inválidas o no tiene permisos de supervisor.');
                    return;
                }

                const adminToken = loginData.token;

                const deleteRes = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    }
                });

                if (deleteRes.ok) {
                    alert('Equipo eliminado con autorización de supervisor.');
                    modalAuth.style.display = 'none';
                    formAuth.reset();
                    fetchEquipos();
                } else {
                    const err = await deleteRes.json();
                    alert('Error al eliminar: ' + err.error);
                }

            } catch (error) {
                console.error(error);
                alert('Error de conexión durante autorización.');
            }
        });
    }
}

window.openEdit = (id, nombre, serie, catId, ubicId, estado) => {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-serie').value = serie !== 'null' ? serie : '';
    document.getElementById('edit-categoria').value = catId;
    document.getElementById('edit-ubicacion').value = ubicId;
    document.getElementById('edit-estado').value = estado;

    document.getElementById('modal-edit-equipo').style.display = 'block';
};

window.deleteItem = async (id) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (usuario.rol === 1) {
        if(!confirm('¿Estás seguro de eliminar este equipo?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                alert('Equipo eliminado correctamente');
                fetchEquipos(); 
            } else {
                const err = await res.json();
                alert('Error: ' + (err.error || 'No se pudo eliminar'));
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        }
    } 
    else if (usuario.rol === 2) {
        document.getElementById('delete-item-id').value = id;
        document.getElementById('form-auth-admin').reset();
        document.getElementById('modal-auth-admin').style.display = 'block';
    }
};