
(() => {
  const token = localStorage.getItem("vetsalud_token");
  const usuarioGuardado = localStorage.getItem("vetsalud_usuario");

  // Validate active session
  if (!token || !usuarioGuardado) {
    window.location.href = "login.html";
    return;
  }

  let usuario;
  try {
    usuario = JSON.parse(usuarioGuardado);
  } catch (error) {
    localStorage.removeItem("vetsalud_usuario");
    localStorage.removeItem("vetsalud_token");
    window.location.href = "login.html";
    return;
  }

  // Validate allowed role for veterinary panel
  const rol = String(usuario.rol || "").trim().toUpperCase();
  if (rol !== "VETERINARIO" && rol !== "VET" && rol !== "ADMIN") {
    window.location.href = rol === "CLIENTE" ? "dashboard-cliente.html" : "login.html";
    return;
  }

  // Cache collections for modals and quick actions
  let consultasCache = [];
  let pacientesCache = [];
  let historiasCache = [];
  let productosCache = [];
  let serviciosCache = [];

  // DOM elements
  const nombreVeterinarioElem = document.getElementById("nombre-veterinario");
  const fechaActualElem = document.getElementById("fecha-actual");
  const totalPacientesElem = document.getElementById("total-pacientes");
  const totalConsultasElem = document.getElementById("total-consultas");
  const totalTratamientosElem = document.getElementById("total-tratamientos");
  const totalHistoriasElem = document.getElementById("total-historias");
  const consultasListaElem = document.getElementById("consultas-lista-contenedor");

  // Format greeting
  if (nombreVeterinarioElem) {
    const nombreCompleto = usuario.nombre
      ? `${usuario.nombre} ${usuario.apellido || ""}`.trim()
      : "Veterinario";
    nombreVeterinarioElem.textContent = nombreCompleto;
  }

  // Format current date (es-CO)
  if (fechaActualElem) {
    const hoy = new Date();
    const textoFecha = hoy.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    fechaActualElem.textContent = textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1);
  }

  // Sanitize strings against XSS
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
        })[c] || c,
    );

  // Format date helper
  const formatearFecha = (valor, incluirHora = true) => {
    if (!valor) return "—";
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return String(valor);
    const opciones = {
      dateStyle: "short",
      ...(incluirHora ? { timeStyle: "short" } : {}),
    };
    return d.toLocaleString("es-CO", opciones);
  };

  // Toast feedback notification
  function mostrarToast(titulo, mensaje, esError = false) {
    const toastPrevio = document.querySelector(".login-alerta-toast");
    if (toastPrevio) toastPrevio.remove();

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

  // Authenticated HTTP request wrapper
  async function apiFetch(ruta, opciones = {}) {
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
      throw new Error(datos.error || "Error al procesar la solicitud.");
    }
    return datos;
  }

  // Modal display controllers
  function abrirModal(modalId) {
    const backdrop = document.getElementById(modalId);
    if (backdrop) {
      backdrop.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  function cerrarModal(modalId) {
    const backdrop = document.getElementById(modalId);
    if (backdrop) {
      backdrop.setAttribute("hidden", "");
      document.body.style.overflow = "";
    }
  }

  function cerrarModalesAbiertos() {
    document.querySelectorAll(".vet-modal-backdrop").forEach((modal) => {
      modal.setAttribute("hidden", "");
    });
    document.body.style.overflow = "";
  }

  // Attach modal close events
  document.addEventListener("click", (evento) => {
    if (
      evento.target.matches("[data-cerrar-modal]") ||
      evento.target.closest("[data-cerrar-modal]") ||
      evento.target.classList.contains("vet-modal-backdrop")
    ) {
      cerrarModalesAbiertos();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      cerrarModalesAbiertos();
    }
  });

  // Load KPI summary metrics
  async function cargarResumen() {
    try {
      const { resumen } = await apiFetch("/api/veterinario/resumen");
      if (totalPacientesElem) totalPacientesElem.textContent = resumen.totalPacientes ?? 0;
      if (totalConsultasElem) totalConsultasElem.textContent = resumen.totalConsultas ?? 0;
      if (totalTratamientosElem) totalTratamientosElem.textContent = resumen.totalTratamientos ?? 0;
      if (totalHistoriasElem) totalHistoriasElem.textContent = resumen.totalHistorias ?? 0;
    } catch (error) {
      console.error("Error al cargar resumen:", error);
      mostrarToast("Error", "No se pudieron actualizar los indicadores.", true);
    }
  }

  // Render recent consultations on main panel
  function renderConsultasRecientes(consultas) {
    if (!consultasListaElem) return;

    if (!consultas || !consultas.length) {
      consultasListaElem.innerHTML = `
        <div class="vet-empty-state">
          <span class="material-symbols-outlined">event_busy</span>
          <p>No hay consultas clínicas registradas.</p>
        </div>
      `;
      return;
    }

    const estadoClases = {
      CONFIRMADA: "estado CONFIRMADA",
      ATENDIDA: "estado ATENDIDA",
      PENDIENTE: "estado PENDIENTE",
      CANCELADA: "estado CANCELADA",
    };

    consultasListaElem.innerHTML = consultas
      .slice(0, 5)
      .map((item) => {
        const estado = String(item.estado || "PENDIENTE").toUpperCase();
        const claseEstado = estadoClases[estado] || "estado";
        const servicioOMotivo = item.servicios || item.motivo || "Consulta clínica";

        return `
          <div class="consulta-item">
            <div class="consulta-icono">
              <span class="material-symbols-outlined">pets</span>
            </div>
            <div class="consulta-datos">
              <strong>${escapar(item.mascota)} <span class="vet-text-muted">(${escapar(item.especie || "Mascota")})</span></strong>
              <span>${escapar(servicioOMotivo)} &bull; ${formatearFecha(item.fecha)}</span>
            </div>
            <div class="${claseEstado}">${escapar(item.estado)}</div>
          </div>
        `;
      })
      .join("");
  }

  // Fetch consultations list
  async function cargarConsultas() {
    try {
      const { consultas } = await apiFetch("/api/veterinario/consultas");
      consultasCache = consultas || [];
      renderConsultasRecientes(consultasCache);
      renderTablaTodasConsultas(consultasCache);
    } catch (error) {
      console.error("Error al cargar consultas:", error);
      if (consultasListaElem) {
        consultasListaElem.innerHTML = `
          <div class="vet-empty-state error">
            <p>No se pudieron cargar las consultas.</p>
          </div>
        `;
      }
    }
  }

  // Render all consultations modal table
  function renderTablaTodasConsultas(consultas) {
    const tbody = document.getElementById("tabla-todas-consultas-body");
    if (!tbody) return;

    if (!consultas || !consultas.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 24px; color: var(--color-texto-secundario);">
            No se encontraron consultas registradas.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = consultas
      .map((item) => {
        const estadoActual = String(item.estado || "PENDIENTE").toUpperCase();
        return `
          <tr>
            <td><strong>${formatearFecha(item.fecha)}</strong></td>
            <td>
              <strong>${escapar(item.mascota)}</strong>
              <div class="vet-subtexto">${escapar(item.especie || "")} ${item.raza ? `&bull; ${escapar(item.raza)}` : ""}</div>
            </td>
            <td>
              <strong>${escapar(item.cliente)}</strong>
              <div class="vet-subtexto">${escapar(item.telefono || item.correo || "")}</div>
            </td>
            <td>
              <strong>${escapar(item.servicios || "Consulta")}</strong>
              <div class="vet-subtexto">${escapar(item.motivo || "")}</div>
            </td>
            <td>
              <select class="vet-select-estado" data-cita-id="${item.id_cita}">
                <option value="PENDIENTE" ${estadoActual === "PENDIENTE" ? "selected" : ""}>PENDIENTE</option>
                <option value="CONFIRMADA" ${estadoActual === "CONFIRMADA" ? "selected" : ""}>CONFIRMADA</option>
                <option value="ATENDIDA" ${estadoActual === "ATENDIDA" ? "selected" : ""}>ATENDIDA</option>
                <option value="CANCELADA" ${estadoActual === "CANCELADA" ? "selected" : ""}>CANCELADA</option>
              </select>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  // Handle consultation status updates
  document.addEventListener("change", async (evento) => {
    if (evento.target.classList.contains("vet-select-estado")) {
      const select = evento.target;
      const idCita = select.dataset.citaId;
      const nuevoEstado = select.value;
      const estadoAnterior = select.getAttribute("data-previo") || nuevoEstado;

      try {
        select.disabled = true;
        await apiFetch(`/api/veterinario/citas/${idCita}/estado`, {
          method: "PUT",
          body: JSON.stringify({ estado: nuevoEstado }),
        });

        select.setAttribute("data-previo", nuevoEstado);
        mostrarToast("Consulta actualizada", `La consulta #${idCita} ahora está ${nuevoEstado}.`);
        await cargarConsultas();
        await cargarResumen();
      } catch (error) {
        select.value = estadoAnterior;
        mostrarToast("Error", error.message || "No se pudo actualizar el estado.", true);
      } finally {
        select.disabled = false;
      }
    }
  });

  // Filter consultations modal table
  const inputFiltroConsultas = document.getElementById("input-filtro-consultas");
  const selectFiltroEstado = document.getElementById("select-filtro-estado-consulta");

  function filtrarConsultasModal() {
    const texto = String(inputFiltroConsultas?.value || "").toLowerCase().trim();
    const estadoFiltro = String(selectFiltroEstado?.value || "").toUpperCase().trim();

    const filtradas = consultasCache.filter((item) => {
      const coincideTexto =
        !texto ||
        String(item.mascota || "").toLowerCase().includes(texto) ||
        String(item.cliente || "").toLowerCase().includes(texto) ||
        String(item.motivo || "").toLowerCase().includes(texto) ||
        String(item.servicios || "").toLowerCase().includes(texto);

      const coincideEstado =
        !estadoFiltro || String(item.estado || "").toUpperCase() === estadoFiltro;

      return coincideTexto && coincideEstado;
    });

    renderTablaTodasConsultas(filtradas);
  }

  if (inputFiltroConsultas) inputFiltroConsultas.addEventListener("input", filtrarConsultasModal);
  if (selectFiltroEstado) selectFiltroEstado.addEventListener("change", filtrarConsultasModal);

  // Load catalogs (patients, products, services, histories)
  async function cargarCatalogos() {
    try {
      const [resPacientes, resProductos, resServicios, resHistorias] = await Promise.all([
        apiFetch("/api/veterinario/pacientes"),
        apiFetch("/api/veterinario/productos"),
        apiFetch("/api/veterinario/servicios"),
        apiFetch("/api/veterinario/historias"),
      ]);

      pacientesCache = resPacientes.pacientes || [];
      productosCache = resProductos.productos || [];
      serviciosCache = resServicios.servicios || [];
      historiasCache = resHistorias.historias || [];

      poblarSelectsFormularios();
    } catch (error) {
      console.error("Error al cargar catálogos clínicos:", error);
    }
  }

  // Populate dropdown options across all clinical modals
  function poblarSelectsFormularios() {
    // 1. Patient selects
    const opcionesPacientes = pacientesCache.length
      ? '<option value="">Selecciona un paciente...</option>' +
        pacientesCache
          .map(
            (p) =>
              `<option value="${p.id}">${escapar(p.nombre)} (${escapar(p.especie)} - Propietario: ${escapar(p.propietario)})</option>`,
          )
          .join("")
      : '<option value="">No hay pacientes registrados</option>';

    const selectHistoriaPaciente = document.getElementById("select-historia-paciente");
    const selectConsultaPaciente = document.getElementById("select-consulta-paciente");
    if (selectHistoriaPaciente) selectHistoriaPaciente.innerHTML = opcionesPacientes;
    if (selectConsultaPaciente) selectConsultaPaciente.innerHTML = opcionesPacientes;

    // 2. Medication / product select
    const selectTratamientoProducto = document.getElementById("select-tratamiento-producto");
    if (selectTratamientoProducto) {
      selectTratamientoProducto.innerHTML =
        '<option value="">Sin prescripción directa / Otro</option>' +
        productosCache
          .map(
            (prod) =>
              `<option value="${prod.id}">${escapar(prod.nombre)} (${escapar(prod.categoria)} - Stock: ${prod.stock})</option>`,
          )
          .join("");
    }

    // 3. Service select
    const selectConsultaServicio = document.getElementById("select-consulta-servicio");
    if (selectConsultaServicio) {
      selectConsultaServicio.innerHTML =
        '<option value="">Selecciona un servicio...</option>' +
        serviciosCache
          .map(
            (srv) =>
              `<option value="${srv.id}">${escapar(srv.nombre)} - $${Number(srv.precio).toLocaleString("es-CO")}</option>`,
          )
          .join("");
    }

    // 4. Clinical histories select for editing
    poblarSelectHistoriasParaEditar();
  }

  function poblarSelectHistoriasParaEditar() {
    const selectEditarHistoria = document.getElementById("select-editar-historia-id");
    if (!selectEditarHistoria) return;

    selectEditarHistoria.innerHTML = historiasCache.length
      ? '<option value="">Selecciona una historia...</option>' +
        historiasCache
          .map(
            (h) =>
              `<option value="${h.id}">#${h.id} - ${escapar(h.mascota)} (${escapar(h.propietario)}) - ${formatearFecha(h.fecha, false)}</option>`,
          )
          .join("")
      : '<option value="">No hay historias registradas</option>';
  }

  // Search Patient Modal: Live Search & Clinical Records View
  const inputBuscarPaciente = document.getElementById("input-buscar-paciente");
  const listaResultadosPacientes = document.getElementById("lista-resultados-pacientes");
  const detalleFichaPaciente = document.getElementById("detalle-ficha-paciente");

  function renderResultadosBusquedaPacientes(pacientes) {
    if (!listaResultadosPacientes) return;

    if (!pacientes.length) {
      listaResultadosPacientes.innerHTML = `
        <div class="vet-empty-state">
          <span class="material-symbols-outlined">search_off</span>
          <p>No se encontraron pacientes con ese criterio.</p>
        </div>
      `;
      return;
    }

    listaResultadosPacientes.innerHTML = pacientes
      .map(
        (p) => `
          <div class="vet-paciente-card-item" data-id-paciente="${p.id}">
            <div class="vet-paciente-card-icono">
              <span class="material-symbols-outlined">pets</span>
            </div>
            <div class="vet-paciente-card-info">
              <strong>${escapar(p.nombre)}</strong>
              <span>${escapar(p.especie)} &bull; ${escapar(p.raza || "Mestizo")}</span>
              <small>Propietario: ${escapar(p.propietario)} &bull; Doc: ${escapar(p.num_doc || "—")}</small>
            </div>
            <button type="button" class="vet-btn-detalle">Ver Ficha</button>
          </div>
        `,
      )
      .join("");
  }

  if (inputBuscarPaciente) {
    inputBuscarPaciente.addEventListener("input", () => {
      const q = inputBuscarPaciente.value.toLowerCase().trim();
      if (!q) {
        renderResultadosBusquedaPacientes(pacientesCache);
        return;
      }

      const filtrados = pacientesCache.filter(
        (p) =>
          String(p.nombre || "").toLowerCase().includes(q) ||
          String(p.raza || "").toLowerCase().includes(q) ||
          String(p.especie || "").toLowerCase().includes(q) ||
          String(p.propietario || "").toLowerCase().includes(q) ||
          String(p.num_doc || "").includes(q),
      );
      renderResultadosBusquedaPacientes(filtrados);
    });
  }

  // Load detailed patient medical record
  document.addEventListener("click", async (evento) => {
    const card = evento.target.closest(".vet-paciente-card-item");
    if (!card) return;

    const idPaciente = card.dataset.idPaciente;
    if (!idPaciente || !detalleFichaPaciente) return;

    try {
      detalleFichaPaciente.removeAttribute("hidden");
      detalleFichaPaciente.innerHTML = '<div class="vet-loading-inline">Cargando expediente médico...</div>';

      const datos = await apiFetch(`/api/veterinario/pacientes?id=${idPaciente}`);
      const p = datos.paciente;
      const historias = datos.historias || [];
      const vacunas = datos.vacunas || [];
      const citas = datos.citas || [];

      detalleFichaPaciente.innerHTML = `
        <div class="vet-ficha-encabezado">
          <div>
            <h4>${escapar(p.nombre)}</h4>
            <p>${escapar(p.especie)} &bull; ${escapar(p.raza || "Mestizo")} &bull; Sexo: ${p.sexo === "M" ? "Macho" : "Hembra"}</p>
          </div>
          <button type="button" class="vet-btn-secundario" id="btn-cerrar-ficha">Volver a la lista</button>
        </div>

        <div class="vet-ficha-dueno">
          <strong>Datos del Propietario:</strong> ${escapar(p.propietario)} | Tel: ${escapar(p.telefono || "—")} | Correo: ${escapar(p.correo || "—")} | Dir: ${escapar(p.direccion || "—")}
        </div>

        <div class="vet-ficha-seccion">
          <h5>Historias Clínicas (${historias.length})</h5>
          ${
            historias.length
              ? historias
                  .map(
                    (h) => `
                    <div class="vet-historia-entry">
                      <div class="vet-historia-header">
                        <strong>Fecha: ${formatearFecha(h.fecha)}</strong>
                        <span class="estado ${escapar(String(h.estado || "ACTIVO"))}">${escapar(h.estado || "ACTIVO")}</span>
                      </div>
                      <p><strong>Síntomas:</strong> ${escapar(h.sintomas)}</p>
                      <p><strong>Diagnóstico:</strong> ${escapar(h.diagnostico)}</p>
                      ${h.tratamientos ? `<p><strong>Tratamiento:</strong> ${escapar(h.tratamientos)}</p>` : ""}
                      ${h.prox_visita ? `<p><strong>Próximo control:</strong> ${formatearFecha(h.prox_visita, false)}</p>` : ""}
                    </div>
                  `,
                  )
                  .join("")
              : "<p class='vet-subtexto'>No registra historias clínicas previas.</p>"
          }
        </div>

        <div class="vet-ficha-seccion">
          <h5>Vacunaciones (${vacunas.length})</h5>
          ${
            vacunas.length
              ? `<ul class="vet-vacunas-lista">
                  ${vacunas
                    .map(
                      (v) =>
                        `<li><strong>${escapar(v.nombre_vacuna)}</strong> &bull; Aplicada: ${formatearFecha(v.fecha_aplicacion, false)} ${v.proxima_dosis ? `&bull; Próxima dosis: ${formatearFecha(v.proxima_dosis, false)}` : ""}</li>`,
                    )
                    .join("")}
                </ul>`
              : "<p class='vet-subtexto'>No hay vacunas registradas.</p>"
          }
        </div>

        <div class="vet-ficha-seccion">
          <h5>Historial de Citas (${citas.length})</h5>
          ${
            citas.length
              ? `<ul class="vet-citas-lista">
                  ${citas
                    .map(
                      (c) =>
                        `<li><strong>${formatearFecha(c.fecha)}</strong>: ${escapar(c.motivo)} &mdash; <span class="estado ${escapar(String(c.estado || "PENDIENTE"))}">${escapar(c.estado)}</span></li>`,
                    )
                    .join("")}
                </ul>`
              : "<p class='vet-subtexto'>No hay citas registradas.</p>"
          }
        </div>
      `;

      document.getElementById("btn-cerrar-ficha")?.addEventListener("click", () => {
        detalleFichaPaciente.setAttribute("hidden", "");
      });
    } catch (error) {
      console.error("Error al cargar ficha clínica:", error);
      mostrarToast("Error", "No se pudo cargar la ficha médica.", true);
    }
  });

  // Action Button: Open Search Patient Modal
  const btnBuscarPaciente = document.getElementById("accion-buscar-paciente");
  if (btnBuscarPaciente) {
    btnBuscarPaciente.addEventListener("click", () => {
      abrirModal("modal-buscar-paciente-backdrop");
      if (inputBuscarPaciente) inputBuscarPaciente.value = "";
      if (detalleFichaPaciente) detalleFichaPaciente.setAttribute("hidden", "");
      renderResultadosBusquedaPacientes(pacientesCache);
    });
  }

  // Action Button: Open Create Clinical History Modal
  const btnCrearHistoria = document.getElementById("accion-crear-historia");
  const formCrearHistoria = document.getElementById("form-crear-historia");
  if (btnCrearHistoria) {
    btnCrearHistoria.addEventListener("click", () => {
      if (formCrearHistoria) formCrearHistoria.reset();
      abrirModal("modal-crear-historia-backdrop");
    });
  }

  // Submit Handler: Create Clinical History
  if (formCrearHistoria) {
    formCrearHistoria.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const btnGuardar = document.getElementById("btn-guardar-historia");

      const idMascota = Number(document.getElementById("select-historia-paciente")?.value);
      const sintomas = document.getElementById("textarea-sintomas")?.value.trim();
      const diagnostico = document.getElementById("textarea-diagnostico")?.value.trim();
      const proxVisita = document.getElementById("input-prox-visita")?.value || null;
      const idProducto = document.getElementById("select-tratamiento-producto")?.value || null;
      const dosis = document.getElementById("input-tratamiento-dosis")?.value.trim() || null;
      const duracion = document.getElementById("input-tratamiento-duracion")?.value.trim() || null;

      if (!idMascota || !sintomas || !diagnostico) {
        mostrarToast("Campos incompletos", "Por favor completa paciente, síntomas y diagnóstico.", true);
        return;
      }

      try {
        if (btnGuardar) btnGuardar.disabled = true;

        await apiFetch("/api/veterinario/historias", {
          method: "POST",
          body: JSON.stringify({
            idMascota,
            sintomas,
            diagnostico,
            proxVisita,
            idProducto,
            dosis,
            duracion,
          }),
        });

        mostrarToast("Historia clínica guardada", "La historia y el tratamiento fueron registrados.");
        cerrarModal("modal-crear-historia-backdrop");
        formCrearHistoria.reset();

        await cargarCatalogos();
        await cargarResumen();
      } catch (error) {
        mostrarToast("Error", error.message || "No se pudo guardar la historia clínica.", true);
      } finally {
        if (btnGuardar) btnGuardar.disabled = false;
      }
    });
  }

  // Action Button: Open Edit Clinical History Modal
  const btnEditarHistoria = document.getElementById("accion-editar-historia");
  const formEditarHistoria = document.getElementById("form-editar-historia");
  const selectEditarHistoriaId = document.getElementById("select-editar-historia-id");

  if (btnEditarHistoria) {
    btnEditarHistoria.addEventListener("click", () => {
      if (formEditarHistoria) formEditarHistoria.reset();
      poblarSelectHistoriasParaEditar();
      abrirModal("modal-editar-historia-backdrop");
    });
  }

  // Pre-fill history form when selected
  if (selectEditarHistoriaId) {
    selectEditarHistoriaId.addEventListener("change", () => {
      const id = Number(selectEditarHistoriaId.value);
      const historia = historiasCache.find((h) => Number(h.id) === id);

      const textareaSintomas = document.getElementById("textarea-editar-sintomas");
      const textareaDiagnostico = document.getElementById("textarea-editar-diagnostico");
      const inputProxVisita = document.getElementById("input-editar-prox-visita");
      const selectEstado = document.getElementById("select-editar-estado");

      if (historia) {
        if (textareaSintomas) textareaSintomas.value = historia.sintomas || "";
        if (textareaDiagnostico) textareaDiagnostico.value = historia.diagnostico || "";
        if (inputProxVisita) {
          inputProxVisita.value = historia.prox_visita ? String(historia.prox_visita).slice(0, 10) : "";
        }
        if (selectEstado) selectEstado.value = historia.estado || "ACTIVO";
      } else {
        if (textareaSintomas) textareaSintomas.value = "";
        if (textareaDiagnostico) textareaDiagnostico.value = "";
        if (inputProxVisita) inputProxVisita.value = "";
      }
    });
  }

  // Submit Handler: Update Clinical History
  if (formEditarHistoria) {
    formEditarHistoria.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const btnActualizar = document.getElementById("btn-actualizar-historia");

      const id = Number(selectEditarHistoriaId?.value);
      const sintomas = document.getElementById("textarea-editar-sintomas")?.value.trim();
      const diagnostico = document.getElementById("textarea-editar-diagnostico")?.value.trim();
      const proxVisita = document.getElementById("input-editar-prox-visita")?.value || null;
      const estado = document.getElementById("select-editar-estado")?.value || "ACTIVO";

      if (!id || !sintomas || !diagnostico) {
        mostrarToast("Campos requeridos", "Selecciona una historia y completa los campos.", true);
        return;
      }

      try {
        if (btnActualizar) btnActualizar.disabled = true;

        await apiFetch(`/api/veterinario/historias/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            sintomas,
            diagnostico,
            proxVisita,
            estado,
          }),
        });

        mostrarToast("Historia actualizada", `Historia #${id} actualizada exitosamente.`);
        cerrarModal("modal-editar-historia-backdrop");
        formEditarHistoria.reset();

        await cargarCatalogos();
        await cargarResumen();
      } catch (error) {
        mostrarToast("Error", error.message || "No se pudo actualizar la historia clínica.", true);
      } finally {
        if (btnActualizar) btnActualizar.disabled = false;
      }
    });
  }

  // Action Button: Open New Consultation Modal
  const btnNuevaConsulta = document.getElementById("accion-nueva-consulta");
  const formNuevaConsulta = document.getElementById("form-nueva-consulta");
  if (btnNuevaConsulta) {
    btnNuevaConsulta.addEventListener("click", () => {
      if (formNuevaConsulta) {
        formNuevaConsulta.reset();
        const inputFecha = document.getElementById("input-consulta-fecha");
        if (inputFecha) {
          const ahora = new Date();
          ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
          inputFecha.value = ahora.toISOString().slice(0, 16);
        }
      }
      abrirModal("modal-nueva-consulta-backdrop");
    });
  }

  // Submit Handler: Register Consultation
  if (formNuevaConsulta) {
    formNuevaConsulta.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const btnGuardar = document.getElementById("btn-guardar-consulta");

      const idMascota = Number(document.getElementById("select-consulta-paciente")?.value);
      const idServicio = Number(document.getElementById("select-consulta-servicio")?.value);
      const fecha = document.getElementById("input-consulta-fecha")?.value;
      const motivo = document.getElementById("input-consulta-motivo")?.value.trim();
      const estado = document.getElementById("select-consulta-estado")?.value || "CONFIRMADA";

      if (!idMascota || !idServicio || !fecha || !motivo) {
        mostrarToast("Campos requeridos", "Completa todos los campos obligatorios.", true);
        return;
      }

      try {
        if (btnGuardar) btnGuardar.disabled = true;

        await apiFetch("/api/veterinario/citas", {
          method: "POST",
          body: JSON.stringify({
            idMascota,
            idServicio,
            fecha,
            motivo,
            estado,
          }),
        });

        mostrarToast("Consulta registrada", "La consulta fue agendada correctamente.");
        cerrarModal("modal-nueva-consulta-backdrop");
        formNuevaConsulta.reset();

        await cargarConsultas();
        await cargarResumen();
      } catch (error) {
        mostrarToast("Error", error.message || "No se pudo registrar la consulta.", true);
      } finally {
        if (btnGuardar) btnGuardar.disabled = false;
      }
    });
  }

  // Action Button: View All Consultations
  const btnVerTodasConsultas = document.getElementById("btn-ver-todas-consultas");
  if (btnVerTodasConsultas) {
    btnVerTodasConsultas.addEventListener("click", () => {
      if (inputFiltroConsultas) inputFiltroConsultas.value = "";
      if (selectFiltroEstado) selectFiltroEstado.value = "";
      renderTablaTodasConsultas(consultasCache);
      abrirModal("modal-todas-consultas-backdrop");
    });
  }

  // Initial dashboard boot
  async function inicializarDashboard() {
    await Promise.all([
      cargarResumen(),
      cargarConsultas(),
      cargarCatalogos(),
    ]);
  }

  inicializarDashboard();
})();