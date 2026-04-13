/**
 * Parser ligero para respuestas del consultorio (Markdown habitual de modelos:
 * **negrita**, ## / ### títulos, listas numeradas y con guión).
 */

export type ConsultorioBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'ol'; items: string[] }
  | { type: 'ul'; items: string[] };

export type InlineSegment = { type: 'normal' | 'bold'; text: string };

/** Convierte `**texto**` en segmentos (sin mostrar asteriscos). */
export function parseInlineBold(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: 'normal', text: text.slice(lastIndex, m.index) });
    }
    segments.push({ type: 'bold', text: m[1].trim() });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'normal', text: text.slice(lastIndex) });
  }
  return segments.length > 0 ? segments : [{ type: 'normal', text }];
}

export function parseConsultorioMarkdown(content: string): ConsultorioBlock[] {
  if (!content || typeof content !== 'string') return [];
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const blocks: ConsultorioBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      i++;
      continue;
    }

    const h2 = trimmed.match(/^##\s+(.+)$/);
    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h2) {
      blocks.push({ type: 'h2', text: h2[1].trim() });
      i++;
      continue;
    }
    if (h3) {
      blocks.push({ type: 'h3', text: h3[1].trim() });
      i++;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        const m = t.match(/^\d+\.\s+(.+)$/);
        if (m) {
          items.push(m[1].trim());
          i++;
        } else break;
      }
      if (items.length > 0) blocks.push({ type: 'ol', items });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        const m = t.match(/^[-*]\s+(.+)$/);
        if (m) {
          items.push(m[1].trim());
          i++;
        } else break;
      }
      if (items.length > 0) blocks.push({ type: 'ul', items });
      continue;
    }

    let para = trimmed;
    i++;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) break;
      if (/^##\s|^###\s/.test(t) || /^\d+\.\s/.test(t) || /^[-*]\s/.test(t)) {
        break;
      }
      para += '\n' + t;
      i++;
    }
    blocks.push({ type: 'paragraph', text: para });
  }

  return blocks;
}
