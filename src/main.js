// src/main.js
import Phaser from 'phaser';
import { niveles } from './levels.js';
import {
    toIso,
    drawIsoTile,
    drawIsoSolidWall,
    drawIsoShelf,
    drawIsoShelfBox,
    drawIsoBox,
    drawIsoForklift,
    drawIsoTarget,
    drawIsoDispatch,
    getDrawingOrder,
    setCurrentMapSize
} from './render.js';

class MiEscena extends Phaser.Scene {
    constructor() {
        super('MiEscena');
    }

    create() {
        this.input.keyboard.enabled = true;
        
        if (this.registry.has('nivelActual')) {
            this.nivelActual = this.registry.get('nivelActual');
        } else {
            this.nivelActual = 0;
            this.registry.set('nivelActual', 0);
        }

        const nivel = niveles[this.nivelActual];
        
        this.mapa = nivel.mapa;

        setCurrentMapSize(this.mapa.length);

        this.cajas = JSON.parse(JSON.stringify(nivel.cajas));
        this.posicionesObjetivo = nivel.posicionesObjetivo;
        this.tileSize = 60;

        // Offset para perspectiva asimétrica
        // Calcular bounds del mapa en coordenadas de pantalla
        // IMPORTANTE: Incluir la altura de las paredes (65px máximo)
        const WALL_HEIGHT = 65;
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (let row = 0; row < this.mapa.length; row++) {
            for (let col = 0; col < this.mapa[0].length; col++) {
                const { x, y } = toIso(row, col, this.tileSize);
                minX = Math.min(minX, x - this.tileSize);  // Margen izquierdo
                maxX = Math.max(maxX, x + this.tileSize);  // Margen derecho
                minY = Math.min(minY, y - WALL_HEIGHT);    // Parte superior de paredes
                maxY = Math.max(maxY, y + this.tileSize);  // Margen inferior
            }
        }

        const mapWidth = maxX - minX;
        const mapHeight = maxY - minY;

        // Centrar el mapa en el canvas (1024x800)
        this.offsetX = (1024 - mapWidth) / 2 - minX;
        this.offsetY = (800 - mapHeight) / 2 - minY;
              
        this.jugadorRow = nivel.jugadorInicio.row;
        this.jugadorCol = nivel.jugadorInicio.col;
        
        this.cargado = false;
        this.cajaCargada = null;
        this.juegoTerminado = false;
        this.turnos = 0;

        // SISTEMA DE IA
        this.ia = {
            row: nivel.ia.inicio.row,
            col: nivel.ia.inicio.col,
            cargado: false,
            cajaCargada: null,
            cajasAcopiadas: JSON.parse(JSON.stringify(nivel.ia.cajasAcopiadas)),
            puntoDespacho: { ...nivel.ia.puntoDespacho },
            estado: 'buscando_caja',
            camino: [],
            indiceCamino: 0,
            objetivoActual: null
        };

        // Auto-repeat
        this.teclaMovimientoActiva = null;
        this.timerMovimiento = null;
        this.delayInicial = 200;
        this.intervaloRepeticion = 150;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Graphics para elementos que se redibujan
        this.mapaGraphics = this.add.graphics();
        this.objetivosGraphics = this.add.graphics();
        this.despachoGraphics = this.add.graphics();
        this.cajasGraphics = [];
        this.cajasAcopiadasGraphics = [];
        this.estanteriasGraphics = [];  // 🔧 Nuevo array para estanterías individuales
        this.jugadorGraphics = this.add.graphics();
        this.iaGraphics = this.add.graphics();
        this.resaltadoIA = this.add.graphics();
        this.tweenResaltado = null;

        // Dibujar todo
        this.dibujarMapa();
        this.cajasDecorativas = nivel.cajasDecorativas || [];
        this.dibujarCajasDecorativas();
        this.dibujarCajas();
        this.dibujarCajasAcopiadas();
        this.dibujarMontacargas();
        this.dibujarMontacargasIA();

        // UI
        this.textoNivel = this.add.text(10, 10, nivel.nombre, {
            fontSize: '24px',
            color: '#fff',
            fontStyle: 'bold'
        });

        this.textoDescripcion = this.add.text(10, 40, nivel.descripcion, {
            fontSize: '14px',
            color: '#aaa'
        });

        this.textoEstado = this.add.text(10, 680, 'Estado: Vacío', {
            fontSize: '20px',
            color: '#fff'
        });

        this.textoTurnos = this.add.text(300, 680, 'Turnos: 0', {
            fontSize: '20px',
            color: '#fff'
        });

        this.textoProgreso = this.add.text(500, 680, 
            `Entregas: 0/${this.posicionesObjetivo.length}`, {
            fontSize: '20px',
            color: '#00ffff'
        });

        this.textoIA = this.add.text(10, 620, '', {
            fontSize: '16px',
            color: '#66ccff'
        });
        this.actualizarTextoIA();

        this.textoAyuda = this.add.text(10, 650, 
            'Flechas: mover | ESPACIO: recoger/soltar | R: reiniciar | N/P: nivel', {
            fontSize: '14px',
            color: '#aaa'
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.keyN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
        this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        // Timer independiente de la IA
        this.timerIA = this.time.addEvent({
            delay: 350,
            callback: this.turnoIA,
            callbackScope: this,
            loop: true
        });
    }

    // ============ DIBUJO ISOMÉTRICO ============

    dibujarMapa() {
        this.mapaGraphics.clear();
        this.objetivosGraphics.clear();
        
        // 🔧 Limpiar estanterías anteriores para evitar memory leaks
        if (this.estanteriasGraphics) {
            this.estanteriasGraphics.forEach(g => g.destroy());
        }
        
        const numRows = this.mapa.length;
        const numCols = this.mapa[0].length;
        const orden = getDrawingOrder(numRows, numCols, this.tileSize);
        
        // 🔧 REFACTORIZACIÓN: Graphics individuales por estantería para depth dinámico
        this.estanteriasGraphics = [];
        
        for (const { row, col } of orden) {
            const tile = this.mapa[row][col];
            
            if (tile === 0) {
                drawIsoTile(this.mapaGraphics, row, col, this.tileSize, this.offsetX, this.offsetY);
                
                const objetivo = this.posicionesObjetivo.find(p => p.row === row && p.col === col);
                if (objetivo) {
                    drawIsoTarget(this.objetivosGraphics, row, col, this.tileSize, this.offsetX, this.offsetY);
                }
                
                if (this.ia.puntoDespacho.row === row && this.ia.puntoDespacho.col === col) {
                    drawIsoDispatch(this.despachoGraphics, row, col, this.tileSize, this.offsetX, this.offsetY);
                }
            }
            else if (tile === 1) {
                // Diferenciar paredes perimetrales (borde del mapa) de interiores
                const esPerimetral = row === 0 || row === numRows - 1 || 
                                    col === 0 || col === numCols - 1;
                
                if (esPerimetral) {
                    // Pared perimetral: bloque de cemento sólido
                    drawIsoSolidWall(this.mapaGraphics, row, col, this.tileSize, 
                                    this.offsetX, this.offsetY, 55);
                } else {
                    // 🔧 ESTANTERÍA INTERIOR con graphics individual para depth dinámico
                    const estanteriaGraphics = this.add.graphics();
                    this.estanteriasGraphics.push(estanteriaGraphics);
                    
                    drawIsoShelf(estanteriaGraphics, row, col, this.tileSize, 
                                this.offsetX, this.offsetY, 65);
                    
                    // 🔧 DEPTH DINÁMICO para estanterías (detrás del suelo)
                    const { y } = toIso(row, col, this.tileSize);
                    estanteriaGraphics.setDepth(y + this.offsetY - 65);
                }
            }
        }
    }


    dibujarCajas() {
        this.cajasGraphics = [];
        this.cajas.forEach(caja => {
            const graphics = this.add.graphics();
            this.cajasGraphics.push(graphics);
            // Dibujar la caja en su ESTANTERÍA con color cartón/amarillo
            this.dibujarCajaEnEstanteria(caja, graphics, 0xcc9933);
        });
    }

    dibujarCajaEnEstanteria(caja, graphics, color) {
        graphics.clear();
        
        // Si la caja ya fue entregada o recogida, no dibujarla
        if (caja.entregada || caja.recogidaPorJugador) {
            graphics.setVisible(false);
            return;
        }
        
        graphics.setVisible(true);
        
        // Dibujar en la posición de la ESTANTERÍA, no en la posición de la caja
        const est = caja.estanteria;
        const nivel = caja.nivel !== undefined ? caja.nivel : 0;
        
        drawIsoShelfBox(graphics, est.row, est.col, this.tileSize, 
                    this.offsetX, this.offsetY, nivel, color);
        
        // 🔧 DEPTH DINÁMICO: y de pantalla - altura del nivel en estantería
        const { y } = toIso(est.row, est.col, this.tileSize);
        const shelfHeight = 65;
        const numShelves = 3;
        const alturaCaja = (shelfHeight / numShelves) * nivel;
        graphics.setDepth(y + this.offsetY - alturaCaja);
    }

    dibujarCajasDecorativas() {
        this.cajasDecorativasGraphics = [];
        
        this.cajasDecorativas.forEach(cajaDec => {
            const graphics = this.add.graphics();
            this.cajasDecorativasGraphics.push(graphics);
            
            drawIsoShelfBox(graphics, cajaDec.row, cajaDec.col, this.tileSize, 
                        this.offsetX, this.offsetY, cajaDec.nivel, 0x886644);
            
            // 🔧 DEPTH DINÁMICO para decorativas
            const { y } = toIso(cajaDec.row, cajaDec.col, this.tileSize);
            const shelfHeight = 65;
            const numShelves = 3;
            const alturaCaja = (shelfHeight / numShelves) * cajaDec.nivel;
            graphics.setDepth(y + this.offsetY - alturaCaja);
        });
    }

    dibujarCajasAcopiadas() {
        this.cajasAcopiadasGraphics.forEach(g => g.destroy());
        this.cajasAcopiadasGraphics = [];
        
        this.ia.cajasAcopiadas.forEach(caja => {
            const graphics = this.add.graphics();
            this.cajasAcopiadasGraphics.push(graphics);
            this.dibujarCajaIndividual(caja, graphics, 0x6666cc);
            
            // 🔧 DEPTH DINÁMICO para cajas acopiadas de la IA
            if (!caja.despachada && !caja.recogidaPorIA) {
                const { y } = toIso(caja.row, caja.col, this.tileSize);
                graphics.setDepth(y + this.offsetY);
            }
        });
    }

    dibujarCajaIndividual(caja, graphics, color) {
        graphics.clear();
        if (caja.entregada || caja.despachada || caja.recogidaPorIA) {
            graphics.setVisible(false);
            return;
        }
        graphics.setVisible(true);
        drawIsoBox(graphics, caja.row, caja.col, this.tileSize, this.offsetX, this.offsetY, color);
        
        // 🔧 DEPTH DINÁMICO para cajas en piso (sin ajuste de altura)
        const { y } = toIso(caja.row, caja.col, this.tileSize);
        graphics.setDepth(y + this.offsetY);
    }

    dibujarMontacargas() {
        this.actualizarGraficoMontacargas();
    }

    dibujarMontacargasIA() {
        this.actualizarGraficoIA();
    }

    actualizarGraficoMontacargas() {
        this.jugadorGraphics.clear();
        drawIsoForklift(this.jugadorGraphics, 
            this.jugadorRow, 
            this.jugadorCol, 
            this.tileSize, 
            this.offsetX, 
            this.offsetY, 
            'player', 
            this.cargado
        );
        const { y } = toIso(this.jugadorRow, this.jugadorCol, this.tileSize);
        this.jugadorGraphics.setDepth(y + this.offsetY);
    }

    actualizarGraficoIA() {
        this.iaGraphics.clear();
        drawIsoForklift(this.iaGraphics, 
            this.ia.row, 
            this.ia.col, 
            this.tileSize, 
            this.offsetX, 
            this.offsetY, 
            'ai', 
            this.ia.cargado
        );
        const { y } = toIso(this.ia.row, this.ia.col, this.tileSize);
        this.iaGraphics.setDepth(y + this.offsetY);
    }

    // ============ RESALTADO DE CAJA OBJETIVO DE LA IA ============

    resaltarCajaObjetivoIA() {
        this.resaltadoIA.clear();
        if (this.tweenResaltado) {
            this.tweenResaltado.stop();
            this.tweenResaltado = null;
        }
        if (this.resaltadoIA.textoIndicator) {
            this.resaltadoIA.textoIndicator.destroy();
            this.resaltadoIA.textoIndicator = null;
        }
        
        if (!this.ia.objetivoActual) return;
        
        const caja = this.ia.objetivoActual;
        // Resaltar la ESTANTERÍA, no la posición de la caja
        const { x, y } = toIso(caja.estanteria.row, caja.estanteria.col, this.tileSize);
        const screenX = x + this.offsetX;
        const screenY = y + this.offsetY;
        
        // Contorno magenta
        this.resaltadoIA.lineStyle(4, 0xff00ff, 1);
        const size = this.tileSize * 1.3;
        this.resaltadoIA.strokeRect(screenX - size, screenY - size - 35, size * 2, size * 2);

        // Texto "OBJETIVO IA"
        const texto = this.add.text(screenX, screenY - size - 50, 'OBJETIVO IA', {
            fontSize: '12px',
            color: '#ff00ff',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);

        this.resaltadoIA.textoIndicator = texto;
        
        // Parpadeo
        this.resaltadoIA.setAlpha(1);
        this.tweenResaltado = this.tweens.add({
            targets: this.resaltadoIA,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    limpiarResaltadoIA() {
        this.resaltadoIA.clear();
        if (this.tweenResaltado) {
            this.tweenResaltado.stop();
            this.tweenResaltado = null;
        }
        if (this.resaltadoIA.textoIndicator) {
            this.resaltadoIA.textoIndicator.destroy();
            this.resaltadoIA.textoIndicator = null;
        }
    }

    // ============ PATHFINDING (BFS) ============

    buscarCamino(inicioRow, inicioCol, objetivoRow, objetivoCol) {
        const cola = [{ row: inicioRow, col: inicioCol, path: [] }];
        const visitados = new Set();
        visitados.add(`${inicioRow},${inicioCol}`);
        
        while (cola.length > 0) {
            const actual = cola.shift();
            
            if (actual.row === objetivoRow && actual.col === objetivoCol) {
                return actual.path;
            }
            
            const direcciones = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of direcciones) {
                const nr = actual.row + dr;
                const nc = actual.col + dc;
                const key = `${nr},${nc}`;
                
                if (nr < 0 || nr >= this.mapa.length) continue;
                if (nc < 0 || nc >= this.mapa[0].length) continue;
                if (this.mapa[nr][nc] === 1) continue;
                if (visitados.has(key)) continue;
                
                visitados.add(key);
                cola.push({ 
                    row: nr, 
                    col: nc, 
                    path: [...actual.path, { row: nr, col: nc }] 
                });
            }
        }
        
        return [];
    }

    encontrarCajaAcopiadaMasCercana() {
        let cajaMasCercana = null;
        let distanciaMinima = Infinity;
        
        for (const caja of this.ia.cajasAcopiadas) {
            if (caja.despachada || caja.recogidaPorIA) continue;
            
            const dist = Math.abs(caja.row - this.ia.row) + Math.abs(caja.col - this.ia.col);
            if (dist < distanciaMinima) {
                distanciaMinima = dist;
                cajaMasCercana = caja;
            }
        }
        
        return cajaMasCercana;
    }

    // ============ TURNO DE LA IA ============

    turnoIA() {
        if (this.juegoTerminado) return;

        if (this.ia.estado === 'buscando_caja') {
            const caja = this.encontrarCajaAcopiadaMasCercana();
            if (!caja) {
                this.limpiarResaltadoIA();
                return;
            }
            
            this.ia.objetivoActual = caja;
            // La IA va a la ESTANTERÍA, no a la caja
            this.ia.camino = this.buscarCamino(
                this.ia.row, this.ia.col, 
                caja.estanteria.row, caja.estanteria.col
            );
            this.ia.indiceCamino = 0;
            this.ia.estado = 'yendo_a_caja';
            
            this.resaltarCajaObjetivoIA();
        }

        if (this.ia.estado === 'yendo_a_caja') {
            if (this.ia.indiceCamino >= this.ia.camino.length) {
                this.ia.cargado = true;
                this.ia.cajaCargada = this.ia.objetivoActual;
                this.ia.objetivoActual.recogidaPorIA = true;
                
                const indice = this.ia.cajasAcopiadas.indexOf(this.ia.cajaCargada);
                if (indice >= 0) {
                    this.cajasAcopiadasGraphics[indice].setVisible(false);
                }
                
                this.limpiarResaltadoIA();
                
                this.ia.camino = this.buscarCamino(
                    this.ia.row, this.ia.col,
                    this.ia.puntoDespacho.row, this.ia.puntoDespacho.col
                );
                this.ia.indiceCamino = 0;
                this.ia.estado = 'yendo_a_despacho';
                this.reproducirSonido('ia_recoger');
            } else {
                const paso = this.ia.camino[this.ia.indiceCamino];
                this.ia.row = paso.row;
                this.ia.col = paso.col;
                this.ia.indiceCamino++;
            }
        }
        else if (this.ia.estado === 'yendo_a_despacho') {
            if (this.ia.indiceCamino >= this.ia.camino.length) {
                this.ia.cajaCargada.despachada = true;
                this.ia.cargado = false;
                this.ia.cajaCargada = null;
                this.ia.objetivoActual = null;
                
                this.ia.estado = 'buscando_caja';
                this.ia.camino = [];
                this.ia.indiceCamino = 0;
                
                this.reproducirSonido('ia_despachar');
                this.actualizarTextoIA();
                
                const { x, y } = toIso(this.ia.puntoDespacho.row, this.ia.puntoDespacho.col, this.tileSize);
                this.crearEfectoParticulas(x + this.offsetX, y + this.offsetY, 0xff4400, 15);
            } else {
                const paso = this.ia.camino[this.ia.indiceCamino];
                this.ia.row = paso.row;
                this.ia.col = paso.col;
                this.ia.indiceCamino++;
            }
        }

        this.actualizarGraficoIA();
        this.verificarColisionIA();
    }

    verificarColisionIA() {
        if (this.ia.row === this.jugadorRow && this.ia.col === this.jugadorCol) {
            this.mostrarDerrotaColision();
        }
    }

    mostrarDerrotaColision() {
        this.juegoTerminado = true;
        this.detenerMovimientoContinuo();
        this.timerIA.remove();
        this.reproducirSonido('derrota');
        
        const { x, y } = toIso(this.jugadorRow, this.jugadorCol, this.tileSize);
        this.crearEfectoParticulas(x + this.offsetX, y + this.offsetY, 0xff0000, 40);

        this.add.text(300, 280, '¡COLISIÓN!', {
            fontSize: '64px',
            color: '#f00',
            fontStyle: 'bold'
        });
        this.add.text(200, 350, 'Chocaste con el otro montacargas', {
            fontSize: '24px',
            color: '#fff'
        });
        this.input.keyboard.enabled = false;
    }

    actualizarTextoIA() {
        const pendientes = this.ia.cajasAcopiadas.filter(c => !c.despachada).length;
        const despachadas = this.ia.cajasAcopiadas.filter(c => c.despachada).length;
        this.textoIA.setText(`IA: ${despachadas} despachadas | ${pendientes} pendientes`);
    }

    // ============ UPDATE Y MOVIMIENTO DEL JUGADOR ============

    update() {
        if (this.juegoTerminado) return;

        if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            this.accionRecogerSoltar();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
            this.reiniciarNivel();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyN)) {
            this.siguienteNivel();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyP)) {
            this.nivelAnterior();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.iniciarMovimientoContinuo('left', -1, 0);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.iniciarMovimientoContinuo('right', 1, 0);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.iniciarMovimientoContinuo('up', 0, -1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.iniciarMovimientoContinuo('down', 0, 1);
        }
    }

    iniciarMovimientoContinuo(tecla, dx, dy) {
        this.detenerMovimientoContinuo();
        
        const exito = this.intentarMover(dx, dy);
        
        if (exito) {
            this.teclaMovimientoActiva = { tecla, dx, dy };
            this.timerMovimiento = this.time.delayedCall(this.delayInicial, () => {
                this.iniciarRepeticion();
            });
        }
    }

    iniciarRepeticion() {
        if (!this.teclaMovimientoActiva) return;
        
        const { dx, dy } = this.teclaMovimientoActiva;
        
        this.timerMovimiento = this.time.addEvent({
            delay: this.intervaloRepeticion,
            callback: () => {
                if (this.teclaEstaPresionada(this.teclaMovimientoActiva.tecla)) {
                    const exito = this.intentarMover(dx, dy);
                    if (!exito) {
                        this.detenerMovimientoContinuo();
                    }
                } else {
                    this.detenerMovimientoContinuo();
                }
            },
            loop: true
        });
    }

    teclaEstaPresionada(tecla) {
        switch(tecla) {
            case 'left': return this.cursors.left.isDown;
            case 'right': return this.cursors.right.isDown;
            case 'up': return this.cursors.up.isDown;
            case 'down': return this.cursors.down.isDown;
            default: return false;
        }
    }

    detenerMovimientoContinuo() {
        if (this.timerMovimiento) {
            this.timerMovimiento.remove();
            this.timerMovimiento = null;
        }
        this.teclaMovimientoActiva = null;
    }

    intentarMover(dx, dy) {
        const nuevaCol = this.jugadorCol + dx;
        const nuevaRow = this.jugadorRow + dy;

        if (nuevaRow < 0 || nuevaRow >= this.mapa.length) return false;
        if (nuevaCol < 0 || nuevaCol >= this.mapa[0].length) return false;
        if (this.mapa[nuevaRow][nuevaCol] === 1) return false;

        // Las cajas YA NO bloquean el movimiento (están en estanterías)
        // Solo verificamos paredes

        this.jugadorCol = nuevaCol;
        this.jugadorRow = nuevaRow;

        this.actualizarGraficoMontacargas();
        
        this.turnos++;
        this.reproducirSonido('movimiento');
        this.actualizarUI();
        
        return true;
    }

    // ============ RECOGER / SOLTAR ============

    accionRecogerSoltar() {
        if (this.cargado) {
            this.intentarSoltar();
        } else {
            this.intentarRecoger();
        }
    }

    intentarRecoger() {
        // Buscar caja cuya estantería sea adyacente al jugador
        const cajaEnEstanteriaAdyacente = this.cajas.find(caja => {
            if (caja.entregada || caja.recogidaPorJugador) return false;
            
            const est = caja.estanteria;
            const distRow = Math.abs(est.row - this.jugadorRow);
            const distCol = Math.abs(est.col - this.jugadorCol);
            
            return (distRow + distCol) === 1;
        });

        if (!cajaEnEstanteriaAdyacente) {
            this.mostrarMensajeTemporal('No hay estantería con caja adyacente', '#ff6666');
            this.reproducirSonido('error');
            return;
        }

        this.cargado = true;
        this.cajaCargada = cajaEnEstanteriaAdyacente;
        this.cajaCargada.recogidaPorJugador = true; // Marcar como recogida
        
        const indice = this.cajas.indexOf(cajaEnEstanteriaAdyacente);
        this.cajasGraphics[indice].setVisible(false);
        
        this.actualizarGraficoMontacargas();
        this.actualizarUI();
        this.reproducirSonido('recoger');
        this.mostrarMensajeTemporal('Caja recogida de estantería', '#00ff00');
    }

    intentarSoltar() {
        const objetivoBajoMontacargas = this.posicionesObjetivo.find(pos => 
            pos.row === this.jugadorRow && pos.col === this.jugadorCol
        );

        if (!objetivoBajoMontacargas) {
            this.mostrarMensajeTemporal('Debes estar sobre una posición objetivo', '#ff6666');
            this.reproducirSonido('error');
            return;
        }

        const cajaEnObjetivo = this.cajas.find(caja => 
            caja.row === objetivoBajoMontacargas.row && 
            caja.col === objetivoBajoMontacargas.col &&
            caja !== this.cajaCargada
        );

        if (cajaEnObjetivo) {
            this.mostrarMensajeTemporal('Posición ocupada', '#ff6666');
            this.reproducirSonido('error');
            return;
        }

        // Actualizar la posición de la caja al objetivo
        this.cajaCargada.row = objetivoBajoMontacargas.row;
        this.cajaCargada.col = objetivoBajoMontacargas.col;
        this.cajaCargada.entregada = true;

        const indice = this.cajas.indexOf(this.cajaCargada);
        
        // Dibujar la caja entregada en el piso (color verde)
        this.cajasGraphics[indice].clear();
        drawIsoBox(this.cajasGraphics[indice], 
                objetivoBajoMontacargas.row, 
                objetivoBajoMontacargas.col, 
                this.tileSize, 
                this.offsetX, 
                this.offsetY, 
                0x33cc33);
        this.cajasGraphics[indice].setVisible(true);

        this.cargado = false;
        this.cajaCargada = null;

        this.actualizarGraficoMontacargas();
        this.actualizarUI();
        this.reproducirSonido('soltar');
        
        // Efecto de partículas
        const { x: isoX, y: isoY } = toIso(objetivoBajoMontacargas.row, objetivoBajoMontacargas.col, this.tileSize);
        this.crearEfectoParticulas(isoX + this.offsetX, isoY + this.offsetY, 0x00ff00, 20);
        this.mostrarMensajeTemporal('¡Caja entregada!', '#00ff00');

        this.verificarVictoria();
    }

    // ============ UI Y MENSAJES ============

    mostrarMensajeTemporal(texto, color) {
        const msg = this.add.text(448, 360, texto, {
            fontSize: '24px',
            color: color,
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        msg.setOrigin(0.5);

        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: 320,
            duration: 1500,
            onComplete: () => msg.destroy()
        });
    }

    verificarVictoria() {
        const todasEntregadas = this.cajas.every(caja => caja.entregada);
        
        if (todasEntregadas) {
            this.juegoTerminado = true;
            this.detenerMovimientoContinuo();
            this.timerIA.remove();
            this.limpiarResaltadoIA();
            this.reproducirSonido('victoria');
            
            const { x, y } = toIso(this.jugadorRow, this.jugadorCol, this.tileSize);
            this.crearEfectoParticulas(x + this.offsetX, y + this.offsetY, 0x00ff00, 50);

            this.add.text(300, 280, '¡NIVEL COMPLETO!', {
                fontSize: '48px',
                color: '#0f0',
                fontStyle: 'bold'
            });

            const esUltimoNivel = this.nivelActual >= niveles.length - 1;

            if (!esUltimoNivel) {
                this.add.text(250, 400, 'Siguiente nivel en 3 segundos...', {
                    fontSize: '20px',
                    color: '#fff'
                });

                this.time.delayedCall(3000, () => {
                    this.registry.set('nivelActual', this.nivelActual + 1);
                    this.scene.restart();
                });
            } else {
                this.add.text(230, 400, '¡Completaste todos los niveles!', {
                    fontSize: '24px',
                    color: '#ffd700',
                    fontStyle: 'bold'
                });
            }

            this.input.keyboard.enabled = false;
        }
    }

    actualizarUI() {
        const estado = this.cargado ? 'Estado: CARGADO' : 'Estado: Vacío';
        const colorEstado = this.cargado ? '#ffcc00' : '#ffffff';
        this.textoEstado.setText(estado);
        this.textoEstado.setColor(colorEstado);
        
        this.textoTurnos.setText('Turnos: ' + this.turnos);
        
        const entregadas = this.cajas.filter(c => c.entregada).length;
        this.textoProgreso.setText(`Entregas: ${entregadas}/${this.cajas.length}`);
    }

    // ============ NAVEGACIÓN DE NIVELES ============

    reiniciarNivel() {
        this.detenerMovimientoContinuo();
        this.registry.set('nivelActual', this.nivelActual);
        this.scene.restart();
    }

    siguienteNivel() {
        if (this.nivelActual < niveles.length - 1) {
            this.detenerMovimientoContinuo();
            this.registry.set('nivelActual', this.nivelActual + 1);
            this.scene.restart();
        }
    }

    nivelAnterior() {
        if (this.nivelActual > 0) {
            this.detenerMovimientoContinuo();
            this.registry.set('nivelActual', this.nivelActual - 1);
            this.scene.restart();
        }
    }

    // ============ AUDIO ============

    reproducirSonido(tipo) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        const currentTime = this.audioContext.currentTime;

        switch(tipo) {
            case 'movimiento':
                oscillator.frequency.value = 200;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.08, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.05);
                oscillator.start(currentTime);
                oscillator.stop(currentTime + 0.05);
                break;
            case 'recoger':
                oscillator.frequency.value = 300;
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(0.2, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
                oscillator.start(currentTime);
                oscillator.stop(currentTime + 0.15);
                break;
            case 'soltar':
                oscillator.frequency.value = 500;
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(0.2, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
                oscillator.start(currentTime);
                oscillator.stop(currentTime + 0.2);
                break;
            case 'ia_recoger':
                oscillator.frequency.value = 250;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.1, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
                oscillator.start(currentTime);
                oscillator.stop(currentTime + 0.1);
                break;
            case 'ia_despachar':
                oscillator.frequency.value = 400;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.1, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
                oscillator.start(currentTime);
                oscillator.stop(currentTime + 0.15);
                break;
            case 'error':
                oscillator.frequency.value = 150;
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.15, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
                oscillator.start(currentTime);
                oscillator.stop(currentTime + 0.15);
                break;
            case 'victoria':
                oscillator.frequency.value = 523.25;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
                oscillator.start(currentTime);
                oscillator.stop(currentTime + 0.5);
                break;
            case 'derrota':
                oscillator.frequency.value = 100;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.3, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.8);
                oscillator.start(currentTime);
                oscillator.stop(currentTime + 0.8);
                break;
        }
    }

    // ============ EFECTOS ============

    crearEfectoParticulas(x, y, color, cantidad = 20) {
        for (let i = 0; i < cantidad; i++) {
            const particula = this.add.circle(x, y, 3, color);
            const angulo = (Math.PI * 2 * i) / cantidad;
            const velocidad = Phaser.Math.Between(50, 150);
            this.tweens.add({
                targets: particula,
                x: x + Math.cos(angulo) * velocidad,
                y: y + Math.sin(angulo) * velocidad,
                alpha: 0,
                scale: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => particula.destroy()
            });
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 800,
    backgroundColor: '#111',
    scene: [MiEscena]
};

const game = new Phaser.Game(config);