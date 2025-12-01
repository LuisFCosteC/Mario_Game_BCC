/**
 * Sistema de Gestión de Audio para el Juego BCC
 * Controla el audio de fondo y ajusta el volumen durante videos/podcasts
 */
class AudioManager {
    constructor() {
        this.audioElement = null;
        this.volumeNormal = 1.0; // 100%
        this.volumeReducido = 0.4; // 40%
        this.estaReproduciendo = false;
        this.estaEnVideo = false;
        this.inicializado = false;
        
        // Ruta del audio
        this.rutaAudio = 'assets/audios/Sonido_Juego_1_Overworld_Theme_New_Super_Mario_Bros.mp3';
        
        this.init();
    }
    
    /**
     * Inicializa el sistema de audio
     */
    init() {
        if (this.inicializado) return;
        
        try {
            this.crearElementoAudio();
            this.configurarEventos();
            this.iniciarReproduccion();
            this.inicializado = true;
            
            console.log('✅ AudioManager inicializado correctamente');
            console.log(`🎵 Ruta del audio: ${this.rutaAudio}`);
            console.log(`🔊 Volumen normal: ${this.volumeNormal * 100}%`);
            console.log(`🔈 Volumen reducido (video): ${this.volumeReducido * 100}%`);
        } catch (error) {
            console.error('❌ Error al inicializar AudioManager:', error);
        }
    }
    
    /**
     * Crea el elemento de audio HTML
     */
    crearElementoAudio() {
        // Crear elemento de audio
        this.audioElement = document.createElement('audio');
        this.audioElement.id = 'audio-fondo';
        this.audioElement.loop = true;
        this.audioElement.preload = 'auto';
        this.audioElement.volume = this.volumeNormal;
        this.audioElement.setAttribute('aria-label', 'Música de fondo del juego');
        
        // Crear source
        const source = document.createElement('source');
        source.src = this.rutaAudio;
        source.type = 'audio/mpeg';
        
        // Mensaje de fallback
        const fallbackMsg = document.createElement('p');
        fallbackMsg.textContent = 'Tu navegador no soporta el elemento de audio.';
        
        this.audioElement.appendChild(source);
        this.audioElement.appendChild(fallbackMsg);
        
        // Agregar al body
        document.body.appendChild(this.audioElement);
        
        console.log('🎵 Elemento de audio creado y configurado');
    }
    
    /**
     * Configura eventos del audio
     */
    configurarEventos() {
        if (!this.audioElement) return;
        
        // Evento cuando el audio se puede reproducir
        this.audioElement.addEventListener('canplaythrough', () => {
            console.log('🎵 Audio cargado y listo para reproducir');
        });
        
        // Evento de error
        this.audioElement.addEventListener('error', (e) => {
            console.error('❌ Error en el audio:', e);
            this.mostrarErrorAudio();
        });
        
        // Evento de reproducción iniciada
        this.audioElement.addEventListener('play', () => {
            this.estaReproduciendo = true;
            console.log('▶️ Audio de fondo reproducido');
        });
        
        // Evento de pausa
        this.audioElement.addEventListener('pause', () => {
            this.estaReproduciendo = false;
            console.log('⏸️ Audio de fondo pausado');
        });
        
        // Evento de finalización (aunque está en loop)
        this.audioElement.addEventListener('ended', () => {
            console.log('🔁 Audio reiniciado (loop)');
        });
        
        // Evento de cambio de volumen
        this.audioElement.addEventListener('volumechange', () => {
            console.log(`🔊 Volumen actual: ${Math.round(this.audioElement.volume * 100)}%`);
        });
    }
    
    /**
     * Inicia la reproducción del audio
     */
    async iniciarReproduccion() {
        if (!this.audioElement) return;
        
        try {
            // Intentar reproducir automáticamente
            await this.audioElement.play();
            console.log('🎵 Audio de fondo iniciado automáticamente');
        } catch (error) {
            // Si falla el autoplay, esperar interacción del usuario
            console.log('⏳ Esperando interacción del usuario para reproducir audio...');
            
            // Configurar reproducción en el primer clic
            const iniciarConInteraccion = () => {
                this.audioElement.play().then(() => {
                    console.log('🎵 Audio iniciado después de interacción del usuario');
                }).catch(e => {
                    console.error('❌ Error al iniciar audio después de interacción:', e);
                });
                
                // Remover event listeners
                document.removeEventListener('click', iniciarConInteraccion);
                document.removeEventListener('keydown', iniciarConInteraccion);
            };
            
            // Escuchar primera interacción
            document.addEventListener('click', iniciarConInteraccion, { once: true });
            document.addEventListener('keydown', iniciarConInteraccion, { once: true });
        }
    }
    
    /**
     * Reduce el volumen (para videos/podcasts)
     */
    reducirVolumenParaVideo() {
        if (!this.audioElement || this.estaEnVideo) return;
        
        this.estaEnVideo = true;
        this.audioElement.volume = this.volumeReducido;
        
        console.log(`🔈 Volumen reducido al ${this.volumeReducido * 100}% para video/podcast`);
    }
    
    /**
     * Restaura el volumen normal
     */
    restaurarVolumenNormal() {
        if (!this.audioElement || !this.estaEnVideo) return;
        
        this.estaEnVideo = false;
        this.audioElement.volume = this.volumeNormal;
        
        console.log(`🔊 Volumen restaurado al ${this.volumeNormal * 100}%`);
    }
    
    /**
     * Pausa el audio
     */
    pausar() {
        if (!this.audioElement) return;
        
        this.audioElement.pause();
        console.log('⏸️ Audio pausado');
    }
    
    /**
     * Reanuda el audio
     */
    reanudar() {
        if (!this.audioElement) return;
        
        this.audioElement.play().catch(e => {
            console.error('❌ Error al reanudar audio:', e);
        });
        console.log('▶️ Audio reanudado');
    }
    
    /**
     * Cambia el volumen
     * @param {number} volumen - Valor entre 0 y 1
     */
    setVolumen(volumen) {
        if (!this.audioElement) return;
        
        volumen = Math.max(0, Math.min(1, volumen)); // Limitar entre 0 y 1
        this.audioElement.volume = volumen;
        
        console.log(`🎚️ Volumen establecido a ${Math.round(volumen * 100)}%`);
    }
    
    /**
     * Muestra un error si el audio no se puede cargar
     */
    mostrarErrorAudio() {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'mensaje-error-audio';
        errorMsg.innerHTML = `
            <p><strong>⚠️ Error al cargar el audio de fondo</strong></p>
            <p>Verifica que el archivo exista en la ruta:</p>
            <code>${this.rutaAudio}</code>
            <p style="margin-top: 10px; font-size: 14px;">
                <em>Formato soportado: MP3</em>
            </p>
        `;
        errorMsg.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 15px;
            border-radius: 8px;
            max-width: 300px;
            z-index: 10000;
            border: 2px solid #dc3545;
            font-family: Arial, sans-serif;
        `;
        
        document.body.appendChild(errorMsg);
        
        // Auto-eliminar después de 10 segundos
        setTimeout(() => {
            if (errorMsg.parentNode) {
                errorMsg.parentNode.removeChild(errorMsg);
            }
        }, 10000);
    }
    
    /**
     * Destruye el audio manager
     */
    destruir() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
            this.audioElement.load();
            
            if (this.audioElement.parentNode) {
                this.audioElement.parentNode.removeChild(this.audioElement);
            }
            
            this.audioElement = null;
        }
        
        console.log('🧹 AudioManager destruido');
    }
}

// Crear instancia global
window.audioManager = new AudioManager();

// Manejar cambios de visibilidad de la página
document.addEventListener('visibilitychange', () => {
    if (window.audioManager && window.audioManager.audioElement) {
        if (document.hidden) {
            // Guardar estado de reproducción
            window.audioManager.wasPlaying = !window.audioManager.audioElement.paused;
            window.audioManager.audioElement.pause();
        } else if (window.audioManager.wasPlaying) {
            // Reanudar si estaba reproduciendo
            window.audioManager.audioElement.play().catch(e => {
                console.log('⚠️ No se pudo reanudar automáticamente:', e);
            });
        }
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}