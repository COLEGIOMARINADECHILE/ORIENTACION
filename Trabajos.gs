/**
 * Trabajos.gs — Imágenes de las sesiones y ejercicios desarrollados en la guía.
 *
 * Imágenes de contenido (portadas y pasos de las guías): carpeta privada "Contenido".
 * Fotos de los ejercicios de estudiantes y familias: carpeta privada "Trabajos";
 * solo las ven su autor/a y el equipo con acceso a su curso.
 */

var MAX_IMAGEN = 4 * 1024 * 1024;

function guardarImagen_(sub, d) {
  if (!/^image\//.test(String(d.mime))) throw new Error('El archivo debe ser una imagen (JPG, PNG o WEBP).');
  var bytes = Utilities.base64Decode(d.base64);
  if (bytes.length > MAX_IMAGEN) throw new Error('La imagen supera 4 MB.');
  return carpeta_(sub).createFile(Utilities.newBlob(bytes, d.mime, String(d.nombre || 'imagen').slice(0, 80)));
}

function subirImagenContenido_(ses, d) {
  var f = guardarImagen_('Contenido', d);
  auditar_(ses, 'subir_imagen_contenido', f.getId());
  return { ref: 'drive:' + f.getId() };
}

function enCarpeta_(archivo, sub) {
  var objetivo = carpeta_(sub).getId();
  var padres = archivo.getParents();
  while (padres.hasNext()) if (padres.next().getId() === objetivo) return true;
  return false;
}

function dataUri_(archivo) {
  var b = archivo.getBlob();
  return 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
}

/** Entrega imágenes de contenido (solo de la carpeta "Contenido") como data URI, con caché. */
function imagenesContenido_(ses, d) {
  var cache = CacheService.getScriptCache();
  var out = {};
  (d.ids || []).slice(0, 24).forEach(function (ref) {
    var id = String(ref).replace(/^drive:/, '');
    if (!/^[\w-]{10,}$/.test(id)) return;
    var c = cache.get('IMGC_' + id);
    if (c) { out[ref] = c; return; }
    try {
      var f = DriveApp.getFileById(id);
      if (!enCarpeta_(f, 'Contenido')) return;
      var uri = dataUri_(f);
      if (uri.length < 95000) cache.put('IMGC_' + id, uri, 21600);
      out[ref] = uri;
    } catch (e) { /* imagen eliminada o sin acceso */ }
  });
  return out;
}

/* ---------------- Ejercicios desarrollados en la guía ---------------- */

function vistaTrabajo_(t) {
  return { id: t.id, sesionId: t.sesionId, bloqueId: t.bloqueId, texto: t.texto, campos: json_(t.campos, {}),
    tieneImagen: !!t.imagen, fecha: t.fecha };
}

function misTrabajos_(ses, sesionIds) {
  return filtrar_('Trabajos', function (t) { return t.usuarioId === ses.uid && sesionIds.indexOf(t.sesionId) >= 0; })
    .map(vistaTrabajo_);
}

function guardarTrabajo_(ses, d) {
  var s = buscar_('Sesiones', 'id', d.sesionId);
  if (!s || !veAudiencia_(ses, s.audiencia) || !veCursos_(ses, s.cursos) || s.estado !== 'publicada')
    throw new Error('Sesión no disponible.');
  var bloque = json_(s.bloques, []).filter(function (b, i) { return (b.id || 'b' + i) === d.bloqueId; })[0];
  if (!bloque || bloque.tipo !== 'ejercicio') throw new Error('Ejercicio no encontrado.');
  var campos = {};
  Object.keys(d.campos || {}).slice(0, 40).forEach(function (k) { campos[String(k).slice(0, 10)] = String(d.campos[k]).slice(0, 3000); });
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var t = filtrar_('Trabajos', function (x) { return x.sesionId === s.id && x.bloqueId === d.bloqueId && x.usuarioId === ses.uid; })[0];
    var nuevo = !t;
    t = t || { id: nuevoId_('T'), sesionId: s.id, bloqueId: d.bloqueId, usuarioId: ses.uid };
    t.estudianteRut = ses.estudianteRut; t.curso = cursoDeSesion_(ses);
    t.texto = String(d.texto || '').slice(0, 8000);
    t.campos = campos;
    if (d.quitarImagen && t.imagen) { try { DriveApp.getFileById(t.imagen).setTrashed(true); } catch (e) {} t.imagen = ''; }
    if (d.imagen && d.imagen.base64) {
      if (t.imagen) { try { DriveApp.getFileById(t.imagen).setTrashed(true); } catch (e) {} }
      t.imagen = guardarImagen_('Trabajos', d.imagen).getId();
    }
    t.fecha = ahora_();
    if (nuevo) insertar_('Trabajos', t); else actualizar_('Trabajos', t);
    auditar_(ses, 'guardar_trabajo', s.id + ' ' + d.bloqueId);
    return vistaTrabajo_(t);
  } finally { lock.releaseLock(); }
}

/** Foto de un ejercicio: la ve su autor/a, su familia o el equipo con acceso al curso. */
function imagenTrabajo_(ses, d) {
  var t = buscar_('Trabajos', 'id', d.id);
  if (!t || !t.imagen) throw new Error('Imagen no disponible.');
  var permitido = t.usuarioId === ses.uid || (esPersonal_(ses) && puedeVerEstudiante_(ses, t.estudianteRut));
  if (!permitido) throw new Error('No tiene acceso a esta imagen.');
  return { uri: dataUri_(DriveApp.getFileById(t.imagen)) };
}

/** Trabajos de un curso en una sesión, agrupados por ejercicio (para el reporte de sesión). */
function trabajosDeSesion_(s, curso, nombres) {
  var bloques = json_(s.bloques, []);
  var ids = [s.id, s.baseId].filter(String);
  var lista = filtrar_('Trabajos', function (t) { return ids.indexOf(t.sesionId) >= 0 && normCurso_(t.curso) === normCurso_(curso); });
  return bloques.map(function (b, i) { b.id = b.id || 'b' + i; return b; })
    .filter(function (b) { return b.tipo === 'ejercicio'; })
    .map(function (b) {
      return { bloqueId: b.id, titulo: b.titulo, campos: b.campos || [],
        respuestas: lista.filter(function (t) { return t.bloqueId === b.id; }).map(function (t) {
          var v = vistaTrabajo_(t);
          v.nombre = nombres[t.estudianteRut] || t.estudianteRut;
          v.quien = t.usuarioId.indexOf('EST:') === 0 ? 'Estudiante' : t.usuarioId.split(':').pop();
          return v;
        }) };
    });
}
