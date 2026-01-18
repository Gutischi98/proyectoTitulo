# 🔥 Inventario Local - Sistema de Gestión de Activos TI

**Inventario Local** es una Aplicación Web desarrollada como parte del Proyecto de Título. Su objetivo principal es optimizar la gestión del ciclo de vida de los activos informáticos, centralizar las incidencias de soporte y asegurar la trazabilidad de los datos, integrando estándares de **Arquitectura Escalable**, **Big Data** y **Ciberseguridad**.

---

## 🤓 Características Principales

El sistema ha sido diseñado para cumplir con requerimientos operativos reales:

- **Gestión de Inventario:** Visualización y registro de equipos informáticos (Notebooks, Periféricos, Redes).
- **Mesa de Ayuda (Tickets):** Sistema de reporte de incidentes asociados a usuarios y equipos.
- **Dashboard en Tiempo Real:** Panel de control con métricas clave (Equipos activos, tickets pendientes, equipos en reparación).
- **Diseño Responsivo:** Interfaz adaptable a móviles y escritorio (Sidebar colapsable, Vistas de Tarjetas).
- **Auditoría (Big Data):** Registro histórico de movimientos en la base de datos para análisis masivo futuro.
- **Seguridad:** Autenticación robusta mediante **JWT (JSON Web Tokens)** y cifrado de contraseñas.
- **Roles de Usuario:** Diferenciación de perfiles (Administrador y Técnico) para control de acceso.

---

## 🛠️ Stack Tecnológico

El proyecto utiliza una arquitectura Cliente-Servidor basada en tecnologías modernas y ligeras:

- **Backend:** Node.js + Express (API RESTful).
- **Base de Datos:** MySQL (Modelo Relacional normalizado en 3FN).
- **Frontend:** HTML5, CSS3 Modular (`style.css`, `login.css`, `dashboard.css`) y JavaScript Vanilla.
- **Seguridad:** Librerías `bcryptjs` (Hashing), `jsonwebtoken` (Sesiones), `dotenv` (Variables de entorno) y `cors`.

---

## 📚 Documentación

Para detalles técnicos profundos sobre la arquitectura, base de datos y endpoints de la API, por favor consulta la [Documentación Técnica](docs/Documentation.md).

---

## 🚀 Cómo Iniciar

1.  **Instalar:** `npm install`
2.  **Ejecutar Servidor:** `npm run dev`
3.  **Cliente:** Abrir `src/frontend/login.html`
