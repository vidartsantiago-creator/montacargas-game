// src/graphics/walls.js
// Dibujo de paredes perimetrales y estanterías

import { toIso, CURRENT_MAP_SIZE } from '../render.js';
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
 * Dibuja una casilla de suelo
 * @param {Phaser.GameObjects.Graphics} graphics - Objeto gráfico de Phaser
 * @param {number} row - Fila de la grilla
 * @param {number} col - Columna de la grilla
 * @param {number} tileSize - Tamaño del tile
 * @param {number} offsetX - Offset X de pantalla
 * @param {number} offsetY - Offset Y de pantalla
 */
export function drawIsoTile(graphics, row, col, tileSize, offsetX, offsetY) {
    const { x, y } = toIso(row, col, tileSize);
    const screenX = x + offsetX;
    const screenY = y + offsetY;

    // Calcular los 4 vértices del rombo usando toIso para las esquinas
    const topLeft = toIso(row, col, tileSize);
    const topRight = toIso(row, col + 1, tileSize);
    const bottomRight = toIso(row + 1, col + 1, tileSize);
    const bottomLeft = toIso(row + 1, col, tileSize);

    graphics.lineStyle(1, config.palette.floorBorder, 0.6);
    graphics.fillStyle(config.palette.floor, 1);

    graphics.beginPath();
    graphics.moveTo(topLeft.x + offsetX, topLeft.y + offsetY);
    graphics.lineTo(topRight.x + offsetX, topRight.y + offsetY);
    graphics.lineTo(bottomRight.x + offsetX, bottomRight.y + offsetY);
    graphics.lineTo(bottomLeft.x + offsetX, bottomLeft.y + offsetY);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
}

/**
 * Dibuja una PARED PERIMETRAL sólida completa con textura de cemento
 * @param {Phaser.GameObjects.Graphics} graphics - Objeto gráfico de Phaser
 * @param {number} row - Fila de la grilla
 * @param {number} col - Columna de la grilla
 * @param {number} tileSize - Tamaño del tile
 * @param {number} offsetX - Offset X de pantalla
 * @param {number} offsetY - Offset Y de pantalla
 * @param {number} height - Altura de la pared
 */
export function drawIsoSolidWall(graphics, row, col, tileSize, offsetX, offsetY, height = config.assets.wallHeight) {
    const mapSize = CURRENT_MAP_SIZE;
    const topLeft = toIso(row, col, tileSize);
    const topRight = toIso(row, col + 1, tileSize);
    const bottomRight = toIso(row + 1, col + 1, tileSize);
    const bottomLeft = toIso(row + 1, col, tileSize);

    const tlX = topLeft.x + offsetX, tlY = topLeft.y + offsetY;
    const trX = topRight.x + offsetX, trY = topRight.y + offsetY;
    const brX = bottomRight.x + offsetX, brY = bottomRight.y + offsetY;
    const blX = bottomLeft.x + offsetX, blY = bottomLeft.y + offsetY;

    const isTopEdge = row === 0;
    const isBottomEdge = row === mapSize - 1;
    const isLeftEdge = col === 0;
    const isRightEdge = col === mapSize - 1;

    // Espesor de pared: 50% del tile (para caras laterales)
    const halfThickness = tileSize * 0.25;

    // Colores base para textura de cemento
    const baseGray = 0x808080;

    // Generar variación sutil de tono para esta pared específica (textura procedural)
    const textureVariation = (Math.random() - 0.5) * 8; // ±4 unidades

    // Función auxiliar para obtener colores con variación de textura
    const getExteriorColor = () => adjustColor(baseGray, -15 + textureVariation);
    const getInteriorColor = () => adjustColor(baseGray, -5 + textureVariation);
    const getTopColor = () => adjustColor(baseGray, 15 + textureVariation);

    // 1. PRIMERO: CARAS LATERALES (exterior e interior)
    // Sin lineStyle - los bordes se definen por contraste de color

    if (isTopEdge) {
        // Borde superior - cara norte exterior
        graphics.fillStyle(getExteriorColor(), 1);
        graphics.beginPath();
        graphics.moveTo(tlX, tlY - height);
        graphics.lineTo(trX, trY - height);
        graphics.lineTo(trX, trY);
        graphics.lineTo(tlX, tlY);
        graphics.closePath();
        graphics.fillPath();
    }

    if (isBottomEdge) {
        // Borde inferior - cara sur exterior
        graphics.fillStyle(getExteriorColor(), 1);
        graphics.beginPath();
        graphics.moveTo(blX, blY - height);
        graphics.lineTo(brX, brY - height);
        graphics.lineTo(brX, brY);
        graphics.lineTo(blX, blY);
        graphics.closePath();
        graphics.fillPath();
    }

    if (isLeftEdge) {
        // Borde izquierdo - cara oeste exterior (ligeramente más clara)
        graphics.fillStyle(adjustColor(getExteriorColor(), 20), 1);
        graphics.beginPath();
        graphics.moveTo(tlX, tlY - height);
        graphics.lineTo(tlX, tlY);
        graphics.lineTo(blX, blY);
        graphics.lineTo(blX, blY - height);
        graphics.closePath();
        graphics.fillPath();
    }

    if (isRightEdge) {
        // Borde derecho - cara este exterior
        graphics.fillStyle(getExteriorColor(), 1);
        graphics.beginPath();
        graphics.moveTo(trX, trY - height);
        graphics.lineTo(trX, trY);
        graphics.lineTo(brX, brY);
        graphics.lineTo(brX, brY - height);
        graphics.closePath();
        graphics.fillPath();
    }

    // Caras interiores (tono ligeramente diferente para definir borde invisible)
    if (isTopEdge) {
        graphics.fillStyle(getInteriorColor(), 1);
        graphics.beginPath();
        graphics.moveTo(blX, blY - height);
        graphics.lineTo(brX, brY - height);
        graphics.lineTo(brX, brY);
        graphics.lineTo(blX, blY);
        graphics.closePath();
        graphics.fillPath();
    }

    if (isBottomEdge) {
        graphics.fillStyle(getInteriorColor(), 1);
        graphics.beginPath();
        graphics.moveTo(tlX, tlY - height);
        graphics.lineTo(trX, trY - height);
        graphics.lineTo(trX, trY);
        graphics.lineTo(tlX, tlY);
        graphics.closePath();
        graphics.fillPath();
    }

    if (isLeftEdge) {
        graphics.fillStyle(adjustColor(getInteriorColor(), -10), 1);
        graphics.beginPath();
        graphics.moveTo(trX, trY - height);
        graphics.lineTo(trX, trY);
        graphics.lineTo(brX, brY);
        graphics.lineTo(brX, brY - height);
        graphics.closePath();
        graphics.fillPath();
    }

    if (isRightEdge) {
        graphics.fillStyle(adjustColor(getInteriorColor(), -10), 1);
        graphics.beginPath();
        graphics.moveTo(tlX, tlY - height);
        graphics.lineTo(tlX, tlY);
        graphics.lineTo(blX, blY);
        graphics.lineTo(blX, blY - height);
        graphics.closePath();
        graphics.fillPath();
    }

    // 2. ÚLTIMO: CARA SUPERIOR (TECHO)
    graphics.fillStyle(getTopColor(), 1);
    graphics.beginPath();
    graphics.moveTo(tlX, tlY - height);
    graphics.lineTo(trX, trY - height);
    graphics.lineTo(brX, brY - height);
    graphics.lineTo(blX, blY - height);
    graphics.closePath();
    graphics.fillPath();

    // 3. TEXTURA DE CEMENTO: líneas sutiles horizontales en caras verticales
    // Solo en paredes exteriores visibles
    graphics.lineStyle(1, 0x555555, 0.15);

    if (isTopEdge) {
        // Líneas horizontales en cara norte
        for (let i = 1; i < 4; i++) {
            const y = tlY - (height / 4) * i;
            const yEnd = trY - (height / 4) * i;
            graphics.lineBetween(tlX + 3, y, trX - 3, yEnd);
        }
    }

    if (isBottomEdge) {
        // Líneas horizontales en cara sur
        for (let i = 1; i < 4; i++) {
            const y = blY - (height / 4) * i;
            const yEnd = brY - (height / 4) * i;
            graphics.lineBetween(blX + 3, y, brX - 3, yEnd);
        }
    }

    if (isLeftEdge) {
        // Líneas horizontales en cara oeste
        for (let i = 1; i < 4; i++) {
            const yOffset = (height / 4) * i;
            graphics.lineBetween(tlX + 2, tlY - yOffset, blX + 2, blY - yOffset);
        }
    }

    if (isRightEdge) {
        // Líneas horizontales en cara este
        for (let i = 1; i < 4; i++) {
            const yOffset = (height / 4) * i;
            graphics.lineBetween(trX - 2, trY - yOffset, brX - 2, brY - yOffset);
        }
    }

    // 4. SOMBRA SUTIL EN LA BASE para mayor profundidad
    graphics.fillStyle(0x000000, 0.06);
    graphics.beginPath();

    if (isTopEdge) {
        graphics.moveTo(tlX, tlY);
        graphics.lineTo(trX, trY);
        graphics.lineTo(trX + 2, trY + 3);
        graphics.lineTo(tlX - 2, tlY + 3);
        graphics.closePath();
        graphics.fillPath();
    }

    if (isBottomEdge) {
        graphics.moveTo(blX, blY);
        graphics.lineTo(brX, brY);
        graphics.lineTo(brX + 2, brY + 3);
        graphics.lineTo(blX - 2, blY + 3);
        graphics.closePath();
        graphics.fillPath();
    }

    if (isLeftEdge) {
        graphics.moveTo(tlX, tlY);
        graphics.lineTo(blX, blY);
        graphics.lineTo(blX + 3, blY + 2);
        graphics.lineTo(tlX + 3, tlY + 2);
        graphics.closePath();
        graphics.fillPath();
    }

    if (isRightEdge) {
        graphics.moveTo(trX, trY);
        graphics.lineTo(brX, brY);
        graphics.lineTo(brX + 3, brY + 2);
        graphics.lineTo(trX + 3, trY + 2);
        graphics.closePath();
        graphics.fillPath();
    }
}

/**
 * Dibuja una ESTANTERÍA INTERIOR modular (transparente)
 * @param {Phaser.GameObjects.Graphics} graphics - Objeto gráfico de Phaser
 * @param {number} row - Fila de la grilla
 * @param {number} col - Columna de la grilla
 * @param {number} tileSize - Tamaño del tile
 * @param {number} offsetX - Offset X de pantalla
 * @param {number} offsetY - Offset Y de pantalla
 * @param {number} height - Altura de la estantería
 */
export function drawIsoShelf(graphics, row, col, tileSize, offsetX, offsetY, height = config.assets.wallHeight) {
    const topLeft = toIso(row, col, tileSize);
    const topRight = toIso(row, col + 1, tileSize);
    const bottomRight = toIso(row + 1, col + 1, tileSize);
    const bottomLeft = toIso(row + 1, col, tileSize);

    const tlX = topLeft.x + offsetX, tlY = topLeft.y + offsetY;
    const trX = topRight.x + offsetX, trY = topRight.y + offsetY;
    const brX = bottomRight.x + offsetX, brY = bottomRight.y + offsetY;
    const blX = bottomLeft.x + offsetX, blY = bottomLeft.y + offsetY;

    // 4 postes verticales en las esquinas
    graphics.lineStyle(2, config.palette.shelf.post, 0.9);
    graphics.lineBetween(tlX, tlY, tlX, tlY - height);
    graphics.lineBetween(trX, trY, trX, trY - height);
    graphics.lineBetween(brX, brY, brX, brY - height);
    graphics.lineBetween(blX, blY, blX, blY - height);

    // Estantes horizontales (rombos en cada nivel)
    const numShelves = config.assets.shelfLevels;
    for (let i = 0; i <= numShelves; i++) {
        const t = i / numShelves;
        const shelfHeight = height * t;

        graphics.lineStyle(2, config.palette.shelf.shelf, 0.7);
        graphics.beginPath();
        graphics.moveTo(tlX, tlY - shelfHeight);
        graphics.lineTo(trX, trY - shelfHeight);
        graphics.lineTo(brX, brY - shelfHeight);
        graphics.lineTo(blX, blY - shelfHeight);
        graphics.closePath();
        graphics.strokePath();
    }
}