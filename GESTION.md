# Accesos directos y comandos

Todo lo que queda pendiente, con el enlace directo a dónde se hace y el comando
de terminal equivalente cuando existe.

Datos del proyecto:

| | |
|---|---|
| Proyecto Supabase | `bogdnblwcdiydybnsqni` |
| Repositorio | `ssaavedraimportaciones-byte/rescate-sabor` |
| Rama de trabajo | `claude/deploy-rescate-sabor-RVwgR` |
| Sitio | `https://rescate-sabor-app1.vercel.app` |

---

## 1. Supabase

| Para qué | Enlace directo |
|---|---|
| **Ejecutar los SQL pendientes** | [SQL Editor](https://supabase.com/dashboard/project/bogdnblwcdiydybnsqni/sql/new) |
| Copiar la clave `service_role` | [Settings → API](https://supabase.com/dashboard/project/bogdnblwcdiydybnsqni/settings/api) |
| Copiar la cadena de conexión (para psql) | [Settings → Database](https://supabase.com/dashboard/project/bogdnblwcdiydybnsqni/settings/database) |
| Ver / borrar usuarios registrados | [Authentication → Users](https://supabase.com/dashboard/project/bogdnblwcdiydybnsqni/auth/users) |
| Activar o desactivar confirmación por email | [Authentication → Providers](https://supabase.com/dashboard/project/bogdnblwcdiydybnsqni/auth/providers) |
| Definir la URL del sitio (para el link de recuperar clave) | [Authentication → URL Configuration](https://supabase.com/dashboard/project/bogdnblwcdiydybnsqni/auth/url-configuration) |
| Ver los datos en tablas | [Table Editor](https://supabase.com/dashboard/project/bogdnblwcdiydybnsqni/editor) |
| Revisar avisos de seguridad | [Advisors](https://supabase.com/dashboard/project/bogdnblwcdiydybnsqni/advisors/security) |

### Ejecutar los SQL pendientes

**Por navegador:** abre el [SQL Editor](https://supabase.com/dashboard/project/bogdnblwcdiydybnsqni/sql/new),
pega el contenido de cada archivo y dale Run. En este orden:

1. `supabase/security_hardening.sql`
2. `supabase/account_deletion.sql`

**Por terminal:**

```bash
# La cadena está en Settings → Database → Connection string → URI
# (reemplaza [YOUR-PASSWORD] por la clave real de la base)
export DATABASE_URL='postgresql://postgres.bogdnblwcdiydybnsqni:CLAVE@aws-0-sa-east-1.pooler.supabase.com:6543/postgres'

npm run db          # ejecuta los dos archivos en orden
```

Comprobar que quedó aplicado:

```bash
psql "$DATABASE_URL" -c "select proname from pg_proc where proname in ('delete_my_account','enforce_role_immutable');"
```

Deberías ver las dos funciones. Si falta alguna, el SQL no corrió completo.

---

## 2. Cuentas de prueba para Google

Google no puede revisar la app si no puede entrar. Crea las dos cuentas con datos
de ejemplo (tienda + bolsas publicadas) de una sola vez:

```bash
export SUPABASE_URL=https://bogdnblwcdiydybnsqni.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Settings → API → service_role

npm run demo
```

Crea `comprador@rescatesabor.cl` y `vendedor@rescatesabor.cl` (clave `Demo1234!`),
más una tienda con tres bolsas. Es idempotente: si ya existen no las duplica, y
avisa si los roles quedaron mal (señal de que falta el SQL del paso 1).

> La `service_role` se salta todas las reglas de seguridad. Úsala solo en tu
> terminal: nunca en el frontend ni subida al repo.

### Hacerte administrador

Nadie puede auto-asignarse admin desde la app. Regístrate normal y después:

```bash
npm run admin -- tu@correo.com
```

O desde el [SQL Editor](https://supabase.com/dashboard/project/bogdnblwcdiydybnsqni/sql/new):

```sql
update public.profiles set role = 'admin' where email = 'tu@correo.com';
```

---

## 3. Repositorio y despliegue

| Para qué | Enlace directo |
|---|---|
| Ver el código | [Repositorio](https://github.com/ssaavedraimportaciones-byte/rescate-sabor) |
| Ver la rama con todo esto | [claude/deploy-rescate-sabor-RVwgR](https://github.com/ssaavedraimportaciones-byte/rescate-sabor/tree/claude/deploy-rescate-sabor-RVwgR) |
| Abrir un pull request | [Nuevo PR](https://github.com/ssaavedraimportaciones-byte/rescate-sabor/compare/claude/deploy-rescate-sabor-RVwgR?expand=1) |
| Ver si el deploy pasó | [Actions](https://github.com/ssaavedraimportaciones-byte/rescate-sabor/actions) |
| Secretos del deploy | [Settings → Secrets](https://github.com/ssaavedraimportaciones-byte/rescate-sabor/settings/secrets/actions) |
| Panel de Vercel | [vercel.com/dashboard](https://vercel.com/dashboard) → proyecto `rescate-sabor-app1` |

```bash
# desarrollo local
npm install && npm run dev            # http://localhost:3000

# ver el build de producción tal como queda desplegado
npm run build && npm run preview
```

Comprobar que el sitio publicado tiene lo que Google va a buscar:

```bash
SITIO=https://rescate-sabor-app1.vercel.app
for u in privacidad.html terminos.html eliminar-cuenta.html manifest.json \
         offline.html sw.js .well-known/assetlinks.json; do
  printf '%s  %s\n' "$(curl -s -o /dev/null -w '%{http_code}' $SITIO/$u)" "$u"
done
```

Los siete deben responder `200`.

---

## 4. Google Play

| Para qué | Enlace directo |
|---|---|
| Crear la cuenta de desarrollador (25 USD) | [Registro](https://play.google.com/console/signup) |
| Panel principal | [Play Console](https://play.google.com/console) |
| Políticas del programa | [Políticas](https://play.google.com/about/developer-content-policy/) |
| Probar cómo se ve un enlace compartido | [Facebook Debugger](https://developers.facebook.com/tools/debug/) |
| Validar la verificación de dominio | [Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator) |

Dentro de Play Console, las secciones que tienes que completar están en
**Contenido de la app** (política de privacidad, acceso a la app, seguridad de
los datos, clasificación de contenido). Las respuestas ya redactadas están en
[`playstore/README.md`](playstore/README.md).

### Generar el .aab

```bash
npm install -g @bubblewrap/cli

mkdir -p ~/rescate-sabor-android && cd ~/rescate-sabor-android
bubblewrap init --manifest https://rescate-sabor-app1.vercel.app/manifest.json
bubblewrap build
```

Necesita un JDK instalado. Los valores a responder están en la sección 3 de
`playstore/README.md`.

### Después de subir el primer .aab

Copia la huella SHA-256 desde **Play Console → Versiones → Firma de aplicaciones**
y pégala en `public/.well-known/assetlinks.json`, reemplazando el texto
`REEMPLAZAR_POR_LA_HUELLA_SHA256_DE_PLAY_APP_SIGNING`. Luego vuelve a desplegar y
verifica:

```bash
curl -s https://rescate-sabor-app1.vercel.app/.well-known/assetlinks.json
```

Sin ese paso la app abre con la barra del navegador visible.

---

## 5. Archivos que vas a subir a la ficha

```
playstore/icon-512.png                      → Icono de la app
playstore/feature-graphic-1024x500.png      → Gráfico destacado
playstore/screenshots/telefono/             → 5 capturas, teléfono
playstore/screenshots/tablet-7/             → 4 capturas, tablet 7"
playstore/screenshots/tablet-10/            → 4 capturas, tablet 10"
playstore/screenshots/chromebook/           → 3 capturas, Chromebook
```

Para regenerarlas si cambias el diseño: `python3 playstore/generar-capturas.py <carpeta>`
(la carpeta con las capturas crudas de la app).

---

## Resumen del orden

```bash
# 1. migraciones
export DATABASE_URL='postgresql://...'
npm run db

# 2. cuentas de prueba con datos
export SUPABASE_URL=https://bogdnblwcdiydybnsqni.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...
npm run demo

# 3. tu cuenta de admin
npm run admin -- tu@correo.com

# 4. comprobar el sitio publicado (bloque de la sección 3)

# 5. cuenta de Play Console → bubblewrap → subir a pruebas internas
#    → copiar SHA-256 → assetlinks.json → redesplegar → enviar a revisión
```
