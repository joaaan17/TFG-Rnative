import { cn } from '@/lib/utils';
import { Platform, TextInput, type TextInputProps } from 'react-native';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

function Input({
  className,
  style,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  const palette = usePalette();
  const placeholderColor = `${palette.text}80`; // 50% opacidad

  return (
    <TextInput
      className={cn(
        'flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
        props.editable === false &&
          cn(
            'opacity-50',
            Platform.select({
              web: 'disabled:pointer-events-none disabled:cursor-not-allowed',
            }),
          ),
        Platform.select({
          web: cn(
            'selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm',
            'focus-visible:ring-[3px]',
          ),
        }),
        className,
      )}
      style={[
        {
          backgroundColor: palette.inputBackground,
          color: palette.text,
          borderColor: palette.text,
        },
        Hierarchy.body,
        style,
      ]}
      placeholderTextColor={placeholderColor}
      {...props}
    />
  );
}

export { Input };
export default Input;
