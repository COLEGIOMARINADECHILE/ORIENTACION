/**
 * Contenido.gs — Sesiones, materiales, cuestionarios, respuestas y retroalimentación.
 *
 * Audiencias: estudiantes | familias | docentes | todos
 * Cursos: lista separada por comas; vacío = todos los cursos.
 * Cuando un docente edita una sesión común, se guarda una VARIANTE solo para sus cursos
 * (baseId = sesión original), sin alterar lo que ven los demás cursos.
 */

function audienciaDeRol_(rol) {
  if (rol === 'estudiante') return 'estudiantes';
  if (rol === 'apoderado') return 'familias';
  return 'docentes';
}

function veAudiencia_(ses, aud) {
  if (esPersonal_(ses)) return true;
  return aud === 'todos' || aud === audienciaDeRol_(ses.rol);
}

function cursoDeSesion_(ses) { return listaCursos_(ses.cursos)[0] || ''; }

function veCursos_(ses, cursos) {
  if (ses.rol === 'admin') return true;
  if (!listaCursos_(cursos).length) return true;
  return listaCursos_(ses.cursos).some(function (c) { return cursoEn_(c, cursos); });
}

function vistaSesion_(s) {
  return {
    id: s.id, baseId: s.baseId, numero: Number(s.numero) || 0, titulo: s.titulo, objetivo: s.objetivo,
    audiencia: s.audiencia, cursos: s.cursos, estado: s.estado, imagen: s.imagen,
    bloques: json_(s.bloques, []), emergentes: json_(s.emergentes, []),
    autorNombre: s.autorNombre, actualizado: s.actualizado
  };
}

function listarSesiones_(ses) {
  var todas = todos_('Sesiones');
  var visibles = todas.filter(function (s) {
    if (!veAudiencia_(ses, s.audiencia)) return false;
    if (!esPersonal_(ses) && s.estado !== 'publicada') return false;
    return veCursos_(ses, s.cursos);
  });
  // Si existe una variante para mis cursos, oculta la sesión base.
  if (ses.rol !== 'admin') {
    var reemplazadas = {};
    visibles.forEach(function (s) { if (s.baseId) reemplazadas[s.baseId] = true; });
    visibles = visibles.filter(function (s) { return !reemplazadas[s.id]; });
  }
  return visibles.map(function (s) {
    var v = vistaSesion_(s);
    v.bloques = v.bloques.length; // en el listado solo el conteo
    v.emergentes = v.emergentes.length;
    return v;
  }).sort(function (a, b) { return a.numero - b.numero || (a.titulo < b.titulo ? -1 : 1); });
}

function obtenerSesion_(ses, d) {
  var s = buscar_('Sesiones', 'id', d.id);
  if (!s || !veAudiencia_(ses, s.audiencia) || !veCursos_(ses, s.cursos) ||
      (!esPersonal_(ses) && s.estado !== 'publicada')) throw new Error('Sesión no disponible.');
  var v = vistaSesion_(s);
  v.materiales = listarMateriales_(ses, { sesionId: s.baseId || s.id }).concat(
    s.baseId ? listarMateriales_(ses, { sesionId: s.id }) : []);
  v.cuestionarios = listarCuestionarios_(ses).filter(function (c) {
    return c.sesionId === s.id || c.sesionId === s.baseId;
  });
  return v;
}

function guardarSesion_(ses, d) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var bloques = (d.bloques || []).slice(0, 60).map(function (b) {
      return { tipo: String(b.tipo || 'texto'), titulo: String(b.titulo || '').slice(0, 200),
        texto: String(b.texto || '').slice(0, 8000), url: String(b.url || '').slice(0, 500) };
    });
    var emergentes = (d.emergentes || []).slice(0, 20).map(function (e) {
      return { titulo: String(e.titulo || '').slice(0, 200), texto: String(e.texto || '').slice(0, 3000),
        disparador: e.disparador === 'abrir' ? 'abrir' : 'boton', icono: String(e.icono || '💡').slice(0, 4) };
    });
    var base = d.id ? buscar_('Sesiones', 'id', d.id) : null;
    var reg;
    if (base && ses.rol !== 'admin') {
      // Docente o asistente: solo puede editar dentro de sus cursos.
      var misCursos = listaCursos_(ses.cursos);
      if (!misCursos.length) throw new Error('No tiene cursos asignados.');
      if (base.baseId || base.autorId === ses.uid) {
        if (!listaCursos_(base.cursos).every(function (c) { return cursoAsignado_(ses, c); }))
          throw new Error('Esta sesión pertenece a otros cursos.');
        reg = base;
      } else {
        var variante = filtrar_('Sesiones', function (s) {
          return s.baseId === base.id && listaCursos_(s.cursos).some(function (c) { return cursoAsignado_(ses, c); });
        })[0];
        reg = variante || { id: nuevoId_('S'), baseId: base.id, _nuevo: true };
        reg.cursos = misCursos.filter(function (c) { return cursoEn_(c, base.cursos); }).join(', ');
        reg.estado = base.estado;
        reg.audiencia = base.audiencia;
        reg.numero = base.numero;
      }
    } else if (base) {
      reg = base;
      reg.audiencia = d.audiencia || reg.audiencia;
      reg.cursos = d.cursos !== undefined ? d.cursos : reg.cursos;
      reg.estado = d.estado || reg.estado;
      reg.numero = d.numero !== undefined ? d.numero : reg.numero;
    } else {
      reg = { id: nuevoId_('S'), _nuevo: true, baseId: '', audiencia: d.audiencia || 'estudiantes',
        estado: d.estado || 'borrador', numero: d.numero || 0 };
      reg.cursos = ses.rol === 'admin' ? (d.cursos || '') : (d.cursos || ses.cursos);
      if (ses.rol !== 'admin' && !listaCursos_(reg.cursos).every(function (c) { return cursoAsignado_(ses, c); }))
        throw new Error('Solo puede crear sesiones para sus cursos.');
      if (ses.rol !== 'admin' && !listaCursos_(reg.cursos).length) reg.cursos = ses.cursos;
    }
    reg.titulo = String(d.titulo || reg.titulo || 'Sesión sin título').slice(0, 200);
    reg.objetivo = String(d.objetivo !== undefined ? d.objetivo : reg.objetivo || '').slice(0, 1000);
    reg.imagen = String(d.imagen !== undefined ? d.imagen : reg.imagen || '').slice(0, 500);
    reg.bloques = bloques;
    reg.emergentes = emergentes;
    reg.autorId = ses.uid; reg.autorNombre = ses.nombre; reg.actualizado = ahora_();
    if (reg._nuevo) { delete reg._nuevo; insertar_('Sesiones', reg); } else actualizar_('Sesiones', reg);
    auditar_(ses, 'guardar_sesion', reg.id + (reg.baseId ? ' (variante de ' + reg.baseId + ')' : ''));
    return vistaSesion_(reg);
  } finally { lock.releaseLock(); }
}

function eliminarSesion_(ses, d) {
  var s = buscar_('Sesiones', 'id', d.id);
  if (!s) throw new Error('Sesión no encontrada.');
  eliminar_('Sesiones', s);
  auditar_(ses, 'eliminar_sesion', d.id);
  return { ok: true };
}

/* ---------------- Materiales ---------------- */

function listarMateriales_(ses, d) {
  d = d || {};
  return todos_('Materiales').filter(function (m) {
    if (d.sesionId !== undefined && m.sesionId !== d.sesionId) return false;
    return veAudiencia_(ses, m.audiencia) && veCursos_(ses, m.cursos);
  }).map(function (m) {
    return { id: m.id, sesionId: m.sesionId, titulo: m.titulo, descripcion: m.descripcion, tipo: m.tipo,
      url: m.url, tieneArchivo: !!m.driveId, mime: m.mime, audiencia: m.audiencia, cursos: m.cursos,
      autorNombre: m.autorNombre, fecha: m.fecha, propio: m.autorId === ses.uid };
  }).reverse();
}

var MAX_ARCHIVO = 15 * 1024 * 1024;

function guardarMaterial_(ses, d) {
  var cursos = d.cursos || '';
  if (ses.rol !== 'admin') {
    if (!listaCursos_(cursos).length) cursos = ses.cursos;
    if (!listaCursos_(cursos).every(function (c) { return cursoAsignado_(ses, c); }))
      throw new Error('Solo puede compartir material con sus cursos.');
  }
  var m = {
    id: nuevoId_('M'), sesionId: d.sesionId || '', titulo: String(d.titulo || 'Material').slice(0, 200),
    descripcion: String(d.descripcion || '').slice(0, 1000), tipo: d.tipo || 'enlace',
    url: '', driveId: '', mime: '', audiencia: d.audiencia || 'estudiantes', cursos: cursos,
    autorId: ses.uid, autorNombre: ses.nombre, fecha: ahora_()
  };
  if (d.base64) {
    var bytes = Utilities.base64Decode(d.base64);
    if (bytes.length > MAX_ARCHIVO) throw new Error('El archivo supera 15 MB. Súbalo a Drive y comparta el enlace.');
    var f = carpeta_('Materiales').createFile(Utilities.newBlob(bytes, d.mime, d.nombre));
    m.driveId = f.getId(); m.mime = d.mime; m.tipo = d.tipo || 'archivo';
  } else {
    var url = String(d.url || '');
    if (!/^https:\/\//i.test(url)) throw new Error('Ingrese un enlace https válido.');
    m.url = url.slice(0, 500);
  }
  insertar_('Materiales', m);
  auditar_(ses, 'subir_material', m.id + ' ' + m.titulo);
  return { ok: true, id: m.id };
}

function eliminarMaterial_(ses, d) {
  var m = buscar_('Materiales', 'id', d.id);
  if (!m) throw new Error('Material no encontrado.');
  if (ses.rol !== 'admin' && m.autorId !== ses.uid) throw new Error('Solo puede eliminar el material que usted subió.');
  if (m.driveId) { try { DriveApp.getFileById(m.driveId).setTrashed(true); } catch (e) {} }
  eliminar_('Materiales', m);
  auditar_(ses, 'eliminar_material', d.id);
  return { ok: true };
}

/** Los archivos quedan privados en Drive; se entregan solo a quien tiene permiso. */
function archivoMaterial_(ses, d) {
  var m = buscar_('Materiales', 'id', d.id);
  if (!m || !m.driveId || !veAudiencia_(ses, m.audiencia) || !veCursos_(ses, m.cursos))
    throw new Error('Material no disponible.');
  var b = DriveApp.getFileById(m.driveId).getBlob();
  auditar_(ses, 'ver_material', m.id);
  return { nombre: b.getName(), mime: b.getContentType(), base64: Utilities.base64Encode(b.getBytes()) };
}

/* ---------------- Cuestionarios ---------------- */

function vistaCuestionario_(c) {
  return { id: c.id, codigo: c.codigo, titulo: c.titulo, descripcion: c.descripcion, audiencia: c.audiencia,
    sesionId: c.sesionId, habilitado: String(c.habilitado) === 'true', cursos: c.cursos,
    preguntas: json_(c.preguntas, []) };
}

/** Un cuestionario está habilitado para un curso si habilitado=true y el curso está en la lista (o la lista vacía). */
function habilitadoPara_(c, curso) {
  return String(c.habilitado) === 'true' && cursoEn_(curso, c.cursos);
}

function listarCuestionarios_(ses) {
  var resp = todos_('Respuestas');
  return todos_('Cuestionarios').filter(function (c) {
    if (esPersonal_(ses)) return true;
    return veAudiencia_(ses, c.audiencia) && habilitadoPara_(c, cursoDeSesion_(ses));
  }).map(function (c) {
    var v = vistaCuestionario_(c);
    v.nPreguntas = v.preguntas.length;
    delete v.preguntas;
    if (!esPersonal_(ses)) {
      v.respondido = resp.some(function (r) { return r.cuestionarioId === c.id && r.usuarioId === ses.uid; });
    }
    return v;
  });
}

function obtenerCuestionario_(ses, d) {
  var c = buscar_('Cuestionarios', 'id', d.id);
  if (!c) throw new Error('Cuestionario no encontrado.');
  if (!esPersonal_(ses) && (!veAudiencia_(ses, c.audiencia) || !habilitadoPara_(c, cursoDeSesion_(ses))))
    throw new Error('Cuestionario no habilitado.');
  var v = vistaCuestionario_(c);
  if (!esPersonal_(ses)) {
    // Las respuestas correctas no viajan al navegador del estudiante.
    v.preguntas = v.preguntas.map(function (p) { var q = JSON.parse(JSON.stringify(p)); delete q.correcta; return q; });
    var previa = filtrar_('Respuestas', function (r) { return r.cuestionarioId === c.id && r.usuarioId === ses.uid; }).pop();
    if (previa) v.previa = json_(previa.respuestas, {});
  }
  return v;
}

function guardarCuestionario_(ses, d) {
  var c = d.id ? buscar_('Cuestionarios', 'id', d.id) : null;
  var nuevo = !c;
  c = c || { id: nuevoId_('Q') };
  ['codigo', 'titulo', 'descripcion', 'audiencia', 'sesionId', 'cursos'].forEach(function (k) {
    if (d[k] !== undefined) c[k] = d[k];
  });
  if (d.preguntas) c.preguntas = d.preguntas;
  if (d.habilitado !== undefined) c.habilitado = d.habilitado ? 'true' : 'false';
  c.actualizado = ahora_();
  if (nuevo) insertar_('Cuestionarios', c); else actualizar_('Cuestionarios', c);
  auditar_(ses, 'guardar_cuestionario', c.id);
  return vistaCuestionario_(c);
}

/**
 * Habilitar/deshabilitar un cuestionario para cursos.
 * Docentes solo pueden agregar o quitar SUS cursos de la lista.
 */
function habilitarCuestionario_(ses, d) {
  var c = buscar_('Cuestionarios', 'id', d.id);
  if (!c) throw new Error('Cuestionario no encontrado.');
  if (ses.rol === 'admin' && !d.curso) {
    // Administración: habilitar o desactivar para una lista de cursos (vacía = todos).
    c.habilitado = d.habilitado ? 'true' : 'false';
    if (d.cursos !== undefined) c.cursos = d.cursos;
  } else {
    exigirCurso_(ses, d.curso);
    var lista = listaCursos_(c.cursos);
    var todosLosCursos = !lista.length && String(c.habilitado) === 'true';
    if (todosLosCursos && d.habilitado) return vistaCuestionario_(c);
    if (todosLosCursos && !d.habilitado) {
      lista = listarCursosTodos_().filter(function (x) { return normCurso_(x) !== normCurso_(d.curso); });
    } else {
      if (String(c.habilitado) !== 'true') lista = [];
      lista = lista.filter(function (x) { return normCurso_(x) !== normCurso_(d.curso); });
      if (d.habilitado) lista.push(d.curso);
    }
    c.cursos = lista.join(', ');
    c.habilitado = lista.length ? 'true' : 'false';
  }
  c.actualizado = ahora_();
  actualizar_('Cuestionarios', c);
  auditar_(ses, 'habilitar_cuestionario', c.id + ' ' + (d.curso || '') + ' ' + d.habilitado);
  return vistaCuestionario_(c);
}

function listarCursosTodos_() {
  var m = {};
  todos_('Estudiantes').forEach(function (e) { m[normCurso_(e.curso)] = e.curso; });
  return Object.keys(m).map(function (k) { return m[k]; });
}

function responder_(ses, d) {
  var c = buscar_('Cuestionarios', 'id', d.id);
  if (!c || !veAudiencia_(ses, c.audiencia) || !habilitadoPara_(c, cursoDeSesion_(ses)))
    throw new Error('Cuestionario no habilitado.');
  var preguntas = json_(c.preguntas, []);
  var resp = {};
  preguntas.forEach(function (p) {
    var v = d.respuestas ? d.respuestas[p.id] : undefined;
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) resp[p.id] = v.map(String).slice(0, 30);
    else if (typeof v === 'object') {
      var o = {}; Object.keys(v).slice(0, 40).forEach(function (k) { o[k] = String(v[k]).slice(0, 1000); }); resp[p.id] = o;
    } else resp[p.id] = String(v).slice(0, 3000);
  });
  var faltan = preguntas.filter(function (p) { return p.obligatoria && (resp[p.id] === undefined || resp[p.id] === ''); });
  if (faltan.length) throw new Error('Responda las preguntas obligatorias: ' + faltan.map(function (p) { return p.n || p.id; }).join(', '));
  var puntajes = puntuar_(c.codigo, preguntas, resp);
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var previa = filtrar_('Respuestas', function (r) { return r.cuestionarioId === c.id && r.usuarioId === ses.uid; })[0];
    var reg = previa || { id: nuevoId_('R') };
    reg.cuestionarioId = c.id; reg.codigo = c.codigo; reg.usuarioId = ses.uid;
    reg.estudianteRut = ses.estudianteRut; reg.curso = cursoDeSesion_(ses);
    reg.respuestas = resp; reg.puntajes = puntajes; reg.fecha = ahora_();
    if (previa) actualizar_('Respuestas', reg); else insertar_('Respuestas', reg);
  } finally { lock.releaseLock(); }
  auditar_(ses, 'responder', c.codigo);
  return { ok: true, resultado: resultadoDe_(c, resp, puntajes) };
}

function misResultados_(ses) {
  var cs = {};
  todos_('Cuestionarios').forEach(function (c) { cs[c.id] = c; });
  var propios = filtrar_('Respuestas', function (r) { return r.usuarioId === ses.uid; }).map(function (r) {
    var c = cs[r.cuestionarioId];
    if (!c) return null;
    var preg = json_(c.preguntas, []);
    var resp = json_(r.respuestas, {});
    return { codigo: c.codigo, titulo: c.titulo, fecha: r.fecha,
      resultado: resultadoDe_(c, resp, json_(r.puntajes, {})),
      detalle: preg.map(function (p) { return { n: p.n, texto: p.texto, tipo: p.tipo, opciones: p.opciones, items: p.items, valor: resp[p.id] }; }) };
  }).filter(Boolean);
  var out = { propios: propios, retro: listarRetro_(ses, {}) };
  var perfil = indicadoresEstudiante_(ses.estudianteRut);
  if (ses.rol === 'estudiante') out.indicadores = perfil;
  return out;
}

/* ---------------- Retroalimentación ---------------- */

function apoderadoVeRetro_(r) {
  return String(r.visibleApoderado) === 'true' || config_('apoderadoVeRetro') === 'true';
}

function listarRetro_(ses, d) {
  var rut = d.rut || ses.estudianteRut;
  exigirEstudiante_(ses, rut);
  return filtrar_('Retroalimentacion', function (r) {
    if (r.estudianteRut !== rut) return false;
    if (ses.rol === 'apoderado') return apoderadoVeRetro_(r);
    return true;
  }).map(function (r) {
    return { id: r.id, texto: r.texto, autorNombre: r.autorNombre, fecha: r.fecha,
      visibleApoderado: String(r.visibleApoderado) === 'true' };
  }).reverse();
}

function guardarRetro_(ses, d) {
  exigirEstudiante_(ses, d.rut);
  var texto = String(d.texto || '').trim();
  if (!texto) throw new Error('Escriba la retroalimentación.');
  var r = { id: nuevoId_('F'), estudianteRut: d.rut, autorId: ses.uid, autorNombre: ses.nombre,
    texto: texto.slice(0, 4000), visibleApoderado: ses.rol === 'admin' && d.visibleApoderado ? 'true' : 'false',
    fecha: ahora_() };
  insertar_('Retroalimentacion', r);
  auditar_(ses, 'retroalimentar', d.rut);
  return { ok: true };
}

function visibilidadRetro_(ses, d) {
  var r = buscar_('Retroalimentacion', 'id', d.id);
  if (!r) throw new Error('No encontrada.');
  r.visibleApoderado = d.visible ? 'true' : 'false';
  actualizar_('Retroalimentacion', r);
  auditar_(ses, 'visibilidad_retro', d.id + ' ' + d.visible);
  return { ok: true };
}
