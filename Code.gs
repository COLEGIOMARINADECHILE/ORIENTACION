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
  var github = config_('urlGithub');
  if (github) return paginaRedireccion_(github);
  var t = HtmlService.createTemplateFromFile('Index');
  return t.evaluate()
    .setTitle('Mi Proyecto de Vida · ' + config_('nombreColegio'))
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/**
 * doPost — API para la interfaz publicada en GitHub Pages.
 * La página de GitHub envía {fn, args} y aquí se ejecuta la misma lógica que
 * google.script.run: los datos SIEMPRE se guardan en Apps Script y cada acción
 * exige un token de sesión válido (salvo login e información pública).
 */
function doPost(e) {
  var out;
  try {
    var req = JSON.parse(e.postData.contents);
    var permitidas = { api: api, login: login, logout: logout, infoPublica: infoPublica };
    if (!permitidas.hasOwnProperty(req.fn)) throw new Error('Función no permitida.');
    out = { r: permitidas[req.fn].apply(null, req.args || []) };
  } catch (err) {
    out = { error: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/** Si la plataforma se usa desde GitHub Pages, el enlace de Apps Script lleva allá. */
function paginaRedireccion_(url) {
  var u = String(url).replace(/"/g, '');
  return HtmlService.createHtmlOutput(
    '<div style="font-family:sans-serif;max-width:520px;margin:60px auto;padding:28px;border-radius:18px;background:#0b2a66;color:#fff;text-align:center">' +
    '<h2>Mi Proyecto de Vida</h2><p>La plataforma está en esta dirección:</p>' +
    '<p><a href="' + u + '" target="_top" style="display:inline-block;padding:14px 22px;border-radius:12px;background:#e3b505;color:#1d1600;font-weight:800;text-decoration:none">Ir a la plataforma</a></p>' +
    '<p style="opacity:.8;font-size:13px;word-break:break-all">' + u + '</p></div>' +
    '<script>try{window.top.location.href="' + u + '";}catch(e){}</script>')
    .setTitle('Mi Proyecto de Vida');
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

var P = ['admin', 'docente', 'asistente', 'personalizado'];
var FAM = ['estudiante', 'apoderado'];
var TODOS = P.concat(FAM);

/**
 * Tabla de acciones: función, roles que pueden llamarla y permiso requerido.
 *   p  = permiso exigido a funcionarios   ·   pa = permiso exigido a alumnos/adultos
 * Los permisos se configuran en "Perfiles y permisos" (Permisos.gs).
 * Se construye al llamarla porque Apps Script carga los .gs en orden.
 */
function acciones_() { return {
  perfil:              { fn: function (s) { return perfilPublico_(s); }, roles: TODOS },
  cambiarClave:        { fn: cambiarClave_, roles: TODOS },
  aceptarPrivacidad:   { fn: aceptarPrivacidad_, roles: TODOS },
  misDatos:            { fn: misDatos_, roles: TODOS },
  inicio:              { fn: inicio_, roles: TODOS },

  // Contenido
  sesiones:            { fn: listarSesiones_, roles: TODOS, pa: 'sesiones' },
  sesion:              { fn: obtenerSesion_, roles: TODOS, pa: 'sesiones' },
  guardarSesion:       { fn: guardarSesion_, roles: P, p: 'sesiones.editar' },
  eliminarSesion:      { fn: eliminarSesion_, roles: P, p: 'sesiones.eliminar' },
  subirImagenContenido:{ fn: subirImagenContenido_, roles: P, p: 'sesiones.editar' },
  imagenes:            { fn: imagenesContenido_, roles: TODOS },
  actualizarContenido: { fn: actualizarContenido_, roles: P, p: 'config' },
  materiales:          { fn: listarMateriales_, roles: TODOS, pa: 'sesiones' },
  guardarMaterial:     { fn: guardarMaterial_, roles: P, p: 'materiales' },
  eliminarMaterial:    { fn: eliminarMaterial_, roles: P, p: 'materiales' },
  archivoMaterial:     { fn: archivoMaterial_, roles: TODOS, pa: 'sesiones' },

  // Ejercicios desarrollados en la guía
  guardarTrabajo:      { fn: guardarTrabajo_, roles: FAM, pa: 'ejercicios' },
  imagenTrabajo:       { fn: imagenTrabajo_, roles: TODOS },

  // Cuestionarios
  cuestionarios:       { fn: listarCuestionarios_, roles: TODOS, pa: 'cuestionarios' },
  cuestionario:        { fn: obtenerCuestionario_, roles: TODOS, pa: 'cuestionarios' },
  responder:           { fn: responder_, roles: FAM, pa: 'cuestionarios' },
  misResultados:       { fn: misResultados_, roles: FAM, pa: 'resultados' },
  guardarCuestionario: { fn: guardarCuestionario_, roles: P, p: 'cuestionarios.editar' },
  habilitarCuestionario: { fn: habilitarCuestionario_, roles: P, p: 'cuestionarios.habilitar' },
  matrizCuestionario:  { fn: matrizCuestionario_, roles: P, p: 'resultados.cargar' },
  importarResultados:  { fn: importarResultados_, roles: P, p: 'resultados.cargar' },

  // Mensajería
  hilos:               { fn: listarHilos_, roles: TODOS },
  hilo:                { fn: obtenerHilo_, roles: TODOS, p: 'mensajes', pa: 'mensajes' },
  enviar:              { fn: enviarMensaje_, roles: TODOS, p: 'mensajes', pa: 'mensajes' },
  avisos:              { fn: listarAvisos_, roles: TODOS },
  publicarAviso:       { fn: publicarAviso_, roles: P, p: 'mensajes' },
  like:                { fn: darLike_, roles: TODOS, pa: 'muro' },

  // Retroalimentación
  retro:               { fn: listarRetro_, roles: TODOS, pa: 'retro' },
  guardarRetro:        { fn: guardarRetro_, roles: P, p: 'retro' },
  visibilidadRetro:    { fn: visibilidadRetro_, roles: P, p: 'retro.visibilidad' },

  // Cursos, reportes y análisis
  cursos:              { fn: listarCursos_, roles: P },
  guardarCurso:        { fn: guardarCurso_, roles: P, p: 'cursos.gestionar' },
  eliminarCurso:       { fn: eliminarCurso_, roles: P, p: 'cursos.gestionar' },
  estudiantesCurso:    { fn: estudiantesCurso_, roles: P, p: 'cursos.ver' },
  reporteEstudiante:   { fn: reporteEstudiante_, roles: P, p: 'cursos.ver' },
  reporteCurso:        { fn: reporteCurso_, roles: P, p: 'reportes' },
  reporteSesion:       { fn: reporteSesion_, roles: P, p: 'reportes' },
  analisis:            { fn: obtenerAnalisis_, roles: P, p: 'analisis' },
  historialAnalisis:   { fn: historialAnalisis_, roles: P, p: 'analisis' },

  // Administración
  usuarios:            { fn: listarUsuarios_, roles: P, p: 'usuarios' },
  guardarUsuario:      { fn: guardarUsuario_, roles: P, p: 'usuarios' },
  eliminarUsuario:     { fn: eliminarUsuario_, roles: P, p: 'usuarios' },
  restablecerClave:    { fn: restablecerClave_, roles: P, p: 'usuarios' },
  eliminarEstudiante:  { fn: eliminarEstudiante_, roles: P, p: 'usuarios' },
  perfiles:            { fn: listarPerfiles_, roles: P, p: 'usuarios' },
  guardarPerfil:       { fn: guardarPerfil_, roles: P, p: 'usuarios' },
  eliminarPerfil:      { fn: eliminarPerfil_, roles: P, p: 'usuarios' },
  importar:            { fn: importarEstudiantes_, roles: P, p: 'carga' },
  config:              { fn: leerConfig_, roles: P, p: 'config' },
  guardarConfig:       { fn: guardarConfig_, roles: P, p: 'config' },
  subirImagen:         { fn: subirImagen_, roles: P, p: 'config' },
  refrescar:           { fn: refrescarDatos_, roles: P, p: 'config' },
  depurar:             { fn: depurarDatos_, roles: P, p: 'config' },
  auditoria:           { fn: leerAuditoria_, roles: P, p: 'auditoria' }
}; }

/** Único punto de entrada para google.script.run (y para doPost desde GitHub). */
function api(req) {
  try {
    req = req || {};
    var tabla = acciones_();
    var def = tabla.hasOwnProperty(req.accion) ? tabla[req.accion] : null;
    if (!def) throw new Error('Acción desconocida.');
    var ses = sesion_(req.token);
    exigir_(ses, def.roles);
    var permiso = esPersonal_(ses) ? def.p : def.pa;
    if (permiso && !tienePermiso_(ses, permiso)) throw new Error('Su perfil no tiene permiso para esta función.');
    var res = def.fn(ses, req.datos || {});
    return JSON.stringify({ ok: true, data: res });
  } catch (e) {
    var msg = String(e && e.message || e);
    return JSON.stringify({ ok: false, error: msg, expirada: msg === 'SESION_EXPIRADA' });
  }
}

/** Información pública para la pantalla de ingreso (sin datos personales). */
function infoPublica() {
  var cache = CacheService.getScriptCache();
  var enCache = cache.get('INFO_PUBLICA');
  if (enCache) return enCache;
  var info = infoPublicaDatos_();
  if (info.length < 95000) cache.put('INFO_PUBLICA', info, DURACION_CACHE);
  return info;
}

function infoPublicaDatos_() {
  return JSON.stringify({
    colegio: config_('nombreColegio'),
    ciudad: config_('ciudad'),
    unidad: config_('unidad'),
    anio: config_('anio'),
    contactoPrivacidad: config_('contactoPrivacidad'),
    urlPlataforma: config_('urlPlataforma'),
    urlGithub: config_('urlGithub'),
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
  CacheService.getScriptCache().remove('INFO_PUBLICA');
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
  CacheService.getScriptCache().remove('INFO_PUBLICA');
  auditar_(ses, 'config', Object.keys(d).join(','));
  return leerConfig_();
}

function leerAuditoria_(ses, d) {
  var t = todos_('Auditoria');
  return t.slice(Math.max(0, t.length - (d.n || 300))).reverse()
    .map(function (a) { return { fecha: a.fecha, usuario: a.usuarioId, rol: a.rol, accion: a.accion, detalle: a.detalle }; });
}

/**
 * Pantalla de inicio por rol: todo lo que necesita la portada en UNA sola llamada
 * (sesiones, cuestionarios, cursos, avisos y mensajes sin leer) para que cargue rápido.
 */
function inicio_(ses) {
  var out = { perfil: perfilPublico_(ses) };
  var fam = !esPersonal_(ses);
  out.listaSesiones = (!fam || tienePermiso_(ses, 'sesiones')) ? listarSesiones_(ses) : [];
  out.sesiones = out.listaSesiones.length;
  if (fam) {
    var cs = tienePermiso_(ses, 'cuestionarios') ? listarCuestionarios_(ses) : [];
    out.listaCuestionarios = cs;
    out.pendientes = cs.filter(function (c) { return !c.respondido; }).length;
    out.respondidos = cs.filter(function (c) { return c.respondido; }).length;
    out.totalCuestionarios = cs.length;
  } else {
    var cursos = listarCursos_(ses);
    out.cursos = cursos;
    out.estudiantes = cursos.reduce(function (a, c) { return a + c.estudiantes; }, 0);
  }
  out.noLeidos = listarHilos_(ses).reduce(function (a, h) { return a + (h.noLeidos || 0); }, 0);
  out.avisos = (!fam || tienePermiso_(ses, 'muro')) ? listarAvisos_(ses).slice(0, 3) : [];
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
