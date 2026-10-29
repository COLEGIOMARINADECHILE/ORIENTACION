/**
 * Seed.gs — Contenido de los manuales "Proyecto de vida 2026" (Coordinación de Segundo Ciclo).
 *
 * Reproduce el manual de estudiantes completo, para trabajar sin imprimir:
 *  - los ejercicios se responden en la misma guía (campos de texto y foto del dibujo),
 *  - las encuestas aparecen en su lugar y muestran el resultado si ya se respondieron.
 * Incluye además la guía de facilitación para docentes y el manual para familias.
 *
 * sembrarContenido_() crea lo que falta y actualiza las sesiones de sistema (autor "sistema").
 * Las sesiones editadas por la administración no se tocan, salvo que se fuerce.
 */

var LIKERT = ['Totalmente en desacuerdo', 'En desacuerdo', 'De acuerdo', 'Totalmente de acuerdo'];
var CERTEZA = ['Nada segura o seguro', 'Poco segura o seguro', 'Bastante segura o seguro', 'Muy segura o seguro'];

function b_(id, tipo, titulo, texto) { return { id: id, tipo: tipo, titulo: titulo || '', texto: texto || '' }; }
function ej_(id, titulo, texto, campos, foto) { return { id: id, tipo: 'ejercicio', titulo: titulo, texto: texto || '', campos: campos || [], foto: !!foto }; }
function q_(id, codigo, titulo, texto) { return { id: id, tipo: 'cuestionario', codigo: codigo, titulo: titulo, texto: texto || '' }; }
function enl_(id, titulo, url) { return { id: id, tipo: 'enlace', titulo: titulo, texto: url }; }
function pop_(titulo, texto, disparador, icono) { return { titulo: titulo, texto: texto, disparador: disparador || 'boton', icono: icono || '💡' }; }
function tabla_(cab, filas) {
  return '<table><thead><tr>' + cab.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
    filas.map(function (f) { return '<tr>' + f.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
}

function sesionesManual_() {
  return [
    /* ======================= ESTUDIANTES ======================= */
    { n: 0, img: 'guia', titulo: 'Bienvenida: antes de empezar',
      obj: 'Conocer cómo funciona este proceso y cómo piensa nuestra mente cuando decide.',
      bloques: [
        b_('i1', 'texto', 'Bienvenido o bienvenida', 'En las próximas cinco sesiones usted va a pensar en lo que quiere para su futuro y va a tomar una decisión sobre dónde seguir sus estudios en la enseñanza media. <b>La decisión es suya.</b> Su profesor o profesora lo va a acompañar, y su familia también va a participar.<br><br>No hay respuestas correctas ni incorrectas. Lo que piensa hoy puede cambiar, y eso también es parte de decidir bien.'),
        b_('i2', 'texto', 'Cómo leer esta guía', 'Esta guía tiene cuatro tipos de recuadros:<ul><li><b>Lo que dice la psicología:</b> ideas de la ciencia que le ayudarán a decidir mejor.</li><li><b>Experiencia de vida:</b> historias de otros estudiantes (casos ilustrativos, no son personas reales) para pensar en situaciones parecidas.</li><li><b>Ejercicio:</b> actividades para completar. Escriba con calma y con sus propias palabras: puede responder aquí mismo y guardar.</li><li><b>Recuerde:</b> ideas clave para no olvidar.</li></ul>'),
        b_('i3', 'psicologia', '¿Por qué importa decidir bien?', '<b>Una decisión tiene consecuencias.</b> Elegir la modalidad y el liceo influye en las materias que va a estudiar, en el ambiente de su día, en las personas que conocerá y en las oportunidades que tendrá después, en la educación superior o en el trabajo.<br><br><b>Decidir bien no es lo mismo que tener suerte.</b> Russo y Schoemaker (2002) explican que una decisión puede ser buena aunque el resultado sea malo, y al revés. Lo que sí podemos controlar es el <b>proceso</b>: buscar información confiable, considerar nuestros intereses y valores, comparar opciones y tener un plan.<br><br><b>No necesita saberlo todo.</b> Simon (1955) explica que nadie puede considerar toda la información posible. Por eso conviene buscar una opción "suficientemente buena" para uno mismo, comparando pocas alternativas con criterios claros.'),
        ej_('i4', 'Pregunta para pensar', '¿Qué decisión importante ha tomado en su vida? ¿Qué le ayudó a tomarla?', ['Una decisión importante que tomé', 'Lo que me ayudó a tomarla']),
        b_('i5', 'psicologia', '¿Cómo piensa su mente cuando decide?', '<b>Dos formas de pensar.</b> El psicólogo Daniel Kahneman (2011) explica que pensamos de dos maneras. El <b>pensamiento rápido</b> actúa solo, casi sin darnos cuenta; sirve para lo cotidiano, pero puede equivocarse cuando la decisión es importante. El <b>pensamiento lento</b> es más deliberado: compara, revisa y pregunta. Para decidir sobre su futuro, conviene activar el pensamiento lento.<br><br>Estas son algunas <b>trampas de la mente</b> que suelen aparecer al elegir un liceo o una modalidad:<ul><li><b>Anclaje:</b> quedarse con la primera opción que vio y no comparar con otras.</li><li><b>Disponibilidad:</b> pensar que algo es lo mejor porque escuchó una historia muy famosa, aunque sea un solo caso.</li><li><b>Confirmación:</b> buscar solo la información que apoya lo que ya piensa.</li><li><b>Aversión a la pérdida:</b> quedarse en un lugar que no le gusta, solo por miedo a perder algo.</li><li><b>Influencia social:</b> elegir lo que eligen sus amigos, sin revisar si le sirve a usted.</li></ul>Reconocer estas trampas es el primer paso para evitarlas. Las practicará en la sesión 3.'),
        b_('i6', 'psicologia', 'Creer que puede: la autoeficacia', 'El psicólogo Albert Bandura (1977) llamó <b>autoeficacia</b> a la confianza en la propia capacidad para lograr algo. Esta confianza se construye cuando logra cosas pequeñas, cuando ve que personas parecidas a usted lo consiguen y cuando recibe apoyo realista de sus cercanos.'),
        ej_('i7', 'Pregunta para pensar', '¿Qué cosa difícil ha logrado antes? Esa experiencia es una prueba de que usted sí puede avanzar.', ['Algo difícil que logré']),
        b_('i8', 'psicologia', '"Todavía no": la mentalidad de crecimiento', 'La psicóloga Carol Dweck (2006) distingue entre pensar que las capacidades son fijas ("no soy bueno para eso") y pensar que se pueden desarrollar ("todavía no lo domino"). Quienes creen que pueden mejorar enfrentan mejor los desafíos.<br><br>Cuando se sienta frustrado o frustrada, agregue "todavía no" a la frase. <i>"No sé qué quiero estudiar"</i> pasa a ser <i>"todavía no sé qué quiero estudiar"</i>. Ese pequeño cambio abre espacio para seguir explorando.')
      ],
      pops: [pop_('Bienvenida a su travesía', 'No hay respuestas correctas ni incorrectas. Avance a su ritmo: puede guardar y volver cuando quiera.', 'abrir', '🧭')] },

    { n: 1, img: 'brujula', titulo: '¿Quién soy hoy y hacia dónde voy?',
      obj: 'Reconocer su punto de partida y formular una primera imagen de su futuro.',
      bloques: [
        b_('s1a', 'caso', 'Camila, 13 años', 'Dibuja desde pequeña y pasa horas creando historietas. Su mamá quiere que estudie administración porque "da trabajo seguro". Camila siente que si elige artes la van a juzgar.'),
        ej_('s1b', 'Para conversar', '¿Qué le diría usted a Camila? ¿Qué cosas de sí misma podría considerar?', ['Lo que le diría a Camila', 'Lo que Camila podría considerar de sí misma']),
        q_('s1c', 'E1', 'Encuesta 1: Mi proyecto de vida hoy (E1)', 'Parte A. Mi proyecto · Parte B. Mis opciones · Parte C. Preguntas abiertas.'),
        ej_('s1d', 'Ejercicio 1: Mi línea de vida', 'Dibuje una línea horizontal en una hoja. Marque cinco hitos: dos del pasado, uno del presente y dos del futuro. En cada uno escriba un momento importante, una persona o una experiencia que le haya marcado. Puede escribirlos aquí y subir una foto de su dibujo.',
          ['Hito 1 (pasado): año o edad, qué pasó y qué aprendí', 'Hito 2 (pasado): año o edad, qué pasó y qué aprendí', 'Hito 3 (presente): qué pasa y qué aprendo', 'Hito 4 (futuro): edad y qué me gustaría que pasara', 'Hito 5 (futuro): edad y qué me gustaría que pasara'], true),
        ej_('s1e', 'Ejercicio 2: Ficha "Yo en unos años más"', 'Complete esta ficha en silencio y con calma.',
          ['I. Características que tengo y me gustan', 'I. Características que tengo y no me gustan', 'II. A los 20 años me gustaría ser', 'II. A los 40 años me gustaría ser', 'II. A los 60 años me gustaría ser',
            'II. ¿Hay relación entre estas metas? ¿Lo que logro a los 20 me ayuda a llegar a los 60?', 'III. ¿Qué características actuales me ayudan a lograr mis sueños?', 'III. ¿Qué características actuales me pueden dificultar el logro de mis sueños?',
            'III. ¿Qué puedo hacer concretamente para mantener y fortalecer lo que me ayuda?', 'III. ¿Qué puedo hacer concretamente para mejorar lo que me dificulta?']),
        ej_('s1f', 'Ejercicio 3: Todavía no', 'Escriba tres frases que comiencen con "todavía no sé…" o "todavía no puedo…". Al lado de cada una, escriba una acción pequeña para avanzar.',
          ['Frase 1 con "todavía no"', 'Acción pequeña para avanzar (1)', 'Frase 2 con "todavía no"', 'Acción pequeña para avanzar (2)', 'Frase 3 con "todavía no"', 'Acción pequeña para avanzar (3)']),
        b_('s1g', 'recuerde', 'Recuerde', 'Lo que piensa hoy puede cambiar, y eso también es parte de decidir bien.')
      ],
      pops: [pop_('Antes de empezar', '¿Qué le gustaría estar haciendo en cinco años? Piénselo un momento antes de seguir.', 'abrir', '🧭'),
        pop_('¿No tiene sueños claros?', 'No pasa nada. Piense en qué le gusta hacer en su tiempo libre: ahí suele haber pistas.', 'boton', '💭')] },

    { n: 2, img: 'estrella', titulo: 'Mis intereses, habilidades y valores',
      obj: 'Identificar sus intereses (modelo RIASEC), sus habilidades y sus valores.',
      bloques: [
        b_('s2a', 'caso', 'Javiera, 14 años', 'Ayuda a su abuelo, que es mecánico, a reparar motores los fines de semana. En el colegio, algunos compañeros dicen que la técnico-profesional "es para los que no sirven para estudiar". Javiera empieza a dudar.'),
        ej_('s2b', 'Para conversar', '¿Qué información le falta a Javiera? ¿Qué prejuicios podría estar escuchando? ¿Qué cosas le gustan a usted que los demás no ven?', ['La información que le falta a Javiera', 'Los prejuicios que podría estar escuchando', 'Lo que me gusta a mí y los demás no ven']),
        b_('s2c', 'psicologia', 'Seis tipos de intereses (Holland, 1997)', 'El psicólogo John Holland propone que los intereses se agrupan en seis tipos. Las personas se sienten más cómodas en ambientes que coinciden con sus intereses:<ul><li><b>R (Realista):</b> construir, reparar o trabajar con herramientas y equipos.</li><li><b>I (Investigador):</b> entender cómo funcionan las cosas, investigar y resolver problemas.</li><li><b>A (Artístico):</b> crear con dibujo, música, escritura o diseño.</li><li><b>S (Social):</b> ayudar, enseñar y trabajar con personas.</li><li><b>E (Emprendedor):</b> liderar, convencer y proponer proyectos.</li><li><b>C (Convencional):</b> organizar información, datos y tareas con orden.</li></ul>Un perfil de intereses es una <b>orientación, no una etiqueta</b>. Se combina con sus habilidades y valores para decidir.'),
        q_('s2d', 'RIASEC', 'Ejercicio 4 y 5: Mapa y perfil de intereses', 'Lea cada actividad e indique cuánto le gustaría hacerla. La plataforma cuenta sus puntos en cada grupo (máximo 12) y le muestra sus tres letras con más puntaje. Si hay empate, usted decide cuál letra lo describe mejor.'),
        ej_('s2e', 'Ejercicio 6: Me gusta, se me da, me importa', 'Complete con al menos tres ejemplos en cada columna.', ['Me gusta (tres ejemplos)', 'Se me da bien (tres ejemplos)', 'Me importa (tres ejemplos)']),
        ej_('s2f', 'Ejercicio 7: Mis fortalezas y mi experiencia de logro', '', ['Fortaleza 1', 'Fortaleza 2', 'Fortaleza 3', 'Aspecto para mejorar 1', 'Aspecto para mejorar 2', 'Aspecto para mejorar 3', 'Una vez que logré algo que me propuse (mi experiencia de logro)'])
      ],
      pops: [pop_('Perfiles parecidos', 'Si sus letras tienen puntajes muy parecidos, significa que tiene intereses amplios. ¡No es un error!', 'boton', '🌈')] },

    { n: 3, img: 'lupa', titulo: 'Información y decisiones',
      obj: 'Conocer las modalidades, distinguir información confiable y reconocer sesgos.',
      bloques: [
        b_('s3a', 'caso', 'Matías, 13 años', 'Juega fútbol en el club de su barrio. Todos sus amigos irán a un mismo liceo y él quiere estar con ellos. Cuando visita otro establecimiento con un programa deportivo y de electivos, descubre que le interesa más de lo que pensaba.'),
        ej_('s3b', 'Para conversar', '¿Qué trampa de la mente aparece en la idea inicial de Matías? ¿Qué le ayudó a revisar su decisión?', ['La trampa de la mente que aparece', 'Lo que le ayudó a revisar su decisión']),
        q_('s3c', 'E2', 'Encuesta 2: Mi avance (E2)', 'Responda según lo que sabe hoy.'),
        b_('s3d', 'psicologia', 'Pensamiento crítico', 'No toda la información tiene el mismo valor. Antes de creer un dato, pregúntese: <b>¿quién lo publica?, ¿de dónde viene?, ¿está actualizado?</b> Esta forma de pensar se llama <b>pensamiento crítico</b> y le servirá toda la vida.'),
        ej_('s3e', 'Ejercicio 8: Detective de información', '1. Busque en internet la frase exacta "Buscador de establecimientos Mineduc" y entre al sitio oficial del Ministerio de Educación.<br>2. Busque dos establecimientos que le interesen y complete la ficha.',
          ['Establecimiento 1 · Nombre', 'Establecimiento 1 · Modalidad', 'Establecimiento 1 · Comuna o dirección', 'Establecimiento 1 · Qué ofrece y me interesa', 'Establecimiento 1 · Un dato que confirmé en la fuente oficial', 'Establecimiento 1 · ¿Quién publica la información?',
            'Establecimiento 2 · Nombre', 'Establecimiento 2 · Modalidad', 'Establecimiento 2 · Comuna o dirección', 'Establecimiento 2 · Qué ofrece y me interesa', 'Establecimiento 2 · Un dato que confirmé en la fuente oficial', 'Establecimiento 2 · ¿Quién publica la información?']),
        enl_('s3f', 'Buscador de establecimientos (Mineduc)', 'https://www.mime.mineduc.cl/'),
        q_('s3g', 'TRAMPAS', 'Ejercicio 9: Trampas de la mente', 'Lea cada situación y elija la trampa que aparece: A) Anclaje · B) Disponibilidad · C) Confirmación · D) Aversión a la pérdida · E) Influencia social. Al responder verá la pauta.')
      ],
      pops: [pop_('Las tres preguntas', '¿Quién publica la información? ¿De dónde viene el dato? ¿Está actualizado?', 'boton', '🔎')] },

    { n: 4, img: 'balanza', titulo: 'Comparar y planificar',
      obj: 'Comparar tres opciones con criterios propios y formular un plan anticipando obstáculos.',
      bloques: [
        b_('s4a', 'caso', 'Diego, 13 años', 'Vive a casi una hora del liceo que más le interesa. Le preocupa levantarse temprano y el costo del traslado.'),
        ej_('s4b', 'Para conversar', '¿Cómo podría Diego incluir la distancia en su comparación sin descartar lo que le interesa? ¿Qué plan "si… entonces…" le serviría?', ['Cómo incluir la distancia', 'Un plan "si… entonces…" para Diego']),
        b_('s4c', 'psicologia', 'Balance decisional y metas concretas', 'Janis y Mann (1977) proponen comparar opciones con un <b>balance decisional</b>: anotar ventajas y desventajas de cada opción y decidir qué criterios son más importantes para usted. Así la decisión se apoya en razones, no solo en impresiones.<br><br>Las metas funcionan mejor si son <b>concretas</b>: qué quiero lograr, cuándo y cómo. Además, anticipar obstáculos aumenta mucho la probabilidad de cumplir un plan. Por eso conviene escribir frases del tipo <i>"si ocurre X, entonces haré Y"</i> (Gollwitzer, 1999).'),
        ej_('s4d', 'Ejercicio 10: Balance decisional de tres opciones', 'Escriba tres opciones que esté considerando. Para cada criterio, anote su importancia de 1 (poca) a 3 (mucha) y cómo se cumple en cada opción.',
          ['Opción 1', 'Opción 2', 'Opción 3', 'Me interesa lo que se estudia · importancia (1-3) y cómo se cumple en cada opción', 'Me permite aprender lo que quiero · importancia y opciones', 'Distancia y traslado · importancia y opciones',
            'Horarios y tiempo para mí · importancia y opciones', 'Ambiente y compañeros · importancia y opciones', 'Lo que dice mi familia · importancia y opciones', 'Lo que me permite hacer después · importancia y opciones',
            'Ventajas principales de cada opción', 'Desventajas principales de cada opción'], true),
        ej_('s4e', 'Ejercicio 11: Requisitos y plazos', 'Revise en la información oficial del establecimiento que más le interesa los requisitos y plazos. Verifique las fechas vigentes en admisionescolar.cl.', ['Requisitos que debo cumplir', 'Fecha límite importante', 'Dónde consulté la información']),
        enl_('s4f', 'Sistema de Admisión Escolar', 'https://www.admisionescolar.cl/'),
        ej_('s4g', 'Ejercicio 12: Mi plan "si… entonces…"', 'Anticipe tres obstáculos y escriba qué hará si aparecen.', ['1. Si … entonces …', '2. Si … entonces …', '3. Si … entonces …']),
        ej_('s4h', 'Ejercicio 13: Mi meta concreta', '', ['Mi meta', 'Lo que voy a hacer para lograrla', 'Fecha en que la voy a revisar', 'Quién me puede ayudar'])
      ],
      pops: [pop_('Pocas opciones, mejor decisión', 'Comparar demasiadas alternativas paraliza (Schwartz, 2004). Por eso trabajamos con tres.', 'boton', '⚖️')] },

    { n: 5, img: 'bandera', titulo: 'Decido y me comprometo',
      obj: 'Tomar una decisión fundamentada, reflexionar sobre su autonomía y comprometerse con un plan.',
      bloques: [
        b_('s5a', 'caso', 'Valentina, 14 años', 'Su hermana mayor estudia en un liceo científico-humanista y tiene buenas notas. Valentina quiere estudiar artes visuales, pero su familia espera que siga el mismo camino. Ella no sabe cómo conversarlo.'),
        ej_('s5b', 'Para conversar', '¿Cómo podría Valentina explicar sus razones a su familia? ¿Qué parte de la decisión es suya?', ['Cómo podría explicar sus razones', 'Qué parte de la decisión es suya']),
        q_('s5c', 'E3', 'Encuesta 3: Mi decisión (E3)', 'Su primera y segunda preferencia, sus razones, su seguridad y su plan de acción.'),
        b_('s5d', 'psicologia', 'Autodeterminación (Deci y Ryan, 2000)', 'La teoría de la autodeterminación señala que nos comprometemos más con una decisión cuando la sentimos <b>propia</b> (autonomía), cuando creemos que podemos lograrla (competencia) y cuando sentimos que tenemos apoyo (pertenencia).'),
        q_('s5e', 'AUTONOMIA', 'Ejercicio 14: Revisión de mi autonomía', 'Responda por escrito estas preguntas. No hay respuestas buenas o malas.'),
        ej_('s5f', 'Ejercicio 15: Carta a mí mismo o a mí misma en cinco años', 'Escriba una carta breve. Puede contar qué espera, qué decisión tomó y qué le diría a su yo de hoy. Quedará guardada aquí para leerla más adelante.', ['Querido o querida yo del futuro:']),
        ej_('s5g', 'Mi plan personal', 'Tres pasos, con fecha y el apoyo que necesita. Compártalo con su familia.', ['Paso 1: qué voy a hacer · fecha · qué apoyo necesito', 'Paso 2: qué voy a hacer · fecha · qué apoyo necesito', 'Paso 3: qué voy a hacer · fecha · qué apoyo necesito']),
        b_('s5h', 'recuerde', 'Recuerde', 'Sus intereses importan. Las opiniones de otros también, pero la decisión es suya.<br>Pedir ayuda es una buena decisión.<br>Puede cambiar de opinión y ajustar su plan. Eso también es parte de decidir bien.')
      ],
      pops: [pop_('Su plan', 'Un plan con tres pasos y fechas se cumple mucho más que una intención general.', 'boton', '🚩')] },

    { n: 6, img: 'camino', titulo: 'Las tres modalidades y lo que el colegio le aporta',
      obj: 'Conocer la enseñanza científico-humanista, técnico-profesional y artística, y cómo el colegio lo acompaña.',
      bloques: [
        b_('s6a', 'texto', 'Beneficios de la modalidad científico-humanista', '<ul><li><b>Formación amplia.</b> Ofrece una base en lenguaje, matemática, ciencias, historia e idiomas. Eso le sirve si todavía no tiene clara su carrera.</li><li><b>Más alternativas al postular.</b> Es la modalidad que mejor prepara para las pruebas de acceso a la educación superior, y en la mayoría de las carreras universitarias es la base de referencia.</li><li><b>Electivos para profundizar.</b> Puede elegir ramos de interés (por ejemplo, biología, historia, artes o economía) y así ir acercándose a una carrera.</li><li><b>Pensamiento crítico y lectura.</b> Se desarrollan habilidades para analizar textos, argumentar y resolver problemas, muy valoradas en carreras de todas las áreas.</li></ul><b>Ejemplo:</b> Sofía no sabía si quería estudiar psicología o derecho. Eligió científico-humanista con electivo de ciencias sociales. En tercero medio descubrió que le gustaba investigar, y sus electivos le permitieron llegar mejor preparada a la carrera que eligió.'),
        b_('s6b', 'texto', '¿Para qué sirve la educación técnico-profesional?', '<ul><li><b>Título técnico de nivel medio.</b> Al terminar cuarto medio, usted tiene una especialidad reconocida. Puede trabajar en esa área si lo desea.</li><li><b>Prácticas en terreno.</b> Aprende en talleres, laboratorios o empresas, lo que facilita entrar al mundo laboral con experiencia real.</li><li><b>Continuidad de estudios.</b> Puede seguir en un instituto profesional o un CFT para obtener un título técnico de nivel superior, o postular a la universidad.</li><li><b>Preparación para la vida adulta.</b> Se aprende a trabajar en equipo, cumplir plazos y resolver problemas prácticos.</li></ul><b>Ejemplo:</b> Matías estudia electricidad. Durante sus prácticas en una empresa de mantención, se dio cuenta de que le gustaba la gestión de proyectos. Después de cuarto medio, trabajó un año y luego postuló a un programa de técnico superior en administración de obras.'),
        b_('s6c', 'texto', '¿Para qué sirve la educación artística?', '<ul><li><b>Especialidad creativa.</b> Se forma en una disciplina concreta: artes visuales, música, danza o teatro, con talleres y proyectos de creación.</li><li><b>Portafolio y experiencia.</b> Muestra un trabajo real (obras, presentaciones, grabaciones) que sirve para postular a academias, escuelas y carreras artísticas o de diseño.</li><li><b>Formación general completa.</b> Sigue cursando las asignaturas generales, lo que mantiene abiertas otras opciones.</li><li><b>Disciplina y constancia.</b> Exige práctica sostenida, trabajo en equipo y presentación pública.</li></ul><b>Ejemplo:</b> Diego tocaba guitarra desde niño. En su liceo artístico formó una banda, grabó sus primeras canciones y, al terminar cuarto medio, postuló a una escuela de música con su portafolio.'),
        b_('s6d', 'recuerde', 'Importante', 'Ninguna modalidad cierra puertas. Lo que cambia es el orden en que se avanza y el tipo de preparación que se recibe. Verifique siempre los requisitos vigentes en los sitios oficiales (por ejemplo, demre.cl para las pruebas y mifuturo.cl para la información de carreras e instituciones).'),
        b_('s6e', 'texto', 'Lo que el Colegio Marina de Chile puede aportarle', 'Nuestro colegio tiene un Proyecto Educativo Institucional (PEI 2024–2027). Su enseñanza media es <b>científico-humanista</b>; las otras modalidades se cursan en otros establecimientos.<br><br><b>Nuestro sello:</b> el colegio forma personas para la <b>continuidad de estudios superiores</b>, con <b>autonomía, compromiso y constancia</b>, <b>solidarias y responsables</b> en lo social y en el medio ambiente, y con <b>aprendizajes deportivos y artísticos</b>.<br><br>' +
          tabla_(['Ámbito', 'Qué puede hacer el colegio por usted', 'Qué puede hacer usted'], [
            ['Estudios', 'Enseñanza científico-humanista con un enfoque humanista, centrado en el estudiante, con aprendizajes que se conectan con la vida real.', 'Preguntar, participar y pedir apoyo cuando algo no quede claro.'],
            ['Proyecto de vida y orientación', 'Orientación educacional, vocacional y profesional: asesoría para su proyecto de vida, visitas de instituciones de educación superior y apoyo en el egreso.', 'Asistir a las instancias de orientación y llevar preguntas concretas.'],
            ['Autonomía y responsabilidad', 'Un perfil de egreso que busca formar jóvenes autónomos, capaces de hacerse cargo de sus decisiones.', 'Asumir sus decisiones y compromisos día a día.'],
            ['Convivencia y bienestar', 'Encargada de convivencia escolar, profesor jefe con diálogo permanente y apoyo psicosocial.', 'Acercarse cuando necesite conversar o sienta que algo le pesa.'],
            ['Valores', 'Trabajo en los valores de respeto, responsabilidad, empatía y creatividad.', 'Vivirlos en la sala, con sus compañeros y en el liceo.'],
            ['Arte y deporte', 'Aprendizajes deportivos y artísticos como parte de la formación.', 'Explorar talleres y actividades que le interesen.'],
            ['Compromiso social y medioambiental', 'Formación para ser solidario y responsable con su comunidad y el medio ambiente.', 'Participar en iniciativas de su curso o del colegio.'],
            ['Identidad y cultura', 'Reconocimiento de la cultura de los pueblos originarios y de todas las culturas de la comunidad.', 'Compartir su historia y sus raíces.'],
            ['Recursos para aprender', 'Centro de Recursos para el Aprendizaje (CRA), recursos tecnológicos y asistentes de aula.', 'Usar estos recursos con responsabilidad.'],
            ['Familia', 'Espacios de comunicación y capacitación para apoderados.', 'Contar en casa lo que está pensando y lo que necesita.']])),
        b_('s6f', 'psicologia', 'Por qué esto le sirve', 'Una persona decide mejor cuando tiene información, apoyo y confianza en sus capacidades (Bandura, 1977). Su colegio existe para entregarle esos tres elementos. Pedir ayuda no es una señal de debilidad: es una decisión inteligente.'),
        b_('s6g', 'texto', 'Cómo le ayudamos, año a año', tabla_(['Etapa', 'Lo que le ofrece el colegio', 'Lo que puede hacer usted'], [
            ['1° y 2° medio', 'Proyecto de vida, exploración de intereses y habilidades, actividades deportivas y artísticas, y acompañamiento del profesor jefe.', 'Probar actividades nuevas y anotar lo que disfruta.'],
            ['3° medio', 'Malla personalizada con tres asignaturas diferenciadas, asesoría en la elección y visitas de instituciones de educación superior.', 'Elegir sus asignaturas con criterio y participar en las visitas.'],
            ['4° medio', 'Asesoría sobre pruebas externas, información de instituciones y mallas, apoyo en la inscripción y el egreso, y apoyo psicosocial.', 'Rendir las pruebas, postular y mantener su plan personal.']]) +
          '<br><b>Siempre disponibles:</b> el profesor jefe, la encargada de convivencia escolar, el orientador y el equipo psicosocial.'),
        b_('s6h', 'texto', 'Herramientas que se lleva al egresar', tabla_(['Herramienta', 'Cómo la desarrolla el colegio', 'Dónde le sirve'], [
            ['Pensamiento crítico y argumentación', 'Lectura especializada, filosofía, debate y electivos de argumentación.', 'Universidad, IP, escuelas militares y policiales, trabajo.'],
            ['Razonamiento matemático y científico', 'Matemática, biología, física y química, con problemas reales.', 'Carreras de ciencias, salud, ingeniería, técnicas y de servicio.'],
            ['Comunicación oral y escrita', 'Exposiciones, redacción y lectura comprensiva.', 'En todas las rutas.'],
            ['Idioma inglés', 'Formación general en inglés.', 'Estudios superiores, trabajo y academias internacionales.'],
            ['Expresión creativa', 'Asignaturas diferenciadas de artes, talleres y proyectos.', 'Academias, diseño, carreras artísticas.'],
            ['Trabajo en equipo y convivencia', 'Trabajo colaborativo, valores de respeto y empatía.', 'En todas las rutas.'],
            ['Autonomía y toma de decisiones', 'Sello de autonomía y proyecto de vida.', 'Todas las rutas.'],
            ['Responsabilidad y constancia', 'Gestión del tiempo y cumplimiento de plazos.', 'Todas las rutas.'],
            ['Ciudadanía, solidaridad y medio ambiente', 'Educación ciudadana y desafíos socioambientales.', 'Trabajo, servicio público y vida en comunidad.'],
            ['Vida saludable y disciplina física', 'Educación física y estilos de vida activos.', 'Escuelas militares y policiales, academias deportivas.'],
            ['Identidad y diversidad cultural', 'Cultura de los pueblos originarios y respeto por las creencias.', 'Todas las rutas y la vida en sociedad.'],
            ['Adaptabilidad y resiliencia', 'Creatividad, flexibilidad y manejo de la frustración.', 'Todas las rutas.'],
            ['Competencias digitales', 'Recursos tecnológicos, CRA y ciudadanía digital.', 'Estudios superiores y trabajo.']]) +
          '<br>Son competencias que se transfieren: aunque cambie de camino en el futuro, lo aprendido en el colegio le sigue sirviendo.'),
        enl_('s6i', 'DEMRE: pruebas de acceso', 'https://demre.cl/'),
        enl_('s6j', 'Mi Futuro: carreras e instituciones', 'https://www.mifuturo.cl/')
      ], pops: [] },

    { n: 7, img: 'camino', titulo: 'Mi camino después de cuarto medio',
      obj: 'Personalizar su malla en 3° y 4° medio y dibujar su ruta hasta los 25 años.',
      bloques: [
        b_('s7a', 'texto', 'Su malla personalizada en 3° y 4° medio', 'Además de las asignaturas de formación general, usted elige <b>3 asignaturas diferenciadas</b> de un grupo ofrecido por el colegio: 18 horas semanales que puede orientar hacia sus intereses y su proyecto de vida.<ul><li><b>Humanidades y ciencias sociales:</b> Filosofía Política, Estética, Taller de Literatura, Historia, Geografía o Economía y Sociedad.</li><li><b>Artes y educación física:</b> Artes Visuales, Audiovisuales y Multimediales; Creación y Composición Musical; Interpretación Musical; Danza; Teatro; Diseño y Arquitectura; Expresión Corporal; Ciencias del Ejercicio Físico y Deportivo.</li><li><b>Matemática y ciencias:</b> Probabilidades y Estadística, Pensamiento Computacional y Programación, Biología, Física, Química o Ciencias de la Salud.</li></ul>Cada año el colegio informa la oferta vigente.<br><br><b>Ejemplo:</b> Camila quería estudiar arquitectura y le gustaba dibujar. Eligió Diseño y Arquitectura, Artes Visuales y Física.'),
        ej_('s7b', 'Ejercicio 18: Mi malla personalizada', 'Revise su Mapa de intereses y sus fortalezas. Consulte en la UTP o con su orientador antes de decidir.',
          ['Área en que quisiera profundizar (humanidades, artes y educación física, o matemática y ciencias)', 'Asignatura 1 y una razón', 'Asignatura 2 y una razón', 'Asignatura 3 y una razón', '¿Qué habilidades desarrollo con estas tres asignaturas? ¿Cómo me acercan a mi proyecto de vida?', '¿Coincide con mi meta de los 25 años? Si no, ¿qué ajusto?']),
        b_('s7c', 'texto', 'Las rutas al egresar', '<ul><li><b>Universidad:</b> carreras profesionales de formación más larga. Se consideran las notas de enseñanza media y la PAES. <i>Sofía desarrolló argumentación y análisis de textos, lo que le ayudó a estudiar psicología.</i></li><li><b>Instituto profesional (IP):</b> carreras profesionales más breves y prácticas. <i>Matías avanzó en gestión de empresas con prácticas en empresas.</i></li><li><b>Centro de formación técnica (CFT):</b> carreras técnicas de nivel superior, más cortas. <i>Javiera eligió un CFT de enfermería.</i></li><li><b>Academias:</b> arte, música, danza, teatro o deporte; piden portafolio, audición o prueba práctica. <i>Diego postuló a una academia de música.</i></li><li><b>Escuelas militares y policiales:</b> enseñanza media completa y procesos de selección propios. <i>Tomás se preparó físicamente durante el último año.</i></li><li><b>Mundo laboral:</b> empleo, emprendimiento o trabajo y estudio a la vez. <i>Valentina trabajó en atención de público y luego estudió un curso técnico.</i></li></ul>Consulte siempre los requisitos y plazos vigentes con cada institución.'),
        ej_('s7d', 'Ejercicio 16: Dibujo mi ruta', 'Dibuje una línea de tiempo desde hoy hasta los 25 años (puede subir la foto de su dibujo). Revise su ruta con la pregunta: ¿cada paso me acerca a mi meta?',
          ['Cuarto medio: modalidad y liceo que elegí', 'Después de cuarto medio: ¿universidad, instituto, CFT o trabajo? ¿Qué carrera o especialidad?', 'Pruebas y postulación: ¿qué pruebas necesito y en qué fechas? (demre.cl)', 'Primer año de estudio: ¿qué me gustaría lograr?', 'Meta a los 25 años: ¿qué quiero estar haciendo?', '¿Cada paso me acerca a mi meta? Si no, ¿qué alternativa busco?'], true),
        ej_('s7e', 'Ejercicio 17: Plan si-entonces para la educación superior', 'Complete las frases.',
          ['Si quiero estudiar una carrera universitaria, entonces necesito rendir las pruebas de ___ y tener buenas notas en ___', 'Si prefiero una especialidad técnica, entonces puedo evaluar ___ (instituto o CFT) y revisar ___', 'Si necesito trabajar antes de estudiar, entonces puedo ___ y mantener mi meta de ___']),
        b_('s7f', 'texto', 'Glosario', '<ul><li><b>Proyecto de vida:</b> lo que quiero ser y hacer, junto con los pasos para lograrlo.</li><li><b>Autoeficacia:</b> confianza en que puedo lograr lo que me propongo.</li><li><b>Autonomía:</b> capacidad de decidir por mí mismo o por mí misma, con información.</li><li><b>Balance decisional:</b> comparar ventajas y desventajas de cada opción.</li><li><b>Metacognición:</b> pensar sobre cómo pienso y decido.</li><li><b>Modalidad:</b> tipo de formación de la enseñanza media (científico-humanista, técnico-profesional o artística).</li></ul>'),
        b_('s7g', 'recuerde', 'Recuerde', 'Sus intereses importan. Las opiniones de otros también, pero la decisión es suya. Pedir ayuda es una buena decisión. Puede cambiar de opinión y ajustar su plan.'),
        b_('s7h', 'texto', 'Referencias', '<small>Bandura (1977); Deci y Ryan (2000); Dweck (2006); Gollwitzer (1999); Holland (1997); Janis y Mann (1977); Kahneman (2011); Ramírez y Pizarro (2005), Valoras UC; Russo y Schoemaker (2002); Simon (1955); Aldeas Infantiles SOS, <i>Explorando el futuro</i>.</small>')
      ], pops: [] },

    /* ======================= FAMILIAS ======================= */
    { n: 1, aud: 'familias', img: 'familia', titulo: 'Cómo acompañar la decisión de su hijo o hija',
      obj: 'Apoyar un proceso de decisión autónomo, informado y con respaldo familiar.',
      bloques: [
        b_('f1', 'texto', 'Por qué importa', 'Su hijo o hija de 8° básico elegirá dónde continuar la enseñanza media. El colegio acompaña con 5 sesiones; la familia es clave para que la decisión sea <b>propia, informada y con apoyo</b>.'),
        b_('f2', 'psicologia', 'El estilo que más ayuda', 'El estilo <b>autoritativo</b> combina límites y expectativas claras con calidez y escucha (Maccoby y Martin, 1983). Favorece la autonomía y el compromiso. En la práctica: expectativas claras, escucha y espacio para que su hijo o hija decida.'),
        q_('f3', 'F1', 'Tarea 1 (sesión 1): Encuesta F1', 'Cuánto conoce la familia los intereses de su hijo o hija.'),
        ej_('f4', 'Tarea 2 (sesión 2): Conversaciones 1 y 2', 'Pregunte: ¿qué te gusta hacer? ¿En qué eres bueno o buena? ¿Qué te importa? Escuche sin corregir y comparta una experiencia propia de decisión.', ['Lo que le gusta hacer', 'En qué es bueno o buena', 'Lo que le importa', 'La experiencia que yo compartí']),
        ej_('f5', 'Tarea 3 (sesión 3): Entrevista a un adulto', 'Ayúdele a entrevistar a un adulto cercano sobre su camino de estudios o trabajo.', ['A quién entrevistamos', 'Qué eligió y por qué', 'Qué le sirvió', 'Qué cambiaría']),
        ej_('f6', 'Tarea 4 (sesión 4): Balance en familia', 'Revisen juntos el balance de tres opciones: distancia, costos, intereses y lo que cada opción permite hacer después.', ['Opciones que revisamos', 'Lo que más pesa para mi hijo o hija', 'Lo que nos preocupa como familia', 'Acuerdos a los que llegamos']),
        q_('f7', 'F2', 'Tarea 5 (sesión 5): Encuesta F2', 'Balance del acompañamiento y apoyo concreto.'),
        ej_('f8', 'Carta de apoyo', 'Escriba una breve carta de apoyo a su hijo o hija.', ['Querido hijo o querida hija:']),
        b_('f9', 'recuerde', 'Recuerde', 'Escuche antes de opinar. Comparta información confiable (admisionescolar.cl, mifuturo.cl). La decisión es de su hijo o hija, con su apoyo.')
      ], pops: [pop_('Una idea para hoy', 'Pregunte: "¿qué es lo más importante para ti en un liceo?" y escuche la respuesta completa.', 'abrir', '🏡')] },

    /* ======================= DOCENTES ======================= */
    { n: 0, aud: 'docentes', img: 'guia', titulo: 'Guía docente 1: propósito, marco y organización',
      obj: 'Conducir 5 sesiones de 75 minutos que orienten la decisión sin imponerla.',
      bloques: [
        b_('d1', 'texto', '1. Propósito y alcance', 'Proceso de <b>5 sesiones de 75 minutos</b> para que los estudiantes de 8° básico elijan su continuidad de estudios de manera <b>autónoma y responsable</b>, con el apoyo de su familia. El foco es <b>orientar la decisión, no imponerla</b>. Cada estudiante: conoce su punto de partida; comprende las opciones y sabe dónde verificar información; compara alternativas con criterios propios y anticipa obstáculos; toma una decisión fundamentada y la comunica a su familia.<br><br>Encuestas: E1, E2 y E3 para estudiantes; F1 y F2 para familias.'),
        b_('d2', 'psicologia', '2. Por qué importa tomar buenas decisiones', 'Russo y Schoemaker (2002) distinguen la <b>calidad de la decisión</b> del <b>resultado</b>: hay que enseñar a evaluar el proceso. Simon (1955): <b>racionalidad limitada</b>, buscar opciones "suficientemente buenas". Tversky y Kahneman (1974) y Kahneman (2011): los atajos mentales generan sesgos; estas decisiones necesitan pensamiento lento. Lo que se aprende a decidir hoy se usa toda la vida.'),
        b_('d3', 'texto', '3. Marco teórico para el equipo', '<ul><li><b>Proyección al futuro</b> (Nurmi, 1991): exploración → metas → planificación; no espere decisiones definitivas en la sesión 1. Steinberg (2008): funciones ejecutivas en maduración; proceso guiado y gradual.</li><li><b>Autoeficacia</b> (Bandura, 1977): experiencias de logro, vicarias, persuasión verbal y estados emocionales.</li><li><b>Mentalidad de crecimiento</b> (Dweck, 2006): ante "no sirvo para eso", pregunte "¿todavía no?".</li><li><b>RIASEC</b> (Holland, 1997): los intereses no determinan la modalidad; orientan.</li><li><b>Sesgos y balance decisional</b> (Janis y Mann, 1977; Schwartz, 2004: limitar a tres alternativas).</li><li><b>Metacognición</b> (Flavell, 1979) y <b>planes si… entonces…</b> (Gollwitzer, 1999).</li><li><b>Autonomía y familia</b> (Deci y Ryan, 2000; Maccoby y Martin, 1983): promover el estilo autoritativo.</li></ul>'),
        b_('d4', 'texto', '5.1 Roles', tabla_(['Rol', 'Responsabilidades principales'], [
          ['Docente conductor', 'Conducir las 5 sesiones, presentar la teoría, facilitar ejercicios, registrar observaciones y derivar casos.'],
          ['Asistente de la educación', 'Apoyar a estudiantes con dificultades de lectura o escritura, materiales, grupos pequeños y asistencia.'],
          ['Orientación o convivencia escolar', 'Recibir derivaciones, acompañar a estudiantes con presión intensa y participar en reuniones con familias.'],
          ['UTP', 'Coordinar calendario y consolidar resultados de E1, E2 y E3.'],
          ['Secretaría o administración', 'Registrar participación de familias, enviar comunicaciones y resguardar la confidencialidad.'],
          ['Inspectoría', 'Coordinar salas, computadores y traslados.']])),
        b_('d5', 'texto', '5.2 a 5.6 Organización', '<b>Calendario:</b> una sesión por semana (o dos por semana en 3 semanas). Antes de la sesión 1, habilite F1 para las familias. Entre sesiones, recuerde la tarea familiar. Después de la sesión 5, seguimiento individual a las dos semanas.<br><br><b>Tiempo:</b> 75 minutos como máximo, temporizador visible y 5 minutos de contingencia; si falta tiempo, priorice el producto principal.<br><b>Aula:</b> acuerdo de convivencia, preguntas abiertas, respetar a quien no quiera compartir, sin comparaciones públicas.<br><b>Plan B:</b> sin computadores, use información impresa; sin tiempo para E2 o E3, aplíquelas al inicio de la siguiente sesión; estudiante ausente, conversación breve.'),
        b_('d6', 'recuerde', '6. Rol del docente y protocolo de derivación', '<b>Acompañar, no decidir por el estudiante.</b> Ante "¿qué liceo me conviene?", devuelva la pregunta: "¿qué es lo más importante para ti en un liceo?".<br><b>Confidencialidad:</b> las respuestas son de uso interno del equipo (Ley 21.719).<br><b>Derive a Orientación o Convivencia Escolar</b> ante presión familiar intensa, angustia significativa, ausencia de apoyo adulto, aislamiento o cambios marcados de conducta. No intente resolverlo solo.')
      ], pops: [pop_('Acompañar, no decidir', 'Ante "¿qué liceo me conviene?", devuelva la pregunta: "¿qué es lo más importante para ti en un liceo?"', 'boton', '🧑‍🏫')] },

    { n: 1, aud: 'docentes', img: 'brujula', titulo: 'Guía docente 2: plan de las 5 sesiones y análisis',
      obj: 'Planificación detallada de cada sesión, instrumentos y análisis de proyección.',
      bloques: [
        b_('d7', 'texto', 'Sesión 1: ¿Quién soy hoy y hacia dónde voy?', tabla_(['Bloque', 'Tiempo', 'Actividad'], [['Inicio', '5 min', '¿Qué te gustaría estar haciendo en cinco años? Escuche 3 o 4 respuestas sin comentar.'], ['Teoría', '10 min', 'Proyección al futuro (Nurmi) y mentalidad de crecimiento (Dweck). Caso Camila o Matías.'], ['Encuesta E1', '12 min', 'En silencio.'], ['Mi línea de vida', '15 min', 'Cinco hitos.'], ['Yo en unos años más', '13 min', 'Ficha individual.'], ['Cierre', '10 min', '"Todavía no" y conversación en pares.'], ['Contingencia', '10 min', 'Reserva.']]) + '<br><b>Producto:</b> E1, línea de vida, ficha y frases. <b>Tarea familiar:</b> F1. <b>Nota:</b> si un estudiante dice "no tengo sueños", pregunte qué le gusta hacer en su tiempo libre.'),
        b_('d8', 'texto', 'Sesión 2: Intereses, habilidades y valores', tabla_(['Bloque', 'Tiempo', 'Actividad'], [['Inicio', '5 min', 'Revisión de la ficha de la sesión 1.'], ['Teoría', '10 min', 'Modelo RIASEC; el perfil es una orientación.'], ['Mapa de intereses', '20 min', 'Cuestionario RIASEC en la plataforma.'], ['Me gusta, se me da, me importa', '15 min', 'Tres ejemplos por columna.'], ['Experiencia de logro', '10 min', 'Base de la autoeficacia.'], ['Cierre', '15 min', 'Fortalezas y aspectos a mejorar; diversidad de perfiles.']]) + '<br><b>Tarea familiar:</b> conversaciones 1 y 2. <b>Nota:</b> perfiles con letras parecidas indican intereses amplios. Caso Javiera: prejuicios hacia la TP.'),
        b_('d9', 'texto', 'Sesión 3: Información y decisiones', tabla_(['Bloque', 'Tiempo', 'Actividad'], [['Teoría', '10 min', 'Tres modalidades; pensamiento rápido y lento.'], ['Encuesta E2', '8 min', 'Encuesta intermedia.'], ['Detective de información', '20 min', 'Buscador Mineduc y ficha de dos establecimientos.'], ['Trampas de la mente', '15 min', 'Cinco situaciones.'], ['Cierre', '12 min', 'Una pregunta por estudiante; elija tres para la sesión 4.']]) + '<br><b>Tarea familiar:</b> entrevista a un adulto.'),
        b_('d10', 'texto', 'Sesión 4: Comparo y planifico', tabla_(['Bloque', 'Tiempo', 'Actividad'], [['Teoría', '10 min', 'Balance decisional, racionalidad limitada y metas concretas.'], ['Balance de tres opciones', '25 min', 'Criterios, importancia, ventajas y desventajas.'], ['Requisitos y plazos', '10 min', 'Verificar en admisionescolar.cl.'], ['Plan si… entonces…', '10 min', 'Tres planes y una meta (caso Diego).'], ['Cierre', '10 min', 'Explicar el balance a un compañero.']]) + '<br><b>Tarea familiar:</b> balance en familia. <b>Nota:</b> observe si prioriza criterios propios o externos (indicador de autonomía).'),
        b_('d11', 'texto', 'Sesión 5: Decido y me comprometo', tabla_(['Bloque', 'Tiempo', 'Actividad'], [['Teoría', '5 min', 'Autodeterminación y autoeficacia.'], ['Encuesta E3', '12 min', 'Encuesta final.'], ['Revisión de autonomía', '10 min', 'Cinco preguntas.'], ['Carta a mi yo de cinco años', '15 min', 'Carta breve.'], ['Plan personal', '10 min', 'Tres pasos con fechas y apoyo.'], ['Cierre', '13 min', 'Presentar el plan.']]) + '<br><b>Tarea familiar:</b> F2 y carta de apoyo. <b>Seguimiento:</b> a las dos semanas.'),
        b_('d12', 'texto', '9. Análisis de proyección', 'Para cada estudiante se comparan E1, E2 y E3 en cuatro indicadores (1 a 4): <b>claridad del proyecto</b>, <b>conocimiento de opciones</b>, <b>autonomía</b> y <b>certeza y plan</b>. 1 no logrado · 2 en desarrollo · 3 logrado · 4 logrado sólidamente.<br><br><b>Lectura:</b> avance sostenido = proceso sólido; conocimiento sin autonomía = reforzar criterios propios; estancamiento en certeza = más exploración; presión externa = conversar con estudiante y familia. Coherencia con el perfil RIASEC: si no coincide, pregunte. <b>El análisis orienta; no clasifica.</b> La plataforma calcula los indicadores automáticamente (menú Reportes y Análisis IA).'),
        b_('d13', 'recuerde', '10 y 11. Familia y consideraciones', 'Habilite F1 al inicio, cite a reunión si hay tensiones (sesión 3 o 4) y realice la reunión final en la sesión 5 o después. Este proceso no reemplaza la orientación vocacional profesional. Cuide la privacidad de las respuestas.')
      ], pops: [] }
  ];
}

function cuestionariosManual_() {
  var riasecItems = ['Armar o arreglar cosas con mis manos', 'Investigar cómo funcionan las cosas', 'Crear dibujos, música, textos o diseños',
    'Ayudar a otras personas', 'Convencer a otros de una idea', 'Organizar información, listas o datos', 'Trabajar con máquinas, herramientas o equipos',
    'Resolver problemas difíciles', 'Expresar ideas de forma creativa', 'Trabajar en equipo', 'Liderar un proyecto', 'Seguir normas claras y un orden',
    'Trabajar al aire libre o con herramientas', 'Hacer experimentos de ciencia', 'Imaginar cosas nuevas', 'Enseñar o explicar algo a otros',
    'Proponer emprendimientos o iniciativas', 'Trabajar con números y registros precisos'].map(function (tx, i) {
    return { id: 'a' + (i + 1), texto: tx, grupo: 'RIASEC'[i % 6] };
  });
  return [
    { codigo: 'E1', titulo: 'Encuesta 1: Mi proyecto de vida hoy', ses: 'estudiantes1', desc: 'Marque la alternativa que mejor lo describe. No hay respuestas correctas ni incorrectas.', p: [
      { id: 'q1', n: 1, tipo: 'likert', texto: 'Tengo claro qué me gustaría estudiar o hacer después de 8° básico.', opciones: LIKERT, obligatoria: true },
      { id: 'q2', n: 2, tipo: 'likert', texto: 'Sé qué cosas me gustan hacer y en qué soy bueno o buena.', opciones: LIKERT, obligatoria: true },
      { id: 'q3', n: 3, tipo: 'likert', texto: 'Me imagino cómo voy a estar en cinco años.', opciones: LIKERT, obligatoria: true },
      { id: 'q4', n: 4, tipo: 'multiple', texto: '¿Cuáles de estas modalidades de enseñanza media conoce? (puede marcar más de una)',
        opciones: ['Científico-humanista', 'Técnico-profesional', 'Artística', 'No conozco ninguna'], cuenta: ['Científico-humanista', 'Técnico-profesional', 'Artística'] },
      { id: 'q5', n: 5, tipo: 'unica', texto: '¿Qué es lo que más influye en su decisión?', opciones: ['Mis propios intereses', 'Mi familia', 'Mis amigos', 'Lo que hacen otros', 'Otra razón'],
        valores: [4, 2.5, 1.5, 1, 2.5], obligatoria: true },
      { id: 'q6', n: 6, tipo: 'abierta', texto: '¿Qué le gustaría ser o hacer dentro de 10 años?' },
      { id: 'q7', n: 7, tipo: 'abierta', texto: '¿Qué cosas cree que lo pueden ayudar a lograr sus metas?' },
      { id: 'q8', n: 8, tipo: 'abierta', texto: '¿Qué cosas cree que le pueden dificultar lograrlas?' }] },
    { codigo: 'RIASEC', titulo: 'Mapa de intereses (Ejercicio 4)', ses: 'estudiantes2', desc: 'Indique cuánto le gustaría hacer cada actividad.', p: [
      { id: 'q1', n: 1, tipo: 'escala', texto: '¿Cuánto le gustaría hacer cada actividad?', opciones: ['Nada', 'Poco', 'Bastante', 'Mucho'], items: riasecItems, obligatoria: true }] },
    { codigo: 'E2', titulo: 'Encuesta 2: Mi avance', ses: 'estudiantes3', desc: 'Responda según lo que sabe hoy.', p: [
      { id: 'q1', n: 1, tipo: 'abierta', texto: 'Mencione dos modalidades de enseñanza media y una diferencia entre ellas.' },
      { id: 'q2', n: 2, tipo: 'unica', texto: '¿Dónde puede revisar información oficial sobre los establecimientos?',
        opciones: ['En una red social', 'En el Buscador de establecimientos del Ministerio de Educación', 'En un anuncio del liceo', 'No lo sé'],
        correcta: 'En el Buscador de establecimientos del Ministerio de Educación', obligatoria: true },
      { id: 'q3', n: 3, tipo: 'unica', texto: '¿Qué tan segura o seguro se siente para tomar su decisión?', opciones: CERTEZA, escala: true, obligatoria: true },
      { id: 'q4', n: 4, tipo: 'abierta', texto: '¿Qué información le falta para decidir?' },
      { id: 'q5', n: 5, tipo: 'abierta', texto: '¿Qué paso o acción quiere dar antes de la próxima sesión?' }] },
    { codigo: 'TRAMPAS', titulo: 'Trampas de la mente (Ejercicio 9)', ses: 'estudiantes3', desc: 'Elija la trampa que aparece en cada situación.', p: [
      { id: 'q1', n: 1, tipo: 'pareo', texto: '¿Qué trampa aparece en cada situación?',
        opciones: ['A · Anclaje', 'B · Disponibilidad', 'C · Confirmación', 'D · Aversión a la pérdida', 'E · Influencia social'],
        items: [
          { id: 't1', texto: '"Mi primo estudió en ese liceo y le fue muy bien, así que ese es el mejor para mí."' },
          { id: 't2', texto: '"El primer liceo que visité me pareció el mejor, así que ya no miré otros."' },
          { id: 't3', texto: '"Solo leo los comentarios que dicen que mi liceo favorito es excelente."' },
          { id: 't4', texto: '"Si cambio de liceo, pierdo a mis amigos, así que prefiero quedarme aunque no me guste."' },
          { id: 't5', texto: '"Todos en mi curso van a postular a la misma modalidad, así que yo también."' }],
        correcta: { t1: 'B · Disponibilidad', t2: 'A · Anclaje', t3: 'C · Confirmación', t4: 'D · Aversión a la pérdida', t5: 'E · Influencia social' }, obligatoria: true }] },
    { codigo: 'E3', titulo: 'Encuesta 3: Mi decisión', ses: 'estudiantes5', desc: 'Cuéntenos su decisión y su plan.', p: [
      { id: 'q1', n: 1, tipo: 'abierta', texto: 'Mi primera preferencia de continuidad de estudios es:', obligatoria: true },
      { id: 'q2', n: 2, tipo: 'abierta', texto: 'Mi segunda preferencia es:' },
      { id: 'q3', n: 3, tipo: 'abierta', texto: 'Las razones principales de mi decisión son:', obligatoria: true },
      { id: 'q4', n: 4, tipo: 'unica', texto: '¿Qué tan segura o seguro está de su decisión?', opciones: CERTEZA, escala: true, obligatoria: true },
      { id: 'q5', n: 5, tipo: 'abierta', texto: '¿Qué apoyo necesita para llevar adelante su decisión?' },
      { id: 'q6', n: 6, tipo: 'pasos', texto: 'Mi plan de acción en tres pasos, con fechas:', pasos: 3 }] },
    { codigo: 'AUTONOMIA', titulo: 'Revisión de mi autonomía (Ejercicio 14)', ses: 'estudiantes5', desc: 'No hay respuestas buenas o malas.', p: [
      { id: 'q1', n: 1, tipo: 'unica', texto: '¿La elijo porque me interesa, o porque siento presión de alguien?', opciones: ['Principalmente porque me interesa a mí', 'Porque me interesa y lo conversé con mi familia',
        'Por lo que esperan otras personas', 'Porque eligen lo mismo mis amigos', 'Todavía no lo sé'], valores: [4, 4, 1.5, 1, 2], obligatoria: true },
      { id: 'q2', n: 2, tipo: 'abierta', texto: '¿Esta decisión la tomo yo? ¿Qué parte de ella depende de otros?' },
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
}

/**
 * Crea o actualiza el contenido de los manuales.
 * forzar=false: solo actualiza sesiones de sistema (no editadas por la administración).
 */
function sembrarContenido_(forzar) {
  var t = ahora_();
  var existentes = todos_('Sesiones').slice();
  var ids = {}, nuevas = [], actualizadas = 0;
  sesionesManual_().forEach(function (s) {
    var aud = s.aud || 'estudiantes';
    var ex = existentes.filter(function (x) { return !x.baseId && x.audiencia === aud && Number(x.numero) === s.n; })[0];
    if (ex) {
      ids[aud + s.n] = ex.id;
      if (ex.autorId !== 'sistema' && !forzar) return;
      ex.titulo = s.titulo; ex.objetivo = s.obj; ex.bloques = s.bloques; ex.emergentes = s.pops;
      if (!ex.imagen || /^[a-z]+$/.test(ex.imagen)) ex.imagen = s.img;
      ex.autorId = 'sistema'; ex.autorNombre = 'Coordinación de Segundo Ciclo'; ex.actualizado = t;
      actualizar_('Sesiones', ex);
      actualizadas++;
    } else {
      var id = nuevoId_('S');
      ids[aud + s.n] = id;
      nuevas.push({ id: id, baseId: '', numero: s.n, titulo: s.titulo, objetivo: s.obj, audiencia: aud, cursos: '',
        estado: 'publicada', bloques: s.bloques, emergentes: s.pops, imagen: s.img, autorId: 'sistema',
        autorNombre: 'Coordinación de Segundo Ciclo', actualizado: t });
    }
  });
  insertarVarios_('Sesiones', nuevas);

  var qEx = todos_('Cuestionarios').slice(), qNuevos = [];
  cuestionariosManual_().forEach(function (q) {
    var e = qEx.filter(function (x) { return x.codigo === q.codigo; })[0];
    if (e) {
      if (ids[q.ses] && e.sesionId !== ids[q.ses] && !buscar_('Sesiones', 'id', e.sesionId)) { e.sesionId = ids[q.ses]; actualizar_('Cuestionarios', e); }
      return;
    }
    qNuevos.push({ id: nuevoId_('Q'), codigo: q.codigo, titulo: q.titulo, descripcion: q.desc, audiencia: q.aud || 'estudiantes',
      sesionId: ids[q.ses] || '', preguntas: q.p, habilitado: 'false', cursos: '', actualizado: t });
  });
  insertarVarios_('Cuestionarios', qNuevos);
  return { sesionesNuevas: nuevas.length, sesionesActualizadas: actualizadas, cuestionariosNuevos: qNuevos.length };
}

function actualizarContenido_(ses, d) {
  var r = sembrarContenido_(!!d.forzar);
  auditar_(ses, 'actualizar_contenido_manuales', JSON.stringify(r));
  return r;
}
