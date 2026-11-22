import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { main, stemOf } from './remove-portraits.mjs';

const run = (argv: string[]) => {
  const lines: string[] = [];
  const code = main(argv, { log: (line) => lines.push(line) });
  return { code, output: lines.join('\n') };
};

describe('remove-portraits script (spec 011)', () => {
  const manifest = () =>
    readFileSync(
      join(__dirname, '../src/data/content/portraitFiles.json'),
      'utf8',
    );

  it('accepts names with or without the 1 and the extension', () => {
    expect(stemOf('orc/bard/female')).toBe('orc/bard/female1');
    expect(stemOf('orc/bard/female1')).toBe('orc/bard/female1');
    expect(stemOf('public/images/orc/bard/male1.webp')).toBe('orc/bard/male1');
  });

  it('lists what it would remove in a dry run, without touching anything', () => {
    const before = manifest();
    const { code, output } = run(['--dry-run', 'elf/mage/female']);
    expect(code).toBe(0);
    expect(output).toMatch(
      /would remove public\/images\/elf\/mage\/female1\.png/,
    );
    expect(manifest()).toBe(before);
  });

  it('refuses unknown names and asks for at least one', () => {
    expect(run(['dragon/bard/female']).output).toMatch(/Unknown portrait/);
    expect(run([]).code).toBe(1);
  });
});
