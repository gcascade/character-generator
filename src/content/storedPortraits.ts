import { z } from 'zod';
import { CharacterRaces, Genders } from '../types/character';
import type { PortraitTraits } from './portraitPrompt';

export const PORTRAITS_KEY = 'portraits';
/** A shrunk portrait is ~30–50 KB; anything far bigger is refused (data-model.md). */
export const MAX_IMAGE_LENGTH = 200_000;
export const PORTRAIT_SIZE = 384;

export type StoredPortrait = {
  image: string;
  traits: PortraitTraits;
  service: 'horde';
  paintedAt: string;
};

export type Portraits = Record<string, StoredPortrait>;

const portraitSchema = z.object({
  image: z
    .string()
    .max(MAX_IMAGE_LENGTH)
    .regex(/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/),
  traits: z.object({
    race: z.enum(Object.values(CharacterRaces)),
    gender: z.enum(Object.values(Genders)),
    ageBand: z.enum(['young', 'adult', 'middle-aged', 'elderly']),
    role: z.string().max(40),
  }),
  service: z.literal('horde'),
  paintedAt: z.string().max(40),
});

/** Portraits stored on the device; invalid entries are dropped one by one. */
export const parseStoredPortraits = (raw: string | null): Portraits => {
  let data: unknown;
  try {
    data = raw ? JSON.parse(raw) : undefined;
  } catch {
    return {};
  }
  const record = data as { version?: unknown; portraits?: unknown } | undefined;
  if (record?.version !== 1 || typeof record.portraits !== 'object') return {};
  return Object.fromEntries(
    Object.entries(record.portraits ?? {}).flatMap(([id, value]) => {
      const parsed = portraitSchema.safeParse(value);
      return parsed.success && id.length <= 100 ? [[id, parsed.data]] : [];
    }),
  );
};

/** Ids that some character, party or side character still points to (research R3). */
export const referencedIds = (ids: string[]): Set<string> => {
  const values: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key !== PORTRAITS_KEY)
      values.push(localStorage.getItem(key) ?? '');
  }
  return new Set(
    ids.filter((id) => values.some((value) => value.includes(id))),
  );
};

/** Keeps only the portraits still in use, plus the ones given (just painted). */
export const withoutUnused = (portraits: Portraits, keep: string[] = []) => {
  const used = referencedIds(Object.keys(portraits));
  return Object.fromEntries(
    Object.entries(portraits).filter(
      ([id]) => used.has(id) || keep.includes(id),
    ),
  );
};

const write = (portraits: Portraits) =>
  localStorage.setItem(
    PORTRAITS_KEY,
    JSON.stringify({ version: 1, portraits }),
  );

/**
 * Saves the portraits; when storage is full, unused portraits go first, oldest
 * first. Returns `false` when they still do not fit (kept for the session only).
 */
export const savePortraits = (portraits: Portraits): boolean => {
  try {
    write(portraits);
    return true;
  } catch {
    const used = referencedIds(Object.keys(portraits));
    const unused = Object.entries(portraits)
      .filter(([id]) => !used.has(id))
      .sort(([, a], [, b]) => a.paintedAt.localeCompare(b.paintedAt));
    const remaining = { ...portraits };
    for (const [id] of unused) {
      delete remaining[id];
      try {
        write(remaining);
        return true;
      } catch {
        // Still too big: drop the next one.
      }
    }
    return false;
  }
};

/**
 * Redraws an image at 384×384 as WebP (JPEG where WebP is not supported), so a
 * portrait takes ~40 KB of storage. Without canvas support the image is kept as
 * is when small enough.
 */
export const shrinkImage = async (dataUrl: string): Promise<string> => {
  const fallback = () => {
    if (dataUrl.length <= MAX_IMAGE_LENGTH) return dataUrl;
    throw new Error('Image too large to keep');
  };
  try {
    const image = new Image();
    image.src = dataUrl;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = PORTRAIT_SIZE;
    canvas.height = PORTRAIT_SIZE;
    const context = canvas.getContext('2d');
    if (!context) return fallback();
    context.drawImage(image, 0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);
    const webp = canvas.toDataURL('image/webp', 0.8);
    const result = webp.startsWith('data:image/webp')
      ? webp
      : canvas.toDataURL('image/jpeg', 0.85);
    return result.length <= MAX_IMAGE_LENGTH ? result : fallback();
  } catch {
    return fallback();
  }
};
