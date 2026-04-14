/**
 * Explicaciones de términos financieros para el modal de ayuda (toque o pulsación larga según la zona).
 * Clave = label tal como aparece en la UI.
 * Textos con más contexto para que el usuario entienda qué mide cada dato y cómo interpretarlo.
 */
export const FINANCIAL_TERMS: Record<string, string> = {
  // -- Datos del día (QuoteGrid) --
  Open:
    'Precio de la primera operación válida cuando el mercado abre la sesión (o el primer precio negociado del día en ese mercado).\n\n' +
    'Sirve como referencia: si el precio actual está por encima del open, la sesión va en terreno positivo respecto a la apertura; si está por debajo, en terreno negativo. No indica por sí solo si la acción es “buena” o “mala”, solo marca el punto de partida del día.',

  High:
    'El precio más alto al que se ha llegado a negociar el activo durante la sesión de hoy.\n\n' +
    'Indica el máximo de demanda relativa en ese periodo: por encima de ese nivel no hubo acuerdos suficientes entre compradores y vendedores. Comparar con el Low y el cierre ayuda a ver si el día está cerrando cerca del máximo (fuerza) o lejos de él (rechazo o toma de beneficios).',

  Low:
    'El precio más bajo al que se ha llegado a negociar el activo durante la sesión de hoy.\n\n' +
    'Marca el nivel de mayor presión vendedora intradía. Un Low muy alejado del High indica mucha volatilidad ese día. Si el precio actual está cerca del Low, la sesión puede estar débil; si recupera desde el Low, puede haber compras en caídas.',

  Volume:
    'Volumen: número total de acciones (o títulos) que han cambiado de manos en la sesión.\n\n' +
    'Un volumen alto suele indicar que muchos participantes están activos (liquidez, interés, noticias o eventos). Un volumen muy bajo puede indicar poco interés o dificultad para entrar/salir sin mover el precio. Si el precio sube mucho con volumen alto, el movimiento suele considerarse más “confirmado” que con volumen muy bajo.',

  'Mkt Cap':
    'Capitalización de mercado: precio actual de la acción × número de acciones en circulación.\n\n' +
    'Es una forma de resumir el tamaño que el mercado asigna a la empresa en bolsa. No es el efectivo en caja de la empresa, sino el valor de mercado de la parte que cotiza. Empresas grandes (large cap) suelen ser más estables en relación; las pequeñas (small cap) pueden ser más volátiles y con más riesgo. Sirve para comparar magnitud entre empresas del mismo sector.',

  Moneda:
    'Divisa en la que cotiza y se cotiza el activo en este listado (por ejemplo USD, EUR).\n\n' +
    'Todos los precios, operaciones y totales de tu posición en esta pantalla se muestran en esa moneda. Si tu cuenta o tu moneda mental es otra, ten en cuenta el tipo de cambio al valorar ganancias o pérdidas.',

  // -- Fundamentales (FundamentalsList) --
  'PER (P/E)':
    'Price-to-Earnings ratio (PER): relaciona el precio de la acción con el beneficio por acción (normalmente últimos 12 meses o estimado).\n\n' +
    'Indica cuántos años de beneficios actuales “estás pagando” al precio actual. Un PER alto puede reflejar expectativas de crecimiento o una acción cara; un PER bajo puede indicar infravaloración o problemas en el negocio. No conviene comparar PER entre sectores muy distintos sin contexto: en tecnología suele ser más alto que en utilities, por ejemplo.',

  EPS:
    'EPS (Earnings Per Share): beneficio neto atribuible a accionistas, dividido entre el número de acciones en circulación.\n\n' +
    'Mide cuánto beneficio contable genera la empresa por cada acción. Si el EPS crece en el tiempo, suele ser una señal positiva; si cae, conviene entender si es por un año puntual, por más acciones emitidas o por problemas operativos. Se usa junto con PER y otros ratios para valorar la rentabilidad.',

  'Quick Ratio':
    'Ratio de liquidez rápida (Quick Ratio): compara activos muy líquidos (caja, equivalentes, deudores) con pasivos a corto plazo, excluyendo inventarios.\n\n' +
    'Responde a: “¿Puede la empresa afrontar deudas inmediatas sin depender de vender inventario?” Un valor claramente por encima de 1 suele indicar margen de maniobra; muy por debajo puede ser una alerta, aunque el sector importa (p. ej. retail suele tener inventarios altos).',

  Beta:
    'Beta mide la sensibilidad histórica del precio de la acción respecto a un índice de referencia (a menudo el mercado amplio).\n\n' +
    'Beta ≈ 1: suele moverse en línea con el mercado. Beta > 1: tiende a amplificar los movimientos del mercado (más subidas y más bajadas en relación). Beta < 1: suele moverse menos que el mercado. No predice el futuro ni garantiza rendimiento; solo describe volatilidad relativa pasada.',

  'Market Cap':
    'Capitalización de mercado: mismo concepto que “Mkt Cap” en la parte de cotización —valor total de la empresa en bolsa según precio × acciones.\n\n' +
    'Aquí se usa para situar el tamaño de la compañía. Tradicionalmente se habla de large cap (grandes), mid cap (medianas) y small cap (pequeñas), con umbrales orientativos que pueden variar según la fuente. El tamaño no implica “mejor” inversión, pero sí suele asociarse a distinto riesgo y liquidez.',

  Sector:
    'Sector económico amplio al que pertenece la empresa (por ejemplo consumo discrecional, tecnología, salud, financiero).\n\n' +
    'Sirve para agrupar compañías similares y comparar métricas o tendencias. Dos empresas del mismo sector pueden verse afectadas por los mismos factores macroeconómicos o regulatorios.',

  Industria:
    'Industria o subsector: actividad concreta dentro del sector (por ejemplo “Internet retail” frente a consumo en general).\n\n' +
    'Afina la comparación con competidores directos: empresas de la misma industria suelen tener modelos de negocio y márgenes más parecidos que empresas del mismo sector pero de otra industria.',

  // -- Tu posición (MarketCandlesModal) --
  Acciones:
    'Número de acciones que posees de este activo en tu cartera de INVESTIA.\n\n' +
    'Se actualiza con cada compra (suma) y cada venta (resta). Si el número tiene decimales, es porque en alguna operación se permitió fracciones o el cálculo interno mantiene precisión. Para el valor de tu posición se multiplica este número por el precio de mercado actual.',

  'Precio medio compra':
    'Coste medio ponderado de lo que te ha costado adquirir las acciones que aún tienes.\n\n' +
    'Si compras varias veces a distintos precios, no es el precio de la última compra, sino el promedio ponderado por cantidad. Ejemplo: 10 acciones a 100 $ y 10 acciones a 120 $ dan un medio de 110 $ por acción. Sirve para comparar con el precio actual y ver si tu posición va en ganancia o pérdida no realizada.',

  'Valor actual':
    'Valor de mercado de tu posición ahora mismo: número de acciones × precio de cotización actual (o último disponible).\n\n' +
    'Cambia cuando el mercado mueve el precio. No es el dinero que tienes en el banco hasta que vendas; es el valor teórico si cerraras la posición al precio mostrado. Puede diferir ligeramente del último trade en tiempo real según la fuente de datos.',

  Beneficios:
    'Beneficio o pérdida no realizada (también llamada “latente”): diferencia entre el valor actual de tu posición y el dinero que invertiste en esas acciones (según precio medio de compra).\n\n' +
    '“No realizada” significa que no has vendido: es un ganancia o pérdida en papel. Si vendes, pasa a realizada y puede tener implicaciones fiscales según tu país. Un número positivo en verde indica que, al precio actual, tu posición vale más de lo que te costó; en rojo, lo contrario.',

  // -- Selector de rango temporal (parte superior del gráfico) --
  '1 s':
    'Rango de visualización: aproximadamente una semana de datos de precio.\n\n' +
    'La barra superior elige el “tramo” histórico que ves en el gráfico (cuántos días o semanas atrás). No confundir con la granularidad de cada punto (eso lo marca la fila inferior: 1h, 6h, 1D, 1M). Útil para ver el comportamiento muy reciente del activo.',

  '1 m':
    'Rango de visualización: aproximadamente un mes de historia de precio.\n\n' +
    'Equilibra detalle reciente y contexto: ves si el activo subió o bajó en las últimas semanas. Combina con el timeframe inferior para ver el mismo periodo con más o menos detalle por vela.',

  '3 m':
    'Rango de visualización: aproximadamente tres meses (un trimestre).\n\n' +
    'Ayuda a ver tendencias corto-medio plazo y a superar el ruido de unos pocos días. Útil para ver si el precio está en una fase alcista, bajista o lateral en el trimestre.',

  '6 m':
    'Rango de visualización: aproximadamente medio año.\n\n' +
    'Permite evaluar tendencias de medio plazo y comparar con resultados de empresa o noticias en ese horizonte. Suele mostrar varias fases de mercado (subidas, correcciones).',

  '1 a':
    'Rango de visualización: aproximadamente un año completo.\n\n' +
    'Ofrece perspectiva anual: estacionalidad, grandes subidas o caídas y cómo el activo se comportó frente a un año de referencia. Para inversión de largo plazo, es una vista muy habitual.',

  // -- Selector de timeframe (parte inferior del gráfico) --
  '1h':
    'Granularidad del gráfico: cada vela o punto representa aproximadamente una hora de negociación (según el proveedor de datos y el mercado).\n\n' +
    'Mide el detalle intradía: más velas, más zoom. Requiere que el rango superior no sea demasiado largo (si el histórico es muy amplio, el servidor puede limitar datos). Útil para ver movimientos dentro del día.',

  '6h':
    'Granularidad del gráfico: cada vela o punto agrupa varias horas (p. ej. bloques de 6 horas), según el backend y la fuente.\n\n' +
    'Reduce el ruido respecto a 1h y sigue dando una lectura intradía o multirango. Buen compromiso para ver tendencias cortas sin tantas velas como en 1h.',

  '1D':
    'Granularidad del gráfico: cada vela o punto representa un día de trading completo.\n\n' +
    'Es el estándar de muchos inversores: el precio de cierre de cada día resume la sesión. Para rangos largos (meses o año), ver el día a día permite ver tendencias claras sin saturar.',

  '1M':
    'Granularidad del gráfico: cada vela o punto representa aproximadamente un mes.\n\n' +
    'Comprime mucha información: útil para ver tendencias de largo plazo y ciclos. Cada punto resume muchos días, así que pierdes detalle intradía pero ganas claridad en la dirección general.',

  // -- Tipo de gráfico --
  'Gráfico de velas':
    'Gráfico de velas japonesas (candlestick). Cada vela muestra cuatro precios del periodo: apertura (open), cierre (close), máximo (high) y mínimo (low).\n\n' +
    'El cuerpo (rectángulo) va entre apertura y cierre; las mechas (líneas finas) muestran hasta dónde llegó el precio en el periodo. Los colores indican si el cierre fue mayor o menor que la apertura (según la paleta de la app). Es más rico en información que la línea, pero más cargado visualmente.',

  'Gráfico de línea':
    'Gráfico de línea que conecta los precios de cierre de cada periodo consecutivo.\n\n' +
    'Ignora apertura, máximo y mínimo intermedios: solo el cierre. Por eso es más simple y limpio para ver la tendencia general. Útil cuando la prioridad es entender la dirección del precio, no la microestructura de cada periodo.',

  'Gráfico de montaña':
    'Vista de línea / área (a veces llamada “montaña”): el precio de cierre se une con una línea y suele rellenarse el área bajo la curva para dar sensación de volumen o “masa” de precio.\n\n' +
    'Es la vista por defecto en INVESTIA para este gráfico: más legible que las velas para captar la tendencia de un vistazo. La lectura es la misma que una línea de cierres; el relleno es solo ayuda visual.',

  // -- Evolución de la cartera (PortfolioPerformanceChart) --
  '1 D':
    'Un día. Muestra cómo ha variado el valor de tu cartera en la última jornada relevante, con detalle cuando hay datos intradía (puntos por hora u otra granularidad).\n\n' +
    'Sirve para ver el movimiento de un solo día de mercado, no el rendimiento acumulado desde hace un año.',

  '1 S':
    'Una semana. Evolución de los últimos 7 días del valor de tu cartera en INVESTIA.\n\n' +
    'Incluye el efecto de cotizaciones de tus acciones y, si operaste, cambios por compras o ventas. Útil para ver el impacto reciente del mercado o de tus operaciones.',

  '1 M':
    'Un mes. Evolución aproximada de 30 días del valor total de tu cartera.\n\n' +
    'Equilibra detalle y contexto: ves si el patrimonio ha subido o bajido en el último mes sin perder el zoom en el corto plazo.',

  '3 M':
    'Tres meses. Vista trimestral del valor de tu cartera.\n\n' +
    'Permite ver si vas ganando o perdiendo tracción en el medio plazo y suaviza el ruido de unos pocos días malos o buenos.',

  '6 M':
    'Seis meses. Medio año de historia del valor de tu cartera.\n\n' +
    'Útil para comparar con objetivos a medio plazo y para ver el efecto acumulado de mercado y aportaciones o retiradas.',

  '1 A':
    'Un año. Evolución anual del valor de tu cartera.\n\n' +
    'Perspectiva de largo plazo: ideal para ver cómo ha crecido o no tu patrimonio invertido en un horizonte de doce meses.',

  'Valor cartera':
    'En el interruptor inferior, “Valor cartera” representa el valor total de tu patrimonio en inversiones: efectivo disponible más el valor de mercado de todas tus posiciones en acciones.\n\n' +
    'Es una foto de “cuánto vale todo lo que tienes en la app” en ese momento, no solo lo que invertiste al principio.',

  Invertido:
    'Solo el capital que has destinado a comprar acciones (coste de adquisición de tus posiciones), sin contar la ganancia o pérdida no realizada por movimientos de precio.\n\n' +
    'Contrasta con “Valor cartera”: si el mercado sube, el valor de cartera puede ser mayor que lo invertido; si baja, el contrario. Sirve para ver separadamente “cuánto dinero puse” frente a “cuánto vale ahora”.',

  'Evolución de la cartera':
    'Gráfico de línea que muestra cómo ha cambiado en el tiempo el valor que eliges abajo: el total de la cartera (efectivo + posiciones a precio de mercado) o solo el dinero invertido en acciones.\n\n' +
    'El eje temporal lo marca el selector de rango (1 D, 1 S, etc.). No es un rendimiento anualizado garantizado: es la serie histórica del valor que la app calcula con tus datos.',

  'Valor total cartera':
    'Importe total de tu patrimonio en inversiones en INVESTIA: efectivo disponible más el valor actual de mercado de todas tus posiciones.\n\n' +
    'Se actualiza con las cotizaciones. Es la cifra principal que suele mostrarse arriba en la página de cartera para resumir “cuánto tienes” en conjunto.',

  'Cash disponible':
    'Efectivo o saldo disponible en tu cuenta de inversiones dentro de la app: dinero que no está invertido en acciones en ese momento.\n\n' +
    'Es lo que puedes usar para nuevas compras o que podrías retirar según las reglas del producto. No incluye el valor de las acciones; para eso está el valor total de cartera.',
};
