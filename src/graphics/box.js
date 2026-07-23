// src/graphics/box.js
// Dibujo de cajas (en piso y estanterías)

import { toIso } from '../render.js';
import { config } from '../config.js';

/**
 * Ajusta el brillo de un color
 */
function adjustColor(color, amount) {
    const r = Math.min(255, Math.max(0, (color >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((color >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (color & 0x0000FF) + amount));
    return (r << 16) | (g << 8) | b;
}

/**
 * Dibuja una caja 3D en el piso
 * @param {Phaser.GameObjects.Graphics} graphics - Objeto gráfico de Phaser
 * @param {number} row - Fila de la grilla
 * @param {number} col - Columna de la grilla
 * @param {number} tileSize - Tamaño del tile
 * @param {number} offsetX - Offset X de pantalla
 * @param {number} offsetY - Offset Y de pantalla
 * @param {number} color - Color de la caja
 * @param {number} yOffset - Desplazamiento vertical (para cajas elevadas)
 */
export function drawIsoBox(graphics, row, col, tileSize, offsetX, offsetY, color, yOffset = 0) {
    const topLeft = toIso(row, col, tileSize);
    const topRight = toIso(row, col + 1, tileSize);
    const bottomRight = toIso(row + 1, col + 1, tileSize);
    const bottomLeft = toIso(row + 1, col, tileSize);

    const tlX = topLeft.x + offsetX, tlY = topLeft.y + offsetY - yOffset;
    const trX = topRight.x + offsetX, trY = topRight.y + offsetY - yOffset;
    const brX = bottomRight.x + offsetX, brY = bottomRight.y + offsetY - yOffset;
    const blX = bottomLeft.x + offsetX, blY = bottomLeft.y + offsetY - yOffset;

    const shrink = config.assets.boxShrink;
    const centerX = (tlX + trX + brX + blX) / 4;
    const centerY = (tlY + trY + brY + blY) / 4;

    const sTlX = centerX + (tlX - centerX) * shrink;
    const sTlY = centerY + (tlY - centerY) * shrink;
    const sTrX = centerX + (trX - centerX) * shrink;
    const sTrY = centerY + (trY - centerY) * shrink;
    const sBrX = centerX + (brX - centerX) * shrink;
    const sBrY = centerY + (brY - centerY) * shrink;
    const sBlX = centerX + (blX - centerX) * shrink;
    const sBlY = centerY + (blY - centerY) * shrink;

    const boxHeight = tileSize * 0.6;

    // Cara superior (TOP)
    graphics.fillStyle(color, 1);
    graphics.lineStyle(2, 0x885522, 1);
    graphics.beginPath();
    graphics.moveTo(sTlX, sTlY - boxHeight);
    graphics.lineTo(sTrX, sTrY - boxHeight);
    graphics.lineTo(sBrX, sBrY - boxHeight);
    graphics.lineTo(sBlX, sBlY - boxHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Cara OESTE (LEFT)
    graphics.fillStyle(adjustColor(color, -20), 1);
    graphics.beginPath();
    graphics.moveTo(sTlX, sTlY - boxHeight);
    graphics.lineTo(sTlX, sTlY);
    graphics.lineTo(sBlX, sBlY);
    graphics.lineTo(sBlX, sBlY - boxHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Cara SUR/FRONTAL (bl a br)
    graphics.fillStyle(adjustColor(color, 25), 1);
    graphics.beginPath();
    graphics.moveTo(sBlX, sBlY - boxHeight);
    graphics.lineTo(sBlX, sBlY);
    graphics.lineTo(sBrX, sBrY);
    graphics.lineTo(sBrX, sBrY - boxHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Cinta adhesiva
    graphics.lineStyle(3, config.palette.box.tape, 0.9);
    const midTopX = (sTlX + sTrX) / 2;
    const midTopY = (sTlY + sTrY) / 2;
    const midBottomX = (sBlX + sBrX) / 2;
    const midBottomY = (sBlY + sBrY) / 2;
    graphics.lineBetween(midTopX, midTopY - boxHeight, midBottomX, midBottomY - boxHeight);

    const midLeftX2 = (sTlX + sBlX) / 2;
    const midLeftY2 = (sTlY + sBlY) / 2;
    const midRightX2 = (sTrX + sBrX) / 2;
    const midRightY2 = (sTrY + sBrY) / 2;
    graphics.lineBetween(midLeftX2, midLeftY2 - boxHeight, midRightX2, midRightY2 - boxHeight);
}

/**
 * Dibuja una caja decorativa grande en una estantería
 * @param {Phaser.GameObjects.Graphics} graphics - Objeto gráfico de Phaser
 * @param {number} row - Fila de la grilla
 * @param {number} col - Columna de la grilla
 * @param {number} tileSize - Tamaño del tile
 * @param {number} offsetX - Offset X de pantalla
 * @param {number} offsetY - Offset Y de pantalla
 * @param {number} shelfLevel - Nivel de estantería (0, 1, 2)
 * @param {number} color - Color de la caja
 */
export function drawIsoShelfBox(graphics, row, col, tileSize, offsetX, offsetY, shelfLevel = 0, color = 0x886644) {
    const topLeft = toIso(row, col, tileSize);
    const topRight = toIso(row, col + 1, tileSize);
    const bottomRight = toIso(row + 1, col + 1, tileSize);
    const bottomLeft = toIso(row + 1, col, tileSize);

    const tlX = topLeft.x + offsetX, tlY = topLeft.y + offsetY;
    const trX = topRight.x + offsetX, trY = topRight.y + offsetY;
    const brX = bottomRight.x + offsetX, brY = bottomRight.y + offsetY;
    const blX = bottomLeft.x + offsetX, blY = bottomLeft.y + offsetY;

    const height = config.assets.wallHeight;
    const numShelves = config.assets.shelfLevels;
    const shelfHeight = height / numShelves;
    const baseOffset = shelfHeight * shelfLevel + 2;

    const shrink = 0.8;
    const centerX = (tlX + trX + brX + blX) / 4;
    const centerY = (tlY + trY + brY + blY) / 4;

    const sTlX = centerX + (tlX - centerX) * shrink;
    const sTlY = centerY + (tlY - centerY) * shrink;
    const sTrX = centerX + (trX - centerX) * shrink;
    const sTrY = centerY + (trY - centerY) * shrink;
    const sBrX = centerX + (brX - centerX) * shrink;
    const sBrY = centerY + (brY - centerY) * shrink;
    const sBlX = centerX + (blX - centerX) * shrink;
    const sBlY = centerY + (blY - centerY) * shrink;

    const boxHeight = shelfHeight * 0.85;

    // Cara superior (TOP)
    graphics.fillStyle(color, 1);
    graphics.lineStyle(1, 0x443322, 0.9);
    graphics.beginPath();
    graphics.moveTo(sTlX, sTlY - baseOffset - boxHeight);
    graphics.lineTo(sTrX, sTrY - baseOffset - boxHeight);
    graphics.lineTo(sBrX, sBrY - baseOffset - boxHeight);
    graphics.lineTo(sBlX, sBlY - baseOffset - boxHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Cara OESTE (LEFT)
    graphics.fillStyle(adjustColor(color, -15), 1);
    graphics.beginPath();
    graphics.moveTo(sTlX, sTlY - baseOffset - boxHeight);
    graphics.lineTo(sTlX, sTlY - baseOffset);
    graphics.lineTo(sBlX, sBlY - baseOffset);
    graphics.lineTo(sBlX, sBlY - baseOffset - boxHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Cara SUR/FRONTAL (bl a br)
    graphics.fillStyle(adjustColor(color, 20), 1);
    graphics.beginPath();
    graphics.moveTo(sBlX, sBlY - baseOffset - boxHeight);
    graphics.lineTo(sBlX, sBlY - baseOffset);
    graphics.lineTo(sBrX, sBrY - baseOffset);
    graphics.lineTo(sBrX, sBrY - baseOffset - boxHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Etiqueta decorativa
    graphics.lineStyle(2, 0xddcc88, 0.7);
    const midLeftX = (sTlX + sBlX) / 2;
    const midLeftY = (sTlY + sBlY) / 2;
    const midRightX = (sTrX + sBrX) / 2;
    const midRightY = (sTrY + sBrY) / 2;
    graphics.lineBetween(midLeftX, midLeftY - baseOffset - boxHeight / 2,
                         midRightX, midRightY - baseOffset - boxHeight / 2);
}