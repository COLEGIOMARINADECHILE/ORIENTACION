/**
 * Mensajes.gs — Consultas privadas (estilo chat) y avisos masivos (estilo muro).
 *
 * Hilo privado:  "H:<uid>"  conversación entre un estudiante o apoderado y el equipo de su curso.
 * Aviso masivo:  paraTipo = aviso_estudiantes | aviso_familias | aviso_todos, para uno o más cursos.
 */

function duenoHilo_(hilo) {
  if (!/^H:/.test(hilo)) throw new Error('Conversación no válida.');
  var u = buscar_('Usuarios', 'id', hilo.slice(2));
  if (!u) throw new Error('Conversación no encontrada.');
  return u;
}

function exigirHilo_(ses, hilo) {
  if (!esPersonal_(ses)) { if (hilo !== 'H:' + ses.uid) throw new Error('No tiene acceso a esta conversación.'); return buscar_('Usuarios', 'id', ses.uid); }
  var u = duenoHilo_(hilo);
  exigirEstudiante_(ses, u.estudianteRut);
  return u;
}

function etiquetaUsuario_(u, ests) {
  var e = ests[u.estudianteRut];
  if (u.rol === 'estudiante') return { titulo: u.nombre, sub: 'Estudiante · ' + (e ? e.curso : '') };
  var par = { madre: 'Madre', padre: 'Padre', tutor: 'Tutor/a' }[u.parentesco] || 'Apoderado/a';
  return { titulo: u.nombre, sub: par + ' de ' + (e ? e.nombre.split(' ')[0] + ' · ' + e.curso : '') };
}

function noLeido_(m, ses) {
  var leidos = String(m.leidoPor || '').split(',');
  if (esPersonal_(ses)) return ROLES_PERSONAL.indexOf(m.deRol) < 0 && leidos.indexOf('equipo') < 0;
  return ROLES_PERSONAL.indexOf(m.deRol) >= 0 && leidos.indexOf(ses.uid) < 0;
}

function listarHilos_(ses) {
  var privados = filtrar_('Mensajes', function (m) { return /^H:/.test(m.hilo); });
  if (!esPersonal_(ses)) {
    var mios = privados.filter(function (m) { return m.hilo === 'H:' + ses.uid; });
    return [{ hilo: 'H:' + ses.uid, titulo: 'Equipo de Orientación', sub: 'Profesor jefe · Orientación · UTP',
      ultimo: mios.length ? mios[mios.length - 1].texto.slice(0, 80) : 'Escribe tu consulta, te responderemos pronto.',
      fecha: mios.length ? mios[mios.length - 1].fecha : '',
      noLeidos: mios.filter(function (m) { return noLeido_(m, ses); }).length }];
  }
  var ests = {}; todos_('Estudiantes').forEach(function (e) { ests[e.rut] = e; });
  var usuarios = {}; todos_('Usuarios').forEach(function (u) { usuarios[u.id] = u; });
  var grupos = {};
  privados.forEach(function (m) {
    var e = ests[m.estudianteRut];
    if (!e || !cursoAsignado_(ses, e.curso)) return;
    (grupos[m.hilo] = grupos[m.hilo] || []).push(m);
  });
  return Object.keys(grupos).map(function (h) {
    var ms = grupos[h], u = usuarios[h.slice(2)];
    if (!u) return null;
    var et = etiquetaUsuario_(u, ests);
    var ult = ms[ms.length - 1];
    return { hilo: h, titulo: et.titulo, sub: et.sub, rol: u.rol, curso: ests[u.estudianteRut] ? ests[u.estudianteRut].curso : '',
      ultimo: ult.texto.slice(0, 80), fecha: ult.fecha, noLeidos: ms.filter(function (m) { return noLeido_(m, ses); }).length };
  }).filter(Boolean).sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
}

function obtenerHilo_(ses, d) {
  var dueno = exigirHilo_(ses, d.hilo);
  var ms = filtrar_('Mensajes', function (m) { return m.hilo === d.hilo; });
  var marca = esPersonal_(ses) ? 'equipo' : ses.uid;
  var cambios = ms.filter(function (m) { return noLeido_(m, ses); });
  cambios.forEach(function (m) {
    m.leidoPor = (m.leidoPor ? m.leidoPor + ',' : '') + marca;
    actualizar_('Mensajes', m);
  });
  if (esPersonal_(ses)) auditar_(ses, 'ver_conversacion', d.hilo);
  var ests = {}; todos_('Estudiantes').forEach(function (e) { ests[e.rut] = e; });
  var et = etiquetaUsuario_(dueno, ests);
  return {
    hilo: d.hilo, titulo: esPersonal_(ses) ? et.titulo : 'Equipo de Orientación', sub: esPersonal_(ses) ? et.sub : '',
    mensajes: ms.map(function (m) {
      return { id: m.id, texto: m.texto, fecha: m.fecha, deNombre: m.deNombre, deRol: m.deRol,
        propio: esPersonal_(ses) ? ROLES_PERSONAL.indexOf(m.deRol) >= 0 : m.deId === ses.uid, deId: undefined };
    })
  };
}

function enviarMensaje_(ses, d) {
  var texto = String(d.texto || '').trim();
  if (!texto) throw new Error('Escriba un mensaje.');
  var hilo = esPersonal_(ses) ? (d.hilo || ('H:' + d.paraUid)) : 'H:' + ses.uid;
  var dueno = exigirHilo_(ses, hilo);
  insertar_('Mensajes', {
    id: nuevoId_('C'), hilo: hilo, deId: ses.uid, deNombre: ses.nombre, deRol: ses.rol, paraTipo: 'privado',
    curso: '', estudianteRut: dueno.estudianteRut, texto: texto.slice(0, 2000), fecha: ahora_(),
    leidoPor: esPersonal_(ses) ? 'equipo' : ses.uid, likes: ''
  });
  auditar_(ses, 'mensaje', hilo);
  return obtenerHilo_(ses, { hilo: hilo });
}

/* ---------------- Avisos masivos ---------------- */

function audienciaAviso_(paraTipo) {
  return { aviso_estudiantes: 'estudiantes', aviso_familias: 'familias', aviso_todos: 'todos' }[paraTipo] || 'todos';
}

function listarAvisos_(ses) {
  return filtrar_('Mensajes', function (m) {
    if (!/^aviso_/.test(m.paraTipo)) return false;
    if (esPersonal_(ses)) return esAdmin_(ses) || !listaCursos_(m.curso).length || listaCursos_(m.curso).some(function (c) { return cursoAsignado_(ses, c); });
    if (!veAudiencia_(ses, audienciaAviso_(m.paraTipo))) return false;
    return cursoEn_(cursoDeSesion_(ses), m.curso);
  }).map(function (m) {
    var likes = String(m.likes || '').split(',').filter(String);
    return { id: m.id, texto: m.texto, fecha: m.fecha, deNombre: m.deNombre, deRol: m.deRol, curso: m.curso || 'Todos los cursos',
      audiencia: audienciaAviso_(m.paraTipo), likes: likes.length, meGusta: likes.indexOf(ses.uid) >= 0 };
  }).reverse();
}

/**
 * Publica un aviso a uno o varios cursos. Con d.individual=true además deja
 * una copia en la conversación privada de cada destinatario.
 */
function publicarAviso_(ses, d) {
  var texto = String(d.texto || '').trim();
  if (!texto) throw new Error('Escriba el aviso.');
  var cursos = listaCursos_(d.cursos);
  if (!esAdmin_(ses)) {
    if (!cursos.length) cursos = listaCursos_(ses.cursos);
    cursos.forEach(function (c) { exigirCurso_(ses, c); });
  }
  var paraTipo = ['aviso_estudiantes', 'aviso_familias', 'aviso_todos'].indexOf(d.paraTipo) >= 0 ? d.paraTipo : 'aviso_todos';
  insertar_('Mensajes', { id: nuevoId_('V'), hilo: 'AVISO', deId: ses.uid, deNombre: ses.nombre, deRol: ses.rol,
    paraTipo: paraTipo, curso: cursos.join(', '), estudianteRut: '', texto: texto.slice(0, 3000), fecha: ahora_(), leidoPor: '', likes: '' });
  var copias = 0;
  if (d.individual) {
    var aud = audienciaAviso_(paraTipo);
    var ests = {}; todos_('Estudiantes').forEach(function (e) { ests[e.rut] = e; });
    var lista = todos_('Usuarios').filter(function (u) {
      if (String(u.activo) === 'false' || !u.estudianteRut || !ests[u.estudianteRut]) return false;
      if (aud === 'estudiantes' && u.rol !== 'estudiante') return false;
      if (aud === 'familias' && u.rol !== 'apoderado') return false;
      return cursoEn_(ests[u.estudianteRut].curso, cursos.join(','));
    }).map(function (u) {
      return { id: nuevoId_('C'), hilo: 'H:' + u.id, deId: ses.uid, deNombre: ses.nombre, deRol: ses.rol, paraTipo: 'privado',
        curso: '', estudianteRut: u.estudianteRut, texto: texto.slice(0, 2000), fecha: ahora_(), leidoPor: 'equipo', likes: '' };
    });
    insertarVarios_('Mensajes', lista);
    copias = lista.length;
  }
  auditar_(ses, 'aviso_masivo', paraTipo + ' ' + cursos.join(',') + ' copias=' + copias);
  return { ok: true, copias: copias };
}

function darLike_(ses, d) {
  var m = buscar_('Mensajes', 'id', d.id);
  if (!m || !/^aviso_/.test(m.paraTipo)) throw new Error('Aviso no encontrado.');
  if (!listarAvisos_(ses).some(function (a) { return a.id === m.id; })) throw new Error('Aviso no disponible.');
  var l = String(m.likes || '').split(',').filter(String);
  var i = l.indexOf(ses.uid);
  if (i >= 0) l.splice(i, 1); else l.push(ses.uid);
  m.likes = l.join(',');
  actualizar_('Mensajes', m);
  return { likes: l.length, meGusta: i < 0 };
}
