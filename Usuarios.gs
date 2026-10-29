/**
 * Usuarios.gs — Perfiles, carga masiva desde Excel y cursos.
 *
 * Cuentas:
 *  - Estudiante:  EST:<rut>            clave inicial = fecha de nacimiento (DDMMAAAA)
 *  - Madre/Padre: APO:<rut>:madre|padre clave inicial = fecha de nacimiento del estudiante
 *  - Tutor:       APO:<rut>:tutor      solo si el tutor no es el padre ni la madre
 *  - Personal:    PER:<rut>            creado por el administrador
 * Cada cuenta tiene su propia clave: si el estudiante la cambia, la familia sigue entrando con la suya.
 */

function vistaUsuario_(u) {
  return {
    id: u.id, rut: u.rut, tipo: u.tipo, nombre: u.nombre, rol: u.rol, cursos: u.cursos,
    estudianteRut: u.estudianteRut, parentesco: u.parentesco, email: u.email,
    activo: String(u.activo) !== 'false', debeCambiar: String(u.debeCambiar) === 'true',
    ultimoAcceso: u.ultimoAcceso, consentimiento: u.consentimiento
  };
}

function listarUsuarios_(ses, d) {
  var q = String(d.q || '').toLowerCase();
  var rol = d.rol || '';
  var curso = d.curso || '';
  var est = {};
  todos_('Estudiantes').forEach(function (e) { est[e.rut] = e; });
  return todos_('Usuarios').filter(function (u) {
    if (rol && u.rol !== rol) return false;
    if (curso) {
      var c = u.estudianteRut && est[u.estudianteRut] ? est[u.estudianteRut].curso : u.cursos;
      if (!cursoEn_(curso, c) || !c) return false;
    }
    if (q && (u.nombre + ' ' + u.rut).toLowerCase().indexOf(q) < 0) return false;
    return true;
  }).map(function (u) {
    var v = vistaUsuario_(u);
    if (u.estudianteRut && est[u.estudianteRut]) {
      v.curso = est[u.estudianteRut].curso;
      v.estudianteNombre = est[u.estudianteRut].nombre;
    }
    return v;
  });
}

function guardarUsuario_(ses, d) {
  var u = d.id ? buscar_('Usuarios', 'id', d.id) : null;
  if (u) {
    if (d.nombre) u.nombre = String(d.nombre).trim();
    if (ROLES_PERSONAL.indexOf(u.rol) >= 0) {
      if (d.rol && ROLES_PERSONAL.indexOf(d.rol) >= 0) {
        if (u.id === ses.uid && d.rol !== 'admin') throw new Error('No puede quitarse a sí mismo el rol de administrador.');
        u.rol = d.rol;
      }
      if (d.cursos !== undefined) u.cursos = d.cursos;
    }
    if (d.email !== undefined) u.email = d.email;
    if (d.activo !== undefined) {
      if (u.id === ses.uid && !d.activo) throw new Error('No puede desactivar su propia cuenta.');
      u.activo = d.activo ? 'true' : 'false';
    }
    actualizar_('Usuarios', u);
    auditar_(ses, 'editar_usuario', u.id);
    return vistaUsuario_(u);
  }
  // Nuevo usuario
  var rut = normRut_(d.rut);
  if (d.rol === 'apoderado') {
    var est = buscar_('Estudiantes', 'rut', normRut_(d.estudianteRut));
    if (!est) throw new Error('No existe el estudiante indicado.');
    var par = ['madre', 'padre', 'tutor'].indexOf(d.parentesco) >= 0 ? d.parentesco : 'tutor';
    var id = idUsuario_(par, est.rut);
    if (buscar_('Usuarios', 'id', id)) throw new Error('Ya existe una cuenta de ' + par + ' para este estudiante.');
    var salt = nuevaSal_();
    var n = {
      id: id, rut: est.rut, tipo: par, nombre: d.nombre, rol: 'apoderado', estudianteRut: est.rut,
      parentesco: par, email: d.email || '', salt: salt, hash: hashClave_(claveDesdeFecha_(est.fechaNac), salt),
      activo: 'true', debeCambiar: 'true', creado: ahora_()
    };
    insertar_('Usuarios', n);
    auditar_(ses, 'crear_apoderado', id);
    return vistaUsuario_(n);
  }
  if (!rut) throw new Error('RUT no válido.');
  if (ROLES_PERSONAL.indexOf(d.rol) < 0) throw new Error('Rol no válido.');
  if (buscar_('Usuarios', 'id', 'PER:' + rut)) throw new Error('Ya existe un usuario con ese RUT.');
  var temporal = claveTemporal_();
  var s2 = nuevaSal_();
  var nu = {
    id: 'PER:' + rut, rut: rut, tipo: 'personal', nombre: String(d.nombre || '').trim(), rol: d.rol,
    cursos: d.cursos || '', email: d.email || '', salt: s2, hash: hashClave_(d.clave || temporal, s2),
    activo: 'true', debeCambiar: 'true', creado: ahora_()
  };
  insertar_('Usuarios', nu);
  auditar_(ses, 'crear_usuario', nu.id);
  var v = vistaUsuario_(nu);
  v.claveTemporal = d.clave ? '' : temporal;
  return v;
}

function claveTemporal_() {
  var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  var s = '';
  for (var i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s + Math.floor(10 + Math.random() * 89);
}

function eliminarUsuario_(ses, d) {
  if (d.id === ses.uid) throw new Error('No puede eliminar su propia cuenta.');
  var u = buscar_('Usuarios', 'id', d.id);
  if (!u) throw new Error('Usuario no encontrado.');
  eliminar_('Usuarios', u);
  auditar_(ses, 'eliminar_usuario', d.id);
  return { ok: true };
}

function restablecerClave_(ses, d) {
  var u = buscar_('Usuarios', 'id', d.id);
  if (!u) throw new Error('Usuario no encontrado.');
  var clave, mostrar = '';
  if (u.estudianteRut) {
    var est = buscar_('Estudiantes', 'rut', u.estudianteRut);
    clave = claveDesdeFecha_(est ? est.fechaNac : '');
    if (!clave) throw new Error('El estudiante no tiene fecha de nacimiento registrada.');
  } else {
    clave = claveTemporal_();
    mostrar = clave;
  }
  u.salt = nuevaSal_();
  u.hash = hashClave_(clave, u.salt);
  u.debeCambiar = 'true';
  actualizar_('Usuarios', u);
  auditar_(ses, 'restablecer_clave', u.id);
  return { ok: true, claveTemporal: mostrar };
}

/** Reescribe por completo una hoja (para cargas masivas eficientes). */
function reescribir_(nombre, lista) {
  var sh = hoja_(nombre);
  var cols = ESQUEMA[nombre].length;
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, cols).clearContent();
  if (lista.length) {
    if (sh.getMaxRows() < lista.length + 1) sh.insertRowsAfter(sh.getMaxRows(), lista.length + 1 - sh.getMaxRows());
    sh.getRange(2, 1, lista.length, cols).setNumberFormat('@')
      .setValues(lista.map(function (o) { return filaDesdeObj_(nombre, o); }));
  }
  limpiarMemo_(nombre);
}

function normNombre_(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Carga masiva. d.filas = [{Rut, DV, NombreAlumno, Sexo, FechaNac, Curso, Local, FecMatriculado,
 * Direccion, Comuna, 'Nombre Padre', 'Nombre Madre', 'Nombre Tutor'}]
 */
function importarEstudiantes_(ses, d) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var filas = d.filas || [];
    var ests = todos_('Estudiantes').slice();
    var porRut = {};
    ests.forEach(function (e) { porRut[e.rut] = e; });
    var usuarios = todos_('Usuarios');
    var existentes = {};
    usuarios.forEach(function (u) { existentes[u.id] = u; });
    var nuevosUsuarios = [];
    var errores = [], creados = 0, actualizados = 0, cuentas = 0;

    function campo(f, nombres) {
      for (var i = 0; i < nombres.length; i++) {
        var k = Object.keys(f).filter(function (x) { return normNombre_(x).replace(/\s/g, '') === nombres[i]; })[0];
        if (k !== undefined && f[k] !== '' && f[k] !== null) return f[k];
      }
      return '';
    }

    filas.forEach(function (f, i) {
      var rut = normRut_(campo(f, ['rut']), campo(f, ['dv']));
      var nombre = String(campo(f, ['nombrealumno', 'nombre'])).trim();
      var fecha = normFecha_(campo(f, ['fechanac', 'fechanacimiento']));
      var curso = String(campo(f, ['curso'])).trim();
      if (!rut) { errores.push('Fila ' + (i + 2) + ': RUT o DV no válido.'); return; }
      if (!nombre || !fecha || !curso) { errores.push('Fila ' + (i + 2) + ': falta nombre, fecha de nacimiento o curso.'); return; }
      var reg = porRut[rut];
      var datos = {
        rut: rut, dv: rut.split('-')[1], nombre: nombre, sexo: String(campo(f, ['sexo'])).trim(),
        fechaNac: fecha, curso: curso, local: String(campo(f, ['local'])).trim(),
        fecMatricula: normFecha_(campo(f, ['fecmatriculado', 'fechamatricula'])),
        direccion: String(campo(f, ['direccion'])).trim(), comuna: String(campo(f, ['comuna'])).trim(),
        nombrePadre: String(campo(f, ['nombrepadre'])).trim(),
        nombreMadre: String(campo(f, ['nombremadre'])).trim(),
        nombreTutor: String(campo(f, ['nombretutor'])).trim(),
        actualizado: ahora_()
      };
      if (reg) { Object.keys(datos).forEach(function (k) { reg[k] = datos[k]; }); actualizados++; }
      else { porRut[rut] = datos; ests.push(datos); creados++; }

      var clave = claveDesdeFecha_(fecha);
      var cuentasEst = [{ tipo: 'estudiante', nombre: nombre, rol: 'estudiante' }];
      if (datos.nombrePadre) cuentasEst.push({ tipo: 'padre', nombre: datos.nombrePadre, rol: 'apoderado' });
      if (datos.nombreMadre) cuentasEst.push({ tipo: 'madre', nombre: datos.nombreMadre, rol: 'apoderado' });
      var t = normNombre_(datos.nombreTutor);
      if (t && t !== normNombre_(datos.nombrePadre) && t !== normNombre_(datos.nombreMadre)) {
        cuentasEst.push({ tipo: 'tutor', nombre: datos.nombreTutor, rol: 'apoderado' });
      }
      cuentasEst.forEach(function (c) {
        var id = idUsuario_(c.tipo, rut);
        var u = existentes[id];
        if (u) { u.nombre = c.nombre; u._cambio = true; return; }
        var salt = nuevaSal_();
        var nu = {
          id: id, rut: rut, tipo: c.tipo, nombre: c.nombre, rol: c.rol, cursos: '',
          estudianteRut: rut, parentesco: c.tipo === 'estudiante' ? '' : c.tipo, email: '',
          salt: salt, hash: hashClave_(clave, salt), activo: 'true', debeCambiar: 'true', creado: ahora_()
        };
        existentes[id] = nu;
        nuevosUsuarios.push(nu);
        cuentas++;
      });
    });

    reescribir_('Estudiantes', ests);
    if (usuarios.some(function (u) { return u._cambio; })) reescribir_('Usuarios', usuarios);
    insertarVarios_('Usuarios', nuevosUsuarios);
    auditar_(ses, 'importar_estudiantes', 'creados=' + creados + ' act=' + actualizados + ' cuentas=' + cuentas);
    return { creados: creados, actualizados: actualizados, cuentas: cuentas, errores: errores };
  } finally {
    lock.releaseLock();
  }
}

/** Derecho de supresión: elimina al estudiante, sus cuentas y sus registros asociados. */
function eliminarEstudiante_(ses, d) {
  var rut = normRut_(d.rut);
  var e = buscar_('Estudiantes', 'rut', rut);
  if (!e) throw new Error('Estudiante no encontrado.');
  ['Respuestas', 'Retroalimentacion'].forEach(function (h) {
    reescribir_(h, todos_(h).filter(function (r) { return r.estudianteRut !== rut; }));
  });
  reescribir_('Mensajes', todos_('Mensajes').filter(function (m) { return m.estudianteRut !== rut; }));
  reescribir_('Analisis', todos_('Analisis').filter(function (a) { return a.clave !== 'EST:' + rut; }));
  reescribir_('Usuarios', todos_('Usuarios').filter(function (u) { return u.estudianteRut !== rut; }));
  reescribir_('Estudiantes', todos_('Estudiantes').filter(function (x) { return x.rut !== rut; }));
  auditar_(ses, 'suprimir_estudiante', rut);
  return { ok: true };
}

/** Cursos visibles para el personal, con conteo de estudiantes. */
function listarCursos_(ses) {
  var mapa = {};
  todos_('Estudiantes').forEach(function (e) {
    if (!cursoAsignado_(ses, e.curso)) return;
    var k = normCurso_(e.curso);
    if (!mapa[k]) mapa[k] = { curso: e.curso, estudiantes: 0 };
    mapa[k].estudiantes++;
  });
  if (ses.rol !== 'admin') {
    listaCursos_(ses.cursos).forEach(function (c) {
      var k = normCurso_(c);
      if (!mapa[k]) mapa[k] = { curso: c, estudiantes: 0 };
    });
  }
  return Object.keys(mapa).sort().map(function (k) { return mapa[k]; });
}

function estudiantesCurso_(ses, d) {
  exigirCurso_(ses, d.curso);
  var resp = todos_('Respuestas');
  return todos_('Estudiantes').filter(function (e) { return normCurso_(e.curso) === normCurso_(d.curso); })
    .sort(function (a, b) { return a.nombre < b.nombre ? -1 : 1; })
    .map(function (e) {
      var r = resp.filter(function (x) { return x.estudianteRut === e.rut && x.usuarioId === 'EST:' + e.rut; });
      var v = { rut: e.rut, nombre: e.nombre, sexo: e.sexo, curso: e.curso, respondidos: r.length };
      if (ses.rol === 'admin') {
        v.fechaNac = e.fechaNac; v.nombrePadre = e.nombrePadre; v.nombreMadre = e.nombreMadre; v.nombreTutor = e.nombreTutor;
      }
      return v;
    });
}

/** Política de retención: elimina auditoría y mensajes más antiguos que retencionMeses. */
function depurarDatos_(ses, d) {
  var meses = Number(config_('retencionMeses')) || 24;
  var lim = new Date(); lim.setMonth(lim.getMonth() - meses);
  var limTxt = Utilities.formatDate(lim, zona_(), 'yyyy-MM-dd');
  var antes = todos_('Auditoria').length;
  reescribir_('Auditoria', todos_('Auditoria').filter(function (a) { return String(a.fecha) >= limTxt; }));
  var borrados = antes - todos_('Auditoria').length;
  if (!d || !d.soloAuditoria) {
    var m0 = todos_('Mensajes').length;
    reescribir_('Mensajes', todos_('Mensajes').filter(function (m) { return String(m.fecha) >= limTxt; }));
    borrados += m0 - todos_('Mensajes').length;
  }
  auditar_(ses, 'depurar_datos', 'antes de ' + limTxt + ': ' + borrados);
  return { borrados: borrados, limite: limTxt };
}
