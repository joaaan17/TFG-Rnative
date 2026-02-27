/**
 * Tipos de dominio para gráficos de cartera (donut).
 * Separación entre datos y presentación: los datos vienen del servicio/VM;
 * el componente solo recibe estas estructuras.
 */

/** Un segmento del donut: etiqueta, porcentaje (0–100) y color. */
export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

/** Props del gráfico donut: solo datos y opciones de presentación. */
export type PortfolioDonutChartProps = {
  /** Segmentos (porcentajes; se normalizan si no suman 100). */
  segments: DonutSegment[];
  /** Tamaño del canvas (ancho = alto). */
  size?: number;
  /** Grosor del anillo. */
  strokeWidth?: number;
  /** Texto central principal (ej. "1.769 $"). */
  centerLabel?: string;
  /** Texto central secundario (ej. "Valor por sector"). */
  centerSublabel?: string;
  /** Mostrar leyenda debajo del gráfico. */
  showLegend?: boolean;
  /** Máximo de ítems en leyenda (resto se puede agrupar como "Otros" si se implementa). */
  maxLegendItems?: number;
};
