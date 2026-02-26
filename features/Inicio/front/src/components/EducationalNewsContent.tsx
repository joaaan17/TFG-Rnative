import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Hierarchy } from '@/design-system/typography';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';

export type EducationalNewsContentProps = {
  content: string;
};

type Block = { type: 'h2' | 'h3' | 'paragraph'; text: string };
type InlineSegment = { type: 'normal' | 'label'; text: string };

function parseMarkdownBlocks(content: string): Block[] {
  if (!content || typeof content !== 'string') return [];
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return [];
  const blocks: Block[] = [];
  const lines = normalized.split('\n');
  let currentParagraph = '';

  const flushParagraph = () => {
    const trimmed = currentParagraph.trim();
    if (trimmed) {
      blocks.push({ type: 'paragraph', text: trimmed });
      currentParagraph = '';
    }
  };

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);

    if (h2Match) {
      flushParagraph();
      blocks.push({ type: 'h2', text: h2Match[1].trim() });
    } else if (h3Match) {
      flushParagraph();
      blocks.push({ type: 'h3', text: h3Match[1].trim() });
    } else {
      currentParagraph += (currentParagraph ? '\n' : '') + line;
    }
  }
  flushParagraph();

  return blocks;
}

/** Separa texto con **label** en segmentos normal/label para estilo minimalista (sin asteriscos). */
function parseInlineLabels(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: 'normal', text: text.slice(lastIndex, m.index) });
    }
    segments.push({ type: 'label', text: m[1].trim() });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'normal', text: text.slice(lastIndex) });
  }
  return segments.length > 0 ? segments : [{ type: 'normal', text }];
}

/**
 * Renderiza el contenido educativo con títulos de contexto visuales y minimalistas:
 * h2 = sección principal (barra acento + título); h3 = subsección; párrafos con cuerpo legible.
 */
export function EducationalNewsContent({
  content,
}: EducationalNewsContentProps) {
  const palette = usePalette();
  const blocks = useMemo(() => parseMarkdownBlocks(content), [content]);

  const styles = useMemo(
    () => ({
      container: { gap: 14 },
      h2Row: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 12,
        marginTop: 12,
        marginBottom: 4,
      },
      h2Accent: {
        width: 4,
        height: 22,
        borderRadius: 2,
        backgroundColor: palette.primary,
      },
      h2Text: {
        ...Hierarchy.titleSection,
        color: palette.text,
        letterSpacing: 1.4,
        flex: 1,
      },
      h3Row: {
        marginTop: 14,
        marginBottom: 6,
        paddingLeft: 8,
      },
      h3Text: {
        ...Hierarchy.bodySmall,
        fontSize: 14,
        color: palette.icon ?? palette.text,
        lineHeight: 20,
        letterSpacing: 0.2,
      },
      paragraph: {
        ...Hierarchy.body,
        color: palette.text,
        lineHeight: 26,
        opacity: 0.92,
        marginBottom: 16,
        paddingLeft: 2,
      },
      labelText: {
        ...Hierarchy.body,
        color: palette.primary,
        lineHeight: 26,
      },
    }),
    [palette],
  );

  return (
    <View style={styles.container}>
      {blocks.map((block, idx) => {
        if (block.type === 'h2') {
          return (
            <View key={idx} style={styles.h2Row}>
              <View style={styles.h2Accent} />
              <Text style={styles.h2Text} numberOfLines={2}>
                {block.text}
              </Text>
            </View>
          );
        }
        if (block.type === 'h3') {
          return (
            <View key={idx} style={styles.h3Row}>
              <Text style={styles.h3Text}>{block.text}</Text>
            </View>
          );
        }
        const segments = parseInlineLabels(block.text);
        const hasLabels = segments.some((s) => s.type === 'label');
        if (hasLabels) {
          return (
            <Text key={idx} style={styles.paragraph}>
              {segments.map((seg, i) =>
                seg.type === 'normal' ? (
                  <Text key={i}>{seg.text}</Text>
                ) : (
                  <Text key={i} style={styles.labelText}>
                    {seg.text}
                  </Text>
                ),
              )}
            </Text>
          );
        }
        return (
          <Text key={idx} style={styles.paragraph}>
            {block.text}
          </Text>
        );
      })}
    </View>
  );
}
