#!/usr/bin/env bash
# Ejecuta archivos .sql contra la base de Supabase desde la terminal.
#
# Necesitas la cadena de conexión:
#   Supabase → Project Settings → Database → Connection string → URI
#   (marca "Use connection pooling" si tu red bloquea el puerto 5432)
#
# Uso:
#   export DATABASE_URL='postgresql://postgres.xxxx:CLAVE@aws-0-...pooler.supabase.com:6543/postgres'
#   ./scripts/sql.sh supabase/security_hardening.sql supabase/account_deletion.sql
#
# Sin argumentos ejecuta las dos migraciones pendientes en el orden correcto.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  cat <<'MSG'
✖ Falta DATABASE_URL.

  Cópiala de: Supabase → Project Settings → Database → Connection string → URI
  Acuérdate de reemplazar [YOUR-PASSWORD] por la clave real de la base.

    export DATABASE_URL='postgresql://postgres.xxxx:CLAVE@...:6543/postgres'
    ./scripts/sql.sh

MSG
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "✖ No tienes psql instalado."
  echo "  macOS:  brew install libpq && brew link --force libpq"
  echo "  Ubuntu: sudo apt install postgresql-client"
  echo ""
  echo "  Alternativa sin instalar nada: pega el archivo en el SQL Editor de Supabase."
  exit 1
fi

ARCHIVOS=("$@")
if [ ${#ARCHIVOS[@]} -eq 0 ]; then
  ARCHIVOS=(supabase/security_hardening.sql supabase/account_deletion.sql)
fi

for f in "${ARCHIVOS[@]}"; do
  echo ""
  echo "▶ Ejecutando $f"
  # ON_ERROR_STOP: si algo falla, corta ahí en vez de seguir a medias
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$f"
  echo "✓ $f aplicado"
done

echo ""
echo "Listo. Verifica que la función de borrado exista:"
echo "  psql \"\$DATABASE_URL\" -c \"select proname from pg_proc where proname='delete_my_account';\""
