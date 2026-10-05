#!/usr/bin/env node
/**
 * overview-api.mjs — rotas da HOME de projetos (`projects.html`), penduradas no
 * `server.mjs` pelo ponto de extensão `route()` (mesmo padrão de
 * `assets-api.mjs` e `review-api.mjs`). Só leitura: nenhuma rota daqui grava.
 *
 * Zero dependência: só `node:` builtins. Node 22+.
 *
 *   GET /api/overview[?dir=|&slug=]   -> todos os projetos com status do pipeline
 *   GET /api/thumb?slug=&w=           -> miniatura JPEG do frame do projeto
 *   GET /api/doc?dir=&name=COPY.md    -> COPY.md / REFS.md do projeto (texto cru)
 *   GET /api/refs?dir=                -> imagens de references/ + refs esperadas do REFS.md (refs.mjs)
 *   GET /api/ref?dir=&path=&w=        -> uma imagem de references/ (com `w`: miniatura JPEG)
 *
 * Miniatura: o frame é redimensionado pelo `ffmpeg` do PATH (o mesmo que as
 * skills de vídeo já usam), com cache em memória. Sem ffmpeg, a rota devolve o
 * frame original — a página continua funcionando, só fica mais pesada.
 * `FFMPEG_BIN` troca o executável.
 */

import { spawn } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { getRoot, route, safeProjectDir, sendError, sendFile, sendJson } from './server.mjs';
import { DOC_NAMES, buildOverview, findFileCI, thumbPathForSlug } from './overview.mjs';
import { buildRefsReport, resolveRefImage } from './refs.mjs';

const THUMB_WIDTHS = [160, 240, 320, 480];
/** Larguras de miniatura das refs (grade da aba Imagens e prévia do lightbox). */
const REF_WIDTHS = [160, 240, 320, 480, 640, 960];
const THUMB_DEFAULT = 320;
const THUMB_CACHE_MAX = 400;
const THUMB_CONCURRENCY = 3;
const DOC_MAX_BYTES = 2_000_000;

// ---------------------------------------------------------------------------
// GET /api/overview
// ---------------------------------------------------------------------------

route('GET', '/api/overview', (req, res, url) => {
  const root = getRoot();
  const only = {};
  const dir = url.searchParams.get('dir');
  const slug = url.searchParams.get('slug');
  if (dir) only.dir = dir;
  if (slug) only.slug = slug;
  const overview = buildOverview(root, only);
  sendJson(res, 200, { ok: true, ...overview, thumbs: ffmpegState });
});

// ---------------------------------------------------------------------------
// GET /api/thumb?slug=&w=
// ---------------------------------------------------------------------------

/** 'unknown' até a primeira tentativa; 'ffmpeg' se funcionou; 'original' se não há ffmpeg. */
let ffmpegState = 'unknown';
const thumbCache = new Map(); // chave -> Buffer (JPEG)
const inflight = new Map(); // chave -> Promise<Buffer>
let running = 0;
const waiting = [];

function withLimit(task) {
  return new Promise((resolveTask, rejectTask) => {
    const run = () => {
      running += 1;
      task()
        .then(resolveTask, rejectTask)
        .finally(() => {
          running -= 1;
          const next = waiting.shift();
          if (next) next();
        });
    };
    if (running < THUMB_CONCURRENCY) run();
    else waiting.push(run);
  });
}

function ffmpegThumb(abs, width) {
  return new Promise((resolveThumb, rejectThumb) => {
    const bin = process.env.FFMPEG_BIN || 'ffmpeg';
    const args = [
      '-v', 'error', '-nostdin',
      '-i', abs,
      '-frames:v', '1',
      '-vf', `scale=${width}:-2:flags=lanczos`,
      '-f', 'image2pipe', '-c:v', 'mjpeg', '-q:v', '5',
      'pipe:1',
    ];
    let child;
    try {
      child = spawn(bin, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (err) {
      rejectThumb(err);
      return;
    }
    const out = [];
    let errText = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), 15_000);
    child.stdout.on('data', (c) => out.push(c));
    child.stderr.on('data', (c) => {
      errText += c;
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      rejectThumb(err);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      const buf = Buffer.concat(out);
      if (code === 0 && buf.length) resolveThumb(buf);
      else rejectThumb(new Error(errText.trim() || `ffmpeg saiu com código ${code}`));
    });
  });
}

function remember(key, buf) {
  thumbCache.set(key, buf);
  if (thumbCache.size > THUMB_CACHE_MAX) thumbCache.delete(thumbCache.keys().next().value);
}

async function thumbFor(abs, width, key) {
  if (thumbCache.has(key)) return thumbCache.get(key);
  if (ffmpegState === 'original') return null;
  if (!inflight.has(key)) {
    const p = withLimit(() => ffmpegThumb(abs, width))
      .then((buf) => {
        ffmpegState = 'ffmpeg';
        remember(key, buf);
        return buf;
      })
      .catch((err) => {
        if (err && err.code === 'ENOENT') ffmpegState = 'original';
        return null; // qualquer falha: cai no frame original
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, p);
  }
  return inflight.get(key);
}

route('GET', '/api/thumb', async (req, res, url) => {
  const root = getRoot();
  const abs = thumbPathForSlug(root, url.searchParams.get('slug'));
  if (!abs) {
    sendError(res, 404, 'projeto sem frame para miniatura');
    return;
  }
  const asked = Number(url.searchParams.get('w')) || THUMB_DEFAULT;
  const width = THUMB_WIDTHS.reduce((best, w) => (Math.abs(w - asked) < Math.abs(best - asked) ? w : best));
  const st = statSync(abs);
  const key = `${abs}|${st.mtimeMs}|${st.size}|${width}`;
  const buf = await thumbFor(abs, width, key);
  if (!buf) {
    sendFile(res, abs, { cache: 'public, max-age=3600' });
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Content-Length': buf.length,
    // a URL carrega `v=` (mtime+tamanho do frame): mudou o frame, muda a URL
    'Cache-Control': 'public, max-age=86400',
  });
  res.end(buf);
});

// ---------------------------------------------------------------------------
// GET /api/doc?dir=<seedance-…>&name=COPY.md|REFS.md
// ---------------------------------------------------------------------------

route('GET', '/api/doc', (req, res, url) => {
  const dir = url.searchParams.get('dir');
  const abs = safeProjectDir(dir);
  const want = String(url.searchParams.get('name') ?? 'COPY.md').trim();
  const allowed = DOC_NAMES.find((n) => n.toLowerCase() === want.toLowerCase());
  if (!allowed) throw new Error(`documento não permitido: ${want} — use ${DOC_NAMES.join(' | ')}`);

  const found = findFileCI(abs, allowed);
  if (!found) {
    sendJson(res, 200, { ok: true, dir, name: allowed, exists: false, markdown: '' });
    return;
  }
  const file = join(abs, found);
  const st = statSync(file);
  if (st.size > DOC_MAX_BYTES) throw new Error(`${found} grande demais para a página (${st.size} bytes)`);
  sendJson(res, 200, {
    ok: true,
    dir,
    name: found,
    exists: true,
    path: `${dir}/${found}`,
    bytes: st.size,
    updatedAt: st.mtime.toISOString(),
    markdown: readFileSync(file, 'utf8').replace(/^﻿/, ''),
  });
});

// ---------------------------------------------------------------------------
// GET /api/refs?dir=<seedance-…>   (aba "Imagens" da gaveta — refs.mjs)
// ---------------------------------------------------------------------------

function refVersion(item) {
  return `${item.mtimeMs.toString(36)}${item.bytes.toString(36)}`;
}

route('GET', '/api/refs', (req, res, url) => {
  const dir = url.searchParams.get('dir');
  const abs = safeProjectDir(dir);
  const report = buildRefsReport(abs, { dirName: dir, sizes: true });
  const enc = encodeURIComponent;
  const items = report.items.map((item) => {
    const src = `/api/ref?dir=${enc(dir)}&path=${enc(item.path)}&v=${refVersion(item)}`;
    return { ...item, url: src, thumb: `${src}&w=320` };
  });
  sendJson(res, 200, {
    ok: true,
    dir,
    ...report,
    items,
    root: `${dir}/${report.folder}`,
    thumbs: ffmpegState,
    generatedAt: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// GET /api/ref?dir=&path=&w=   — a imagem (ou miniatura JPEG via ffmpeg)
// ---------------------------------------------------------------------------

route('GET', '/api/ref', async (req, res, url) => {
  const abs = safeProjectDir(url.searchParams.get('dir'));
  // lança (-> 400) em traversal / caminho absoluto / não-imagem; null = não existe
  const item = resolveRefImage(abs, url.searchParams.get('path'));
  if (!item) {
    sendError(res, 404, `imagem não encontrada em references/: ${url.searchParams.get('path')}`);
    return;
  }
  // a URL da listagem carrega `v=` (mtime+tamanho): mudou a imagem, muda a URL
  const cache = url.searchParams.has('v') ? 'public, max-age=86400' : 'no-cache';
  const asked = Number(url.searchParams.get('w'));
  if (!asked) {
    sendFile(res, item.abs, { cache });
    return;
  }
  const width = REF_WIDTHS.reduce((best, w) => (Math.abs(w - asked) < Math.abs(best - asked) ? w : best));
  const key = `${item.abs}|${item.mtimeMs}|${item.bytes}|${width}`;
  const buf = await thumbFor(item.abs, width, key);
  if (!buf) {
    sendFile(res, item.abs, { cache });
    return;
  }
  res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': buf.length, 'Cache-Control': cache });
  res.end(buf);
});
