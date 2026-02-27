import React, { useEffect, useRef } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
  LineStyle,
  type LineWidth,
} from 'lightweight-charts';
import type {
  Candle,
  PriceLine,
  ChartMarker,
} from '../types/market-chart.types';

// En web usamos la librería directamente. En native usamos WebView.
const isWeb = Platform.OS === 'web';

export type ChartTheme = {
  layoutBackgroundColor?: string;
  textColor?: string;
  gridColor?: string;
  /** Color velas alcistas (default: verde coherente con app) */
  upColor?: string;
  /** Color velas bajistas (default: destructive de la app) */
  downColor?: string;
  /** Tamaño fuente ejes (p. ej. 11-12 para jerarquía sutil) */
  fontSize?: number;
};

export type ChartSeriesType = 'candlestick' | 'line';

interface LightweightChartViewProps {
  candles: Candle[];
  height?: number;
  width?: number | string;
  /** Tipo de serie: velas o línea (precio de cierre). Mismo chart, misma estética. */
  seriesType?: ChartSeriesType;
  /** Líneas horizontales (precio compra, soporte, resistencia) */
  priceLines?: PriceLine[];
  /** Marcadores en puntos temporales (noticias, compras, eventos) */
  markers?: ChartMarker[];
  /** Tema opcional para integrar con la paleta de la app */
  theme?: ChartTheme;
  /** Vista intradía (1D): muestra horas y medias horas en el eje de tiempo */
  intraday?: boolean;
}

const DEFAULT_CHART_THEME: Required<Omit<ChartTheme, 'fontSize'>> & {
  fontSize?: number;
} = {
  layoutBackgroundColor: '#ffffff',
  textColor: '#333333',
  gridColor: '#eeeeee',
  upColor: '#16A34A', // verde éxito (coherente con asset-card)
  downColor: '#E5484D', // destructive design system
  fontSize: 11,
};

function buildChartHtml(
  candles: Candle[],
  priceLines: PriceLine[] = [],
  markers: ChartMarker[] = [],
  theme: ChartTheme = {},
  seriesType: ChartSeriesType = 'candlestick',
  intraday = false,
): string {
  const t = { ...DEFAULT_CHART_THEME, ...theme };
  const candleData = candles.map((c) => ({
    time: c.time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));
  const dataJson = JSON.stringify(candleData);
  const lineDataJson = JSON.stringify(
    candles.map((c) => ({ time: c.time, value: c.close })),
  );
  const isLine = seriesType === 'line';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://unpkg.com/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: ${t.layoutBackgroundColor}; }
    #chart { width: 100%; height: 100%; min-height: 280px; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    (function() {
      var data = ${dataJson};
      if (!data || data.length === 0) return;
      var container = document.getElementById('chart');
      var fontSize = ${t.fontSize ?? 11};
      var chart = LightweightCharts.createChart(container, {
        layout: {
          background: { color: '${t.layoutBackgroundColor}' },
          textColor: '${t.textColor}',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "DM Sans", sans-serif',
          fontSize: fontSize,
        },
        grid: {
          vertLines: { color: '${t.gridColor}' },
          horzLines: { color: '${t.gridColor}' },
        },
        rightPriceScale: {
          borderColor: 'transparent',
          scaleMargins: { top: 0.1, bottom: 0.15 },
        },
      timeScale: Object.assign({
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'transparent',
      }, ${intraday ? "{ tickMarkFormatter: function(time) { var d = new Date(time * 1000); var h = d.getUTCHours(); var m = d.getUTCMinutes(); var day = ('0' + d.getUTCDate()).slice(-2); var mon = ('0' + (d.getUTCMonth()+1)).slice(-2); if (h === 0 && m === 0) return day + '/' + mon + ' 00:00'; return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; } }" : '{}'}),
        width: container.clientWidth,
        height: container.clientHeight || 280,
        crosshair: {
          vertLine: { color: '${t.textColor}', labelBackgroundColor: '${t.textColor}' },
          horzLine: { color: '${t.gridColor}' },
        },
        handleScroll: ${intraday ? '{ horzTouchDrag: true, vertTouchDrag: false, pressedMouseMove: true, mouseWheel: true }' : 'true'},
        handleScale: ${intraday ? '{ pinch: true, mouseWheel: true, axisPressedMouseMove: true }' : 'true'},
      });
      function formatPriceAbbrev(price) {
        if (price >= 1e12) return (price / 1e12).toFixed(2) + ' T';
        if (price >= 1e9) return (price / 1e9).toFixed(2) + ' B';
        if (price >= 1e6) return (price / 1e6).toFixed(2) + ' M';
        if (price >= 1e3) return (price / 1e3).toFixed(2) + ' K';
        if (price >= 1) return price.toFixed(2);
        if (price >= 0.01) return price.toFixed(4);
        return price.toFixed(6);
      }
      chart.applyOptions({ localization: { priceFormatter: formatPriceAbbrev } });
      var series;
      if (${isLine ? 'true' : 'false'}) {
        var lineData = ${lineDataJson};
        series = chart.addLineSeries({ color: '${t.upColor}', lineWidth: 2 });
        series.setData(lineData);
      } else {
        series = chart.addCandlestickSeries({
          upColor: '${t.upColor}',
          downColor: '${t.downColor}',
          borderVisible: false,
          wickUpColor: '${t.upColor}',
          wickDownColor: '${t.downColor}',
        });
        series.setData(data);
      }
      var priceLinesData = ${JSON.stringify(priceLines)};
      var markersData = ${JSON.stringify(markers)};
      if (Array.isArray(priceLinesData)) {
        priceLinesData.forEach(function(pl) {
          series.createPriceLine({
            price: pl.price,
            color: pl.color || '#ff0000',
            lineWidth: pl.lineWidth ?? 2,
            lineStyle: pl.lineStyle ?? 2,
            axisLabelVisible: pl.axisLabelVisible !== false,
            title: pl.title || '',
          });
        });
      }
      if (Array.isArray(markersData) && markersData.length > 0) {
        series.setMarkers(markersData.map(function(m) {
          return {
            time: m.time,
            position: m.position || 'aboveBar',
            color: m.color || '#2962FF',
            shape: m.shape || 'circle',
            text: m.text || '',
          };
        }));
      }
      chart.timeScale().fitContent();
    })();
  </script>
</body>
</html>`;
}

export function LightweightChartView({
  candles,
  height = 280,
  width = '100%',
  seriesType = 'candlestick',
  priceLines = [],
  markers = [],
  theme,
  intraday = false,
}: LightweightChartViewProps) {
  if (isWeb) {
    return (
      <LightweightChartWeb
        candles={candles}
        height={height}
        width={width}
        seriesType={seriesType}
        priceLines={priceLines}
        markers={markers}
        theme={theme}
        intraday={intraday}
      />
    );
  }
  return (
    <LightweightChartWebView
      candles={candles}
      height={height}
      width={width}
      seriesType={seriesType}
      priceLines={priceLines}
      markers={markers}
      theme={theme}
      intraday={intraday}
    />
  );
}

function LightweightChartWebView({
  candles,
  height,
  seriesType = 'candlestick',
  priceLines,
  markers,
  theme,
  intraday = false,
}: LightweightChartViewProps) {
  const html = React.useMemo(
    () =>
      buildChartHtml(
        candles,
        priceLines ?? [],
        markers ?? [],
        theme ?? {},
        seriesType,
        intraday,
      ),
    [candles, priceLines, markers, theme, seriesType, intraday],
  );

  return (
    <View style={[styles.container, styles.responsive, { height }]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={intraday}
        originWhitelist={['*']}
        nestedScrollEnabled={intraday}
      />
    </View>
  );
}

function LightweightChartWeb({
  candles,
  height,
  seriesType = 'candlestick',
  priceLines = [],
  markers = [],
  theme,
  intraday = false,
}: LightweightChartViewProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const [dimensions, setDimensions] = React.useState({
    width: 0,
    height,
  });
  const chartTheme = React.useMemo(
    () => ({ ...DEFAULT_CHART_THEME, ...theme }),
    [theme],
  );

  useEffect(() => {
    const el = containerRef.current as HTMLElement | null;
    if (Platform.OS !== 'web' || !el || !candles.length) return;

    const w = dimensions.width || el.clientWidth || 400;
    const h = dimensions.height || height;

    const chart = createChart(el, {
      layout: {
        background: { color: chartTheme.layoutBackgroundColor },
        textColor: chartTheme.textColor,
        fontSize: (chartTheme as ChartTheme & { fontSize?: number }).fontSize ?? 11,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "DM Sans", sans-serif',
      },
      grid: {
        vertLines: { color: chartTheme.gridColor },
        horzLines: { color: chartTheme.gridColor },
      },
      rightPriceScale: {
        borderColor: 'transparent',
        scaleMargins: { top: 0.1, bottom: 0.15 },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'transparent',
        ...(intraday && {
          tickMarkFormatter: (time: number) => {
            const d = new Date(time * 1000);
            const h = d.getUTCHours();
            const m = d.getUTCMinutes();
            const day = String(d.getUTCDate()).padStart(2, '0');
            const mon = String(d.getUTCMonth() + 1).padStart(2, '0');
            if (h === 0 && m === 0) return `${day}/${mon} 00:00`;
            return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
          },
        }),
      },
      width: w,
      height: h,
      ...(intraday && {
        handleScroll: { horzTouchDrag: true, vertTouchDrag: false, pressedMouseMove: true, mouseWheel: true },
        handleScale: { pinch: true, mouseWheel: true, axisPressedMouseMove: true },
      }),
      crosshair: {
        vertLine: {
          color: chartTheme.textColor,
          labelBackgroundColor: chartTheme.textColor,
        },
        horzLine: { color: chartTheme.gridColor },
      },
    });

    function formatPriceAbbrev(price: number): string {
      if (price >= 1e12) return (price / 1e12).toFixed(2) + ' T';
      if (price >= 1e9) return (price / 1e9).toFixed(2) + ' B';
      if (price >= 1e6) return (price / 1e6).toFixed(2) + ' M';
      if (price >= 1e3) return (price / 1e3).toFixed(2) + ' K';
      if (price >= 1) return price.toFixed(2);
      if (price >= 0.01) return price.toFixed(4);
      return price.toFixed(6);
    }
    chart.applyOptions({
      localization: { priceFormatter: formatPriceAbbrev },
    });

    const isLine = seriesType === 'line';
    const series = isLine
      ? chart.addSeries(LineSeries, {
          color: chartTheme.upColor,
          lineWidth: 2,
        })
      : chart.addSeries(CandlestickSeries, {
          upColor: chartTheme.upColor,
          downColor: chartTheme.downColor,
          borderVisible: false,
          wickUpColor: chartTheme.upColor,
          wickDownColor: chartTheme.downColor,
        });

    if (isLine) {
      series.setData(
        candles.map((c) => ({
          time: c.time as import('lightweight-charts').UTCTimestamp,
          value: c.close,
        })),
      );
    } else {
      series.setData(
        candles.map((c) => ({
          time: c.time as import('lightweight-charts').UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })),
      );
    }

    for (const pl of priceLines) {
      series.createPriceLine({
        price: pl.price,
        color: pl.color ?? '#ff0000',
        lineWidth: (pl.lineWidth ?? 2) as LineWidth,
        lineStyle: (pl.lineStyle ?? LineStyle.Dashed) as LineStyle,
        axisLabelVisible: pl.axisLabelVisible !== false,
        title: pl.title ?? '',
      });
    }

    if (markers.length > 0) {
      createSeriesMarkers(
        series,
        markers.map((m) => ({
          time: m.time as import('lightweight-charts').UTCTimestamp,
          position: (m.position ?? 'aboveBar') as
            | 'aboveBar'
            | 'belowBar'
            | 'inBar',
          color: m.color ?? '#2962FF',
          shape: (m.shape ?? 'circle') as
            | 'circle'
            | 'square'
            | 'arrowUp'
            | 'arrowDown',
          text: m.text ?? '',
        })),
      );
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry && chartRef.current) {
              const { width: newW, height: newH } = entry.contentRect;
              if (newW > 0 && newH > 0) {
                chartRef.current.resize(newW, newH);
              }
            }
          })
        : null;

    if (resizeObserver && el) {
      resizeObserver.observe(el);
    }

    return () => {
      resizeObserver?.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [
    candles,
    height,
    seriesType,
    priceLines,
    markers,
    chartTheme,
    dimensions.width,
    dimensions.height,
    intraday,
  ]);

  const handleLayout = React.useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width: w, height: h } = e.nativeEvent.layout;
      if (w > 0 && h > 0) {
        setDimensions((prev) =>
          prev.width !== w || prev.height !== h
            ? { width: w, height: h }
            : prev,
        );
      }
    },
    [],
  );

  if (candles.length === 0) {
    return (
      <View
        style={[styles.container, styles.responsive, { height }]}
        onLayout={handleLayout}
      />
    );
  }

  return (
    <View
      ref={(r) => {
        containerRef.current = r as unknown as HTMLElement;
      }}
      style={[styles.container, styles.responsive, { height }]}
      onLayout={handleLayout}
    />
  );
}

const CHART_BORDER_RADIUS = 12;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: CHART_BORDER_RADIUS,
    backgroundColor: 'transparent',
  },
  responsive: {
    width: '100%',
    alignSelf: 'stretch',
  },
  webview: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
});
