/**
 * VETSALUD - CONTROLADOR DEL APARTADO DE SERVICIOS
 * Maneja el cambio dinámico de servicios, formulario sticky, contador de caracteres y validación.
 */

document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // DATOS DE LOS SERVICIOS VETSALUD
  // ==========================================
  const serviciosData = {
    diagnostico: {
      titulo: "Diagnóstico avanzado",
      imagen: "../assets/images/productos/servicio_img_1.jpg",
      alt: "Diagnóstico avanzado en clínica veterinaria VetSalud",
      introduccion:
        "En medicina veterinaria, un diagnóstico rápido y preciso es fundamental. VetSalud cuenta con un completo equipo de diagnóstico en nuestras instalaciones, lo que elimina la necesidad de enviar muestras a laboratorios externos y esperar días para obtener los resultados. Esta capacidad es esencial para emergencias, exámenes prequirúrgicos y el manejo de enfermedades crónicas.",
      secciones: [
        {
          subtitulo: "Farmacia y análisis de sangre internos",
          parrafo:
            "Nuestro laboratorio realiza hemogramas completos, análisis bioquímicos, análisis de orina y pruebas de tiroides con rapidez. Esto significa que a menudo podemos conocer los resultados de pruebas importantes el mismo día de su visita, lo que nos permite comenzar el tratamiento de inmediato. Además, contamos con una farmacia interna completamente equipada, lo que garantiza que reciba los medicamentos necesarios incluso antes de salir de nuestras instalaciones.",
          enlaceTexto: "Farmacia en línea",
          enlaceUrl: "tienda.html",
        },
        {
          subtitulo: "Radiografía digital",
          parrafo:
            "Nuestra avanzada tecnología de rayos X digitales proporciona imágenes inmediatas y de alta resolución de las estructuras internas de su mascota. Esta herramienta no invasiva es invaluable para evaluaciones ortopédicas, la localización de cuerpos extraños y la evaluación del tamaño del corazón, lo que garantiza que nuestra planificación quirúrgica y las decisiones de medicina interna se basen en la información más precisa posible.",
          enlaceTexto: null,
          enlaceUrl: null,
        },
        {
          subtitulo: "Respuestas rápidas cuando el tiempo es crucial.",
          parrafo:
            "Programe hoy mismo la visita de diagnóstico de su mascota para obtener respuestas rápidas, un plan claro y los medicamentos a mano antes de ir, para que pueda actuar con confianza cuando cada minuto cuenta.",
          enlaceTexto: "Programe su diagnóstico ahora",
          enlaceUrl: "agendar-citas.html",
        },
      ],
    },
    unas: {
      titulo: "Recorte de uñas cómodos",
      imagen: "../assets/images/productos/servicio_img_2.jpg",
      alt: "Cuidado y recorte de uñas cómodo para perros y gatos en VetSalud",
      introduccion:
        "El cuidado de las patas y el recorte regular de uñas es vital para la postura, la comodidad y el bienestar de perros y gatos. En VetSalud aplicamos técnicas de manejo de bajo estrés para que la experiencia sea tranquila y positiva.",
      secciones: [
        {
          subtitulo: "Técnicas sin estrés y bienestar articular",
          parrafo:
            "Las uñas excesivamente largas pueden provocar dolor articular, cambios en la pisada y lesiones en las almohadillas. Nuestro equipo veterinario especializado utiliza instrumental de corte de precisión y limado para evitar daños en el vaso sanguíneo de la uña.",
          enlaceTexto: null,
          enlaceUrl: null,
        },
        {
          subtitulo: "Cuidado integral de almohadillas y patas",
          parrafo:
            "Durante cada sesión revisamos la salud de la piel interdigital y las almohadillas plantares para prevenir resequedad, grietas o presencia de cuerpos extraños.",
          enlaceTexto: "Agendar recorte de uñas",
          enlaceUrl: "agendar-citas.html",
        },
      ],
    },
    vacunacion: {
      titulo: "¿Por qué son importantes las dosis de refuerzo?",
      imagen: "../assets/images/productos/servicio_img_3.jpg",
      alt: "Esquemas de vacunación y dosis de refuerzo para mascotas en VetSalud",
      introduccion:
        "La inmunización preventiva es el pilar fundamental de una vida larga y protegida. En VetSalud personalizamos cada esquema de vacunación según la edad, estilo de vida y entorno de tu compañero.",
      secciones: [
        {
          subtitulo: "Protección contra enfermedades infecciosas críticas",
          parrafo:
            "Las vacunas estimulan defensas robustas contra el parvovirus, moquillo, rabia, leucemia felina y complejo respiratorio. Los refuerzos anuales garantizan que los anticuerpos protectores permanezcan en niveles óptimos.",
          enlaceTexto: null,
          enlaceUrl: null,
        },
        {
          subtitulo: "Control preventivo en cada aplicación",
          parrafo:
            "Cada cita de vacunación incluye un chequeo físico general para certificar que tu mascota está en perfectas condiciones de salud antes de recibir su biológico.",
          enlaceTexto: "Programe la vacunación de su mascota",
          enlaceUrl: "agendar-citas.html",
        },
      ],
    },
    bienestar: {
      titulo: "Exámenes de bienestar y atención preventiva",
      imagen: "../assets/images/productos/servicio_img_4.jpg",
      alt: "Exámenes clínicos de bienestar y medicina preventiva en VetSalud",
      introduccion:
        "Detectar a tiempo cualquier cambio en la salud de tu mascota marca la diferencia. Nuestros exámenes de bienestar anuales y semestrales evalúan integralmente cada sistema del organismo.",
      secciones: [
        {
          subtitulo: "Evaluación clínica de cabeza a cola",
          parrafo:
            "Revisamos ojos, oídos, dentadura, sistema cardiovascular, respiratorio, linfático, piel y peso corporal para diseñar planes nutricionales y de medicina preventiva personalizados.",
          enlaceTexto: "Explorar productos de cuidado",
          enlaceUrl: "tienda.html",
        },
        {
          subtitulo: "Planes para cachorros, adultos y seniors",
          parrafo:
            "Acompañamos cada etapa de su vida adaptando pruebas de cribado, análisis geriátricos y recomendaciones de actividad.",
          enlaceTexto: "Solicitar examen de bienestar",
          enlaceUrl: "agendar-citas.html",
        },
      ],
    },
    esterilizacion: {
      titulo: "Cuidado reproductivo y esterilización responsable",
      imagen: "../assets/images/productos/servicio_img_5.jpg",
      alt: "Esterilización y castración segura en VetSalud",
      introduccion:
        "La esterilización no solo previene camadas no planificadas, sino que previene tumores mamarios, infecciones uterinas severas (piometra) y patologías prostáticas, garantizando una vida más longeva y serena.",
      secciones: [
        {
          subtitulo: "Protocolos quirúrgicos seguros y monitoreo continuo",
          parrafo:
            "Implementamos exámenes prequirúrgicos completos, anestesia inhalatoria segura y monitoreo de constantes vitales en quirófano de última generación.",
          enlaceTexto: null,
          enlaceUrl: null,
        },
        {
          subtitulo: "Recuperación rápida y analgesia avanzada",
          parrafo:
            "Manejamos planes analgésicos multimodales para que la recuperación postoperatoria sea rápida, cómoda y libre de dolor en casa.",
          enlaceTexto: "Consultar sobre esterilización",
          enlaceUrl: "agendar-citas.html",
        },
      ],
    },
    cirugia: {
      titulo: "Procedimientos quirúrgicos y seguridad anestésica",
      imagen: "../assets/images/productos/servicio_img_7.jpg",
      alt: "Cirugía veterinaria especializada en VetSalud",
      introduccion:
        "Nuestro quirófano está equipado con tecnología médica avanzada para cirugías de tejidos blandos, traumatología y procedimientos de emergencia.",
      secciones: [
        {
          subtitulo: "Equipo quirúrgico con dedicación exclusiva",
          parrafo:
            "Durante todo el procedimiento un anestesista veterinario monitoriza electrocardiografía, capnografía, saturación de oxígeno y presión arterial continua.",
          enlaceTexto: null,
          enlaceUrl: null,
        },
        {
          subtitulo: "Hospitalización y cuidados postoperatorios",
          parrafo:
            "Disponemos de áreas confortables de recuperación supervisadas por nuestro equipo médico las 24 horas para garantizar una evolución óptima.",
          enlaceTexto: "Solicitar valoración quirúrgica",
          enlaceUrl: "agendar-citas.html",
        },
      ],
    },
    dental: {
      titulo: "Cuidado y limpieza dental profesional",
      imagen: "../assets/images/productos/servicio_img_6.jpg",
      alt: "Limpieza dental ultrasónica y salud bucal en VetSalud",
      introduccion:
        "La salud oral es clave para el bienestar general. Las bacterias dentales pueden viajar a través del torrente sanguíneo afectando corazón y riñones si no se tratan oportunamente.",
      secciones: [
        {
          subtitulo: "Profilaxis ultrasónica y pulido dental",
          parrafo:
            "Eliminamos sarro y placa bacteriana supragingival y subgingival con equipos ultrasónicos, complementando con pulido para prevenir la acumulación rápida de placa.",
          enlaceTexto: "Ver kits dentales en tienda",
          enlaceUrl: "tienda.html",
        },
        {
          subtitulo: "Prevención del mal aliento y dolor dental",
          parrafo:
            "Evaluamos la salud de encías y piezas dentales para devolverle a tu mascota el confort y una masticación sin dolor.",
          enlaceTexto: "Agendar limpieza dental",
          enlaceUrl: "agendar-citas.html",
        },
      ],
    },
    microchips: {
      titulo: "Microchips de identificación y pruebas diagnósticas",
      imagen: "../assets/images/productos/servicio_img_8.jpg",
      alt: "Implantación de microchips y pruebas diagnósticas en VetSalud",
      introduccion:
        "Garantiza la seguridad y localización permanente de tu mascota con la implantación de microchips homologados y pruebas preventivas rápidas.",
      secciones: [
        {
          subtitulo: "Identificación permanente e indolora",
          parrafo:
            "La aplicación del microchip es rápida, similar a una vacuna, y proporciona un código único e inalterable registrado en la base de datos nacional.",
          enlaceTexto: null,
          enlaceUrl: null,
        },
        {
          subtitulo: "Pruebas rápidas y certificados de viaje",
          parrafo:
            "Expedimos certificados de salud nacional e internacional con lectura de microchip y esquemas sanitarios vigentes.",
          enlaceTexto: "Programar cita para microchip",
          enlaceUrl: "agendar-citas.html",
        },
      ],
    },
  };

  // ==========================================
  // ELEMENTOS DEL DOM
  // ==========================================
  const tituloDinamico = document.getElementById("servicio-titulo-dinamico");
  const migajaActual = document.getElementById("migaja-servicio-actual");
  const imagenDinamica = document.getElementById("servicio-imagen-dinamica");
  const contenidoPrincipal = document.getElementById(
    "servicio-contenido-principal",
  );
  const pills = document.querySelectorAll(".servicio-pill");

  const servicioIdPorClave = {
    diagnostico: 1,
    unas: 2,
    vacunacion: 3,
    bienestar: 4,
    esterilizacion: 5,
    cirugia: 6,
    dental: 7,
    microchips: 8,
  };

  const formulario = document.getElementById("formulario-servicio");

  // ==========================================
  // CONTADOR DE CARACTERES EN TIEMPO REAL
  // ==========================================
  const textareaMensaje = document.getElementById("mensaje-contacto");
  const contadorCaracteres = document.getElementById("contador-caracteres");
  if (textareaMensaje && contadorCaracteres) {
    const actualizarContador = () => {
      const total = textareaMensaje.value.length;
      if (total === 1) {
        contadorCaracteres.textContent = "1 carácter";
      } else {
        contadorCaracteres.textContent = `${total} caracteres`;
      }
    };

    textareaMensaje.addEventListener("input", actualizarContador);
    actualizarContador();
  }

  // ==========================================
  // RENDERIZADO DINÁMICO DEL SERVICIO
  // ==========================================
  function cargarServicio(clave) {
    const data = serviciosData[clave] || serviciosData.diagnostico;

    // Actualizar encabezados y títulos
    if (tituloDinamico) tituloDinamico.textContent = data.titulo;
    if (migajaActual) migajaActual.textContent = data.titulo;
    document.title = `${data.titulo} | VetSalud`;

    // Actualizar imagen principal
    if (imagenDinamica) {
      imagenDinamica.src = data.imagen;
      imagenDinamica.alt = data.alt;
    }

    // Mantener la imagen y los pills y reconstruir el cuerpo de texto
    const bloquesAnteriores = contenidoPrincipal.querySelectorAll(
      ".servicios-bloque-texto",
    );
    bloquesAnteriores.forEach((bloque) => bloque.remove());

    const contenedorSelector = contenidoPrincipal.querySelector(
      ".servicios-otros-selector",
    );

    // Crear bloque de introducción
    const bloqueIntro = document.createElement("div");
    bloqueIntro.className = "servicios-bloque-texto";
    bloqueIntro.innerHTML = `<p class="servicios-parrafo">${data.introduccion}</p>`;
    contenidoPrincipal.insertBefore(bloqueIntro, contenedorSelector);

    // Crear bloques de secciones
    if (data.secciones && data.secciones.length > 0) {
      data.secciones.forEach((sec) => {
        const bloque = document.createElement("div");
        bloque.className = "servicios-bloque-texto";

        let html = `
          <h2 class="servicios-subtitulo">${sec.subtitulo}</h2>
          <p class="servicios-parrafo">${sec.parrafo}</p>
        `;

        if (sec.enlaceTexto && sec.enlaceUrl) {
          const enlaceUrl = sec.enlaceUrl === "agendar-citas.html"
            ? `agendar-citas.html?servicio=${servicioIdPorClave[clave]}`
            : sec.enlaceUrl;
          html += `
            <a href="${enlaceUrl}" class="servicios-enlace-subrayado">
              ${sec.enlaceTexto}
            </a>
          `;
        }

        bloque.innerHTML = html;
        contenidoPrincipal.insertBefore(bloque, contenedorSelector);
      });
    }

    // Actualizar estado activo en pills
    pills.forEach((pill) => {
      if (pill.dataset.servicio === clave) {
        pill.classList.add("activo");
      } else {
        pill.classList.remove("activo");
      }
    });

    document.querySelectorAll("[data-requiere-sesion]").forEach((enlace) => {
      enlace.href = `agendar-citas.html?servicio=${servicioIdPorClave[clave]}`;
    });

    // Actualizar estado activo en items del dropdown
    document.querySelectorAll(".vs-nav__dropdown-item").forEach((item) => {
      if (item.dataset.servicioLink === clave) {
        item.classList.add("active-item");
      } else {
        item.classList.remove("active-item");
      }
    });
  }

  // Event listeners para los pills de servicios
  pills.forEach((pill) => {
    pill.addEventListener("click", function () {
      const clave = this.dataset.servicio;
      cargarServicio(clave);
      // Actualizar URL sin recargar
      const nuevaUrl = `${window.location.pathname}?servicio=${clave}`;
      window.history.replaceState({ servicio: clave }, "", nuevaUrl);
      window.scrollTo({ top: 120, behavior: "smooth" });
    });
  });

  // Cargar servicio inicial según parámetro URL (?servicio=...)
  const params = new URLSearchParams(window.location.search);
  const servicioParam = params.get("servicio");
  if (servicioParam && serviciosData[servicioParam]) {
    cargarServicio(servicioParam);
  } else {
    cargarServicio("diagnostico");
  }

  // Soporte para navegación con botones atrás/adelante del navegador
  window.addEventListener("popstate", () => {
    const p = new URLSearchParams(window.location.search);
    const serv = p.get("servicio");
    if (serv && serviciosData[serv]) {
      cargarServicio(serv);
    } else {
      cargarServicio("diagnostico");
    }
  });

  // Interceptar clics en los enlaces del dropdown y footer si ya estamos en servicios.html para transición instantánea
  document.addEventListener("click", (e) => {
    const item = e.target.closest(
      ".vs-nav__dropdown-item, .vs-footer__service-link, a[data-servicio-link], a[href*='servicios.html?servicio=']",
    );
    if (
      item &&
      (window.location.pathname.includes("servicios.html") ||
        window.location.pathname.endsWith("/servicios"))
    ) {
      const url = new URL(item.href, window.location.origin);
      const serv = url.searchParams.get("servicio");
      if (serv && serviciosData[serv]) {
        e.preventDefault();
        cargarServicio(serv);
        window.history.pushState({ servicio: serv }, "", item.href);
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    }
  });

  // ==========================================
  // COMPATIBILIDAD CON VERSIONES ANTERIORES DEL FORMULARIO
  // ==========================================
  if (formulario) {
    const inputNombre = document.getElementById("nombre-completo");
    const inputEmail = document.getElementById("correo-electronico");
    const inputTelefono = document.getElementById("telefono-contacto");
    const alertaBox = document.getElementById("form-notificacion");
    const btnEnviar = document.getElementById("btn-enviar-mensaje");
    // Limpieza de errores al escribir
    [inputNombre, inputEmail, inputTelefono, textareaMensaje].forEach(
      (input) => {
        if (input) {
          input.addEventListener("input", () => {
            const field = input.closest(".servicios-form-field");
            if (field) field.classList.remove("con-error");
          });
        }
      },
    );

    formulario.addEventListener("submit", function (e) {
      e.preventDefault();
      let valido = true;

      // Validar nombre
      const fieldNombre = inputNombre.closest(".servicios-form-field");
      if (!inputNombre.value.trim() || inputNombre.value.trim().length < 3) {
        fieldNombre.classList.add("con-error");
        valido = false;
      } else {
        fieldNombre.classList.remove("con-error");
      }

      // Validar correo
      const fieldEmail = inputEmail.closest(".servicios-form-field");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (
        !inputEmail.value.trim() ||
        !emailRegex.test(inputEmail.value.trim())
      ) {
        fieldEmail.classList.add("con-error");
        valido = false;
      } else {
        fieldEmail.classList.remove("con-error");
      }

      // Validar teléfono
      const fieldTelefono = inputTelefono.closest(".servicios-form-field");
      if (
        !inputTelefono.value.trim() ||
        inputTelefono.value.trim().length < 6
      ) {
        fieldTelefono.classList.add("con-error");
        valido = false;
      } else {
        fieldTelefono.classList.remove("con-error");
      }

      // Validar mensaje
      const fieldMensaje = textareaMensaje.closest(".servicios-form-field");
      if (
        !textareaMensaje.value.trim() ||
        textareaMensaje.value.trim().length < 5
      ) {
        fieldMensaje.classList.add("con-error");
        valido = false;
      } else {
        fieldMensaje.classList.remove("con-error");
      }

      if (!valido) {
        mostrarNotificacion(
          "Por favor completa correctamente todos los campos obligatorios.",
          "error",
        );
        return;
      }

      // Simulación de envío exitoso
      btnEnviar.disabled = true;
      btnEnviar.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Enviando...</span>`;

      setTimeout(() => {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = `<i class="fa-regular fa-paper-plane"></i> <span>Enviar mensaje</span>`;

        mostrarNotificacion(
          "¡Mensaje enviado con éxito! Nuestro equipo veterinario se pondrá en contacto contigo muy pronto.",
          "exito",
        );

        formulario.reset();
        if (contadorCaracteres) contadorCaracteres.textContent = "0 caracteres";
      }, 900);
    });
  }

  function mostrarNotificacion(mensaje, tipo) {
    if (!alertaBox) return;
    alertaBox.className = `servicios-alerta-box ${tipo}`;
    alertaBox.textContent = mensaje;
    alertaBox.style.display = "block";

    setTimeout(() => {
      alertaBox.style.display = "none";
    }, 6500);
  }
});
