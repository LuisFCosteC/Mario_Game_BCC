// assets/js/cargando.js - FUNCIONALIDAD ESPECÍFICA DE CARGA

document.addEventListener('DOMContentLoaded', function() {
    // Elementos de la barra de progreso
    const barraProgreso = document.querySelector('.progreso');
    const porcentaje = document.querySelector('.porcentaje');
    const botonSalir = document.querySelector('.boton-salir');
    const botonHome = document.querySelector('.boton-home');
    let progreso = 0;

    // Función para actualizar el progreso
    function actualizarProgreso(nuevoValor) {
        progreso = nuevoValor;
        if (barraProgreso) barraProgreso.style.width = progreso + '%';
        if (porcentaje) porcentaje.textContent = Math.round(progreso) + '%';
        
        // Redirigir cuando se complete la carga
        if (progreso >= 100) {
            setTimeout(() => {
                window.location.href = 'mundos.html';
            }, 500);
        }
    }
    
    // Simular progreso de carga MÁS RÁPIDO
    if (barraProgreso && porcentaje) {
        const intervalo = setInterval(() => {
            if (progreso < 100) {
                // Incremento más rápido para coincidir con nubes aceleradas
                progreso += Math.random() * 15 + 5; // 5-20% por intervalo
                if (progreso > 100) progreso = 100;
                actualizarProgreso(progreso);
            } else {
                clearInterval(intervalo);
            }
        }, 300); // Intervalo más corto (300ms vs 500ms original)
    }
    
    // Funcionalidad de botones
    if (botonSalir) {
        botonSalir.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    if (botonHome) {
        botonHome.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    // ACELERAR NUBES EN PÁGINA DE CARGA (backup por si script.js falla)
    setTimeout(() => {
        if (window.cloudAnimator && window.cloudAnimator.configNubes) {
            window.cloudAnimator.configNubes.forEach(config => {
                // Multiplicar velocidad por 3 en página de carga
                config.velocidad *= 2.5;
            });
            console.log('Nubes aceleradas para página de carga (backup)');
        }
    }, 100);
});