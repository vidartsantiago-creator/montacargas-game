import { toIso } from '../render.js';

/**
 * Dibuja un montacargas isométrico con proyección caballera.
 * Ajustado a la función toIso() con ANGLE_X y ANGLE_Y específicos.
 */
export function drawIsoForklift(graphics, row, col, tileSize, offsetX, offsetY, type, carrying, direction) {
    const base = toIso(row, col, tileSize);
    const screenX = base.x + offsetX;
    const screenY = base.y + offsetY;
    const SCALE_Y = 0.5;

    // Dimensiones en unidades de tile
    const unitW = 0.90;  // ancho del vehículo
    const unitL = 0.10;  // largo del vehículo  
    const baseH = 0.54;  // altura del chasis
    const cabinH = 0.65; // altura de la cabina
    const mastH = carrying ? 1.05 : 0.90; // altura del mástil
    const wheelSize = tileSize * 0.20;

    // Colores
    const colors = type === 'player' ? {
        body: 0xffcc00,
        bodyDark: 0xcc9900,
        cabin: 0x2a2a2a,
        window: 0x99ccff,
        wheels: 0x1a1a1a,
        mast: 0x1a1a1a,
        forks: 0x333333,
        lights: 0xff3333
    } : {
        body: 0x3399ff,
        bodyDark: 0x2277cc,
        cabin: 0x1a2a4a,
        window: 0x99ddff,
        wheels: 0x111111,
        mast: 0x111111,
        forks: 0x2a2a2a,
        lights: 0xff3333
    };

    // Determinar orientación
    const facingRight = direction.col === 1;
    const facingLeft = direction.col === -1;
    const facingDown = direction.row === 1;
    const facingUp = direction.row === -1;

    // Calcular offset de orientación (el vehículo se desplaza en la dirección que mira)
    let orientOffsetX = 0;
    let orientOffsetY = 0;
    
    if (facingRight) {
        orientOffsetX = tileSize * 0.15;
        orientOffsetY = -tileSize * 0.08;
    } else if (facingLeft) {
        orientOffsetX = -tileSize * 0.15;
        orientOffsetY = tileSize * 0.08;
    } else if (facingDown) {
        orientOffsetX = tileSize * 0.15;
        orientOffsetY = tileSize * 0.08;
    } else if (facingUp) {
        orientOffsetX = -tileSize * 0.15;
        orientOffsetY = -tileSize * 0.08;
    }

    const centerX = screenX + orientOffsetX;
    const centerY = screenY + orientOffsetY;

    // Función auxiliar para convertir coordenadas locales a pantalla
    // Sistema: x = derecha, y = abajo-en-pantalla, z = arriba
    function localToScreen(lx, ly, lz) {
        // lx: desplazamiento lateral (derecha/izquierda del vehículo)
        // ly: desplazamiento longitudinal (adelante/atrás del vehículo)  
        // lz: altura
        
        // Determinar vectores locales según orientación
        let vecRightX, vecRightY;
        let vecForwardX, vecForwardY;
        let vecUpX = 0, vecUpY = -tileSize * SCALE_Y;

        if (facingRight) {
            vecRightX = tileSize * 0.433;  // cos(30°) * 0.5
            vecRightY = -tileSize * 0.25;  // sin(30°) * 0.5 * SCALE_Y
            vecForwardX = tileSize * 0.433;
            vecForwardY = tileSize * 0.25;
        } else if (facingLeft) {
            vecRightX = -tileSize * 0.433;
            vecRightY = tileSize * 0.25;
            vecForwardX = -tileSize * 0.433;
            vecForwardY = -tileSize * 0.25;
        } else if (facingDown) {
            vecRightX = tileSize * 0.5;
            vecRightY = 0;
            vecForwardX = 0;
            vecForwardY = tileSize * 0.5 * SCALE_Y;
        } else { // facingUp o default
            vecRightX = -tileSize * 0.5;
            vecRightY = 0;
            vecForwardX = 0;
            vecForwardY = -tileSize * 0.5 * SCALE_Y;
        }

        const px = centerX + (lx * vecRightX) + (ly * vecForwardX) + (lz * vecUpX);
        const py = centerY + (lx * vecRightY) + (ly * vecForwardY) + (lz * vecUpY);
        
        return { x: px, y: py };
    }

    // === DIBUJADO DEL MONTACARGAS ===
    
    // Puntos base del chasis (rectángulo)
    // Coordenadas locales: x (ancho), y (largo), z (altura)
    const bl = localToScreen(-unitW/2, -unitL/2, 0);     // back-left
    const br = localToScreen(unitW/2, -unitL/2, 0);      // back-right
    const fl = localToScreen(-unitW/2, unitL/2, 0);      // front-left
    const fr = localToScreen(unitW/2, unitL/2, 0);       // front-right
    
    const blTop = localToScreen(-unitW/2, -unitL/2, baseH);
    const brTop = localToScreen(unitW/2, -unitL/2, baseH);
    const flTop = localToScreen(-unitW/2, unitL/2, baseH);
    const frTop = localToScreen(unitW/2, unitL/2, baseH);

    // 1. RUEDAS (detrás)
    graphics.fillStyle(colors.wheels);

    const wheelBL = localToScreen(-unitW/2 + 0.1, -unitL/2 + 0.08, 0.05);
    const wheelBR = localToScreen(unitW/2 - 0.1, -unitL/2 + 0.08, 0.05);
    
    graphics.fillCircle(wheelBL.x, wheelBL.y, wheelSize);
    graphics.fillCircle(wheelBR.x, wheelBR.y, wheelSize);

    // 2. CHASIS
    graphics.fillStyle(colors.body);
    
    // Lado izquierdo
    graphics.beginPath();
    graphics.moveTo(bl.x, bl.y);
    graphics.lineTo(blTop.x, blTop.y);
    graphics.lineTo(flTop.x, flTop.y);
    graphics.lineTo(fl.x, fl.y);
    graphics.closePath();
    graphics.fillPath();

    // Lado derecho  
    graphics.beginPath();
    graphics.moveTo(br.x, br.y);
    graphics.lineTo(brTop.x, brTop.y);
    graphics.lineTo(frTop.x, frTop.y);
    graphics.lineTo(fr.x, fr.y);
    graphics.closePath();
    graphics.fillPath();

    // Frente (más oscuro)
    graphics.fillStyle(colors.bodyDark);
    graphics.beginPath();
    graphics.moveTo(fl.x, fl.y);
    graphics.lineTo(flTop.x, flTop.y);
    graphics.lineTo(frTop.x, frTop.y);
    graphics.lineTo(fr.x, fr.y);
    graphics.closePath();
    graphics.fillPath();

    // Techo del chasis
    graphics.fillStyle(colors.body);
    graphics.beginPath();
    graphics.moveTo(blTop.x, blTop.y);
    graphics.lineTo(brTop.x, brTop.y);
    graphics.lineTo(frTop.x, frTop.y);
    graphics.lineTo(flTop.x, flTop.y);
    graphics.closePath();
    graphics.fillPath();

    // 3. MÁSTIL (parte frontal vertical)
    const mastBase = localToScreen(0, unitL/2 - 0.05, baseH);
    const mastTop = localToScreen(0, unitL/2 - 0.05, baseH + mastH);
    const mastWidth = tileSize * 0.04;

    graphics.fillStyle(colors.mast);
    // Columna izquierda del mástil
    const mLLeft = localToScreen(-unitW/2 + 0.08, unitL/2 - 0.05, baseH);
    const mLTopLeft = localToScreen(-unitW/2 + 0.08, unitL/2 - 0.05, baseH + mastH);
    
    graphics.fillRect(mLLeft.x - mastWidth/2, mLTopLeft.y - mastH, mastWidth, mastH);
    
    // Columna derecha del mástil
    const mRRight = localToScreen(unitW/2 - 0.08, unitL/2 - 0.05, baseH);
    const mTopRight = localToScreen(unitW/2 - 0.08, unitL/2 - 0.05, baseH + mastH);
    
    graphics.fillRect(mRRight.x - mastWidth/2, mTopRight.y - mastH, mastWidth, mastH);

    // Barra superior del mástil
    const barTopY = Math.min(mLTopLeft.y, mTopRight.y);
    graphics.fillRect(
        mLLeft.x - mastWidth, 
        barTopY - tileSize * 0.03, 
        (unitW - 0.16) * tileSize * 0.866 + mastWidth * 2, 
        tileSize * 0.06
    );

    // 4. HORQUILLAS
    const forkY = mastBase.y - (mastH * 0.25);
    const forkLen = tileSize * 0.25;
    
    graphics.fillStyle(colors.forks);
    
    // Horquilla izquierda
    const forkLStart = localToScreen(-unitW/2 + 0.12, unitL/2, baseH + mastH * 0.1);
    graphics.beginPath();
    graphics.moveTo(forkLStart.x, forkLStart.y);
    graphics.lineTo(forkLStart.x + (facingRight ? forkLen : facingLeft ? -forkLen : 0), 
                    forkLStart.y + (facingDown ? forkLen * 0.5 : facingUp ? -forkLen * 0.5 : 0));
    graphics.lineTo(forkLStart.x + (facingRight ? forkLen : facingLeft ? -forkLen : 0), 
                    forkLStart.y + (facingDown ? forkLen * 0.5 : facingUp ? -forkLen * 0.5 : 0) + tileSize * 0.03);
    graphics.lineTo(forkLStart.x, forkLStart.y + tileSize * 0.03);
    graphics.closePath();
    graphics.fillPath();

    // Horquilla derecha
    const forkRStart = localToScreen(unitW/2 - 0.12, unitL/2, baseH + mastH * 0.1);
    graphics.beginPath();
    graphics.moveTo(forkRStart.x, forkRStart.y);
    graphics.lineTo(forkRStart.x + (facingRight ? forkLen : facingLeft ? -forkLen : 0), 
                    forkRStart.y + (facingDown ? forkLen * 0.5 : facingUp ? -forkLen * 0.5 : 0));
    graphics.lineTo(forkRStart.x + (facingRight ? forkLen : facingLeft ? -forkLen : 0), 
                    forkRStart.y + (facingDown ? forkLen * 0.5 : facingUp ? -forkLen * 0.5 : 0) + tileSize * 0.03);
    graphics.lineTo(forkRStart.x, forkRStart.y + tileSize * 0.03);
    graphics.closePath();
    graphics.fillPath();

    // 5. CABINA
    const cabinBase = localToScreen(0, -unitL/2 + 0.1, baseH);
    const cabinTop = localToScreen(0, -unitL/2 + 0.1, baseH + cabinH);
    const cabinInset = 0.08;

    const cbl = localToScreen(-unitW/2 + cabinInset, -unitL/2 + cabinInset, baseH);
    const cbr = localToScreen(unitW/2 - cabinInset, -unitL/2 + cabinInset, baseH);
    const cfl = localToScreen(-unitW/2 + cabinInset, unitL/2 - cabinInset * 2, baseH);
    const cfr = localToScreen(unitW/2 - cabinInset, unitL/2 - cabinInset * 2, baseH);

    const cblTop = localToScreen(-unitW/2 + cabinInset, -unitL/2 + cabinInset, baseH + cabinH);
    const cbrTop = localToScreen(unitW/2 - cabinInset, -unitL/2 + cabinInset, baseH + cabinH);
    const cflTop = localToScreen(-unitW/2 + cabinInset, unitL/2 - cabinInset * 2, baseH + cabinH);
    const cfrTop = localToScreen(unitW/2 - cabinInset, unitL/2 - cabinInset * 2, baseH + cabinH);

    graphics.fillStyle(colors.cabin);
    
    // Pared izquierda
    graphics.beginPath();
    graphics.moveTo(cbl.x, cbl.y);
    graphics.lineTo(cblTop.x, cblTop.y);
    graphics.lineTo(cflTop.x, cflTop.y);
    graphics.lineTo(cfl.x, cfl.y);
    graphics.closePath();
    graphics.fillPath();

    // Pared derecha
    graphics.beginPath();
    graphics.moveTo(cbr.x, cbr.y);
    graphics.lineTo(cbrTop.x, cbrTop.y);
    graphics.lineTo(cfrTop.x, cfrTop.y);
    graphics.lineTo(cfr.x, cfr.y);
    graphics.closePath();
    graphics.fillPath();

    // Frente de cabina
    graphics.fillStyle(0x1a1a1a);
    graphics.beginPath();
    graphics.moveTo(cfl.x, cfl.y);
    graphics.lineTo(cflTop.x, cflTop.y);
    graphics.lineTo(cfrTop.x, cfrTop.y);
    graphics.lineTo(cfr.x, cfr.y);
    graphics.closePath();
    graphics.fillPath();

    // Ventana
    graphics.fillStyle(colors.window);
    graphics.setAlpha(0.7);
    const winMargin = tileSize * 0.04;
    graphics.fillRect(
        cfl.x + (cfr.x - cfl.x) * 0.2,
        cflTop.y + winMargin,
        (cfr.x - cfl.x) * 0.6,
        (cfl.y - cflTop.y) * 0.6
    );
    graphics.setAlpha(1.0);

    // Techo de cabina
    graphics.fillStyle(0x111111);
    graphics.beginPath();
    graphics.moveTo(cblTop.x, cblTop.y);
    graphics.lineTo(cbrTop.x, cbrTop.y);
    graphics.lineTo(cfrTop.x, cfrTop.y);
    graphics.lineTo(cflTop.x, cflTop.y);
    graphics.closePath();
    graphics.fillPath();

    // 6. JAULA DE PROTECCIÓN
    const cageBaseY = cabinTop.y;
    const cageHeight = tileSize * 0.12;
    const cageTopY = cageBaseY - cageHeight;
    const barThick = tileSize * 0.015;

    graphics.fillStyle(colors.mast);
    
    // 4 barras verticales
    const barPositions = [0, 1/3, 2/3, 1];
    barPositions.forEach(t => {
        const barX = cbl.x + (cbr.x - cbl.x) * t;
        const barY = cbl.y + (cbr.y - cbl.y) * t;
        graphics.fillRect(barX - barThick/2, cageTopY, barThick, cageHeight);
    });

    // Barra superior horizontal
    graphics.fillRect(
        cbl.x - barThick,
        cageTopY - barThick,
        (cbr.x - cbl.x) + barThick * 2,
        barThick * 2
    );

    // 7. LUCES TRASERAS
    graphics.fillStyle(colors.lights);
    const lightSize = tileSize * 0.03;
    const lightY = blTop.y - tileSize * 0.05;
    
    graphics.fillCircle(bl.x + (br.x - bl.x) * 0.25, lightY, lightSize);
    graphics.fillCircle(bl.x + (br.x - bl.x) * 0.75, lightY, lightSize);

    // 8. RUEDAS DELANTERAS
    graphics.fillStyle(colors.wheels);
    const wheelFL = localToScreen(-unitW/2 + 0.1, unitL/2 - 0.08, 0.05);
    const wheelFR = localToScreen(unitW/2 - 0.1, unitL/2 - 0.08, 0.05);
    
    graphics.fillCircle(wheelFL.x, wheelFL.y, wheelSize);
    graphics.fillCircle(wheelFR.x, wheelFR.y, wheelSize);
}