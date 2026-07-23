// src/graphics/markers.js
// Dibujo de marcadores: objetivos y punto de despacho

import { toIso } from '../render.js';
import { config } from '../config.js';

/**
 * Dibuja una posición objetivo
 * @param {Phaser.GameObjects.Graphics} graphics - Objeto gráfico de Phaser
 * @param {number} row - Fila de la grilla
 * @param {number} col - Columna de la grilla
 * @param {number} tileSize - Tamaño del tile
 * @param {number} offsetX - Offset X de pantalla
 * @param {number} offsetY - Offset Y de pantalla
 */
export function drawIsoTarget(graphics, row, col, tileSize, offsetX, offsetY) {
    const topLeft = toIso(row, col, tileSize);
    const topRight = toIso(row, col + 1, tileSize);
    const bottomRight = toIso(row + 1, col + 1, tileSize);
    const bottomLeft = toIso(row + 1, col, tileSize);

    const tlX = topLeft.x + offsetX, tlY = topLeft.y + offsetY;
    const trX = topRight.x + offsetX, trY = topRight.y + offsetY;
    const brX = bottomRight.x + offsetX, brY = bottomRight.y + offsetY;
    const blX = bottomLeft.x + offsetX, blY = bottomLeft.y + offsetY;

    // Rombo más pequeño (70%)
    const shrink = 0.7;
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

    graphics.fillStyle(config.palette.target, 0.35);
    graphics.lineStyle(2, config.palette.targetBorder, 0.8);

    graphics.beginPath();
    graphics.moveTo(sTlX, sTlY);
    graphics.lineTo(sTrX, sTrY);
    graphics.lineTo(sBrX, sBrY);
    graphics.lineTo(sBlX, sBlY);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Flecha indicadora en el centro
    graphics.fillStyle(config.palette.targetBorder, 0.9);
    graphics.fillTriangle(
        centerX, centerY + 8,
        centerX - 6, centerY - 2,
        centerX + 6, centerY - 2
    );
}

/**
 * Dibuja el punto de despacho
 * @param {Phaser.GameObjects.Graphics} graphics - Objeto gráfico de Phaser
 * @param {number} row - Fila de la grilla
 * @param {number} col - Columna de la grilla
 * @param {number} tileSize - Tamaño del tile
 * @param {number} offsetX - Offset X de pantalla
 * @param {number} offsetY - Offset Y de pantalla
 */
export function drawIsoDispatch(graphics, row, col, tileSize, offsetX, offsetY) {
    const topLeft = toIso(row, col, tileSize);
    const topRight = toIso(row, col + 1, tileSize);
    const bottomRight = toIso(row + 1, col + 1, tileSize);
    const bottomLeft = toIso(row + 1, col, tileSize);

    const tlX = topLeft.x + offsetX, tlY = topLeft.y + offsetY;
    const trX = topRight.x + offsetX, trY = topRight.y + offsetY;
    const brX = bottomRight.x + offsetX, brY = bottomRight.y + offsetY;
    const blX = bottomLeft.x + offsetX, blY = bottomLeft.y + offsetY;

    // Rombo más grande (85%)
    const shrink = 0.85;
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

    graphics.fillStyle(config.palette.dispatch, 0.35);
    graphics.lineStyle(3, config.palette.dispatchBorder, 0.9);

    graphics.beginPath();
    graphics.moveTo(sTlX, sTlY);
    graphics.lineTo(sTrX, sTrY);
    graphics.lineTo(sBrX, sBrY);
    graphics.lineTo(sBlX, sBlY);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Patrón de rayas
    graphics.lineStyle(2, config.palette.dispatchBorder, 0.5);
    graphics.lineBetween(sTlX, sTlY, sBrX, sBrY);
}