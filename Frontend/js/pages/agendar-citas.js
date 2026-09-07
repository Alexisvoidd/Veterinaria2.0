// REFERENCIA AL FORMULARIO PRINCIPAL
const form = document.getElementById("appointment-form");

// REFERENCIA AL CAMPO DE FECHA
const dateInput = document.getElementById("appointment-date");

// REFERENCIA AL SELECTOR DE HORARIOS
const timeSelect = document.getElementById("appointment-time");

// REFERENCIA AL MENSAJE GENERAL DEL FORMULARIO
const message = document.getElementById("appointment-message");
const petSelect = document.getElementById("pet-name");
const speciesSelect = document.getElementById("species");
let serviciosDisponibles = [];

const usuarioSesion = JSON.parse(
  localStorage.getItem("vetsalud_usuario") || "null",
);
if (!usuarioSesion?.correo) {
  sessionStorage.setItem(
    "vetsalud_destino_login",
    `agendar-citas.html${window.location.search}`,
  );
  window.location.replace("login.html");
}

// Configuración de horarios según el día de la semana

// HORARIOS DISPONIBLES DE LUNES A VIERNES
const horariosSemana = [
  // Primera hora disponible
  "08:00",

  // Segunda hora disponible
  "09:00",

  // Tercera hora disponible
  "10:00",

  // Cuarta hora disponible
  "11:00",

  // Horario después del descanso
  "14:00",

  // Segunda hora de la tarde
  "15:00",

  // Tercera hora de la tarde
  "16:00",

  // Última hora disponible
  "17:00",
];

// HORARIOS DISPONIBLES LOS SÁBADOS
const horariosSabado = [
  // Primera hora del sábado
  "08:00",

  // Segunda hora del sábado
  "09:00",

  // Tercera hora del sábado
  "10:00",

  // Cuarta hora del sábado
  "11:00",

  // Quinta hora del sábado
  "12:00",

  // Última hora del sábado
  "13:00",
];

// FUNCIONES PARA LAS FECHAS Y HORARIOS

// Evita fechas anteriores y marca los domingos como no disponibles.
function prepararFecha() {
  // Obtiene la fecha actual
  const hoy = new Date();

  // Establece la hora actual en medianoche
  hoy.setHours(0, 0, 0, 0);

  // Convierte la fecha actual al formato YYYY-MM-DD
  const iso = hoy.toISOString().split("T")[0];

  // Evita seleccionar fechas anteriores a hoy
  dateInput.min = iso;

  // Verifica si ya existe una fecha seleccionada
  if (dateInput.value) {
    // Convierte la fecha seleccionada en un objeto Date
    const fecha = new Date(`${dateInput.value}T12:00:00`);

    // Comprueba si la fecha seleccionada corresponde a un domingo
    if (fecha.getDay() === 0) {
      // Muestra un mensaje de validación para los domingos
      dateInput.setCustomValidity("Los domingos no hay atención.");
    } else {
      // Elimina cualquier mensaje de validación anterior
      dateInput.setCustomValidity("");
    }
  }
}

// Define los horarios disponibles según el día seleccionado
function cargarHorarios() {
  // Convierte la fecha seleccionada en un objeto Date
  const fecha = new Date(`${dateInput.value}T12:00:00`);

  // Comprueba si todavía no se ha seleccionado una fecha
  if (!dateInput.value) {
    // Muestra una opción indicando que primero debe seleccionarse una fecha
    timeSelect.innerHTML =
      '<option value="">Primero selecciona una fecha</option>';

    // Detiene la ejecución de la función
    return;
  }

  // Comprueba si la fecha seleccionada es domingo
  if (fecha.getDay() === 0) {
    // Informa que no existen horarios disponibles los domingos
    timeSelect.innerHTML = '<option value="">No atendemos domingos</option>';

    // Detiene la ejecución de la función
    return;
  }

  // Selecciona los horarios del sábado o de lunes a viernes
  const horarios = fecha.getDay() === 6 ? horariosSabado : horariosSemana;

  // Genera las opciones del selector de horarios
  timeSelect.innerHTML =
    '<option value="">Selecciona una hora</option>' +
    // Convierte cada horario en una opción HTML
    horarios.map((h) => `<option value="${h}">${h}</option>`).join("");
}

// FUNCIONES DE VALIDACIÓN DE CAMPOS

// Maneja la adición/eliminación de clases CSS de error en los campos
function error(id, hayError) {
  // Busca el contenedor del campo mediante su selector
  const campo = document.querySelector(id);

  // Agrega o elimina la clase de error según corresponda
  campo.classList.toggle("has-error", hayError);

  // Busca el control de formulario dentro del campo
  const control = campo.querySelector("input, select, textarea");

  // Comprueba que exista un control
  if (control) {
    // Agrega o elimina la clase visual de campo inválido
    control.classList.toggle("invalid", hayError);
  }
}

// Valida todos los campos del formulario antes de enviar
function validar() {
  // Indica inicialmente que todos los campos son válidos
  let ok = true;

  // EXTRACCIÓN DE VALORES

  // Obtiene y limpia el nombre del propietario
  const nombre = document.getElementById("owner-name").value.trim();

  // Obtiene y limpia el correo electrónico
  const email = document.getElementById("owner-email").value.trim();

  // Obtiene y limpia el teléfono
  const phone = document.getElementById("owner-phone").value.trim();

  // Obtiene y limpia el nombre de la mascota
  const pet = document.getElementById("pet-name").value.trim();

  // Obtiene la especie seleccionada
  const species = document.getElementById("species").value;

  // Obtiene el servicio seleccionado
  const service = document.getElementById("service").value;

  // Obtiene y limpia el motivo de la cita
  const reason = document.getElementById("reason").value.trim();

  // Comprueba si el usuario aceptó el consentimiento
  const consent = document.getElementById("appointment-consent").checked;

  // VALIDACIONES INDIVIDUALES

  // Valida que el nombre tenga al menos cinco caracteres
  error("#field-owner-name", nombre.length < 5);

  // Marca el formulario como inválido si el nombre es demasiado corto
  if (nombre.length < 5) ok = false;

  // Valida el formato del correo electrónico
  error("#field-owner-email", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

  // Marca el formulario como inválido si el correo no cumple la expresión
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ok = false;

  // Valida que el teléfono tenga entre 7 y 20 caracteres permitidos
  error("#field-owner-phone", !/^[+0-9\s()-]{7,20}$/.test(phone));

  // Marca el formulario como inválido si el teléfono no cumple el formato
  if (!/^[+0-9\s()-]{7,20}$/.test(phone)) ok = false;

  // Valida que el nombre de la mascota tenga al menos dos caracteres
  error("#field-pet-name", pet.length < 2);

  // Marca el formulario como inválido si falta el nombre de la mascota
  if (pet.length < 2) ok = false;

  // Valida que se haya seleccionado una especie
  error("#field-species", !species);

  // Marca el formulario como inválido si no hay especie
  if (!species) ok = false;

  // Valida que se haya seleccionado un servicio
  error("#field-service", !service);

  // Marca el formulario como inválido si no hay servicio
  if (!service) ok = false;

  // VALIDACIÓN DE FECHA

  // Convierte la fecha seleccionada en un objeto Date
  const fecha = new Date(`${dateInput.value}T12:00:00`);

  // Determina si la fecha seleccionada es inválida
  const fechaMala =
    // Comprueba que exista una fecha
    !dateInput.value ||
    // Comprueba que la fecha sea válida
    Number.isNaN(fecha.getTime()) ||
    // Comprueba que la fecha no sea anterior al día actual
    fecha < new Date(new Date().setHours(0, 0, 0, 0)) ||
    // Comprueba que no sea domingo
    fecha.getDay() === 0;

  // Marca visualmente el campo si la fecha es incorrecta
  error("#field-date", fechaMala);

  // Marca el formulario como inválido si la fecha es incorrecta
  if (fechaMala) ok = false;

  // Valida que se haya seleccionado una hora
  error("#field-time", !timeSelect.value);

  // Marca el formulario como inválido si no hay hora
  if (!timeSelect.value) ok = false;

  // Valida que el motivo tenga al menos diez caracteres
  error("#field-reason", reason.length < 10);

  /* Marca el formulario como inválido si el motivo es demasiado corto 
  if (reason.length < 10) ok = false;

  /* VALIDACIÓN DE CONSENTIMIENTO */

  /* Comprueba si el usuario no aceptó el consentimiento */
  if (!consent) {
    /* Define las clases del mensaje como visible y de error */
    message.className = "form-message show error";

    /* Muestra el mensaje indicando que debe aceptar el consentimiento */
    message.textContent =
      "Debes aceptar el uso de los datos para gestionar la cita.";

    /* Marca el formulario como inválido */
    ok = false;
  }

  /* Devuelve el resultado de todas las validaciones */
  return ok;
}

/* INICIALIZACIÓN DE LA VISTA Y EVENTOS */

/* CAMBIO EN EL INPUT DE FECHA */
dateInput.addEventListener("change", () => {
  /* Actualiza las restricciones de la fecha */
  prepararFecha();

  /* Actualiza los horarios disponibles */
  cargarHorarios();
});

/* ENVÍO DEL FORMULARIO */
form.addEventListener("submit", async (e) => {
  /* Evita que el formulario recargue la página */
  e.preventDefault();

  /* Restablece las clases del mensaje */
  message.className = "form-message";

  /* Ejecuta todas las validaciones */
  if (!validar()) {
    /* Comprueba si todavía no se mostró un mensaje */
    if (!message.classList.contains("show")) {
      /* Muestra el mensaje de error */
      message.classList.add("show", "error");

      /* Informa que deben revisar los campos */
      message.textContent = "Revisa los campos marcados e intenta nuevamente.";
    }

    /* Detiene el envío si existen errores */
    return;
  }

  /* OBTENER USUARIO ACTUAL */

  /* Obtiene los datos del usuario almacenados en localStorage */
  const usuario = JSON.parse(
    localStorage.getItem("vetsalud_usuario") || "null",
  );

  /* Comprueba que exista un usuario con correo */
  if (!usuario?.correo) {
    /* Muestra un mensaje indicando que debe iniciar sesión */
    message.className = "form-message show error";

    /* Informa que debe iniciar sesión para guardar la cita */
    message.textContent = "Inicia sesión para poder guardar una cita.";

    /* Detiene el proceso */
    return;
  }

  /* INTENTO DE GUARDADO DE LA CITA */
  try {
    /* Envía los datos de la cita al servidor */
    const respuesta = await fetch("/api/citas", {
      /* Define el método HTTP utilizado */
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("vetsalud_token") || ""}`,
      },
      body: JSON.stringify({
        /* Envía el nombre de la mascota */
        nombreMascota: document.getElementById("pet-name").value.trim(),

        /* Envía el identificador numérico del servicio */
        idServicio: Number(document.getElementById("service").value),

        /* Envía la fecha seleccionada */
        fecha: dateInput.value,

        /* Envía la hora seleccionada */
        hora: timeSelect.value,

        /* Envía el motivo de la cita */
        motivo: document.getElementById("reason").value.trim(),
      }),
    });

    /* Convierte la respuesta del servidor a JSON */
    const resultado = await respuesta.json();

    /* Define el mensaje como éxito o error según la respuesta */
    message.className = `form-message show ${
      respuesta.ok ? "success" : "error"
    }`;

    /* Muestra el mensaje recibido del servidor */
    message.textContent = resultado.error || resultado.mensaje;

    /* Comprueba si la cita fue guardada correctamente */
    if (respuesta.ok) {
      /* Limpia todos los campos del formulario */
      form.reset();

      /* Restablece el selector de horarios */
      timeSelect.innerHTML =
        '<option value="">Primero selecciona una fecha</option>';

      /* Busca todos los campos del formulario */
      document
        .querySelectorAll(".field")

        /* Recorre cada campo encontrado */
        .forEach((f) =>
          /* Elimina la clase de error */
          f.classList.remove("has-error"),
        );
    }

    /* CAPTURA DE ERRORES DE CONEXIÓN */
  } catch (error) {
    /* Muestra el mensaje de error de conexión */
    message.className = "form-message show error";

    /* Informa que no se pudo contactar con el servidor */
    message.textContent = "No se pudo conectar con el servidor.";
  }
});

async function cargarServicios() {
  /* Obtiene el selector de servicios */
  const select = document.getElementById("service");

  /* Detiene la función si el selector no existe */
  if (!select) return;

  /* INTENTO DE CARGA DE SERVICIOS */
  try {
    /* Solicita la lista de servicios al servidor */
    const respuesta = await fetch("/api/servicios");

    /* Convierte la respuesta a JSON */
    const resultado = await respuesta.json();

    /* Genera un error si la respuesta no fue exitosa */
    if (!respuesta.ok) throw new Error(resultado.error);

    /* Guarda los servicios recibidos */
    serviciosDisponibles = resultado.servicios;
    select.innerHTML =
      '<option value="">Selecciona un servicio</option>' +
      serviciosDisponibles
        .map(
          (servicio) =>
            `<option value="${servicio.id}">${servicio.nombre} — ${Number(servicio.precio).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}</option>`,
        )
        .join("");
  } catch (error) {
    /* Muestra un mensaje de error */
    message.className = "form-message show error";

    /* Informa que no se pudieron cargar los servicios */
    message.textContent = "No se pudieron cargar los servicios.";
  }
}

function precargarDatosUsuario() {
  if (!usuarioSesion) return;
  const nombre =
    `${usuarioSesion.nombre || ""} ${usuarioSesion.apellido || ""}`.trim();
  document.getElementById("owner-name").value = nombre;
  document.getElementById("owner-email").value = usuarioSesion.correo || "";
  document.getElementById("owner-phone").value = usuarioSesion.telefono || "";
}

async function cargarDatosCliente() {
  if (!usuarioSesion?.idCliente || !usuarioSesion?.idUsuario) return;

  try {
    const respuesta = await fetch(`/api/dashboard/${usuarioSesion.idCliente}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("vetsalud_token") || ""}`,
      },
    });
    if (!respuesta.ok)
      throw new Error("No se pudieron cargar los datos del cliente.");

    const datos = await respuesta.json();
    const cliente = datos.cliente || {};
    const mascotas = datos.mascotas || [];

    if (cliente.telefono) {
      document.getElementById("owner-phone").value = cliente.telefono;
    }

    petSelect.innerHTML = '<option value="">Selecciona una mascota</option>';
    mascotas.forEach((mascota) => {
      const option = document.createElement("option");
      option.value = mascota.nombre;
      option.textContent = `${mascota.nombre} (${mascota.especie})`;
      option.dataset.especie = mascota.especie;
      petSelect.appendChild(option);
    });

    const seleccionarEspecie = (especie) => {
      if (
        especie &&
        !Array.from(speciesSelect.options).some(
          (opcion) => opcion.value === especie,
        )
      ) {
        const opcion = document.createElement("option");
        opcion.value = especie;
        opcion.textContent = especie;
        speciesSelect.appendChild(opcion);
      }
      speciesSelect.value = especie || "";
    };

    petSelect.addEventListener("change", () => {
      const opcion = petSelect.selectedOptions[0];
      seleccionarEspecie(opcion?.dataset.especie || "");
    });

    if (mascotas.length === 1) {
      petSelect.value = mascotas[0].nombre;
      seleccionarEspecie(mascotas[0].especie);
    }
  } catch (error) {
    petSelect.innerHTML =
      '<option value="">No se pudieron cargar tus mascotas</option>';
    message.className = "form-message show error";
    message.textContent = "No se pudieron cargar las mascotas del cliente.";
  }
}

// Preselecciona el servicio si viene como parámetro en la URL (?servicio=...)
function preseleccionarServicio() {
  /* Obtiene los parámetros existentes en la URL */
  const params = new URLSearchParams(window.location.search);

  /* Obtiene el parámetro llamado servicio */
  const servicioParam = params.get("servicio");

  /* Comprueba si existe un servicio en la URL */
  if (servicioParam) {
    /* Obtiene el selector de servicios */
    const selectServicio = document.getElementById("service");

    /* Comprueba que el selector exista */
    if (selectServicio) {
      /* Busca una opción que coincida con el parámetro */
      const match = Array.from(selectServicio.options).find(
        /* Comprueba coincidencia con el valor o el texto de la opción */
        (opt) =>
          opt.value.toLowerCase().includes(servicioParam.toLowerCase()) ||
          opt.text.toLowerCase().includes(servicioParam.toLowerCase()),
      );

      /* Comprueba si encontró una opción coincidente */
      if (match) {
        /* Selecciona automáticamente el servicio encontrado */
        selectServicio.value = match.value;
      }
    }
  }
}

/* INICIALIZACIÓN DE LA VISTA */

/* Prepara las restricciones de fecha al cargar la página */
prepararFecha();
precargarDatosUsuario();
(async () => {
  await cargarDatosCliente();
})();
(async () => {
  await cargarServicios();
  preseleccionarServicio();
})();
cargarLayout();
