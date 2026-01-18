USE b7euttwjkcttgjlvaeqk;

CREATE TABLE IF NOT EXISTS roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS ubicaciones (
    id_ubicacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_lugar VARCHAR(100) NOT NULL,
    direccion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INT,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

CREATE TABLE IF NOT EXISTS equipos (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_equipo VARCHAR(100) NOT NULL,
    numero_serie VARCHAR(100),
    estado ENUM('operativo', 'en_reparacion', 'baja') DEFAULT 'operativo',
    id_categoria INT,
    id_ubicacion_actual INT,
    fecha_adquisicion DATE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_ubicacion_actual) REFERENCES ubicaciones(id_ubicacion)
);

CREATE TABLE IF NOT EXISTS tickets (
    id_ticket INT AUTO_INCREMENT PRIMARY KEY,
    asunto VARCHAR(150) NOT NULL,
    descripcion TEXT,
    prioridad ENUM('Baja', 'Media', 'Alta') DEFAULT 'Media',
    estado ENUM('Abierto', 'En Proceso', 'Cerrado') DEFAULT 'Abierto',
    id_usuario_reporta INT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_reporta) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS movimientos (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_equipo INT,
    id_usuario_responsable INT,
    tipo_movimiento VARCHAR(50),
    fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    detalles TEXT,
    FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo),
    FOREIGN KEY (id_usuario_responsable) REFERENCES usuarios(id_usuario)
);

USE b7euttwjkcttgjlvaeqk;

INSERT IGNORE INTO roles (id_rol, nombre_rol) VALUES 
(1, 'admin'),
(2, 'tecnico');

INSERT IGNORE INTO usuarios (id_usuario, nombre_completo, email, password_hash, id_rol) VALUES 
(1, 'Admin Sistema', 'tecnico@empresa.com', '$2a$10$xL.0/0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0', 1);

INSERT IGNORE INTO categorias (id_categoria, nombre_categoria, descripcion) VALUES 
(1, 'Computadores', 'Notebooks y Desktops'),
(2, 'Periféricos', 'Teclados, Mouse, Monitores'),
(3, 'Redes', 'Routers, Switches, Access Points'),
(4, 'Impresión', 'Impresoras y Escáneres');

INSERT IGNORE INTO ubicaciones (id_ubicacion, nombre_lugar, direccion) VALUES 
(1, 'Bodega Central', 'Piso -1'),
(2, 'Oficina TI', 'Piso 2, Oficina 204'),
(3, 'Recepción', 'Hall de Acceso'),
(4, 'Sala de Servidores', 'Piso 3, Climatizado'),
(5, 'Gerencia', 'Piso 4');

INSERT INTO equipos (nombre_equipo, numero_serie, estado, id_categoria, id_ubicacion_actual, fecha_adquisicion) VALUES 
('Notebook HP ProBook 450', '5CD12345X', 'operativo', 1, 2, '2023-01-15'),
('Monitor Dell 24 Pulgadas', 'CN-0H9-744', 'operativo', 2, 2, '2023-02-10'),
('Router Cisco ISR 1100', 'FGL23456Y', 'en_reparacion', 3, 2, '2022-11-05'),
('Impresora Epson EcoTank', 'X5GT-8899', 'operativo', 4, 3, '2023-03-20'),
('Switch TP-Link 24 Puertos', 'TL-SG1024', 'operativo', 3, 4, '2023-01-10'),
('Notebook Lenovo ThinkPad', 'LNV-998877', 'baja', 1, 1, '2020-05-14'),
('Mouse Logitech Inalámbrico', 'SN-LOGI-01', 'operativo', 2, 3, '2023-06-01'),
('Teclado Mecánico Redragon', 'RD-556677', 'operativo', 2, 2, '2023-04-15'),
('Servidor Dell PowerEdge', 'SRV-001-CL', 'operativo', 1, 4, '2022-08-30'),
('MacBook Air M1', 'FVFD1234', 'en_reparacion', 1, 2, '2023-05-20'),
('Proyector Epson PowerLite', 'EPS-PRJ-09', 'operativo', 2, 5, '2023-02-28'),
('Access Point Ubiquiti', 'UAP-AC-PRO', 'operativo', 3, 3, '2023-07-10'),
('Notebook Dell Latitude', 'DLL-LAT-54', 'baja', 1, 1, '2019-12-01'),
('Monitor Samsung Curvo', 'SAM-CRV-27', 'operativo', 2, 5, '2023-03-15'),
('Impresora HP LaserJet', 'HP-LSR-102', 'en_reparacion', 4, 1, '2021-10-10');

INSERT INTO tickets (asunto, prioridad, estado, id_usuario_reporta) VALUES 
('Falla de Pantalla Notebook', 'Alta', 'Abierto', 1),
('Solicitud Mouse Ergonómico', 'Baja', 'En Proceso', 1),
('Error al conectar VPN', 'Media', 'Abierto', 1);


-- FIX PARA EL ERROR DE COLUMNA FALTANTE
ALTER TABLE tickets ADD COLUMN id_usuario_asignado INT NULL;

-- FIX para el error de que no se muestren los tickets para mantener integridad referencial
ALTER TABLE tickets ADD COLUMN id_usuario_asignado INT NULL;