/**
 * Importacion.gs — Resultados de encuestas aplicadas en papel.
 *
 * 1) matrizCuestionario_: define las columnas de la planilla (una fila por persona)
 *    y genera instrucciones para que una IA traspase las encuestas escaneadas a la matriz.
 * 2) importarResultados_: lee la matriz completada, valida cada valor, calcula los
 *    puntajes con las mismas reglas que las respuestas en línea y las registra (origen "manual").
 */

function columnasMatriz_(c) {
  var cols = [{ clave: 'RUT', titulo: 'RUT', ayuda: 'RUT del estudiante con guion, ej. 12345678-5 (obligatorio)' },
    { clave: 'NOMBRE', titulo: 'NOMBRE (opcional)', ayuda: 'Solo para orientarse; no se usa para identificar' }];
  if (c.audiencia === 'familias') cols.push({ clave: 'PARENTESCO', titulo: 'PARENTESCO', ayuda: 'madre, padre o tutor (obligatorio)' });
  json_(c.preguntas, []).forEach(function (p) {
    var n = 'P' + p.n, ops = p.opciones || [];
    var numeradas = ops.map(function (o, i) { return (i + 1) + '=' + o; }).join(' · ');
    if (p.tipo === 'likert' || p.tipo === 'unica') cols.push({ clave: n, titulo: n + ' | ' + p.texto, ayuda: 'Un número: ' + numeradas, p: p });
    else if (p.tipo === 'multiple') ops.forEach(function (o, j) { cols.push({ clave: n + '_' + (j + 1), titulo: n + '_' + (j + 1) + ' | ' + o, ayuda: '1 si está marcada; vacío si no', p: p, op: o }); });
    else if (p.tipo === 'abierta') cols.push({ clave: n, titulo: n + ' | ' + p.texto, ayuda: 'Texto tal como lo escribió (vacío si no respondió)', p: p });
    else if (p.tipo === 'escala') (p.items || []).forEach(function (it, j) { cols.push({ clave: n + '_' + (j + 1), titulo: n + '_' + (j + 1) + ' | ' + it.texto, ayuda: 'Un número: ' + numeradas, p: p, item: it }); });
    else if (p.tipo === 'pareo') (p.items || []).forEach(function (it, j) { cols.push({ clave: n + '_' + (j + 1), titulo: n + '_' + (j + 1) + ' | ' + it.texto, ayuda: 'Una letra: ' + ops.join(' · '), p: p, item: it }); });
    else if (p.tipo === 'pasos') for (var i = 1; i <= (p.pasos || 3); i++) {
      cols.push({ clave: n + '_PASO' + i, titulo: n + '_PASO' + i + ' | Paso ' + i + ': qué voy a hacer', ayuda: 'Texto', p: p, sub: 'texto' + i });
      cols.push({ clave: n + '_FECHA' + i, titulo: n + '_FECHA' + i + ' | Fecha del paso ' + i, ayuda: 'DD-MM-AAAA', p: p, sub: 'fecha' + i });
    }
  });
  return cols;
}

function instruccionesIA_(c, cols) {
  return [
    'Actúa como asistente de tabulación de datos para el Colegio Marina de Chile.',
    'Te entregaré fotografías o escaneos de la encuesta "' + c.titulo + '" (código ' + c.codigo + ') respondida en papel.',
    'Traspasa cada encuesta a UNA FILA de una tabla con EXACTAMENTE estas columnas, en este orden:',
    '',
    cols.map(function (x) { return '- ' + x.titulo + '  →  ' + x.ayuda; }).join('\n'),
    '',
    'Reglas:',
    '1. Usa como encabezados exactamente los textos de la lista (lo que está antes de la flecha).',
    '2. Una fila por persona. No agregues columnas ni filas de totales.',
    '3. Para alternativas marcadas usa el NÚMERO de la alternativa (1 = primera opción). Si hay letras (a, b, c, d), a=1, b=2, c=3, d=4.',
    '4. Si una respuesta está en blanco, es ilegible o hay dos marcas, deja la celda VACÍA. Nunca inventes ni supongas datos.',
    '5. Copia las respuestas abiertas tal como están escritas, sin corregir ni resumir.',
    '6. El RUT va con guion y dígito verificador (ej. 12345678-5). Si no se lee con certeza, déjalo vacío y avísame.',
    '7. Al final, entrégame la tabla como archivo Excel (.xlsx) o CSV, y una lista de las celdas dudosas.',
    '',
    'Privacidad (Ley 21.719): estos datos son de menores de edad. Úsalos solo para esta tarea y no los conserves.'
  ].join('\n');
}

function matrizCuestionario_(ses, d) {
  var c = buscar_('Cuestionarios', 'id', d.id);
  if (!c) throw new Error('Cuestionario no encontrado.');
  var cols = columnasMatriz_(c);
  return { codigo: c.codigo, titulo: c.titulo, audiencia: c.audiencia,
    columnas: cols.map(function (x) { return { clave: x.clave, titulo: x.titulo, ayuda: x.ayuda }; }),
    instruccionesIA: instruccionesIA_(c, cols) };
}

function sinTildes_(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }

/** Convierte "2", "b", "B · Disponibilidad" o el texto de la opción en la opción válida. */
function opcionDesde_(valor, opciones) {
  var v = String(valor).trim();
  if (!v) return '';
  if (/^\d+$/.test(v) && opciones[Number(v) - 1]) return opciones[Number(v) - 1];
  if (/^[a-z]$/i.test(v)) {
    var porLetra = opciones.filter(function (o) { return o.charAt(0).toUpperCase() === v.toUpperCase() && /^[A-Z] ·/.test(o); })[0];
    if (porLetra) return porLetra;
    var idx = v.toLowerCase().charCodeAt(0) - 97;
    if (opciones[idx]) return opciones[idx];
  }
  var t = sinTildes_(v);
  return opciones.filter(function (o) { return sinTildes_(o) === t; })[0] || null;
}

function importarResultados_(ses, d) {
  var c = buscar_('Cuestionarios', 'id', d.id);
  if (!c) throw new Error('Cuestionario no encontrado.');
  var cols = columnasMatriz_(c);
  var porClave = {};
  cols.forEach(function (x) { porClave[x.clave] = x; });
  var preguntas = json_(c.preguntas, []);
  var existentes = {};
  todos_('Respuestas').forEach(function (r) { if (r.cuestionarioId === c.id) existentes[r.usuarioId] = r; });
  var nuevas = [], actualizadas = 0, omitidas = 0, errores = [];

  (d.filas || []).forEach(function (f, i) {
    var fila = i + 2, val = {};
    Object.keys(f).forEach(function (h) { val[String(h).split('|')[0].trim().toUpperCase()] = f[h]; });
    var rut = normRut_(val.RUT || '');
    if (!rut) { if (Object.keys(val).some(function (k) { return String(val[k]).trim(); })) errores.push('Fila ' + fila + ': RUT vacío o no válido.'); return; }
    var est = buscar_('Estudiantes', 'rut', rut);
    if (!est) { errores.push('Fila ' + fila + ': el RUT ' + rut + ' no está en la nómina.'); return; }
    if (!puedeVerEstudiante_(ses, rut)) { errores.push('Fila ' + fila + ': no tiene acceso al curso de ' + rut + '.'); return; }
    var usuarioId = 'EST:' + rut;
    if (c.audiencia === 'familias') {
      var par = sinTildes_(val.PARENTESCO || '');
      if (['madre', 'padre', 'tutor'].indexOf(par) < 0) { errores.push('Fila ' + fila + ': PARENTESCO debe ser madre, padre o tutor.'); return; }
      usuarioId = 'APO:' + rut + ':' + par;
    }
    var resp = {}, problemas = [];
    Object.keys(val).forEach(function (k) {
      var col = porClave[k], v = val[k];
      if (!col || !col.p || v === '' || v === null || v === undefined) return;
      var p = col.p, id = p.id;
      if (p.tipo === 'likert' || p.tipo === 'unica') {
        var o = opcionDesde_(v, p.opciones); if (o) resp[id] = o; else problemas.push(k);
      } else if (p.tipo === 'multiple') {
        if (/^(1|x|si|sí|s|true|verdadero)$/i.test(String(v).trim())) (resp[id] = resp[id] || []).push(col.op);
      } else if (p.tipo === 'abierta') {
        resp[id] = String(v).slice(0, 3000);
      } else if (p.tipo === 'escala') {
        var e = opcionDesde_(v, p.opciones); if (e) { resp[id] = resp[id] || {}; resp[id][col.item.id] = String(p.opciones.indexOf(e) + 1); } else problemas.push(k);
      } else if (p.tipo === 'pareo') {
        var m = opcionDesde_(v, p.opciones); if (m) { resp[id] = resp[id] || {}; resp[id][col.item.id] = m; } else problemas.push(k);
      } else if (p.tipo === 'pasos') {
        resp[id] = resp[id] || {};
        resp[id][col.sub] = /^fecha/.test(col.sub) ? (normFecha_(v) || String(v)) : String(v).slice(0, 1000);
      }
    });
    if (problemas.length) errores.push('Fila ' + fila + ' (' + rut + '): valores no reconocidos en ' + problemas.join(', ') + ' (se dejaron vacíos).');
    if (!Object.keys(resp).length) { errores.push('Fila ' + fila + ' (' + rut + '): sin respuestas.'); return; }
    var previa = existentes[usuarioId];
    if (previa && !previa._fila) { errores.push('Fila ' + fila + ' (' + rut + '): persona repetida en la matriz; se usó la primera fila.'); return; }
    if (previa && !d.sobrescribir) { omitidas++; return; }
    var reg = previa || { id: nuevoId_('R') };
    reg.cuestionarioId = c.id; reg.codigo = c.codigo; reg.usuarioId = usuarioId; reg.estudianteRut = rut; reg.curso = est.curso;
    reg.respuestas = resp; reg.puntajes = puntuar_(c.codigo, preguntas, resp); reg.fecha = ahora_(); reg.origen = 'manual';
    if (previa) { actualizar_('Respuestas', reg); actualizadas++; } else { nuevas.push(reg); existentes[usuarioId] = reg; }
  });
  insertarVarios_('Respuestas', nuevas);
  auditar_(ses, 'importar_resultados', c.codigo + ' nuevas=' + nuevas.length + ' act=' + actualizadas + ' omit=' + omitidas);
  return { nuevas: nuevas.length, actualizadas: actualizadas, omitidas: omitidas, errores: errores };
}
