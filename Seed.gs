/**
 * Seed.gs — Contenido inicial basado en los manuales "Proyecto de vida 2026"
 * (estudiantes, docentes y asistentes, familias). Se carga solo si las hojas están vacías;
 * después todo es editable desde la plataforma.
 */

var LIKERT = ['Totalmente en desacuerdo', 'En desacuerdo', 'De acuerdo', 'Totalmente de acuerdo'];
var CERTEZA = ['Nada segura o seguro', 'Poco segura o seguro', 'Bastante segura o seguro', 'Muy segura o seguro'];

function b_(tipo, titulo, texto) { return { tipo: tipo, titulo: titulo || '', texto: texto || '' }; }
function pop_(titulo, texto, disparador, icono) { return { titulo: titulo, texto: texto, disparador: disparador || 'boton', icono: icono || '💡' }; }

function sembrarContenido_() {
  if (todos_('Sesiones').length || todos_('Cuestionarios').length) return;
  var t = ahora_();
  var S = [
    { n: 1, titulo: '¿Quién soy hoy y hacia dónde voy?', img: 'brujula',
      obj: 'Reconocer tu punto de partida y formular una primera imagen de tu futuro.',
      bloques: [
        b_('texto', 'Bienvenida', 'En estas cinco sesiones vas a pensar en lo que quieres para tu futuro y a tomar una decisión sobre dónde seguir tus estudios en la enseñanza media. <b>La decisión es tuya.</b> Tu profesor o profesora te acompañará y tu familia también participará. No hay respuestas correctas ni incorrectas.'),
        b_('caso', 'Camila, 13 años', 'Dibuja desde pequeña y pasa horas creando historietas. Su mamá quiere que estudie administración porque "da trabajo seguro". Camila siente que si elige artes la van a juzgar.<br><br><b>¿Qué le dirías a Camila? ¿Qué cosas de sí misma podría considerar?</b>'),
        b_('psicologia', 'Creer que puedes: la autoeficacia', 'Albert Bandura (1977) llamó <b>autoeficacia</b> a la confianza en la propia capacidad para lograr algo. Se construye cuando logras cosas pequeñas, cuando ves que personas parecidas a ti lo consiguen y cuando recibes apoyo realista.'),
        b_('psicologia', '"Todavía no": mentalidad de crecimiento', 'Carol Dweck (2006) distingue entre pensar que las capacidades son fijas ("no soy bueno para eso") y pensar que se pueden desarrollar ("todavía no lo domino"). Agrega "todavía" a tus dudas: <i>"todavía no sé qué quiero estudiar"</i>.'),
        b_('ejercicio', 'Ejercicio 1: Mi línea de vida', 'Dibuja una línea horizontal. Marca cinco hitos: dos del pasado, uno del presente y dos del futuro. En cada uno escribe un momento importante, una persona o una experiencia que te haya marcado y qué aprendiste.'),
        b_('ejercicio', 'Ejercicio 2: Yo en unos años más', '¿Cómo soy ahora? ¿Qué me gustaría ser a los 20, 40 y 60 años? ¿Qué características me ayudan y cuáles me pueden dificultar? ¿Qué puedo hacer concretamente para fortalecer lo que me ayuda?'),
        b_('ejercicio', 'Ejercicio 3: Todavía no', 'Escribe tres frases que comiencen con "todavía no sé…" o "todavía no puedo…". Al lado de cada una, escribe una acción pequeña para avanzar.'),
        b_('recuerde', 'Recuerda', 'Lo que piensas hoy puede cambiar, y eso también es parte de decidir bien.')
      ],
      pops: [pop_('Antes de empezar', '¿Qué te gustaría estar haciendo en cinco años? Piénsalo un momento antes de seguir.', 'abrir', '🧭'),
        pop_('¿No tienes sueños claros?', 'No pasa nada. Piensa en qué te gusta hacer en tu tiempo libre: ahí suele haber pistas.', 'boton', '💭')] },
    { n: 2, titulo: 'Mis intereses, habilidades y valores', img: 'estrella',
      obj: 'Identificar tus intereses (modelo RIASEC), tus habilidades y tus valores.',
      bloques: [
        b_('caso', 'Javiera, 14 años', 'Ayuda a su abuelo, que es mecánico, a reparar motores los fines de semana. Algunos compañeros dicen que la técnico-profesional "es para los que no sirven para estudiar". Javiera empieza a dudar.<br><br><b>¿Qué información le falta? ¿Qué prejuicios podría estar escuchando?</b>'),
        b_('psicologia', 'Seis tipos de intereses (Holland, 1997)', '<b>R</b> Realista: construir, reparar, herramientas · <b>I</b> Investigador: investigar y resolver problemas · <b>A</b> Artístico: crear con dibujo, música, escritura o diseño · <b>S</b> Social: ayudar y enseñar · <b>E</b> Emprendedor: liderar y proponer proyectos · <b>C</b> Convencional: organizar información y datos.<br><br>Un perfil es una <b>orientación, no una etiqueta</b>.'),
        b_('ejercicio', 'Ejercicio 4 y 5: Mapa y perfil de intereses', 'Responde el cuestionario "Mapa de intereses" en esta plataforma: calcula tu perfil de tres letras automáticamente.'),
        b_('ejercicio', 'Ejercicio 6: Me gusta, se me da, me importa', 'Completa una tabla con al menos tres ejemplos en cada columna.'),
        b_('ejercicio', 'Ejercicio 7: Mis fortalezas y mi experiencia de logro', 'Escribe tres fortalezas, tres aspectos para mejorar y una vez en que lograste algo que te propusiste.')
      ],
      pops: [pop_('Perfiles parecidos', 'Si tus letras tienen puntajes muy parecidos, significa que tienes intereses amplios. ¡No es un error!', 'boton', '🌈')] },
    { n: 3, titulo: 'Información y decisiones', img: 'lupa',
      obj: 'Conocer las modalidades, distinguir información confiable y reconocer sesgos.',
      bloques: [
        b_('caso', 'Matías, 13 años', 'Todos sus amigos irán a un mismo liceo y él quiere estar con ellos. Cuando visita otro establecimiento con programa deportivo y electivos, descubre que le interesa más de lo que pensaba.<br><br><b>¿Qué trampa de la mente aparece en su idea inicial?</b>'),
        b_('psicologia', 'Pensamiento rápido y lento (Kahneman, 2011)', 'El pensamiento rápido actúa casi sin darnos cuenta; el lento compara, revisa y pregunta. Para decidir sobre tu futuro conviene activar el <b>pensamiento lento</b>.<br><br>Trampas: <b>anclaje</b>, <b>disponibilidad</b>, <b>confirmación</b>, <b>aversión a la pérdida</b> e <b>influencia social</b>.'),
        b_('psicologia', 'Pensamiento crítico', 'Antes de creer un dato pregúntate: ¿quién lo publica?, ¿de dónde viene?, ¿está actualizado?'),
        b_('ejercicio', 'Ejercicio 8: Detective de información', 'Busca "Buscador de establecimientos Mineduc", entra al sitio oficial y completa la ficha de dos establecimientos que te interesen: nombre, modalidad, comuna, qué ofrece y un dato confirmado.'),
        b_('enlace', 'Buscador de establecimientos (Mineduc)', 'https://www.mime.mineduc.cl/'),
        b_('ejercicio', 'Ejercicio 9: Trampas de la mente', 'Responde el cuestionario "Trampas de la mente" en esta plataforma.')
      ],
      pops: [pop_('Las tres preguntas', '¿Quién publica la información? ¿De dónde viene el dato? ¿Está actualizado?', 'boton', '🔎')] },
    { n: 4, titulo: 'Comparar y planificar', img: 'balanza',
      obj: 'Comparar tres opciones con criterios propios y formular un plan anticipando obstáculos.',
      bloques: [
        b_('caso', 'Diego, 13 años', 'Vive a casi una hora del liceo que más le interesa. Le preocupa levantarse temprano y el costo del traslado.<br><br><b>¿Cómo podría incluir la distancia en su comparación sin descartar lo que le interesa?</b>'),
        b_('psicologia', 'Balance decisional (Janis y Mann, 1977)', 'Anota ventajas y desventajas de cada opción y decide qué criterios son más importantes para ti (1 a 3). Las metas funcionan mejor si son concretas y si anticipas obstáculos: <i>"si ocurre X, entonces haré Y"</i> (Gollwitzer, 1999).'),
        b_('ejercicio', 'Ejercicio 10: Balance de tres opciones', 'Criterios: me interesa lo que se estudia · aprendo lo que quiero · distancia y traslado · horarios · ambiente y compañeros · lo que dice mi familia · lo que me permite hacer después.'),
        b_('ejercicio', 'Ejercicio 11: Requisitos y plazos', 'Revisa en la información oficial los requisitos y fechas de tu primera opción. Verifica las fechas vigentes en admisionescolar.cl.'),
        b_('enlace', 'Sistema de Admisión Escolar', 'https://www.admisionescolar.cl/'),
        b_('ejercicio', 'Ejercicio 12 y 13: Plan "si… entonces…" y meta concreta', 'Anticipa tres obstáculos y qué harás si aparecen. Escribe tu meta, lo que harás, la fecha de revisión y quién te puede ayudar.')
      ],
      pops: [pop_('Pocas opciones, mejor decisión', 'Comparar demasiadas alternativas paraliza (Schwartz, 2004). Por eso trabajamos con tres.', 'boton', '⚖️')] },
    { n: 5, titulo: 'Decido y me comprometo', img: 'bandera',
      obj: 'Tomar una decisión fundamentada, reflexionar sobre tu autonomía y comprometerte con un plan.',
      bloques: [
        b_('caso', 'Valentina, 14 años', 'Su hermana estudia en un liceo científico-humanista. Valentina quiere estudiar artes visuales, pero su familia espera que siga el mismo camino.<br><br><b>¿Cómo podría explicar sus razones? ¿Qué parte de la decisión es suya?</b>'),
        b_('psicologia', 'Autodeterminación (Deci y Ryan, 2000)', 'Nos comprometemos más con una decisión cuando la sentimos <b>propia</b> (autonomía), creemos que podemos lograrla (competencia) y sentimos apoyo (pertenencia).'),
        b_('ejercicio', 'Ejercicio 14: Revisión de mi autonomía', 'Responde el cuestionario "Revisión de mi autonomía".'),
        b_('ejercicio', 'Ejercicio 15: Carta a mí mismo/a en cinco años', 'Escribe una carta breve: qué esperas, qué decisión tomaste y qué le dirías a tu yo de hoy. Guárdala.'),
        b_('recuerde', 'Recuerda', 'Tus intereses importan. Las opiniones de otros también, pero la decisión es tuya. Pedir ayuda es una buena decisión.')
      ],
      pops: [pop_('Tu plan', 'Un plan con tres pasos y fechas se cumple mucho más que una intención general.', 'boton', '🚩')] },
    { n: 6, titulo: 'Las tres modalidades y mi camino', img: 'camino',
      obj: 'Conocer la enseñanza científico-humanista, técnico-profesional y artística, y las rutas después de 4° medio.',
      bloques: [
        b_('texto', 'Científico-humanista', 'Formación amplia en lenguaje, matemática, ciencias, historia e idiomas; mejor preparación para las pruebas de acceso (PAES); electivos para profundizar.'),
        b_('texto', 'Técnico-profesional', 'Título técnico de nivel medio, prácticas en terreno y continuidad hacia IP, CFT o universidad.'),
        b_('texto', 'Artística', 'Especialidad en artes visuales, música, danza o teatro; talleres y portafolio para academias y carreras artísticas.'),
        b_('texto', 'Lo que el Colegio Marina de Chile te aporta', 'Enseñanza científico-humanista con enfoque humanista, orientación vocacional, convivencia y apoyo psicosocial, aprendizajes deportivos y artísticos, y en 3° y 4° medio una <b>malla personalizada</b> con 3 asignaturas diferenciadas (18 horas semanales).'),
        b_('texto', 'Rutas después de 4° medio', 'Universidad · Instituto profesional · Centro de formación técnica · Academias · Escuelas militares y policiales · Mundo laboral. Todas son válidas si son coherentes con lo que quieres lograr.'),
        b_('ejercicio', 'Ejercicio 16 a 18', 'Dibuja tu ruta hasta los 25 años, completa tu plan si-entonces para la educación superior y elige tres asignaturas diferenciadas con una razón para cada una.'),
        b_('enlace', 'DEMRE: pruebas de acceso', 'https://demre.cl/'),
        b_('enlace', 'Mi Futuro: carreras e instituciones', 'https://www.mifuturo.cl/'),
        b_('recuerde', 'Importante', 'Ninguna modalidad cierra puertas. Lo que cambia es el orden en que se avanza y el tipo de preparación.')
      ], pops: [] },
    { n: 1, aud: 'familias', titulo: 'Cómo acompañar la decisión de su hijo o hija', img: 'familia',
      obj: 'Apoyar un proceso de decisión autónomo, informado y con respaldo familiar.',
      bloques: [
        b_('texto', 'Por qué importa', 'Su hijo o hija de 8° básico elegirá dónde continuar la enseñanza media. El colegio acompaña con 5 sesiones; la familia es clave para que la decisión sea <b>propia, informada y con apoyo</b>.'),
        b_('psicologia', 'El estilo que más ayuda', 'El estilo <b>autoritativo</b> combina límites y expectativas claras con calidez y escucha (Maccoby y Martin, 1983). Favorece la autonomía y el compromiso.'),
        b_('ejercicio', 'Tarea 1 (sesión 1): Encuesta F1', 'Responda la encuesta F1 en esta plataforma: cuánto conoce los intereses de su hijo o hija.'),
        b_('ejercicio', 'Tarea 2 (sesión 2): Conversaciones 1 y 2', '¿Qué le gusta hacer? ¿En qué es bueno o buena? ¿Qué le importa? Escuche sin corregir y comparta una experiencia propia de decisión.'),
        b_('ejercicio', 'Tarea 3 (sesión 3): Entrevista a un adulto', 'Ayúdele a entrevistar a un adulto cercano sobre su camino de estudios o trabajo: qué eligió, qué le sirvió y qué cambiaría.'),
        b_('ejercicio', 'Tarea 4 (sesión 4): Balance en familia', 'Revisen juntos el balance de tres opciones: distancia, costos, intereses y lo que cada opción permite hacer después.'),
        b_('ejercicio', 'Tarea 5 (sesión 5): F2 y carta de apoyo', 'Responda la encuesta F2 y escriba una breve carta de apoyo a su hijo o hija.'),
        b_('recuerde', 'Recuerde', 'Escuche antes de opinar. Comparta información confiable (admisionescolar.cl, mifuturo.cl). La decisión es de su hijo o hija, con su apoyo.')
      ], pops: [pop_('Una idea para hoy', 'Pregunte: "¿qué es lo más importante para ti en un liceo?" y escuche la respuesta completa.', 'abrir', '🏡')] },
    { n: 0, aud: 'docentes', titulo: 'Guía de facilitación para docentes y asistentes', img: 'guia',
      obj: 'Conducir 5 sesiones de 75 minutos que orienten la decisión sin imponerla.',
      bloques: [
        b_('texto', 'Estructura', 'Cada sesión combina teoría breve, ejercicios y experiencias de vida. Encuestas: E1 (sesión 1), E2 (sesión 3), E3 (sesión 5) para estudiantes; F1 y F2 para familias. Use temporizador visible y 5 minutos de contingencia; si falta tiempo, priorice el producto principal.'),
        b_('texto', 'Roles', 'Docente conductor: conduce, facilita y deriva. Asistente de la educación: apoya lectura y escritura, materiales, grupos pequeños y asistencia. Orientación/Convivencia: recibe derivaciones. UTP: consolida E1, E2 y E3.'),
        b_('texto', 'Manejo del aula', 'Inicie con un acuerdo de convivencia, use preguntas abiertas, respete a quien no quiera compartir y evite comparaciones públicas.'),
        b_('recuerde', 'Protocolo de derivación', 'Derive a Orientación o Convivencia Escolar ante presión familiar intensa, angustia significativa, ausencia de apoyo adulto, aislamiento o cambios marcados de conducta. No intente resolverlo solo.'),
        b_('texto', 'Análisis de proyección (§9)', 'Compare E1, E2 y E3 en cuatro indicadores (1 a 4): claridad del proyecto, conocimiento de opciones, autonomía, certeza y plan. Este análisis orienta; no clasifica. La plataforma los calcula automáticamente.'),
        b_('recuerde', 'Confidencialidad', 'Las respuestas son de uso interno del equipo y se rigen por la Ley 21.719 de protección de datos personales.')
      ], pops: [pop_('Acompañar, no decidir', 'Ante "¿qué liceo me conviene?", devuelva la pregunta: "¿qué es lo más importante para ti en un liceo?"', 'boton', '🧑‍🏫')] }
  ];
  var ids = {};
  insertarVarios_('Sesiones', S.map(function (s) {
    var id = nuevoId_('S');
    ids[(s.aud || 'estudiantes') + s.n] = id;
    return { id: id, baseId: '', numero: s.n, titulo: s.titulo, objetivo: s.obj, audiencia: s.aud || 'estudiantes', cursos: '',
      estado: 'publicada', bloques: s.bloques, emergentes: s.pops, imagen: s.img, autorId: 'sistema', autorNombre: 'Coordinación de Segundo Ciclo', actualizado: t };
  }));

  var riasecItems = ['Armar o arreglar cosas con mis manos', 'Investigar cómo funcionan las cosas', 'Crear dibujos, música, textos o diseños',
    'Ayudar a otras personas', 'Convencer a otros de una idea', 'Organizar información, listas o datos', 'Trabajar con máquinas, herramientas o equipos',
    'Resolver problemas difíciles', 'Expresar ideas de forma creativa', 'Trabajar en equipo', 'Liderar un proyecto', 'Seguir normas claras y un orden',
    'Trabajar al aire libre o con herramientas', 'Hacer experimentos de ciencia', 'Imaginar cosas nuevas', 'Enseñar o explicar algo a otros',
    'Proponer emprendimientos o iniciativas', 'Trabajar con números y registros precisos'].map(function (tx, i) {
    return { id: 'a' + (i + 1), texto: tx, grupo: 'RIASEC'[i % 6] };
  });

  var Q = [
    { codigo: 'E1', titulo: 'Encuesta 1: Mi proyecto de vida hoy', ses: 'estudiantes1', desc: 'Marca la alternativa que mejor te describe. No hay respuestas correctas ni incorrectas.', p: [
      { id: 'q1', n: 1, tipo: 'likert', texto: 'Tengo claro qué me gustaría estudiar o hacer después de 8° básico.', opciones: LIKERT, obligatoria: true },
      { id: 'q2', n: 2, tipo: 'likert', texto: 'Sé qué cosas me gustan hacer y en qué soy bueno o buena.', opciones: LIKERT, obligatoria: true },
      { id: 'q3', n: 3, tipo: 'likert', texto: 'Me imagino cómo voy a estar en cinco años.', opciones: LIKERT, obligatoria: true },
      { id: 'q4', n: 4, tipo: 'multiple', texto: '¿Cuáles de estas modalidades de enseñanza media conoces? (puedes marcar más de una)',
        opciones: ['Científico-humanista', 'Técnico-profesional', 'Artística', 'No conozco ninguna'], cuenta: ['Científico-humanista', 'Técnico-profesional', 'Artística'] },
      { id: 'q5', n: 5, tipo: 'unica', texto: '¿Qué es lo que más influye en tu decisión?', opciones: ['Mis propios intereses', 'Mi familia', 'Mis amigos', 'Lo que hacen otros', 'Otra razón'],
        valores: [4, 2.5, 1.5, 1, 2.5], obligatoria: true },
      { id: 'q6', n: 6, tipo: 'abierta', texto: '¿Qué te gustaría ser o hacer dentro de 10 años?' },
      { id: 'q7', n: 7, tipo: 'abierta', texto: '¿Qué cosas crees que te pueden ayudar a lograr tus metas?' },
      { id: 'q8', n: 8, tipo: 'abierta', texto: '¿Qué cosas crees que te pueden dificultar lograrlas?' }] },
    { codigo: 'RIASEC', titulo: 'Mapa de intereses (Ejercicio 4)', ses: 'estudiantes2', desc: 'Indica cuánto te gustaría hacer cada actividad.', p: [
      { id: 'q1', n: 1, tipo: 'escala', texto: '¿Cuánto te gustaría hacer cada actividad?', opciones: ['Nada', 'Poco', 'Bastante', 'Mucho'], items: riasecItems, obligatoria: true }] },
    { codigo: 'E2', titulo: 'Encuesta 2: Mi avance', ses: 'estudiantes3', desc: 'Responde según lo que sabes hoy.', p: [
      { id: 'q1', n: 1, tipo: 'abierta', texto: 'Menciona dos modalidades de enseñanza media y una diferencia entre ellas.' },
      { id: 'q2', n: 2, tipo: 'unica', texto: '¿Dónde puedes revisar información oficial sobre los establecimientos?',
        opciones: ['En una red social', 'En el Buscador de establecimientos del Ministerio de Educación', 'En un anuncio del liceo', 'No lo sé'],
        correcta: 'En el Buscador de establecimientos del Ministerio de Educación', obligatoria: true },
      { id: 'q3', n: 3, tipo: 'unica', texto: '¿Qué tan segura o seguro te sientes para tomar tu decisión?', opciones: CERTEZA, escala: true, obligatoria: true },
      { id: 'q4', n: 4, tipo: 'abierta', texto: '¿Qué información te falta para decidir?' },
      { id: 'q5', n: 5, tipo: 'abierta', texto: '¿Qué paso o acción quieres dar antes de la próxima sesión?' }] },
    { codigo: 'TRAMPAS', titulo: 'Trampas de la mente (Ejercicio 9)', ses: 'estudiantes3', desc: 'Elige la trampa que aparece en cada situación.', p: [
      { id: 'q1', n: 1, tipo: 'pareo', texto: '¿Qué trampa aparece en cada situación?',
        opciones: ['A · Anclaje', 'B · Disponibilidad', 'C · Confirmación', 'D · Aversión a la pérdida', 'E · Influencia social'],
        items: [
          { id: 't1', texto: '"Mi primo estudió en ese liceo y le fue muy bien, así que ese es el mejor para mí."' },
          { id: 't2', texto: '"El primer liceo que visité me pareció el mejor, así que ya no miré otros."' },
          { id: 't3', texto: '"Solo leo los comentarios que dicen que mi liceo favorito es excelente."' },
          { id: 't4', texto: '"Si cambio de liceo, pierdo a mis amigos, así que prefiero quedarme aunque no me guste."' },
          { id: 't5', texto: '"Todos en mi curso van a postular a la misma modalidad, así que yo también."' }],
        correcta: { t1: 'B · Disponibilidad', t2: 'A · Anclaje', t3: 'C · Confirmación', t4: 'D · Aversión a la pérdida', t5: 'E · Influencia social' }, obligatoria: true }] },
    { codigo: 'E3', titulo: 'Encuesta 3: Mi decisión', ses: 'estudiantes5', desc: 'Cuéntanos tu decisión y tu plan.', p: [
      { id: 'q1', n: 1, tipo: 'abierta', texto: 'Mi primera preferencia de continuidad de estudios es:', obligatoria: true },
      { id: 'q2', n: 2, tipo: 'abierta', texto: 'Mi segunda preferencia es:' },
      { id: 'q3', n: 3, tipo: 'abierta', texto: 'Las razones principales de mi decisión son:', obligatoria: true },
      { id: 'q4', n: 4, tipo: 'unica', texto: '¿Qué tan segura o seguro estás de tu decisión?', opciones: CERTEZA, escala: true, obligatoria: true },
      { id: 'q5', n: 5, tipo: 'abierta', texto: '¿Qué apoyo necesitas para llevar adelante tu decisión?' },
      { id: 'q6', n: 6, tipo: 'pasos', texto: 'Mi plan de acción en tres pasos, con fechas:', pasos: 3 }] },
    { codigo: 'AUTONOMIA', titulo: 'Revisión de mi autonomía (Ejercicio 14)', ses: 'estudiantes5', desc: 'No hay respuestas buenas o malas.', p: [
      { id: 'q1', n: 1, tipo: 'unica', texto: '¿Por qué eliges esta opción?', opciones: ['Principalmente porque me interesa a mí', 'Porque me interesa y lo conversé con mi familia',
        'Por lo que esperan otras personas', 'Porque eligen lo mismo mis amigos', 'Todavía no lo sé'], valores: [4, 4, 1.5, 1, 2], obligatoria: true },
      { id: 'q2', n: 2, tipo: 'abierta', texto: '¿Esta decisión la tomo yo? ¿Qué parte depende de otros?' },
      { id: 'q3', n: 3, tipo: 'abierta', texto: '¿Qué me daría confianza para cumplir mi plan?' },
      { id: 'q4', n: 4, tipo: 'abierta', texto: '¿Quién de mi familia o de mi entorno me puede apoyar y cómo?' },
      { id: 'q5', n: 5, tipo: 'abierta', texto: '¿Qué razón nueva me haría cambiar de opinión?' }] },
    { codigo: 'F1', aud: 'familias', titulo: 'Encuesta F1: Conociendo los intereses de mi hijo o hija', ses: 'familias1', desc: 'Inicio del proceso (sesión 1).', p: [
      { id: 'q1', n: 1, tipo: 'likert', texto: 'Conozco los intereses de mi hijo o hija.', opciones: LIKERT, obligatoria: true },
      { id: 'q2', n: 2, tipo: 'likert', texto: 'Hemos conversado sobre qué le gustaría estudiar en la enseñanza media.', opciones: LIKERT, obligatoria: true },
      { id: 'q3', n: 3, tipo: 'multiple', texto: '¿Qué modalidades de enseñanza media conoce?', opciones: ['Científico-humanista', 'Técnico-profesional', 'Artística', 'Ninguna'],
        cuenta: ['Científico-humanista', 'Técnico-profesional', 'Artística'] },
      { id: 'q4', n: 4, tipo: 'unica', texto: '¿Quién cree usted que debe tomar la decisión?', opciones: ['Mi hijo o hija, con nuestro apoyo', 'La familia en conjunto', 'Principalmente la familia'],
        valores: [4, 3, 1.5], obligatoria: true },
      { id: 'q5', n: 5, tipo: 'abierta', texto: '¿Qué le gusta hacer a su hijo o hija y en qué es bueno o buena?' },
      { id: 'q6', n: 6, tipo: 'abierta', texto: '¿Qué le preocupa de esta decisión?' }] },
    { codigo: 'F2', aud: 'familias', titulo: 'Encuesta F2: Balance del acompañamiento', ses: 'familias1', desc: 'Cierre del proceso (sesión 5).', p: [
      { id: 'q1', n: 1, tipo: 'likert', texto: 'Acompañé a mi hijo o hija durante el proceso.', opciones: LIKERT, obligatoria: true },
      { id: 'q2', n: 2, tipo: 'likert', texto: 'Conozco su decisión y sus razones.', opciones: LIKERT, obligatoria: true },
      { id: 'q3', n: 3, tipo: 'likert', texto: 'Me siento capaz de apoyar su plan.', opciones: LIKERT, obligatoria: true },
      { id: 'q4', n: 4, tipo: 'abierta', texto: '¿Qué apoyo concreto dará a su hijo o hija?' },
      { id: 'q5', n: 5, tipo: 'abierta', texto: 'Carta de apoyo breve para su hijo o hija:' }] }
  ];
  insertarVarios_('Cuestionarios', Q.map(function (q) {
    return { id: nuevoId_('Q'), codigo: q.codigo, titulo: q.titulo, descripcion: q.desc, audiencia: q.aud || 'estudiantes',
      sesionId: ids[q.ses] || '', preguntas: q.p, habilitado: 'false', cursos: '', actualizado: t };
  }));
}
