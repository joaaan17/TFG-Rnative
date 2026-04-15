import fs from 'fs/promises';
import path from 'path';
import type { RawNews } from '../../domain/iaNoticiasEducativas.types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'ia-headlines-cache.json');

export type HeadlinesDiskPayload = {
  raw: RawNews[];
  /** Ventana Europe/Madrid (p. ej. 2026-04-15-AM); invalida caché al cambiar de slot. */
  slotId: string;
};

export async function readHeadlinesFromDisk(): Promise<HeadlinesDiskPayload | null> {
  try {
    const text = await fs.readFile(FILE, 'utf-8');
    const parsed = JSON.parse(text) as HeadlinesDiskPayload & { ts?: number };
    if (!Array.isArray(parsed?.raw)) return null;
    if (typeof parsed.slotId !== 'string') return null;
    return { raw: parsed.raw, slotId: parsed.slotId };
  } catch {
    return null;
  }
}

export async function writeHeadlinesToDisk(payload: HeadlinesDiskPayload): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(payload), 'utf-8');
}
