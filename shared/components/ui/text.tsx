import { cn } from '@/lib/utils';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';
import { usePalette } from '@/shared/hooks/use-palette';
import { FontFamilies, Hierarchy } from '@/design-system/typography';

const textVariants = cva(
  cn(
    'text-foreground text-base',
    Platform.select({
      web: 'select-text',
    }),
  ),
  {
    variants: {
      variant: {
        default: '',
        h1: cn(
          'text-center text-4xl font-extrabold tracking-tight',
          Platform.select({ web: 'scroll-m-20 text-balance' }),
        ),
        h2: cn(
          'border-border border-b pb-2 text-3xl font-semibold tracking-tight',
          Platform.select({ web: 'scroll-m-20 first:mt-0' }),
        ),
        h3: cn(
          'text-2xl font-semibold tracking-tight',
          Platform.select({ web: 'scroll-m-20' }),
        ),
        h4: cn(
          'text-xl font-semibold tracking-tight',
          Platform.select({ web: 'scroll-m-20' }),
        ),
        p: 'mt-3 leading-7 sm:mt-6',
        blockquote: 'mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6',
        code: cn(
          'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        ),
        lead: 'text-muted-foreground text-xl',
        large: 'text-lg font-semibold',
        small: 'text-sm font-medium leading-none',
        muted: 'text-muted-foreground text-sm',
        link: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps['variant']>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  blockquote: Platform.select({ web: 'blockquote' as Role }),
  code: Platform.select({ web: 'code' as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
};

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  variant = 'default',
  style,
  /** Si true, no se aplican typographyStyle ni color por variante; solo se usa `style`. Útil para títulos que deben coincidir exactamente con otras secciones. */
  suppressVariant = false,
  ...props
}: React.ComponentProps<typeof RNText> &
  TextVariantProps &
  React.RefAttributes<RNText> & {
    asChild?: boolean;
    suppressVariant?: boolean;
  }) {
  const palette = usePalette();
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;
  const resolvedVariant = variant ?? 'default';
  const typographyStyle =
    resolvedVariant === 'h1'
      ? Hierarchy.titleLarge
      : resolvedVariant === 'h2'
        ? Hierarchy.titleModalLarge
        : resolvedVariant === 'h3'
          ? Hierarchy.titleModal
          : resolvedVariant === 'h4'
            ? Hierarchy.valueSecondary
            : resolvedVariant === 'small'
              ? Hierarchy.bodySmallSemibold
              : resolvedVariant === 'muted'
                ? Hierarchy.bodySmall
                : resolvedVariant === 'code'
                  ? { fontFamily: FontFamilies.mono }
                  : Hierarchy.body;
  const color =
    resolvedVariant === 'link'
      ? palette.link
      : resolvedVariant === 'muted'
        ? (palette.icon ?? palette.text)
        : palette.text;

  const resolvedStyle = suppressVariant ? style : [typographyStyle, { color }, style];
  const resolvedClassName = suppressVariant ? className : cn(textVariants({ variant }), textClass, className);

  return (
    <Component
      className={resolvedClassName}
      style={resolvedStyle}
      role={variant && !suppressVariant ? ROLE[variant] : undefined}
      aria-level={variant && !suppressVariant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextClassContext };
export default Text;
