document.addEventListener('DOMContentLoaded', () => {
  const formRecuperar = document.getElementById('form-recuperar');

  if (formRecuperar) {
    formRecuperar.addEventListener('submit', (evento) => {
      evento.preventDefault();

      const inputCorreo = document.getElementById('correoRecuperar');
      const correo = inputCorreo ? inputCorreo.value.trim() : '';

      // Validación de campo requerido
      if (!correo) {
        mostrarToastRecuperar('Campo requerido', 'Por favor ingresa tu correo electrónico.', true);
        return;
      }

      // Validación de formato de correo
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(correo)) {
        mostrarToastRecuperar('Correo inválido', 'Por favor ingresa un correo electrónico válido.', true);
        return;
      }

      // Mensaje de confirmación
      mostrarToastRecuperar(
        'Instrucciones enviadas',
        `Hemos enviado un enlace de recuperación a ${correo}. Por favor revisa tu bandeja de entrada.`,
        false
      );

      // Limpiar formulario
      formRecuperar.reset();
    });
  }
});

/**
 * Muestra una notificación emergente temporal en la interfaz de recuperación
 * @param {string} titulo - Título de la alerta
 * @param {string} mensaje - Descripción del mensaje
 * @param {boolean} esError - Define si el mensaje es de error
 */
function mostrarToastRecuperar(titulo, mensaje, esError = false) {
  const toastExistente = document.querySelector('.recuperar-alerta-toast');
  if (toastExistente) {
    toastExistente.remove();
  }

  const toast = document.createElement('div');
  toast.className = `recuperar-alerta-toast ${esError ? 'error' : ''}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined recuperar-alerta-icono">
      ${esError ? 'error' : 'check_circle'}
    </span>
    <div>
      <div class="recuperar-alerta-titulo">${titulo}</div>
      <div class="recuperar-alerta-mensaje">${mensaje}</div>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'deslizarToast 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
