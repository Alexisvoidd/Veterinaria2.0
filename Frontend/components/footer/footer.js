(function(){

    // Coloca automáticamente el año actual en el pie de página.

    const year = document.getElementById('vs-footer-year'); // Busca el elemento del año

    if (year) { // Verifica que exista

        year.textContent = new Date().getFullYear(); // Coloca el año actual

    }

})();