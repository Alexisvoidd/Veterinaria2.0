document.addEventListener("DOMContentLoaded", () => {
  const formRegistro = document.getElementById("form-registro");
  const btnSubmit = document.getElementById("btn-submit-registro");
  const botonesTogglePassword = document.querySelectorAll(".campo-boton-ojo");

  // ===========
  // 1. ALTERNADOR DE VISIBILIDAD DE CONTRASEÑA (VER / OCULTAR)
  // ===========
  botonesTogglePassword.forEach((boton) => {
    boton.addEventListener("click", () => {
      const envoltorio = boton.closest(".campo-envoltorio-input");
      const inputPassword = envoltorio
        ? envoltorio.querySelector("input")
        : null;
      const iconoOjo = boton.querySelector(".material-symbols-outlined");

      if (!inputPassword || !iconoOjo) return;

      const esPassword = inputPassword.type === "password";
      inputPassword.type = esPassword ? "text" : "password";
      iconoOjo.textContent = esPassword ? "visibility" : "visibility_off";
      boton.setAttribute(
        "aria-label",
        esPassword ? "Ocultar contraseña" : "Ver contraseña",
      );
    });
  });

  // ===========
  // 2. REFERENCIAS A LOS CAMPOS DEL FORMULARIO
  // ===========
  const campos = {
    tipoDocumento: document.getElementById("tipoDocumento"),
    numeroDocumento: document.getElementById("numeroDocumento"),
    nombres: document.getElementById("nombres"),
    apellidos: document.getElementById("apellidos"),
    fechaNacimiento: document.getElementById("fechaNacimiento"),
    telefono1: document.getElementById("telefono1"),
    telefono2: document.getElementById("telefono2"),
    correo: document.getElementById("correo"),
    direccion: document.getElementById("direccion"),
    nombreMascota: document.getElementById("nombreMascota"),
    especie: document.getElementById("especie"),
    raza: document.getElementById("raza"),
    sexo: document.getElementById("sexo"),
    fechaNacimientoMascota: document.getElementById("fechaNacimientoMascota"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
  };

  // ===========
  // 3. FUNCIONES DE MANIPULACIÓN VISUAL DE ERRORES
  // ===========

  /**
   * Muestra un mensaje de error y resalta visualmente el campo.
   * @param {HTMLElement} inputEl - Elemento de entrada con error
   * @param {string} mensaje - Texto descriptivo del error en español
   */
  function marcarError(inputEl, mensaje) {
    if (!inputEl) return;
    const grupo = inputEl.closest(".campo-grupo");
    const idCampo = inputEl.id;
    const errorContenedor = document.getElementById(`error-${idCampo}`);

    inputEl.classList.add("campo-invalido");
    if (grupo) {
      grupo.classList.add("has-error");
    }
    if (errorContenedor) {
      errorContenedor.textContent = mensaje;
      errorContenedor.style.display = "block";
    }
  }

  /**
   * Limpia el estado de error de un campo.
   * @param {HTMLElement} inputEl - Elemento de entrada a limpiar
   */
  function limpiarError(inputEl) {
    if (!inputEl) return;
    const grupo = inputEl.closest(".campo-grupo");
    const idCampo = inputEl.id;
    const errorContenedor = document.getElementById(`error-${idCampo}`);

    inputEl.classList.remove("campo-invalido");
    if (grupo) {
      grupo.classList.remove("has-error");
    }
    if (errorContenedor) {
      errorContenedor.textContent = "";
      errorContenedor.style.display = "none";
    }
  }

  // ===========
  // 4. REGLAS INDIVIDUALES DE VALIDACIÓN
  // ===========

  /**
   * Valida un campo específico según su ID y reglas de negocio.
   * @param {string} id - ID del campo a validar
   * @returns {boolean} true si el campo es válido, false en caso contrario
   */
  function validarCampo(id) {
    const el = campos[id];
    if (!el) return true;

    const valor = el.value.trim();

    switch (id) {
      // ----------------------------------------------------
      // Tipo de Documento
      // ----------------------------------------------------
      case "tipoDocumento": {
        if (!valor) {
          marcarError(el, "Por favor selecciona el tipo de documento.");
          return false;
        }
        limpiarError(el);
        // Si el número de documento ya tiene valor, revalidarlo con el nuevo tipo
        if (campos.numeroDocumento && campos.numeroDocumento.value.trim()) {
          validarCampo("numeroDocumento");
        }
        return true;
      }

      // ----------------------------------------------------
      // Número de Documento
      // ----------------------------------------------------
      case "numeroDocumento": {
        if (!valor) {
          marcarError(el, "El número de documento es obligatorio.");
          return false;
        }
        const tipoDoc = campos.tipoDocumento ? campos.tipoDocumento.value : "";
        if (tipoDoc === "PAS") {
          // Pasaporte: alfanumérico de 6 a 15 caracteres
          const regexPasaporte = /^[a-zA-Z0-9]{6,15}$/;
          if (!regexPasaporte.test(valor)) {
            marcarError(
              el,
              "El pasaporte debe tener entre 6 y 15 caracteres alfanuméricos.",
            );
            return false;
          }
        } else {
          // CC, CE, RC u otros: solo dígitos de 6 a 12 caracteres
          const regexNumeros = /^[0-9]{6,12}$/;
          if (!regexNumeros.test(valor)) {
            marcarError(
              el,
              "Ingresa un número de documento válido (entre 6 y 12 dígitos numéricos).",
            );
            return false;
          }
        }
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Nombres
      // ----------------------------------------------------
      case "nombres": {
        if (!valor) {
          marcarError(el, "El nombre es obligatorio.");
          return false;
        }
        if (valor.length < 2) {
          marcarError(el, "El nombre debe tener al menos 2 caracteres.");
          return false;
        }
        const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/;
        if (!regexLetras.test(valor)) {
          marcarError(el, "El nombre solo debe contener letras y espacios.");
          return false;
        }
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Apellidos
      // ----------------------------------------------------
      case "apellidos": {
        if (!valor) {
          marcarError(el, "El apellido es obligatorio.");
          return false;
        }
        if (valor.length < 2) {
          marcarError(el, "El apellido debe tener al menos 2 caracteres.");
          return false;
        }
        const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/;
        if (!regexLetras.test(valor)) {
          marcarError(el, "El apellido solo debe contener letras y espacios.");
          return false;
        }
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Fecha de Nacimiento del Propietario
      // ----------------------------------------------------
      case "fechaNacimiento": {
        if (!valor) {
          marcarError(el, "La fecha de nacimiento es obligatoria.");
          return false;
        }
        const fechaIngresada = new Date(valor + "T00:00:00");
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (isNaN(fechaIngresada.getTime())) {
          marcarError(el, "Por favor ingresa una fecha válida.");
          return false;
        }
        if (fechaIngresada >= hoy) {
          marcarError(
            el,
            "La fecha de nacimiento no puede ser hoy ni una fecha futura.",
          );
          return false;
        }

        // Validar edad mínima (14 años)
        const edadMinimaFecha = new Date();
        edadMinimaFecha.setFullYear(hoy.getFullYear() - 14);
        if (fechaIngresada > edadMinimaFecha) {
          marcarError(
            el,
            "Debes tener al menos 14 años para registrar una cuenta.",
          );
          return false;
        }

        // Validar fecha realista (máximo 120 años atrás)
        const fechaLimite = new Date();
        fechaLimite.setFullYear(hoy.getFullYear() - 120);
        if (fechaIngresada < fechaLimite) {
          marcarError(el, "Por favor ingresa una fecha de nacimiento válida.");
          return false;
        }

        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Teléfono Principal
      // ----------------------------------------------------
      case "telefono1": {
        if (!valor) {
          marcarError(el, "El teléfono principal es obligatorio.");
          return false;
        }
        if (!/^[0-9]{7,15}$/.test(valor)) {
          marcarError(
            el,
            "Ingresa un número de teléfono válido (entre 7 y 15 dígitos).",
          );
          return false;
        }
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Teléfono Secundario (Opcional)
      // ----------------------------------------------------
      case "telefono2": {
        if (valor) {
          if (!/^[0-9]{7,15}$/.test(valor)) {
            marcarError(
              el,
              "El teléfono secundario debe contener entre 7 y 15 dígitos.",
            );
            return false;
          }
        }
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Correo Electrónico
      // ----------------------------------------------------
      case "correo": {
        if (!valor) {
          marcarError(el, "El correo electrónico es obligatorio.");
          return false;
        }
        const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regexEmail.test(valor)) {
          marcarError(
            el,
            "Ingresa un correo electrónico válido (ejemplo: usuario@correo.com).",
          );
          return false;
        }
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Dirección (Opcional)
      // ----------------------------------------------------
      case "direccion": {
        if (valor && valor.length < 5) {
          marcarError(el, "La dirección debe tener al menos 5 caracteres.");
          return false;
        }
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Nombre de la Mascota
      // ----------------------------------------------------
      case "nombreMascota": {
        if (!valor) {
          marcarError(el, "El nombre de la mascota es obligatorio.");
          return false;
        }
        if (valor.length < 2) {
          marcarError(
            el,
            "El nombre de la mascota debe tener al menos 2 caracteres.",
          );
          return false;
        }
        const regexNombreMascota = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]{2,40}$/;
        if (!regexNombreMascota.test(valor)) {
          marcarError(
            el,
            "El nombre de la mascota contiene caracteres inválidos.",
          );
          return false;
        }
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Especie de la Mascota
      // ----------------------------------------------------
      case "especie": {
        if (!valor) {
          marcarError(el, "Por favor selecciona la especie de tu mascota.");
          return false;
        }
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Raza de la Mascota (Opcional)
      // ----------------------------------------------------
      case "raza": {
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Sexo de la Mascota
      // ----------------------------------------------------
      case "sexo": {
        if (!valor) {
          marcarError(el, "Por favor selecciona el sexo de tu mascota.");
          return false;
        }
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Fecha de Nacimiento de la Mascota (Opcional)
      // ----------------------------------------------------
      case "fechaNacimientoMascota": {
        if (valor) {
          const fechaMascota = new Date(valor + "T00:00:00");
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);

          if (isNaN(fechaMascota.getTime())) {
            marcarError(el, "Por favor ingresa una fecha válida.");
            return false;
          }
          if (fechaMascota > hoy) {
            marcarError(
              el,
              "La fecha de nacimiento no puede ser una fecha futura.",
            );
            return false;
          }
          // Fecha límite razonable (máximo 35 años atrás)
          const fechaLimite = new Date();
          fechaLimite.setFullYear(hoy.getFullYear() - 35);
          if (fechaMascota < fechaLimite) {
            marcarError(el, "Ingresa una fecha de nacimiento válida.");
            return false;
          }
        }
        limpiarError(el);
        return true;
      }

      // ----------------------------------------------------
      // Contraseña
      // ----------------------------------------------------
      case "password": {
        if (!valor) {
          marcarError(el, "La contraseña es obligatoria.");
          return false;
        }
        if (valor.length < 8) {
          marcarError(el, "La contraseña debe tener al menos 8 caracteres.");
          return false;
        }
        // Requerir al menos una mayúscula, una minúscula y un número
        const tieneMayuscula = /[A-Z]/.test(valor);
        const tieneMinuscula = /[a-z]/.test(valor);
        const tieneNumero = /\d/.test(valor);

        if (!tieneMayuscula || !tieneMinuscula || !tieneNumero) {
          marcarError(
            el,
            "Debe incluir al menos una letra mayúscula, una minúscula y un número.",
          );
          return false;
        }

        limpiarError(el);

        // Si ya se ingresó confirmación, revalidar coincidencia
        if (campos.confirmPassword && campos.confirmPassword.value) {
          validarCampo("confirmPassword");
        }
        return true;
      }

      // ----------------------------------------------------
      // Confirmar Contraseña
      // ----------------------------------------------------
      case "confirmPassword": {
        if (!valor) {
          marcarError(el, "Por favor confirma tu contraseña.");
          return false;
        }
        const passwordOriginal = campos.password ? campos.password.value : "";
        if (valor !== passwordOriginal) {
          marcarError(el, "Las contraseñas no coinciden. Verifica los campos.");
          return false;
        }
        limpiarError(el);
        return true;
      }

      default:
        return true;
    }
  }

  // 
  // 5. ESCUCHADORES DE EVENTOS EN TIEMPO REAL (INPUT / BLUR / CHANGE)
  // 
  Object.keys(campos).forEach((id) => {
    const el = campos[id];
    if (!el) return;

    if (id === "numeroDocumento" || id === "telefono1" || id === "telefono2") {
      el.addEventListener("input", () => {
        const valorNumerico = el.value.replace(/[^0-9]/g, "");
        if (el.value !== valorNumerico) el.value = valorNumerico;
      });
    }

    // Al escribir, limpiar error si se corrige
    el.addEventListener("input", () => {
      if (el.classList.contains("campo-invalido")) {
        validarCampo(id);
      }
    });

    // Al perder el foco (blur), validar campo
    el.addEventListener("blur", () => {
      // Solo validamos al salir si tiene valor o si es un campo obligatorio
      if (el.value.trim() || el.hasAttribute("required")) {
        validarCampo(id);
      }
    });

    // En selects o fechas, validar inmediatamente en change
    if (el.tagName === "SELECT" || el.type === "date") {
      el.addEventListener("change", () => {
        validarCampo(id);
      });
    }
  });

  // 
  // 6. VALIDACIÓN GENERAL DEL FORMULARIO COMPLETO
  // 
  function validarFormularioCompleto() {
    let esValido = true;
    let primerElementoInvalido = null;

    // Orden de validación secuencial
    const ordenCampos = [
      "tipoDocumento",
      "numeroDocumento",
      "nombres",
      "apellidos",
      "fechaNacimiento",
      "telefono1",
      "telefono2",
      "correo",
      "direccion",
      "nombreMascota",
      "especie",
      "raza",
      "sexo",
      "fechaNacimientoMascota",
      "password",
      "confirmPassword",
    ];

    ordenCampos.forEach((id) => {
      const campoValido = validarCampo(id);
      if (!campoValido) {
        esValido = false;
        if (!primerElementoInvalido && campos[id]) {
          primerElementoInvalido = campos[id];
        }
      }
    });

    // Si hay errores, hacer foco y scroll suave al primer campo incorrecto
    if (!esValido && primerElementoInvalido) {
      primerElementoInvalido.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      primerElementoInvalido.focus();
    }

    return esValido;
  }

  // 
  // 7. ENVÍO DEL FORMULARIO (SUBMIT)
  // 
  if (formRegistro) {
    formRegistro.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      // 1. Ejecutar validación completa
      const formularioValido = validarFormularioCompleto();
      if (!formularioValido) {
        mostrarToastRegistro(
          "Datos incompletos o incorrectos",
          "Por favor revisa los campos señalados en rojo en el formulario.",
          true,
        );
        return;
      }

      // 2. Preparar envío y estado de carga
      const textoOriginalBtn = btnSubmit ? btnSubmit.innerHTML : "";
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `
          <span>Creando cuenta...</span>
          <span class="material-symbols-outlined" style="animation: girar 1s linear infinite;">sync</span>
        `;
      }

      const datosRegistro = Object.fromEntries(new FormData(formRegistro));

      try {
        const respuesta = await fetch("/api/registro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosRegistro),
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          mostrarToastRegistro(
            "No se pudo completar el registro",
            resultado.error || "Ocurrió un error al procesar tu solicitud.",
            true,
          );
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginalBtn;
          }
          return;
        }

        // Éxito en el registro
        mostrarToastRegistro(
          "¡Registro Exitoso!",
          resultado.mensaje ||
            "Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...",
          false,
        );

        formRegistro.reset();

        // Limpiar estados visuales
        Object.keys(campos).forEach((id) => {
          if (campos[id]) limpiarError(campos[id]);
        });

        // Redirigir a login tras 2 segundos
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } catch (error) {
        console.error("Error al enviar registro:", error);
        mostrarToastRegistro(
          "Error de conexión",
          "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.",
          true,
        );
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = textoOriginalBtn;
        }
      }
    });
  }
});

/**
 * Muestra una notificación emergente (Toast) temporal en la interfaz de registro.
 * @param {string} titulo - Título de la alerta
 * @param {string} mensaje - Descripción del mensaje
 * @param {boolean} esError - Define si el mensaje es de error (rojo) o de éxito (verde/azul)
 */
function mostrarToastRegistro(titulo, mensaje, esError = false) {
  const toastExistente = document.querySelector(".registro-alerta-toast");
  if (toastExistente) {
    toastExistente.remove();
  }

  const toast = document.createElement("div");
  toast.className = `registro-alerta-toast ${esError ? "error" : ""}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined registro-alerta-icono">
      ${esError ? "error" : "check_circle"}
    </span>
    <div>
      <div class="registro-alerta-titulo">${titulo}</div>
      <div class="registro-alerta-mensaje">${mensaje}</div>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "deslizarToast 0.3s reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}
