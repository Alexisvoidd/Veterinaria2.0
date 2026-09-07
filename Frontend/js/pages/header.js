document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('main-nav');
  const menuBtn = document.querySelector('.header-menu-btn');
  const navMenu = document.querySelector('.header-nav');
  const menuLinks = document.querySelectorAll('.header-link, .header-login-movil');
  const btnAgendarHeader = document.querySelectorAll('.header-boton');

  // 1. Manejo del efecto de scroll en el encabezado
  const manejarScroll = () => {
    if (!header) return;
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', manejarScroll);
  manejarScroll(); // Ejecutar al cargar la página

  // 2. Alternar menú móvil desplegable
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const estaAbierto = navMenu.classList.toggle('header-nav-abierto');
      menuBtn.setAttribute('aria-expanded', estaAbierto);
      const icono = menuBtn.querySelector('.material-symbols-outlined');
      if (icono) {
        icono.textContent = estaAbierto ? 'close' : 'menu';
      }
    });

    // Cerrar menú al hacer clic en enlaces
    menuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('header-nav-abierto');
        menuBtn.setAttribute('aria-expanded', 'false');
        const icono = menuBtn.querySelector('.material-symbols-outlined');
        if (icono) icono.textContent = 'menu';
      });
    });

    // Cerrar menú al hacer clic fuera del header
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        navMenu.classList.remove('header-nav-abierto');
        menuBtn.setAttribute('aria-expanded', 'false');
        const icono = menuBtn.querySelector('.material-symbols-outlined');
        if (icono) icono.textContent = 'menu';
      }
    });
  }

  // 3. Conexión de botones "Agendar Cita" del header con el modal si existe en la página
  btnAgendarHeader.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (navMenu) {
        navMenu.classList.remove('header-nav-abierto');
        if (menuBtn) {
          menuBtn.setAttribute('aria-expanded', 'false');
          const icono = menuBtn.querySelector('.material-symbols-outlined');
          if (icono) icono.textContent = 'menu';
        }
      }

      const modalGeneral = document.getElementById('modal-cita-general');
      if (modalGeneral) {
        e.preventDefault();
        modalGeneral.classList.add('activo');
      }
    });
  });
});
