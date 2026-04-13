import React, { useMemo } from 'react';
import { type StyleProp, TextStyle, View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { FontFamilies, Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';
import {
  parseConsultorioMarkdown,
  parseInlineBold,
  type ConsultorioBlock,
  type InlineSegment,
} from '../utils/parseConsultorioMarkdown';

export type ConsultorioFormattedMessageProps = {
  content: string;
  /** Estilos base de cuerpo heredados de la burbuja (color, etc.) */
  baseTextStyle: StyleProp<TextStyle>;
};

function renderSegments(
  segments: InlineSegment[],
  baseStyle: object,
  boldColor: string,
) {
  return segments.map((seg, i) =>
    seg.type === 'normal' ? (
      <Text key={i} style={baseStyle}>
        {seg.text}
      </Text>
    ) : (
      <Text
        key={i}
        style={[
          baseStyle,
          {
            fontFamily: FontFamilies.body.medium,
            color: boldColor,
          },
        ]}
      >
        {seg.text}
      </Text>
    ),
  );
}

/**
 * Respuesta del asistente con jerarquía legible: títulos, listas y **negritas**
 * sin mostrar marcadores Markdown.
 */
export function ConsultorioFormattedMessage({
  content,
  baseTextStyle,
}: ConsultorioFormattedMessageProps) {
  const palette = usePalette();
  const blocks = useMemo(() => parseConsultorioMarkdown(content), [content]);

  const accent = palette.primary ?? '#2563eb';
  const muted = palette.icon ?? palette.text;
  const boldColor = accent;

  const bodyStyle = useMemo(
    () => [
      Hierarchy.body,
      baseTextStyle,
      {
        lineHeight: 24,
        marginBottom: 0,
      },
    ],
    [baseTextStyle],
  );

  const styles = useMemo(
    () => ({
      stack: { gap: 12 },
      h2Row: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 10,
        marginTop: 6,
        marginBottom: 2,
      },
      h2Accent: {
        width: 3,
        minHeight: 18,
        alignSelf: 'stretch' as const,
        borderRadius: 2,
        backgroundColor: accent,
      },
      h2Text: {
        ...Hierarchy.bodySmallSemibold,
        flex: 1,
        color: palette.text,
        letterSpacing: 0.4,
        textTransform: 'uppercase' as const,
        fontSize: 11,
        lineHeight: 16,
      },
      h3Text: {
        ...Hierarchy.bodySmall,
        fontFamily: FontFamilies.body.medium,
        color: muted,
        marginTop: 2,
        marginBottom: 4,
        lineHeight: 20,
      },
      listWrap: { gap: 8 },
      listRow: {
        flexDirection: 'row' as const,
        alignItems: 'flex-start' as const,
        gap: 8,
        paddingRight: 4,
      },
      bullet: {
        ...Hierarchy.body,
        width: 18,
        marginTop: 0,
        color: accent,
        fontFamily: FontFamilies.primary.semibold,
      },
      idx: {
        ...Hierarchy.bodySmall,
        minWidth: 20,
        marginTop: 1,
        color: muted,
        fontFamily: FontFamilies.body.medium,
      },
      listBody: { flex: 1 },
    }),
    [accent, muted, palette.text],
  );

  function renderBlock(block: ConsultorioBlock, idx: number) {
    const key = `b-${idx}`;

    if (block.type === 'h2') {
      return (
        <View key={key} style={[styles.h2Row, idx === 0 && { marginTop: 0 }]}>
          <View style={styles.h2Accent} />
          <Text style={styles.h2Text} numberOfLines={3}>
            {block.text}
          </Text>
        </View>
      );
    }

    if (block.type === 'h3') {
      return (
        <Text key={key} style={[styles.h3Text, idx === 0 && { marginTop: 0 }]}>
          {block.text}
        </Text>
      );
    }

    if (block.type === 'ol') {
      return (
        <View key={key} style={[styles.listWrap, { paddingLeft: 2 }]}>
          {block.items.map((item, j) => {
            const segments = parseInlineBold(item);
            return (
              <View key={j} style={styles.listRow}>
                <Text style={styles.idx}>{`${j + 1}.`}</Text>
                <Text style={[bodyStyle, styles.listBody]}>
                  {renderSegments(segments, bodyStyle as object, boldColor)}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }

    if (block.type === 'ul') {
      return (
        <View key={key} style={[styles.listWrap, { paddingLeft: 2 }]}>
          {block.items.map((item, j) => {
            const segments = parseInlineBold(item);
            return (
              <View key={j} style={styles.listRow}>
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={[bodyStyle, styles.listBody]}>
                  {renderSegments(segments, bodyStyle as object, boldColor)}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }

    const segments = parseInlineBold(block.text);
    const hasBold = segments.some((s) => s.type === 'bold');
    if (hasBold || segments.length > 1) {
      return (
        <Text key={key} style={[bodyStyle, { marginBottom: 2 }]}>
          {renderSegments(segments, bodyStyle as object, boldColor)}
        </Text>
      );
    }
    return (
      <Text key={key} style={[bodyStyle, { marginBottom: 2 }]}>
        {block.text}
      </Text>
    );
  }

  return <View style={styles.stack}>{blocks.map(renderBlock)}</View>;
}
