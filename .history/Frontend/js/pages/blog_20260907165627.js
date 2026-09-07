/* ESPERA A QUE TODO EL HTML HAYA CARGADO */
document.addEventListener("DOMContentLoaded", () => {
  // CONTENIDO DE LOS ARTÍCULOS

    // CONTENIDO DE LOS ARTÍCULOS
  // OBJETO QUE ALMACENA TODOS LOS ARTÍCULOS DEL BLOG 
  const articulos = {
    // ARTÍCULO 1

    // DATOS DEL ARTÍCULO SOBRE VACUNAS
    vacunas: {
      // Define la categoría del artículo
      categoria: "Salud",

      // Define el título del artículo
      titulo: "¿Importancia de las vacunas en tu mascota?",

      // Define la imagen principal del artículo
      imagen: "../assets/images/productos/salud.avif",

      // CONTENIDO COMPLETO DEL ARTÍCULO
      contenido: `
                <p>
                    Las vacunas son una de las herramientas más importantes
                    para proteger a tu mascota frente a diferentes enfermedades.
                    Su función principal es ayudar al organismo a desarrollar
                    defensas frente a determinados virus y bacterias.
                </p>

                <h3>¿Por qué son importantes?</h3>

                <p>
                    Mantener el esquema de vacunación actualizado ayuda a
                    prevenir enfermedades que pueden ser graves e incluso
                    representar un riesgo para la vida de perros y gatos.
                </p>

                <p>
                    Además de proteger individualmente a tu mascota, la
                    vacunación también contribuye a reducir la circulación
                    de determinadas enfermedades entre los animales.
                </p>

                <h3>La vacunación depende de cada mascota</h3>

                <p>
                    Las vacunas necesarias pueden variar dependiendo de la
                    edad, especie, estado de salud, estilo de vida y antecedentes
                    de cada mascota.
                </p>

                <p>
                    Los cachorros y gatitos requieren especial atención durante
                    sus primeras etapas de vida, ya que necesitan completar
                    adecuadamente su esquema de vacunación.
                </p>

                <p>
                    Consulta siempre con nuestros profesionales para conocer
                    las vacunas que necesita tu mascota y mantener su
                    protección al día.
                </p>
            `,
    },

    // ARTÍCULO 2

    // DATOS DEL ARTÍCULO SOBRE ALIMENTACIÓN
    alimentacion: {
      // Define la categoría
      categoria: "Alimentación",

      // Define el título
      titulo: "Alimentación saludable para tu mascota",

      // Define la imagen
      imagen: "../assets/images/productos/alim.jpg",

      // CONTENIDO COMPLETO DEL ARTÍCULO
      contenido: `
                <p>
                    Una alimentación equilibrada es fundamental para que tu
                    mascota tenga energía, mantenga una buena condición corporal
                    y pueda desarrollarse adecuadamente.
                </p>

                <h3>Elegir el alimento adecuado</h3>

                <p>
                    El alimento debe elegirse teniendo en cuenta factores como
                    la edad, tamaño, nivel de actividad física y necesidades
                    particulares de cada mascota.
                </p>

                <p>
                    Un cachorro tiene necesidades nutricionales diferentes a las
                    de un adulto, mientras que una mascota senior puede requerir
                    una alimentación adaptada a esta etapa de su vida.
                </p>

                <h3>Una buena alimentación también previene</h3>

                <p>
                    Mantener una alimentación adecuada puede contribuir al
                    mantenimiento de un peso saludable y favorecer el bienestar
                    general.
                </p>

                <ul>
                    <li>Control adecuado del peso.</li>
                    <li>Mayor energía para sus actividades.</li>
                    <li>Mejor desarrollo durante el crecimiento.</li>
                    <li>Mantenimiento de músculos y tejidos.</li>
                    <li>Mejor calidad de vida.</li>
                </ul>

                <p>
                    Recuerda proporcionar siempre agua fresca y controlar las
                    cantidades de alimento para evitar excesos.
                </p>

                <p>
                    Si tienes dudas sobre qué alimentación es adecuada para tu
                    mascota, nuestros profesionales pueden orientarte.
                </p>
            `,
    },

    // ARTÍCULO 3

    // DATOS DEL ARTÍCULO SOBRE SALUD DENTAL
    dental: {
      // Define la categoría
      categoria: "Cuidado",

      // Define el título
      titulo: "Importancia del cuidado dental en tu mascota",

      // Define la imagen
      imagen: "../assets/images/productos/dental.jpg",

      // CONTENIDO COMPLETO DEL ARTÍCULO
      contenido: `
                <p>
                    La salud dental es una parte fundamental del cuidado
                    general de perros y gatos. Una boca saludable contribuye
                    a que tu mascota pueda alimentarse correctamente y mantener
                    una buena calidad de vida.
                </p>

                <h3>¿Qué ocurre cuando no se cuidan los dientes?</h3>

                <p>
                    La acumulación de placa bacteriana puede convertirse en
                    sarro y provocar mal aliento, molestias e inflamación
                    de las encías.
                </p>

                <p>
                    Cuando estos problemas avanzan pueden afectar los tejidos
                    que sostienen los dientes y generar complicaciones que
                    requieren atención veterinaria.
                </p>

                <h3>Hábitos que ayudan a mantener una boca sana</h3>

                <ul>
                    <li>Realizar revisiones periódicas.</li>
                    <li>Mantener una adecuada higiene oral.</li>
                    <li>Observar cambios en las encías.</li>
                    <li>Prestar atención al mal aliento persistente.</li>
                    <li>Consultar ante molestias al comer.</li>
                </ul>

                <p>
                    Una revisión profesional permite identificar problemas
                    dentales antes de que avancen y establecer las medidas
                    de cuidado más adecuadas.
                </p>
            `,
    },

    // ARTÍCULO 4

    // DATOS DEL ARTÍCULO SOBRE CONSULTAS VETERINARIAS 
    consulta: {
      // Define la categoría 
      categoria: "Prevención",

      // Define el título 
      titulo: "¿Cada cuánto debes llevar a tu mascota al veterinario?",

      // Define la imagen 
      imagen: "../assets/images/productos/veterinaris.jpg",

      // CONTENIDO COMPLETO DEL ARTÍCULO 
      contenido: `
                <p>
                    Las visitas periódicas al veterinario son una parte
                    fundamental del cuidado responsable de cualquier mascota.
                    Aunque tu perro o gato parezca estar completamente sano,
                    una revisión puede ayudar a detectar pequeños cambios
                    que muchas veces pasan desapercibidos en casa.
                </p>

                <h3>¿Por qué son importantes las revisiones?</h3>

                <p>
                    Los controles preventivos permiten evaluar el estado
                    general de salud y detectar posibles problemas antes de
                    que se conviertan en situaciones más complejas.
                </p>

                <p>
                    La prevención también permite mantener actualizados aspectos
                    importantes como vacunación, desparasitación, alimentación,
                    peso y cuidado dental.
                </p>

                <h3>¿Qué se revisa durante una consulta?</h3>

                <ul>
                    <li>Estado general y condición corporal.</li>
                    <li>Peso y desarrollo.</li>
                    <li>Esquema de vacunación.</li>
                    <li>Desparasitación.</li>
                    <li>Salud dental y de las encías.</li>
                    <li>Piel, pelo, ojos y oídos.</li>
                    <li>Alimentación y hábitos diarios.</li>
                </ul>

                <h3>¿Con qué frecuencia debe asistir?</h3>

                <p>
                    La frecuencia depende de la edad, especie, tamaño, estilo
                    de vida y estado general de salud de cada mascota.
                </p>

                <p>
                    Los cachorros y animales mayores pueden necesitar controles
                    más frecuentes, mientras que en adultos sanos pueden
                    establecerse revisiones periódicas según la recomendación
                    del veterinario.
                </p>

                <p>
                    Si notas cambios repentinos en su comportamiento,
                    alimentación, peso, actividad o hábitos, no esperes a la
                    siguiente revisión y consulta con un profesional.
                </p>
            `,
    },

    //  ARTÍCULO 5

    // DATOS DEL ARTÍCULO SOBRE ACTIVIDAD FÍSICA 
    actividad: {
      // Define la categoría 
      categoria: "Actividad física",

      // Define el título 
      titulo: "La importancia de la actividad física",

      // Define la imagen 
      imagen: "../assets/images/productos/theforest.jpg",

      // CONTENIDO COMPLETO DEL ARTÍCULO 
      contenido: `
                <p>
                    La actividad física es esencial para que las mascotas
                    mantengan una buena condición corporal y un equilibrio
                    adecuado entre su bienestar físico y mental.
                </p>

                <h3>Beneficios del ejercicio</h3>

                <p>
                    Realizar actividad física de manera regular ayuda a
                    controlar el peso, fortalecer los músculos, mantener
                    las articulaciones activas y favorecer una mejor salud
                    cardiovascular.
                </p>

                <ul>
                    <li>Ayuda a prevenir el sobrepeso.</li>
                    <li>Fortalece músculos y articulaciones.</li>
                    <li>Reduce el aburrimiento y el estrés.</li>
                    <li>Favorece un comportamiento equilibrado.</li>
                    <li>Estimula la interacción con su familia.</li>
                    <li>Ayuda a mantener una rutina saludable.</li>
                </ul>

                <h3>¿Cuánto ejercicio necesita?</h3>

                <p>
                    No todas las mascotas necesitan la misma cantidad de
                    actividad. La edad, raza, tamaño, condición física y
                    estado de salud deben tenerse en cuenta antes de
                    establecer una rutina.
                </p>

                <p>
                    Puedes combinar caminatas, juegos, actividades de búsqueda
                    y ejercicios de estimulación mental. Lo importante es que
                    la actividad sea segura y adecuada para las capacidades
                    de tu mascota.
                </p>

                <h3>Actividad segura</h3>

                <p>
                    Recuerda aumentar la intensidad progresivamente y
                    proporcionar siempre agua fresca, especialmente durante
                    los días calurosos.
                </p>

                <p>
                    Si tu mascota presenta cansancio excesivo, dificultad para
                    moverse o cualquier cambio durante la actividad, es
                    recomendable consultar con un profesional veterinario.
                </p>
            `,
    },

    // ARTÍCULO 6

    // DATOS DEL ARTÍCULO SOBRE LA CONFIANZA EN VETSALUD 
    confianza: {
      // Define la categoría 
      categoria: "Cuidado",

      // Define el título 
      titulo: "Por qué las familias confían en VetSalud",

      // Define la imagen 
      imagen: "../assets/images/productos/blog-1.png",

      // CONTENIDO COMPLETO DEL ARTÍCULO 
      contenido: `
                <p>
                    En VetSalud combinamos experiencia, tecnología y un trato
                    cercano para brindar una atención veterinaria pensada
                    para el bienestar de cada mascota y su familia.
                </p>

                <h3>Una atención pensada para cada mascota</h3>

                <p>
                    Sabemos que cada mascota es diferente y por eso nuestra
                    atención busca adaptarse a sus necesidades particulares.
                    Cada paciente merece recibir una atención responsable,
                    profesional y cercana.
                </p>

                <p>
                    Nuestro equipo trabaja para acompañar a las familias
                    durante las diferentes etapas de la vida de sus mascotas,
                    desde los primeros cuidados hasta la edad adulta y senior.
                </p>

                <h3>Prevención y cuidado</h3>

                <p>
                    La prevención es uno de los pilares de una buena atención
                    veterinaria. Los controles periódicos permiten conocer
                    mejor el estado de salud de cada mascota y detectar
                    cambios de manera oportuna.
                </p>

                <p>
                    También consideramos importante orientar a los propietarios
                    para que puedan tomar mejores decisiones sobre alimentación,
                    higiene, vacunación, actividad física y prevención.
                </p>

                <h3>Una relación basada en confianza</h3>

                <p>
                    Nuestro compromiso es cuidar no solamente la salud de las
                    mascotas, sino también fortalecer el vínculo de confianza
                    entre ellas, sus familias y nuestro equipo veterinario.
                </p>

                <p>
                    Queremos que cada visita sea una oportunidad para aprender,
                    prevenir y mejorar el bienestar de quienes hacen parte
                    de nuestra familia.
                </p>
            `,
    },

    // ARTÍCULO 7

    // DATOS DEL ARTÍCULO SOBRE RECURSOS PARA PROPIETARIOS 
    recursos: {
      // Define la categoría 
      categoria: "Prevención",

      // Define el título 
      titulo: "Recursos del propietario",

      // Define la imagen 
      imagen: "../assets/images/productos/blog-2.jpg",

      // CONTENIDO COMPLETO DEL ARTÍCULO 
      contenido: `
                <p>
                    Ser responsable de una mascota implica mucho más que
                    ofrecerle alimento y cariño. También significa conocer
                    sus necesidades, reconocer posibles señales de alerta y
                    tomar decisiones que favorezcan su bienestar durante
                    todas las etapas de su vida.
                </p>

                <h3>Información para el cuidado diario</h3>

                <p>
                    Mantener una rutina estable facilita el cuidado de perros
                    y gatos. La alimentación, higiene, actividad física,
                    descanso y controles veterinarios deben formar parte de
                    sus cuidados habituales.
                </p>

                <h3>Aspectos importantes</h3>

                <ul>
                    <li>Mantener al día su esquema de vacunación.</li>
                    <li>Realizar controles veterinarios periódicos.</li>
                    <li>Proporcionar una alimentación adecuada.</li>
                    <li>Mantener agua fresca disponible.</li>
                    <li>Ofrecer espacios seguros y limpios.</li>
                    <li>Proporcionar actividad física.</li>
                    <li>Observar cambios en su comportamiento.</li>
                </ul>

                <h3>Observar a tu mascota también es prevenir</h3>

                <p>
                    Los propietarios conocen mejor que nadie los hábitos
                    habituales de sus mascotas. Por eso, prestar atención
                    a pequeños cambios puede ser una herramienta importante
                    para detectar situaciones que requieren valoración.
                </p>

                <p>
                    Cambios en el apetito, comportamiento, peso, sueño o nivel
                    de actividad pueden ser señales que merecen atención.
                </p>

                <p>
                    Tener información confiable te permite actuar con mayor
                    seguridad, pero recuerda que los consejos generales no
                    sustituyen una valoración profesional cuando existe un
                    problema de salud.
                </p>
            `,
    },

    // ARTÍCULO 8

    // DATOS DEL ARTÍCULO SOBRE SEÑALES DE ALERTA 
    alertas: {
      // Define la categoría 
      categoria: "Salud",

      // Define el título 
      titulo: "Señales de alerta en la salud de tu mascota",

      // Define la imagen 
      imagen: "../assets/images/productos/blog-3.jpg",

      // CONTENIDO COMPLETO DEL ARTÍCULO 
      contenido: `
                <p>
                    Conocer los cambios en el comportamiento y los hábitos
                    de tu mascota puede ayudarte a detectar a tiempo
                    posibles problemas de salud.
                </p>

                <h3>Presta atención a los cambios</h3>

                <p>
                    Algunas señales pueden parecer pequeñas al principio,
                    pero cuando se mantienen o aparecen de manera repentina
                    es importante prestarles atención.
                </p>

                <p>
                    Cambios en el apetito, consumo de agua o niveles habituales
                    de actividad son algunos ejemplos que pueden indicar que
                    algo no está funcionando como debería.
                </p>

                <h3>Otros signos que debes observar</h3>

                <ul>
                    <li>Cambios importantes en el comportamiento.</li>
                    <li>Dificultad para moverse.</li>
                    <li>Vómitos frecuentes.</li>
                    <li>Diarrea persistente.</li>
                    <li>Pérdida de peso sin explicación.</li>
                    <li>Cambios importantes en la piel.</li>
                    <li>Dificultades respiratorias.</li>
                    <li>Falta de apetito persistente.</li>
                </ul>

                <p>
                    También conviene observar cambios en la movilidad, el
                    sueño, la respiración, la interacción con las personas
                    y otros animales.
                </p>

                <h3>La detección temprana es importante</h3>

                <p>
                    Detectar estas señales de manera temprana puede facilitar
                    la evaluación profesional y permitir actuar oportunamente.
                </p>

                <p>
                    Si observas un cambio que te preocupa o que empeora,
                    consulta con un profesional veterinario para obtener una
                    valoración adecuada.
                </p>
            `,
    },

    // ARTÍCULO 9

    // DATOS DEL SEGUNDO ARTÍCULO SOBRE ALIMENTACIÓN 
    alimentacion2: {
      // Define la categoría 
      categoria: "Alimentación",

      // Define el título 
      titulo: "Cómo elegir una buena alimentación",

      // Define la imagen 
      imagen: "../assets/images/productos/blog-4.jpeg",

      // CONTENIDO COMPLETO DEL ARTÍCULO 
      contenido: `
                <p>
                    Elegir correctamente el alimento de tu mascota es una
                    de las decisiones más importantes para mantener una buena
                    calidad de vida. Sus necesidades nutricionales cambian
                    según su edad, tamaño, actividad física y condición
                    particular.
                </p>

                <h3>¿Qué debes tener en cuenta?</h3>

                <p>
                    Antes de elegir un alimento, es importante conocer las
                    necesidades específicas de tu mascota. Un cachorro no
                    requiere exactamente los mismos nutrientes que un adulto,
                    y un animal senior puede necesitar una alimentación
                    diferente.
                </p>

                <ul>
                    <li>Edad y etapa de vida.</li>
                    <li>Tamaño y características físicas.</li>
                    <li>Nivel de actividad diaria.</li>
                    <li>Condición corporal y peso.</li>
                    <li>Necesidades nutricionales especiales.</li>
                </ul>

                <h3>Una alimentación equilibrada</h3>

                <p>
                    Una dieta adecuada debe aportar los nutrientes necesarios
                    para mantener energía, músculos, órganos y defensas en
                    buenas condiciones.
                </p>

                <p>
                    La cantidad también es importante. Ofrecer más alimento
                    del necesario puede favorecer el sobrepeso y generar
                    problemas relacionados con una condición corporal
                    inadecuada.
                </p>

                <h3>¿Se puede cambiar de alimento?</h3>

                <p>
                    Evita realizar cambios bruscos de alimentación. Cuando
                    sea necesario cambiar de producto, normalmente es
                    preferible hacerlo de manera progresiva para facilitar
                    la adaptación.
                </p>

                <p>
                    También es importante controlar los premios y alimentos
                    adicionales para evitar que representen una parte
                    excesiva de la alimentación diaria.
                </p>

                <h3>Consulta profesional</h3>

                <p>
                    Si tu mascota presenta sobrepeso, alergias, problemas
                    digestivos o alguna condición especial, consulta con un
                    veterinario antes de modificar su alimentación.
                </p>

                <p>
                    Una alimentación adecuada, agua fresca, actividad física
                    y controles veterinarios periódicos forman parte de un
                    cuidado integral.
                </p>
            `,
    },
  };

  // REFERENCIAS A ELEMENTOS DEL HTML

  // Obtiene todos los botones de categorías 
  const botonesCategoria = document.querySelectorAll(".categorias button");

<<<<<<< HEAD
    /* 
       REFERENCIAS A ELEMENTOS DEL HTML
     */
=======
  // Obtiene todas las tarjetas de artículos 
  const tarjetas = document.querySelectorAll(".articulos_grid .articulo");
>>>>>>> bde9546791980672b6ef8d3626429b54d04cef9e

  // CREAR MODAL

  // Crea dinámicamente el contenedor principal del modal 
  const modal = document.createElement("div");

  // Asigna la clase principal del modal 
  modal.className = "blog-modal";

    /* 
       CREAR MODAL
     */

    /* Crea dinámicamente el contenedor principal del modal */
    const modal =
        document.createElement("div");

    /* Asigna la clase principal del modal */
    modal.className = "blog-modal";

    /* Inserta la estructura HTML completa del modal */
    modal.innerHTML = `

        <!-- FONDO DEL MODAL -->
        <div class="blog-modal__overlay"></div>

        <!-- CONTENIDO PRINCIPAL DEL MODAL -->
        <div
            class="blog-modal__contenido"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-articulo-titulo"
        >

            <!-- BOTÓN PARA CERRAR -->
            <button
                type="button"
                class="blog-modal__cerrar"
                aria-label="Cerrar artículo"
            >
                &times;
            </button>

            <!-- CONTENEDOR DE LA IMAGEN -->
            <div class="blog-modal__imagen">

                <!-- IMAGEN QUE CAMBIARÁ SEGÚN EL ARTÍCULO -->
                <img
                    id="modal-articulo-imagen"
                    src=""
                    alt=""
                >

            </div>

            <!-- CUERPO DEL ARTÍCULO -->
            <div class="blog-modal__body">

                <!-- CATEGORÍA DEL ARTÍCULO -->
                <span
                    class="blog-modal__categoria"
                    id="modal-articulo-categoria"
                ></span>

                <!-- TÍTULO DEL ARTÍCULO -->
                <h2
                    id="modal-articulo-titulo"
                ></h2>

                <!-- CONTENIDO DEL ARTÍCULO -->
                <div
                    class="blog-modal__texto"
                    id="modal-articulo-texto"
                ></div>

            </div>

        </div>
    `;

  /* Agrega el modal al final del body */
  document.body.appendChild(modal);

<<<<<<< HEAD

    /* 
=======
  /* =========================================================
>>>>>>> bde9546791980672b6ef8d3626429b54d04cef9e
       ELEMENTOS DEL MODAL
     */

  /* Obtiene la imagen del modal */
  const modalImagen = modal.querySelector("#modal-articulo-imagen");

  /* Obtiene el elemento de categoría */
  const modalCategoria = modal.querySelector("#modal-articulo-categoria");

  /* Obtiene el título del modal */
  const modalTitulo = modal.querySelector("#modal-articulo-titulo");

  /* Obtiene el contenedor del texto */
  const modalTexto = modal.querySelector("#modal-articulo-texto");

  /* Obtiene el botón de cerrar */
  const botonCerrar = modal.querySelector(".blog-modal__cerrar");

  /* Obtiene el fondo del modal */
  const overlay = modal.querySelector(".blog-modal__overlay");

<<<<<<< HEAD

    /* 
=======
  /* =========================================================
>>>>>>> bde9546791980672b6ef8d3626429b54d04cef9e
       ABRIR MODAL
     */

  /* Función encargada de abrir un artículo específico */
  function abrirModal(id) {
    /* Busca el artículo utilizando su identificador */
    const articulo = articulos[id];

    /* Comprueba que el artículo exista */
    if (!articulo) {
      /* Muestra un error en la consola si no existe */
      console.error("Artículo no encontrado:", id);

      /* Detiene la función */
      return;
    }

    /* Asigna la imagen del artículo al modal */
    modalImagen.src = articulo.imagen;

<<<<<<< HEAD
    /* 
=======
    /* Utiliza el título como texto alternativo */
    modalImagen.alt = articulo.titulo;

    /* Coloca la categoría del artículo */
    modalCategoria.textContent = articulo.categoria;

    /* Coloca el título del artículo */
    modalTitulo.textContent = articulo.titulo;

    /* Inserta el contenido HTML del artículo */
    modalTexto.innerHTML = articulo.contenido;

    /* Agrega la clase que hace visible el modal */
    modal.classList.add("activo");

    /* Bloquea el comportamiento de desplazamiento del body */
    document.body.classList.add("modal-blog-abierto");

    /* Busca el cuerpo interno del modal */
    const cuerpo = modal.querySelector(".blog-modal__body");

    /* Comprueba que el cuerpo exista */
    if (cuerpo) {
      /* Regresa el desplazamiento interno al inicio */
      cuerpo.scrollTop = 0;
    }
  }

  /* =========================================================
>>>>>>> bde9546791980672b6ef8d3626429b54d04cef9e
       CERRAR MODAL
     */

  /* Función encargada de cerrar el modal */
  function cerrarModal() {
    /* Elimina la clase que muestra el modal */
    modal.classList.remove("activo");

    /* Permite nuevamente el desplazamiento del body */
    document.body.classList.remove("modal-blog-abierto");
  }

<<<<<<< HEAD
        /* Permite nuevamente el desplazamiento del body */
        document.body.classList.remove(
            "modal-blog-abierto"
        );

    }


    /* 
=======
  /* =========================================================
>>>>>>> bde9546791980672b6ef8d3626429b54d04cef9e
       BOTONES "LEER MÁS"
     */

  /* Escucha los clics realizados en todo el documento */
  document.addEventListener("click", (evento) => {
    /* Busca el botón "Leer más" más cercano al clic */
    const boton = evento.target.closest(".leer-mas");

    /* Si el clic no fue sobre un botón válido, no continúa */
    if (!boton) {
      return;
    }

    /* Evita la acción predeterminada del enlace o botón */
    evento.preventDefault();

    /* Obtiene el identificador del artículo */
    const id = boton.getAttribute("data-articulo");

    /* Comprueba que exista el identificador */
    if (!id) {
      /* Muestra un error indicando que falta data-articulo */
      console.error("El botón no tiene data-articulo:", boton);

      /* Detiene la ejecución */
      return;
    }

    /* Abre el artículo correspondiente */
    abrirModal(id);
  });

<<<<<<< HEAD
                /* Detiene la ejecución */
                return;
            }

            /* Abre el artículo correspondiente */
            abrirModal(id);

        }
    );


    /* 
=======
  /* =========================================================
>>>>>>> bde9546791980672b6ef8d3626429b54d04cef9e
       CERRAR MODAL
     */

  /* Cierra el modal al pulsar el botón */
  botonCerrar.addEventListener("click", cerrarModal);

  /* Cierra el modal al pulsar el fondo */
  overlay.addEventListener("click", cerrarModal);

  /* Escucha las teclas presionadas por el usuario */
  document.addEventListener("keydown", (evento) => {
    /* Comprueba si se presionó Escape y el modal está abierto */
    if (evento.key === "Escape" && modal.classList.contains("activo")) {
      /* Cierra el modal */
      cerrarModal();
    }
  });

<<<<<<< HEAD
            /* Comprueba si se presionó Escape y el modal está abierto */
            if (
                evento.key === "Escape" &&
                modal.classList.contains("activo")
            ) {

                /* Cierra el modal */
                cerrarModal();

            }

        }
    );


    /* 
=======
  /* =========================================================
>>>>>>> bde9546791980672b6ef8d3626429b54d04cef9e
       FILTRO DE ARTÍCULOS
     */

  /* Filtra las tarjetas según la categoría seleccionada */
  function filtrarArticulos(categoriaSeleccionada) {
    /* Recorre todas las tarjetas disponibles */
    tarjetas.forEach((tarjeta) => {
      /* Obtiene la categoría de la tarjeta */
      const categoriaTarjeta = tarjeta.getAttribute("data-categoria");

      /* Determina si la tarjeta debe mostrarse */
      const mostrar =
        categoriaSeleccionada === "todos" ||
        categoriaTarjeta === categoriaSeleccionada;

      /* Comprueba si debe mostrarse */
      if (mostrar) {
        /* Elimina la clase que oculta la tarjeta */
        tarjeta.classList.remove("oculto");
      } else {
        /* Agrega la clase que oculta la tarjeta */
        tarjeta.classList.add("oculto");
      }
    });
  }

<<<<<<< HEAD
                /* Determina si la tarjeta debe mostrarse */
                const mostrar =
                    categoriaSeleccionada === "todos" ||
                    categoriaTarjeta ===
                    categoriaSeleccionada;

                /* Comprueba si debe mostrarse */
                if (mostrar) {

                    /* Elimina la clase que oculta la tarjeta */
                    tarjeta.classList.remove(
                        "oculto"
                    );

                } else {

                    /* Agrega la clase que oculta la tarjeta */
                    tarjeta.classList.add(
                        "oculto"
                    );

                }

            }
        );

    }


    /* 
=======
  /* =========================================================
>>>>>>> bde9546791980672b6ef8d3626429b54d04cef9e
       BOTONES DE CATEGORÍA
     */

  /* Recorre todos los botones de categoría */
  botonesCategoria.forEach((boton) => {
    /* Agrega un evento de clic a cada categoría */
    boton.addEventListener("click", (evento) => {
      /* Evita el comportamiento predeterminado */
      evento.preventDefault();

      /* Obtiene la categoría del botón */
      const categoria = boton.getAttribute("data-categoria");

      /* Comprueba que exista una categoría */
      if (!categoria) {
        return;
      }

      /* Recorre todos los botones de categoría */
      botonesCategoria.forEach((btn) => {
        /* Quita el estado activo */
        btn.classList.remove("activo");

        /* Quita la clase de categoría seleccionada */
        btn.classList.remove("categoria_seleccionada");
      });

      /* Marca el botón actual como activo */
      boton.classList.add("activo");

      /* Marca el botón como categoría seleccionada */
      boton.classList.add("categoria_seleccionada");

      /* Filtra los artículos según la categoría */
      filtrarArticulos(categoria);
    });
  });

<<<<<<< HEAD
                        }
                    );

                    /* Marca el botón actual como activo */
                    boton.classList.add(
                        "activo"
                    );

                    /* Marca el botón como categoría seleccionada */
                    boton.classList.add(
                        "categoria_seleccionada"
                    );

                    /* Filtra los artículos según la categoría */
                    filtrarArticulos(
                        categoria
                    );

                }
            );

        }
    );


    /* 
=======
  /* =========================================================
>>>>>>> bde9546791980672b6ef8d3626429b54d04cef9e
       ESTADO INICIAL
     */

  /* Busca el botón correspondiente a "Todos" */
  const botonTodos = document.querySelector(
    '.categorias button[data-categoria="todos"]',
  );

  /* Comprueba que exista el botón */
  if (botonTodos) {
    /* Marca "Todos" como botón activo */
    botonTodos.classList.add("activo");

    /* Marca "Todos" como categoría seleccionada */
    botonTodos.classList.add("categoria_seleccionada");
  }

<<<<<<< HEAD
        /* Marca "Todos" como categoría seleccionada */
        botonTodos.classList.add(
            "categoria_seleccionada"
        );

    }


    /* 
=======
  /* =========================================================
>>>>>>> bde9546791980672b6ef8d3626429b54d04cef9e
       MOSTRAR TODOS AL CARGAR
     */

  /* Muestra todos los artículos inicialmente */
  filtrarArticulos("todos");
});
