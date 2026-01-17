/**
 * Configuración de rutas
 * Definición centralizada de rutas de la aplicación
 */

export const Routes = {
  home: '/',
  explore: '/explore',
  profile: '/profile',
  modal: '/modal',
} as const;

export type RouteKey = keyof typeof Routes;

export default Routes;
