import * as React from 'react';
import {
  Platform,
  Pressable,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { usePalette } from '@/shared/hooks/use-palette';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Hierarchy } from '@/design-system/typography';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-md shadow-none',
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    }),
  ),
  {
    variants: {
      variant: {
        default: '',
        destructive: '',
        outline: 'border shadow-sm shadow-black/5',
        secondary: 'shadow-sm shadow-black/5',
        ghost: '',
        link: '',
      },
      size: {
        default: cn(
          'h-10 px-4 py-2 sm:h-9',
          Platform.select({ web: 'has-[>svg]:px-3' }),
        ),
        sm: cn(
          'h-9 gap-1.5 rounded-md px-3 sm:h-8',
          Platform.select({ web: 'has-[>svg]:px-2.5' }),
        ),
        lg: cn(
          'h-11 rounded-md px-6 sm:h-10',
          Platform.select({ web: 'has-[>svg]:px-4' }),
        ),
        xl: cn(
          'h-14 rounded-md px-8 sm:h-12',
          Platform.select({ web: 'has-[>svg]:px-6' }),
        ),
        icon: 'h-10 w-10 sm:h-9 sm:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const buttonTextVariants = cva(
  cn(
    'text-sm font-medium',
    Platform.select({ web: 'pointer-events-none transition-colors' }),
  ),
  {
    variants: {
      variant: {
        default: '',
        destructive: '',
        outline: '',
        secondary: '',
        ghost: '',
        link: '',
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        xl: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    /**
     * Estilos opcionales para el texto interno (tipografía, size, etc.).
     * Se aplica automáticamente a los hijos `Text` del botón.
     */
    textStyle?: StyleProp<TextStyle>;
  };

function Button({
  className,
  variant,
  size,
  children,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const palette = usePalette();

  const variantStyles = {
    default: {
      backgroundColor: palette.primary,
    },
    destructive: {
      backgroundColor: palette.destructive ?? '#ef4444',
    },
    outline: {
      backgroundColor: palette.background,
      borderColor: palette.surfaceBorder ?? palette.text,
      borderWidth: 1,
    },
    secondary: {
      backgroundColor: palette.cardBackground,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    link: {
      backgroundColor: 'transparent',
    },
  } as const;

  const textColors = {
    default: palette.primaryText,
    destructive: palette.destructiveText,
    outline: palette.text,
    secondary: palette.text,
    ghost: palette.text,
    link: palette.link,
  } as const;

  const resolvedVariant = variant ?? 'default';
  const resolvedSize = size ?? 'default';
  const textColor = textColors[resolvedVariant];
  const resolvedTextStyle = [Hierarchy.action, textStyle] as const;

  // En Android/iOS las clases NativeWind (h-9, h-10…) no aplican height como
  // estilo de layout, haciendo los botones más altos que en web. Usamos estilos
  // explícitos en nativo para igualar las dimensiones de Tailwind.
  const nativeSizeStyle: Record<string, object> = {
    default: { height: 40, paddingHorizontal: 16 },
    sm:      { height: 36, paddingHorizontal: 12 },
    lg:      { height: 44, paddingHorizontal: 24 },
    xl:      { height: 56, paddingHorizontal: 32 },
    icon:    { height: 40, width: 40, paddingHorizontal: 0 },
  };
  const platformSizeStyle =
    Platform.OS !== 'web' ? nativeSizeStyle[resolvedSize] : undefined;

  const content =
    typeof children === 'function'
      ? children
      : React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          const el = child as React.ReactElement<any>;
          return React.cloneElement(el, {
            style: [el.props?.style, resolvedTextStyle, { color: textColor }],
          });
        });

  const resolvedStyle =
    typeof style === 'function'
      ? (state: Parameters<NonNullable<typeof style>>[0]) => [
          platformSizeStyle,
          variantStyles[resolvedVariant],
          style(state),
        ]
      : [platformSizeStyle, variantStyles[resolvedVariant], style];

  return (
    <Pressable
      className={cn(
        props.disabled && 'opacity-50',
        buttonVariants({ variant, size }),
        className,
      )}
      style={resolvedStyle}
      role="button"
      {...props}
    >
      {content}
    </Pressable>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
export default Button;
