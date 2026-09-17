#!/usr/bin/env node
/**
 * assets.mjs — biblioteca de assets reutilizáveis entre vídeos.
 *
 * Zero dependência: só `node:` builtins. Node 22+.
 *
 * A biblioteca vive em `<raiz>/assets/` e SOBREVIVE ao projeto:
 *
 *   assets/
 *     assets.json                 índice da biblioteca (schema abaixo)
 *     <slug>/                     arquivos daquele asset (imagens + voz)
 *     approved/<projeto>.json     estado aprovado, POR PROJETO
 *
 * Schema de um asset (`assets.json` -> `assets[]`):
 *
 *   {
 *     "slug":      "pizzaiolo-osmo",              // id estável, [a-z0-9-]
 *     "kind":      "pessoa",                      // pessoa | objeto | local | prop
 *     "name":      "Pizzaiolo de bandana",        // rótulo humano
 *     "tags":      ["pizzaiolo", "bandana preta"],// termos de casamento, normalizados
 *     "files":     [ { name, path, role, bytes, sha256, addedAt } ],
 *     "voice":     { name, path, bytes, sha256, lang, notes, addedAt } | null,
 *     "origem":    "upload manual · seedance-pizza-osmo",
 *     "createdAt": "2026-09-17T12:00:00.000Z",
 *     "updatedAt": "2026-09-17T12:00:00.000Z"
 *   }
 *
 * `files[]` é o inventário completo (role `image` e role `voice`);
 * `voice` é o ponteiro para a referência de voz — é o que faz um asset
 * `kind: pessoa` carregar rosto E voz no mesmo registro, casando com o
 * video-method, que anexa `image_references` E `audio_references`.
 *
 * REGRAS DE PRODUTO que este módulo protege (não são detalhe de implementação):
 *  1. Biblioteca é CURADA À MÃO: só entra arquivo por upload explícito.
 *     Nada aqui varre `references/refN_*.png` de projeto para dentro da biblioteca.
 *  2. NUNCA há reuso silencioso: `recordDecision()` é a ÚNICA porta para o
 *     estado aprovado, e ela exige uma decisão vinda da tela.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeTerm, slugify, stripArticles } from './recurring.mjs';

// ---------------------------------------------------------------------------
// constantes e validação de caminho
// ---------------------------------------------------------------------------

export const ASSETS_DIRNAME = 'assets';
export const KINDS = ['pessoa', 'objeto', 'local', 'prop'];
export const ROLES = ['image', 'voice'];
export const LIBRARY_VERSION = 1;

/** Slug: minúsculas, dígitos e hífen. Sem separador, sem `..`, sem acento. */
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;
/** Nome de arquivo: sem separador, sem `..`, extensão de mídia conhecida. */
const FILE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.(png|jpe?g|webp|gif|mp3|wav|m4a|ogg|opus|flac)$/i;
/** Nome de projeto (para `approved/<projeto>.json`). Mesmo padrão do server. */
const PROJECT_RE = /^[\w][\w.-]*$/;

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;
const AUDIO_EXT = /\.(mp3|wav|m4a|ogg|opus|flac)$/i;

export function assetsRoot(root) {
  return join(resolve(root), ASSETS_DIRNAME);
}
export function libraryPath(root) {
  return join(assetsRoot(root), 'assets.json');
}
export function approvedDir(root) {
  return join(assetsRoot(root), 'approved');
}
export function approvedPath(root, project) {
  return join(approvedDir(root), `${safeProjectName(project)}.json`);
}

export function safeProjectName(project) {
  const raw = String(project ?? '').trim();
  if (!raw) throw new Error('parâmetro `dir` (projeto) é obrigatório');
  if (!PROJECT_RE.test(raw) || raw.includes('..')) throw new Error(`nome de projeto inválido: ${raw}`);
  return raw;
}

export function safeSlug(slug) {
  const raw = String(slug ?? '').trim().toLowerCase();
  if (!SLUG_RE.test(raw) || raw.includes('..')) throw new Error(`slug inválido: ${slug}`);
  return raw;
}

export function safeFileName(name) {
  const raw = String(name ?? '').trim();
  if (raw.includes('..') || raw.includes('/') || raw.includes('\\')) {
    throw new Error(`nome de arquivo inválido: ${name}`);
  }
  if (!FILE_RE.test(raw)) throw new Error(`nome de arquivo inválido: ${name}`);
  return raw;
}

/**
 * Caminho absoluto de um arquivo de asset, PROVADAMENTE dentro de `assets/`.
 * Entrada vinda do browser é não-confiável: slug e nome passam pela validação
 * acima e ainda assim o resultado é reconferido contra a raiz da biblioteca.
 */
export function safeAssetFilePath(root, slug, name) {
  const base = resolve(assetsRoot(root));
  const abs = resolve(base, safeSlug(slug), safeFileName(name));
  const expected = join(base, safeSlug(slug), safeFileName(name));
  if (abs !== expected || !abs.startsWith(base + sep)) {
    throw new Error(`caminho de asset fora de ${ASSETS_DIRNAME}/: ${slug}/${name}`);
  }
  return abs;
}

/** Caminho relativo à raiz do repo, sempre com `/` — é o que vai para o JSON. */
export function relFromRoot(root, abs) {
  return resolve(abs).slice(resolve(root).length + 1).split(sep).join('/');
}

// ---------------------------------------------------------------------------
// leitura / escrita atômica
// ---------------------------------------------------------------------------

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeJsonAtomic(file, data) {
  ensureDir(join(file, '..'));
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  renameSync(tmp, file);
  return file;
}

function nowIso() {
  return new Date().toISOString();
}

export function emptyLibrary() {
  return { version: LIBRARY_VERSION, updatedAt: nowIso(), assets: [] };
}

/** Lê `assets/assets.json`. Biblioteca inexistente = biblioteca vazia. */
export function readLibrary(root) {
  const file = libraryPath(root);
  if (!existsSync(file)) return emptyLibrary();
  let data;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`assets.json ilegível (${err.message})`);
  }
  if (!data || !Array.isArray(data.assets)) throw new Error('assets.json sem a lista `assets`');
  data.version ??= LIBRARY_VERSION;
  return data;
}

export function writeLibrary(root, library) {
  library.version = LIBRARY_VERSION;
  library.updatedAt = nowIso();
  library.assets.sort((a, b) => a.slug.localeCompare(b.slug));
  return writeJsonAtomic(libraryPath(root), library);
}

export function findAsset(library, slug) {
  const want = String(slug ?? '').toLowerCase();
  return library.assets.find((a) => a.slug === want) ?? null;
}

// ---------------------------------------------------------------------------
// tags
// ---------------------------------------------------------------------------

/** Normaliza uma lista de tags: sem acento, sem artigo, sem duplicata, sem vazio. */
export function normalizeTags(tags) {
  const list = Array.isArray(tags)
    ? tags
    : String(tags ?? '')
        .split(/[,;\n]/u)
        .map((t) => t.trim());
  const out = [];
  for (const raw of list) {
    const norm = stripArticles(normalizeTerm(raw));
    if (norm.length >= 2 && !out.includes(norm)) out.push(norm);
  }
  return out.slice(0, 40);
}

// ---------------------------------------------------------------------------
// upsert de asset
// ---------------------------------------------------------------------------

/**
 * Cria ou atualiza a ENTRADA de um asset (metadados). Não move nenhum arquivo.
 *
 * @param {string} root
 * @param {{slug:string, kind?:string, name?:string, tags?:string[]|string,
 *          origem?:string, voiceNotes?:string, voiceLang?:string}} patch
 */
export function upsertAsset(root, patch) {
  const slug = safeSlug(patch.slug);
  const library = readLibrary(root);
  let asset = findAsset(library, slug);
  const created = !asset;

  if (!asset) {
    const kind = String(patch.kind ?? '').trim();
    if (!KINDS.includes(kind)) {
      throw new Error(`kind inválido: ${patch.kind ?? '(vazio)'} — use ${KINDS.join(' | ')}`);
    }
    asset = {
      slug,
      kind,
      name: String(patch.name ?? '').trim() || slug,
      tags: [],
      files: [],
      voice: null,
      origem: String(patch.origem ?? '').trim() || 'upload manual',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    library.assets.push(asset);
  } else {
    if (patch.kind != null && String(patch.kind).trim()) {
      const kind = String(patch.kind).trim();
      if (!KINDS.includes(kind)) throw new Error(`kind inválido: ${patch.kind}`);
      asset.kind = kind;
    }
    if (patch.name != null && String(patch.name).trim()) asset.name = String(patch.name).trim();
    if (patch.origem != null && String(patch.origem).trim()) asset.origem = String(patch.origem).trim();
  }

  if (patch.tags != null) {
    const incoming = normalizeTags(patch.tags);
    asset.tags = [...new Set([...(asset.tags ?? []), ...incoming])].slice(0, 40);
  }
  // a tag do próprio slug sempre existe — é o que faz o casamento por slug pegar
  const slugTag = slug.split('-').join(' ');
  if (!asset.tags.includes(slugTag)) asset.tags.push(slugTag);

  if (asset.voice && (patch.voiceNotes != null || patch.voiceLang != null)) {
    if (patch.voiceNotes != null) asset.voice.notes = String(patch.voiceNotes);
    if (patch.voiceLang != null) asset.voice.lang = String(patch.voiceLang);
  }

  asset.updatedAt = nowIso();
  writeLibrary(root, library);
  return { asset, created };
}

/**
 * Grava UM arquivo enviado pela página dentro de `assets/<slug>/` e atualiza a
 * entrada. É a única porta de entrada de bytes na biblioteca.
 *
 * @param {string} root
 * @param {{slug:string, name:string, bytes:Buffer, role?:string, kind?:string,
 *          tags?:string[]|string, origem?:string, name_?:string}} input
 */
export function addAssetFile(root, input) {
  const slug = safeSlug(input.slug);
  const fileName = safeFileName(input.name);
  const bytes = input.bytes;
  if (!Buffer.isBuffer(bytes) || bytes.length === 0) throw new Error('upload vazio');

  let role = String(input.role ?? '').trim();
  if (!role) role = AUDIO_EXT.test(fileName) ? 'voice' : 'image';
  if (!ROLES.includes(role)) throw new Error(`role inválido: ${role} — use ${ROLES.join(' | ')}`);
  if (role === 'voice' && !AUDIO_EXT.test(fileName)) throw new Error(`voz precisa ser áudio: ${fileName}`);
  if (role === 'image' && !IMAGE_EXT.test(fileName)) throw new Error(`imagem precisa ser imagem: ${fileName}`);

  // garante a entrada antes de escrever bytes (valida kind/tags primeiro)
  upsertAsset(root, {
    slug,
    kind: input.kind,
    name: input.assetName,
    tags: input.tags,
    origem: input.origem,
  });

  const abs = safeAssetFilePath(root, slug, fileName);
  ensureDir(join(abs, '..'));
  writeFileSync(abs, bytes);

  const entry = {
    name: fileName,
    path: relFromRoot(root, abs),
    role,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    addedAt: nowIso(),
  };

  const library = readLibrary(root);
  const asset = findAsset(library, slug);
  if (!asset) throw new Error(`asset sumiu durante o upload: ${slug}`);
  asset.files = (asset.files ?? []).filter((f) => f.name !== fileName);
  asset.files.push(entry);
  asset.files.sort((a, b) => a.name.localeCompare(b.name));

  if (role === 'voice') {
    asset.voice = {
      name: entry.name,
      path: entry.path,
      bytes: entry.bytes,
      sha256: entry.sha256,
      lang: String(input.voiceLang ?? 'pt-BR'),
      notes: String(input.voiceNotes ?? ''),
      addedAt: entry.addedAt,
    };
  }

  asset.updatedAt = nowIso();
  writeLibrary(root, library);
  return { asset, file: entry };
}

// ---------------------------------------------------------------------------
// casamento candidato <-> biblioteca
// ---------------------------------------------------------------------------

/**
 * Procura na biblioteca um asset que bata com o candidato — por SLUG ou por TAG.
 * Devolve `null` quando não há nada. Nunca anexa nada: é sugestão.
 */
export function matchCandidate(library, candidate) {
  const candSlug = candidate.slug || slugify(candidate.term);
  const candNorm = candidate.norm || stripArticles(normalizeTerm(candidate.term));
  const candTags = new Set([candNorm, ...(candidate.tags ?? [])].filter(Boolean));

  let best = null;
  for (const asset of library.assets) {
    const tags = new Set(asset.tags ?? []);
    let score = 0;
    let on = null;
    let why = '';

    if (asset.slug === candSlug) {
      score = 100;
      on = 'slug';
      why = `slug idêntico (${asset.slug})`;
    } else if (asset.slug.startsWith(`${candSlug}-`) || candSlug.startsWith(`${asset.slug}-`)) {
      score = 80;
      on = 'slug';
      why = `slug compatível (${asset.slug} ~ ${candSlug})`;
    } else if (tags.has(candNorm)) {
      score = 70;
      on = 'tag';
      why = `tag "${candNorm}" do asset ${asset.slug}`;
    } else {
      const shared = [...candTags].filter((t) => tags.has(t));
      if (shared.length) {
        score = 40 + Math.min(shared.length, 5) * 4;
        on = 'tag';
        why = `tags em comum: ${shared.slice(0, 3).join(', ')}`;
      }
    }

    if (score && (!best || score > best.score)) {
      best = { slug: asset.slug, kind: asset.kind, name: asset.name, score, on, why };
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// estado aprovado — POR PROJETO
// ---------------------------------------------------------------------------

export const DECISIONS = ['sim', 'nao', 'novo'];

export function emptyApproved(project) {
  return {
    version: LIBRARY_VERSION,
    project: safeProjectName(project),
    updatedAt: nowIso(),
    approved: [],
    rejected: [],
  };
}

/** Lê `assets/approved/<projeto>.json`. Inexistente = nada aprovado. */
export function readApproved(root, project) {
  const file = approvedPath(root, project);
  if (!existsSync(file)) return emptyApproved(project);
  const data = JSON.parse(readFileSync(file, 'utf8'));
  data.approved ??= [];
  data.rejected ??= [];
  return data;
}

/**
 * Registra UMA decisão de tela. Esta é a ÚNICA porta para o estado aprovado —
 * nenhum candidato chega em `approved[]` sem passar por aqui, e só chega quando
 * `decision` é `sim` (usar o asset achado) ou `novo` (usar o asset recém-criado).
 * `nao` só registra a recusa.
 *
 * @param {string} root
 * @param {string} project
 * @param {{candidate:string, term?:string, decision:'sim'|'nao'|'novo',
 *          slug?:string, kind?:string, matchedOn?:string, note?:string}} decision
 */
export function recordDecision(root, project, decision) {
  const proj = safeProjectName(project);
  const verdict = String(decision.decision ?? '').trim();
  if (!DECISIONS.includes(verdict)) {
    throw new Error(`decisão inválida: ${decision.decision} — use ${DECISIONS.join(' | ')}`);
  }
  const candidate = String(decision.candidate ?? '').trim();
  if (!candidate) throw new Error('campo `candidate` é obrigatório (a chave do candidato)');

  const state = readApproved(root, proj);
  state.approved = state.approved.filter((e) => e.candidate !== candidate);
  state.rejected = state.rejected.filter((e) => e.candidate !== candidate);

  const record = {
    candidate,
    term: String(decision.term ?? '').trim() || candidate,
    decision: verdict,
    decidedAt: nowIso(),
    decidedVia: 'confirmação na tela',
  };

  if (verdict === 'nao') {
    state.rejected.push({ ...record, slug: decision.slug ? safeSlug(decision.slug) : null });
  } else {
    const slug = safeSlug(decision.slug);
    const library = readLibrary(root);
    const asset = findAsset(library, slug);
    if (!asset) throw new Error(`asset ${slug} não existe na biblioteca — suba os arquivos antes de anexar`);
    state.approved.push({
      ...record,
      slug: asset.slug,
      kind: asset.kind,
      name: asset.name,
      matchedOn: decision.matchedOn ?? (verdict === 'novo' ? 'novo' : 'slug'),
      images: (asset.files ?? []).filter((f) => f.role === 'image').map((f) => f.path),
      voice: asset.voice ? asset.voice.path : null,
    });
  }

  state.project = proj;
  state.updatedAt = nowIso();
  state.approved.sort((a, b) => a.slug.localeCompare(b.slug));
  writeJsonAtomic(approvedPath(root, proj), state);
  return state;
}

/**
 * Apaga a decisão de um candidato (volta a "pendente"). Só remove — nunca anexa.
 * Serve o botão "desfazer"/"reconsiderar" da tela.
 */
export function clearDecision(root, project, candidate) {
  const proj = safeProjectName(project);
  const key = String(candidate ?? '').trim();
  if (!key) throw new Error('campo `candidate` é obrigatório');
  const state = readApproved(root, proj);
  state.approved = state.approved.filter((e) => e.candidate !== key);
  state.rejected = state.rejected.filter((e) => e.candidate !== key);
  state.project = proj;
  state.updatedAt = nowIso();
  writeJsonAtomic(approvedPath(root, proj), state);
  return state;
}

/** Lista os projetos que já têm estado aprovado gravado. */
export function listApprovedProjects(root) {
  const dir = approvedDir(root);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith('.json'))
    .map((n) => n.slice(0, -5))
    .sort();
}

// ---------------------------------------------------------------------------
// CLI: node assets.mjs <raiz> [projeto]
// ---------------------------------------------------------------------------

function main(argv) {
  const root = resolve(argv[0] ?? resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..'));
  const library = readLibrary(root);
  console.log(`biblioteca: ${libraryPath(root)}`);
  console.log(`assets    : ${library.assets.length}`);
  for (const a of library.assets) {
    const imgs = (a.files ?? []).filter((f) => f.role === 'image').length;
    console.log(`  [${a.kind}] ${a.slug} — ${imgs} imagem(ns), voz: ${a.voice ? a.voice.name : '—'}`);
    console.log(`      tags: ${a.tags.join(' · ')}`);
  }
  const project = argv[1];
  if (project) {
    const state = readApproved(root, project);
    console.log(`\naprovados em ${project}: ${state.approved.length} (recusados: ${state.rejected.length})`);
    for (const e of state.approved) console.log(`  ${e.decision.padEnd(5)} ${e.slug} <- ${e.term}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2));
}
