// ESCAPA CARACTERES HTML PARA PREVENIR INYECCIONES XSS.
 
function escaparHtml(valor) {
  // CONVIERTE EL VALOR RECIBIDO EN TEXTO */
  return String(valor ?? "").replace(
    // BUSCA CARACTERES ESPECIALES QUE PODRÍAN INTERPRETARSE COMO HTML
    /[&<>'"]/g,

    // REEMPLAZA CADA CARÁCTER POR SU EQUIVALENTE HTML SEGURO
    (caracter) =>
      /* OBJETO QUE RELACIONA CADA CARÁCTER CON SU REPRESENTACIÓN SEGURA */
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[caracter],
  );
}

/**
 * FORMATEA FECHAS PARA MOSTRARLAS EN FORMATO DE COLOMBIA.
 */
function formatoFecha(fecha) {
  /* SI NO EXISTE UNA FECHA, MUESTRA UN TEXTO ALTERNATIVO */
  if (!fecha) return "Sin fecha";

  /* CONVIERTE EL VALOR RECIBIDO EN UN OBJETO DATE */
  const d = new Date(fecha);

  /* COMPRUEBA SI LA FECHA GENERADA ES INVÁLIDA */
  if (Number.isNaN(d.getTime())) return String(fecha);

  /* FORMATEA LA FECHA Y HORA SEGÚN LA CONFIGURACIÓN DE COLOMBIA */
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/**
 * FORMATEA SOLAMENTE LA FECHA SIN MOSTRAR LA HORA.
 */
function formatoSoloFecha(fecha) {
  /* SI NO EXISTE UNA FECHA, DEVUELVE UNA CADENA VACÍA */
  if (!fecha) return "";

  /* CONVIERTE EL VALOR RECIBIDO EN UNA FECHA */
  const d = new Date(fecha);

  /* SI LA FECHA ES INVÁLIDA, DEVUELVE EL VALOR ORIGINAL */
  if (Number.isNaN(d.getTime())) return String(fecha);

  /* FORMATEA SOLAMENTE DÍA, MES Y AÑO */
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
  }).format(d);
}

/**
 * Identifica la especie y retorna su icono y clase de fondo correspondiente.
 */
function obtenerInfoEspecie(especie) {
  const esp = String(especie || "")
    .trim()
    .toLowerCase();

  /* COMPRUEBA SI LA ESPECIE CORRESPONDE A UN PERRO */
  if (esp.includes("perr") || esp.includes("canin") || esp.includes("dog")) {
    /* DEVUELVE EL ICONO, CLASE CSS Y NOMBRE DE LA ESPECIE */
    return {
      icono: "pets",
      clase: "dash-pet-card__photo-wrap--perro",
      nombre: "Perro",
    };
  }

  /* COMPRUEBA SI LA ESPECIE CORRESPONDE A UN GATO */
  if (esp.includes("gat") || esp.includes("felin") || esp.includes("cat")) {
    /* DEVUELVE LA INFORMACIÓN VISUAL DEL GATO */
    return {
      icono: "pets",
      clase: "dash-pet-card__photo-wrap--gato",
      nombre: "Gato",
    };
  }

  /* COMPRUEBA SI LA ESPECIE CORRESPONDE A UN AVE */
  if (
    esp.includes("ave") ||
    esp.includes("pajar") ||
    esp.includes("loro") ||
    esp.includes("perico") ||
    esp.includes("bird")
  ) {
    /* DEVUELVE LA INFORMACIÓN VISUAL DEL AVE */
    return {
      icono: "flutter_dash",
      clase: "dash-pet-card__photo-wrap--ave",
      nombre: "Ave",
    };
  }

  /* COMPRUEBA SI LA ESPECIE CORRESPONDE A UN CONEJO */
  if (esp.includes("conej") || esp.includes("rabbit")) {
    /* DEVUELVE LA INFORMACIÓN VISUAL DEL CONEJO */
    return {
      icono: "pets",
      clase: "dash-pet-card__photo-wrap--conejo",
      nombre: "Conejo",
    };
  }

  /* COMPRUEBA SI LA ESPECIE CORRESPONDE A UN HÁMSTER O ROEDOR */
  if (
    esp.includes("hamster") ||
    esp.includes("hámster") ||
    esp.includes("roedor") ||
    esp.includes("cuy") ||
    esp.includes("cobaya")
  ) {
    /* DEVUELVE LA INFORMACIÓN VISUAL DEL HÁMSTER */
    return {
      icono: "pets",
      clase: "dash-pet-card__photo-wrap--hamster",
      nombre: "Hámster",
    };
  }

  /* COMPRUEBA SI LA ESPECIE CORRESPONDE A UN PEZ */
  if (esp.includes("pez") || esp.includes("peces") || esp.includes("fish")) {
    /* DEVUELVE LA INFORMACIÓN VISUAL DEL PEZ */
    return {
      icono: "water",
      clase: "dash-pet-card__photo-wrap--pez",
      nombre: "Pez",
    };
  }

  /* COMPRUEBA SI LA ESPECIE CORRESPONDE A UN REPTIL */
  if (
    esp.includes("reptil") ||
    esp.includes("tortuga") ||
    esp.includes("iguana")
  ) {
    /* DEVUELVE LA INFORMACIÓN VISUAL DEL REPTIL */
    return {
      icono: "pets",
      clase: "dash-pet-card__photo-wrap--reptil",
      nombre: "Reptil",
    };
  }

  /* DEVUELVE INFORMACIÓN GENÉRICA PARA CUALQUIER OTRA ESPECIE */
  return {
    icono: "pets",
    clase: "dash-pet-card__photo-wrap--otro",
    nombre: especie || "Mascota",
  };
}

/* VARIABLES GLOBALES EN MEMORIA PARA LA SESIÓN */

/* GUARDA LOS SERVICIOS DISPONIBLES OBTENIDOS DESDE EL BACKEND */
let serviciosDisponibles = [];

/* GUARDA LOS DATOS ACTUALES DEL DASHBOARD */
let datosDashboardActual = null;

/* GUARDA TEMPORALMENTE EL ID DE LA CITA QUE SE VA A REPROGRAMAR */
let idCitaReprogramarActual = null;

// Genera horarios de atención en intervalos de treinta minutos.
function cargarHorarios(selectorId) {
  const selector = document.getElementById(selectorId);
  if (!selector) return;
  selector.innerHTML = '<option value="">Selecciona horario</option>';
  for (let minutos = 8 * 60; minutos <= 17 * 60; minutos += 30) {
    const horas = String(Math.floor(minutos / 60)).padStart(2, "0");
    const minutosTexto = String(minutos % 60).padStart(2, "0");
    const valor = `${horas}:${minutosTexto}`;
    const hora12 = minutos / 60 >= 12 ? minutos / 60 - 12 || 12 : minutos / 60;
    const periodo = minutos / 60 >= 12 ? "PM" : "AM";
    selector.insertAdjacentHTML(
      "beforeend",
      `<option value="${valor}">${String(hora12).padStart(2, "0")}:${minutosTexto} ${periodo}</option>`,
    );
  }
}

// Impide seleccionar días anteriores al día local actual.
function configurarFechasCita() {
  const ahora = new Date();
  const fechaMinima = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;
  ["cita-fecha", "nueva-fecha"].forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) campo.min = fechaMinima;
  });
}

/**
 * CARGA LOS SERVICIOS VETERINARIOS DISPONIBLES DESDE EL BACKEND.
 */
async function cargarServicios() {
  const selectServicio = document.getElementById("cita-servicio");
  if (!selectServicio) return;

  try {
    /* SOLICITA LA LISTA DE SERVICIOS DISPONIBLES */
    const res = await fetch("/api/servicios");
    if (!res.ok) throw new Error("No se pudieron consultar los servicios.");
    const datos = await res.json();

    /* GUARDA LOS SERVICIOS RECIBIDOS O UN ARRAY VACÍO */
    serviciosDisponibles = datos.servicios || [];

    selectServicio.innerHTML =
      '<option value="">Selecciona servicio</option>' +
      serviciosDisponibles
        .map(
          (s) =>
            `<option value="${Number(s.id)}">${escaparHtml(s.nombre)} ($${Number(s.precio).toLocaleString("es-CO")})</option>`,
        )
        .join("");
    selectServicio.disabled = serviciosDisponibles.length === 0;
  } catch (error) {
    /* MUESTRA EL ERROR EN LA CONSOLA DEL NAVEGADOR */
    console.error("Error al cargar servicios:", error);
    selectServicio.innerHTML =
      '<option value="">No se pudieron cargar los servicios</option>';
    selectServicio.disabled = true;
  }
}

/**
 * CONSULTA Y RENDERIZA TODOS LOS DATOS DEL DASHBOARD DESDE LA BASE DE DATOS.
 */
async function cargarDashboard() {
  /* OBTIENE LOS DATOS DEL USUARIO GUARDADOS EN LOCALSTORAGE */
  const usuario = JSON.parse(
    localStorage.getItem("vetsalud_usuario") || "null",
  );

  /* OBTIENE EL TOKEN DE AUTENTICACIÓN */
  const token = localStorage.getItem("vetsalud_token") || "";

  /* COMPRUEBA QUE EL USUARIO EXISTA, TENGA ID Y SEA CLIENTE */
  if (
    !usuario ||
    !usuario.idCliente ||
    String(usuario.rol || "").toUpperCase() !== "CLIENTE"
  ) {
    /* REDIRIGE AL LOGIN SI NO CUMPLE LOS REQUISITOS */
    window.location.href = "login.html";

    /* DETIENE LA EJECUCIÓN */
    return;
  }

  /* SOLICITA AL BACKEND LA INFORMACIÓN DEL CLIENTE */
  const respuesta = await fetch(`/api/dashboard/${usuario.idCliente}`, {
    /* ENVÍA EL TOKEN PARA AUTENTICAR LA PETICIÓN */
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  /* COMPRUEBA SI EL TOKEN ES INVÁLIDO O NO TIENE PERMISOS */
  if (respuesta.status === 401 || respuesta.status === 403) {
    /* ELIMINA LOS DATOS DEL USUARIO */
    localStorage.removeItem("vetsalud_usuario");

    /* ELIMINA EL TOKEN */
    localStorage.removeItem("vetsalud_token");

    /* REDIRIGE AL USUARIO AL LOGIN */
    window.location.href = "login.html";

    /* DETIENE LA EJECUCIÓN */
    return;
  }

  /* COMPRUEBA SI OCURRIÓ OTRO ERROR EN EL SERVIDOR */
  if (!respuesta.ok) {
    /* GENERA UN ERROR PARA INFORMAR QUE NO SE PUDO CARGAR EL DASHBOARD */
    throw new Error("No se pudo cargar la información del dashboard.");
  }

  /* CONVIERTE LA RESPUESTA DEL SERVIDOR A JSON */
  const datos = await respuesta.json();

  /* GUARDA LOS DATOS ACTUALES DEL DASHBOARD EN MEMORIA */
  datosDashboardActual = datos;

  /* OBTIENE LOS DATOS DEL CLIENTE */
  const cliente = datos.cliente || {};

  /* OBTIENE LAS MASCOTAS DEL CLIENTE */
  const mascotas = datos.mascotas || [];

  /* OBTIENE LAS CITAS DEL CLIENTE */
  const citas = datos.citas || [];

  /* OBTIENE LAS HISTORIAS CLÍNICAS */
  const historias = datos.historias || [];

  /* OBTIENE LAS COMPRAS DEL CLIENTE */
  const compras = datos.compras || [];

  /*  1. SALUDO, AVATAR Y DATOS DE PERFIL*/

  /* OBTIENE EL NOMBRE DEL CLIENTE O UTILIZA EL NOMBRE GUARDADO EN LOCALSTORAGE */
  const nombreCliente = cliente.nombre || usuario.nombre || "Cliente";

  /* OBTIENE EL APELLIDO DEL CLIENTE */
  const apellidoCliente = cliente.apellido || usuario.apellido || "";

  /* UNE EL NOMBRE Y APELLIDO EN UN SOLO TEXTO */
  const nombreCompleto = `${nombreCliente} ${apellidoCliente}`.trim();

  /* GENERA LAS INICIALES DEL CLIENTE */
  const iniciales = (
    (nombreCliente[0] || "C") + (apellidoCliente[0] || "M")
  ).toUpperCase();

  /* BUSCA EL ELEMENTO QUE MUESTRA EL SALUDO */
  const greetingEl = document.getElementById("greeting-client-name");

  /* ACTUALIZA EL SALUDO SI EL ELEMENTO EXISTE */
  if (greetingEl) greetingEl.textContent = `¡Hola, ${nombreCliente}!`;

  /* BUSCA EL AVATAR DE LA BARRA SUPERIOR */
  const topbarAvatarEl = document.getElementById("topbar-avatar");

  /* MUESTRA LAS INICIALES EN EL AVATAR SUPERIOR */
  if (topbarAvatarEl) topbarAvatarEl.textContent = iniciales;

  /* BUSCA EL AVATAR DE LA SECCIÓN DE PERFIL */
  const profileAvatarEl = document.getElementById("profile-avatar-display");

  /* MUESTRA LAS INICIALES EN EL AVATAR DEL PERFIL */
  if (profileAvatarEl) profileAvatarEl.textContent = iniciales;

  /* BUSCA EL NOMBRE DEL PERFIL */
  const profileSummaryNameEl = document.getElementById("profile-summary-name");

  /* MUESTRA EL NOMBRE COMPLETO DEL CLIENTE */
  if (profileSummaryNameEl) profileSummaryNameEl.textContent = nombreCompleto;

  /* ACTUALIZA EL CLIENTE MOSTRADO EN EL COMPROBANTE */
  const receiptClientNameEl = document.getElementById("recibo-cliente-nombre");
  if (receiptClientNameEl) receiptClientNameEl.textContent = nombreCompleto;

  /* BUSCA EL INDICADOR DE CANTIDAD DE MASCOTAS */
  const profileStatPetsEl = document.getElementById("profile-stat-pets");

  /* ACTUALIZA LA CANTIDAD DE MASCOTAS */
  if (profileStatPetsEl) {
    /* CAMBIA EL TEXTO SEGÚN SI HAY UNA O VARIAS MASCOTAS */
    profileStatPetsEl.textContent = `${mascotas.length} ${mascotas.length === 1 ? "Peludo" : "Peludos"}`;
  }

  /* 
     RELLENAR FORMULARIO DE PERFIL CON DATOS REALES
   */

  /* COMPRUEBA SI EXISTE EL CAMPO PRINCIPAL DEL FORMULARIO */
  if (document.getElementById("perfil-nombre")) {
    /* COLOCA EL NOMBRE DEL CLIENTE */
    document.getElementById("perfil-nombre").value = cliente.nombre || "";

    /* COLOCA EL APELLIDO DEL CLIENTE */
    document.getElementById("perfil-apellido").value = cliente.apellido || "";

    /* COLOCA EL TIPO DE DOCUMENTO */
    document.getElementById("perfil-tipo-doc").value =
      cliente.tipo_documento || "C.C";
    document.getElementById("perfil-documento").value = cliente.documento || "";
    document.getElementById("perfil-telefono1").value =
      cliente.telefono || cliente.telefono_1 || "";
    document.getElementById("perfil-telefono2").value =
      cliente.telefono_secundario || cliente.telefono_2 || "";
    document.getElementById("perfil-correo").value =
      cliente.correo || usuario.correo || "";
    document.getElementById("perfil-nacimiento").value =
      cliente.fecha_nacimiento
        ? String(cliente.fecha_nacimiento).slice(0, 10)
        : "";
    document.getElementById("perfil-direccion").value = cliente.direccion || "";
  }

  /*  2. ACTUALIZAR KPIs */

  /* BUSCA EL INDICADOR DE CANTIDAD DE MASCOTAS */
  const kpiMascotasCountEl = document.getElementById("kpi-mascotas-count");

  /* ACTUALIZA EL NÚMERO DE MASCOTAS */
  if (kpiMascotasCountEl) kpiMascotasCountEl.textContent = mascotas.length;

  /* BUSCA LA ETIQUETA DE CANTIDAD DE MASCOTAS */
  const petsCountBadgeEl = document.getElementById("pets-count-badge");

  /* ACTUALIZA EL TEXTO DE LA ETIQUETA */
  if (petsCountBadgeEl) {
    /* UTILIZA "REGISTRADA" PARA UNA Y "REGISTRADAS" PARA VARIAS */
    petsCountBadgeEl.textContent = `${mascotas.length} ${mascotas.length === 1 ? "registrada" : "registradas"}`;
  }

  /* BUSCA EL INDICADOR DE TRATAMIENTOS */
  const kpiTratamientosCountEl = document.getElementById(
    "kpi-tratamientos-count",
  );

  /* MUESTRA LA CANTIDAD DE HISTORIAS CLÍNICAS */
  if (kpiTratamientosCountEl)
    kpiTratamientosCountEl.textContent = historias.length;

  /* 
     PRÓXIMA CITA ACTIVA
   */

  /* OBTIENE LA FECHA Y HORA ACTUAL */
  const ahora = new Date();

  /* FILTRA LAS CITAS FUTURAS QUE ESTÉN PENDIENTES O CONFIRMADAS */
  const citasFuturas = citas

    /* RECORRE Y FILTRA LAS CITAS */
    .filter((c) => {
      /* CONVIERTE LA FECHA DE LA CITA EN UN OBJETO DATE */
      const fechaCita = new Date(c.fecha);

      /* COMPRUEBA EL ESTADO Y LA FECHA DE LA CITA */
      return (
        (c.estado === "PENDIENTE" || c.estado === "CONFIRMADA") &&
        fechaCita >= new Date(ahora.getTime() - 2 * 60 * 60 * 1000)
      );
    })

    /* ORDENA LAS CITAS DESDE LA MÁS PRÓXIMA HASTA LA MÁS LEJANA */
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  /* OBTIENE LA PRIMERA CITA FUTURA O NULL SI NO EXISTE */
  const proximaCita = citasFuturas[0] || null;

  /* BUSCA EL ELEMENTO DONDE SE MOSTRARÁ LA PRÓXIMA CITA */
  const kpiProximaCitaEl = document.getElementById("kpi-proxima-cita");

  /* COMPRUEBA SI EL ELEMENTO EXISTE */
  if (kpiProximaCitaEl) {
    /* COMPRUEBA SI EXISTE UNA PRÓXIMA CITA */
    if (proximaCita) {
      /* MUESTRA LA FECHA Y HORA DE LA PRÓXIMA CITA */
      kpiProximaCitaEl.textContent = formatoFecha(proximaCita.fecha);
    } else {
      /* MUESTRA UN MENSAJE CUANDO NO HAY CITAS PENDIENTES */
      kpiProximaCitaEl.textContent = "Sin citas pendientes";
    }
  }

  /*  3. RENDERIZAR HERO CARD*/

  /* BUSCA EL CONTENEDOR DE LA TARJETA PRINCIPAL */
  const heroContainer = document.getElementById("hero-card-container");

  /* COMPRUEBA SI EXISTE EL CONTENEDOR */
  if (heroContainer) {
    /* COMPRUEBA SI EXISTE UNA PRÓXIMA CITA */
    if (proximaCita) {
      /* OBTIENE LA INFORMACIÓN VISUAL DE LA ESPECIE */
      const infoEsp = obtenerInfoEspecie(proximaCita.especie);

      /* CREA LA TARJETA DE LA PRÓXIMA CITA */
      heroContainer.innerHTML = `
        <article class="dash-hero-card">

          <!-- MARCA DE AGUA DECORATIVA -->
          <div class="dash-hero-card__watermark">
            <span class="material-symbols-outlined">calendar_month</span>
          </div>

          <!-- PARTE SUPERIOR DE LA TARJETA -->
          <div class="dash-hero-card__top">

            <!-- ETIQUETA DE PRÓXIMA CITA -->
            <span class="dash-hero-card__badge">Próxima Cita</span>

            <!-- ESTADO ACTUAL DE LA CITA -->
            <span class="dash-hero-card__status-pill dash-hero-card__status-pill--${escaparHtml(proximaCita.estado.toLowerCase())}">
              ${escaparHtml(proximaCita.estado)}
            </span>
          </div>
          <h2 class="dash-hero-card__title"><span class="material-symbols-outlined">${infoEsp.icono}</span> ${escaparHtml(proximaCita.servicios || "Cita Médica")} para ${escaparHtml(proximaCita.mascota)}</h2>
          <p class="dash-hero-card__datetime"><span class="material-symbols-outlined">event</span> ${formatoFecha(proximaCita.fecha)}</p>
          <div class="dash-hero-card__meta">

            <!-- VETERINARIO ASIGNADO -->
            <span class="dash-hero-meta-item">
              <span class="material-symbols-outlined">person</span>
              <span>${escaparHtml(proximaCita.veterinario || "Veterinario Asignado")}</span>
            </span>

            <!-- UBICACIÓN DE LA CITA -->
            <span class="dash-hero-meta-item">
              <span class="material-symbols-outlined">location_on</span>
              <span>Sede Principal VetSalud</span>
            </span>
          </div>

          <!-- CONTENEDOR DE BOTONES DE ACCIÓN -->
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem;">

            <!-- BOTÓN PARA REPROGRAMAR LA CITA -->
            <button
              type="button"
              class="dash-hero-card__btn"
              onclick="prepararReprogramarCita(
                ${proximaCita.id_cita},
                '${escaparHtml(proximaCita.servicios || "Cita")} - ${escaparHtml(proximaCita.mascota)}',
                '${formatoFecha(proximaCita.fecha)}'
              )"
            >
              Reprogramar
            </button>

            <!-- BOTÓN PARA CANCELAR LA CITA -->
            <button
              type="button"
              class="dash-hero-card__btn"
              style="background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.4);"
              onclick="cancelarCitaPrompt(${proximaCita.id_cita})"
            >
              Cancelar
            </button>
          </div>
        </article>
      `;
    } else {
      /* CREA LA TARJETA ALTERNATIVA CUANDO NO EXISTEN CITAS */
      heroContainer.innerHTML = `
        <article class="dash-hero-card dash-hero-card--empty">

          <!-- ICONO DECORATIVO -->
          <div class="dash-hero-card__watermark">
            <span class="material-symbols-outlined">health_and_safety</span>
          </div>

          <!-- ETIQUETA DE SALUD PREVENTIVA -->
          <div class="dash-hero-card__top">
            <span class="dash-hero-card__badge">Salud Preventiva</span>
          </div>
          <h2 class="dash-hero-card__title"><span class="material-symbols-outlined">health_and_safety</span> ¡Mantén protegidos a tus peludos!</h2>
          <p class="dash-hero-card__datetime">No tienes citas médicas programadas actualmente.</p>
          <p style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 1.25rem;">
            Agenda revisiones periódicas, controles de vacunación o servicios de peluquería fácilmente.
          </p>

          <!-- CONTENEDOR DEL BOTÓN -->
          <div>

            <!-- BOTÓN PARA AGENDAR UNA NUEVA CITA -->
            <button
              type="button"
              class="dash-hero-card__btn"
              onclick="abrirModalAgendar()"
            >
              Agendar Nueva Cita
            </button>
          </div>
        </article>
      `;
    }
  }

  /* 4. RENDERIZAR LISTA DE MASCOTAS */

  /* BUSCA EL CONTENEDOR DE LAS TARJETAS DE MASCOTAS */
  const mascotasContainer = document.getElementById("pets-cards-container");

  /* COMPRUEBA SI EXISTE EL CONTENEDOR */
  if (mascotasContainer) {
    /* COMPRUEBA SI EL CLIENTE TIENE MASCOTAS */
    if (mascotas.length > 0) {
      /* GENERA UNA TARJETA PARA CADA MASCOTA */
      mascotasContainer.innerHTML = mascotas

        /* RECORRE TODAS LAS MASCOTAS */
        .map((mascota) => {
          /* OBTIENE LA INFORMACIÓN VISUAL DE LA ESPECIE */
          const infoEsp = obtenerInfoEspecie(mascota.especie);
          const esMacho = String(mascota.sexo || "").toUpperCase() === "M";
          const citasPendientes = citas.filter(
            (cita) =>
              cita.mascota === mascota.nombre &&
              ["PENDIENTE", "CONFIRMADA"].includes(
                String(cita.estado || "").toUpperCase(),
              ) &&
              new Date(cita.fecha) >= new Date(),
          );
          const fechaNac = mascota.fecha_nacimiento
            ? formatoSoloFecha(mascota.fecha_nacimiento)
            : null;

          /* DEVUELVE EL HTML DE LA TARJETA DE LA MASCOTA */
          return `
          <article class="dash-pet-card">

            <!-- ÁREA DE LA FOTO O ICONO DE LA MASCOTA -->
            <div class="dash-pet-card__photo-wrap ${infoEsp.clase}">
              ${mascota.foto ? `<img class="dash-pet-card__photo" src="${mascota.foto}" alt="Foto de ${escaparHtml(mascota.nombre)}">` : `<span class="dash-pet-card__emoji material-symbols-outlined" aria-label="${escaparHtml(mascota.especie)}">${infoEsp.icono}</span>`}
            </div>

            <!-- INFORMACIÓN DE LA MASCOTA -->
            <div class="dash-pet-card__details">

              <!-- ENCABEZADO DE LA INFORMACIÓN -->
              <div class="dash-pet-card__head">

                <!-- NOMBRE DE LA MASCOTA -->
                <h3 class="dash-pet-card__name">
                  ${escaparHtml(mascota.nombre)}
                </h3>

                <!-- INDICADOR DEL SEXO -->
                <span
                  class="dash-pet-card__gender ${esMacho ? "dash-pet-card__gender--male" : "dash-pet-card__gender--female"}"
                  title="${esMacho ? "Macho" : "Hembra"}"
                >
                  ${esMacho ? "♂" : "♀"}
                </span>
              </div>

              <!-- ESPECIE Y RAZA -->
              <p class="dash-pet-card__breed">
                ${infoEsp.nombre} • ${escaparHtml(mascota.raza || "Mestizo")}
              </p>

              <!-- ETIQUETAS DE INFORMACIÓN -->
              <div class="dash-pet-card__badges">
                <span class="dash-badge dash-badge--green">Expediente Activo</span>
                ${fechaNac ? `<span class="dash-badge dash-badge--grey">Nac: ${escaparHtml(fechaNac)}</span>` : ""}
                <span class="dash-badge ${citasPendientes.length ? "dash-badge--blue" : "dash-badge--grey"}">
                  <span class="material-symbols-outlined">${citasPendientes.length ? "event" : "event_busy"}</span>
                  ${citasPendientes.length ? `${citasPendientes.length} ${citasPendientes.length === 1 ? "cita pendiente" : "citas pendientes"}` : "Sin citas pendientes"}
                </span>
              </div>

              <!-- BOTONES DE ACCIÓN -->
              <div
                class="dash-pet-card__actions"
                style="display: flex; gap: 0.5rem; flex-wrap: wrap;"
              >

                <!-- BOTÓN PARA AGENDAR UNA CITA -->
                <button
                  type="button"
                  class="dash-btn-link"
                  onclick="agendarParaMascota('${escaparHtml(mascota.nombre)}')"
                >
                  <span class="material-symbols-outlined">
                    calendar_add_on
                  </span>
                  <span>Agendar Cita</span>
                </button>

                <!-- BOTÓN PARA VER EL HISTORIAL -->
                <button
                  type="button"
                  class="dash-btn-link"
                  onclick="filtrarHistorialPorMascota('${escaparHtml(mascota.nombre)}')"
                >
                  <span class="material-symbols-outlined">
                    folder_shared
                  </span>
                  <span>Historial</span>
                </button>
              </div>
            </div>
          </article>
        `;
        })

        /* UNE TODAS LAS TARJETAS EN UN SOLO HTML */
        .join("");
    } else {
      /* MUESTRA UN ESTADO VACÍO CUANDO NO HAY MASCOTAS */
      mascotasContainer.innerHTML = `
        <div class="dash-empty-state" style="grid-column: 1 / -1;">

          <!-- ICONO DEL ESTADO VACÍO -->
          <div class="dash-empty-state__icon-wrap">
            <span class="material-symbols-outlined">pets</span>
          </div>

          <!-- TÍTULO DEL MENSAJE -->
          <h3 class="dash-empty-state__title">
            Aún no tienes mascotas registradas
          </h3>

          <!-- DESCRIPCIÓN -->
          <p class="dash-empty-state__desc">
            Registra a tu perro, gato u otro compañero para poder agendar citas veterinarias, llevar su historial clínico y recibir recordatorios de vacunas.
          </p>

          <!-- BOTÓN PARA REGISTRAR LA PRIMERA MASCOTA -->
          <button
            type="button"
            class="dash-empty-state__btn"
            id="btn-empty-nueva-mascota"
          >
            <span class="material-symbols-outlined">add</span>
            <span>Registrar Primera Mascota</span>
          </button>
        </div>
      `;

      /* BUSCA EL BOTÓN CREADO PARA REGISTRAR UNA MASCOTA */
      const btnEmpty = document.getElementById("btn-empty-nueva-mascota");

      /* COMPRUEBA SI EL BOTÓN EXISTE */
      if (btnEmpty) {
        /* AGREGA EL EVENTO DE CLIC AL BOTÓN */
        btnEmpty.addEventListener("click", () => {
          /* ABRE EL MODAL PARA REGISTRAR UNA MASCOTA */
          abrirModal(document.getElementById("modal-nueva-mascota"));
        });
      }
    }
  }

  /* 5. RENDERIZAR CITAS MÉDICAS */

  /* BUSCA EL CONTENEDOR DE LAS CITAS */
  const citasContainer = document.getElementById("citas-container");

  /* COMPRUEBA SI EL CONTENEDOR EXISTE */
  if (citasContainer) {
    /* COMPRUEBA SI EXISTEN CITAS */
    if (citas.length > 0) {
      /* GENERA UNA TARJETA PARA CADA CITA */
      citasContainer.innerHTML = citas

        /* RECORRE LAS CITAS */
        .map((cita) => {
          /* OBTIENE LA INFORMACIÓN VISUAL DE LA ESPECIE */
          const infoEsp = obtenerInfoEspecie(cita.especie);

          /* OBTIENE EL ESTADO DE LA CITA EN MAYÚSCULAS */
          const estado = String(cita.estado || "PENDIENTE").toUpperCase();

          /* COMPRUEBA SI LA CITA SE PUEDE REPROGRAMAR O CANCELAR */
          const esPendienteOConfirmada =
            estado === "PENDIENTE" || estado === "CONFIRMADA";

          /* DEFINE LA CLASE CSS INICIAL PARA EL ESTADO */
          let badgeClase = "dash-status-pill--pending";

          /* CAMBIA LA CLASE SI LA CITA ESTÁ CONFIRMADA */
          if (estado === "CONFIRMADA")
            badgeClase = "dash-status-pill--confirmed";
          if (estado === "ATENDIDA") badgeClase = "dash-status-pill--completed";
          if (estado === "CANCELADA")
            badgeClase = "dash-status-pill--cancelled";

          /* CAMBIA LA CLASE SI LA CITA FUE CANCELADA */
          if (estado === "CANCELADA")
            badgeClase = "dash-status-pill--cancelled";

          /* DEVUELVE EL HTML DE LA CITA */
          return `
          <article
            class="dash-item-card"
            data-estado-cita="${escaparHtml(estado)}"
          >

            <!-- ENCABEZADO DE LA CITA -->
            <div class="dash-item-card__header">

              <!-- CONTENEDOR DEL TÍTULO -->
              <div class="dash-item-card__title-wrap">

                <!-- ICONO SEGÚN EL ESTADO DE LA CITA -->
                <span
                  class="material-symbols-outlined dash-item-icon ${estado === "ATENDIDA" ? "dash-item-icon--green" : "dash-item-icon--blue"}"
                >
                  ${estado === "ATENDIDA" ? "check_circle" : "event_available"}
                </span>

                <!-- INFORMACIÓN PRINCIPAL -->
                <div>

                  <!-- SERVICIO Y MASCOTA -->
                  <h3 class="dash-item-card__title">
                    ${escaparHtml(cita.servicios || "Consulta médica")} • ${escaparHtml(cita.mascota)} <span class="material-symbols-outlined">${infoEsp.icono}</span>
                  </h3>

                  <!-- ID DE CITA, ESPECIE Y RAZA -->
                  <span class="dash-item-card__sub">
                    Cita #${cita.id_cita}
                    • ${infoEsp.nombre}
                    ${escaparHtml(cita.raza || "")}
                  </span>
                </div>
              </div>

              <!-- ESTADO DE LA CITA -->
              <span class="dash-status-pill ${badgeClase}">
                ${escaparHtml(estado)}
              </span>
            </div>


            <!-- INFORMACIÓN DETALLADA DE LA CITA -->
            <div class="dash-item-card__grid">

              <!-- FECHA Y HORA -->
              <div class="dash-item-info-col">
                <span class="dash-item-label">Fecha y Hora</span>
                <strong class="dash-item-value">
                  ${formatoFecha(cita.fecha)}
                </strong>
              </div>

              <!-- VETERINARIO -->
              <div class="dash-item-info-col">
                <span class="dash-item-label">Veterinario</span>
                <strong class="dash-item-value">
                  ${escaparHtml(cita.veterinario || "Por Asignar")}
                </strong>
              </div>

              <!-- SERVICIO -->
              <div class="dash-item-info-col">
                <span class="dash-item-label">Servicio</span>
                <strong class="dash-item-value">
                  ${escaparHtml(cita.servicios || "Consulta")}
                </strong>
              </div>
            </div>


            <!-- MOTIVO DE LA CITA -->
            <div class="dash-item-card__reason">
              <strong>Motivo:</strong>
              ${escaparHtml(cita.motivo)}
            </div>


            <!-- BOTONES DE ACCIÓN -->
            <div class="dash-item-card__footer">

              ${
                esPendienteOConfirmada
                  ? /* SI ESTÁ PENDIENTE O CONFIRMADA, MUESTRA OPCIONES DE MODIFICACIÓN */
                    `
                <!-- BOTÓN PARA REPROGRAMAR -->
                <button
                  type="button"
                  class="dash-btn-action-outline"
                  onclick="prepararReprogramarCita(
                    ${cita.id_cita},
                    '${escaparHtml(cita.servicios || "Cita")} - ${escaparHtml(cita.mascota)}',
                    '${formatoFecha(cita.fecha)}'
                  )"
                >
                  <span class="material-symbols-outlined">
                    edit_calendar
                  </span>
                  <span>Reprogramar</span>
                </button>

                <!-- BOTÓN PARA CANCELAR -->
                <button
                  type="button"
                  class="dash-btn-action-danger"
                  onclick="cancelarCitaPrompt(${cita.id_cita})"
                >
                  <span class="material-symbols-outlined">
                    cancel
                  </span>
                  <span>Cancelar</span>
                </button>
              `
                  : /* SI LA CITA YA TERMINÓ, MUESTRA EL ACCESO AL HISTORIAL */
                    `
                <!-- BOTÓN PARA VER EL HISTORIAL DE LA MASCOTA -->
                <button
                  type="button"
                  class="dash-btn-action-outline"
                  onclick="filtrarHistorialPorMascota('${escaparHtml(cita.mascota)}')"
                >
                  <span class="material-symbols-outlined">
                    description
                  </span>
                  <span>Ver en Historial</span>
                </button>
              `
              }
            </div>
          </article>
        `;
        })

        /* UNE TODAS LAS TARJETAS DE CITAS */
        .join("");
    } else {
      /* MUESTRA UN ESTADO VACÍO SI NO HAY CITAS */
      citasContainer.innerHTML = `
        <div class="dash-empty-state">

          <!-- ICONO DEL ESTADO VACÍO -->
          <div class="dash-empty-state__icon-wrap">
            <span class="material-symbols-outlined">
              event_available
            </span>
          </div>

          <!-- TÍTULO -->
          <h3 class="dash-empty-state__title">
            No tienes citas médicas registradas
          </h3>

          <!-- DESCRIPCIÓN -->
          <p class="dash-empty-state__desc">
            Cuando programes una cita para tus mascotas, podrás ver aquí el estado, la fecha, el médico asignado y reprogramarla si lo necesitas.
          </p>

          <!-- BOTÓN PARA SOLICITAR UNA CITA -->
          <button
            type="button"
            class="dash-empty-state__btn"
            onclick="abrirModalAgendar()"
          >
            <span class="material-symbols-outlined">
              calendar_add_on
            </span>
            <span>Solicitar Cita Ahora</span>
          </button>
        </div>
      `;
    }
  }

  /*  6. RENDERIZAR HISTORIAL CLÍNICO */

  /* BUSCA EL CONTENEDOR DEL HISTORIAL */
  const historialContainer = document.getElementById("historial-container");

  /* BUSCA EL SELECTOR PARA FILTRAR POR MASCOTA */
  const filtroMascotaHistorial = document.getElementById(
    "filtro-mascota-historial",
  );

  /* COMPRUEBA SI EXISTE EL SELECTOR */
  if (filtroMascotaHistorial) {
    /* CREA LA OPCIÓN GENERAL Y LAS OPCIONES DE CADA MASCOTA */
    filtroMascotaHistorial.innerHTML =
      '<option value="todas">Todas las mascotas</option>' +
      /* RECORRE LAS MASCOTAS PARA CREAR LAS OPCIONES */
      mascotas
        .map(
          (m) =>
            `<option value="${escaparHtml(m.nombre)}">${escaparHtml(m.nombre)} (${escaparHtml(m.especie)})</option>`,
        )

        /* UNE TODAS LAS OPCIONES */
        .join("");
  }

  /* COMPRUEBA SI EXISTE EL CONTENEDOR DEL HISTORIAL */
  if (historialContainer) {
    /* COMPRUEBA SI EXISTEN HISTORIAS CLÍNICAS */
    if (historias.length > 0) {
      /* GENERA UNA TARJETA POR CADA HISTORIA */
      historialContainer.innerHTML = historias

        /* RECORRE TODAS LAS HISTORIAS */
        .map((h) => {
          /* OBTIENE LA INFORMACIÓN VISUAL DE LA ESPECIE */
          const infoEsp = obtenerInfoEspecie(h.especie);

          /* CONVIERTE LA FECHA DE LA HISTORIA EN UN OBJETO DATE */
          const fechaObj = new Date(h.fecha);

          /* OBTIENE EL DÍA CON DOS DÍGITOS */
          const dia = String(fechaObj.getDate()).padStart(2, "0");

          /* OBTIENE EL MES ABREVIADO */
          const mes = fechaObj
            .toLocaleString("es-CO", { month: "short" })
            .toUpperCase();

          /* OBTIENE EL AÑO */
          const anio = fechaObj.getFullYear();

          /* DEVUELVE LA TARJETA DEL HISTORIAL */
          return `
          <article
            class="dash-history-card"
            data-mascota="${escaparHtml(h.mascota)}"
          >

            <!-- FECHA DE LA HISTORIA -->
            <div class="dash-history-card__badge-date">
              <span class="dash-history-day">${dia}</span>
              <span class="dash-history-month">${mes} ${anio}</span>
            </div>

            <!-- INFORMACIÓN DE LA HISTORIA -->
            <div class="dash-history-card__body">

              <!-- ENCABEZADO -->
              <div class="dash-history-card__head">

                <!-- DATOS PRINCIPALES -->
                <div>

                  <!-- TÍTULO DE LA HISTORIA -->
                  <h3 class="dash-history-card__title">
                    Consulta • ${escaparHtml(h.mascota)} <span class="material-symbols-outlined">${infoEsp.icono}</span>
                  </h3>

                  <!-- VETERINARIO Y FECHA -->
                  <span class="dash-history-card__vet">
                    Atendido por:
                    ${escaparHtml(h.veterinario)}
                    • ${formatoFecha(h.fecha)}
                  </span>
                </div>

                <!-- ETIQUETA DE REGISTRO CLÍNICO -->
                <span class="dash-badge dash-badge--green">
                  Registro Clínico
                </span>
              </div>


              <!-- INFORMACIÓN CLÍNICA -->
              <div class="dash-history-details-grid">

                <!-- SÍNTOMAS -->
                <div class="dash-history-box">

                  <!-- TÍTULO DE SÍNTOMAS -->
                  <span class="dash-history-box__label">
                    <span class="material-symbols-outlined">
                      stethoscope
                    </span>
                    Síntomas Referidos
                  </span>

                  <!-- DESCRIPCIÓN DE SÍNTOMAS -->
                  <p class="dash-history-box__text">
                    ${escaparHtml(h.sintomas || "Sin síntomas descritos")}
                  </p>
                </div>


                <!-- DIAGNÓSTICO -->
                <div class="dash-history-box">

                  <!-- TÍTULO DEL DIAGNÓSTICO -->
                  <span class="dash-history-box__label">
                    <span class="material-symbols-outlined">
                      clinical_notes
                    </span>
                    Diagnóstico Médico
                  </span>

                  <!-- DESCRIPCIÓN DEL DIAGNÓSTICO -->
                  <p class="dash-history-box__text">
                    ${escaparHtml(h.diagnostico || "Sin diagnóstico registrado")}
                  </p>
                </div>
              </div>
              ${h.tratamientos ? `<p class="dash-history-card__treatment"><strong>Tratamiento:</strong> ${escaparHtml(h.tratamientos)}</p>` : ""}
              ${h.vacunas ? `<p class="dash-history-card__treatment"><strong>Vacunas registradas:</strong> ${escaparHtml(h.vacunas)}</p>` : ""}
              ${
                h.prox_visita
                  ? /* SI EXISTE UNA PRÓXIMA VISITA, LA MUESTRA */
                    `
                <div class="dash-history-card__foot">

                  <!-- INFORMACIÓN DE LA PRÓXIMA VISITA -->
                  <span class="dash-next-visit">
                    <span class="material-symbols-outlined">
                      event_repeat
                    </span>
                    Próxima visita recomendada:
                    <strong>
                      ${formatoSoloFecha(h.prox_visita)}
                    </strong>
                  </span>
                </div>
              `
                  : /* SI NO EXISTE PRÓXIMA VISITA, NO AGREGA NADA */
                    ""
              }
            </div>
          </article>
        `;
        })

        /* UNE TODAS LAS HISTORIAS EN UN SOLO HTML */
        .join("");
    } else {
      /* MUESTRA UN ESTADO VACÍO CUANDO NO HAY HISTORIAS */
      historialContainer.innerHTML = `
        <div class="dash-empty-state">

          <!-- ICONO DEL ESTADO VACÍO -->
          <div class="dash-empty-state__icon-wrap">
            <span class="material-symbols-outlined">
              history_edu
            </span>
          </div>

          <!-- TÍTULO -->
          <h3 class="dash-empty-state__title">
            Sin historias clínicas todavía
          </h3>

          <!-- DESCRIPCIÓN -->
          <p class="dash-empty-state__desc">
            Los expedientes médicos, recetas y evoluciones clínicas aparecerán aquí automáticamente tras cada atención veterinaria en nuestras sedes.
          </p>
        </div>
      `;
    }
  }

  /*  7. RENDERIZAR COMPRAS Y PEDIDOS */

  /* BUSCA EL CONTENEDOR DE LAS COMPRAS */
  const comprasContainer = document.getElementById("compras-container");

  /* COMPRUEBA SI EXISTE EL CONTENEDOR */
  if (comprasContainer) {
    /* COMPRUEBA SI EL CLIENTE TIENE COMPRAS */
    if (compras.length > 0) {
      /* GENERA UNA TARJETA POR CADA COMPRA */
      comprasContainer.innerHTML = compras

        /* RECORRE TODAS LAS COMPRAS */
        .map(
          (compra) => `

        <!-- TARJETA DEL PEDIDO -->
        <article
          class="dash-order-card"
          data-estado-compra="${escaparHtml(compra.estado)}"
        >

          <!-- ENCABEZADO DEL PEDIDO -->
          <div class="dash-order-card__header">

            <!-- INFORMACIÓN DEL PEDIDO -->
            <div class="dash-order-card__meta">

              <!-- NÚMERO DEL PEDIDO -->
              <span class="dash-order-id">
                Pedido #${compra.id_venta}
              </span>

              <!-- FECHA DEL PEDIDO -->
              <span class="dash-order-date">
                ${formatoFecha(compra.fecha)}
              </span>
            </div>


            <!-- ESTADO Y MÉTODO DE PAGO -->
            <div class="dash-order-card__badges">

              <!-- MÉTODO DE PAGO -->
              <span class="dash-payment-pill">
                ${escaparHtml(compra.metodo_pago)}
              </span>

              <!-- ESTADO DE LA COMPRA -->
              <span class="dash-status-pill dash-status-pill--completed">
                ${escaparHtml(compra.estado)}
              </span>
            </div>
          </div>
          ${compra.productos ? `<p class="dash-order-products"><strong>Productos:</strong> ${escaparHtml(compra.productos)}</p>` : ""}
          <div class="dash-order-card__footer">

            <!-- TOTAL DEL PEDIDO -->
            <div class="dash-order-total-wrap">

              <!-- TEXTO DEL TOTAL -->
              <span class="dash-order-total-label">
                Total Facturado:
              </span>

              <!-- VALOR TOTAL -->
              <strong class="dash-order-total-amount">
                $${Number(compra.total).toLocaleString("es-CO")} COP
              </strong>
            </div>


            <!-- BOTÓN PARA VER EL COMPROBANTE -->
            <button
              type="button"
              class="dash-btn-action-outline"
              onclick="verReciboPedido(
                '${compra.id_venta}',
                '$${Number(compra.total).toLocaleString("es-CO")}',
                '${formatoFecha(compra.fecha)}',
                '${escaparHtml(compra.metodo_pago)}'
              )"
            >
              <span class="material-symbols-outlined">
                receipt_long
              </span>
              <span>Ver Comprobante</span>
            </button>
          </div>
        </article>
      `,
        )

        /* UNE TODAS LAS TARJETAS DE PEDIDOS */
        .join("");
    } else {
      /* MUESTRA UN ESTADO VACÍO CUANDO NO HAY PEDIDOS */
      comprasContainer.innerHTML = `
        <div class="dash-empty-state">

          <!-- ICONO DEL ESTADO VACÍO -->
          <div class="dash-empty-state__icon-wrap">
            <span class="material-symbols-outlined">
              shopping_bag
            </span>
          </div>

          <!-- TÍTULO -->
          <h3 class="dash-empty-state__title">
            No tienes pedidos realizados
          </h3>

          <!-- DESCRIPCIÓN -->
          <p class="dash-empty-state__desc">
            Encuentra alimentos balanceados de alta gama, medicamentos, juguetes y accesorios de bienestar en nuestra tienda virtual.
          </p>

          <!-- ENLACE PARA IR A LA TIENDA -->
          <a
            href="tienda.html"
            class="dash-empty-state__btn"
          >
            <span class="material-symbols-outlined">
              add_shopping_cart
            </span>
            <span>Explorar Tienda</span>
          </a>
        </div>
      `;
    }
  }

  /*  8. ACTUALIZAR OPCIONES DEL MODAL DE AGENDAR CITA*/

  /* BUSCA EL SELECTOR DE MASCOTAS DEL MODAL */
  const modalMascotaSelect = document.getElementById("cita-mascota");

  /* COMPRUEBA SI EXISTE EL SELECTOR */
  if (modalMascotaSelect) {
    /* COMPRUEBA SI EL CLIENTE TIENE MASCOTAS */
    if (mascotas.length > 0) {
      /* CREA LAS OPCIONES DE LAS MASCOTAS */
      modalMascotaSelect.innerHTML =
        '<option value="">Selecciona mascota</option>' +
        /* RECORRE LAS MASCOTAS */
        mascotas
          .map((m) => {
            /* OBTIENE LA INFORMACIÓN VISUAL DE LA ESPECIE */
            const info = obtenerInfoEspecie(m.especie);
            return `<option value="${escaparHtml(m.nombre)}">${escaparHtml(m.nombre)} (${escaparHtml(m.especie)})</option>`;
          })

          /* UNE TODAS LAS OPCIONES */
          .join("");
    } else {
      /* INDICA QUE PRIMERO DEBE REGISTRARSE UNA MASCOTA */
      modalMascotaSelect.innerHTML =
        '<option value="">Primero registra una mascota</option>';
    }
  }
}

/**
 * MUESTRA UNA NOTIFICACIÓN TEMPORAL EN PANTALLA.
 */
function mostrarToast(mensaje, esError = false) {
  /* BUSCA EL ELEMENTO DEL TOAST */
  const toast = document.getElementById("dash-toast");

  /* SI NO EXISTE, DETIENE LA FUNCIÓN */
  if (!toast) return;

  /* COLOCA EL MENSAJE DENTRO DEL TOAST */
  toast.textContent = mensaje;

  /* APLICA LA CLASE BASE Y, SI CORRESPONDE, LA CLASE DE ERROR */
  toast.className = `dash-toast show ${esError ? "dash-toast--error" : ""}`;

  /* CREA UN TEMPORIZADOR PARA OCULTAR EL TOAST */
  setTimeout(() => {
    /* QUITA LA CLASE QUE LO MANTIENE VISIBLE */
    toast.classList.remove("show");

    /* ESPERA 4 SEGUNDOS ANTES DE OCULTARLO */
  }, 4000);
}

/* HACE LA FUNCIÓN DEL TOAST ACCESIBLE DESDE EL HTML */
window.mostrarToast = mostrarToast;

/**
 * ABRE EL MODAL DE AGENDAR Y PRESELECCIONA UNA MASCOTA.
 */
window.agendarParaMascota = function (nombreMascota) {
  /* BUSCA EL MODAL DE AGENDAR CITA */
  const modalAgendar = document.getElementById("modal-agendar-cita");

  /* BUSCA EL SELECTOR DE MASCOTAS */
  const selectMascota = document.getElementById("cita-mascota");

  /* COMPRUEBA SI EXISTE EL SELECTOR */
  if (selectMascota) {
    /* SELECCIONA AUTOMÁTICAMENTE LA MASCOTA */
    selectMascota.value = nombreMascota;
  }

  /* ABRE EL MODAL */
  abrirModal(modalAgendar);
};

/* CREA UNA FUNCIÓN GLOBAL PARA ABRIR EL MODAL DE AGENDAR */
window.abrirModalAgendar = function () {
  /* BUSCA EL MODAL DE AGENDAR CITA */
  const modalAgendar = document.getElementById("modal-agendar-cita");

  /* ABRE EL MODAL */
  abrirModal(modalAgendar);
};

/**
 * CAMBIA A LA PESTAÑA DE HISTORIAL Y FILTRA POR MASCOTA.
 */
window.filtrarHistorialPorMascota = function (nombreMascota) {
  /* CAMBIA A LA PESTAÑA DEL HISTORIAL */
  cambiarTab("historial");

  /* BUSCA EL SELECTOR DE MASCOTAS DEL HISTORIAL */
  const filtro = document.getElementById("filtro-mascota-historial");

  /* COMPRUEBA SI EL SELECTOR EXISTE */
  if (filtro) {
    /* SELECCIONA LA MASCOTA INDICADA */
    filtro.value = nombreMascota;

    /* SIMULA UN CAMBIO PARA ACTIVAR EL FILTRO */
    filtro.dispatchEvent(new Event("change"));
  }
};

/**
 * PREPARA EL MODAL PARA REPROGRAMAR UNA CITA.
 */
window.prepararReprogramarCita = function (idCita, titulo, fechaActual) {
  /* GUARDA EL ID DE LA CITA QUE SE VA A REPROGRAMAR */
  idCitaReprogramarActual = idCita;

  /* BUSCA EL ELEMENTO QUE MUESTRA LA INFORMACIÓN DE LA CITA */
  const subInfo = document.getElementById("reprogramar-sub-info");

  /* COMPRUEBA SI EL ELEMENTO EXISTE */
  if (subInfo) {
    /* MUESTRA EL SERVICIO Y HORARIO ACTUAL */
    subInfo.innerHTML = `Cita: <strong>${escaparHtml(titulo)}</strong><br>Horario actual: ${escaparHtml(fechaActual)}`;
  }

  /* BUSCA EL MODAL DE REPROGRAMACIÓN */
  const modal = document.getElementById("modal-reprogramar");

  /* ABRE EL MODAL */
  abrirModal(modal);
};

/**
 * CANCELA UNA CITA MÉDICA DESPUÉS DE PEDIR CONFIRMACIÓN.
 */
window.cancelarCitaPrompt = async function (idCita) {
  /* PREGUNTA AL USUARIO SI ESTÁ SEGURO DE CANCELAR */
  if (
    !confirm(
      `¿Estás seguro de cancelar la cita médica #${idCita}? Esta acción liberará el horario.`,
    )
  ) {
    /* DETIENE LA FUNCIÓN SI EL USUARIO CANCELA LA CONFIRMACIÓN */
    return;
  }

  /* INTENTA CANCELAR LA CITA MEDIANTE EL BACKEND */
  try {
    /* OBTIENE EL TOKEN ACTUAL */
    const token = localStorage.getItem("vetsalud_token") || "";

    /* ENVÍA UNA PETICIÓN PUT PARA CANCELAR LA CITA */
    const res = await fetch(`/api/citas/${idCita}/cancelar`, {
      method: "PUT",

      /* INDICA QUE LA PETICIÓN USA JSON */
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    /* CONVIERTE LA RESPUESTA DEL SERVIDOR A JSON */
    const data = await res.json();

    mostrarToast(`Cita #${idCita} cancelada correctamente.`);
    await cargarDashboard();

    /* CAPTURA LOS ERRORES DE LA PETICIÓN */
  } catch (err) {
    mostrarToast(err.message, true);
  }
};

/**
 * MUESTRA EL COMPROBANTE DE UN PEDIDO.
 */
window.verReciboPedido = function (idVenta, total, fecha, metodo) {
  /* BUSCA EL MODAL DEL COMPROBANTE */
  const modal = document.getElementById("modal-recibo");

  /* BUSCA EL ELEMENTO DEL NÚMERO DE PEDIDO */
  const numInfo = document.getElementById("recibo-num-info");

  /* BUSCA EL ELEMENTO DEL MÉTODO DE PAGO */
  const metodoEl = document.getElementById("recibo-metodo");

  /* BUSCA EL ELEMENTO DEL TOTAL */
  const totalEl = document.getElementById("recibo-total-amount");

  /* MUESTRA EL NÚMERO Y FECHA DEL PEDIDO */
  if (numInfo) numInfo.textContent = `Ticket de Venta #${idVenta} (${fecha})`;

  /* MUESTRA EL MÉTODO DE PAGO */
  if (metodoEl) metodoEl.textContent = metodo;

  /* MUESTRA EL TOTAL DEL PEDIDO */
  if (totalEl) totalEl.textContent = `${total} COP`;

  /* ABRE EL MODAL DEL COMPROBANTE */
  abrirModal(modal);
};

/* CONTROL DE APERTURA Y CIERRE DE MODALES */

/* ABRE UN MODAL RECIBIDO COMO PARÁMETRO */
function abrirModal(modal) {
  /* SI EL MODAL NO EXISTE, DETIENE LA FUNCIÓN */
  if (!modal) return;

  /* AGREGA LA CLASE QUE MUESTRA EL MODAL */
  modal.classList.add("activo");

  /* INDICA QUE EL MODAL ESTÁ VISIBLE */
  modal.setAttribute("aria-hidden", "false");

  /* BLOQUEA EL SCROLL DEL BODY MIENTRAS EL MODAL ESTÁ ABIERTO */
  document.body.style.overflow = "hidden";
}

/* CIERRA UN MODAL RECIBIDO COMO PARÁMETRO */
function cerrarModal(modal) {
  /* SI EL MODAL NO EXISTE, DETIENE LA FUNCIÓN */
  if (!modal) return;

  /* ELIMINA LA CLASE QUE MUESTRA EL MODAL */
  modal.classList.remove("activo");

  /* INDICA QUE EL MODAL ESTÁ OCULTO */
  modal.setAttribute("aria-hidden", "true");

  /* RESTAURA EL SCROLL NORMAL DE LA PÁGINA */
  document.body.style.overflow = "";
}

/*  NAVEGACIÓN ENTRE PESTAÑAS */

/* CAMBIA LA PESTAÑA ACTIVA DEL DASHBOARD */
function cambiarTab(targetTabId) {
  /* OBTIENE TODOS LOS BOTONES DE NAVEGACIÓN */
  const navItems = document.querySelectorAll(".dash-nav-item");

  /* OBTIENE TODOS LOS CONTENIDOS DE LAS PESTAÑAS */
  const tabContents = document.querySelectorAll(".dash-tab-content");

  /* RECORRE LOS BOTONES DE NAVEGACIÓN */
  navItems.forEach((btn) => {
    /* ACTIVA SOLAMENTE EL BOTÓN QUE CORRESPONDE A LA PESTAÑA */
    btn.classList.toggle("active", btn.dataset.tab === targetTabId);
  });

  /* RECORRE LOS CONTENIDOS DE LAS PESTAÑAS */
  tabContents.forEach((content) => {
    /* ACTIVA SOLAMENTE EL CONTENIDO DE LA PESTAÑA SELECCIONADA */
    content.classList.toggle("active", content.id === `tab-${targetTabId}`);
  });

  /* LLEVA EL SCROLL HASTA EL INICIO DE LA PÁGINA */
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  /* BUSCA EL MENÚ LATERAL */
  const sidebar = document.getElementById("dash-sidebar");

  /* BUSCA EL FONDO OSCURO DEL MENÚ MÓVIL */
  const backdrop = document.getElementById("dash-backdrop");

  /* CIERRA EL SIDEBAR SI ESTÁ ABIERTO */
  if (sidebar) sidebar.classList.remove("open");

  /* OCULTA EL FONDO DEL MENÚ */
  if (backdrop) backdrop.classList.remove("show");

  /* RESTAURA EL SCROLL NORMAL */
  document.body.style.overflow = "";
}

/*  INICIALIZACIÓN DE EVENTOS DEL DOM */

/* ESPERA A QUE TODO EL HTML ESTÉ CARGADO */
document.addEventListener("DOMContentLoaded", async () => {
  cargarHorarios("cita-hora");
  cargarHorarios("nuevo-horario");
  configurarFechasCita();

  // Permite mostrar u ocultar cada contraseña del formulario de seguridad.
  document.querySelectorAll("[data-password-target]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const campo = document.getElementById(boton.dataset.passwordTarget);
      const icono = boton.querySelector(".material-symbols-outlined");
      if (!campo || !icono) return;
      const visible = campo.type === "text";
      campo.type = visible ? "password" : "text";
      icono.textContent = visible ? "visibility_off" : "visibility";
      boton.setAttribute(
        "aria-label",
        visible ? "Ver contraseña" : "Ocultar contraseña",
      );
    });
  });

  /* INTENTA INICIALIZAR LOS DATOS DEL DASHBOARD */
  try {
    /* CARGA LOS SERVICIOS DISPONIBLES */
    await cargarServicios();

    /* CARGA TODA LA INFORMACIÓN DEL CLIENTE */
    await cargarDashboard();

    /* CAPTURA ERRORES DURANTE LA INICIALIZACIÓN */
  } catch (error) {
    /* MUESTRA EL ERROR EN LA CONSOLA */
    console.error("Error al inicializar dashboard:", error);
  }

  /*  NAVEGACIÓN DE PESTAÑAS */

  /* BUSCA TODOS LOS BOTONES DE NAVEGACIÓN */
  document.querySelectorAll(".dash-nav-item").forEach((btn) => {
    /* AGREGA EL EVENTO DE CLIC */
    btn.addEventListener("click", () => {
      /* OBTIENE EL ID DE LA PESTAÑA DESDE DATA-TAB */
      const tabId = btn.dataset.tab;

      /* CAMBIA A LA PESTAÑA SI EXISTE */
      if (tabId) cambiarTab(tabId);
    });
  });

  /*  KPI CARDS */

  /* BUSCA ELEMENTOS QUE PUEDAN NAVEGAR ENTRE PESTAÑAS */
  document.querySelectorAll("[data-navigate-tab]").forEach((card) => {
    /* AGREGA EL EVENTO DE CLIC */
    card.addEventListener("click", () => {
      /* OBTIENE LA PESTAÑA DESTINO */
      const tab = card.dataset.navigateTab;

      /* CAMBIA A LA PESTAÑA CORRESPONDIENTE */
      if (tab) cambiarTab(tab);
    });
  });

  /* CERRAR SESIÓN */

  /* BUSCA EL BOTÓN DE CERRAR SESIÓN */
  const logoutBtn = document.querySelector(".dash-logout-btn");

  /* COMPRUEBA SI EXISTE */
  if (logoutBtn) {
    /* AGREGA EL EVENTO DE CLIC */
    logoutBtn.addEventListener("click", () => {
      /* ELIMINA LOS DATOS DEL USUARIO */
      localStorage.removeItem("vetsalud_usuario");

      /* ELIMINA EL TOKEN */
      localStorage.removeItem("vetsalud_token");
    });
  }

  /* MENÚ HAMBURGUESA PARA MÓVILES */

  /* BUSCA EL SIDEBAR */
  const sidebar = document.getElementById("dash-sidebar");

  /* BUSCA EL BOTÓN DEL MENÚ */
  const menuToggle = document.getElementById("dash-menu-toggle");

  /* BUSCA EL FONDO DEL MENÚ */
  const backdrop = document.getElementById("dash-backdrop");

  /* COMPRUEBA SI EXISTE EL BOTÓN DEL MENÚ */
  if (menuToggle) {
    /* AGREGA EL EVENTO DE CLIC */
    menuToggle.addEventListener("click", () => {
      /* ABRE EL SIDEBAR */
      if (sidebar) sidebar.classList.add("open");

      /* MUESTRA EL FONDO */
      if (backdrop) backdrop.classList.add("show");

      /* BLOQUEA EL SCROLL */
      document.body.style.overflow = "hidden";
    });
  }

  /* COMPRUEBA SI EXISTE EL FONDO DEL MENÚ */
  if (backdrop) {
    /* AGREGA EL EVENTO DE CLIC */
    backdrop.addEventListener("click", () => {
      /* CIERRA EL SIDEBAR */
      if (sidebar) sidebar.classList.remove("open");

      /* OCULTA EL FONDO */
      if (backdrop) backdrop.classList.remove("show");

      /* RESTAURA EL SCROLL */
      document.body.style.overflow = "";
    });
  }

  /*  BOTONES PARA ABRIR MODALES */

  /* BUSCA EL MODAL PARA CREAR UNA MASCOTA */
  const modalNuevaMascota = document.getElementById("modal-nueva-mascota");

  /* BUSCA EL MODAL PARA AGENDAR UNA CITA */
  const modalAgendarCita = document.getElementById("modal-agendar-cita");

  /* BUSCA EL MODAL PARA REPROGRAMAR */
  const modalReprogramar = document.getElementById("modal-reprogramar");

  /* BUSCA EL BOTÓN SUPERIOR PARA CREAR UNA MASCOTA */
  const btnTopNuevaMascota = document.getElementById("btn-top-nueva-mascota");

  /* BUSCA EL BOTÓN RÁPIDO PARA CREAR UNA MASCOTA */
  const btnQuickNuevaMascota = document.getElementById(
    "btn-quick-nueva-mascota",
  );

  /* COMPRUEBA SI EXISTE EL BOTÓN SUPERIOR */
  if (btnTopNuevaMascota) {
    /* ABRE EL MODAL DE NUEVA MASCOTA AL HACER CLIC */
    btnTopNuevaMascota.addEventListener("click", () =>
      abrirModal(modalNuevaMascota),
    );
  }

  /* COMPRUEBA SI EXISTE EL BOTÓN RÁPIDO */
  if (btnQuickNuevaMascota) {
    /* ABRE EL MODAL DE NUEVA MASCOTA */
    btnQuickNuevaMascota.addEventListener("click", () =>
      abrirModal(modalNuevaMascota),
    );
  }

  /* BUSCA EL BOTÓN RÁPIDO PARA AGENDAR */
  const btnQuickAgendar = document.getElementById("btn-quick-agendar");

  /* BUSCA EL BOTÓN DE AGENDAR DESDE LA PESTAÑA DE CITAS */
  const btnAgendarDesdeCitas = document.getElementById(
    "btn-agendar-desde-citas",
  );

  /* COMPRUEBA SI EXISTE EL BOTÓN RÁPIDO */
  if (btnQuickAgendar) {
    /* ABRE EL MODAL DE AGENDAR */
    btnQuickAgendar.addEventListener("click", () =>
      abrirModal(modalAgendarCita),
    );
  }

  /* COMPRUEBA SI EXISTE EL BOTÓN DE AGENDAR DESDE CITAS */
  if (btnAgendarDesdeCitas) {
    /* ABRE EL MODAL DE AGENDAR */
    btnAgendarDesdeCitas.addEventListener("click", () =>
      abrirModal(modalAgendarCita),
    );
  }

  /* BUSCA EL BOTÓN RÁPIDO DEL HISTORIAL */
  const btnQuickHistorial = document.getElementById("btn-quick-historial");

  /* COMPRUEBA SI EXISTE */
  if (btnQuickHistorial) {
    /* CAMBIA DIRECTAMENTE A LA PESTAÑA DEL HISTORIAL */
    btnQuickHistorial.addEventListener("click", () => cambiarTab("historial"));
  }

  /*  CERRAR MODALES */

  /* BUSCA TODOS LOS ELEMENTOS QUE TIENEN DATA-CLOSE-MODAL */
  document.querySelectorAll("[data-close-modal]").forEach((elem) => {
    /* AGREGA EL EVENTO DE CLIC */
    elem.addEventListener("click", () => {
      /* BUSCA EL MODAL PADRE DEL ELEMENTO */
      const modal = elem.closest(".dash-modal");

      /* CIERRA EL MODAL */
      cerrarModal(modal);
    });
  });

  /* ESCUCHA LAS TECLAS PRESIONADAS */
  document.addEventListener("keydown", (e) => {
    /* COMPRUEBA SI SE PRESIONÓ ESCAPE */
    if (e.key === "Escape") {
      /* CIERRA TODOS LOS MODALES ACTIVOS */
      document.querySelectorAll(".dash-modal.activo").forEach((m) => {
        /* CIERRA CADA MODAL */
        cerrarModal(m);
      });

      /* CIERRA EL SIDEBAR */
      if (sidebar) sidebar.classList.remove("open");

      /* OCULTA EL BACKDROP */
      if (backdrop) backdrop.classList.remove("show");

      /* RESTAURA EL SCROLL */
      document.body.style.overflow = "";
    }
  });

  /*  FILTROS DE CITAS MÉDICAS */

  /* BUSCA TODOS LOS BOTONES DE FILTRO DE CITAS */
  const filterChipsCitas = document.querySelectorAll("[data-filter-cita]");

  /* BUSCA EL CONTENEDOR DE LAS CITAS */
  const citasContainer = document.getElementById("citas-container");

  /* RECORRE TODOS LOS FILTROS DE CITAS */
  filterChipsCitas.forEach((chip) => {
    /* AGREGA EL EVENTO DE CLIC */
    chip.addEventListener("click", () => {
      /* QUITA LA CLASE ACTIVA DE TODOS LOS FILTROS */
      filterChipsCitas.forEach((c) => c.classList.remove("active"));

      /* ACTIVA EL FILTRO SELECCIONADO */
      chip.classList.add("active");

      /* OBTIENE EL ESTADO QUE REPRESENTA EL FILTRO */
      const estado = chip.dataset.filterCita;

      /* OBTIENE TODAS LAS TARJETAS DE CITAS */
      const cards = citasContainer
        ? citasContainer.querySelectorAll(".dash-item-card")
        : [];

      /* RECORRE TODAS LAS TARJETAS */
      cards.forEach((card) => {
        /* MUESTRA LA TARJETA SI COINCIDE CON EL FILTRO */
        if (estado === "todas" || card.dataset.estadoCita === estado) {
          /* MUESTRA LA TARJETA */
          card.style.display = "block";
        } else {
          /* OCULTA LA TARJETA */
          card.style.display = "none";
        }
      });
    });
  });

  /*  FILTRO DE HISTORIAL POR MASCOTA */

  /* BUSCA EL SELECTOR DE MASCOTAS */
  const filtroMascotaHistorial = document.getElementById(
    "filtro-mascota-historial",
  );

  /* BUSCA EL CONTENEDOR DEL HISTORIAL */
  const historialContainer = document.getElementById("historial-container");

  /* COMPRUEBA SI AMBOS ELEMENTOS EXISTEN */
  if (filtroMascotaHistorial && historialContainer) {
    /* ESCUCHA LOS CAMBIOS DEL SELECTOR */
    filtroMascotaHistorial.addEventListener("change", (e) => {
      /* OBTIENE LA MASCOTA SELECCIONADA */
      const seleccion = e.target.value;

      /* OBTIENE TODAS LAS TARJETAS DEL HISTORIAL */
      const items = historialContainer.querySelectorAll(".dash-history-card");

      /* RECORRE TODAS LAS TARJETAS */
      items.forEach((card) => {
        /* MUESTRA TODAS O SOLO LA MASCOTA SELECCIONADA */
        if (seleccion === "todas" || card.dataset.mascota === seleccion) {
          /* MUESTRA LA TARJETA */
          card.style.display = "flex";
        } else {
          /* OCULTA LA TARJETA */
          card.style.display = "none";
        }
      });
    });
  }

  /*  FILTROS DE COMPRAS */

  /* BUSCA TODOS LOS FILTROS DE COMPRAS */
  const filterChipsCompras = document.querySelectorAll("[data-filter-compra]");

  /* BUSCA EL CONTENEDOR DE LAS COMPRAS */
  const comprasContainer = document.getElementById("compras-container");

  /* RECORRE TODOS LOS FILTROS */
  filterChipsCompras.forEach((chip) => {
    /* AGREGA EL EVENTO DE CLIC */
    chip.addEventListener("click", () => {
      /* QUITA EL ESTADO ACTIVO DE TODOS LOS FILTROS */
      filterChipsCompras.forEach((c) => c.classList.remove("active"));

      /* ACTIVA EL FILTRO SELECCIONADO */
      chip.classList.add("active");

      /* OBTIENE EL ESTADO SELECCIONADO */
      const estado = chip.dataset.filterCompra;

      /* OBTIENE TODAS LAS TARJETAS DE PEDIDOS */
      const cards = comprasContainer
        ? comprasContainer.querySelectorAll(".dash-order-card")
        : [];

      /* RECORRE TODAS LAS TARJETAS */
      cards.forEach((card) => {
        /* MUESTRA LAS TARJETAS QUE COINCIDAN */
        if (estado === "todas" || card.dataset.estadoCompra === estado) {
          /* MUESTRA LA TARJETA */
          card.style.display = "block";
        } else {
          /* OCULTA LA TARJETA */
          card.style.display = "none";
        }
      });
    });
  });

  // ===========
  // FORMULARIO: REGISTRAR NUEVA MASCOTA -> POST /api/mascotas
  // ===========
  const formNuevaMascota = document.getElementById("form-nueva-mascota");
  if (formNuevaMascota) {
    const campoFoto = document.getElementById("mascota-foto");
    const vistaPreviaFoto = document.getElementById("mascota-foto-preview");
    campoFoto?.addEventListener("change", () => {
      const archivo = campoFoto.files?.[0];
      if (!archivo) {
        vistaPreviaFoto.hidden = true;
        vistaPreviaFoto.removeAttribute("src");
        return;
      }
      vistaPreviaFoto.src = URL.createObjectURL(archivo);
      vistaPreviaFoto.hidden = false;
    });

    formNuevaMascota.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("mascota-nombre").value.trim();
      const especie = document.getElementById("mascota-especie").value;
      const raza = document.getElementById("mascota-raza").value.trim();
      const sexo = document.getElementById("mascota-sexo").value;
      const fechaNacimiento =
        document.getElementById("mascota-nacimiento").value || null;
      const archivoFoto = campoFoto?.files?.[0] || null;

      if (!nombre || !especie) {
        mostrarToast("El nombre y la especie son obligatorios.", true);
        return;
      }

      if (
        archivoFoto &&
        (!["image/jpeg", "image/png", "image/webp"].includes(
          archivoFoto.type,
        ) ||
          archivoFoto.size > 2 * 1024 * 1024)
      ) {
        mostrarToast(
          "La foto debe ser JPG, PNG o WEBP y no superar 2 MB.",
          true,
        );
        return;
      }

      try {
        const token = localStorage.getItem("vetsalud_token") || "";
        const foto = archivoFoto
          ? await new Promise((resolve, reject) => {
              const lector = new FileReader();
              lector.onload = () => resolve(lector.result);
              lector.onerror = () =>
                reject(new Error("No se pudo leer la foto."));
              lector.readAsDataURL(archivoFoto);
            })
          : "";
        const res = await fetch("/api/mascotas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre,
            especie,
            raza,
            sexo,
            fechaNacimiento,
            foto,
            fotoTipo: archivoFoto?.type || "",
          }),
        });

        cerrarModal(modalNuevaMascota);
        formNuevaMascota.reset();
        mostrarToast(`¡${nombre} ha sido registrado(a) exitosamente!`);

        await cargarDashboard();
      } catch (err) {
        mostrarToast(err.message, true);
      }
    });
  }

  // ===========
  // FORMULARIO: AGENDAR CITA -> POST /api/citas
  // ===========
  const formAgendarCitaModal = document.getElementById(
    "form-agendar-cita-modal",
  );
  if (formAgendarCitaModal) {
    formAgendarCitaModal.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombreMascota = document.getElementById("cita-mascota").value;
      const idServicio = document.getElementById("cita-servicio").value;
      const fecha = document.getElementById("cita-fecha").value;
      const hora = document.getElementById("cita-hora").value;
      const motivo = document.getElementById("cita-motivo").value.trim();

      if (!nombreMascota || !idServicio || !fecha || !hora || !motivo) {
        mostrarToast("Por favor completa todos los campos de la cita.", true);
        return;
      }

      if (
        !serviciosDisponibles.some(
          (servicio) => Number(servicio.id) === Number(idServicio),
        )
      ) {
        mostrarToast("Selecciona un servicio disponible.", true);
        return;
      }

      if (motivo.length < 10) {
        mostrarToast(
          "El motivo debe tener al menos 10 caracteres explicativos.",
          true,
        );
        return;
      }

      try {
        const token = localStorage.getItem("vetsalud_token") || "";
        const res = await fetch("/api/citas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombreMascota,
            idServicio: Number(idServicio),
            fecha,
            hora,
            motivo,
          }),
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "No se pudo guardar la cita.");

        cerrarModal(modalAgendarCita);
        formAgendarCitaModal.reset();
        mostrarToast(`Cita solicitada exitosamente para ${nombreMascota}.`);

        await cargarDashboard();
      } catch (err) {
        mostrarToast(err.message, true);
      }
    });
  }

  // ===========
  // FORMULARIO: REPROGRAMAR CITA -> PUT /api/citas/:idCita/reprogramar
  // ===========
  const formReprogramar = document.getElementById("form-reprogramar");
  if (formReprogramar) {
    formReprogramar.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!idCitaReprogramarActual) {
        mostrarToast("No se encontró la cita a reprogramar.", true);
        return;
      }

      const fecha = document.getElementById("nueva-fecha").value;
      const hora = document.getElementById("nuevo-horario").value;

      if (!fecha || !hora) {
        mostrarToast("Selecciona nueva fecha y horario.", true);
        return;
      }

      try {
        const token = localStorage.getItem("vetsalud_token") || "";
        const res = await fetch(
          `/api/citas/${idCitaReprogramarActual}/reprogramar`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fecha, hora }),
          },
        );

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "No se pudo reprogramar la cita.");

        cerrarModal(modalReprogramar);
        formReprogramar.reset();
        mostrarToast(
          `Cita reprogramada con éxito para el ${fecha} a las ${hora}.`,
        );

        await cargarDashboard();
      } catch (err) {
        mostrarToast(err.message, true);
      }
    });
  }

  // ===========
  // FORMULARIO: EDITAR PERFIL -> PUT /api/cliente
  // ===========
  const formEditarPerfil = document.getElementById("form-editar-perfil");
  if (formEditarPerfil) {
    formEditarPerfil.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("perfil-nombre").value.trim();
      const apellido = document.getElementById("perfil-apellido").value.trim();
      const tipoDocumento = document.getElementById("perfil-tipo-doc").value;
      const documento = document
        .getElementById("perfil-documento")
        .value.trim();
      const telefono1 = document
        .getElementById("perfil-telefono1")
        .value.trim();
      const telefono2 =
        document.getElementById("perfil-telefono2").value.trim() || null;
      const correo = document
        .getElementById("perfil-correo")
        .value.trim()
        .toLowerCase();
      const direccion =
        document.getElementById("perfil-direccion").value.trim() || null;
      const fechaNacimiento =
        document.getElementById("perfil-nacimiento").value || null;

      const nombreValido =
        /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñÜü])[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{2,100}$/.test(
          nombre,
        );
      const apellidoValido =
        /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñÜü])[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{2,100}$/.test(
          apellido,
        );
      const direccionValida =
        !direccion ||
        /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9 #.,°\-]{1,180}$/.test(direccion);

      if (
        !nombreValido ||
        !apellidoValido ||
        !["CC", "TI", "PAS"].includes(tipoDocumento) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
        !/^\d{5,20}$/.test(documento) ||
        !/^\d{7,20}$/.test(telefono1) ||
        (telefono2 && !/^\d{7,20}$/.test(telefono2)) ||
        !direccionValida ||
        correo.length > 120 ||
        (fechaNacimiento &&
          (Number.isNaN(new Date(`${fechaNacimiento}T00:00:00`).getTime()) ||
            new Date(`${fechaNacimiento}T00:00:00`) > new Date()))
      ) {
        mostrarToast(
          "Revisa nombres, documento, teléfonos y fecha de nacimiento.",
          true,
        );
        return;
      }

      try {
        const token = localStorage.getItem("vetsalud_token") || "";
        const res = await fetch("/api/cliente", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre,
            apellido,
            correo,
            tipoDocumento,
            documento,
            telefono1,
            telefono2,
            direccion,
            fechaNacimiento,
          }),
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "No se pudo actualizar el perfil.");

        const usuarioActual = JSON.parse(
          localStorage.getItem("vetsalud_usuario") || "{}",
        );
        localStorage.setItem(
          "vetsalud_usuario",
          JSON.stringify({ ...usuarioActual, nombre, apellido, correo }),
        );
        mostrarToast(`Datos de perfil actualizados con éxito.`);
        await cargarDashboard();
      } catch (err) {
        mostrarToast(err.message, true);
      }
    });
  }

  // ===========
  // FORMULARIO: CAMBIAR CONTRASEÑA -> PUT /api/perfil/password
  // ===========
  const formCambiarPassword = document.getElementById("form-cambiar-password");
  if (formCambiarPassword) {
    formCambiarPassword.addEventListener("submit", async (e) => {
      e.preventDefault();

      const passNueva = document.getElementById("pass-nueva").value;
      const passConfirmar = document.getElementById("pass-confirmar").value;
      const passActual = document.getElementById("pass-actual").value;

      if (!passActual) {
        mostrarToast("Ingresa tu contraseña actual.", true);
        return;
      }

      if (passNueva.length < 8) {
        mostrarToast(
          "La nueva contraseña debe tener al menos 8 caracteres.",
          true,
        );
        return;
      }

      // Exige una combinación básica para evitar contraseñas demasiado débiles.
      if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(passNueva)) {
        mostrarToast(
          "La contraseña debe incluir una mayúscula, una minúscula y un número.",
          true,
        );
        return;
      }

      if (passNueva !== passConfirmar) {
        mostrarToast(
          `Las contraseñas no coinciden. Verifica e intenta de nuevo.`,
          true,
        );
        return;
      }

      if (passNueva === passActual) {
        mostrarToast(
          "La nueva contraseña debe ser diferente a la actual.",
          true,
        );
        return;
      }

      try {
        const token = localStorage.getItem("vetsalud_token") || "";
        const res = await fetch("/api/perfil/password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            passwordActual: passActual,
            passwordNueva: passNueva,
          }),
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "No se pudo cambiar la contraseña.");

        formCambiarPassword.reset();
        mostrarToast(`Tu contraseña ha sido actualizada con éxito.`);
      } catch (err) {
        mostrarToast(err.message, true);
      }
    });
  }

  // Botón para cambiar foto de avatar
  const btnCambiarAvatar = document.getElementById("btn-cambiar-avatar");
  if (btnCambiarAvatar) {
    btnCambiarAvatar.addEventListener("click", () => {
      mostrarToast(`El avatar se genera automáticamente con tus iniciales.`);
    });
  }
});
