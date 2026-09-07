
(function () {

  // Busca el elemento principal del navbar.
  const nav = document.getElementById("main-nav");

  // Busca el botón del menú móvil.
  const toggle = document.getElementById("vs-nav-toggle");

  // Busca el contenedor de los enlaces.
  const menu = document.getElementById("vs-nav-links");

  // Busca el icono del botón móvil.
  const icon = document.getElementById("vs-nav-icon");

  // Busca la imagen del logo.
  const logoImg = document.getElementById("vs-nav-logo-img");

  // Detiene la ejecución si no existe el navbar.
  if (!nav) return;


  /* PÁGINA ACTUAL */

  // Obtiene la página actual desde el atributo data-page.
  const paginaActual = document.body.dataset.page || "inicio";


  /*  NAVBAR TRANSPARENTE EN INICIO */

  // Comprueba si estamos en la página de inicio.
  if (paginaActual === "inicio") {

    // Activa el estado transparente del navbar.
    nav.classList.add("vs-nav--transparent");


    // Función que controla el navbar al hacer scroll.
    const manejarScroll = () => {

      // Comprueba si el usuario bajó más de 40 píxeles.
      const desplazado = window.scrollY > 40;

      // Agrega o quita la clase de scroll.
      nav.classList.toggle("scrolled", desplazado);
      if (logoImg)
        logoImg.src = desplazado
          ? "../assets/logo.png"
          : "../assets/logo-blanco.png";
    };


    // Ejecuta la función cada vez que ocurre un scroll.
    window.addEventListener(
      "scroll",
      manejarScroll,
      { passive: true }
    );

    // Ejecuta la función al cargar la página.
    manejarScroll();


  // Configuración para las demás páginas.
  } else if (logoImg) {

    // Usa el logo normal en páginas internas.
    logoImg.src = "../assets/logo.png";
  }


  /*  ENLACES DEL NAVBAR */

  // Comprueba que exista el menú.
  if (menu) {

    // Busca todos los enlaces que tengan data-nav.
    menu.querySelectorAll("[data-nav]").forEach((enlace) => {

      // Marca como activo el enlace de la página actual.
      if (enlace.dataset.nav === paginaActual) {
        enlace.classList.add("active");
      }

      // Cierra el menú al seleccionar un enlace.
      enlace.addEventListener(
        "click",
        () => cerrarMenu()
      );
    });

    // Manejo de clic en el desplegable de servicios (especialmente en móvil)
    const dropdownServicios = document.getElementById(
      "vs-nav-dropdown-servicios",
    );
    const dropdownToggle = dropdownServicios?.querySelector(
      ".vs-nav__dropdown-toggle",
    );

    if (dropdownToggle && dropdownServicios) {

      // Detecta cuando se hace clic en servicios.
      dropdownToggle.addEventListener(
        "click",
        (e) => {

          // Comprueba si estamos en una pantalla pequeña.
          if (window.innerWidth <= 860) {

            // Evita que el enlace navegue inmediatamente.
            e.preventDefault();

            // Evita que el clic se propague.
            e.stopPropagation();

            // Abre o cierra el acordeón móvil.
            dropdownServicios.classList.toggle(
              "is-open-mobile"
            );
          }
        }
      );
    }


    /* CERRAR MENÚ AL SELECCIONAR UN SERVICIO */

    // Busca los elementos del desplegable.
    menu.querySelectorAll(
      ".vs-nav__dropdown-item"
    ).forEach((item) => {

      // Cierra el menú al seleccionar un servicio.
      item.addEventListener(
        "click",
        () => cerrarMenu()
      );
    });
  }


  /* CERRAR MENÚ */

  // Función que cierra el menú móvil.
  function cerrarMenu() {

    // Detiene la función si no existe el menú.
    if (!menu) return;

    // Cierra el menú principal.
    menu.classList.remove("is-open");
    const dropdownServicios = document.getElementById(
      "vs-nav-dropdown-servicios",
    );
    if (dropdownServicios) dropdownServicios.classList.remove("is-open-mobile");
    toggle?.setAttribute("aria-expanded", "false");
    if (icon) icon.textContent = "menu";
  }


  /* MENÚ MÓVIL */

  // Comprueba que existan el botón y el menú.
  if (toggle && menu) {
    toggle.addEventListener("click", (evento) => {
      evento.stopPropagation();
      const abierto = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(abierto));
      if (icon) icon.textContent = abierto ? "close" : "menu";
    });
    document.addEventListener("click", (evento) => {
      if (!menu.contains(evento.target) && !toggle.contains(evento.target))
        cerrarMenu();
    });
  }


  /*  CONTADOR DEL CARRITO */

  // Actualiza el contador al cargar el navbar.
  actualizarContadorCarrito();
  actualizarEstadoSesionNav();
  nav.querySelectorAll('a[href="agendar-citas.html"]').forEach((enlace) => {
    enlace.addEventListener("click", (evento) => {
      if (!localStorage.getItem("vetsalud_usuario")) {
        evento.preventDefault();
        sessionStorage.setItem("vetsalud_destino_login", "agendar-citas.html");
        window.location.href = "login.html";
      }
    });
  });
  window.addEventListener("storage", actualizarContadorCarrito);
  window.addEventListener("storage", actualizarEstadoSesionNav);
  window.addEventListener("carritoActualizado", actualizarContadorCarrito);
})();

function actualizarEstadoSesionNav() {
  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem("vetsalud_usuario") || "null");
    } catch {
      return null;
    }
  })();

  const botonLogin = document.querySelector(".vs-nav__login");
  if (!botonLogin) return;

  if (!usuario) {
    botonLogin.innerHTML = `
      <span class="material-symbols-outlined" aria-hidden="true">person</span>
      <span>Iniciar sesión</span>
    `;
    botonLogin.href = "login.html";
    botonLogin.setAttribute("aria-label", "Iniciar sesión");
    botonLogin.removeAttribute("title");
    botonLogin.classList.remove("vs-nav__login--logged");
    return;
  }

  botonLogin.innerHTML = `
    <span class="material-symbols-outlined" aria-hidden="true">account_circle</span>
  `;
  botonLogin.setAttribute("aria-label", "Abrir panel de usuario");
  botonLogin.setAttribute("title", "Abrir panel de usuario");
  botonLogin.href =
    String(usuario.rol || "CLIENTE").toUpperCase() === "ADMIN"
      ? "dashboard-administrador.html"
      : "dashboard-cliente.html";
  botonLogin.classList.add("vs-nav__login--logged");
}

function obtenerCarrito() {
  try {
    return JSON.parse(localStorage.getItem("vetsalud_carrito") || "[]");
  } catch {
    return [];
  }
}


/*  ACTUALIZAR CONTADOR DEL CARRITO */

// Actualiza la cantidad mostrada en el navbar.
function actualizarContadorCarrito() {

  // Busca el contador del carrito.
  const contador =
    document.getElementById("nav-cart-count");

  // Detiene la función si no existe el contador.
  if (!contador) return;
  const cantidad = obtenerCarrito().reduce(
    (total, producto) => total + Number(producto.cantidad || 0),
    0,
  );
  contador.textContent = cantidad;

  // Oculta el contador cuando la cantidad es cero.
  contador.classList.toggle(
    "vacio",
    cantidad === 0
  );
}