async function cargarComponente(selector, htmlPath, cssPath, jsPath) {
  const contenedor = document.querySelector(selector);

  if (
    !contenedor ||
    contenedor.dataset.cargado === "true" ||
    contenedor.dataset.cargando === "true"
  ) {
    return;
  }

  contenedor.dataset.cargando = "true";

  try {
    const respuesta = await fetch(htmlPath);

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar ${htmlPath}`);
    }

    contenedor.innerHTML = await respuesta.text();
    contenedor.dataset.cargado = "true";

    /* =====================================================
       CARGAR MATERIAL SYMBOLS
    ===================================================== */

    if (!document.querySelector('link[data-fuente="material-symbols"]')) {
      const fuenteIconos = document.createElement("link");

      fuenteIconos.rel = "stylesheet";

      fuenteIconos.href =
        "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";

      fuenteIconos.dataset.fuente = "material-symbols";

      document.head.appendChild(fuenteIconos);
    }

    /* =====================================================
       CARGAR CSS DEL COMPONENTE
    ===================================================== */

    if (
      cssPath &&
      !document.querySelector(`link[data-componente="${selector}"]`)
    ) {
      const link = document.createElement("link");

      link.rel = "stylesheet";

      link.href = cssPath;

      link.dataset.componente = selector;

      document.head.appendChild(link);
    }

    /* =====================================================
       CARGAR JS DEL COMPONENTE
    ===================================================== */

    if (jsPath) {
      const script = document.createElement("script");

      script.async = false;

      script.src = `${jsPath}?v=${Date.now()}`;

      await new Promise((resolve, reject) => {
        script.addEventListener("load", resolve, { once: true });
        script.addEventListener("error", reject, { once: true });
        document.body.appendChild(script);
      });

      delete contenedor.dataset.cargando;
    }
  } catch (error) {
    console.error(`Error al cargar el componente ${selector}:`, error);

    contenedor.innerHTML =
      '<p class="component-error">No se pudo cargar este componente.</p>';
    delete contenedor.dataset.cargando;
  }
}

/* 
   CARGAR LAYOUT
 */

async function cargarLayout() {
  /* =====================================================
     NAVBAR
  ===================================================== */

  await cargarComponente(
    "#nav-container",
    "../components/nav/nav.html",
    "../components/nav/nav.css",
    "../components/nav/nav.js",
  );

  /* =====================================================
     ACCESIBILIDAD
  ===================================================== */

  await cargarComponente(
    "#accessibility-container",
    "../components/accesibilidad/accesibilidad.html",
    "../components/accesibilidad/accesibilidad.css",
    "../components/accesibilidad/accesibilidad.js",
  );

  /* =====================================================
     FOOTER
  ===================================================== */

  await cargarComponente(
    "#footer-container",
    "../components/footer/footer.html",
    "../components/footer/footer.css",
    "../components/footer/footer.js",
  );
}

/* 
   INICIALIZACIÓN
 */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", cargarLayout);
} else {
  cargarLayout();
}
