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
