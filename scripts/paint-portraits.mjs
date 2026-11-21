// Paints the missing default portraits with AI (spec 011 US3) — run it on your own computer:
//
//   npm run portraits:paint -- --dry-run            list what would be painted, no network
//   npm run portraits:paint -- --limit 2            AI Horde, no account
//   npm run portraits:paint -- --service cloudflare
//
// Keys come from the .env file (copy .env.example; read by `node --env-file-if-exists`) or the environment
// (AI_HORDE_API_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN); they are never written or printed. Existing portraits are never overwritten; a
// new run continues with what is left. See docs/portraits.md.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildPortraitPrompt,
  defaultPortraitSubject,
} from './portrait-prompt.mjs';
import {
  allPortraits,
  existingPortrait,
  root,
  writeGuide,
  writeManifest,
} from './portraits-lib.mjs';

const HORDE_URL = 'https://aihorde.net/api/v2';
const CLIENT_AGENT =
  'character-generator-portraits:1.0:https://github.com/gcascade/character-generator';
/** Default model: good painterly results, but few workers serve it; `--model any` takes whatever is free. */
const DEFAULT_MODEL = 'AlbedoBase XL (SDXL)';
const POLL_MS = 5000;

/** Stops the whole run (quota, network, bad key); what is done is kept. */
export class StopRun extends Error {}

const USAGE = `Usage: npm run portraits:paint -- [--service horde|cloudflare] [--dry-run] [--limit <n>] [--only <race/class/male1|female1>] [--size <px>] [--model <name|any>] [--timeout <minutes>]`;

export const parseArgs = (argv) => {
  const options = {
    service: 'horde',
    dryRun: false,
    limit: Infinity,
    only: undefined,
    size: 768,
    model: DEFAULT_MODEL,
    timeoutMinutes: 60,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const next = argv[++i];
      if (next === undefined)
        throw new Error(`${arg} needs a value.\n${USAGE}`);
      return next;
    };
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--service') options.service = value();
    else if (arg === '--limit') options.limit = Number(value());
    else if (arg === '--only')
      options.only = value().replace(/\.(png|webp|jpg)$/, '');
    else if (arg === '--size') options.size = Number(value());
    else if (arg === '--model') options.model = value();
    else if (arg === '--timeout') options.timeoutMinutes = Number(value());
    else if (arg === '--help' || arg === '-h') throw new Error(USAGE);
    else throw new Error(`Unknown option ${arg}.\n${USAGE}`);
  }
  if (!['horde', 'cloudflare'].includes(options.service)) {
    throw new Error(`--service must be horde or cloudflare.\n${USAGE}`);
  }
  if (!(options.limit > 0))
    throw new Error(`--limit must be a positive number.\n${USAGE}`);
  if (!(options.timeoutMinutes > 0)) {
    throw new Error(`--timeout must be a number of minutes.\n${USAGE}`);
  }
  if (!(options.size >= 256 && options.size <= 2048)) {
    throw new Error(`--size must be between 256 and 2048.\n${USAGE}`);
  }
  return options;
};

/** The portraits to paint: missing ones, or the one asked for (even if it exists). */
export const plan = ({ only, limit }) => {
  const portraits = allPortraits();
  if (only) {
    const found = portraits.filter((p) => p.stem === only);
    if (!found.length)
      throw new Error(
        `No portrait called ${only} (example: gnome/bard/female1).`,
      );
    return found;
  }
  return portraits.filter((p) => !existingPortrait(p.stem)).slice(0, limit);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** File extension from the image bytes. */
export const extensionOf = (bytes) => {
  if (
    bytes.subarray(0, 4).toString('latin1') === 'RIFF' &&
    bytes.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'webp';
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpg';
  if (bytes.subarray(1, 4).toString('latin1') === 'PNG') return 'png';
  throw new Error('The service did not return a known image format.');
};

const paintWithHorde = async (
  prompt,
  { size, model, timeoutMinutes, fetch, log, signal },
) => {
  const headers = {
    apikey: process.env.AI_HORDE_API_KEY || '0000000000',
    'Client-Agent': CLIENT_AGENT,
    'Content-Type': 'application/json',
  };
  const call = async (path, init = {}) => {
    let response;
    try {
      response = await fetch(`${HORDE_URL}${path}`, {
        ...init,
        headers,
        signal,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new StopRun(
        `AI Horde cannot be reached (${error.message}). Check your connection and run again.`,
      );
    }
    const body = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      throw new StopRun(
        `AI Horde refused the key (${body.message ?? response.status}). Check AI_HORDE_API_KEY.`,
      );
    }
    if (response.status === 429) {
      throw new StopRun(
        'AI Horde says too many requests: wait a few minutes and run again.',
      );
    }
    if (!response.ok)
      throw new Error(`AI Horde: ${body.message ?? `HTTP ${response.status}`}`);
    return body;
  };

  const { id } = await call('/generate/async', {
    method: 'POST',
    body: JSON.stringify({
      prompt: `${prompt.positive} ### ${prompt.negative}`,
      params: {
        width: size,
        height: size,
        steps: 30,
        cfg_scale: 6,
        sampler_name: 'k_euler_a',
        n: 1,
      },
      ...(model !== 'any' && { models: [model] }),
      nsfw: false,
      censor_nsfw: true,
      r2: false,
      shared: false,
    }),
  });
  if (!id) throw new Error('AI Horde gave no request id.');
  const withdraw = () =>
    fetch(`${HORDE_URL}/generate/status/${id}`, {
      method: 'DELETE',
      headers,
    }).catch(() => {});

  try {
    const deadline = Date.now() + timeoutMinutes * 60 * 1000;
    for (;;) {
      const check = await call(`/generate/check/${id}`);
      if (check.faulted) throw new Error('the painter failed');
      if (check.is_possible === false) {
        throw new StopRun(
          'No AI Horde painter can take this request now (model or size): try again later, with --size 512 or with --model any.',
        );
      }
      if (check.done) break;
      log(
        `  queue position ${check.queue_position ?? '?'}, about ${check.wait_time ?? '?'} s`,
      );
      if (Date.now() > deadline) {
        throw new Error(
          `waited more than ${timeoutMinutes} minutes (try --timeout 120 or --model any)`,
        );
      }
      await sleep(POLL_MS);
    }
    const status = await call(`/generate/status/${id}`);
    const generation = status.generations?.[0];
    if (!generation?.img) throw new Error('no image in the answer');
    if (generation.censored)
      throw new Error('the safety filter hid the result');
    return Buffer.from(generation.img.replace(/^data:[^,]+,/, ''), 'base64');
  } catch (error) {
    await withdraw();
    throw error;
  }
};

const paintWithCloudflare = async (prompt, { fetch }) => {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !token) {
    throw new StopRun(
      'Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in your terminal (see docs/portraits.md).',
    );
  }
  let response;
  try {
    response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // FLUX schnell has no negative prompt: the essentials go into the prompt.
        body: JSON.stringify({
          prompt: `${prompt.positive}. Unsigned painting: no text, no letters, no signature, no logo, no website address, no watermark. Fully clothed.`,
        }),
      },
    );
  } catch (error) {
    throw new StopRun(
      `Cloudflare cannot be reached (${error.message}). Check your connection and run again.`,
    );
  }
  const body = await response.json().catch(() => ({}));
  const message =
    body.errors?.map((e) => e.message).join('; ') || `HTTP ${response.status}`;
  if (response.status === 401 || response.status === 403) {
    throw new StopRun(
      `Cloudflare refused the token (${message}). Check CLOUDFLARE_API_TOKEN and its Workers AI permission.`,
    );
  }
  if (
    response.status === 429 ||
    /quota|allocation|neurons|limit/i.test(message)
  ) {
    throw new StopRun(
      `Cloudflare's free daily quota is used up (${message}). Run again tomorrow: it continues where it stopped.`,
    );
  }
  if (!response.ok || !body.result?.image)
    throw new Error(`Cloudflare: ${message}`);
  return Buffer.from(body.result.image, 'base64');
};

/** Runs the script; returns the exit code (0 done, 1 bad usage, 2 stopped early). */
export const main = async (
  argv,
  { fetch = globalThis.fetch, log = console.log } = {},
) => {
  let options;
  let todo;
  try {
    options = parseArgs(argv);
    todo = plan(options);
  } catch (error) {
    log(error.message);
    return 1;
  }
  if (!todo.length) {
    log('Every portrait exists: nothing to paint.');
    return 0;
  }
  log(
    `${todo.length} portrait(s) to paint with ${options.service}${options.dryRun ? ' (dry run)' : ''}.`,
  );
  if (!options.dryRun) {
    log(
      options.service === 'cloudflare'
        ? 'Using your Cloudflare account.'
        : process.env.AI_HORDE_API_KEY
          ? 'Using your AI Horde key (from .env or the environment).'
          : 'Using AI Horde without an account (add AI_HORDE_API_KEY to .env for a higher priority).',
    );
  }

  const controller = new AbortController();
  const onInterrupt = () => controller.abort();
  process.once('SIGINT', onInterrupt);
  let painted = 0;
  let failed = 0;
  try {
    for (const [index, portrait] of todo.entries()) {
      const prompt = buildPortraitPrompt(
        defaultPortraitSubject(
          portrait.race,
          portrait.characterClass,
          portrait.variant,
        ),
      );
      log(`[${index + 1}/${todo.length}] ${portrait.stem}`);
      if (options.dryRun) {
        log(`  prompt: ${prompt.positive}`);
        continue;
      }
      try {
        const bytes =
          options.service === 'cloudflare'
            ? await paintWithCloudflare(prompt, { fetch })
            : await paintWithHorde(prompt, {
                size: options.size,
                model: options.model,
                timeoutMinutes: options.timeoutMinutes,
                fetch,
                log,
                signal: controller.signal,
              });
        const file = join(
          root,
          'public/images',
          `${portrait.stem}.${extensionOf(bytes)}`,
        );
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, bytes);
        // Keep the app's list in step after each portrait, so a stop loses nothing.
        writeManifest();
        painted++;
        log(`  saved ${file.slice(root.length + 1)}`);
      } catch (error) {
        if (error instanceof StopRun) throw error;
        if (controller.signal.aborted) throw new StopRun('Stopped (Ctrl+C).');
        failed++;
        log(`  skipped: ${error.message}`);
      }
    }
  } catch (error) {
    if (!(error instanceof StopRun)) throw error;
    log(error.message);
    return finish(painted, failed, true, log);
  } finally {
    process.off('SIGINT', onInterrupt);
  }
  return options.dryRun ? 0 : finish(painted, failed, false, log);
};

const finish = (painted, failed, stopped, log) => {
  writeManifest();
  const { missing, total } = writeGuide();
  log(
    `${painted} painted, ${failed} skipped${stopped ? ', stopped early' : ''}. ${missing} of ${total} portraits still missing.`,
  );
  if (painted)
    log(
      'Look at the new images in public/images, then commit them with portraitFiles.json and docs/portraits.md.',
    );
  return stopped ? 2 : 0;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
