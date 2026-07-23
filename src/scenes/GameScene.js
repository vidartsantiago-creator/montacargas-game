import Phaser from 'phaser';
import { 
    toIso, fromIso, getDrawingOrder, 
    drawIsoTile, drawIsoSolidWall, drawIsoShelf, 
    drawIsoShelfBox, drawIsoDispatch, drawIsoTarget 
} from '../render.js';
import { drawIsoForklift } from '../graphics/forklift.js';
import { drawIsoBox } from '../graphics/box.js';
import { drawIsoTarget as drawIsoTargetMarker } from '../graphics/markers.js'; // Asegurar nombre único si hay conflicto
import niveles from '../levels.js';
import gameConfig from '../../config.json';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.nivelActual = data?.nivel || 0;
        this.tileSize = gameConfig.isometric.tileSize;
        this.movementDelayInitial = gameConfig.gameplay.movementDelayInitial;
        this.movementRepeatInterval = gameConfig.gameplay.movementRepeatInterval;
        
        // Estado
        this.mapa = [];
        this.cajas = [];
        this.posicionesObjetivo = [];
        this.puntoDespacho = { row: 0, col: 0 };
        this.jugadorPos = { row: 0, col: 0 };
        this.jugadorDireccion = { row: 0, col: 1 };
        this.cajaCargada = null; 
        
        this.ia = { activo: false, pos: { row: 0, col: 0 }, direccion: { row: 0, col: 1 }, cajaObjetivo: null };
        
        this.timerAutoRepeat = null;
        this.teclasCursor = null;
        this.teclaEspacio = null;
        this.offsetX = 0;
        this.offsetY = 0;

        // Gráficos separados para evitar conflictos de renderizado
        this.staticGraphics = null;
        this.dynamicGraphics = null;
    }

    create() {
        const nivelData = niveles[this.nivelActual];
        if (!nivelData) {
            console.error("Nivel no encontrado:", this.nivelActual);
            return;
        }

        // Clonar datos
        this.mapa = JSON.parse(JSON.stringify(nivelData.mapa));
        this.cajas = JSON.parse(JSON.stringify(nivelData.cajas || []));
        this.posicionesObjetivo = JSON.parse(JSON.stringify(nivelData.posicionesObjetivo || []));
        this.puntoDespacho = { ...nivelData.puntoDespacho };
        this.jugadorPos = { ...nivelData.jugadorInicio };
        
        if (nivelData.ia) {
            this.ia.activo = true;
            this.ia.pos = { ...nivelData.ia.posicionInicio };
        } else {
            this.ia.activo = false;
        }

        // Calcular offsets
        const numRows = this.mapa.length;
        const numCols = this.mapa[0].length;
        const { x: isoX, y: isoY } = toIso(numRows - 1, numCols - 1, this.tileSize);
        
        this.offsetX = (this.scale.width - (isoX + this.tileSize)) / 2 + this.tileSize;
        this.offsetY = (this.scale.height - (isoY + this.tileSize)) / 2 + this.tileSize * 0.8;

        // Inicializar Gráficos
        // 1. Gráfico Estático (Suelo, Paredes, Estanterías, Objetivos fijos)
        this.staticGraphics = this.add.graphics();
        
        // 2. Gráfico Dinámico (Jugador, Cajas moviéndose, IA)
        this.dynamicGraphics = this.add.graphics();

        // Dibujar escenario base
        this.dibujarMapaEstatico();
        
        // Dibujar entidades iniciales
        this.dibujarEntidadesDinamicas();

        // Input
        this.configurarInput();

        // UI
        this.crearUI();

        // Audio
        this.inicializarAudio();
    }

    dibujarMapaEstatico() {
        this.staticGraphics.clear();
        const numRows = this.mapa.length;
        const numCols = this.mapa[0].length;

        // 1. Suelo y Paredes
        const order = getDrawingOrder(numRows, numCols, this.tileSize);
        
        order.forEach(({ row, col }) => {
            const val = this.mapa[row][col];
            
            // Suelo
            drawIsoTile(this.staticGraphics, row, col, this.tileSize, this.offsetX, this.offsetY);
            
            // Paredes
            if (val === 1) {
                drawIsoSolidWall(this.staticGraphics, row, col, this.tileSize, this.offsetX, this.offsetY, gameConfig.assets.wallHeight);
            }
            
            // Estanterías (Valor 2) - DIBUJO PERSONALIZADO PARA QUE SE VEAAN BIEN
            if (val === 2) {
                this.dibujarEstanteriaPersonalizada(row, col);
            }
        });

        // 2. Objetivos (Marcadores en el suelo)
        this.posicionesObjetivo.forEach(pos => {
            // Usamos la función de markers.js o dibujamos manual si falla
            if (typeof drawIsoTargetMarker === 'function') {
                drawIsoTargetMarker(this.staticGraphics, pos.row, pos.col, this.tileSize, this.offsetX, this.offsetY);
            } else {
                // Fallback simple si la importación falla: un rombo azul
                const { x, y } = toIso(pos.row, pos.col, this.tileSize);
                const screenX = x + this.offsetX;
                const screenY = y + this.offsetY;
                
                this.staticGraphics.fillStyle(0x0088ff, 0.6);
                this.staticGraphics.beginPath();
                this.staticGraphics.moveTo(screenX, screenY - 10);
                this.staticGraphics.lineTo(screenX + 20, screenY);
                this.staticGraphics.lineTo(screenX, screenY + 10);
                this.staticGraphics.lineTo(screenX - 20, screenY);
                this.staticGraphics.closePath();
                this.staticGraphics.fillPath();
            }
        });

        // 3. Punto de Despacho
        drawIsoDispatch(this.staticGraphics, this.puntoDespacho.row, this.puntoDespacho.col, this.tileSize, this.offsetX, this.offsetY);
    }

    /**
     * Dibuja una estantería metálica transparente de 2 niveles
     */
    dibujarEstanteriaPersonalizada(row, col) {
        const { x, y } = toIso(row, col, this.tileSize);
        const screenX = x + this.offsetX;
        const screenY = y + this.offsetY;
        
        const w = this.tileSize * 0.9; // Ancho visual
        const h = this.tileSize * 0.45; // Alto visual del rombo base
        const levelHeight = 25; // Altura entre niveles

        // Color metal semitransparente
        const metalColor = 0x8899aa;
        const alpha = 0.4;

        // Función auxiliar para dibujar un rombo (estante)
        const drawShelfLayer = (offsetY_px, color, alphaVal) => {
            this.staticGraphics.fillStyle(color, alphaVal);
            this.staticGraphics.lineStyle(1, 0xffffff, 0.5);
            this.staticGraphics.beginPath();
            this.staticGraphics.moveTo(screenX, screenY - h + offsetY_px);
            this.staticGraphics.lineTo(screenX + w, screenY + offsetY_px);
            this.staticGraphics.lineTo(screenX, screenY + h + offsetY_px);
            this.staticGraphics.lineTo(screenX - w, screenY + offsetY_px);
            this.staticGraphics.closePath();
            this.staticGraphics.fillPath();
            this.staticGraphics.strokePath();
        };

        // Función auxiliar para postes verticales
        const drawPost = (x1, y1, x2, y2) => {
            this.staticGraphics.lineStyle(3, metalColor, 0.8);
            this.staticGraphics.beginPath();
            this.staticGraphics.moveTo(x1, y1);
            this.staticGraphics.lineTo(x2, y2);
            this.staticGraphics.strokePath();
        };

        // 1. Base (Suelo)
        drawShelfLayer(0, metalColor, alpha);
        
        // 2. Nivel Intermedio
        drawShelfLayer(-levelHeight, metalColor, alpha + 0.2);

        // 3. Nivel Superior (Techo de la estantería)
        drawShelfLayer(-levelHeight * 2, metalColor, alpha + 0.3);

        // 4. Postes Verticales (4 esquinas)
        // Calculamos las 4 esquinas del rombo base
        const topY = screenY - h;
        const bottomY = screenY + h;
        const leftX = screenX - w;
        const rightX = screenX + w;
        const midY = screenY;

        const totalHeight = levelHeight * 2;

        // Poste Frontal (el que se ve más claro)
        drawPost(screenX, bottomY, screenX, bottomY - totalHeight);
        // Poste Derecho
        drawPost(rightX, midY, rightX, midY - totalHeight);
        // Poste Izquierdo
        drawPost(leftX, midY, leftX, midY - totalHeight);
        // Poste Trasero (más tenue o invisible si está tapado, pero lo dibujamos para transparencia)
        drawPost(screenX, topY, screenX, topY - totalHeight, 0.2);
    }

    dibujarEntidadesDinamicas() {
        if (!this.dynamicGraphics) return;
        this.dynamicGraphics.clear();

        const entidades = [];

        // Recopilar Cajas
        this.cajas.forEach((caja, index) => {
            if (!caja.recogida) {
                entidades.push({
                    type: 'caja',
                    row: caja.row,
                    col: caja.col,
                    z: 0, // Altura base
                    data: { index }
                });
            }
        });

        // Jugador (si lleva caja, la caja va "con" él visualmente, pero la lógica es distinta)
        if (this.jugadorPos) {
            entidades.push({
                type: 'jugador',
                row: this.jugadorPos.row,
                col: this.jugadorPos.col,
                z: 1, // Un poco más alto para depth sorting correcto si pisa misma celda
                data: { cargada: this.cajaCargada !== null }
            });
        }

        // IA
        if (this.ia.activo && this.ia.pos) {
            entidades.push({
                type: 'ia',
                row: this.ia.pos.row,
                col: this.ia.pos.col,
                z: 1,
                data: { cargada: this.ia.cajaObjetivo !== null }
            });
        }

        // ORDENAR POR PROFUNDIDAD (Y isométrico + pequeño offset Z si fuera necesario)
        entidades.sort((a, b) => {
            const isoA = toIso(a.row, a.col, this.tileSize);
            const isoB = toIso(b.row, b.col, this.tileSize);
            return isoA.y - isoB.y;
        });

        // DIBUJAR
        entidades.forEach(ent => {
            if (ent.type === 'caja') {
                drawIsoBox(this.dynamicGraphics, ent.row, ent.col, this.tileSize, this.offsetX, this.offsetY, false);
            } else if (ent.type === 'jugador') {
                // Si lleva caja, drawIsoForklift debe dibujar la caja integrada o aparte
                // Asumimos que drawIsoForklift maneja el flag 'carrying'
                drawIsoForklift(
                    this.dynamicGraphics, 
                    ent.row, ent.col, 
                    this.tileSize, this.offsetX, this.offsetY,
                    'player', 
                    ent.data.cargada, 
                    this.jugadorDireccion
                );
            } else if (ent.type === 'ia') {
                drawIsoForklift(
                    this.dynamicGraphics,
                    ent.row, ent.col,
                    this.tileSize, this.offsetX, this.offsetY,
                    'ai',
                    ent.data.cargada,
                    this.ia.direccion
                );
            }
        });
    }

    configurarInput() {
        this.teclasCursor = this.input.keyboard.createCursorKeys();
        this.teclaEspacio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Movimiento con Auto-Repeat
        this.input.keyboard.on('keydown', (event) => {
            if ([Phaser.Input.Keyboard.KeyCodes.UP, Phaser.Input.Keyboard.KeyCodes.DOWN, Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.RIGHT].includes(event.keyCode)) {
                if (!this.timerAutoRepeat) {
                    let dir = null;
                    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.UP) dir = { row: -1, col: 0 };
                    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN) dir = { row: 1, col: 0 };
                    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT) dir = { row: 0, col: -1 };
                    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) dir = { row: 0, col: 1 };

                    if (dir) {
                        this.intentatMover(dir);
                        this.timerAutoRepeat = this.time.addEvent({
                            delay: this.movementDelayInitial,
                            callback: () => {
                                this.timerAutoRepeat = this.time.addEvent({
                                    delay: this.movementRepeatInterval,
                                    callback: () => this.intentatMover(dir),
                                    loop: true
                                });
                            },
                            loop: false
                        });
                    }
                }
            }
            
            // Acción con ESPACIO
            if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
                this.gestionarAccionEspacio();
            }
        });

        this.input.keyboard.on('keyup', () => {
            if (this.timerAutoRepeat) {
                this.timerAutoRepeat.remove();
                this.timerAutoRepeat = null;
            }
        });
    }

    gestionarAccionEspacio() {
        if (this.cajaCargada !== null) {
            // Intentar SOLTAR caja
            this.intentarSoltarCaja();
        } else {
            // Intentar RECOGER caja
            this.intentarRecogerCajaAdyacente();
        }
    }

    intentarRecogerCajaAdyacente() {
        // Buscar en las 4 direcciones adyacentes
        const dirs = [
            { row: -1, col: 0 }, { row: 1, col: 0 },
            { row: 0, col: -1 }, { row: 0, col: 1 }
        ];

        for (let d of dirs) {
            const r = this.jugadorPos.row + d.row;
            const c = this.jugadorPos.col + d.col;

            const idx = this.cajas.findIndex(caja => !caja.recogida && caja.row === r && caja.col === c);
            
            if (idx !== -1) {
                // Encontrada caja adyacente
                this.cajaCargada = idx;
                this.cajas[idx].recogida = true; // Desaparece del suelo
                
                this.reproducirSonido('recoger', 0.6);
                this.dibujarEntidadesDinamicas();
                return;
            }
        }
        // Sonido de error si no hay caja
        this.reproducirSonido('colision', 0.3);
    }

    intentarSoltarCaja() {
        if (this.cajaCargada === null) return;

        // Solo permitir soltar si estamos ADYACENTES a un OBJETIVO
        // Y soltarla SOBRE el objetivo
        let objetivoEncontrado = null;

        const dirs = [
            { row: -1, col: 0 }, { row: 1, col: 0 },
            { row: 0, col: -1 }, { row: 0, col: 1 }
        ];

        for (let d of dirs) {
            const r = this.jugadorPos.row + d.row;
            const c = this.jugadorPos.col + d.col;

            // Verificar si esa celda es un objetivo
            const esObjetivo = this.posicionesObjetivo.some(obj => obj.row === r && obj.col === c);
            
            if (esObjetivo) {
                // Verificar que el objetivo esté vacío (no haya otra caja)
                const hayCaja = this.cajas.some(caja => !caja.recogida && caja.row === r && caja.col === c);
                if (!hayCaja) {
                    objetivoEncontrado = { row: r, col: c };
                    break;
                }
            }
        }

        if (objetivoEncontrado) {
            // SOLTAR EN OBJETIVO
            const caja = this.cajas[this.cajaCargada];
            caja.row = objetivoEncontrado.row;
            caja.col = objetivoEncontrado.col;
            caja.recogida = false; // Vuelve a ser visible en el nuevo lugar
            this.cajaCargada = null;

            this.reproducirSonido('soltar', 0.8);
            this.dibujarEntidadesDinamicas();
            this.verificarCondicionVictoria();
        } else {
            // INTENTO DE SOLTAR EN LUGAR INVÁLIDO
            // Feedback visual o sonoro de error
            this.reproducirSonido('colision', 0.5);
            
            // Opcional: Mostrar texto flotante "Solo en objetivos"
            const txt = this.add.text(
                this.scale.width/2, 
                this.scale.height/2 - 50, 
                "¡Solo en zonas azules!", 
                { font: '20px Arial', fill: '#ff0000', stroke: '#000', strokeThickness: 3 }
            ).setOrigin(0.5);
            
            this.tweens.add({
                targets: txt,
                y: txt.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => txt.destroy()
            });
        }
    }

    intentatMover(direccion) {
        if (!this.jugadorPos) return;

        this.jugadorDireccion = direccion;

        const nuevaRow = this.jugadorPos.row + direccion.row;
        const nuevaCol = this.jugadorPos.col + direccion.col;

        // Límites
        if (nuevaRow < 0 || nuevaRow >= this.mapa.length || 
            nuevaCol < 0 || nuevaCol >= this.mapa[0].length) {
            return;
        }

        // Paredes
        if (this.mapa[nuevaRow][nuevaCol] === 1) {
            this.reproducirSonido('colision', 0.3);
            return;
        }

        // Colisión con IA
        if (this.ia.activo && this.ia.pos.row === nuevaRow && this.ia.pos.col === nuevaCol) {
            this.reproducirSonido('colision', 0.3);
            return;
        }

        // Colisión con Cajas (NO recoger automático, solo bloquear o empujar si quisiéramos)
        // En este diseño: BLOQUEA. El jugador debe usar ESPACIO para recoger.
        const cajaIndex = this.cajas.findIndex(c => !c.recogida && c.row === nuevaRow && c.col === nuevaCol);
        if (cajaIndex !== -1) {
            this.reproducirSonido('colision', 0.3);
            return; 
        }

        // Mover
        this.jugadorPos.row = nuevaRow;
        this.jugadorPos.col = nuevaCol;
        this.reproducirSonido('mover', 0.4);

        this.dibujarEntidadesDinamicas();

        // Turno IA
        if (this.ia.activo) {
            this.time.delayedCall(300, () => this.ejecutarTurnoIA());
        }
    }

    ejecutarTurnoIA() {
        if (!this.ia.activo) return;

        let objetivo = null;
        
        // 1. Validar estado actual de la IA y sus objetivos
        if (this.ia.cajaObjetivo === null) {
            // Buscar caja disponible
            // Filtramos solo cajas que NO estén recogidas Y que NO sea la que tiene el jugador
            const cajasDisponibles = this.cajas.filter(c => {
                // Verificamos que la caja exista y tenga coordenadas válidas
                if (!c || c.row === undefined || c.col === undefined) return false;
                // No debe estar recogida
                if (c.recogida) return false;
                // No debe ser la que tiene el jugador cargada
                if (this.cajaCargada !== null && this.cajas[this.cajaCargada] === c) return false;
                return true;
            });
            
            if (cajasDisponibles.length === 0) {
                // No hay cajas, idle
                return;
            }

            // Encontrar la más cercana (Manhattan distance)
            let minDist = Infinity;
            let cajaCercana = null;
            
            cajasDisponibles.forEach(caja => {
                // Validación extra de coordenadas antes de calcular
                if (typeof caja.row !== 'number' || typeof caja.col !== 'number') return;

                const dist = Math.abs(caja.row - this.ia.pos.row) + Math.abs(caja.col - this.ia.pos.col);
                if (dist < minDist) {
                    minDist = dist;
                    cajaCercana = caja;
                }
            });

            if (cajaCercana) {
                this.ia.cajaObjetivo = cajaCercana;
                objetivo = { row: cajaCercana.row, col: cajaCercana.col };
            }
        } else {
            // Tiene caja asignada como objetivo
            // VERIFICACIÓN CRÍTICA: ¿La caja objetivo sigue siendo válida?
            const idxObjetivo = this.cajas.indexOf(this.ia.cajaObjetivo);
            const esLaDelJugador = (this.cajaCargada !== null && this.cajas[this.cajaCargada] === this.ia.cajaObjetivo);
            
            // Si la caja fue recogida por alguien, ya no está en el suelo, o no existe en el array
            if (idxObjetivo === -1 || this.ia.cajaObjetivo.recogida || esLaDelJugador) {
                // Objetivo inválido, resetear y buscar otra
                this.ia.cajaObjetivo = null;
                // Recursivamente llamar de nuevo para buscar un nuevo objetivo inmediatamente
                this.ejecutarTurnoIA(); 
                return;
            }

            objetivo = { row: this.ia.cajaObjetivo.row, col: this.ia.cajaObjetivo.col };
        }

        if (!objetivo) return;

        // Pathfinding básico (Greedy)
        const dr = objetivo.row - this.ia.pos.row;
        const dc = objetivo.col - this.ia.pos.col;

        let movimiento = null;

        if (Math.abs(dr) > Math.abs(dc)) {
            movimiento = { row: dr > 0 ? 1 : -1, col: 0 };
        } else {
            movimiento = { row: 0, col: dc > 0 ? 1 : -1 };
        }

        // Validar movimiento
        const nuevaRow = this.ia.pos.row + movimiento.row;
        const nuevaCol = this.ia.pos.col + movimiento.col;

        let puedeMover = true;

        // Límites del mapa
        if (nuevaRow < 0 || nuevaRow >= this.mapa.length || 
            nuevaCol < 0 || nuevaCol >= this.mapa[0].length) {
            puedeMover = false;
        }

        // Paredes
        if (puedeMover && this.mapa[nuevaRow][nuevaCol] === 1) puedeMover = false;
        
        // Jugador
        if (puedeMover && this.jugadorPos.row === nuevaRow && this.jugadorPos.col === nuevaCol) puedeMover = false;

        // Cajas en el suelo (la IA no empuja)
        if (puedeMover) {
            const hayCaja = this.cajas.some(c => !c.recogida && c.row === nuevaRow && c.col === nuevaCol);
            if (hayCaja) puedeMover = false;
        }

        if (puedeMover) {
            this.ia.pos.row = nuevaRow;
            this.ia.pos.col = nuevaCol;
            this.ia.direccion = movimiento;

            // Si llega a la caja, la "recoge" (lógicamente)
            if (this.ia.cajaObjetivo && 
                this.ia.pos.row === this.ia.cajaObjetivo.row && 
                this.ia.pos.col === this.ia.cajaObjetivo.col) {
                
                // Marcamos como recogida para que no se dibuje ni colisione
                this.ia.cajaObjetivo.recogida = true;
                // La IA ahora "tiene" la caja (visualmente lo manejaremos en el draw)
                // Nota: Para simplificar, no usamos un flag 'iaCargada' separado, 
                // asumimos que si cajaObjetivo != null y está recogida, la lleva.
            }

            // Si llega al punto de despacho con una caja
            // Verificamos si la IA tiene una caja cargada (su objetivo está recogido)
            if (this.ia.cajaObjetivo && this.ia.cajaObjetivo.recogida &&
                this.ia.pos.row === this.puntoDespacho.row && 
                this.ia.pos.col === this.puntoDespacho.col) {
                
                // ¡Éxito! Caja depositada.
                // Eliminamos la caja del array permanentemente
                const idx = this.cajas.indexOf(this.ia.cajaObjetivo);
                if (idx !== -1) {
                    this.cajas.splice(idx, 1);
                }
                this.ia.cajaObjetivo = null; // Resetear estado
                
                // Opcional: Sonido de éxito o puntos
                // this.reproducirSonido('victoria'); 
            }

            // Redibujar entidades para mostrar nuevo estado
            this.dibujarEntidadesDinamicas();
        } else {
            // Bloqueada: intentar movimiento alternativo (eje secundario) si es posible
            // Solo si no hemos intentado ya este turno (lógica simple)
            const movAlt = { row: movimiento.col, col: movimiento.row };
            const altRow = this.ia.pos.row + movAlt.row;
            const altCol = this.ia.pos.col + movAlt.col;
            
            let puedeMoverAlt = true;
            if (altRow < 0 || altRow >= this.mapa.length || altCol < 0 || altCol >= this.mapa[0].length) puedeMoverAlt = false;
            if (puedeMoverAlt && this.mapa[altRow][altCol] === 1) puedeMoverAlt = false;
            if (puedeMoverAlt && this.jugadorPos.row === altRow && this.jugadorPos.col === altCol) puedeMoverAlt = false;
            if (puedeMoverAlt) {
                 const hayCajaAlt = this.cajas.some(c => !c.recogida && c.row === altRow && c.col === altCol);
                 if (hayCajaAlt) puedeMoverAlt = false;
            }

            if (puedeMoverAlt) {
                this.ia.pos.row = altRow;
                this.ia.pos.col = altCol;
                this.ia.direccion = movAlt;
                this.dibujarEntidadesDinamicas();
            }
        }
    }

    verificarCondicionVictoria() {
        let todasEnObjetivo = true;

        // Verificar que cada posición de objetivo tenga una caja
        for (let obj of this.posicionesObjetivo) {
            const hayCaja = this.cajas.some(c => !c.recogida && c.row === obj.row && c.col === obj.col);
            if (!hayCaja) {
                todasEnObjetivo = false;
                break;
            }
        }

        // También verificar que no queden cajas fuera de los objetivos (opcional, depende de la regla)
        // Regla estricta: Todas las cajas del nivel deben estar en algún objetivo.
        const cajasEnObjetivoCount = this.cajas.filter(c => !c.recogida && 
            this.posicionesObjetivo.some(obj => obj.row === c.row && obj.col === c.col)
        ).length;

        if (todasEnObjetivo && cajasEnObjetivoCount === this.posicionesObjetivo.length && this.posicionesObjetivo.length > 0) {
            this.reproducirSonido('victoria', 1.0);
            this.mostrarMensaje("¡NIVEL COMPLETADO!");
            this.time.delayedCall(2500, () => {
                this.scene.start('GameScene', { nivel: this.nivelActual + 1 });
            });
        }
    }

    crearUI() {
        const style = { font: 'bold 24px Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 4 };
        this.add.text(20, 20, `Nivel: ${this.nivelActual + 1}`, style);
        
        const instr = this.add.text(20, 50, 'Flechas: Mover | ESPACIO: Recoger/Soltar', { font: '18px Arial', fill: '#cccccc' });
        instr.setShadow(2, 2, '#000000', 2, false, true);
    }

    mostrarMensaje(texto) {
        const estilo = { font: 'bold 48px Arial', fill: '#ffff00', stroke: '#000000', strokeThickness: 8, align: 'center' };
        const textoObj = this.add.text(this.scale.width / 2, this.scale.height / 2, texto, estilo);
        textoObj.setOrigin(0.5);
        textoObj.setDepth(1000);
        
        this.tweens.add({
            targets: textoObj,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: 1
        });
    }

    // --- Métodos de Audio (Copiados de la respuesta anterior para asegurar existencia) ---
    inicializarAudio() {
        const sonidos = ['mover', 'colision', 'recoger', 'soltar', 'victoria'];
        sonidos.forEach(key => {
            if (this.cache.audio.exists(key)) return;
            try {
                let context = this.sound.context;
                if (!context) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (AudioContext) context = new AudioContext();
                    else return;
                }
                const duration = 0.2;
                const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) {
                    const t = i / context.sampleRate;
                    let sample = 0;
                    switch (key) {
                        case 'mover': sample = Math.sin(2 * Math.PI * 400 * t) * Math.exp(-t * 10); break;
                        case 'colision': sample = (Math.random() * 2 - 1) * 0.5 * Math.exp(-t * 15); break;
                        case 'recoger': sample = Math.sin(2 * Math.PI * (300 + t * 600) * t) * Math.exp(-t * 5); break;
                        case 'soltar': sample = Math.sin(2 * Math.PI * (600 - t * 400) * t) * Math.exp(-t * 8); break;
                        case 'victoria': sample = (Math.sin(2 * Math.PI * 523.25 * t) + Math.sin(2 * Math.PI * 659.25 * t)) * 0.5 * Math.exp(-t * 2); break;
                        default: sample = Math.sin(2 * Math.PI * 440 * t);
                    }
                    data[i] = sample;
                }
                this.cache.audio.add(key, buffer);
            } catch (e) { console.warn("Audio error", e); }
        });
    }

    reproducirSonido(key, volume = 1) {
        if (this.cache.audio.exists(key)) {
            this.sound.play(key, { volume: volume });
        }
    }

    update() {
        // Loop vacío
    }
}