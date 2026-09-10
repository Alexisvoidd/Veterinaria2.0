require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

//Crear la app de Express

const app = express();
const PORT = Number(process.env.PORT || 3001);
const SUCURSAL_POR_DEFECTO = Number(process.env.DB_SUCURSAL_ID || 1);

//Cargar JSON del cliente y habilitar el uso del body

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

//Servir los archivos estaticos del frontend
//Esto permite que la pagina login.html, CSS y JS carguen correctamente
app.use(express.static(path.join(__dirname, "../Frontend")));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Admin123456",
  database: process.env.DB_NAME || "vetsalud",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

// Prepara las columnas opcionales de foto para instalaciones existentes.
async function prepararTablaMascota() {
  try {
    await pool.execute("ALTER TABLE mascota ADD COLUMN foto MEDIUMBLOB NULL");
  } catch (error) {
    if (error.code !== "ER_DUP_FIELDNAME") throw error;
  }
  try {
    await pool.execute(
      "ALTER TABLE mascota ADD COLUMN foto_tipo VARCHAR(50) NULL",
    );
  } catch (error) {
    if (error.code !== "ER_DUP_FIELDNAME") throw error;
  }
  try {
    await pool.execute(
      "ALTER TABLE producto ADD COLUMN imagen_tipo VARCHAR(50) NULL",
    );
  } catch (error) {
    if (error.code !== "ER_DUP_FIELDNAME") throw error;
  }
}

// Prepara los datos adicionales que utiliza el formulario de perfil.
async function prepararDatosPerfil() {
  const columnas = [
    ["fecha_nacimiento", "DATE NULL"],
    ["direccion", "VARCHAR(180) NULL"],
    ["telefono_secundario", "VARCHAR(20) NULL"],
  ];
  for (const [nombre, definicion] of columnas) {
    try {
      await pool.execute(
        `ALTER TABLE usuario ADD COLUMN ${nombre} ${definicion}`,
      );
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") throw error;
    }
  }
}

// Mantiene el catálogo de la base de datos alineado con la sección de servicios.
async function sincronizarServicios() {
  const servicios = [
    [
      1,
      "Diagnóstico avanzado",
      "Pruebas clínicas y diagnóstico veterinario",
      80000,
    ],
    [2, "Recorte de uñas", "Cuidado de patas y recorte profesional", 25000],
    [3, "Dosis y Vacunación", "Dosis y refuerzos preventivos", 40000],
    [
      4,
      "Exámenes de bienestar",
      "Evaluación clínica preventiva integral",
      60000,
    ],
    [5, "Esterilización", "Procedimiento reproductivo responsable", 280000],
    [
      6,
      "Procedimientos quirúrgicos",
      "Cirugía veterinaria especializada",
      350000,
    ],
    [7, "Limpieza dental", "Cuidado y limpieza dental profesional", 90000],
    [8, "Microchips y pruebas", "Identificación y pruebas diagnósticas", 70000],
  ];

  for (const servicio of servicios) {
    await pool.execute(
      `INSERT INTO servicio (id_servicio, nombre, descripcion_serv, precio, estado)
       VALUES (?, ?, ?, ?, 'ACTIVO')
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion_serv = VALUES(descripcion_serv), precio = VALUES(precio), estado = 'ACTIVO'`,
      servicio,
    );
  }
}

//Funcion para crear un token para rutas protegidas

function crearToken(usuario) {
  const payload = {
    idUsuario: usuario.idUsuario,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    correo: usuario.correo,
    rol: usuario.rol,
    expiraEn: Date.now() + 8 * 60 * 60 * 1000,
  };

  const datos = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const firma = crypto
    .createHmac("sha256", process.env.CLAVE_SESION || "vetSaludClaveSecreta")
    .update(datos)
    .digest("base64url");

  return `${datos}.${firma}`;
}

// Valida el token recibido por las rutas privadas y retorna su contenido.
function obtenerUsuarioDesdeToken(req) {
  const encabezado = String(req.headers.authorization || "");
  if (!encabezado.startsWith("Bearer ")) return null;

  const token = encabezado.slice(7);
  const [datos, firma] = token.split(".");
  if (!datos || !firma) return null;

  const firmaEsperada = crypto
    .createHmac("sha256", process.env.CLAVE_SESION || "vetSaludClaveSecreta")
    .update(datos)
    .digest("base64url");

  if (firma !== firmaEsperada) return null;

  try {
    const usuario = JSON.parse(
      Buffer.from(datos, "base64url").toString("utf8"),
    );
    return usuario.expiraEn > Date.now() ? usuario : null;
  } catch (error) {
    return null;
  }
}

// Protege las operaciones exclusivas del panel administrativo.
function obtenerAdministrador(req, res) {
  const usuario = obtenerUsuarioDesdeToken(req);
  if (!usuario || usuario.rol !== "ADMIN") {
    res.status(403).json({ error: "No tienes permisos de administrador." });
    return null;
  }
  return usuario;
}

// Protege las operaciones exclusivas del panel veterinario.
function obtenerVeterinario(req, res) {
  const usuario = obtenerUsuarioDesdeToken(req);
  if (
    !usuario ||
    !["VETERINARIO", "VET", "ADMIN"].includes(
      String(usuario.rol || "").toUpperCase(),
    )
  ) {
    res.status(403).json({ error: "No tienes permisos veterinarios." });
    return null;
  }
  return usuario;
}

//Funcion para crear un hash seguro de la contrasena.
//Se usa para nuevos usuarios y para dejar una base preparada para futuro.
function crearHashPassword(password) {
  const sal = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, sal, 64).toString("hex");
  return `${sal}:${hash}`;
}

//Funcion para validar la contrasena.
//Acepta:
//- formato seguro "salt:hash" para usuarios nuevos
//- formato actual del proyecto (ej: "vet_002", "hash_admin_001")
//- texto plano para pruebas simples
function verificarPassword(password, hashGuardado) {
  if (!password || !hashGuardado) return false;

  const valor = String(hashGuardado).trim();

  // Formato seguro: "salt:hash" generado con crypto.scryptSync
  const partes = valor.split(":");
  if (partes.length === 2) {
    try {
      const hashCalculado = crypto
        .scryptSync(password, partes[0], 64)
        .toString("hex");
      return crypto.timingSafeEqual(
        Buffer.from(hashCalculado, "hex"),
        Buffer.from(partes[1], "hex"),
      );
    } catch (error) {
      return false;
    }
  }

  // Formato actual del proyecto: valores simples como "vet_002"
  const contraseñasActuales = {
    hash_admin_001: "Admin123",
    hash_cli_003: "Cliente123",
    hash_cli_004: "Cliente123",
    cli_003: "cli_003",
    cli_004: "cli_004",
  };

  if (Object.prototype.hasOwnProperty.call(contraseñasActuales, valor)) {
    return password === contraseñasActuales[valor];
  }

  // Si la contraseña se guarda como texto plano
  return password === valor;
}

// Registra un cliente y, opcionalmente, su primera mascota en una sola operación.
app.post("/api/registro", async (req, res) => {
  const nombre = String(req.body?.nombres || "").trim();
  const apellido = String(req.body?.apellidos || "").trim();
  const tipoDocumento = String(req.body?.tipoDocumento || "")
    .trim()
    .toUpperCase();
  const documento = String(req.body?.numeroDocumento || "").trim();
  const fechaNacimiento = req.body?.fechaNacimiento || null;
  const telefono = String(req.body?.telefono1 || "").trim();
  const telefonoSecundario = String(req.body?.telefono2 || "").trim() || null;
  const correo = String(req.body?.correo || "")
    .trim()
    .toLowerCase();
  const direccion = String(req.body?.direccion || "").trim() || null;
  const password = String(req.body?.password || "");
  const nombreMascota = String(req.body?.nombreMascota || "").trim();
  const especieOriginal = String(req.body?.especie || "")
    .trim()
    .toLowerCase();
  const raza = String(req.body?.raza || "Mestizo").trim() || "Mestizo";
  const sexoOriginal = String(req.body?.sexo || "")
    .trim()
    .toLowerCase();
  const fechaNacimientoMascota = req.body?.fechaNacimientoMascota || null;

  const tipoDocumentoDb = {
    CC: "CC",
    TI: "TI",
    PAS: "PAS",
    CE: "TI",
    PP: "PAS",
    RC: "CC",
  }[tipoDocumento];
  const especie = {
    perro: "Perro",
    gato: "Gato",
    ave: "Ave",
    conejo: "Conejo",
    exotico: "Otro",
  }[especieOriginal];
  const sexo = { macho: "M", hembra: "F" }[sexoOriginal];
  const nombresValidos = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{2,100}$/;
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordValida =
    password.length >= 8 &&
    password.length <= 100 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);

  if (
    !nombresValidos.test(nombre) ||
    !nombresValidos.test(apellido) ||
    !tipoDocumentoDb ||
    !/^\d{6,20}$/.test(documento) ||
    !correoValido.test(correo) ||
    !/^\d{7,20}$/.test(telefono) ||
    (telefonoSecundario && !/^\d{7,20}$/.test(telefonoSecundario)) ||
    !passwordValida
  ) {
    return res.status(400).json({
      error: "Revisa los datos personales y la seguridad de la contraseña.",
    });
  }
  if (
    (fechaNacimiento && Number.isNaN(Date.parse(fechaNacimiento))) ||
    (fechaNacimientoMascota && Number.isNaN(Date.parse(fechaNacimientoMascota)))
  ) {
    return res
      .status(400)
      .json({ error: "Una de las fechas ingresadas no es válida." });
  }
  if (!nombreMascota || !especie || !sexo || raza.length > 80) {
    return res
      .status(400)
      .json({ error: "Completa correctamente los datos de la mascota." });
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const [usuarioResultado] = await conexion.execute(
      `INSERT INTO usuario (id_rol, nombre, apellido, tipo_doc, num_doc, telefono,
              telefono_secundario, correo, password_hash, estado, fecha_ingreso,
              fecha_nacimiento, direccion)
       VALUES (3, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO', NOW(), ?, ?)`,
      [
        nombre,
        apellido,
        tipoDocumentoDb,
        documento,
        telefono,
        telefonoSecundario,
        correo,
        crearHashPassword(password),
        fechaNacimiento,
        direccion,
      ],
    );
    await conexion.execute(
      `INSERT INTO mascota (id_usu, nombre, especie, raza, sexo, fecha_nacimiento, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO')`,
      [
        usuarioResultado.insertId,
        nombreMascota,
        especie,
        raza,
        sexo,
        fechaNacimientoMascota,
      ],
    );
    await conexion.commit();
    res
      .status(201)
      .json({ mensaje: "Cuenta y mascota registradas correctamente." });
  } catch (error) {
    await conexion.rollback();
    if (error.code === "ER_DUP_ENTRY")
      return res
        .status(409)
        .json({ error: "El correo o número de documento ya está registrado." });
    console.error("Error al registrar cliente:", error.message);
    res.status(500).json({ error: "No se pudo completar el registro." });
  } finally {
    conexion.release();
  }
});

//Endpoint para revisar que el servidor y MySQL respondan

app.get("/api/salud", async (_req, res) => {
  try {
    const [resultado] = await pool.query("SELECT 1 AS ok");
    res.json({
      ok: true,
      mensaje: "Servidor y base de datos conectados correctamente.",
      resultado: resultado[0],
    });
  } catch (error) {
    console.error("Error de conexion a la base de datos:", error.message);
    res.status(500).json({
      ok: false,
      error: "No se pudo conectar a la base de datos.",
    });
  }
});

//Login del usuario
//Este es el punto de entrada principal para autenticacion

app.post("/api/login", async (req, res) => {
  const correo = String(req.body?.correo || "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || "");

  if (!correo || !password) {
    return res.status(400).json({
      error: "Debes ingresar correo y contraseña.",
    });
  }

  // Validacion basica del correo
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexCorreo.test(correo)) {
    return res.status(400).json({
      error: "El correo no tiene un formato valido.",
    });
  }

  try {
    // Consulta en la tabla usuario quien es el dueño del correo
    // y verifica si el password es correcto para permitirle el ingreso
    const [usuarios] = await pool.execute(
      `SELECT u.id_usu AS idUsuario,
              u.nombre,
              u.apellido,
              u.correo,
              u.password_hash AS passwordHash,
              r.nombre_rol AS rol,
              CASE WHEN UPPER(r.nombre_rol) = 'CLIENTE' THEN u.id_usu ELSE NULL END AS idCliente
       FROM usuario u
       LEFT JOIN rol r ON r.id_rol = u.id_rol
       WHERE LOWER(u.correo) = ?
       AND u.estado = 'ACTIVO'
       LIMIT 1`,
      [correo],
    );

    if (!usuarios.length) {
      return res.status(401).json({
        error: "Correo o contraseña incorrectos.",
      });
    }

    const usuario = usuarios[0];

    const passwordCorrecta = verificarPassword(password, usuario.passwordHash);
    if (!passwordCorrecta) {
      return res.status(401).json({
        error: "Correo o contraseña incorrectos.",
      });
    }

    const usuarioSesion = {
      idUsuario: usuario.idUsuario,
      idCliente: usuario.idCliente || null,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: String(usuario.rol || "CLIENTE").toUpperCase(),
    };

    res.json({
      mensaje: "Inicio de sesion correcto.",
      usuario: usuarioSesion,
      token: crearToken(usuarioSesion),
    });
  } catch (error) {
    console.error("Error al iniciar sesion:", error.message);
    res.status(500).json({
      error: "No se pudo iniciar sesion en este momento.",
    });
  }
});

// Registra una compra del cliente autenticado y descuenta el stock en una transacción.
app.post("/api/ventas", async (req, res) => {
  const usuarioToken = obtenerUsuarioDesdeToken(req);
  if (!usuarioToken || usuarioToken.rol !== "CLIENTE") {
    return res
      .status(401)
      .json({ error: "Debes iniciar sesión para comprar." });
  }

  const nombre = String(req.body?.nombre || "").trim();
  const correo = String(req.body?.correo || "")
    .trim()
    .toLowerCase();
  const telefono = String(req.body?.telefono || "").trim() || null;
  const ciudad = String(req.body?.ciudad || "").trim() || null;
  const direccion = String(req.body?.direccion || "").trim() || null;
  const notas = String(req.body?.notas || "").trim() || null;
  const metodoOriginal = String(req.body?.metodoPago || "").trim();
  const metodoPago = {
    "Pago contra entrega": "EFECTIVO",
    "Transferencia bancaria": "TRANSFERENCIA",
    "Pago en tienda": "EFECTIVO",
  }[metodoOriginal];
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (
    !nombre ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
    !metodoPago ||
    !items.length ||
    items.some(
      (item) =>
        !Number.isInteger(Number(item.id)) ||
        !Number.isInteger(Number(item.cantidad)) ||
        Number(item.cantidad) < 1 ||
        Number(item.cantidad) > 99,
    )
  ) {
    return res
      .status(400)
      .json({ error: "Revisa los datos y productos de la compra." });
  }

  const cantidades = new Map();
  for (const item of items) {
    const idProducto = Number(item.id);
    cantidades.set(
      idProducto,
      (cantidades.get(idProducto) || 0) + Number(item.cantidad),
    );
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const productos = [];
    for (const [idProducto, cantidad] of cantidades) {
      const [filas] = await conexion.execute(
        `SELECT p.id_produ, p.precio, p.estado,
                COALESCE(i.stock, 0) AS stock
         FROM producto p
         LEFT JOIN inventario i ON i.id_producto = p.id_produ AND i.id_suc = ?
         WHERE p.id_produ = ? FOR UPDATE`,
        [SUCURSAL_POR_DEFECTO, idProducto],
      );
      const producto = filas[0];
      if (!producto || String(producto.estado).toUpperCase() !== "ACTIVO") {
        throw new Error("Uno de los productos ya no está disponible.");
      }
      if (Number(producto.stock) < cantidad) {
        throw new Error("No hay stock suficiente para uno de los productos.");
      }
      productos.push({ ...producto, cantidad });
    }

    const [venta] = await conexion.execute(
      `INSERT INTO venta (id_usu, id_suc, metodo_pago, telefono, ciudad, direccion_entrega, notas, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PAGADA')`,
      [
        usuarioToken.idUsuario,
        SUCURSAL_POR_DEFECTO,
        metodoPago,
        telefono,
        ciudad,
        direccion,
        notas,
      ],
    );

    for (const producto of productos) {
      await conexion.execute(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [venta.insertId, producto.id_produ, producto.cantidad, 0, 0],
      );
    }

    await conexion.commit();
    res.status(201).json({
      mensaje: "Pedido registrado correctamente.",
      idVenta: venta.insertId,
    });
  } catch (error) {
    await conexion.rollback();
    console.error("Error al registrar la venta:", error.message);
    res
      .status(400)
      .json({ error: error.message || "No se pudo registrar el pedido." });
  } finally {
    conexion.release();
  }
});

// Devuelve los servicios que el cliente puede seleccionar al agendar.
app.get("/api/servicios", async (_req, res) => {
  try {
    const [servicios] = await pool.execute(
      `SELECT id_servicio AS id, nombre, precio
       FROM servicio WHERE estado = 'ACTIVO' ORDER BY nombre`,
    );
    res.json({ servicios });
  } catch (error) {
    console.error("Error al cargar servicios:", error.message);
    res.status(500).json({ error: "No se pudieron cargar los servicios." });
  }
});

// Catálogo público de productos para la tienda, con filtros y ordenamiento.
app.get("/api/productos", async (req, res) => {
  const busqueda = `%${String(req.query.busqueda || "").trim()}%`;
  const categoria = String(req.query.categoria || "todos").toUpperCase();
  const ordenes = {
    "precio-asc": "p.precio ASC",
    "precio-desc": "p.precio DESC",
    nombre: "p.nombre_produ ASC",
    stock: "stock DESC",
    relevancia: "p.id_produ DESC",
  };
  const orden =
    ordenes[String(req.query.orden || "relevancia")] || ordenes.relevancia;
  const categorias = {
    ALIMENTACION: "ALIMENTO",
    HIGIENE: "HIGIENE",
    ACCESORIOS: "ACCESORIOS",
    BIENESTAR: "MEDICAMENTOS",
  };
  const condiciones = [
    "p.estado = 'ACTIVO'",
    "(p.nombre_produ LIKE ? OR p.descripcion_produ LIKE ?)",
  ];
  const parametros = [busqueda, busqueda];
  if (categorias[categoria]) {
    condiciones.push("UPPER(c.nombre_cat) = ?");
    parametros.push(categorias[categoria]);
  }
  const stockSucursal = `COALESCE((SELECT i.stock FROM inventario i
    WHERE i.id_producto = p.id_produ AND i.id_suc = ${SUCURSAL_POR_DEFECTO}), 0)`;
  if (String(req.query.disponibles) === "true")
    condiciones.push(`${stockSucursal} > 0`);
  try {
    const [productos] = await pool.execute(
      `SELECT p.id_produ AS id, p.nombre_produ AS nombre, p.descripcion_produ AS descripcion,
              p.precio, ${stockSucursal} AS stock,
              COALESCE(NULLIF(p.imagen_url, ''), 'salud.avif') AS imagen,
                      CASE WHEN p.imagen IS NOT NULL
                        THEN CONCAT('data:', COALESCE(p.imagen_tipo, 'image/jpeg'), ';base64,', TO_BASE64(p.imagen))
                        ELSE COALESCE(NULLIF(p.imagen_url, ''), 'salud.avif') END AS imagen,
              CASE UPPER(c.nombre_cat) WHEN 'ALIMENTO' THEN 'ALIMENTACION' WHEN 'MEDICAMENTOS' THEN 'BIENESTAR' ELSE UPPER(c.nombre_cat) END AS categoria
       FROM producto p JOIN categoria c ON c.id_cat = p.id_cat
       WHERE ${condiciones.join(" AND ")} ORDER BY ${orden}`,
      parametros,
    );
    res.json({ productos });
  } catch (error) {
    console.error("Error al cargar productos públicos:", error.message);
    res.status(500).json({ error: "No se pudieron cargar los productos." });
  }
});

// Comprueba que una fecha de cita tenga formato válido y sea futura.
function obtenerFechaCita(fecha, hora) {
  if (!/^([01][0-7]):(00|30)$/.test(String(hora || ""))) return null;
  const valor = `${String(fecha || "")}T${String(hora || "")}`;
  const resultado = new Date(valor);
  return Number.isNaN(resultado.getTime()) || resultado <= new Date()
    ? null
    : valor.replace("T", " ");
}

// Convierte la fecha recibida a la clave estable usada por el bloqueo MySQL.
function obtenerClaveHorario(fecha) {
  return `vetsalud-cita-${String(fecha).replace(/[^0-9]/g, "")}`;
}

// Crea una cita para una mascota que pertenece al cliente autenticado.
app.post("/api/citas", async (req, res) => {
  const usuarioToken = obtenerUsuarioDesdeToken(req);
  if (!usuarioToken || usuarioToken.rol !== "CLIENTE") {
    return res
      .status(403)
      .json({ error: "Debes iniciar sesión como cliente." });
  }

  const nombreMascota = String(req.body?.nombreMascota || "").trim();
  const idServicio = Number(req.body?.idServicio);
  const fecha = obtenerFechaCita(req.body?.fecha, req.body?.hora);
  const motivo = String(req.body?.motivo || "").trim();

  if (
    !nombreMascota ||
    !Number.isInteger(idServicio) ||
    !fecha ||
    motivo.length < 10 ||
    motivo.length > 250
  ) {
    return res
      .status(400)
      .json({ error: "Completa los datos de la cita con una fecha futura." });
  }

  try {
    const conexion = await pool.getConnection();
    const claveHorario = obtenerClaveHorario(fecha);
    const [[bloqueo]] = await conexion.query(
      "SELECT GET_LOCK(?, 5) AS bloqueado",
      [claveHorario],
    );
    if (bloqueo.bloqueado !== 1) {
      conexion.release();
      return res.status(503).json({
        error: "No se pudo verificar la disponibilidad. Intenta nuevamente.",
      });
    }

    const [[ocupada]] = await conexion.execute(
      `SELECT id_cita FROM cita WHERE fecha = ? AND estado IN ('PENDIENTE', 'CONFIRMADA') LIMIT 1`,
      [fecha],
    );
    if (ocupada) {
      await conexion.query("SELECT RELEASE_LOCK(?)", [claveHorario]);
      conexion.release();
      return res
        .status(409)
        .json({ error: "Ese horario ya está ocupado. Selecciona otro." });
    }

    const [[mascota]] = await pool.execute(
      `SELECT id_mascota FROM mascota WHERE id_usu = ? AND nombre = ? AND estado = 'ACTIVO' LIMIT 1`,
      [usuarioToken.idUsuario, nombreMascota],
    );
    const [[servicio]] = await pool.execute(
      `SELECT id_servicio, precio FROM servicio WHERE id_servicio = ? AND estado = 'ACTIVO'`,
      [idServicio],
    );
    if (!mascota || !servicio) {
      await conexion.query("SELECT RELEASE_LOCK(?)", [claveHorario]);
      conexion.release();
      return res
        .status(400)
        .json({ error: "La mascota o el servicio seleccionado no es válido." });
    }

    const [[veterinario]] = await pool.execute(
      `SELECT u.id_usu FROM usuario u JOIN rol r ON r.id_rol = u.id_rol
       WHERE UPPER(r.nombre_rol) = 'VETERINARIO' AND u.estado = 'ACTIVO' LIMIT 1`,
    );
    const [resultado] = await pool.execute(
      `INSERT INTO cita (id_veterinario, id_mascota, fecha, motivo, estado)
       VALUES (?, ?, ?, ?, 'PENDIENTE')`,
      [veterinario?.id_usu || null, mascota.id_mascota, fecha, motivo],
    );
    await pool.execute(
      `INSERT INTO detalle_cita (id_cita, id_servicio, cantidad, iva, subtotal)
       VALUES (?, ?, 1, ?, ?)`,
      [
        resultado.insertId,
        idServicio,
        Number(servicio.precio) * 0.19,
        Number(servicio.precio) * 1.19,
      ],
    );
    await conexion.query("SELECT RELEASE_LOCK(?)", [claveHorario]);
    conexion.release();
    res.status(201).json({
      mensaje: "Cita solicitada correctamente.",
      idCita: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al crear cita:", error.message);
    res.status(500).json({ error: "No se pudo solicitar la cita." });
  }
});

// Cambia una cita pendiente o confirmada a estado cancelado.
app.put("/api/citas/:idCita/cancelar", async (req, res) => {
  const usuarioToken = obtenerUsuarioDesdeToken(req);
  const idCita = Number(req.params.idCita);
  if (!usuarioToken || usuarioToken.rol !== "CLIENTE")
    return res.status(403).json({ error: "No tienes permisos." });

  try {
    const [resultado] = await pool.execute(
      `UPDATE cita cit JOIN mascota m ON m.id_mascota = cit.id_mascota
       SET cit.estado = 'CANCELADA'
       WHERE cit.id_cita = ? AND m.id_usu = ? AND cit.estado IN ('PENDIENTE', 'CONFIRMADA')`,
      [idCita, usuarioToken.idUsuario],
    );
    if (!resultado.affectedRows)
      return res
        .status(404)
        .json({ error: "La cita no existe o no se puede cancelar." });
    res.json({ mensaje: "Cita cancelada correctamente." });
  } catch (error) {
    console.error("Error al cancelar cita:", error.message);
    res.status(500).json({ error: "No se pudo cancelar la cita." });
  }
});

// Reprograma una cita pendiente o confirmada sin permitir cambiar su dueño.
app.put("/api/citas/:idCita/reprogramar", async (req, res) => {
  const usuarioToken = obtenerUsuarioDesdeToken(req);
  const idCita = Number(req.params.idCita);
  const fecha = obtenerFechaCita(req.body?.fecha, req.body?.hora);
  if (!usuarioToken || usuarioToken.rol !== "CLIENTE")
    return res.status(403).json({ error: "No tienes permisos." });
  if (!fecha)
    return res
      .status(400)
      .json({ error: "Selecciona una fecha futura válida." });

  try {
    const conexion = await pool.getConnection();
    const claveHorario = obtenerClaveHorario(fecha);
    const [[bloqueo]] = await conexion.query(
      "SELECT GET_LOCK(?, 5) AS bloqueado",
      [claveHorario],
    );
    if (bloqueo.bloqueado !== 1) {
      conexion.release();
      return res.status(503).json({
        error: "No se pudo verificar la disponibilidad. Intenta nuevamente.",
      });
    }
    const [[ocupada]] = await conexion.execute(
      `SELECT id_cita FROM cita WHERE fecha = ? AND estado IN ('PENDIENTE', 'CONFIRMADA') AND id_cita <> ? LIMIT 1`,
      [fecha, idCita],
    );
    if (ocupada) {
      await conexion.query("SELECT RELEASE_LOCK(?)", [claveHorario]);
      conexion.release();
      return res
        .status(409)
        .json({ error: "Ese horario ya está ocupado. Selecciona otro." });
    }

    const [resultado] = await pool.execute(
      `UPDATE cita cit JOIN mascota m ON m.id_mascota = cit.id_mascota
       SET cit.fecha = ?
       WHERE cit.id_cita = ? AND m.id_usu = ? AND cit.estado IN ('PENDIENTE', 'CONFIRMADA')`,
      [fecha, idCita, usuarioToken.idUsuario],
    );
    await conexion.query("SELECT RELEASE_LOCK(?)", [claveHorario]);
    conexion.release();
    if (!resultado.affectedRows)
      return res
        .status(404)
        .json({ error: "La cita no existe o no se puede reprogramar." });
    res.json({ mensaje: "Cita reprogramada correctamente." });
  } catch (error) {
    console.error("Error al reprogramar cita:", error.message);
    res.status(500).json({ error: "No se pudo reprogramar la cita." });
  }
});

// Datos necesarios para mostrar el panel del cliente.
app.get("/api/dashboard/:idCliente", async (req, res) => {
  const usuarioToken = obtenerUsuarioDesdeToken(req);
  const rolUsuario = String(usuarioToken?.rol || "").toUpperCase();
  const esAdministrador = rolUsuario === "ADMIN";
  const idSolicitado = Number(req.params.idCliente);
  const idUsuario = esAdministrador
    ? Number(usuarioToken?.idUsuario)
    : idSolicitado;
  if (
    !usuarioToken ||
    !["CLIENTE", "ADMIN"].includes(rolUsuario) ||
    !Number.isInteger(idUsuario) ||
    idUsuario < 1 ||
    (!esAdministrador && Number(usuarioToken.idUsuario) !== idSolicitado)
  ) {
    return res
      .status(403)
      .json({ error: "No tienes permisos para ver este panel." });
  }

  try {
    const [usuarios] = await pool.execute(
      `SELECT id_usu AS idUsuario, nombre, apellido, correo, telefono,
              tipo_doc AS tipo_documento, num_doc AS documento,
              telefono_secundario, fecha_nacimiento, direccion
       FROM usuario WHERE id_usu = ? AND estado = 'ACTIVO'`,
      [idUsuario],
    );
    if (!usuarios.length)
      return res.status(404).json({ error: "Cliente no encontrado." });

    const [mascotas] = await pool.execute(
      `SELECT id_mascota, nombre, especie, raza, sexo, fecha_nacimiento, estado,
              IF(foto IS NULL, NULL, CONCAT('data:', foto_tipo, ';base64,', TO_BASE64(foto))) AS foto
       FROM mascota WHERE id_usu = ? ORDER BY nombre`,
      [idUsuario],
    );
    const idsMascotas = mascotas.map((mascota) => mascota.id_mascota);
    const placeholders = idsMascotas.map(() => "?").join(",") || "NULL";

    const [citas] = await pool.execute(
      `SELECT cit.id_cita, cit.fecha, cit.motivo, cit.estado,
              m.nombre AS mascota, m.especie, m.raza,
              CONCAT(v.nombre, ' ', v.apellido) AS veterinario,
              GROUP_CONCAT(s.nombre SEPARATOR ', ') AS servicios
       FROM cita cit
       JOIN mascota m ON m.id_mascota = cit.id_mascota
       LEFT JOIN usuario v ON v.id_usu = cit.id_veterinario
       LEFT JOIN detalle_cita dc ON dc.id_cita = cit.id_cita
       LEFT JOIN servicio s ON s.id_servicio = dc.id_servicio
       WHERE cit.id_mascota IN (${placeholders})
       GROUP BY cit.id_cita ORDER BY cit.fecha DESC`,
      idsMascotas,
    );
    const [historias] = await pool.execute(
      `SELECT h.*, m.nombre AS mascota, m.especie,
              COALESCE((SELECT CONCAT(v.nombre, ' ', v.apellido)
                        FROM cita c JOIN usuario v ON v.id_usu = c.id_veterinario
                        WHERE c.id_mascota = h.id_mascota
                        ORDER BY ABS(TIMESTAMPDIFF(SECOND, c.fecha, h.fecha)) LIMIT 1),
                       'Equipo veterinario') AS veterinario,
              (SELECT GROUP_CONCAT(CONCAT(COALESCE(p.nombre_produ, 'Tratamiento'),
                                          IF(t.dosis IS NULL, '', CONCAT(' - ', t.dosis))) SEPARATOR ', ')
               FROM tratamiento t LEFT JOIN producto p ON p.id_produ = t.id_producto
               WHERE t.id_historia_clinica = h.id_historia_clinica) AS tratamientos,
              (SELECT GROUP_CONCAT(CONCAT(vac.nombre_vacuna, ' (', vac.fecha_aplicacion, ')') SEPARATOR ', ')
               FROM vacunacion vac WHERE vac.id_mascota = h.id_mascota
                 AND vac.fecha_aplicacion <= DATE(h.fecha)) AS vacunas
       FROM historia_clinica h JOIN mascota m ON m.id_mascota = h.id_mascota
       WHERE h.id_mascota IN (${placeholders}) ORDER BY h.fecha DESC`,
      idsMascotas,
    );
    const [compras] = await pool.execute(
      `SELECT v.id_venta, v.fecha, v.metodo_pago, v.estado,
        COALESCE(SUM(dv.subtotal), 0) AS total,
        GROUP_CONCAT(CONCAT(p.nombre_produ, ' x', dv.cantidad) SEPARATOR ', ') AS productos
       FROM venta v LEFT JOIN detalle_venta dv ON dv.id_venta = v.id_venta
      LEFT JOIN producto p ON p.id_produ = dv.id_producto
       WHERE v.id_usu = ? GROUP BY v.id_venta ORDER BY v.fecha DESC`,
      [idUsuario],
    );

    res.json({ cliente: usuarios[0], mascotas, citas, historias, compras });
  } catch (error) {
    console.error("Error al cargar el dashboard:", error.message);
    res.status(500).json({ error: "No se pudo cargar el panel del cliente." });
  }
});

// Actualiza los datos personales del cliente autenticado.
app.put("/api/cliente", async (req, res) => {
  const usuarioToken = obtenerUsuarioDesdeToken(req);
  if (!usuarioToken || usuarioToken.rol !== "CLIENTE") {
    return res
      .status(403)
      .json({ error: "Debes iniciar sesión como cliente." });
  }

  const nombre = String(req.body?.nombre || "").trim();
  const apellido = String(req.body?.apellido || "").trim();
  const correo = String(req.body?.correo || "")
    .trim()
    .toLowerCase();
  const tipoDocumento = String(req.body?.tipoDocumento || "").trim();
  const documento = String(req.body?.documento || "").trim();
  const telefono1 = String(req.body?.telefono1 || "").trim();
  const telefono2 = String(req.body?.telefono2 || "").trim() || null;
  const direccion = String(req.body?.direccion || "").trim() || null;
  const fechaNacimiento = req.body?.fechaNacimiento || null;
  const tiposDocumento = ["CC", "TI", "PAS"];
  const nombreValido =
    /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñÜü])[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{2,100}$/.test(nombre);
  const apellidoValido =
    /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñÜü])[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{2,100}$/.test(
      apellido,
    );
  const direccionValida =
    !direccion || /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9 #.,°\-]{1,180}$/.test(direccion);
  const fechaValida =
    !fechaNacimiento ||
    (!Number.isNaN(Date.parse(fechaNacimiento)) &&
      new Date(`${fechaNacimiento}T00:00:00`) <= new Date());

  if (
    !nombreValido ||
    !apellidoValido ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
    !tiposDocumento.includes(tipoDocumento) ||
    !/^\d{5,20}$/.test(documento) ||
    !/^\d{7,20}$/.test(telefono1) ||
    (telefono2 && !/^\d{7,20}$/.test(telefono2)) ||
    !direccionValida ||
    correo.length > 120 ||
    !fechaValida
  ) {
    return res
      .status(400)
      .json({ error: "Revisa los datos del perfil e intenta nuevamente." });
  }

  try {
    await pool.execute(
      `UPDATE usuario SET nombre = ?, apellido = ?, correo = ?, tipo_doc = ?, num_doc = ?,
              telefono = ?, telefono_secundario = ?, fecha_nacimiento = ?, direccion = ?
       WHERE id_usu = ? AND estado = 'ACTIVO'`,
      [
        nombre,
        apellido,
        correo,
        tipoDocumento,
        documento,
        telefono1,
        telefono2,
        fechaNacimiento,
        direccion,
        usuarioToken.idUsuario,
      ],
    );
    res.json({ mensaje: "Perfil actualizado correctamente." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "El número de documento ya está registrado." });
    }
    console.error("Error al actualizar perfil:", error.message);
    res.status(500).json({ error: "No se pudo actualizar el perfil." });
  }
});

// Cambia la contraseña después de verificar la contraseña actual.
app.put("/api/perfil/password", async (req, res) => {
  const usuarioToken = obtenerUsuarioDesdeToken(req);
  if (!usuarioToken || usuarioToken.rol !== "CLIENTE") {
    return res
      .status(403)
      .json({ error: "Debes iniciar sesión como cliente." });
  }

  const passwordActual = String(req.body?.passwordActual || "");
  const passwordNueva = String(req.body?.passwordNueva || "");
  if (
    !passwordActual ||
    passwordNueva.length < 8 ||
    passwordNueva.length > 100 ||
    !/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(passwordNueva)
  ) {
    return res.status(400).json({
      error:
        "La contraseña debe tener entre 8 y 100 caracteres, una mayúscula, una minúscula y un número.",
    });
  }

  try {
    const [[usuario]] = await pool.execute(
      `SELECT password_hash AS passwordHash FROM usuario
       WHERE id_usu = ? AND estado = 'ACTIVO'`,
      [usuarioToken.idUsuario],
    );
    if (!usuario || !verificarPassword(passwordActual, usuario.passwordHash)) {
      return res
        .status(401)
        .json({ error: "La contraseña actual no es correcta." });
    }

    await pool.execute(
      "UPDATE usuario SET password_hash = ? WHERE id_usu = ? AND estado = 'ACTIVO'",
      [crearHashPassword(passwordNueva), usuarioToken.idUsuario],
    );
    res.json({ mensaje: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error.message);
    res.status(500).json({ error: "No se pudo actualizar la contraseña." });
  }
});

// Resumen general que alimenta los indicadores del panel administrativo.
app.get("/api/admin/resumen", async (req, res) => {
  if (!obtenerAdministrador(req, res)) return;
  try {
    const [[indicadores]] = await pool.execute(`SELECT
        (SELECT COUNT(*) FROM usuario WHERE estado = 'ACTIVO') AS usuarios,
        (SELECT COUNT(*) FROM usuario u JOIN rol r ON r.id_rol = u.id_rol WHERE UPPER(r.nombre_rol) = 'CLIENTE' AND u.estado = 'ACTIVO') AS clientes,
        (SELECT COUNT(*) FROM mascota WHERE estado = 'ACTIVO') AS mascotas,
        (SELECT COUNT(*) FROM producto WHERE estado = 'ACTIVO') AS productos,
        (SELECT COALESCE(SUM(i.stock), 0) FROM inventario i JOIN producto p ON p.id_produ = i.id_producto WHERE p.estado = 'ACTIVO') AS unidadesDisponibles,
        (SELECT COUNT(*) FROM cita WHERE estado = 'PENDIENTE') AS citasPendientes,
        (SELECT COUNT(*) FROM cita WHERE DATE(fecha) = CURDATE() AND estado IN ('PENDIENTE', 'CONFIRMADA')) AS citasHoy,
        (SELECT COUNT(*) FROM venta) AS pedidos,
        (SELECT COALESCE(SUM(dv.subtotal), 0) FROM venta v JOIN detalle_venta dv ON dv.id_venta = v.id_venta WHERE v.estado = 'PAGADA') AS ingresos`);
    res.json({ indicadores });
  } catch (error) {
    console.error("Error en resumen administrativo:", error.message);
    res
      .status(500)
      .json({ error: "No se pudo cargar el resumen administrativo." });
  }
});

// Gestión de usuarios y roles
app.get("/api/admin/usuarios", async (req, res) => {
  if (!obtenerAdministrador(req, res)) return;
  try {
    const [usuarios] = await pool.execute(`
      SELECT u.id_usu AS id, u.nombre, u.apellido, u.correo, u.telefono,
             u.estado, r.id_rol AS idRol, r.nombre_rol AS rol
      FROM usuario u LEFT JOIN rol r ON r.id_rol = u.id_rol ORDER BY u.id_usu DESC`);
    const [roles] = await pool.execute(
      "SELECT id_rol AS id, nombre_rol AS nombre FROM rol WHERE estado = 'activo' ORDER BY id_rol",
    );
    res.json({ usuarios, roles });
  } catch (error) {
    console.error("Error al cargar usuarios administrativos:", error.message);
    res.status(500).json({ error: "No se pudieron cargar los usuarios." });
  }
});

// Cambia el rol de un usuario sin permitir que el administrador se bloquee a sí mismo.
app.put("/api/admin/usuarios/:id/rol", async (req, res) => {
  const administrador = obtenerAdministrador(req, res);
  if (!administrador) return;
  const idUsuario = Number(req.params.id);
  const idRol = Number(req.body?.idRol);
  if (!Number.isInteger(idUsuario) || !Number.isInteger(idRol))
    return res.status(400).json({ error: "Usuario o rol inválido." });
  if (idUsuario === Number(administrador.idUsuario))
    return res.status(400).json({ error: "No puedes cambiar tu propio rol." });
  try {
    const [[usuario]] = await pool.execute(
      "SELECT id_usu FROM usuario WHERE id_usu = ?",
      [idUsuario],
    );
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado." });

    await pool.execute("UPDATE usuario SET id_rol = ? WHERE id_usu = ?", [
      idRol,
      idUsuario,
    ]);
    res.json({ mensaje: "Rol actualizado correctamente." });
  } catch (error) {
    console.error("Error al cambiar rol:", error.message);
    res.status(500).json({ error: "No se pudo cambiar el rol." });
  }
});

// Cambia el estado de un usuario sin permitir que el administrador se desactive a sí mismo.
app.put("/api/admin/usuarios/:id/estado", async (req, res) => {
  const administrador = obtenerAdministrador(req, res);
  if (!administrador) return;
  const idUsuario = Number(req.params.id);
  const estado = String(req.body?.estado || "").toUpperCase();
  if (
    !Number.isInteger(idUsuario) ||
    !["ACTIVO", "INACTIVO"].includes(estado)
  ) {
    return res.status(400).json({ error: "Estado de usuario inválido." });
  }
  if (idUsuario === Number(administrador.idUsuario) && estado === "INACTIVO") {
    return res
      .status(400)
      .json({ error: "No puedes desactivar tu propia cuenta." });
  }
  try {
    const [[usuario]] = await pool.execute(
      "SELECT id_usu FROM usuario WHERE id_usu = ?",
      [idUsuario],
    );
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado." });

    await pool.execute("UPDATE usuario SET estado = ? WHERE id_usu = ?", [
      estado,
      idUsuario,
    ]);
    res.json({ mensaje: "Estado de usuario actualizado correctamente." });
  } catch (error) {
    console.error("Error al cambiar estado de usuario:", error.message);
    res
      .status(500)
      .json({ error: "No se pudo cambiar el estado del usuario." });
  }
});

// Gestión de mascotas

// Lista todas las mascotas y su propietario.
app.get("/api/admin/mascotas", async (req, res) => {
  if (!obtenerAdministrador(req, res)) return;
  try {
    const [mascotas] = await pool.execute(`
      SELECT m.id_mascota AS id, m.nombre, m.especie, m.raza, m.sexo, m.estado,
             CONCAT(u.nombre, ' ', u.apellido) AS propietario, u.correo
      FROM mascota m JOIN usuario u ON u.id_usu = m.id_usu ORDER BY m.id_mascota DESC`);
    res.json({ mascotas });
  } catch (error) {
    console.error("Error al cargar mascotas administrativas:", error.message);
    res.status(500).json({ error: "No se pudieron cargar las mascotas." });
  }
});

// Cambia el estado de una mascota desde el panel administrativo.
app.put("/api/admin/mascotas/:id/estado", async (req, res) => {
  if (!obtenerAdministrador(req, res)) return;
  const idMascota = Number(req.params.id);
  const estado = String(req.body?.estado || "").toUpperCase();
  if (
    !Number.isInteger(idMascota) ||
    !["ACTIVO", "INACTIVO"].includes(estado)
  ) {
    return res.status(400).json({ error: "Estado de mascota inválido." });
  }
  try {
    const [[mascota]] = await pool.execute(
      "SELECT id_mascota FROM mascota WHERE id_mascota = ?",
      [idMascota],
    );
    if (!mascota)
      return res.status(404).json({ error: "Mascota no encontrada." });

    await pool.execute("UPDATE mascota SET estado = ? WHERE id_mascota = ?", [
      estado,
      idMascota,
    ]);
    res.json({ mensaje: "Estado de mascota actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar mascota:", error.message);
    res.status(500).json({ error: "No se pudo actualizar la mascota." });
  }
});

// Gestión de citas

// Lista todas las citas con cliente, mascota y servicio.
app.get("/api/admin/citas", async (req, res) => {
  if (!obtenerAdministrador(req, res)) return;
  try {
    const [citas] = await pool.execute(`
      SELECT cit.id_cita, cit.fecha, cit.motivo, cit.estado,
             CONCAT(u.nombre, ' ', u.apellido) AS cliente, m.nombre AS mascota,
             GROUP_CONCAT(s.nombre SEPARATOR ', ') AS servicios
      FROM cita cit JOIN mascota m ON m.id_mascota = cit.id_mascota
      JOIN usuario u ON u.id_usu = m.id_usu
      LEFT JOIN detalle_cita dc ON dc.id_cita = cit.id_cita
      LEFT JOIN servicio s ON s.id_servicio = dc.id_servicio
      GROUP BY cit.id_cita ORDER BY cit.fecha DESC`);
    res.json({ citas });
  } catch (error) {
    console.error("Error al cargar citas administrativas:", error.message);
    res.status(500).json({ error: "No se pudieron cargar las citas." });
  }
});

// Permite al administrador actualizar el estado de una cita.
app.put("/api/admin/citas/:id/estado", async (req, res) => {
  if (!obtenerAdministrador(req, res)) return;
  const idCita = Number(req.params.id);
  const estados = ["PENDIENTE", "CONFIRMADA", "ATENDIDA", "CANCELADA"];
  const estado = String(req.body?.estado || "").toUpperCase();
  if (!Number.isInteger(idCita) || !estados.includes(estado))
    return res.status(400).json({ error: "Estado de cita inválido." });
  try {
    const [[cita]] = await pool.execute(
      "SELECT id_cita FROM cita WHERE id_cita = ?",
      [idCita],
    );
    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });

    await pool.execute("UPDATE cita SET estado = ? WHERE id_cita = ?", [
      estado,
      idCita,
    ]);
    res.json({ mensaje: "Estado de cita actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar cita:", error.message);
    res.status(500).json({ error: "No se pudo actualizar la cita." });
  }
});

// Inventario y productos

// Lista el inventario completo, incluyendo categoría y marca.
app.get("/api/admin/productos", async (req, res) => {
  if (!obtenerAdministrador(req, res)) return;
  try {
    const [productos] = await pool.execute(`
            SELECT p.id_produ AS id, p.nombre_produ AS nombre, p.precio,
              COALESCE((SELECT SUM(i.stock) FROM inventario i WHERE i.id_producto = p.id_produ), 0) AS stock,
              p.estado,
             c.nombre_cat AS categoria, m.nombre_marca AS marca
      FROM producto p JOIN categoria c ON c.id_cat = p.id_cat
      JOIN marca m ON m.id_marca = p.id_marca ORDER BY p.nombre_produ`);
    const [categorias] = await pool.execute(
      "SELECT id_cat AS id, nombre_cat AS nombre FROM categoria WHERE estado_cat = 'activo' ORDER BY nombre_cat",
    );
    const [marcas] = await pool.execute(
      "SELECT id_marca AS id, nombre_marca AS nombre FROM marca WHERE estado = 'activo' ORDER BY nombre_marca",
    );
    res.json({ productos, categorias, marcas });
  } catch (error) {
    console.error("Error al cargar productos administrativos:", error.message);
    res.status(500).json({ error: "No se pudieron cargar los productos." });
  }
});

// Crea un producto nuevo desde el panel administrativo.
app.post("/api/admin/productos", async (req, res) => {
  if (!obtenerAdministrador(req, res)) return;
  const nombre = String(req.body?.nombre || "").trim();
  const descripcion = String(req.body?.descripcion || "").trim();
  const idCategoria = Number(req.body?.idCategoria);
  const idMarca = Number(req.body?.idMarca);
  const precio = Number(req.body?.precio);
  const stock = Number(req.body?.stock);
  const talla = req.body?.talla ? String(req.body.talla).toUpperCase() : null;
  const imagenUrl = String(req.body?.imagenUrl || "").trim() || null;
  const imagen = String(req.body?.imagen || "");
  let imagenBuffer = null;
  let imagenTipo = null;
  if (imagen) {
    const coincidencia = imagen.match(
      /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/,
    );
    if (!coincidencia) {
      return res
        .status(400)
        .json({ error: "La imagen debe ser JPG, PNG o WEBP." });
    }
    imagenTipo = coincidencia[1];
    imagenBuffer = Buffer.from(coincidencia[2], "base64");
    if (imagenBuffer.length > 5 * 1024 * 1024) {
      return res
        .status(400)
        .json({ error: "La imagen no puede superar los 5 MB." });
    }
  }
  if (
    !nombre ||
    nombre.length > 20 ||
    !descripcion ||
    descripcion.length > 100 ||
    !Number.isInteger(idCategoria) ||
    !Number.isInteger(idMarca) ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    (talla && !["XS", "S", "M", "L", "XL"].includes(talla))
  ) {
    return res.status(400).json({ error: "Revisa los datos del producto." });
  }
  try {
    const conexion = await pool.getConnection();
    const [resultado] = await conexion.execute(
      `INSERT INTO producto (id_cat, id_marca, nombre_produ, descripcion_produ, precio, talla, imagen, imagen_tipo, imagen_url, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO')`,
      [
        idCategoria,
        idMarca,
        nombre,
        descripcion,
        precio,
        talla,
        imagenBuffer,
        imagenTipo,
        imagenUrl,
      ],
    );
    await conexion.execute(
      "INSERT INTO inventario (id_suc, id_producto, stock) VALUES (?, ?, ?)",
      [SUCURSAL_POR_DEFECTO, resultado.insertId, stock],
    );
    conexion.release();
    res.status(201).json({
      mensaje: "Producto creado correctamente.",
      idProducto: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    res.status(500).json({ error: "No se pudo crear el producto." });
  }
});

// Actualiza precio, stock o disponibilidad de un producto desde administración.
app.put("/api/admin/productos/:id", async (req, res) => {
  if (!obtenerAdministrador(req, res)) return;
  const idProducto = Number(req.params.id);
  const precio = Number(req.body?.precio);
  const stock = Number(req.body?.stock);
  const estado = String(req.body?.estado || "").toUpperCase();
  if (
    !Number.isInteger(idProducto) ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    !["ACTIVO", "INACTIVO"].includes(estado)
  ) {
    return res.status(400).json({ error: "Precio, stock o estado inválido." });
  }
  try {
    const [[producto]] = await pool.execute(
      "SELECT id_produ FROM producto WHERE id_produ = ?",
      [idProducto],
    );
    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado." });

    const conexion = await pool.getConnection();
    await conexion.beginTransaction();
    await conexion.execute(
      "UPDATE producto SET precio = ?, estado = ? WHERE id_produ = ?",
      [precio, estado, idProducto],
    );
    await conexion.execute(
      `INSERT INTO inventario (id_suc, id_producto, stock) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE stock = VALUES(stock)`,
      [SUCURSAL_POR_DEFECTO, idProducto, stock],
    );
    await conexion.commit();
    conexion.release();
    res.json({ mensaje: "Producto actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);
    res.status(500).json({ error: "No se pudo actualizar el producto." });
  }
});

// Gestión de pedidos y ventas

// Lista pedidos con el detalle de productos para preparar y controlar compras.
app.get("/api/admin/ventas", async (req, res) => {
  if (!obtenerAdministrador(req, res)) return;
  try {
    const [ventas] = await pool.execute(`
      SELECT v.id_venta, v.fecha, v.metodo_pago, v.estado,
             CONCAT(u.nombre, ' ', u.apellido) AS cliente,
             COALESCE(SUM(dv.subtotal), 0) AS total,
             GROUP_CONCAT(CONCAT(p.nombre_produ, ' x', dv.cantidad) SEPARATOR ', ') AS productos
      FROM venta v JOIN usuario u ON u.id_usu = v.id_usu
      LEFT JOIN detalle_venta dv ON dv.id_venta = v.id_venta
      LEFT JOIN producto p ON p.id_produ = dv.id_producto
      GROUP BY v.id_venta ORDER BY v.fecha DESC`);
    res.json({ ventas });
  } catch (error) {
    console.error("Error al cargar pedidos administrativos:", error.message);
    res.status(500).json({ error: "No se pudieron cargar los pedidos." });
  }
});

// Cambia el estado de un pedido / venta desde el panel administrativo.
app.put("/api/admin/ventas/:id/estado", async (req, res) => {
  if (!obtenerAdministrador(req, res)) return;
  const idVenta = Number(req.params.id);
  const estado = String(req.body?.estado || "").toUpperCase();
  if (!Number.isInteger(idVenta) || !["PAGADA", "ANULADA"].includes(estado)) {
    return res.status(400).json({ error: "Estado de pedido inválido." });
  }
  try {
    const [[venta]] = await pool.execute(
      "SELECT id_venta FROM venta WHERE id_venta = ?",
      [idVenta],
    );
    if (!venta) return res.status(404).json({ error: "Pedido no encontrado." });

    await pool.execute("UPDATE venta SET estado = ? WHERE id_venta = ?", [
      estado,
      idVenta,
    ]);
    res.json({ mensaje: "Estado de pedido actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar pedido:", error.message);
    res.status(500).json({ error: "No se pudo actualizar el pedido." });
  }
});

// Registra una mascota perteneciente al usuario autenticado.
app.post("/api/mascotas", async (req, res) => {
  const usuarioToken = obtenerUsuarioDesdeToken(req);
  if (
    !usuarioToken ||
    !["CLIENTE", "ADMIN"].includes(String(usuarioToken.rol || "").toUpperCase())
  ) {
    return res
      .status(403)
      .json({ error: "Debes iniciar sesión como cliente o administrador." });
  }

  const nombre = String(req.body?.nombre || "").trim();
  const especie = String(req.body?.especie || "").trim();
  const raza = String(req.body?.raza || "Mestizo").trim();
  const sexo = String(req.body?.sexo || "").toUpperCase();
  const fechaNacimiento = req.body?.fechaNacimiento || null;
  const foto = String(req.body?.foto || "");
  const fotoTipo = String(req.body?.fotoTipo || "");
  const especiesValidas = [
    "Perro",
    "Gato",
    "Ave",
    "Conejo",
    "Hamster",
    "Pez",
    "Reptil",
    "Otro",
  ];

  if (
    !nombre ||
    nombre.length > 50 ||
    !especiesValidas.includes(especie) ||
    !raza ||
    raza.length > 80 ||
    !["M", "F"].includes(sexo)
  ) {
    return res
      .status(400)
      .json({ error: "Completa correctamente los datos de la mascota." });
  }
  if (fechaNacimiento && Number.isNaN(Date.parse(fechaNacimiento))) {
    return res
      .status(400)
      .json({ error: "La fecha de nacimiento no es válida." });
  }

  let fotoBuffer = null;
  if (foto) {
    const coincidencia = foto.match(
      /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/,
    );
    if (!coincidencia || (fotoTipo && fotoTipo !== coincidencia[1])) {
      return res
        .status(400)
        .json({ error: "La foto debe ser JPG, PNG o WEBP." });
    }
    fotoBuffer = Buffer.from(coincidencia[2], "base64");
    if (fotoBuffer.length > 2 * 1024 * 1024) {
      return res
        .status(400)
        .json({ error: "La foto no puede superar los 2 MB." });
    }
  }

  try {
    const [resultado] = await pool.execute(
      `INSERT INTO mascota (id_usu, nombre, especie, raza, sexo, fecha_nacimiento, foto, foto_tipo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioToken.idUsuario,
        nombre,
        especie,
        raza,
        sexo,
        fechaNacimiento,
        fotoBuffer,
        fotoBuffer ? fotoTipo || "image/jpeg" : null,
      ],
    );
    res.status(201).json({
      mensaje: "Mascota registrada correctamente.",
      idMascota: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al registrar mascota:", error.message);
    res.status(500).json({ error: "No se pudo registrar la mascota." });
  }
});

// Endpoints del panel veterinario

// Métricas e indicadores clínicos principales
app.get("/api/veterinario/resumen", async (req, res) => {
  const veterinario = obtenerVeterinario(req, res);
  if (!veterinario) return;

  try {
    const [[metricas]] = await pool.execute(`SELECT
      (SELECT COUNT(*) FROM mascota WHERE estado = 'ACTIVO') AS totalPacientes,
      (SELECT COUNT(*) FROM cita WHERE estado IN ('ATENDIDA', 'CONFIRMADA', 'PENDIENTE')) AS totalConsultas,
      (SELECT COUNT(*) FROM tratamiento) AS totalTratamientos,
      (SELECT COUNT(*) FROM historia_clinica WHERE estado = 'ACTIVO') AS totalHistorias,
      (SELECT COUNT(*) FROM cita WHERE DATE(fecha) = CURDATE() AND estado IN ('PENDIENTE', 'CONFIRMADA')) AS consultasHoy`);

    res.json({ resumen: metricas });
  } catch (error) {
    console.error("Error en resumen veterinario:", error.message);
    res.status(500).json({ error: "No se pudo cargar el resumen clínico." });
  }
});

// Lista consultas clínicas con información del paciente y servicios
app.get("/api/veterinario/consultas", async (req, res) => {
  const veterinario = obtenerVeterinario(req, res);
  if (!veterinario) return;

  try {
    const [consultas] = await pool.execute(`
      SELECT cit.id_cita, cit.fecha, cit.motivo, cit.estado,
             cit.id_veterinario, cit.id_mascota,
             m.nombre AS mascota, m.especie, m.raza, m.sexo,
             CONCAT(u.nombre, ' ', u.apellido) AS cliente,
             u.telefono, u.correo,
             GROUP_CONCAT(s.nombre SEPARATOR ', ') AS servicios
      FROM cita cit
      JOIN mascota m ON m.id_mascota = cit.id_mascota
      JOIN usuario u ON u.id_usu = m.id_usu
      LEFT JOIN detalle_cita dc ON dc.id_cita = cit.id_cita
      LEFT JOIN servicio s ON s.id_servicio = dc.id_servicio
      GROUP BY cit.id_cita
      ORDER BY cit.fecha DESC`);

    res.json({ consultas });
  } catch (error) {
    console.error("Error al cargar consultas clínicas:", error.message);
    res.status(500).json({ error: "No se pudieron cargar las consultas." });
  }
});

// Actualiza el estado de una cita médica
app.put("/api/veterinario/citas/:id/estado", async (req, res) => {
  const veterinario = obtenerVeterinario(req, res);
  if (!veterinario) return;

  const idCita = Number(req.params.id);
  const estados = ["PENDIENTE", "CONFIRMADA", "ATENDIDA", "CANCELADA"];
  const estado = String(req.body?.estado || "").toUpperCase();

  if (!Number.isInteger(idCita) || !estados.includes(estado)) {
    return res.status(400).json({ error: "Estado de consulta inválido." });
  }

  try {
    const [[cita]] = await pool.execute(
      "SELECT id_cita FROM cita WHERE id_cita = ?",
      [idCita],
    );
    if (!cita) {
      return res.status(404).json({ error: "Consulta no encontrada." });
    }

    await pool.execute(
      "UPDATE cita SET estado = ?, id_veterinario = COALESCE(id_veterinario, ?) WHERE id_cita = ?",
      [estado, veterinario.idUsuario, idCita],
    );

    res.json({ mensaje: "Estado de la consulta actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar estado de consulta:", error.message);
    res.status(500).json({ error: "No se pudo actualizar el estado." });
  }
});

// Registra una nueva consulta o atención veterinaria
app.post("/api/veterinario/citas", async (req, res) => {
  const veterinario = obtenerVeterinario(req, res);
  if (!veterinario) return;

  const idMascota = Number(req.body?.idMascota);
  const idServicio = Number(req.body?.idServicio || 1);
  const motivo = String(req.body?.motivo || "").trim();
  const fecha = req.body?.fecha;
  const estado = String(req.body?.estado || "CONFIRMADA").toUpperCase();

  if (!Number.isInteger(idMascota) || !motivo || !fecha) {
    return res.status(400).json({ error: "Datos de la consulta incompletos." });
  }

  try {
    const [[mascota]] = await pool.execute(
      "SELECT id_mascota FROM mascota WHERE id_mascota = ?",
      [idMascota],
    );
    if (!mascota) {
      return res.status(404).json({ error: "Mascota no encontrada." });
    }

    const [resultado] = await pool.execute(
      `INSERT INTO cita (id_veterinario, id_mascota, fecha, motivo, estado)
       VALUES (?, ?, ?, ?, ?)`,
      [veterinario.idUsuario, idMascota, fecha, motivo, estado],
    );

    const [[servicio]] = await pool.execute(
      "SELECT id_servicio, precio FROM servicio WHERE id_servicio = ?",
      [idServicio],
    );
    if (servicio) {
      await pool.execute(
        `INSERT INTO detalle_cita (id_cita, id_servicio, cantidad, iva, subtotal)
         VALUES (?, ?, 1, ?, ?)`,
        [
          resultado.insertId,
          idServicio,
          Number(servicio.precio) * 0.19,
          Number(servicio.precio) * 1.19,
        ],
      );
    }

    res.status(201).json({
      mensaje: "Consulta registrada correctamente.",
      idCita: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al registrar consulta clínica:", error.message);
    res.status(500).json({ error: "No se pudo registrar la consulta." });
  }
});

// Búsqueda de pacientes con historial médico, vacunas y citas
app.get("/api/veterinario/pacientes", async (req, res) => {
  const veterinario = obtenerVeterinario(req, res);
  if (!veterinario) return;

  const busqueda = String(req.query?.q || "").trim();
  const idMascota = Number(req.query?.id || 0);

  try {
    let sql = `
      SELECT m.id_mascota AS id, m.nombre, m.especie, m.raza, m.sexo, m.fecha_nacimiento, m.estado,
             u.id_usu AS idDueno, CONCAT(u.nombre, ' ', u.apellido) AS propietario,
             u.telefono, u.correo, u.tipo_doc, u.num_doc, u.direccion
      FROM mascota m
      JOIN usuario u ON u.id_usu = m.id_usu`;
    const params = [];

    if (idMascota) {
      sql += ` WHERE m.id_mascota = ?`;
      params.push(idMascota);
    } else if (busqueda) {
      sql += ` WHERE m.nombre LIKE ? OR m.raza LIKE ? OR m.especie LIKE ?
               OR u.nombre LIKE ? OR u.apellido LIKE ? OR u.num_doc LIKE ?`;
      const termino = `%${busqueda}%`;
      params.push(termino, termino, termino, termino, termino, termino);
    }

    sql += ` ORDER BY m.nombre ASC LIMIT 50`;

    const [pacientes] = await pool.execute(sql, params);

    if (idMascota && pacientes.length > 0) {
      const [historias] = await pool.execute(
        `SELECT h.*,
                (SELECT GROUP_CONCAT(CONCAT(COALESCE(p.nombre_produ, 'Tratamiento'),
                                            IF(t.dosis IS NULL, '', CONCAT(' - ', t.dosis)),
                                            IF(t.duracion IS NULL, '', CONCAT(' (', t.duracion, ')'))) SEPARATOR '; ')
                 FROM tratamiento t LEFT JOIN producto p ON p.id_produ = t.id_producto
                 WHERE t.id_historia_clinica = h.id_historia_clinica) AS tratamientos
         FROM historia_clinica h
         WHERE h.id_mascota = ?
         ORDER BY h.fecha DESC`,
        [idMascota],
      );

      const [vacunas] = await pool.execute(
        "SELECT * FROM vacunacion WHERE id_mascota = ? ORDER BY fecha_aplicacion DESC",
        [idMascota],
      );

      const [citas] = await pool.execute(
        "SELECT * FROM cita WHERE id_mascota = ? ORDER BY fecha DESC",
        [idMascota],
      );

      return res.json({
        paciente: pacientes[0],
        historias,
        vacunas,
        citas,
      });
    }

    res.json({ pacientes });
  } catch (error) {
    console.error("Error al buscar pacientes:", error.message);
    res.status(500).json({ error: "No se pudieron buscar los pacientes." });
  }
});

// Listado de historias clínicas registradas
app.get("/api/veterinario/historias", async (req, res) => {
  const veterinario = obtenerVeterinario(req, res);
  if (!veterinario) return;

  try {
    const [historias] = await pool.execute(`
      SELECT h.id_historia_clinica AS id, h.fecha, h.sintomas, h.diagnostico, h.prox_visita, h.estado,
             m.id_mascota AS idMascota, m.nombre AS mascota, m.especie, m.raza,
             CONCAT(u.nombre, ' ', u.apellido) AS propietario,
             (SELECT GROUP_CONCAT(CONCAT(COALESCE(p.nombre_produ, 'Tratamiento'),
                                         IF(t.dosis IS NULL, '', CONCAT(' - ', t.dosis)),
                                         IF(t.duracion IS NULL, '', CONCAT(' (', t.duracion, ')'))) SEPARATOR '; ')
              FROM tratamiento t LEFT JOIN producto p ON p.id_produ = t.id_producto
              WHERE t.id_historia_clinica = h.id_historia_clinica) AS tratamientos
      FROM historia_clinica h
      JOIN mascota m ON m.id_mascota = h.id_mascota
      JOIN usuario u ON u.id_usu = m.id_usu
      ORDER BY h.fecha DESC`);

    res.json({ historias });
  } catch (error) {
    console.error("Error al cargar historias clínicas:", error.message);
    res
      .status(500)
      .json({ error: "No se pudieron cargar las historias clínicas." });
  }
});

// Registra una nueva historia clínica con tratamiento opcional
app.post("/api/veterinario/historias", async (req, res) => {
  const veterinario = obtenerVeterinario(req, res);
  if (!veterinario) return;

  const idMascota = Number(req.body?.idMascota);
  const sintomas = String(req.body?.sintomas || "").trim();
  const diagnostico = String(req.body?.diagnostico || "").trim();
  const proxVisita = req.body?.proxVisita || null;
  const idProducto = req.body?.idProducto ? Number(req.body.idProducto) : null;
  const dosis = String(req.body?.dosis || "").trim() || null;
  const duracion = String(req.body?.duracion || "").trim() || null;

  if (!Number.isInteger(idMascota) || !sintomas || !diagnostico) {
    return res
      .status(400)
      .json({ error: "Completa la mascota, síntomas y diagnóstico." });
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [resultado] = await conexion.execute(
      `INSERT INTO historia_clinica (id_mascota, fecha, sintomas, diagnostico, prox_visita, estado)
       VALUES (?, NOW(), ?, ?, ?, 'ACTIVO')`,
      [idMascota, sintomas, diagnostico, proxVisita],
    );

    const idHistoria = resultado.insertId;

    if (idProducto || dosis || duracion) {
      await conexion.execute(
        `INSERT INTO tratamiento (id_historia_clinica, id_producto, dosis, duracion, fecha)
         VALUES (?, ?, ?, ?, NOW())`,
        [idHistoria, idProducto, dosis, duracion],
      );
    }

    await conexion.commit();
    conexion.release();

    res.status(201).json({
      mensaje: "Historia clínica registrada correctamente.",
      idHistoria,
    });
  } catch (error) {
    await conexion.rollback();
    conexion.release();
    console.error("Error al registrar historia clínica:", error.message);
    res
      .status(500)
      .json({ error: "No se pudo registrar la historia clínica." });
  }
});

// Modifica una historia clínica existente
app.put("/api/veterinario/historias/:id", async (req, res) => {
  const veterinario = obtenerVeterinario(req, res);
  if (!veterinario) return;

  const idHistoria = Number(req.params.id);
  const sintomas = String(req.body?.sintomas || "").trim();
  const diagnostico = String(req.body?.diagnostico || "").trim();
  const proxVisita = req.body?.proxVisita || null;
  const estado = String(req.body?.estado || "ACTIVO").toUpperCase();

  if (
    !Number.isInteger(idHistoria) ||
    !sintomas ||
    !diagnostico ||
    !["ACTIVO", "INACTIVO"].includes(estado)
  ) {
    return res
      .status(400)
      .json({ error: "Datos de historia clínica inválidos." });
  }

  try {
    const [[historia]] = await pool.execute(
      "SELECT id_historia_clinica FROM historia_clinica WHERE id_historia_clinica = ?",
      [idHistoria],
    );
    if (!historia) {
      return res.status(404).json({ error: "Historia clínica no encontrada." });
    }

    await pool.execute(
      `UPDATE historia_clinica
       SET sintomas = ?, diagnostico = ?, prox_visita = ?, estado = ?
       WHERE id_historia_clinica = ?`,
      [sintomas, diagnostico, proxVisita, estado, idHistoria],
    );

    res.json({ mensaje: "Historia clínica actualizada correctamente." });
  } catch (error) {
    console.error("Error al actualizar historia clínica:", error.message);
    res
      .status(500)
      .json({ error: "No se pudo actualizar la historia clínica." });
  }
});

// Lista productos farmacéuticos para prescripciones y tratamientos
app.get("/api/veterinario/productos", async (req, res) => {
  const veterinario = obtenerVeterinario(req, res);
  if (!veterinario) return;

  try {
    const [productos] = await pool.execute(`
            SELECT p.id_produ AS id, p.nombre_produ AS nombre,
              COALESCE((SELECT SUM(i.stock) FROM inventario i WHERE i.id_producto = p.id_produ), 0) AS stock,
              c.nombre_cat AS categoria
      FROM producto p
      JOIN categoria c ON c.id_cat = p.id_cat
      WHERE p.estado = 'ACTIVO'
      ORDER BY p.nombre_produ ASC`);

    res.json({ productos });
  } catch (error) {
    console.error("Error al listar medicamentos:", error.message);
    res.status(500).json({ error: "No se pudieron listar los medicamentos." });
  }
});

// Lista servicios clínicos para registrar consultas
app.get("/api/veterinario/servicios", async (req, res) => {
  const veterinario = obtenerVeterinario(req, res);
  if (!veterinario) return;

  try {
    const [servicios] = await pool.execute(`
      SELECT id_servicio AS id, nombre, precio
      FROM servicio
      WHERE estado = 'ACTIVO'
      ORDER BY nombre ASC`);

    res.json({ servicios });
  } catch (error) {
    console.error("Error al listar servicios:", error.message);
    res.status(500).json({ error: "No se pudieron listar los servicios." });
  }
});

//Ruta principal para abrir la pagina de inicio desde el navegador
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/pages/index.html"));
});

//Ruta para abrir paginas dentro de /pages
app.get("/:pagina.html", (req, res, next) => {
  const paginasPermitidas = [
    "index",
    "inicio",
    "servicios",
    "tienda",
    "carrito",
    "blog",
    "contactanos",
    "login",
    "registro",
    "agendar-citas",
    "dashboard-cliente",
    "dashboard-veterinario",
    "dashboard-administrador",
    "recuperar_contrasena",
    "privacidad",
    "terminos",
  ];

  const pagina = req.params.pagina;

  if (!paginasPermitidas.includes(pagina)) {
    return next();
  }

  res.sendFile(path.join(__dirname, "../Frontend/pages", `${pagina}.html`));
});

// Arranca las preparaciones de MySQL en orden para evitar bloqueos simultáneos.
(async () => {
  try {
    await prepararTablaMascota();
    await prepararDatosPerfil();
    await sincronizarServicios();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo preparar la base de datos:", error.message);
    process.exit(1);
  }
})();
