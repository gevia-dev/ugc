#!/usr/bin/env node
/**
 * refs.mjs — galeria das imagens de referência de UM projeto, para a aba
 * "Imagens" da gaveta (`common.js`) e o contador do card da home.
 *
 * Zero dependência: só `node:` builtins. Node 22+. SÓ LEITURA: nada aqui grava.
 *
 * Fonte das imagens: `seedance-<slug>/references/`, recursivo até 2 níveis de
 * pasta (`references/a/b/arquivo.png`). Formatos: .png .jpg .jpeg .webp.
 *
 *   ref     imagem de referência "de verdade"
 *   guide   frame da fonte, só guia — pasta `_from_source/` (ou `src/`, `source/`)
 *   draft   rascunho/candidato — nome começando com `_` ou dentro de pasta `_…`
 *           (`_cand_v5/`, `_drafts/`, `_upload/`, `_rejected/`…)
 *
 * A pasta `vo/` (áudio) nem é visitada; arquivos que não são imagem são ignorados.
 *
 * Refs ESPERADAS: lidas do `REFS.md` do projeto — os nomes de imagem citados
 *   - em títulos `### ref9_x.png — **CRIAR** …` / `**EDITAR** …` (em qualquer seção);
 *   - em títulos e na 1ª coluna de tabelas dentro de uma seção `## … A CRIAR / A EDITAR`;
 *   - na 1ª coluna de qualquer tabela que tenha uma coluna "status".
 * Caminhos que apontam para fora do projeto (`assets/…`, `seedance-outro/…`) não contam.
 * Uma esperada está "gerada" quando existe uma ref com o mesmo nome-base (qualquer
 * extensão) ou uma variante dele (`ref9_x_v2.png`).
 *
 *   listRefImages(seedanceAbs)            -> [{ path, name, group, kind, guide, draft, bytes, mtimeMs, abs }]
 *   parseExpectedRefs(markdown, dirName?) -> [{ name, stem, path, action, optional, note, detail, line, declared }]
 *   buildRefsReport(seedanceAbs, opts)    -> payload do GET /api/refs (sem as URLs)
 *   refsSummary(seedanceAbs)              -> contadores para a home
 *   resolveRefImage(seedanceAbs, rel)     -> item da listagem, ou null (lança em caminho inválido)
 *   imageSize(abs)                        -> { width, height } | null   (só o cabeçalho do arquivo)
 *
 * CLI: node refs.mjs <pasta-seedance-…> [raiz]
 */

import { closeSync, openSync, readFileSync, readSync, readdirSync, statSync } from 'node:fs';
import { isAbsolute, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REFS_DIRNAME = 'references';
export const REFS_DOC = 'REFS.md';
export const REF_IMAGE_RE = /\.(png|jpe?g|webp)$/i;
/** Quantos níveis de subpasta abaixo de `references/` entram na listagem. */
export const REF_MAX_DEPTH = 2;

const SKIP_DIRS = new Set(['vo']);
const GUIDE_DIR_RE = /^_?(from_)?(source|src)$/i;
const LIST_TTL_MS = 1500;
const SIZE_CACHE_MAX = 3000;
const NOTE_MAX = 160;
const DETAIL_MAX = 320;

const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });

// ---------------------------------------------------------------------------
// fs tolerante — o Codex escreve nessas pastas enquanto a página lê
// ---------------------------------------------------------------------------

function safeStat(p) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}

function safeReaddir(p, opts) {
  try {
    return readdirSync(p, opts);
  } catch {
    return [];
  }
}

function isDir(p) {
  const s = safeStat(p);
  return Boolean(s && s.isDirectory());
}

function findFileCI(dir, name) {
  const lower = String(name).toLowerCase();
  return safeReaddir(dir).find((n) => n.toLowerCase() === lower) ?? null;
}

function stemOf(name) {
  return String(name).replace(/\.[^./]+$/, '').toLowerCase();
}

// ---------------------------------------------------------------------------
// listagem
// ---------------------------------------------------------------------------

const listCache = new Map(); // seedanceAbs -> { at, items }

function groupRank(group) {
  if (!group) return 0;
  return group.split('/').some((p) => p.startsWith('_')) ? 2 : 1;
}

/** Todas as imagens de `references/` (até 2 níveis de pasta), em ordem natural. */
export function listRefImages(seedanceAbs, { fresh = false } = {}) {
  const hit = listCache.get(seedanceAbs);
  if (!fresh && hit && Date.now() - hit.at < LIST_TTL_MS) return hit.items;

  const base = join(seedanceAbs, REFS_DIRNAME);
  const items = [];
  const walk = (absDir, relParts, depth) => {
    for (const e of safeReaddir(absDir, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      const abs = join(absDir, e.name);
      if (e.isDirectory() || (e.isSymbolicLink() && isDir(abs))) {
        if (depth < REF_MAX_DEPTH && !SKIP_DIRS.has(e.name.toLowerCase())) walk(abs, [...relParts, e.name], depth + 1);
        continue;
      }
      if (!REF_IMAGE_RE.test(e.name)) continue;
      const st = safeStat(abs);
      if (!st || !st.isFile()) continue;
      const guide = relParts.some((p) => GUIDE_DIR_RE.test(p));
      const draft = !guide && (e.name.startsWith('_') || relParts.some((p) => p.startsWith('_')));
      items.push({
        path: [...relParts, e.name].join('/'),
        name: e.name,
        group: relParts.join('/'),
        kind: guide ? 'guide' : draft ? 'draft' : 'ref',
        guide,
        draft,
        bytes: st.size,
        mtimeMs: Math.round(st.mtimeMs),
        abs,
      });
    }
  };
  if (isDir(base)) walk(base, [], 0);
  items.sort((a, b) => groupRank(a.group) - groupRank(b.group)
    || collator.compare(a.group, b.group)
    || collator.compare(a.name, b.name));
  listCache.set(seedanceAbs, { at: Date.now(), items });
  return items;
}

/**
 * Valida `rel` (caminho relativo a `references/`, com `/`) e devolve o item da
 * listagem. Lança em caminho inválido (traversal, absoluto, fundo demais, não
 * imagem); devolve null se o caminho é válido mas a imagem não existe.
 * Só servimos o que a própria listagem conhece — nada vem cru da query string.
 */
export function resolveRefImage(seedanceAbs, rel) {
  const raw = String(rel ?? '').trim();
  if (!raw) throw new Error('parâmetro `path` é obrigatório');
  if (raw.includes('\\') || raw.includes('\0') || raw.startsWith('/') || isAbsolute(raw) || /^[a-z]:/i.test(raw)) {
    throw new Error(`caminho inválido: ${raw}`);
  }
  const parts = raw.split('/');
  if (parts.some((p) => !p || p === '.' || p === '..')) throw new Error(`caminho inválido: ${raw}`);
  if (parts.length > REF_MAX_DEPTH + 1) throw new Error(`caminho fundo demais: ${raw}`);
  if (!REF_IMAGE_RE.test(raw)) throw new Error('só imagens .png, .jpg, .jpeg ou .webp');
  const base = resolve(seedanceAbs, REFS_DIRNAME);
  const abs = resolve(base, ...parts);
  if (!abs.startsWith(base + sep)) throw new Error(`caminho inválido: ${raw}`);
  return listRefImages(seedanceAbs).find((i) => i.path === raw) ?? null;
}

// ---------------------------------------------------------------------------
// largura × altura pelo cabeçalho (PNG, JPEG, WebP) — sem decodificar a imagem
// ---------------------------------------------------------------------------

export function parseImageSize(b) {
  if (!b || b.length < 12) return null;
  // PNG: assinatura + IHDR
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47 && b.toString('ascii', 12, 16) === 'IHDR') {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }
  // WebP: RIFF....WEBP + VP8 / VP8L / VP8X
  if (b.length >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    return null;
  }
  // JPEG: anda pelos marcadores até o SOFn
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i += 1; continue; }
      const marker = b[i + 1];
      if (marker === 0xff) { i += 1; continue; }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
      }
      if (len < 2) return null;
      i += 2 + len;
    }
  }
  return null;
}

function readHead(abs, bytes) {
  let fd;
  try {
    fd = openSync(abs, 'r');
    const buf = Buffer.alloc(bytes);
    const n = readSync(fd, buf, 0, bytes, 0);
    return buf.subarray(0, n);
  } catch {
    return null;
  } finally {
    if (fd !== undefined) {
      try { closeSync(fd); } catch { /* nada */ }
    }
  }
}

const sizeCache = new Map(); // abs|mtime|bytes -> {width,height}|null

/** { width, height } lido do cabeçalho (64 KB; JPEG com EXIF grande: até 512 KB), ou null. */
export function imageSize(abs, mtimeMs = 0, bytes = 0) {
  const key = `${abs}|${mtimeMs}|${bytes}`;
  if (sizeCache.has(key)) return sizeCache.get(key);
  let dims = parseImageSize(readHead(abs, 65536));
  if (!dims && /\.jpe?g$/i.test(abs)) dims = parseImageSize(readHead(abs, 524288));
  if (dims && !(dims.width > 0 && dims.height > 0)) dims = null;
  sizeCache.set(key, dims);
  if (sizeCache.size > SIZE_CACHE_MAX) sizeCache.delete(sizeCache.keys().next().value);
  return dims;
}

// ---------------------------------------------------------------------------
// REFS.md -> refs esperadas
// ---------------------------------------------------------------------------

const HEADING_RE = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const FENCE_RE = /^\s*(```+|~~~+)/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const FILE_TOKEN_RE = /(?:[\p{L}\p{N}_.-]+\/)*[\p{L}\p{N}_.-]+\.(?:png|jpe?g|webp)(?![\p{L}\p{N}_])/giu;
/** Título de seção que pede imagens novas: "A CRIAR", "A EDITAR", "A GERAR", "CRIAR / EDITAR". */
const CREATE_SECTION_RE = /\bA\s+(CRIAR|EDITAR|GERAR)\b|\b(CRIAR|EDITAR)\b/i;
const HEADING_ACTION_RE = /\b(CRIAR|EDITAR)\b/;
const EDIT_RE = /\bEDIT(AR|ADA|ADO)\b/i;
const OPTIONAL_RE = /\bopcional\b/i;

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  return s.split(/(?<!\\)\|/).map((c) => c.trim());
}

/** Nota curta do placeholder: sem "opcional" (já vira tag) e sem o parêntese que embrulha tudo. */
function tidyNote(text) {
  let s = String(text ?? '').trim()
    .replace(/^\(?\s*opcional\s*\)?[\s,·—–:-]*/i, '')
    .trim();
  if (/^\([^()]*\)$/.test(s)) s = s.slice(1, -1).trim();
  return s;
}

function plain(text, max) {
  const s = String(text ?? '')
    .replace(/\*\*|__|`/g, '')
    .replace(/(^|\s)\*([^*]+)\*(?=\s|$|[.,;:)])/g, '$1$2')
    .replace(/\s+/g, ' ')
    .replace(/^[\s—–:·-]+|[\s—–:·-]+$/g, '')
    .trim();
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

/**
 * Escolhe, entre os nomes de imagem de um trecho, o da ref deste projeto:
 * nome solto, `references/…` ou `<dirName>/references/…`. Devolve { name, path, token }.
 */
function pickTarget(text, dirName) {
  for (const m of String(text).matchAll(FILE_TOKEN_RE)) {
    const token = m[0];
    const parts = token.split('/');
    let rel = null;
    if (parts.length === 1) rel = token;
    else if (parts[0].toLowerCase() === REFS_DIRNAME) rel = parts.slice(1).join('/');
    else if (dirName && parts[0] === dirName && parts[1]?.toLowerCase() === REFS_DIRNAME) rel = parts.slice(2).join('/');
    if (rel) return { name: parts[parts.length - 1], path: rel, token };
  }
  return null;
}

/** Primeira linha de texto corrido depois do índice `from` (pula linhas em branco). */
function firstParagraph(lines, from) {
  for (let i = from; i < lines.length && i < from + 6; i += 1) {
    const l = lines[i];
    if (!l.trim()) continue;
    if (HEADING_RE.test(l) || l.trim().startsWith('|') || FENCE_RE.test(l)) return '';
    return l;
  }
  return '';
}

/**
 * Nomes de imagem que o REFS.md manda criar/editar, na ordem do arquivo, sem repetir.
 * @param {string} markdown
 * @param {string} [dirName]  pasta do projeto (aceita `<dirName>/references/x.png`)
 */
export function parseExpectedRefs(markdown, dirName) {
  const lines = String(markdown ?? '').replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  const seen = new Set();
  let inCreate = false;
  let section = '';
  let inFence = null;
  let table = null; // { statusCol }

  const add = (target, extra) => {
    const stem = stemOf(target.name);
    if (!stem || seen.has(stem)) return;
    seen.add(stem);
    out.push({ name: target.name, stem, path: target.path, section, ...extra });
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const fence = FENCE_RE.exec(line);
    if (inFence) {
      if (fence && line.trim().startsWith(inFence)) inFence = null;
      continue;
    }
    if (fence) {
      inFence = fence[1];
      continue;
    }

    // tabelas
    if (line.trim().startsWith('|')) {
      if (!table && TABLE_SEP_RE.test(lines[i + 1] ?? '')) {
        const head = splitRow(line);
        table = { statusCol: head.findIndex((c) => /status|situa[cç][aã]o/i.test(c)) };
        i += 1; // pula a linha separadora
        continue;
      }
      if (table && (inCreate || table.statusCol >= 0)) {
        const cells = splitRow(line);
        const target = pickTarget(cells[0] ?? '', dirName);
        if (target) {
          const lead = `${cells[0]} ${(cells[1] ?? '').slice(0, 80)}`;
          add(target, {
            action: EDIT_RE.test(lead) ? 'editar' : 'criar',
            optional: OPTIONAL_RE.test(cells[0]),
            note: tidyNote(plain(String(cells[0]).replace(target.token, ''), NOTE_MAX)),
            detail: plain(cells[1] ?? '', DETAIL_MAX),
            declared: table.statusCol >= 0 ? plain(cells[table.statusCol] ?? '', 60) || null : null,
            line: i + 1,
          });
        }
      }
      continue;
    }
    table = null;

    const h = HEADING_RE.exec(line);
    if (!h) continue;
    const level = h[1].length;
    const text = h[2];
    const target = pickTarget(text, dirName);
    if (level <= 2 && !target) {
      section = plain(text, 120);
      inCreate = level === 2 && CREATE_SECTION_RE.test(text);
      continue;
    }
    if (target && (inCreate || HEADING_ACTION_RE.test(text))) {
      const rest = text.replace(target.token, ' ');
      add(target, {
        action: /\bEDITAR\b/i.test(rest) ? 'editar' : 'criar',
        optional: OPTIONAL_RE.test(text),
        // a tag CRIAR/EDITAR já aparece na tela: a nota fica com o resto
        note: tidyNote(plain(plain(rest.replace(/^\s*\d+(\.\d+)*\s*/, ''), 400).replace(/^(CRIAR|EDITAR)\b[\s,·—–-]*/, ''), NOTE_MAX)),
        detail: plain(firstParagraph(lines, i + 1), DETAIL_MAX),
        declared: null,
        line: i + 1,
      });
    }
  }
  return out;
}

const docCache = new Map(); // file -> { sig, value }

/** { exists, name, updatedAtMs, expected[] } do REFS.md do projeto (em cache até mudar). */
export function readExpectedRefs(seedanceAbs, dirName) {
  const found = findFileCI(seedanceAbs, REFS_DOC);
  const st = found ? safeStat(join(seedanceAbs, found)) : null;
  if (!st || !st.isFile()) return { exists: false, name: REFS_DOC, updatedAtMs: 0, expected: [], error: null };
  const file = join(seedanceAbs, found);
  const sig = `${st.size}|${st.mtimeMs}|${dirName ?? ''}`;
  const hit = docCache.get(file);
  if (hit && hit.sig === sig) return hit.value;
  let value;
  try {
    value = { exists: true, name: found, updatedAtMs: Math.round(st.mtimeMs), expected: parseExpectedRefs(readFileSync(file, 'utf8'), dirName), error: null };
  } catch (err) {
    value = { exists: true, name: found, updatedAtMs: Math.round(st.mtimeMs), expected: [], error: `REFS.md ilegível (${err.message})` };
  }
  docCache.set(file, { sig, value });
  return value;
}

// ---------------------------------------------------------------------------
// relatório: existentes × esperadas
// ---------------------------------------------------------------------------

function isVariantOf(fileStem, expStem) {
  return fileStem.length > expStem.length && fileStem.startsWith(expStem) && /[_\-. ]/.test(fileStem[expStem.length]);
}

/**
 * Casa as imagens com as refs esperadas. Primeiro nome-base idêntico (qualquer
 * extensão), depois variantes (`ref9_x_v2`) entre as que sobraram.
 */
function matchExpected(items, expected) {
  const refs = items.filter((i) => i.kind === 'ref');
  const drafts = items.filter((i) => i.kind === 'draft');
  const claimed = new Map(); // path -> { expected, match }
  const byStem = new Map(expected.map((e) => [e.stem, []]));
  for (const r of refs) {
    const s = stemOf(r.name);
    if (byStem.has(s)) {
      byStem.get(s).push(r);
      claimed.set(r.path, { expected: expected.find((e) => e.stem === s).name, match: 'exact' });
    }
  }
  const result = expected.map((e) => {
    let files = byStem.get(e.stem);
    let match = files.length ? 'exact' : null;
    if (!files.length) {
      files = refs.filter((r) => !claimed.has(r.path) && isVariantOf(stemOf(r.name), e.stem));
      if (files.length) match = 'variant';
      for (const f of files) claimed.set(f.path, { expected: e.name, match: 'variant' });
    }
    const candidates = drafts.filter((d) => {
      const s = stemOf(d.name).replace(/^_+/, '');
      return s === e.stem || isVariantOf(s, e.stem);
    });
    return {
      ...e,
      status: files.length ? 'generated' : 'missing',
      match,
      files: files.map((f) => f.path),
      candidates: candidates.map((c) => c.path),
    };
  });
  return { expected: result, claimed };
}

/**
 * Tudo que a aba "Imagens" precisa, sem URLs (quem monta as URLs é a rota).
 * @param {string} seedanceAbs
 * @param {{dirName?:string, sizes?:boolean}} [opts]
 */
export function buildRefsReport(seedanceAbs, { dirName, sizes = false } = {}) {
  const items = listRefImages(seedanceAbs, { fresh: true });
  const doc = readExpectedRefs(seedanceAbs, dirName);
  const { expected, claimed } = matchExpected(items, doc.expected);

  const outItems = items.map((i) => {
    const c = claimed.get(i.path);
    const dims = sizes ? imageSize(i.abs, i.mtimeMs, i.bytes) : null;
    return {
      path: i.path,
      name: i.name,
      group: i.group,
      kind: i.kind,
      guide: i.guide,
      draft: i.draft,
      bytes: i.bytes,
      mtimeMs: i.mtimeMs,
      mtime: new Date(i.mtimeMs).toISOString(),
      ...(dims ? { width: dims.width, height: dims.height } : {}),
      expected: c ? c.expected : null,
      match: c ? c.match : null,
    };
  });

  // atividade = refs e rascunhos novos; guia da fonte não conta (sai do teardown, não da geração)
  const latestMs = items.reduce((m, i) => (i.kind === 'guide' ? m : Math.max(m, i.mtimeMs)), 0);
  const count = (k) => items.filter((i) => i.kind === k).length;
  return {
    exists: isDir(join(seedanceAbs, REFS_DIRNAME)),
    folder: REFS_DIRNAME,
    refsDoc: {
      exists: doc.exists,
      name: doc.name,
      updatedAt: doc.updatedAtMs ? new Date(doc.updatedAtMs).toISOString() : null,
      error: doc.error,
    },
    items: outItems,
    expected,
    counts: {
      images: items.length,
      refs: count('ref'),
      guides: count('guide'),
      drafts: count('draft'),
      expected: expected.length,
      generated: expected.filter((e) => e.status === 'generated').length,
      missing: expected.filter((e) => e.status === 'missing').length,
      optional: expected.filter((e) => e.optional).length,
      optionalMissing: expected.filter((e) => e.optional && e.status === 'missing').length,
    },
    latestAt: latestMs ? new Date(latestMs).toISOString() : null,
    latestMs,
  };
}

/** Contadores para o card da home (sem ler cabeçalho de imagem nenhuma). */
export function refsSummary(seedanceAbs, dirName) {
  const empty = { images: 0, guides: 0, drafts: 0, expected: 0, generated: 0, missing: 0, optionalMissing: 0, missingNames: [], latestAt: null, latestMs: 0 };
  if (!seedanceAbs) return empty;
  const r = buildRefsReport(seedanceAbs, { dirName, sizes: false });
  return {
    images: r.counts.refs,
    guides: r.counts.guides,
    drafts: r.counts.drafts,
    expected: r.counts.expected,
    generated: r.counts.generated,
    missing: r.counts.missing,
    optionalMissing: r.counts.optionalMissing,
    missingNames: r.expected.filter((e) => e.status === 'missing').map((e) => e.name).slice(0, 8),
    latestAt: r.latestAt,
    latestMs: r.latestMs,
  };
}

// ---------------------------------------------------------------------------
// CLI: node refs.mjs <pasta-seedance-…> [raiz]
// ---------------------------------------------------------------------------

function main(argv) {
  const dir = argv[0];
  if (!dir) {
    console.error('uso: node refs.mjs <pasta-seedance-…> [raiz]');
    process.exitCode = 1;
    return;
  }
  const root = resolve(argv[1] ?? resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..'));
  const abs = join(root, dir);
  if (!isDir(abs)) {
    console.error(`pasta não existe: ${abs}`);
    process.exitCode = 1;
    return;
  }
  const r = buildRefsReport(abs, { dirName: dir, sizes: true });
  const c = r.counts;
  console.log(`${dir}/${REFS_DIRNAME}  ${r.exists ? '' : '(não existe)'}`);
  console.log(`  ${c.refs} refs · ${c.guides} guias · ${c.drafts} rascunhos · REFS.md ${r.refsDoc.exists ? 'sim' : 'não'}`);
  if (c.expected) console.log(`  esperadas: ${c.generated}/${c.expected} geradas${c.optional ? ` (${c.optional} opcional)` : ''}`);
  for (const e of r.expected) {
    const mark = e.status === 'generated' ? '#' : '.';
    console.log(`  ${mark} ${e.action.padEnd(6)} ${e.optional ? '(opc) ' : ''}${e.name}${e.files.length ? `  -> ${e.files.join(', ')}` : ''}${e.candidates.length ? `  [${e.candidates.length} cand.]` : ''}`);
  }
  for (const i of r.items) {
    const dims = i.width ? `${i.width}x${i.height}` : '?';
    console.log(`    ${i.kind.padEnd(5)} ${dims.padEnd(10)} ${String(Math.round(i.bytes / 1024)).padStart(6)} KB  ${i.path}${i.expected ? `  = ${i.expected}` : ''}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2));
}
