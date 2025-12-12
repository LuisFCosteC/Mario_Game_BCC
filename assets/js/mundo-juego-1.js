// assets/js/mundo-juego-1.js

class MundoJuego1 {
    constructor() {
        this.modalAbierto = null;
        this.audioPlayer = null;
        this.inicializado = false;
        this.videoIframe = null;
        this.personaje = null;
        this.configMovimiento = null;
        this.teclas = null;
        this.configHueco = null;
        
        // Sistema de secciones
        this.seccionActual = 1;
        this.totalSecciones = 4;
        this.transicionando = false;
        
        // Sistema de obstáculos
        this.colisionando = false;
        
        // Sistema de estrella
        this.estrellasConfig = null;
        
        // 🔥 NUEVO: Bandera para saber si la modal se abrió por una estrella
        this.modalAbiertaPorEstrella = false;
        
        this.init();
    }

    /**
     * Inicializa el juego
     */
    init() {
        if (this.inicializado) {
            console.warn('⚠️ El juego ya está inicializado');
            return;
        }
        
        try {
            this.configurarBotonesNavegacion();
            this.mostrarModalInicio();
            this.inicializarSistemaSecciones();
            this.inicializarControlesPersonaje();
            this.configurarEventListenersGlobales();
            this.inicializado = true;
            
            // Iniciar audio de fondo si no está ya iniciado
            this.iniciarAudioFondo();
            
            // DEPURACIÓN: Verificar elementos de mensajes
            setTimeout(() => {
                this.depurarElementosMensajes();
            }, 1000);
            
            console.log('✅ Mundo Juego 1 inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar Mundo Juego 1:', error);
            this.mostrarErrorInicializacion();
        }
    }

    /**
     * Inicia el audio de fondo si el AudioManager está disponible
     */
    iniciarAudioFondo() {
        if (window.audioManager && !window.audioManager.estaReproduciendo) {
            // Esperar un momento para asegurar que el DOM esté listo
            setTimeout(() => {
                window.audioManager.iniciarReproduccion().catch(error => {
                    console.warn('⚠️ Audio de fondo no se pudo iniciar automáticamente:', error);
                });
            }, 500);
        } else if (window.audioManager) {
            console.log('🎵 Audio de fondo ya está reproduciéndose');
        }
    }

    /**
     * Inicializa el sistema de secciones
     */
    inicializarSistemaSecciones() {
        console.log('🏗️ Inicializando sistema de secciones...');
        
        // Ocultar todas las secciones excepto la primera
        document.querySelectorAll('.seccion-mundo').forEach((seccion, index) => {
            if (index !== 0) {
                seccion.classList.remove('activa');
            }
        });
        
        console.log(`📍 Sección inicial: ${this.seccionActual}`);
    }

    /**
     * Inicia transición suave entre secciones
     */
    iniciarTransicionSeccion() {
        if (this.transicionando) return;
        
        this.transicionando = true;
        console.log(`🎬 Iniciando transición de sección ${this.seccionActual} a ${this.seccionActual + 1}`);
        
        // 1. Desactivar controles temporalmente
        if (this.configHueco) {
            this.configHueco.activo = false;
        }
        
        // 2. Aplicar animación de transición al personaje
        this.personaje.classList.add('transicionando');
        
        // 3. Esperar a que la animación termine y cambiar sección
        setTimeout(() => {
            this.cambiarASiguienteSeccion();
            
            // 4. Aplicar animación de entrada después del cambio
            setTimeout(() => {
                this.personaje.classList.remove('transicionando');
                this.personaje.classList.add('entrando');
                
                // 5. Remover clase de entrada y reactivar controles
                setTimeout(() => {
                    this.personaje.classList.remove('entrando');
                    this.transicionando = false;
                    
                    // 6. Reactivar controles después de la transición
                    if (this.seccionActual === 1 && this.configHueco) {
                        this.configHueco.activo = true;
                    }
                    
                    console.log(`✅ Transición completada - Ahora en sección ${this.seccionActual}`);
                }, 500); // Duración de animación de entrada
            }, 100); // Pequeño delay antes de la animación de entrada
        }, 800); // Duración de animación de salida
    }

    /**
     * Cambia a la siguiente sección
     */
    cambiarASiguienteSeccion() {
        if (this.seccionActual >= this.totalSecciones) {
            console.log('⚠️ Ya está en la última sección');
            return;
        }
        
        console.log(`🔄 Cambiando de sección ${this.seccionActual} a ${this.seccionActual + 1}`);
        
        // Obtener secciones
        const seccionActual = document.querySelector(`.seccion-${this.seccionActual}`);
        const siguienteSeccion = document.querySelector(`.seccion-${this.seccionActual + 1}`);
        
        if (!seccionActual || !siguienteSeccion) {
            console.error('❌ No se encontraron las secciones');
            this.transicionando = false;
            return;
        }
        
        // 1. Desactivar sección actual
        seccionActual.classList.remove('activa');
        
        // 2. Activar siguiente sección
        siguienteSeccion.classList.add('activa');
        
        // 3. Actualizar sección actual
        this.seccionActual++;
        
        // 4. MEJORADO: Reiniciar posición del personaje en la nueva sección
        this.reiniciarPosicionPersonaje();
        
        // 5. Configurar elementos específicos de la nueva sección
        this.configurarElementosSeccionActual();
        
        console.log(`✅ Cambio completado - Ahora en sección ${this.seccionActual}`);
        
        // Si es la última sección, configurar la meta
        if (this.seccionActual === this.totalSecciones) {
            this.configurarMetaFinal();
        }
    }

    /**
     * Configura elementos específicos de la sección actual - ACTUALIZADO
     */
    configurarElementosSeccionActual() {
        // Hueco solo activo en sección 1
        if (this.seccionActual === 1 && this.configHueco) {
            this.configHueco.activo = true;
            this.mostrarIndicadorHueco();
        } else if (this.configHueco) {
            this.configHueco.activo = false;
            this.ocultarIndicadorHueco();
        }
        
        // Activar/desactivar obstáculos según sección
        if (this.configObstaculos) {
            this.configObstaculos.activo = true; // Siempre activo, pero filtrado por sección
            console.log(`🚧 Obstáculos activados para sección ${this.seccionActual}`);
        }
        
        // 🔥 ACTUALIZADO: Configurar estado de todas las estrellas según la sección actual
        if (this.estrellasConfig) {
            Object.keys(this.estrellasConfig).forEach(estrellaId => {
                const config = this.estrellasConfig[estrellaId];
                
                // Determinar en qué sección está cada estrella
                let seccionEstrella = 1;
                if (estrellaId.includes('Video-1')) seccionEstrella = 2;
                else if (estrellaId.includes('Documento-2')) seccionEstrella = 3;
                else if (estrellaId.includes('Video-2')) seccionEstrella = 3;
                else if (estrellaId.includes('Video-3')) seccionEstrella = 4;
                
                // Activar/desactivar según la sección actual
                config.activo = (seccionEstrella === this.seccionActual);
                
                // Mostrar u ocultar visualmente
                const estrellaElement = document.getElementById(estrellaId);
                if (estrellaElement) {
                    if (config.activo && !config.recogida) {
                        estrellaElement.style.opacity = '1';
                        estrellaElement.style.pointerEvents = 'auto';
                    } else {
                        estrellaElement.style.opacity = '0';
                        estrellaElement.style.pointerEvents = 'none';
                    }
                }
            });
            
            console.log(`⭐ Estado de estrellas actualizado para sección ${this.seccionActual}`);
        }
        
        // Configuraciones específicas por sección
        switch(this.seccionActual) {
            case 1:
                console.log('🎯 Sección 1: Hueco y Estrella (documento) activos');
                break;
            case 2:
                console.log('🎯 Sección 2: 2 Obstáculos y Estrella (video) activos');
                break;
            case 3:
                console.log('🎯 Sección 3: Escaleras, Plataforma, 1 Obstáculo y 2 Estrellas activos');
                break;
            case 4:
                console.log('🎯 Sección 4: 2 Obstáculos, Estrella (video) y Meta final activos');
                break;
        }
    }

    /**
     * Muestra el indicador de hueco
     */
    mostrarIndicadorHueco() {
        const indicadorHueco = document.querySelector('.hueco-peligro');
        if (indicadorHueco) {
            indicadorHueco.style.opacity = '1';
            indicadorHueco.style.pointerEvents = 'auto';
        }
    }

    /**
     * Oculta el indicador de hueco
     */
    ocultarIndicadorHueco() {
        const indicadorHueco = document.querySelector('.hueco-peligro');
        if (indicadorHueco) {
            indicadorHueco.style.opacity = '0';
            indicadorHueco.style.pointerEvents = 'none';
        }
    }

    /**
     * Configura la meta final en la sección 4
     */
    configurarMetaFinal() {
        const meta = document.getElementById('meta');
        if (meta) {
            meta.style.display = 'block';
            console.log('🏁 Meta final configurada en sección 4');
        }
    }

    /**
     * Inicializa los controles del personaje - VERSIÓN COMPLETA ACTUALIZADA
     */
    inicializarControlesPersonaje() {
        console.log('🕹️ Inicializando controles del personaje...');
        
        this.personaje = document.getElementById('jugador');
        if (!this.personaje) {
            console.error('❌ No se encontró el elemento del personaje');
            return;
        }

        // Configuración del movimiento MEJORADA
        this.configMovimiento = {
            velocidad: 10, 
            velocidadSalto: 15,
            gravedad: 0.8,
            enSuelo: true,
            saltando: false,
            velocidadY: 0,
            
            // 🔥 NUEVO: Sistema de doble salto
            saltosRealizados: 0,        // Contador de saltos realizados
            maxSaltos: 2,              // Máximo 2 saltos (doble salto)
            puedeSaltarDeNuevo: true,  // Control para evitar saltos continuos
            tiempoEntreSaltos: 200,    // Tiempo mínimo entre saltos (ms)
            
            posicion: {
                x: 10,
                y: 0
            },
            limites: {
                izquierda: 0,
                derecha: window.innerWidth - 150,
                piso: 38,
                umbralCambioSeccion: window.innerWidth * 0.90
            }
        };

        // Estado de teclas presionadas
        this.teclas = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false
        };

        // Inicializar sistemas adicionales
        this.inicializarDeteccionHueco();
        this.inicializarDeteccionObstaculos();
        this.inicializarDeteccionEstrella();
        this.ajustarPosicionVerticalPersonaje();
        this.agregarIndicadorHueco();

        // Inicializar event listeners
        this.configurarEventosTeclado();
        
        // Iniciar bucle de animación
        this.iniciarBucleAnimacion();
        
        console.log('✅ Controles del personaje inicializados');
        console.log(`🎯 Umbral de cambio de sección: ${this.configMovimiento.limites.umbralCambioSeccion}px`);
        console.log(`🏃 Velocidad del personaje: ${this.configMovimiento.velocidad}`);
        console.log('⭐ Sistema de estrella integrado correctamente');
    }

    /**
     * Inicializa la detección de TODOS los obstáculos con posiciones coordinadas CSS-JS
     */
    inicializarDeteccionObstaculos() {
        console.log('🚧 Inicializando detección completa de obstáculos...');
        
        this.configObstaculos = {
            activo: true, // Activo por defecto, se controla por sección
            obstaculos: [
                // SECCIÓN 2
                { 
                    id: 'obstaculo-sec2-1', 
                    seccion: 2,
                    posicion: { inicio: 18, fin: 22 }, // CSS: left 20%, width 80px
                    tipo: 'obstaculo'
                },
                { 
                    id: 'obstaculo-sec2-2', 
                    seccion: 2,
                    posicion: { inicio: 68, fin: 72 }, // CSS: left 70%, width 80px
                    tipo: 'obstaculo'
                },
                
                // SECCIÓN 3
                { 
                    id: 'escalera-sec3', 
                    seccion: 3,
                    posicion: { inicio: 28, fin: 32 }, // CSS: left 30%, width 120px
                    tipo: 'escalera',
                    permitePaso: true // Las escaleras permiten pasar
                },
                { 
                    id: 'plataforma-sec3', 
                    seccion: 3,
                    posicion: { inicio: 48, fin: 52 }, // CSS: left 50%, width 150px
                    tipo: 'plataforma',
                    permiteSalto: true // Permite saltar desde ella
                },
                { 
                    id: 'obstaculo-sec3-1', 
                    seccion: 3,
                    posicion: { inicio: 46, fin: 50 }, // CSS: left 60%, width 80px
                    tipo: 'obstaculo'
                },
                
                // SECCIÓN 4
                { 
                    id: 'obstaculo-sec4-1', 
                    seccion: 4,
                    posicion: { inicio: 18, fin: 22 }, // CSS: left 30%, width 80px
                    tipo: 'obstaculo'
                },
                { 
                    id: 'obstaculo-sec4-2', 
                    seccion: 4,
                    posicion: { inicio: 58, fin: 62 }, // CSS: left 60%, width 80px
                    tipo: 'obstaculo'
                }
            ]
        };
        
        console.log('📍 Configuración completa de obstáculos cargada:', this.configObstaculos.obstaculos.length, 'elementos');
    }

    /**
     * Inicializa la detección de todas las estrellas del juego
     */
    inicializarDeteccionEstrella() {
        console.log('⭐ Inicializando detección de todas las estrellas...');
        
        this.estrellasConfig = {
            // Estrella en sección 1 - Modal 1
            'Estrella_Documento-1': {
                activo: this.seccionActual === 1,
                recogida: false,
                modalObjetivo: 1,
                elemento: null
            },
            // Estrella en sección 2 - Modal 2 (NUEVO)
            'Estrella_Video-1': {
                activo: this.seccionActual === 2,
                recogida: false,
                modalObjetivo: 2,
                elemento: null
            },
            // Estrella en sección 3 - Modal 3
            'Estrella_Documento-2': {
                activo: this.seccionActual === 3,
                recogida: false,
                modalObjetivo: 3,
                elemento: null
            },
            // Estrella en sección 3 - Modal 4
            'Estrella_Video-2': {
                activo: this.seccionActual === 3,
                recogida: false,
                modalObjetivo: 4,
                elemento: null
            },
            // Estrella en sección 4 - Modal 5
            'Estrella_Video-3': {
                activo: this.seccionActual === 4,
                recogida: false,
                modalObjetivo: 5,
                elemento: null
            }
        };
        
        // Inicializar referencias a los elementos
        Object.keys(this.estrellasConfig).forEach(estrellaId => {
            const elemento = document.getElementById(estrellaId);
            if (elemento) {
                this.estrellasConfig[estrellaId].elemento = elemento;
                
                // Obtener modal objetivo del atributo data-modal si existe
                const modalAttr = elemento.getAttribute('data-modal');
                if (modalAttr) {
                    this.estrellasConfig[estrellaId].modalObjetivo = parseInt(modalAttr);
                }
                
                console.log(`📍 ${estrellaId} configurada - Modal: ${this.estrellasConfig[estrellaId].modalObjetivo}`);
            } else {
                console.warn(`⚠️ Elemento ${estrellaId} no encontrado en el DOM`);
            }
        });
        
        console.log('✅ Sistema de estrellas inicializado');
    }

    /**
     * Verifica colisión con TODOS los obstáculos según la sección actual
     */
    verificarObstaculos() {
        // Solo verificar si hay colisión en curso
        if (this.colisionando || !this.configObstaculos) {
            return;
        }
        
        const posXPorcentaje = (this.configMovimiento.posicion.x / window.innerWidth) * 100;
        const posYPorcentaje = (this.configMovimiento.posicion.y / window.innerHeight) * 100;
        
        // Filtrar obstáculos de la sección actual
        const obstaculosSeccion = this.configObstaculos.obstaculos.filter(
            obstaculo => obstaculo.seccion === this.seccionActual
        );
        
        // Verificar colisión con cada obstáculo de la sección
        obstaculosSeccion.forEach(obstaculo => {
            // Verificar si está en el rango horizontal
            if (posXPorcentaje >= obstaculo.posicion.inicio && 
                posXPorcentaje <= obstaculo.posicion.fin) {
                
                // Lógica diferente según tipo de elemento
                switch(obstaculo.tipo) {
                    case 'obstaculo':
                        // Solo colisiona si está en el suelo (no saltando)
                        if (this.configMovimiento.enSuelo) {
                            console.log(`💥 Colisión con ${obstaculo.id}!`);
                            this.iniciarColisionObstaculo(obstaculo.id);
                        }
                        break;
                        
                    case 'escalera':
                        // Las escaleras permiten pasar, podrían dar un bonus
                        console.log(`🪜 En escalera ${obstaculo.id}`);
                        break;
                        
                    case 'plataforma':
                        // Las plataformas permiten aterrizar encima
                        if (this.configMovimiento.saltando && posYPorcentaje < 10) {
                            console.log(`🛹 Aterrizando en plataforma ${obstaculo.id}`);
                            // Podrías agregar lógica para que se quede en la plataforma
                        }
                        break;
                }
            }
        });
    }

    /**
     * Verifica si el personaje puede tocar cualquier estrella - ACTUALIZADO PARA TODAS LAS ESTRELLAS
     */
    verificarEstrella() {
        // Solo verificar en sección actual
        if (!this.estrellasConfig) return;
        
        // Filtrar estrellas activas en la sección actual y no recogidas
        const estrellasActivas = Object.keys(this.estrellasConfig).filter(estrellaId => {
            const config = this.estrellasConfig[estrellaId];
            return config.activo && !config.recogida && config.elemento;
        });
        
        if (estrellasActivas.length === 0) return;
        
        // Obtener posición real del personaje
        const jugadorRect = this.personaje.getBoundingClientRect();
        
        // Verificar cada estrella activa
        estrellasActivas.forEach(estrellaId => {
            const config = this.estrellasConfig[estrellaId];
            const estrellaElement = config.elemento;
            
            // Obtener posición real de la estrella
            const estrellaRect = estrellaElement.getBoundingClientRect();
            
            // Calcular colisión usando rectángulos reales
            const colisionX = jugadorRect.right > estrellaRect.left && 
                            jugadorRect.left < estrellaRect.right;
            const colisionY = jugadorRect.bottom > estrellaRect.top && 
                            jugadorRect.top < estrellaRect.bottom;
            
            // Verificar colisión con la estrella (solo cuando está saltando)
            if (this.configMovimiento.saltando && colisionX && colisionY) {
                console.log(`⭐ ¡Has tocado la estrella ${estrellaId}! Abriendo modal ${config.modalObjetivo}`);
                this.tocarEstrella(estrellaId);
            }
        });
    }

    /**
     * Maneja cuando el personaje toca una estrella - ACTUALIZADO PARA TODAS LAS ESTRELLAS
     */
    tocarEstrella(estrellaId) {
        const config = this.estrellasConfig[estrellaId];
        if (!config || config.recogida) return;
        
        // Marcar como recogida
        config.recogida = true;
        
        // Ocultar la estrella visualmente
        const estrellaElement = document.getElementById(estrellaId);
        if (estrellaElement) {
            estrellaElement.style.opacity = '0';
            estrellaElement.style.pointerEvents = 'none';
            console.log(`👁️ ${estrellaId} ocultada visualmente`);
        } else {
            console.error(`❌ No se encontró el elemento ${estrellaId}`);
        }
        
        // Aplicar animación de recolección al personaje
        this.personaje.classList.add('recogiendo-estrella');
        
        // Mostrar mensaje de éxito específico para el tipo de estrella
        this.mostrarMensajeEstrellaRecogida(config.modalObjetivo, estrellaId);
        
        // Reproducir sonido de estrella
        this.reproducirSonidoEstrella();
        
        // Abrir modal correspondiente después de un breve delay
        setTimeout(() => {
            this.personaje.classList.remove('recogiendo-estrella');
            this.abrirModalPorNumero(config.modalObjetivo);
            console.log(`📖 Modal ${config.modalObjetivo} activado por contacto con ${estrellaId}`);
        }, 600);
    }

    /**
     * Muestra mensaje de recolección de estrella según el tipo
     */
    mostrarMensajeEstrellaRecogida(modalNumero, estrellaId) {
        const mensaje = document.querySelector('.mensaje-caida');
        if (!mensaje) return;
        
        let textoMensaje = '';
        
        // Personalizar mensaje según el modal objetivo
        switch(modalNumero) {
            case 1:
                textoMensaje = '⭐ ¡Documento encontrado! Abriendo Cartilla de Bienvenida...';
                break;
            case 2:
                textoMensaje = '🎥 ¡Video encontrado! Abriendo Video Cartilla de Bienvenida...';
                break;
            case 3:
                textoMensaje = '⭐ ¡Documento encontrado! Abriendo Guía Coopcentral...';
                break;
            case 4:
                textoMensaje = '🎥 ¡Video encontrado! Abriendo Cápsula 1 Seguridad y Salud...';
                break;
            case 5:
                textoMensaje = '🎥 ¡Video encontrado! Abriendo Cápsula 2 Seguridad y Salud...';
                break;
            default:
                textoMensaje = '⭐ ¡Objeto encontrado! Abriendo contenido...';
        }
        
        mensaje.textContent = textoMensaje;
        mensaje.style.display = 'block';
        
        // Forzar reflow para que la transición funcione
        void mensaje.offsetWidth;
        
        setTimeout(() => {
            mensaje.classList.add('mostrar');
        }, 10);
        
        setTimeout(() => {
            mensaje.classList.remove('mostrar');
            setTimeout(() => {
                mensaje.style.display = 'none';
            }, 500);
        }, 2000);
        
        console.log(`⭐ Mensaje de ${estrellaId} recogida mostrado`);
    }

    /**
     * Abre un modal específico por número
     */
    abrirModalPorNumero(modalNumero) {
        // Cerrar modal actual si existe
        if (this.modalAbierto) {
            this.cerrarModal(this.modalAbierto);
        }
        
        // 🔥 NUEVO: Marcar que esta modal se abrió por una estrella
        this.modalAbiertaPorEstrella = true;
        console.log(`⭐ Modal ${modalNumero} abierta por contacto con estrella`);
        
        // Abrir modal correspondiente
        switch(modalNumero) {
            case 1:
                this.mostrarModalCapacitarse1();
                break;
            case 2:
                this.mostrarModalCapacitarse2();
                break;
            case 3:
                this.mostrarModalCapacitarse3();
                break;
            case 4:
                this.mostrarModalCapacitarse4();
                break;
            case 5:
                this.mostrarModalCapacitarse5();
                break;
            default:
                console.warn(`⚠️ Modal número ${modalNumero} no reconocido`);
                // Por defecto, abrir modal 1
                this.mostrarModalCapacitarse1();
        }
    }

    /**
     * Inicia la animación de colisión con obstáculo
     */
    iniciarColisionObstaculo(obstaculoId) {
        this.colisionando = true;
        
        // Desactivar controles durante la colisión
        this.configMovimiento.enSuelo = false;
        this.configMovimiento.saltando = false;
        
        // Aplicar animación de colisión
        this.personaje.classList.remove('derecha', 'izquierda', 'arriba');
        this.personaje.classList.add('colisionando-obstaculo');
        
        // Mostrar mensaje de colisión
        this.mostrarMensajeColision();
        
        // Reproducir sonido de colisión
        this.reproducirSonidoColision();
        
        // Después de la animación, reiniciar posición
        setTimeout(() => {
            this.reiniciarAPosicionInicial();
            this.personaje.classList.remove('colisionando-obstaculo');
            this.colisionando = false;
            console.log('🔄 Personaje reiniciado después de colisión con obstáculo');
        }, 800);
    }

    /**
     * Muestra mensaje de colisión con obstáculo
     */
    mostrarMensajeColision() {
        const mensaje = document.querySelector('.mensaje-caida');
        if (mensaje) {
            mensaje.textContent = '¡Oh no! Chocaste con un obstáculo';
            mensaje.style.display = 'block';
            
            // Forzar reflow para que la transición funcione
            void mensaje.offsetWidth;
            
            setTimeout(() => {
                mensaje.classList.add('mostrar');
            }, 10);
            
            setTimeout(() => {
                mensaje.classList.remove('mostrar');
                setTimeout(() => {
                    mensaje.style.display = 'none';
                }, 500);
            }, 2000);
            
            console.log('💥 Mensaje de colisión mostrado');
        }
    }

    /**
     * Resetea todas las estrellas para que reaparezcan
     */
    resetearEstrella() {
        if (this.estrellasConfig) {
            Object.keys(this.estrellasConfig).forEach(estrellaId => {
                const config = this.estrellasConfig[estrellaId];
                config.recogida = false;
                
                const estrellaElement = document.getElementById(estrellaId);
                if (estrellaElement) {
                    // Solo mostrar si está en la sección correcta
                    if (config.activo) {
                        estrellaElement.style.opacity = '1';
                        estrellaElement.style.pointerEvents = 'auto';
                    }
                }
            });
            console.log('🔄 Todas las estrellas reseteadas');
        }
    }

    /**
     * Reproduce sonido de colisión (placeholder)
     */
    reproducirSonidoColision() {
        console.log('🔊 Reproduciendo sonido de colisión con obstáculo');
        // Aquí se puede implementar la reproducción de un efecto de sonido
    }

    /**
     * Reproduce sonido de estrella (placeholder)
     */
    reproducirSonidoEstrella() {
        console.log('🔊 Reproduciendo sonido de estrella');
        // Aquí se puede implementar la reproducción de un efecto de sonido
    }

    /**
     * Reinicia el personaje a la posición inicial - MODIFICADO
     */
    reiniciarAPosicionInicial() {
        console.log('🔄 Reiniciando personaje a posición inicial...');
        
        // Cambiar a sección 1
        this.cambiarASeccion(1);
        
        // Reiniciar posición del personaje
        this.reiniciarPosicionPersonaje();
        
        // Reactivar controles
        this.configMovimiento.enSuelo = true;
        
        // 🔥 NUEVO: Resetear estados de salto
        this.configMovimiento.saltosRealizados = 0;
        this.configMovimiento.puedeSaltarDeNuevo = true;
        
        // 🔥 ACTUALIZADO: Resetear todas las estrellas
        this.resetearEstrella();
        
        // 🔥 NUEVO: Resetear bandera de modal abierta por estrella
        this.modalAbiertaPorEstrella = false;
        
        console.log('✅ Personaje reiniciado en sección 1 con todas las estrellas reseteadas');
    }

    /**
     * Cambia a una sección específica
     */
    cambiarASeccion(numeroSeccion) {
        if (numeroSeccion < 1 || numeroSeccion > this.totalSecciones) {
            console.error('❌ Número de sección inválido:', numeroSeccion);
            return;
        }
        
        console.log(`🔄 Cambiando a sección ${numeroSeccion}`);
        
        // Ocultar todas las secciones
        document.querySelectorAll('.seccion-mundo').forEach(seccion => {
            seccion.classList.remove('activa');
        });
        
        // Mostrar sección objetivo
        const seccionObjetivo = document.querySelector(`.seccion-${numeroSeccion}`);
        if (seccionObjetivo) {
            seccionObjetivo.classList.add('activa');
            this.seccionActual = numeroSeccion;
            
            // Configurar elementos específicos de la sección
            this.configurarElementosSeccionActual();
            
            console.log(`✅ Cambio completado - Ahora en sección ${this.seccionActual}`);
        } else {
            console.error(`❌ No se encontró la sección ${numeroSeccion}`);
        }
    }

    /**
     * Configura eventos de teclado con prevención de auto-repeat
     */
    configurarEventosTeclado() {
        // 🔥 NUEVO: Bandera para controlar el auto-repeat
        let teclaArribaPresionada = false;
        
        document.addEventListener('keydown', (e) => {
            if (this.teclas.hasOwnProperty(e.key)) {
                // 🔥 CRÍTICO: Prevenir el auto-repeat en la tecla de salto
                if (e.key === 'ArrowUp') {
                    if (teclaArribaPresionada) {
                        // Si ya está presionada, ignorar el evento (auto-repeat)
                        return;
                    }
                    teclaArribaPresionada = true;
                }
                
                this.teclas[e.key] = true;
                e.preventDefault();
                this.actualizarAparienciaPersonaje();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (this.teclas.hasOwnProperty(e.key)) {
                this.teclas[e.key] = false;
                e.preventDefault();
                this.actualizarAparienciaPersonaje();
                
                // 🔥 NUEVO: Resetear bandera cuando se suelta la tecla
                if (e.key === 'ArrowUp') {
                    teclaArribaPresionada = false;
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });

        console.log('⌨️ Eventos de teclado configurados con prevención de auto-repeat');
    }

    /**
     * Muestra información de debug sobre el estado de los saltos
     */
    debugSaltos() {
        console.log('🔍 === DEBUG SALTOS ===');
        console.log(`Saltos realizados: ${this.configMovimiento.saltosRealizados}/${this.configMovimiento.maxSaltos}`);
        console.log(`Puede saltar de nuevo: ${this.configMovimiento.puedeSaltarDeNuevo}`);
        console.log(`En suelo: ${this.configMovimiento.enSuelo}`);
        console.log(`Saltando: ${this.configMovimiento.saltando}`);
        console.log('🔚 === FIN DEBUG ===');
    }

    /**
     * Actualiza la apariencia del personaje según la tecla presionada
     */
    actualizarAparienciaPersonaje() {
        // Remover todas las clases de dirección
        this.personaje.classList.remove('derecha', 'izquierda', 'arriba');
        
        // Aplicar clase según la tecla presionada
        if (this.teclas.ArrowRight) {
            this.personaje.classList.add('derecha');
        } else if (this.teclas.ArrowLeft) {
            this.personaje.classList.add('izquierda');
        } else if (this.teclas.ArrowUp && this.configMovimiento.saltando) {
            this.personaje.classList.add('arriba');
        } else {
            // Por defecto, mirar a la derecha
            this.personaje.classList.add('derecha');
        }
    }

    /**
     * Procesa el movimiento con control de salto mejorado - 
     */
    procesarMovimiento() {
        // Movimiento izquierda
        if (this.teclas.ArrowLeft) {
            this.configMovimiento.posicion.x -= this.configMovimiento.velocidad;
            this.configMovimiento.posicion.x = Math.max(
                this.configMovimiento.limites.izquierda, 
                this.configMovimiento.posicion.x
            );
        }
        
        // Movimiento derecha
        if (this.teclas.ArrowRight) {
            this.configMovimiento.posicion.x += this.configMovimiento.velocidad;
            
            // MEJORADO: Verificación más precisa del final de sección
            const haLlegadoAlFinal = this.configMovimiento.posicion.x >= this.configMovimiento.limites.umbralCambioSeccion;
            const puedeCambiarSeccion = this.seccionActual < this.totalSecciones;
            const noEstaTransicionando = !this.transicionando;
            
            if (haLlegadoAlFinal && puedeCambiarSeccion && noEstaTransicionando) {
                console.log(`🚀 ACTIVANDO TRANSICIÓN - Posición: ${this.configMovimiento.posicion.x.toFixed(0)}px, Umbral: ${this.configMovimiento.limites.umbralCambioSeccion.toFixed(0)}px`);
                this.iniciarTransicionSeccion();
                return; // Detener procesamiento de movimiento durante transición
            }
            
            // MEJORADO: En la sección 4, verificar si llegó al final para redirigir
            if (this.seccionActual === this.totalSecciones && this.configMovimiento.posicion.x >= this.configMovimiento.limites.umbralCambioSeccion) {
                console.log('🏁 Llegó al final del mundo, redirigiendo...');
                this.completarMundo1();
                return;
            }
            
            this.configMovimiento.posicion.x = Math.min(
                this.configMovimiento.limites.derecha, 
                this.configMovimiento.posicion.x
            );
        }
        
        // 🔥 : Control de salto con límite de 2 saltos
        // Solo permite saltar si la tecla está presionada y puede saltar
        if (this.teclas.ArrowUp) {
            // Verificar condiciones para saltar
            const puedeSaltar = (
                this.configMovimiento.saltosRealizados < this.configMovimiento.maxSaltos &&
                this.configMovimiento.puedeSaltarDeNuevo &&
                !this.configMovimiento.saltando // Evita saltar mientras ya está saltando
            );
            
            if (puedeSaltar) {
                this.iniciarSalto();
                
                // 🔥 IMPORTANTE: Marcar que la tecla ya fue procesada para este salto
                // Esto evita que se siga saltando mientras se mantiene presionada
                this.teclas.ArrowUp = false;
            }
        }
    }

    /**
     * Inicia el salto con control de doble salto
     */
    iniciarSalto() {
        // 🔥 NUEVO: Verificar si puede saltar (máximo 2 saltos)
        if (this.configMovimiento.saltosRealizados >= this.configMovimiento.maxSaltos) {
            console.log('⚠️ Límite de saltos alcanzado (máximo 2)');
            return;
        }
        
        // 🔥 NUEVO: Verificar si puede saltar de nuevo (evitar saltos rápidos)
        if (!this.configMovimiento.puedeSaltarDeNuevo) {
            console.log('⚠️ Espera para saltar de nuevo');
            return;
        }
        
        // Incrementar contador de saltos
        this.configMovimiento.saltosRealizados++;
        
        // Aplicar lógica del salto
        this.configMovimiento.saltando = true;
        this.configMovimiento.enSuelo = false;
        this.configMovimiento.velocidadY = -this.configMovimiento.velocidadSalto;
        
        // 🔥 NUEVO: Bloquear saltos rápidos
        this.configMovimiento.puedeSaltarDeNuevo = false;
        
        // Restaurar capacidad de salto después de un tiempo
        setTimeout(() => {
            this.configMovimiento.puedeSaltarDeNuevo = true;
        }, this.configMovimiento.tiempoEntreSaltos);
        
        // Aplicar imagen de salto
        this.personaje.classList.remove('derecha', 'izquierda');
        this.personaje.classList.add('arriba', 'saltando');
        
        console.log(`🦘 Salto ${this.configMovimiento.saltosRealizados}/${this.configMovimiento.maxSaltos}`);
        
        setTimeout(() => {
            this.personaje.classList.remove('saltando');
            // Restaurar dirección después del salto
            this.actualizarAparienciaPersonaje();
        }, 500);
    }

    /**
     * Aplica gravedad al personaje
     */
    aplicarGravedad() {
        if (!this.configMovimiento.enSuelo) {
            this.configMovimiento.velocidadY += this.configMovimiento.gravedad;
            this.configMovimiento.posicion.y += this.configMovimiento.velocidadY;
            
            if (this.configMovimiento.posicion.y >= 0) {
                this.configMovimiento.posicion.y = 0;
                this.configMovimiento.velocidadY = 0;
                this.configMovimiento.enSuelo = true;
                this.configMovimiento.saltando = false;
                
                // 🔥 CRÍTICO: Resetear contador de saltos cuando toca el suelo
                this.configMovimiento.saltosRealizados = 0;
                this.configMovimiento.puedeSaltarDeNuevo = true;
                
                this.personaje.classList.add('cayendo');
                setTimeout(() => {
                    this.personaje.classList.remove('cayendo');
                }, 300);
                
                console.log('🏁 Tocó el suelo - Saltos reseteados');
            }
        }
    }
    
    /**
     * Actualiza la posición visual del personaje
     */
    actualizarPosicionPersonaje() {
        if (this.personaje && this.configMovimiento) {
            this.personaje.style.left = this.configMovimiento.posicion.x + 'px';
            this.personaje.style.top = `calc(${this.configMovimiento.limites.piso}% - ${this.configMovimiento.posicion.y}px)`;
        }
    }

    /**
     * Reinicia la posición del personaje y estados de salto - MODIFICADO
     */
    reiniciarPosicionPersonaje() {
        // Posicionar temporalmente fuera de pantalla a la izquierda para la animación de entrada
        this.configMovimiento.posicion.x = -150;
        this.configMovimiento.posicion.y = 0;
        this.configMovimiento.velocidadY = 0;
        this.configMovimiento.enSuelo = true;
        this.configMovimiento.saltando = false;
        
        // 🔥 NUEVO: Resetear contador de saltos
        this.configMovimiento.saltosRealizados = 0;
        this.configMovimiento.puedeSaltarDeNuevo = true;
        
        this.actualizarPosicionPersonaje();
        this.actualizarAparienciaPersonaje();
        
        console.log(`🔄 Personaje reiniciado - Saltos reseteados`);
    }

    /**
     * Bucle de animación principal
     */
    iniciarBucleAnimacion() {
        const animar = () => {
            if (!this.transicionando) {
                this.procesarMovimiento();
                this.aplicarGravedad();
                this.verificarHueco();
                this.verificarObstaculos();
                this.verificarEstrella();
                this.verificarMeta();
                this.actualizarPosicionPersonaje();
            }
            requestAnimationFrame(animar);
        };
        
        animar();
        console.log('🔄 Bucle de animación iniciado');
    }

    /**
     * CORREGIDO: Inicializa detección de hueco con posición ajustada al CSS
     */
    inicializarDeteccionHueco() {
        console.log('🕳️ Inicializando detección de hueco con posición CSS coordinada...');
        
        this.configHueco = {
            // AJUSTADO: Coordinar con CSS donde left: 50% y width: 9%
            // Hueco va de 50% a 59% (50 + 9)
            inicio: 49,   // Pequeño margen para mejor detección
            fin: 50,      // Exacto: 50% + 9% = 59%
            activo: this.seccionActual === 1
        };
        
        console.log(`📍 Hueco configurado entre ${this.configHueco.inicio}% y ${this.configHueco.fin}% (CSS: left 50%, width 9%)`);
    }
    
    /**
     * Verifica si el personaje cayó en el hueco
     */
    verificarHueco() {
        if (!this.configHueco || !this.configHueco.activo || this.seccionActual !== 1) {
            return; // No verificar hueco en otras secciones
        }
        
        const posXPorcentaje = (this.configMovimiento.posicion.x / window.innerWidth) * 100;
        
        if (posXPorcentaje >= this.configHueco.inicio && 
            posXPorcentaje <= this.configHueco.fin && 
            this.configMovimiento.enSuelo) {
            
            console.log('💥 Personaje cayó en el hueco!');
            this.iniciarCaidaHueco();
        }
    }

    /**
     * Inicia la animación de caída en el hueco
     */
    iniciarCaidaHueco() {
        this.configMovimiento.enSuelo = false;
        this.configMovimiento.saltando = false;
        
        this.personaje.classList.remove('derecha', 'izquierda', 'arriba');
        this.personaje.classList.add('cayendo-hueco');
        
        this.mostrarMensajeCaida();
        this.reproducirSonidoCaida();
        
        setTimeout(() => {
            this.reiniciarPosicionPersonaje();
            this.personaje.classList.remove('cayendo-hueco');
            console.log('🔄 Personaje reiniciado después de caída');
        }, 400);
    }

    /**
     * Verifica si el personaje llegó a la meta - MEJORADO
     */
    verificarMeta() {
        // Solo verificar en la última sección
        if (this.seccionActual !== this.totalSecciones) return;
        
        const meta = document.getElementById('meta');
        if (!meta) return;
        
        // Calcular posición de la meta en la pantalla
        const metaRect = meta.getBoundingClientRect();
        const jugadorRect = this.personaje.getBoundingClientRect();
        
        // Verificar colisión real entre los rectángulos
        const colisionX = jugadorRect.right > metaRect.left && 
                        jugadorRect.left < metaRect.right;
        const colisionY = jugadorRect.bottom > metaRect.top && 
                        jugadorRect.top < metaRect.bottom;
        
        if (colisionX && colisionY) {
            console.log('🎉 ¡Has llegado a la meta!');
            this.mostrarVictoria();
        }
    }

    /**
     * Muestra mensaje de caída
     */
    mostrarMensajeCaida() {
        const mensaje = document.querySelector('.mensaje-caida');
        if (mensaje) {
            mensaje.textContent = '¡Oh no! Te caíste';
            mensaje.style.display = 'block';
            
            // Forzar reflow para que la transición funcione
            void mensaje.offsetWidth;
            
            setTimeout(() => {
                mensaje.classList.add('mostrar');
            }, 10);
            
            setTimeout(() => {
                mensaje.classList.remove('mostrar');
                setTimeout(() => {
                    mensaje.style.display = 'none';
                }, 500);
            }, 2000);
            
            console.log('💥 Mensaje de caída mostrado');
        }
    }

    /**
     * Muestra pantalla de victoria
     */
    mostrarVictoria() {
        const mensaje = document.querySelector('.mensaje-victoria');
        if (mensaje) {
            mensaje.textContent = '🎉 ¡Felicidades! Has completado el Mundo 1';
            mensaje.style.display = 'block';
            
            setTimeout(() => {
                mensaje.classList.add('mostrar');
            }, 10);
            
            setTimeout(() => {
                mensaje.classList.remove('mostrar');
                setTimeout(() => {
                    mensaje.style.display = 'none';
                    this.completarMundo1();
                }, 300);
            }, 3000);
        }
    }

    /**
     * Función de depuración para verificar elementos
     */
    depurarElementosMensajes() {
        const mensajes = ['controles', 'caida', 'victoria'];
        
        mensajes.forEach(tipo => {
            const selector = `.mensaje-${tipo}`;
            const elemento = document.querySelector(selector);
            
            if (elemento) {
                console.log(`✅ Elemento ${selector} encontrado:`, elemento);
                console.log(`   - Display: ${window.getComputedStyle(elemento).display}`);
                console.log(`   - Opacity: ${window.getComputedStyle(elemento).opacity}`);
                console.log(`   - Z-index: ${window.getComputedStyle(elemento).zIndex}`);
            } else {
                console.error(`❌ Elemento ${selector} NO encontrado`);
            }
        });
    }

    /**
     * Agrega indicador visual del hueco
     */
    agregarIndicadorHueco() {
        // El hueco ya está en el HTML, solo necesitamos configurarlo
        console.log('⚠️ Indicador de hueco ya existe en el HTML');
    }

    /**
     * Ajusta posición vertical del personaje
     */
    ajustarPosicionVerticalPersonaje() {
        console.log('🔼 Ajustando posición vertical del personaje...');
        this.configMovimiento.limites.piso = 38;
        this.actualizarPosicionPersonaje();
        console.log(`🎯 Nueva posición vertical: ${this.configMovimiento.limites.piso}%`);
    }

    /**
     * Método para forzar transición (útil para testing)
     */
    forzarTransicionSeccion() {
        if (!this.transicionando && this.seccionActual < this.totalSecciones) {
            console.log('🔧 Forzando transición de sección...');
            this.iniciarTransicionSeccion();
        }
    }

    /**
     * Actualiza límites cuando cambia el tamaño de la ventana
     */
    actualizarLimitesPantalla() {
        if (this.configMovimiento) {
            this.configMovimiento.limites.derecha = window.innerWidth - 150;
            this.configMovimiento.limites.umbralCambioSeccion = window.innerWidth * 0.90; // 90% del ancho
            
            console.log(`📏 Límites actualizados - Derecha: ${this.configMovimiento.limites.derecha}px, Umbral: ${this.configMovimiento.limites.umbralCambioSeccion}px`);
            console.log(`🏃 Velocidad actual: ${this.configMovimiento.velocidad}`);
        }
    }

    /**
     * NUEVO: Método para forzar reinicio de posiciones (útil para debug)
     */
    reiniciarPosicionesElementos() {
        console.log('🔄 Reiniciando posiciones de elementos...');
        
        // Reiniciar posición de obstáculos visualmente
        const obstaculo1 = document.getElementById('obstaculo-1');
        const obstaculo2 = document.getElementById('obstaculo-2');
        
        if (obstaculo1 && obstaculo2) {
            // Verificar que las posiciones CSS se apliquen
            const estilo1 = window.getComputedStyle(obstaculo1);
            const estilo2 = window.getComputedStyle(obstaculo2);
            
            console.log('📍 Posiciones CSS actuales:');
            console.log(`  - Obstáculo 1: left ${estilo1.left}, top ${estilo1.top}`);
            console.log(`  - Obstáculo 2: left ${estilo2.left}, top ${estilo2.top}`);
            
            // Forzar reflow para asegurar que CSS se aplica
            obstaculo1.offsetHeight;
            obstaculo2.offsetHeight;
        }
        
        // 🔥 CAMBIO: Reiniciar posición de estrella con nuevo ID
        const estrella = document.getElementById('Estrella_Documento-1');
        if (estrella) {
            const estiloEstrella = window.getComputedStyle(estrella);
            console.log(`  - Estrella_Documento-1: left ${estiloEstrella.left}, top ${estiloEstrella.top}`);
            console.log(`  - width: ${estiloEstrella.width}, height: ${estiloEstrella.height}`);
            console.log(`  - opacity: ${estiloEstrella.opacity}, display: ${estiloEstrella.display}`);
            estrella.offsetHeight;
        } else {
            console.error('❌ Elemento Estrella_Documento-1 no encontrado');
        }
        
        // Reiniciar posición de hueco
        const hueco = document.querySelector('.hueco-peligro');
        if (hueco) {
            const estiloHueco = window.getComputedStyle(hueco);
            console.log(`  - Hueco: left ${estiloHueco.left}, width ${estiloHueco.width}`);
            hueco.offsetHeight;
        }
    }

    /**
     * Reproduce sonido de caída (placeholder)
     */
    reproducirSonidoCaida() {
        console.log('🔊 Reproduciendo sonido de caída');
    }

    /**
     * Inicia el juego en modo divertirse
     */
    iniciarJuego(modo) {
        console.log(`🎮 Iniciando juego en modo: ${modo}`);
        
        if (modo === 'divertirse') {
            this.cerrarModalActual();
            
            setTimeout(() => {
                this.reiniciarPosicionPersonaje();
                console.log('🚀 Juego iniciado - Controles activados');
                this.mostrarMensajeControles();
            }, 500);
        } else {
            console.log('📚 Modo capacitación activado');
        }
    }

    /**
     * Completa el mundo 1 con redirección
     */
    completarMundo1() {
        localStorage.setItem('mundo1Completado', 'true');
        console.log('✅ Mundo 1 completado - Progreso guardado');
        
        // Asegurarse de restaurar volumen antes de redirigir
        this.restaurarVolumenDespuesDeModalVideo();
        
        setTimeout(() => {
            window.location.href = 'mundos.html';
        }, 1000);
    }

    /**
     * Muestra mensaje de controles
     */
    mostrarMensajeControles() {
        const mensaje = document.querySelector('.mensaje-controles');
        if (mensaje) {
            mensaje.textContent = '🎮 Usa las flechas del teclado para moverte';
            mensaje.style.display = 'block';
            
            // Forzar reflow para que la transición funcione
            void mensaje.offsetWidth;
            
            setTimeout(() => {
                mensaje.classList.add('mostrar');
            }, 10);
            
            setTimeout(() => {
                mensaje.classList.remove('mostrar');
                setTimeout(() => {
                    mensaje.style.display = 'none';
                }, 500); // Esperar a que termine la transición de opacidad
            }, 3000);
            
            console.log('🎮 Mensaje de controles mostrado');
        } else {
            console.warn('⚠️ Elemento mensaje-controles no encontrado');
        }
    }

    // ==========================================================================================
    // SISTEMA DE MODALES - COMPLETO Y CORREGIDO
    // ==========================================================================================

    configurarBotonesNavegacion() {
        const botonesConfig = [
            { 
                selector: '.boton-reiniciar', 
                action: () => {
                    // Resetear estrella antes de recargar
                    if (window.mundoJuego1 && window.mundoJuego1.resetearEstrella) {
                        window.mundoJuego1.resetearEstrella();
                    }
                    location.reload(); 
                }, 
                desc: 'Reiniciar juego' 
            },
            { selector: '.boton-home', action: () => window.location.href = 'index.html', desc: 'Ir al inicio' },
            { selector: '.boton-salir', action: () => window.location.href = 'mundos.html', desc: 'Salir a mundos' }
        ];

        botonesConfig.forEach(config => {
            const boton = document.querySelector(config.selector);
            if (boton) {
                boton.addEventListener('click', config.action);
                boton.setAttribute('aria-label', config.desc);
                console.log(`🔘 Botón ${config.desc} configurado`);
            } else {
                console.warn(`⚠️ Botón no encontrado: ${config.selector}`);
            }
        });
    }

    configurarEventListenersGlobales() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalAbierto) {
                this.cerrarModalActual();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pausarMedios();
            }
        });

        window.addEventListener('resize', () => {
            this.actualizarLimitesPantalla();
        });
    }

    mostrarModalInicio() {
        const overlay = this.crearOverlay();
        const modalContenedorPadre = overlay.querySelector('.modal-contenedor-padre');
        const modal = this.crearElemento('div', 'modal-inicio-juego');
        const content = this.crearElemento('div', 'modal-contenido-inicio-juego');
        
        // 🔥 AGREGADO: Imagen Estrella_Ganaste.png con animación
        const estrellaGanaste = this.crearElemento('div', 'imagen-estrella-ganaste');
        estrellaGanaste.setAttribute('aria-label', 'Estrella de victoria animada');
        estrellaGanaste.setAttribute('title', '¡Ganaste!');
        
        const botonJugarModal = this.crearBoton(
            'boton-instrucciones-modal boton-jugar-modal',
            'Jugar en modo divertirse',
            'Jugar'
        );
        
        const botonCapacitarseModal = this.crearBoton(
            'boton-instrucciones-modal boton-capacitarse-modal',
            'Modo capacitación para aprender',
            'Capacitarse'
        );
        
        // Agregar elementos al contenido en el orden correcto
        content.appendChild(estrellaGanaste); // Estrella primero (debajo del botón visualmente)
        content.appendChild(botonJugarModal);
        content.appendChild(botonCapacitarseModal);
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        botonJugarModal.addEventListener('click', () => {
            this.cerrarModal(overlay);
            this.iniciarJuego('divertirse');
        });
        
        botonCapacitarseModal.addEventListener('click', () => {
            this.mostrarModalCapacitarse(overlay);
        });
        
        this.modalAbierto = overlay;
        console.log('🎮 Modal de inicio mostrado con estrella animada');
    }

    mostrarModalCapacitarse(overlayAnterior = null) {
        if (overlayAnterior) {
            this.cerrarModal(overlayAnterior);
        }
        
        // 🔥 IMPORTANTE: Resetear la bandera cuando se abre desde el menú
        this.modalAbiertaPorEstrella = false;
        
        const overlay = this.crearOverlay();
        const modalContenedorPadre = overlay.querySelector('.modal-contenedor-padre');
        const modal = this.crearElemento('div', 'modal-capacitarse');
        const content = this.crearElemento('div', 'modal-contenido-capacitarse');
        
        const imagenEstrellas = this.crearElemento('div', 'imagen-estrellas-superior');
        const botonesContainer = this.crearElemento('div', 'botones-capacitarse-container');
        
        // ACTUALIZADO: Ahora con 6 botones en lugar de 4
        const nivelesCapacitacion = [
            { clase: 'boton-capacitarse-1', desc: 'Nivel 1 de capacitación - Cartilla de Bienvenida' },
            { clase: 'boton-capacitarse-2', desc: 'Nivel 2 de capacitación - Video Cartilla de Bienvenida' },
            { clase: 'boton-capacitarse-3', desc: 'Nivel 3 de capacitación - Guia' },
            { clase: 'boton-capacitarse-4', desc: 'Nivel 4 de capacitación - Video Guia Capsula 1' },
            { clase: 'boton-capacitarse-5', desc: 'Nivel 5 de capacitación - Video Guia Capsula 2' },
            { clase: 'boton-capacitarse-6', desc: 'Nivel 6 de capacitación - Final' }
        ];

        nivelesCapacitacion.forEach((nivel, index) => {
            const boton = this.crearBoton(
                `boton-capacitarse-item ${nivel.clase}`,
                nivel.desc,
                `Nivel ${index + 1}`
            );
            
            boton.addEventListener('click', () => {
                console.log(`📚 Botón capacitarse ${index + 1} clickeado - Clase: ${nivel.clase}`);
                
                // Navegación mejorada para los nuevos botones
                switch(index) {
                    case 0: // Botón 1 - Cartilla de Bienvenida
                        this.mostrarModalCapacitarse1(overlay);
                        break;
                    case 1: // Botón 2 - Cartilla de Bienvenida - Su Guia 
                        this.mostrarModalCapacitarse2(overlay);
                        break;
                    case 2: // Botón 3 - Guía Coopcentral
                        this.mostrarModalCapacitarse3(overlay);
                        break;
                    case 3: // Botón 4 - Video Capsula 1
                        this.mostrarModalCapacitarse4(overlay);
                        break;
                    case 4: // Botón 5 - Video Capsula 2
                        this.mostrarModalCapacitarse5(overlay);
                        break;
                    case 5: // Botón 6 - Final
                        this.mostrarModalCapacitarse6(overlay);
                        break;
                    default:
                        console.warn('⚠️ Botón de capacitación no reconocido:', index);
                }
            });
            
            botonesContainer.appendChild(boton);
        });
        
        const barraProgresoContainer = this.crearBarraProgreso();
        
        const botonSalirCapacitarse = this.crearBoton(
            'boton-salir-capacitarse',
            'Salir del modo capacitación',
            'Salir'
        );
        
        content.appendChild(imagenEstrellas);
        content.appendChild(botonesContainer);
        content.appendChild(barraProgresoContainer.container);
        content.appendChild(botonSalirCapacitarse);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Animar barra de progreso
        setTimeout(() => {
            barraProgresoContainer.carga.style.width = '0%';
        }, 500);
        
        botonSalirCapacitarse.addEventListener('click', () => {
            this.cerrarModal(overlay);
        });
        
        this.modalAbierto = overlay;
        console.log('📚 Modal de capacitación principal mostrado con 6 botones');
    }

    /** =======================================================================================================================================
     * Muestra el modal de capacitación 1 - Cartilla de Bienvenida (PDF Bienvenido Coopcentral)
     */
    mostrarModalCapacitarse1(overlayAnterior = null) {
        if (overlayAnterior) {
            this.cerrarModal(overlayAnterior);
        }
        
        const overlay = this.crearOverlay();
        const modalContenedorPadre = overlay.querySelector('.modal-contenedor-padre');
        const modal = this.crearElemento('div', 'modal-capacitarse-1');
        const content = this.crearElemento('div', 'modal-contenido-capacitarse-1');
        
        const imagenEstrellas = this.crearElemento('div', 'imagen-estrellas-1');
        
        // Contenedor de imagen del manual 1 con clase imagen-manual-container_1
        const imagenManualContainer = this.crearElemento('div', 'imagen-manual-container_1');
        imagenManualContainer.setAttribute('aria-label', 'PDF Bienvenido Coopcentral - Haz clic para abrir');
        
        imagenManualContainer.addEventListener('click', () => {
            window.open('https://www.canva.com/design/DAGvgEXgbzk/7iJpvbwI_d9zFYqHiqqh8A/view?utm_content=DAGvgEXgbzk&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hde500ba83b#1', '_blank');
            console.log('📖 PDF Bienvenido Coopcentral abierto en nueva pestaña');
        });
        
        const barraProgreso = this.crearBarraProgreso();
        
        // 🔥 CAMBIO CRÍTICO: Diferentes botones según cómo se abrió la modal
        let botonAccion;
        
        if (this.modalAbiertaPorEstrella) {
            // Si se abrió por una estrella, el botón debe regresar al juego
            botonAccion = this.crearBoton(
                'boton-siguiente-nivel-capacitarse-1',
                'Volver al juego',
                'Continuar Juego'
            );
            
            botonAccion.addEventListener('click', () => {
                console.log('🎮 Regresando al juego desde modal 1 (abierta por estrella)');
                this.cerrarModal(overlay);
                this.modalAbiertaPorEstrella = false; // Resetear bandera
            });
        } else {
            // Si se abrió desde el menú de capacitación, comportamiento normal
            botonAccion = this.crearBoton(
                'boton-siguiente-nivel-capacitarse-1',
                'Continuar al siguiente nivel de capacitación',
                'Siguiente Nivel'
            );
            
            botonAccion.addEventListener('click', () => {
                this.mostrarModalCapacitarse2(overlay);
            });
        }
        
        content.appendChild(imagenEstrellas);
        content.appendChild(imagenManualContainer);
        content.appendChild(barraProgreso.container);
        content.appendChild(botonAccion);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Animar barra de progreso solo si no se abrió por estrella
        if (!this.modalAbiertaPorEstrella) {
            setTimeout(() => {
                barraProgreso.carga.style.width = '16.6%';
            }, 500);
        } else {
            // Si se abrió por estrella, mostrar progreso al 16.6%
            setTimeout(() => {
                barraProgreso.carga.style.width = '16.6%';
            }, 500);
        }
        
        this.modalAbierto = overlay;
        console.log('📖 Modal de capacitación nivel 1 mostrado');
    }

    /** =======================================================================================================================================
    * Muestra el modal de capacitación 2 - CARTILLA DE BIENVENIDA -- Su Guia Coopcentral
    */
    mostrarModalCapacitarse2(overlayAnterior = null) {
        if (overlayAnterior) {
            this.cerrarModal(overlayAnterior);
        }
        
        const overlay = this.crearOverlay();
        const modalContenedorPadre = overlay.querySelector('.modal-contenedor-padre');
        const modal = this.crearElemento('div', 'modal-capacitarse-2');
        const content = this.crearElemento('div', 'modal-contenido-capacitarse-2');
        
        const imagenEstrellas = this.crearElemento('div', 'imagen-estrellas-2');
        
        // Contenedor de información con estrellas y título
        const contenedorInfo = this.crearElemento('div', 'contenedor-info-video');
        
        // Información del video
        const infoVideo = this.crearElemento('div', 'info-video');
        infoVideo.textContent = 'Su Guía Coopcentral';
        
        // Contenedor principal del video
        const contenedorVideo = this.crearElemento('div', 'contenedor-video-local');
        
        // Elemento de video local
        const video = document.createElement('video');
        video.className = 'video-local';
        video.src = 'assets/videos/videos-mundo-1 CARTILLA DE BIENVENIDA -- Su Guia Coopcentral.mp4';
        video.controls = true;
        video.preload = 'metadata';
        video.setAttribute('aria-label', 'Video de CARTILLA DE BIENVENIDA -- Su Guia Coopcentral');
        
        // Configurar control de audio para este video
        this.configurarControlAudioVideo(video);
        
        // Barra de progreso del video
        const barraProgresoVideo = this.crearElemento('div', 'barra-progreso-video');
        const barraProgresoVideoCarga = this.crearElemento('div', 'barra-progreso-video-carga');
        barraProgresoVideo.appendChild(barraProgresoVideoCarga);
        
        // Controles personalizados
        const controlesVideo = this.crearElemento('div', 'controles-video');
        
        const controles = [
            { 
                clase: 'boton-play-video', 
                accion: () => video.play().catch(e => console.error('Error al reproducir:', e)), 
                desc: 'Reproducir video' 
            },
            { 
                clase: 'boton-pausa-video', 
                accion: () => video.pause(), 
                desc: 'Pausar video' 
            },
            { 
                clase: 'boton-reiniciar-video', 
                accion: () => { video.currentTime = 0; video.play(); }, 
                desc: 'Reiniciar video' 
            }
        ];

        controles.forEach(control => {
            const boton = this.crearBoton(`boton-video ${control.clase}`, control.desc, control.desc);
            boton.addEventListener('click', control.accion);
            controlesVideo.appendChild(boton);
        });
        
        // Barra de progreso general
        const barraProgreso = this.crearBarraProgreso();
        
        // 🔥 CAMBIO CRÍTICO: Diferentes botones según cómo se abrió la modal
        let botonAccion;
        
        if (this.modalAbiertaPorEstrella) {
            // Si se abrió por una estrella, el botón debe regresar al juego
            botonAccion = this.crearBoton(
                'boton-navegacion-modal',
                'Volver al juego',
                'Continuar Juego'
            );
            
            botonAccion.addEventListener('click', () => {
                video.pause();
                console.log('🎮 Regresando al juego desde modal 2 (abierta por estrella)');
                this.cerrarModal(overlay);
                this.modalAbiertaPorEstrella = false; // Resetear bandera
            });
        } else {
            // Si se abrió desde el menú de capacitación, comportamiento normal
            botonAccion = this.crearBoton(
                'boton-navegacion-modal',
                'Continuar al siguiente nivel de capacitación',
                'Siguiente Nivel'
            );
            
            botonAccion.addEventListener('click', () => {
                video.pause();
                this.mostrarModalCapacitarse3(overlay);
            });
        }
        
        // Ensamblar componentes
        contenedorInfo.appendChild(infoVideo);
        
        contenedorVideo.appendChild(video);
        
        content.appendChild(imagenEstrellas);
        content.appendChild(contenedorInfo);
        content.appendChild(contenedorVideo);
        content.appendChild(barraProgresoVideo);
        content.appendChild(controlesVideo);
        content.appendChild(barraProgreso.container);
        content.appendChild(botonAccion);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Configurar eventos del video
        this.configurarEventosVideo(video, barraProgresoVideoCarga);
        
        // Animar barras de progreso según cómo se abrió
        if (!this.modalAbiertaPorEstrella) {
            setTimeout(() => {
                barraProgreso.carga.style.width = '33.2%';
            }, 500);
        } else {
            setTimeout(() => {
                barraProgreso.carga.style.width = '33.2%';
            }, 500);
        }
        
        this.modalAbierto = overlay;
        console.log('🎥 Modal de capacitación nivel 2 mostrado');
    }

    /**
     * Configura eventos mejorados para el reproductor de video local
     */
    configurarEventosVideo(videoElement, progressBar) {
        if (!videoElement || !progressBar) return;
        
        const videoContainer = videoElement.parentElement;
        
        // Actualizar barra de progreso durante la reproducción
        videoElement.addEventListener('timeupdate', () => {
            if (videoElement.duration > 0) {
                const progress = (videoElement.currentTime / videoElement.duration) * 100;
                progressBar.style.width = `${progress}%`;
                
                // Actualizar datos de tiempo en la barra
                if (progressBar.parentElement) {
                    const currentTime = this.formatearTiempo(videoElement.currentTime);
                    const totalTime = this.formatearTiempo(videoElement.duration);
                    progressBar.parentElement.setAttribute('data-tiempo-actual', currentTime);
                    progressBar.parentElement.setAttribute('data-tiempo-total', totalTime);
                }
            }
        });
        
        // Manejar estados del video
        videoElement.addEventListener('play', () => {
            videoContainer.classList.add('reproduciendo');
            videoContainer.classList.remove('pausado');
            console.log('▶️ Video reproduciéndose');
        });
        
        videoElement.addEventListener('pause', () => {
            videoContainer.classList.add('pausado');
            videoContainer.classList.remove('reproduciendo');
            console.log('⏸️ Video pausado');
        });
        
        videoElement.addEventListener('ended', () => {
            progressBar.style.width = '100%';
            videoContainer.classList.remove('reproduciendo', 'pausado');
            console.log('✅ Video de capacitación completado');
        });
        
        // Manejar estados de carga
        videoElement.addEventListener('loadstart', () => {
            videoContainer.classList.add('cargando');
        });
        
        videoElement.addEventListener('canplay', () => {
            videoContainer.classList.remove('cargando');
        });
        
        // Manejar errores de carga
        videoElement.addEventListener('error', (e) => {
            console.error('❌ Error al cargar el video:', e);
            videoContainer.classList.remove('cargando');
            this.mostrarErrorVideo(videoElement);
        });
        
        // Actualizar cuando se carga el metadata
        videoElement.addEventListener('loadedmetadata', () => {
            console.log(`📊 Video cargado - Duración: ${this.formatearTiempo(videoElement.duration)}`);
        });
    }

    /**
     * Formatea el tiempo en segundos a formato MM:SS
     */
    formatearTiempo(segundos) {
        if (!segundos || isNaN(segundos)) return '00:00';
        
        const minutos = Math.floor(segundos / 60);
        const segs = Math.floor(segundos % 60);
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }

    /**
     * Maneja errores de carga de video con información detallada
     */
    mostrarErrorVideo(videoElement) {
        const errorMsg = document.querySelector('.mensaje-error-video');
        if (errorMsg) {
            const ruta = videoElement.src.split('/').pop();
            errorMsg.innerHTML = `
                <p><strong>⚠️ Error al cargar el video</strong></p>
                <p>Archivo: <strong>${ruta}</strong></p>
                <p>Verifica que el archivo exista en la carpeta:</p>
                <code>assets/videos/</code>
                <p style="margin-top: 10px; font-size: 14px;">
                    <em>Formatos soportados: MP4, WebM, OGG</em>
                </p>
            `;
            errorMsg.style.display = 'block';
            
            const videoContainer = videoElement.parentElement;
            if (videoContainer) {
                // Insertar antes del video
                videoContainer.parentElement.insertBefore(errorMsg, videoContainer);
            }
        }
    }

    /** =======================================================================================================================================
     * Muestra el modal de capacitación 3 - Guía Coopcentral (Duplicado de modal 1 con modificaciones)
     */
    mostrarModalCapacitarse3(overlayAnterior = null) {
        if (overlayAnterior) {
            this.cerrarModal(overlayAnterior);
        }
        
        const overlay = this.crearOverlay();
        const modalContenedorPadre = overlay.querySelector('.modal-contenedor-padre');
        const modal = this.crearElemento('div', 'modal-capacitarse-3');
        const content = this.crearElemento('div', 'modal-contenido-capacitarse-3');
        
        const imagenEstrellas = this.crearElemento('div', 'imagen-estrellas-3');
        
        // Contenedor de imagen del manual 3 con clase imagen-manual-container_3
        const imagenManualContainer = this.crearElemento('div', 'imagen-manual-container_3');
        imagenManualContainer.setAttribute('aria-label', 'PDF Guía Coopcentral - Haz clic para abrir');
        
        // ENLACE ACTUALIZADO: Usar el enlace proporcionado para la Guía Coopcentral
        imagenManualContainer.addEventListener('click', () => {
            window.open('https://www.canva.com/design/DAGwFSUY9Yw/269w0s0JUxPwwOoCCwN15g/view?utm_content=DAGwFSUY9Yw&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h878768cacc', '_blank');
            console.log('📖 PDF Guía Coopcentral abierto en nueva pestaña');
        });
        
        const barraProgreso = this.crearBarraProgreso();
        
        // 🔥 CAMBIO CRÍTICO: Diferentes botones según cómo se abrió la modal
        let botonAccion;
        
        if (this.modalAbiertaPorEstrella) {
            // Si se abrió por una estrella, el botón debe regresar al juego
            botonAccion = this.crearBoton(
                'boton-siguiente-nivel-capacitarse-3',
                'Volver al juego',
                'Continuar Juego'
            );
            
            botonAccion.addEventListener('click', () => {
                console.log('🎮 Regresando al juego desde modal 3 (abierta por estrella)');
                this.cerrarModal(overlay);
                this.modalAbiertaPorEstrella = false; // Resetear bandera
            });
        } else {
            // Si se abrió desde el menú de capacitación, comportamiento normal
            botonAccion = this.crearBoton(
                'boton-siguiente-nivel-capacitarse-3',
                'Continuar al siguiente nivel de capacitación',
                'Siguiente Nivel'
            );
            
            botonAccion.addEventListener('click', () => {
                this.mostrarModalCapacitarse4(overlay);
            });
        }
        
        content.appendChild(imagenEstrellas);
        content.appendChild(imagenManualContainer);
        content.appendChild(barraProgreso.container);
        content.appendChild(botonAccion);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Actualizar progreso al 49.8% (tercer nivel de 6)
        setTimeout(() => {
            barraProgreso.carga.style.width = '49.8%';
        }, 500);
        
        this.modalAbierto = overlay;
        console.log('📖 Modal de capacitación nivel 3 (PDF Guía Coopcentral) mostrado');
    }

    /** =======================================================================================================================================
     * Muestra el modal de capacitación 4 - Video Capsula 1 Seguridad y Salud en el Trabajo
     */
    mostrarModalCapacitarse4(overlayAnterior = null) {
        if (overlayAnterior) {
            this.cerrarModal(overlayAnterior);
        }
        
        const overlay = this.crearOverlay();
        const modalContenedorPadre = overlay.querySelector('.modal-contenedor-padre');
        const modal = this.crearElemento('div', 'modal-capacitarse-4');
        const content = this.crearElemento('div', 'modal-contenido-capacitarse-4');
        
        const imagenEstrellas = this.crearElemento('div', 'imagen-estrellas-4');
        
        // Contenedor de información con estrellas y título
        const contenedorInfo = this.crearElemento('div', 'contenedor-info-video');
        
        // Información del video - Título actualizado
        const infoVideo = this.crearElemento('div', 'info-video');
        infoVideo.textContent = 'Capsula 1 Seguridad y Salud en el Trabajo';
        
        // Contenedor principal del video
        const contenedorVideo = this.crearElemento('div', 'contenedor-video-local');
        
        // Elemento de video local - RUTA ACTUALIZADA
        const video = document.createElement('video');
        video.className = 'video-local';
        video.src = 'assets/videos/videos-mundo-1 Capsula 1 Seguridad y Salud en el Trabajo.mp4';
        video.controls = true;
        video.preload = 'metadata';
        video.setAttribute('aria-label', 'Video de Capsula 1 Seguridad y Salud en el Trabajo');
        
        // Configurar control de audio para este video
        this.configurarControlAudioVideo(video);
        
        // Barra de progreso del video
        const barraProgresoVideo = this.crearElemento('div', 'barra-progreso-video');
        const barraProgresoVideoCarga = this.crearElemento('div', 'barra-progreso-video-carga');
        barraProgresoVideo.appendChild(barraProgresoVideoCarga);
        
        // Controles personalizados
        const controlesVideo = this.crearElemento('div', 'controles-video');
        
        const controles = [
            { 
                clase: 'boton-play-video', 
                accion: () => video.play().catch(e => console.error('Error al reproducir:', e)), 
                desc: 'Reproducir video' 
            },
            { 
                clase: 'boton-pausa-video', 
                accion: () => video.pause(), 
                desc: 'Pausar video' 
            },
            { 
                clase: 'boton-reiniciar-video', 
                accion: () => { video.currentTime = 0; video.play(); }, 
                desc: 'Reiniciar video' 
            }
        ];

        controles.forEach(control => {
            const boton = this.crearBoton(`boton-video ${control.clase}`, control.desc, control.desc);
            boton.addEventListener('click', control.accion);
            controlesVideo.appendChild(boton);
        });
        
        // Barra de progreso general
        const barraProgreso = this.crearBarraProgreso();
        
        // 🔥 CAMBIO CRÍTICO: Diferentes botones según cómo se abrió la modal
        let botonAccion;
        
        if (this.modalAbiertaPorEstrella) {
            // Si se abrió por una estrella, el botón debe regresar al juego
            botonAccion = this.crearBoton(
                'boton-navegacion-modal',
                'Volver al juego',
                'Continuar Juego'
            );
            
            botonAccion.addEventListener('click', () => {
                video.pause();
                console.log('🎮 Regresando al juego desde modal 4 (abierta por estrella)');
                this.cerrarModal(overlay);
                this.modalAbiertaPorEstrella = false; // Resetear bandera
            });
        } else {
            // Si se abrió desde el menú de capacitación, comportamiento normal
            botonAccion = this.crearBoton(
                'boton-navegacion-modal',
                'Continuar al siguiente nivel de capacitación',
                'Siguiente Nivel'
            );
            
            botonAccion.addEventListener('click', () => {
                video.pause();
                this.mostrarModalCapacitarse5(overlay);
            });
        }
        
        // Ensamblar componentes
        contenedorInfo.appendChild(infoVideo);
        
        contenedorVideo.appendChild(video);
        
        content.appendChild(imagenEstrellas);
        content.appendChild(contenedorInfo);
        content.appendChild(contenedorVideo);
        content.appendChild(barraProgresoVideo);
        content.appendChild(controlesVideo);
        content.appendChild(barraProgreso.container);
        content.appendChild(botonAccion);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Configurar eventos del video
        this.configurarEventosVideo(video, barraProgresoVideoCarga);
        
        // Animar barra de progreso general al 66.4% (cuarto nivel de 6)
        setTimeout(() => {
            barraProgreso.carga.style.width = '66.4%';
        }, 500);
        
        this.modalAbierto = overlay;
        console.log('🎥 Modal de capacitación nivel 4 (Capsula 1 Seguridad y Salud) mostrado');
    }

    /** =======================================================================================================================================
     * Muestra el modal de capacitación 5 - Video Capsula 2 Seguridad y Salud en el Trabajo
     */
    mostrarModalCapacitarse5(overlayAnterior = null) {
        if (overlayAnterior) {
            this.cerrarModal(overlayAnterior);
        }
        
        const overlay = this.crearOverlay();
        const modalContenedorPadre = overlay.querySelector('.modal-contenedor-padre');
        const modal = this.crearElemento('div', 'modal-capacitarse-5');
        const content = this.crearElemento('div', 'modal-contenido-capacitarse-5');
        
        const imagenEstrellas = this.crearElemento('div', 'imagen-estrellas-5');
        
        // Contenedor de información con estrellas y título
        const contenedorInfo = this.crearElemento('div', 'contenedor-info-video');
        
        // Información del video - Título actualizado
        const infoVideo = this.crearElemento('div', 'info-video');
        infoVideo.textContent = 'Capsula 2 Seguridad y Salud en el Trabajo';
        
        // Contenedor principal del video
        const contenedorVideo = this.crearElemento('div', 'contenedor-video-local');
        
        // Elemento de video local - RUTA ACTUALIZADA
        const video = document.createElement('video');
        video.className = 'video-local';
        video.src = 'assets/videos/videos-mundo-1 Capsula 2 Seguridad y Salud en el Trabajo.mp4';
        video.controls = true;
        video.preload = 'metadata';
        video.setAttribute('aria-label', 'Video de Capsula 2 Seguridad y Salud en el Trabajo');
        
        // Configurar control de audio para este video
        this.configurarControlAudioVideo(video);
        
        // Barra de progreso del video
        const barraProgresoVideo = this.crearElemento('div', 'barra-progreso-video');
        const barraProgresoVideoCarga = this.crearElemento('div', 'barra-progreso-video-carga');
        barraProgresoVideo.appendChild(barraProgresoVideoCarga);
        
        // Controles personalizados
        const controlesVideo = this.crearElemento('div', 'controles-video');
        
        const controles = [
            { 
                clase: 'boton-play-video', 
                accion: () => video.play().catch(e => console.error('Error al reproducir:', e)), 
                desc: 'Reproducir video' 
            },
            { 
                clase: 'boton-pausa-video', 
                accion: () => video.pause(), 
                desc: 'Pausar video' 
            },
            { 
                clase: 'boton-reiniciar-video', 
                accion: () => { video.currentTime = 0; video.play(); }, 
                desc: 'Reiniciar video' 
            }
        ];

        controles.forEach(control => {
            const boton = this.crearBoton(`boton-video ${control.clase}`, control.desc, control.desc);
            boton.addEventListener('click', control.accion);
            controlesVideo.appendChild(boton);
        });
        
        // Barra de progreso general
        const barraProgreso = this.crearBarraProgreso();
        
        // 🔥 CAMBIO CRÍTICO: Diferentes botones según cómo se abrió la modal
        let botonAccion;
        
        if (this.modalAbiertaPorEstrella) {
            // Si se abrió por una estrella, el botón debe regresar al juego
            botonAccion = this.crearBoton(
                'boton-navegacion-modal',
                'Volver al juego',
                'Continuar Juego'
            );
            
            botonAccion.addEventListener('click', () => {
                video.pause();
                console.log('🎮 Regresando al juego desde modal 5 (abierta por estrella)');
                this.cerrarModal(overlay);
                this.modalAbiertaPorEstrella = false; // Resetear bandera
            });
        } else {
            // Si se abrió desde el menú de capacitación, comportamiento normal
            botonAccion = this.crearBoton(
                'boton-navegacion-modal',
                'Continuar al siguiente nivel de capacitación',
                'Siguiente Nivel'
            );
            
            botonAccion.addEventListener('click', () => {
                video.pause();
                this.mostrarModalCapacitarse6(overlay);
            });
        }
        
        // Ensamblar componentes
        contenedorInfo.appendChild(infoVideo);
        
        contenedorVideo.appendChild(video);
        
        content.appendChild(imagenEstrellas);
        content.appendChild(contenedorInfo);
        content.appendChild(contenedorVideo);
        content.appendChild(barraProgresoVideo);
        content.appendChild(controlesVideo);
        content.appendChild(barraProgreso.container);
        content.appendChild(botonAccion);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Configurar eventos del video
        this.configurarEventosVideo(video, barraProgresoVideoCarga);
        
        // Animar barra de progreso general al 83% (quinto nivel de 6)
        setTimeout(() => {
            barraProgreso.carga.style.width = '83%';
        }, 500);
        
        this.modalAbierto = overlay;
        console.log('🎥 Modal de capacitación nivel 5 (Capsula 2 Seguridad y Salud) mostrado');
    }

    /** =======================================================================================================================================
     * Muestra el modal de capacitación 6 - Final
     */
    mostrarModalCapacitarse6(overlayAnterior = null) {
        if (overlayAnterior) {
            this.cerrarModal(overlayAnterior);
        }
        
        const overlay = this.crearOverlay();
        const modalContenedorPadre = overlay.querySelector('.modal-contenedor-padre');
        const modal = this.crearElemento('div', 'modal-capacitarse-6');
        const content = this.crearElemento('div', 'modal-contenido-capacitarse-6');
        
        const imagenEstrellas = this.crearElemento('div', 'imagen-estrellas-6');
        const barraProgreso = this.crearBarraProgreso();
        
        const botonSiguienteMundo = this.crearBoton(
            'boton-siguiente-mundo-6',
            'Continuar al siguiente mundo del juego',
            'Siguiente Mundo'
        );
        
        content.appendChild(imagenEstrellas);
        content.appendChild(barraProgreso.container);
        content.appendChild(botonSiguienteMundo);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            barraProgreso.carga.style.width = '100%';
        }, 500);
        
        botonSiguienteMundo.addEventListener('click', () => {
            this.completarMundo1();
        });
        
        this.modalAbierto = overlay;
        console.log('🏆 Modal de capacitación nivel 6 (Final) mostrado');
    }

    // ==========================================================================================
    // CONTROL DE AUDIO PARA VIDEOS/PODCASTS - NUEVOS MÉTODOS
    // ==========================================================================================

    /**
     * Configura el control de audio para elementos de video
     */
    configurarControlAudioVideo(videoElement) {
        if (!videoElement || !window.audioManager) {
            console.warn('⚠️ No se puede configurar control de audio: videoElement o audioManager no disponible');
            return;
        }
        
        // Reducir volumen cuando el video comience a reproducirse
        videoElement.addEventListener('play', () => {
            if (window.audioManager && !window.audioManager.estaEnVideo) {
                window.audioManager.reducirVolumenParaVideo();
                console.log('🔈 Volumen reducido al 40% para reproducción de video');
            }
        });
        
        // Restaurar volumen cuando el video se pause
        videoElement.addEventListener('pause', () => {
            if (window.audioManager && window.audioManager.estaEnVideo) {
                window.audioManager.restaurarVolumenNormal();
                console.log('🔊 Volumen restaurado al 100% después de pausar video');
            }
        });
        
        // Restaurar volumen cuando el video termine
        videoElement.addEventListener('ended', () => {
            if (window.audioManager && window.audioManager.estaEnVideo) {
                window.audioManager.restaurarVolumenNormal();
                console.log('🔊 Volumen restaurado al 100% después de finalizar video');
            }
        });
        
        // Restaurar volumen si hay error en el video
        videoElement.addEventListener('error', () => {
            if (window.audioManager && window.audioManager.estaEnVideo) {
                window.audioManager.restaurarVolumenNormal();
                console.log('⚠️ Error en video - Volumen restaurado al 100%');
            }
        });
        
        // También restaurar si el usuario abandona el modal
        videoElement.addEventListener('abort', () => {
            if (window.audioManager && window.audioManager.estaEnVideo) {
                window.audioManager.restaurarVolumenNormal();
                console.log('🔊 Volumen restaurado al 100% (abort)');
            }
        });
        
        console.log('🎵 Control de audio configurado para el video');
    }

    /**
     * Reducir volumen para modal de video (método manual)
     */
    reducirVolumenParaModalVideo() {
        if (window.audioManager) {
            window.audioManager.reducirVolumenParaVideo();
            console.log('🔈 Volumen manualmente reducido al 40%');
        }
    }

    /**
     * Restaurar volumen después de modal de video (método manual)
     */
    restaurarVolumenDespuesDeModalVideo() {
        if (window.audioManager) {
            window.audioManager.restaurarVolumenNormal();
            console.log('🔊 Volumen manualmente restaurado al 100%');
        }
    }

    // ==========================================================================================
    // MÉTODOS DE UTILIDAD - COMPLETOS
    // ==========================================================================================

    crearElemento(tag, className) {
        const element = document.createElement(tag);
        element.className = className;
        return element;
    }

    crearBoton(className, ariaLabel, texto) {
        const boton = this.crearElemento('button', className);
        boton.setAttribute('aria-label', ariaLabel);
        boton.setAttribute('title', texto || ariaLabel);
        return boton;
    }

    crearOverlay() {
        const overlay = this.crearElemento('div', 'modal-overlay-juego');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.cerrarModal(overlay);
            }
        });
        
        // Agregar contenedor padre por defecto
        const contenedorPadre = this.crearElemento('div', 'modal-contenedor-padre');
        overlay.appendChild(contenedorPadre);
        
        return overlay;
    }

    crearBarraProgreso() {
        const container = this.crearElemento('div', 'barra-progreso-container');
        const fondo = this.crearElemento('div', 'barra-progreso-fondo');
        const carga = this.crearElemento('div', 'barra-progreso-carga');
        
        fondo.appendChild(carga);
        container.appendChild(fondo);
        
        return { container, carga };
    }

    cerrarModal(modal) {
        if (modal && modal.parentNode) {
            // Si se cierra un modal de video, restaurar volumen
            const video = modal.querySelector('video');
            if (video && window.audioManager && window.audioManager.estaEnVideo) {
                window.audioManager.restaurarVolumenNormal();
                console.log('🔊 Volumen restaurado al 100% al cerrar modal de video');
            }
            
            document.body.removeChild(modal);
            this.modalAbierto = null;
            
            // 🔥 IMPORTANTE: Resetear la bandera cuando se cierra cualquier modal
            this.modalAbiertaPorEstrella = false;
            
            console.log('🔒 Modal cerrado');
        }
    }

    cerrarModalActual() {
        if (this.modalAbierto) {
            this.cerrarModal(this.modalAbierto);
        }
    }

    mostrarErrorInicializacion() {
        console.error('💥 Error crítico en la inicialización del juego');
        // Podrías mostrar un modal de error aquí
    }

    pausarMedios() {
        // Pausar todos los videos si es necesario
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
            }
        });
        
        // Pausar audio de fondo si está reproduciéndose
        if (window.audioManager && window.audioManager.estaReproduciendo) {
            window.audioManager.pausar();
        }
    }

    destruir() {
        this.cerrarModalActual();
        this.pausarMedios();
        
        // Restaurar volumen antes de destruir
        if (window.audioManager && window.audioManager.estaEnVideo) {
            window.audioManager.restaurarVolumenNormal();
        }
        
        this.audioPlayer = null;
        this.videoIframe = null;
        this.inicializado = false;
        
        console.log('🧹 Recursos del Mundo Juego 1 liberados');
    }

    /**
     * Función de debug para verificar la posición de la estrella en sección 1
     */
    debugEstrellaSeccion1() {
        console.log('🔍 === DEBUG ESTRELLA_DOCUMENTO-1 SECCIÓN 1 ===');
        console.log(`📍 Sección actual: ${this.seccionActual}`);
        console.log(`⭐ Estrella activa: ${this.configEstrella?.activo}`);
        console.log(`⭐ Estrella recogida: ${this.configEstrella?.recogida}`);
        
        const estrellaElement = document.getElementById('Estrella_Documento-1');
        if (estrellaElement) {
            const estilo = window.getComputedStyle(estrellaElement);
            console.log(`🎨 CSS Estrella_Documento-1:`);
            console.log(`   - left: ${estilo.left} (CSS: 75%)`);
            console.log(`   - top: ${estilo.top} (CSS: 10%)`);
            console.log(`   - opacity: ${estilo.opacity}`);
            console.log(`   - display: ${estilo.display}`);
            console.log(`   - width: ${estilo.width}, height: ${estilo.height}`);
            
            // Calcular posición real en porcentaje
            const leftPx = parseFloat(estilo.left) || 0;
            const topPx = parseFloat(estilo.top) || 0;
            const leftPorcentaje = (leftPx / window.innerWidth) * 100;
            const topPorcentaje = (topPx / window.innerHeight) * 100;
            console.log(`   - left (≈%): ${leftPorcentaje.toFixed(1)}%`);
            console.log(`   - top (≈%): ${topPorcentaje.toFixed(1)}%`);
        } else {
            console.error('❌ Elemento Estrella_Documento-1 no encontrado');
        }
        console.log('🔚 === FIN DEBUG ===');
    }
}

// ==========================================================================================
// INICIALIZACIÓN
// ==========================================================================================

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Esperar a que el AudioManager se cargue si no está disponible
        if (!window.audioManager) {
            console.log('⏳ Esperando AudioManager...');
            
            // Crear un intento de espera para el AudioManager
            const esperarAudioManager = setInterval(() => {
                if (window.audioManager) {
                    clearInterval(esperarAudioManager);
                    inicializarJuego();
                }
            }, 100);
            
            // Timeout por si el AudioManager nunca se carga
            setTimeout(() => {
                if (!window.audioManager) {
                    console.warn('⚠️ AudioManager no se cargó, inicializando juego sin audio');
                    inicializarJuego();
                }
            }, 3000);
        } else {
            inicializarJuego();
        }
        
        function inicializarJuego() {
            window.mundoJuego1 = new MundoJuego1();
            console.log('🚀 Mundo Juego 1 cargado exitosamente con todas las modificaciones');
        }
        
        window.addEventListener('beforeunload', function() {
            if (window.mundoJuego1) {
                window.mundoJuego1.destruir();
            }
        });

    } catch (error) {
        console.error('💥 Error fatal al cargar Mundo Juego 1:', error);
    }
});

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('🚨 Error global en Mundo Juego 1:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Promesa rechazada en Mundo Juego 1:', e.reason);
});

// ==========================================================================================
// HERRAMIENTAS DE DEBUG - Para usar en consola del navegador
// ==========================================================================================

/**
 * Muestra información detallada de posiciones
 */
window.debugPosiciones = function() {
    if (!window.mundoJuego1) {
        console.error('❌ MundoJuego1 no está inicializado');
        return;
    }
    
    console.log('🔍 === DEBUG DE POSICIONES ===');
    
    // Posiciones configuradas en JS
    console.log('📍 CONFIGURACIÓN JS:');
    if (window.mundoJuego1.configHueco) {
        console.log(`  Hueco: ${window.mundoJuego1.configHueco.inicio}% - ${window.mundoJuego1.configHueco.fin}%`);
    }
    
    if (window.mundoJuego1.configObstaculos) {
        window.mundoJuego1.configObstaculos.obstaculos.forEach((obs, i) => {
            console.log(`  Obstáculo ${i+1}: ${obs.posicion.inicio}% - ${obs.posicion.fin}%`);
        });
    }
    
    // Posiciones reales en CSS
    console.log('🎨 POSICIONES CSS REALES:');
    
    const elementos = [
        { id: 'hueco-peligro', nombre: 'Hueco' },
        { id: 'obstaculo-1', nombre: 'Obstáculo 1' },
        { id: 'obstaculo-2', nombre: 'Obstáculo 2' },
        { id: 'Estrella_Documento-1', nombre: 'Estrella_Documento-1' },
        { id: 'Estrella_Video-1', nombre: 'Estrella_Video-1' },
        { id: 'Estrella_Documento-2', nombre: 'Estrella_Documento-2' },
        { id: 'Estrella_Video-2', nombre: 'Estrella_Video-2' },
        { id: 'Estrella_Video-3', nombre: 'Estrella_Video-3' }
    ];
    
    elementos.forEach(elem => {
        const elemento = document.getElementById(elem.id) || document.querySelector(`.${elem.id}`);
        if (elemento) {
            const estilo = window.getComputedStyle(elemento);
            console.log(`  ${elem.nombre}:`);
            console.log(`    - left: ${estilo.left}, top: ${estilo.top}`);
            console.log(`    - width: ${estilo.width}, height: ${estilo.height}`);
            console.log(`    - display: ${estilo.display}, opacity: ${estilo.opacity}`);
            
            // Calcular porcentaje aproximado
            if (estilo.left && estilo.left.endsWith('px')) {
                const px = parseFloat(estilo.left);
                const porcentaje = (px / window.innerWidth) * 100;
                console.log(`    - left (≈%): ${porcentaje.toFixed(1)}%`);
            }
            if (estilo.top && estilo.top.endsWith('px')) {
                const px = parseFloat(estilo.top);
                const porcentaje = (px / window.innerHeight) * 100;
                console.log(`    - top (≈%): ${porcentaje.toFixed(1)}%`);
            }
        } else {
            console.log(`  ${elem.nombre}: NO ENCONTRADO`);
        }
    });
    
    console.log('📏 Tamaño ventana:', window.innerWidth, 'x', window.innerHeight);
    console.log('🔚 === FIN DEBUG ===');
};

/**
 * Forzar sincronización de posiciones
 */
window.sincronizarPosiciones = function() {
    if (window.mundoJuego1 && window.mundoJuego1.reiniciarPosicionesElementos) {
        window.mundoJuego1.reiniciarPosicionesElementos();
        console.log('✅ Posiciones sincronizadas manualmente');
    } else {
        console.error('❌ No se puede sincronizar - Juego no inicializado');
    }
};

/**
 * Verificar colisiones en tiempo real
 */
window.debugColisiones = function() {
    if (!window.mundoJuego1 || !window.mundoJuego1.configMovimiento) return;
    
    const posX = window.mundoJuego1.configMovimiento.posicion.x;
    const posY = window.mundoJuego1.configMovimiento.posicion.y;
    const posXPorcentaje = (posX / window.innerWidth) * 100;
    const posYPorcentaje = (posY / window.innerHeight) * 100;
    
    console.log('🎯 DEBUG COLISIONES:');
    console.log(`  Posición X: ${posX}px (${posXPorcentaje.toFixed(1)}%)`);
    console.log(`  Posición Y: ${posY}px (${posYPorcentaje.toFixed(1)}%)`);
    console.log(`  Saltando: ${window.mundoJuego1.configMovimiento.saltando}`);
    
    // Verificar hueco
    if (window.mundoJuego1.configHueco) {
        const enHueco = posXPorcentaje >= window.mundoJuego1.configHueco.inicio && 
                       posXPorcentaje <= window.mundoJuego1.configHueco.fin;
        console.log(`  En hueco (${window.mundoJuego1.configHueco.inicio}-${window.mundoJuego1.configHueco.fin}%): ${enHueco}`);
    }
    
    // Verificar obstáculos
    if (window.mundoJuego1.configObstaculos) {
        window.mundoJuego1.configObstaculos.obstaculos.forEach((obs, i) => {
            const enObs = posXPorcentaje >= obs.posicion.inicio && 
                         posXPorcentaje <= obs.posicion.fin;
            console.log(`  Obstáculo ${i+1} (${obs.posicion.inicio}-${obs.posicion.fin}%): ${enObs}`);
        });
    }
    
    // Verificar estrellas
    if (window.mundoJuego1.estrellasConfig) {
        Object.keys(window.mundoJuego1.estrellasConfig).forEach(estrellaId => {
            const config = window.mundoJuego1.estrellasConfig[estrellaId];
            console.log(`  ${estrellaId}: activa=${config.activo}, recogida=${config.recogida}`);
        });
    }
};

/**
 * Función de debug específica para la estrella en sección 1
 */
window.debugEstrella = function() {
    if (window.mundoJuego1 && window.mundoJuego1.debugEstrellaSeccion1) {
        window.mundoJuego1.debugEstrellaSeccion1();
    } else {
        console.error('❌ Juego no inicializado o función no disponible');
    }
};

/**
 * Forzar recolección de estrella (para testing)
 */
window.forzarRecoleccionEstrella = function() {
    if (window.mundoJuego1 && window.mundoJuego1.tocarEstrella) {
        window.mundoJuego1.tocarEstrella('Estrella_Documento-1');
        console.log('🔧 Recolección de estrella forzada manualmente');
    } else {
        console.error('❌ Juego no inicializado o función no disponible');
    }
};

/**
 * Verificar si la estrella está activa en la sección 1
 */
window.verificarEstrellaActiva = function() {
    if (window.mundoJuego1) {
        console.log('🔍 === VERIFICACIÓN ESTRELLA_DOCUMENTO-1 SECCIÓN 1 ===');
        console.log(`Sección actual: ${window.mundoJuego1.seccionActual}`);
        console.log(`Estrella activa: ${window.mundoJuego1.estrellasConfig?.['Estrella_Documento-1']?.activo}`);
        console.log(`Estrella recogida: ${window.mundoJuego1.estrellasConfig?.['Estrella_Documento-1']?.recogida}`);
        
        const estrellaElement = document.getElementById('Estrella_Documento-1');
        if (estrellaElement) {
            console.log(`Elemento visible: ${estrellaElement.offsetParent !== null}`);
            console.log(`Opacidad CSS: ${window.getComputedStyle(estrellaElement).opacity}`);
            console.log(`Display CSS: ${window.getComputedStyle(estrellaElement).display}`);
            console.log(`Clase CSS: ${estrellaElement.className}`);
            
            // Verificar si está en la sección activa correcta
            const seccion1 = document.querySelector('.seccion-1');
            if (seccion1) {
                console.log(`Sección 1 activa: ${seccion1.classList.contains('activa')}`);
                console.log(`Estrella en sección 1: ${seccion1.contains(estrellaElement)}`);
            }
        } else {
            console.error('❌ Elemento Estrella_Documento-1 no encontrado en el DOM');
        }
        console.log('🔚 === FIN VERIFICACIÓN ===');
    }
};

/**
 * Activar modo debug de colisiones en tiempo real
 */
window.modoDebugColisiones = false;
window.toggleDebugColisiones = function() {
    window.modoDebugColisiones = !window.modoDebugColisiones;
    console.log(`🔧 Modo debug colisiones: ${window.modoDebugColisiones ? 'ACTIVADO' : 'DESACTIVADO'}`);
    
    if (window.modoDebugColisiones) {
        // Crear intervalo para mostrar colisiones en tiempo real
        window.debugInterval = setInterval(() => {
            if (window.mundoJuego1) {
                const posX = window.mundoJuego1.configMovimiento.posicion.x;
                const posY = window.mundoJuego1.configMovimiento.posicion.y;
                const posXPorcentaje = (posX / window.innerWidth) * 100;
                const posYPorcentaje = (posY / window.innerHeight) * 100;
                
                console.log(`🎯 LIVE: X=${posXPorcentaje.toFixed(1)}%, Y=${posYPorcentaje.toFixed(1)}%, Saltando=${window.mundoJuego1.configMovimiento.saltando}`);
            }
        }, 500);
    } else {
        clearInterval(window.debugInterval);
    }
};

/**
 * Verificar estado de todas las estrellas (para testing)
 */
window.debugEstrellas = function() {
    if (window.mundoJuego1 && window.mundoJuego1.estrellasConfig) {
        console.log('🔍 === DEBUG TODAS LAS ESTRELLAS ===');
        Object.keys(window.mundoJuego1.estrellasConfig).forEach(estrellaId => {
            const config = window.mundoJuego1.estrellasConfig[estrellaId];
            console.log(`${estrellaId}:`);
            console.log(`  - Activa: ${config.activo}`);
            console.log(`  - Recogida: ${config.recogida}`);
            console.log(`  - Modal objetivo: ${config.modalObjetivo}`);
            
            const elemento = document.getElementById(estrellaId);
            if (elemento) {
                const estilo = window.getComputedStyle(elemento);
                console.log(`  - Visible: ${estilo.opacity === '1'}`);
                console.log(`  - Display: ${estilo.display}`);
            }
        });
        console.log(`🎯 Sección actual: ${window.mundoJuego1.seccionActual}`);
        console.log(`🎯 Modal abierta por estrella: ${window.mundoJuego1.modalAbiertaPorEstrella}`);
        console.log('🔚 === FIN DEBUG ===');
    } else {
        console.error('❌ Juego no inicializado o sistema de estrellas no disponible');
    }
};

/**
 * Verifica la sincronización completa CSS-JS
 */
window.verificarSincronizacionCompleta = function() {
    if (!window.mundoJuego1) {
        console.error('❌ MundoJuego1 no está inicializado');
        return;
    }
    
    console.log('🔍 === VERIFICACIÓN COMPLETA CSS-JS ===');
    
    // Verificar todos los elementos del juego
    const elementos = [
        // Sección 1
        { id: 'hueco-peligro', nombre: 'Hueco peligro', seccion: 1 },
        { id: 'Estrella_Documento-1', nombre: 'Estrella Documento 1', seccion: 1 },
        
        // Sección 2
        { id: 'obstaculo-sec2-1', nombre: 'Obstáculo Sección 2-1', seccion: 2 },
        { id: 'obstaculo-sec2-2', nombre: 'Obstáculo Sección 2-2', seccion: 2 },
        { id: 'Estrella_Video-1', nombre: 'Estrella Video 1', seccion: 2 },
        
        // Sección 3
        { id: 'escalera-sec3', nombre: 'Escalera Sección 3', seccion: 3 },
        { id: 'plataforma-sec3', nombre: 'Plataforma Sección 3', seccion: 3 },
        { id: 'obstaculo-sec3-1', nombre: 'Obstáculo Sección 3-1', seccion: 3 },
        { id: 'Estrella_Documento-2', nombre: 'Estrella Documento 2', seccion: 3 },
        { id: 'Estrella_Video-2', nombre: 'Estrella Video 2', seccion: 3 },
        
        // Sección 4
        { id: 'obstaculo-sec4-1', nombre: 'Obstáculo Sección 4-1', seccion: 4 },
        { id: 'obstaculo-sec4-2', nombre: 'Obstáculo Sección 4-2', seccion: 4 },
        { id: 'Estrella_Video-3', nombre: 'Estrella Video 3', seccion: 4 },
        { id: 'meta', nombre: 'Meta final', seccion: 4 }
    ];
    
    // Verificar cada elemento
    elementos.forEach(elem => {
        const elemento = document.getElementById(elem.id);
        if (elemento) {
            const estilo = window.getComputedStyle(elemento);
            const visible = estilo.opacity !== '0' && estilo.display !== 'none';
            const enSeccionCorrecta = window.mundoJuego1.seccionActual === elem.seccion;
            
            console.log(`✅ ${elem.nombre}:`);
            console.log(`   - Visible: ${visible}`);
            console.log(`   - Sección actual: ${enSeccionCorrecta ? '✔' : '✘'}`);
            console.log(`   - CSS: left ${estilo.left}, top ${estilo.top}`);
            console.log(`   - Dimensiones: ${estilo.width} x ${estilo.height}`);
            
            // Verificar si está en la sección correcta del DOM
            const seccionPadre = elemento.closest(`.seccion-${elem.seccion}`);
            console.log(`   - En sección ${elem.seccion}: ${seccionPadre ? '✔' : '✘'}`);
        } else {
            console.error(`❌ ${elem.nombre}: NO ENCONTRADO EN DOM`);
        }
    });
    
    // Verificar configuraciones JS
    console.log('⚙️ CONFIGURACIONES JS:');
    console.log(`   - Sección actual: ${window.mundoJuego1.seccionActual}`);
    console.log(`   - Total obstáculos configurados: ${window.mundoJuego1.configObstaculos?.obstaculos?.length || 0}`);
    console.log(`   - Total estrellas configuradas: ${Object.keys(window.mundoJuego1.estrellasConfig || {}).length}`);
    
    console.log('🔚 === FIN VERIFICACIÓN ===');
};

/**
 * Comandos de depuración para la consola del navegador
 */

// Forzar mostrar todos los elementos (para testing)
window.mostrarTodosElementos = function() {
    document.querySelectorAll('.seccion-mundo').forEach(seccion => {
        seccion.classList.add('activa');
    });
    console.log('🔧 Todos los elementos mostrados (modo testing)');
};

// Ocultar todos los elementos excepto sección actual
window.ocultarElementosNoActuales = function() {
    document.querySelectorAll('.seccion-mundo').forEach(seccion => {
        const numSeccion = Array.from(seccion.classList)
            .find(c => c.startsWith('seccion-'))
            ?.replace('seccion-', '');
        
        if (parseInt(numSeccion) !== window.mundoJuego1.seccionActual) {
            seccion.classList.remove('activa');
        }
    });
    console.log('🔧 Solo sección actual visible');
};

// Verificar colisiones en tiempo real
window.monitorColisiones = function() {
    const intervalo = setInterval(() => {
        if (window.mundoJuego1) {
            const posX = window.mundoJuego1.configMovimiento.posicion.x;
            const posY = window.mundoJuego1.configMovimiento.posicion.y;
            const posXPorcentaje = (posX / window.innerWidth) * 100;
            
            console.log(`🎯 LIVE: X=${posX}px (${posXPorcentaje.toFixed(1)}%), Y=${posY}px, Sección=${window.mundoJuego1.seccionActual}`);
        }
    }, 100);
    
    console.log('🔍 Monitor de colisiones activado. Usa clearInterval(intervalo) para detener.');
    return intervalo;
};