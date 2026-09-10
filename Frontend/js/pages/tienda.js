let productos = [];
let categoriaActual = "todos";
let carrito = obtenerCarrito();

const seleccionar = (selector) => document.querySelector(selector);
const imagenProducto = (imagen) =>
  String(imagen || "").startsWith("data:")
    ? imagen
    : `../assets/images/productos/${imagen || "salud.avif"}`;
const dinero = (valor) =>
  Number(valor).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
const escapar = (valor) =>
  String(valor ?? "").replace(
    /[&<>'"]/g,
    (caracter) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        caracter
      ],
  );
const nombreCategoria = (valor) =>
  ({
    ALIMENTACION: "Alimentación",
    HIGIENE: "Higiene",
    ACCESORIOS: "Accesorios",
    BIENESTAR: "Bienestar",
  })[valor] || valor;

function guardarCarrito() {
  localStorage.setItem("vetsalud_carrito", JSON.stringify(carrito));
  window.dispatchEvent(new Event("carritoActualizado"));
  actualizarVistaCarrito();
}
function obtenerCarrito() {
  try {
    return JSON.parse(localStorage.getItem("vetsalud_carrito") || "[]");
  } catch {
    return [];
  }
}
function cantidadCarrito() {
  return carrito.reduce((total, item) => total + Number(item.cantidad || 0), 0);
}
function actualizarVistaCarrito() {
  const contador = seleccionar("#cart-count");
  if (contador) contador.textContent = cantidadCarrito();
}

async function cargarProductos() {
  const parametros = new URLSearchParams();
  const busqueda = seleccionar("#product-search")?.value.trim() || "";
  const orden = seleccionar("#sort-filter")?.value || "relevancia";
  const soloDisponibles = seleccionar("#availability-filter")?.checked || false;
  if (busqueda) parametros.set("busqueda", busqueda);
  if (categoriaActual !== "todos") parametros.set("categoria", categoriaActual);
  if (soloDisponibles) parametros.set("disponibles", "true");
  parametros.set("orden", orden);

  const contenedor = seleccionar("#product-grid");
  contenedor.innerHTML = '<div class="empty-state">Cargando productos...</div>';
  try {
    const respuesta = await fetch(
      `http://localhost:3001/api/productos?${parametros.toString()}`,
    );
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error);
    productos = resultado.productos;
    renderProductos();
  } catch (error) {
    contenedor.innerHTML = `<div class="empty-state">${escapar(error.message || "No se pudieron cargar los productos.")}</div>`;
  }
}

function renderProductos() {
  const contenedor = seleccionar("#product-grid");
  seleccionar("#results-count").textContent =
    `${productos.length} ${productos.length === 1 ? "producto encontrado" : "productos encontrados"}`;
  contenedor.innerHTML = productos.length
    ? productos
        .map((producto) => {
          const sinStock = Number(producto.stock) <= 0;
          const stockTexto = sinStock
            ? "Agotado"
            : `${producto.stock} disponibles`;
          return `<article class="product-card">
      <div class="product-image-wrap"><img class="product-image" src="${escapar(imagenProducto(producto.imagen))}" alt="${escapar(producto.nombre)}" loading="lazy">
      <span class="product-stock ${sinStock ? "agotado" : ""}">${stockTexto}</span></div>
      <div class="product-body"><span class="product-category">${nombreCategoria(producto.categoria)}</span>
      <h3>${escapar(producto.nombre)}</h3><p>${escapar(producto.descripcion)}</p>
      <div class="product-footer"><strong class="price">${dinero(producto.precio)}</strong>
      <div class="product-actions"><button class="detail-btn" data-detalle="${producto.id}" type="button">Ver producto</button>
      <button class="add-btn" data-agregar="${producto.id}" type="button" ${sinStock ? "disabled" : ""}>${sinStock ? "Agotado" : "Añadir"}</button></div></div></div></article>`;
        })
        .join("")
    : '<div class="empty-state">No encontramos productos con esos filtros.</div>';
}

function abrirDetalle(id) {
  const producto = productos.find((item) => Number(item.id) === id);
  if (!producto) return;
  const agotado = Number(producto.stock) <= 0;
  seleccionar("#modal-content").innerHTML = `<div class="product-detail">
    <img src="${escapar(imagenProducto(producto.imagen))}" alt="${escapar(producto.nombre)}">
    <div><span class="product-detail__cat">${nombreCategoria(producto.categoria)}</span>
    <h2 id="modal-title">${escapar(producto.nombre)}</h2><p class="product-detail__desc">${escapar(producto.descripcion)}</p>
    <div class="stock-detail"><strong>Disponibilidad</strong><span>${agotado ? "Agotado" : `${producto.stock} unidades disponibles`}</span></div>
    <p class="detail-price">${dinero(producto.precio)}</p>
    <button class="btn btn-primary" data-modal-agregar="${producto.id}" type="button" ${agotado ? "disabled" : ""}>${agotado ? "Producto agotado" : "Añadir al carrito"}</button>
    </div></div>`;
  seleccionar("#product-modal").classList.add("is-open");
  seleccionar("#product-modal").setAttribute("aria-hidden", "false");
}
function cerrarDetalle() {
  seleccionar("#product-modal")?.classList.remove("is-open");
  seleccionar("#product-modal")?.setAttribute("aria-hidden", "true");
}

function agregar(id) {
  const producto = productos.find((item) => Number(item.id) === id);
  if (!producto || Number(producto.stock) <= 0) return;
  const existente = carrito.find((item) => Number(item.id) === id);
  const nuevaCantidad = (existente?.cantidad || 0) + 1;
  if (nuevaCantidad > Number(producto.stock)) {
    alert(`Solo hay ${producto.stock} unidades disponibles de este producto.`);
    return;
  }
  if (existente) existente.cantidad = nuevaCantidad;
  else
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      imagen: producto.imagen,
      cantidad: 1,
    });
  guardarCarrito();
}

document.addEventListener("click", (evento) => {
  const detalle = evento.target.closest("[data-detalle]");
  if (detalle) return abrirDetalle(Number(detalle.dataset.detalle));
  const agregarBoton = evento.target.closest("[data-agregar]");
  if (agregarBoton) {
    agregar(Number(agregarBoton.dataset.agregar));
    agregarBoton.textContent = "✓ Añadido";
    setTimeout(() => {
      if (!agregarBoton.disabled) agregarBoton.textContent = "Añadir";
    }, 900);
    return;
  }
  const agregarModal = evento.target.closest("[data-modal-agregar]");
  if (agregarModal) {
    agregar(Number(agregarModal.dataset.modalAgregar));
    cerrarDetalle();
    return;
  }
  if (evento.target.closest("[data-close-modal]")) cerrarDetalle();
});

seleccionar("#product-search")?.addEventListener("input", () =>
  cargarProductos(),
);
seleccionar("#category-filter")?.addEventListener("change", (evento) => {
  categoriaActual = evento.target.value;
  document
    .querySelectorAll(".chip")
    .forEach((chip) =>
      chip.classList.toggle(
        "active",
        chip.dataset.category === categoriaActual,
      ),
    );
  cargarProductos();
});
seleccionar("#sort-filter")?.addEventListener("change", cargarProductos);
seleccionar("#availability-filter")?.addEventListener(
  "change",
  cargarProductos,
);
document.querySelectorAll(".chip").forEach((chip) =>
  chip.addEventListener("click", () => {
    categoriaActual = chip.dataset.category;
    seleccionar("#category-filter").value = categoriaActual;
    document
      .querySelectorAll(".chip")
      .forEach((item) => item.classList.toggle("active", item === chip));
    cargarProductos();
  }),
);
seleccionar("#open-cart")?.addEventListener("click", () => {
  window.location.href = "carrito.html";
});

actualizarVistaCarrito();
cargarProductos();
