#!/usr/bin/env node
/**
 * assets-api.mjs — rotas da página de ASSETS, penduradas no `server.mjs` da
 * parte 2 pelo ponto de extensão `route()`. O dispatcher não foi tocado.
 *
 * Zero dependência: só `node:` builtins. Node 22+.
 *
 *   GET  /api/assets                          -> biblioteca inteira
 *   GET  /api/asset/file?slug=&name=          -> bytes de um arquivo da biblioteca
 *   POST /api/asset            (JSON)         -> cria/atualiza a ENTRADA de um asset
 *   POST /api/asset/file?slug=&name=…(binário)-> grava o arquivo em assets/<slug>/
 *   GET  /api/recurring?dir=<projeto>         -> candidatos recorrentes + casamento
 *   GET  /api/approved?dir=<projeto>          -> estado aprovado do projeto
 *   POST /api/approved         (JSON)         -> registra UMA decisão de tela
 *
 * Upload sem dependência e sem multipart: o corpo é o arquivo CRU e os metadados
 * vêm na query string. `fetch(url, { method: 'POST', body: file })` no browser.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

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

/** Acrescenta `url` a cada arquivo — a página nunca monta caminho de disco. */
function publicAsset(asset) {
  return {
    ...asset,
    files: (asset.files ?? []).map((f) => ({ ...f, url: fileUrl(asset.slug, f.name) })),
    voice: asset.voice ? { ...asset.voice, url: fileUrl(asset.slug, asset.voice.name) } : null,
    imageCount: (asset.files ?? []).filter((f) => f.role === 'image').length,
    hasVoice: Boolean(asset.voice),
  };
}

function publicLibrary(root) {
  const library = readLibrary(root);
  return {
    version: library.version,
    updatedAt: library.updatedAt,
    path: relFromRoot(root, libraryPath(root)),
    dir: `${ASSETS_DIRNAME}/`,
    kinds: KINDS,
    roles: ROLES,
    folders: library.folders ?? [],
    assets: library.assets.map(publicAsset),
  };
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
