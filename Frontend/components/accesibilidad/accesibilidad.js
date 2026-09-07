(function () {
  // Encierra todo el código

  function inicializarAccesibilidad() {
    // Inicia la accesibilidad

    const html = document.documentElement; // Obtiene el HTML

    const button = document.getElementById("accessibility-button"); // Busca el botón

    const panel = document.getElementById("accessibility-panel"); // Busca el panel

    const closeButton = document.getElementById("accessibility-close"); // Busca el botón cerrar

    /* VERIFICAR COMPONENTE */

    if (!button || !panel) {
      // Verifica los elementos

      console.warn("Accesibilidad: no se encontraron los elementos."); // Muestra advertencia

      return; // Detiene la función
    }

    /* EVITAR DOBLE INICIALIZACIÓN */

    if (button.dataset.inicializado === "true") {
      // Comprueba si inició

      return; // Evita duplicarlo
    }

    button.dataset.inicializado = "true"; // Marca como iniciado

    /* ELEMENTOS */

    const darkButton = document.getElementById("accessibility-dark"); // Botón oscuro

    const fontPlus = document.getElementById("accessibility-font-plus"); // Aumenta texto

    const fontMinus = document.getElementById("accessibility-font-minus"); // Reduce texto

    const contrastButton = document.getElementById("accessibility-contrast"); // Botón contraste

    const highlightButton = document.getElementById("accessibility-highlight"); // Botón resaltar

    const motionButton = document.getElementById("accessibility-motion"); // Botón animaciones

    const resetButton = document.getElementById("accessibility-reset"); // Botón restablecer

    /* CONFIGURACIÓN */

    const STORAGE_KEY = "accessibility_settings"; // Nombre en almacenamiento

    let settings = {
      // Configuración inicial
      darkMode: false, // Modo oscuro apagado
      fontSize: 100, // Texto normal
      highContrast: false, // Contraste apagado
      highlight: false, // Resaltado apagado
      reduceMotion: false, // Animaciones activas
    };

    /* GUARDAR */

    function guardarConfiguracion() {
      // Guarda la configuración

      localStorage.setItem(
        // Guarda en navegador
        STORAGE_KEY, // Usa esta clave
        JSON.stringify(settings), // Convierte a texto
      );
    }

    /* ACTUALIZAR INTERFAZ */

    function actualizarInterfaz() {
      // Actualiza los botones

      /* TEMA OSCURO */

      if (darkButton) {
        // Verifica botón oscuro

        darkButton.classList.toggle("active", settings.darkMode); // Activa su estado

        const status = darkButton.querySelector(".option-status"); // Busca estado

        if (status) {
          // Verifica estado

          status.textContent = settings.darkMode ? "Activado" : "Desactivado"; // Cambia texto
        }

        const icon = darkButton.querySelector(".option-icon"); // Busca icono

        if (icon) {
          // Verifica icono

          icon.textContent = settings.darkMode ? "light_mode" : "dark_mode"; // Cambia icono
        }
      }

      /* ALTO CONTRASTE */

      if (contrastButton) {
        // Verifica contraste

        contrastButton.classList.toggle("active", settings.highContrast); // Activa su estado

        const status = contrastButton.querySelector(".option-status"); // Busca estado

        if (status) {
          // Verifica estado

          status.textContent = settings.highContrast
            ? "Activado"
            : "Desactivado"; // Cambia texto
        }
      }

      /* RESALTAR ELEMENTOS */

      if (highlightButton) {
        // Verifica resaltado

        highlightButton.classList.toggle("active", settings.highlight); // Activa su estado

        const status = highlightButton.querySelector(".option-status"); // Busca estado

        if (status) {
          // Verifica estado

          status.textContent = settings.highlight ? "Activado" : "Desactivado"; // Cambia texto
        }
      }

      /* REDUCIR ANIMACIONES */

      if (motionButton) {
        // Verifica animaciones

        motionButton.classList.toggle("active", settings.reduceMotion); // Activa su estado

        const status = motionButton.querySelector(".option-status"); // Busca estado

        if (status) {
          // Verifica estado

          status.textContent = settings.reduceMotion
            ? "Activado"
            : "Desactivado"; // Cambia texto
        }
      }
    }

    /* APLICAR CONFIGURACIÓN */

    function aplicarConfiguracion() {
      // Aplica las opciones

      /* MODO OSCURO */

      html.classList.toggle("dark-mode", settings.darkMode); // Activa modo oscuro

      /* ALTO CONTRASTE */

      html.classList.toggle("high-contrast", settings.highContrast); // Activa contraste

      /* RESALTAR */

      html.classList.toggle("highlight-elements", settings.highlight); // Activa resaltado

      /* REDUCIR ANIMACIONES */

      html.classList.toggle("reduce-motion", settings.reduceMotion); // Reduce animaciones

      /* TAMAÑO DEL TEXTO */

      html.classList.remove("font-size-large", "font-size-xlarge"); // Limpia tamaños anteriores

      if (settings.fontSize === 110) {
        // Comprueba tamaño grande

        html.classList.add("font-size-large"); // Aplica tamaño grande
      }

      if (settings.fontSize === 120) {
        // Comprueba tamaño extra

        html.classList.add("font-size-xlarge"); // Aplica tamaño extra
      }

      actualizarInterfaz(); // Actualiza la interfaz
    }

    /* CARGAR CONFIGURACIÓN */

    function cargarConfiguracion() {
      // Carga datos guardados

      const saved = localStorage.getItem(STORAGE_KEY); // Obtiene configuración

      if (saved) {
        // Verifica si existe

        try {
          // Intenta leer datos

          settings = {
            ...settings,
            ...JSON.parse(saved),
          }; // Combina configuración
        } catch (error) {
          // Detecta errores

          console.warn(
            "No se pudo cargar la configuración de accesibilidad.",
            error,
          ); // Muestra el error
        }
      }

      aplicarConfiguracion(); // Aplica configuración
    }

    /* ABRIR PANEL */

    button.addEventListener(
      "click", // Detecta clic
      function () {
        // Ejecuta acción

        const abierto = !panel.classList.contains("active"); // Comprueba estado

        panel.classList.toggle("active", abierto); // Abre o cierra panel

        button.setAttribute("aria-expanded", String(abierto)); // Actualiza accesibilidad

        panel.setAttribute("aria-hidden", String(!abierto)); // Indica visibilidad
      },
    );

    /* CERRAR PANEL */

    if (closeButton) {
      // Verifica botón cerrar

      closeButton.addEventListener(
        "click", // Detecta clic
        function () {
          // Ejecuta acción

          panel.classList.remove("active"); // Cierra panel

          button.setAttribute("aria-expanded", "false"); // Marca como cerrado

          panel.setAttribute("aria-hidden", "true"); // Oculta para accesibilidad
        },
      );
    }

    /* CERRAR AL PRESIONAR ESCAPE O HACER CLIC FUERA */

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !panel.classList.contains("active")) {
        return;
      }

      panel.classList.remove("active");
      button.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
      button.focus();
    });

    document.addEventListener("click", function (event) {
      if (
        !panel.classList.contains("active") ||
        event.target.closest(".accessibility-wrapper")
      ) {
        return;
      }

      panel.classList.remove("active");
      button.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
    });

    /* TEMA OSCURO */

    if (darkButton) {
      // Verifica botón

      darkButton.addEventListener(
        "click", // Detecta clic
        function () {
          // Ejecuta acción

          settings.darkMode = !settings.darkMode; // Cambia el modo

          guardarConfiguracion(); // Guarda cambios
          aplicarConfiguracion(); // Aplica cambios
        },
      );
    }

    /* AUMENTAR TEXTO */

    if (fontPlus) {
      // Verifica botón

      fontPlus.addEventListener(
        "click", // Detecta clic
        function () {
          // Ejecuta acción

          if (settings.fontSize < 120) {
            // Comprueba límite

            settings.fontSize += 10; // Aumenta tamaño
          }

          guardarConfiguracion(); // Guarda cambios
          aplicarConfiguracion(); // Aplica cambios
        },
      );
    }

    /* REDUCIR TEXTO */

    if (fontMinus) {
      // Verifica botón

      fontMinus.addEventListener(
        "click", // Detecta clic
        function () {
          // Ejecuta acción

          if (settings.fontSize > 100) {
            // Comprueba límite

            settings.fontSize -= 10; // Reduce tamaño
          }

          guardarConfiguracion(); // Guarda cambios
          aplicarConfiguracion(); // Aplica cambios
        },
      );
    }

    /* ALTO CONTRASTE */

    if (contrastButton) {
      // Verifica botón

      contrastButton.addEventListener(
        "click", // Detecta clic
        function () {
          // Ejecuta acción

          settings.highContrast = !settings.highContrast; // Cambia contraste

          guardarConfiguracion(); // Guarda cambios
          aplicarConfiguracion(); // Aplica cambios
        },
      );
    }

    /* RESALTAR ELEMENTOS */

    if (highlightButton) {
      // Verifica botón

      highlightButton.addEventListener(
        "click", // Detecta clic
        function () {
          // Ejecuta acción

          settings.highlight = !settings.highlight; // Cambia resaltado

          guardarConfiguracion(); // Guarda cambios
          aplicarConfiguracion(); // Aplica cambios
        },
      );
    }

    /* REDUCIR ANIMACIONES */

    if (motionButton) {
      // Verifica botón

      motionButton.addEventListener(
        "click", // Detecta clic
        function () {
          // Ejecuta acción

          settings.reduceMotion = !settings.reduceMotion; // Cambia animaciones

          guardarConfiguracion(); // Guarda cambios
          aplicarConfiguracion(); // Aplica cambios
        },
      );
    }

    /* RESTABLECER */

    if (resetButton) {
      // Verifica botón

      resetButton.addEventListener(
        "click", // Detecta clic
        function () {
          // Ejecuta acción

          settings = {
            // Restaura valores
            darkMode: false, // Desactiva oscuro
            fontSize: 100, // Texto normal
            highContrast: false, // Desactiva contraste
            highlight: false, // Desactiva resaltado
            reduceMotion: false, // Activa animaciones
          };

          guardarConfiguracion(); // Guarda valores
          aplicarConfiguracion(); // Aplica valores
        },
      );
    }

    /* INICIAR */

    cargarConfiguracion(); // Carga configuración

    console.log("Accesibilidad inicializada correctamente."); // Confirma inicio
  }

  /* INICIAR AL CARGAR */

  if (document.readyState === "loading") {
    // Comprueba carga

    document.addEventListener("DOMContentLoaded", inicializarAccesibilidad); // Espera al HTML
  } else {
    inicializarAccesibilidad(); // Inicia inmediatamente
  }
})();
