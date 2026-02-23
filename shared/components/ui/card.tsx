import { View, type ViewProps } from 'react-native';

import { Text, TextClassContext } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { cn } from '@/lib/utils';

function Card({
  className,
  style,
  ...props
}: ViewProps & React.RefAttributes<View>) {
  const palette = usePalette();

  return (
    <TextClassContext.Provider value="">
      <View
        className={cn(
          'flex flex-col gap-6 rounded-xl py-6 shadow-sm shadow-black/5',
          className,
        )}
        style={[
          {
            backgroundColor: palette.cardBackground,
            borderColor: palette.surfaceBorder ?? palette.text,
            borderWidth: 1,
          },
          style,
        ]}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function CardHeader({
  className,
  ...props
}: ViewProps & React.RefAttributes<View>) {
  return (
    <View className={cn('flex flex-col gap-1.5 px-6', className)} {...props} />
  );
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) {
  return (
    <Text
      role="heading"
      aria-level={3}
      className={cn('font-semibold leading-none', className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) {
  return (
    <Text
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: ViewProps & React.RefAttributes<View>) {
  return <View className={cn('px-6', className)} {...props} />;
}

function CardFooter({
  className,
  ...props
}: ViewProps & React.RefAttributes<View>) {
  return (
    <View
      className={cn('flex flex-row items-center px-6', className)}
      {...props}
    />
  );
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
export default Card;
