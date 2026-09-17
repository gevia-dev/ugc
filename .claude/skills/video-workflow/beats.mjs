#!/usr/bin/env node
/**
 * beats.mjs — parser/serializer dos chunks `PROMPT_n` de um projeto Seedance.
 *
 * Zero dependência: só `node:` builtins. Node 22+.
 *
 * Formato reconhecido (verificado em seedance-pizza-osmo/PROMPT_1_0-18s.md):
 *
 *   **BEAT 1 — 0:00,000–0:04,104 (4,104s) — PREMISSA + A PIZZA DE UM SEGUNDO.**
 *   <descrição, uma ou mais linhas, podendo conter lista/linhas em branco>
 *
 *   FALA: "Pizza de um segundo."
 *
 *   CÂMERA: A (PM fechado, travada) → B (baixa, perto).
 *
 *   SFX: pá raspando a pedra; farfalhar de papel.
 *
 *   VFX: nenhum.
 *
 *   ---
 *
 * Rótulos aceitos: FALA|DIALOGUE, CÂMERA|CAMERA, SFX, VFX.
 * Chunks: PROMPT_<n>_<ini>-<fim>s.md   ·   Frames: <teardown>/shots/read_MM-SS-mmm.png
 *
 * A escrita é CIRÚRGICA: `writeBeat` só substitui os trechos exatos que o patch
 * muda (valor de um campo, nome, tempos, bloco de descrição). Escrever de volta o
 * mesmo valor que foi lido é no-op — o arquivo nem chega a ser regravado.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const EM_DASH = '—'; // —  separa "BEAT n", tempos e nome
const DASH_CLASS = '[\\u2014\\u2013-]'; // — – -

/** Campos rotulados de um beat, na ordem canônica de escrita. */
export const FIELD_SPECS = [
  { key: 'dialogue', canonical: 'FALA', labels: ['FALA', 'DIALOGUE'] },
  { key: 'camera', canonical: 'CÂMERA', labels: ['CÂMERA', 'CAMERA'] },
  { key: 'sfx', canonical: 'SFX', labels: ['SFX'] },
  { key: 'vfx', canonical: 'VFX', labels: ['VFX'] },
];
export const FIELD_KEYS = FIELD_SPECS.map((f) => f.key);

const LABEL_TO_KEY = new Map();
for (const spec of FIELD_SPECS) {
  for (const label of spec.labels) LABEL_TO_KEY.set(label.toUpperCase(), spec.key);
}

const HEADER_HEAD_RE = new RegExp(`^\\*\\*\\s*BEAT\\s+(\\d+)\\s*${DASH_CLASS}\\s*`, 'diu');
const TIME_RANGE_RE = new RegExp(
  `^\\s*(\\S+?)\\s*${DASH_CLASS}\\s*(\\S+)\\s*(?:\\(\\s*([^)]*?)\\s*\\))?\\s*$`,
  'du',
);
const FIELD_LINE_RE = /^([A-Za-zÀ-ÿ]{2,12})\s*:[ \t]*/u;
const SEPARATOR_RE = /^\s*-{3,}\s*$/;
const CHUNK_FILE_RE = /^PROMPT_(\d+)_([0-9]+(?:[.,][0-9]+)?)-([0-9]+(?:[.,][0-9]+)?)s\.md$/i;
const FRAME_FILE_RE = /^([a-z]+)_(\d{1,3})-(\d{2})-(\d{1,3})\.(png|jpe?g|webp)$/i;

// ---------------------------------------------------------------------------
// tempo
// ---------------------------------------------------------------------------

/** "0:04,104" | "4,104s" | "2.833s" -> 4.104 (segundos). Devolve null se não parsear. */
export function parseTime(label) {
  if (label == null) return null;
  const raw = String(label).trim().replace(/s$/iu, '').trim();
  if (!raw) return null;
  const parts = raw.split(':');
  let total = 0;
  for (const part of parts) {
    const n = Number(part.replace(',', '.'));
    if (!Number.isFinite(n)) return null;
    total = total * 60 + n;
  }
  return Math.round(total * 1000) / 1000;
}

/**
 * Formata segundos imitando o estilo de `template` (o rótulo original).
 * Sem template: "M:SS,mmm".
 */
export function formatTime(seconds, template = '0:00,000') {
  if (seconds == null || !Number.isFinite(seconds)) return '';
  const tpl = String(template);
  const decimal = tpl.includes(',') ? ',' : '.';
  const suffix = /s$/iu.test(tpl) ? 's' : '';
  const ms = Math.round(seconds * 1000);
  if (tpl.includes(':')) {
    const minutes = Math.floor(ms / 60000);
    const rest = ms - minutes * 60000;
    const secs = String(Math.floor(rest / 1000)).padStart(2, '0');
    const millis = String(rest % 1000).padStart(3, '0');
    return `${minutes}:${secs}${decimal}${millis}${suffix}`;
  }
  const secs = Math.floor(ms / 1000);
  const millis = String(ms % 1000).padStart(3, '0');
  return `${secs}${decimal}${millis}${suffix}`;
}

// ---------------------------------------------------------------------------
// descoberta de arquivos
// ---------------------------------------------------------------------------

/** Lista os chunks PROMPT_n de um diretório Seedance, ordenados por n. */
export function listChunks(seedanceDir) {
  const dir = resolve(seedanceDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((name) => ({ name, m: CHUNK_FILE_RE.exec(name) }))
    .filter((e) => e.m)
    .map((e) => ({
      file: join(dir, e.name),
      name: e.name,
      chunk: Number(e.m[1]),
      chunkStart: parseTime(e.m[2]),
      chunkEnd: parseTime(e.m[3]),
    }))
    .sort((a, b) => a.chunk - b.chunk);
}

/**
 * Lista os frames extraídos de um teardown (`<dir>/shots`, senão `<dir>/reads`,
 * senão o próprio dir). Nome esperado: read_MM-SS-mmm.png
 */
export function listFrames(teardownDir) {
  if (!teardownDir) return [];
  const root = resolve(teardownDir);
  const candidates = [join(root, 'shots'), join(root, 'reads'), root];
  const dir = candidates.find((d) => existsSync(d) && statSync(d).isDirectory());
  if (!dir) return [];
  return readdirSync(dir)
    .map((name) => ({ name, m: FRAME_FILE_RE.exec(name) }))
    .filter((e) => e.m)
    .map((e) => {
      const [, kind, mm, ss, mmm] = e.m;
      const t = Number(mm) * 60 + Number(ss) + Number(mmm.padEnd(3, '0')) / 1000;
      return { name: e.name, path: join(dir, e.name), dir, kind, t: Math.round(t * 1000) / 1000 };
    })
    .sort((a, b) => a.t - b.t);
}

/** seedance-pizza-osmo -> ../teardown-pizza-osmo (se existir). */
export function guessTeardownDir(seedanceDir) {
  const dir = resolve(seedanceDir);
  const guess = join(dirname(dir), basename(dir).replace(/^seedance-/i, 'teardown-'));
  return guess !== dir && existsSync(guess) ? guess : null;
}

// ---------------------------------------------------------------------------
// parse
// ---------------------------------------------------------------------------

function parseHeader(line) {
  const head = HEADER_HEAD_RE.exec(line);
  if (!head) return null;
  const trimmedEnd = line.replace(/\s+$/u, '');
  if (!trimmedEnd.endsWith('**')) return null;

  const numberSpan = head.indices[1];
  const innerStart = head[0].length;
  const innerEnd = trimmedEnd.length - 2;
  if (innerEnd <= innerStart) return null;
  const inner = line.slice(innerStart, innerEnd);

  const sepIdx = inner.indexOf(EM_DASH);
  const timePart = sepIdx >= 0 ? inner.slice(0, sepIdx) : inner;
  const tm = TIME_RANGE_RE.exec(timePart);
  if (!tm) return null;

  const spans = {
    number: numberSpan,
    start: shift(tm.indices[1], innerStart),
    end: shift(tm.indices[2], innerStart),
    duration: tm.indices[3] ? shift(tm.indices[3], innerStart) : null,
  };

  let name = '';
  if (sepIdx >= 0) {
    const rawName = inner.slice(sepIdx + EM_DASH.length);
    const lead = rawName.length - rawName.replace(/^\s+/u, '').length;
    const nameStart = innerStart + sepIdx + EM_DASH.length + lead;
    name = rawName.trim();
    spans.name = [nameStart, nameStart + name.length];
  } else {
    spans.name = [innerEnd, innerEnd];
  }

  const startLabel = tm[1];
  const endLabel = tm[2];
  const durationLabel = tm[3] ?? null;
  const start = parseTime(startLabel);
  const end = parseTime(endLabel);
  const duration =
    parseTime(durationLabel) ?? (start != null && end != null ? Math.round((end - start) * 1000) / 1000 : null);

  return {
    number: Number(head[1]),
    name,
    startLabel,
    endLabel,
    durationLabel,
    start,
    end,
    duration,
    spans,
  };
}

function shift(span, offset) {
  return [span[0] + offset, span[1] + offset];
}

/** Lê e parseia um único arquivo de chunk. */
export function parseChunk(file) {
  const abs = resolve(file);
  const raw = readFileSync(abs, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  const meta = CHUNK_FILE_RE.exec(basename(abs));

  const headerIdx = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (parseHeader(lines[i])) headerIdx.push(i);
  }

  const chunk = {
    file: abs,
    name: basename(abs),
    dir: dirname(abs),
    chunk: meta ? Number(meta[1]) : null,
    chunkStart: meta ? parseTime(meta[2]) : null,
    chunkEnd: meta ? parseTime(meta[3]) : null,
    eol,
    lines,
    raw,
    beats: [],
  };

  chunk.beats = headerIdx.map((h, k) =>
    parseBeat(chunk, h, k + 1 < headerIdx.length ? headerIdx[k + 1] : lines.length),
  );
  return chunk;
}

function parseBeat(chunk, headerLine, limit) {
  const { lines } = chunk;
  const header = parseHeader(lines[headerLine]);

  let blockEnd = limit;
  for (let i = headerLine + 1; i < limit; i += 1) {
    if (SEPARATOR_RE.test(lines[i])) {
      blockEnd = i;
      break;
    }
  }

  const fields = [];
  let firstFieldLine = -1;
  for (let i = headerLine + 1; i < blockEnd; i += 1) {
    const fm = FIELD_LINE_RE.exec(lines[i]);
    if (!fm) continue;
    const key = LABEL_TO_KEY.get(fm[1].toUpperCase());
    if (!key) continue;
    if (firstFieldLine < 0) firstFieldLine = i;
    fields.push({
      key,
      label: fm[1],
      line: i,
      valueStart: fm[0].length,
      value: lines[i].slice(fm[0].length),
    });
  }

  const descStart = headerLine + 1;
  let descEnd = firstFieldLine >= 0 ? firstFieldLine : blockEnd;
  while (descEnd > descStart && lines[descEnd - 1].trim() === '') descEnd -= 1;

  const beat = {
    file: chunk.file,
    chunkFile: chunk.name,
    chunk: chunk.chunk,
    index: header.number,
    id: `${chunk.chunk ?? 0}.${header.number}`,
    name: header.name,
    start: header.start,
    end: header.end,
    duration: header.duration,
    startLabel: header.startLabel,
    endLabel: header.endLabel,
    durationLabel: header.durationLabel,
    description: lines.slice(descStart, descEnd).join('\n'),
    dialogue: null,
    camera: null,
    sfx: null,
    vfx: null,
    frame: null,
    frames: [],
    fields,
    lines: { header: headerLine, descStart, descEnd, blockEnd },
    headerSpans: header.spans,
  };
  for (const f of fields) if (beat[f.key] == null) beat[f.key] = f.value;
  return beat;
}

/**
 * Parseia um projeto inteiro: todos os chunks do diretório Seedance + os frames
 * do teardown, casando cada beat com os frames cujo timestamp cai no seu range.
 *
 * @param {string} seedanceDir  pasta com os PROMPT_n_*.md
 * @param {string} [teardownDir] pasta do teardown (default: irmã `teardown-*`)
 */
export function parseProject(seedanceDir, teardownDir) {
  const sdir = resolve(seedanceDir);
  const tdir = teardownDir ? resolve(teardownDir) : guessTeardownDir(sdir);
  const frames = listFrames(tdir);
  const chunks = listChunks(sdir).map((c) => parseChunk(c.file));
  const beats = [];

  for (const chunk of chunks) {
    for (const beat of chunk.beats) {
      beat.frames =
        beat.start != null && beat.end != null
          ? frames.filter((f) => f.t >= beat.start && f.t < beat.end)
          : [];
      beat.frame = beat.frames.length ? beat.frames[0] : null;
      beats.push(beat);
    }
  }

  return {
    seedanceDir: sdir,
    teardownDir: tdir,
    name: basename(sdir),
    chunks,
    beats,
    frames,
    start: beats.length ? beats[0].start : null,
    end: beats.length ? beats[beats.length - 1].end : null,
  };
}

// ---------------------------------------------------------------------------
// serialize
// ---------------------------------------------------------------------------

function applySpans(line, edits) {
  const sorted = edits.filter(Boolean).sort((a, b) => b.span[0] - a.span[0]);
  let out = line;
  for (const edit of sorted) {
    out = out.slice(0, edit.span[0]) + edit.text + out.slice(edit.span[1]);
  }
  return out;
}

/**
 * Reescreve UM beat de um chunk, trocando só o que o patch pede.
 *
 * @param {string} file        caminho do PROMPT_n_*.md
 * @param {number} beatIndex   número do beat COMO ESCRITO no arquivo (1-based)
 * @param {object} patch       { name?, description?, dialogue?, camera?, sfx?, vfx?,
 *                               start?, end?, duration? }  — chaves ausentes ficam intactas.
 *                             Campo rotulado = null remove a linha; valor novo em campo
 *                             inexistente insere a linha na ordem canônica.
 * @returns {{file:string, beatIndex:number, changed:boolean, changedKeys:string[]}}
 */
export function writeBeat(file, beatIndex, patch = {}) {
  const chunk = parseChunk(file);
  const beat = chunk.beats.find((b) => b.index === beatIndex);
  if (!beat) {
    throw new Error(`beat ${beatIndex} não encontrado em ${basename(chunk.file)}`);
  }

  const lines = chunk.lines.slice();

  // Rede de segurança: se o round-trip do arquivo intocado já não bate byte a byte,
  // não escrevemos nada — melhor falhar do que corromper um prompt existente.
  if (lines.join(chunk.eol) !== chunk.raw) {
    throw new Error(`quebra de linha não uniforme em ${basename(chunk.file)}: escrita abortada`);
  }

  const changedKeys = [];

  // --- cabeçalho -----------------------------------------------------------
  const headerEdits = [];
  if ('name' in patch && patch.name != null && String(patch.name) !== beat.name) {
    headerEdits.push({ span: beat.headerSpans.name, text: String(patch.name) });
    changedKeys.push('name');
  }
  for (const key of ['start', 'end', 'duration']) {
    if (!(key in patch) || patch[key] == null) continue;
    const span = beat.headerSpans[key];
    if (!span) continue;
    const currentLabel = beat[`${key}Label`];
    const nextLabel =
      typeof patch[key] === 'number' ? formatTime(patch[key], currentLabel ?? undefined) : String(patch[key]);
    if (nextLabel !== currentLabel) {
      headerEdits.push({ span, text: nextLabel });
      changedKeys.push(key);
    }
  }
  if (headerEdits.length) {
    lines[beat.lines.header] = applySpans(lines[beat.lines.header], headerEdits);
  }

  // --- campos rotulados (edição in-place, sem mexer em offsets) -------------
  const removals = [];
  const insertions = [];
  for (const spec of FIELD_SPECS) {
    if (!(spec.key in patch)) continue;
    const existing = beat.fields.find((f) => f.key === spec.key);
    const next = patch[spec.key];

    if (existing && next != null) {
      const nextValue = String(next);
      if (nextValue !== existing.value) {
        lines[existing.line] = lines[existing.line].slice(0, existing.valueStart) + nextValue;
        changedKeys.push(spec.key);
      }
    } else if (existing && next == null) {
      removals.push(existing.line);
      if (lines[existing.line + 1] !== undefined && lines[existing.line + 1].trim() === '') {
        removals.push(existing.line + 1);
      }
      changedKeys.push(spec.key);
    } else if (!existing && next != null && String(next) !== '') {
      insertions.push({ key: spec.key, text: `${spec.canonical}: ${String(next)}` });
      changedKeys.push(spec.key);
    }
  }

  // --- descrição -----------------------------------------------------------
  let descReplacement = null;
  if ('description' in patch && patch.description != null) {
    const nextDesc = String(patch.description).replace(/\r\n/g, '\n');
    if (nextDesc !== beat.description) {
      descReplacement = nextDesc.split('\n');
      changedKeys.push('description');
    }
  }

  if (!changedKeys.length) {
    return { file: chunk.file, beatIndex, changed: false, changedKeys: [] };
  }

  // Aplica remoções/inserções/descrição de trás pra frente, para não invalidar índices.
  let out = lines;

  if (insertions.length) {
    const order = FIELD_KEYS;
    const anchorLine = beat.fields.length
      ? Math.max(...beat.fields.map((f) => f.line))
      : beat.lines.descEnd - 1;
    // Insere respeitando a ordem canônica em relação aos campos já existentes.
    const additions = [];
    for (const ins of insertions) {
      const pos = order.indexOf(ins.key);
      const before = beat.fields.filter((f) => order.indexOf(f.key) < pos);
      const at = before.length ? Math.max(...before.map((f) => f.line)) : anchorLine;
      additions.push({ at, text: ins.text });
    }
    additions.sort((a, b) => b.at - a.at);
    for (const add of additions) {
      out.splice(add.at + 1, 0, '', add.text);
    }
  }

  if (descReplacement) {
    out.splice(beat.lines.descStart, beat.lines.descEnd - beat.lines.descStart, ...descReplacement);
  }

  if (removals.length) {
    for (const line of [...new Set(removals)].sort((a, b) => b - a)) out.splice(line, 1);
  }

  const next = out.join(chunk.eol);
  if (next === chunk.raw) {
    return { file: chunk.file, beatIndex, changed: false, changedKeys: [] };
  }
  writeFileSync(chunk.file, next, 'utf8');
  return { file: chunk.file, beatIndex, changed: true, changedKeys };
}

// ---------------------------------------------------------------------------
// CLI: node beats.mjs <seedanceDir> [teardownDir]
// ---------------------------------------------------------------------------

function fmt(seconds) {
  return seconds == null ? '—' : `${seconds.toFixed(3).replace('.', ',')}s`;
}

function main(argv) {
  const [seedanceDir, teardownDir] = argv;
  if (!seedanceDir) {
    console.error('uso: node beats.mjs <seedanceDir> [teardownDir]');
    process.exitCode = 1;
    return;
  }
  const project = parseProject(seedanceDir, teardownDir);
  console.log(`projeto : ${project.name}  (${project.seedanceDir})`);
  console.log(`teardown: ${project.teardownDir ?? '—'}  (${project.frames.length} frames)`);
  console.log(`chunks  : ${project.chunks.length}   beats: ${project.beats.length}`);

  for (const chunk of project.chunks) {
    console.log(`\n=== ${chunk.name} — ${chunk.beats.length} beats ===`);
    for (const beat of chunk.beats) {
      console.log(
        `\n[${beat.id}] beat ${beat.index} | ini ${fmt(beat.start)} | fim ${fmt(beat.end)} | dur ${fmt(beat.duration)}`,
      );
      console.log(`  nome   : ${beat.name}`);
      console.log(`  FALA   : ${beat.dialogue ?? '—'}`);
      console.log(`  CÂMERA : ${beat.camera ?? '—'}`);
      console.log(`  SFX    : ${beat.sfx ?? '—'}`);
      console.log(`  VFX    : ${beat.vfx ?? '—'}`);
      console.log(`  frame  : ${beat.frame ? beat.frame.name : 'null'}`);
    }
  }

  console.log('\n=== beat -> frame ===');
  for (const beat of project.beats) {
    const range = `${fmt(beat.start)}–${fmt(beat.end)}`.padEnd(20);
    const frame = beat.frame ? `${beat.frame.name} @ ${fmt(beat.frame.t)}` : 'null';
    console.log(`${beat.id.padEnd(5)} ${range} ${frame}   (${beat.frames.length} no range)`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2));
}
