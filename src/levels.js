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
    }
];