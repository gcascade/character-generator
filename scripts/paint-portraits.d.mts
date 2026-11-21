export class StopRun extends Error {}

export type PaintOptions = {
  service: 'horde' | 'cloudflare';
  dryRun: boolean;
  limit: number;
  only?: string;
  size: number;
  model: string;
  timeoutMinutes: number;
};

export function parseArgs(argv: string[]): PaintOptions;

export function plan(options: Pick<PaintOptions, 'only' | 'limit'>): {
  race: string;
  characterClass: string;
  variant: 'male' | 'female';
  stem: string;
}[];

export function extensionOf(bytes: Buffer): 'webp' | 'jpg' | 'png';

export function main(
  argv: string[],
  io?: { fetch?: typeof fetch; log?: (line: string) => void },
): Promise<number>;
