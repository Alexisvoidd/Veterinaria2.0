DROP DATABASE IF EXISTS vetsalud;
CREATE DATABASE vetsalud;
USE vetsalud;

-- --------------Rol-----------------

CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    nombre_rol VARCHAR(20) NOT NULL,
    descripcion_rol VARCHAR(100) NOT NULL,
    estado ENUM('activo', 'inactivo')
);

INSERT INTO rol (id_rol, nombre_rol, descripcion_rol, estado) VALUES
(1, 'Admin', 'Administrador del sistema', 'activo'),
(2, 'Veterinario', 'Personal médico veterinario', 'activo'),
(3, 'Cliente', 'Dueño de mascota que usa los servicios', 'activo'),
(4, 'Proveedor', 'Proveedor de productos para la veterinaria', 'activo');

-- --------------Usuario-----------------

CREATE TABLE usuario (
    id_usu INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    id_rol INT,
    FOREIGN KEY (id_rol)
        REFERENCES rol (id_rol),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    tipo_doc ENUM('CC', 'TI', 'PAS') NOT NULL,
    num_doc VARCHAR(20) NOT NULL UNIQUE,
    titulo_profesional VARCHAR(120),
    especialidad VARCHAR(120),
    telefono VARCHAR(20) NOT NULL,
    telefono_secundario VARCHAR(20) NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    fecha_ingreso DATETIME NOT NULL,
    fecha_nacimiento DATE NULL,
    direccion VARCHAR(180) NULL
);

INSERT INTO usuario (id_usu, id_rol, nombre, apellido, tipo_doc, num_doc, titulo_profesional, especialidad, telefono, correo, password_hash, estado, fecha_ingreso) VALUES
(1, 1, 'Julian', 'Montaña', 'CC', '1234567890', NULL, NULL, '1234567890', 'jadmin@gmail.com', 'Admin123', 'ACTIVO', '2023-01-15 08:00:00'),
(2, 2, 'Samuel', 'Lopez', 'CC', '1020304050', 'Médico Veterinario', 'Cirugía', '3012345678', 'samuelo@gmail.com', 'Samuelo.', 'ACTIVO', '2023-02-01 09:00:00'),
(3, 3, 'Ana', 'Torres', 'CC', '1003456789', NULL, NULL, '3023456789', 'ana.torres@gmail.com', 'cli_003', 'ACTIVO', '2023-03-10 10:00:00'),
(4, 3, 'Jorge', 'Pérez', 'CC', '1004567890', NULL, NULL, '3024567890', 'jorge.perez@gmail.com', 'cli_004', 'ACTIVO', '2023-04-05 11:00:00'),
(5, 4, 'Mario', 'Rojas', 'CC', '1005678901', NULL, NULL, '3035678901', 'mario.rojas@petfooddist.com', 'prov_005', 'ACTIVO', '2023-05-20 12:00:00');

-- --------------Sucursal-----------------

CREATE TABLE sucursal (
    id_suc INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    encargado INT,
    FOREIGN KEY (encargado)
        REFERENCES usuario (id_usu),
    nombre_suc VARCHAR(30) NOT NULL,
    departamento VARCHAR(30) NOT NULL,
    ciudad VARCHAR(30) NOT NULL,
    direccion VARCHAR(100) NOT NULL,
    estado ENUM('activo', 'inactivo')
);

INSERT INTO sucursal (nombre_suc, departamento, ciudad, direccion, estado, encargado) VALUES
('Sucursal Centro', 'Boyacá', 'Tunja', 'Calle 10 # 5-20', 'activo', 1),
('Sucursal Norte', 'Boyacá', 'Sogamoso', 'Carrera 15 # 12-30', 'activo', 2),
('Sucursal Capital', 'Cundinamarca', 'Bogotá', 'Av. Caracas # 45-67', 'activo', 1),
('Sucursal Duitama', 'Boyacá', 'Duitama', 'Carrera 10 # 16-40', 'activo', 2),
('Sucursal Oriente', 'Santander', 'Bucaramanga', 'Calle 36 # 20-15', 'inactivo', 1);

-- --------------Mascota-----------------

CREATE TABLE mascota (
    id_mascota INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usu INT,
    FOREIGN KEY (id_usu)
        REFERENCES usuario (id_usu),
    nombre VARCHAR(50) NOT NULL,
    especie VARCHAR(80) NOT NULL,
    raza VARCHAR(80) NOT NULL,
    sexo ENUM('M', 'F') NOT NULL,
    fecha_nacimiento DATE NULL,
    foto MEDIUMBLOB NULL,
    foto_tipo VARCHAR(50) NULL,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO'
);

INSERT INTO mascota (id_mascota, id_usu, nombre, especie, raza, sexo, fecha_nacimiento, estado) VALUES
(1, 3, 'Toby', 'Perro', 'Labrador', 'M', '2021-06-01', 'ACTIVO'),
(2, 3, 'Mishi', 'Gato', 'Siamés', 'F', '2022-01-15', 'ACTIVO'),
(3, 4, 'Rocky', 'Perro', 'Bulldog', 'M', '2020-11-20', 'ACTIVO'),
(4, 4, 'Luna', 'Gato', 'Persa', 'F', '2023-02-10', 'ACTIVO'),
(5, 3, 'Max', 'Perro', 'Golden Retriever', 'M', '2019-08-05', 'ACTIVO');

-- --------------Servicio-----------------

CREATE TABLE servicio (
    id_servicio INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion_serv VARCHAR(100) NOT NULL,
    precio DECIMAL(12 , 6 ) NOT NULL,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO'
);

INSERT INTO servicio (id_servicio, nombre, descripcion_serv, precio, estado) VALUES
(1, 'Diagnóstico avanzado', 'Pruebas clínicas y diagnóstico veterinario', 80000.000000, 'ACTIVO'),
(2, 'Recorte de uñas', 'Cuidado de patas y recorte profesional', 25000.000000, 'ACTIVO'),
(3, 'Dosis y Vacunación', 'Dosis y refuerzos preventivos', 40000.000000, 'ACTIVO'),
(4, 'Exámenes de bienestar', 'Evaluación clínica preventiva integral', 60000.000000, 'ACTIVO'),
(5, 'Esterilización', 'Procedimiento reproductivo responsable', 280000.000000, 'ACTIVO'),
(6, 'Procedimientos quirúrgicos', 'Cirugía veterinaria especializada', 350000.000000, 'ACTIVO'),
(7, 'Limpieza dental', 'Cuidado y limpieza dental profesional', 90000.000000, 'ACTIVO'),
(8, 'Microchips y pruebas', 'Identificación y pruebas diagnósticas', 70000.000000, 'ACTIVO');

-- -----------------Marca-----------------

CREATE TABLE marca (
    id_marca INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    id_usu INT,
    FOREIGN KEY (id_usu)
        REFERENCES usuario (id_usu),
    nombre_marca VARCHAR(20) NOT NULL,
    descripcion_marca VARCHAR(100) NOT NULL,
    fecha_creacion DATETIME,
    estado ENUM('activo', 'inactivo')
);

INSERT INTO marca (id_marca, id_usu, nombre_marca, descripcion_marca, fecha_creacion, estado) VALUES
(1, 1, 'DogChow', 'Alimento balanceado para perros', '2023-01-20 08:00:00', 'activo'),
(2, 1, 'CatFresh', 'Alimento premium para gatos', '2023-01-20 08:05:00', 'activo'),
(3, 1, 'VetPlus', 'Suplementos y medicamentos veterinarios', '2023-01-20 08:10:00', 'activo'),
(4, 1, 'PetCare', 'Productos de higiene para mascotas', '2023-01-20 08:15:00', 'activo'),
(5, 1, 'ZooToys', 'Juguetes para mascotas', '2023-01-20 08:20:00', 'activo');

-- --------------Categoria-----------------

CREATE TABLE categoria (
    id_cat INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cat VARCHAR(65) NOT NULL,
    descripcion_cat VARCHAR(100) NOT NULL,
    estado_cat ENUM('activo', 'inactivo')
);

INSERT INTO categoria (id_cat, nombre_cat, descripcion_cat, estado_cat) VALUES
(1, 'Alimento', 'Productos alimenticios para mascotas', 'activo'),
(2, 'Medicamentos', 'Productos farmacéuticos veterinarios', 'activo'),
(3, 'Higiene', 'Productos de aseo y cuidado', 'activo'),
(4, 'Accesorios', 'Correas, comederos, camas', 'activo'),
(5, 'Juguetes', 'Juguetes para mascotas', 'activo');

-- --------------Producto-----------------

CREATE TABLE producto (
    id_produ INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    id_cat INT NOT NULL,
    FOREIGN KEY (id_cat)
        REFERENCES categoria (id_cat),
	id_marca INT NOT NULL,
    FOREIGN KEY (id_marca)
        REFERENCES marca (id_marca),
    nombre_produ VARCHAR(20) NOT NULL,
    descripcion_produ VARCHAR(100) NOT NULL,
    precio DECIMAL(12 , 6 ) NOT NULL,
    talla ENUM('XS', 'S', 'M', 'L', 'XL'),
    imagen MEDIUMBLOB,
    imagen_url VARCHAR(300),
    fecha_vencimiento DATETIME,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO'
);

INSERT INTO producto (id_produ, id_cat, id_marca, nombre_produ, descripcion_produ, precio, talla, imagen_url, fecha_vencimiento, estado) VALUES
(1, 1,1, 'DogChow 3kg', 'Alimento seco para perro adulto', 45000.000000, NULL, NULL, '2027-06-01 00:00:00', 'ACTIVO'),
(2, 1,2, 'CatFresh 2kg', 'Alimento seco para gato adulto', 38000.000000, NULL, NULL, '2027-06-01 00:00:00', 'ACTIVO'),
(3, 2,3, 'Amoxicilina 250mg', 'Antibiótico veterinario', 15000.000000, NULL, NULL, '2028-01-01 00:00:00', 'ACTIVO'),
(4, 3,4, 'Shampoo antipulgas', 'Shampoo medicado para perros y gatos', 22000.000000, NULL, NULL, '2027-12-01 00:00:00', 'ACTIVO'),
(5, 5,5, 'Pelota de goma', 'Juguete resistente para perro', 12000.000000, NULL, NULL, NULL, 'ACTIVO');

-- --------------Inventario-----------------

CREATE TABLE inventario (
    id_inventario INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    id_suc INT NOT NULL,
    FOREIGN KEY (id_suc)
        REFERENCES sucursal (id_suc),
    id_producto INT NOT NULL,
    FOREIGN KEY (id_producto)
        REFERENCES producto (id_produ),
    stock INT NOT NULL DEFAULT 0,
    UNIQUE KEY uq_suc_producto (id_suc, id_producto)
);

INSERT INTO inventario (id_suc, id_producto, stock) VALUES
(1, 1, 10), (2, 1, 10), (3, 1, 10),
(1, 2, 15), (3, 2, 10),
(1, 3, 20), (2, 3, 15), (4, 3, 15),
(1, 4, 10), (5, 4, 10),
(1, 5, 15), (2, 5, 10), (3, 5, 15);

-- --------------Cita-----------------

CREATE TABLE cita (
    id_cita INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_veterinario INT,
    FOREIGN KEY (id_veterinario)
        REFERENCES usuario (id_usu),
    id_mascota INT,
    FOREIGN KEY (id_mascota)
        REFERENCES mascota (id_mascota),
    fecha DATETIME NOT NULL,
    motivo VARCHAR(250) NOT NULL,
    estado ENUM('PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE'
);

INSERT INTO cita (id_cita, id_veterinario, id_mascota, fecha, motivo, estado) VALUES
(1, 2, 1, '2026-08-10 09:00:00', 'Chequeo general', 'ATENDIDA'),
(2, 2, 2, '2026-08-11 10:00:00', 'Vacunación anual', 'ATENDIDA'),
(3, 2, 3, '2026-08-15 11:00:00', 'Cojera en pata trasera', 'CONFIRMADA'),
(4, 2, 4, '2026-08-20 14:00:00', 'Baño y peluquería', 'PENDIENTE'),
(5, 2, 5, '2026-08-22 15:30:00', 'Desparasitación', 'PENDIENTE');

-- --------------Detalle Cita-----------------

CREATE TABLE detalle_cita (
    id_detalle_cita INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_cita INT,
    FOREIGN KEY (id_cita)
        REFERENCES cita (id_cita),
    id_servicio INT,
    FOREIGN KEY (id_servicio)
        REFERENCES servicio (id_servicio),
    cantidad INT NOT NULL DEFAULT 1,
    iva DECIMAL(12 , 6 ) NOT NULL,
    subtotal DECIMAL(12 , 6 ) NOT NULL
);

INSERT INTO detalle_cita (id_detalle_cita, id_cita, id_servicio, cantidad, iva, subtotal) VALUES
(1, 1, 1, 1, 9500.000000, 59500.000000),
(2, 2, 2, 1, 7600.000000, 47600.000000),
(3, 3, 1, 1, 9500.000000, 59500.000000),
(4, 4, 3, 1, 6650.000000, 41650.000000),
(5, 5, 5, 1, 5700.000000, 35700.000000);

-- --------------Historia Clinica-----------------

CREATE TABLE historia_clinica (
    id_historia_clinica INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_mascota INT,
    FOREIGN KEY (id_mascota)
        REFERENCES mascota (id_mascota),
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sintomas VARCHAR(500) NOT NULL,
    diagnostico VARCHAR(500) NOT NULL,
    prox_visita DATE NULL,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO'
);

INSERT INTO historia_clinica (id_historia_clinica, id_mascota, fecha, sintomas, diagnostico, prox_visita, estado) VALUES
(1, 1, '2026-08-10 09:15:00', 'Ninguno, chequeo rutinario', 'Saludable', '2027-02-10', 'ACTIVO'),
(2, 2, '2026-08-11 10:15:00', 'Ninguno', 'Vacunación aplicada sin reacciones', '2027-08-11', 'ACTIVO'),
(3, 3, '2026-08-15 11:15:00', 'Cojera en pata trasera derecha', 'Esguince leve', '2026-08-29', 'ACTIVO'),
(4, 4, '2026-08-20 14:15:00', 'Ninguno', 'Piel y pelaje en buen estado', NULL, 'ACTIVO'),
(5, 5, '2026-08-22 15:45:00', 'Presencia de parásitos en heces', 'Parasitosis intestinal leve', '2026-09-22', 'ACTIVO');

CREATE TABLE tratamiento (
    id_tratamiento INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_historia_clinica INT NOT NULL,
    FOREIGN KEY (id_historia_clinica)
        REFERENCES historia_clinica (id_historia_clinica),
    id_producto INT NULL,
    FOREIGN KEY (id_producto)
        REFERENCES producto (id_produ),
    dosis VARCHAR(100),
    duracion VARCHAR(50),
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tratamiento (id_tratamiento, id_historia_clinica, id_producto, dosis, duracion, fecha) VALUES
(1, 1, NULL, NULL, NULL, '2026-08-10 09:20:00'),
(2, 2, NULL, NULL, NULL, '2026-08-11 10:20:00'),
(3, 3, 3, '250mg cada 12 horas', '7 días', '2026-08-15 11:20:00'),
(4, 4, 4, 'Aplicar durante el baño', '1 aplicación', '2026-08-20 14:20:00'),
(5, 5, NULL, 'Antiparasitario oral', 'Dosis única', '2026-08-22 15:50:00');

-- --------------Vacunacion-----------------

CREATE TABLE vacunacion (
    id_vacunacion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_mascota INT NOT NULL,
    FOREIGN KEY (id_mascota)
        REFERENCES mascota (id_mascota),
    nombre_vacuna VARCHAR(100) NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    proxima_dosis DATE NULL
);

INSERT INTO vacunacion (id_vacunacion, id_mascota, nombre_vacuna, fecha_aplicacion, proxima_dosis) VALUES
(1, 1,  'Antirrábica', '2026-01-15', '2027-01-15'),
(2, 2,  'Triple felina', '2026-08-11', '2027-08-11'),
(3, 3,  'Antirrábica', '2025-12-01', '2026-12-01'),
(4, 4,  'Triple felina', '2026-02-10', '2027-02-10'),
(5, 5,  'Parvovirus', '2026-03-05', '2027-03-05');

-- --------------Venta-----------------

CREATE TABLE venta (
    id_venta INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usu INT NOT NULL,
    FOREIGN KEY (id_usu)
        REFERENCES usuario (id_usu),
    id_suc INT NOT NULL,
    FOREIGN KEY (id_suc)
        REFERENCES sucursal (id_suc),
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metodo_pago ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA') NOT NULL,
    telefono VARCHAR(20) NULL,
    ciudad VARCHAR(100) NULL,
    direccion_entrega VARCHAR(180) NULL,
    notas VARCHAR(300) NULL,
    estado ENUM('PAGADA', 'ANULADA') NOT NULL DEFAULT 'PAGADA'
);

INSERT INTO venta (id_venta, id_usu, id_suc, fecha, metodo_pago, telefono, ciudad, direccion_entrega, notas, estado) VALUES
(1, 3, 1, '2026-08-10 09:30:00', 'EFECTIVO', NULL, NULL, NULL, 'Compra en sucursal', 'PAGADA'),
(2, 4, 1, '2026-08-12 16:00:00', 'TARJETA', '3001234567', 'Tunja', 'Calle 10 #5-20', 'Envío a domicilio', 'PAGADA'),
(3, 3, 3, '2026-08-15 12:00:00', 'TRANSFERENCIA', NULL, NULL, NULL, NULL, 'PAGADA'),
(4, 4, 2, '2026-08-18 17:00:00', 'EFECTIVO', NULL, NULL, NULL, NULL, 'ANULADA'),
(5, 3, 1, '2026-08-22 10:00:00', 'TARJETA', '3007654321', 'Tunja', 'Carrera 8 #12-34', 'Envío urgente', 'PAGADA');

CREATE TABLE detalle_venta (
    id_detalle_venta INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    FOREIGN KEY (id_venta)
        REFERENCES venta (id_venta),
    id_producto INT NOT NULL,
    FOREIGN KEY (id_producto)
        REFERENCES producto (id_produ),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12 , 6 ) NOT NULL,
    subtotal DECIMAL(12 , 6 ) NOT NULL
);

INSERT INTO detalle_venta (id_detalle_venta, id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 2, 45000.000000, 90000.000000),
(2, 2, 2, 1, 38000.000000, 38000.000000),
(3, 3, 4, 1, 22000.000000, 22000.000000),
(4, 4, 5, 3, 12000.000000, 36000.000000),
(5, 5, 3, 2, 15000.000000, 30000.000000);

-- --------------Compra-----------------

CREATE TABLE compra (
    id_compra INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usu INT NOT NULL,
    FOREIGN KEY (id_usu)
        REFERENCES usuario (id_usu),
    id_suc INT NOT NULL,
    FOREIGN KEY (id_suc)
        REFERENCES sucursal (id_suc),
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metodo_pago ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA') NOT NULL,
    notas VARCHAR(500) NULL,
    estado ENUM('PAGADA', 'ANULADA') NOT NULL DEFAULT 'PAGADA'
);

INSERT INTO compra (id_compra, id_usu, id_suc, fecha, metodo_pago, notas, estado) VALUES
(1, 5, 1, '2026-07-01 08:00:00', 'TRANSFERENCIA', 'Reposición mensual de alimento', 'PAGADA'),
(2, 5, 1, '2026-07-15 09:00:00', 'TRANSFERENCIA', 'Compra de medicamentos', 'PAGADA'),
(3, 5, 2, '2026-08-01 08:30:00', 'EFECTIVO', 'Reposición de higiene', 'PAGADA'),
(4, 5, 3, '2026-08-10 10:00:00', 'TARJETA', 'Compra de juguetes', 'PAGADA'),
(5, 5, 1, '2026-08-20 11:00:00', 'TRANSFERENCIA', 'Pedido anulado por error', 'ANULADA');

CREATE TABLE detalle_compra (
    id_detalle_compra INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    FOREIGN KEY (id_compra)
        REFERENCES compra (id_compra),
    id_producto INT NOT NULL,
    FOREIGN KEY (id_producto)
        REFERENCES producto (id_produ),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12 , 6 ) NOT NULL,
    subtotal DECIMAL(12 , 5 ) NOT NULL
);

INSERT INTO detalle_compra (id_detalle_compra, id_compra, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 50, 30000.000000, 1500000.00000),
(2, 2, 3, 100, 8000.000000, 800000.00000),
(3, 3, 4, 30, 14000.000000, 420000.00000),
(4, 4, 5, 60, 7000.000000, 420000.00000),
(5, 5, 2, 40, 25000.000000, 1000000.00000);

-- ---------------------------------------Triggers----------------------------------------------------

DELIMITER //

-- -------------------------------------------venta-----------------------------------------
-- Resta del stock la cantidad que se vende en un detalle de venta, ademas calcula el subtotal en vase al precio unitario y la cntiada que se vende
-- ademas revisa si el producto existe antes de realizar la venta

CREATE TRIGGER trg_venta_descontar_stock
BEFORE INSERT ON detalle_venta
FOR EACH ROW
BEGIN
    DECLARE v_suc INT;
    DECLARE stock_actual INT;
    DECLARE v_precio DECIMAL(12,6);
    DECLARE v_estado VARCHAR(10);

SELECT 
    id_suc
INTO v_suc FROM
    venta
WHERE
    id_venta = NEW.id_venta;

SELECT 
    precio, estado
INTO v_precio , v_estado FROM
    producto
WHERE
    id_produ = NEW.id_producto;

    IF v_precio IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El producto indicado no existe.';
    END IF;

    IF v_estado <> 'ACTIVO' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El producto no está disponible para la venta.';
    END IF;

    SET NEW.precio_unitario = v_precio;
    SET NEW.subtotal = v_precio * NEW.cantidad;

SELECT 
    stock
INTO stock_actual FROM
    inventario
WHERE
    id_suc = v_suc
        AND id_producto = NEW.id_producto;

    IF stock_actual IS NULL OR stock_actual < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente en esta sucursal para completar la venta.';
    ELSE
        UPDATE inventario
        SET stock = stock - NEW.cantidad
        WHERE id_suc = v_suc AND id_producto = NEW.id_producto;
    END IF;
END//

-- ----------------------------------------Compra---------------------------------------
-- Suma al stock cada vez que hay una comopra de algun producto a algun proveedor

CREATE TRIGGER trg_compra_aumentar_stock
AFTER INSERT ON detalle_compra
FOR EACH ROW
BEGIN
    DECLARE v_suc INT;

SELECT 
    id_suc
INTO v_suc FROM
    compra
WHERE
    id_compra = NEW.id_compra;

UPDATE inventario 
SET 
    stock = stock + NEW.cantidad
WHERE
    id_suc = v_suc
        AND id_producto = NEW.id_producto;
END//

-- calcula el subtotal de los productos que se compraron

CREATE TRIGGER trg_compra_calcular_subtotal
BEFORE INSERT ON detalle_compra
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.precio_unitario * NEW.cantidad;
END//

-- ----------------------------------------------citas----------------------------------------------
-- Evita que si el horario ya esta ocupado, se vuelva a usar y que la cita sea futura a la fecha actual
-- Ademas si no se sellciona un veterinariop, automaticamente ele va a asignar el veterinario que este en la primera fila de la tabla

CREATE TRIGGER trg_cita_validar_horario
BEFORE INSERT ON cita
FOR EACH ROW
BEGIN
    DECLARE existe INT;
    DECLARE v_vet INT; -- Variable corregida (declarada previamente)

    IF NEW.fecha <= NOW() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La fecha de la cita debe ser futura.';
    END IF;

    -- Asigna un veterinario activo 
    IF NEW.id_veterinario IS NULL THEN
        SELECT u.id_usu INTO v_vet
        FROM usuario u
        JOIN rol r ON r.id_rol = u.id_rol
        WHERE UPPER(r.nombre_rol) = 'VETERINARIO' AND u.estado = 'ACTIVO'
        LIMIT 1;

        SET NEW.id_veterinario = v_vet;
    END IF;

    -- Valida disponibilidad por fecha y por el veterinario asignado
    SELECT COUNT(*) INTO existe 
    FROM cita
    WHERE fecha = NEW.fecha 
      AND id_veterinario = NEW.id_veterinario
      AND estado IN ('PENDIENTE', 'CONFIRMADA');

    IF existe > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El veterinario ya tiene una cita agendada en ese horario.';
    END IF;
END//

-- Evita que la reprogramar, escojamos uan cita que ya esta ocuapada y ademas que tiene que ser una fecha mayor a la actual

CREATE TRIGGER trg_cita_validar_horario_update
BEFORE UPDATE ON cita
FOR EACH ROW
BEGIN
    DECLARE existe INT;

    IF NEW.fecha <> OLD.fecha THEN
        IF NEW.fecha <= NOW() THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La fecha de la cita debe ser futura.';
        END IF;

SELECT 
    COUNT(*)
INTO existe FROM
    cita
WHERE
    fecha = NEW.fecha
        AND estado IN ('PENDIENTE' , 'CONFIRMADA')
        AND id_cita <> OLD.id_cita;

        IF existe > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ese horario ya está ocupado.';
        END IF;
    END IF;
END//

-- En este trigger hacemos el calculo para el iva y el subtotal

CREATE TRIGGER trg_detalle_cita_calcular_totales
BEFORE INSERT ON detalle_cita
FOR EACH ROW
BEGIN
    DECLARE v_precio DECIMAL(12,6);

SELECT 
    precio
INTO v_precio FROM
    servicio
WHERE
    id_servicio = NEW.id_servicio;

    IF v_precio IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El servicio indicado no existe.';
    END IF;

    SET NEW.iva = v_precio * NEW.cantidad * 0.19;
    SET NEW.subtotal = (v_precio * NEW.cantidad) * 1.19;
END//

-- valida que la proxima cita o control, no sean anteriosres a al cita actual

CREATE TRIGGER trg_historia_validar_prox_visita_update
BEFORE UPDATE ON historia_clinica
FOR EACH ROW
BEGIN
    IF NEW.prox_visita IS NOT NULL AND NEW.prox_visita < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La fecha de la próxima visita no puede ser anterior a la fecha actual.';
    END IF;
END//

DELIMITER ;