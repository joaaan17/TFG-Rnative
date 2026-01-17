# TFG React Native - GuÃ­a de Desarrollo

Este documento describe **cÃ³mo trabajar continuamente** en este proyecto React Native (Expo) con Expo Router, manteniendo una estructura limpia y escalable siguiendo el patrÃ³n **MVVM** y separaciÃ³n de responsabilidades.

> **ðŸ“± Nota importante:** Esta aplicaciÃ³n estÃ¡ diseÃ±ada **principalmente para dispositivos mÃ³viles** (iOS y Android). Aunque puede ejecutarse en web, el foco del desarrollo estÃ¡ en proporcionar una experiencia Ã³ptima en mÃ³viles.

---

## ðŸ“‹ Tabla de Contenidos

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Principios Fundamentales](#principios-fundamentales)
3. [Crear una Nueva Feature](#crear-una-nueva-feature)
4. [Agregar Componentes Compartidos](#agregar-componentes-compartidos)
5. [Usar el Design System](#usar-el-design-system)
6. [Convenciones de CÃ³digo](#convenciones-de-cÃ³digo)
7. [Reglas de DecisiÃ³n](#reglas-de-decisiÃ³n)
8. [Mantenimiento y RefactorizaciÃ³n](#mantenimiento-y-refactorizaciÃ³n)
9. [Ejemplos PrÃ¡cticos](#ejemplos-prÃ¡cticos)
10. [Troubleshooting](#troubleshooting)

---

## ðŸ—ï¸ Estructura del Proyecto

```
app/
â”œâ”€â”€ (tabs)/                    # ðŸ›£ï¸ RUTAS - Expo Router (delgadas)
â”‚   â”œâ”€â”€ _layout.tsx            # Layout de tabs
â”‚   â”œâ”€â”€ index.tsx              # Ruta home (delega a feature)
â”‚   â””â”€â”€ explore.tsx            # Ruta explore (delega a feature)
â”‚
â”œâ”€â”€ features/                  # ðŸŽ¯ FEATURES - NÃºcleo de la app (MVVM)
â”‚   â”œâ”€â”€ home/
â”‚   â”‚   â”œâ”€â”€ HomeScreen.tsx           # VIEW - UI y renderizado
â”‚   â”‚   â”œâ”€â”€ useHomeViewModel.ts      # VIEWMODEL - Estado y lÃ³gica
â”‚   â”‚   â”œâ”€â”€ home.service.ts          # MODEL - Datos (API, storage)
â”‚   â”‚   â”œâ”€â”€ home.types.ts            # Tipos TypeScript
â”‚   â”‚   â””â”€â”€ index.ts                 # Barrel export
â”‚   â”‚
â”‚   â””â”€â”€ explore/
â”‚       â”œâ”€â”€ ExploreScreen.tsx
â”‚       â”œâ”€â”€ useExploreViewModel.ts
â”‚       â”œâ”€â”€ explore.service.ts
â”‚       â”œâ”€â”€ explore.types.ts
â”‚       â””â”€â”€ index.ts
â”‚
â”œâ”€â”€ shared/                    # ðŸ”„ COMPARTIDO - Reutilizable entre features
â”‚   â”œâ”€â”€ components/            # Componentes UI reutilizables
â”‚   â”‚   â”œâ”€â”€ themed-text.tsx
â”‚   â”‚   â”œâ”€â”€ themed-view.tsx
â”‚   â”‚   â””â”€â”€ ui/
â”‚   â”‚       â”œâ”€â”€ collapsible.tsx
â”‚   â”‚       â””â”€â”€ icon-symbol.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/                 # Hooks personalizados
â”‚   â”‚   â”œâ”€â”€ use-color-scheme.ts
â”‚   â”‚   â””â”€â”€ use-theme-color.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ services/              # Servicios compartidos (API client, storage)
â”‚   â”œâ”€â”€ models/                # Modelos de datos compartidos
â”‚   â””â”€â”€ utils/                 # Utilidades (formateo, validaciÃ³n, etc.)
â”‚
â”œâ”€â”€ design-system/             # ðŸŽ¨ DESIGN SYSTEM - Tokens globales
â”‚   â”œâ”€â”€ colors.ts              # Colores (light/dark)
â”‚   â”œâ”€â”€ spacing.ts             # Espaciado
â”‚   â”œâ”€â”€ typography.ts          # TipografÃ­a y fuentes
â”‚   â””â”€â”€ theme.ts               # Tema centralizado (re-export)
â”‚
â”œâ”€â”€ config/                    # âš™ï¸ CONFIGURACIÃ“N
â”‚   â”œâ”€â”€ env.ts                 # Variables de entorno
â”‚   â””â”€â”€ routes.ts              # DefiniciÃ³n de rutas
â”‚
â”œâ”€â”€ constants/                 # ðŸ“Œ CONSTANTES
â”‚   â””â”€â”€ app.ts                 # Constantes de la app
â”‚
â”œâ”€â”€ _layout.tsx                # Layout raÃ­z
â””â”€â”€ modal.tsx                  # Rutas modales (si aplica)
```

---

## ðŸŽ¯ Principios Fundamentales

### 1. **SeparaciÃ³n de Responsabilidades**

- **Rutas (`(tabs)/`)**: Solo importan y exportan componentes de features. **NO contienen lÃ³gica**.
- **Features (`features/`)**: Contienen toda la lÃ³gica de negocio siguiendo MVVM.
- **Shared (`shared/`)**: Solo cÃ³digo reutilizable entre 2+ features.
- **Design System (`design-system/`)**: Tokens globales. **Nunca valores hardcodeados** en features.

### 2. **PatrÃ³n MVVM (Ligero)**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   *Screen.tsx   â”‚ â† VIEW (UI, renderizado, consumo de ViewModel)
â”‚   (View)        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚ usa
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ use*ViewModel   â”‚ â† VIEWMODEL (estado, efectos, handlers, orquestaciÃ³n)
â”‚   (Hook)        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚ llama a
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  *.service.ts   â”‚ â† MODEL (API, storage, transformaciÃ³n de datos)
â”‚   (Service)     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 3. **Regla de los 2 Usos**

- Si algo se usa en **2 o mÃ¡s features** â†’ muÃ©velo a `shared/`.
- Si algo solo se usa en **1 feature** â†’ dÃ©jalo en la feature.
- Si algo es un **token global** (color, spacing) â†’ va a `design-system/`.

---

## ðŸš€ Crear una Nueva Feature

### Paso 1: Crear la Estructura de Carpetas

```bash
app/features/tu-feature/
â”œâ”€â”€ TuFeatureScreen.tsx
â”œâ”€â”€ useTuFeatureViewModel.ts
â”œâ”€â”€ tu-feature.service.ts
â”œâ”€â”€ tu-feature.types.ts
â””â”€â”€ index.ts
```

### Paso 2: Crear los Tipos (`tu-feature.types.ts`)

```typescript
/**
 * Tipos para la feature TuFeature
 */

export interface TuFeatureState {
  data: string[];
  loading: boolean;
  error: string | null;
}

export interface TuFeatureData {
  id: string;
  name: string;
  // ... mÃ¡s campos
}
```

### Paso 3: Crear el Servicio (`tu-feature.service.ts`)

```typescript
/**
 * Servicio para la feature TuFeature
 * Maneja la lÃ³gica de datos (API, storage, etc.)
 */

import type { TuFeatureData, TuFeatureState } from "./tu-feature.types";

export const tuFeatureService = {
  // MÃ©todos para obtener datos
  fetchData: async (): Promise<TuFeatureData[]> => {
    // Llamada a API, storage, etc.
    // Ejemplo:
    // const response = await apiClient.get('/endpoint');
    // return response.data;
    return [];
  },

  // MÃ©todos para transformar datos
  transformData: (data: TuFeatureData[]): TuFeatureData[] => {
    // Transformaciones
    return data;
  },

  // Estado inicial
  getInitialState: (): TuFeatureState => ({
    data: [],
    loading: false,
    error: null,
  }),
};
```

### Paso 4: Crear el ViewModel (`useTuFeatureViewModel.ts`)

```typescript
/**
 * ViewModel para la feature TuFeature
 * Maneja el estado y la lÃ³gica de presentaciÃ³n
 */

import { useState, useEffect } from "react";
import type { TuFeatureState } from "./tu-feature.types";
import { tuFeatureService } from "./tu-feature.service";

export function useTuFeatureViewModel() {
  const [state, setState] = useState<TuFeatureState>(
    tuFeatureService.getInitialState(),
  );

  // Efectos
  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const loadData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await tuFeatureService.fetchData();
      setState((prev) => ({ ...prev, data, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Error desconocido",
        loading: false,
      }));
    }
  };

  const handleAction = () => {
    // LÃ³gica de handlers
  };

  return {
    state,
    handlers: {
      loadData,
      handleAction,
    },
  };
}
```

### Paso 5: Crear la Pantalla (`TuFeatureScreen.tsx`)

```typescript
/**
 * Pantalla TuFeature (View)
 * UI y renderizado - consume el ViewModel
 */

import { StyleSheet, View, ActivityIndicator } from "react-native";
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { useTuFeatureViewModel } from "./useTuFeatureViewModel";

export function TuFeatureScreen() {
  const { state, handlers } = useTuFeatureViewModel();

  if (state.loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (state.error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.error}>
          Error: {state.error}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tu Feature</ThemedText>
      {/* Renderizar data */}
      {state.data.map((item) => (
        <ThemedText key={item.id}>{item.name}</ThemedText>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  error: {
    color: "red",
  },
});
```

### Paso 6: Crear el Barrel Export (`index.ts`)

```typescript
/**
 * Barrel export para la feature TuFeature
 */

export { TuFeatureScreen } from "./TuFeatureScreen";
export { useTuFeatureViewModel } from "./useTuFeatureViewModel";
export { tuFeatureService } from "./tu-feature.service";
export type { TuFeatureState, TuFeatureData } from "./tu-feature.types";
```

### Paso 7: Crear la Ruta (`app/(tabs)/tu-feature.tsx`)

```typescript
/**
 * Ruta TuFeature - Expo Router
 * Ruta delgada que delega en la feature tu-feature
 */

import { TuFeatureScreen } from "@/features/tu-feature";

export default TuFeatureScreen;
```

### Paso 8: Agregar la Ruta al Layout (`app/(tabs)/_layout.tsx`)

```typescript
// ... imports existentes

export default function TabLayout() {
  // ... cÃ³digo existente

  return (
    <Tabs>
      {/* ... tabs existentes */}
      <Tabs.Screen
        name="tu-feature"
        options={{
          title: "Tu Feature",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="icono-aqui" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

## ðŸ”„ Agregar Componentes Compartidos

### Â¿CuÃ¡ndo crear un componente compartido?

âœ… **SÃ crear en `shared/components/`**:

- Se usa en 2+ features
- Es un componente UI genÃ©rico (Button, Input, Card, Modal, etc.)
- Puede ser configurado vÃ­a props

âŒ **NO crear en `shared/components/`**:

- Solo se usa en 1 feature (dÃ©jalo en la feature)
- Contiene lÃ³gica especÃ­fica de una feature

### Estructura para Componentes Compartidos

**Para componentes simples** (un solo archivo):

```
app/shared/components/
â””â”€â”€ mi-componente.tsx
```

**Para componentes complejos** (con estilos, tipos, etc.):

```
app/shared/components/
â””â”€â”€ MiComponente/
    â”œâ”€â”€ MiComponente.tsx
    â”œâ”€â”€ MiComponente.types.ts
    â”œâ”€â”€ MiComponente.styles.ts (opcional)
    â””â”€â”€ index.ts
```

### Ejemplo: Crear un Componente Button Compartido

**1. Crear `app/shared/components/Button.tsx`:**

```typescript
import { TouchableOpacity, StyleSheet, type TouchableOpacityProps } from "react-native";
import { ThemedText } from "./themed-text";
import { Spacing } from "@/design-system/theme";

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary";
}

export function Button({ title, variant = "primary", style, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], style]}
      {...rest}
    >
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#0a7ea4",
  },
  secondary: {
    backgroundColor: "transparent",
  },
});
```

**2. Usar en una feature:**

```typescript
import { Button } from "@/shared/components/Button";

export function MiScreen() {
  return (
    <Button
      title="Clic aquÃ­"
      variant="primary"
      onPress={() => console.log("clicked")}
    />
  );
}
```

---

## ðŸŽ¨ Usar el Design System

### âŒ NUNCA hagas esto:

```typescript
// âŒ MAL - Valores hardcodeados
<View style={{ padding: 16, backgroundColor: "#0a7ea4" }}>
  <Text style={{ fontSize: 20, color: "#fff" }}>TÃ­tulo</Text>
</View>
```

### âœ… SIEMPRE haz esto:

```typescript
// âœ… BIEN - Usando design system
import { Colors, Spacing, Typography } from "@/design-system/theme";

<View style={{ padding: Spacing.md, backgroundColor: Colors.light.tint }}>
  <Text style={{ fontSize: Typography.sizes.lg, color: Colors.light.text }}>
    TÃ­tulo
  </Text>
</View>
```

### Importar del Design System

```typescript
// Importar todo el tema
import { theme } from "@/design-system/theme";

// Importar especÃ­ficamente
import { Colors, Spacing, Typography, Fonts } from "@/design-system/theme";

// O importar desde theme.ts (re-export)
import { Colors } from "@/design-system/theme";
```

### Ejemplos de Uso

**Colores:**

```typescript
import { Colors } from "@/design-system/theme";
import { useColorScheme } from "@/shared/hooks/use-color-scheme";

const colorScheme = useColorScheme() ?? "light";
const backgroundColor = Colors[colorScheme].background;
const textColor = Colors[colorScheme].text;
```

**Spacing:**

```typescript
import { Spacing } from "@/design-system/theme";

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md, // 16
    margin: Spacing.sm, // 8
    gap: Spacing.lg, // 24
  },
});
```

**Typography:**

```typescript
import { Typography, Fonts } from "@/design-system/theme";

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.sizes.xxl, // 32
    fontWeight: Typography.weights.bold,
    fontFamily: Fonts.sans,
  },
  body: {
    fontSize: Typography.sizes.md, // 16
    lineHeight: Typography.lineHeights.normal,
  },
});
```

### Agregar Nuevos Tokens

Si necesitas agregar nuevos tokens, edita los archivos correspondientes:

**`app/design-system/colors.ts`:**

```typescript
export const Colors = {
  light: {
    // ... colores existentes
    nuevoColor: "#FF5733",
  },
  dark: {
    // ... colores existentes
    nuevoColor: "#C0392B",
  },
};
```

**`app/design-system/spacing.ts`:**

```typescript
export const Spacing = {
  // ... spacing existente
  xxxl: 64,
} as const;
```

---

## ðŸ“ Convenciones de CÃ³digo

### Nomenclatura

| Tipo                      | ConvenciÃ³n              | Ejemplo                                         |
| ------------------------- | ----------------------- | ----------------------------------------------- |
| **Feature**               | `kebab-case`            | `user-profile`, `product-list`                  |
| **Screen**                | `PascalCase`            | `HomeScreen.tsx`, `ProfileScreen.tsx`           |
| **ViewModel Hook**        | `use*ViewModel`         | `useHomeViewModel.ts`, `useProfileViewModel.ts` |
| **Service**               | `kebab-case.service.ts` | `home.service.ts`, `auth.service.ts`            |
| **Types**                 | `kebab-case.types.ts`   | `home.types.ts`, `user.types.ts`                |
| **Componente Compartido** | `PascalCase.tsx`        | `Button.tsx`, `Card.tsx`                        |
| **Hook Compartido**       | `use-kebab-case.ts`     | `use-debounce.ts`, `use-network.ts`             |
| **Utilidad**              | `kebab-case.ts`         | `format-date.ts`, `validate-email.ts`           |

### Estructura de Archivos

**Feature completa:**

```
features/mi-feature/
â”œâ”€â”€ MiFeatureScreen.tsx        # VIEW
â”œâ”€â”€ useMiFeatureViewModel.ts   # VIEWMODEL
â”œâ”€â”€ mi-feature.service.ts      # MODEL
â”œâ”€â”€ mi-feature.types.ts        # Types
â””â”€â”€ index.ts                   # Barrel export
```

**Componente compartido simple:**

```
shared/components/
â””â”€â”€ MiComponente.tsx
```

**Componente compartido complejo:**

```
shared/components/MiComponente/
â”œâ”€â”€ MiComponente.tsx
â”œâ”€â”€ MiComponente.types.ts
â””â”€â”€ index.ts
```

### Imports

**Orden de imports:**

```typescript
// 1. React/React Native
import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

// 2. LibrerÃ­as externas
import { Link } from "expo-router";
import { Image } from "expo-image";

// 3. Design System
import { Colors, Spacing } from "@/design-system/theme";

// 4. Shared (components, hooks, services, utils)
import { Button } from "@/shared/components/Button";
import { useDebounce } from "@/shared/hooks/use-debounce";

// 5. Features (si es necesario)
import { useHomeViewModel } from "@/features/home";

// 6. Relativos (misma feature)
import { useMiViewModel } from "./useMiViewModel";
import type { MiTypes } from "./mi.types";
```

**Usar barrel exports cuando sea posible:**

```typescript
// âœ… BIEN
import { HomeScreen, useHomeViewModel } from "@/features/home";

// âŒ EVITAR (a menos que sea necesario)
import { HomeScreen } from "@/features/home/HomeScreen";
import { useHomeViewModel } from "@/features/home/useHomeViewModel";
```

---

## ðŸŽ¯ Reglas de DecisiÃ³n

### Â¿DÃ³nde va esto?

| Pregunta                               | Respuesta                        |
| -------------------------------------- | -------------------------------- |
| **Â¿Es una nueva pantalla/feature?**    | `app/features/[nombre-feature]/` |
| **Â¿Se usa en 2+ features?**            | `app/shared/`                    |
| **Â¿Es un color/espaciado/tipografÃ­a?** | `app/design-system/`             |
| **Â¿Es configuraciÃ³n (env, rutas)?**    | `app/config/`                    |
| **Â¿Es una constante de la app?**       | `app/constants/`                 |
| **Â¿Es una ruta navegable?**            | `app/(tabs)/` o `app/[ruta].tsx` |

### Checklist: Â¿Es hora de crear una nueva feature?

- [ ] Â¿Tiene su propia pantalla?
- [ ] Â¿Tiene lÃ³gica de negocio especÃ­fica?
- [ ] Â¿Tiene su propio estado y datos?
- [ ] Â¿Puede funcionar de forma independiente?

**Si respondiste "sÃ­" a todas â†’ Crea una nueva feature**

### Checklist: Â¿Debe ir a `shared/`?

- [ ] Â¿Se usa en 2+ features?
- [ ] Â¿Es genÃ©rico/reutilizable?
- [ ] Â¿No tiene lÃ³gica especÃ­fica de una feature?

**Si respondiste "sÃ­" a todas â†’ MuÃ©velo a `shared/`**

---

## ðŸ”§ Mantenimiento y RefactorizaciÃ³n

### Refactorizar un Componente a Shared

**SituaciÃ³n:** Creaste un componente en una feature, pero ahora lo necesitas en otra.

**Proceso:**

1. **Mover el archivo:**

   ```bash
   # De
   app/features/feature-a/MiComponente.tsx

   # A
   app/shared/components/MiComponente.tsx
   ```

2. **Actualizar imports en la feature original:**

   ```typescript
   // Antes
   import { MiComponente } from "./MiComponente";

   // DespuÃ©s
   import { MiComponente } from "@/shared/components/MiComponente";
   ```

3. **Actualizar imports en la nueva feature:**
   ```typescript
   import { MiComponente } from "@/shared/components/MiComponente";
   ```

### Consolidar LÃ³gica Duplicada

**SituaciÃ³n:** Tienes lÃ³gica similar en 2 features.

**Proceso:**

1. Identifica la lÃ³gica comÃºn
2. Crea un hook en `app/shared/hooks/` o utilidad en `app/shared/utils/`
3. Reemplaza la lÃ³gica duplicada con el nuevo hook/utilidad

**Ejemplo:**

```typescript
// app/shared/hooks/use-api-data.ts
export function useApiData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // LÃ³gica comÃºn
  }, [endpoint]);

  return { data, loading, error };
}
```

### Limpiar Features no Utilizadas

**SituaciÃ³n:** Una feature ya no se usa.

**Proceso:**

1. Eliminar la carpeta `app/features/[feature-no-usada]/`
2. Eliminar la ruta en `app/(tabs)/[ruta].tsx`
3. Eliminar la referencia en `app/(tabs)/_layout.tsx`

---

## ðŸ’¡ Ejemplos PrÃ¡cticos

### Ejemplo 1: Feature con API

**`app/features/products/products.types.ts`:**

```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}
```

**`app/features/products/products.service.ts`:**

```typescript
import type { Product, ProductsState } from "./products.types";
// import { apiClient } from "@/shared/services/apiClient"; // Cuando lo tengas

export const productsService = {
  fetchProducts: async (): Promise<Product[]> => {
    // const response = await apiClient.get('/products');
    // return response.data;
    return [];
  },

  getInitialState: (): ProductsState => ({
    products: [],
    loading: false,
    error: null,
  }),
};
```

**`app/features/products/useProductsViewModel.ts`:**

```typescript
import { useState, useEffect } from "react";
import type { ProductsState } from "./products.types";
import { productsService } from "./products.service";

export function useProductsViewModel() {
  const [state, setState] = useState<ProductsState>(
    productsService.getInitialState(),
  );

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const products = await productsService.fetchProducts();
      setState((prev) => ({ ...prev, products, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Error al cargar productos",
        loading: false,
      }));
    }
  };

  return {
    state,
    handlers: {
      loadProducts,
    },
  };
}
```

### Ejemplo 2: Usar Design System

**`app/features/products/ProductsScreen.tsx`:**

```typescript
import { StyleSheet, FlatList } from "react-native";
import { ThemedText } from "@/shared/components/themed-text";
import { ThemedView } from "@/shared/components/themed-view";
import { Colors, Spacing, Typography } from "@/design-system/theme";
import { useProductsViewModel } from "./useProductsViewModel";

export function ProductsScreen() {
  const { state, handlers } = useProductsViewModel();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Productos
      </ThemedText>
      <FlatList
        data={state.products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView style={styles.productCard}>
            <ThemedText type="subtitle">{item.name}</ThemedText>
            <ThemedText>${item.price}</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  title: {
    marginBottom: Spacing.lg,
    fontSize: Typography.sizes.xxl,
  },
  productCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
});
```

---

## ðŸ› Troubleshooting

### Error: "Cannot find module '@/...'"

**Causa:** El path alias `@/` no estÃ¡ configurado correctamente.

**SoluciÃ³n:** Verifica que `tsconfig.json` tenga:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Error: "Module not found" al importar de features

**Causa:** Falta el barrel export `index.ts` en la feature.

**SoluciÃ³n:** Crea `app/features/[feature]/index.ts` con los exports necesarios.

### Componente no se re-renderiza

**Causa:** El estado estÃ¡ mal gestionado en el ViewModel.

**SoluciÃ³n:** AsegÃºrate de usar `setState` correctamente y no mutar el estado directamente.

### DiseÃ±o inconsistente entre pantallas

**Causa:** Valores hardcodeados en lugar de usar el design system.

**SoluciÃ³n:** Reemplaza valores hardcodeados con tokens de `app/design-system/`.

---

## ðŸ“š Recursos Adicionales

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## âœ… Checklist de RevisiÃ³n

Antes de hacer commit, asegÃºrate de:

- [ ] Â¿Las rutas son delgadas? (solo importan y exportan)
- [ ] Â¿La lÃ³gica estÃ¡ en features siguiendo MVVM?
- [ ] Â¿Se usa el design system en lugar de valores hardcodeados?
- [ ] Â¿Los componentes compartidos estÃ¡n en `shared/`?
- [ ] Â¿Los imports siguen el orden correcto?
- [ ] Â¿Los nombres siguen las convenciones?
- [ ] Â¿No hay cÃ³digo duplicado que deberÃ­a estar en `shared/`?
- [ ] Â¿Los tipos estÃ¡n definidos correctamente?

---

**Ãšltima actualizaciÃ³n:** Diciembre 2024
