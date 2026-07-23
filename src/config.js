// src/config.js
// Configuración externa de estilo gráfico y parámetros del juego

export const config = {
  video: {
    width: 1024,
    height: 800,
    backgroundColor: '#111111'
  },
  isometric: {
    tileSize: 60,
    angleX: -45,
    angleY: 45,
    scaleY: 0.9
  },
  gameplay: {
    movementDelayInitial: 200,
    movementRepeatInterval: 150,
    tweenDuration: 150
  },
  palette: {
    floor: 0x555555,
    floorBorder: 0x777777,
    wallExterior: 0x5a5a5a,
    wallInterior: 0x7a7a7a,
    wallTop: 0x9a9a9a,
    forkliftPlayer: {
      body: 0xffcc00,
      cabin: 0x444444,
      wheels: 0x000000
    },
    forkliftAI: {
      body: 0x3399ff,
      cabin: 0x222244,
      wheels: 0x000000
    },
    box: {
      base: 0xcc9933,
      shadow: 0xaa7722,
      highlight: 0xeebb44,
      tape: 0xddaa66
    },
    target: 0x0088ff,
    targetBorder: 0x00aaff,
    dispatch: 0xff4400,
    dispatchBorder: 0xff6600,
    shelf: {
      post: 0x999999,
      shelf: 0xaaaaaa
    }
  },
  assets: {
    shelfLevels: 3,
    wallHeight: 65,
    forkliftBodyHeight: 18,
    forkliftCabinHeight: 12,
    boxShrink: 0.75,
    forkliftShrink: 0.7,
    cabinShrink: 0.5
  }
};

export default config;