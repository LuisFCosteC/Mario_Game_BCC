// assets/js/script.js - ANIMACIÓN DE NUBES MEJORADA

class CloudAnimator {
    constructor() {
        this.nubes = [];
        this.configNubes = [];
        this.anchoVentana = window.innerWidth;
        this.altoVentana = window.innerHeight;
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.cargarNubes();
        this.configurarNubes();
        this.iniciarAnimacion();
        this.agregarEventListeners();
        this.verificarNubesPeriodicamente();
    }

    cargarNubes() {
        const nubesContainer = document.querySelector('.nubes-container');
        if (nubesContainer) {
            this.nubes = Array.from(nubesContainer.querySelectorAll('.nube'));
        }
        
        console.log(`Nubes cargadas: ${this.nubes.length}`);
    }

    configurarNubes() {
        this.configNubes = this.nubes.map((nube, index) => {
            const velocidadBase = 0.5 + (Math.random() * 1.5);
            const tamaño = 80 + (Math.random() * 120);
            const inicioX = -200 - (Math.random() * 500);
            const inicioY = Math.random() * this.altoVentana;
            const opacidad = 0.4 + (Math.random() * 0.4);
            
            nube.style.left = inicioX + 'px';
            nube.style.top = inicioY + 'px';
            nube.style.width = tamaño + 'px';
            nube.style.height = tamaño + 'px';
            nube.style.opacity = opacidad;
            nube.style.zIndex = '-1';
            
            return {
                velocidad: velocidadBase,
                inicio: inicioX,
                fin: this.anchoVentana + 100,
                elemento: nube,
                tamaño: tamaño,
                opacidad: opacidad
            };
        });
    }

    animarNubes() {
        if (!this.isAnimating) return;
        
        this.configNubes.forEach((config) => {
            const nube = config.elemento;
            let posX = parseFloat(nube.style.left);
            
            posX += config.velocidad;
            
            if (posX > config.fin) {
                posX = -200 - (Math.random() * 300);
                nube.style.top = (Math.random() * this.altoVentana) + 'px';
                config.velocidad = 0.5 + (Math.random() * 1.5);
            }
            
            nube.style.left = posX + 'px';
        });
        
        requestAnimationFrame(() => this.animarNubes());
    }

    iniciarAnimacion() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.animarNubes();
    }

    actualizarPosiciones() {
        this.anchoVentana = window.innerWidth;
        this.altoVentana = window.innerHeight;
        
        this.configNubes.forEach(config => {
            config.fin = this.anchoVentana + 100;
        });
    }

    agregarEventListeners() {
        window.addEventListener('resize', () => {
            this.actualizarPosiciones();
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => this.iniciarAnimacion(), 100);
            }
        });
    }

    verificarNubesPeriodicamente() {
        setInterval(() => {
            this.verificarYReponerNubes();
        }, 3000);
    }

    verificarYReponerNubes() {
        let nubesEnPantalla = 0;
        
        this.configNubes.forEach(config => {
            const posX = parseFloat(config.elemento.style.left);
            if (posX > -100 && posX < this.anchoVentana) {
                nubesEnPantalla++;
            }
        });
        
        if (nubesEnPantalla < 8) {
            this.reposicionarNubesAleatorias(12 - nubesEnPantalla);
        }
    }

    reposicionarNubesAleatorias(cantidad) {
        for (let i = 0; i < cantidad && i < this.configNubes.length; i++) {
            const indiceAleatorio = Math.floor(Math.random() * this.configNubes.length);
            const config = this.configNubes[indiceAleatorio];
            
            config.elemento.style.left = (-200 - Math.random() * 300) + 'px';
            config.elemento.style.top = (Math.random() * this.altoVentana) + 'px';
        }
    }
}

// Inicialización mejorada
function initializeCloudAnimator() {
    if (document.querySelector('.nubes-container')) {
        window.cloudAnimator = new CloudAnimator();
    }
}

// Múltiples formas de inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCloudAnimator);
} else {
    initializeCloudAnimator();
}