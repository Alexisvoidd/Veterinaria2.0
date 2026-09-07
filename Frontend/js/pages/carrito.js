let carrito = obtenerCarrito();
const imagenCarrito = (imagen) =>
  String(imagen || "").startsWith("data:")
    ? imagen
    : `../assets/images/productos/${imagen || "salud.avif"}`;

/* FORMATEA UN VALOR NUMÉRICO COMO MONEDA COLOMBIANA (COP) */
const dinero = (valor) =>
  Number(valor).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

/* ESCAPA CARACTERES ESPECIALES PARA EVITAR INSERTAR HTML NO DESEADO */
const escapar = (valor) =>
  String(valor ?? "").replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );

/* OBTIENE EL CARRITO DESDE LOCALSTORAGE */
function obtenerCarrito() {
  /* INTENTA LEER Y CONVERTIR EL CARRITO GUARDADO */
  try {
    /* OBTIENE EL VALOR GUARDADO O USA UN ARRAY VACÍO SI NO EXISTE */
    return JSON.parse(localStorage.getItem("vetsalud_carrito") || "[]");

    /* SI OCURRE UN ERROR AL LEER EL CARRITO, DEVUELVE UN ARRAY VACÍO */
  } catch {
    /* EVITA QUE EL ERROR DETENGA EL RESTO DEL SCRIPT */
    return [];
  }
}

/* GUARDA EL CARRITO ACTUALIZADO EN LOCALSTORAGE */
function guardarCarrito() {
  /* CONVIERTE EL ARRAY DEL CARRITO A TEXTO JSON Y LO GUARDA */
  localStorage.setItem("vetsalud_carrito", JSON.stringify(carrito));

  /* AVISA AL RESTO DE LA APLICACIÓN QUE EL CARRITO CAMBIÓ */
  window.dispatchEvent(new Event("carritoActualizado"));

  /* ACTUALIZA VISUALMENTE EL CARRITO */
  renderizarCarrito();
}

/* CALCULA LA CANTIDAD TOTAL DE PRODUCTOS DEL CARRITO */
function cantidadTotal() {
  /* SUMA LAS CANTIDADES DE TODOS LOS PRODUCTOS */
  return carrito.reduce((t, p) => t + Number(p.cantidad || 0), 0);
}

/* CALCULA EL VALOR TOTAL DE TODOS LOS PRODUCTOS */
function total() {
  /* MULTIPLICA PRECIO POR CANTIDAD Y SUMA TODOS LOS PRODUCTOS */
  return carrito.reduce(
    (t, p) => t + (Number(p.precio) || 0) * Number(p.cantidad || 0),
    0,
  );
}

/* DIBUJA O ACTUALIZA TODOS LOS ELEMENTOS DEL CARRITO EN LA PÁGINA */
function renderizarCarrito() {
  /* BUSCA EL CONTENEDOR DONDE SE MOSTRARÁN LOS PRODUCTOS */
  const contenedor = document.getElementById("carrito-items");

  /* MUESTRA LA CANTIDAD TOTAL DE PRODUCTOS */
  document.getElementById("resumen-cantidad").textContent = cantidadTotal();

  /* MUESTRA EL VALOR TOTAL FORMATEADO COMO PESOS COLOMBIANOS */
  document.getElementById("resumen-total").textContent = dinero(total());

  /* COMPRUEBA SI EL CARRITO NO TIENE PRODUCTOS */
  if (!carrito.length) {
    /* MUESTRA EL MENSAJE DE CARRITO VACÍO Y EL BOTÓN PARA IR A LA TIENDA */
    contenedor.innerHTML =
      '<div class="carrito-vacio"><h2>Tu carrito está vacío</h2><p>Agrega productos desde la tienda para comenzar.</p><a class="boton-secundario" href="tienda.html">Ir a la tienda</a></div>';

    /* DETIENE LA FUNCIÓN PORQUE NO HAY PRODUCTOS QUE MOSTRAR */
    return;
  }

  /* GENERA EL HTML DE CADA PRODUCTO DEL CARRITO */
  contenedor.innerHTML = carrito
    .map(
      (p) => `

        <!-- CONTENEDOR INDIVIDUAL DEL PRODUCTO -->
        <article class="item-carrito">

            <!-- IMAGEN DEL PRODUCTO -->
            <img src="${escapar(imagenCarrito(p.imagen))}" alt="${escapar(p.nombre)}">

            <!-- INFORMACIÓN DEL PRODUCTO -->
            <div>

                <!-- NOMBRE DEL PRODUCTO -->
                <h3>${escapar(p.nombre)}</h3>

                <!-- PRECIO DEL PRODUCTO POR UNIDAD -->
                <p>${dinero(p.precio)} por unidad</p>

                <!-- CONTROLES PARA CAMBIAR LA CANTIDAD -->
                <div class="control-cantidad">

                    <!-- BOTÓN PARA DISMINUIR LA CANTIDAD -->
                    <button data-menos="${p.id}" type="button">−</button>

                    <!-- CANTIDAD ACTUAL DEL PRODUCTO -->
                    <strong>${p.cantidad}</strong>

                    <!-- BOTÓN PARA AUMENTAR LA CANTIDAD -->
                    <button data-mas="${p.id}" type="button">+</button>

                <!-- CIERRA LOS CONTROLES DE CANTIDAD -->
                </div>

            <!-- CIERRA LA INFORMACIÓN DEL PRODUCTO -->
            </div>

            <!-- BOTÓN PARA ELIMINAR EL PRODUCTO -->
            <button class="eliminar-item" data-eliminar="${p.id}" type="button">Eliminar</button>

        <!-- CIERRA EL PRODUCTO -->
        </article>

    /* UNE TODOS LOS PRODUCTOS GENERADOS EN UN SOLO TEXTO HTML */
    `,
    )
    .join("");
}

/* ABRE EL MODAL PARA REALIZAR LA COMPRA */
function abrirCompra() {
  /* OBTIENE LOS DATOS DEL USUARIO GUARDADOS EN LOCALSTORAGE */
  const usuario = JSON.parse(
    localStorage.getItem("vetsalud_usuario") || "null",
  );

  /* SI EL CARRITO ESTÁ VACÍO, NO PERMITE ABRIR EL MODAL */
  if (!carrito.length) return;

  /* AGREGA LA CLASE ACTIVO PARA MOSTRAR EL MODAL */
  document.getElementById("modal-compra").classList.add("activo");

  /* INDICA QUE EL MODAL ESTÁ VISIBLE PARA ACCESIBILIDAD */
  document.getElementById("modal-compra").setAttribute("aria-hidden", "false");

  /* COMPRUEBA SI EXISTEN DATOS DEL USUARIO */
  if (usuario) {
    /* COLOCA EL NOMBRE Y APELLIDO DEL USUARIO EN EL FORMULARIO */
    document.getElementById("nombre-compra").value =
      `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();

    /* COLOCA EL CORREO DEL USUARIO EN EL FORMULARIO */
    document.getElementById("correo-compra").value = usuario.correo || "";
  }
}

/* CIERRA EL MODAL DE COMPRA */
function cerrarCompra() {
  /* QUITA LA CLASE ACTIVO PARA OCULTAR EL MODAL */
  document.getElementById("modal-compra").classList.remove("activo");

  /* INDICA QUE EL MODAL ESTÁ OCULTO PARA ACCESIBILIDAD */
  document.getElementById("modal-compra").setAttribute("aria-hidden", "true");
}

/* ESCUCHA LOS CLICS REALIZADOS EN EL DOCUMENTO */
document.addEventListener("click", (e) => {
  /* BUSCA SI EL ELEMENTO CLICKEADO O UNO DE SUS PADRES ES EL BOTÓN + */
  const mas = e.target.closest("[data-mas]");

  /* BUSCA SI EL ELEMENTO CLICKEADO O UNO DE SUS PADRES ES EL BOTÓN - */
  const menos = e.target.closest("[data-menos]");

  /* BUSCA SI EL ELEMENTO CLICKEADO O UNO DE SUS PADRES ES EL BOTÓN ELIMINAR */
  const eliminar = e.target.closest("[data-eliminar]");

  /* COMPRUEBA SI SE PRESIONÓ EL BOTÓN PARA AUMENTAR */
  if (mas) {
    /* BUSCA EL PRODUCTO QUE CORRESPONDE AL ID DEL BOTÓN */
    const p = carrito.find((x) => Number(x.id) === Number(mas.dataset.mas));

    /* SI EL PRODUCTO EXISTE, AUMENTA SU CANTIDAD EN UNO */
    if (p) p.cantidad++;

    /* GUARDA Y ACTUALIZA EL CARRITO */
    guardarCarrito();
  }

  /* COMPRUEBA SI SE PRESIONÓ EL BOTÓN PARA DISMINUIR */
  if (menos) {
    /* BUSCA EL PRODUCTO QUE CORRESPONDE AL ID DEL BOTÓN */
    const p = carrito.find((x) => Number(x.id) === Number(menos.dataset.menos));

    /* COMPRUEBA SI EL PRODUCTO EXISTE */
    if (p) {
      /* DISMINUYE LA CANTIDAD DEL PRODUCTO EN UNO */
      p.cantidad--;

      /* COMPRUEBA SI LA CANTIDAD LLEGÓ A CERO */
      if (p.cantidad <= 0)
        /* ELIMINA EL PRODUCTO DEL CARRITO */
        carrito = carrito.filter(
          (x) => Number(x.id) !== Number(menos.dataset.menos),
        );

      /* GUARDA Y ACTUALIZA EL CARRITO */
      guardarCarrito();
    }
  }

  /* COMPRUEBA SI SE PRESIONÓ EL BOTÓN PARA ELIMINAR */
  if (eliminar) {
    /* ELIMINA DEL ARRAY EL PRODUCTO SELECCIONADO */
    carrito = carrito.filter(
      (x) => Number(x.id) !== Number(eliminar.dataset.eliminar),
    );

    /* GUARDA Y ACTUALIZA EL CARRITO */
    guardarCarrito();
  }

  /* COMPRUEBA SI SE PRESIONÓ EL BOTÓN DE COMPRAR */
  if (e.target.closest("#boton-comprar"))
    /* ABRE EL MODAL DE compra */
    abrirCompra();

  /* COMPRUEBA SI SE PRESIONÓ UN ELEMENTO PARA CERRAR LA COMPRA */
  if (e.target.closest("[data-cerrar-compra]"))
    /* CIERRA EL MODAL DE COMPRA */
    cerrarCompra();
});

/* ESCUCHA EL ENVÍO DEL FORMULARIO DE COMPRA */
document.getElementById("form-compra").addEventListener("submit", async (e) => {
  /* EVITA QUE EL FORMULARIO RECARGUE LA PÁGINA */
  e.preventDefault();

  /* OBTIENE EL ELEMENTO DONDE SE MOSTRARÁN LOS MENSAJES */
  const mensaje = document.getElementById("mensaje-compra");

  /* CREA EL OBJETO CON TODOS LOS DATOS DE LA COMPRA */
  const datos = {
    /* OBTIENE Y LIMPIA EL NOMBRE DEL CLIENTE */
    nombre: document.getElementById("nombre-compra").value.trim(),

    /* OBTIENE Y LIMPIA EL CORREO DEL CLIENTE */
    correo: document.getElementById("correo-compra").value.trim(),

    /* OBTIENE Y LIMPIA EL TELÉFONO DEL CLIENTE */
    telefono: document.getElementById("telefono-compra").value.trim(),

    /* OBTIENE Y LIMPIA LA CIUDAD DEL CLIENTE */
    ciudad: document.getElementById("ciudad-compra").value.trim(),

    /* OBTIENE Y LIMPIA LA DIRECCIÓN DEL CLIENTE */
    direccion: document.getElementById("direccion-compra").value.trim(),

    /* OBTIENE EL MÉTODO DE PAGO SELECCIONADO */
    metodoPago: document.getElementById("pago-compra").value,

    /* OBTIENE Y LIMPIA LAS NOTAS DE LA COMPRA */
    notas: document.getElementById("notas-compra").value.trim(),

    /* AGREGA TODOS LOS PRODUCTOS DEL CARRITO */
    items: carrito,
  };

  /* COMPRUEBA QUE TODOS LOS CAMPOS OBLIGATORIOS SEAN VÁLIDOS */
  if (
    !datos.nombre ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo) ||
    datos.telefono.length < 7 ||
    datos.ciudad.length < 3 ||
    datos.direccion.length < 7 ||
    !datos.metodoPago
  ) {
    /* MUESTRA UN MENSAJE SI ALGÚN DATO OBLIGATORIO ES INCORRECTO */
    mensaje.textContent = "Revisa todos los campos obligatorios.";

    /* DETIENE EL ENVÍO DE LA COMPRA */
    return;
  }

  /* INTENTA ENVIAR LA COMPRA AL SERVIDOR */
  try {
    /* REALIZA UNA PETICIÓN POST A LA API DE VENTAS */
    const respuesta = await fetch("/api/ventas", {
      /* INDICA QUE SE ESTÁ CREANDO UNA NUEVA VENTA */
      method: "POST",

      /* INDICA QUE LOS DATOS SE ENVIARÁN EN FORMATO JSON */
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("vetsalud_token") || ""}`,
      },

      /* CONVIERTE LOS DATOS DE LA COMPRA A FORMATO JSON */
      body: JSON.stringify(datos),
    });

    /* CONVIERTE LA RESPUESTA DEL SERVIDOR DE JSON A UN OBJETO */
    const resultado = await respuesta.json();

    /* MUESTRA EL MENSAJE O ERROR DEVUELTO POR EL SERVIDOR */
    mensaje.textContent = resultado.error || resultado.mensaje;

    /* SI LA RESPUESTA NO FUE EXITOSA, DETIENE EL PROCESO */
    if (!respuesta.ok) return;

    /* VACÍA EL CARRITO DESPUÉS DE UNA COMPRA EXITOSA */
    carrito = [];

    /* ACTUALIZA EL CARRITO VACÍO EN LOCALSTORAGE */
    localStorage.setItem("vetsalud_carrito", "[]");

    /* AVISA AL RESTO DE LA APLICACIÓN QUE EL CARRITO CAMBIÓ */
    window.dispatchEvent(new Event("carritoActualizado"));

    /* ACTUALIZA VISUALMENTE EL CARRITO */
    renderizarCarrito();

    /* REINICIA TODOS LOS CAMPOS DEL FORMULARIO */
    e.target.reset();

    /* MUESTRA EL MENSAJE DE CONFIRMACIÓN CON EL NÚMERO DEL PEDIDO */
    mensaje.textContent = `${resultado.mensaje} Número de pedido: ${resultado.idVenta}.`;

    /* ESPERA 1.8 SEGUNDOS Y CIERRA EL MODAL */
    setTimeout(cerrarCompra, 1800);

    /* CAPTURA CUALQUIER ERROR DURANTE LA PETICIÓN */
  } catch {
    /* INFORMA AL USUARIO QUE NO SE PUDO CONTACTAR CON EL SERVIDOR */
    mensaje.textContent = "No se pudo conectar con el servidor.";
  }
});

/* RENDERIZA EL CARRITO INMEDIATAMENTE AL CARGAR EL SCRIPT */
renderizarCarrito();
