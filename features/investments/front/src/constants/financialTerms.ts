/**
 * Explicaciones de términos financieros para el tooltip de long-press.
 * Clave = label tal como aparece en la UI.
 */
export const FINANCIAL_TERMS: Record<string, string> = {
  // -- Datos del día (QuoteGrid) --
  Open: 'Precio al que abrió la sesión de trading del día. Es la primera transacción registrada cuando el mercado se abrió.',
  High: 'Precio más alto alcanzado durante la sesión de hoy. Refleja el punto de mayor demanda del día.',
  Low: 'Precio más bajo registrado durante la sesión de hoy. Indica el nivel de mayor presión vendedora.',
  Volume:
    'Número total de acciones negociadas durante la sesión. Un volumen alto indica mucho interés y liquidez; uno bajo puede significar menor actividad.',
  'Mkt Cap':
    'Capitalización de mercado: precio actual de la acción × acciones en circulación. Resume el valor total que el mercado asigna a la empresa.',
  Moneda: 'Divisa en la que cotiza el activo (ej. USD, EUR). Las operaciones y precios se expresan en esta moneda.',

  // -- Fundamentales (FundamentalsList) --
  'PER (P/E)':
    'Price-to-Earnings Ratio. Compara el precio de la acción con el beneficio anual por acción. Un PER alto sugiere expectativas de crecimiento; uno bajo puede indicar infravaloración o problemas.',
  EPS: 'Earnings Per Share (Beneficio por acción). Beneficio neto de la empresa dividido entre las acciones en circulación. Cuanto mayor, más rentable es cada acción.',
  'Quick Ratio':
    'Ratio de liquidez inmediata. Mide la capacidad de la empresa para pagar deudas a corto plazo con activos líquidos (sin inventario). Un valor >1 indica buena salud financiera.',
  Beta: 'Mide la volatilidad del activo respecto al mercado (ej. S&P 500). Beta = 1 se mueve igual que el mercado; >1 es más volátil; <1 es más estable.',
  'Market Cap':
    'Capitalización de mercado total. Clasifica la empresa por tamaño: large cap (>10 B), mid cap (2-10 B) o small cap (<2 B).',
  Sector:
    'Sector económico al que pertenece la empresa (ej. Tecnología, Salud, Energía). Permite comparar con otras empresas similares.',
  Industria:
    'Subsector o actividad específica dentro del sector. Afina la clasificación para entender mejor a qué se dedica la empresa.',

  // -- Tu posición (MarketCandlesModal) --
  Acciones:
    'Número de acciones que posees de este activo. Se actualiza automáticamente tras cada compra o venta.',
  'Precio medio compra':
    'Coste promedio ponderado al que adquiriste tus acciones. Se calcula sumando el coste total de todas tus compras y dividiendo entre las acciones totales.',
  'Valor actual':
    'Valor total de tu posición a precio de mercado actual (acciones × precio actual). Cambia en tiempo real.',
  Beneficios:
    'Ganancia o pérdida no realizada: diferencia entre el valor actual de tu posición y lo que pagaste. Se llama "no realizada" porque no has vendido todavía.',

  // -- Selector de rango temporal (parte superior del gráfico) --
  '1 s':
    '1 semana. Muestra la evolución del precio en los últimos 7 días. Ideal para ver movimientos a muy corto plazo.',
  '1 m':
    '1 mes. Muestra la evolución del precio en los últimos 30 días. Útil para detectar tendencias recientes.',
  '3 m':
    '3 meses. Amplia la vista a un trimestre. Permite ver si el activo está en una tendencia alcista, bajista o lateral.',
  '6 m':
    '6 meses. Medio año de datos. Bueno para evaluar tendencias de medio plazo y patrones estacionales.',
  '1 a':
    '1 año. Vista completa de 12 meses. Ofrece perspectiva sobre el comportamiento anual del activo.',

  // -- Selector de timeframe (parte inferior del gráfico) --
  '1h':
    'Cada vela/punto representa 1 hora de trading. Muestra mucho detalle intradía; útil para operaciones a corto plazo.',
  '6h':
    'Cada vela/punto representa 6 horas. Reduce el ruido respecto a 1h, manteniendo buena resolución intradía.',
  '1D':
    'Cada vela/punto representa 1 día completo de trading. El timeframe más habitual para inversores a medio/largo plazo.',
  '1M':
    'Cada vela/punto representa 1 mes. Comprime mucha información; ideal para ver la evolución a muy largo plazo.',

  // -- Tipo de gráfico --
  'Gráfico de velas':
    'Velas japonesas (candlestick). Cada vela muestra apertura, cierre, máximo y mínimo del periodo. El cuerpo lleno indica bajada; el cuerpo con color indica subida.',
  'Gráfico de línea':
    'Gráfico de línea. Conecta los precios de cierre de cada periodo con una línea continua. Más limpio y fácil de leer que las velas.',

  // -- Evolución de la cartera (PortfolioPerformanceChart) --
  '1 D':
    'Un día. Muestra cómo ha variado el valor de tu cartera en las últimas 24 horas, con detalle intradía (línea por hora cuando hay pocos datos).',
  '1 S':
    'Una semana. Evolución de los últimos 7 días. Útil para ver el efecto reciente de mercado y operaciones.',
  '1 M':
    'Un mes. Evolución aproximada de 30 días. Buena vista para tendencias recientes sin perder el contexto.',
  '3 M':
    'Tres meses. Vista trimestral del valor de la cartera: ayuda a ver si vas ganando o perdiendo tracción en el medio plazo.',
  '6 M':
    'Seis meses. Medio año de historia: útil para comparar con objetivos a medio plazo.',
  '1 A':
    'Un año. Evolución anual completa de tu cartera: perspectiva de largo plazo.',
  'Valor cartera':
    'Valor total de la cartera: efectivo disponible más el valor de mercado de todas tus posiciones (acciones). Es el patrimonio invertido que ves arriba en la pantalla.',
  Invertido:
    'Solo el capital que has destinado a comprar acciones (coste de las posiciones), sin contar la ganancia o pérdida no realizada. Contrasta con el valor de mercado total cuando eliges "Valor cartera".',
  'Evolución de la cartera':
    'Gráfico de línea que muestra cómo ha variado en el tiempo el valor que eliges abajo: el total de la cartera (efectivo + posiciones a precio de mercado) o solo el dinero invertido en acciones.',
  'Valor total cartera':
    'Importe total de tu patrimonio en inversiones: efectivo disponible más el valor actual de mercado de todas tus posiciones. Se actualiza con las cotizaciones.',
  'Cash disponible':
    'Dinero en efectivo en tu cuenta de inversiones, sin contar el valor de las acciones. Es lo que puedes usar para nuevas compras o retirar.',
};
