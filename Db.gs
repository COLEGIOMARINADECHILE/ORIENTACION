/**
 * Db.gs — Capa de acceso a datos sobre Google Sheets.
 * Cada hoja funciona como una tabla con encabezados en la fila 1.
 * Ningún dato personal vive en el código: la planilla se identifica
 * por la propiedad de script SPREADSHEET_ID (ver README).
 */

// Las columnas nuevas siempre se agregan AL FINAL para no desordenar datos existentes.
var ESQUEMA = {
  Usuarios: ['id', 'rut', 'tipo', 'nombre', 'rol', 'cursos', 'estudianteRut', 'parentesco', 'email',
    'salt', 'hash', 'activo', 'debeCambiar', 'consentimiento', 'creado', 'ultimoAcceso', 'perfilId'],
  Cursos: ['curso', 'nivel', 'descripcion', 'profesorJefe', 'activo', 'creado'],
  Perfiles: ['id', 'nombre', 'base', 'permisos', 'sistema', 'actualizado'],
  Trabajos: ['id', 'sesionId', 'bloqueId', 'usuarioId', 'estudianteRut', 'curso', 'texto', 'campos', 'imagen', 'fecha'],
  Estudiantes: ['rut', 'dv', 'nombre', 'sexo', 'fechaNac', 'curso', 'local', 'fecMatricula',
    'direccion', 'comuna', 'nombrePadre', 'nombreMadre', 'nombreTutor', 'actualizado'],
  Sesiones: ['id', 'baseId', 'numero', 'titulo', 'objetivo', 'audiencia', 'cursos', 'estado',
    'bloques', 'emergentes', 'imagen', 'autorId', 'autorNombre', 'actualizado'],
  Materiales: ['id', 'sesionId', 'titulo', 'descripcion', 'tipo', 'url', 'driveId', 'mime',
    'audiencia', 'cursos', 'autorId', 'autorNombre', 'fecha'],
  Cuestionarios: ['id', 'codigo', 'titulo', 'descripcion', 'audiencia', 'sesionId', 'preguntas',
    'habilitado', 'cursos', 'actualizado'],
  Respuestas: ['id', 'cuestionarioId', 'codigo', 'usuarioId', 'estudianteRut', 'curso', 'respuestas',
    'puntajes', 'fecha', 'origen'],
  Mensajes: ['id', 'hilo', 'deId', 'deNombre', 'deRol', 'paraTipo', 'curso', 'estudianteRut',
    'texto', 'fecha', 'leidoPor', 'likes'],
  Retroalimentacion: ['id', 'estudianteRut', 'autorId', 'autorNombre', 'texto', 'visibleApoderado', 'fecha'],
  Analisis: ['id', 'clave', 'hashDatos', 'version', 'vigente', 'contenido', 'motor', 'generadoPor',
    'generadoPorNombre', 'fecha'],
  Auditoria: ['fecha', 'usuarioId', 'rol', 'accion', 'detalle'],
  Config: ['clave', 'valor']
};

var _ssCache = null;
function ss_() {
  if (_ssCache) return _ssCache;
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Falta la propiedad SPREADSHEET_ID. Ejecute setup() en el editor.');
  _ssCache = SpreadsheetApp.openById(id);
  return _ssCache;
}

var _hojas = {};
function hoja_(nombre) {
  if (_hojas[nombre]) return _hojas[nombre];
  var cols = ESQUEMA[nombre].length;
  var sh = ss_().getSheetByName(nombre);
  if (!sh) {
    sh = ss_().insertSheet(nombre);
    // Todo como texto plano: evita que Sheets convierta RUT o fechas por su cuenta.
    sh.getRange(1, 1, sh.getMaxRows(), cols).setNumberFormat('@');
    sh.getRange(1, 1, 1, cols).setValues([ESQUEMA[nombre]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < cols) {
    // Actualización de versión: agrega los encabezados de las columnas nuevas.
    sh.getRange(1, 1, sh.getMaxRows(), cols).setNumberFormat('@');
    sh.getRange(1, 1, 1, cols).setValues([ESQUEMA[nombre]]).setFontWeight('bold');
  }
  _hojas[nombre] = sh;
  return sh;
}

/* ---------- Caché entre ejecuciones (velocidad) ----------
 * Cada hoja se guarda en CacheService con un número de versión. Toda escritura
 * cambia la versión, así nadie lee datos viejos. Si edita la planilla a mano,
 * use Configuración > "Refrescar datos". */
var DURACION_CACHE = 1800; // 30 minutos
var TROZO = 40000;         // caracteres por trozo (límite de 100 KB por valor)
var SIN_CACHE = { Auditoria: true };

function versionHoja_(nombre) {
  var c = CacheService.getScriptCache();
  var v = c.get('V_' + nombre);
  if (!v) { v = String(Date.now()); c.put('V_' + nombre, v, DURACION_CACHE); }
  return v;
}

function invalidarCache_(nombre) {
  try { CacheService.getScriptCache().put('V_' + nombre, String(Date.now()) + Math.floor(Math.random() * 1000), DURACION_CACHE); } catch (e) {}
}

function refrescarDatos_(ses) {
  Object.keys(ESQUEMA).forEach(invalidarCache_);
  CacheService.getScriptCache().remove('INFO_PUBLICA');
  auditar_(ses, 'refrescar_datos', '');
  return { ok: true };
}

function leerCache_(nombre, v) {
  try {
    var c = CacheService.getScriptCache();
    var n = Number(c.get('T_' + nombre + '_' + v + '_n') || 0);
    if (!n) return null;
    var claves = [];
    for (var i = 0; i < n; i++) claves.push('T_' + nombre + '_' + v + '_' + i);
    var partes = c.getAll(claves), s = '';
    for (var j = 0; j < n; j++) { if (partes[claves[j]] === undefined) return null; s += partes[claves[j]]; }
    return JSON.parse(s);
  } catch (e) { return null; }
}

function guardarCache_(nombre, v, filas) {
  try {
    var s = JSON.stringify(filas);
    if (s.length > TROZO * 60) return; // hojas muy grandes: se leen directo
    var c = CacheService.getScriptCache(), mapa = {}, n = 0;
    for (var i = 0; i < s.length; i += TROZO) { mapa['T_' + nombre + '_' + v + '_' + n] = s.slice(i, i + TROZO); n++; }
    mapa['T_' + nombre + '_' + v + '_n'] = String(n || 1);
    if (!n) mapa['T_' + nombre + '_' + v + '_0'] = '[]';
    c.putAll(mapa, DURACION_CACHE);
  } catch (e) { /* si la caché falla, se sigue leyendo la planilla */ }
}

/** Lee todas las filas de una hoja como objetos. Memoriza por ejecución y en caché. */
var _memo = {};
function todos_(nombre) {
  if (_memo[nombre]) return _memo[nombre];
  var ver = SIN_CACHE[nombre] ? '' : versionHoja_(nombre);
  if (ver) {
    var enCache = leerCache_(nombre, ver);
    if (enCache) { _memo[nombre] = enCache; return enCache; }
  }
  var sh = hoja_(nombre);
  var cols = ESQUEMA[nombre];
  var n = sh.getLastRow() - 1;
  var filas = [];
  if (n > 0) {
    var vals = sh.getRange(2, 1, n, cols.length).getValues();
    for (var i = 0; i < vals.length; i++) {
      var o = { _fila: i + 2 };
      for (var c = 0; c < cols.length; c++) {
        var v = vals[i][c];
        o[cols[c]] = (v instanceof Date) ? Utilities.formatDate(v, zona_(), 'yyyy-MM-dd HH:mm') : v;
      }
      filas.push(o);
    }
  }
  _memo[nombre] = filas;
  if (ver) guardarCache_(nombre, ver, filas);
  return filas;
}

/** Se llama después de cada escritura: descarta la memoria y la caché de esa hoja. */
function limpiarMemo_(nombre) {
  if (nombre) { delete _memo[nombre]; if (!SIN_CACHE[nombre]) invalidarCache_(nombre); }
  else { _memo = {}; Object.keys(ESQUEMA).forEach(invalidarCache_); }
}

function filaDesdeObj_(nombre, o) {
  return ESQUEMA[nombre].map(function (c) {
    var v = o[c];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
}

function insertar_(nombre, o) {
  hoja_(nombre).appendRow(filaDesdeObj_(nombre, o));
  limpiarMemo_(nombre);
  return o;
}

function insertarVarios_(nombre, lista) {
  if (!lista.length) return;
  var sh = hoja_(nombre);
  var filas = lista.map(function (o) { return filaDesdeObj_(nombre, o); });
  sh.getRange(sh.getLastRow() + 1, 1, filas.length, ESQUEMA[nombre].length).setValues(filas);
  limpiarMemo_(nombre);
}

function actualizar_(nombre, o) {
  if (!o._fila) throw new Error('Registro sin fila');
  hoja_(nombre).getRange(o._fila, 1, 1, ESQUEMA[nombre].length).setValues([filaDesdeObj_(nombre, o)]);
  limpiarMemo_(nombre);
  return o;
}

function eliminar_(nombre, o) {
  hoja_(nombre).deleteRow(o._fila);
  limpiarMemo_(nombre);
}

function buscar_(nombre, campo, valor) {
  var t = todos_(nombre);
  for (var i = 0; i < t.length; i++) if (String(t[i][campo]) === String(valor)) return t[i];
  return null;
}

function filtrar_(nombre, fn) { return todos_(nombre).filter(fn); }

function nuevoId_(prefijo) {
  return (prefijo || '') + Utilities.getUuid().replace(/-/g, '').slice(0, 16);
}

function ahora_() { return Utilities.formatDate(new Date(), zona_(), 'yyyy-MM-dd HH:mm:ss'); }
function zona_() { return Session.getScriptTimeZone() || 'America/Santiago'; }

function json_(v, defecto) {
  if (v === '' || v === null || v === undefined) return defecto;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch (e) { return defecto; }
}

/* ---------- Configuración (hoja Config) ---------- */
var CONFIG_DEFECTO = {
  nombreColegio: 'Colegio Marina de Chile',
  ciudad: 'Concepción',
  unidad: 'Unidad Técnica Pedagógica · Coordinación de Segundo Ciclo',
  anio: '2026',
  apoderadoVeRetro: 'false',
  iaIncluirAbiertas: 'true',
  retencionMeses: '24',
  contactoPrivacidad: 'utp@colegio.cl',
  // Enlace público de la aplicación web (se cambia desde Configuración en la plataforma).
  urlPlataforma: 'https://script.google.com/macros/s/AKfycbwL47EUXV9RSNDJFbRrsVPZmcQr0nUvQqzcx-9ZlFzfxudH-VUMgy9hbWGttsKpAFIq/exec',
  // Dirección de GitHub Pages donde se usa la plataforma. Si se completa, el enlace
  // de Apps Script redirige allá. Vacío = la plataforma también se abre en Apps Script.
  urlGithub: '',
  img_logo: '',
  img_portada: '',
  img_colegio: ''
};

function config_(clave) {
  var r = buscar_('Config', 'clave', clave);
  if (r && r.valor !== '') return String(r.valor);
  return CONFIG_DEFECTO.hasOwnProperty(clave) ? CONFIG_DEFECTO[clave] : '';
}

function setConfig_(clave, valor) {
  var r = buscar_('Config', 'clave', clave);
  if (r) { r.valor = valor; actualizar_('Config', r); }
  else insertar_('Config', { clave: clave, valor: valor });
}

/* ---------- Auditoría (principio de responsabilidad, Ley 21.719) ---------- */
function auditar_(ses, accion, detalle) {
  try {
    insertar_('Auditoria', {
      fecha: ahora_(),
      usuarioId: ses ? ses.uid : '-',
      rol: ses ? ses.rol : '-',
      accion: accion,
      detalle: String(detalle || '').slice(0, 300)
    });
  } catch (e) { /* la auditoría nunca debe romper la operación */ }
}

/* ---------- Utilidades de RUT y cursos ---------- */
function limpiarRut_(r) { return String(r || '').replace(/[^0-9kK]/g, '').toUpperCase(); }

function dvRut_(cuerpo) {
  var s = 0, m = 2;
  var c = String(cuerpo);
  for (var i = c.length - 1; i >= 0; i--) { s += Number(c[i]) * m; m = m === 7 ? 2 : m + 1; }
  var r = 11 - (s % 11);
  return r === 11 ? '0' : r === 10 ? 'K' : String(r);
}

/** Devuelve el RUT normalizado "12345678-9" o '' si no es válido. */
function normRut_(rut, dv) {
  var limpio = limpiarRut_(rut);
  var cuerpo, d;
  if (dv !== undefined && dv !== null && String(dv) !== '') { cuerpo = limpio; d = String(dv).toUpperCase(); }
  else { cuerpo = limpio.slice(0, -1); d = limpio.slice(-1); }
  cuerpo = cuerpo.replace(/^0+/, '');
  if (!/^\d{6,9}$/.test(cuerpo)) return '';
  if (dvRut_(cuerpo) !== d) return '';
  return cuerpo + '-' + d;
}

function normCurso_(c) { return String(c || '').toUpperCase().replace(/[\s°º.\-]/g, ''); }

function listaCursos_(s) {
  return String(s || '').split(/[,;]/).map(function (x) { return x.trim(); }).filter(String);
}

/** ¿El curso c está en la lista (texto con comas)? Lista vacía = todos. */
function cursoEn_(c, lista) {
  var l = listaCursos_(lista);
  if (!l.length) return true;
  var n = normCurso_(c);
  return l.some(function (x) { return normCurso_(x) === n; });
}

/** Convierte fechas de Excel (número, Date o texto) a "yyyy-MM-dd". */
function normFecha_(v) {
  if (v === '' || v === null || v === undefined) return '';
  if (v instanceof Date) return Utilities.formatDate(v, zona_(), 'yyyy-MM-dd');
  if (typeof v === 'number') {
    var d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd');
  }
  var s = String(v).trim();
  var m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
  if (m) return m[1] + '-' + pad2_(m[2]) + '-' + pad2_(m[3]);
  m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/);
  if (m) {
    var y = m[3].length === 2 ? (Number(m[3]) > 30 ? '19' : '20') + m[3] : m[3];
    return y + '-' + pad2_(m[2]) + '-' + pad2_(m[1]);
  }
  m = s.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (m) return m[3] + '-' + m[2] + '-' + m[1];
  return '';
}

function pad2_(x) { x = String(x); return x.length < 2 ? '0' + x : x; }

/** Fecha "yyyy-MM-dd" → clave "DDMMAAAA". */
function claveDesdeFecha_(f) {
  var m = String(f).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[3] + m[2] + m[1] : '';
}
