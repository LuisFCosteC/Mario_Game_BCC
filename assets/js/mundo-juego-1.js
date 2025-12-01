// assets/js/mundo-juego-1.js - VERSIÓN COMPLETA CON AUDIO MANAGER

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
        this.configEstrella = null;
        
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
     * Configura elementos específicos de la sección actual
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
        
        // Configurar estado de obstáculos
        if (this.seccionActual === 2 && this.configObstaculos) {
            this.configObstaculos.activo = true;
            console.log('🚧 Obstáculos activados en sección 2');
        } else if (this.configObstaculos) {
            this.configObstaculos.activo = false;
            console.log('🚧 Obstáculos desactivados');
        }
        
        // Configurar estado de la estrella
        if (this.seccionActual === 2 && this.configEstrella) {
            this.configEstrella.activo = true;
            this.reiniciarEstrella(); // Reiniciar estado al cambiar a sección 2
            console.log('⭐ Estrella activada en sección 2');
        } else if (this.configEstrella) {
            this.configEstrella.activo = false;
            console.log('⭐ Estrella desactivada');
        }
        
        // Configuraciones específicas por sección
        switch(this.seccionActual) {
            case 1:
                console.log('🎯 Sección 1: Hueco activo');
                break;
            case 2:
                console.log('🎯 Sección 2: Obstáculos y estrella activos');
                break;
            case 3:
                console.log('🎯 Sección 3: Sin elementos especiales');
                break;
            case 4:
                console.log('🎯 Sección 4: Meta final activa');
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
            velocidad: 8, 
            velocidadSalto: 15,
            gravedad: 0.8,
            enSuelo: true,
            saltando: false,
            velocidadY: 0,
            posicion: {
                x: 10,
                y: 0
            },
            limites: {
                izquierda: 0,
                derecha: window.innerWidth - 150,
                piso: 38,
                // UMBRAL MÁS SENSIBLE: 90% del ancho de la pantalla
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
     * Inicializa la detección de obstáculos
     */
    inicializarDeteccionObstaculos() {
        console.log('🚧 Inicializando detección de obstáculos...');
        
        this.configObstaculos = {
            activo: this.seccionActual === 2, // Solo activo en sección 2
            obstaculos: [
                { id: 'obstaculo-1', posicion: { inicio: 28, fin: 32 } }, // 28% a 32%
                { id: 'obstaculo-2', posicion: { inicio: 58, fin: 62 } }  // 58% a 62%
            ]
        };
        
        console.log('📍 Obstáculos configurados:', this.configObstaculos.obstaculos);
    }

    /**
     * Inicializa la detección de la estrella
     */
    inicializarDeteccionEstrella() {
        console.log('⭐ Inicializando detección de estrella...');
        
        this.configEstrella = {
            activo: this.seccionActual === 2, // Solo activo en sección 2
            posicion: { 
                x: { inicio: 43, fin: 47 }, // 43% a 47%
                y: { inicio: 30, fin: 40 }  // 30% a 40% (más arriba para requerir salto)
            },
            recogida: false
        };
        
        console.log('📍 Estrella configurada en posición:', this.configEstrella.posicion);
    }

    /**
     * Verifica colisión con obstáculos
     */
    verificarObstaculos() {
        // Solo verificar en sección 2 y si no hay colisión en curso
        if (!this.configObstaculos || !this.configObstaculos.activo || 
            this.seccionActual !== 2 || this.colisionando) {
            return;
        }
        
        const posXPorcentaje = (this.configMovimiento.posicion.x / window.innerWidth) * 100;
        
        // Verificar colisión con cada obstáculo
        this.configObstaculos.obstaculos.forEach(obstaculo => {
            if (posXPorcentaje >= obstaculo.posicion.inicio && 
                posXPorcentaje <= obstaculo.posicion.fin && 
                this.configMovimiento.enSuelo) {
                
                console.log(`💥 Colisión con ${obstaculo.id}!`);
                this.iniciarColisionObstaculo(obstaculo.id);
            }
        });
    }

    /**
     * Verifica si el personaje puede recoger la estrella
     */
    verificarEstrella() {
        // Solo verificar en sección 2, si no ha sido recogida y si está activa
        if (!this.configEstrella || !this.configEstrella.activo || 
            this.seccionActual !== 2 || this.configEstrella.recogida) {
            return;
        }
        
        const posXPorcentaje = (this.configMovimiento.posicion.x / window.innerWidth) * 100;
        const posYPorcentaje = (this.configMovimiento.posicion.y / window.innerHeight) * 100;
        
        // Verificar colisión con la estrella (solo cuando está saltando)
        if (this.configMovimiento.saltando && 
            posXPorcentaje >= this.configEstrella.posicion.x.inicio && 
            posXPorcentaje <= this.configEstrella.posicion.x.fin &&
            posYPorcentaje >= this.configEstrella.posicion.y.inicio && 
            posYPorcentaje <= this.configEstrella.posicion.y.fin) {
            
            console.log('⭐ ¡Has recogido la estrella!');
            this.recogerEstrella();
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
     * Maneja la recolección de la estrella
     */
    recogerEstrella() {
        this.configEstrella.recogida = true;
        
        // Aplicar animación de recolección al personaje
        this.personaje.classList.add('recogiendo-estrella');
        
        // Ocultar la estrella visualmente
        const estrella = document.getElementById('Estrella_Documento');
        if (estrella) {
            estrella.style.opacity = '0';
            estrella.style.pointerEvents = 'none';
        }
        
        // Mostrar mensaje de éxito
        this.mostrarMensajeEstrella();
        
        // Reproducir sonido de estrella
        this.reproducirSonidoEstrella();
        
        // Después de la animación, mostrar el modal 1
        setTimeout(() => {
            this.personaje.classList.remove('recogiendo-estrella');
            this.mostrarModalCapacitarse1();
            console.log('📖 Modal 1 activado por recolección de estrella');
        }, 600);
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
     * Muestra mensaje de recolección de estrella
     */
    mostrarMensajeEstrella() {
        const mensaje = document.querySelector('.mensaje-caida');
        if (mensaje) {
            mensaje.textContent = '⭐ ¡Encontraste un documento importante!';
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
            
            console.log('⭐ Mensaje de estrella mostrado');
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
     * Reinicia el personaje a la posición inicial (sección 1)
     */
    reiniciarAPosicionInicial() {
        console.log('🔄 Reiniciando personaje a posición inicial...');
        
        // Cambiar a sección 1
        this.cambiarASeccion(1);
        
        // Reiniciar posición del personaje
        this.reiniciarPosicionPersonaje();
        
        // Reactivar controles
        this.configMovimiento.enSuelo = true;
        
        // Reiniciar estrella
        this.reiniciarEstrella();
    }

    /**
     * Reinicia el estado de la estrella
     */
    reiniciarEstrella() {
        if (this.configEstrella) {
            this.configEstrella.recogida = false;
            
            // Mostrar la estrella visualmente
            const estrella = document.getElementById('Estrella_Documento');
            if (estrella) {
                estrella.style.opacity = '1';
                estrella.style.pointerEvents = 'auto';
            }
            
            console.log('🔄 Estado de la estrella reiniciado');
        }
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
     * Configura eventos de teclado con cambio de imágenes
     */
    configurarEventosTeclado() {
        document.addEventListener('keydown', (e) => {
            if (this.teclas.hasOwnProperty(e.key)) {
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
            }
        });

        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });

        console.log('⌨️ Eventos de teclado configurados');
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
     * Procesa el movimiento con detección de final de sección
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
        
        // Salto (solo si está en el suelo)
        if (this.teclas.ArrowUp && this.configMovimiento.enSuelo && !this.configMovimiento.saltando) {
            this.iniciarSalto();
        }
    }

    /**
     * Inicia el salto con cambio de imagen
     */
    iniciarSalto() {
        this.configMovimiento.saltando = true;
        this.configMovimiento.enSuelo = false;
        this.configMovimiento.velocidadY = -this.configMovimiento.velocidadSalto;
        
        // Aplicar imagen de salto
        this.personaje.classList.remove('derecha', 'izquierda');
        this.personaje.classList.add('arriba', 'saltando');
        
        console.log('🦘 Personaje saltando');
        
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
                
                this.personaje.classList.add('cayendo');
                setTimeout(() => {
                    this.personaje.classList.remove('cayendo');
                }, 300);
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
     * Reinicia la posición del personaje al inicio de la sección
     */
    reiniciarPosicionPersonaje() {
        // Posicionar temporalmente fuera de pantalla a la izquierda para la animación de entrada
        this.configMovimiento.posicion.x = -150;
        this.configMovimiento.posicion.y = 0;
        this.configMovimiento.velocidadY = 0;
        this.configMovimiento.enSuelo = true;
        this.configMovimiento.saltando = false;
        
        this.actualizarPosicionPersonaje();
        this.actualizarAparienciaPersonaje();
        
        console.log(`🔄 Personaje reiniciado en sección ${this.seccionActual}`);
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
     * Inicializa detección de hueco
     */
    inicializarDeteccionHueco() {
        console.log('🕳️ Inicializando detección de hueco...');
        
        this.configHueco = {
            inicio: 50,
            fin: 55,
            activo: this.seccionActual === 1 // Solo activo en sección 1
        };
        
        console.log(`📍 Hueco configurado entre ${this.configHueco.inicio}% y ${this.configHueco.fin}% - Activo: ${this.configHueco.activo}`);
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
     * Verifica si el personaje llegó a la meta
     */
    verificarMeta() {
        if (this.seccionActual !== this.totalSecciones) return;
        
        const meta = document.getElementById('meta');
        if (!meta) return;
        
        const posXPorcentaje = (this.configMovimiento.posicion.x / window.innerWidth) * 100;
        
        if (posXPorcentaje >= 85) {
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
            { selector: '.boton-reiniciar', action: () => location.reload(), desc: 'Reiniciar' },
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
        
        const botonSiguienteNivel1 = this.crearBoton(
            'boton-siguiente-nivel-capacitarse-1',
            'Continuar al siguiente nivel de capacitación',
            'Siguiente Nivel'
        );
        
        content.appendChild(imagenEstrellas);
        content.appendChild(imagenManualContainer);
        content.appendChild(barraProgreso.container);
        content.appendChild(botonSiguienteNivel1);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            barraProgreso.carga.style.width = '16.6%';
        }, 500);
        
        botonSiguienteNivel1.addEventListener('click', () => {
            this.mostrarModalCapacitarse2(overlay);
        });
        
        this.modalAbierto = overlay;
        console.log('📖 Modal de capacitación nivel 1 (PDF Bienvenido Coopcentral) mostrado');
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
        
        // Botón para siguiente nivel (modal 3)
        const botonSiguienteNivel = this.crearBoton(
            'boton-navegacion-modal',
            'Continuar al siguiente nivel de capacitación',
            'Siguiente Nivel'
        );
        
        // Ensamblar componentes
        contenedorInfo.appendChild(infoVideo);
        
        contenedorVideo.appendChild(video);
        
        content.appendChild(imagenEstrellas);
        content.appendChild(contenedorInfo);
        content.appendChild(contenedorVideo);
        content.appendChild(barraProgresoVideo);
        content.appendChild(controlesVideo);
        content.appendChild(barraProgreso.container);
        content.appendChild(botonSiguienteNivel);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Configurar eventos del video
        this.configurarEventosVideo(video, barraProgresoVideoCarga);
        
        // Animar barras de progreso
        setTimeout(() => {
            barraProgreso.carga.style.width = '33.2%';
        }, 500);
        
        // CORRECCIÓN CRÍTICA: Cambiado de mostrarModalCapacitarse2 a mostrarModalCapacitarse3
        botonSiguienteNivel.addEventListener('click', () => {
            video.pause();
            this.mostrarModalCapacitarse3(overlay);
        });
        
        this.modalAbierto = overlay;
        console.log('🎥 Modal de capacitación nivel 2 (CARTILLA DE BIENVENIDA -- Su Guia Coopcentral) mostrado');
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
        
        const botonSiguienteNivel3 = this.crearBoton(
            'boton-siguiente-nivel-capacitarse-3',
            'Continuar al siguiente nivel de capacitación',
            'Siguiente Nivel'
        );
        
        content.appendChild(imagenEstrellas);
        content.appendChild(imagenManualContainer);
        content.appendChild(barraProgreso.container);
        content.appendChild(botonSiguienteNivel3);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Actualizar progreso al 49.8% (tercer nivel de 6)
        setTimeout(() => {
            barraProgreso.carga.style.width = '49.8%';
        }, 500);
        
        // Navegación al siguiente nivel (modal 4)
        botonSiguienteNivel3.addEventListener('click', () => {
            this.mostrarModalCapacitarse4(overlay);
        });
        
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
        
        // Botón para siguiente nivel (modal 5)
        const botonSiguienteNivel = this.crearBoton(
            'boton-navegacion-modal',
            'Continuar al siguiente nivel de capacitación',
            'Siguiente Nivel'
        );
        
        // Ensamblar componentes
        contenedorInfo.appendChild(infoVideo);
        
        contenedorVideo.appendChild(video);
        
        content.appendChild(imagenEstrellas);
        content.appendChild(contenedorInfo);
        content.appendChild(contenedorVideo);
        content.appendChild(barraProgresoVideo);
        content.appendChild(controlesVideo);
        content.appendChild(barraProgreso.container);
        content.appendChild(botonSiguienteNivel);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Configurar eventos del video
        this.configurarEventosVideo(video, barraProgresoVideoCarga);
        
        // Animar barra de progreso general al 66.4% (cuarto nivel de 6)
        setTimeout(() => {
            barraProgreso.carga.style.width = '66.4%';
        }, 500);
        
        // Evento para botón siguiente - Navega a modal 5
        botonSiguienteNivel.addEventListener('click', () => {
            video.pause();
            this.mostrarModalCapacitarse5(overlay);
        });
        
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
        
        // Botón para siguiente nivel (modal 6)
        const botonSiguienteNivel = this.crearBoton(
            'boton-navegacion-modal',
            'Continuar al siguiente nivel de capacitación',
            'Siguiente Nivel'
        );
        
        // Ensamblar componentes
        contenedorInfo.appendChild(infoVideo);
        
        contenedorVideo.appendChild(video);
        
        content.appendChild(imagenEstrellas);
        content.appendChild(contenedorInfo);
        content.appendChild(contenedorVideo);
        content.appendChild(barraProgresoVideo);
        content.appendChild(controlesVideo);
        content.appendChild(barraProgreso.container);
        content.appendChild(botonSiguienteNivel);
        
        modal.appendChild(content);
        modalContenedorPadre.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Configurar eventos del video
        this.configurarEventosVideo(video, barraProgresoVideoCarga);
        
        // Animar barra de progreso general al 83% (quinto nivel de 6)
        setTimeout(() => {
            barraProgreso.carga.style.width = '83%';
        }, 500);
        
        // Evento para botón siguiente - Navega a modal 6 (final)
        botonSiguienteNivel.addEventListener('click', () => {
            video.pause();
            this.mostrarModalCapacitarse6(overlay);
        });
        
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
            console.log('🚀 Mundo Juego 1 cargado exitosamente');
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

// Función para debug del audio (útil desde consola)
window.debugAudio = function() {
    if (window.audioManager) {
        console.log('🔧 DEBUG DE AUDIO:');
        console.log('- Reproduciendo:', window.audioManager.estaReproduciendo);
        console.log('- En video:', window.audioManager.estaEnVideo);
        console.log('- Volumen actual:', Math.round(window.audioManager.audioElement?.volume * 100) + '%');
        console.log('- Audio pausado:', window.audioManager.audioElement?.paused);
        
        // Mostrar controles de debug
        const debugDiv = document.createElement('div');
        debugDiv.className = 'controles-audio-debug mostrar';
        debugDiv.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>🔊 Debug Audio</strong>
                <button onclick="window.audioManager.reducirVolumenParaVideo()" style="margin: 5px; padding: 5px;">Reducir a 40%</button>
                <button onclick="window.audioManager.restaurarVolumenNormal()" style="margin: 5px; padding: 5px;">Restaurar a 100%</button>
                <button onclick="window.audioManager.pausar()" style="margin: 5px; padding: 5px;">Pausar</button>
                <button onclick="window.audioManager.reanudar()" style="margin: 5px; padding: 5px;">Reanudar</button>
            </div>
            <div>
                Estado: ${window.audioManager.estaReproduciendo ? '▶️ Reproduciendo' : '⏸️ Pausado'}<br>
                Modo video: ${window.audioManager.estaEnVideo ? '🔈 40%' : '🔊 100%'}<br>
                Volumen: ${Math.round(window.audioManager.audioElement?.volume * 100)}%
            </div>
        `;
        debugDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-width: 300px;
        `;
        
        // Remover si ya existe
        const existente = document.querySelector('.controles-audio-debug');
        if (existente) existente.remove();
        
        document.body.appendChild(debugDiv);
        
        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (debugDiv.parentNode) {
                debugDiv.parentNode.removeChild(debugDiv);
            }
        }, 10000);
    } else {
        console.error('❌ AudioManager no disponible');
    }
};