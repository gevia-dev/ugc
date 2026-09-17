#!/usr/bin/env node
/**
 * review-api.mjs — rotas de aprovar/rejeitar beat com feedback, penduradas no
 * `server.mjs` da parte 2 pelo ponto de extensão `route()`. O dispatcher não
 * foi tocado (mesmo padrão de `assets-api.mjs`).
 *
 * Zero dependência: só `node:` builtins. Node 22+.
 *
 *   GET  /api/review?dir=<projeto>            -> estado de revisão do projeto
 *   POST /api/review            (JSON)        -> aprova/rejeita UM beat (+ feedback)
 *   POST /api/review/clear      (JSON)        -> volta um beat a "pendente"
 *   POST /api/review/submit     (JSON)        -> carimba envio + escreve o digest .md
 */

import { existsSync } from 'node:fs';
import { parseProject } from './beats.mjs';
import { getRoot, readJsonBody, route, safeProjectDir, sendJson } from './server.mjs';
import {
  DECISIONS,
  clearBeatReview,
  readReview,
  recordBeatFeedback,
  recordBeatReview,
  relFromRoot,
  reviewCounts,
  reviewPath,
  safeBeatId,
  submitReview,
} from './review.mjs';

/**
 * Confere que o beat existe DE VERDADE no projeto — não confiamos só no
 * formato do id. `parseProject` (beats.mjs) não carrega `position`/`total`
 * (isso só existe na serialização pública do server.mjs), então calculamos
 * aqui pelo índice — sem isso o review guarda `position: null`.
 */
function assertBeatExists(dir, beatId) {
  const abs = safeProjectDir(dir);
  const project = parseProject(abs);
  const idx = project.beats.findIndex((b) => b.id === beatId);
  if (idx < 0) throw new Error(`beat ${beatId} não encontrado em ${dir}`);
  const beat = project.beats[idx];
  return { ...beat, position: idx + 1, total: project.beats.length };
}

function publicState(root, dir) {
  const review = readReview(root, dir);
  return {
    ok: true,
    path: relFromRoot(root, reviewPath(root, dir)),
    absolutePath: reviewPath(root, dir),
    exists: existsSync(reviewPath(root, dir)),
    counts: reviewCounts(review),
    review,
  };
}

// ---------------------------------------------------------------------------
// GET /api/review?dir=<projeto>
// ---------------------------------------------------------------------------

route('GET', '/api/review', (req, res, url) => {
  const root = getRoot();
  const dir = url.searchParams.get('dir');
  safeProjectDir(dir);
  sendJson(res, 200, publicState(root, dir));
});

// ---------------------------------------------------------------------------
// POST /api/review  (JSON) — {dir, beatId, decision?, feedback?}
//
// `decision` presente ('approved'|'rejected') -> recordBeatReview (decide).
// `decision` ausente, só `feedback`           -> recordBeatFeedback (anota sem decidir).
// ---------------------------------------------------------------------------

route('POST', '/api/review', async (req, res) => {
  const root = getRoot();
  const body = await readJsonBody(req);
  const dir = body.dir;
  safeProjectDir(dir);
  const beatId = safeBeatId(body.beatId);
  const beat = assertBeatExists(dir, beatId);

  let review;
  if (body.decision != null && body.decision !== '') {
    if (!DECISIONS.includes(String(body.decision))) {
      throw new Error(`decisão inválida: ${body.decision} — use ${DECISIONS.join(' | ')}`);
    }
    review = recordBeatReview(root, dir, {
      beatId,
      position: beat.position,
      name: beat.name,
      decision: body.decision,
      feedback: body.feedback,
    });
  } else {
    review = recordBeatFeedback(root, dir, {
      beatId,
      position: beat.position,
      name: beat.name,
      feedback: body.feedback,
    });
  }

  sendJson(res, 200, {
    ok: true,
    path: relFromRoot(root, reviewPath(root, dir)),
    counts: reviewCounts(review),
    beat: review.beats[beatId] ?? null,
    review,
  });
});

// ---------------------------------------------------------------------------
// POST /api/review/clear  (JSON) — {dir, beatId} -> volta a "pendente"
// ---------------------------------------------------------------------------

route('POST', '/api/review/clear', async (req, res) => {
  const root = getRoot();
  const body = await readJsonBody(req);
  const dir = body.dir;
  safeProjectDir(dir);
  const beatId = safeBeatId(body.beatId);
  const review = clearBeatReview(root, dir, beatId);
  sendJson(res, 200, {
    ok: true,
    path: relFromRoot(root, reviewPath(root, dir)),
    counts: reviewCounts(review),
    review,
  });
});

// ---------------------------------------------------------------------------
// POST /api/review/submit  (JSON) — {dir, note?}
// O botão "Enviar" do header: carimba submittedAt + escreve o digest .md.
// ---------------------------------------------------------------------------

route('POST', '/api/review/submit', async (req, res) => {
  const root = getRoot();
  const body = await readJsonBody(req);
  const dir = body.dir;
  safeProjectDir(dir);
  const { review, counts, digestPath: dpath } = submitReview(root, dir, { note: body.note });
  sendJson(res, 200, {
    ok: true,
    counts,
    submittedAt: review.submittedAt,
    digestPath: relFromRoot(root, dpath),
    absoluteDigestPath: dpath,
    review,
  });
});
