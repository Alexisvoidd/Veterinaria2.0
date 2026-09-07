// Obtiene el token de sesión del usuario administrador.
const token = localStorage.getItem("vetsalud_token");
// Recupera la información del usuario autenticado desde localStorage.
const usuario = JSON.parse(localStorage.getItem("vetsalud_usuario") || "null");
// Escapa caracteres HTML básicos para prevenir inyección al renderizar textos.
const escapar = (v) =>
  String(v ?? "").replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
  );
// Formatea valores numéricos como moneda colombiana.
const dinero = (v) =>
  Number(v || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
// Convierte fechas ISO a un formato legible en español.
const fecha = (v) =>
  new Date(v).toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
// Realiza una petición autenticada a la API del administrador.
async function obtener(ruta) {
  const r = await fetch(ruta, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "No se pudo cargar la información.");
  return d;
}
// Muestra los indicadores principales del dashboard con datos resumidos.
function mostrarIndicadores(i) {
  const datos = [
    ["Usuarios activos", i.usuarios],
    ["Clientes", i.clientes],
    ["Mascotas", i.mascotas],
    ["Productos", i.productos],
    ["Unidades disponibles", i.unidadesDisponibles],
    ["Citas pendientes", i.citasPendientes],
    ["Citas de hoy", i.citasHoy],
    ["Pedidos", i.pedidos],
    ["Ingresos registrados", dinero(i.ingresos)],
  ];
  document.getElementById("indicadores").innerHTML = datos
    .map(
      ([t, v]) =>
        `<article class="indicador"><small>${t}</small><strong>${v}</strong></article>`,
    )
    .join("");
}
// Renderiza la tabla de citas con un máximo de quince registros.
function tablaCitas(citas) {
  document.getElementById("tabla-citas").innerHTML = citas.length
    ? `<table><thead><tr><th>Fecha</th><th>Cliente</th><th>Mascota</th><th>Servicio</th><th>Estado</th></tr></thead><tbody>${citas
        .slice(0, 15)
        .map(
          (c) =>
            `<tr><td>${fecha(c.fecha)}</td><td>${escapar(c.cliente)}</td><td>${escapar(c.mascota)}</td><td>${escapar(c.servicios || "—")}</td><td><span class="estado ${c.estado}">${escapar(c.estado)}</span></td></tr>`,
        )
        .join("")}</tbody></table>`
    : "<p>No hay citas registradas.</p>";
}
// Renderiza la tabla de productos con su categoría, precio y stock.
function tablaProductos(productos) {
  document.getElementById("tabla-productos").innerHTML =
    `<table><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th></tr></thead><tbody>${productos.map((p) => `<tr><td>${escapar(p.nombre)}</td><td>${escapar(p.categoria)}</td><td>${dinero(p.precio)}</td><td class="${Number(p.stock) <= 5 ? "stock-bajo" : ""}">${p.stock}</td></tr>`).join("")}</tbody></table>`;
}
// Renderiza la tabla de ventas con información del pedido y su estado.
function tablaVentas(ventas) {
  document.getElementById("tabla-ventas").innerHTML = ventas.length
    ? `<table><thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Pago</th><th>Total</th><th>Estado</th></tr></thead><tbody>${ventas.map((v) => `<tr><td>#${v.id_venta}</td><td>${fecha(v.fecha)}</td><td>${escapar(v.cliente)}</td><td>${escapar(v.metodo_pago)}</td><td>${dinero(v.total)}</td><td><span class="estado">${escapar(v.estado)}</span></td></tr>`).join("")}</tbody></table>`
    : "<p>No hay pedidos registrados.</p>";
}
// Carga el resumen del dashboard y valida permisos del usuario administrador.
async function cargar() {
  if (!token || usuario?.rol !== "ADMIN") {
    window.location.href = "login.html";
    return;
  }
  try {
    const [resumen, citas, productos, ventas] = await Promise.all([
      obtener("/api/admin/resumen"),
      obtener("/api/admin/citas"),
      obtener("/api/admin/productos"),
      obtener("/api/admin/ventas"),
    ]);
    mostrarIndicadores(resumen.indicadores);
    tablaCitas(citas.citas);
    tablaProductos(productos.productos);
    tablaVentas(ventas.ventas);
  } catch (e) {
    document.getElementById("mensaje-admin").textContent = e.message;
    if (e.message.includes("sesión") || e.message.includes("permisos")) {
      localStorage.removeItem("vetsalud_token");
      localStorage.removeItem("vetsalud_usuario");
      setTimeout(() => (window.location.href = "login.html"), 800);
    }
  }
}
// Cierra la sesión activa y redirige al login del sistema.
document.getElementById("cerrar-sesion").addEventListener("click", () => {
  localStorage.removeItem("vetsalud_token");
  localStorage.removeItem("vetsalud_usuario");
  window.location.href = "login.html";
});
// Ejecuta la carga inicial del dashboard al abrir la página.
cargar();
