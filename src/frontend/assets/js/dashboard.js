document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
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

async function fetchDashboardData() {
    try {
        const res = await fetch('http://localhost:3000/api/dashboard', { headers: getAuthHeaders() });
        const data = await res.json();

        document.getElementById('count-tickets').innerText = data.ticketsPendientes;
        document.getElementById('count-equipos').innerText = data.equiposActivos;
        document.getElementById('count-reparacion').innerText = data.enReparacion;

       const tbody = document.getElementById('tickets-body');
        let htmlContent = ''; 
        data.ultimosTickets.forEach(ticket => {
            htmlContent += `
                <tr>
                    <td data-label="ID">#${ticket.id_ticket}</td>
                    <td data-label="Asunto">${ticket.asunto}</td>
                    <td data-label="Prioridad"><span class="badge">${ticket.prioridad}</span></td>
                    <td data-label="Estado"><span class="badge ${ticket.estado === 'Abierto' ? 'baja' : 'en_reparacion'}">${ticket.estado}</span></td>
                </tr>
            `;
        });

        tbody.innerHTML = htmlContent;

    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}