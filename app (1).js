/* =====================================================================
   CONSULTORIO KINÉSICO — app.js
   Todo el estado vive en localStorage bajo la clave "consultorio_v1"
   ===================================================================== */

const STORAGE_KEY = 'consultorio_v1';

/* ---------- Valores normativos de ROM (referencia estándar) ----------
   Fuente: rangos de referencia habituales en goniometría clínica
   (AAOS / Norkin & White). Sirven como punto de partida: se pueden
   ajustar por paciente si el kinesiólogo lo considera necesario. */
const ROM_NORMATIVOS = {
  "Hombro": [
    {mov:"Flexión", normal:180},
    {mov:"Extensión", normal:60},
    {mov:"Abducción", normal:180},
    {mov:"Rotación interna", normal:70},
    {mov:"Rotación externa", normal:90},
  ],
  "Codo": [
    {mov:"Flexión", normal:145},
    {mov:"Pronación", normal:80},
    {mov:"Supinación", normal:80},
  ],
  "Muñeca": [
    {mov:"Flexión", normal:80},
    {mov:"Extensión", normal:70},
    {mov:"Desviación radial", normal:20},
    {mov:"Desviación cubital", normal:30},
  ],
  "Cadera": [
    {mov:"Flexión", normal:120},
    {mov:"Extensión", normal:20},
    {mov:"Abducción", normal:45},
    {mov:"Aducción", normal:25},
    {mov:"Rotación interna", normal:35},
    {mov:"Rotación externa", normal:45},
  ],
  "Rodilla": [
    {mov:"Flexión", normal:135},
    {mov:"Extensión", normal:0},
  ],
  "Tobillo": [
    {mov:"Flexión dorsal", normal:20},
    {mov:"Flexión plantar", normal:50},
    {mov:"Inversión", normal:35},
    {mov:"Eversión", normal:15},
  ],
  "Columna cervical": [
    {mov:"Flexión", normal:50},
    {mov:"Extensión", normal:60},
    {mov:"Rotación", normal:80},
    {mov:"Inclinación lateral", normal:45},
  ],
  "Columna lumbar": [
    {mov:"Flexión", normal:60},
    {mov:"Extensión", normal:25},
    {mov:"Inclinación lateral", normal:25},
  ],
};

/* ---------- Biblioteca de ejercicios de ejemplo ----------
   Cada ejercicio tiene 4 ejes de clasificación (puede tener varios
   valores por eje). El usuario puede agregar los suyos desde la UI. */
const EJERCICIOS_EJEMPLO = [
  {id:'ex1', nombre:'Press militar con mancuernas', zona:['Miembro superior'], articulacion:['Hombro'], musculo:['Deltoides','Trapecio'], gesto:['Empuje vertical'], desc:'Sentado o de pie, empuje de mancuernas por sobre la cabeza.'},
  {id:'ex2', nombre:'Remo con banda elástica', zona:['Miembro superior'], articulacion:['Hombro','Escápula'], musculo:['Dorsal ancho','Romboides'], gesto:['Tracción horizontal'], desc:'Tracción de banda hacia el abdomen, codos cerca del cuerpo.'},
  {id:'ex3', nombre:'Rotación externa con banda', zona:['Miembro superior'], articulacion:['Hombro'], musculo:['Infraespinoso','Redondo menor'], gesto:['Rotación'], desc:'Codo a 90°, rotar el antebrazo alejándolo del cuerpo.'},
  {id:'ex4', nombre:'Sentadilla goblet', zona:['Miembro inferior'], articulacion:['Cadera','Rodilla','Tobillo'], musculo:['Cuádriceps','Glúteo mayor'], gesto:['Flexo-extensión'], desc:'Sentadilla sosteniendo una pesa contra el pecho.'},
  {id:'ex5', nombre:'Puente de glúteo unilateral', zona:['Miembro inferior','Tronco'], articulacion:['Cadera'], musculo:['Glúteo mayor','Isquiotibiales'], gesto:['Extensión de cadera'], desc:'Decúbito dorsal, elevar la pelvis apoyando un solo pie.'},
  {id:'ex6', nombre:'Step-up con escalón', zona:['Miembro inferior'], articulacion:['Cadera','Rodilla'], musculo:['Cuádriceps','Glúteo medio'], gesto:['Flexo-extensión','Control de equilibrio'], desc:'Subir y bajar un escalón controlando la rodilla.'},
  {id:'ex7', nombre:'Plancha abdominal', zona:['Tronco'], articulacion:['Columna lumbar'], musculo:['Recto abdominal','Transverso'], gesto:['Estabilización'], desc:'Apoyo en antebrazos y pies, manteniendo el tronco alineado.'},
  {id:'ex8', nombre:'Bird-dog', zona:['Tronco'], articulacion:['Columna lumbar','Cadera','Hombro'], musculo:['Erectores espinales','Glúteo mayor'], gesto:['Estabilización','Control motor'], desc:'En cuadrupedia, extender brazo y pierna opuestos.'},
  {id:'ex9', nombre:'Elevación de talones (gemelos)', zona:['Miembro inferior'], articulacion:['Tobillo'], musculo:['Gastrocnemio','Sóleo'], gesto:['Flexión plantar'], desc:'De pie, elevar los talones sobre las puntas de los pies.'},
  {id:'ex10', nombre:'Movilidad cervical activa', zona:['Cabeza y cuello'], articulacion:['Columna cervical'], musculo:['Trapecio superior','Esternocleidomastoideo'], gesto:['Movilidad articular'], desc:'Flexo-extensión y rotaciones activas suaves de cuello.'},
];

/* ---------- Cuestionarios de ejemplo (autoreportados) ----------
   Cada cuestionario es una lista de preguntas con escala 0-4 (tipo
   Likert), pensado para escalas funcionales habituales en kinesiología. */
const CUESTIONARIOS_PLANTILLA = {
  'DASH (simplificado)': [
    'Abrir un frasco con tapa a rosca apretada',
    'Hacer tareas pesadas del hogar',
    'Cargar una bolsa de compras',
    'Lavarse la espalda',
    'Dificultad para dormir por el dolor en hombro/brazo/mano',
  ],
  'Funcional de Rodilla': [
    'Subir escaleras',
    'Bajar escaleras',
    'Ponerse en cuclillas',
    'Caminar en superficie irregular',
    'Correr en línea recta',
  ],
  'Funcional Lumbar (Oswestry simplificado)': [
    'Intensidad del dolor en reposo',
    'Cuidado personal (vestirse, lavarse)',
    'Levantar objetos',
    'Caminar',
    'Estar sentado',
    'Estar de pie',
    'Dormir',
  ],
  'IKDC - Subjetivo de Rodilla': [
    'Dolor habitual de rodilla',
    'Dolor durante actividad intensa',
    'Inflamación de rodilla',
    'Sensación de bloqueo o traba articular',
    'Sensación de inestabilidad o que la rodilla "falla"',
    'Subir y bajar escaleras sin dificultad',
    'Ponerse de cuclillas sin dificultad',
    'Sentarse con la rodilla flexionada sin dificultad',
    'Levantarse de una silla sin dificultad',
    'Correr en línea recta sin dificultad',
    'Saltar y caer sobre la pierna afectada',
    'Detenerse y arrancar rápido (cambios de dirección)',
    'Nivel de función actual comparado al previo a la lesión',
  ],
  'ACL-RSI (Disposición psicológica al retorno deportivo)': [
    'Confianza en mi rodilla para rendir en mi deporte',
    'Pienso en mi lesión al practicar mi deporte',
    'Miedo a volver a lesionarme jugando',
    'Confianza en poder rendir al máximo nivel',
    'Nerviosismo al practicar mi deporte',
    'Confianza en que mi rodilla no se va a lesionar al someterla a estrés',
    'Frustración con mi nivel de rendimiento actual',
    'Uso de la rodilla afectada para movimientos exigentes del deporte (saltos, cambios de dirección)',
  ],
  'FAAM - Actividades de la vida diaria (Tobillo/Pie)': [
    'Estar de pie',
    'Caminar en superficie plana',
    'Caminar en superficie irregular',
    'Caminar cuesta abajo',
    'Subir escaleras',
    'Bajar escaleras',
    'Caminar hacia atrás',
    'Ponerse en cuclillas',
    'Pararse en puntas de pie',
    'Levantarse desde sentado',
    'Correr en superficie plana',
    'Saltar y aterrizar con el pie afectado',
    'Cambios de dirección rápidos',
  ],
  'FAAM - Deportes (Tobillo/Pie)': [
    'Correr',
    'Saltar',
    'Aterrizar luego de un salto',
    'Detenerse y arrancar de manera repentina',
    'Movimientos de corte / cambio de dirección',
    'Actividades de baja demanda',
    'Capacidad de rendir al nivel deseado',
  ],
  'KOOS - Calidad de Vida (Rodilla)': [
    'Conciencia de los problemas de rodilla',
    'Modificación del estilo de vida por la rodilla',
    'Confianza en la rodilla',
    'Dificultad general con la rodilla',
  ],
  'Lysholm (Rodilla)': [
    'Cojera al caminar',
    'Necesidad de apoyo (bastón/muletas)',
    'Bloqueo articular',
    'Sensación de inestabilidad',
    'Dolor',
    'Inflamación (edema)',
    'Subir escaleras',
    'Ponerse en cuclillas',
  ],
};

/* ---------- Escala Tegner (actividad, 0-10, selección única) ---------- */
const TEGNER_NIVELES = [
  {v:0, label:'Licencia por enfermedad / incapacidad por la rodilla'},
  {v:1, label:'Trabajo sedentario; caminata posible en terreno irregular'},
  {v:2, label:'Trabajo liviano (sin esfuerzo); caminata en terreno irregular posible pero limitada'},
  {v:3, label:'Trabajo moderadamente pesado; ciclismo y caminata sin restricción'},
  {v:4, label:'Trabajo pesado; ciclismo, esquí, footing 5 km'},
  {v:5, label:'Actividad recreativa: tenis, footing, deportes de equipo a nivel bajo'},
  {v:6, label:'Actividad recreativa: deportes de equipo de forma regular, nivel inferior'},
  {v:7, label:'Competición: fútbol, hándbol nivel inferior; entrenamiento regular'},
  {v:8, label:'Competición: fútbol, hándbol nivel medio'},
  {v:9, label:'Competición: fútbol, hándbol nivel nacional/internacional'},
  {v:10, label:'Deporte de competición de élite (nivel nacional o internacional)'},
];

/* ---------- Baterías de evaluación funcional ----------
   Cada batería tiene varios tests con su propia unidad. El puntaje
   total (cuando existe) se calcula sumando o promediando según
   corresponda. Referencias: Ankle-GO (Picot et al.), CKCUEST (Goldbeck &
   Davies / Roush et al.), Hop Test Battery (Grindem et al. 2016, Kyritsis
   et al. 2016, Davies et al.). */
const BATERIAS_FUNCIONALES = {
  'Ankle-GO': {
    desc: 'Batería para esguince lateral de tobillo (Picot et al.). Máximo 25 puntos.',
    maxPts: 25,
    items: [
      {id:'sls', nombre:'Single Leg Stance', hint:'Tiempo en apoyo monopodal, ojos cerrados', unidad:'seg'},
      {id:'msebt', nombre:'mSEBT (Star Excursion modificado)', hint:'Promedio 3 direcciones, normalizado a longitud de pierna', unidad:'%'},
      {id:'sidehop', nombre:'Side Hop Test', hint:'Tiempo en completar 10 saltos laterales', unidad:'seg'},
      {id:'fig8', nombre:'Figure-of-8 Hop Test', hint:'Tiempo en recorrido en ocho', unidad:'seg'},
      {id:'faam_link', nombre:'FAAM (autoreportado)', hint:'Tomado del cuestionario FAAM ya cargado', unidad:'%', soloLectura:true},
      {id:'percepcion', nombre:'Percepción del paciente', hint:'Confianza para volver al deporte (0-10)', unidad:'/10'},
    ],
  },
  'CKCUEST (Estabilidad de cadena cinética cerrada, miembro superior)': {
    desc: 'Test de estabilidad dinámica de hombro en cadena cerrada (Goldbeck & Davies). Normativo: ≈26 reps hombres, ≈22 reps mujeres en 15 seg.',
    maxPts: null,
    items: [
      {id:'reps', nombre:'Repeticiones completadas', hint:'Toques alternados entre conos en 15 segundos', unidad:'reps'},
      {id:'envergadura', nombre:'Envergadura (largo de brazos)', hint:'Para normalizar la puntuación de potencia', unidad:'cm'},
    ],
  },
  'Hop Test Battery (LCA / rodilla)': {
    desc: 'Batería estándar de 4 saltos unipodales con LSI (Grindem 2016, Kyritsis 2016). Criterio de alta: LSI ≥90% en los 4 tests.',
    maxPts: null,
    items: [
      {id:'single_sano', nombre:'Single hop — pierna sana', hint:'Distancia en salto simple', unidad:'cm'},
      {id:'single_afect', nombre:'Single hop — pierna afectada', hint:'Distancia en salto simple', unidad:'cm'},
      {id:'triple_sano', nombre:'Triple hop — pierna sana', hint:'Distancia en 3 saltos consecutivos', unidad:'cm'},
      {id:'triple_afect', nombre:'Triple hop — pierna afectada', hint:'Distancia en 3 saltos consecutivos', unidad:'cm'},
      {id:'cross_sano', nombre:'Crossover hop — pierna sana', hint:'Distancia en 3 saltos cruzados', unidad:'cm'},
      {id:'cross_afect', nombre:'Crossover hop — pierna afectada', hint:'Distancia en 3 saltos cruzados', unidad:'cm'},
      {id:'timed_sano', nombre:'Timed hop (6m) — pierna sana', hint:'Tiempo en recorrer 6 metros saltando', unidad:'seg'},
      {id:'timed_afect', nombre:'Timed hop (6m) — pierna afectada', hint:'Tiempo en recorrer 6 metros saltando', unidad:'seg'},
    ],
  },
};

/* ---------- Guía de Melbourne (ACL Rehabilitation Guide, Cooper & Hughes) ----------
   6 fases con criterio de avance, no timeline. Se registra el cumplimiento
   de cada criterio por fase para un paciente con LCA. */
const MELBOURNE_FASES = [
  {
    fase: 'Fase 0 — Pre-operatorio',
    criterios: [
      'ROM de rodilla simétrico (o lo más cercano posible)',
      'Sin derrame articular significativo',
      'Activación de cuádriceps adecuada (sin lag de extensión)',
      'Marcha normal sin claudicación',
    ],
  },
  {
    fase: 'Fase 1 — Recuperación post-quirúrgica temprana',
    criterios: [
      'Extensión completa de rodilla (0°)',
      'Flexión de rodilla ≥110-120°',
      'Control de derrame e inflamación',
      'Marcha normal sin ayuda',
      'Activación voluntaria completa del cuádriceps',
    ],
  },
  {
    fase: 'Fase 2 — Fortalecimiento y control neuromuscular',
    criterios: [
      'ROM completo y simétrico',
      'Fuerza de cuádriceps/isquiotibiales en progreso (LSI en aumento)',
      'Sentadilla unipodal con buen control, sin dolor',
      'Sin derrame tras el ejercicio',
      'Tolerancia a ejercicios de cadena cerrada con carga progresiva',
    ],
  },
  {
    fase: 'Fase 3 — Carrera, agilidad y aterrizajes',
    criterios: [
      'LSI de fuerza de cuádriceps ≥80%',
      'Mecánica de aterrizaje controlada (sin valgo dinámico marcado)',
      'Tolerancia a trote/carrera progresiva sin dolor ni derrame',
      'Buen control en ejercicios de agilidad de baja intensidad',
    ],
  },
  {
    fase: 'Fase 4 — Retorno al entrenamiento deportivo',
    criterios: [
      'LSI de fuerza ≥90% (cuádriceps e isquiotibiales)',
      'LSI ≥90% en batería de Hop Tests (los 4 tests)',
      'IKDC dentro de percentil esperado para la edad',
      'ACL-RSI con puntaje aceptable (sin kinesiofobia marcada)',
      'Participación completa en entrenamientos sin restricciones',
    ],
  },
  {
    fase: 'Fase 5 — Retorno a la competencia',
    criterios: [
      'Alta médica/quirúrgica formal (habitualmente ≥9 meses post-cirugía)',
      'Cumplimiento de todos los criterios objetivos de fases previas',
      'Confianza psicológica para competir (ACL-RSI)',
      'Sin síntomas tras sesiones de entrenamiento a máxima intensidad',
    ],
  },
];

/* ---------- Benchmarks de fase ACL — Paul Read / VALD ----------
   Fuente: "Practitioner's Guide to ACL" (VALD, autor Dr. Paul Read).
   Tabla de benchmarks por fase (págs. 58-61 de la guía), basada en
   investigación publicada (Read et al. 2019/2022, Kotsifaki et al. 2023)
   y experiencia práctica. Los rangos reflejan intervalos de confianza
   del 95%; los tiempos pueden variar, pero la progresión debe priorizar
   protección tisular y criterios cumplidos por sobre el calendario. */
const VALD_FASES_ACL = [
  {
    fase: 'Fase temprana (0-3 meses)',
    objetivo: 'Reducir inflamación, restaurar ROM, restaurar actividad muscular, control motor inicial',
    hito: 'Alta a Return to Gym',
    items: [
      {test:'Inflamación', benchmark:'Ninguna / mínima'},
      {test:'ROM de rodilla', benchmark:'Extensión <0° · Flexión >130°'},
      {test:'Elevación de pierna recta (SLR)', benchmark:'Sin lag de extensión'},
      {test:'Asimetría en sentadilla (impulso excéntrico)', benchmark:'<10%'},
      {test:'Balance unipodal (excursión total)', benchmark:'<550mm'},
      {test:'Puente de glúteo', benchmark:'10 reps'},
      {test:'Elevación de talón', benchmark:'10 reps'},
      {test:'Sentadilla unipodal', benchmark:'>70° flexión de rodilla'},
      {test:'Flexión plantar (fuerza)', benchmark:'>13 N/kg'},
      {test:'Extensión de rodilla (fuerza)', benchmark:'>5.5 N/kg'},
      {test:'Flexión de rodilla (fuerza)', benchmark:'>2.0 N/kg'},
    ],
  },
  {
    fase: 'Fase media (3-5 meses)',
    objetivo: 'Fuerza monoarticular, restaurar capacidad de salto/aterrizaje, mecánica de carrera, fuerza máxima y reactiva',
    hito: 'Alta a Return to Running and Jumping',
    items: [
      {test:'Elevación de talón unipodal', benchmark:'>25 reps'},
      {test:'Puente de glúteo unipodal', benchmark:'>25 reps'},
      {test:'Sit to stand unipodal', benchmark:'15–25 reps'},
      {test:'Sentadilla unipodal', benchmark:'>90° flexión de rodilla'},
      {test:'CMJ (altura de salto)', benchmark:'27.8–30.1 cm · asimetría impulso concéntrico 9.2–13.4% · vel. pico excéntrica <-1.0 m/s'},
      {test:'SLJ (salto unipodal)', benchmark:'>11 cm · asimetría concéntrica <20% · vel. pico excéntrica <-0.5 m/s'},
      {test:'Hop Test (asimetría)', benchmark:'<10%'},
      {test:'Flexión plantar (fuerza)', benchmark:'>15.5 N/kg'},
      {test:'Extensión de rodilla (fuerza)', benchmark:'>7.0 N/kg'},
      {test:'Flexión de rodilla (fuerza)', benchmark:'>2.5 N/kg'},
    ],
  },
  {
    fase: 'Fase tardía (5-8 meses)',
    objetivo: 'Optimizar fuerza explosiva, elástica y reactiva; progresar movimiento multidireccional',
    hito: 'Alta a Return to On-Field Rehabilitation',
    items: [
      {test:'CMJ (altura de salto)', benchmark:'30.7–33.4 cm · impulso concéntrico >2.25 Ns/kg · impulso exc. deceleración >1.35 Ns/kg'},
      {test:'SLJ (altura de salto)', benchmark:'>13.2 cm · impulso concéntrico >1.5 Ns/kg · impulso exc. deceleración >0.6 Ns/kg'},
      {test:'Drop Jump (altura de salto)', benchmark:'>28 cm · asimetría exc./conc. <10%'},
      {test:'Flexión plantar (fuerza)', benchmark:'>18 N/kg'},
      {test:'Extensión de rodilla (fuerza)', benchmark:'>7.5 N/kg'},
      {test:'Flexión de rodilla (fuerza)', benchmark:'>2.8 N/kg'},
      {test:'IMTP (fuerza relativa)', benchmark:'>32 N/kg'},
    ],
  },
  {
    fase: 'Retorno al entrenamiento (8-9 meses)',
    objetivo: 'Capacidades específicas del deporte, movimiento multidireccional, factores de riesgo, agilidad reactiva',
    hito: 'Alta a Return to Training',
    items: [
      {test:'CMJ (altura de salto)', benchmark:'31.8–34.7 cm · impulso concéntrico >2.4 Ns/kg · impulso exc. deceleración >1.5 Ns/kg'},
      {test:'SLJ (altura de salto)', benchmark:'>15 cm · impulso concéntrico >1.58 Ns/kg · impulso exc. deceleración >0.68 Ns/kg'},
      {test:'Single Leg Drop Jump', benchmark:'>14 cm · RSI >0.38'},
      {test:'IMTP (fuerza relativa)', benchmark:'>34 N/kg'},
      {test:'Tests de campo (COD/sprint)', benchmark:'CMAS <3 (sin maniobras de corte de alto riesgo) · 5-0-5 CODD · sprint 10/30m >90% del nivel pre-lesión'},
    ],
  },
  {
    fase: 'Retorno a la competencia (>9 meses)',
    objetivo: 'Capacidades específicas del deporte, movimiento multidireccional, factores de riesgo, agilidad reactiva',
    hito: 'Alta a Return to Competition',
    items: [
      {test:'CMJ (altura de salto)', benchmark:'33.9–35.0 cm · impulso concéntrico >2.6 Ns/kg · impulso exc. deceleración >1.65 Ns/kg'},
      {test:'SLJ (altura de salto)', benchmark:'>18 cm · impulso concéntrico >1.8 Ns/kg · impulso exc. deceleración >0.73 Ns/kg'},
      {test:'Single Leg Drop Jump', benchmark:'>17 cm · RSI >0.57'},
      {test:'IMTP (fuerza relativa)', benchmark:'>37 N/kg'},
      {test:'Tests de campo (COD/sprint)', benchmark:'CMAS <3 (sin maniobras de corte de alto riesgo) · 5-0-5 CODD · sprint 10/30m >95% del nivel pre-lesión'},
    ],
  },
];

/* Benchmarks generales de fuerza (resumen, independientes de la fase) */
const VALD_BENCHMARKS_GENERALES = [
  {region:'Cuádriceps (extensión de rodilla)', benchmark:'3.0 N·m/kg'},
  {region:'Isquiotibiales (flexión de rodilla)', benchmark:'3.5 N/kg'},
  {region:'Abducción de cadera', benchmark:'3.0 N·m/kg'},
  {region:'Sóleo (flexión plantar)', benchmark:'1.8 × peso corporal'},
];


/* ---------- Tests clínicos sugeridos por articulación (anamnesis) ----------
   Referencia general: tests ortopédicos especiales ampliamente citados en
   guías clínicas internacionales por articulación. Son sugerencias para
   que el kinesiólogo elija cuáles aplicar; el sistema no los ejecuta. */
const TESTS_POR_ARTICULACION = {
  'Hombro': ['Test de Jobe (supraespinoso)', 'Test de Neer', 'Test de Hawkins-Kennedy', 'Test de Speed (bíceps)', 'Test de Yergason', 'Cajón anterior/posterior de hombro', 'Sulcus sign (inestabilidad inferior)', 'O\'Brien (labrum/SLAP)'],
  'Codo': ['Test de Cozen (epicondilitis lateral)', 'Test de Mill', 'Test de Golfista (epicondilitis medial)', 'Test de estrés en valgo/varo'],
  'Muñeca/Mano': ['Test de Finkelstein (De Quervain)', 'Test de Phalen', 'Test de Tinel', 'Test de estabilidad del ligamento colateral del pulgar'],
  'Columna cervical': ['Test de Spurling', 'Test de distracción cervical', 'Test de compresión de Jackson', 'Test de la arteria vertebral'],
  'Columna lumbar': ['Test de Lasègue (SLR)', 'Test de Lasègue invertido (femoral)', 'Test de Schober', 'Slump test'],
  'Cadera': ['Test de FABER (Patrick)', 'Test de FADIR (pinzamiento femoroacetabular)', 'Test de Trendelenburg', 'Test de Thomas (psoas)', 'Test de Ober (tensor de la fascia lata)'],
  'Rodilla': ['Test de Lachman', 'Cajón anterior/posterior de rodilla', 'Test de McMurray', 'Test de Apley', 'Test de estrés en valgo/varo', 'Pivot shift'],
  'Tobillo/Pie': ['Cajón anterior de tobillo', 'Talar tilt (inversión forzada)', 'Squeeze test (sindesmosis)', 'Test de Thompson (Aquiles)', 'Test de compresión del mediopié'],
};


let state = {
  pacientes: [],
  ejercicios: [],
  activePatientId: null,
  grupoActivo: 'club',
};

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      state.pacientes = parsed.pacientes || [];
      state.ejercicios = parsed.ejercicios || [];
      state.activePatientId = parsed.activePatientId || null;
      state.grupoActivo = parsed.grupoActivo || 'club';
    }
  }catch(e){
    console.error('Error leyendo datos guardados', e);
  }
  if(!state.ejercicios || state.ejercicios.length === 0){
    state.ejercicios = JSON.parse(JSON.stringify(EJERCICIOS_EJEMPLO));
  }
  // Migración retrocompatible: pacientes creados con versiones anteriores
  // de la app pueden no tener estos campos. Los completamos sin pisar datos.
  state.pacientes.forEach(p => {
    if(!p.grupo) p.grupo = 'club';
    if(p.pesoKg === undefined) p.pesoKg = '';
    if(!p.anamnesis) p.anamnesis = [];
    if(!p.funcionales) p.funcionales = [];
    if(p.valdFaseActual === undefined) p.valdFaseActual = 0;
    (p.fuerza||[]).forEach(r => {
      if(r.brazoIzqCm === undefined) r.brazoIzqCm = null;
      if(r.brazoDerCm === undefined) r.brazoDerCm = null;
    });
  });
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix){
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

function getActivePatient(){
  return state.pacientes.find(p => p.id === state.activePatientId) || null;
}

function fmtDate(iso){
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', {day:'2-digit', month:'2-digit', year:'numeric'});
}
function fmtDateShort(iso){
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', {day:'2-digit', month:'short'});
}
function todayISO(){
  return new Date().toISOString().slice(0,10);
}
function initials(name){
  return (name||'').trim().split(/\s+/).slice(0,2).map(w => w.length ? w[0].toUpperCase() : '').join('');
}

function toast(msg, danger=false){
  const host = document.getElementById('toastHost');
  const el = document.createElement('div');
  el.className = 'toast' + (danger ? ' danger':'');
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(()=>{ el.remove(); }, 2800);
}

function escapeHtml(str){
  if(str===undefined||str===null) return '';
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* =====================================================================
   MODELO DE PACIENTE
   ===================================================================== */
function nuevoPaciente(datos){
  return {
    id: uid('pac'),
    grupo: datos.grupo || 'club', // 'club' | 'consultorio'
    nombre: datos.nombre || '',
    dni: datos.dni || '',
    fechaNacimiento: datos.fechaNacimiento || '',
    telefono: datos.telefono || '',
    pesoKg: datos.pesoKg || '',
    diagnostico: datos.diagnostico || '',
    lesion: datos.lesion || '',
    objetivos: datos.objetivos || '',
    antecedentes: datos.antecedentes || '',
    fechaIngreso: todayISO(),
    anamnesis: [],      // {fecha, articulaciones:[...], motivoConsulta, observaciones}
    rom: [],            // {fecha, evaluaciones:[{zona,mov,normal,lado,valor}]}
    fuerza: [],         // {fecha, ejercicio, kgIzq, kgDer, brazoIzqCm, brazoDerCm}
    funcionales: [],    // {fecha, bateria, valores:{itemId:valor}, melbourneFase, melbourneCumplidos:[...]}
    dolor: [],          // {fecha, valor (0-10), nota}
    cuestionarios: [],  // {fecha, nombre, respuestas:[0-4...], total}
    rutina: [],         // [{ejercicioId, series, reps, carga, notas}]
    sesiones: [],       // {fecha, notas, ejerciciosRealizados:[ids], dolorSesion}
  };
}

/* =====================================================================
   NAVEGACIÓN / RENDER PRINCIPAL
   ===================================================================== */
const VIEWS = ['pacientes','ficha','anamnesis','rom','fuerza','funcionales','dolor','cuestionarios','rutina','sesiones','ejercicios'];
const VIEW_TITLES = {
  pacientes: ['Consultorio', 'Pacientes'],
  ficha: ['Paciente', 'Ficha'],
  anamnesis: ['Paciente', 'Anamnesis'],
  rom: ['Evaluación', 'Rangos de movimiento'],
  fuerza: ['Evaluación', 'Fuerza muscular'],
  funcionales: ['Evaluación', 'Evaluaciones funcionales'],
  dolor: ['Seguimiento', 'Evolución del dolor'],
  cuestionarios: ['Seguimiento', 'Cuestionarios autoreportados'],
  rutina: ['Tratamiento', 'Rutina de ejercicios'],
  sesiones: ['Tratamiento', 'Sesiones'],
  ejercicios: ['Biblioteca', 'Ejercicios'],
};

function goToView(name){
  if(!VIEWS.includes(name)) name = 'pacientes';
  const navBtn = document.querySelector(`.nav-item[data-view="${name}"]`);
  const needsPatient = navBtn ? navBtn.dataset.needsPatient : null;
  if(needsPatient && !getActivePatient()){
    toast('Primero elegí un paciente', true);
    name = 'pacientes';
  }
  VIEWS.forEach(v => {
    document.getElementById('view-'+v).hidden = (v !== name);
  });
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === name);
  });
  const [eyebrow, title] = VIEW_TITLES[name];
  document.getElementById('topbarEyebrow').textContent = eyebrow;
  document.getElementById('topbarTitle').textContent = title;
  document.getElementById('sidebar').classList.remove('open');

  renderView(name);
  location.hash = name;
}

function renderView(name){
  const renderers = {
    pacientes: renderPacientes,
    ficha: renderFicha,
    anamnesis: renderAnamnesis,
    rom: renderRom,
    fuerza: renderFuerza,
    funcionales: renderFuncionales,
    dolor: renderDolor,
    cuestionarios: renderCuestionarios,
    rutina: renderRutina,
    sesiones: renderSesiones,
    ejercicios: renderEjercicios,
  };
  renderers[name] && renderers[name]();
}

function refreshSidebarPatient(){
  const p = getActivePatient();
  const pill = document.getElementById('activePatientPill');
  if(p){
    pill.hidden = false;
    document.getElementById('activePatientName').textContent = p.nombre;
  }else{
    pill.hidden = true;
  }
}

function setTopbarActions(html){
  document.getElementById('topbarActions').innerHTML = html;
}

/* =====================================================================
   VISTA: PACIENTES
   ===================================================================== */
const GRUPOS_LABEL = {club:'Club 17 de Agosto', consultorio:'Consultorio'};

function renderPacientes(){
  setTopbarActions(`<button class="btn btn-primary" id="btnNuevoPaciente">+ Nuevo paciente</button>`);
  const root = document.getElementById('view-pacientes');
  const pacientesDelGrupo = state.pacientes.filter(p => (p.grupo||'club') === state.grupoActivo);

  if(pacientesDelGrupo.length === 0){
    root.innerHTML = `
      <div class="empty-state card">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8aa0a8" stroke-width="1.6"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>
        <h3>Sin pacientes en ${escapeHtml(GRUPOS_LABEL[state.grupoActivo])}</h3>
        <p>Creá el primer paciente de este grupo para empezar a registrar evaluaciones, rutinas y sesiones.</p>
      </div>`;
  }else{
    const ordenados = [...pacientesDelGrupo].sort((a,b)=> a.nombre.localeCompare(b.nombre));
    root.innerHTML = `<div class="patient-list">` + ordenados.map(p => `
      <div class="patient-card" data-id="${p.id}">
        <div class="patient-card-main">
          <div class="patient-avatar">${escapeHtml(initials(p.nombre))}</div>
          <div>
            <div class="patient-card-name">${escapeHtml(p.nombre)}</div>
            <div class="patient-card-meta">${escapeHtml(p.diagnostico || 'Sin diagnóstico registrado')}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="badge badge-petrol">Ingreso ${fmtDateShort(p.fechaIngreso)}</span>
          <button class="btn btn-sm" data-action="abrir" data-id="${p.id}">Abrir</button>
        </div>
      </div>
    `).join('') + `</div>`;
  }

  root.querySelectorAll('.patient-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if(e.target.closest('button')) return;
      seleccionarPaciente(card.dataset.id);
    });
  });
  root.querySelectorAll('[data-action="abrir"]').forEach(btn => {
    btn.addEventListener('click', () => seleccionarPaciente(btn.dataset.id));
  });

  document.getElementById('btnNuevoPaciente').addEventListener('click', abrirModalNuevoPaciente);
}

function cambiarGrupo(grupo){
  state.grupoActivo = grupo;
  // Si el paciente activo no pertenece al grupo nuevo, lo deseleccionamos
  const activo = getActivePatient();
  if(activo && (activo.grupo||'club') !== grupo){
    state.activePatientId = null;
    refreshSidebarPatient();
  }
  saveState();
  document.querySelectorAll('.group-btn').forEach(b => b.classList.toggle('active', b.dataset.group === grupo));
  goToView('pacientes');
}

function seleccionarPaciente(id){
  state.activePatientId = id;
  saveState();
  refreshSidebarPatient();
  goToView('ficha');
}

function abrirModalNuevoPaciente(){
  openModal(`
    <div class="modal-head">
      <h3>Nuevo paciente — ${escapeHtml(GRUPOS_LABEL[state.grupoActivo])}</h3>
      <button class="modal-close" data-close>&times;</button>
    </div>
    <div class="modal-body">
      <div class="field"><label>Nombre y apellido *</label><input type="text" id="np_nombre" placeholder="Ej: María Gómez"></div>
      <div class="grid-2">
        <div class="field"><label>DNI</label><input type="text" id="np_dni"></div>
        <div class="field"><label>Fecha de nacimiento</label><input type="date" id="np_fnac"></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Teléfono</label><input type="text" id="np_tel"></div>
        <div class="field"><label>Peso corporal (kg)</label><input type="number" step="0.1" id="np_peso" placeholder="Para normalizar fuerza"></div>
      </div>
      <div class="field"><label>Diagnóstico / motivo de consulta</label><input type="text" id="np_diag" placeholder="Ej: Tendinopatía rotuliana"></div>
    </div>
    <div class="modal-foot">
      <button class="btn" data-close>Cancelar</button>
      <button class="btn btn-primary" id="np_guardar">Crear paciente</button>
    </div>
  `);
  document.getElementById('np_guardar').addEventListener('click', () => {
    const nombre = document.getElementById('np_nombre').value.trim();
    if(!nombre){ toast('El nombre es obligatorio', true); return; }
    const p = nuevoPaciente({
      nombre,
      grupo: state.grupoActivo,
      dni: document.getElementById('np_dni').value.trim(),
      fechaNacimiento: document.getElementById('np_fnac').value,
      telefono: document.getElementById('np_tel').value.trim(),
      pesoKg: document.getElementById('np_peso').value,
      diagnostico: document.getElementById('np_diag').value.trim(),
    });
    state.pacientes.push(p);
    state.activePatientId = p.id;
    saveState();
    closeModal();
    refreshSidebarPatient();
    toast('Paciente creado');
    goToView('ficha');
  });
}

/* =====================================================================
   VISTA: FICHA DEL PACIENTE
   ===================================================================== */
function renderFicha(){
  const p = getActivePatient();
  if(!p) return;
  setTopbarActions(`<button class="btn btn-danger" id="btnEliminarPaciente">Eliminar paciente</button>`);
  const root = document.getElementById('view-ficha');
  const edad = p.fechaNacimiento ? calcularEdad(p.fechaNacimiento) : null;

  root.innerHTML = `
    <div class="card section-gap">
      <div class="card-head">
        <h3>Datos personales</h3>
        <button class="btn btn-sm" id="btnEditarDatos">Editar</button>
      </div>
      <div class="card-pad">
        <dl class="kv">
          <dt>Grupo</dt><dd><span class="badge badge-petrol">${escapeHtml(GRUPOS_LABEL[p.grupo||'club'])}</span></dd>
          <dt>Nombre</dt><dd>${escapeHtml(p.nombre)}</dd>
          <dt>DNI</dt><dd>${escapeHtml(p.dni)||'—'}</dd>
          <dt>Edad</dt><dd>${edad!==null ? edad+' años' : '—'}</dd>
          <dt>Peso</dt><dd>${p.pesoKg ? p.pesoKg+' kg' : '—'}</dd>
          <dt>Teléfono</dt><dd>${escapeHtml(p.telefono)||'—'}</dd>
          <dt>Ingreso</dt><dd>${fmtDate(p.fechaIngreso)}</dd>
        </dl>
      </div>
    </div>

    <div class="card section-gap">
      <div class="card-head">
        <h3>Diagnóstico y objetivos</h3>
        <button class="btn btn-sm" id="btnEditarClinico">Editar</button>
      </div>
      <div class="card-pad">
        <dl class="kv">
          <dt>Diagnóstico</dt><dd>${escapeHtml(p.diagnostico)||'—'}</dd>
          <dt>Lesión</dt><dd>${escapeHtml(p.lesion)||'—'}</dd>
          <dt>Objetivos</dt><dd>${escapeHtml(p.objetivos)||'—'}</dd>
          <dt>Antecedentes</dt><dd>${escapeHtml(p.antecedentes)||'—'}</dd>
        </dl>
      </div>
    </div>

    <div class="grid-3">
      <div class="stat-tile"><div class="num">${p.sesiones.length}</div><div class="lbl">Sesiones registradas</div></div>
      <div class="stat-tile"><div class="num">${p.rom.length}</div><div class="lbl">Evaluaciones de ROM</div></div>
      <div class="stat-tile"><div class="num">${p.rutina.length}</div><div class="lbl">Ejercicios en rutina</div></div>
    </div>
  `;

  document.getElementById('btnEditarDatos').addEventListener('click', () => abrirModalEditarDatos(p));
  document.getElementById('btnEditarClinico').addEventListener('click', () => abrirModalEditarClinico(p));
  document.getElementById('btnEliminarPaciente').addEventListener('click', () => confirmarEliminarPaciente(p));
}

function calcularEdad(fechaISO){
  const hoy = new Date();
  const nac = new Date(fechaISO);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if(m < 0 || (m===0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function abrirModalEditarDatos(p){
  openModal(`
    <div class="modal-head"><h3>Editar datos personales</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <div class="field"><label>Nombre y apellido</label><input type="text" id="ed_nombre" value="${escapeHtml(p.nombre)}"></div>
      <div class="grid-2">
        <div class="field"><label>DNI</label><input type="text" id="ed_dni" value="${escapeHtml(p.dni)}"></div>
        <div class="field"><label>Fecha de nacimiento</label><input type="date" id="ed_fnac" value="${p.fechaNacimiento||''}"></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Teléfono</label><input type="text" id="ed_tel" value="${escapeHtml(p.telefono)}"></div>
        <div class="field"><label>Peso corporal (kg)</label><input type="number" step="0.1" id="ed_peso" value="${escapeHtml(p.pesoKg)}"></div>
      </div>
      <div class="field">
        <label>Grupo</label>
        <select id="ed_grupo">
          <option value="club" ${(p.grupo||'club')==='club'?'selected':''}>Club 17 de Agosto</option>
          <option value="consultorio" ${p.grupo==='consultorio'?'selected':''}>Consultorio</option>
        </select>
      </div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="ed_guardar">Guardar</button></div>
  `);
  document.getElementById('ed_guardar').addEventListener('click', () => {
    p.nombre = document.getElementById('ed_nombre').value.trim() || p.nombre;
    p.dni = document.getElementById('ed_dni').value.trim();
    p.fechaNacimiento = document.getElementById('ed_fnac').value;
    p.telefono = document.getElementById('ed_tel').value.trim();
    p.pesoKg = document.getElementById('ed_peso').value;
    const nuevoGrupo = document.getElementById('ed_grupo').value;
    const cambioDeGrupo = nuevoGrupo !== (p.grupo||'club');
    p.grupo = nuevoGrupo;
    saveState(); closeModal(); refreshSidebarPatient(); renderFicha();
    toast(cambioDeGrupo ? 'Datos actualizados y paciente movido de grupo' : 'Datos actualizados');
  });
}

function abrirModalEditarClinico(p){
  openModal(`
    <div class="modal-head"><h3>Editar diagnóstico y objetivos</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <div class="field"><label>Diagnóstico</label><input type="text" id="ec_diag" value="${escapeHtml(p.diagnostico)}"></div>
      <div class="field"><label>Lesión</label><input type="text" id="ec_lesion" value="${escapeHtml(p.lesion)}"></div>
      <div class="field"><label>Objetivos del tratamiento</label><textarea id="ec_obj">${escapeHtml(p.objetivos)}</textarea></div>
      <div class="field"><label>Antecedentes médicos</label><textarea id="ec_antec">${escapeHtml(p.antecedentes)}</textarea></div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="ec_guardar">Guardar</button></div>
  `);
  document.getElementById('ec_guardar').addEventListener('click', () => {
    p.diagnostico = document.getElementById('ec_diag').value.trim();
    p.lesion = document.getElementById('ec_lesion').value.trim();
    p.objetivos = document.getElementById('ec_obj').value.trim();
    p.antecedentes = document.getElementById('ec_antec').value.trim();
    saveState(); closeModal(); renderFicha();
    toast('Datos clínicos actualizados');
  });
}

function confirmarEliminarPaciente(p){
  openModal(`
    <div class="modal-head"><h3>Eliminar paciente</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <p>Vas a eliminar a <strong>${escapeHtml(p.nombre)}</strong> y todos sus datos (evaluaciones, rutina, sesiones). Esta acción no se puede deshacer.</p>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-danger" id="del_confirmar">Eliminar definitivamente</button></div>
  `);
  document.getElementById('del_confirmar').addEventListener('click', () => {
    state.pacientes = state.pacientes.filter(x => x.id !== p.id);
    if(state.activePatientId === p.id) state.activePatientId = null;
    saveState(); closeModal(); refreshSidebarPatient();
    toast('Paciente eliminado');
    goToView('pacientes');
  });
}

/* =====================================================================
   VISTA: ANAMNESIS (con tests sugeridos por articulación)
   ===================================================================== */
function renderAnamnesis(){
  const p = getActivePatient();
  if(!p) return;
  setTopbarActions(`<button class="btn btn-primary" id="btnNuevaAnamnesis">+ Nueva anamnesis</button>`);
  const root = document.getElementById('view-anamnesis');

  if(p.anamnesis.length === 0){
    root.innerHTML = `<div class="empty-state card">
      <h3>Sin anamnesis registrada</h3>
      <p>Registrá el motivo de consulta de ${escapeHtml(p.nombre)} y la articulación afectada para ver los tests clínicos sugeridos por la literatura.</p>
    </div>`;
  }else{
    const ordenadas = [...p.anamnesis].sort((a,b)=> new Date(b.fecha)-new Date(a.fecha));
    root.innerHTML = ordenadas.map(a => {
      const idxOriginal = p.anamnesis.findIndex(x => x.id === a.id);
      return `
      <div class="card section-gap">
        <div class="card-head">
          <div>
            <h3>Anamnesis del ${fmtDate(a.fecha)}</h3>
            <div class="exercise-tags" style="margin-top:6px;">
              ${a.articulaciones.map(art => `<span class="tag">${escapeHtml(art)}</span>`).join('')}
            </div>
          </div>
          <button class="btn btn-sm btn-danger" data-action="del-anam" data-idx="${idxOriginal}">Eliminar</button>
        </div>
        <div class="card-pad">
          <dl class="kv" style="margin-bottom:12px;">
            <dt>Motivo de consulta</dt><dd>${escapeHtml(a.motivoConsulta)||'—'}</dd>
            <dt>Observaciones</dt><dd>${escapeHtml(a.observaciones)||'—'}</dd>
          </dl>
          ${a.articulaciones.map(art => `
            <div class="suggested-tests" style="margin-bottom:8px;">
              <div class="suggested-tests-title">Tests sugeridos — ${escapeHtml(art)}</div>
              ${(TESTS_POR_ARTICULACION[art]||[]).map(t => `<div class="suggested-test-item">• ${escapeHtml(t)}</div>`).join('')}
            </div>
          `).join('')}
        </div>
      </div>`;
    }).join('');
  }

  root.querySelectorAll('[data-action="del-anam"]').forEach(btn => {
    btn.addEventListener('click', () => {
      p.anamnesis.splice(Number(btn.dataset.idx),1);
      saveState(); renderAnamnesis(); toast('Anamnesis eliminada');
    });
  });

  document.getElementById('btnNuevaAnamnesis').addEventListener('click', () => abrirModalNuevaAnamnesis(p));
}

function abrirModalNuevaAnamnesis(p){
  const articulaciones = Object.keys(TESTS_POR_ARTICULACION);
  openModal(`
    <div class="modal-head"><h3>Nueva anamnesis</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <div class="field"><label>Fecha</label><input type="date" id="an_fecha" value="${todayISO()}"></div>
      <div class="field"><label>Motivo de consulta</label><textarea id="an_motivo" placeholder="Ej: dolor anterior de rodilla derecha al subir escaleras, inicio hace 3 semanas"></textarea></div>
      <div class="field">
        <label>Articulación(es) afectada(s)</label>
        <div class="checklist">
          ${articulaciones.map(a => `<label><input type="checkbox" value="${escapeHtml(a)}"> ${escapeHtml(a)}</label>`).join('')}
        </div>
        <div class="field-hint">Vamos a sugerirte los tests clínicos más citados en guías internacionales para cada una.</div>
      </div>
      <div class="field"><label>Observaciones</label><textarea id="an_obs" placeholder="Antecedentes relevantes, mecanismo de lesión, banderas rojas, etc."></textarea></div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="an_guardar">Guardar anamnesis</button></div>
  `);
  document.getElementById('an_guardar').addEventListener('click', () => {
    const articulacionesSel = Array.from(document.querySelectorAll('.checklist input:checked')).map(i=>i.value);
    if(articulacionesSel.length === 0){ toast('Marcá al menos una articulación', true); return; }
    p.anamnesis.push({
      id: uid('anam'),
      fecha: document.getElementById('an_fecha').value || todayISO(),
      motivoConsulta: document.getElementById('an_motivo').value.trim(),
      articulaciones: articulacionesSel,
      observaciones: document.getElementById('an_obs').value.trim(),
    });
    saveState(); closeModal(); renderAnamnesis();
    toast('Anamnesis guardada');
  });
}

/* =====================================================================
   VISTA: EVALUACIÓN ROM (con semáforo)
   ===================================================================== */
function calcularSemaforo(valor, normal){
  if(valor === '' || valor === null || valor === undefined || isNaN(valor)) return 'gris';
  if(normal === 0) return valor <= 5 ? 'verde' : (valor <= 10 ? 'amarillo' : 'rojo');
  const pct = (Number(valor) / normal) * 100;
  if(pct >= 90) return 'verde';
  if(pct >= 70) return 'amarillo';
  return 'rojo';
}
const SEMAFORO_LABEL = {verde:'Normal', amarillo:'Restricción leve', rojo:'Restricción marcada', gris:'Sin dato'};

function renderRom(){
  const p = getActivePatient();
  if(!p) return;
  setTopbarActions(`<button class="btn btn-primary" id="btnNuevaEvalRom">+ Nueva evaluación</button>`);
  const root = document.getElementById('view-rom');

  let historialHtml = '';
  if(p.rom.length === 0){
    historialHtml = `<div class="empty-state card">
      <h3>Sin evaluaciones de ROM</h3>
      <p>Registrá la primera evaluación para empezar a ver el semáforo de movilidad de ${escapeHtml(p.nombre)}.</p>
    </div>`;
  }else{
    const ordenadas = [...p.rom].sort((a,b)=> new Date(b.fecha)-new Date(a.fecha));
    historialHtml = ordenadas.map((ev) => {
      const idxOriginal = p.rom.findIndex(x => x.id === ev.id);
      const counts = {verde:0,amarillo:0,rojo:0,gris:0};
      ev.evaluaciones.forEach(e => counts[calcularSemaforo(e.valor, e.normal)]++);
      return `
      <div class="card section-gap">
        <div class="card-head">
          <div>
            <h3>Evaluación del ${fmtDate(ev.fecha)}</h3>
            <div style="margin-top:6px;display:flex;gap:6px;">
              <span class="badge badge-sage">${counts.verde} normal</span>
              <span class="badge badge-amber">${counts.amarillo} leve</span>
              <span class="badge badge-terra">${counts.rojo} marcada</span>
            </div>
          </div>
          <button class="btn btn-sm btn-danger" data-action="del-rom" data-idx="${idxOriginal}">Eliminar</button>
        </div>
        <div class="card-pad">
          <div class="rom-row head">
            <div>Movimiento</div><div>Normal</div><div>Lado Izq / Der</div><div>Estado</div>
          </div>
          ${ev.evaluaciones.map(e => `
            <div class="rom-row">
              <div>
                <div class="rom-move-name">${escapeHtml(e.zona)} — ${escapeHtml(e.mov)}</div>
              </div>
              <div class="rom-move-normal mono">${e.normal}°</div>
              <div class="mono">${e.valor!==''&&e.valor!==null ? e.valor+'°' : '—'} ${e.lado?('('+e.lado+')'):''}</div>
              <div class="semaforo ${calcularSemaforo(e.valor, e.normal)}">${e.valor!==''&&e.valor!==null ? Math.round((e.valor/ (e.normal||1))*100)+'%' : '·'}</div>
            </div>
          `).join('')}
        </div>
      </div>`;
    }).join('');
  }

  root.innerHTML = `
    <div class="card section-gap card-pad" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:8px;"><span class="semaforo verde" style="width:22px;height:22px;font-size:0;"></span><span style="font-size:13px;color:var(--ink-soft);">≥ 90% del valor normal</span></div>
      <div style="display:flex;align-items:center;gap:8px;"><span class="semaforo amarillo" style="width:22px;height:22px;font-size:0;"></span><span style="font-size:13px;color:var(--ink-soft);">70–89% del valor normal</span></div>
      <div style="display:flex;align-items:center;gap:8px;"><span class="semaforo rojo" style="width:22px;height:22px;font-size:0;"></span><span style="font-size:13px;color:var(--ink-soft);">&lt; 70% del valor normal</span></div>
    </div>
    ${historialHtml}
  `;

  root.querySelectorAll('[data-action="del-rom"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.idx);
      p.rom.splice(i,1);
      saveState(); renderRom(); toast('Evaluación eliminada');
    });
  });

  document.getElementById('btnNuevaEvalRom').addEventListener('click', () => abrirModalNuevaEvalRom(p));
}

function abrirModalNuevaEvalRom(p){
  const zonas = Object.keys(ROM_NORMATIVOS);
  openModal(`
    <div class="modal-head"><h3>Nueva evaluación de ROM</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <div class="field">
        <label>Elegí las articulaciones a evaluar</label>
        <div class="checklist" id="rom_zonas">
          ${zonas.map(z => `<label><input type="checkbox" value="${z}"> ${z}</label>`).join('')}
        </div>
      </div>
      <div class="field"><label>Fecha</label><input type="date" id="rom_fecha" value="${todayISO()}"></div>
      <div id="rom_detalle"></div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="rom_continuar">Continuar</button></div>
  `);

  document.getElementById('rom_continuar').addEventListener('click', () => {
    const seleccionadas = Array.from(document.querySelectorAll('#rom_zonas input:checked')).map(i=>i.value);
    if(seleccionadas.length === 0){ toast('Elegí al menos una articulación', true); return; }
    const fecha = document.getElementById('rom_fecha').value || todayISO();
    abrirModalCompletarRom(p, seleccionadas, fecha);
  });
}

function abrirModalCompletarRom(p, zonas, fecha){
  const filas = [];
  zonas.forEach(z => {
    ROM_NORMATIVOS[z].forEach(m => {
      filas.push({zona:z, mov:m.mov, normal:m.normal});
    });
  });
  openModal(`
    <div class="modal-head"><h3>Completar valores (en grados)</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <p class="field-hint" style="margin-bottom:12px;">Ingresá el valor medido por lado. Dejá vacío si no aplica (ej. movimientos de columna).</p>
      ${filas.map((f,i) => `
        <div class="field" style="border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:10px;">
          <label>${escapeHtml(f.zona)} — ${escapeHtml(f.mov)} <span class="field-hint">(normal: ${f.normal}°)</span></label>
          <div class="grid-2">
            <input type="number" placeholder="Izquierdo" data-i="${i}" data-lado="Izq" class="rom-input">
            <input type="number" placeholder="Derecho" data-i="${i}" data-lado="Der" class="rom-input">
          </div>
        </div>
      `).join('')}
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="rom_guardar">Guardar evaluación</button></div>
  `);

  document.getElementById('rom_guardar').addEventListener('click', () => {
    const evaluaciones = [];
    filas.forEach((f, i) => {
      ['Izq','Der'].forEach(lado => {
        const input = document.querySelector(`.rom-input[data-i="${i}"][data-lado="${lado}"]`);
        const val = input.value;
        if(val !== ''){
          evaluaciones.push({zona:f.zona, mov:f.mov, normal:f.normal, lado, valor:Number(val)});
        }
      });
    });
    if(evaluaciones.length === 0){ toast('Ingresá al menos un valor', true); return; }
    p.rom.push({id: uid('rom'), fecha, evaluaciones});
    saveState(); closeModal(); renderRom();
    toast('Evaluación de ROM guardada');
  });
}

/* =====================================================================
   VISTA: FUERZA (dinamometría kg + N + torque N·m + LSI) con gráfico
   ===================================================================== */
let chartFuerza = null;
let chartDolor = null;
const G_GRAVEDAD = 9.81; // m/s², para convertir kg-fuerza a Newton

function calcularLSI(izq, der){
  // LSI = (lado afectado / lado no afectado) * 100. Tomamos el menor como
  // "afectado" por defecto, ya que es el uso clínico más común.
  if(!izq || !der || izq===0 || der===0) return null;
  const menor = Math.min(izq, der);
  const mayor = Math.max(izq, der);
  return Math.round((menor/mayor)*1000)/10;
}

function kgANewton(kg){
  if(kg===null || kg===undefined || kg==='') return null;
  return Math.round(Number(kg) * G_GRAVEDAD * 100) / 100;
}

function calcularTorque(kg, brazoCm){
  // Torque (N·m) = Fuerza (N) × brazo de palanca (m)
  if(kg===null || kg===undefined || kg==='' || !brazoCm) return null;
  const newton = kgANewton(kg);
  const brazoM = Number(brazoCm) / 100;
  return Math.round(newton * brazoM * 100) / 100;
}

function renderFuerza(){
  const p = getActivePatient();
  if(!p) return;
  setTopbarActions(`<button class="btn btn-primary" id="btnNuevoRegFuerza">+ Nuevo registro</button>`);
  const root = document.getElementById('view-fuerza');

  if(p.fuerza.length === 0){
    root.innerHTML = `<div class="empty-state card">
      <h3>Sin registros de fuerza</h3>
      <p>Registrá mediciones de dinamómetro (kg) por lado, junto con el brazo de palanca, para ver kg, Newton, torque (N·m) y el LSI.</p>
    </div>`;
    document.getElementById('btnNuevoRegFuerza').addEventListener('click', () => abrirModalNuevoRegFuerza(p));
    return;
  }

  const ordenados = [...p.fuerza].sort((a,b)=> new Date(a.fecha)-new Date(b.fecha));
  const grupos = {};
  ordenados.forEach(r => { (grupos[r.ejercicio] = grupos[r.ejercicio]||[]).push(r); });

  root.innerHTML = `
    <div class="card section-gap card-pad">
      <h3 style="margin-bottom:14px;">Evolución de fuerza (kg)</h3>
      <div class="chart-wrap"><canvas id="canvasFuerza"></canvas></div>
      <div class="field-hint" style="margin-top:8px;">El gráfico muestra kg (valor ingresado). Newton y torque se ven en el detalle de cada registro, abajo.</div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Registros</h3></div>
      <div class="card-pad">
        ${[...p.fuerza].sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map((r) => {
          const lsi = calcularLSI(r.kgIzq, r.kgDer);
          const idxOriginal = p.fuerza.findIndex(x => x.id === r.id);
          const nIzq = kgANewton(r.kgIzq), nDer = kgANewton(r.kgDer);
          const tIzq = calcularTorque(r.kgIzq, r.brazoIzqCm), tDer = calcularTorque(r.kgDer, r.brazoDerCm);
          return `
          <div class="routine-block" style="margin-bottom:10px;">
            <div class="routine-block-head">
              <div>
                <div class="exercise-name">${escapeHtml(r.ejercicio)}</div>
                <div class="field-hint">${fmtDate(r.fecha)}</div>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                ${lsi!==null ? `<span class="badge ${lsi>=90?'badge-sage':lsi>=80?'badge-amber':'badge-terra'}">LSI ${lsi}%</span>` : ''}
                <button class="btn btn-sm btn-danger" data-action="del-fuerza" data-idx="${idxOriginal}">Eliminar</button>
              </div>
            </div>
            <div class="grid-2" style="margin-top:10px;">
              <div>
                <div class="field-hint" style="margin-bottom:4px;font-weight:600;">Lado izquierdo${r.brazoIzqCm?' · brazo '+r.brazoIzqCm+' cm':''}</div>
                <div class="unit-grid">
                  <div class="unit-box"><div class="v">${r.kgIzq!==null && r.kgIzq!==undefined ? r.kgIzq : '—'}</div><div class="u">kg</div></div>
                  <div class="unit-box"><div class="v">${nIzq!==null ? nIzq : '—'}</div><div class="u">Newton</div></div>
                  <div class="unit-box"><div class="v">${tIzq!==null ? tIzq : '—'}</div><div class="u">N·m torque</div></div>
                </div>
                ${tIzq!==null && p.pesoKg ? `<div class="field-hint" style="margin-top:4px;">Normalizado: <strong class="mono">${Math.round((tIzq/Number(p.pesoKg))*100)/100}</strong> N·m/kg</div>` : ''}
              </div>
              <div>
                <div class="field-hint" style="margin-bottom:4px;font-weight:600;">Lado derecho${r.brazoDerCm?' · brazo '+r.brazoDerCm+' cm':''}</div>
                <div class="unit-grid">
                  <div class="unit-box"><div class="v">${r.kgDer!==null && r.kgDer!==undefined ? r.kgDer : '—'}</div><div class="u">kg</div></div>
                  <div class="unit-box"><div class="v">${nDer!==null ? nDer : '—'}</div><div class="u">Newton</div></div>
                  <div class="unit-box"><div class="v">${tDer!==null ? tDer : '—'}</div><div class="u">N·m torque</div></div>
                </div>
                ${tDer!==null && p.pesoKg ? `<div class="field-hint" style="margin-top:4px;">Normalizado: <strong class="mono">${Math.round((tDer/Number(p.pesoKg))*100)/100}</strong> N·m/kg</div>` : ''}
              </div>
            </div>
            ${(!p.pesoKg && (tIzq!==null || tDer!==null)) ? `<div class="field-hint" style="margin-top:8px;color:var(--amber);">Cargá el peso del paciente en la Ficha para ver el torque normalizado (N·m/kg) y compararlo con los benchmarks.</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>
  `;

  // Gráfico: una línea por ejercicio/músculo registrado, con izq y der (en kg)
  const labels = [...new Set(ordenados.map(r => r.fecha))].sort();
  const ejercicioKeys = Object.keys(grupos);
  const palette = ['#1b4965','#4f9a6f','#d9952f','#bd4338','#7a5fb5','#2a7f8c'];
  const datasets = [];
  ejercicioKeys.forEach((ej, idx) => {
    const color = palette[idx % palette.length];
    const dataIzq = labels.map(l => {
      const reg = grupos[ej].find(r => r.fecha === l);
      return reg ? reg.kgIzq : null;
    });
    const dataDer = labels.map(l => {
      const reg = grupos[ej].find(r => r.fecha === l);
      return reg ? reg.kgDer : null;
    });
    datasets.push({label:ej+' (Izq)', data:dataIzq, borderColor:color, backgroundColor:color, borderDash:[5,3], spanGaps:true, tension:.25});
    datasets.push({label:ej+' (Der)', data:dataDer, borderColor:color, backgroundColor:color, spanGaps:true, tension:.25});
  });

  if(chartFuerza) chartFuerza.destroy();
  chartFuerza = new Chart(document.getElementById('canvasFuerza'), {
    type:'line',
    data:{ labels: labels.map(fmtDateShort), datasets },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{position:'bottom', labels:{boxWidth:12,font:{size:11}}}},
      scales:{ y:{ title:{display:true,text:'kg'}, beginAtZero:true } }
    }
  });

  root.querySelectorAll('[data-action="del-fuerza"]').forEach(btn => {
    btn.addEventListener('click', () => {
      p.fuerza.splice(Number(btn.dataset.idx),1);
      saveState(); renderFuerza(); toast('Registro eliminado');
    });
  });
  document.getElementById('btnNuevoRegFuerza').addEventListener('click', () => abrirModalNuevoRegFuerza(p));
}

function abrirModalNuevoRegFuerza(p){
  openModal(`
    <div class="modal-head"><h3>Nuevo registro de fuerza</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <div class="field"><label>Fecha</label><input type="date" id="fz_fecha" value="${todayISO()}"></div>
      <div class="field"><label>Ejercicio o músculo evaluado</label><input type="text" id="fz_nombre" placeholder="Ej: Cuádriceps / Press de pierna"></div>
      <div class="grid-2">
        <div class="field"><label>Lado izquierdo (kg)</label><input type="number" step="0.1" id="fz_izq"></div>
        <div class="field"><label>Brazo de palanca izq. (cm)</label><input type="number" step="0.1" id="fz_brazo_izq" placeholder="Distancia art.-dinamómetro"></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Lado derecho (kg)</label><input type="number" step="0.1" id="fz_der"></div>
        <div class="field"><label>Brazo de palanca der. (cm)</label><input type="number" step="0.1" id="fz_brazo_der" placeholder="Distancia art.-dinamómetro"></div>
      </div>
      <div class="field-hint">Con el brazo de palanca calculamos el torque (N·m = Newton × metros). Sin ese dato, mostramos solo kg y Newton.</div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="fz_guardar">Guardar</button></div>
  `);
  document.getElementById('fz_guardar').addEventListener('click', () => {
    const nombre = document.getElementById('fz_nombre').value.trim();
    if(!nombre){ toast('Indicá el ejercicio o músculo', true); return; }
    const kgIzq = document.getElementById('fz_izq').value;
    const kgDer = document.getElementById('fz_der').value;
    const brazoIzq = document.getElementById('fz_brazo_izq').value;
    const brazoDer = document.getElementById('fz_brazo_der').value;
    p.fuerza.push({
      id: uid('fz'),
      fecha: document.getElementById('fz_fecha').value || todayISO(),
      ejercicio: nombre,
      kgIzq: kgIzq===''?null:Number(kgIzq),
      kgDer: kgDer===''?null:Number(kgDer),
      brazoIzqCm: brazoIzq===''?null:Number(brazoIzq),
      brazoDerCm: brazoDer===''?null:Number(brazoDer),
    });
    saveState(); closeModal(); renderFuerza();
    toast('Registro de fuerza guardado');
  });
}

/* =====================================================================
   VISTA: EVALUACIONES FUNCIONALES (Ankle-GO, CKCUEST, Hop Tests, Melbourne)
   ===================================================================== */
function renderFuncionales(){
  const p = getActivePatient();
  if(!p) return;
  setTopbarActions(`<button class="btn btn-primary" id="btnNuevaFuncional">+ Nueva evaluación</button>`);
  const root = document.getElementById('view-funcionales');

  // ---- Benchmarks ACL por fase (Paul Read / VALD) ----
  if(!p.valdFaseActual) p.valdFaseActual = 0;
  const valdHtml = `
    <div class="card section-gap">
      <div class="card-head">
        <div>
          <h3>Benchmarks ACL — Paul Read / VALD</h3>
          <div class="field-hint">Referencia objetivo por fase de rehabilitación post-LCA (Practitioner's Guide to ACL)</div>
        </div>
      </div>
      <div class="card-pad">
        <div class="tabs" id="valdFaseTabs">
          ${VALD_FASES_ACL.map((f,i) => `<button class="tab-btn ${p.valdFaseActual===i?'active':''}" data-fase="${i}">${escapeHtml(f.fase)}</button>`).join('')}
        </div>
        <div class="field-hint" style="margin-bottom:10px;"><strong>Objetivo:</strong> ${escapeHtml(VALD_FASES_ACL[p.valdFaseActual].objetivo)} · <strong>Hito:</strong> ${escapeHtml(VALD_FASES_ACL[p.valdFaseActual].hito)}</div>
        <table>
          <tr><th>Test</th><th>Benchmark objetivo</th></tr>
          ${VALD_FASES_ACL[p.valdFaseActual].items.map(it => `<tr><td>${escapeHtml(it.test)}</td><td class="mono" style="font-size:12.5px;">${escapeHtml(it.benchmark)}</td></tr>`).join('')}
        </table>
        <div class="divider"></div>
        <div class="field-hint" style="margin-bottom:8px;font-weight:600;">Benchmarks generales de fuerza (independientes de fase)</div>
        <table>
          ${VALD_BENCHMARKS_GENERALES.map(b => `<tr><td>${escapeHtml(b.region)}</td><td class="mono">${escapeHtml(b.benchmark)}</td></tr>`).join('')}
        </table>
      </div>
    </div>`;

  let melbourneHtml = '';
  if(p.funcionales.some(f => f.bateria === '__melbourne__')){
    const registroMelbourne = [...p.funcionales].filter(f=>f.bateria==='__melbourne__').sort((a,b)=>new Date(b.fecha)-new Date(a.fecha))[0];
    melbourneHtml = `
      <div class="card section-gap">
        <div class="card-head"><h3>Guía de Melbourne — seguimiento por fases</h3><span class="field-hint">Última actualización: ${fmtDate(registroMelbourne.fecha)}</span></div>
        <div class="card-pad">
          ${MELBOURNE_FASES.map((f, fi) => {
            const cumplidos = registroMelbourne.melbourneCumplidos || [];
            const criteriosCumplidos = f.criterios.filter((_,ci) => cumplidos.includes(fi+'-'+ci)).length;
            const completa = criteriosCumplidos === f.criterios.length;
            return `
            <div class="phase-card">
              <div class="phase-head">
                <span class="phase-title">${escapeHtml(f.fase)}</span>
                <span class="badge ${completa?'badge-sage':'badge-amber'}">${criteriosCumplidos}/${f.criterios.length} criterios</span>
              </div>
              <div class="phase-criteria">
                ${f.criterios.map((c,ci) => `${cumplidos.includes(fi+'-'+ci)?'✓':'○'} ${escapeHtml(c)}`).join('<br>')}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  const otrasEvals = [...p.funcionales].filter(f => f.bateria !== '__melbourne__').sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));
  let otrasHtml = '';
  if(otrasEvals.length === 0 && !melbourneHtml){
    otrasHtml = `<div class="empty-state card">
      <h3>Sin evaluaciones funcionales registradas</h3>
      <p>Registrá baterías como Ankle-GO, CKCUEST, Hop Tests o el seguimiento por fases de la Guía de Melbourne.</p>
    </div>`;
  }else{
    otrasHtml = otrasEvals.map(f => {
      const idxOriginal = p.funcionales.findIndex(x => x.id === f.id);
      const bateria = BATERIAS_FUNCIONALES[f.bateria];
      let totalPts = null;
      if(bateria && bateria.maxPts){
        totalPts = bateria.items.reduce((sum, it) => {
          const v = f.valores[it.id];
          return sum + (typeof v === 'number' ? v : 0);
        }, 0);
      }
      return `
      <div class="battery-card">
        <div class="battery-head">
          <div>
            <div class="battery-name">${escapeHtml(f.bateria)}</div>
            <div class="battery-desc">${fmtDate(f.fecha)}${bateria ? ' · '+escapeHtml(bateria.desc) : ''}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            ${totalPts!==null ? `<span class="badge badge-petrol">${totalPts} / ${bateria.maxPts} pts</span>` : ''}
            <button class="btn btn-sm btn-danger" data-action="del-func" data-idx="${idxOriginal}">Eliminar</button>
          </div>
        </div>
        <div class="battery-body">
          ${bateria ? bateria.items.map(it => `
            <div class="battery-item">
              <div>
                <div class="battery-item-name">${escapeHtml(it.nombre)}</div>
                <div class="battery-item-hint">${escapeHtml(it.hint)}</div>
              </div>
              <div class="battery-score">${f.valores[it.id] !== undefined && f.valores[it.id] !== '' ? f.valores[it.id] : '—'} <span style="font-size:11px;color:var(--ink-soft);">${it.unidad}</span></div>
            </div>
          `).join('') : '<p class="field-hint">Batería no reconocida.</p>'}
        </div>
      </div>`;
    }).join('');
  }

  root.innerHTML = valdHtml + melbourneHtml + otrasHtml;

  root.querySelectorAll('#valdFaseTabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      p.valdFaseActual = Number(btn.dataset.fase);
      saveState(); renderFuncionales();
    });
  });

  root.querySelectorAll('[data-action="del-func"]').forEach(btn => {
    btn.addEventListener('click', () => {
      p.funcionales.splice(Number(btn.dataset.idx),1);
      saveState(); renderFuncionales(); toast('Evaluación eliminada');
    });
  });

  document.getElementById('btnNuevaFuncional').addEventListener('click', () => abrirModalElegirBateria(p));
}

function abrirModalElegirBateria(p){
  const nombres = Object.keys(BATERIAS_FUNCIONALES);
  openModal(`
    <div class="modal-head"><h3>Elegir evaluación funcional</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <div class="field">
        <label>Batería / protocolo</label>
        <select id="fn_bateria">
          ${nombres.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('')}
          <option value="__melbourne__">Guía de Melbourne (seguimiento por fases, LCA)</option>
        </select>
      </div>
      <div class="field"><label>Fecha</label><input type="date" id="fn_fecha" value="${todayISO()}"></div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="fn_continuar">Continuar</button></div>
  `);
  document.getElementById('fn_continuar').addEventListener('click', () => {
    const bateria = document.getElementById('fn_bateria').value;
    const fecha = document.getElementById('fn_fecha').value || todayISO();
    closeModal();
    if(bateria === '__melbourne__') abrirModalMelbourne(p, fecha);
    else abrirModalCompletarBateria(p, bateria, fecha);
  });
}

function abrirModalCompletarBateria(p, nombreBateria, fecha){
  const bateria = BATERIAS_FUNCIONALES[nombreBateria];
  openModal(`
    <div class="modal-head"><h3>${escapeHtml(nombreBateria)}</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <p class="field-hint" style="margin-bottom:12px;">${escapeHtml(bateria.desc)}</p>
      ${bateria.items.map(it => `
        <div class="field">
          <label>${escapeHtml(it.nombre)} <span class="field-hint">— ${escapeHtml(it.hint)}</span></label>
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="number" step="0.1" class="fn-input" data-id="${it.id}" style="max-width:140px;" ${it.soloLectura?'placeholder="opcional"':''}>
            <span class="field-hint">${escapeHtml(it.unidad)}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="fn_guardar">Guardar evaluación</button></div>
  `);
  document.getElementById('fn_guardar').addEventListener('click', () => {
    const valores = {};
    bateria.items.forEach(it => {
      const input = document.querySelector(`.fn-input[data-id="${it.id}"]`);
      if(input.value !== '') valores[it.id] = Number(input.value);
    });
    if(Object.keys(valores).length === 0){ toast('Ingresá al menos un valor', true); return; }
    p.funcionales.push({ id: uid('func'), fecha, bateria: nombreBateria, valores });
    saveState(); closeModal(); renderFuncionales();
    toast('Evaluación funcional guardada');
  });
}

function abrirModalMelbourne(p, fecha){
  const registroPrevio = [...p.funcionales].filter(f=>f.bateria==='__melbourne__').sort((a,b)=>new Date(b.fecha)-new Date(a.fecha))[0];
  const cumplidosPrevios = registroPrevio ? (registroPrevio.melbourneCumplidos||[]) : [];
  openModal(`
    <div class="modal-head"><h3>Guía de Melbourne — LCA</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <p class="field-hint" style="margin-bottom:12px;">Marcá los criterios que el paciente cumple hoy. Protocolo criteria-based (Cooper &amp; Hughes), no por tiempo fijo.</p>
      ${MELBOURNE_FASES.map((f, fi) => `
        <div class="field">
          <label>${escapeHtml(f.fase)}</label>
          <div class="checklist">
            ${f.criterios.map((c,ci) => `<label><input type="checkbox" class="mb-check" data-key="${fi}-${ci}" ${cumplidosPrevios.includes(fi+'-'+ci)?'checked':''}> ${escapeHtml(c)}</label>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="mb_guardar">Guardar seguimiento</button></div>
  `);
  document.getElementById('mb_guardar').addEventListener('click', () => {
    const cumplidos = Array.from(document.querySelectorAll('.mb-check:checked')).map(i => i.dataset.key);
    p.funcionales.push({ id: uid('func'), fecha, bateria: '__melbourne__', valores:{}, melbourneCumplidos: cumplidos });
    saveState(); renderFuncionales();
    toast('Seguimiento de Melbourne guardado');
  });
}

/* =====================================================================
   VISTA: DOLOR (evolución)
   ===================================================================== */
function renderDolor(){
  const p = getActivePatient();
  if(!p) return;
  setTopbarActions(`<button class="btn btn-primary" id="btnNuevoRegDolor">+ Registrar dolor</button>`);
  const root = document.getElementById('view-dolor');

  if(p.dolor.length === 0){
    root.innerHTML = `<div class="empty-state card">
      <h3>Sin registros de dolor</h3>
      <p>Registrá el nivel de dolor (escala 0–10) en cada control para ver la evolución.</p>
    </div>`;
    document.getElementById('btnNuevoRegDolor').addEventListener('click', () => abrirModalNuevoRegDolor(p));
    return;
  }

  const ordenados = [...p.dolor].sort((a,b)=> new Date(a.fecha)-new Date(b.fecha));
  root.innerHTML = `
    <div class="card section-gap card-pad">
      <h3 style="margin-bottom:14px;">Evolución del dolor (EVA 0–10)</h3>
      <div class="chart-wrap"><canvas id="canvasDolor"></canvas></div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Registros</h3></div>
      <div class="card-pad">
        <table>
          <tr><th>Fecha</th><th>Nivel</th><th>Nota</th><th></th></tr>
          ${[...p.dolor].sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map((r) => {
            const idxOriginal = p.dolor.findIndex(x => x.id === r.id);
            const cls = r.valor<=3?'badge-sage':r.valor<=6?'badge-amber':'badge-terra';
            return `<tr>
              <td>${fmtDate(r.fecha)}</td>
              <td><span class="badge ${cls}">${r.valor}/10</span></td>
              <td>${escapeHtml(r.nota)||'—'}</td>
              <td><button class="btn btn-sm btn-danger" data-action="del-dolor" data-idx="${idxOriginal}">Eliminar</button></td>
            </tr>`;
          }).join('')}
        </table>
      </div>
    </div>
  `;

  if(chartDolor) chartDolor.destroy();
  chartDolor = new Chart(document.getElementById('canvasDolor'), {
    type:'line',
    data:{
      labels: ordenados.map(r=>fmtDateShort(r.fecha)),
      datasets:[{
        label:'Dolor (0-10)', data: ordenados.map(r=>r.valor),
        borderColor:'#bd4338', backgroundColor:'rgba(189,67,56,.12)', fill:true, tension:.3, pointRadius:4,
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{ y:{ min:0, max:10, ticks:{stepSize:1} } }
    }
  });

  root.querySelectorAll('[data-action="del-dolor"]').forEach(btn => {
    btn.addEventListener('click', () => {
      p.dolor.splice(Number(btn.dataset.idx),1);
      saveState(); renderDolor(); toast('Registro eliminado');
    });
  });
  document.getElementById('btnNuevoRegDolor').addEventListener('click', () => abrirModalNuevoRegDolor(p));
}

function abrirModalNuevoRegDolor(p){
  openModal(`
    <div class="modal-head"><h3>Registrar dolor</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <div class="field"><label>Fecha</label><input type="date" id="dl_fecha" value="${todayISO()}"></div>
      <div class="field">
        <label>Nivel de dolor (EVA): <span id="dl_valor_display">5</span>/10</label>
        <input type="range" min="0" max="10" value="5" id="dl_valor" style="width:100%;">
      </div>
      <div class="field"><label>Nota (opcional)</label><input type="text" id="dl_nota" placeholder="Ej: dolor al subir escaleras"></div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="dl_guardar">Guardar</button></div>
  `);
  document.getElementById('dl_valor').addEventListener('input', (e) => {
    document.getElementById('dl_valor_display').textContent = e.target.value;
  });
  document.getElementById('dl_guardar').addEventListener('click', () => {
    p.dolor.push({
      id: uid('dl'),
      fecha: document.getElementById('dl_fecha').value || todayISO(),
      valor: Number(document.getElementById('dl_valor').value),
      nota: document.getElementById('dl_nota').value.trim(),
    });
    saveState(); closeModal(); renderDolor();
    toast('Dolor registrado');
  });
}

/* =====================================================================
   VISTA: CUESTIONARIOS AUTOREPORTADOS
   ===================================================================== */
function renderCuestionarios(){
  const p = getActivePatient();
  if(!p) return;
  setTopbarActions(`<button class="btn btn-primary" id="btnNuevoCuest">+ Aplicar cuestionario</button>`);
  const root = document.getElementById('view-cuestionarios');

  if(p.cuestionarios.length === 0){
    root.innerHTML = `<div class="empty-state card">
      <h3>Sin cuestionarios aplicados</h3>
      <p>Aplicá un cuestionario autoreportado para registrar la percepción funcional del paciente.</p>
    </div>`;
  }else{
    const ordenados = [...p.cuestionarios].sort((a,b)=> new Date(b.fecha)-new Date(a.fecha));
    root.innerHTML = ordenados.map((c) => {
      const idxOriginal = p.cuestionarios.findIndex(x => x.id === c.id);
      if(c.nombre === 'Tegner (nivel de actividad)'){
        const nivel = TEGNER_NIVELES.find(n => n.v === c.total);
        return `
        <div class="card section-gap">
          <div class="card-head">
            <div>
              <h3>${escapeHtml(c.nombre)}</h3>
              <div class="field-hint">${fmtDate(c.fecha)}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="badge badge-petrol">Nivel ${c.total}/10</span>
              <button class="btn btn-sm btn-danger" data-action="del-cuest" data-idx="${idxOriginal}">Eliminar</button>
            </div>
          </div>
          <div class="card-pad"><p style="font-size:13.5px;">${escapeHtml(nivel ? nivel.label : '')}</p></div>
        </div>`;
      }
      const max = c.preguntas.length * 4;
      const pct = Math.round((c.total/max)*100);
      return `
      <div class="card section-gap">
        <div class="card-head">
          <div>
            <h3>${escapeHtml(c.nombre)}</h3>
            <div class="field-hint">${fmtDate(c.fecha)}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <span class="badge badge-petrol">${c.total}/${max} pts (${pct}%)</span>
            <button class="btn btn-sm btn-danger" data-action="del-cuest" data-idx="${idxOriginal}">Eliminar</button>
          </div>
        </div>
        <div class="card-pad">
          ${c.preguntas.map((preg,i) => `
            <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line);font-size:13.5px;">
              <span>${escapeHtml(preg)}</span>
              <span class="mono badge-neutral badge" style="margin-left:10px;">${c.respuestas[i]}/4</span>
            </div>
          `).join('')}
        </div>
      </div>`;
    }).join('');
  }

  root.querySelectorAll('[data-action="del-cuest"]').forEach(btn => {
    btn.addEventListener('click', () => {
      p.cuestionarios.splice(Number(btn.dataset.idx),1);
      saveState(); renderCuestionarios(); toast('Cuestionario eliminado');
    });
  });

  document.getElementById('btnNuevoCuest').addEventListener('click', () => abrirModalElegirCuestionario(p));
}

function abrirModalElegirCuestionario(p){
  const nombres = Object.keys(CUESTIONARIOS_PLANTILLA);
  openModal(`
    <div class="modal-head"><h3>Elegir cuestionario</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <div class="field">
        <label>Plantilla</label>
        <select id="cu_plantilla">
          ${nombres.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('')}
          <option value="Tegner (nivel de actividad)">Tegner (nivel de actividad)</option>
        </select>
      </div>
      <div class="field"><label>Fecha</label><input type="date" id="cu_fecha" value="${todayISO()}"></div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="cu_continuar">Continuar</button></div>
  `);
  document.getElementById('cu_continuar').addEventListener('click', () => {
    const nombre = document.getElementById('cu_plantilla').value;
    const fecha = document.getElementById('cu_fecha').value || todayISO();
    closeModal();
    if(nombre === 'Tegner (nivel de actividad)') abrirModalTegner(p, fecha);
    else abrirModalResponderCuestionario(p, nombre, fecha);
  });
}

function abrirModalTegner(p, fecha){
  openModal(`
    <div class="modal-head"><h3>Tegner — nivel de actividad</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <div class="field">
        <label>Elegí el nivel que mejor describe la actividad del paciente</label>
        <select id="tg_nivel">
          ${TEGNER_NIVELES.map(n => `<option value="${n.v}">${n.v} — ${escapeHtml(n.label)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="tg_guardar">Guardar</button></div>
  `);
  document.getElementById('tg_guardar').addEventListener('click', () => {
    const nivel = Number(document.getElementById('tg_nivel').value);
    p.cuestionarios.push({id: uid('cu'), fecha, nombre:'Tegner (nivel de actividad)', preguntas:[], respuestas:[], total: nivel});
    saveState(); renderCuestionarios();
    toast('Nivel de Tegner guardado');
  });
}


function abrirModalResponderCuestionario(p, nombre, fecha){
  const preguntas = CUESTIONARIOS_PLANTILLA[nombre];
  const escalaLabels = ['Sin dificultad','Leve','Moderada','Severa','Incapacitante'];
  openModal(`
    <div class="modal-head"><h3>${escapeHtml(nombre)}</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <p class="field-hint" style="margin-bottom:12px;">Escala: 0 = sin dificultad · 4 = incapacitante</p>
      ${preguntas.map((preg,i) => `
        <div class="field">
          <label>${escapeHtml(preg)}</label>
          <select class="cu-resp" data-i="${i}">
            ${escalaLabels.map((l,v) => `<option value="${v}">${v} — ${l}</option>`).join('')}
          </select>
        </div>
      `).join('')}
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="cu_guardar">Guardar respuestas</button></div>
  `);
  document.getElementById('cu_guardar').addEventListener('click', () => {
    const respuestas = preguntas.map((_,i) => Number(document.querySelector(`.cu-resp[data-i="${i}"]`).value));
    const total = respuestas.reduce((a,b)=>a+b,0);
    p.cuestionarios.push({id: uid('cu'), fecha, nombre, preguntas, respuestas, total});
    saveState(); closeModal(); renderCuestionarios();
    toast('Cuestionario guardado');
  });
}

/* =====================================================================
   VISTA: BIBLIOTECA DE EJERCICIOS (solapas Zona/Articulación/Músculo/Gesto)
   ===================================================================== */
let ejerciciosFiltro = { eje:'zona', valor: null };

function getEjesUnicos(eje){
  const vals = new Set();
  state.ejercicios.forEach(ex => (ex[eje]||[]).forEach(v => vals.add(v)));
  return Array.from(vals).sort();
}

function renderEjercicios(){
  setTopbarActions(`<button class="btn btn-primary" id="btnNuevoEjercicio">+ Agregar ejercicio</button>`);
  const root = document.getElementById('view-ejercicios');

  const ejes = [
    {key:'zona', label:'Zona'},
    {key:'articulacion', label:'Articulación'},
    {key:'musculo', label:'Músculo'},
    {key:'gesto', label:'Gesto'},
  ];

  const valoresDelEje = getEjesUnicos(ejerciciosFiltro.eje);
  if(ejerciciosFiltro.valor && !valoresDelEje.includes(ejerciciosFiltro.valor)) ejerciciosFiltro.valor = null;

  const filtrados = ejerciciosFiltro.valor
    ? state.ejercicios.filter(ex => (ex[ejerciciosFiltro.eje]||[]).includes(ejerciciosFiltro.valor))
    : state.ejercicios;

  root.innerHTML = `
    <div class="tabs">
      ${ejes.map(e => `<button class="tab-btn ${ejerciciosFiltro.eje===e.key?'active':''}" data-eje="${e.key}">${e.label}</button>`).join('')}
    </div>
    <div class="filter-row" id="filterRow">
      <button class="filter-chip ${!ejerciciosFiltro.valor?'active':''}" data-valor="">Todos</button>
      ${valoresDelEje.map(v => `<button class="filter-chip ${ejerciciosFiltro.valor===v?'active':''}" data-valor="${escapeHtml(v)}">${escapeHtml(v)}</button>`).join('')}
    </div>
    <div id="exerciseList">
      ${filtrados.length===0 ? `<div class="empty-state card"><h3>No hay ejercicios con ese filtro</h3></div>` : filtrados.map(ex => `
        <div class="exercise-card">
          <div>
            <div class="exercise-name">${escapeHtml(ex.nombre)}</div>
            ${ex.desc ? `<div class="exercise-desc">${escapeHtml(ex.desc)}</div>` : ''}
            <div class="exercise-tags">
              ${(ex.zona||[]).map(v=>`<span class="tag">${escapeHtml(v)}</span>`).join('')}
              ${(ex.articulacion||[]).map(v=>`<span class="tag" style="background:var(--sage-tint);color:#2f6b46;">${escapeHtml(v)}</span>`).join('')}
              ${(ex.musculo||[]).map(v=>`<span class="tag" style="background:var(--amber-tint);color:#8f6315;">${escapeHtml(v)}</span>`).join('')}
              ${(ex.gesto||[]).map(v=>`<span class="tag" style="background:var(--terra-tint);color:#8c2f26;">${escapeHtml(v)}</span>`).join('')}
            </div>
          </div>
          <button class="btn btn-sm btn-danger" data-action="del-ej" data-id="${ex.id}">Eliminar</button>
        </div>
      `).join('')}
    </div>
  `;

  root.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      ejerciciosFiltro = { eje: btn.dataset.eje, valor: null };
      renderEjercicios();
    });
  });
  root.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      ejerciciosFiltro.valor = btn.dataset.valor || null;
      renderEjercicios();
    });
  });
  root.querySelectorAll('[data-action="del-ej"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.ejercicios = state.ejercicios.filter(e => e.id !== btn.dataset.id);
      saveState(); renderEjercicios(); toast('Ejercicio eliminado');
    });
  });

  document.getElementById('btnNuevoEjercicio').addEventListener('click', abrirModalNuevoEjercicio);
}

function abrirModalNuevoEjercicio(){
  openModal(`
    <div class="modal-head"><h3>Agregar ejercicio</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <div class="field"><label>Nombre *</label><input type="text" id="nx_nombre" placeholder="Ej: Sentadilla búlgara"></div>
      <div class="field"><label>Descripción</label><textarea id="nx_desc" placeholder="Indicación breve de ejecución"></textarea></div>
      <div class="grid-2">
        <div class="field"><label>Zona <span class="field-hint">(separar por comas)</span></label><input type="text" id="nx_zona" placeholder="Ej: Miembro inferior"></div>
        <div class="field"><label>Articulación</label><input type="text" id="nx_artic" placeholder="Ej: Cadera, Rodilla"></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Músculo</label><input type="text" id="nx_musc" placeholder="Ej: Glúteo medio"></div>
        <div class="field"><label>Gesto</label><input type="text" id="nx_gesto" placeholder="Ej: Control de equilibrio"></div>
      </div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="nx_guardar">Guardar ejercicio</button></div>
  `);
  document.getElementById('nx_guardar').addEventListener('click', () => {
    const nombre = document.getElementById('nx_nombre').value.trim();
    if(!nombre){ toast('El nombre es obligatorio', true); return; }
    const splitCsv = (str) => str.split(',').map(s=>s.trim()).filter(Boolean);
    state.ejercicios.push({
      id: uid('ex'),
      nombre,
      desc: document.getElementById('nx_desc').value.trim(),
      zona: splitCsv(document.getElementById('nx_zona').value),
      articulacion: splitCsv(document.getElementById('nx_artic').value),
      musculo: splitCsv(document.getElementById('nx_musc').value),
      gesto: splitCsv(document.getElementById('nx_gesto').value),
    });
    saveState(); closeModal(); renderEjercicios();
    toast('Ejercicio agregado a la biblioteca');
  });
}

/* =====================================================================
   VISTA: RUTINA DEL PACIENTE (planilla editable tipo Excel)
   ===================================================================== */
function renderRutina(){
  const p = getActivePatient();
  if(!p) return;
  setTopbarActions(`<button class="btn btn-primary" id="btnAgregarARutina">+ Agregar ejercicios</button>`);
  const root = document.getElementById('view-rutina');

  if(p.rutina.length === 0){
    root.innerHTML = `<div class="empty-state card">
      <h3>Rutina vacía</h3>
      <p>Agregá ejercicios desde la biblioteca para armar la rutina de ${escapeHtml(p.nombre)}.</p>
    </div>`;
    document.getElementById('btnAgregarARutina').addEventListener('click', () => abrirModalElegirEjerciciosParaRutina(p));
    return;
  }

  root.innerHTML = `
    <div class="sheet-wrap">
      <table class="sheet">
        <thead>
          <tr>
            <th style="min-width:190px;">Ejercicio</th>
            <th style="min-width:160px;">Etiquetas</th>
            <th style="width:80px;">Series</th>
            <th style="width:80px;">Reps</th>
            <th style="width:110px;">Carga</th>
            <th style="min-width:200px;">Notas</th>
            <th style="width:40px;"></th>
          </tr>
        </thead>
        <tbody>
          ${p.rutina.map((item, idx) => {
            const ex = state.ejercicios.find(e => e.id === item.ejercicioId);
            if(!ex) return '';
            return `
            <tr data-idx="${idx}">
              <td class="name-cell">${escapeHtml(ex.nombre)}</td>
              <td class="tag-cell">
                ${(ex.zona||[]).slice(0,1).map(v=>`<span class="tag" style="font-size:10.5px;">${escapeHtml(v)}</span>`).join('')}
                ${(ex.articulacion||[]).slice(0,2).map(v=>`<span class="tag" style="font-size:10.5px;background:var(--sage-tint);color:#2f6b46;">${escapeHtml(v)}</span>`).join('')}
              </td>
              <td><input type="number" class="sheet-input num rt-series" value="${item.series}" data-idx="${idx}"></td>
              <td><input type="number" class="sheet-input num rt-reps" value="${item.reps}" data-idx="${idx}"></td>
              <td><input type="text" class="sheet-input rt-carga" value="${escapeHtml(item.carga||'')}" placeholder="Ej: 4kg" data-idx="${idx}"></td>
              <td><input type="text" class="sheet-input rt-notas" value="${escapeHtml(item.notas||'')}" placeholder="Notas..." data-idx="${idx}"></td>
              <td class="actions-cell"><button class="sheet-row-del" data-action="del-rut-row" data-idx="${idx}" title="Quitar fila">✕</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="field-hint" style="margin-top:8px;">Los cambios en cada celda se guardan automáticamente al salir del campo.</div>
  `;

  // Edición inline: cada celda guarda al perder foco (blur) o Enter
  function guardarCelda(input, campo, esNumero){
    const idx = Number(input.dataset.idx);
    const item = p.rutina[idx];
    if(!item) return;
    item[campo] = esNumero ? (Number(input.value)||0) : input.value.trim();
    saveState();
  }
  root.querySelectorAll('.rt-series').forEach(inp => inp.addEventListener('blur', () => guardarCelda(inp, 'series', true)));
  root.querySelectorAll('.rt-reps').forEach(inp => inp.addEventListener('blur', () => guardarCelda(inp, 'reps', true)));
  root.querySelectorAll('.rt-carga').forEach(inp => inp.addEventListener('blur', () => guardarCelda(inp, 'carga', false)));
  root.querySelectorAll('.rt-notas').forEach(inp => inp.addEventListener('blur', () => guardarCelda(inp, 'notas', false)));
  root.querySelectorAll('.sheet-input').forEach(inp => {
    inp.addEventListener('keydown', (e) => { if(e.key === 'Enter') inp.blur(); });
  });

  root.querySelectorAll('[data-action="del-rut-row"]').forEach(btn => {
    btn.addEventListener('click', () => {
      p.rutina.splice(Number(btn.dataset.idx),1);
      saveState(); renderRutina(); toast('Ejercicio quitado de la rutina');
    });
  });

  document.getElementById('btnAgregarARutina').addEventListener('click', () => abrirModalElegirEjerciciosParaRutina(p));
}

/* ---------- Selector de ejercicios con filtro multi-select por eje ---------- */
let rutinaFiltroMulti = { zona:[], articulacion:[], musculo:[], gesto:[] };
let rutinaSeleccionTemp = new Set();

function abrirModalElegirEjerciciosParaRutina(p){
  rutinaFiltroMulti = { zona:[], articulacion:[], musculo:[], gesto:[] };
  rutinaSeleccionTemp = new Set();
  renderModalSelectorEjerciciosMulti(p);
}

function ejercicioPasaFiltroMulti(ex){
  const ejes = ['zona','articulacion','musculo','gesto'];
  return ejes.every(eje => {
    const seleccionados = rutinaFiltroMulti[eje];
    if(seleccionados.length === 0) return true;
    return (ex[eje]||[]).some(v => seleccionados.includes(v));
  });
}

function renderModalSelectorEjerciciosMulti(p){
  const ejesInfo = [
    {key:'zona', label:'Zona'},{key:'articulacion', label:'Articulación'},
    {key:'musculo', label:'Músculo'},{key:'gesto', label:'Gesto'},
  ];
  const filtrados = state.ejercicios.filter(ejercicioPasaFiltroMulti);

  openModal(`
    <div class="modal-head"><h3>Agregar ejercicios a la rutina</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      ${ejesInfo.map(eje => {
        const valores = getEjesUnicos(eje.key);
        if(valores.length === 0) return '';
        return `
        <div class="multi-filter-group">
          <span class="multi-filter-label">${eje.label}</span>
          <div class="multi-filter-chips" data-eje="${eje.key}">
            ${valores.map(v => `<button type="button" class="multi-chip ${rutinaFiltroMulti[eje.key].includes(v)?'selected':''}" data-eje="${eje.key}" data-valor="${escapeHtml(v)}">${escapeHtml(v)}</button>`).join('')}
          </div>
        </div>`;
      }).join('')}
      <div class="divider"></div>
      <div class="field-hint" style="margin-bottom:8px;">${filtrados.length} ejercicio(s) — marcá los que quieras agregar (selección múltiple)</div>
      <div class="checklist" id="multiExList" style="max-height:280px;">
        ${filtrados.length===0 ? '<p class="field-hint" style="padding:6px;">No hay ejercicios con esos filtros.</p>' : filtrados.map(ex => `
          <label><input type="checkbox" class="ex-multi-check" value="${ex.id}" ${rutinaSeleccionTemp.has(ex.id)?'checked':''}> ${escapeHtml(ex.nombre)}</label>
        `).join('')}
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn" data-close>Cancelar</button>
      <button class="btn btn-primary" id="multi_continuar">Continuar con selección (<span id="multiCount">${rutinaSeleccionTemp.size}</span>)</button>
    </div>
  `);

  root_bind_multi_chips();
  document.querySelectorAll('.ex-multi-check').forEach(chk => {
    chk.addEventListener('change', () => {
      if(chk.checked) rutinaSeleccionTemp.add(chk.value);
      else rutinaSeleccionTemp.delete(chk.value);
      document.getElementById('multiCount').textContent = rutinaSeleccionTemp.size;
    });
  });

  function root_bind_multi_chips(){
    document.querySelectorAll('.multi-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const eje = btn.dataset.eje, valor = btn.dataset.valor;
        const arr = rutinaFiltroMulti[eje];
        const i = arr.indexOf(valor);
        if(i === -1) arr.push(valor); else arr.splice(i,1);
        renderModalSelectorEjerciciosMulti(p);
      });
    });
  }

  document.getElementById('multi_continuar').addEventListener('click', () => {
    if(rutinaSeleccionTemp.size === 0){ toast('Marcá al menos un ejercicio', true); return; }
    abrirModalConfigurarVariosEnRutina(p, Array.from(rutinaSeleccionTemp));
  });
}

function abrirModalConfigurarVariosEnRutina(p, ejercicioIds){
  openModal(`
    <div class="modal-head"><h3>Configurar series y reps</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <p class="field-hint" style="margin-bottom:10px;">Se aplica el mismo esquema a los ${ejercicioIds.length} ejercicios elegidos. Después podés ajustar cada fila individualmente en la planilla.</p>
      <div class="grid-3">
        <div class="field"><label>Series</label><input type="number" id="mv_series" value="3"></div>
        <div class="field"><label>Repeticiones</label><input type="number" id="mv_reps" value="12"></div>
        <div class="field"><label>Carga</label><input type="text" id="mv_carga" placeholder="Ej: 4kg"></div>
      </div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="mv_guardar">Agregar a la rutina</button></div>
  `);
  document.getElementById('mv_guardar').addEventListener('click', () => {
    const series = Number(document.getElementById('mv_series').value)||0;
    const reps = Number(document.getElementById('mv_reps').value)||0;
    const carga = document.getElementById('mv_carga').value.trim();
    ejercicioIds.forEach(id => {
      p.rutina.push({ ejercicioId:id, series, reps, carga, notas:'' });
    });
    saveState(); closeModal(); renderRutina();
    toast(`${ejercicioIds.length} ejercicio(s) agregados a la rutina`);
  });
}

/* =====================================================================
   VISTA: SESIONES
   ===================================================================== */
function renderSesiones(){
  const p = getActivePatient();
  if(!p) return;
  setTopbarActions(`<button class="btn btn-primary" id="btnNuevaSesion">+ Registrar sesión</button>`);
  const root = document.getElementById('view-sesiones');

  if(p.sesiones.length === 0){
    root.innerHTML = `<div class="empty-state card">
      <h3>Sin sesiones registradas</h3>
      <p>Registrá cada sesión para llevar el historial de tratamiento de ${escapeHtml(p.nombre)}.</p>
    </div>`;
  }else{
    const ordenadas = [...p.sesiones].sort((a,b)=> new Date(b.fecha)-new Date(a.fecha));
    root.innerHTML = ordenadas.map((s) => {
      const idxOriginal = p.sesiones.findIndex(x => x.id === s.id);
      return `
      <div class="card section-gap">
        <div class="card-head">
          <div>
            <h3>Sesión del ${fmtDate(s.fecha)}</h3>
            ${s.dolorSesion!==null && s.dolorSesion!==undefined ? `<span class="badge badge-amber" style="margin-top:6px;">Dolor en sesión: ${s.dolorSesion}/10</span>` : ''}
          </div>
          <button class="btn btn-sm btn-danger" data-action="del-ses" data-idx="${idxOriginal}">Eliminar</button>
        </div>
        <div class="card-pad">
          ${s.ejerciciosRealizados.length>0 ? `
            <div class="exercise-tags" style="margin-bottom:10px;">
              ${s.ejerciciosRealizados.map(id => {
                const ex = state.ejercicios.find(e=>e.id===id);
                return ex ? `<span class="tag">${escapeHtml(ex.nombre)}</span>` : '';
              }).join('')}
            </div>` : ''}
          ${s.notas ? `<p style="font-size:13.5px;">${escapeHtml(s.notas)}</p>` : '<p class="field-hint">Sin notas adicionales.</p>'}
        </div>
      </div>`;
    }).join('');
  }

  root.querySelectorAll('[data-action="del-ses"]').forEach(btn => {
    btn.addEventListener('click', () => {
      p.sesiones.splice(Number(btn.dataset.idx),1);
      saveState(); renderSesiones(); toast('Sesión eliminada');
    });
  });

  document.getElementById('btnNuevaSesion').addEventListener('click', () => abrirModalNuevaSesion(p));
}

function abrirModalNuevaSesion(p){
  openModal(`
    <div class="modal-head"><h3>Registrar sesión</h3><button class="modal-close" data-close>&times;</button></div>
    <div class="modal-body">
      <div class="field"><label>Fecha</label><input type="date" id="ss_fecha" value="${todayISO()}"></div>
      <div class="field">
        <label>Ejercicios realizados ${p.rutina.length===0?'<span class="field-hint">(la rutina está vacía)</span>':''}</label>
        <div class="checklist">
          ${p.rutina.map(item => {
            const ex = state.ejercicios.find(e=>e.id===item.ejercicioId);
            return ex ? `<label><input type="checkbox" value="${ex.id}" checked> ${escapeHtml(ex.nombre)}</label>` : '';
          }).join('') || '<span class="field-hint" style="padding:6px;">Agregá ejercicios a la rutina primero.</span>'}
        </div>
      </div>
      <div class="field">
        <label>Dolor durante la sesión (0-10, opcional): <span id="ss_dolor_display">—</span></label>
        <input type="range" min="0" max="10" id="ss_dolor" value="" style="width:100%;">
      </div>
      <div class="field"><label>Notas de la sesión</label><textarea id="ss_notas" placeholder="Evolución, tolerancia, observaciones..."></textarea></div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="ss_guardar">Guardar sesión</button></div>
  `);

  const sliderDolor = document.getElementById('ss_dolor');
  sliderDolor.addEventListener('input', () => {
    document.getElementById('ss_dolor_display').textContent = sliderDolor.value;
  });

  document.getElementById('ss_guardar').addEventListener('click', () => {
    const ejerciciosRealizados = Array.from(document.querySelectorAll('.checklist input:checked')).map(i=>i.value);
    p.sesiones.push({
      id: uid('ses'),
      fecha: document.getElementById('ss_fecha').value || todayISO(),
      ejerciciosRealizados,
      dolorSesion: sliderDolor.value ? Number(sliderDolor.value) : null,
      notas: document.getElementById('ss_notas').value.trim(),
    });
    saveState(); closeModal(); renderSesiones();
    toast('Sesión registrada');
  });
}

/* =====================================================================
   MODAL GENÉRICO
   ===================================================================== */
function openModal(html){
  document.getElementById('modalBox').innerHTML = html;
  document.getElementById('modalOverlay').hidden = false;
  document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeModal));
}
function closeModal(){
  document.getElementById('modalOverlay').hidden = true;
  document.getElementById('modalBox').innerHTML = '';
}
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if(e.target.id === 'modalOverlay') closeModal();
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && !document.getElementById('modalOverlay').hidden) closeModal();
});

/* =====================================================================
   EXPORT / IMPORT
   ===================================================================== */
function exportarDatos(){
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `consultorio-backup-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('Datos exportados');
}

function importarDatos(file){
  const reader = new FileReader();
  reader.onload = (e) => {
    try{
      const parsed = JSON.parse(e.target.result);
      if(!parsed.pacientes){ throw new Error('Formato inválido'); }
      state.pacientes = parsed.pacientes || [];
      state.ejercicios = parsed.ejercicios && parsed.ejercicios.length ? parsed.ejercicios : EJERCICIOS_EJEMPLO;
      state.activePatientId = parsed.activePatientId || null;
      state.grupoActivo = parsed.grupoActivo || 'club';
      state.pacientes.forEach(p => {
        if(!p.grupo) p.grupo = 'club';
        if(p.pesoKg === undefined) p.pesoKg = '';
        if(!p.anamnesis) p.anamnesis = [];
        if(!p.funcionales) p.funcionales = [];
        if(p.valdFaseActual === undefined) p.valdFaseActual = 0;
        (p.fuerza||[]).forEach(r => {
          if(r.brazoIzqCm === undefined) r.brazoIzqCm = null;
          if(r.brazoDerCm === undefined) r.brazoDerCm = null;
        });
      });
      saveState();
      refreshSidebarPatient();
      document.querySelectorAll('.group-btn').forEach(b => b.classList.toggle('active', b.dataset.group === state.grupoActivo));
      toast('Datos importados correctamente');
      goToView('pacientes');
    }catch(err){
      toast('No se pudo importar el archivo: formato inválido', true);
    }
  };
  reader.readAsText(file);
}

/* =====================================================================
   EVENTOS GLOBALES E INICIALIZACIÓN
   ===================================================================== */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => goToView(btn.dataset.view));
});

document.querySelectorAll('.group-btn').forEach(btn => {
  btn.addEventListener('click', () => cambiarGrupo(btn.dataset.group));
});

document.getElementById('btnExport').addEventListener('click', exportarDatos);
document.getElementById('btnImport').addEventListener('click', () => document.getElementById('fileImport').click());
document.getElementById('fileImport').addEventListener('change', (e) => {
  if(e.target.files[0]) importarDatos(e.target.files[0]);
  e.target.value = '';
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

function init(){
  loadState();
  refreshSidebarPatient();
  document.querySelectorAll('.group-btn').forEach(b => b.classList.toggle('active', b.dataset.group === state.grupoActivo));
  const startView = (location.hash || '').replace('#','') || 'pacientes';
  goToView(VIEWS.includes(startView) ? startView : 'pacientes');
}

init();
