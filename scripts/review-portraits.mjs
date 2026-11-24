// Reviews the default portraits one by one in the browser (spec 011): keep a portrait, or send it to the trash so
// that `npm run portraits:paint` paints it again. Rejected files go to .portrait-trash/ (git-ignored) and can be
// restored from the page.
//
//   npm run portraits:review          then open the address it prints
//
// The server only listens on this computer (127.0.0.1).
import { createServer } from 'node:http';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
} from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXTENSIONS,
  allPortraits,
  root,
  writeGuide,
  writeManifest,
} from './portraits-lib.mjs';

const TYPES = {
  png: 'image/png',
  webp: 'image/webp',
  jpg: 'image/jpeg',
};

const findFile = (dir, stem) =>
  EXTENSIONS.map((ext) => `${stem}.${ext}`).find((file) =>
    existsSync(join(dir, file)),
  );

/**
 * The review logic on two folders, so tests can use temporary ones. `onChange` runs after a portrait moves (the real
 * tool rewrites the list the app reads and the guide).
 */
export const createReview = ({
  imagesDir = join(root, 'public/images'),
  trashDir = join(root, '.portrait-trash'),
  onChange = () => {
    writeManifest();
    writeGuide();
  },
} = {}) => {
  const known = new Map(allPortraits().map((p) => [p.stem, p]));

  const list = () =>
    [...known.values()].map(({ stem, race, characterClass, variant }) => {
      const file = findFile(imagesDir, stem);
      const trashed = !file && findFile(trashDir, stem);
      return {
        stem,
        race,
        characterClass,
        variant,
        file: file ?? trashed ?? null,
        status: file ? 'present' : trashed ? 'trashed' : 'missing',
      };
    });

  /** Moves a portrait between the images and the trash; returns false when there is nothing to move. */
  const move = (stem, from, to) => {
    if (!known.has(stem)) return false;
    const file = findFile(from, stem);
    if (!file) return false;
    mkdirSync(dirname(join(to, file)), { recursive: true });
    renameSync(join(from, file), join(to, file));
    onChange();
    return true;
  };

  return {
    list,
    reject: (stem) => move(stem, imagesDir, trashDir),
    restore: (stem) => move(stem, trashDir, imagesDir),
    /** Image bytes of a portrait (from the images or the trash), or undefined. */
    image: (file) => {
      if (!/^[a-z-]+\/[a-z-]+\/(male|female)1\.(png|webp|jpg)$/.test(file))
        return undefined;
      for (const dir of [imagesDir, trashDir]) {
        if (existsSync(join(dir, file))) {
          return {
            bytes: readFileSync(join(dir, file)),
            type: TYPES[extname(file).slice(1)],
          };
        }
      }
      return undefined;
    },
  };
};

const PAGE = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'review-portraits.html'),
  'utf8',
);

const json = (res, status, value) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(value));
};

export const createReviewServer = (review = createReview()) =>
  createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(PAGE);
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/portraits') {
      json(res, 200, review.list());
      return;
    }
    if (req.method === 'GET' && url.pathname.startsWith('/image/')) {
      const image = review.image(
        decodeURIComponent(url.pathname.slice('/image/'.length)),
      );
      if (!image) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, {
        'Content-Type': image.type,
        'Cache-Control': 'no-store',
      });
      res.end(image.bytes);
      return;
    }
    const action = url.pathname.match(/^\/api\/(reject|restore)$/)?.[1];
    if (req.method === 'POST' && action) {
      const stem = url.searchParams.get('stem') ?? '';
      json(res, review[action](stem) ? 200 : 404, review.list());
      return;
    }
    res.writeHead(404).end();
  });

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 5180;
  createReviewServer().listen(port, '127.0.0.1', () => {
    const trash = join(root, '.portrait-trash');
    const trashed = existsSync(trash)
      ? readdirSync(trash, { recursive: true }).filter((f) =>
          /\.(png|webp|jpg)$/.test(String(f)),
        ).length
      : 0;
    console.log(`Portrait review: http://localhost:${port}`);
    console.log(
      `${trashed} portrait(s) in the trash. Ctrl+C to stop; then npm run portraits:paint repaints the rejected ones.`,
    );
  });
}
