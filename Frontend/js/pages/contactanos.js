/* INICIALIZACIÓN DE LOS ELEMENTOS DEL FORMULARIO */

/* OBTIENE EL FORMULARIO DE CONTACTO */
const form = document.getElementById('contact-form');

/* OBTIENE EL ELEMENTO DONDE SE MOSTRARÁN LOS MENSAJES */
const message = document.getElementById('contact-message');

/* OBTIENE EL CAMPO DE TEXTO DEL MENSAJE */
const textarea = document.getElementById('message');

/* OBTIENE EL CONTADOR DE CARACTERES DEL MENSAJE */
const counter = document.getElementById('message-counter');


/* FUNCIONES DE VALIDACIÓN DE CAMPOS */


/* MARCA VISUALMENTE LOS CAMPOS QUE NECESITAN CORRECCIÓN */
function showError(id, bad) {

  /* BUSCA EL CONTENEDOR DEL CAMPO MEDIANTE EL SELECTOR RECIBIDO */
  const field = document.querySelector(id);

  /* SI EL CAMPO NO EXISTE, DETIENE LA FUNCIÓN */
  if (!field) return;

  /* AGREGA O QUITA LA CLASE DE ERROR SEGÚN EL RESULTADO */
  field.classList.toggle('has-error', bad);

  /* BUSCA EL CONTROL HTML DENTRO DEL CAMPO */
  const control = field.querySelector('input, select, textarea');

  /* COMPRUEBA SI EL CONTROL EXISTE */
  if (control) {

    /* AGREGA O QUITA LA CLASE QUE INDICA QUE EL CONTROL ES INVÁLIDO */
    control.classList.toggle('invalid', bad);
  }
}


/* COMPRUEBA LOS DATOS DEL FORMULARIO ANTES DE SIMULAR EL ENVÍO */
function validate() {

  /* VARIABLE QUE INDICA SI TODOS LOS CAMPOS SON VÁLIDOS */
  let ok = true;


  /*  EXTRACCIÓN DE VALORES */


  /* OBTIENE EL NOMBRE Y ELIMINA LOS ESPACIOS AL PRINCIPIO Y AL FINAL */
  const name = document.getElementById('name').value.trim();

  /* OBTIENE EL CORREO Y ELIMINA LOS ESPACIOS AL PRINCIPIO Y AL FINAL */
  const email = document.getElementById('email').value.trim();

  /* OBTIENE EL TELÉFONO Y ELIMINA LOS ESPACIOS AL PRINCIPIO Y AL FINAL */
  const phone = document.getElementById('phone').value.trim();

  /* OBTIENE EL VALOR SELECCIONADO EN EL CAMPO DE ASUNTO */
  const subject = document.getElementById('subject').value;


  /*  VALIDACIONES INDIVIDUALES */


  /* MARCA EL CAMPO DEL NOMBRE SI TIENE MENOS DE 3 CARACTERES */
  showError('#field-name', name.length < 3);

  /* SI EL NOMBRE TIENE MENOS DE 3 CARACTERES, EL FORMULARIO ES INVÁLIDO */
  if (name.length < 3) ok = false;


  /* COMPRUEBA QUE EL CORREO TENGA UN FORMATO VÁLIDO */
  showError('#field-email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

  /* SI EL CORREO NO ES VÁLIDO, MARCA EL FORMULARIO COMO INVÁLIDO */
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ok = false;


  /* COMPRUEBA QUE EL TELÉFONO SOLO CONTENGA CARACTERES PERMITIDOS */
  showError('#field-phone', !/^[+0-9\s()-]{7,20}$/.test(phone));

  /* SI EL TELÉFONO NO ES VÁLIDO, MARCA EL FORMULARIO COMO INVÁLIDO */
  if (!/^[+0-9\s()-]{7,20}$/.test(phone)) ok = false;


  /* MARCA EL CAMPO DE ASUNTO SI NO SE HA SELECCIONADO NINGUNO */
  showError('#field-subject', !subject);

  /* SI NO HAY ASUNTO SELECCIONADO, EL FORMULARIO ES INVÁLIDO */
  if (!subject) ok = false;


  /* COMPRUEBA QUE EL MENSAJE TENGA AL MENOS 10 CARACTERES */
  showError('#field-message', textarea.value.trim().length < 10);

  /* SI EL MENSAJE TIENE MENOS DE 10 CARACTERES, EL FORMULARIO ES INVÁLIDO */
  if (textarea.value.trim().length < 10) ok = false;


  /* DEVUELVE TRUE SI TODO ES VÁLIDO O FALSE SI HAY ALGÚN ERROR */
  return ok;
}


/* INICIALIZACIÓN DE LA VISTA Y EVENTOS */


/* MUESTRA CUÁNTOS CARACTERES LLEVA ESCRITOS EL USUARIO */
textarea.addEventListener('input', () => {

  /* ACTUALIZA EL CONTADOR CADA VEZ QUE EL USUARIO ESCRIBE */
  counter.textContent = `${textarea.value.length}/500`;
});


/* SIMULA EL ENVÍO DEL FORMULARIO HASTA CONECTARLO CON EL BACKEND */
form.addEventListener('submit', e => {

  /* EVITA QUE EL FORMULARIO RECARGUE LA PÁGINA */
  e.preventDefault();


  /* REINICIA LAS CLASES DEL MENSAJE */
  message.className = 'form-message';


  /* COMPRUEBA SI LOS DATOS DEL FORMULARIO SON VÁLIDOS */
  if (!validate()) {

    /* MUESTRA EL MENSAJE Y LE APLICA EL ESTILO DE ERROR */
    message.classList.add('show', 'error');

    /* INFORMA AL USUARIO QUE DEBE REVISAR LOS CAMPOS */
    message.textContent = 'Revisa los campos marcados e intenta nuevamente.';

    /* DETIENE EL ENVÍO PORQUE EXISTEN ERRORES */
    return;
  }


  /*  ENVÍO EXITOSO SIMULADO */


  /* MUESTRA EL MENSAJE Y LE APLICA EL ESTILO DE ÉXITO */
  message.classList.add('show', 'success');

  /* INFORMA QUE EL MENSAJE FUE ENVIADO, AUNQUE TODAVÍA NO SE GUARDA EN EL SERVIDOR */
  message.textContent =
    '¡Mensaje enviado! Esta versión es una demostración y todavía no guarda datos en el servidor.';


  /* LIMPIA TODOS LOS CAMPOS DEL FORMULARIO */
  form.reset();

  /* REINICIA EL CONTADOR DE CARACTERES */
  counter.textContent = '0/500';

  /* BUSCA TODOS LOS CAMPOS DEL FORMULARIO */
  document.querySelectorAll('.field').forEach(f =>

    /* ELIMINA LA CLASE DE ERROR DE CADA CAMPO */
    f.classList.remove('has-error')
  );
});


/*  CARGA INICIAL DEL DISEÑO */


/* CARGA LOS COMPONENTES GENERALES DEL SITIO, COMO NAVBAR Y FOOTER */
cargarLayout();