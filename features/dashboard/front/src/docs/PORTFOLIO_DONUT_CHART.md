# PortfolioDonutChart — Documentación técnica

Gráfico tipo donut para distribución por sector/geografía en la app de inversión. Implementación con **react-native-svg** (sin librerías de charts externas), reutilizable y desacoplada de la fuente de datos.

---

## 1) Librerías para donut en React Native (gratuitas / open source)

| Librería                              | Ventajas                                                     | Inconvenientes                                              | Uso fintech                                                                        |
| ------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **react-native-gifted-charts**        | Pie/donut, bar, line, animaciones, TypeScript, muy mantenido | Dependencias (gifted-charts-core), bundle más grande        | Muy adecuado si se quieren más tipos de gráficos y animaciones out-of-the-box      |
| **@figliolia/rn-donut-chart**         | Solo donut, animaciones, cero deps, ligero                   | Menos customizable que una implementación propia            | Bueno para un donut simple y animado                                               |
| **react-native-chart-kit**            | Pie chart, sencillo                                          | Poco mantenido (años sin actualizaciones), sin donut nativo | No recomendado para producción                                                     |
| **react-native-svg** (enfoque actual) | Sin deps de charts, control total, donut correcto, ligero    | Hay que implementar arcos y leyenda a mano                  | **Recomendado** para una app financiera: control total, sin sorpresas de versiones |

**Recomendación para app financiera:** Implementación propia con **react-native-svg** (como en este feature): máxima control sobre diseño, accesibilidad y rendimiento; sin dependencias de librerías de charts que puedan romper con actualizaciones de RN/Expo.

---

## 2) Instalación (enfoque actual)

El proyecto ya usa **react-native-svg**. No hace falta instalar ninguna librería adicional para el donut.

```bash
# Si en otro proyecto no tuvieras SVG:
npx expo install react-native-svg
```

**Dependencias necesarias:** `react-native-svg` (y TypeScript en el proyecto).

**Problemas comunes:**

- **"Unable to resolve module react-native-svg"**: ejecutar `npx expo install react-native-svg` y reiniciar Metro.
- **Gaps entre segmentos:** en esta implementación se normalizan los porcentajes a 100% y se usan los mismos ángulos de inicio/fin entre segmentos para evitar huecos.
- **Fuentes/colores:** el componente usa `usePalette()` y `Hierarchy` del design system; asegurar que el theme esté disponible.

---

## 3) Componente reutilizable

- **Nombre:** `PortfolioDonutChart`
- **Ubicación:** `features/dashboard/front/src/components/PortfolioDonutChart.tsx`
- **Tipos:** `features/dashboard/front/src/types/portfolio-chart.types.ts`

**Props tipadas (TypeScript):**

- `segments: DonutSegment[]` — datos (label, value en %, color)
- `size?: number` — lado del canvas (por defecto 220)
- `strokeWidth?: number` — grosor del anillo (por defecto 44)
- `centerLabel?: string` — texto central principal (ej. "1.769 €")
- `centerSublabel?: string` — texto central secundario (ej. "Valor por sector")
- `showLegend?: boolean` — mostrar leyenda debajo (por defecto true)
- `maxLegendItems?: number` — máximo ítems en leyenda (por defecto 8)

**Separación datos / presentación:** El componente solo recibe `segments` y opciones de presentación. La obtención de datos (API, VM, mock) se hace en la pantalla o en un hook; el donut no conoce la fuente.

**Rendimiento:** Se usa `useMemo` para normalizar segmentos, calcular paths y recortar la leyenda, de modo que solo se recalcula cuando cambian `segments`, `size` o `strokeWidth`.

---

## 4) Ejemplo de implementación

En `DashboardScreen` se usa con datos mockeados (sector o geografía):

```tsx
import { PortfolioDonutChart } from '../components/PortfolioDonutChart';
import type { DonutSegment } from '../types/portfolio-chart.types';

const SECTOR_DATA: DonutSegment[] = [
  { label: 'Tecnología', value: 35, color: '#E8E0F0' },
  { label: 'Salud', value: 20, color: '#6B5B95' },
  { label: 'Cripto', value: 20, color: '#4A3D6B' },
  { label: 'Consumo defensivo', value: 15, color: '#3D4A6B' },
  { label: 'Energía', value: 10, color: '#D4C8E8' },
];

<PortfolioDonutChart
  segments={SECTOR_DATA}
  size={220}
  strokeWidth={42}
  centerLabel="1.769 €"
  centerSublabel="Valor por sector"
  showLegend
/>;
```

- Centro: valor total + sublabel.
- Leyenda: debajo del gráfico, con punto de color + label + porcentaje.
- Los porcentajes se normalizan internamente si no suman 100.

---

## 5) UX recomendaciones

- **Colores fintech:** Paleta cohesiva (lavanda, morado, índigo, azul) como en el design system; evitar muchos colores puros y saturados; buen contraste con el fondo.
- **Máximo de sectores:** Entre 5 y 7; si hay más, agrupar en "Otros" o mostrar solo los N mayores y el resto en "Otros".
- **Sectores pequeños:** Mostrar en leyenda con "%" aunque sea bajo; si se agrupa en "Otros", indicar "Otros (X%)".
- **Accesibilidad:** Leyenda siempre visible con texto (no solo color); en futuras mejoras, añadir `accessibilityLabel` por segmento y para el valor central.

---

## 6) Alternativa más avanzada

Si se quieren animaciones, tooltip al pulsar y transiciones al cambiar sector/geografía:

- **Animaciones:** Usar `react-native-reanimated` para animar un valor de "progreso" (0 → 1) que escale los ángulos de cada segmento, o usar `@figliolia/rn-donut-chart` que ya trae animaciones.
- **Tooltip al pulsar:** Detectar toque en el gráfico, calcular en qué segmento cayó (ángulo del touch vs ángulos de cada segmento) y mostrar un modal o texto flotante con label y %.
- **Transiciones sector/geografía:** Mantener la misma estructura de datos (array de segmentos) y cambiar solo `segments` al cambiar pestaña; opcionalmente animar con Reanimated la opacidad o un crossfade entre dos instancias del donut.

La implementación actual es estática y sin tooltip; está pensada para extenderse con estos puntos sin cambiar la API del componente.

---

## 7) Integración en arquitectura modular por feature

- **Dónde vive:**
  - Componente: `features/dashboard/front/src/components/PortfolioDonutChart.tsx`
  - Tipos: `features/dashboard/front/src/types/portfolio-chart.types.ts`  
    Si varias features necesitan el mismo donut, mover a `shared/components/` (o a un módulo `charts`) y que el dashboard lo importe desde ahí.

- **Qué no debe depender:**  
  El componente no debe importar servicios, API ni estado global. Solo recibe `segments` y props de presentación; la capa de datos queda en la pantalla o en un ViewModel (por ejemplo `useDashboardViewModel`).

- **Desacoplamiento de la fuente de datos:**  
  La pantalla (o un hook) obtiene los datos (mock, API, VM), los mapea a `DonutSegment[]` y pasa ese array al `PortfolioDonutChart`. El componente no sabe si los datos vienen de sector, geografía o otro criterio; solo pinta lo que recibe.
