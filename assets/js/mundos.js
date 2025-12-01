// assets/js/mundos.js

document.addEventListener('DOMContentLoaded', function() {
    // Elementos de navegación
    const botonSalir = document.querySelector('.boton-salir');
    const botonHome = document.querySelector('.boton-home');
    
    // Variable para controlar el intervalo del modal
    let modalInterval = null;
    
    // =============================================
    // CONFIGURACIÓN INICIAL DE MUNDOS
    // =============================================
    
    /**
     * Configura los estados iniciales de todos los mundos
     * SOLO Mundo-1-1 está activo, los demás Mundo-X-1 están DESHABILITADOS
     * Todos los Mundo-X-2 están OCULTOS
     */
    function configurarEstadosIniciales() {
        console.log('🎮 Configurando estados iniciales de mundos...');
        
        // LISTA DE MUNDOS ACTIVOS (SOLO MUNDO-1-1)
        const mundosActivos = ['.Mundo-1-1'];
        
        // LISTA DE MUNDOS DESHABILITADOS (Mundo-X-1 del 2 al 9)
        const mundosDeshabilitados = [
            '.Mundo-2-1', '.Mundo-3-1', '.Mundo-4-1', '.Mundo-5-1',
            '.Mundo-6-1', '.Mundo-7-1', '.Mundo-8-1', '.Mundo-9-1'
        ];
        
        // LISTA DE MUNDOS OCULTOS (todos los Mundo-X-2)
        const mundosOcultos = [
            '.Mundo-2-2', '.Mundo-3-2', '.Mundo-4-2', '.Mundo-5-2',
            '.Mundo-6-2', '.Mundo-7-2', '.Mundo-8-2', '.Mundo-9-2'
        ];
        
        // Configurar MUNDO-1-1 como ACTIVO
        mundosActivos.forEach(selector => {
            const mundo = document.querySelector(selector);
            if (mundo) {
                aplicarEstiloMundoActivo(mundo);
                console.log(`✅ ${selector} configurado como ACTIVO`);
            }
        });
        
        // Configurar MUNDOS 2-9 como DESHABILITADOS
        mundosDeshabilitados.forEach(selector => {
            const mundo = document.querySelector(selector);
            if (mundo) {
                aplicarEstiloMundoDeshabilitado(mundo);
                console.log(`🚫 ${selector} configurado como DESHABILITADO`);
            }
        });
        
        // Configurar todos los MUNDOS-X-2 como OCULTOS
        mundosOcultos.forEach(selector => {
            const mundo = document.querySelector(selector);
            if (mundo) {
                aplicarEstiloMundoOculto(mundo);
                console.log(`👻 ${selector} configurado como OCULTO`);
            }
        });
        
        console.log('🎯 Configuración inicial completada: SOLO Mundo-1-1 activo');
    }
    
    /**
     * Aplica estilos para un mundo ACTIVO (completable y clickeable)
     */
    function aplicarEstiloMundoActivo(mundo) {
        mundo.style.opacity = '1';
        mundo.style.visibility = 'visible';
        mundo.style.pointerEvents = 'auto';
        mundo.style.cursor = 'pointer';
        mundo.style.filter = 'none';
    }
    
    /**
     * Aplica estilos para un mundo DESHABILITADO (visible pero no clickeable)
     */
    function aplicarEstiloMundoDeshabilitado(mundo) {
        mundo.style.opacity = '0.6';
        mundo.style.visibility = 'visible';
        mundo.style.pointerEvents = 'none';
        mundo.style.cursor = 'not-allowed';
        mundo.style.filter = 'grayscale(60%)';
    }
    
    /**
     * Aplica estilos para un mundo OCULTO (no visible y no clickeable)
     */
    function aplicarEstiloMundoOculto(mundo) {
        mundo.style.opacity = '0';
        mundo.style.visibility = 'hidden';
        mundo.style.pointerEvents = 'none';
        mundo.style.cursor = 'default';
    }
    
    // =============================================
    // CONFIGURACIÓN DE EVENTOS DE CLICK
    // =============================================
    
    /**
     * Configura todos los eventos click para los mundos
     */
    function configurarEventosMundos() {
        console.log('🔗 Configurando eventos de mundos...');
        
        // SOLO Mundo-1-1 tiene evento click activo
        const mundo1 = document.querySelector('.Mundo-1-1');
        if (mundo1) {
            mundo1.addEventListener('click', function() {
                console.log('🚀 Redirigiendo a Mundo Juego 1 desde Mundo-1-1');
                window.location.href = 'mundo-juego-1.html';
            });
        }
        
        // Mundos 2-9 deshabilitados - muestran modal
        for (let i = 2; i <= 9; i++) {
            const mundo = document.querySelector(`.Mundo-${i}-1`);
            if (mundo) {
                mundo.addEventListener('click', function() {
                    console.log(`🚫 Intento de acceso a Mundo ${i} (deshabilitado)`);
                    mostrarMensajeMundoNoDisponible();
                });
            }
        }
        
        console.log('✅ Eventos de mundos configurados: Solo Mundo-1-1 activo');
    }
    
    // =============================================
    // SISTEMA DE ACTIVACIÓN DE MUNDOS (PARA FUTURO)
    // =============================================
    
    /**
     * Activa un mundo específico (cambia de deshabilitado a activo)
     * @param {number} numeroMundo - Número del mundo a activar (2-9)
     */
    window.activarMundo = function(numeroMundo) {
        if (numeroMundo < 2 || numeroMundo > 9) {
            console.error('❌ Número de mundo debe estar entre 2 y 9');
            return false;
        }
        
        const selector = `.Mundo-${numeroMundo}-1`;
        const mundo = document.querySelector(selector);
        
        if (!mundo) {
            console.error(`❌ No se encontró el mundo: ${selector}`);
            return false;
        }
        
        // Aplicar estilo de mundo activo
        aplicarEstiloMundoActivo(mundo);
        
        // Re-configurar el evento click para este mundo ahora activo
        mundo.onclick = function() {
            console.log(`🚀 Redirigiendo a Mundo Juego ${numeroMundo}`);
            window.location.href = 'mundo-juego-1.html';
        };
        
        console.log(`🎉 Mundo ${numeroMundo} activado correctamente`);
        return true;
    };
    
    /**
     * Activa múltiples mundos a la vez
     */
    window.activarMundos = function(...numerosMundos) {
        numerosMundos.forEach(numero => {
            window.activarMundo(numero);
        });
        console.log(`🔓 Mundos activados: ${numerosMundos.join(', ')}`);
    };
    
    /**
     * Activa todos los mundos (función de desarrollo/testing)
     */
    window.activarTodosMundos = function() {
        for (let i = 2; i <= 9; i++) {
            window.activarMundo(i);
        }
        console.log('🎮 Todos los mundos han sido activados (modo desarrollo)');
    };
    
    // =============================================
    // FUNCIONALIDAD DE BOTONES DE NAVEGACIÓN
    // =============================================
    
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
    
    // =============================================
    // VERIFICACIÓN DE PROGRESO GUARDADO
    // =============================================
    
    /**
     * Verifica el progreso guardado en localStorage y activa mundos completados
     */
    function verificarProgresoGuardado() {
        console.log('📊 Verificando progreso guardado...');
        
        // Verificar mundo 1 completado
        if (localStorage.getItem('mundo1Completado') === 'true') {
            activarMundo(2);
            console.log('✅ Mundo 1 completado - Activando Mundo 2');
        }
        
        // Verificar otros mundos completados (para futura expansión)
        for (let i = 2; i <= 8; i++) {
            if (localStorage.getItem(`mundo${i}Completado`) === 'true') {
                activarMundo(i + 1);
                console.log(`✅ Mundo ${i} completado - Activando Mundo ${i + 1}`);
            }
        }
        
        console.log('📈 Verificación de progreso completada');
    }
    
    // =============================================
    // INICIALIZACIÓN
    // =============================================
    
    /**
     * Inicializa toda la funcionalidad de la página de mundos
     */
    function inicializar() {
        console.log('🚀 Inicializando página de mundos...');
        
        // 1. Configurar estados iniciales
        configurarEstadosIniciales();
        
        // 2. Verificar progreso guardado
        verificarProgresoGuardado();
        
        // 3. Configurar eventos
        configurarEventosMundos();
        
        console.log('✅ Página de mundos inicializada correctamente');
        console.log('🎯 Estado actual: SOLO Mundo-1-1 activo');
        
        // Mostrar funciones disponibles en consola
        console.log('🔧 Funciones disponibles:');
        console.log('- activarMundo(2) // Activa Mundo-2-1');
        console.log('- activarMundos(2, 3, 4) // Activa múltiples mundos');
        console.log('- activarTodosMundos() // Activa todos los mundos (desarrollo)');
    }
    
    // Inicializar la página
    inicializar();
});

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('💥 Error global en mundos.js:', e.error);
});