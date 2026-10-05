#!/usr/bin/env node
/**
 * overview.mjs — visão geral dos projetos, para a home (`projects.html`).
 *
 * Zero dependência: só `node:` builtins. Node 22+. SÓ LEITURA: nada aqui grava
 * em disco — nem em `seedance-*`/`teardown-*`, nem em `review/`, nem em `assets/`.
 *
 * Um "projeto" é um <slug> que aparece como `seedance-<slug>/` e/ou
 * `teardown-<slug>/` na raiz (uma pasta fora da convenção também conta, se tiver
 * `PROMPT_n_*.md`). Projeto só com teardown aparece como "em andamento".
 *
 * Metadado OPCIONAL por projeto: `seedance-<slug>/project.json`, todos os campos
 * opcionais:
 *
 *   {
 *     "title":       "Muçarela boa se reconhece antes do forno",
 *     "campaign":    "MegaG — outubro 2026",
 *     "order":       8,
 *     "publishDate": "2026-10-09",
 *     "pillar":      "Gerar confiança",
 *     "reference":   "https://www.tiktok.com/@o_rusticu/video/7619078449319185685",
 *     "archived":    false,
 *     "note":        "texto curto opcional"
 *   }
 *
 * Status do pipeline, todo calculado do disco a cada chamada:
 *
 *   teardown  teardown-<slug>/teardown.md (+ frames em shots/ ou reads/)
 *   prompts   PROMPT_n (chunks, beats, duração, beats sem frame) — via beats.mjs
 *   copy      seedance-<slug>/COPY.md
 *   beats     review/<pasta>.json (aprovados / rejeitados / pendentes, envio)
 *   assets    assets/approved/<pasta>.json
 *   vídeo     .mp4 em out/, renders/ ou render/ ("final" no nome = vídeo final)
 *
 * O parse dos PROMPT_n é a única parte cara; fica em cache por pasta, invalidado
 * pela assinatura (nome + tamanho + mtime de cada chunk e mtime de shots/reads).
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { guessTeardownDir, listChunks, parseProject } from './beats.mjs';
import { approvedPath } from './assets.mjs';
import { reviewPath } from './review.mjs';
import { refsSummary } from './refs.mjs';

export const META_FILENAME = 'project.json';
/** Documentos que a home e a gaveta de copy podem ler (só leitura). */
export const DOC_NAMES = ['COPY.md', 'REFS.md'];
export const STAGES = ['prep', 'review', 'iterate', 'assets', 'ready', 'final'];
export const STEP_KEYS = ['teardown', 'prompts', 'copy', 'beats', 'assets', 'video'];

const SEEDANCE_PREFIX = 'seedance-';
const TEARDOWN_PREFIX = 'teardown-';
const DIR_RE = /^[\w][\w.-]*$/;
const SLUG_RE = /^[\w][\w.-]*$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const VIDEO_RE = /\.(mp4|mov|webm)$/i;
const SOURCE_RE = /^source\.(mp4|mov|webm|mkv)$/i;
/** Mesmo padrão de frame de `beats.mjs` (read_MM-SS-mmm.png). */
const FRAME_RE = /^([a-z]+)_(\d{1,3})-(\d{2})-(\d{1,3})\.(png|jpe?g|webp)$/i;
const RENDER_DIRS = ['out', 'renders', 'render'];
/** Folga entre `submittedAt` e `updatedAt` do review (o próprio envio regrava o arquivo). */
const SUBMIT_SLACK_MS = 3000;

// ---------------------------------------------------------------------------
// fs tolerante — outros agentes escrevem nessas pastas enquanto a home lê
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

function iso(ms) {
  return ms ? new Date(ms).toISOString() : null;
}

function readJsonLoose(file) {
  return JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''));
}

/** Acha `name` dentro de `dir` sem diferenciar maiúscula (COPY.md, copy.md…). */
export function findFileCI(dir, name) {
  const lower = String(name).toLowerCase();
  return safeReaddir(dir).find((n) => n.toLowerCase() === lower) ?? null;
}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

// ---------------------------------------------------------------------------
// project.json
// ---------------------------------------------------------------------------

export function emptyMeta() {
  return {
    title: null,
    campaign: null,
    order: null,
    publishDate: null,
    pillar: null,
    reference: null,
    archived: false,
    note: null,
  };
}

/** Normaliza o objeto cru do project.json. Campo inválido vira null + aviso. */
export function normalizeMeta(raw) {
  const warnings = [];
  const meta = emptyMeta();
  const str = (key, max = 300) => {
    const v = raw[key];
    if (v == null || v === '') return null;
    if (typeof v !== 'string') {
      warnings.push(`\`${key}\` deveria ser texto`);
      return String(v).slice(0, max);
    }
    return v.trim().slice(0, max) || null;
  };

  meta.title = str('title', 200);
  meta.campaign = str('campaign', 120);
  meta.pillar = str('pillar', 80);
  meta.note = str('note', 600);

  if (raw.order != null && raw.order !== '') {
    const n = Number(raw.order);
    if (Number.isFinite(n)) meta.order = n;
    else warnings.push('`order` deveria ser número');
  }

  const date = str('publishDate', 40);
  if (date) {
    const m = DATE_RE.exec(date);
    const valid = m && !Number.isNaN(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
      && Number(m[2]) >= 1 && Number(m[2]) <= 12 && Number(m[3]) >= 1 && Number(m[3]) <= 31;
    if (valid) meta.publishDate = date;
    else warnings.push('`publishDate` deveria ser AAAA-MM-DD');
  }

  const ref = str('reference', 2000);
  if (ref) {
    if (/^https?:\/\//i.test(ref)) meta.reference = ref;
    else warnings.push('`reference` deveria ser uma URL http(s)');
  }

  meta.archived = raw.archived === true || raw.archived === 'true';
  return { meta, warnings };
}

/** Lê `<seedanceDir>/project.json`. Ausente = metadado vazio; ilegível = erro, sem lançar. */
export function readProjectMeta(seedanceAbs) {
  const out = { exists: false, meta: emptyMeta(), error: null, warnings: [], mtimeMs: 0 };
  if (!seedanceAbs) return out;
  const name = findFileCI(seedanceAbs, META_FILENAME);
  if (!name) return out;
  const file = join(seedanceAbs, name);
  const st = safeStat(file);
  if (!st || !st.isFile()) return out;
  out.exists = true;
  out.mtimeMs = st.mtimeMs;
  let raw;
  try {
    raw = readJsonLoose(file);
  } catch (err) {
    out.error = `project.json ilegível (${err.message})`;
    return out;
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    out.error = 'project.json precisa ser um objeto JSON';
    return out;
  }
  const { meta, warnings } = normalizeMeta(raw);
  out.meta = meta;
  out.warnings = warnings;
  return out;
}

// ---------------------------------------------------------------------------
// descoberta
// ---------------------------------------------------------------------------

/** [{ slug, dir: 'seedance-…'|null, teardownDir: 'teardown-…'|null }] */
export function discoverProjects(root) {
  const bySlug = new Map();
  const get = (slug) => {
    if (!bySlug.has(slug)) bySlug.set(slug, { slug, dir: null, teardownDir: null });
    return bySlug.get(slug);
  };

  const entries = safeReaddir(root, { withFileTypes: true })
    .filter((e) => DIR_RE.test(e.name) && !e.name.startsWith('.'))
    .filter((e) => e.isDirectory() || (e.isSymbolicLink() && isDir(join(root, e.name))));

  for (const e of entries) {
    const name = e.name;
    const lower = name.toLowerCase();
    if (lower.startsWith(SEEDANCE_PREFIX) && name.length > SEEDANCE_PREFIX.length) {
      get(name.slice(SEEDANCE_PREFIX.length)).dir = name;
    } else if (lower.startsWith(TEARDOWN_PREFIX) && name.length > TEARDOWN_PREFIX.length) {
      get(name.slice(TEARDOWN_PREFIX.length)).teardownDir = name;
    } else if (listChunks(join(root, name)).length) {
      // fora da convenção, mas com PROMPT_n — o /api/projects também lista
      get(name).dir = name;
    }
  }
  return [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

// ---------------------------------------------------------------------------
// teardown
// ---------------------------------------------------------------------------

/** Frames do teardown: `shots/`, senão `reads/` — o primeiro que tiver algum. */
function looseFrames(teardownAbs) {
  for (const sub of ['shots', 'reads']) {
    const dir = join(teardownAbs, sub);
    const frames = safeReaddir(dir)
      .map((name) => ({ name, m: FRAME_RE.exec(name) }))
      .filter((e) => e.m)
      .map((e) => {
        const [, , mm, ss, mmm] = e.m;
        const t = Number(mm) * 60 + Number(ss) + Number(mmm.padEnd(3, '0')) / 1000;
        return { name: e.name, path: join(dir, e.name), t: round3(t) };
      })
      .sort((a, b) => a.t - b.t);
    if (frames.length) return frames;
  }
  return [];
}

function teardownSummary(teardownAbs) {
  if (!teardownAbs) return { exists: false, doc: false, frames: 0, source: false, updatedAtMs: 0, frameList: [] };
  const names = safeReaddir(teardownAbs);
  const docName = names.find((n) => n.toLowerCase() === 'teardown.md') ?? null;
  const docStat = docName ? safeStat(join(teardownAbs, docName)) : null;
  const frameList = looseFrames(teardownAbs);
  const dirStat = safeStat(teardownAbs);
  return {
    exists: true,
    doc: Boolean(docStat),
    frames: frameList.length,
    source: names.some((n) => SOURCE_RE.test(n)),
    updatedAtMs: Math.max(docStat?.mtimeMs ?? 0, dirStat?.mtimeMs ?? 0),
    frameList,
  };
}

// ---------------------------------------------------------------------------
// prompts (com cache)
// ---------------------------------------------------------------------------

const promptCache = new Map(); // seedanceAbs -> { sig, value }

function middle(list) {
  return list.length ? list[Math.floor((list.length - 1) / 2)] : null;
}

/**
 * Resumo dos PROMPT_n de uma pasta. null se não houver chunk nenhum.
 * Em cache até mudar algum chunk ou a lista de frames do teardown irmão.
 */
export function promptSummary(seedanceAbs) {
  const chunks = listChunks(seedanceAbs);
  if (!chunks.length) return null;

  const teardownAbs = guessTeardownDir(seedanceAbs);
  const sigParts = [];
  let updatedAtMs = 0;
  for (const c of chunks) {
    const st = safeStat(c.file);
    updatedAtMs = Math.max(updatedAtMs, st?.mtimeMs ?? 0);
    sigParts.push(`${c.name}:${st?.size ?? 0}:${st?.mtimeMs ?? 0}`);
  }
  sigParts.push(`td:${teardownAbs ?? ''}`);
  if (teardownAbs) {
    for (const sub of ['shots', 'reads']) sigParts.push(`${sub}:${safeStat(join(teardownAbs, sub))?.mtimeMs ?? 0}`);
  }
  const sig = sigParts.join('|');
  const hit = promptCache.get(seedanceAbs);
  if (hit && hit.sig === sig) return hit.value;

  let value;
  try {
    const project = parseProject(seedanceAbs);
    const beats = project.beats;
    const starts = beats.map((b) => b.start).filter((n) => n != null);
    const ends = beats.map((b) => b.end).filter((n) => n != null);
    const start = starts.length ? Math.min(...starts) : chunks[0].chunkStart;
    const end = ends.length ? Math.max(...ends) : chunks[chunks.length - 1].chunkEnd;

    // miniatura: o frame do meio do primeiro beat que tiver frame
    const firstWithFrame = beats.find((b) => b.frames.length);
    const thumbFrame = firstWithFrame ? middle(firstWithFrame.frames) : null;

    value = {
      chunks: chunks.length,
      beats: beats.length,
      beatIds: beats.map((b) => b.id),
      start,
      end,
      duration: start != null && end != null ? round3(end - start) : null,
      framesInTeardown: project.frames.length,
      beatsWithoutFrame: beats.filter((b) => !b.frame).length,
      dialogueBeats: beats.filter((b) => b.dialogue && b.dialogue.trim()).length,
      thumb: thumbFrame ? { path: thumbFrame.path, name: thumbFrame.name, t: thumbFrame.t, source: 'beat' } : null,
      updatedAtMs,
      error: null,
    };
  } catch (err) {
    // chunk sendo escrito agora por outro agente, por exemplo — não derruba a home
    value = {
      chunks: chunks.length,
      beats: 0,
      beatIds: [],
      start: chunks[0].chunkStart,
      end: chunks[chunks.length - 1].chunkEnd,
      duration: null,
      framesInTeardown: 0,
      beatsWithoutFrame: 0,
      dialogueBeats: 0,
      thumb: null,
      updatedAtMs,
      error: `falha ao ler os PROMPT_n: ${err.message}`,
    };
  }
  promptCache.set(seedanceAbs, { sig, value });
  return value;
}

// ---------------------------------------------------------------------------
// review / assets / render
// ---------------------------------------------------------------------------

function reviewSummary(root, dir, beatIds) {
  const total = beatIds.length;
  const base = {
    exists: false, approved: 0, rejected: 0, pending: total, total, withFeedback: 0, stale: 0,
    submittedAt: null, updatedAt: null, updatedAtMs: 0, editedAfterSubmit: false, error: null,
    firstPending: beatIds[0] ?? null, firstRejected: null,
  };
  if (!dir) return base;
  let file;
  try {
    file = reviewPath(root, dir);
  } catch {
    return base;
  }
  const st = safeStat(file);
  if (!st) return base;
  base.exists = true;
  base.updatedAtMs = st.mtimeMs;
  let data;
  try {
    data = readJsonLoose(file);
  } catch (err) {
    base.error = `review ilegível (${err.message})`;
    return base;
  }
  const ids = new Set(beatIds);
  for (const [id, rec] of Object.entries(data.beats ?? {})) {
    if (!ids.has(id)) {
      base.stale += 1; // decisão de um beat que não existe mais nos PROMPT_n
      continue;
    }
    if (rec?.decision === 'approved') base.approved += 1;
    else if (rec?.decision === 'rejected') base.rejected += 1;
    if (rec?.feedback) base.withFeedback += 1;
  }
  base.pending = Math.max(0, total - base.approved - base.rejected);
  const decisions = data.beats ?? {};
  base.firstPending = beatIds.find((id) => !['approved', 'rejected'].includes(decisions[id]?.decision)) ?? null;
  base.firstRejected = beatIds.find((id) => decisions[id]?.decision === 'rejected') ?? null;
  base.submittedAt = data.submittedAt ?? null;
  base.updatedAt = data.updatedAt ?? iso(st.mtimeMs);
  const sub = Date.parse(base.submittedAt ?? '');
  const upd = Date.parse(base.updatedAt ?? '');
  base.editedAfterSubmit = Number.isFinite(sub) && Number.isFinite(upd) && upd - sub > SUBMIT_SLACK_MS;
  if (Number.isFinite(upd)) base.updatedAtMs = upd;
  return base;
}

function assetsSummary(root, dir) {
  const base = { exists: false, approved: 0, rejected: 0, items: [], updatedAt: null, updatedAtMs: 0, error: null };
  if (!dir) return base;
  let file;
  try {
    file = approvedPath(root, dir);
  } catch {
    return base;
  }
  const st = safeStat(file);
  if (!st) return base;
  base.exists = true;
  base.updatedAtMs = st.mtimeMs;
  try {
    const data = readJsonLoose(file);
    const approved = Array.isArray(data.approved) ? data.approved : [];
    const rejected = Array.isArray(data.rejected) ? data.rejected : [];
    base.approved = approved.length;
    base.rejected = rejected.length;
    base.items = approved.map((e) => ({ slug: e.slug ?? null, kind: e.kind ?? null, name: e.name ?? e.term ?? null }));
    base.updatedAt = data.updatedAt ?? iso(st.mtimeMs);
  } catch (err) {
    base.error = `approved ilegível (${err.message})`;
  }
  return base;
}

function renderSummary(seedanceAbs) {
  const out = { videos: 0, final: null, finalAtMs: 0, latest: null, latestAtMs: 0 };
  if (!seedanceAbs) return out;
  const consider = (abs, label, inFinalDir) => {
    const st = safeStat(abs);
    if (!st || !st.isFile()) return;
    out.videos += 1;
    if (st.mtimeMs > out.latestAtMs) {
      out.latestAtMs = st.mtimeMs;
      out.latest = label;
    }
    if ((inFinalDir || /final/i.test(label)) && st.mtimeMs > out.finalAtMs) {
      out.finalAtMs = st.mtimeMs;
      out.final = label;
    }
  };
  for (const sub of RENDER_DIRS) {
    const base = join(seedanceAbs, sub);
    for (const e of safeReaddir(base, { withFileTypes: true })) {
      if (e.isFile() && VIDEO_RE.test(e.name)) {
        consider(join(base, e.name), `${sub}/${e.name}`, false);
      } else if (e.isDirectory()) {
        const inFinal = /final/i.test(e.name);
        for (const f of safeReaddir(join(base, e.name))) {
          if (VIDEO_RE.test(f)) consider(join(base, e.name, f), `${sub}/${e.name}/${f}`, inFinal);
        }
      }
    }
  }
  return out;
}

function docSummary(seedanceAbs, name) {
  if (!seedanceAbs) return { exists: false, name, bytes: 0, updatedAt: null, updatedAtMs: 0 };
  const found = findFileCI(seedanceAbs, name);
  const st = found ? safeStat(join(seedanceAbs, found)) : null;
  return {
    exists: Boolean(st && st.isFile()),
    name: found ?? name,
    bytes: st?.size ?? 0,
    updatedAt: iso(st?.mtimeMs ?? 0),
    updatedAtMs: st?.mtimeMs ?? 0,
  };
}

/**
 * Imagens de `references/` (até 2 níveis) × refs esperadas do REFS.md — ver refs.mjs.
 * `images` conta só refs de verdade (sem guias `_from_source/` e sem rascunhos `_…`).
 */
function refSummary(seedanceAbs, dir) {
  try {
    return refsSummary(seedanceAbs, dir);
  } catch {
    return refsSummary(null);
  }
}

// ---------------------------------------------------------------------------
// estágio + passos
// ---------------------------------------------------------------------------

function fmtSec(s) {
  if (s == null) return '';
  return `${(Math.round(s * 10) / 10).toFixed(1).replace('.', ',')}s`;
}

function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * O "próximo passo" do projeto, em uma palavra:
 *   prep    só teardown / sem prompts ainda (em andamento)
 *   review  beats pendentes de revisão
 *   iterate há beat rejeitado — iterar o prompt
 *   assets  beats todos aprovados, falta decidir os assets
 *   ready   beats aprovados + assets decididos: pronto para gerar
 *   final   há vídeo "final" mais novo que a última revisão
 */
function computeStage(p) {
  if (!p.prompts || !p.prompts.beats) return 'prep';
  const r = p.review;
  if (p.render.final && p.render.finalAtMs >= (r.exists ? r.updatedAtMs : 0)) return 'final';
  if (r.rejected > 0) return 'iterate';
  if (r.pending > 0) return 'review';
  if (p.assets.approved > 0) return 'ready';
  return 'assets';
}

function computeSteps(p) {
  const steps = [];
  const td = p.teardown;
  steps.push({
    key: 'teardown',
    state: td.doc ? 'done' : td.exists ? 'partial' : 'todo',
    detail: td.doc
      ? `teardown.md · ${plural(td.frames, 'frame', 'frames')}`
      : td.exists ? `em andamento · ${plural(td.frames, 'frame', 'frames')}` : 'sem pasta teardown-*',
  });

  const pr = p.prompts;
  steps.push({
    key: 'prompts',
    state: pr && pr.beats ? 'done' : pr ? 'partial' : 'todo',
    detail: pr && pr.beats
      ? `${plural(pr.chunks, 'chunk', 'chunks')} · ${plural(pr.beats, 'beat', 'beats')}${pr.duration != null ? ` · ${fmtSec(pr.duration)}` : ''}`
      : pr ? (pr.error ?? 'PROMPT_n sem beat reconhecido') : 'sem PROMPT_n',
    warning: pr && pr.beats && pr.beatsWithoutFrame
      ? `${plural(pr.beatsWithoutFrame, 'beat', 'beats')} sem frame do teardown`
      : null,
  });

  steps.push({
    key: 'copy',
    state: p.copy.exists ? 'done' : 'todo',
    detail: p.copy.exists ? 'COPY.md' : 'sem COPY.md',
  });

  const r = p.review;
  const hasBeats = Boolean(pr && pr.beats);
  steps.push({
    key: 'beats',
    state: !hasBeats ? 'todo'
      : r.rejected > 0 ? 'warn'
        : r.pending === 0 ? 'done'
          : r.approved > 0 ? 'partial' : 'todo',
    detail: !hasBeats ? 'sem beats'
      : `${r.approved}/${r.total} aprovados${r.rejected ? ` · ${r.rejected} rejeitado${r.rejected === 1 ? '' : 's'}` : ''}`,
    warning: r.editedAfterSubmit ? 'revisão mudou depois do envio' : null,
  });

  const a = p.assets;
  steps.push({
    key: 'assets',
    state: a.approved > 0 ? 'done' : a.exists && a.rejected > 0 ? 'partial' : 'todo',
    detail: a.approved > 0
      ? plural(a.approved, 'asset aprovado', 'assets aprovados')
      : a.exists ? 'só recusas' : 'sem decisão',
  });

  const v = p.render;
  steps.push({
    key: 'video',
    state: v.final ? 'done' : v.videos ? 'partial' : 'todo',
    detail: v.final ? `final: ${v.final}` : v.videos ? plural(v.videos, 'take', 'takes') : 'nada gerado',
  });
  return steps;
}

// ---------------------------------------------------------------------------
// um projeto / todos
// ---------------------------------------------------------------------------

function thumbVersion(thumb) {
  const st = safeStat(thumb.path);
  return `${Math.round(st?.mtimeMs ?? 0).toString(36)}${(st?.size ?? 0).toString(36)}`;
}

/** Resumo de UM projeto descoberto. Nunca lança: erro vira `error` no resumo. */
export function summarizeProject(root, entry) {
  const seedanceAbs = entry.dir ? join(root, entry.dir) : null;
  const teardownAbs = entry.teardownDir ? join(root, entry.teardownDir) : null;

  const meta = readProjectMeta(seedanceAbs);
  const teardown = teardownSummary(teardownAbs);
  let prompts = null;
  let error = null;
  try {
    prompts = seedanceAbs ? promptSummary(seedanceAbs) : null;
  } catch (err) {
    error = err.message;
  }
  const beatIds = prompts?.beatIds ?? [];
  const p = {
    slug: entry.slug,
    dir: entry.dir,
    teardownDir: entry.teardownDir,
    teardown,
    prompts,
    copy: docSummary(seedanceAbs, 'COPY.md'),
    refs: { ...docSummary(seedanceAbs, 'REFS.md'), ...refSummary(seedanceAbs, entry.dir) },
    review: reviewSummary(root, entry.dir, beatIds),
    assets: assetsSummary(root, entry.dir),
    render: renderSummary(seedanceAbs),
  };

  // miniatura: frame do primeiro beat; senão um frame do teardown
  let thumb = prompts?.thumb ?? null;
  if (!thumb && teardown.frameList.length) {
    const list = teardown.frameList;
    const pick = list.find((f) => f.t >= 1) ?? list[0];
    thumb = { path: pick.path, name: pick.name, t: pick.t, source: 'teardown' };
  }

  const seedStat = seedanceAbs ? safeStat(seedanceAbs) : null;
  const updatedAtMs = Math.max(
    meta.mtimeMs,
    seedStat?.mtimeMs ?? 0,
    teardown.updatedAtMs,
    prompts?.updatedAtMs ?? 0,
    p.copy.updatedAtMs,
    p.review.updatedAtMs,
    p.assets.updatedAtMs,
    p.render.latestAtMs,
    p.refs.latestMs,
  );

  const stage = computeStage(p);
  const steps = computeSteps(p);
  const enc = encodeURIComponent;

  return {
    slug: entry.slug,
    dir: entry.dir,
    teardownDir: entry.teardownDir,
    title: meta.meta.title ?? entry.slug,
    hasMeta: meta.exists,
    meta: meta.meta,
    metaError: meta.error,
    metaWarnings: meta.warnings,
    archived: meta.meta.archived,
    stage,
    steps,
    teardown: {
      exists: teardown.exists,
      doc: teardown.doc,
      frames: teardown.frames,
      source: teardown.source,
    },
    prompts: prompts
      ? {
        chunks: prompts.chunks,
        beats: prompts.beats,
        start: prompts.start,
        end: prompts.end,
        duration: prompts.duration,
        beatsWithoutFrame: prompts.beatsWithoutFrame,
        framesInTeardown: prompts.framesInTeardown,
        dialogueBeats: prompts.dialogueBeats,
        error: prompts.error,
      }
      : null,
    copy: { exists: p.copy.exists, name: p.copy.name, bytes: p.copy.bytes, updatedAt: p.copy.updatedAt },
    refs: {
      exists: p.refs.exists,
      name: p.refs.name,
      updatedAt: p.refs.updatedAt,
      images: p.refs.images,
      guides: p.refs.guides,
      drafts: p.refs.drafts,
      expected: p.refs.expected,
      generated: p.refs.generated,
      missing: p.refs.missing,
      optionalMissing: p.refs.optionalMissing,
      missingNames: p.refs.missingNames,
      latestAt: p.refs.latestAt,
    },
    review: {
      exists: p.review.exists,
      approved: p.review.approved,
      rejected: p.review.rejected,
      pending: p.review.pending,
      total: p.review.total,
      withFeedback: p.review.withFeedback,
      stale: p.review.stale,
      submittedAt: p.review.submittedAt,
      updatedAt: p.review.updatedAt,
      editedAfterSubmit: p.review.editedAfterSubmit,
      firstPending: p.review.firstPending,
      firstRejected: p.review.firstRejected,
      error: p.review.error,
    },
    assets: {
      exists: p.assets.exists,
      approved: p.assets.approved,
      rejected: p.assets.rejected,
      items: p.assets.items,
      updatedAt: p.assets.updatedAt,
      error: p.assets.error,
    },
    render: {
      videos: p.render.videos,
      final: p.render.final,
      latest: p.render.latest,
      updatedAt: iso(p.render.latestAtMs),
    },
    thumb: thumb
      ? { url: `/api/thumb?slug=${enc(entry.slug)}&v=${thumbVersion(thumb)}`, t: thumb.t, source: thumb.source, name: thumb.name }
      : null,
    links: {
      beats: entry.dir && prompts?.beats ? `ui.html#/${enc(entry.dir)}/` : null,
      assets: entry.dir && prompts?.beats ? `assets.html#/${enc(entry.dir)}` : null,
      copy: entry.dir ? `/?copy=${enc(entry.dir)}` : null,
      images: entry.dir ? `/?copy=${enc(entry.dir)}&tab=imagens` : null,
    },
    updatedAt: iso(updatedAtMs),
    error,
  };
}

/**
 * Todos os projetos da raiz, já resumidos.
 * @param {string} root
 * @param {{dir?:string, slug?:string}} [only]  limita a UM projeto (pela pasta seedance ou pelo slug)
 */
export function buildOverview(root, only = {}) {
  const t0 = performance.now();
  const abs = resolve(root);
  let entries = discoverProjects(abs);
  if (only.dir) entries = entries.filter((e) => e.dir === only.dir || e.teardownDir === only.dir);
  if (only.slug) entries = entries.filter((e) => e.slug === only.slug);
  const projects = entries.map((entry) => summarizeProject(abs, entry));
  return {
    root: abs,
    generatedAt: new Date().toISOString(),
    tookMs: Math.round((performance.now() - t0) * 10) / 10,
    stages: STAGES,
    steps: STEP_KEYS,
    projects,
  };
}

/**
 * Caminho absoluto do frame-miniatura de um projeto (pelo slug), ou null.
 * Só devolve caminhos que o próprio resumo achou — nada vem da query string.
 */
export function thumbPathForSlug(root, slug) {
  const raw = String(slug ?? '').trim();
  if (!SLUG_RE.test(raw) || raw.includes('..')) throw new Error(`slug inválido: ${slug}`);
  const abs = resolve(root);
  const entry = discoverProjects(abs).find((e) => e.slug === raw);
  if (!entry) throw new Error(`projeto não encontrado: ${raw}`);
  const prompts = entry.dir ? promptSummary(join(abs, entry.dir)) : null;
  if (prompts?.thumb) return prompts.thumb.path;
  if (entry.teardownDir) {
    const list = looseFrames(join(abs, entry.teardownDir));
    const pick = list.find((f) => f.t >= 1) ?? list[0];
    if (pick) return pick.path;
  }
  return null;
}

// ---------------------------------------------------------------------------
// CLI: node overview.mjs [raiz]
// ---------------------------------------------------------------------------

function main(argv) {
  const root = resolve(argv[0] ?? resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..'));
  if (!existsSync(root)) {
    console.error(`raiz não existe: ${root}`);
    process.exitCode = 1;
    return;
  }
  const ov = buildOverview(root);
  console.log(`raiz: ${ov.root}  ·  ${ov.projects.length} projetos  ·  ${ov.tookMs} ms`);
  const mark = { done: '#', partial: '+', warn: '!', todo: '.' };
  for (const p of ov.projects) {
    const steps = p.steps.map((s) => mark[s.state] ?? '?').join('');
    const tag = p.archived ? ' [arquivado]' : '';
    console.log(`${p.stage.padEnd(8)} ${steps}  ${p.slug.padEnd(34)} ${p.meta.campaign ?? '—'} · ${p.title}${tag}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2));
}
