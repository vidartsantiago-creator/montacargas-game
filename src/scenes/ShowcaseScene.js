import Phaser from 'phaser';
import { 
    toIso, fromIso, getDrawingOrder, 
    drawIsoTile, drawIsoSolidWall, drawIsoShelf, // <--- Asegúrate que esté aquí
    drawIsoShelfBox, drawIsoDispatch 
} from '../render.js';
import { drawIsoForklift } from '../graphics/forklift.js';
import { drawIsoBox } from '../graphics/box.js';
import { drawIsoTarget } from '../graphics/markers.js';

export default class ShowcaseScene extends Phaser.Scene {
    constructor() {
        super('ShowcaseScene');
    }

    init() {
        this.elementos = [];
        this.anguloRotacion = 0;
        this.velocidadRotacion = 0.02;
        this.paused = false;
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        const tileSize = 60;

        // Título
        this.add.text(centerX, 40, 'GALERÍA DE ASSETS - MONTOCARGAS', {
            font: 'bold 28px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Instrucciones
        this.add.text(centerX, 75, 'Los elementos rotan automáticamente para mostrar todos los ángulos', {
            font: '16px Arial',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        // Configuración de la grilla (3x2)
        const cols = 3;
        const rows = 2;
        const cardWidth = 300;
        const cardHeight = 300;
        const gap = 20;

        const totalWidth = cols * cardWidth + (cols - 1) * gap;
        const totalHeight = rows * cardHeight + (rows - 1) * gap;

        const startX = (this.scale.width - totalWidth) / 2 + cardWidth / 2;
        const startY = 120 + (this.scale.height - totalHeight - 120) / 2 + cardHeight / 2;

        // Definir elementos a mostrar
        this.elementos = [
            { nombre: 'Montacargas Jugador', tipo: 'forklift', variant: 'player' },
            { nombre: 'Montacargas IA', tipo: 'forklift', variant: 'ai' },
            { nombre: 'Caja', tipo: 'box', variant: 'normal' },
            { nombre: 'Pared', tipo: 'wall', variant: 'normal' },
            { nombre: 'Objetivo', tipo: 'target', variant: 'normal' },
            { nombre: 'Estantería', tipo: 'shelf', variant: 'normal' }
        ];

        // Crear tarjetas
        this.elementos.forEach((elem, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);

            const x = startX + col * (cardWidth + gap);
            const y = startY + row * (cardHeight + gap);

            this.crearTarjeta(x, y, cardWidth, cardHeight, elem);
        });

            // Crear texto de instrucción
    const titleText = this.add.text(this.scale.width / 2, 100, 'GALERÍA DE ASSETS', {
        font: 'bold 32px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6
    }).setOrigin(0.5);

    // Crear botón de inicio (Texto interactivo)
        const startText = this.add.text(this.scale.width / 2, this.scale.height - 100, '▶ INICIAR JUEGO ◀', {
            font: 'bold 15 px Arial',
            color: '#ffff00',
            backgroundColor: '#333333',
            padding: { x: 20, y: 15 },
            borderRadius: 10
        }).setOrigin(0.5);

        // Hacerlo interactivo
        startText.setInteractive({ useHandCursor: true })
            .on('pointerover', () => startText.setStyle({ color: '#ffffff', scale: 1.1 }))
            .on('pointerout', () => startText.setStyle({ color: '#ffff00', scale: 1.0 }))
            .on('pointerdown', () => {
                // Efecto de sonido opcional al click
                // this.sound.play('click'); 
                
                // Iniciar la escena del juego
                this.scene.start('GameScene', { nivel: 0 });
            });

        // Instrucción pequeña
        this.add.text(this.scale.width / 2, this.scale.height - 40, 'Haz clic para comenzar', {
            font: '18px Arial',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Controles
        this.crearControles(centerX, this.scale.height - 40);

        // Texto de estado
        this.estadoTexto = this.add.text(20, this.scale.height - 30, '', {
            font: '14px Arial',
            fill: '#888888'
        });
    }

    crearTarjeta(x, y, width, height, elemento) {
        // Fondo de tarjeta
        const card = this.add.rectangle(x, y, width, height, 0x2a2a2a)
            .setStrokeStyle(2, 0x444444);

        // Título de tarjeta
        const title = this.add.text(x, y - height/2 + 15, elemento.nombre, {
            font: 'bold 16px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Contenedor para el elemento gráfico (centro de la tarjeta)
        const graphicContainer = this.add.container(x, y);

        // Guardar referencia para animación
        elemento.container = graphicContainer;
        elemento.angulo = Math.random() * Math.PI * 2; // Ángulo inicial aleatorio

        // Dibujar elemento inicial
        this.dibujarElementoEnContainer(graphicContainer, elemento, 0, this.tileSize);
    }

    dibujarElementoEnContainer(container, elemento, angulo, tileSize) {
        // 1. Limpiar el contenedor
        container.removeAll(true);

        // 2. Crear un objeto Graphics específico para dibujar en este contenedor
        const graphics = this.add.graphics();
        
        // Agregar el gráfico al contenedor
        container.add(graphics);

        // 3. Coordenadas locales dentro del contenedor (centradas en 0,0)
        const centerX = 0; 
        const centerY = 0;

        // Simular dirección basada en el ángulo continuo
        const dirX = Math.cos(angulo);
        const dirY = Math.sin(angulo);

        // Determinar dirección cardinal más cercana
        let direccion = { row: 0, col: 1 }; // Default derecha
        if (Math.abs(dirX) > Math.abs(dirY)) {
            direccion = dirX > 0 ? { row: 0, col: 1 } : { row: 0, col: -1 };
        } else {
            direccion = dirY > 0 ? { row: 1, col: 0 } : { row: -1, col: 0 };
        }

        // 4. Llamar a las funciones de dibujo pasando 'graphics'
        switch(elemento.tipo) {
            case 'forklift':
                drawIsoForklift(
                    graphics,
                    0, 0,
                    tileSize,
                    centerX,
                    centerY + 40, // Ajuste vertical para asentar
                    elemento.variant,
                    false,
                    direccion
                );
                break;
            case 'box':
                drawIsoBox(
                    graphics,
                    0, 0,
                    tileSize,
                    centerX - 40,
                    centerY + 10,
                    false
                );
                break;
            case 'wall':
                drawIsoSolidWall(
                    graphics,
                    0, 0,
                    tileSize,
                    centerX - 40,
                    centerY + 40,
                    65
                );
                break;
            case 'target':
                drawIsoTarget(
                    graphics,
                    0, 0,
                    tileSize,
                    centerX - 40,
                    centerY + 40
                );
                break;
            case 'shelf':
                drawIsoShelf(
                    graphics,
                    0, 0,
                    tileSize,
                    centerX - 40,
                    centerY + 40,
                    3
                );
                break;
        }

        // 5. Escalar el contenedor completo
        // Nota: No usamos setOrigin aquí porque Container no lo soporta.
        // El centrado se logra dibujando en (0,0) relativo al contenedor.
        container.setScale(1.5);
    }
    
    crearControles(x, y) {
        // Botón Pausa/Play
        const btnPause = this.add.text(x, y, '⏸ PAUSAR', {
            font: 'bold 18px Arial',
            fill: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 15, y: 8 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.paused = !this.paused;
            btnPause.setText(this.paused ? '▶ REANUDAR' : '⏸ PAUSAR');
            this.estadoTexto.setText(this.paused ? 'Rotación pausada' : 'Rotando...');
        });

        // Slider de velocidad (texto informativo por ahora)
        this.add.text(x - 150, y, 'Velocidad: Normal', {
            font: '14px Arial',
            fill: '#aaaaaa'
        }).setOrigin(0.5, 0);
    }

    update(time, delta) {
        if (!this.paused) {
            this.anguloRotacion += this.velocidadRotacion;

            // Actualizar cada elemento
            this.elementos.forEach(elem => {
                elem.angulo += this.velocidadRotacion;
                this.dibujarElementoEnContainer(elem.container, elem, elem.angulo, 60);
            });

            this.estadoTexto.setText('Rotando...');
        }
    }
}