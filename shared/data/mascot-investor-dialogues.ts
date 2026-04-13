/**
 * Copy: Guspresario — diálogos por ventana temporal (entrada, 5 min, 15 min en app).
 */
export type MascotDialogueBucket = '0_minutes' | '5_minutes' | '15_minutes';

export type MascotDialoguesFile = {
  mascot: string;
  dialogues: Record<
    MascotDialogueBucket,
    { trigger: number; objective: string; messages: readonly string[] }
  >;
};

export const MASCOT_INVESTOR_DIALOGUES: MascotDialoguesFile = {
  mascot: 'Guspresario',
  dialogues: {
    '0_minutes': {
      trigger: 0,
      objective: 'activar mentalidad de inversor + hábito diario',
      messages: [
        '¡Guau! Llegas justo a tiempo. Hoy no vienes a invertir dinero… vienes a invertir en ti. Y eso, amigo, paga mejores dividendos.',
        'He estado vigilando el mercado… pero lo importante no está ahí fuera. Está aquí dentro —señala tu cabeza—. Vamos a entrenarlo.',
        '¿Listo para hacer algo que la mayoría nunca hace? Aprender antes de invertir. Eso es de perros listos.',
        'Mira, te lo digo claro: el dinero va y viene… pero lo que aprendes hoy se queda contigo para siempre. Vamos a por ello.',
        'Tengo huesos enterrados por todo el jardín… pero mi mejor inversión fue aprender dónde cavar. Hoy te enseño eso.',
        'Bienvenido. Aquí no venimos a apostar… venimos a entender. Y eso cambia todo el juego.',
        '¿Quieres ser rico? Empieza por ser inteligente con tu tiempo. Lo demás viene solo.',
        'Los humanos persiguen dinero. Los inversores persiguen conocimiento. ¿Tú de qué lado estás?',
        'Si hoy solo inviertes 10 minutos en aprender… ya estás por delante del 90% de la gente.',
        'El mercado es ruidoso. La gente se asusta. Pero el que entiende… gana. Vamos a hacerte de ese grupo.',
        'Yo puedo enseñarte dónde están los huesos… pero tú tienes que aprender a olerlos.',
        '¿Sabes cuál es la mejor inversión del mundo? La que haces en tu mente. Y acabas de hacerla.',
        'No necesitas ser rico para empezar. Pero necesitas empezar para llegar a serlo.',
        'Aquí no vas a hacerte rico rápido. Vas a hacerte inteligente… y eso sí escala.',
        '¡Vamos! Hoy no venimos a mirar… venimos a pensar como inversores.',
        'Tu dinero puede trabajar por ti… pero primero tienes que enseñarle cómo. Y eso empieza ahora.',
      ],
    },
    '5_minutes': {
      trigger: 5,
      objective: 'reforzar progreso + eliminar fricción mental',
      messages: [
        'Eh, eh… 5 minutos. Ya no eres el mismo de antes. Ahora sabes más que hace un rato. Y eso es poder.',
        '¿Lo ves? No era tan complicado. El miedo era más grande que el problema.',
        'La mayoría se rinde antes de entender. Tú ya has pasado esa fase. Bien jugado.',
        'Esto es justo lo que separa a los que crecen… de los que solo miran.',
        'Cinco minutos invirtiendo en tu cabeza. Eso sí que tiene interés compuesto.',
        'Mientras otros scrolleaban sin pensar… tú estabas construyendo criterio. Diferencia brutal.',
        'Estás haciendo algo muy raro hoy: pensar antes de actuar. Eso en el mercado es oro.',
        '¿Notas algo? No es dinero… es claridad. Y eso vale más.',
        'Así empieza todo: poco a poco. Como cuando aprendo un truco nuevo… repetición y premio.',
        'No estás perdiendo tiempo. Estás comprando ventaja.',
        'Cinco minutos hoy pueden ahorrarte años de errores mañana. No es broma.',
        'El mercado castiga a los impulsivos… y recompensa a los que entienden. Tú vas bien.',
        'Te lo digo como perro experto: el que aprende primero, come mejor después.',
        'Esto que estás haciendo ahora… es lo que nadie ve, pero lo que marca la diferencia.',
        'Sigue así. Estás construyendo algo que no se ve… pero que se nota en la cartera.',
        'Ya no eres un novato total. Ahora eres un novato peligroso… y eso me gusta.',
      ],
    },
    '15_minutes': {
      trigger: 15,
      objective: 'premiar disciplina + evitar saturación + reforzar identidad',
      messages: [
        '15 minutos. Esto ya no es curiosidad… esto es disciplina. Y eso sí paga.',
        'Te lo digo claro: la mayoría nunca llega aquí. Tú sí. Eso te pone en otra liga.',
        'Esto es exactamente lo que hace un inversor real: parar, pensar, entender.',
        'Si el conocimiento pagara dividendos… ahora mismo estarías cobrando.',
        'Has invertido un cuarto de hora en ti. Rentabilidad infinita.',
        'Oye, máquina… ahora sí: descansa un poco. El cerebro también necesita pasear.',
        'No se trata de hacerlo todo hoy… se trata de hacerlo todos los días.',
        'Lo que estás construyendo no es una cartera… es una mentalidad.',
        'El dinero sigue a la mente entrenada. Siempre.',
        'Has dado más pasos que la mayoría en semanas. Y sin darte cuenta.',
        'Esto es lo que no te enseñan: antes de ganar dinero… tienes que dejar de perderlo.',
        'Si mantienes este ritmo… el futuro no es una duda, es una consecuencia.',
        'Te estás convirtiendo en alguien que entiende. Y eso cambia cómo ves todo.',
        '¿Sabes qué es lo mejor? Nadie te puede quitar lo que has aprendido hoy.',
        'Buen trabajo. Ahora cierra, descansa… y mañana volvemos a construir ventaja.',
        '15 minutos hoy. Repetido cada día. Así se crean los resultados grandes.',
        'Eres constante. Eres curioso. Eres disciplinado. Ya estás jugando a otro nivel.',
      ],
    },
  },
} as const;
