import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { extensionOf, main, parseArgs, plan } from './paint-portraits.mjs';

const root = join(__dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

/** Runs the script with a fake network; returns its output and exit code. */
const run = async (argv: string[], fetch = vi.fn()) => {
  const lines: string[] = [];
  const code = await main(argv, { fetch, log: (line) => lines.push(line) });
  return { code, output: lines.join('\n'), fetch };
};

describe('paint-portraits script (spec 011 US3)', () => {
  const manifest = read('src/data/content/portraitFiles.json');
  const guide = read('docs/portraits.md');
  afterEach(() => {
    vi.unstubAllEnvs();
    // The script rewrites these files: they must not change in tests.
    expect(read('src/data/content/portraitFiles.json')).toBe(manifest);
    expect(read('docs/portraits.md')).toBe(guide);
  });

  it('reads its options and refuses bad ones', () => {
    expect(parseArgs([])).toMatchObject({
      service: 'horde',
      dryRun: false,
      size: 1024,
    });
    expect(
      parseArgs(['--service', 'cloudflare', '--limit', '3', '--dry-run']),
    ).toMatchObject({
      service: 'cloudflare',
      limit: 3,
      dryRun: true,
    });
    expect(() => parseArgs(['--service', 'dalle'])).toThrow(
      /horde or cloudflare/,
    );
    expect(() => parseArgs(['--limit', '0'])).toThrow(/positive/);
    expect(() => parseArgs(['--nope'])).toThrow(/Unknown option/);
  });

  it('plans only missing portraits, or the one asked for', () => {
    const missing = plan({ limit: Infinity });
    expect(missing.length).toBeGreaterThan(0);
    expect(missing.some((p) => p.stem === 'elf/mage/female1')).toBe(false);
    expect(plan({ only: 'elf/mage/female1', limit: Infinity })).toHaveLength(1);
    expect(() =>
      plan({ only: 'dragon/mage/female1', limit: Infinity }),
    ).toThrow();
  });

  it('lists paths and prompts in a dry run, without network', async () => {
    const { code, output, fetch } = await run(['--dry-run', '--limit', '2']);
    expect(code).toBe(0);
    expect(output).toMatch(/2 portrait\(s\) to paint/);
    expect(output).toMatch(/prompt: semi-realistic digital fantasy painting/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('asks for the Cloudflare keys, and never prints them', async () => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', '');
    vi.stubEnv('CLOUDFLARE_API_TOKEN', '');
    const missing = await run(['--service', 'cloudflare', '--limit', '1']);
    expect(missing.code).toBe(2);
    expect(missing.output).toMatch(
      /Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN/,
    );

    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'acc-123');
    vi.stubEnv('CLOUDFLARE_API_TOKEN', 'secret-token-xyz');
    const quota = await run(
      ['--service', 'cloudflare', '--limit', '1'],
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              success: false,
              errors: [{ message: 'daily free allocation exceeded' }],
            }),
            { status: 429 },
          ),
      ),
    );
    expect(quota.code).toBe(2);
    expect(quota.output).toMatch(/quota is used up.*Run again tomorrow/);
    expect(quota.output).not.toContain('secret-token-xyz');
    const [, init] = quota.fetch.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer secret-token-xyz');
  });

  it('stops when AI Horde cannot be reached', async () => {
    const { code, output } = await run(
      ['--limit', '1'],
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    expect(code).toBe(2);
    expect(output).toMatch(/AI Horde cannot be reached/);
  });

  it('recognises the image formats', () => {
    const webp = Buffer.concat([
      Buffer.from('RIFF'),
      Buffer.alloc(4),
      Buffer.from('WEBP'),
    ]);
    expect(extensionOf(webp)).toBe('webp');
    expect(extensionOf(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpg');
    expect(extensionOf(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe('png');
    expect(() => extensionOf(Buffer.from('<html>'))).toThrow();
  });
});
