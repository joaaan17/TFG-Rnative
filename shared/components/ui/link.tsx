/**
 * Link component - Basado en Text de react-native-reusables
 * Componente de enlace de texto reutilizable
 */

import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/utils';

export interface LinkProps extends TouchableOpacityProps {
  children: React.ReactNode;
  underline?: boolean;
  variant?: 'default' | 'primary';
}

export function Link({
  children,
  underline = false,
  variant = 'default',
  className,
  style,
  ...rest
}: LinkProps) {
  return (
    <TouchableOpacity
      className={cn('self-start', className)}
      activeOpacity={0.7}
      style={style}
      {...rest}
    >
      <Text
        variant={variant === 'primary' ? 'link' : 'default'}
        className={cn(
          'text-sm',
          variant === 'default' && 'text-muted-foreground',
          underline && 'underline',
        )}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export default Link;
