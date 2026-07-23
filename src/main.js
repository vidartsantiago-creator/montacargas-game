import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import ShowcaseScene from './scenes/ShowcaseScene.js';

// Configuración principal del juego
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 800,
    backgroundColor: '#1a1a1a',
    parent: 'game-container',
    scene: [ShowcaseScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Inicializar el juego
const game = new Phaser.Game(config);

export default game;