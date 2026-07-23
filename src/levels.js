// src/levels.js
export const niveles = [
    {
        nombre: "Nivel 1 - Primer día",
        descripcion: "Recoge las cajas de las estanterías y llévalas a los objetivos",
        mapa: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
        ],
        cajas: [
            { row: 1, col: 3, estanteria: { row: 2, col: 3 }, nivel: 1 },
            { row: 5, col: 5, estanteria: { row: 4, col: 5 }, nivel: 0 }
        ],
        posicionesObjetivo: [
            { row: 1, col: 5 },
            { row: 6, col: 2 }
        ],
        jugadorInicio: { row: 1, col: 1 },
        cajasDecorativas: [
            { row: 2, col: 2, nivel: 0 },
            { row: 2, col: 4, nivel: 2 },
            { row: 4, col: 3, nivel: 0 }
        ],
        ia: {
            inicio: { row: 6, col: 6 },
            cajasAcopiadas: [
                { row: 1, col: 6, estanteria: { row: 2, col: 6 }, nivel: 0 },
                { row: 3, col: 1, estanteria: { row: 2, col: 1 }, nivel: 2 },
                { row: 5, col: 6, estanteria: { row: 4, col: 6 }, nivel: 1 }
            ],
            puntoDespacho: { row: 6, col: 1 }
        }
    },
    {
        nombre: "Nivel 2 - Dos entregas",
        descripcion: "Planifica tu ruta entre las estanterías",
        mapa: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        cajas: [
            { row: 1, col: 2, estanteria: { row: 2, col: 2 }, nivel: 0 },
            { row: 5, col: 7, estanteria: { row: 4, col: 7 }, nivel: 2 }
        ],
        posicionesObjetivo: [
            { row: 5, col: 2 },
            { row: 1, col: 7 }
        ],
        jugadorInicio: { row: 6, col: 1 },
        cajasDecorativas: [
            { row: 2, col: 3, nivel: 1 },
            { row: 2, col: 6, nivel: 0 },
            { row: 4, col: 2, nivel: 2 }
        ],
        ia: {
            inicio: { row: 1, col: 1 },
            cajasAcopiadas: [
                { row: 1, col: 4, estanteria: { row: 2, col: 4 }, nivel: 1 },
                { row: 3, col: 8, estanteria: { row: 2, col: 8 }, nivel: 0 },
                { row: 5, col: 4, estanteria: { row: 4, col: 4 }, nivel: 2 },
                { row: 3, col: 1, estanteria: { row: 2, col: 1 }, nivel: 1 }
            ],
            puntoDespacho: { row: 6, col: 8 }
        }
    },
    {
        nombre: "Nivel 3 - Pasillo estrecho",
        descripcion: "Navega entre estanterías y evita al otro montacargas",
        mapa: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        cajas: [
            { row: 1, col: 1, estanteria: { row: 2, col: 1 }, nivel: 2 },
            { row: 5, col: 5, estanteria: { row: 4, col: 5 }, nivel: 0 },
            { row: 7, col: 8, estanteria: { row: 6, col: 8 }, nivel: 1 }
        ],
        posicionesObjetivo: [
            { row: 3, col: 5 },
            { row: 7, col: 2 },
            { row: 8, col: 5 }
        ],
        jugadorInicio: { row: 1, col: 8 },
        cajasDecorativas: [
            { row: 2, col: 4, nivel: 0 },
            { row: 2, col: 6, nivel: 1 },
            { row: 2, col: 7, nivel: 2 },
            { row: 4, col: 2, nivel: 0 },
            { row: 4, col: 3, nivel: 1 },
            { row: 6, col: 3, nivel: 2 },
            { row: 6, col: 5, nivel: 0 }
        ],
        ia: {
            inicio: { row: 8, col: 1 },
            cajasAcopiadas: [
                { row: 1, col: 6, estanteria: { row: 2, col: 6 }, nivel: 0 },
                { row: 3, col: 1, estanteria: { row: 2, col: 1 }, nivel: 1 },
                { row: 5, col: 8, estanteria: { row: 4, col: 8 }, nivel: 2 },
                { row: 7, col: 5, estanteria: { row: 6, col: 5 }, nivel: 0 },
                { row: 8, col: 8, estanteria: { row: 6, col: 8 }, nivel: 1 }
            ],
            puntoDespacho: { row: 5, col: 1 }
        }
    },
    {
        nombre: "Nivel 4 - Pasillo en L",
        descripcion: "Navega el corredor con giro. La IA viene desde el otro extremo.",
        mapa: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 1, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        cajas: [
            { row: 1, col: 2, estanteria: { row: 2, col: 2 }, nivel: 0 },
            { row: 3, col: 7, estanteria: { row: 4, col: 7 }, nivel: 1 },
            { row: 8, col: 5, estanteria: { row: 7, col: 5 }, nivel: 2 }
        ],
        posicionesObjetivo: [
            { row: 1, col: 7 },
            { row: 5, col: 4 },
            { row: 8, col: 2 }
        ],
        jugadorInicio: { row: 1, col: 1 },
        cajasDecorativas: [
            { row: 2, col: 3, nivel: 0 },
            { row: 2, col: 5, nivel: 1 },
            { row: 4, col: 5, nivel: 2 },
            { row: 6, col: 2, nivel: 0 },
            { row: 7, col: 4, nivel: 1 }
        ],
        ia: {
            inicio: { row: 8, col: 8 },
            cajasAcopiadas: [
                { row: 1, col: 5, estanteria: { row: 2, col: 5 }, nivel: 0 },
                { row: 3, col: 2, estanteria: { row: 4, col: 2 }, nivel: 1 },
                { row: 5, col: 7, estanteria: { row: 4, col: 7 }, nivel: 2 },
                { row: 8, col: 3, estanteria: { row: 7, col: 3 }, nivel: 0 }
            ],
            puntoDespacho: { row: 6, col: 8 }
        }
    },

    {
        nombre: "Nivel 5 - Laberinto de estanterías",
        descripcion: "Múltiples pasillos. Planifica rutas para no chocar.",
        mapa: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        cajas: [
            { row: 1, col: 1, estanteria: { row: 2, col: 1 }, nivel: 0 },
            { row: 1, col: 8, estanteria: { row: 2, col: 8 }, nivel: 2 },
            { row: 6, col: 2, estanteria: { row: 7, col: 2 }, nivel: 1 },
            { row: 6, col: 7, estanteria: { row: 7, col: 7 }, nivel: 0 }
        ],
        posicionesObjetivo: [
            { row: 2, col: 4 },
            { row: 2, col: 5 },
            { row: 7, col: 4 },
            { row: 7, col: 5 }
        ],
        jugadorInicio: { row: 4, col: 4 },
        cajasDecorativas: [
            { row: 1, col: 4, nivel: 0 },
            { row: 1, col: 5, nivel: 1 },
            { row: 2, col: 2, nivel: 2 },
            { row: 2, col: 7, nivel: 0 },
            { row: 6, col: 4, nivel: 1 },
            { row: 6, col: 5, nivel: 2 },
            { row: 7, col: 1, nivel: 0 },
            { row: 7, col: 8, nivel: 1 }
        ],
        ia: {
            inicio: { row: 8, col: 1 },
            cajasAcopiadas: [
                { row: 1, col: 2, estanteria: { row: 2, col: 2 }, nivel: 0 },
                { row: 1, col: 7, estanteria: { row: 2, col: 7 }, nivel: 1 },
                { row: 4, col: 1, estanteria: { row: 5, col: 1 }, nivel: 2 },
                { row: 4, col: 8, estanteria: { row: 5, col: 8 }, nivel: 0 },
                { row: 8, col: 4, estanteria: { row: 7, col: 4 }, nivel: 1 },
                { row: 8, col: 7, estanteria: { row: 7, col: 7 }, nivel: 2 }
            ],
            puntoDespacho: { row: 4, col: 5 }
        }
    },

    {
        nombre: "Nivel 6 - Almacén multi-despacho",
        descripcion: "Dos puntos de despacho. La IA es más agresiva.",
        mapa: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        cajas: [
            { row: 1, col: 2, estanteria: { row: 2, col: 2 }, nivel: 0 },
            { row: 1, col: 9, estanteria: { row: 2, col: 9 }, nivel: 1 },
            { row: 4, col: 3, estanteria: { row: 3, col: 3 }, nivel: 2 },
            { row: 4, col: 8, estanteria: { row: 3, col: 8 }, nivel: 0 },
            { row: 9, col: 4, estanteria: { row: 8, col: 4 }, nivel: 1 },
            { row: 9, col: 7, estanteria: { row: 8, col: 7 }, nivel: 2 }
        ],
        posicionesObjetivo: [
            { row: 2, col: 5 },
            { row: 2, col: 6 },
            { row: 7, col: 5 },
            { row: 7, col: 6 },
            { row: 5, col: 2 },
            { row: 5, col: 9 }
        ],
        jugadorInicio: { row: 5, col: 5 },
        cajasDecorativas: [
            { row: 2, col: 3, nivel: 0 },
            { row: 2, col: 4, nivel: 1 },
            { row: 2, col: 7, nivel: 2 },
            { row: 2, col: 8, nivel: 0 },
            { row: 3, col: 2, nivel: 1 },
            { row: 3, col: 9, nivel: 2 },
            { row: 7, col: 3, nivel: 0 },
            { row: 7, col: 4, nivel: 1 },
            { row: 7, col: 7, nivel: 2 },
            { row: 7, col: 8, nivel: 0 },
            { row: 8, col: 5, nivel: 1 },
            { row: 8, col: 6, nivel: 2 }
        ],
        ia: {
            inicio: { row: 9, col: 10 },
            cajasAcopiadas: [
                { row: 1, col: 4, estanteria: { row: 2, col: 4 }, nivel: 0 },
                { row: 1, col: 7, estanteria: { row: 2, col: 7 }, nivel: 1 },
                { row: 4, col: 2, estanteria: { row: 3, col: 2 }, nivel: 2 },
                { row: 4, col: 9, estanteria: { row: 3, col: 9 }, nivel: 0 },
                { row: 5, col: 1, estanteria: { row: 6, col: 1 }, nivel: 1 },
                { row: 5, col: 10, estanteria: { row: 6, col: 10 }, nivel: 2 },
                { row: 9, col: 3, estanteria: { row: 8, col: 3 }, nivel: 0 },
                { row: 9, col: 8, estanteria: { row: 8, col: 8 }, nivel: 1 }
            ],
            puntoDespacho: { row: 5, col: 6 }
        }
    }
];
export default niveles;