// src/assets.js
import Phaser from 'phaser';
import { toIso } from './render.js';

/**
 * Dibuja un montacargas detallado con soporte para animación de suspensión.
 * @param {Phaser.GameObjects.Graphics} graphics - El objeto Graphics de Phaser.
 * @param {number} x - Posición X en pantalla (centro).
 * @param {number} y - Posición Y en pantalla (centro).
 * @param {string} tipo - 'player' (amarillo) o 'ai' (violeta).
 * @param {boolean} cargado - Si lleva una caja.
 * @param {number} scaleX - Factor de escala X (para suspensión).
 * @param {number} scaleY - Factor de escala Y (para suspensión).
 */
export function drawDetailedForklift(graphics, x, y, tipo, cargado, scaleX = 1, scaleY = 1) {
    graphics.save(); // Guardar estado actual del canvas

    // Aplicar transformación de suspensión alrededor del punto (x, y)
    // Truco: Trasladar al origen, escalar, y volver a trasladar
    graphics.translateCanvas(x, y);
    graphics.scaleCanvas(scaleX, scaleY);
    graphics.translateCanvas(-x, -y);

    const colorBase = tipo === 'player' ? 0xffaa00 : 0xaa00ff;
    const colorSecundario = tipo === 'player' ? 0xcc8800 : 0x8800cc;
    const colorCarga = cargado ? 0x00ff00 : 0x888888;
    const colorRueda = 0x333333;
    const colorMastil = 0x555555;

    // --- RUEDAS ---
    // Traseras (grandes)
    graphics.fillStyle(colorRueda);
    graphics.fillCircle(x - 18, y + 5, 5);
    graphics.fillCircle(x + 18, y + 5, 5);
    
    // Delanteras (pequeñas)
    graphics.fillStyle(colorRueda);
    graphics.fillCircle(x - 12, y - 15, 4);
    graphics.fillCircle(x + 12, y - 15, 4);

    // --- CHASIS PRINCIPAL ---
    graphics.fillStyle(colorBase);
    graphics.beginPath();
    graphics.moveTo(x - 20, y);
    graphics.lineTo(x + 20, y);
    graphics.lineTo(x + 15, y + 15);
    graphics.lineTo(x - 15, y + 15);
    graphics.closePath();
    graphics.fillPath();
    
    // Borde del chasis
    graphics.lineStyle(2, 0x000000, 0.5);
    graphics.strokePath();

    // --- CABINA DEL OPERADOR ---
    graphics.fillStyle(colorSecundario);
    graphics.beginPath();
    graphics.moveTo(x - 10, y - 5);
    graphics.lineTo(x + 10, y - 5);
    graphics.lineTo(x + 8, y + 10);
    graphics.lineTo(x - 8, y + 10);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Techo de la cabina
    graphics.fillStyle(0x333333);
    graphics.fillRect(x - 12, y - 8, 24, 4);

    // --- MÁSTIL Y HORQUILLAS ---
    // Columnas del mástil
    graphics.fillStyle(colorMastil);
    graphics.fillRect(x - 25, y - 25, 6, 30);
    graphics.fillRect(x + 19, y - 25, 6, 30);
    
    // Barra superior del mástil
    graphics.fillStyle(colorMastil);
    graphics.fillRect(x - 25, y - 25, 50, 4);

    // Horquillas (se mueven si está cargado)
    graphics.fillStyle(0x666666);
    const horquillaY = cargado ? y - 10 : y;
    
    // Horquilla izquierda
    graphics.fillRect(x - 28, horquillaY - 2, 10, 4);
    // Horquilla derecha
    graphics.fillRect(x + 18, horquillaY - 2, 10, 4);
    
    // Soporte vertical de horquillas
    graphics.fillStyle(colorMastil);
    graphics.fillRect(x - 26, horquillaY - 15, 4, 15);
    graphics.fillRect(x + 22, horquillaY - 15, 4, 15);

    // --- CAJA CARGADA ---
    if (cargado) {
        // Dibujamos la caja sobre las horquillas
        // Nota: Llamamos a la función de dibujo de caja definida más abajo
        drawDetailedBox(graphics, x, horquillaY - 12, colorCarga, true);
    }

    // --- LUCES ---
    graphics.fillStyle(0xffff00);
    graphics.fillCircle(x - 18, y - 18, 2);
    graphics.fillCircle(x + 18, y - 18, 2);

    graphics.restore(); // Restaurar estado original (sin escalado ni traslación)
}

/**
 * Dibuja una caja isométrica detallada con efecto 3D falso.
 * @param {Phaser.GameObjects.Graphics} graphics - Objeto Graphics.
 * @param {number} x - Centro X.
 * @param {number} y - Centro Y (base de la caja).
 * @param {number} color - Color base hexadecimal.
 * @param {boolean} esPequena - Si es true, reduce el tamaño (para cargar en montacargas).
 */
export function drawDetailedBox(graphics, x, y, color, esPequena = false) {
    const w = esPequena ? 20 : 28;
    const h = esPequena ? 12 : 18;
    const offset = 8; // Altura visual del rombo superior

    // Helper para interpolar colores (oscurecer para sombras)
    const colorClaro = Phaser.Display.Color.Interpolate.ColorWithColor(color, 0xffffff, 100, 40);
    const colorOscuro = Phaser.Display.Color.Interpolate.ColorWithColor(color, 0x000000, 100, 40);
    const colorMedio = Phaser.Display.Color.Interpolate.ColorWithColor(color, 0x000000, 100, 20);

    // 1. Cara Superior (Rombo) - La más clara
    graphics.fillStyle(colorClaro);
    graphics.beginPath();
    graphics.moveTo(x, y - offset);
    graphics.lineTo(x + w, y);
    graphics.lineTo(x, y + offset);
    graphics.lineTo(x - w, y);
    graphics.closePath();
    graphics.fillPath();
    graphics.lineStyle(1, 0x000000, 0.3);
    graphics.strokePath();

    // 2. Cara Derecha - La más oscura (sombra)
    graphics.fillStyle(colorOscuro);
    graphics.beginPath();
    graphics.moveTo(x + w, y);
    graphics.lineTo(x + w, y + h);
    graphics.lineTo(x, y + h + offset);
    graphics.lineTo(x, y + offset);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // 3. Cara Izquierda - Tono medio
    graphics.fillStyle(colorMedio);
    graphics.beginPath();
    graphics.moveTo(x - w, y);
    graphics.lineTo(x - w, y + h);
    graphics.lineTo(x, y + h + offset);
    graphics.lineTo(x, y + offset);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // 4. Detalle: Cinta de embalaje
    graphics.lineStyle(2, 0xccaa00, 0.8);
    
    // Cinta longitudinal
    graphics.beginPath();
    graphics.moveTo(x, y - offset + 2);
    graphics.lineTo(x, y + h + offset - 2);
    graphics.strokePath();
    
    // Cinta transversal (solo en cara superior para simplificar)
    graphics.beginPath();
    graphics.moveTo(x - w + 2, y + 2);
    graphics.lineTo(x + w - 2, y + 2);
    graphics.strokePath();
}

/**
 * Calcula la posición isométrica y dibuja una caja en una estantería específica.
 * Útil para mantener compatibilidad con la lógica anterior si se necesita.
 */
export function drawBoxOnShelf(graphics, row, col, tileSize, offsetX, offsetY, nivel, color) {
    const { x, y } = toIso(row, col, tileSize);
    const shelfHeight = 65;
    const numShelves = 3;
    const alturaPorNivel = (shelfHeight / numShelves) * nivel;
    
    // Ajustamos Y para que la caja "flote" sobre el nivel de la estantería
    const finalY = y + offsetY - alturaPorNivel + (alturaPorNivel / 2); 
    
    drawDetailedBox(graphics, x + offsetX, finalY, color, false);
}