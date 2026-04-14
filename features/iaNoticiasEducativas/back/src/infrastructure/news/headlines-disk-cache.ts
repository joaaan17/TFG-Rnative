import fs from 'fs/promises';
import path from 'path';
import type { RawNews } from '../../domain/iaNoticiasEducativas.types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'ia-headlines-cache.json');

export type HeadlinesDiskPayload = { raw: RawNews[]; ts: number };

export async function readHeadlinesFromDisk(): Promise<HeadlinesDiskPayload | null> {
  try {
    const text = await fs.readFile(FILE, 'utf-8');
    const parsed = JSON.parse(text) as HeadlinesDiskPayload;
    if (!Array.isArray(parsed?.raw) || typeof parsed.ts !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeHeadlinesToDisk(payload: HeadlinesDiskPayload): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(payload), 'utf-8');
}
