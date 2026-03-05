# Tipografías (qué usamos, jerarquía y cómo importarlas)

Este proyecto usa **3 familias** (todas de Google Fonts) y una **jerarquía tipográfica centralizada** en `design-system/typography.ts`.

## Qué tipografías se usan

- **Plus Jakarta Sans**: tipografía **principal** (títulos / cabeceras).
- **DM Sans**: tipografía de **cuerpo** (lectura, UI general).
- **Manrope**: tipografía **secundaria** (labels, captions, microtexto).

### Dónde se configuran

- **Native (iOS/Android)**:
  - Se cargan en `app/_layout.tsx` con `useFonts` (Expo).
  - Los nombres exactos de `fontFamily` viven en `design-system/typography.ts` (`FontFamilies`).
- **Web (Expo Web + NativeWind)**:
  - Se importan vía CSS en `global.css` con `@import url('https://fonts.googleapis.com/...')`.
  - Se exponen como variables CSS:
    - `--font-family-primary` (Plus Jakarta Sans)
    - `--font-family-body` (DM Sans)
    - `--font-family-secondary` (Manrope)
  - Tailwind/NativeWind las mapea en `tailwind.config.js`:
    - `font-primary`, `font-body`, `font-secondary` (solo útil en web si apuntas a esas CSS vars).

## Jerarquía tipográfica (la real del proyecto)

La jerarquía está en `design-system/typography.ts` bajo `Hierarchy` y se usa en pantallas/components vía `style={[Hierarchy.xxx, ...]}`.

### Niveles principales (`Hierarchy`)

- **`Hierarchy.titleLarge`**: título principal (p. ej. nombre, encabezado de pantalla).
- **`Hierarchy.titleModalLarge`**: título hero dentro de modal grande.
- **`Hierarchy.titleModal`**: título de modal estándar.
- **`Hierarchy.titleSection`**: título de sección (en mayúsculas / tracking amplio).
- **`Hierarchy.value` / `Hierarchy.valueSecondary`**: valores destacados (stats/resumen).
- **`Hierarchy.body`**: cuerpo base.
- **`Hierarchy.bodySmall`**: cuerpo pequeño.
- **`Hierarchy.bodySmallSemibold`**: cuerpo pequeño en semibold (cards/listas).
- **`Hierarchy.label`**: etiquetas (chips, labels).
- **`Hierarchy.caption` / `Hierarchy.captionSmall`**: texto secundario/captions (incluye ejes/tiempos).
- **`Hierarchy.action`**: botones/acciones (peso medio).

### Atajos de estilo (`TextStyles`)

En `design-system/typography.ts` también existe `TextStyles` para patrones frecuentes:

- `TextStyles.sectionLabel`
- `TextStyles.body`
- `TextStyles.caption`

## Cómo usar las fuentes correctamente (en este repo)

### Opción recomendada (consistente): tokens del design system

Ejemplo:

```tsx
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system';

export function Header() {
  return (
    <>
      <Text style={Hierarchy.titleLarge}>Título</Text>
      <Text style={Hierarchy.body}>Texto de cuerpo</Text>
      <Text style={Hierarchy.caption}>Caption</Text>
    </>
  );
}
```

### Nota sobre clases Tailwind `font-*`

En este proyecto, el “control real” de `fontFamily` en **native** se hace con `style` (tokens). Las clases `font-semibold`, `font-bold`, etc. controlan el **peso**, pero no garantizan la **familia** en iOS/Android.

Si quieres tener `font-primary/font-body/font-secondary` funcionando también en native, habría que mapear `tailwind.config.js` a nombres de `FontFamilies.*` (no a CSS vars). Hoy, esas `fontFamily` de Tailwind están pensadas para **web**.

## Cómo importarlo en un proyecto que funciona igual que este

### 1) Dependencias

Instala exactamente estas fuentes (y Expo font):

```bash
npm install expo-font
npm install @expo-google-fonts/plus-jakarta-sans @expo-google-fonts/dm-sans @expo-google-fonts/manrope
```

### 2) Carga de fuentes en `app/_layout.tsx`

Replica el patrón de este repo:

- Importa las variantes desde `@expo-google-fonts/*`
- Pásalas a `useFonts({ ... })`
- No renderices la app hasta que `fontsLoaded` sea `true` (y opcionalmente oculta el Splash)

Referencia: `app/_layout.tsx` de este proyecto.

### 3) Copia el design system de tipografía

Copia tal cual:

- `design-system/typography.ts`

Y asegúrate de mantener:

- Los mismos nombres de familia (`FontFamilies.*`) que coinciden con las claves cargadas en `useFonts`.

### 4) (Solo web) Importación en `global.css` + variables + Tailwind

Si tu proyecto también compila a web con NativeWind:

- Copia `global.css` (o al menos la línea `@import` de Google Fonts y las variables `--font-family-*`)
- En `tailwind.config.js`, puedes mantener:
  - `fontFamily.primary/body/secondary` apuntando a `var(--font-family-*)`
- En `app/_layout.tsx`, importa `../global.css` (como hace este repo).

## Checklist rápido

- **Native**: `useFonts` carga Plus Jakarta Sans + DM Sans + Manrope ✅
- **Tokens**: `Hierarchy` y `TextStyles` viven en `design-system/typography.ts` ✅
- **Web**: `global.css` importa Google Fonts + define `--font-family-*` ✅
- **Uso**: en pantallas, aplicar `Hierarchy.*` en `style` ✅
