# Setup Supabase — Proyecto exclusivo para Rescate Sabor

Cada proyecto debe tener su propio proyecto Supabase. Sigue estos pasos.

---

## 1. Crear proyecto nuevo en Supabase

1. Ve a https://supabase.com/dashboard
2. Click **"New project"**
3. Nombre: `rescate-sabor`
4. Contraseña de base de datos: guárdala
5. Región: South America (São Paulo) — `sa-east-1`
6. Click **"Create new project"** y espera ~2 minutos

---

## 2. Obtener credenciales

En tu proyecto → **Settings → API**:

- `URL` → copia el campo **Project URL**
- `anon key` → copia el campo **anon public**

---

## 3. Actualizar el archivo .env

```bash
# En la raíz del proyecto:
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://TUPROJECTREF.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
EOF
```

---

## 4. Ejecutar el schema SQL

1. En Supabase → **SQL Editor → New query**
2. Copia y pega todo el contenido de `supabase/schema.sql`
3. Click **Run** (debe decir "Success")

---

## 5. Desactivar confirmación de email

En Supabase → **Authentication → Settings**:
- Desactivar **"Enable email confirmations"**
- Click Save

---

## 6. Crear usuarios y datos demo

```bash
node supabase/seed-users.js
```

Esto crea:
| Rol | Email | Password |
|-----|-------|----------|
| Comprador | comprador@rescatesabor.cl | Demo1234! |
| Vendedor | vendedor@rescatesabor.cl | Demo1234! |
| Admin | admin@rescatesabor.cl | Admin1234! |

---

## 7. Agregar secrets en GitHub

En GitHub → **Settings → Secrets and variables → Actions**:

- `VITE_SUPABASE_URL` → tu Project URL
- `VITE_SUPABASE_ANON_KEY` → tu anon key

---

## 8. Merge y deploy

```bash
git checkout SSAAVEDRA
git merge origin/claude/deploy-rescate-sabor-RVwgR --no-edit
git push origin SSAAVEDRA
```

GitHub Actions desplegará automáticamente en:
**https://ssaavedraimportaciones-byte.github.io/rescate-sabor/**
