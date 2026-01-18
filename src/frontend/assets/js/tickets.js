const API_URL = `${API_BASE_URL}/tickets`;

document.addEventListener('DOMContentLoaded', () => {
    fetchTickets();
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

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

async function fetchTickets() {
    try {
        const res = await fetch(API_URL, { headers: getAuthHeaders() });
        const tickets = await res.json();
        const tbody = document.getElementById('tickets-body');
        tbody.innerHTML = '';

        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const isAdmin = usuario.rol === 1;

        tickets.forEach(ticket => {
            const fecha = new Date(ticket.fecha_creacion).toLocaleDateString();
            const asignado = ticket.nombre_asignado || 'Sin Asignar';
            
            let btnActions = `<button class="btn-sm edit-btn" onclick="openEdit(${ticket.id_ticket}, '${ticket.estado}', '${ticket.prioridad}', '${ticket.id_usuario_asignado}')">✏️</button>`;
            
            if (isAdmin) {
                btnActions += `<button class="btn-sm delete-btn" onclick="deleteTicket(${ticket.id_ticket})">🗑️</button>`;
            }

            const row = `
                <tr>
                    <td data-label="ID">#${ticket.id_ticket}</td>
                    <td data-label="Asunto"><strong>${ticket.asunto}</strong></td>
                    <td data-label="Reporta">${ticket.nombre_reporta}</td>
                    <td data-label="Asignado">${asignado}</td>
                    <td data-label="Prioridad"><span class="badge" style="background:#eee; color:#333">${ticket.prioridad}</span></td>
                    <td data-label="Estado"><span class="badge ${ticket.estado === 'Abierto' ? 'baja' : 'operativo'}">${ticket.estado}</span></td>
                    <td data-label="Fecha">${fecha}</td>
                    <td>${btnActions}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error(error);
    }
}

const modalTicket = document.getElementById('modal-ticket');
const modalEdit = document.getElementById('modal-edit-ticket');

function setupModals() {
    const btnOpen = document.getElementById('btn-new-ticket');
    btnOpen.onclick = () => modalTicket.style.display = 'block';

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = (e) => {
            document.getElementById(e.target.dataset.modal).style.display = 'none';
        }
    });

    document.getElementById('form-ticket').addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuarioData = JSON.parse(localStorage.getItem('usuario'));
        const userId = usuarioData ? usuarioData.id_usuario : 1; 

        const data = {
            asunto: document.getElementById('asunto').value,
            prioridad: document.getElementById('prioridad').value,
            descripcion: document.getElementById('descripcion').value,
            id_usuario: userId
        };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });

            if (res.ok) {
                alert('Ticket creado correctamente');
                modalTicket.style.display = 'none';
                document.getElementById('form-ticket').reset();
                fetchTickets(); 
            }
        } catch (error) {
            alert('Error al crear ticket');
        }
    });

    document.getElementById('form-edit-ticket').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-ticket-id').value;
        const data = {
            estado: document.getElementById('edit-estado').value,
            prioridad: document.getElementById('edit-prioridad').value,
            id_usuario_asignado: document.getElementById('edit-asignado').value
        };

        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });

            if (res.ok) {
                alert('Ticket actualizado');
                modalEdit.style.display = 'none';
                fetchTickets();
            } else {
                alert('Error al actualizar');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });
}

window.openEdit = async (id, estado, prioridad, asignadoId) => {


    document.getElementById('edit-ticket-id').value = id;
    document.getElementById('edit-estado').value = estado;
    document.getElementById('edit-prioridad').value = prioridad;
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const groupAssign = document.getElementById('group-assign');
    
    if (usuario.rol === 1) {
        groupAssign.style.display = 'block';
        const selectAssign = document.getElementById('edit-asignado');
        
        if (selectAssign.options.length <= 1) {
             try {
                const res = await fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
                if (res.ok) {
                    const users = await res.json();
                    selectAssign.innerHTML = '<option value="">-- Sin Asignar --</option>';
                    users.forEach(u => {
                        const option = document.createElement('option');
                        option.value = u.id_usuario;
                        option.text = u.nombre_completo;
                        selectAssign.appendChild(option);
                    });
                }
             } catch(e) { console.error('Error cargando usuarios', e); }
        }
        
        let valToSelect = "";
        if (asignadoId && asignadoId !== 'null' && asignadoId !== 'undefined') {
            valToSelect = asignadoId;
        }
        
        selectAssign.value = valToSelect;


    } else {
        groupAssign.style.display = 'none';
        document.getElementById('edit-asignado').innerHTML = '<option value="">--</option>';
    }

    modalEdit.style.display = 'block';
};

window.deleteTicket = async (id) => {
    if (!confirm('¿Eliminar este ticket permanentemente?')) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.ok) {
            alert('Ticket eliminado');
            fetchTickets();
        } else {
            alert('Error al eliminar');
        }
    } catch (error) {
        alert('Error de conexión');
    }
};