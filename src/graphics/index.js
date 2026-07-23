// src/graphics/index.js
// Índice centralizado de exportaciones gráficas

// Montacargas (jugador e IA)
export { drawIsoForklift } from './forklift.js';

// Cajas (piso y estanterías)
export { drawIsoBox, drawIsoShelfBox } from './box.js';

// Paredes y estanterías
export { drawIsoTile, drawIsoSolidWall, drawIsoShelf } from './walls.js';

// Marcadores (objetivos y despacho)
export { drawIsoTarget, drawIsoDispatch } from './markers.js';