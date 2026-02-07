import React from 'react';
import { View } from 'react-native';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { Text } from '@/shared/components/ui/text';

export type EducationalNewsContentProps = {
  content: string;
  typewriterSpeed?: number;
};

type Block = { type: 'h2' | 'h3' | 'paragraph'; text: string };

function parseMarkdownBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.split('\n');
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

/**
 * Renderiza el contenido educativo parseando ## y ### como subtítulos.
 */
export function EducationalNewsContent({
  content,
  typewriterSpeed = 8,
}: EducationalNewsContentProps) {
  const blocks = React.useMemo(() => parseMarkdownBlocks(content), [content]);

  return (
    <View style={{ gap: 12 }}>
      {blocks.map((block, idx) => {
        if (block.type === 'h2' || block.type === 'h3') {
          return (
            <Text
              key={idx}
              variant="h4"
              style={{ marginTop: block.type === 'h2' ? 4 : 0 }}
            >
              {block.text}
            </Text>
          );
        }
        return (
          <TypewriterTextComponent
            key={idx}
            text={block.text}
            speed={typewriterSpeed}
            useDefaultFontFamily={false}
            variant="muted"
            className="border-0 pb-0"
          />
        );
      })}
    </View>
  );
}
