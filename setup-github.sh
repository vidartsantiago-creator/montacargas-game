#!/bin/bash

# Script de configuración y despliegue a GitHub
# Uso: ./setup-github.sh

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}🚛 Configuración de GitHub - Montacargas${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Verificar si git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado. Instálalo primero:${NC}"
    echo "   Ubuntu/Debian: sudo apt install git"
    echo "   macOS: brew install git"
    exit 1
fi

# Verificar si ya es un repo de git
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} El directorio ya es un repositorio Git"
else
    echo -e "${BLUE} Inicializando repositorio Git...${NC}"
    git init
    echo -e "${GREEN}✓${NC} Repositorio inicializado"
fi

echo ""
echo -e "${BLUE}📝 Configurando archivos para commit...${NC}"

# Crear .gitignore si no existe
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencias
node_modules/

# Build output
dist/

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
EOF
    echo -e "${GREEN}✓${NC} .gitignore creado"
fi

# Añadir todos los archivos
git add .
echo -e "${GREEN}✓${NC} Archivos añadidos al staging"

# Verificar si hay cambios
if git diff --cached --quiet; then
    echo -e "${RED}⚠️  No hay cambios para commit${NC}"
else
    echo ""
    echo -e "${BLUE} Configurando commit inicial...${NC}"
    git commit -m "Initial commit: Montacargas game with isometric rendering"
    echo -e "${GREEN}✓${NC} Commit inicial creado"
fi

echo ""
echo -e "${BLUE}🔗 Configurando remote de GitHub...${NC}"
echo ""
echo "Ingresa la URL de tu repositorio GitHub:"
echo "(Ejemplo: https://github.com/tu-usuario/montacargas-game.git)"
echo ""
read -p "URL del repo: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo -e "${RED}❌ URL vacía. Saliendo...${NC}"
    exit 1
fi

# Verificar si el remote ya existe
if git remote | grep -q "^origin$"; then
    echo -e "${BLUE}⚠️  Remote 'origin' ya existe. Actualizando...${NC}"
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi
echo -e "${GREEN}✓${NC} Remote configurado: $REPO_URL"

echo ""
echo -e "${BLUE}🚀 Subiendo a GitHub...${NC}"

# Intentar push
if git push -u origin main 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Código subido exitosamente a 'main'"
elif git push -u origin master 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Código subido exitosamente a 'master'"
else
    echo -e "${RED}⚠️  El push falló. Posibles causas:${NC}"
    echo "   1. No has configurado autenticación (SSH o HTTPS)"
    echo "   2. El repositorio no existe en GitHub"
    echo "   3. No tienes permisos de escritura"
    echo ""
    echo -e "${BLUE} Para configurar autenticación:${NC}"
    echo "   Opción A (HTTPS):"
    echo "   git config --global credential.helper cache"
    echo "   Luego haz push manualmente: git push -u origin main"
    echo ""
    echo "   Opción B (SSH):"
    echo "   ssh-keygen -t ed25519 -C 'tu-email@ejemplo.com'"
    echo "   Agrega la clave pública a GitHub: Settings > SSH and GPG keys"
    echo ""
    echo -e "${BLUE}📋 Comando manual para intentar:${NC}"
    echo "   git push -u origin main"
fi

echo ""
echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}✅ Configuración completada${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo "📊 Tu juego está en GitHub:"
echo "   $REPO_URL"
echo ""
echo "🎮 Para ejecutar localmente:"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "📝 Próximos pasos recomendados:"
echo "   1. Agregar descripción y screenshot al repo en GitHub"
echo "   2. Configurar GitHub Pages para deploy automático"
echo "   3. Agregar issues para features futuras"
echo ""