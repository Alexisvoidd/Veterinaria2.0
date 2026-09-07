(() => {
  const token = localStorage.getItem("vetsalud_token");
  const usuario = JSON.parse(
    localStorage.getItem("vetsalud_usuario") || "null",
  );
  const idAdministrador = Number(
    usuario?.idUsuario || usuario?.id || usuario?.id_usu || 0,
  );

  // Valida autenticación y rol de administrador
  if (!token || String(usuario?.rol || "").toUpperCase() !== "ADMIN") {
    window.location.href = "login.html";
    return;
  }

  // Inicializa avatar y saludo con los datos de sesión
  const avatarElem = document.getElementById("topbar-avatar");
  if (avatarElem && usuario?.nombre) {
    const iniciales =
      `${usuario.nombre.charAt(0)}${usuario.apellido ? usuario.apellido.charAt(0) : ""}`.toUpperCase();
    avatarElem.textContent = iniciales || "AD";
  }

  const saludoElem = document.getElementById("admin-saludo");
  if (saludoElem && usuario?.nombre) {
    saludoElem.textContent = `¡Hola, ${usuario.nombre}!`;
  }

  // Sanitización contra XSS
  const escapar = (valor) =>
    String(valor ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  // Formato regional de fechas (Colombia)
  const fecha = (valor) => {
    if (!valor) return "—";
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return String(valor);
    return d.toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  // Formato de moneda COP
  const dinero = (valor) =>
    Number(valor || 0).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });

  function leerImagen(archivo, limiteMb) {
    if (!archivo) return Promise.resolve(null);
    if (!/^image\/(jpeg|png|webp)$/.test(archivo.type)) {
      return Promise.reject(new Error("La imagen debe ser JPG, PNG o WEBP."));
    }
    if (archivo.size > limiteMb * 1024 * 1024) {
      return Promise.reject(
        new Error(`La imagen no puede superar los ${limiteMb} MB.`),
      );
    }
    return new Promise((resolver, rechazar) => {
      const lector = new FileReader();
      lector.onload = () => resolver(lector.result);
      lector.onerror = () => rechazar(new Error("No se pudo leer la imagen."));
      lector.readAsDataURL(archivo);
    });
  }

  // Notificación flotante de feedback
  function mostrarToast(titulo, mensaje, esError = false) {
    const toastExistente = document.querySelector(".login-alerta-toast");
    if (toastExistente) toastExistente.remove();

    const toast = document.createElement("div");
    toast.className = `login-alerta-toast ${esError ? "error" : ""}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined login-alerta-icono">
        ${esError ? "error" : "check_circle"}
      </span>
      <div>
        <div class="login-alerta-titulo">${escapar(titulo)}</div>
        <div class="login-alerta-mensaje">${escapar(mensaje)}</div>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "deslizarToast 0.3s reverse forwards";
      setTimeout(() => {
        if (toast) toast.remove();
      }, 300);
    }, 3500);
  }

  // Wrapper para peticiones autenticadas
  async function obtener(ruta, opciones = {}) {
    const respuesta = await fetch(ruta, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(opciones.headers || {}),
      },
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(datos.error || "No se pudo completar la operación.");
    }
    return datos;
  }

  // Control de pestañas
  function cambiarTab(tabId) {
    document
      .querySelectorAll(".dash-nav-item")
      .forEach((boton) =>
        boton.classList.toggle("active", boton.dataset.tab === tabId),
      );

    document
      .querySelectorAll(".dash-tab-content")
      .forEach((seccion) =>
        seccion.classList.toggle("active", seccion.id === `tab-${tabId}`),
      );

    document.getElementById("dash-sidebar")?.classList.remove("open");
    document.getElementById("dash-backdrop")?.classList.remove("show");
  }

  // Render: Indicadores y tablas rápidas del resumen
  function renderResumen(citas, ventas, indicadores) {
    const kpis = [
      ["Usuarios activos", indicadores.usuarios || 0, "group"],
      ["Clientes", indicadores.clientes || 0, "person"],
      ["Mascotas", indicadores.mascotas || 0, "pets"],
      ["Citas pendientes", indicadores.citasPendientes || 0, "event"],
      ["Citas de hoy", indicadores.citasHoy || 0, "today"],
      ["Productos", indicadores.productos || 0, "inventory_2"],
      ["Unidades en stock", indicadores.unidadesDisponibles || 0, "warehouse"],
      ["Ingresos totales", dinero(indicadores.ingresos), "payments"],
    ];

    document.getElementById("indicadores").innerHTML = kpis
      .map(
        ([titulo, valor, icono]) =>
          `<article class="dash-kpi-card">
            <div class="dash-kpi-icon-wrap dash-kpi-icon--blue">
              <span class="material-symbols-outlined">${icono}</span>
            </div>
            <div class="dash-kpi-info">
              <span class="dash-kpi-label">${titulo}</span>
              <strong class="dash-kpi-value">${valor}</strong>
            </div>
          </article>`,
      )
      .join("");

    // Próximas citas
    document.getElementById("resumen-citas").innerHTML = citas.length
      ? `<table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Mascota</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${citas
              .slice(0, 5)
              .map(
                (item) =>
                  `<tr>
                    <td>${fecha(item.fecha)}</td>
                    <td>${escapar(item.cliente)}</td>
                    <td>${escapar(item.mascota)}</td>
                    <td><span class="estado ${escapar(String(item.estado || "").toUpperCase())}">${escapar(item.estado)}</span></td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>`
      : "<p>No hay citas registradas.</p>";

    // Pedidos recientes
    document.getElementById("resumen-pedidos").innerHTML = ventas.length
      ? `<table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${ventas
              .slice(0, 5)
              .map(
                (item) =>
                  `<tr>
                    <td><strong>#${item.id_venta}</strong></td>
                    <td>${escapar(item.cliente)}</td>
                    <td>${dinero(item.total)}</td>
                    <td><span class="estado ${escapar(String(item.estado || "").toUpperCase())}">${escapar(item.estado)}</span></td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>`
      : "<p>No hay pedidos registrados.</p>";
  }

  // Render: Tabla de usuarios y roles
  function renderUsuarios(datos) {
    const administradorId = Number(usuario?.idUsuario || usuario?.id || 0);
    document.getElementById("tabla-usuarios").innerHTML = datos.usuarios.length
      ? `<table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${datos.usuarios
              .map(
                (item) =>
                  `<tr>
                    <td>#${item.id}</td>
                    <td><strong>${escapar(`${item.nombre} ${item.apellido}`)}</strong></td>
                    <td>${escapar(item.correo)}</td>
                    <td>${escapar(item.telefono || "—")}</td>
                    <td>
                      <select class="admin-rol-select" data-usuario="${item.id}" ${Number(item.id) === administradorId ? "disabled title='No puedes modificar tu propio rol'" : ""}>
                        ${datos.roles
                          .map(
                            (rol) =>
                              `<option value="${rol.id}" ${Number(rol.id) === Number(item.idRol) ? "selected" : ""}>${escapar(rol.nombre)}</option>`,
                          )
                          .join("")}
                      </select>
                    </td>
                    <td>
                      <select class="admin-usuario-estado" data-usuario="${item.id}" ${Number(item.id) === administradorId ? "disabled title='No puedes desactivar tu propia cuenta'" : ""}>
                        <option value="ACTIVO" ${String(item.estado || "").toUpperCase() === "ACTIVO" ? "selected" : ""}>ACTIVO</option>
                        <option value="INACTIVO" ${String(item.estado || "").toUpperCase() === "INACTIVO" ? "selected" : ""}>INACTIVO</option>
                      </select>
                    </td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>`
      : "<p>No hay usuarios registrados.</p>";
  }

  // Render: Tabla de mascotas
  function renderMascotas(datos) {
    document.getElementById("tabla-mascotas").innerHTML = datos.mascotas.length
      ? `<table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Mascota</th>
              <th>Especie</th>
              <th>Raza</th>
              <th>Sexo</th>
              <th>Propietario</th>
              <th>Contacto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${datos.mascotas
              .map(
                (item) =>
                  `<tr>
                    <td>#${item.id}</td>
                    <td><strong>${escapar(item.nombre)}</strong></td>
                    <td>${escapar(item.especie)}</td>
                    <td>${escapar(item.raza)}</td>
                    <td>${item.sexo === "M" ? "Macho" : item.sexo === "F" ? "Hembra" : escapar(item.sexo)}</td>
                    <td>${escapar(item.propietario)}</td>
                    <td>${escapar(item.correo)}</td>
                    <td>
                      <select class="admin-mascota-estado" data-mascota="${item.id}">
                        <option value="ACTIVO" ${String(item.estado || "").toUpperCase() === "ACTIVO" ? "selected" : ""}>ACTIVO</option>
                        <option value="INACTIVO" ${String(item.estado || "").toUpperCase() === "INACTIVO" ? "selected" : ""}>INACTIVO</option>
                      </select>
                    </td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>`
      : "<p>No hay mascotas registradas.</p>";
  }

  // Render: Tabla de citas
  function renderCitas(citas) {
    document.getElementById("tabla-citas").innerHTML = citas.length
      ? `<table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha y Hora</th>
              <th>Cliente</th>
              <th>Mascota</th>
              <th>Servicio</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${citas
              .map(
                (item) =>
                  `<tr>
                    <td>#${item.id_cita}</td>
                    <td>${fecha(item.fecha)}</td>
                    <td><strong>${escapar(item.cliente)}</strong></td>
                    <td>${escapar(item.mascota)}</td>
                    <td>${escapar(item.servicios || "Consulta general")}</td>
                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${escapar(item.motivo)}">${escapar(item.motivo)}</td>
                    <td>
                      <select class="admin-cita-estado" data-cita="${item.id_cita}">
                        ${["PENDIENTE", "CONFIRMADA", "ATENDIDA", "CANCELADA"]
                          .map(
                            (estado) =>
                              `<option value="${estado}" ${String(estado).toUpperCase() === String(item.estado || "").toUpperCase() ? "selected" : ""}>${estado}</option>`,
                          )
                          .join("")}
                      </select>
                    </td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>`
      : "<p>No hay citas registradas.</p>";
  }

  // Render: Inventario y formulario de productos
  function renderProductos(datos) {
    const categorias = datos.categorias
      .map(
        (item) => `<option value="${item.id}">${escapar(item.nombre)}</option>`,
      )
      .join("");

    const marcas = datos.marcas
      .map(
        (item) => `<option value="${item.id}">${escapar(item.nombre)}</option>`,
      )
      .join("");

    const formulario = `
      <form id="admin-form-producto" class="admin-producto-form">
        <input name="nombre" maxlength="20" required placeholder="Nombre del producto">
        <input name="descripcion" maxlength="100" required placeholder="Descripción">
        <select name="idCategoria" required>
          <option value="">Selecciona Categoría</option>
          ${categorias}
        </select>
        <select name="idMarca" required>
          <option value="">Selecciona Marca</option>
          ${marcas}
        </select>
        <input name="precio" type="number" min="0" step="100" required placeholder="Precio ($)">
        <input name="stock" type="number" min="0" step="1" required placeholder="Stock inicial">
        <select name="talla">
          <option value="">Sin talla</option>
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
        </select>
        <input name="imagenUrl" maxlength="300" placeholder="URL o nombre de imagen">
        <input name="imagenArchivo" type="file" accept="image/jpeg,image/png,image/webp">
        <button type="submit" class="admin-producto-guardar">Agregar producto</button>
      </form>
    `;

    document.getElementById("tabla-productos").innerHTML =
      formulario +
      (datos.productos.length
        ? `<table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Precio ($)</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              ${datos.productos
                .map(
                  (item) =>
                    `<tr>
                      <td>#${item.id}</td>
                      <td><strong>${escapar(item.nombre)}</strong></td>
                      <td>${escapar(item.categoria)}</td>
                      <td>${escapar(item.marca || "—")}</td>
                      <td>
                        <input class="admin-producto-precio" data-producto="${item.id}" type="number" min="0" step="100" value="${Number(item.precio)}">
                      </td>
                      <td>
                        <input class="admin-producto-stock ${Number(item.stock) <= 5 ? "stock-bajo" : ""}" data-producto="${item.id}" type="number" min="0" step="1" value="${Number(item.stock)}">
                      </td>
                      <td>
                        <select class="admin-producto-estado" data-producto="${item.id}">
                          <option value="ACTIVO" ${String(item.estado || "").toUpperCase() === "ACTIVO" ? "selected" : ""}>ACTIVO</option>
                          <option value="INACTIVO" ${String(item.estado || "").toUpperCase() === "INACTIVO" ? "selected" : ""}>INACTIVO</option>
                        </select>
                      </td>
                      <td>
                        <button type="button" class="admin-producto-guardar" data-producto="${item.id}">Guardar</button>
                      </td>
                    </tr>`,
                )
                .join("")}
            </tbody>
          </table>`
        : "<p>No hay productos registrados en el inventario.</p>");
  }

  // Render: Tabla de pedidos y ventas
  function renderVentas(ventas) {
    document.getElementById("tabla-ventas").innerHTML = ventas.length
      ? `<table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Método de Pago</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${ventas
              .map(
                (item) =>
                  `<tr>
                    <td><strong>#${item.id_venta}</strong></td>
                    <td>${fecha(item.fecha)}</td>
                    <td>${escapar(item.cliente)}</td>
                    <td>${escapar(item.productos || "Sin detalle")}</td>
                    <td>${escapar(item.metodo_pago)}</td>
                    <td><strong>${dinero(item.total)}</strong></td>
                    <td>
                      <select class="admin-venta-estado" data-venta="${item.id_venta}">
                        <option value="PAGADA" ${String(item.estado || "").toUpperCase() === "PAGADA" ? "selected" : ""}>PAGADA</option>
                        <option value="ANULADA" ${String(item.estado || "").toUpperCase() === "ANULADA" ? "selected" : ""}>ANULADA</option>
                      </select>
                    </td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>`
      : "<p>No hay pedidos registrados.</p>";
  }

  // Renderiza la información personal del administrador autenticado.
  function renderMiCuenta(datos) {
    const perfil = datos.cliente || {};
    document.getElementById("admin-perfil").innerHTML = `
      <dl class="admin-perfil-lista">
        <div><dt>Nombre</dt><dd>${escapar(`${perfil.nombre || ""} ${perfil.apellido || ""}`.trim())}</dd></div>
        <div><dt>Correo</dt><dd>${escapar(perfil.correo)}</dd></div>
        <div><dt>Documento</dt><dd>${escapar(`${perfil.tipo_documento || ""} ${perfil.documento || ""}`.trim())}</dd></div>
        <div><dt>Teléfono</dt><dd>${escapar(perfil.telefono)}</dd></div>
        <div><dt>Dirección</dt><dd>${escapar(perfil.direccion || "No registrada")}</dd></div>
      </dl>`;

    document.getElementById("admin-mis-mascotas").innerHTML = datos.mascotas
      .length
      ? `<table><thead><tr><th>Nombre</th><th>Especie</th><th>Raza</th><th>Sexo</th></tr></thead><tbody>${datos.mascotas
          .map(
            (mascota) =>
              `<tr><td>${escapar(mascota.nombre)}</td><td>${escapar(mascota.especie)}</td><td>${escapar(mascota.raza)}</td><td>${escapar(mascota.sexo)}</td></tr>`,
          )
          .join("")}</tbody></table>`
      : "<p>No tienes mascotas registradas.</p>";

    document.getElementById("admin-mis-citas").innerHTML = datos.citas.length
      ? `<table><thead><tr><th>Fecha</th><th>Mascota</th><th>Motivo</th><th>Veterinario</th><th>Estado</th></tr></thead><tbody>${datos.citas
          .map(
            (cita) =>
              `<tr><td>${fecha(cita.fecha)}</td><td>${escapar(cita.mascota)}</td><td>${escapar(cita.motivo)}</td><td>${escapar(cita.veterinario || "Por asignar")}</td><td><span class="estado ${escapar(String(cita.estado || "").toUpperCase())}">${escapar(cita.estado)}</span></td></tr>`,
          )
          .join("")}</tbody></table>`
      : "<p>No tienes citas registradas.</p>";

    document.getElementById("admin-mis-historias").innerHTML = datos.historias
      .length
      ? `<table><thead><tr><th>Fecha</th><th>Mascota</th><th>Diagnóstico</th><th>Próxima visita</th></tr></thead><tbody>${datos.historias
          .map(
            (historia) =>
              `<tr><td>${fecha(historia.fecha)}</td><td>${escapar(historia.mascota)}</td><td>${escapar(historia.diagnostico)}</td><td>${escapar(historia.prox_visita || "No programada")}</td></tr>`,
          )
          .join("")}</tbody></table>`
      : "<p>No hay historias clínicas registradas.</p>";

    document.getElementById("admin-mis-compras").innerHTML = datos.compras
      .length
      ? `<table><thead><tr><th>Pedido</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th></tr></thead><tbody>${datos.compras
          .map(
            (compra) =>
              `<tr><td>#${compra.id_venta}</td><td>${fecha(compra.fecha)}</td><td>${escapar(compra.productos || "Sin detalle")}</td><td>${dinero(compra.total)}</td><td><span class="estado">${escapar(compra.estado)}</span></td></tr>`,
          )
          .join("")}</tbody></table>`
      : "<p>No tienes compras registradas.</p>";
  }

  // Carga inicial de datos desde los endpoints
  async function cargar() {
    try {
      const [resumen, usuarios, mascotas, citas, productos, ventas, miCuenta] =
        await Promise.all([
          obtener("/api/admin/resumen"),
          obtener("/api/admin/usuarios"),
          obtener("/api/admin/mascotas"),
          obtener("/api/admin/citas"),
          obtener("/api/admin/productos"),
          obtener("/api/admin/ventas"),
          obtener(`/api/dashboard/${idAdministrador}`),
        ]);

      renderResumen(citas.citas, ventas.ventas, resumen.indicadores);
      renderUsuarios(usuarios);
      renderMascotas(mascotas);
      renderCitas(citas.citas);
      renderProductos(productos);
      renderVentas(ventas.ventas);
      renderMiCuenta(miCuenta);

      const mensajeElem = document.getElementById("mensaje-admin");
      if (mensajeElem) mensajeElem.textContent = "";
    } catch (error) {
      console.error("Error al cargar datos del administrador:", error);
      const mensajeElem = document.getElementById("mensaje-admin");
      if (mensajeElem) mensajeElem.textContent = error.message;
      mostrarToast("Error de carga", error.message, true);
    }
  }

  // Navegación por tabs
  document
    .querySelectorAll(".dash-nav-item")
    .forEach((boton) =>
      boton.addEventListener("click", () => cambiarTab(boton.dataset.tab)),
    );

  // Menú móvil
  document.getElementById("dash-menu-toggle")?.addEventListener("click", () => {
    document.getElementById("dash-sidebar")?.classList.add("open");
    document.getElementById("dash-backdrop")?.classList.add("show");
  });

  document
    .getElementById("dash-backdrop")
    ?.addEventListener("click", () => cambiarTab("resumen"));

  // Logout
  document
    .getElementById("cerrar-sesion")
    ?.addEventListener("click", (evento) => {
      evento.preventDefault();
      localStorage.removeItem("vetsalud_token");
      localStorage.removeItem("vetsalud_usuario");
      localStorage.removeItem("vetsalud_rol");
      window.location.href = "login.html";
    });

  // Manejo de cambios en selects (roles, estados de usuario, mascotas, citas y pedidos)
  document.addEventListener("change", async (evento) => {
    const rolSelect = evento.target.closest(".admin-rol-select");
    const usuarioEstado = evento.target.closest(".admin-usuario-estado");
    const mascotaEstado = evento.target.closest(".admin-mascota-estado");
    const citaEstado = evento.target.closest(".admin-cita-estado");
    const ventaEstado = evento.target.closest(".admin-venta-estado");

    if (
      !rolSelect &&
      !usuarioEstado &&
      !mascotaEstado &&
      !citaEstado &&
      !ventaEstado
    ) {
      return;
    }

    try {
      if (rolSelect) {
        const id = rolSelect.dataset.usuario;
        const res = await obtener(`/api/admin/usuarios/${id}/rol`, {
          method: "PUT",
          body: JSON.stringify({ idRol: Number(rolSelect.value) }),
        });
        mostrarToast(
          "Rol actualizado",
          res.mensaje || "Rol cambiado correctamente.",
        );
        await cargar();
      } else if (usuarioEstado) {
        const id = usuarioEstado.dataset.usuario;
        const res = await obtener(`/api/admin/usuarios/${id}/estado`, {
          method: "PUT",
          body: JSON.stringify({ estado: usuarioEstado.value }),
        });
        mostrarToast("Estado de usuario", res.mensaje || "Estado actualizado.");
        await cargar();
      } else if (mascotaEstado) {
        const id = mascotaEstado.dataset.mascota;
        const res = await obtener(`/api/admin/mascotas/${id}/estado`, {
          method: "PUT",
          body: JSON.stringify({ estado: mascotaEstado.value }),
        });
        mostrarToast(
          "Estado de mascota",
          res.mensaje || "Estado de mascota actualizado.",
        );
        await cargar();
      } else if (citaEstado) {
        const id = citaEstado.dataset.cita;
        const res = await obtener(`/api/admin/citas/${id}/estado`, {
          method: "PUT",
          body: JSON.stringify({ estado: citaEstado.value }),
        });
        mostrarToast(
          "Cita actualizada",
          res.mensaje || "Estado de cita cambiado.",
        );
        await cargar();
      } else if (ventaEstado) {
        const id = ventaEstado.dataset.venta;
        const res = await obtener(`/api/admin/ventas/${id}/estado`, {
          method: "PUT",
          body: JSON.stringify({ estado: ventaEstado.value }),
        });
        mostrarToast(
          "Pedido actualizado",
          res.mensaje || "Estado de pedido cambiado.",
        );
        await cargar();
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      mostrarToast("Error", error.message, true);
      await cargar();
    }
  });

  // Guardar edición de producto
  document.addEventListener("click", async (evento) => {
    const boton = evento.target.closest(".admin-producto-guardar");
    if (!boton || boton.type === "submit") return;

    const id = boton.dataset.producto;
    if (!id) return;

    try {
      const precioInput = document.querySelector(
        `.admin-producto-precio[data-producto="${id}"]`,
      );
      const stockInput = document.querySelector(
        `.admin-producto-stock[data-producto="${id}"]`,
      );
      const estadoSelect = document.querySelector(
        `.admin-producto-estado[data-producto="${id}"]`,
      );

      const res = await obtener(`/api/admin/productos/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          precio: Number(precioInput.value),
          stock: Number(stockInput.value),
          estado: estadoSelect.value,
        }),
      });

      mostrarToast("Producto guardado", res.mensaje || "Producto actualizado.");
      await cargar();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      mostrarToast("Error", error.message, true);
    }
  });

  // Formulario nuevo producto
  document.addEventListener("submit", async (evento) => {
    const formularioMascota = evento.target.closest("#admin-form-mascota");
    if (formularioMascota) {
      evento.preventDefault();
      try {
        const datos = Object.fromEntries(new FormData(formularioMascota));
        const foto = await leerImagen(
          formularioMascota.elements.foto.files[0],
          2,
        );
        const res = await obtener("/api/mascotas", {
          method: "POST",
          body: JSON.stringify({
            ...datos,
            foto,
            fotoTipo: foto ? formularioMascota.elements.foto.files[0].type : "",
          }),
        });
        formularioMascota.reset();
        mostrarToast(
          "Mascota agregada",
          res.mensaje || "Mascota registrada correctamente.",
        );
        await cargar();
      } catch (error) {
        mostrarToast("Error al agregar mascota", error.message, true);
      }
      return;
    }

    const formulario = evento.target.closest("#admin-form-producto");
    if (!formulario) return;

    evento.preventDefault();
    try {
      const datos = Object.fromEntries(new FormData(formulario));
      const archivo = formulario.elements.imagenArchivo.files[0];
      const imagen = await leerImagen(archivo, 5);
      const res = await obtener("/api/admin/productos", {
        method: "POST",
        body: JSON.stringify({
          ...datos,
          idCategoria: Number(datos.idCategoria),
          idMarca: Number(datos.idMarca),
          precio: Number(datos.precio),
          stock: Number(datos.stock),
          talla: datos.talla || null,
          imagenUrl: datos.imagenUrl || null,
          imagen,
        }),
      });

      formulario.reset();
      mostrarToast(
        "¡Producto creado!",
        res.mensaje || "Producto agregado exitosamente.",
      );
      await cargar();
    } catch (error) {
      console.error("Error al crear producto:", error);
      mostrarToast("Error al crear", error.message, true);
    }
  });

  // Inicio
  cargar();
})();
