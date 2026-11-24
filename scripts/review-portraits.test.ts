import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createReview, createReviewServer } from './review-portraits.mjs';

describe('review-portraits script (spec 011)', () => {
  let dir: string;
  let images: string;
  let trash: string;
  let changes: number;

  const setUp = () => {
    dir = mkdtempSync(join(tmpdir(), 'review-'));
    images = join(dir, 'images');
    trash = join(dir, 'trash');
    mkdirSync(join(images, 'elf/mage'), { recursive: true });
    writeFileSync(join(images, 'elf/mage/female1.png'), 'png');
    changes = 0;
    return createReview({
      imagesDir: images,
      trashDir: trash,
      onChange: () => changes++,
    });
  };

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('lists every portrait with its status', () => {
    const list = setUp().list();
    expect(list.length).toBe(9 * 9 * 2);
    expect(list.find((p) => p.stem === 'elf/mage/female1')).toMatchObject({
      file: 'elf/mage/female1.png',
      status: 'present',
    });
    expect(list.find((p) => p.stem === 'elf/mage/male1')?.status).toBe(
      'missing',
    );
  });

  it('moves a rejected portrait to the trash and restores it', () => {
    const review = setUp();
    expect(review.reject('elf/mage/female1')).toBe(true);
    expect(existsSync(join(trash, 'elf/mage/female1.png'))).toBe(true);
    expect(existsSync(join(images, 'elf/mage/female1.png'))).toBe(false);
    expect(
      review.list().find((p) => p.stem === 'elf/mage/female1')?.status,
    ).toBe('trashed');
    expect(review.image('elf/mage/female1.png')?.type).toBe('image/png');

    expect(review.restore('elf/mage/female1')).toBe(true);
    expect(existsSync(join(images, 'elf/mage/female1.png'))).toBe(true);
    expect(changes).toBe(2);
  });

  it('refuses unknown stems and paths outside the portraits', () => {
    const review = setUp();
    expect(review.reject('../secret')).toBe(false);
    expect(review.reject('elf/mage/male1')).toBe(false);
    expect(review.image('../../package.json')).toBeUndefined();
    expect(changes).toBe(0);
  });

  it('serves the page, the list and the actions', async () => {
    const server = createReviewServer(setUp());
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      expect(await (await fetch(base)).text()).toMatch(/Portrait review/);
      const list = (await (await fetch(`${base}/api/portraits`)).json()) as {
        status: string;
      }[];
      expect(list.filter((p) => p.status === 'present').length).toBe(1);
      const image = await fetch(`${base}/image/elf/mage/female1.png`);
      expect(image.headers.get('content-type')).toBe('image/png');
      const rejected = await fetch(`${base}/api/reject?stem=elf/mage/female1`, {
        method: 'POST',
      });
      expect(rejected.status).toBe(200);
      expect((await fetch(`${base}/image/nope.png`)).status).toBe(404);
    } finally {
      server.close();
    }
  });
});
