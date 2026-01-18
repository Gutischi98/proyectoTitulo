# Documentación Técnica - Inventario Local

## 1. Visión General

**Inventario Local** es una aplicación web diseñada para la gestión de activos TI y mesa de ayuda. Permite el control de inventario, gestión de tickets de soporte y administración de usuarios, con roles diferenciados (Administrador y Técnico).

## 2. Arquitectura del Proyecto

El proyecto sigue una arquitectura **Cliente-Servidor API REST**.

### Estructura de Directorios

```
proyectoTitulo/
├── src/
│   ├── backend/
│   │   ├── config/       # Configuración BD (db.js)
│   │   ├── middleware/   # Auth (authMiddleware.js)
│   │   ├── routes/       # Rutas API (inventory, tickets, users, auth)
│   │   └── server.js     # Punto de entrada del servidor
│   │
│   └── frontend/
│       ├── assets/
│           ├── css/      # Estilos Modulares (style.css, login.css, dashboard.css)
│           └── js/       # Lógica cliente (inventory.js, tickets.js, etc.)
│       └── *.html        # Vistas (login, dashboard, inventory, tickets, users)
├── package.json          # Dependencias y scripts
└── .env                  # Variables de entorno
```

## 3. Base de Datos

Utiliza **MySQL**. Tablas principales:

- `usuarios`: Credenciales, nombres, roles (1=Admin, 2=Técnico).
- `equipos`: Inventario de hardware (nombre, serie, estado, ubicación).
- `tickets`: Incidentes reportados (asunto, prioridad, estado, asignación).
- `roles`, `categorias`, `ubicaciones`: Tablas de catálogo.

## 4. API Endpoints

### Autenticación (`/api/auth`)

- `POST /login`: Retorna Token JWT.

### Inventario (`/api/equipos`)

- `GET /`: Listar todos (Público autenticado).
- `POST /`: Crear equipo (Admin).
- `PUT /:id`: Editar equipo (Admin).
- `DELETE /:id`: Eliminar equipo (Admin). _Soporta autorización de Supervisor (CP-10)._

### Tickets (`/api/tickets`)

- `GET /`: Listar (Admin ve todos, Técnico ve propios/asignados).
- `POST /`: Crear ticket.
- `PUT /:id`: Actualizar estado/asignación.
- `DELETE /:id`: Eliminar (Admin).

### Usuarios (`/api/users`)

- `GET /`: Listar usuarios (Admin).
- `POST /`: Crear usuario (Admin).
- `PUT /:id`: Editar usuario (Admin).
- `PUT /profile/change-password`: Cambio de contraseña (Autoservicio).

## 5. Diseño Responsivo

El sistema implementa un diseño _Mobile-First_ adaptativo:

- **Sidebar Colapsable:** En pantallas <768px, el menú lateral se oculta y es accesible mediante un botón hamburguesa.
- **Tablas a Tarjetas:** Las tablas de datos (Inventario, Tickets) se transforman en tarjetas verticales en dispositivos móviles para mejorar la legibilidad.
- **CSS Modular:** Los estilos se dividen en `style.css` (Base), `login.css` (Login) y `dashboard.css` (Widgets).

## 6. Seguridad

- **JWT (JSON Web Tokens):** Para manejo de sesiones stateless.
- **Bcrypt:** Hasheo de contraseñas.
- **Role-Based Access Control (RBAC):** Middleware `verifyAdmin` y validaciones en frontend para ocultar UI sensible.
- **Supervisor Override:** Mecanismo que permite a un Técnico eliminar un ítem si un Administrador ingresa sus credenciales en el momento (Modal de Autorización).

## 7. Plan de Pruebas (QA)

Tabla de Validación de Casos de Prueba (CP) implementados:

| ID        | Caso de Prueba               | Descripción                                                          | Estado |
| :-------- | :--------------------------- | :------------------------------------------------------------------- | :----- |
| **CP-01** | Inicio de Sesión Exitoso     | Verificar ingreso con credenciales válidas y generación de Token.    | ✅ OK  |
| **CP-02** | Inicio de Sesión Fallido     | Verificar bloqueo y alerta ante credenciales erróneas.               | ✅ OK  |
| **CP-03** | Creación de Equipo           | Validar registro de nuevo activo en BD y Tabla.                      | ✅ OK  |
| **CP-04** | Validación Rol Técnico       | Verificar que Técnicos NO vean menú "Usuarios".                      | ✅ OK  |
| **CP-05** | Creación de Ticket           | Verificar reporte de incidente y aumento de contador.                | ✅ OK  |
| **CP-06** | Dashboard Realtime           | Verificar coincidencia de tarjetas con registros de BD.              | ✅ OK  |
| **CP-07** | CRUD Usuarios (Admin)        | Validar creación/edición de usuarios (Solo Admin).                   | ✅ OK  |
| **CP-08** | Cambio de Contraseña         | Validar actualización segura de credenciales propias.                | ✅ OK  |
| **CP-09** | Eliminar Equipo (Admin)      | Validar borrado directo por Administrador.                           | ✅ OK  |
| **CP-10** | Eliminar Equipo (Supervisor) | Validar borrado por Técnico mediante **Autorización de Supervisor**. | ✅ OK  |

## 8. Instalación y Ejecución

**Requisitos:** Node.js, MySQL.

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Configurar base de datos:**
    Asegurar que MySQL corre y las credenciales en `.env` son correctas.
3.  **Ejecutar Servidor:**
    ```bash
    npm run dev
    ```
    El servidor iniciará en `http://localhost:3000`.
4.  **Acceso Web:**
    Abrir `src/frontend/login.html` en el navegador (o servir con Live Server).
