// assets/js/inicio.js - FUNCIONALIDAD ESPECÍFICA DE INICIO

document.addEventListener('DOMContentLoaded', function() {
    
    // =============================================
    // SELECCIÓN DE ELEMENTOS DEL DOM
    // =============================================
    
    const personaje = document.querySelector('.personaje-1');
    const botonInstrucciones = document.querySelector('.boton-instrucciones');
    const botonJugar = document.querySelector('.boton-jugar');
    const botonSalir = document.querySelector('.boton-salir');

    // =============================================
    // FUNCIONES DE NAVEGACIÓN
    // =============================================
    
    function redirigirACargando() {
        window.location.href = 'cargando.html';
    }

    function redirigirAInicio() {
        window.location.href = 'index.html';
    }

    // Asignar eventos a los botones
    if (botonJugar) {
        botonJugar.addEventListener('click', redirigirACargando);
    }

    if (botonSalir) {
        botonSalir.addEventListener('click', redirigirAInicio);
    }

    // =============================================
    // FUNCIÓN PARA CARGAR MODAL DE INSTRUCCIONES
    // =============================================
    
    function cargarInstrucciones() {
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'modal-instructions';
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        
        const botonesContainer = document.createElement('div');
        botonesContainer.className = 'botones-modal-container';
        
        // Botones del modal
        const botonJugarModal = document.createElement('button');
        botonJugarModal.className = 'boton-instrucciones-modal boton-jugar-modal';
        
        const botonSalirModal = document.createElement('button');
        botonSalirModal.className = 'boton-instrucciones-modal boton-salir-modal';
        
        botonesContainer.appendChild(botonJugarModal);
        botonesContainer.appendChild(botonSalirModal);
        content.appendChild(botonesContainer);
        modal.appendChild(content);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Funcionalidad de botones del modal
        agregarFuncionalidadBotonesModal(botonJugarModal, botonSalirModal, overlay);
        
        // Cerrar modal al hacer click fuera
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    function agregarFuncionalidadBotonesModal(botonJugarModal, botonSalirModal, overlay) {
        // Asignar funcionalidad a los botones del modal
        if (botonJugarModal) {
            botonJugarModal.addEventListener('click', function() {
                window.location.href = 'cargando.html';
            });
        }

        if (botonSalirModal) {
            botonSalirModal.addEventListener('click', function() {
                document.body.removeChild(overlay);
            });
        }
    }

    // Asignar evento al botón de instrucciones
    if (botonInstrucciones) {
        botonInstrucciones.addEventListener('click', cargarInstrucciones);
    }

    // =============================================
    // ANIMACIÓN DEL PERSONAJE
    // =============================================

    if (personaje) {
        let posXPersonaje = 10;
        let direccionPersonaje = 0.1; // Velocidad en porcentaje
        
        function moverPersonaje() {
            // Animación de movimiento horizontal suave
            posXPersonaje += 0.2 * direccionPersonaje;
            
            // Cambiar dirección en los límites (8% a 12%)
            if (posXPersonaje > 14 || posXPersonaje < 6) {
                direccionPersonaje *= -1;
            }
            
            personaje.style.left = posXPersonaje + '%';
            requestAnimationFrame(moverPersonaje);
        }

        moverPersonaje();
    }
});