/**
 * Permisos.gs — Perfiles y permisos configurables por la administración.
 *
 * Tres bases de perfil (las mismas del ingreso):
 *   alumno       Alumno/a
 *   adulto       Adulto responsable (madre, padre o tutor)
 *   funcionario  Funcionario del colegio (administración, docentes, asistentes y perfiles creados)
 *
 * Cada perfil tiene una lista de permisos. La administración puede:
 *  - cambiar los permisos de Alumno/a, Adulto responsable, Docente y Asistente,
 *  - crear perfiles nuevos de funcionario con todas o algunas funciones.
 * El perfil "Administración" siempre tiene todos los permisos.
 */

function catalogoPermisos_() {
  return {
    funcionario: [
      ['cursos.ver', 'Ver sus cursos y la ficha de sus estudiantes'],
      ['todosLosCursos', 'Acceso a TODOS los cursos (no solo los asignados)'],
      ['sesiones.editar', 'Crear y editar sesiones (imágenes, videos, ejercicios y emergentes)'],
      ['sesiones.eliminar', 'Eliminar sesiones'],
      ['materiales', 'Subir y eliminar material'],
      ['cuestionarios.habilitar', 'Habilitar cuestionarios en sus cursos'],
      ['cuestionarios.editar', 'Crear y editar cuestionarios'],
      ['resultados.cargar', 'Cargar resultados de encuestas aplicadas en papel'],
      ['reportes', 'Ver y descargar reportes (individual, curso y sesión)'],
      ['analisis', 'Generar y ver análisis con IA'],
      ['mensajes', 'Mensajes individuales y masivos'],
      ['retro', 'Escribir retroalimentación a estudiantes'],
      ['retro.visibilidad', 'Decidir si la familia ve la retroalimentación'],
      ['cursos.gestionar', 'Crear y editar cursos'],
      ['usuarios', 'Gestionar usuarios, perfiles y permisos'],
      ['carga', 'Carga masiva de estudiantes desde Excel'],
      ['config', 'Configuración, imágenes y contenido de los manuales'],
      ['auditoria', 'Ver el registro de auditoría']
    ],
    alumno: [
      ['sesiones', 'Ver sesiones y material'],
      ['ejercicios', 'Desarrollar los ejercicios en la guía (texto y fotos)'],
      ['cuestionarios', 'Responder cuestionarios y encuestas'],
      ['resultados', 'Ver sus resultados'],
      ['retro', 'Ver la retroalimentación del equipo'],
      ['mensajes', 'Enviar consultas al equipo'],
      ['muro', 'Ver y reaccionar a los avisos del muro']
    ],
    adulto: [
      ['sesiones', 'Ver el manual y material para familias'],
      ['ejercicios', 'Desarrollar las tareas familiares en la guía'],
      ['cuestionarios', 'Responder encuestas para familias'],
      ['resultados', 'Ver sus resultados'],
      ['retro', 'Ver la retroalimentación del estudiante (si la administración lo autoriza)'],
      ['mensajes', 'Enviar consultas al colegio'],
      ['muro', 'Ver y reaccionar a los avisos del muro']
    ]
  };
}

function clavesPermisos_(base) { return catalogoPermisos_()[base].map(function (p) { return p[0]; }); }

/** Perfiles que siempre existen. Sus permisos pueden ajustarse (salvo Administración). */
function perfilesSistema_() {
  var docente = ['cursos.ver', 'sesiones.editar', 'materiales', 'cuestionarios.habilitar', 'resultados.cargar',
    'reportes', 'analisis', 'mensajes', 'retro'];
  return {
    admin: { nombre: 'Administración', base: 'funcionario', permisos: clavesPermisos_('funcionario'), fijo: true },
    docente: { nombre: 'Docente', base: 'funcionario', permisos: docente },
    asistente: { nombre: 'Asistente de la educación', base: 'funcionario', permisos: docente.slice() },
    alumno: { nombre: 'Alumno/a', base: 'alumno', permisos: clavesPermisos_('alumno') },
    adulto: { nombre: 'Adulto responsable', base: 'adulto', permisos: clavesPermisos_('adulto') }
  };
}

function idPerfilDe_(ses) {
  if (ses.rol === 'estudiante') return 'alumno';
  if (ses.rol === 'apoderado') return 'adulto';
  if (ses.rol === 'personalizado') return ses.perfilId || '';
  return ses.rol;
}

function perfilPorId_(id) {
  var sis = perfilesSistema_();
  var fila = buscar_('Perfiles', 'id', id);
  if (sis[id]) {
    var p = sis[id];
    if (fila && !p.fijo) p.permisos = json_(fila.permisos, p.permisos);
    if (fila && fila.nombre && !p.fijo) p.nombre = fila.nombre;
    p.id = id; p.sistema = true;
    return p;
  }
  if (!fila) return null;
  return { id: id, nombre: fila.nombre, base: fila.base || 'funcionario', permisos: json_(fila.permisos, []), sistema: false };
}

var _permMemo = {};
function permisosDe_(ses) {
  var id = idPerfilDe_(ses);
  if (_permMemo[id]) return _permMemo[id];
  var p = perfilPorId_(id);
  _permMemo[id] = p ? p.permisos : [];
  return _permMemo[id];
}

function tienePermiso_(ses, permiso) { return permisosDe_(ses).indexOf(permiso) >= 0; }

/** Funcionario con alcance de administración sobre los cursos. */
function esAdmin_(ses) { return ses.rol === 'admin' || (esPersonal_(ses) && tienePermiso_(ses, 'todosLosCursos')); }

/* ---------------- Gestión de perfiles ---------------- */

function listarPerfiles_() {
  var sis = perfilesSistema_();
  var cuenta = {};
  todos_('Usuarios').forEach(function (u) {
    var k = u.rol === 'estudiante' ? 'alumno' : u.rol === 'apoderado' ? 'adulto' : u.rol === 'personalizado' ? u.perfilId : u.rol;
    cuenta[k] = (cuenta[k] || 0) + 1;
  });
  var lista = Object.keys(sis).map(function (id) { var p = perfilPorId_(id); p.usuarios = cuenta[id] || 0; return p; });
  todos_('Perfiles').forEach(function (f) {
    if (sis[f.id]) return;
    var p = perfilPorId_(f.id); p.usuarios = cuenta[f.id] || 0; lista.push(p);
  });
  return { perfiles: lista, catalogo: catalogoPermisos_() };
}

function guardarPerfil_(ses, d) {
  var sis = perfilesSistema_();
  var id = d.id || ('P' + nuevoId_('').slice(0, 8));
  if (sis[id] && sis[id].fijo) throw new Error('El perfil Administración siempre tiene todos los permisos.');
  var base = sis[id] ? sis[id].base : 'funcionario';
  var validos = clavesPermisos_(base);
  var permisos = (d.permisos || []).filter(function (p) { return validos.indexOf(p) >= 0; });
  var nombre = String(d.nombre || (sis[id] && sis[id].nombre) || '').trim().slice(0, 80);
  if (!nombre) throw new Error('Escriba el nombre del perfil.');
  var fila = buscar_('Perfiles', 'id', id);
  var reg = fila || { id: id };
  reg.nombre = nombre; reg.base = base; reg.permisos = permisos; reg.sistema = sis[id] ? 'true' : 'false'; reg.actualizado = ahora_();
  if (fila) actualizar_('Perfiles', reg); else insertar_('Perfiles', reg);
  _permMemo = {};
  auditar_(ses, 'guardar_perfil', id + ' ' + permisos.join(','));
  return perfilPorId_(id);
}

function eliminarPerfil_(ses, d) {
  if (perfilesSistema_()[d.id]) throw new Error('Los perfiles del sistema no se eliminan; puede quitarles permisos.');
  if (todos_('Usuarios').some(function (u) { return u.rol === 'personalizado' && u.perfilId === d.id; }))
    throw new Error('Hay usuarios con este perfil. Asígneles otro perfil antes de eliminarlo.');
  var f = buscar_('Perfiles', 'id', d.id);
  if (!f) throw new Error('Perfil no encontrado.');
  eliminar_('Perfiles', f);
  auditar_(ses, 'eliminar_perfil', d.id);
  return { ok: true };
}

/* ---------------- Cursos ---------------- */

function guardarCurso_(ses, d) {
  var curso = String(d.curso || '').trim();
  if (!curso) throw new Error('Escriba el nombre del curso (ej. 8° A).');
  var original = d.original ? buscar_('Cursos', 'curso', d.original) : null;
  var existente = filtrar_('Cursos', function (c) { return normCurso_(c.curso) === normCurso_(curso); })[0];
  if (!original && existente) throw new Error('Ese curso ya existe.');
  if (original && normCurso_(original.curso) !== normCurso_(curso)) {
    var conEst = todos_('Estudiantes').some(function (e) { return normCurso_(e.curso) === normCurso_(original.curso); });
    if (conEst) throw new Error('El curso tiene estudiantes: para cambiar su nombre, vuelva a cargar el Excel con el nombre nuevo.');
    if (existente) throw new Error('Ya existe un curso con ese nombre.');
  }
  var reg = original || { creado: ahora_() };
  reg.curso = curso; reg.nivel = String(d.nivel || '').slice(0, 40); reg.descripcion = String(d.descripcion || '').slice(0, 300);
  reg.profesorJefe = String(d.profesorJefe || '').slice(0, 120); reg.activo = 'true';
  if (original) actualizar_('Cursos', reg); else insertar_('Cursos', reg);
  auditar_(ses, 'guardar_curso', curso);
  return { ok: true };
}

function eliminarCurso_(ses, d) {
  var c = buscar_('Cursos', 'curso', d.curso);
  if (!c) throw new Error('Curso no encontrado.');
  if (todos_('Estudiantes').some(function (e) { return normCurso_(e.curso) === normCurso_(c.curso); }))
    throw new Error('No se puede eliminar un curso con estudiantes.');
  eliminar_('Cursos', c);
  auditar_(ses, 'eliminar_curso', d.curso);
  return { ok: true };
}
