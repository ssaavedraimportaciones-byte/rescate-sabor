#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════
# Rescate Sabor — Setup completo
# Ejecuta desde tu máquina local (necesita internet)
#
# Uso:
#   chmod +x setup.sh
#   ./setup.sh
# ═══════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}══════════════════════════════════════${NC}"
echo -e "${CYAN}  🥡 Rescate Sabor — Setup${NC}"
echo -e "${CYAN}══════════════════════════════════════${NC}"
echo ""

# ── 1. Verificar dependencias ──
echo -e "${YELLOW}[1/5]${NC} Verificando dependencias..."
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js no instalado${NC}"; exit 1; }
command -v npm >/dev/null 2>&1  || { echo -e "${RED}❌ npm no instalado${NC}"; exit 1; }
echo -e "  Node $(node -v) ✓"
echo -e "  npm $(npm -v) ✓"

# ── 2. Instalar dependencias ──
echo ""
echo -e "${YELLOW}[2/5]${NC} Instalando dependencias..."
npm install --silent 2>/dev/null
echo -e "  ${GREEN}✓ Dependencias instaladas${NC}"

# ── 3. Configurar Supabase ──
echo ""
echo -e "${YELLOW}[3/5]${NC} Configurando Supabase..."

if [ -f .env ]; then
  source <(grep -v '^#' .env | sed 's/^/export /')
fi

# Verificar si la anon key es válida (debe ser un JWT — empieza con eyJ)
NEEDS_KEY=false
if [ -z "${VITE_SUPABASE_ANON_KEY:-}" ] || [[ ! "${VITE_SUPABASE_ANON_KEY}" == eyJ* ]]; then
  NEEDS_KEY=true
fi

if [ -z "${VITE_SUPABASE_URL:-}" ] || [[ "${VITE_SUPABASE_URL}" == *"placeholder"* ]] || [[ "${VITE_SUPABASE_URL}" == *"your-project"* ]]; then
  echo -e "${RED}  ⚠ Falta VITE_SUPABASE_URL${NC}"
  echo -e "  Ingresa tu URL de Supabase (ej: https://xxxxx.supabase.co):"
  read -r VITE_SUPABASE_URL
fi

if [ "$NEEDS_KEY" = true ]; then
  echo -e "${RED}  ⚠ La VITE_SUPABASE_ANON_KEY actual no es válida${NC}"
  echo -e "  La clave debe ser un JWT (empieza con eyJhbG...)"
  echo -e ""
  echo -e "  Para obtenerla:"
  echo -e "  1. Ve a ${CYAN}https://supabase.com/dashboard${NC}"
  echo -e "  2. Selecciona tu proyecto"
  echo -e "  3. Settings → API → anon public"
  echo -e ""
  echo -e "  Pega tu anon key aquí:"
  read -r VITE_SUPABASE_ANON_KEY
fi

# Guardar .env
cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
EOF

echo -e "  ${GREEN}✓ .env actualizado${NC}"

# ── 4. Ejecutar SQL en Supabase ──
echo ""
echo -e "${YELLOW}[4/5]${NC} Configurando base de datos..."

# Intentar con Supabase CLI si existe
if command -v supabase >/dev/null 2>&1; then
  echo -e "  Supabase CLI detectado"
  echo -e "  Ejecutando schema.sql..."
  # Extraer project ref de la URL
  PROJECT_REF=$(echo "$VITE_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
  supabase db execute --project-ref "$PROJECT_REF" -f supabase/schema.sql 2>/dev/null && {
    echo -e "  ${GREEN}✓ Schema ejecutado${NC}"
  } || {
    echo -e "  ${YELLOW}⚠ No se pudo ejecutar automáticamente${NC}"
    echo -e "  Ejecuta manualmente: copia supabase/schema.sql en el SQL Editor de Supabase"
  }
elif [ -f "$HOME/.supabase/access-token" ]; then
  # Intentar con Management API
  TOKEN=$(cat "$HOME/.supabase/access-token")
  PROJECT_REF=$(echo "$VITE_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
  SQL=$(cat supabase/schema.sql)

  echo -e "  Usando Management API..."
  HTTP_CODE=$(curl -s -o /tmp/supabase_response.json -w "%{http_code}" -X POST \
    "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$(python3 -c "import json,sys; print(json.dumps({'query': sys.stdin.read()}))" <<< "$SQL")" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "  ${GREEN}✓ Schema ejecutado exitosamente${NC}"
  else
    echo -e "  ${YELLOW}⚠ Management API falló (HTTP $HTTP_CODE)${NC}"
    echo -e ""
    echo -e "  ${CYAN}Ejecuta manualmente:${NC}"
    echo -e "  1. Ve a ${CYAN}https://supabase.com/dashboard/project/${PROJECT_REF}/sql${NC}"
    echo -e "  2. Copia y pega el contenido de ${CYAN}supabase/schema.sql${NC}"
    echo -e "  3. Click 'Run'"
  fi
else
  PROJECT_REF=$(echo "$VITE_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
  echo -e "  ${YELLOW}⚠ No se detectó Supabase CLI ni access token${NC}"
  echo -e ""
  echo -e "  ${CYAN}Ejecuta manualmente:${NC}"
  echo -e "  1. Ve a ${CYAN}https://supabase.com/dashboard/project/${PROJECT_REF}/sql${NC}"
  echo -e "  2. Copia y pega el contenido de ${CYAN}supabase/schema.sql${NC}"
  echo -e "  3. Click 'Run'"
fi

# ── 5. Build ──
echo ""
echo -e "${YELLOW}[5/5]${NC} Haciendo build de producción..."
npm run build --silent 2>/dev/null
echo -e "  ${GREEN}✓ Build exitoso${NC}"

# ── Resumen ──
echo ""
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Setup completado${NC}"
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo ""
echo -e "  Comandos disponibles:"
echo -e "  ${CYAN}npm run dev${NC}     → Servidor de desarrollo (puerto 3000)"
echo -e "  ${CYAN}npm run build${NC}   → Build de producción"
echo -e "  ${CYAN}npm run preview${NC} → Vista previa del build"
echo ""
echo -e "  ${YELLOW}Recuerda:${NC}"
echo -e "  • En Supabase → Authentication → Settings → desactivar 'Enable email confirmations'"
echo -e "  • Si usas Vercel, agrega las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY"
echo ""
