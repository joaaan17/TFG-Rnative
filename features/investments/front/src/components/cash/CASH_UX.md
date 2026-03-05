# Pantalla Efectivo — Justificación UX

## Objetivo

Mostrar el efectivo disponible y el historial de movimientos con un diseño minimalista tipo neobanco, fácil de escanear y con detalle bajo demanda.

## Decisiones de diseño

- **Header con jerarquía clara**: Título "Efectivo" y subtítulo "Disponible" en tamaño pequeño; el saldo es el elemento principal (tipografía grande, estilo banking). La variación "este mes" solo se muestra si es distinta de cero y con color semántico (verde entradas).
- **Resumen mensual compacto**: Bloque con entradas/salidas (y comisiones cuando existan) y barra horizontal proporcional para dar contexto visual sin saturar. Se evita un segundo gráfico grande; la pantalla prioriza el historial.
- **Historial como protagonista**: Ocupa la mayor parte del scroll. Agrupación por "Hoy", "Ayer" y "12 Feb" reduce carga cognitiva y permite localizar movimientos por contexto temporal. Cada fila: icono por tipo (compra/venta), título descriptivo, fecha/hora y importe alineado a la derecha con color (verde entradas, rojo salidas).
- **Detalle en modal bajo demanda**: Al pulsar una transacción se abre un bottom sheet con toda la información (importe, fecha, ID, detalle de la operación y beneficio/pérdida en ventas). Se evita sobrecargar la lista; el escaneo rápido se hace en la lista y el detalle solo cuando interesa.
- **Sin lógica de red en la UI**: Los datos se obtienen en hooks (`useCashOverview` → `usePortfolio` + `useTransactions`); los componentes solo reciben props. Facilita tests y un posible cambio a un único endpoint `GET /cash/overview` sin tocar la UI.
- **Consistencia con el design system**: Misma paleta (primary, destructive, icon, text), Hierarchy tipográfica y Spacing. Los iconos (ShoppingBag, TrendingUp) y colores (verde #16A34A para entradas) están alineados con el resto de la app (AssetCard, TransactionsHistoryModal).

## Endpoint backend sugerido

`GET /api/investments/cash/overview` — Devuelve `balance`, `monthlyIn`, `monthlyOut`, `monthlyFees` y `transactions` en una sola llamada. Opcional: el front puede seguir usando `portfolio/me` + `transactions/me` y derivar los mismos datos en `useCashOverview`.
