#!/usr/bin/env node
/**
 * server.mjs — servidor local da skill `video-workflow`.
 *
 * Zero dependência: só `node:` builtins. Node 22+.
 *
 * Serve a UI (`ui.html`) e uma API JSON sobre `beats.mjs`:
 *
 *   GET  /                          -> ui.html
 *   GET  /<arquivo estático>        -> arquivo da pasta da skill (html/css/js/svg/png/ico)
 *   GET  /api/health                -> { ok: true, ... }
 *   GET  /api/projects              -> { ok, projects: [...] }
 *   GET  /api/project?dir=<nome>    -> { ok, project: {...} }   (beats já com `frame`)
 *   GET  /api/frame?dir=&name=      -> bytes da imagem (lida do caminho absoluto do beats.mjs)
 *   POST /api/beat                  -> { ok, changed, changedKeys, beat }   (chama writeBeat)
 *
 * EXTENSÃO (parte 3 — página de assets): não edite o dispatcher. Importe este
 * módulo e use `route(method, pathname, handler)` para registrar rotas novas,
 * e os helpers exportados `sendJson`, `sendFile`, `readJsonBody`, `safeProjectDir`.
 * Qualquer `.html` novo colocado nesta pasta já é servido pelo handler estático.
 */

import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseProject, listChunks, writeBeat, FIELD_KEYS } from './beats.mjs';

// ---------------------------------------------------------------------------
// constantes
// ---------------------------------------------------------------------------

/** Porta fixa. Escolhida fora de 4317 (goal-kanban), 8080 e 3001 (content-chisel). */
export const DEFAULT_PORT = 7788;
export const DEFAULT_HOST = '127.0.0.1';

export const SKILL_DIR = dirname(fileURLToPath(import.meta.url));
/** Raiz do repo UGC: <raiz>/.claude/skills/video-workflow/server.mjs */
export const DEFAULT_ROOT = resolve(SKILL_DIR, '..', '..', '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const STATIC_NAME_RE = /^[\w.-]+\.(html|css|js|mjs|svg|png|jpe?g|webp|ico|txt)$/i;
/** Nome de pasta de projeto: sem separador, sem `..`. */
const PROJECT_DIR_RE = /^[\w][\w.-]*$/;

let ROOT = DEFAULT_ROOT;
export function getRoot() {
  return ROOT;
}
export function setRoot(dir) {
  ROOT = resolve(dir);
  return ROOT;
}

// ---------------------------------------------------------------------------
// helpers de resposta
// ---------------------------------------------------------------------------

export function sendJson(res, status, payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8');
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

export function sendError(res, status, message, extra = {}) {
  sendJson(res, status, { ok: false, error: message, ...extra });
}

export function sendFile(res, absPath, { cache = 'no-store' } = {}) {
  let body;
  try {
    body = readFileSync(absPath);
  } catch {
    sendError(res, 404, `arquivo não encontrado: ${basename(absPath)}`);
    return;
  }
  res.writeHead(200, {
    'Content-Type': MIME[extname(absPath).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': body.length,
    'Cache-Control': cache,
  });
  res.end(body);
}

export async function readJsonBody(req, limit = 1_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('corpo da requisição grande demais');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('corpo da requisição não é JSON válido');
  }
}

/**
 * Valida `?dir=` e devolve o caminho absoluto do projeto dentro da raiz.
 * Lança se o nome tiver separador, `..` ou não existir.
 */
export function safeProjectDir(name) {
  const raw = String(name ?? '').trim();
  if (!raw) throw new Error('parâmetro `dir` é obrigatório');
  if (!PROJECT_DIR_RE.test(raw)) throw new Error(`nome de projeto inválido: ${raw}`);
  const abs = join(ROOT, raw);
  if (!existsSync(abs) || !statSync(abs).isDirectory()) {
    throw new Error(`projeto não encontrado: ${raw}`);
  }
  return abs;
}

// ---------------------------------------------------------------------------
// serialização para a API (tira os internos do serializer)
// ---------------------------------------------------------------------------

function publicFrame(frame, dir) {
  if (!frame) return null;
  return {
    name: frame.name,
    kind: frame.kind,
    t: frame.t,
    path: frame.path,
    url: `/api/frame?dir=${encodeURIComponent(dir)}&name=${encodeURIComponent(frame.name)}`,
  };
}

function publicBeat(beat, dir, position, total) {
  return {
    id: beat.id,
    index: beat.index,
    position,
    total,
    chunk: beat.chunk,
    chunkFile: beat.chunkFile,
    file: beat.file,
    name: beat.name,
    start: beat.start,
    end: beat.end,
    duration: beat.duration,
    startLabel: beat.startLabel,
    endLabel: beat.endLabel,
    durationLabel: beat.durationLabel,
    description: beat.description,
    dialogue: beat.dialogue,
    camera: beat.camera,
    sfx: beat.sfx,
    vfx: beat.vfx,
    frame: publicFrame(beat.frame, dir),
    frames: beat.frames.map((f) => publicFrame(f, dir)),
  };
}

function publicProject(project, dir) {
  const total = project.beats.length;
  return {
    dir,
    name: project.name,
    seedanceDir: project.seedanceDir,
    teardownDir: project.teardownDir,
    start: project.start,
    end: project.end,
    frameCount: project.frames.length,
    chunks: project.chunks.map((c) => ({
      chunk: c.chunk,
      name: c.name,
      file: c.file,
      chunkStart: c.chunkStart,
      chunkEnd: c.chunkEnd,
      beatCount: c.beats.length,
    })),
    beats: project.beats.map((b, i) => publicBeat(b, dir, i + 1, total)),
  };
}

// ---------------------------------------------------------------------------
// roteador
// ---------------------------------------------------------------------------

/** `${METHOD} ${pathname}` -> handler(req, res, url) */
export const routes = new Map();

export function route(method, pathname, handler) {
  routes.set(`${method.toUpperCase()} ${pathname}`, handler);
  return handler;
}

route('GET', '/api/health', (req, res) => {
  sendJson(res, 200, { ok: true });
});

route('GET', '/api/projects', (req, res) => {
  const entries = readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() || e.isSymbolicLink())
    .map((e) => e.name)
    .filter((name) => PROJECT_DIR_RE.test(name) && !name.startsWith('.'))
    .map((name) => ({ dir: name, chunks: listChunks(join(ROOT, name)) }))
    .filter((p) => p.chunks.length > 0)
    .map((p) => ({
      dir: p.dir,
      chunkCount: p.chunks.length,
      start: p.chunks[0].chunkStart,
      end: p.chunks[p.chunks.length - 1].chunkEnd,
    }))
    .sort((a, b) => a.dir.localeCompare(b.dir));
  sendJson(res, 200, { ok: true, root: ROOT, projects: entries });
});

route('GET', '/api/project', (req, res, url) => {
  const dir = url.searchParams.get('dir');
  const abs = safeProjectDir(dir);
  const teardown = url.searchParams.get('teardown');
  const project = parseProject(abs, teardown ? safeProjectDir(teardown) : undefined);
  sendJson(res, 200, { ok: true, project: publicProject(project, dir) });
});

route('GET', '/api/frame', (req, res, url) => {
  const dir = url.searchParams.get('dir');
  const name = url.searchParams.get('name');
  const abs = safeProjectDir(dir);
  if (!name) throw new Error('parâmetro `name` é obrigatório');
  const project = parseProject(abs);
  // Só servimos caminhos que o próprio beats.mjs devolveu — zero path traversal.
  const frame = project.frames.find((f) => f.name === name);
  if (!frame) throw new Error(`frame não encontrado em ${dir}: ${name}`);
  sendFile(res, frame.path, { cache: 'public, max-age=300' });
});

route('POST', '/api/beat', async (req, res) => {
  const body = await readJsonBody(req);
  const dir = body.dir;
  const abs = safeProjectDir(dir);
  const id = body.id == null ? null : String(body.id);
  if (!id) throw new Error('campo `id` é obrigatório (ex.: "1.3")');

  const patch = body.patch ?? {};
  const allowed = new Set([...FIELD_KEYS, 'name', 'description', 'start', 'end', 'duration']);
  for (const key of Object.keys(patch)) {
    if (!allowed.has(key)) throw new Error(`campo não editável: ${key}`);
  }

  const before = parseProject(abs);
  const target = before.beats.find((b) => b.id === id);
  if (!target) throw new Error(`beat ${id} não encontrado em ${dir}`);

  const result = writeBeat(target.file, target.index, patch);

  const after = parseProject(abs);
  const total = after.beats.length;
  const position = after.beats.findIndex((b) => b.id === id);
  const beat = position >= 0 ? publicBeat(after.beats[position], dir, position + 1, total) : null;

  sendJson(res, 200, {
    ok: true,
    changed: result.changed,
    changedKeys: result.changedKeys,
    file: result.file,
    beat,
  });
});

/** Estático: `/` -> ui.html, `/<nome>.html|css|js|...` -> arquivo da pasta da skill. */
function staticHandler(req, res, url) {
  const name = url.pathname === '/' ? 'ui.html' : url.pathname.slice(1);
  if (!STATIC_NAME_RE.test(name)) {
    sendError(res, 404, `rota não encontrada: ${url.pathname}`);
    return;
  }
  const abs = join(SKILL_DIR, name);
  if (!existsSync(abs)) {
    sendError(res, 404, `arquivo não encontrado: ${name}`);
    return;
  }
  sendFile(res, abs, { cache: 'no-store' });
}

export async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host ?? DEFAULT_HOST}`);
  const key = `${req.method} ${url.pathname}`;
  const handler = routes.get(key);
  try {
    if (handler) {
      await handler(req, res, url);
      return;
    }
    if (req.method === 'GET' || req.method === 'HEAD') {
      staticHandler(req, res, url);
      return;
    }
    sendError(res, 405, `método não permitido: ${req.method} ${url.pathname}`);
  } catch (err) {
    if (!res.headersSent) sendError(res, 400, err?.message ?? String(err));
    else res.end();
  }
}

export function createVideoWorkflowServer() {
  return createServer((req, res) => {
    handle(req, res);
  });
}

// ---------------------------------------------------------------------------
// CLI: node server.mjs [--port N] [--root DIR]
// ---------------------------------------------------------------------------

function parseArgv(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--port') out.port = Number(argv[++i]);
    else if (arg.startsWith('--port=')) out.port = Number(arg.slice(7));
    else if (arg === '--root') out.root = argv[++i];
    else if (arg.startsWith('--root=')) out.root = arg.slice(7);
    else if (arg === '--host') out.host = argv[++i];
    else if (arg.startsWith('--host=')) out.host = arg.slice(7);
  }
  return out;
}

export function main(argv = []) {
  const opts = parseArgv(argv);
  const port = opts.port || Number(process.env.UGC_PORT) || DEFAULT_PORT;
  const host = opts.host || process.env.UGC_HOST || DEFAULT_HOST;
  setRoot(opts.root || process.env.UGC_ROOT || DEFAULT_ROOT);

  const server = createVideoWorkflowServer();
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[video-workflow] porta ${port} já está em uso. Feche o outro servidor ou use --port.`);
      process.exit(1);
    }
    throw err;
  });
  server.listen(port, host, () => {
    console.log(`[video-workflow] raiz    : ${ROOT}`);
    console.log(`[video-workflow] ouvindo : ${host}:${port}`);
  });
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2));
}
