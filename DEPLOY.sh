#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
# Rescate Sabor — DEPLOY COMPLETO (copy-paste y ejecutar)
# ═══════════════════════════════════════════════════════════
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  🥡 Rescate Sabor — Deploy completo${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""

# ── PASO 1: Merge a SSAAVEDRA ──
echo -e "${YELLOW}[1/4]${NC} Mergeando a SSAAVEDRA..."
git fetch origin
git checkout SSAAVEDRA
git merge origin/claude/deploy-rescate-sabor-RVwgR --no-edit
git push origin SSAAVEDRA
echo -e "  ${GREEN}✅ Merge completado — Deploy de GitHub Pages iniciado${NC}"

# ── PASO 2: Instalar dependencias ──
echo ""
echo -e "${YELLOW}[2/4]${NC} Verificando dependencias..."
npm install --silent 2>/dev/null
echo -e "  ${GREEN}✅ Dependencias OK${NC}"

# ── PASO 3: Configurar Supabase ──
echo ""
echo -e "${YELLOW}[3/4]${NC} Configurando Supabase..."

if [ -f .env ]; then
  source <(grep -v '^#' .env | sed 's/^/export /')
fi

# Verificar clave
NEEDS_KEY=false
if [ -z "${VITE_SUPABASE_ANON_KEY:-}" ] || \
   { [[ ! "${VITE_SUPABASE_ANON_KEY}" == eyJ* ]] && [[ ! "${VITE_SUPABASE_ANON_KEY}" == sb_publishable_* ]]; }; then
  NEEDS_KEY=true
fi

if [ "$NEEDS_KEY" = true ]; then
  echo -e "${RED}  ⚠ La VITE_SUPABASE_ANON_KEY no es válida${NC}"
  echo -e "  Ve a ${CYAN}https://supabase.com/dashboard${NC} → tu proyecto → Settings → API"
  echo -e "  Pega tu anon key aquí:"
  read -r VITE_SUPABASE_ANON_KEY
  cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
EOF
  echo -e "  ${GREEN}✅ .env actualizado${NC}"
fi

# ── PASO 4: Schema + usuarios ──
echo ""
echo -e "${YELLOW}[4/4]${NC} Base de datos y usuarios..."

PROJECT_REF=$(echo "$VITE_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')

echo -e ""
echo -e "  ${CYAN}▸ Paso manual necesario:${NC}"
echo -e "  1. Abre: ${CYAN}https://supabase.com/dashboard/project/${PROJECT_REF}/sql${NC}"
echo -e "  2. Pega el contenido de ${CYAN}supabase/schema.sql${NC}"
echo -e "  3. Click ${CYAN}Run${NC}"
echo -e "  4. En ${CYAN}Authentication → Settings${NC}: desactivar 'Enable email confirmations'"
echo -e ""
read -p "  ¿Ya ejecutaste el schema y desactivaste email confirmations? (s/n): " READY

if [ "$READY" = "s" ] || [ "$READY" = "S" ]; then
  echo -e "  Creando usuarios demo..."
  node supabase/seed-users.js
else
  echo -e "  ${YELLOW}Cuando estés listo, ejecuta: node supabase/seed-users.js${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ ¡Deploy completo!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 App: ${CYAN}https://ssaavedraimportaciones-byte.github.io/rescate-sabor/${NC}"
echo ""
echo -e "  🛍️  Comprador: comprador@rescatesabor.cl / Demo1234!"
echo -e "  🏪 Vendedor:  vendedor@rescatesabor.cl  / Demo1234!"
echo -e "  👑 Admin:     admin@rescatesabor.cl     / Admin1234!"
echo ""
