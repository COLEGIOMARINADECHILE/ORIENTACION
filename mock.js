/*
 * Simulación local de google.script.run con datos 100 % ficticios.
 * Solo para revisar el diseño sin desplegar en Apps Script. No contiene datos reales.
 * Uso: ejecute dev/build-preview.ps1 y abra dev/preview.html.
 */
(function () {
  const ind = { claridad: 2.67, conocimiento: 3.25, autonomia: 2.5, certeza: 3 };
  const perfiles = {
    estudiante: { uid: 'EST:11111111-1', rol: 'estudiante', tipo: 'estudiante', nombre: 'Camila Ejemplo', cursos: ['8° A'], estudianteNombre: 'Camila Ejemplo', debeCambiar: true, consentimiento: true, permisos: ['sesiones','ejercicios','cuestionarios','resultados','retro','mensajes','muro'], perfilNombre: '' },
    madre: { uid: 'APO:11111111-1:madre', rol: 'apoderado', tipo: 'madre', nombre: 'Madre De Ejemplo', cursos: ['8° A'], estudianteNombre: 'Camila Ejemplo', debeCambiar: false, consentimiento: true, permisos: ['sesiones','ejercicios','cuestionarios','resultados','retro','mensajes','muro'], perfilNombre: '' },
    personal: { uid: 'PER:12345678-5', rol: 'admin', tipo: 'personal', nombre: 'Orientadora Ejemplo', cursos: [], estudianteNombre: '', debeCambiar: false, consentimiento: true, permisos: ['cursos.ver','todosLosCursos','sesiones.editar','sesiones.eliminar','materiales','cuestionarios.habilitar','cuestionarios.editar','resultados.cargar','reportes','analisis','mensajes','retro','retro.visibilidad','cursos.gestionar','usuarios','carga','config','auditoria'], todosLosCursos: true, perfilNombre: 'Administración' }
  };
  let yo = perfiles.estudiante;
  const sesiones = [
    { id: 's1', numero: 1, titulo: '¿Quién soy hoy y hacia dónde voy?', objetivo: 'Reconocer tu punto de partida y formular una primera imagen de tu futuro.', audiencia: 'estudiantes', estado: 'publicada', imagen: 'brujula', cursos: '', bloques: 8, emergentes: 2 },
    { id: 's2', numero: 2, titulo: 'Mis intereses, habilidades y valores', objetivo: 'Identificar tus intereses (RIASEC), habilidades y valores.', audiencia: 'estudiantes', estado: 'publicada', imagen: 'estrella', cursos: '', bloques: 5, emergentes: 1 },
    { id: 's3', numero: 3, titulo: 'Información y decisiones', objetivo: 'Conocer las modalidades y reconocer sesgos.', audiencia: 'estudiantes', estado: 'publicada', imagen: 'lupa', cursos: '', bloques: 6, emergentes: 1 },
    { id: 's4', numero: 4, titulo: 'Comparar y planificar', objetivo: 'Comparar tres opciones con criterios propios.', audiencia: 'estudiantes', estado: 'publicada', imagen: 'balanza', cursos: '', bloques: 6, emergentes: 1 },
    { id: 's5', numero: 5, titulo: 'Decido y me comprometo', objetivo: 'Tomar una decisión fundamentada.', audiencia: 'estudiantes', estado: 'publicada', imagen: 'bandera', cursos: '', bloques: 5, emergentes: 1 },
    { id: 's6', numero: 6, titulo: 'Las tres modalidades y mi camino', objetivo: 'Conocer las rutas después de 4° medio.', audiencia: 'estudiantes', estado: 'borrador', imagen: 'camino', cursos: '8° A', bloques: 9, emergentes: 0, baseId: 'x' }
  ];
  const cuestionarios = [
    { id: 'q1', codigo: 'E1', titulo: 'Encuesta 1: Mi proyecto de vida hoy', descripcion: 'Marca la alternativa que mejor te describe.', audiencia: 'estudiantes', sesionId: 's1', habilitado: true, cursos: '', nPreguntas: 8, respondido: true },
    { id: 'q2', codigo: 'RIASEC', titulo: 'Mapa de intereses (Ejercicio 4)', descripcion: 'Indica cuánto te gustaría hacer cada actividad.', audiencia: 'estudiantes', sesionId: 's2', habilitado: true, cursos: '8° A', nPreguntas: 1, respondido: false },
    { id: 'q3', codigo: 'TRAMPAS', titulo: 'Trampas de la mente (Ejercicio 9)', descripcion: 'Elige la trampa que aparece.', audiencia: 'estudiantes', sesionId: 's3', habilitado: false, cursos: '', nPreguntas: 1, respondido: false }
  ];
  const avisos = [
    { id: 'v1', texto: '¡Hola 8° A! Esta semana trabajamos la Sesión 2: traigan lápices de colores 🎨', fecha: '2026-10-27 09:10', deNombre: 'Profesora Jefe Ejemplo', deRol: 'docente', curso: '8° A', audiencia: 'estudiantes', likes: 14, meGusta: true },
    { id: 'v2', texto: 'Recordatorio para familias: la encuesta F1 está disponible en la plataforma.', fecha: '2026-10-24 18:00', deNombre: 'Orientadora Ejemplo', deRol: 'admin', curso: 'Todos los cursos', audiencia: 'familias', likes: 6, meGusta: false }
  ];
  const curso = {
    curso: '8° A', estudiantes: 32, promedios: ind, distribucion: { claridad: [3, 10, 14, 5], conocimiento: [1, 8, 15, 8], autonomia: [4, 12, 11, 5], certeza: [2, 9, 16, 5] },
    riasec: { R: 9, I: 14, A: 18, S: 20, E: 11, C: 8 }, influencia: { 'Mis propios intereses': 17, 'Mi familia': 9, 'Mis amigos': 4, 'Lo que hacen otros': 2 },
    modalidades: { 'Científico-humanista': 28, 'Técnico-profesional': 19, 'Artística': 11, 'No conozco ninguna': 2 }, certeza: { e2: 2.6, e3: 3.1 },
    participacion: { E1: 31, RIASEC: 29, E2: 27, TRAMPAS: 26, E3: 18, AUTONOMIA: 15 },
    alertas: [{ rut: '22222222-2', nombre: 'Diego Ejemplo', alertas: ['Certeza baja en la decisión final (E3).', 'Plan de acción incompleto.'] }],
    filas: ['Camila Ejemplo', 'Diego Ejemplo', 'Javiera Ejemplo', 'Matías Ejemplo', 'Valentina Ejemplo'].map((n, i) => ({ rut: '1111111' + i + '-1', nombre: n, primeraPreferencia: ['Liceo artístico', 'Técnico en electricidad', 'Científico-humanista', 'Liceo deportivo', 'Artes visuales'][i],
      indicadores: { claridad: 1.5 + i * .6, conocimiento: 2 + i * .4, autonomia: 3.5 - i * .5, certeza: 2 + (i % 3) }, perfil: ['A-S-I', 'R-I-C', 'I-S-A', 'S-E-R', 'A-E-S'][i], completados: 6 - i, alertas: i === 1 ? ['Plan de acción incompleto.'] : [] }))
  };
  const analisis = { existe: true, desactualizado: false, motor: 'reglas', version: 'v1.0-2026', fecha: '2026-10-27 10:00', generadoPorNombre: 'Orientadora Ejemplo',
    contenido: { resumen: 'Curso 8° A: 32 estudiantes, 31 con respuestas. Indicador más alto: Conocimiento de opciones (3.25/4); más bajo: Autonomía (2.5/4).', fortalezas: ['Conocimiento de opciones en nivel logrado (3.25/4).', 'Intereses predominantes: Social y Artístico.'], focos: ['Autonomía en desarrollo (2.5/4).'], alertas: ['1 estudiante(s) con alertas.'], recomendaciones: ['Trabajar en grupo la revisión de autonomía y el caso de Valentina.'], decisiones: ['Priorizar conversaciones individuales con los estudiantes en alerta.'], mensajeEstudiante: '', sugerenciasFamilia: 'Promover el estilo autoritativo.' } };
  const R = {
    perfil: () => yo,
    inicio: () => ({ perfil: yo, listaSesiones: sesiones, listaCuestionarios: cuestionarios, sesiones: 6, pendientes: 1, noLeidos: 2, avisos, cursos: [{ curso: '8° A', estudiantes: 32 }, { curso: '8° B', estudiantes: 30 }], estudiantes: 62 }),
    sesiones: () => sesiones, cuestionarios: () => cuestionarios, avisos: () => avisos, materiales: () => [{ id: 'm1', titulo: 'Presentación Sesión 1', descripcion: 'Diapositivas para la clase', tieneArchivo: true, mime: 'application/pdf', autorNombre: 'Profesora Jefe Ejemplo', fecha: '2026-10-20', audiencia: 'estudiantes', cursos: '8° A' }],
    sesion: () => ({ id: 's1', numero: 1, titulo: sesiones[0].titulo, objetivo: sesiones[0].objetivo, audiencia: 'estudiantes', imagen: 'brujula', autorNombre: 'Coordinación de Segundo Ciclo', actualizado: '2026-10-20 10:00',
      bloques: [{ tipo: 'caso', titulo: 'Camila, 13 años', texto: 'Dibuja desde pequeña y pasa horas creando historietas. <b>¿Qué le dirías a Camila?</b>' }, { tipo: 'psicologia', titulo: 'Creer que puedes: la autoeficacia', texto: 'Albert Bandura (1977) llamó <b>autoeficacia</b> a la confianza en la propia capacidad.' }, { tipo: 'ejercicio', titulo: 'Ejercicio 1: Mi línea de vida', texto: 'Marca cinco hitos: dos del pasado, uno del presente y dos del futuro.' }, { tipo: 'recuerde', titulo: 'Recuerda', texto: 'Lo que piensas hoy puede cambiar.' }],
      bloques: [].concat([{ id: 'x1', tipo: 'cuestionario', codigo: 'E1', titulo: 'Encuesta 1: Mi proyecto de vida hoy (E1)', texto: 'Parte A, B y C.' }, { id: 'x2', tipo: 'ejercicio', titulo: 'Ejercicio 1: Mi línea de vida', texto: 'Marque cinco hitos.', campos: ['Hito 1 (pasado)', 'Hito 2 (pasado)', 'Hito 3 (presente)'], foto: true, img: '/assets/estudiantes.webp', pie: 'Ejemplo de imagen en un paso' }, { id: 'x3', tipo: 'texto', titulo: 'Tabla de ejemplo', texto: '<table><thead><tr><th>Ámbito</th><th>Qué hace el colegio</th></tr></thead><tbody><tr><td>Estudios</td><td>Enseñanza científico-humanista</td></tr></tbody></table>' }]),
      misTrabajos: [{ id: 't1', bloqueId: 'x2', campos: { c0: 'Cuando aprendí a andar en bicicleta' }, texto: '', tieneImagen: false, fecha: '2026-10-27 10:00' }],
      emergentes: [{ titulo: '¿No tienes sueños claros?', texto: 'Piensa en qué te gusta hacer en tu tiempo libre.', disparador: 'boton', icono: '💭' }], materiales: [], cuestionarios: cuestionarios.slice(0, 1) }),
    hilos: () => yo.rol === 'admin' ? [{ hilo: 'H:EST:1', titulo: 'Camila Ejemplo', sub: 'Estudiante · 8° A', ultimo: '¿Puedo cambiar mi respuesta?', fecha: '2026-10-27 11:00', noLeidos: 2 }] : [{ hilo: 'H:' + yo.uid, titulo: 'Equipo de Orientación', sub: 'Profesor jefe · Orientación · UTP', ultimo: '¡Claro que sí!', fecha: '2026-10-27 11:05', noLeidos: 1 }],
    hilo: () => ({ titulo: yo.rol === 'admin' ? 'Camila Ejemplo' : 'Equipo de Orientación', sub: '', mensajes: [{ texto: 'Hola, ¿puedo cambiar mi respuesta de la E1?', fecha: '2026-10-27 11:00', deNombre: 'Camila Ejemplo', deRol: 'estudiante', propio: yo.rol !== 'admin' }, { texto: '¡Claro que sí! Mientras esté habilitada puedes editarla.', fecha: '2026-10-27 11:05', deNombre: 'Profesora Jefe Ejemplo', deRol: 'docente', propio: yo.rol === 'admin' }] }),
    misResultados: () => ({ indicadores: { indicadores: ind, niveles: { claridad: 'Logrado', conocimiento: 'Logrado', autonomia: 'Logrado', certeza: 'Logrado' }, riasec: { R: 6, I: 9, A: 11, S: 10, E: 7, C: 5 }, perfil: 'A-S-I' },
      retro: [{ autorNombre: 'Profesora Jefe Ejemplo', fecha: '2026-10-26', texto: 'Camila, me encantó tu línea de vida. Sigue explorando tu interés por el diseño.' }],
      propios: [{ codigo: 'E1', titulo: 'Encuesta 1', fecha: '2026-10-20', resultado: { titulo: 'Tu punto de partida', mensajes: ['Tienes bastante claridad sobre lo que te gusta.'] }, detalle: [{ n: 1, texto: 'Tengo claro qué me gustaría estudiar.', tipo: 'likert', valor: 'De acuerdo' }] }] }),
    cursos: () => [{ curso: '8° A', estudiantes: 32 }, { curso: '8° B', estudiantes: 30 }],
    reporteCurso: () => curso, analisis: () => analisis, historialAnalisis: () => [],
    usuarios: () => [{ id: 'PER:1', rut: '12345678-5', nombre: 'Orientadora Ejemplo', rol: 'admin', activo: true, cursos: '' }, { id: 'EST:1', rut: '11111111-1', nombre: 'Camila Ejemplo', rol: 'estudiante', activo: true, debeCambiar: true, curso: '8° A' }],
    config: () => ({ nombreColegio: 'Colegio Marina de Chile', ciudad: 'Concepción', unidad: 'UTP', anio: '2026', apoderadoVeRetro: 'false', iaIncluirAbiertas: 'true', retencionMeses: '24', contactoPrivacidad: 'utp@colegio.cl', urlPlataforma: 'https://script.google.com/macros/s/EJEMPLO/exec', iaConfigurada: false, iaProveedor: 'anthropic' }),
    perfiles: () => ({ perfiles: [{ id: 'admin', nombre: 'Administración', base: 'funcionario', permisos: [], fijo: true, sistema: true, usuarios: 1 }, { id: 'docente', nombre: 'Docente', base: 'funcionario', permisos: ['cursos.ver','reportes'], sistema: true, usuarios: 4 }, { id: 'Pab12', nombre: 'Orientador/a', base: 'funcionario', permisos: ['cursos.ver','todosLosCursos','reportes','analisis'], sistema: false, usuarios: 0 }, { id: 'alumno', nombre: 'Alumno/a', base: 'alumno', permisos: ['sesiones','ejercicios'], sistema: true, usuarios: 60 }, { id: 'adulto', nombre: 'Adulto responsable', base: 'adulto', permisos: ['sesiones'], sistema: true, usuarios: 90 }], catalogo: { funcionario: [['cursos.ver','Ver cursos'],['todosLosCursos','Todos los cursos'],['reportes','Reportes'],['analisis','Análisis']], alumno: [['sesiones','Ver sesiones'],['ejercicios','Ejercicios']], adulto: [['sesiones','Ver manual']] } }),
    matrizCuestionario: () => ({ codigo: 'E1', titulo: 'Encuesta 1', columnas: [{ clave: 'RUT', titulo: 'RUT', ayuda: 'con guion' }, { clave: 'P1', titulo: 'P1 | Tengo claro…', ayuda: '1=…' }], instruccionesIA: 'Actúa como asistente de tabulación…' }),
    auditoria: () => [{ fecha: '2026-10-27 10:00', usuario: 'PER:12345678-5', rol: 'admin', accion: 'login', detalle: 'personal' }]
  };
  function run(handlers) {
    return new Proxy({}, { get(_, fn) {
      if (fn === 'withSuccessHandler') return h => run(Object.assign({}, handlers, { ok: h }));
      if (fn === 'withFailureHandler') return h => run(Object.assign({}, handlers, { fail: h }));
      return (...args) => setTimeout(() => {
        let out;
        if (fn === 'infoPublica') out = JSON.stringify({ colegio: 'Colegio Marina de Chile', ciudad: 'Concepción', unidad: 'Unidad Técnica Pedagógica', anio: '2026', contactoPrivacidad: 'utp@colegio.cl', retencionMeses: 24, urlPlataforma: 'https://script.google.com/macros/s/EJEMPLO/exec', imagenes: window.MOCK_IMG || {} });
        else if (fn === 'login') { yo = perfiles[args[2] === 'adulto' ? 'madre' : args[2]] || perfiles.estudiante; out = { ok: true, token: 't', perfil: yo }; }
        else if (fn === 'logout') out = { ok: true };
        else if (fn === 'api') { const f = R[args[0].accion]; out = JSON.stringify({ ok: true, data: f ? f(args[0].datos) : {} }); }
        handlers.ok && handlers.ok(out);
      }, 120);
    } });
  }
  window.google = { script: { run: run({}) } };
})();
