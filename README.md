# Mi Proyecto de Vida · Plataforma de Orientación

**Colegio Marina de Chile · Concepción**: Unidad Técnica Pedagógica, Coordinación de Segundo Ciclo.

Plataforma web para el proceso **"Proyecto de vida y decisión de continuidad en enseñanza media"** (8° básico, 5 sesiones de 75 minutos). Funciona sobre **Google Apps Script**, guarda los datos en una planilla privada de Google y el código se puede compartir en **GitHub** sin exponer información personal, según la **Ley 21.719** de protección de datos personales.

> El repositorio **no contiene datos personales**. Los datos viven en la cuenta de Google del colegio. Las claves (IA, «pimienta» de contraseñas, ID de planilla) se guardan en *Propiedades del script*, que nunca se sube a GitHub.

---

## ✨ Qué hace cada perfil

| Perfil | Funciones |
|---|---|
| **Administración** | Todo lo de docentes, más crear, editar y eliminar perfiles; carga masiva desde Excel; crear, editar y eliminar sesiones, materiales y cuestionarios; habilitar cuestionarios para todos los cursos; decidir si las familias ven la retroalimentación; configuración, imágenes, auditoría y política de conservación. |
| **Docentes y asistentes** | Ver y usar el material de **sus cursos**; subir material; editar sesiones (se crea una versión solo para sus cursos) con **elementos emergentes**; habilitar cuestionarios por curso; descargar el **reporte de sesión** (PDF/CSV) con resultados de encuestas; reportes individuales y de curso; mensajes individuales y masivos a estudiantes y familias; **análisis con IA** individual y de curso con gráficos; ver los análisis creados por otros integrantes del equipo. |
| **Estudiantes** | Ingresar con RUT y fecha de nacimiento; sesiones estilo "historias"; responder cuestionarios habilitados (E1, mapa de intereses RIASEC, E2, trampas de la mente, E3, autonomía); ver resultados y retroalimentación inmediata; revisar sus respuestas; chatear con su equipo y reaccionar a los avisos del muro, como en las redes sociales que ya usan. |
| **Apoderados** (madre, padre, tutor) | Manual y material para familias; encuestas F1 y F2 con sus resultados; consultas al colegio; ver la retroalimentación del estudiante si la administración lo autoriza. |

### Consistencia de los análisis con IA

Si dos docentes consultan por el mismo estudiante, los dos tienen que ver lo mismo:

1. **Los números no dependen de la IA.** Los 4 indicadores del manual docente (§9: claridad, conocimiento de opciones, autonomía, certeza y plan), el perfil RIASEC y los gráficos se calculan con reglas fijas.
2. **Cada análisis se genera una sola vez.** Se guarda en la hoja `Analisis` junto con una huella (hash) de los datos. Mientras los datos no cambien, **todo el equipo recibe el mismo texto**. Si llegan respuestas nuevas, la plataforma ofrece actualizarlo.
3. **Todos los análisis usan la misma pauta** (instrucciones fijas y versionadas, `VERSION_ANALISIS`). Los de un curso y otro solo cambian porque sus datos son distintos, y cada estudiante recibe un análisis propio.
4. Un bloqueo (`LockService`) impide que dos docentes generen versiones distintas al mismo tiempo.
5. **Sin clave de IA, la plataforma funciona igual**: usa un motor de reglas basado en el manual, que es determinista.

---

## 🗂️ Estructura

```
src/                  ← código que se sube a Apps Script
  appsscript.json     manifiesto (zona horaria, permisos, web app)
  Code.gs             entrada web, tabla de acciones y permisos, setup()
  Auth.gs             ingreso, claves cifradas, sesiones, bloqueo por intentos
  Db.gs               acceso a la planilla, RUT, fechas, auditoría, configuración
  Usuarios.gs         perfiles, carga masiva desde Excel, cursos, supresión
  Contenido.gs        sesiones, variantes por curso, materiales, cuestionarios, retroalimentación
  Mensajes.gs         chat privado y avisos masivos (muro)
  Analisis.gs         puntajes, indicadores, reportes, análisis IA con caché de consistencia
  Seed.gs             contenido inicial tomado de los manuales 2026
  Index.html / Styles.html / App.html   interfaz (una sola página)
  Ilustraciones.html  ilustraciones SVG de cada sesión, íconos, insignias y frases
assets/               insignia, ilustración y fotografía del colegio
plantillas/           plantilla de carga (CSV con datos ficticios)
dev/                  vista previa local con datos ficticios
PRIVACIDAD.md         medidas de cumplimiento de la Ley 21.719
```

---

## 🚀 Instalación paso a paso

Use una **cuenta institucional** del colegio (Google Workspace), no una personal. La planilla y los archivos quedan en el Drive de esa cuenta.

### Opción A: sin herramientas (copiar y pegar)

1. Entre a <https://script.google.com> y cree un **Proyecto nuevo**. Nómbrelo "Mi Proyecto de Vida".
2. En ⚙️ **Configuración del proyecto**, active *"Mostrar el archivo de manifiesto appsscript.json"*.
3. Cree estos archivos con el mismo nombre y pegue el contenido de `src/`:
   - Secuencia de comandos (`.gs`): `Code`, `Auth`, `Db`, `Usuarios`, `Contenido`, `Mensajes`, `Analisis`, `Seed`
   - HTML: `Index`, `Styles`, `Ilustraciones`, `App`
   - Reemplace `appsscript.json` por el del repositorio.
4. En ⚙️ **Propiedades del script**, agregue `ADMIN_RUT` con el RUT del administrador (ej. `12345678-5`).
5. Seleccione la función **`setup`** y presione **Ejecutar**. Autorice los permisos. En el **registro de ejecución** aparecerá la **clave temporal** del administrador.
   - `setup()` crea la planilla privada, la carpeta de Drive, la clave secreta (`PEPPER`) y el contenido inicial (8 sesiones y 8 cuestionarios).
6. **Implementar → Nueva implementación → Aplicación web**
   - *Ejecutar como:* **Yo** (la cuenta del colegio)
   - *Quién tiene acceso:* **Cualquier usuario** (los estudiantes y las familias no tienen cuenta Google: los protege el ingreso de la propia plataforma).
7. Abra la URL de la aplicación, elija el perfil **Equipo**, ingrese con `ADMIN_RUT` y la clave temporal, y cámbiela.

### Opción B: con `clasp` (para quien mantiene el código desde GitHub)

```bash
npm install -g @google/clasp
```
```bash
clasp login
```
```bash
clasp create --type webapp --title "Mi Proyecto de Vida" --rootDir src
```
```bash
clasp push
```

Copie `.clasp.json.example` a `.clasp.json` si el proyecto ya existe. `.clasp.json` está en `.gitignore`. Después siga los pasos 4 a 7 de la opción A.

### Primeros pasos en la plataforma

1. **Carga masiva** → descargue la plantilla y suba el Excel del curso con las columnas
   `Rut · DV · NombreAlumno · Sexo · FechaNac · Curso · Local · FecMatriculado · Direccion · Comuna · Nombre Padre · Nombre Madre · Nombre Tutor`
   - Se crean cuentas **independientes** para estudiante, madre y padre. La clave inicial de las tres es la fecha de nacimiento del estudiante (`DDMMAAAA`). Si el estudiante cambia su clave, la familia sigue entrando con la suya.
   - Si el **tutor** no es el padre ni la madre, se crea un acceso adicional de *tutor*.
   - Volver a cargar el mismo estudiante actualiza sus datos sin cambiar claves.
2. **Usuarios** → cree a docentes y asistentes, asígneles cursos y entregue la clave temporal en privado.
3. **Configuración** → suba la insignia, la ilustración y la foto del colegio (están en `assets/`), defina el correo de contacto de privacidad y si las familias ven la retroalimentación.
4. **Cuestionarios** → habilite E1 cuando empiece la sesión 1, el mapa de intereses en la sesión 2, y así sucesivamente.

### Inteligencia artificial (opcional)

En **Propiedades del script**:

| Propiedad | Valor |
|---|---|
| `AI_PROVIDER` | `anthropic` (predeterminado) o `gemini` |
| `ANTHROPIC_API_KEY` | clave de la API de Claude (si usa `anthropic`) |
| `GEMINI_API_KEY` | clave de Google AI Studio (si usa `gemini`) |
| `AI_MODEL` | opcional. Predeterminado: `claude-opus-5-5` / `gemini-2.5-flash` |

A la IA solo se envían **datos seudonimizados**: códigos en vez de nombres, y RUT, correos, teléfonos y el nombre del estudiante se eliminan de las respuestas abiertas. Antes de activarla, el colegio debe aceptar las condiciones de tratamiento de datos del proveedor (ver `PRIVACIDAD.md`).

---

## 🔐 Seguridad

- Las claves se guardan cifradas con HMAC-SHA256 iterado, sal por usuario y una «pimienta» secreta fuera del código.
- Tras 5 intentos fallidos, el ingreso se bloquea 15 minutos.
- El token de sesión es aleatorio y expira a las 6 horas de inactividad. Se valida en **cada** llamada.
- Los permisos (rol y curso) se revisan **en el servidor**, no solo en la interfaz.
- Cada docente ve solo sus cursos, cada estudiante solo lo suyo y cada familia solo lo de su estudiante.
- Los archivos quedan **privados en Drive** y se entregan solo a quien tiene permiso.
- Las respuestas correctas de los cuestionarios no llegan al navegador del estudiante.
- La hoja `Auditoria` registra ingresos, consultas de reportes, cambios y descargas.
- Hay una política de conservación configurable (`tareaRetencion` puede programarse cada mes como activador).
- El personal debe cambiar su clave temporal en el primer ingreso. A estudiantes y familias se les recomienda cambiar la fecha de nacimiento por una clave personal.

## 🧪 Vista previa local (sin desplegar)

```bash
powershell -ExecutionPolicy Bypass -File dev/build-preview.ps1
```
```bash
powershell -ExecutionPolicy Bypass -File dev/servidor.ps1
```

Abra <http://localhost:8765/dev/preview.html>. La vista previa usa **solo datos ficticios** (`dev/mock.js`). En "Equipo" verá el perfil de administración, y en "Estudiante" o "Madre" los demás.

## 📏 Límites de Apps Script

- Cada llamada puede durar hasta 6 minutos. La carga masiva se envía en lotes de 60 estudiantes.
- La plataforma está pensada para un colegio (cientos de estudiantes). Para miles, conviene migrar la base de datos.
- Material subido: hasta 15 MB por archivo. Para videos, use un enlace.

## 📄 Licencia y créditos

Contenido pedagógico: manuales *Proyecto de vida 2026* (estudiantes, docentes y asistentes, familias), elaborados por la Coordinación de Segundo Ciclo del Colegio Marina de Chile. Los casos de los manuales son ilustrativos y no corresponden a personas reales.
