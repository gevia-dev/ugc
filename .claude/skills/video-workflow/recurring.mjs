#!/usr/bin/env node
/**
 * recurring.mjs — lê as seções NÃO-beat dos `PROMPT_n_*.md` (BÍBLIA DE ESTILO,
 * OBJETOS DE CENA, CONTINUIDADE, NEGATIVOS) e deduz o que se REPETE entre os
 * chunks: as pessoas, locais, objetos e props que voltam em mais de um chunk e
 * portanto merecem virar asset reutilizável.
 *
 * Zero dependência: só `node:` builtins. Node 22+.
 *
 * Complementa `beats.mjs`, que modela só o `PLANO A PLANO`.
 *
 * IMPORTANTE (regra de produto, não de implementação):
 *   este módulo SÓ SUGERE. Ele nunca escreve na biblioteca, nunca promove
 *   `references/refN_*.png` a asset e nunca anexa nada a um projeto. Quem grava
 *   é `assets.mjs`, e só depois de uma confirmação explícita vinda da tela.
 */

import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { listChunks } from './beats.mjs';

// ---------------------------------------------------------------------------
// normalização
// ---------------------------------------------------------------------------

/** "Eletrodoméstico-herói" -> "eletrodomestico heroi" (sem acento, sem pontuação). */
export function normalizeTerm(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim();
}

const LEADING_ARTICLES = /^(?:o|a|os|as|um|uma|uns|umas|de|do|da|dos|das|the|an|and)\s+/u;

/** Tira artigos iniciais: "o pizzaiolo" -> "pizzaiolo". */
export function stripArticles(value) {
  let out = String(value ?? '').trim();
  for (let i = 0; i < 4; i += 1) {
    const next = out.replace(LEADING_ARTICLES, '');
    if (next === out) break;
    out = next;
  }
  return out;
}

/** "o pizzaiolo" -> "pizzaiolo"; "Pá de pizza de alumínio" -> "pa-de-pizza-de-aluminio". */
export function slugify(value, max = 60) {
  const norm = stripArticles(normalizeTerm(value));
  const slug = norm.replace(/\s+/gu, '-').replace(/^-+|-+$/gu, '');
  return slug.slice(0, max).replace(/-+$/u, '');
}

// ---------------------------------------------------------------------------
// seções
// ---------------------------------------------------------------------------

/**
 * Mapa de seção -> papel semântico. Cobre os dois dialetos vistos no repo:
 * pt-BR (`## BÍBLIA DE ESTILO`, `### Sujeito — …`) e o inglês numerado
 * (`## 1. STYLE BIBLE`, `### Host`, `## 6. PROPS`).
 */
export const SECTION_SPECS = [
  { id: 'style', kind: null, names: ['biblia de estilo', 'style bible'] },
  { id: 'subject', kind: 'pessoa', names: ['sujeito', 'host', 'subject', 'personagem', 'talento'] },
  { id: 'location', kind: 'local', names: ['locacao set', 'location set', 'locacao', 'location', 'set'] },
  {
    id: 'hero',
    kind: 'objeto',
    names: ['eletrodomestico heroi', 'hero appliance', 'hero prop', 'produto heroi', 'objeto heroi'],
  },
  { id: 'props', kind: 'prop', names: ['objetos de cena', 'props', 'objetos', 'prop list'] },
  { id: 'continuity', kind: null, names: ['continuidade', 'continuity'] },
  { id: 'negatives', kind: null, names: ['negativos', 'negatives'] },
];

const HEADING_RE = /^(#{1,6})\s+(.*\S)\s*$/u;
const EM_DASH_SPLIT = /\s[—–]\s/u;
const BOLD_RE = /\*\*([^*]+?)\*\*/gu;
const KIND_WEIGHT = { pessoa: 6, local: 4, objeto: 3, prop: 1 };

/** Tira `#`, numeração (`1.`, `6.`) e devolve `{ level, title, head, label }`. */
function parseHeading(line) {
  const m = HEADING_RE.exec(line);
  if (!m) return null;
  const rawTitle = m[2].replace(/^\d+[.)]\s*/u, '').trim();
  const parts = rawTitle.split(EM_DASH_SPLIT);
  return {
    level: m[1].length,
    title: rawTitle,
    head: parts[0].trim(),
    label: parts.length > 1 ? parts.slice(1).join(' — ').trim() : null,
  };
}

function specFor(head) {
  const norm = normalizeTerm(head);
  return SECTION_SPECS.find((spec) => spec.names.includes(norm)) ?? null;
}

/**
 * Fatia um arquivo de chunk nas suas seções (H2 e H3).
 * @returns {{file:string, name:string, chunk:number|null, title:string|null, sections:Array}}
 */
export function parseSections(file) {
  const abs = resolve(file);
  const raw = readFileSync(abs, 'utf8');
  const lines = raw.split(/\r?\n/);

  const heads = [];
  for (let i = 0; i < lines.length; i += 1) {
    const h = parseHeading(lines[i]);
    if (h) heads.push({ ...h, line: i });
  }

  const sections = [];
  let parent = null;
  for (let k = 0; k < heads.length; k += 1) {
    const h = heads[k];
    if (h.level <= 1) {
      parent = null;
      continue;
    }
    if (h.level === 2) parent = h;
    let end = lines.length;
    for (let j = k + 1; j < heads.length; j += 1) {
      if (heads[j].level <= h.level) {
        end = heads[j].line;
        break;
      }
    }
    const spec = specFor(h.head);
    sections.push({
      id: spec ? spec.id : null,
      kind: spec ? spec.kind : null,
      level: h.level,
      title: h.title,
      head: h.head,
      label: h.label,
      parent: h.level > 2 && parent ? parent.head : null,
      startLine: h.line,
      endLine: end,
      lines: lines.slice(h.line + 1, end),
    });
  }

  const titleHead = heads.find((h) => h.level === 1) ?? null;
  const meta = /^PROMPT_(\d+)_/i.exec(basename(abs));
  return {
    file: abs,
    name: basename(abs),
    chunk: meta ? Number(meta[1]) : null,
    title: titleHead ? titleHead.title : null,
    sections,
  };
}

/** Devolve a primeira seção com aquele papel (ex.: 'props'). */
export function findSection(doc, id) {
  return doc.sections.find((s) => s.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// extração de termos
// ---------------------------------------------------------------------------

/** Negritos que não são coisa nenhuma — rótulos de posição, cabeçalhos de lista. */
const TERM_STOPWORDS = new Set(
  [
    'nada alem disso',
    'guarda roupa exatamente e sem variacao',
    'guarda roupa',
    'a esquerda da camera',
    'a direita da camera',
    'acima',
    'ao fundo',
    'abaixo',
    'borda direita do quadro',
    'inferior esquerdo',
    'primeiro plano',
    'wardrobe',
    'head',
    'glasses',
    'performance',
    'lighting',
    'interpretacao',
    'interpretacao neste chunk',
    'cenario de fundo',
    'nenhum',
    'nenhuma',
    'none',
    'sim',
    'nao',
  ].map((t) => normalizeTerm(t)),
);

function looksLikeLabel(text) {
  return /:\s*$/u.test(text.trim());
}

function usefulTerm(text) {
  const clean = String(text ?? '')
    .replace(/[`"'“”]/gu, '')
    // "o pizzaiolo (uma pessoa, em cena o tempo todo)" -> "o pizzaiolo"
    .replace(/\s*\([^)]*\)/gu, '')
    .trim();
  if (!clean || looksLikeLabel(clean)) return null;
  const norm = stripArticles(normalizeTerm(clean));
  if (norm.length < 3) return null;
  if (/^\d[\d.,\s]*$/u.test(norm)) return null;
  if (TERM_STOPWORDS.has(norm)) return null;
  return { text: clean.replace(/[.:;,]+$/u, '').trim(), norm };
}

/** Todos os negritos de um bloco de linhas, na ordem. */
function boldTerms(lines) {
  const out = [];
  for (const line of lines) {
    BOLD_RE.lastIndex = 0;
    let m;
    while ((m = BOLD_RE.exec(line)) !== null) {
      const term = usefulTerm(m[1]);
      if (term) out.push({ ...term, line });
    }
  }
  return out;
}

const BULLET_RE = /^\s*[-*]\s+(.*\S)\s*$/u;

/** Primeira frase utilizável de um bloco (fallback quando não há negrito). */
function firstPhrase(lines) {
  for (const line of lines) {
    const clean = line
      .replace(/^\s*[-*]\s+/u, '')
      .replace(/\*\*/gu, '')
      .replace(/[`_]/gu, '')
      .trim();
    if (!clean || clean.startsWith('#') || /^-{3,}$/u.test(clean)) continue;
    const cut = clean.split(/[.;:—–]/u)[0].trim();
    const term = usefulTerm(cut.slice(0, 70));
    if (term) return term;
  }
  return null;
}

/**
 * Candidatos de UM chunk. Cada um é `{ term, norm, kind, section, tags, evidence }`.
 * As seções mandam o `kind`: Sujeito -> pessoa, Locação -> local,
 * Eletrodoméstico-herói -> objeto, Objetos de cena -> prop.
 */
export function chunkCandidates(doc) {
  const out = [];

  const push = (kind, section, termObj, tags, evidence) => {
    if (!termObj) return;
    const norm = stripArticles(termObj.norm);
    out.push({
      term: termObj.text,
      norm,
      kind,
      section,
      tags: [...new Set(tags.map((t) => t.norm).filter((t) => t && t !== norm))],
      evidence: String(evidence ?? '').trim(),
    });
  };

  // --- Sujeito(s) -> pessoa ------------------------------------------------
  for (const s of doc.sections.filter((x) => x.id === 'subject')) {
    const tags = boldTerms(s.lines);
    const termObj = usefulTerm(s.label ?? '') ?? firstPhrase(s.lines) ?? usefulTerm(s.head);
    push('pessoa', s.title, termObj, tags, s.label ?? s.title);
  }

  // --- Locação -> local ----------------------------------------------------
  for (const s of doc.sections.filter((x) => x.id === 'location')) {
    const bolds = boldTerms(s.lines);
    // a locação em si costuma ser o primeiro negrito de parágrafo (não de bullet)
    const paragraph = s.lines.filter((l) => !BULLET_RE.test(l));
    const head = boldTerms(paragraph)[0] ?? firstPhrase(s.lines);
    const termObj = usefulTerm(s.label ?? '') ?? head;
    push('local', s.title, termObj, bolds, (s.label ?? '') || (head ? head.text : s.title));
  }

  // --- Eletrodoméstico-herói -> objeto -------------------------------------
  for (const s of doc.sections.filter((x) => x.id === 'hero')) {
    const bolds = boldTerms(s.lines);
    const termObj = usefulTerm(s.label ?? '') ?? bolds[0] ?? firstPhrase(s.lines);
    push('objeto', s.title, termObj, bolds, s.label ?? s.title);
  }

  // --- Objetos de cena -> prop (um candidato por bullet) -------------------
  for (const s of doc.sections.filter((x) => x.id === 'props')) {
    for (const line of s.lines) {
      const bm = BULLET_RE.exec(line);
      if (!bm) continue;
      const bolds = boldTerms([line]);
      const termObj = bolds[0] ?? usefulTerm(bm[1].split(/[.;—–]/u)[0]);
      push('prop', s.title, termObj, bolds.slice(1), bm[1].slice(0, 220));
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// agregação entre chunks
// ---------------------------------------------------------------------------

/**
 * Lê todos os `PROMPT_n` do projeto e devolve o que aparece em ≥ `minChunks`.
 *
 * @param {string} seedanceDir
 * @param {{minChunks?:number}} [opts]
 * @returns {{project:string, chunkCount:number, chunks:Array, candidates:Array, all:Array}}
 */
export function recurringCandidates(seedanceDir, opts = {}) {
  const minChunks = opts.minChunks ?? 2;
  const files = listChunks(seedanceDir);
  const docs = files.map((f) => parseSections(f.file));

  /** @type {Map<string, any>} */
  const byKey = new Map();

  for (const doc of docs) {
    const seenInChunk = new Set();
    for (const cand of chunkCandidates(doc)) {
      const key = `${cand.kind}:${cand.norm}`;
      let entry = byKey.get(key);
      if (!entry) {
        entry = {
          key,
          term: cand.term,
          norm: cand.norm,
          slug: slugify(cand.term),
          kind: cand.kind,
          chunks: [],
          sections: [],
          tags: [],
          continuity: 0,
          evidence: [],
        };
        byKey.set(key, entry);
      }
      if (!seenInChunk.has(key)) {
        seenInChunk.add(key);
        if (doc.chunk != null && !entry.chunks.includes(doc.chunk)) entry.chunks.push(doc.chunk);
      }
      if (!entry.sections.includes(cand.section)) entry.sections.push(cand.section);
      for (const t of cand.tags) if (!entry.tags.includes(t)) entry.tags.push(t);
      entry.evidence.push({ chunk: doc.chunk, file: doc.name, section: cand.section, text: cand.evidence });
    }
  }

  // Reforço: menção no bloco CONTINUIDADE não cria candidato novo, só confirma
  // que aquele termo atravessa a emenda entre chunks.
  for (const doc of docs) {
    const cont = findSection(doc, 'continuity');
    if (!cont) continue;
    const text = normalizeTerm(cont.lines.join(' '));
    for (const entry of byKey.values()) {
      if (!entry.norm || entry.norm.length < 4) continue;
      if (!text.includes(entry.norm)) continue;
      entry.continuity += 1;
      if (doc.chunk != null && !entry.chunks.includes(doc.chunk)) entry.chunks.push(doc.chunk);
    }
  }

  const all = [...byKey.values()].map((e) => {
    e.chunks.sort((a, b) => a - b);
    e.tags = e.tags.slice(0, 24);
    e.evidence = e.evidence.slice(0, 6);
    e.score = e.chunks.length * 10 + e.continuity * 2 + (KIND_WEIGHT[e.kind] ?? 0);
    return e;
  });

  const candidates = all
    .filter((e) => e.chunks.length >= minChunks)
    .sort((a, b) => b.score - a.score || a.term.localeCompare(b.term, 'pt-BR'));

  return {
    project: basename(resolve(seedanceDir)),
    chunkCount: docs.length,
    chunks: docs.map((d) => ({ chunk: d.chunk, file: d.name, title: d.title })),
    minChunks,
    candidates,
    all: all.sort((a, b) => b.score - a.score),
  };
}

// ---------------------------------------------------------------------------
// CLI: node recurring.mjs <seedanceDir>
// ---------------------------------------------------------------------------

function main(argv) {
  const [dir] = argv;
  if (!dir) {
    console.error('uso: node recurring.mjs <seedanceDir>');
    process.exitCode = 1;
    return;
  }
  const r = recurringCandidates(dir);
  console.log(`projeto : ${r.project}  (${r.chunkCount} chunks)`);
  console.log(`recorrentes (>=${r.minChunks} chunks): ${r.candidates.length}\n`);
  for (const c of r.candidates) {
    console.log(`[${c.kind}] ${c.term}`);
    console.log(`  slug   : ${c.slug}`);
    console.log(`  chunks : ${c.chunks.join(', ')}   score ${c.score}`);
    console.log(`  tags   : ${c.tags.slice(0, 6).join(' · ') || '—'}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2));
}
