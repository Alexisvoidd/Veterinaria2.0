document.addEventListener('DOMContentLoaded', () => {
  
  const pistaCarrusel = document.getElementById('carrusel-servicios-pista');
  const btnCarruselIzq = document.getElementById('carrusel-btn-izq');
  const btnCarruselDer = document.getElementById('carrusel-btn-der');

  if (pistaCarrusel && btnCarruselIzq && btnCarruselDer) {
    btnCarruselIzq.addEventListener('click', () => {
      pistaCarrusel.scrollBy({ left: -320, behavior: 'smooth' });
    });

    btnCarruselDer.addEventListener('click', () => {
      pistaCarrusel.scrollBy({ left: 320, behavior: 'smooth' });
    });
  }

  const faqItems = document.querySelectorAll('.inicio-faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.inicio-faq-boton');
    if (btn) {
      btn.addEventListener('click', () => {
        const estaAbierto = item.classList.contains('abierto');

        // Cerrar todos los demás
        faqItems.forEach((otro) => {
          otro.classList.remove('abierto');
          const otroBtn = otro.querySelector('.inicio-faq-boton');
          if (otroBtn) otroBtn.setAttribute('aria-expanded', 'false');
        });

        // Alternar el actual
        if (!estaAbierto) {
          item.classList.add('abierto');
          btn.setAttribute('aria-expanded', 'true');
        } else {
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });
});
