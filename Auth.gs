/**
 * Auth.gs — Autenticación, sesiones y control de acceso por rol.
 *
 * Medidas de seguridad (Ley 21.719, art. de seguridad y confidencialidad):
 *  - Las claves nunca se guardan en texto: HMAC-SHA256 iterado con sal por usuario
 *    y "pimienta" secreta guardada en las propiedades del script (fuera de GitHub).
 *  - Bloqueo temporal tras 5 intentos fallidos.
 *  - Token de sesión aleatorio, con expiración, validado en CADA llamada al servidor.
 *  - Los permisos se revisan siempre en el servidor, nunca solo en la interfaz.
 */

var ROLES_PERSONAL = ['admin', 'docente', 'asistente'];
var DURACION_SESION = 6 * 60 * 60; // segundos
var MAX_INTENTOS = 5;
var ITERACIONES_HASH = 40;

function pimienta_() {
  var p = PropertiesService.getScriptProperties().getProperty('PEPPER');
  if (!p) throw new Error('Falta la propiedad PEPPER. Ejecute setup().');
  return p;
}

function hashClave_(clave, salt) {
  var key = pimienta_();
  var v = salt + '|' + String(clave);
  for (var i = 0; i < ITERACIONES_HASH; i++) {
    v = Utilities.base64Encode(Utilities.computeHmacSha256Signature(v, key));
  }
  return v;
}

function nuevaSal_() { return Utilities.getUuid().replace(/-/g, ''); }

function compararSeguro_(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  var r = 0;
  for (var i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function idUsuario_(tipo, rut) {
  if (tipo === 'estudiante') return 'EST:' + rut;
  if (tipo === 'madre' || tipo === 'padre' || tipo === 'tutor') return 'APO:' + rut + ':' + tipo;
  return 'PER:' + rut;
}

/** Inicio de sesión. tipo: estudiante | madre | padre | tutor | personal */
function login(rutTxt, clave, tipo) {
  var rut = normRut_(rutTxt);
  if (!rut) return { ok: false, error: 'El RUT ingresado no es válido.' };
  tipo = String(tipo || 'estudiante');
  var cache = CacheService.getScriptCache();
  var claveBloqueo = 'LOCK_' + tipo + rut;
  var intentos = Number(cache.get(claveBloqueo) || 0);
  if (intentos >= MAX_INTENTOS) {
    return { ok: false, error: 'Demasiados intentos. Espere 15 minutos o contacte al colegio.' };
  }
  var u = buscar_('Usuarios', 'id', idUsuario_(tipo, rut));
  var valido = false;
  if (u && String(u.activo) !== 'false') {
    valido = compararSeguro_(hashClave_(clave, u.salt), u.hash);
    // Con la clave inicial (fecha de nacimiento) se aceptan formatos como 05-03-2012 o 05/03/2012.
    if (!valido && String(u.debeCambiar) === 'true') {
      valido = compararSeguro_(hashClave_(String(clave).replace(/\D/g, ''), u.salt), u.hash);
    }
  }
  if (!valido) {
    cache.put(claveBloqueo, String(intentos + 1), 900);
    auditar_({ uid: idUsuario_(tipo, rut), rol: '?' }, 'login_fallido', tipo);
    return { ok: false, error: 'RUT, perfil o clave incorrectos.' };
  }
  cache.remove(claveBloqueo);
  u.ultimoAcceso = ahora_();
  actualizar_('Usuarios', u);
  var ses = crearSesion_(u);
  auditar_(ses, 'login', tipo);
  return { ok: true, token: ses.token, perfil: perfilPublico_(ses, u) };
}

function crearSesion_(u) {
  var token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  var ses = {
    token: token, uid: u.id, rol: u.rol, nombre: u.nombre, tipo: u.tipo,
    rut: u.rut, cursos: u.cursos, estudianteRut: u.estudianteRut
  };
  CacheService.getScriptCache().put('SES_' + token, JSON.stringify(ses), DURACION_SESION);
  return ses;
}

function sesion_(token) {
  if (!token) throw new Error('SESION_EXPIRADA');
  var cache = CacheService.getScriptCache();
  var raw = cache.get('SES_' + token);
  if (!raw) throw new Error('SESION_EXPIRADA');
  cache.put('SES_' + token, raw, DURACION_SESION); // expiración deslizante
  var ses = JSON.parse(raw);
  // Para estudiantes y apoderados, el curso se lee siempre de la ficha vigente.
  if (ses.rol === 'estudiante' || ses.rol === 'apoderado') {
    var est = buscar_('Estudiantes', 'rut', ses.estudianteRut);
    ses.cursos = est ? est.curso : '';
  }
  return ses;
}

function logout(token) {
  CacheService.getScriptCache().remove('SES_' + token);
  return { ok: true };
}

function perfilPublico_(ses, u) {
  u = u || buscar_('Usuarios', 'id', ses.uid);
  var est = ses.estudianteRut ? buscar_('Estudiantes', 'rut', ses.estudianteRut) : null;
  return {
    uid: ses.uid, rol: ses.rol, tipo: ses.tipo, nombre: ses.nombre,
    cursos: listaCursos_(est ? est.curso : ses.cursos),
    estudianteNombre: est ? est.nombre : '',
    debeCambiar: String(u.debeCambiar) === 'true',
    consentimiento: !!u.consentimiento
  };
}

function esPersonal_(ses) { return ROLES_PERSONAL.indexOf(ses.rol) >= 0; }

function exigir_(ses, roles) {
  if (roles.indexOf(ses.rol) < 0) throw new Error('No tiene permiso para esta acción.');
}

/** ¿Puede el usuario de la sesión ver datos del estudiante indicado? */
function puedeVerEstudiante_(ses, rutEst) {
  if (ses.rol === 'admin') return true;
  if (ses.rol === 'estudiante' || ses.rol === 'apoderado') return ses.estudianteRut === rutEst;
  var est = buscar_('Estudiantes', 'rut', rutEst);
  return !!est && cursoAsignado_(ses, est.curso);
}

function cursoAsignado_(ses, curso) {
  if (ses.rol === 'admin') return true;
  var mios = listaCursos_(ses.cursos);
  var n = normCurso_(curso);
  return mios.some(function (c) { return normCurso_(c) === n; });
}

function exigirEstudiante_(ses, rutEst) {
  if (!puedeVerEstudiante_(ses, rutEst)) throw new Error('No tiene acceso a este estudiante.');
}

function exigirCurso_(ses, curso) {
  if (!esPersonal_(ses) || !cursoAsignado_(ses, curso)) throw new Error('No tiene acceso a este curso.');
}

/* ---------- Acciones de cuenta ---------- */

function cambiarClave_(ses, d) {
  var u = buscar_('Usuarios', 'id', ses.uid);
  if (!compararSeguro_(hashClave_(d.actual, u.salt), u.hash) &&
      !(String(u.debeCambiar) === 'true' &&
        compararSeguro_(hashClave_(String(d.actual).replace(/\D/g, ''), u.salt), u.hash))) {
    throw new Error('La clave actual no es correcta.');
  }
  var nueva = String(d.nueva || '');
  if (nueva.length < 8 || !/[A-Za-z]/.test(nueva) || !/\d/.test(nueva)) {
    throw new Error('La nueva clave debe tener al menos 8 caracteres, con letras y números.');
  }
  u.salt = nuevaSal_();
  u.hash = hashClave_(nueva, u.salt);
  u.debeCambiar = 'false';
  actualizar_('Usuarios', u);
  auditar_(ses, 'cambio_clave', '');
  return { ok: true };
}

function aceptarPrivacidad_(ses) {
  var u = buscar_('Usuarios', 'id', ses.uid);
  u.consentimiento = ahora_();
  actualizar_('Usuarios', u);
  auditar_(ses, 'acepta_aviso_privacidad', '');
  return { ok: true };
}

/** Derecho de acceso y portabilidad: entrega al titular sus propios datos. */
function misDatos_(ses) {
  var u = buscar_('Usuarios', 'id', ses.uid);
  var out = {
    cuenta: { id: u.id, nombre: u.nombre, rol: u.rol, tipo: u.tipo, creado: u.creado, ultimoAcceso: u.ultimoAcceso,
      consentimiento: u.consentimiento },
    respuestas: filtrar_('Respuestas', function (r) { return r.usuarioId === ses.uid; })
      .map(function (r) { return { cuestionario: r.codigo, fecha: r.fecha, respuestas: json_(r.respuestas, {}) }; }),
    mensajes: filtrar_('Mensajes', function (m) { return m.deId === ses.uid; })
      .map(function (m) { return { fecha: m.fecha, texto: m.texto }; })
  };
  if (ses.estudianteRut) {
    var e = buscar_('Estudiantes', 'rut', ses.estudianteRut);
    if (e) out.estudiante = { rut: e.rut, nombre: e.nombre, curso: e.curso, fechaNac: e.fechaNac };
  }
  auditar_(ses, 'descarga_mis_datos', '');
  return out;
}
