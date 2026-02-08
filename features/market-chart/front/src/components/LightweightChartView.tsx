import React, { useEffect, useRef } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import type { Candle } from '../types/market-chart.types';

// En web usamos la librería directamente. En native usamos WebView.
const isWeb = Platform.OS === 'web';

interface LightweightChartViewProps {
  candles: Candle[];
  height?: number;
  width?: number | string;
}

function buildChartHtml(candles: Candle[]): string {
  const dataJson = JSON.stringify(
    candles.map((c) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    })),
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://unpkg.com/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #fff; }
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
      var chart = LightweightCharts.createChart(container, {
        layout: { background: { color: '#ffffff' }, textColor: '#333' },
        grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
        width: container.clientWidth,
        height: container.clientHeight || 280,
        timeScale: { timeVisible: true, secondsVisible: false },
      });
      var candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      candlestickSeries.setData(data);
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
}: LightweightChartViewProps) {
  if (isWeb) {
    return (
      <LightweightChartWeb candles={candles} height={height} width={width} />
    );
  }
  return (
    <LightweightChartWebView candles={candles} height={height} width={width} />
  );
}

function LightweightChartWebView({
  candles,
  height,
}: LightweightChartViewProps) {
  const html = React.useMemo(() => buildChartHtml(candles), [candles]);

  return (
    <View style={[styles.container, styles.responsive, { height }]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        originWhitelist={['*']}
      />
    </View>
  );
}

function LightweightChartWeb({
  candles,
  height,
}: LightweightChartViewProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const [dimensions, setDimensions] = React.useState({
    width: 0,
    height,
  });

  useEffect(() => {
    const el = containerRef.current as HTMLElement | null;
    if (Platform.OS !== 'web' || !el || !candles.length) return;

    const w = dimensions.width || el.clientWidth || 400;
    const h = dimensions.height || height;

    const chart = createChart(el, {
      layout: { background: { color: '#ffffff' }, textColor: '#333' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      width: w,
      height: h,
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    candlestickSeries.setData(
      candles.map((c) => ({
        time: c.time as import('lightweight-charts').UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
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
  }, [candles, height, dimensions.width, dimensions.height]);

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

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#fff',
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
