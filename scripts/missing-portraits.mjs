// Lists the portraits that exist and those that are missing: writes src/data/content/portraitFiles.json (read by the
// app) and docs/portraits.md (spec 009, spec 011). Usage: npm run portraits
import { writeGuide, writeManifest } from './portraits-lib.mjs';

writeManifest();
const { total, missing } = writeGuide();
console.log(
  `${missing} of ${total} portraits missing — docs/portraits.md and portraitFiles.json written.`,
);
