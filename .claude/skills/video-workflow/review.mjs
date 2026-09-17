#!/usr/bin/env node
/**
 * review.mjs — aprovação/rejeição de beat com feedback, POR PROJETO.
 *
 * Zero dependência: só `node:` builtins. Node 22+.
 *
 * Estado vive em `<raiz>/review/<projeto>.json` — DADO local, não código
 * (mesma lógica de `assets/`: sobrevive ao servidor, não é código-fonte).
 * `review/` está no `.gitignore`.
 *
 *   review/
 *     <projeto>.json     decisão + feedback por beat, deste projeto
 *     <projeto>.md        digest legível, escrito só no "enviar" (submitReview)
 *
 * Schema (`review/<projeto>.json`):
 *
 *   {
 *     "version":     1,
 *     "project":     "seedance-pizza-osmo",
 *     "updatedAt":   "2026-09-17T…",
 *     "submittedAt": "2026-09-17T…" | null,
 *     "beats": {
 *       "1.3": {
 *         "beatId":    "1.3",
 *         "position":  3,
 *         "name":      "O VEREDITO DE UM MINUTO.",
 *         "decision":  "approved" | "rejected",
 *         "feedback":  "texto livre, pode ser vazio",
 *         "decidedAt": "2026-09-17T…"
 *       }, …
 *     }
 *   }
 *
 * `submitReview()` é o botão "enviar" do header: carimba `submittedAt` e
 * escreve `review/<projeto>.md`, um digest em prosa pensado para EU ler na
 * próxima vez que abrir o projeto — é o mecanismo que fecha o loop UI → chat.
 * Ele não apaga nada: pode ser chamado de novo depois de mais decisões.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

export const REVIEW_DIRNAME = 'review';
export const REVIEW_VERSION = 1;
export const DECISIONS = ['approved', 'rejected'];

/** Mesmo padrão de nome de projeto usado em `server.mjs`/`assets.mjs`. */
const PROJECT_RE = /^[\w][\w.-]*$/;
/** id de beat: "<chunk>.<posição-no-chunk>", ex. "1.3". */
const BEAT_ID_RE = /^\d+\.\d+$/;
/** feedback livre, mas com teto — não é campo de romance. */
const FEEDBACK_MAX = 4000;

export function safeProjectName(project) {
  const raw = String(project ?? '').trim();
  if (!raw) throw new Error('parâmetro `dir` (projeto) é obrigatório');
  if (!PROJECT_RE.test(raw) || raw.includes('..')) throw new Error(`nome de projeto inválido: ${raw}`);
  return raw;
}

export function safeBeatId(id) {
  const raw = String(id ?? '').trim();
  if (!BEAT_ID_RE.test(raw)) throw new Error(`id de beat inválido: ${id} (esperado "chunk.posição", ex. "1.3")`);
  return raw;
}

export function reviewRoot(root) {
  return join(resolve(root), REVIEW_DIRNAME);
}
export function reviewPath(root, project) {
  return join(reviewRoot(root), `${safeProjectName(project)}.json`);
}
export function digestPath(root, project) {
  return join(reviewRoot(root), `${safeProjectName(project)}.md`);
}

/** Caminho relativo à raiz do repo, sempre com `/`. */
export function relFromRoot(root, abs) {
  return resolve(abs).slice(resolve(root).length + 1).split(sep).join('/');
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeAtomic(file, text) {
  ensureDir(join(file, '..'));
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, text, 'utf8');
  renameSync(tmp, file);
  return file;
}

function writeJsonAtomic(file, data) {
  return writeAtomic(file, `${JSON.stringify(data, null, 2)}\n`);
}

function nowIso() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// leitura / escrita
// ---------------------------------------------------------------------------

export function emptyReview(project) {
  return {
    version: REVIEW_VERSION,
    project: safeProjectName(project),
    updatedAt: nowIso(),
    submittedAt: null,
    beats: {},
  };
}

/** Lê `review/<projeto>.json`. Inexistente = nada revisado ainda. */
export function readReview(root, project) {
  const file = reviewPath(root, project);
  if (!existsSync(file)) return emptyReview(project);
  let data;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`review/${safeProjectName(project)}.json ilegível (${err.message})`);
  }
  data.version ??= REVIEW_VERSION;
  data.beats ??= {};
  data.submittedAt ??= null;
  return data;
}

export function writeReview(root, review) {
  review.version = REVIEW_VERSION;
  review.updatedAt = nowIso();
  return writeJsonAtomic(reviewPath(root, review.project), review);
}

/**
 * Registra a decisão de UM beat. Esta é a única porta de escrita — nenhum
 * beat entra em `beats{}` sem `decision` válida.
 *
 * @param {string} root
 * @param {string} project
 * @param {{beatId:string, position?:number, name?:string,
 *          decision:'approved'|'rejected', feedback?:string}} input
 */
export function recordBeatReview(root, project, input) {
  const proj = safeProjectName(project);
  const beatId = safeBeatId(input.beatId);
  const decision = String(input.decision ?? '').trim();
  if (!DECISIONS.includes(decision)) {
    throw new Error(`decisão inválida: ${input.decision} — use ${DECISIONS.join(' | ')}`);
  }
  const feedback = String(input.feedback ?? '').trim().slice(0, FEEDBACK_MAX);

  const review = readReview(root, proj);
  review.beats[beatId] = {
    beatId,
    position: Number.isFinite(input.position) ? input.position : (review.beats[beatId]?.position ?? null),
    name: input.name ?? review.beats[beatId]?.name ?? null,
    decision,
    feedback,
    decidedAt: nowIso(),
  };
  writeReview(root, review);
  return review;
}

/** Só grava o feedback, sem mudar (ou exigir) uma decisão — permite anotar um beat "pendente". */
export function recordBeatFeedback(root, project, input) {
  const proj = safeProjectName(project);
  const beatId = safeBeatId(input.beatId);
  const feedback = String(input.feedback ?? '').trim().slice(0, FEEDBACK_MAX);

  const review = readReview(root, proj);
  const prev = review.beats[beatId];
  if (!prev && !feedback) return review; // nada a gravar
  review.beats[beatId] = {
    beatId,
    position: Number.isFinite(input.position) ? input.position : (prev?.position ?? null),
    name: input.name ?? prev?.name ?? null,
    decision: prev?.decision ?? null,
    feedback,
    decidedAt: nowIso(),
  };
  if (!review.beats[beatId].decision && !feedback) delete review.beats[beatId];
  writeReview(root, review);
  return review;
}

/** Volta um beat a "pendente" — remove a entrada inteira (decisão + feedback). */
export function clearBeatReview(root, project, beatId) {
  const proj = safeProjectName(project);
  const id = safeBeatId(beatId);
  const review = readReview(root, proj);
  delete review.beats[id];
  writeReview(root, review);
  return review;
}

export function reviewCounts(review) {
  const vals = Object.values(review.beats ?? {});
  return {
    approved: vals.filter((b) => b.decision === 'approved').length,
    rejected: vals.filter((b) => b.decision === 'rejected').length,
    withFeedback: vals.filter((b) => (b.feedback ?? '').length > 0).length,
    total: vals.length,
  };
}

/**
 * "Enviar" — carimba `submittedAt` e escreve o digest em prosa
 * (`review/<projeto>.md`), pensado para o Claude ler na próxima sessão.
 * Idempotente: pode ser chamado de novo depois de decisões novas.
 */
export function submitReview(root, project, meta = {}) {
  const proj = safeProjectName(project);
  const review = readReview(root, proj);
  review.submittedAt = nowIso();
  writeReview(root, review);

  const counts = reviewCounts(review);
  const beats = Object.values(review.beats).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const rejected = beats.filter((b) => b.decision === 'rejected');
  const approved = beats.filter((b) => b.decision === 'approved');
  const feedbackOnly = beats.filter((b) => !b.decision && b.feedback);

  const lines = [];
  lines.push(`# Revisão de beats — ${proj}`);
  lines.push('');
  lines.push(`Enviada em ${review.submittedAt}. ${counts.approved} aprovados, ${counts.rejected} rejeitados` +
    (counts.total ? `, ${counts.total} beats revisados no total.` : ', nenhum beat revisado ainda.'));
  lines.push('');
  if (rejected.length) {
    lines.push('## Rejeitados — iterar nestes');
    lines.push('');
    for (const b of rejected) {
      lines.push(`- **Beat ${b.position ?? '?'}** (\`${b.beatId}\`) — ${b.name ?? 'sem nome'}`);
      lines.push(`  ${b.feedback ? b.feedback : '_sem feedback escrito_'}`);
    }
    lines.push('');
  }
  if (approved.length) {
    lines.push('## Aprovados');
    lines.push('');
    for (const b of approved) {
      lines.push(`- Beat ${b.position ?? '?'} (\`${b.beatId}\`) — ${b.name ?? 'sem nome'}` +
        (b.feedback ? ` — _${b.feedback}_` : ''));
    }
    lines.push('');
  }
  if (feedbackOnly.length) {
    lines.push('## Feedback sem decisão');
    lines.push('');
    for (const b of feedbackOnly) {
      lines.push(`- Beat ${b.position ?? '?'} (\`${b.beatId}\`) — ${b.name ?? 'sem nome'}: ${b.feedback}`);
    }
    lines.push('');
  }
  if (!beats.length) {
    lines.push('_Nenhum beat foi aprovado, rejeitado ou recebeu feedback antes de enviar._');
    lines.push('');
  }
  if (meta.note) {
    lines.push('## Nota de quem enviou');
    lines.push('');
    lines.push(meta.note);
    lines.push('');
  }

  writeAtomic(digestPath(root, proj), `${lines.join('\n')}\n`);

  return { review, counts, digestPath: digestPath(root, proj) };
}

export function listReviewedProjects(root) {
  const dir = reviewRoot(root);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith('.json'))
    .map((n) => n.slice(0, -5))
    .sort();
}
