# Protección de datos personales: Ley 21.719

Este documento resume cómo la plataforma **Mi Proyecto de Vida** aplica la Ley 21.719, que regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales. La ley entra en plena vigencia en diciembre de 2026. Este resumen **no reemplaza la asesoría jurídica**: el colegio debe validarlo con su sostenedor o asesor legal.

## Principios y cómo se aplican

| Principio | Medida en la plataforma |
|---|---|
| **Licitud y finalidad** | Los datos se usan solo para orientación y proyecto de vida. El aviso de privacidad se muestra y debe aceptarse en el primer ingreso, y la aceptación queda registrada. |
| **Proporcionalidad (minimización)** | Solo se piden los datos necesarios. La dirección y la comuna del Excel solo las ve la administración. A la IA se envían indicadores y textos seudonimizados. |
| **Calidad** | La administración puede corregir datos con una nueva carga o desde Usuarios (derecho de rectificación). |
| **Responsabilidad** | La hoja `Auditoria` registra quién accede y qué hace. |
| **Seguridad** | Claves cifradas, bloqueo por intentos, sesiones que expiran, permisos por rol y curso revisados en el servidor, archivos privados. |
| **Transparencia** | Aviso de privacidad visible en el ingreso y en "Mi cuenta". |
| **Confidencialidad** | Cada docente ve solo sus cursos y cada familia solo lo de su estudiante. Las respuestas son de uso interno del equipo, como establece el manual docente. |

## Niños, niñas y adolescentes

Los estudiantes de 8° básico son menores de edad. La ley exige resguardar su **interés superior**. Medidas:

- La retroalimentación a las familias es **opcional** y la decide la administración, en forma global o por cada retroalimentación.
- Los análisis **orientan y no clasifican**. No se publican rankings ni comparaciones entre estudiantes.
- **Consentimiento:** antes de usar la plataforma, el colegio debe informar a los padres o al representante legal y, cuando corresponda según la edad, obtener su autorización. Esto se puede hacer en la matrícula o con una circular firmada.

## Derechos de los titulares

| Derecho | Cómo se ejerce |
|---|---|
| Acceso y portabilidad | "Mi cuenta" → **Descargar mis datos** (JSON). |
| Rectificación | Solicitud a la administración, que corrige en la planilla o con una nueva carga. |
| Supresión | La administración elimina al estudiante con todas sus cuentas, respuestas, mensajes y análisis (`eliminarEstudiante_`). |
| Oposición y bloqueo | La administración puede desactivar una cuenta sin borrarla. |

El correo de contacto para estas solicitudes se configura en **Configuración** y aparece en el aviso de privacidad.

## Terceros (encargados del tratamiento)

- **Google (Workspace / Apps Script / Drive / Sheets)** almacena y procesa los datos. Use la cuenta institucional del colegio, con las condiciones de Google Workspace for Education.
- **Proveedor de IA (opcional: Anthropic o Google Gemini).** Solo recibe datos seudonimizados. Antes de activarlo, revise y acepte sus condiciones de tratamiento de datos (DPA), considere que es una transferencia internacional y regístrelo en el inventario de tratamientos del colegio. La IA puede quedar desactivada: la plataforma funciona con el motor de reglas.

## Conservación

Los mensajes y la auditoría se conservan por el plazo configurado (24 meses por defecto). Para aplicarlo de forma automática, cree en Apps Script un **activador mensual** de la función `tareaRetencion`. Las respuestas y los análisis se eliminan al suprimir al estudiante o al cerrar el proceso.

## Lista de verificación para el colegio

- [ ] Designar a la persona responsable del tratamiento y el correo de contacto.
- [ ] Informar a las familias y obtener las autorizaciones que correspondan.
- [ ] Usar una cuenta institucional, con verificación en dos pasos, como propietaria del script.
- [ ] No compartir la planilla ni la carpeta "Proyecto de Vida - Datos (privado)" con nadie.
- [ ] Revisar periódicamente la hoja `Auditoria`.
- [ ] Desactivar las cuentas del personal que deja el colegio.
- [ ] Si se usa IA, aceptar el DPA del proveedor y registrar la transferencia.
- [ ] Ante una brecha de seguridad, seguir el protocolo de notificación de la ley.

## Qué NO se sube a GitHub

`.gitignore` excluye `.clasp.json`, los archivos Excel y CSV (salvo la plantilla ficticia) y las exportaciones. Las claves y el ID de la planilla viven en *Propiedades del script*. **Nunca suba exportaciones de la planilla, capturas con datos reales ni registros de ejecución.**
