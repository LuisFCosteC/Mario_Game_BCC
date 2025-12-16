// assets/js/audio-manager.js

class AudioManager {
    constructor() {
        // Configuración inicial
        this.config = {
            volumenFondo: 0.5, // 50% de volumen
            volumenEfectos: 1.0, // 100% para efectos
            sonidosPrecargados: false,
            audioHabilitado: true,
            modoDebug: false // Cambiar a true para depuración
        };

        // Objetos de audio
        this.audios = {
            fondo: null,
            choque: null,
            estrella: null,
            caida: null,
            salto: null
        };

        // Rutas de los archivos de audio
        this.rutas = {
            fondo: 'assets/audios/fondo.mpeg',
            choque: 'assets/audios/choque.mp3',
            estrella: 'assets/audios/Extrella.mp3',
            caida: 'assets/audios/caida.mp3',
            salto: 'assets/audios/Salto.mp3'
        };

        // Estados del audio
        this.estados = {
            fondoReproduciendo: false,
            efectosActivados: true,
            inicializado: false,
            erroresCarga: []
        };

        // Contadores para debugging
        this.contadores = {
            reproduccionesEstrella: 0,
            reproduccionesChoque: 0,
            reproduccionesCaida: 0,
            reproduccionesSalto: 0
        };

        this.init();
    }

    /**
     * Inicializa el sistema de audio
     * @private
     */
    init() {
        if (this.estados.inicializado) {
            console.warn('⚠️ AudioManager ya está inicializado');
            return;
        }

        try {
            this.verificarCompatibilidad();
            this.prepararElementosAudio();
            this.configurarEventosGlobales();
            this.estados.inicializado = true;
            
            console.log('✅ AudioManager inicializado correctamente');
            
            // Mostrar controles de debug si está activado
            if (this.config.modoDebug) {
                this.mostrarControlesDebug();
            }
            
        } catch (error) {
            console.error('❌ Error al inicializar AudioManager:', error);
            this.estados.erroresCarga.push(error.message);
            this.mostrarErrorInicializacion(error);
        }
    }

    /**
     * Verifica compatibilidad del navegador con formatos de audio
     * @private
     */
    verificarCompatibilidad() {
        const audioElement = document.createElement('audio');
        
        // Verificar formatos soportados
        const formatosSoportados = {
            mpeg: audioElement.canPlayType('audio/mpeg'),
            mp3: audioElement.canPlayType('audio/mp3')
        };

        console.log('🎵 Compatibilidad de formatos:', formatosSoportados);
        
        if (formatosSoportados.mpeg === '' && formatosSoportados.mp3 === '') {
            throw new Error('Navegador no compatible con formatos de audio requeridos');
        }
    }

    /**
     * Prepara y pre-carga todos los elementos de audio
     * @private
     */
    prepararElementosAudio() {
        console.log('📦 Preparando elementos de audio...');
        
        // Crear objeto de audio para el fondo
        this.audios.fondo = this.crearAudio(
            this.rutas.fondo,
            'audio-fondo',
            true, // loop
            this.config.volumenFondo
        );

        // Crear objetos para efectos de sonido
        this.audios.choque = this.crearAudio(this.rutas.choque, 'audio-choque');
        this.audios.estrella = this.crearAudio(this.rutas.estrella, 'audio-estrella');
        this.audios.caida = this.crearAudio(this.rutas.caida, 'audio-caida');
        this.audios.salto = this.crearAudio(this.rutas.salto, 'audio-salto');

        // Configurar eventos de carga para cada audio
        this.configurarEventosCarga();
    }

    /**
     * Crea un elemento de audio configurado
     * @param {string} src - Ruta del archivo de audio
     * @param {string} id - ID para el elemento
     * @param {boolean} loop - Si debe repetirse
     * @param {number} volumen - Nivel de volumen (0-1)
     * @returns {HTMLAudioElement} Elemento de audio creado
     * @private
     */
    crearAudio(src, id, loop = false, volumen = 1.0) {
        const audio = new Audio();
        audio.id = id;
        audio.src = src;
        audio.loop = loop;
        audio.volume = volumen;
        audio.preload = 'auto';
        audio.setAttribute('data-audio-type', id.replace('audio-', ''));
        
        // Configuración adicional para mejor performance
        audio.crossOrigin = 'anonymous';
        
        return audio;
    }

    /**
     * Configura eventos de carga para cada audio
     * @private
     */
    configurarEventosCarga() {
        Object.entries(this.audios).forEach(([nombre, audio]) => {
            if (!audio) return;

            audio.addEventListener('loadeddata', () => {
                console.log(`✅ Audio cargado: ${nombre}`);
                this.verificarTodosCargados();
            });

            audio.addEventListener('error', (e) => {
                const errorMsg = `Error al cargar ${nombre}: ${e.target.error ? e.target.error.code : 'Error desconocido'}`;
                console.error(`❌ ${errorMsg}`);
                this.estados.erroresCarga.push(errorMsg);
                this.mostrarErrorAudio(nombre, e);
            });

            audio.addEventListener('canplaythrough', () => {
                console.log(`🎵 Audio listo para reproducir: ${nombre}`);
            });
        });
    }

    /**
     * Verifica si todos los audios están cargados
     * @private
     */
    verificarTodosCargados() {
        const todosCargados = Object.values(this.audios).every(audio => 
            audio && audio.readyState >= 2 // 2 = HAVE_CURRENT_DATA
        );

        if (todosCargados && !this.config.sonidosPrecargados) {
            this.config.sonidosPrecargados = true;
            console.log('🎉 Todos los audios están precargados y listos');
            
            // Emitir evento personalizado
            this.dispatchEvent('audiosCargados', { todosCargados: true });
        }
    }

    /**
     * Configura eventos globales del documento
     * @private
     */
    configurarEventosGlobales() {
        // Evento para cuando el documento se hace visible/oculto
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pausarFondo();
            } else {
                this.reanudarFondo();
            }
        });

        // Evento para interacción del usuario (requerido por autoplay policies)
        document.addEventListener('click', () => {
            if (!this.estados.fondoReproduciendo && this.audios.fondo) {
                this.iniciarAudioFondo();
            }
        }, { once: true });

        // Detectar eventos del juego usando EventBus pattern
        this.configurarEventosJuego();
    }

    /**
     * Configura listeners para eventos específicos del juego
     * @private
     */
    configurarEventosJuego() {
        // 1. Choque con obstáculo
        document.addEventListener('personajeChoca', (e) => {
            this.reproducirChoque();
            
            // Opcional: pasar datos del evento
            if (e.detail && this.config.modoDebug) {
                console.log('💥 Choque detectado:', e.detail);
            }
        });

        // 2. Tomar estrella (cualquier tipo que comience con "Estrella_")
        document.addEventListener('personajeTomaEstrella', (e) => {
            this.reproducirEstrella(e.detail);
        });

        // 3. Caída en hueco-peligro
        document.addEventListener('personajeCae', (e) => {
            this.reproducirCaida();
        });

        // 4. Personaje salta
        document.addEventListener('personajeSalta', (e) => {
            this.reproducirSalto();
        });

        // Eventos de inicio/pausa del juego
        document.addEventListener('juegoIniciado', () => {
            this.iniciarAudioFondo();
        });

        document.addEventListener('juegoPausado', () => {
            this.pausarFondo();
        });

        document.addEventListener('juegoReanudado', () => {
            this.reanudarFondo();
        });

        document.addEventListener('juegoTerminado', () => {
            this.detenerFondo();
        });

        console.log('🎮 Eventos del juego configurados para AudioManager');
    }

    // =============================================
    // MÉTODOS PÚBLICOS - INTERFAZ PRINCIPAL
    // =============================================

    /**
     * Inicia la reproducción del audio de fondo
     * @public
     */
    iniciarAudioFondo() {
        if (!this.audioHabilitado() || !this.audios.fondo) return;

        try {
            // Intentar reproducir con promesa (nuevo estándar)
            const playPromise = this.audios.fondo.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        this.estados.fondoReproduciendo = true;
                        console.log('🎵 Audio de fondo iniciado');
                    })
                    .catch(error => {
                        console.warn('⚠️ Error al iniciar audio de fondo:', error);
                        this.mostrarErrorAutoplay();
                    });
            } else {
                // Fallback para navegadores antiguos
                this.audios.fondo.play();
                this.estados.fondoReproduciendo = true;
                console.log('🎵 Audio de fondo iniciado (fallback)');
            }
            
        } catch (error) {
            console.error('❌ Error crítico al iniciar audio:', error);
            this.estados.erroresCarga.push(`Error inicio fondo: ${error.message}`);
        }
    }

    /**
     * Reproduce sonido de choque con obstáculo
     * @public
     */
    reproducirChoque() {
        if (!this.audioHabilitado() || !this.audios.choque) return;

        try {
            // Reiniciar si ya está reproduciéndose para efecto inmediato
            this.audios.choque.currentTime = 0;
            this.audios.choque.play();
            
            this.contadores.reproduccionesChoque++;
            
            if (this.config.modoDebug) {
                console.log('💥 Sonido de choque reproducido');
            }
        } catch (error) {
            console.error('❌ Error al reproducir choque:', error);
        }
    }

    /**
     * Reproduce sonido al tomar una estrella
     * @param {Object} detalles - Información sobre la estrella tomada
     * @public
     */
    reproducirEstrella(detalles = {}) {
        if (!this.audioHabilitado() || !this.audios.estrella) return;

        // Verificar que sea una estrella (comienza con "Estrella_")
        const tipo = detalles.tipo || detalles.id || '';
        
        if (!tipo.startsWith('Estrella_')) {
            console.warn(`⚠️ Intento de reproducir sonido estrella para tipo no válido: ${tipo}`);
            return;
        }

        try {
            // Configurar volumen específico para estrella (opcional)
            this.audios.estrella.volume = this.config.volumenEfectos;
            
            // Reiniciar y reproducir
            this.audios.estrella.currentTime = 0;
            this.audios.estrella.play();
            
            this.contadores.reproduccionesEstrella++;
            
            if (this.config.modoDebug) {
                console.log(`⭐ Sonido de estrella reproducido (${tipo})`, detalles);
            }
        } catch (error) {
            console.error('❌ Error al reproducir estrella:', error);
        }
    }

    /**
     * Reproduce sonido de caída en hueco
     * @public
     */
    reproducirCaida() {
        if (!this.audioHabilitado() || !this.audios.caida) return;

        try {
            this.audios.caida.currentTime = 0;
            this.audios.caida.play();
            
            this.contadores.reproduccionesCaida++;
            
            if (this.config.modoDebug) {
                console.log('🕳️ Sonido de caída reproducido');
            }
        } catch (error) {
            console.error('❌ Error al reproducir caída:', error);
        }
    }

    /**
     * Reproduce sonido de salto
     * @public
     */
    reproducirSalto() {
        if (!this.audioHabilitado() || !this.audios.salto) return;

        try {
            // Para saltos rápidos, usar clon para solapamiento
            if (this.audios.salto.duration > 0 && !this.audios.salto.paused) {
                // Crear clon para permitir solapamiento de sonidos de salto
                const clonSalto = this.audios.salto.cloneNode(true);
                clonSalto.volume = this.config.volumenEfectos;
                clonSalto.play();
                
                // Limpiar después de reproducir
                clonSalto.addEventListener('ended', () => {
                    clonSalto.remove();
                });
            } else {
                this.audios.salto.currentTime = 0;
                this.audios.salto.play();
            }
            
            this.contadores.reproduccionesSalto++;
            
            if (this.config.modoDebug) {
                console.log('🦘 Sonido de salto reproducido');
            }
        } catch (error) {
            console.error('❌ Error al reproducir salto:', error);
        }
    }

    // =============================================
    // MÉTODOS DE CONTROL GENERAL
    // =============================================

    /**
     * Pausa el audio de fondo
     * @public
     */
    pausarFondo() {
        if (this.audios.fondo && !this.audios.fondo.paused) {
            this.audios.fondo.pause();
            this.estados.fondoReproduciendo = false;
            console.log('⏸️ Audio de fondo pausado');
        }
    }

    /**
     * Reanuda el audio de fondo
     * @public
     */
    reanudarFondo() {
        if (this.audios.fondo && this.audios.fondo.paused) {
            this.audios.fondo.play()
                .then(() => {
                    this.estados.fondoReproduciendo = true;
                    console.log('▶️ Audio de fondo reanudado');
                })
                .catch(error => {
                    console.warn('⚠️ No se pudo reanudar audio de fondo:', error);
                });
        }
    }

    /**
     * Detiene completamente el audio de fondo
     * @public
     */
    detenerFondo() {
        if (this.audios.fondo) {
            this.audios.fondo.pause();
            this.audios.fondo.currentTime = 0;
            this.estados.fondoReproduciendo = false;
            console.log('⏹️ Audio de fondo detenido');
        }
    }

    /**
     * Habilita o deshabilita todos los sonidos
     * @param {boolean} habilitado - true para habilitar, false para deshabilitar
     * @public
     */
    setHabilitado(habilitado) {
        this.config.audioHabilitado = habilitado;
        
        if (!habilitado) {
            this.detenerFondo();
            
            // Pausar todos los efectos también
            Object.values(this.audios).forEach(audio => {
                if (audio && audio !== this.audios.fondo) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
        }
        
        console.log(`🔊 Audio ${habilitado ? 'habilitado' : 'deshabilitado'}`);
        
        // Emitir evento
        this.dispatchEvent('audioHabilitadoCambiado', { habilitado });
    }

    /**
     * Ajusta el volumen del fondo
     * @param {number} volumen - Valor entre 0 y 1
     * @public
     */
    setVolumenFondo(volumen) {
        const volumenAjustado = Math.max(0, Math.min(1, volumen));
        
        if (this.audios.fondo) {
            this.audios.fondo.volume = volumenAjustado;
            this.config.volumenFondo = volumenAjustado;
            console.log(`🎚️ Volumen fondo ajustado a: ${(volumenAjustado * 100).toFixed(0)}%`);
        }
    }

    /**
     * Ajusta el volumen de efectos
     * @param {number} volumen - Valor entre 0 y 1
     * @public
     */
    setVolumenEfectos(volumen) {
        const volumenAjustado = Math.max(0, Math.min(1, volumen));
        this.config.volumenEfectos = volumenAjustado;
        
        // Aplicar a todos los efectos excepto fondo
        Object.entries(this.audios).forEach(([nombre, audio]) => {
            if (audio && nombre !== 'fondo') {
                audio.volume = volumenAjustado;
            }
        });
        
        console.log(`🎚️ Volumen efectos ajustado a: ${(volumenAjustado * 100).toFixed(0)}%`);
    }

    // =============================================
    // MÉTODOS DE UTILIDAD Y DEPURACIÓN
    // =============================================

    /**
     * Verifica si el audio está habilitado
     * @returns {boolean}
     * @private
     */
    audioHabilitado() {
        return this.config.audioHabilitado && this.estados.inicializado;
    }

    /**
     * Obtiene el estado actual del sistema de audio
     * @returns {Object} Estado del audio
     * @public
     */
    getEstado() {
        return {
            inicializado: this.estados.inicializado,
            fondoReproduciendo: this.estados.fondoReproduciendo,
            efectosActivados: this.estados.efectosActivados,
            sonidosPrecargados: this.config.sonidosPrecargados,
            audioHabilitado: this.config.audioHabilitado,
            volumenFondo: this.config.volumenFondo,
            volumenEfectos: this.config.volumenEfectos,
            erroresCarga: this.estados.erroresCarga,
            contadores: { ...this.contadores }
        };
    }

    /**
     * Muestra información de depuración en consola
     * @public
     */
    debugInfo() {
        console.group('🔊 AudioManager - Información de Depuración');
        console.log('Estado:', this.getEstado());
        
        console.group('Audios cargados:');
        Object.entries(this.audios).forEach(([nombre, audio]) => {
            if (audio) {
                console.log(`${nombre}:`, {
                    readyState: audio.readyState,
                    duration: audio.duration,
                    currentTime: audio.currentTime,
                    paused: audio.paused,
                    volume: audio.volume
                });
            } else {
                console.log(`${nombre}: NO CARGADO`);
            }
        });
        console.groupEnd();
        
        console.groupEnd();
    }

    /**
     * Muestra controles de debug en pantalla
     * @private
     */
    mostrarControlesDebug() {
        const estilo = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-width: 300px;
            max-height: 400px;
            overflow-y: auto;
        `;

        const controlesHTML = `
            <div style="${estilo}" id="audio-debug-panel">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong>🔊 Debug Audio</strong>
                    <button onclick="document.getElementById('audio-debug-panel').remove()" 
                            style="background: red; color: white; border: none; border-radius: 4px; padding: 2px 6px; cursor: pointer;">X</button>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <label style="display: block; margin-bottom: 4px;">Fondo: ${(this.config.volumenFondo * 100).toFixed(0)}%</label>
                    <input type="range" min="0" max="100" value="${this.config.volumenFondo * 100}" 
                           oninput="window.audioManager.setVolumenFondo(this.value / 100)" style="width: 100%;">
                </div>
                
                <div style="margin-bottom: 8px;">
                    <label style="display: block; margin-bottom: 4px;">Efectos: ${(this.config.volumenEfectos * 100).toFixed(0)}%</label>
                    <input type="range" min="0" max="100" value="${this.config.volumenEfectos * 100}" 
                           oninput="window.audioManager.setVolumenEfectos(this.value / 100)" style="width: 100%;">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 10px;">
                    <button onclick="window.audioManager.iniciarAudioFondo()" 
                            style="background: #4CAF50; color: white; border: none; padding: 4px; border-radius: 4px; cursor: pointer;">▶ Fondo</button>
                    <button onclick="window.audioManager.pausarFondo()" 
                            style="background: #ff9800; color: white; border: none; padding: 4px; border-radius: 4px; cursor: pointer;">⏸ Fondo</button>
                    <button onclick="window.audioManager.reproducirChoque()" 
                            style="background: #f44336; color: white; border: none; padding: 4px; border-radius: 4px; cursor: pointer;">💥 Choque</button>
                    <button onclick="window.audioManager.reproducirEstrella({tipo: 'Estrella_Documento'})" 
                            style="background: #2196F3; color: white; border: none; padding: 4px; border-radius: 4px; cursor: pointer;">⭐ Estrella</button>
                    <button onclick="window.audioManager.reproducirCaida()" 
                            style="background: #9C27B0; color: white; border: none; padding: 4px; border-radius: 4px; cursor: pointer;">🕳️ Caída</button>
                    <button onclick="window.audioManager.reproducirSalto()" 
                            style="background: #00BCD4; color: white; border: none; padding: 4px; border-radius: 4px; cursor: pointer;">🦘 Salto</button>
                </div>
                
                <div style="font-size: 10px; border-top: 1px solid #555; padding-top: 8px;">
                    <div>Contadores:</div>
                    <div>Estrellas: ${this.contadores.reproduccionesEstrella}</div>
                    <div>Choques: ${this.contadores.reproduccionesChoque}</div>
                    <div>Caídas: ${this.contadores.reproduccionesCaida}</div>
                    <div>Saltos: ${this.contadores.reproduccionesSalto}</div>
                </div>
                
                <button onclick="window.audioManager.debugInfo()" 
                        style="margin-top: 8px; width: 100%; background: #555; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">📊 Console Debug</button>
            </div>
        `;

        // Evitar duplicados
        if (!document.getElementById('audio-debug-panel')) {
            document.body.insertAdjacentHTML('beforeend', controlesHTML);
        }
    }

    /**
     * Muestra error de autoplay
     * @private
     */
    mostrarErrorAutoplay() {
        const mensaje = `
            <div class="mensaje-error-audio">
                <strong>🔊 Interacción requerida</strong>
                <p>Haz clic en cualquier parte de la pantalla para activar el audio del juego.</p>
                <p><em>Los navegadores requieren interacción del usuario para reproducir audio automáticamente.</em></p>
            </div>
        `;
        
        this.mostrarMensajeTemporal(mensaje, 5000);
    }

    /**
     * Muestra error específico de audio
     * @private
     */
    mostrarErrorAudio(nombreAudio, error) {
        const mensaje = `
            <div class="mensaje-error-audio">
                <strong>❌ Error de audio: ${nombreAudio}</strong>
                <p>No se pudo cargar el archivo de audio.</p>
                <code>${this.rutas[nombreAudio]}</code>
                <p>Verifica que el archivo exista en la carpeta <code>assets/audios/</code></p>
            </div>
        `;
        
        this.mostrarMensajeTemporal(mensaje, 7000);
        console.error(`Error específico de audio ${nombreAudio}:`, error);
    }

    /**
     * Muestra error de inicialización
     * @private
     */
    mostrarErrorInicializacion(error) {
        const mensaje = `
            <div class="mensaje-error-audio">
                <strong>⚠️ Sistema de audio no disponible</strong>
                <p>El juego continuará sin sonido.</p>
                <p><small>Error: ${error.message}</small></p>
            </div>
        `;
        
        this.mostrarMensajeTemporal(mensaje, 10000);
    }

    /**
     * Muestra mensaje temporal en pantalla
     * @private
     */
    mostrarMensajeTemporal(mensajeHTML, duracionMs) {
        // Crear contenedor si no existe
        let contenedor = document.getElementById('contenedor-mensajes-audio');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'contenedor-mensajes-audio';
            contenedor.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
            `;
            document.body.appendChild(contenedor);
        }

        // Crear mensaje
        const mensajeDiv = document.createElement('div');
        mensajeDiv.innerHTML = mensajeHTML;
        contenedor.appendChild(mensajeDiv);

        // Remover después de la duración especificada
        setTimeout(() => {
            if (mensajeDiv.parentNode === contenedor) {
                contenedor.removeChild(mensajeDiv);
            }
            
            // Limpiar contenedor si está vacío
            if (contenedor.children.length === 0) {
                contenedor.remove();
            }
        }, duracionMs);
    }

    /**
     * Dispara un evento personalizado
     * @private
     */
    dispatchEvent(nombre, detalle = {}) {
        const evento = new CustomEvent(`audio:${nombre}`, {
            detail: {
                timestamp: Date.now(),
                source: 'AudioManager',
                ...detalle
            }
        });
        document.dispatchEvent(evento);
    }

    /**
     * Limpia recursos del AudioManager
     * @public
     */
    destruir() {
        // Detener todos los audios
        Object.values(this.audios).forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                audio.src = ''; // Liberar recursos
            }
        });

        // Limpiar referencias
        this.audios = {};
        this.estados.inicializado = false;
        
        // Remover panel de debug si existe
        const panel = document.getElementById('audio-debug-panel');
        if (panel) panel.remove();

        console.log('🧹 AudioManager destruido - Recursos liberados');
    }
}

// =============================================
// INTEGRACIÓN CON EL JUEGO EXISTENTE
// =============================================

/**
 * Función para integrar AudioManager con el juego existente
 * Esta función detecta eventos del juego y los traduce a eventos de audio
 */
function integrarAudioConJuego() {
    console.log('🔌 Integrando AudioManager con el juego...');
    
    // Integración con mundo-juego-1.js
    // 1. Detectar colisión con obstáculo
    const observerColision = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                
                // Detectar clase de colisión
                if (target.classList.contains('colisionando-obstaculo')) {
                    document.dispatchEvent(new CustomEvent('personajeChoca', {
                        detail: { elemento: target.id, timestamp: Date.now() }
                    }));
                }
            }
        });
    });
    
    // Observar cambios en el personaje
    const personaje = document.getElementById('jugador');
    if (personaje) {
        observerColision.observe(personaje, { attributes: true });
    }
    
    // 2. Detectar recolección de estrellas
    document.addEventListener('click', (e) => {
        const elemento = e.target;
        
        // Verificar si es una estrella (comienza con "Estrella_")
        if (elemento.id && elemento.id.startsWith('Estrella_')) {
            document.dispatchEvent(new CustomEvent('personajeTomaEstrella', {
                detail: { 
                    id: elemento.id,
                    tipo: elemento.className,
                    timestamp: Date.now() 
                }
            }));
        }
    });
    
    // 3. Detectar caída en hueco
    const hueco = document.querySelector('.hueco-peligro');
    if (hueco) {
        // El juego ya tiene lógica de caída, podemos escuchar cambios
        const observerHueco = new MutationObserver(() => {
            if (hueco.style.opacity === '1') {
                document.dispatchEvent(new CustomEvent('personajeCae'));
            }
        });
        
        observerHueco.observe(hueco, { attributes: true, attributeFilter: ['style'] });
    }
    
    // 4. Detectar salto (tecla arriba)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
            // Pequeño delay para evitar múltiples eventos
            if (!window.ultimoSalto || Date.now() - window.ultimoSalto > 200) {
                document.dispatchEvent(new CustomEvent('personajeSalta'));
                window.ultimoSalto = Date.now();
            }
        }
    });
    
    // 5. Detectar inicio del juego desde modal
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('boton-jugar-modal')) {
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('juegoIniciado'));
            }, 1000);
        }
    });
    
    console.log('✅ Integración de audio configurada');
}

// =============================================
// INICIALIZACIÓN GLOBAL
// =============================================

// Inicializar AudioManager cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Crear instancia global
        window.audioManager = new AudioManager();
        
        // Integrar con el juego
        setTimeout(integrarAudioConJuego, 1000);
        
        // Configurar para iniciar audio al primer click
        document.addEventListener('click', () => {
            if (window.audioManager && !window.audioManager.estados.fondoReproduciendo) {
                window.audioManager.iniciarAudioFondo();
            }
        }, { once: true });
        
        console.log('🚀 AudioManager cargado e integrado correctamente');
        
    } catch (error) {
        console.error('💥 Error crítico al cargar AudioManager:', error);
    }
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('audio')) {
        console.error('🎵 Error global relacionado con audio:', e);
    }
});

// Exportar para uso en módulos (si se usa ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}

// =============================================
// FUNCIONES DE CONVENIENCIA PARA DESARROLLADORES
// =============================================

/**
 * Función global para control rápido del audio desde consola
 */
window.controlAudio = {
    iniciarFondo: () => window.audioManager?.iniciarAudioFondo(),
    pausarFondo: () => window.audioManager?.pausarFondo(),
    reproducirChoque: () => window.audioManager?.reproducirChoque(),
    reproducirEstrella: (tipo = 'Estrella_Documento') => 
        window.audioManager?.reproducirEstrella({ tipo }),
    reproducirCaida: () => window.audioManager?.reproducirCaida(),
    reproducirSalto: () => window.audioManager?.reproducirSalto(),
    debug: () => window.audioManager?.debugInfo(),
    estado: () => window.audioManager?.getEstado()
};

console.log(`
🎮 Mario BCC - Sistema de Audio Cargado
══════════════════════════════════════
Comandos disponibles en consola:
• controlAudio.estado()     - Ver estado del audio
• controlAudio.debug()      - Información detallada
• controlAudio.reproducirSalto() - Probar sonido de salto
══════════════════════════════════════
`);