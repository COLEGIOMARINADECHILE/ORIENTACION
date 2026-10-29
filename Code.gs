/**
 * Code.gs — Punto de entrada de la aplicación web "Mi Proyecto de Vida".
 * Colegio Marina de Chile · Concepción.
 *
 * Toda la comunicación del navegador pasa por api(req), que valida el token
 * de sesión y el rol antes de ejecutar cualquier acción.
 */

var ARCHIVOS_HTML = ['Index', 'Styles', 'Ilustraciones', 'App'];

function doGet() {
  var faltan = archivosFaltantes_();
  if (faltan.length) return paginaInstalacion_(faltan);
  var t = HtmlService.createTemplateFromFile('Index');
  return t.evaluate()
    .setTitle('Mi Proyecto de Vida · ' + config_('nombreColegio'))
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/** Revisa que existan los archivos HTML con el nombre exacto que usa la plataforma. */
function archivosFaltantes_() {
  return ARCHIVOS_HTML.filter(function (n) {
    try { HtmlService.createHtmlOutputFromFile(n); return false; } catch (e) { return true; }
  });
}

function paginaInstalacion_(faltan) {
  var lista = faltan.map(function (n) { return '<li><b>' + n + '</b></li>'; }).join('');
  return HtmlService.createHtmlOutput(
    '<div style="font-family:sans-serif;max-width:560px;margin:40px auto;padding:24px;border-radius:16px;background:#fff8e6;color:#3b2c00">' +
    '<h2>Falta terminar la instalación</h2><p>Apps Script no encuentra estos archivos HTML:</p><ul>' + lista + '</ul>' +
    '<p>En el editor, cree cada uno con el botón <b>+ &gt; HTML</b> y escriba el nombre <b>exactamente</b> así ' +
    '(sin número, sin ".txt" y sin ".html"). Pegue su contenido, guarde y vuelva a cargar esta página.</p>' +
    '<p>También puede ejecutar la función <b>verificarInstalacion</b> en el editor para ver el detalle.</p></div>')
    .setTitle('Instalación incompleta');
}

/** Ejecútela desde el editor para revisar archivos y propiedades. */
function verificarInstalacion() {
  var faltan = archivosFaltantes_();
  var props = PropertiesService.getScriptProperties();
  Logger.log(faltan.length ? 'FALTAN archivos HTML: ' + faltan.join(', ') + ' (revise el nombre exacto).' : 'Archivos HTML: OK');
  ['SPREADSHEET_ID', 'PEPPER', 'ADMIN_RUT'].forEach(function (k) {
    Logger.log(k + ': ' + (props.getProperty(k) ? 'OK' : 'FALTA'));
  });
}

function include(nombre) {
  return HtmlService.createHtmlOutputFromFile(nombre).getContent();
}

var P = ['admin', 'docente', 'asistente'];
var TODOS = ['admin', 'docente', 'asistente', 'estudiante', 'apoderado'];

/**
 * Tabla de acciones: función + roles autorizados.
 * Se construye al llamarla (no al cargar el archivo) porque Apps Script carga
 * los .gs en orden y las funciones de otros archivos podrían no existir aún.
 */
function acciones_() { return {
  perfil:              { fn: function (s) { return perfilPublico_(s); }, roles: TODOS },
  cambiarClave:        { fn: cambiarClave_, roles: TODOS },
  aceptarPrivacidad:   { fn: aceptarPrivacidad_, roles: TODOS },
  misDatos:            { fn: misDatos_, roles: TODOS },
  inicio:              { fn: inicio_, roles: TODOS },

  // Contenido
  sesiones:            { fn: listarSesiones_, roles: TODOS },
  sesion:              { fn: obtenerSesion_, roles: TODOS },
  guardarSesion:       { fn: guardarSesion_, roles: P },
  eliminarSesion:      { fn: eliminarSesion_, roles: ['admin'] },
  materiales:          { fn: listarMateriales_, roles: TODOS },
  guardarMaterial:     { fn: guardarMaterial_, roles: P },
  eliminarMaterial:    { fn: eliminarMaterial_, roles: P },
  archivoMaterial:     { fn: archivoMaterial_, roles: TODOS },

  // Cuestionarios
  cuestionarios:       { fn: listarCuestionarios_, roles: TODOS },
  cuestionario:        { fn: obtenerCuestionario_, roles: TODOS },
  responder:           { fn: responder_, roles: ['estudiante', 'apoderado'] },
  misResultados:       { fn: misResultados_, roles: ['estudiante', 'apoderado'] },
  guardarCuestionario: { fn: guardarCuestionario_, roles: ['admin'] },
  habilitarCuestionario: { fn: habilitarCuestionario_, roles: P },

  // Mensajería
  hilos:               { fn: listarHilos_, roles: TODOS },
  hilo:                { fn: obtenerHilo_, roles: TODOS },
  enviar:              { fn: enviarMensaje_, roles: TODOS },
  avisos:              { fn: listarAvisos_, roles: TODOS },
  publicarAviso:       { fn: publicarAviso_, roles: P },
  like:                { fn: darLike_, roles: TODOS },

  // Retroalimentación
  retro:               { fn: listarRetro_, roles: TODOS },
  guardarRetro:        { fn: guardarRetro_, roles: P },
  visibilidadRetro:    { fn: visibilidadRetro_, roles: ['admin'] },

  // Reportes y análisis
  cursos:              { fn: listarCursos_, roles: P },
  estudiantesCurso:    { fn: estudiantesCurso_, roles: P },
  reporteEstudiante:   { fn: reporteEstudiante_, roles: P },
  reporteCurso:        { fn: reporteCurso_, roles: P },
  reporteSesion:       { fn: reporteSesion_, roles: P },
  analisis:            { fn: obtenerAnalisis_, roles: P },
  historialAnalisis:   { fn: historialAnalisis_, roles: P },

  // Administración
  usuarios:            { fn: listarUsuarios_, roles: ['admin'] },
  guardarUsuario:      { fn: guardarUsuario_, roles: ['admin'] },
  eliminarUsuario:     { fn: eliminarUsuario_, roles: ['admin'] },
  restablecerClave:    { fn: restablecerClave_, roles: ['admin'] },
  importar:            { fn: importarEstudiantes_, roles: ['admin'] },
  eliminarEstudiante:  { fn: eliminarEstudiante_, roles: ['admin'] },
  config:              { fn: leerConfig_, roles: ['admin'] },
  guardarConfig:       { fn: guardarConfig_, roles: ['admin'] },
  subirImagen:         { fn: subirImagen_, roles: ['admin'] },
  auditoria:           { fn: leerAuditoria_, roles: ['admin'] },
  depurar:             { fn: depurarDatos_, roles: ['admin'] }
}; }

/** Único punto de entrada para google.script.run desde el navegador. */
function api(req) {
  try {
    req = req || {};
    var tabla = acciones_();
    var def = tabla.hasOwnProperty(req.accion) ? tabla[req.accion] : null;
    if (!def) throw new Error('Acción desconocida.');
    var ses = sesion_(req.token);
    exigir_(ses, def.roles);
    var res = def.fn(ses, req.datos || {});
    return JSON.stringify({ ok: true, data: res });
  } catch (e) {
    var msg = String(e && e.message || e);
    return JSON.stringify({ ok: false, error: msg, expirada: msg === 'SESION_EXPIRADA' });
  }
}

/** Información pública para la pantalla de ingreso (sin datos personales). */
function infoPublica() {
  return JSON.stringify({
    colegio: config_('nombreColegio'),
    ciudad: config_('ciudad'),
    unidad: config_('unidad'),
    anio: config_('anio'),
    contactoPrivacidad: config_('contactoPrivacidad'),
    retencionMeses: config_('retencionMeses'),
    imagenes: {
      logo: urlImagen_(config_('img_logo')),
      portada: urlImagen_(config_('img_portada')),
      colegio: urlImagen_(config_('img_colegio'))
    }
  });
}

/** Imágenes institucionales: una URL pública o "drive:ID" (se sirve como data URI). */
function urlImagen_(v) {
  if (!v) return '';
  if (v.indexOf('drive:') === 0) {
    var cache = CacheService.getScriptCache();
    var k = 'IMG_' + v.slice(6);
    var c = cache.get(k);
    if (c) return c;
    try {
      var b = DriveApp.getFileById(v.slice(6)).getBlob();
      var uri = 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
      if (uri.length < 95000) cache.put(k, uri, 21600);
      return uri;
    } catch (e) { return ''; }
  }
  return v;
}

function subirImagen_(ses, d) {
  if (['img_logo', 'img_portada', 'img_colegio'].indexOf(d.clave) < 0) throw new Error('Imagen no válida.');
  if (!/^image\//.test(d.mime)) throw new Error('El archivo debe ser una imagen.');
  var blob = Utilities.newBlob(Utilities.base64Decode(d.base64), d.mime, d.nombre);
  var f = carpeta_('Imagenes').createFile(blob);
  setConfig_(d.clave, 'drive:' + f.getId());
  auditar_(ses, 'subir_imagen', d.clave);
  return { ok: true, url: urlImagen_('drive:' + f.getId()) };
}

/** Carpeta privada en Drive (solo la ve la cuenta propietaria del script). */
function carpeta_(sub) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('FOLDER_ID');
  var raiz;
  if (id) { try { raiz = DriveApp.getFolderById(id); } catch (e) { raiz = null; } }
  if (!raiz) {
    raiz = DriveApp.createFolder('Proyecto de Vida - Datos (privado)');
    props.setProperty('FOLDER_ID', raiz.getId());
  }
  if (!sub) return raiz;
  var it = raiz.getFoldersByName(sub);
  return it.hasNext() ? it.next() : raiz.createFolder(sub);
}

function leerConfig_() {
  var out = {};
  Object.keys(CONFIG_DEFECTO).forEach(function (k) { out[k] = config_(k); });
  var props = PropertiesService.getScriptProperties();
  out.iaProveedor = props.getProperty('AI_PROVIDER') || 'anthropic';
  out.iaConfigurada = !!(props.getProperty('ANTHROPIC_API_KEY') || props.getProperty('GEMINI_API_KEY'));
  return out;
}

function guardarConfig_(ses, d) {
  Object.keys(d).forEach(function (k) {
    if (CONFIG_DEFECTO.hasOwnProperty(k) && k.indexOf('img_') !== 0) setConfig_(k, String(d[k]));
  });
  auditar_(ses, 'config', Object.keys(d).join(','));
  return leerConfig_();
}

function leerAuditoria_(ses, d) {
  var t = todos_('Auditoria');
  return t.slice(Math.max(0, t.length - (d.n || 300))).reverse()
    .map(function (a) { return { fecha: a.fecha, usuario: a.usuarioId, rol: a.rol, accion: a.accion, detalle: a.detalle }; });
}

/**
 * Pantalla de inicio por rol: resumen de lo pendiente.
 */
function inicio_(ses) {
  var out = { perfil: perfilPublico_(ses) };
  var ses_ = listarSesiones_(ses);
  out.sesiones = ses_.length;
  if (ses.rol === 'estudiante' || ses.rol === 'apoderado') {
    var cs = listarCuestionarios_(ses);
    out.pendientes = cs.filter(function (c) { return !c.respondido; }).length;
    out.respondidos = cs.filter(function (c) { return c.respondido; }).length;
    out.totalCuestionarios = cs.length;
  } else {
    var cursos = listarCursos_(ses);
    out.cursos = cursos;
    out.estudiantes = cursos.reduce(function (a, c) { return a + c.estudiantes; }, 0);
  }
  out.noLeidos = listarHilos_(ses).reduce(function (a, h) { return a + (h.noLeidos || 0); }, 0);
  out.avisos = listarAvisos_(ses).slice(0, 3);
  return out;
}

/**
 * setup() — Ejecútelo UNA vez desde el editor de Apps Script.
 * Crea la planilla privada, las hojas, la clave secreta y un administrador inicial.
 * Antes, defina en Propiedades del script:
 *   ADMIN_RUT     RUT del administrador (obligatorio)
 *   ADMIN_NOMBRE  nombre completo (opcional)
 *   ADMIN_CLAVE   clave elegida (opcional). Se borra de las propiedades al usarla;
 *                 sin ella se genera una clave temporal.
 * Puede volver a ejecutarse sin perder datos: sirve para agregar otro administrador
 * o fijar la clave de uno existente.
 */
function setup() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SPREADSHEET_ID')) {
    var ss = SpreadsheetApp.create('Proyecto de Vida - Base de datos (CONFIDENCIAL)');
    props.setProperty('SPREADSHEET_ID', ss.getId());
    DriveApp.getFileById(ss.getId()).moveTo(carpeta_());
  }
  if (!props.getProperty('PEPPER')) {
    props.setProperty('PEPPER', Utilities.getUuid() + Utilities.getUuid());
  }
  Object.keys(ESQUEMA).forEach(function (h) { hoja_(h); });
  var hoja1 = ss_().getSheetByName('Hoja 1') || ss_().getSheetByName('Sheet1');
  if (hoja1 && ss_().getSheets().length > 1) ss_().deleteSheet(hoja1);

  sembrarContenido_();

  var adminRut = normRut_(props.getProperty('ADMIN_RUT') || '');
  if (!adminRut) {
    Logger.log('Defina la propiedad ADMIN_RUT (ej. 12345678-5) y vuelva a ejecutar setup().');
    return;
  }
  var nombre = String(props.getProperty('ADMIN_NOMBRE') || '').trim();
  var elegida = props.getProperty('ADMIN_CLAVE') || '';
  if (elegida && (elegida.length < 8 || !/[A-Za-z]/.test(elegida) || !/\d/.test(elegida))) {
    Logger.log('ADMIN_CLAVE debe tener al menos 8 caracteres, con letras y números. No se aplicó.');
    elegida = '';
  }
  var existente = buscar_('Usuarios', 'id', 'PER:' + adminRut);
  if (!existente) {
    var clave = elegida || 'Orienta' + Math.floor(1000 + Math.random() * 9000) + 'x';
    var salt = nuevaSal_();
    insertar_('Usuarios', {
      id: 'PER:' + adminRut, rut: adminRut, tipo: 'personal', nombre: nombre || 'Administrador/a', rol: 'admin',
      cursos: '', salt: salt, hash: hashClave_(clave, salt), activo: 'true', debeCambiar: elegida ? 'false' : 'true',
      creado: ahora_()
    });
    Logger.log('Administrador creado: ' + (nombre || adminRut) + ' · RUT ' + adminRut +
      (elegida ? ' · con la clave indicada en ADMIN_CLAVE.' : ' · Clave temporal: ' + clave + ' (cámbiela en el primer ingreso).'));
  } else {
    existente.rol = 'admin';
    existente.activo = 'true';
    if (nombre) existente.nombre = nombre;
    if (elegida) { existente.salt = nuevaSal_(); existente.hash = hashClave_(elegida, existente.salt); existente.debeCambiar = 'false'; }
    actualizar_('Usuarios', existente);
    Logger.log('Administrador actualizado: ' + existente.nombre + ' · RUT ' + adminRut +
      (elegida ? ' · clave actualizada.' : ' · la clave no cambió.'));
  }
  // La clave nunca queda guardada en texto: se elimina de las propiedades.
  if (props.getProperty('ADMIN_CLAVE')) props.deleteProperty('ADMIN_CLAVE');
  Logger.log('Planilla de datos (no la comparta): ' + ss_().getUrl());
}

/** Disparador opcional (mensual): aplica la política de retención de Auditoría. */
function tareaRetencion() {
  depurarDatos_({ uid: 'sistema', rol: 'admin' }, { soloAuditoria: true });
}
