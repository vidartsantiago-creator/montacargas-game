# 🚛 Montacargas - Juego de Depósito Isométrico

Un juego de puzzle y estrategia donde controlas un montacargas en un depósito, compitiendo contra una IA para recoger y entregar cajas antes de que te atrapen.

## 🎮 Características

- **Perspectiva caballera asimétrica** (-45°/+45°) con visión en picado
- **IA independiente** con pathfinding BFS que recoge cajas de estanterías
- **Sistema de colisiones**: evita al montacargas de la IA o perderás
- **Estanterías modulares** transparentes con cajas en diferentes niveles
- **Paredes perimetrales** de cemento con techo y caras visibles
- **Audio sintético** generado con Web Audio API
- **Efectos de partículas** en entregas y colisiones
- **3 niveles** con dificultad progresiva

## 🚀 Instalación y Ejecución

### Requisitos previos
- Node.js (v16 o superior)
- npm o yarn

### Pasos

```bash
# Clonar el repositorio (si ya está en GitHub)
git clone <tu-repo-url>
cd montacargas-game

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

---------------------------------------------------------------------------------------------
El juego se ejecutará en http://localhost:5173
🎯 Cómo Jugar
Controles
Flechas del teclado: Mover el montacargas
ESPACIO: Recoger caja de estantería adyacente / Soltar caja en objetivo
R: Reiniciar nivel actual
N: Siguiente nivel
P: Nivel anterior
Objetivo
Recoge las cajas amarillas de las estanterías (acércate y presiona ESPACIO)
Llévalas a las posiciones objetivo marcadas en azul
Evita chocar con el montacargas azul de la IA
Completa todas las entregas antes de que la IA te atrape
Mecánicas
Cajas en estanterías: Las cajas están en los estantes (niveles 0, 1, 2), no en el piso
IA autónoma: El montacargas azul trabaja solo, recogiendo cajas azules y llevándolas al punto de despacho (rojo)
Resaltado magenta: Indica qué caja va a buscar la IA
Colisión = Derrota: Si ocupas la misma casilla que la IA, pierdes

---------------------------------------------------------------------------------------------
🏗️ Estructura del Proyecto

montacargas-game/
├── src/
│   ├── main.js          # Lógica principal del juego
│   ├── levels.js        # Datos de los 3 niveles
│   └── render.js        # Motor de renderizado isométrico
├── index.html           # HTML base
├── vite.config.js       # Configuración de Vite
├── package.json         # Dependencias y scripts
└── README.md            # Este archivo
---------------------------------------------------------------------------------------------
🎨 Arquitectura Técnica
Motor de renderizado (render.js)
Proyección caballera asimétrica (-45°/+45°)
Depth sorting dinámico basado en coordenada Y de pantalla
Funciones modulares para cada elemento visual:
drawIsoTile(): Suelo
drawIsoSolidWall(): Paredes perimetrales con techo
drawIsoShelf(): Estanterías modulares transparentes
drawIsoShelfBox(): Cajas en estanterías
drawIsoBox(): Cajas en el piso
drawIsoForklift(): Montacargas (jugador e IA)
Lógica del juego (main.js)
Clase MiEscena que extiende Phaser.Scene
Sistema de auto-repeat para movimiento continuo
Pathfinding BFS para la IA
Máquina de estados de la IA: buscando_caja → yendo_a_caja → yendo_a_despacho
Detección de colisiones jugador-IA
Transición automática entre niveles con Phaser Registry
Niveles (levels.js)
Cada nivel contiene:
mapa: Matriz 2D (0 = pasillo, 1 = pared/estantería)
cajas: Array de cajas del jugador con estanteria y nivel
posicionesObjetivo: Donde deben entregarse las cajas
cajasDecorativas: Cajas fijas en estanterías (solo visuales)
ia: Configuración de la IA con cajasAcopiadas y puntoDespacho
---------------------------------------------------------------------------------------------
🔧 Desarrollo

Agregar un nuevo nivel
Edita src/levels.js y agrega un nuevo objeto al array niveles:

{
    nombre: "Nivel 4 - Tu nivel",
    descripcion: "Descripción del nivel",
    mapa: [
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
    ],
    cajas: [
        { row: 1, col: 1, estanteria: { row: 2, col: 1 }, nivel: 0 }
    ],
    posicionesObjetivo: [
        { row: 2, col: 2 }
    ],
    jugadorInicio: { row: 1, col: 2 },
    cajasDecorativas: [],
    ia: {
        inicio: { row: 2, col: 2 },
        cajasAcopiadas: [],
        puntoDespacho: { row: 1, col: 2 }
    }
}
---------------------------------------------------------------------------------------------
Ajustar perspectiva
En src/render.js, modifica:
export const ANGLE_X = -45 * (Math.PI / 180);  // Ángulo eje X
export const ANGLE_Y = 45 * (Math.PI / 180);   // Ángulo eje Y
export const SCALE_Y = 0.9;  // Factor de aplanamiento vertical

---------------------------------------------------------------------------------------------
Cambiar velocidad de la IA
En src/main.js, busca:

this.timerIA = this.time.addEvent({
    delay: 350,  // ← Cambiar este valor (ms)
    callback: this.turnoIA,
    callbackScope: this,
    loop: true
});

---------------------------------------------------------------------------------------------

🐛 Problemas Conocidos
El resaltado de objetivo de IA usa strokeRect euclidiano (no sigue la perspectiva)
No hay sistema de puntuación ni temporizador (planeado para futuras versiones)
La IA no considera al jugador en su pathfinding (puede causar colisiones "injustas")
📝 Mejoras Futuras (Roadmap)
Sistema de temporizador por nivel
Puntuación y récords en localStorage
Animación suave de movimiento (tween)
Tutorial visual para primer nivel
Más niveles (5-10 adicionales)
Sistema de recepción de cajas (llegan automáticamente)
Múltiples puntos de despacho
Modo "infinito" con generación procedural
️ Tecnologías
Phaser 3: Framework de juegos HTML5
Vite: Build tool y dev server
JavaScript ES6+: Sin frameworks adicionales
Web Audio API: Audio sintético sin archivos externos
📄 Licencia
MIT License - Siéntete libre de usar, modificar y distribuir.
👤 Autor
Desarrollado como proyecto de aprendizaje de renderizado isométrico y IA en juegos.

---------------------------------------------------------------------------------------------
