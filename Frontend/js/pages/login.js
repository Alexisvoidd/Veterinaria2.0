/* 
   VETSALUD - LOGIN.JS
   
   Funciones:
   - Mostrar / ocultar contraseña
   - Validar formulario de login
   - Conectar con /api/login
   - Guardar usuario y token
   - Redireccionar según el rol
    */

document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
       ELEMENTOS
    ===================================================== */

  const formLogin = document.getElementById("form-login");
  const inputCorreo = document.getElementById("correo");
  const inputPassword = document.getElementById("password");
  const btnTogglePassword = document.getElementById("btn-toggle-password");

  const iconoOjo = btnTogglePassword
    ? btnTogglePassword.querySelector(".material-symbols-outlined")
    : null;

  /* =====================================================
       1. MOSTRAR / OCULTAR CONTRASEÑA
    ===================================================== */

  if (btnTogglePassword && inputPassword && iconoOjo) {
    btnTogglePassword.addEventListener("click", () => {
      const esPassword = inputPassword.getAttribute("type") === "password";

      inputPassword.setAttribute("type", esPassword ? "text" : "password");

      iconoOjo.textContent = esPassword ? "visibility" : "visibility_off";

      btnTogglePassword.setAttribute(
        "aria-label",
        esPassword ? "Ocultar contraseña" : "Ver contraseña",
      );
    });
  }

  if (formLogin) {
    formLogin.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const correo = document.getElementById("correo")?.value.trim() || "";
      const password = inputPassword?.value.trim() || "";

      if (!correo || !password) {
        mostrarToastLogin(
          "Campos requeridos",
          "Por favor ingresa tu correo y contraseña.",
          true,
        );
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        mostrarToastLogin(
          "Correo inválido",
          "Por favor ingresa un correo electrónico válido.",
          true,
        );
        return;
      }

      try {
        const respuesta = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, password }),
        });
        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          mostrarToastLogin("No se pudo iniciar sesión", resultado.error, true);
          return;
        }

        const usuario = resultado.usuario || {};
        const rol = String(usuario.rol || "CLIENTE").toUpperCase();
        const destinoPendiente = sessionStorage.getItem(
          "vetsalud_destino_login",
        );
        sessionStorage.removeItem("vetsalud_destino_login");
        const destino =
          destinoPendiente ||
          (rol === "ADMIN"
            ? "dashboard-administrador.html"
            : ["VETERINARIO", "VET"].includes(rol)
              ? "dashboard-veterinario.html"
              : "dashboard-cliente.html");

        localStorage.setItem("vetsalud_usuario", JSON.stringify(usuario));
        localStorage.setItem("vetsalud_token", resultado.token);
        localStorage.setItem("vetsalud_rol", rol);
        mostrarToastLogin(
          "¡Inicio de sesión exitoso!",
          resultado.mensaje,
          false,
        );
        setTimeout(() => {
          window.location.href = destino;
        }, 700);
      } catch (error) {
        mostrarToastLogin(
          "Error de conexión",
          "No se pudo conectar con el servidor.",
          true,
        );
      }
    });
  }
});

/* 
   TOAST DE LOGIN
    */

/**
 * Muestra una notificación emergente temporal.
 *
 * @param {string} titulo
 * @param {string} mensaje
 * @param {boolean} esError
 */

function mostrarToastLogin(titulo, mensaje, esError = false) {
  /* =====================================================
       ELIMINAR TOAST ANTERIOR
    ===================================================== */

  const toastExistente = document.querySelector(".login-alerta-toast");

  if (toastExistente) {
    toastExistente.remove();
  }

  /* =====================================================
       CREAR TOAST
    ===================================================== */

  const toast = document.createElement("div");

  toast.className = `login-alerta-toast ${esError ? "error" : ""}`;

  toast.innerHTML = `
        <span
            class="material-symbols-outlined
                   login-alerta-icono"
        >
            ${esError ? "error" : "check_circle"}
        </span>

        <div>

            <div class="login-alerta-titulo">
                ${titulo}
            </div>

            <div class="login-alerta-mensaje">
                ${mensaje}
            </div>

        </div>
    `;

  document.body.appendChild(toast);

  /* =====================================================
       CERRAR AUTOMÁTICAMENTE
    ===================================================== */

  setTimeout(() => {
    toast.style.animation = "deslizarToast 0.3s reverse forwards";

    setTimeout(() => {
      if (toast) {
        toast.remove();
      }
    }, 300);
  }, 3500);
}

/* 
   CARGAR LAYOUT
    */

if (typeof cargarLayout === "function") {
  cargarLayout();
}
