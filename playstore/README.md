# Publicar Rescate Sabor en Google Play

Guía completa: qué exige Google, qué ya está resuelto en el repo y qué tienes que
hacer tú. La app es una PWA, así que se publica como **TWA** (Trusted Web Activity):
Android abre tu sitio real a pantalla completa, sin barra de navegador. Es el método
oficial de Google para PWAs, no un "wrapper" de los que rechazan.

---

## 1. Estado: qué está listo y qué falta

| Requisito de Google | Estado | Dónde |
|---|---|---|
| Política de privacidad en URL pública | ✅ Listo | `/privacidad.html` |
| Términos de servicio | ✅ Listo | `/terminos.html` |
| Borrado de cuenta **dentro** de la app | ✅ Listo | Menú de cuenta → «Eliminar mi cuenta» |
| Borrado de cuenta en **URL pública** | ✅ Listo | `/eliminar-cuenta.html` |
| Función de borrado en la base | ⚠️ Falta ejecutar | `supabase/account_deletion.sql` |
| Icono 512×512 | ✅ Listo | `playstore/icon-512.png` |
| Feature graphic 1024×500 | ✅ Listo | `playstore/feature-graphic-1024x500.png` |
| Capturas: teléfono, tablet 7", tablet 10" y Chromebook | ✅ Listo, 16 | `playstore/screenshots/` |
| Manifest PWA instalable | ✅ Listo | `public/manifest.json` |
| Pantalla offline (criterio de calidad TWA) | ✅ Listo | `public/offline.html` + `public/sw.js` |
| Cuentas de prueba para el revisor | ⚠️ Tuyo | Sección 7 |
| Verificación de dominio (assetlinks) | ⚠️ Falta la huella | `public/.well-known/assetlinks.json` |
| Textos de la ficha | ✅ Listo | Sección 4 de este documento |
| Formulario de seguridad de datos | ✅ Respuestas listas | Sección 5 |
| Clasificación de contenido | ✅ Respuestas listas | Sección 6 |
| Cuenta de desarrollador (25 USD) | ⚠️ Tuyo | play.google.com/console |
| Archivo `.aab` firmado | ⚠️ Tuyo | Sección 3 |

---

## 2. Antes de empezar

1. **Ejecuta los SQL pendientes** en el SQL Editor de Supabase, en este orden:
   - `supabase/security_hardening.sql`
   - `supabase/account_deletion.sql`

   Sin el segundo, el botón «Eliminar mi cuenta» dará error y Google **rechaza**
   la app por incumplir la política de borrado de cuentas.

2. **Verifica que el sitio esté publicado** y que estas URLs abran bien:
   - `https://TU-DOMINIO/privacidad.html`
   - `https://TU-DOMINIO/eliminar-cuenta.html`
   - `https://TU-DOMINIO/manifest.json`

3. **Decide el dominio definitivo.** Funciona con `rescate-sabor-app1.vercel.app`,
   pero un dominio propio (`rescatesabor.cl`) da mucha mejor impresión en la ficha y
   evita tener que rehacer la verificación después. Si lo cambias, actualiza el `host`
   y las URLs en `playstore/twa-manifest.json`.

---

## 3. Generar el archivo .aab

Se hace con **Bubblewrap**, la herramienta oficial de Google. Necesitas Node y un JDK.

```bash
npm install -g @bubblewrap/cli

# Crear el proyecto Android a partir del manifest de la PWA
mkdir -p ~/rescate-sabor-android && cd ~/rescate-sabor-android
bubblewrap init --manifest https://rescate-sabor-app1.vercel.app/manifest.json
```

Cuando pregunte, responde con estos valores (los mismos de `twa-manifest.json`):

- **Package ID**: `cl.rescatesabor.app`
- **App name**: `Rescate Sabor`
- **Launcher name**: `Rescate Sabor`
- **Display mode**: `standalone`
- **Orientation**: `portrait`
- **Status bar color**: `#1b7a30`
- **Splash screen color**: `#ffffff`
- **Include support for Play Billing**: `No`

Luego:

```bash
bubblewrap build          # genera app-release-bundle.aab y firma con tu clave
```

Bubblewrap crea una clave de firma (`android.keystore`).
**Guárdala y respáldala: si la pierdes no puedes volver a actualizar la app nunca.**

### Verificar el dominio (paso que casi todos olvidan)

Sin esto la app abre con una **barra de navegador visible arriba**, y Google la marca
como de baja calidad.

1. Sube el `.aab` a Play Console (aunque sea a pruebas internas).
2. Ve a **Play Console → Versiones → Firma de aplicaciones** y copia la
   **huella digital del certificado SHA-256**.
3. Pégala en `public/.well-known/assetlinks.json`, reemplazando
   `REEMPLAZAR_POR_LA_HUELLA_SHA256_DE_PLAY_APP_SIGNING`.
4. Vuelve a desplegar el sitio.
5. Comprueba que abra: `https://TU-DOMINIO/.well-known/assetlinks.json`

> Usa la huella de **Play App Signing**, no la de tu keystore local. Google refirma
> la app al publicarla, así que la que importa es la suya.

---

## 4. Textos de la ficha

**Nombre de la app** (máx. 30)
```
Rescate Sabor
```

**Descripción corta** (máx. 80)
```
Rescata bolsas sorpresa de comida de tu barrio hasta 70% más baratas.
```

**Descripción completa** (máx. 4000)
```
Rescate Sabor conecta a negocios que tienen comida de sobra al final del día con
personas que quieren comprarla a precio reducido. Menos desperdicio, más sabor.

CÓMO FUNCIONA

1. El negocio publica una "bolsa sorpresa" con el excedente del día a precio rebajado.
2. Tú la reservas desde la app en menos de 30 segundos.
3. Pasas por el local en el horario indicado, muestras tu ticket digital y la retiras.

PARA QUIEN COMPRA

• Bolsas sorpresa con hasta 70% de descuento
• Panaderías, restaurantes, cafeterías, supermercados y más
• Reserva en segundos, sin filas ni llamadas
• Ticket digital que se actualiza en tiempo real
• Cada compra evita que comida en buen estado termine en la basura

PARA NEGOCIOS

• Recupera parte del valor de lo que hoy botas
• Registro gratuito, sin costo por publicar
• Panel con tus reservas en tiempo real
• Métricas de cuánto recuperas y cuánta pérdida evitas
• Clientes nuevos que descubren tu local

POR QUÉ IMPORTA

En Chile se pierden millones de toneladas de comida al año, mientras muchas familias
buscan opciones más accesibles. Rescate Sabor ataca los dos problemas a la vez:
el negocio recupera ingresos que daba por perdidos y tú comes bien gastando menos.

El pago se realiza directamente en el local al retirar tu bolsa.
```

### Capturas por tipo de dispositivo

Play Console pide las capturas separadas por formato. Ya están generadas con los
tamaños exactos que exige cada uno:

| Carpeta | Se sube en | Tamaño | Cantidad |
|---|---|---|---|
| `screenshots/telefono/` | Teléfono | 1080×1920 | 5 |
| `screenshots/tablet-7/` | Tablet de 7" | 1200×1920 | 4 |
| `screenshots/tablet-10/` | Tablet de 10" | 1920×1200 | 4 |
| `screenshots/chromebook/` | Chromebook / ChromeOS | 1920×1080 | 3 |

Subir las de tablet no es opcional en la práctica: si faltan, Google baja la
posición de la app en las búsquedas hechas desde tablets y Chromebooks, y muestra
un aviso de "no optimizada para este dispositivo".

Para regenerarlas después de un cambio de diseño está `playstore/generar-capturas.py`
(recibe la carpeta con las capturas crudas de la app).

**Categoría**: Comida y bebida
**Etiquetas**: comida, sustentabilidad, ahorro, delivery, medio ambiente
**Correo de contacto**: `ssaavedra.importaciones@gmail.com`
**Política de privacidad**: `https://TU-DOMINIO/privacidad.html`

> Si consigues un correo con dominio propio (`hola@rescatesabor.cl`), cámbialo aquí
> y también en las tres páginas de `public/`. Da más confianza que un Gmail.

---

## 5. Formulario de seguridad de datos

Google pregunta esto en **Play Console → Contenido de la app → Seguridad de los datos**.
Estas respuestas coinciden con lo que la app realmente hace hoy:

**¿Recopila o comparte datos de usuarios?** → Sí, recopila. No comparte con terceros.

| Tipo de dato | ¿Se recopila? | ¿Obligatorio? | Para qué |
|---|---|---|---|
| Dirección de correo | Sí | Sí | Funciones de la app, Gestión de la cuenta |
| Nombre | Sí | Sí | Funciones de la app |
| Dirección física (solo vendedores) | Sí | Sí | Funciones de la app |
| Compras en la app | No | — | El pago ocurre en el local |
| Ubicación | No | — | — |
| Fotos, contactos, archivos, actividad | No | — | — |

Otras respuestas:
- **¿Los datos van cifrados en tránsito?** → Sí (HTTPS)
- **¿El usuario puede pedir que se eliminen sus datos?** → Sí
- **URL de eliminación**: `https://TU-DOMINIO/eliminar-cuenta.html`
- **¿Hay recopilación por parte de terceros / SDK de publicidad?** → No

> Es importante declarar la **dirección física** de los vendedores. Si Google detecta
> que recoges un dato no declarado, suspende la app.

---

## 6. Clasificación de contenido

Cuestionario de IARC. Respuestas para esta app:

- Categoría: **Utilidad / Productividad / Comunicación / Otro**
- Violencia, sexo, lenguaje soez, drogas, apuestas → **No** a todo
- ¿Los usuarios pueden interactuar o compartir contenido? → **No**
  (compradores y vendedores no chatean ni publican contenido libre)
- ¿Comparte ubicación con otros usuarios? → **No**
- ¿Permite comprar bienes digitales? → **No**

Resultado esperado: apta para todo público.

---

## 7. Acceso para el revisor de Google (no te lo saltes)

Rescate Sabor exige iniciar sesión para ver lo importante. Cuando una app está
detrás de un login, Google **obliga** a entregar credenciales de prueba en
**Play Console → Contenido de la app → Acceso a la app**. Si no las das, el
revisor solo ve la pantalla de login y rechaza por "no pudimos evaluar la app".

Crea dos cuentas reales en producción y déjalas fijas:

| Rol | Correo sugerido | Para qué |
|---|---|---|
| Comprador | `demo.comprador@rescatesabor.cl` | Ver bolsas, reservar, ticket |
| Vendedor | `demo.vendedor@rescatesabor.cl` | Publicar bolsas y gestionar reservas |

Importante para que la demo se vea bien:

- La cuenta de vendedor debe tener **una tienda creada y 2 o 3 bolsas publicadas**.
  Si el revisor entra y ve todo vacío, la app parece incompleta.
- No borres estas cuentas ni les cambies la contraseña: Google las reutiliza en
  cada actualización que envíes.
- No hace falta dar la cuenta de admin. Es más, no la des.

En el campo de instrucciones de Play Console pega algo así:

```
La app tiene dos tipos de usuario. Puede entrar con cualquiera de estas cuentas:

COMPRADOR — ve bolsas disponibles y reserva
Usuario: demo.comprador@rescatesabor.cl
Clave: (la que definas)

VENDEDOR — publica bolsas y gestiona reservas
Usuario: demo.vendedor@rescatesabor.cl
Clave: (la que definas)

No se requiere código SMS ni verificación adicional.
El pago de las bolsas se realiza presencialmente en el local, la app no procesa pagos.
```

---

## 8. Otros datos de la ficha

- **Público objetivo**: 18 años en adelante (evita el régimen de "apps para niños").
- **¿App gratuita o de pago?**: Gratuita. **Ojo: esto no se puede cambiar después.**
- **¿Contiene anuncios?**: No.
- **Países**: Chile (puedes ampliar luego).

---

## 9. Orden recomendado

1. Ejecutar los dos SQL en Supabase.
1.b. Crear las dos cuentas de prueba (sección 7) con datos de ejemplo.
2. Desplegar el sitio y comprobar las URLs de la sección 2.
3. Crear la cuenta de desarrollador (25 USD, pago único, tarda 1–2 días en aprobarse).
4. `bubblewrap init` + `bubblewrap build` → `.aab`.
5. Subir a **pruebas internas** primero, nunca directo a producción.
6. Copiar la huella SHA-256 → `assetlinks.json` → redesplegar.
7. Instalar desde pruebas internas y verificar que **no aparezca la barra del navegador**.
8. Completar ficha, seguridad de datos y clasificación.
9. Enviar a revisión.

La primera revisión de una cuenta nueva suele tardar **varios días** y Google puede
pedir un video o una cuenta de prueba. Ten a mano un usuario de prueba
(comprador y vendedor) por si lo solicitan.

---

## 10. Motivos frecuentes de rechazo (y cómo evitamos cada uno)

| Motivo | Cómo queda cubierto |
|---|---|
| Sin política de privacidad o con URL rota | Página propia servida como archivo estático |
| No se puede borrar la cuenta | Botón en la app + URL pública + función en la base |
| Seguridad de datos mal declarada | Tabla de la sección 5, revisada contra el código |
| "Funcionalidad mínima" / solo un webview | Es un TWA con manifest, iconos y modo standalone |
| Barra de navegador visible | Se resuelve con assetlinks.json (paso 3) |
| Capturas que no muestran la app real | Las 16 capturas salen de la app funcionando |
| El revisor no puede entrar (app con login) | Cuentas de prueba de la sección 7 |
| Pantalla de error del navegador sin conexión | `offline.html` servida por el service worker |
