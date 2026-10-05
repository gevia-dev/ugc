#!/usr/bin/env node
/**
 * assets-api.mjs — rotas da página de ASSETS, penduradas no `server.mjs` da
 * parte 2 pelo ponto de extensão `route()`. O dispatcher não foi tocado.
 *
 * Zero dependência: só `node:` builtins. Node 22+.
 *
 *   GET  /api/assets                          -> biblioteca inteira (+ miniaturas e uso por projeto)
 *   GET  /api/asset/file?slug=&name=          -> bytes de um arquivo da biblioteca
 *   GET  /api/asset/thumb?slug=&name=&w=&v=   -> miniatura JPEG de uma imagem (ffmpeg, cache)
 *   POST /api/asset            (JSON)         -> cria/atualiza a ENTRADA de um asset
 *   POST /api/asset/file?slug=&name=…(binário)-> grava o arquivo em assets/<slug>/
 *   GET  /api/recurring?dir=<projeto>         -> candidatos recorrentes + casamento
 *   GET  /api/approved?dir=<projeto>          -> estado aprovado do projeto
 *   POST /api/approved         (JSON)         -> registra UMA decisão de tela
 *
 * Upload sem dependência e sem multipart: o corpo é o arquivo CRU e os metadados
 * vêm na query string. `fetch(url, { method: 'POST', body: file })` no browser.
 *
 * Miniatura: as refs da biblioteca são PNG de 2–7 MB; a grade nunca carrega o
 * original. `/api/asset/thumb` redimensiona com o `ffmpeg` do PATH (`FFMPEG_BIN`
 * troca o binário) — a mesma receita do `/api/thumb` da home —, guarda em
 * memória e num cache em disco FORA da biblioteca (pasta temporária do sistema),
 * e sem ffmpeg devolve o arquivo original. Nada aqui escreve em `assets/`.
 */

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';

import { getRoot, readJsonBody, route, safeProjectDir, sendError, sendJson } from './server.mjs';
import { recurringCandidates, slugify } from './recurring.mjs';
import {
  ASSETS_DIRNAME,
  DECISIONS,
  KINDS,
  ROLES,
  addAssetFile,
  approvedPath,
  clearDecision,
  createFolder,
  assetsRoot,
  libraryPath,
  listApprovedProjects,
  matchCandidate,
  moveAssetToFolder,
  readApproved,
  readLibrary,
  recordDecision,
  relFromRoot,
  safeAssetFilePath,
  safeSlug,
  upsertAsset,
} from './assets.mjs';

/** 48 MB: uma ref de 4K em PNG passa folgado; um mp3 de voz, mais ainda. */
const UPLOAD_LIMIT = 48 * 1024 * 1024;

const ASSET_MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.flac': 'audio/flac',
};

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

async function readBinaryBody(req, limit = UPLOAD_LIMIT) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error(`upload maior que o limite de ${Math.round(limit / 1024 / 1024)} MB`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function sendAssetBytes(res, absPath) {
  let body;
  try {
    body = readFileSync(absPath);
  } catch {
    sendError(res, 404, 'arquivo de asset não encontrado');
    return;
  }
  res.writeHead(200, {
    'Content-Type': ASSET_MIME[extname(absPath).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': body.length,
    'Accept-Ranges': 'none',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function fileUrl(slug, name) {
  return `/api/asset/file?slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`;
}

/**
 * URL da miniatura SEM a largura — a página acrescenta `&w=`. O `v=` é o começo
 * do sha256 do arquivo: trocou a imagem, muda a URL, e o cache do browser pode
 * ser longo.
 */
function thumbUrl(slug, file) {
  const v = String(file.sha256 ?? '').slice(0, 12) || String(Date.parse(file.addedAt ?? '') || 0);
  return `/api/asset/thumb?slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(file.name)}&v=${v}`;
}

/**
 * Acrescenta `url` (e `thumb`, nas imagens) a cada arquivo — a página nunca
 * monta caminho de disco. `cover` é a imagem principal (a primeira) e `usedIn`
 * lista os projetos que já ligaram este asset em `assets/approved/`.
 * Só a RESPOSTA ganha campos: `assets.json` não muda.
 */
function publicAsset(asset, usage = null) {
  const files = (asset.files ?? []).map((f) => ({
    ...f,
    url: fileUrl(asset.slug, f.name),
    thumb: f.role === 'image' ? thumbUrl(asset.slug, f) : null,
  }));
  // imagem principal = a mais antiga (subir um ângulo novo não troca a capa)
  const images = files.filter((f) => f.role === 'image').sort(byAddedThenName);
  return {
    ...asset,
    files,
    voice: asset.voice ? { ...asset.voice, url: fileUrl(asset.slug, asset.voice.name) } : null,
    cover: images[0] ? { name: images[0].name, url: images[0].url, thumb: images[0].thumb } : null,
    imageCount: images.length,
    hasVoice: Boolean(asset.voice),
    usedIn: usage ? usage.get(asset.slug) ?? [] : [],
  };
}

function byAddedThenName(a, b) {
  return (Date.parse(a.addedAt ?? '') || 0) - (Date.parse(b.addedAt ?? '') || 0) || a.name.localeCompare(b.name);
}

/** slug -> [{ project, candidate, term, decision }] a partir de `assets/approved/*.json` (só leitura). */
function usageIndex(root) {
  const index = new Map();
  for (const project of listApprovedProjects(root)) {
    let state;
    try {
      state = readApproved(root, project);
    } catch {
      continue; // um approved ilegível não derruba a biblioteca
    }
    for (const e of state.approved ?? []) {
      if (!e || !e.slug) continue;
      if (!index.has(e.slug)) index.set(e.slug, []);
      index.get(e.slug).push({ project, candidate: e.candidate, term: e.term, decision: e.decision });
    }
  }
  return index;
}

function publicLibrary(root) {
  const library = readLibrary(root);
  const usage = usageIndex(root);
  return {
    version: library.version,
    updatedAt: library.updatedAt,
    path: relFromRoot(root, libraryPath(root)),
    dir: `${ASSETS_DIRNAME}/`,
    kinds: KINDS,
    roles: ROLES,
    folders: library.folders ?? [],
    assets: library.assets.map((a) => publicAsset(a, usage)),
  };
}

// ---------------------------------------------------------------------------
// miniaturas de imagem de asset (mesma receita do /api/thumb da home)
// ---------------------------------------------------------------------------

const THUMB_WIDTHS = [160, 240, 320, 480, 800, 1280];
const THUMB_DEFAULT = 320;
const THUMB_MEM_MAX_BYTES = 48 * 1024 * 1024;
/** PNG de 1536×2752 decodificado pesa ~17 MB: 2 de cada vez basta e poupa RAM. */
const THUMB_CONCURRENCY = 2;
const THUMB_DISK_DIR = join(tmpdir(), 'video-workflow-asset-thumbs');
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif)$/i;

/** 'unknown' até a primeira tentativa; 'ffmpeg' se funcionou; 'original' se não há ffmpeg. */
let assetThumbState = 'unknown';
const assetThumbCache = new Map(); // chave -> Buffer (JPEG), em ordem de uso
let assetThumbBytes = 0;
const assetThumbInflight = new Map();
let assetThumbRunning = 0;
const assetThumbWaiting = [];

function withThumbLimit(task) {
  return new Promise((resolveTask, rejectTask) => {
    const run = () => {
      assetThumbRunning += 1;
      task()
        .then(resolveTask, rejectTask)
        .finally(() => {
          assetThumbRunning -= 1;
          const next = assetThumbWaiting.shift();
          if (next) next();
        });
    };
    if (assetThumbRunning < THUMB_CONCURRENCY) run();
    else assetThumbWaiting.push(run);
  });
}

function ffmpegAssetThumb(abs, width) {
  return new Promise((resolveThumb, rejectThumb) => {
    const bin = process.env.FFMPEG_BIN || 'ffmpeg';
    const args = [
      '-v', 'error', '-nostdin',
      '-i', abs,
      '-frames:v', '1',
      // nunca amplia: imagem menor que `w` sai no tamanho dela
      '-vf', `scale='min(${width},iw)':-2:flags=lanczos`,
      '-f', 'image2pipe', '-c:v', 'mjpeg', '-q:v', width >= 800 ? '3' : '5',
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
    const timer = setTimeout(() => child.kill('SIGKILL'), 20_000);
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

function rememberThumb(key, buf) {
  if (assetThumbCache.has(key)) assetThumbBytes -= assetThumbCache.get(key).length;
  assetThumbCache.delete(key);
  assetThumbCache.set(key, buf);
  assetThumbBytes += buf.length;
  while (assetThumbBytes > THUMB_MEM_MAX_BYTES && assetThumbCache.size > 1) {
    const oldest = assetThumbCache.keys().next().value;
    assetThumbBytes -= assetThumbCache.get(oldest).length;
    assetThumbCache.delete(oldest);
  }
}

function diskThumbPath(key) {
  return join(THUMB_DISK_DIR, `${createHash('sha1').update(key).digest('hex')}.jpg`);
}

function readDiskThumb(key) {
  try {
    const buf = readFileSync(diskThumbPath(key));
    return buf.length ? buf : null;
  } catch {
    return null;
  }
}

function writeDiskThumb(key, buf) {
  try {
    mkdirSync(THUMB_DISK_DIR, { recursive: true });
    writeFileSync(diskThumbPath(key), buf);
  } catch {
    /* cache em disco é só atalho: falhou, segue sem ele */
  }
}

async function assetThumbFor(abs, width, key) {
  if (assetThumbCache.has(key)) {
    const hit = assetThumbCache.get(key);
    rememberThumb(key, hit); // marca como usado agora
    return hit;
  }
  const fromDisk = readDiskThumb(key);
  if (fromDisk) {
    rememberThumb(key, fromDisk);
    return fromDisk;
  }
  if (assetThumbState === 'original') return null;
  if (!assetThumbInflight.has(key)) {
    const p = withThumbLimit(() => ffmpegAssetThumb(abs, width))
      .then((buf) => {
        assetThumbState = 'ffmpeg';
        rememberThumb(key, buf);
        writeDiskThumb(key, buf);
        return buf;
      })
      .catch((err) => {
        if (err && err.code === 'ENOENT') assetThumbState = 'original';
        return null; // qualquer falha: cai no arquivo original
      })
      .finally(() => assetThumbInflight.delete(key));
    assetThumbInflight.set(key, p);
  }
  return assetThumbInflight.get(key);
}

// ---------------------------------------------------------------------------
// GET /api/assets
// ---------------------------------------------------------------------------

route('GET', '/api/assets', (req, res) => {
  const root = getRoot();
  sendJson(res, 200, {
    ok: true,
    root,
    assetsDir: assetsRoot(root),
    exists: existsSync(libraryPath(root)),
    projectsWithApproved: listApprovedProjects(root),
    library: publicLibrary(root),
  });
});

// ---------------------------------------------------------------------------
// GET /api/asset/file?slug=&name=
// ---------------------------------------------------------------------------

route('GET', '/api/asset/file', (req, res, url) => {
  const root = getRoot();
  const slug = url.searchParams.get('slug');
  const name = url.searchParams.get('name');
  // valida slug + nome e reconfere que o resultado está dentro de assets/
  const abs = safeAssetFilePath(root, slug, name);
  if (!existsSync(abs) || !statSync(abs).isFile()) throw new Error(`arquivo não encontrado: ${slug}/${name}`);
  sendAssetBytes(res, abs);
});

// ---------------------------------------------------------------------------
// GET /api/asset/thumb?slug=&name=&w=&v=   — miniatura JPEG de uma imagem
// ---------------------------------------------------------------------------

route('GET', '/api/asset/thumb', async (req, res, url) => {
  const root = getRoot();
  const slug = url.searchParams.get('slug');
  const name = url.searchParams.get('name');
  const abs = safeAssetFilePath(root, slug, name);
  if (!IMAGE_EXT_RE.test(abs)) throw new Error(`miniatura só de imagem: ${name}`);
  if (!existsSync(abs) || !statSync(abs).isFile()) {
    sendError(res, 404, `arquivo não encontrado: ${slug}/${name}`);
    return;
  }
  const asked = Number(url.searchParams.get('w')) || THUMB_DEFAULT;
  const width = THUMB_WIDTHS.reduce((best, w) => (Math.abs(w - asked) < Math.abs(best - asked) ? w : best));
  const st = statSync(abs);
  const key = `${abs}|${st.mtimeMs}|${st.size}|${width}`;
  const buf = await assetThumbFor(abs, width, key);
  if (!buf) {
    sendAssetBytes(res, abs);
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Content-Length': buf.length,
    // com `v=` (sha do arquivo) a URL muda quando a imagem muda: pode cachear longo
    'Cache-Control': url.searchParams.get('v') ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
    'X-Thumb': assetThumbState,
  });
  res.end(buf);
});

// ---------------------------------------------------------------------------
// POST /api/asset  (JSON)  — cria/atualiza a entrada, sem bytes
// ---------------------------------------------------------------------------

route('POST', '/api/asset', async (req, res) => {
  const root = getRoot();
  const body = await readJsonBody(req);
  const { asset, created } = upsertAsset(root, {
    slug: body.slug,
    kind: body.kind,
    name: body.name,
    tags: body.tags,
    origem: body.origem,
    folder: body.folder,
    voiceLang: body.voiceLang,
    voiceNotes: body.voiceNotes,
  });
  sendJson(res, 200, { ok: true, created, asset: publicAsset(asset) });
});

// ---------------------------------------------------------------------------
// POST /api/asset/file?slug=&name=&role=&kind=&tags=&origem=  (corpo = bytes)
// ---------------------------------------------------------------------------

route('POST', '/api/asset/file', async (req, res, url) => {
  const root = getRoot();
  const q = url.searchParams;
  const bytes = await readBinaryBody(req);
  const { asset, file } = addAssetFile(root, {
    slug: q.get('slug'),
    name: q.get('name'),
    role: q.get('role') ?? undefined,
    kind: q.get('kind') ?? undefined,
    assetName: q.get('assetName') ?? undefined,
    tags: q.get('tags') ?? undefined,
    origem: q.get('origem') ?? undefined,
    folder: q.get('folder') ?? undefined,
    voiceLang: q.get('voiceLang') ?? undefined,
    voiceNotes: q.get('voiceNotes') ?? undefined,
    bytes,
  });
  sendJson(res, 200, {
    ok: true,
    file: { ...file, url: fileUrl(asset.slug, file.name) },
    asset: publicAsset(asset),
  });
});

// ---------------------------------------------------------------------------
// POST /api/asset/folder e /api/asset/move — organização virtual da biblioteca
// ---------------------------------------------------------------------------

route('POST', '/api/asset/folder', async (req, res) => {
  const root = getRoot();
  const body = await readJsonBody(req);
  const folder = createFolder(root, { name: body.name, id: body.id });
  sendJson(res, 200, { ok: true, folder, library: publicLibrary(root) });
});

route('POST', '/api/asset/move', async (req, res) => {
  const root = getRoot();
  const body = await readJsonBody(req);
  const asset = moveAssetToFolder(root, body.slug, body.folder || null);
  sendJson(res, 200, { ok: true, asset: publicAsset(asset), library: publicLibrary(root) });
});

// ---------------------------------------------------------------------------
// GET /api/recurring?dir=<projeto>
// ---------------------------------------------------------------------------

route('GET', '/api/recurring', (req, res, url) => {
  const root = getRoot();
  const dir = url.searchParams.get('dir');
  const abs = safeProjectDir(dir);
  const minChunks = Number(url.searchParams.get('min') ?? 2) || 2;

  const found = recurringCandidates(abs, { minChunks });
  const library = readLibrary(root);
  const state = readApproved(root, dir);
  const byCandidate = new Map();
  for (const e of state.approved) byCandidate.set(e.candidate, e);
  for (const e of state.rejected) byCandidate.set(e.candidate, e);

  const candidates = found.candidates.map((c) => {
    const decided = byCandidate.get(c.key) ?? null;
    return {
      key: c.key,
      term: c.term,
      slug: c.slug || slugify(c.term),
      kind: c.kind,
      chunks: c.chunks,
      chunkCount: c.chunks.length,
      continuity: c.continuity,
      score: c.score,
      tags: c.tags,
      sections: c.sections,
      evidence: c.evidence,
      // sugestão, NUNCA anexo: quem anexa é POST /api/approved
      match: matchCandidate(library, c),
      decision: decided ? decided.decision : null,
      decidedSlug: decided ? decided.slug ?? null : null,
      decidedAt: decided ? decided.decidedAt : null,
    };
  });

  sendJson(res, 200, {
    ok: true,
    project: dir,
    chunkCount: found.chunkCount,
    chunks: found.chunks,
    minChunks: found.minChunks,
    libraryCount: library.assets.length,
    approvedCount: state.approved.length,
    candidates,
  });
});

// ---------------------------------------------------------------------------
// GET /api/approved?dir=<projeto>
// ---------------------------------------------------------------------------

route('GET', '/api/approved', (req, res, url) => {
  const root = getRoot();
  const dir = url.searchParams.get('dir');
  safeProjectDir(dir);
  const state = readApproved(root, dir);
  sendJson(res, 200, {
    ok: true,
    path: relFromRoot(root, approvedPath(root, dir)),
    absolutePath: approvedPath(root, dir),
    exists: existsSync(approvedPath(root, dir)),
    state,
  });
});

// ---------------------------------------------------------------------------
// POST /api/approved  (JSON) — a ÚNICA porta do estado aprovado
// ---------------------------------------------------------------------------

route('POST', '/api/approved', async (req, res) => {
  const root = getRoot();
  const body = await readJsonBody(req);
  const dir = body.dir;
  safeProjectDir(dir);
  if (!DECISIONS.includes(String(body.decision))) {
    throw new Error(`decisão inválida: ${body.decision} — use ${DECISIONS.join(' | ')}`);
  }
  if (body.decision !== 'nao') safeSlug(body.slug);

  const state = recordDecision(root, dir, {
    candidate: body.candidate,
    term: body.term,
    decision: body.decision,
    slug: body.slug,
    matchedOn: body.matchedOn,
  });

  sendJson(res, 200, {
    ok: true,
    path: relFromRoot(root, approvedPath(root, dir)),
    absolutePath: approvedPath(root, dir),
    state,
  });
});

// ---------------------------------------------------------------------------
// POST /api/approved/clear  (JSON) — volta um candidato a "pendente"
// ---------------------------------------------------------------------------

route('POST', '/api/approved/clear', async (req, res) => {
  const root = getRoot();
  const body = await readJsonBody(req);
  safeProjectDir(body.dir);
  const state = clearDecision(root, body.dir, body.candidate);
  sendJson(res, 200, {
    ok: true,
    path: relFromRoot(root, approvedPath(root, body.dir)),
    absolutePath: approvedPath(root, body.dir),
    state,
  });
});
