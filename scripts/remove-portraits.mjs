// Removes rejected default portraits so that `npm run portraits:paint` paints them again (spec 011).
//
//   npm run portraits:remove -- orc/bard/female ashborn/ranger/male1 human/bard/male1.jpg
//   npm run portraits:remove -- --dry-run orc/bard/female
//   npm run portraits:remove -- --all-ai --keep dark-elf/cleric/female --keep gnome/bard/male
//
// --all-ai removes every AI-painted portrait (.webp or .jpg), never the original .png ones, except those after --keep:
// useful to repaint the whole set in a new style.
// Names are <race>/<class>/<male|female>, with or without the "1" and the extension. The list the app reads
// (src/data/content/portraitFiles.json) and docs/portraits.md are updated afterwards.
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  allPortraits,
  existingPortrait,
  root,
  writeGuide,
  writeManifest,
} from './portraits-lib.mjs';

/** "orc/bard/female", "orc/bard/female1" or "orc/bard/female1.webp" → "orc/bard/female1". */
export const stemOf = (name) =>
  name
    .trim()
    .replace(/^public\/images\//, '')
    .replace(/\.(png|webp|jpg)$/, '')
    .replace(/(male|female)$/, '$11');

/** Returns the exit code: 0 done, 1 bad name or nothing to remove. */
export const main = (argv, { log = console.log } = {}) => {
  const dryRun = argv.includes('--dry-run');
  const allAi = argv.includes('--all-ai');
  const keep = argv
    .map((arg, i) => (argv[i - 1] === '--keep' ? arg : undefined))
    .filter(Boolean);
  let names = argv.filter(
    (arg, i) =>
      !['--dry-run', '--all-ai', '--keep'].includes(arg) &&
      argv[i - 1] !== '--keep',
  );
  if (allAi) {
    const kept = new Set(keep.map(stemOf));
    names = allPortraits()
      .map((p) => p.stem)
      .filter((stem) => {
        const file = existingPortrait(stem);
        return file && !file.endsWith('.png') && !kept.has(stem);
      });
    if (!names.length) {
      log('No AI-painted portrait to remove.');
      return 0;
    }
  }
  if (!names.length) {
    log(
      'Usage: npm run portraits:remove -- [--dry-run] <race/class/male|female> ... | --all-ai [--keep <name>]...',
    );
    return 1;
  }
  const known = new Set(allPortraits().map((p) => p.stem));
  const unknown = [...names, ...keep].filter(
    (name) => !known.has(stemOf(name)),
  );
  if (unknown.length) {
    log(
      `Unknown portrait(s): ${unknown.join(', ')} (example: orc/bard/female).`,
    );
    return 1;
  }
  let removed = 0;
  for (const stem of new Set(names.map(stemOf))) {
    const file = existingPortrait(stem);
    if (!file) {
      log(`${stem}: no file (already removed).`);
      continue;
    }
    log(`${dryRun ? 'would remove' : 'removed'} public/images/${file}`);
    if (!dryRun) rmSync(join(root, 'public/images', file));
    removed++;
  }
  if (dryRun) return 0;
  writeManifest();
  const { missing, total } = writeGuide();
  log(
    `${removed} removed; ${missing} of ${total} portraits now missing: run \`npm run portraits:paint\` to paint them again.`,
  );
  return 0;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
