// src/render.js
// Motor de renderizado caballero asimétrico

// Perspectiva caballera con visión en picado
// Eje X (columnas): -60° (hacia abajo-derecha)
// Eje Y (filas): +30° (hacia arriba-derecha)
// Eje Z (altura): vertical
export const ANGLE_X = -45 * (Math.PI / 180);  // -60° (abajo)
export const ANGLE_Y = 45 * (Math.PI / 180);   // +30° (arriba)
export const SCALE_Y = 0.9;  // Factor de escala para aplanar verticalmente
export let CURRENT_MAP_SIZE = 8;  // Tamaño de la grilla (8x8 por defecto)

/**
 * Transforma coordenadas de grilla a coordenadas de pantalla
 */
export function toIso(row, col, tileSize) {
    const cosX = Math.cos(ANGLE_X);  // 0.5
    const sinX = Math.sin(ANGLE_X);  // -0.866
    const cosY = Math.cos(ANGLE_Y);  // 0.866
    const sinY = Math.sin(ANGLE_Y);  // 0.5
    
    // Proyección caballera
    const isoX = (col * cosX + row * cosY) * tileSize;
    const isoY = (col * sinX + row * sinY) * tileSize * SCALE_Y;
    
    return { x: isoX, y: isoY };
}

/**
 * Transforma coordenadas de pantalla a coordenadas de grilla
 */
export function fromIso(isoX, isoY, tileSize) {
    const cosX = Math.cos(ANGLE_X);
    const sinX = Math.sin(ANGLE_X);
    const cosY = Math.cos(ANGLE_Y);
    const sinY = Math.sin(ANGLE_Y);
    
    // Deshacer el escalado Y
    const realIsoY = isoY / SCALE_Y;
    
    // Matriz inversa (determinante)
    const det = cosX * sinY - sinX * cosY;
    
    const col = (isoX * sinY - realIsoY * cosY) / (tileSize * det);
    const row = (realIsoY * cosX - isoX * sinX) / (tileSize * det);
    
    return { row: Math.round(row), col: Math.round(col) };
}

/**
 * Obtiene el orden de dibujo correcto basado en la coordenada Y real de pantalla
 * Esto es crítico para perspectiva asimétrica donde row+col no funciona
 * @param {number} numRows - Número de filas
 * @param {number} numCols - Número de columnas
 * @param {number} tileSize - Tamaño de la casilla
 * @returns {Array} - Array de {row, col, screenY} ordenado de atrás hacia adelante
 */
export function getDrawingOrder(numRows, numCols, tileSize) {
    const order = [];
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const { y } = toIso(row, col, tileSize);
            order.push({ row, col, screenY: y });
        }
    }
    // Ordenar de atrás hacia adelante (menor Y primero)
    order.sort((a, b) => a.screenY - b.screenY);
    return order;
}

/**
 * Dibuja una casilla de suelo
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
    
    graphics.lineStyle(1, 0x777777, 0.6);
    graphics.fillStyle(0x555555, 1);
    
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
 * Dibuja una PARED PERIMETRAL sólida completa (con techo y todas las caras)
 */
export function drawIsoSolidWall(graphics, row, col, tileSize, offsetX, offsetY, height = 55) {
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
    
    // 1. PRIMERO: CARAS LATERALES (exterior e interior)
    // Esto permite que el techo se dibuje encima
    
    if (isTopEdge) {
        // Borde superior - cara norte exterior
        graphics.fillStyle(0x5a5a5a, 1);
        graphics.lineStyle(1, 0x333333, 0.8);
        graphics.beginPath();
        graphics.moveTo(tlX, tlY - height);
        graphics.lineTo(trX, trY - height);
        graphics.lineTo(trX, trY);
        graphics.lineTo(tlX, tlY);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    if (isBottomEdge) {
        // Borde inferior - cara sur exterior
        graphics.fillStyle(0x5a5a5a, 1);
        graphics.lineStyle(1, 0x333333, 0.8);
        graphics.beginPath();
        graphics.moveTo(blX, blY - height);
        graphics.lineTo(brX, brY - height);
        graphics.lineTo(brX, brY);
        graphics.lineTo(blX, blY);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    if (isLeftEdge) {
        // Borde izquierdo - cara oeste exterior
        graphics.fillStyle(0x707070, 1);
        graphics.lineStyle(1, 0x333333, 0.8);
        graphics.beginPath();
        graphics.moveTo(tlX, tlY - height);
        graphics.lineTo(tlX, tlY);
        graphics.lineTo(blX, blY);
        graphics.lineTo(blX, blY - height);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    if (isRightEdge) {
        // Borde derecho - cara este exterior
        graphics.fillStyle(0x5a5a5a, 1);
        graphics.lineStyle(1, 0x333333, 0.8);
        graphics.beginPath();
        graphics.moveTo(trX, trY - height);
        graphics.lineTo(trX, trY);
        graphics.lineTo(brX, brY);
        graphics.lineTo(brX, brY - height);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    // Caras interiores
    if (isTopEdge) {
        graphics.fillStyle(0x7a7a7a, 1);
        graphics.beginPath();
        graphics.moveTo(blX, blY - height);
        graphics.lineTo(brX, brY - height);
        graphics.lineTo(brX, brY);
        graphics.lineTo(blX, blY);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    if (isBottomEdge) {
        graphics.fillStyle(0x7a7a7a, 1);
        graphics.beginPath();
        graphics.moveTo(tlX, tlY - height);
        graphics.lineTo(trX, trY - height);
        graphics.lineTo(trX, trY);
        graphics.lineTo(tlX, tlY);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    if (isLeftEdge) {
        graphics.fillStyle(0x6a6a6a, 1);
        graphics.beginPath();
        graphics.moveTo(trX, trY - height);
        graphics.lineTo(trX, trY);
        graphics.lineTo(brX, brY);
        graphics.lineTo(brX, brY - height);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    if (isRightEdge) {
        graphics.fillStyle(0x6a6a6a, 1);
        graphics.beginPath();
        graphics.moveTo(tlX, tlY - height);
        graphics.lineTo(tlX, tlY);
        graphics.lineTo(blX, blY);
        graphics.lineTo(blX, blY - height);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    // 2. ÚLTIMO: CARA SUPERIOR (TECHO) - se dibuja al final para que se vea
    graphics.fillStyle(0x9a9a9a, 1);  // Gris más claro
    graphics.lineStyle(1, 0x333333, 0.8);
    graphics.beginPath();
    graphics.moveTo(tlX, tlY - height);
    graphics.lineTo(trX, trY - height);
    graphics.lineTo(brX, brY - height);
    graphics.lineTo(blX, blY - height);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // Textura de cemento
    graphics.lineStyle(1, 0x444444, 0.3);
    if (isLeftEdge || isRightEdge) {
        graphics.lineBetween(tlX + 2, tlY - height / 2, blX + 2, blY - height / 2);
        graphics.lineBetween(trX - 2, trY - height / 2, brX - 2, brY - height / 2);
    }
    if (isTopEdge || isBottomEdge) {
        graphics.lineBetween(tlX, tlY - height / 2, trX, trY - height / 2);
        graphics.lineBetween(blX, blY - height / 2, brX, brY - height / 2);
    }
}

/**
 * Dibuja una ESTANTERÍA INTERIOR modular (transparente)
 */
export function drawIsoShelf(graphics, row, col, tileSize, offsetX, offsetY, height = 65) {
    const topLeft = toIso(row, col, tileSize);
    const topRight = toIso(row, col + 1, tileSize);
    const bottomRight = toIso(row + 1, col + 1, tileSize);
    const bottomLeft = toIso(row + 1, col, tileSize);
    
    const tlX = topLeft.x + offsetX, tlY = topLeft.y + offsetY;
    const trX = topRight.x + offsetX, trY = topRight.y + offsetY;
    const brX = bottomRight.x + offsetX, brY = bottomRight.y + offsetY;
    const blX = bottomLeft.x + offsetX, blY = bottomLeft.y + offsetY;
    
    // 4 postes verticales en las esquinas
    graphics.lineStyle(2, 0x999999, 0.9);
    graphics.lineBetween(tlX, tlY, tlX, tlY - height);
    graphics.lineBetween(trX, trY, trX, trY - height);
    graphics.lineBetween(brX, brY, brX, brY - height);
    graphics.lineBetween(blX, blY, blX, blY - height);
    
    // Estantes horizontales (rombos en cada nivel)
    const numShelves = 3;
    for (let i = 0; i <= numShelves; i++) {
        const t = i / numShelves;
        const shelfHeight = height * t;
        
        graphics.lineStyle(2, 0xaaaaaa, 0.7);
        graphics.beginPath();
        graphics.moveTo(tlX, tlY - shelfHeight);
        graphics.lineTo(trX, trY - shelfHeight);
        graphics.lineTo(brX, brY - shelfHeight);
        graphics.lineTo(blX, blY - shelfHeight);
        graphics.closePath();
        graphics.strokePath();
    }
}

/**
 * Dibuja una caja decorativa grande en una estantería
 */
/**
 * Dibuja una caja decorativa grande en una estantería
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
    
    const height = 65;
    const numShelves = 3;
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
    
    // Cara OESTE (LEFT) - tl a bl
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

/**
 * Dibuja una caja 3D en el piso
 */
/**
 * Dibuja una caja 3D en el piso
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
    
    const shrink = 0.75;
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
    
    // Cara OESTE (LEFT) - tl a bl
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
    graphics.lineStyle(3, 0xddaa66, 0.9);
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
 * Dibuja un montacargas
 */
export function drawIsoForklift(graphics, row, col, tileSize, offsetX, offsetY, type = 'player', carrying = false) {
    const topLeft = toIso(row, col, tileSize);
    const topRight = toIso(row, col + 1, tileSize);
    const bottomRight = toIso(row + 1, col + 1, tileSize);
    const bottomLeft = toIso(row + 1, col, tileSize);
    
    const tlX = topLeft.x + offsetX, tlY = topLeft.y + offsetY;
    const trX = topRight.x + offsetX, trY = topRight.y + offsetY;
    const brX = bottomRight.x + offsetX, brY = bottomRight.y + offsetY;
    const blX = bottomLeft.x + offsetX, blY = bottomLeft.y + offsetY;
    
    const colors = {
        player: { body: 0xffcc00, cabin: 0x444444, wheels: 0x000000 },
        ai: { body: 0x3399ff, cabin: 0x222244, wheels: 0x000000 }
    };
    
    const color = colors[type];
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
    
    const bodyHeight = 18;
    
    // Sombra
    graphics.fillStyle(0x000000, 0.3);
    graphics.beginPath();
    graphics.moveTo(sTlX, sTlY + 3);
    graphics.lineTo(sTrX, sTrY + 3);
    graphics.lineTo(sBrX, sBrY + 3);
    graphics.lineTo(sBlX, sBlY + 3);
    graphics.closePath();
    graphics.fillPath();
    
    // Cuerpo - cara superior (TOP)
    graphics.fillStyle(color.body, 1);
    graphics.lineStyle(2, 0x000000, 0.5);
    graphics.beginPath();
    graphics.moveTo(sTlX, sTlY - bodyHeight);
    graphics.lineTo(sTrX, sTrY - bodyHeight);
    graphics.lineTo(sBrX, sBrY - bodyHeight);
    graphics.lineTo(sBlX, sBlY - bodyHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // Cuerpo - cara OESTE (LEFT) - tl a bl
    graphics.fillStyle(adjustColor(color.body, -25), 1);
    graphics.beginPath();
    graphics.moveTo(sTlX, sTlY - bodyHeight);
    graphics.lineTo(sTlX, sTlY);
    graphics.lineTo(sBlX, sBlY);
    graphics.lineTo(sBlX, sBlY - bodyHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // Cuerpo - cara SUR/FRONTAL (bl a br)
    graphics.fillStyle(adjustColor(color.body, 20), 1);
    graphics.beginPath();
    graphics.moveTo(sBlX, sBlY - bodyHeight);
    graphics.lineTo(sBlX, sBlY);
    graphics.lineTo(sBrX, sBrY);
    graphics.lineTo(sBrX, sBrY - bodyHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // Cabina
    const cabinHeight = 12;
    const cabinShrink = 0.5;
    const cTlX = centerX + (sTlX - centerX) * cabinShrink;
    const cTlY = centerY + (sTlY - centerY) * cabinShrink;
    const cTrX = centerX + (sTrX - centerX) * cabinShrink;
    const cTrY = centerY + (sTrY - centerY) * cabinShrink;
    const cBrX = centerX + (sBrX - centerX) * cabinShrink;
    const cBrY = centerY + (sBrY - centerY) * cabinShrink;
    const cBlX = centerX + (sBlX - centerX) * cabinShrink;
    const cBlY = centerY + (sBlY - centerY) * cabinShrink;
    
    // Cabina - cara superior (TOP)
    graphics.fillStyle(adjustColor(color.cabin, 30), 1);
    graphics.beginPath();
    graphics.moveTo(cTlX, cTlY - bodyHeight - cabinHeight);
    graphics.lineTo(cTrX, cTrY - bodyHeight - cabinHeight);
    graphics.lineTo(cBrX, cBrY - bodyHeight - cabinHeight);
    graphics.lineTo(cBlX, cBlY - bodyHeight - cabinHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // Cabina - cara OESTE (LEFT) - tl a bl
    graphics.fillStyle(adjustColor(color.cabin, 10), 1);
    graphics.beginPath();
    graphics.moveTo(cTlX, cTlY - bodyHeight - cabinHeight);
    graphics.lineTo(cTlX, cTlY - bodyHeight);
    graphics.lineTo(cBlX, cBlY - bodyHeight);
    graphics.lineTo(cBlX, cBlY - bodyHeight - cabinHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // Horquillas (apuntando hacia adelante-derecha)
    graphics.fillStyle(0xaaaaaa, 1);
    const forkStartX = (sTrX + sBrX) / 2;
    const forkStartY = (sTrY + sBrY) / 2;
    const forkDirX = (sBrX - sTrX) * 0.3;
    const forkDirY = (sBrY - sTrY) * 0.3;
    graphics.fillRect(forkStartX, forkStartY - 5, forkDirX, 3);
    graphics.fillRect(forkStartX, forkStartY + 2, forkDirX, 3);
    
    // Ruedas
    graphics.fillStyle(color.wheels, 1);
    graphics.fillCircle(sBlX, sBlY + 2, 4);
    graphics.fillCircle(sBrX, sBrY + 2, 4);
    
    // Si lleva caja, dibujarla encima
    if (carrying) {
        const boxColor = type === 'player' ? 0xcc8833 : 0x6666cc;
        drawIsoBox(graphics, row, col, tileSize, offsetX, offsetY, boxColor, bodyHeight + cabinHeight + 5);
    }
}

/**
 * Dibuja una posición objetivo
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
    
    graphics.fillStyle(0x0088ff, 0.35);
    graphics.lineStyle(2, 0x00aaff, 0.8);
    
    graphics.beginPath();
    graphics.moveTo(sTlX, sTlY);
    graphics.lineTo(sTrX, sTrY);
    graphics.lineTo(sBrX, sBrY);
    graphics.lineTo(sBlX, sBlY);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // Flecha indicadora en el centro
    graphics.fillStyle(0x00aaff, 0.9);
    graphics.fillTriangle(
        centerX, centerY + 8,
        centerX - 6, centerY - 2,
        centerX + 6, centerY - 2
    );
}

/**
 * Dibuja el punto de despacho
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
    
    graphics.fillStyle(0xff4400, 0.35);
    graphics.lineStyle(3, 0xff6600, 0.9);
    
    graphics.beginPath();
    graphics.moveTo(sTlX, sTlY);
    graphics.lineTo(sTrX, sTrY);
    graphics.lineTo(sBrX, sBrY);
    graphics.lineTo(sBlX, sBlY);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // Patrón de rayas
    graphics.lineStyle(2, 0xff6600, 0.5);
    graphics.lineBetween(sTlX, sTlY, sBrX, sBrY);
}

/**
 * Ajusta el brillo de un color
 */
function adjustColor(color, amount) {
    const r = Math.min(255, Math.max(0, (color >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((color >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (color & 0x0000FF) + amount));
    return (r << 16) | (g << 8) | b;
}

export function setCurrentMapSize(size) {
    CURRENT_MAP_SIZE = size;
}