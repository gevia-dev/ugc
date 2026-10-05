/* ===========================================================================
   common.js — utilidades compartilhadas pelas páginas da skill video-workflow
   (home `projects.html`, beats `ui.html`, assets `assets.html`).

   Zero dependência, sem build. Expõe `window.VW`:
     VW.api, VW.esc, VW.fmt*, VW.STAGES, VW.stageText(p), VW.loadOverview()
     VW.fillProjectSelect(select, {dirs, overview, current})
     VW.renderMarkdown(md)            — Markdown -> HTML seguro (tudo escapado)
     VW.doc.open({dir, title, …})     — gaveta de leitura: COPY.md · falas · REFS.md · Imagens
       A aba Imagens (`tab: 'imagens'`) é a galeria de `seedance-…/references/`
       (GET /api/refs): refs geradas, esperadas do REFS.md ainda não geradas,
       guias da fonte e rascunhos; relê a cada 10 s enquanto a gaveta está aberta,
       marca "nova" o que chegou e abre cada imagem num lightbox (← → Esc).

   Usa os mesmos tokens de cor (`--primary`, `--border`, …) que as páginas já
   definem em :root. Nada aqui grava em disco: só GET.
   =========================================================================== */
(function () {
  'use strict';

  const VW = {};

  /* ------------------------------------------------------------- básicos */
  VW.esc = function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };

  VW.api = function api(path, options) {
    return fetch(path, options).then(async (r) => {
      const data = await r.json().catch(() => ({ ok: false, error: 'resposta não-JSON' }));
      if (!r.ok || data.ok === false) throw new Error(data.error || ('erro ' + r.status));
      return data;
    });
  };

  VW.safeUrl = function safeUrl(url) {
    return /^https?:\/\//i.test(String(url || '')) ? String(url) : null;
  };

  /* --------------------------------------------------------------- datas */
  const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  /** "2026-10-09" -> número do dia (UTC), para comparar sem fuso. */
  VW.dayNumber = function dayNumber(ymd) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || ''));
    if (!m) return null;
    return Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000);
  };
  VW.todayNumber = function todayNumber() {
    const d = new Date();
    return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  };
  VW.dayParts = function dayParts(n) {
    const d = new Date(n * 86400000);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay() };
  };
  /** "qui, 09 out" */
  VW.fmtDate = function fmtDate(ymd, withWeekday = true) {
    const n = VW.dayNumber(ymd);
    if (n == null) return '';
    const p = VW.dayParts(n);
    return (withWeekday ? WEEKDAYS[p.wd] + ', ' : '') + String(p.d).padStart(2, '0') + ' ' + MONTHS[p.m];
  };
  VW.MONTHS = MONTHS;
  VW.WEEKDAYS = WEEKDAYS;
  /** "hoje" · "amanhã" · "ontem" · "em 4 dias" · "há 2 dias" */
  VW.relDay = function relDay(ymd) {
    const n = VW.dayNumber(ymd);
    if (n == null) return '';
    const diff = n - VW.todayNumber();
    if (diff === 0) return 'hoje';
    if (diff === 1) return 'amanhã';
    if (diff === -1) return 'ontem';
    return diff > 0 ? 'em ' + diff + ' dias' : 'há ' + (-diff) + ' dias';
  };
  /** "há 5 min" para um ISO timestamp */
  VW.fmtAgo = function fmtAgo(isoTs) {
    const t = Date.parse(isoTs || '');
    if (!Number.isFinite(t)) return '';
    const s = Math.max(0, Math.round((Date.now() - t) / 1000));
    if (s < 45) return 'agora';
    const m = Math.round(s / 60);
    if (m < 60) return 'há ' + m + ' min';
    const h = Math.round(m / 60);
    if (h < 24) return 'há ' + h + ' h';
    const d = Math.round(h / 24);
    if (d < 30) return 'há ' + d + (d === 1 ? ' dia' : ' dias');
    const dt = new Date(t);
    return String(dt.getDate()).padStart(2, '0') + ' ' + MONTHS[dt.getMonth()] + ' ' + dt.getFullYear();
  };
  VW.fmtStamp = function fmtStamp(isoTs) {
    const t = Date.parse(isoTs || '');
    if (!Number.isFinite(t)) return '';
    const d = new Date(t);
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + ' ' +
      String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  VW.fmtSec = function fmtSec(s) {
    if (s == null || !Number.isFinite(s)) return '';
    return (Math.round(s * 10) / 10).toFixed(1).replace('.', ',') + 's';
  };
  VW.plural = function plural(n, one, many) {
    return n + ' ' + (n === 1 ? one : many);
  };

  /* -------------------------------------------------------------- pilares */
  // Cores dos pilares de funil do planejamento da MegaG (docs/pdf-src/build-edu.mjs).
  const PILLARS = [
    { match: /atra/i, color: '#1f7a4d' },
    { match: /confian/i, color: '#9a6a12' },
    { match: /marca|cultura/i, color: '#35568a' },
    { match: /convert/i, color: '#9b2c3a' },
  ];
  VW.pillarColor = function pillarColor(name) {
    const hit = PILLARS.find((p) => p.match.test(String(name || '')));
    return hit ? hit.color : '#6b6760';
  };

  /* ------------------------------------------------------------- estágios */
  VW.STAGES = [
    { key: 'prep', label: 'Em andamento', short: 'andamento' },
    { key: 'review', label: 'Revisar', short: 'revisar' },
    { key: 'iterate', label: 'Com rejeitados', short: 'rejeitados' },
    { key: 'assets', label: 'Decidir assets', short: 'assets' },
    { key: 'ready', label: 'Pronto p/ gerar', short: 'prontos' },
    { key: 'final', label: 'Vídeo final', short: 'finais' },
  ];
  VW.STEP_LABELS = { teardown: 'Teardown', prompts: 'Prompts', copy: 'Copy', beats: 'Beats', assets: 'Assets', video: 'Vídeo' };

  /** Texto do selo de status de um projeto do /api/overview. */
  VW.stageText = function stageText(p) {
    const r = p.review || {};
    switch (p.stage) {
      case 'prep':
        if (p.prompts && !p.prompts.beats) return 'Prompts em escrita';
        if (p.teardown && p.teardown.exists && !p.teardown.doc) return 'Teardown em andamento';
        if (p.teardown && p.teardown.doc) return 'Aguardando prompts';
        return 'Sem prompts';
      case 'review':
        return (r.approved + r.rejected) ? 'Revisando · ' + r.approved + '/' + r.total : 'Revisar beats';
      case 'iterate':
        return VW.plural(r.rejected, 'beat rejeitado', 'beats rejeitados');
      case 'assets':
        return 'Decidir assets';
      case 'ready':
        return 'Pronto p/ gerar';
      case 'final':
        return 'Vídeo final';
      default:
        return p.stage || '';
    }
  };

  /** "#8 · Título" (ou só o título / slug). */
  VW.projectLabel = function projectLabel(p) {
    const order = p.meta && p.meta.order != null ? '#' + p.meta.order + ' · ' : '';
    return order + (p.title || p.slug || p.dir);
  };

  /* -------------------------------------------------------------- overview */
  let overviewPromise = null;
  VW.loadOverview = function loadOverview(force) {
    if (!overviewPromise || force) {
      overviewPromise = VW.api('/api/overview').catch((err) => {
        overviewPromise = null;
        throw err;
      });
    }
    return overviewPromise;
  };
  VW.findByDir = function findByDir(overview, dir) {
    return overview && overview.projects ? overview.projects.find((p) => p.dir === dir) || null : null;
  };

  /**
   * Preenche o seletor de projeto das páginas de beats/assets: títulos humanos,
   * agrupados por campanha, arquivados escondidos (menos o atual).
   * `dirs` = pastas válidas para a página (as do /api/projects).
   */
  VW.fillProjectSelect = function fillProjectSelect(select, { dirs, overview, current }) {
    const byDir = new Map(((overview && overview.projects) || []).map((p) => [p.dir, p]));
    const items = dirs.map((dir) => {
      const p = byDir.get(dir);
      return {
        dir,
        label: p ? VW.projectLabel(p) : dir,
        campaign: p && p.meta.campaign ? p.meta.campaign : 'Outros',
        archived: Boolean(p && p.archived),
        order: p && p.meta.order != null ? p.meta.order : Infinity,
        date: p && p.meta.publishDate ? p.meta.publishDate : '9999',
      };
    }).filter((it) => !it.archived || it.dir === current);

    const groups = new Map();
    for (const it of items) {
      if (!groups.has(it.campaign)) groups.set(it.campaign, []);
      groups.get(it.campaign).push(it);
    }
    const names = [...groups.keys()].sort((a, b) => (a === 'Outros') - (b === 'Outros') || a.localeCompare(b, 'pt-BR'));
    select.innerHTML = names.map((name) => {
      const list = groups.get(name).sort((a, b) => a.order - b.order || a.date.localeCompare(b.date) || a.label.localeCompare(b.label, 'pt-BR'));
      return '<optgroup label="' + VW.esc(name) + '">' + list.map((it) =>
        '<option value="' + VW.esc(it.dir) + '" title="' + VW.esc(it.dir) + '">' +
        VW.esc(it.label + (it.archived ? ' (arquivado)' : '')) + '</option>').join('') + '</optgroup>';
    }).join('');
    if (current) select.value = current;
  };

  /* -------------------------------------------------------------- markdown
     Subconjunto suficiente para COPY.md/REFS.md: títulos, parágrafos (quebra de
     linha preservada), listas (aninhadas, com [ ] / [x]), citações, tabelas,
     código, hr, **negrito**, *itálico*, ~~riscado~~, `código`, links http(s).
     Todo texto é escapado ANTES de virar HTML; imagens nunca são carregadas. */

  const LIST_RE = /^(\s*)([-*+]|\d{1,3}[.)])\s+(.*)$/;
  const FENCE_RE = /^\s*(```+|~~~+)/;
  const HEADING_RE = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
  const HR_RE = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
  const TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

  function isBlank(line) {
    return line == null || /^\s*$/.test(line);
  }
  function indentOf(line) {
    const m = /^[ \t]*/.exec(line);
    return m ? m[0].replace(/\t/g, '    ').length : 0;
  }
  function splitRow(line) {
    let s = line.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
    return s.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
  }
  function startsBlock(line, next) {
    return FENCE_RE.test(line) || HEADING_RE.test(line) || HR_RE.test(line) || /^\s*>/.test(line) ||
      LIST_RE.test(line) || (line.includes('|') && next != null && TABLE_SEP_RE.test(next));
  }

  function inline(text) {
    const tokens = [];
    const keep = (html) => '\u0000' + (tokens.push(html) - 1) + '\u0000';
    let s = String(text);
    // código primeiro: nada dentro dele é formatado
    s = s.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, __, code) => keep('<code>' + VW.esc(code.trim()) + '</code>'));
    // imagens: nunca carregadas, viram texto
    s = s.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (_, alt) => keep('<span class="vw-md-img">[imagem' + (alt ? ': ' + VW.esc(alt) : '') + ']</span>'));
    // links markdown
    s = s.replace(/\[([^\]]+)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g, (whole, label, url) => {
      const safe = VW.safeUrl(url);
      return safe ? keep('<a href="' + VW.esc(safe) + '" target="_blank" rel="noopener noreferrer">' + inlineFormat(VW.esc(label)) + '</a>') : whole;
    });
    // URL solta
    s = s.replace(/\bhttps?:\/\/[^\s<>()"']+[^\s<>()"'.,;:!?]/g, (url) => keep('<a href="' + VW.esc(url) + '" target="_blank" rel="noopener noreferrer">' + VW.esc(url) + '</a>'));
    s = inlineFormat(VW.esc(s));
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => tokens[Number(i)]);
  }
  function inlineFormat(s) {
    return s
      .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
      .replace(/__(?=\S)([\s\S]*?\S)__/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*(?=\S)([^*]*?\S)\*(?![*\w])/g, '$1<em>$2</em>')
      .replace(/(^|[^\w])_(?=\S)([^_]*?\S)_(?!\w)/g, '$1<em>$2</em>')
      .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>');
  }

  function parseList(lines, start) {
    const base = indentOf(lines[start]);
    const ordered = /^\s*\d/.test(lines[start]);
    const firstNum = ordered ? parseInt(lines[start].trim(), 10) : 1;
    const items = [];
    let i = start;
    while (i < lines.length) {
      const line = lines[i];
      if (isBlank(line)) {
        let j = i + 1;
        while (j < lines.length && isBlank(lines[j])) j += 1;
        if (j < lines.length && indentOf(lines[j]) >= base && (LIST_RE.test(lines[j]) || indentOf(lines[j]) > base)) {
          if (items.length) items[items.length - 1].loose = true;
          i = j;
          continue;
        }
        break;
      }
      const ind = indentOf(line);
      const m = LIST_RE.exec(line);
      if (m && ind <= base + 1 && ind >= base - 1) {
        items.push({ lines: [m[3]], sub: [] });
        i += 1;
        continue;
      }
      if (ind > base + 1 && items.length) {
        // conteúdo aninhado: tudo que estiver mais indentado que o item
        const sub = [];
        while (i < lines.length && (isBlank(lines[i]) || indentOf(lines[i]) > base + 1)) {
          if (isBlank(lines[i])) {
            let j = i + 1;
            while (j < lines.length && isBlank(lines[j])) j += 1;
            if (j >= lines.length || indentOf(lines[j]) <= base + 1) break;
          }
          sub.push(lines[i]);
          i += 1;
        }
        const minInd = Math.min(...sub.filter((l) => !isBlank(l)).map(indentOf));
        items[items.length - 1].sub.push(sub.map((l) => (isBlank(l) ? '' : l.replace(/^[ \t]*/, (w) => ' '.repeat(Math.max(0, w.replace(/\t/g, '    ').length - minInd))))).join('\n'));
        continue;
      }
      if (!m && ind <= base + 1 && items.length && !startsBlock(line, lines[i + 1])) {
        items[items.length - 1].lines.push(line.trim()); // continuação preguiçosa
        i += 1;
        continue;
      }
      break;
    }
    const tag = ordered ? 'ol' : 'ul';
    const startAttr = ordered && firstNum !== 1 ? ' start="' + firstNum + '"' : '';
    const html = '<' + tag + startAttr + '>' + items.map((it) => {
      let first = it.lines.join('\n');
      let cls = '';
      const box = /^\[( |x|X)\]\s+/.exec(first);
      if (box) {
        cls = ' class="vw-task"';
        first = first.slice(box[0].length);
        first = (box[1] === ' ' ? '<span class="vw-box" aria-hidden="true"></span>' : '<span class="vw-box is-done" aria-hidden="true"></span>') + '\u0001' + first;
      }
      const parts = first.split('\u0001');
      const body = parts.length === 2 ? parts[0] + inlineLines(parts[1]) : inlineLines(first);
      return '<li' + cls + '>' + body + it.sub.map((s) => renderMarkdown(s)).join('') + '</li>';
    }).join('') + '</' + tag + '>';
    return { html, next: i };
  }
  function inlineLines(text) {
    return String(text).split('\n').map(inline).join('<br>');
  }

  function renderMarkdown(src) {
    const lines = String(src ?? '').replace(/\r\n?/g, '\n').split('\n');
    let html = '';
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (isBlank(line)) { i += 1; continue; }
      let m;
      if ((m = FENCE_RE.exec(line))) {
        const fence = m[1];
        const buf = [];
        i += 1;
        while (i < lines.length && !lines[i].trim().startsWith(fence)) { buf.push(lines[i]); i += 1; }
        i += 1;
        html += '<pre><code>' + VW.esc(buf.join('\n')) + '</code></pre>';
        continue;
      }
      if ((m = HEADING_RE.exec(line))) {
        const lvl = m[1].length;
        html += '<h' + lvl + '>' + inline(m[2]) + '</h' + lvl + '>';
        i += 1;
        continue;
      }
      if (HR_RE.test(line)) { html += '<hr>'; i += 1; continue; }
      if (line.includes('|') && TABLE_SEP_RE.test(lines[i + 1] || '')) {
        const head = splitRow(line);
        const aligns = splitRow(lines[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : ''));
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes('|') && !isBlank(lines[i])) { rows.push(splitRow(lines[i])); i += 1; }
        const cell = (tagName, c, k) => '<' + tagName + (aligns[k] ? ' style="text-align:' + aligns[k] + '"' : '') + '>' + inline(c) + '</' + tagName + '>';
        html += '<div class="vw-table"><table><thead><tr>' + head.map((c, k) => cell('th', c, k)).join('') + '</tr></thead><tbody>' +
          rows.map((r) => '<tr>' + head.map((_, k) => cell('td', r[k] ?? '', k)).join('') + '</tr>').join('') +
          '</tbody></table></div>';
        continue;
      }
      if (/^\s*>/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i += 1; }
        html += '<blockquote>' + renderMarkdown(buf.join('\n')) + '</blockquote>';
        continue;
      }
      if (LIST_RE.test(line)) {
        const res = parseList(lines, i);
        html += res.html;
        i = Math.max(res.next, i + 1);
        continue;
      }
      const buf = [line];
      i += 1;
      while (i < lines.length && !isBlank(lines[i]) && !startsBlock(lines[i], lines[i + 1])) { buf.push(lines[i]); i += 1; }
      html += '<p>' + buf.map((l) => inline(l.trim())).join('<br>') + '</p>';
    }
    return html;
  }
  VW.renderMarkdown = renderMarkdown;

  /* ---------------------------------------------------------------- gaveta
     Leitura rápida de um projeto: COPY.md (primeiro passo da revisão), as
     FALAs que estão de fato nos PROMPT_n, e o REFS.md. Só leitura. */

  const DRAWER_CSS = `
/* a gaveta, o lightbox e o CTA têm display próprio: sem isto o atributo hidden não esconde
   (a home não tem a regra global [hidden] que ui.html e assets.html têm) */
.vw-backdrop[hidden], .vw-drawer[hidden], .vw-lb[hidden], .vw-cta[hidden], .vw-lb-loading[hidden] { display: none !important; }
.vw-backdrop { position: fixed; inset: 0; z-index: 90; background: hsl(30 10% 12% / 0.34); backdrop-filter: blur(2px);
  opacity: 0; transition: opacity .18s ease; }
.vw-backdrop.is-open { opacity: 1; }
.vw-drawer { position: fixed; top: 0; right: 0; bottom: 0; z-index: 91; width: min(720px, 100vw);
  display: flex; flex-direction: column; background: hsl(30 25% 99%);
  border-left: 1px solid hsl(var(--border, 0 0% 90%)); box-shadow: -24px 0 60px -20px hsl(240 20% 10% / .28);
  transform: translateX(24px); opacity: 0; transition: transform .2s cubic-bezier(.2,.8,.2,1), opacity .18s ease;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: hsl(0 0% 15%); font-size: 14px; line-height: 1.5; }
.vw-drawer.is-open { transform: none; opacity: 1; }
.vw-dh { flex: none; display: flex; align-items: flex-start; gap: 12px; padding: 18px 22px 12px; }
.vw-dh-text { min-width: 0; flex: 1; }
.vw-dh-kicker { font-size: 11.5px; color: hsl(0 0% 40%); letter-spacing: .01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vw-dh h2 { margin: 3px 0 0; font-size: 19px; line-height: 1.25; font-weight: 700; letter-spacing: -.02em; }
.vw-dh-dir { margin-top: 3px; font: 11px/1.3 ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace; color: hsl(0 0% 45%); }
.vw-x { flex: none; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px;
  border: 1px solid hsl(0 0% 90%); background: #fff; color: hsl(0 0% 30%); cursor: pointer; font-size: 18px; line-height: 1; }
.vw-x:hover { border-color: hsl(13 99% 62% / .5); color: hsl(13 99% 45%); }
.vw-x:focus { outline: none; }
.vw-x:focus-visible { outline: 2px solid hsl(13 99% 62% / .55); outline-offset: 2px; }
.vw-dtabs { flex: none; display: flex; gap: 4px; padding: 0 22px; border-bottom: 1px solid hsl(0 0% 90%); overflow-x: auto; }
.vw-dtab { font: inherit; font-size: 13px; font-weight: 600; padding: 9px 12px 10px; border: 0; background: none; cursor: pointer;
  color: hsl(0 0% 40%); border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; display: inline-flex; align-items: center; gap: 7px; }
.vw-dtab:hover { color: hsl(0 0% 15%); }
.vw-dtab.is-active { color: hsl(13 99% 45%); border-bottom-color: hsl(13 99% 62%); }
.vw-dtab .vw-pill { font-size: 10.5px; font-weight: 650; padding: 1px 7px; border-radius: 999px; background: hsl(0 0% 94%); color: hsl(0 0% 40%); }
.vw-dtab .vw-pill.is-missing { background: transparent; border: 1px dashed hsl(0 0% 80%); }
.vw-dbody { flex: 1; min-height: 0; overflow-y: auto; padding: 18px 26px 28px; scrollbar-width: thin; }
.vw-df { flex: none; display: flex; align-items: center; gap: 10px; padding: 12px 22px; border-top: 1px solid hsl(0 0% 90%); background: #fff; }
.vw-dpath { flex: 1; min-width: 0; font: 11px/1.3 ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace; color: hsl(0 0% 45%);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vw-cta { flex: none; display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 650; padding: 9px 15px; border-radius: 12px;
  background: hsl(13 99% 62%); color: #fff; border: 1px solid hsl(13 99% 52%); text-decoration: none; cursor: pointer; }
.vw-cta:hover { background: hsl(13 99% 55%); }
.vw-cta svg { width: 14px; height: 14px; }
.vw-empty { padding: 34px 18px; text-align: center; color: hsl(0 0% 40%); border: 1px dashed hsl(0 0% 86%); border-radius: 14px; background: hsl(0 0% 98%); font-size: 13px; }
.vw-empty strong { display: block; color: hsl(0 0% 20%); font-size: 14px; margin-bottom: 4px; }
.vw-loading { color: hsl(0 0% 45%); font-size: 13px; padding: 20px 0; }

/* documento */
.vw-md { max-width: 66ch; font-size: 15px; line-height: 1.62; color: hsl(0 0% 14%); }
.vw-md > :first-child { margin-top: 0; }
.vw-md h1 { font-size: 22px; line-height: 1.25; letter-spacing: -.02em; margin: 6px 0 14px; }
.vw-md h2 { font-size: 17px; letter-spacing: -.01em; margin: 26px 0 10px; padding-top: 14px; border-top: 1px solid hsl(0 0% 91%); }
.vw-md h3 { font-size: 15px; margin: 20px 0 8px; }
.vw-md h4, .vw-md h5, .vw-md h6 { font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: hsl(0 0% 35%); margin: 18px 0 6px; }
.vw-md p { margin: 0 0 12px; }
.vw-md ul, .vw-md ol { margin: 0 0 12px; padding-left: 22px; }
.vw-md li { margin: 3px 0; }
.vw-md li.vw-task { list-style: none; margin-left: -20px; }
.vw-box { display: inline-block; width: 13px; height: 13px; border: 1.5px solid hsl(0 0% 60%); border-radius: 3px; margin-right: 7px; vertical-align: -1px; }
.vw-box.is-done { background: hsl(142 50% 40%); border-color: hsl(142 50% 40%); }
.vw-md blockquote { margin: 0 0 14px; padding: 10px 16px; border-left: 3px solid hsl(13 99% 62% / .55); background: hsl(13 99% 62% / .06); border-radius: 0 12px 12px 0; }
.vw-md blockquote p:last-child { margin-bottom: 0; }
.vw-md code { font: 12.5px ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace; background: hsl(0 0% 94%); padding: 1px 5px; border-radius: 5px; }
.vw-md pre { background: hsl(30 10% 95%); padding: 12px 14px; border-radius: 12px; overflow-x: auto; }
.vw-md pre code { background: none; padding: 0; font-size: 12px; }
.vw-md hr { border: 0; border-top: 1px solid hsl(0 0% 88%); margin: 22px 0; }
.vw-md a { color: hsl(13 99% 42%); }
.vw-md .vw-md-img { color: hsl(0 0% 45%); font-style: italic; }
.vw-table { overflow-x: auto; margin: 0 0 14px; border: 1px solid hsl(0 0% 90%); border-radius: 12px; }
.vw-md table { border-collapse: collapse; width: 100%; font-size: 13.5px; }
.vw-md th, .vw-md td { text-align: left; vertical-align: top; padding: 8px 11px; border-bottom: 1px solid hsl(0 0% 92%); }
.vw-md th { background: hsl(30 15% 97%); font-size: 11.5px; text-transform: uppercase; letter-spacing: .05em; color: hsl(0 0% 35%); }
.vw-md tr:last-child td { border-bottom: 0; }

/* falas dos prompts */
.vw-falas-sum { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12px; color: hsl(0 0% 40%); margin-bottom: 14px; }
.vw-falas-sum b { color: hsl(0 0% 15%); font-weight: 650; }
.vw-chunk-h { font-size: 11px; font-weight: 650; letter-spacing: .02em; color: hsl(0 0% 45%);
  margin: 18px 0 8px; font-family: ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace; }
.vw-chunk-h:first-of-type { margin-top: 0; }
.vw-fala { display: grid; grid-template-columns: 54px 1fr; gap: 2px 12px; padding: 10px 0; border-bottom: 1px solid hsl(0 0% 92%); }
.vw-fala:last-child { border-bottom: 0; }
.vw-fala-n { grid-row: span 2; font-size: 11px; font-weight: 700; color: hsl(0 0% 45%); text-decoration: none; padding-top: 2px; }
.vw-fala-n em { display: block; font-style: normal; font-size: 20px; line-height: 1; color: hsl(13 99% 55%); letter-spacing: -.03em; }
a.vw-fala-n:hover em { text-decoration: underline; }
.vw-fala-meta { font-size: 11.5px; color: hsl(0 0% 45%); display: flex; gap: 8px; flex-wrap: wrap; align-items: baseline; }
.vw-fala-meta .vw-name { font-weight: 650; color: hsl(0 0% 25%); text-transform: uppercase; font-size: 10.5px; letter-spacing: .04em; }
.vw-fala-meta .vw-rate.is-tight { color: hsl(30 80% 34%); font-weight: 650; }
.vw-fala-text { font-size: 15px; line-height: 1.5; color: hsl(0 0% 12%); }
.vw-fala-text.is-none { color: hsl(0 0% 55%); font-style: italic; font-size: 13px; }
.vw-dtab .vw-pill.is-new { background: hsl(13 99% 62%); color: #fff; }
.vw-md .vw-hit, .vw-md tr.vw-hit td { background: hsl(45 100% 86%); transition: background 2.4s ease; }
.vw-md .vw-hit.is-fading, .vw-md tr.vw-hit.is-fading td { background: transparent; }

/* imagens de references/ */
.vw-img-sum { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; margin-bottom: 18px; font-size: 12.5px; color: hsl(0 0% 40%); }
.vw-img-sum b { color: hsl(0 0% 14%); font-weight: 680; }
.vw-prog { flex: 1 1 100%; display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.vw-prog-n { font-size: 26px; line-height: 1; font-weight: 760; letter-spacing: -.035em; color: hsl(0 0% 12%); white-space: nowrap; }
.vw-prog-n small { font-size: 15px; font-weight: 650; color: hsl(0 0% 50%); letter-spacing: -.01em; }
.vw-prog-txt { font-size: 13px; color: hsl(0 0% 35%); white-space: nowrap; }
.vw-prog-txt.is-done b { color: hsl(142 55% 30%); }
.vw-prog-bar { flex: 1; min-width: 60px; height: 6px; border-radius: 999px; background: hsl(30 8% 90%); overflow: hidden; }
.vw-prog-bar i { display: block; height: 100%; border-radius: inherit; background: hsl(142 50% 42%); transition: width .5s cubic-bezier(.2,.8,.2,1); }
.vw-newcount { font-weight: 650; color: hsl(13 99% 45%); }
.vw-live { margin-left: auto; display: inline-flex; align-items: center; gap: 7px; font-size: 11.5px; color: hsl(0 0% 45%); white-space: nowrap; }
.vw-live i { width: 7px; height: 7px; border-radius: 50%; background: hsl(142 60% 42%); animation: vwPing 2.4s ease-out infinite; }
.vw-live.is-loading i { background: hsl(38 92% 50%); animation: none; }
.vw-live.is-error { color: hsl(0 60% 40%); }
.vw-live.is-error i { background: hsl(0 84% 60%); animation: none; }
@keyframes vwPing { 0% { box-shadow: 0 0 0 0 hsl(142 60% 42% / .5); } 70%, 100% { box-shadow: 0 0 0 7px hsl(142 60% 42% / 0); } }
.vw-sec { margin: 0 0 24px; }
.vw-sec-h { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 8px; margin: 0 0 10px; font-size: 13.5px; font-weight: 700; color: hsl(0 0% 15%); letter-spacing: -.01em; }
.vw-sec-h .n { font-size: 11.5px; font-weight: 650; padding: 1px 7px; border-radius: 999px; background: hsl(0 0% 94%); color: hsl(0 0% 40%); }
.vw-sec-h .hint { font-size: 11.5px; font-weight: 500; color: hsl(0 0% 50%); letter-spacing: 0; }
details.vw-sec { border-top: 1px solid hsl(0 0% 91%); padding-top: 12px; }
details.vw-sec > summary { list-style: none; cursor: pointer; user-select: none; margin-bottom: 0; }
details.vw-sec > summary::-webkit-details-marker { display: none; }
details.vw-sec > summary::before { content: ''; width: 7px; height: 7px; flex: none; align-self: center; border: solid hsl(0 0% 45%); border-width: 0 1.6px 1.6px 0;
  transform: rotate(-45deg); transition: transform .15s; margin: 0 4px 0 2px; }
details.vw-sec[open] > summary::before { transform: rotate(45deg); }
details.vw-sec[open] > summary { margin-bottom: 10px; }
details.vw-sec > summary:hover { color: hsl(13 99% 45%); }
.vw-grp { font: 11px/1.3 ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace; color: hsl(0 0% 45%); margin: 14px 0 8px; }
.vw-grp:first-child { margin-top: 0; }
.vw-none { font-size: 13px; color: hsl(0 0% 45%); padding: 14px 16px; border: 1px dashed hsl(0 0% 86%); border-radius: 12px; background: hsl(0 0% 98.5%); }
.vw-none code { font: 11.5px ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace; }
.vw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(128px, 1fr)); gap: 14px 10px; }
.vw-tile { position: relative; min-width: 0; display: flex; flex-direction: column; gap: 5px; padding: 0; border: 0; background: none;
  font: inherit; color: inherit; text-align: left; cursor: pointer; }
.vw-tile:focus { outline: none; }
.vw-thumb { position: relative; display: block; aspect-ratio: 9 / 16; overflow: hidden; border-radius: 12px; border: 1px solid hsl(0 0% 88%);
  background: repeating-linear-gradient(135deg, hsl(30 12% 95%) 0 8px, hsl(30 12% 92%) 8px 16px);
  transition: border-color .15s, box-shadow .2s, transform .2s; }
.vw-thumb img { display: block; width: 100%; height: 100%; object-fit: cover; }
.vw-thumb.is-contain { background: hsl(30 8% 15%); }
.vw-thumb.is-contain img { object-fit: contain; }
.vw-thumb .vw-noimg { position: absolute; inset: 0; display: grid; place-items: center; font-size: 11px; color: hsl(0 0% 50%); }
.vw-tile:hover .vw-thumb { border-color: hsl(13 99% 62% / .55); box-shadow: 0 10px 22px -12px hsl(240 20% 10% / .4); transform: translateY(-1px); }
.vw-tile:focus-visible .vw-thumb { outline: 2px solid hsl(13 99% 62% / .7); outline-offset: 2px; }
.vw-tname { font: 11px/1.3 ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace; color: hsl(0 0% 18%); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vw-tmeta { margin-top: -3px; font-size: 11px; color: hsl(0 0% 46%); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vw-badge { position: absolute; top: 7px; left: 7px; font-size: 9.5px; font-weight: 750; letter-spacing: .06em; text-transform: uppercase;
  padding: 3px 7px; border-radius: 999px; background: hsl(13 99% 58%); color: #fff; box-shadow: 0 2px 8px -2px hsl(13 99% 35% / .6); }
.vw-ok { position: absolute; top: 7px; right: 7px; width: 19px; height: 19px; display: grid; place-items: center; border-radius: 50%;
  background: hsl(142 50% 38%); color: #fff; box-shadow: 0 1px 4px hsl(0 0% 0% / .25); }
.vw-ok.is-variant { background: hsl(38 85% 42%); }
.vw-ok svg { width: 11px; height: 11px; }
.vw-tile.is-fresh .vw-thumb { animation: vwFresh 1.8s cubic-bezier(.2,.8,.2,1); }
@keyframes vwFresh { 0% { opacity: 0; transform: scale(.94); } 25% { opacity: 1; transform: none; box-shadow: 0 0 0 4px hsl(13 99% 62% / .5); } 100% { box-shadow: 0 0 0 0 hsl(13 99% 62% / 0); } }
.vw-ph { aspect-ratio: 3 / 4; display: flex; flex-direction: column; gap: 6px; padding: 10px 10px 9px; background: hsl(30 30% 99%); border: 1.5px dashed hsl(0 0% 80%); }
.vw-tile-main { position: relative; min-width: 0; display: flex; flex-direction: column; gap: 5px; padding: 0; border: 0; background: none;
  font: inherit; color: inherit; text-align: left; cursor: pointer; }
.vw-tile-main:focus { outline: none; }
.vw-tile-main:focus-visible .vw-thumb { outline: 2px solid hsl(13 99% 62% / .7); outline-offset: 2px; }
.vw-tile-main:hover .vw-ph { border-color: hsl(13 99% 62% / .6); background: hsl(13 99% 62% / .04); }
.vw-badge.is-inline { position: static; align-self: center; margin-left: 2px; }
.vw-ph-cands { display: flex; align-items: flex-end; gap: 4px; }
.vw-ph-cands img { width: 30px; aspect-ratio: 9 / 16; object-fit: cover; border-radius: 4px; border: 1px solid hsl(0 0% 84%); background: hsl(0 0% 92%); }
.vw-ph-cands .more { font-size: 10px; font-weight: 650; color: hsl(0 0% 45%); }
.vw-cand { align-self: flex-start; margin-top: -3px; padding: 0; border: 0; background: none; font: inherit; font-size: 11px; font-weight: 650;
  color: hsl(13 99% 42%); cursor: pointer; text-align: left; }
.vw-cand:hover { text-decoration: underline; }
.vw-cand:focus { outline: none; }
.vw-cand:focus-visible { outline: 2px solid hsl(13 99% 62% / .7); outline-offset: 2px; border-radius: 4px; }
.vw-ph-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.vw-ph-tag { font-size: 9.5px; font-weight: 750; letter-spacing: .06em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; background: hsl(0 0% 92%); color: hsl(0 0% 32%); }
.vw-ph-tag.is-edit { background: hsl(215 60% 93%); color: hsl(215 50% 33%); }
.vw-ph-tag.is-opt { background: transparent; border: 1px dashed hsl(0 0% 72%); color: hsl(0 0% 42%); }
.vw-ph-note { font-size: 11.5px; line-height: 1.35; font-weight: 600; color: hsl(0 0% 25%); overflow-wrap: anywhere; }
.vw-ph-detail { flex: 1; min-height: 0; overflow: hidden; font-size: 11px; line-height: 1.38; color: hsl(0 0% 42%);
  -webkit-mask-image: linear-gradient(180deg, #000 72%, transparent); mask-image: linear-gradient(180deg, #000 72%, transparent); }
.vw-ph-foot { display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 650; color: hsl(0 0% 48%); }
.vw-ph-foot svg { width: 13px; height: 13px; flex: none; }

/* lightbox */
.vw-lb { position: fixed; inset: 0; z-index: 100; display: flex; flex-direction: column; background: hsl(30 10% 6% / .96); color: hsl(30 15% 95%);
  opacity: 0; transition: opacity .16s ease; font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.vw-lb.is-open { opacity: 1; }
.vw-lb-stage { position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; padding: 18px 72px; }
.vw-lb-img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px; box-shadow: 0 24px 70px -24px #000; background: hsl(30 8% 12%); }
.vw-lb-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; display: grid; place-items: center; padding: 0;
  border-radius: 50%; border: 1px solid hsl(0 0% 100% / .18); background: hsl(0 0% 100% / .08); color: #fff; cursor: pointer; }
.vw-lb-nav:hover:not([disabled]) { background: hsl(0 0% 100% / .18); }
.vw-lb-nav[disabled] { opacity: .22; cursor: default; }
.vw-lb-nav svg { width: 20px; height: 20px; }
.vw-lb-prev { left: 14px; } .vw-lb-next { right: 14px; }
.vw-lb-x { position: absolute; top: 12px; right: 14px; z-index: 2; width: 40px; height: 40px; display: grid; place-items: center; padding: 0;
  border-radius: 12px; border: 1px solid hsl(0 0% 100% / .2); background: hsl(0 0% 0% / .35); color: #fff; font-size: 22px; line-height: 1; cursor: pointer; }
.vw-lb-x:hover { background: hsl(0 0% 100% / .15); }
.vw-lb button:focus { outline: none; }
.vw-lb button:focus-visible, .vw-lb a:focus-visible { outline: 2px solid hsl(13 99% 62%); outline-offset: 2px; }
.vw-lb-loading { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); font-size: 11.5px; padding: 4px 11px; border-radius: 999px;
  background: hsl(0 0% 0% / .55); color: hsl(0 0% 100% / .8); white-space: nowrap; }
.vw-lb-bar { flex: none; display: flex; align-items: center; gap: 14px; padding: 12px 20px; border-top: 1px solid hsl(0 0% 100% / .1); background: hsl(30 10% 4% / .7); }
.vw-lb-meta { flex: 1; min-width: 0; }
.vw-lb-name { font: 600 13px/1.35 ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vw-lb-sub { display: flex; flex-wrap: wrap; gap: 2px 12px; margin-top: 3px; font-size: 12px; color: hsl(0 0% 100% / .62); }
.vw-lb-sub .is-ok { color: hsl(142 60% 65%); }
.vw-lb-sub .is-guide { color: hsl(38 90% 66%); }
.vw-lb-count { font: 600 12px ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace; color: hsl(0 0% 100% / .6); white-space: nowrap; }
.vw-lb-orig { font-size: 12.5px; font-weight: 600; color: #fff; text-decoration: none; padding: 7px 12px; border-radius: 10px;
  border: 1px solid hsl(0 0% 100% / .2); background: hsl(0 0% 100% / .06); white-space: nowrap; }
.vw-lb-orig:hover { background: hsl(0 0% 100% / .14); }

@media (max-width: 640px) {
  .vw-dh { padding: 14px 16px 10px; } .vw-dtabs { padding: 0 12px; } .vw-dbody { padding: 14px 16px 24px; } .vw-df { padding: 10px 16px; }
  .vw-dpath { display: none; } .vw-cta { flex: 1; justify-content: center; }
  .vw-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .vw-prog-n { font-size: 23px; }
  .vw-live { margin-left: 0; }
  .vw-lb-stage { padding: 60px 10px 72px; }
  .vw-lb-nav { top: auto; bottom: 12px; transform: none; }
  .vw-lb-prev { left: calc(50% - 56px); } .vw-lb-next { right: calc(50% - 56px); }
  .vw-lb-bar { flex-wrap: wrap; gap: 8px 12px; padding: 10px 14px 14px; }
  .vw-lb-meta { flex-basis: 100%; }
  .vw-lb-orig { margin-left: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .vw-drawer, .vw-backdrop, .vw-lb { transition: none; }
  .vw-tile.is-fresh .vw-thumb, .vw-live i { animation: none; }
}
`;

  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  const ICONS = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  };

  /** Abas da gaveta, na ordem. `imagens` = galeria de `references/` (GET /api/refs). */
  const TABS = ['copy', 'falas', 'refs', 'imagens'];
  /** A aba Imagens relê `references/` neste intervalo enquanto a gaveta está aberta. */
  const IMG_POLL_MS = 10000;
  /** Imagem com mtime mais novo que isso também ganha o selo "nova". */
  const IMG_RECENT_MS = 15 * 60 * 1000;

  const doc = {
    el: null, backdrop: null, opts: null, cache: new Map(), tab: 'copy', lastFocus: null, token: 0,
    imgs: new Map(), // dir -> { data, error, sig, loadedAt, loading, baseline, fresh, renderedAt }
    secOpen: { guides: false, drafts: false },
    lists: { refs: [], guides: [], drafts: [] },
    timer: null,
    lb: null,
  };

  VW.fmtBytes = function fmtBytes(n) {
    if (!Number.isFinite(n)) return '';
    if (n >= 1048576) return (n / 1048576).toFixed(1).replace('.', ',') + ' MB';
    return Math.max(1, Math.round(n / 1024)) + ' KB';
  };
  /** "14:32" se for hoje, senão "05/10 14:32". */
  VW.fmtWhen = function fmtWhen(ms) {
    if (!Number.isFinite(ms)) return '';
    const d = new Date(ms);
    const now = new Date();
    const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    return d.toDateString() === now.toDateString() ? hm : VW.fmtStamp(d.toISOString());
  };

  function ensureDrawer() {
    if (doc.el) return;
    const style = document.createElement('style');
    style.id = 'vw-common-style';
    style.textContent = DRAWER_CSS;
    document.head.appendChild(style);

    doc.backdrop = document.createElement('div');
    doc.backdrop.className = 'vw-backdrop';
    doc.backdrop.hidden = true;
    doc.backdrop.addEventListener('click', () => VW.doc.close());

    doc.el = document.createElement('aside');
    doc.el.className = 'vw-drawer';
    doc.el.hidden = true;
    doc.el.setAttribute('role', 'dialog');
    doc.el.setAttribute('aria-modal', 'true');
    doc.el.setAttribute('aria-labelledby', 'vwDocTitle');
    doc.el.innerHTML =
      '<header class="vw-dh"><div class="vw-dh-text"><div class="vw-dh-kicker" id="vwDocKicker"></div>' +
      '<h2 id="vwDocTitle"></h2><div class="vw-dh-dir" id="vwDocDir"></div></div>' +
      '<button class="vw-x" type="button" id="vwDocClose" aria-label="Fechar (Esc)">×</button></header>' +
      '<nav class="vw-dtabs" role="tablist" id="vwDocTabs"></nav>' +
      '<div class="vw-dbody" id="vwDocBody" tabindex="0"></div>' +
      '<footer class="vw-df"><span class="vw-dpath" id="vwDocPath"></span><a class="vw-cta" id="vwDocCta" hidden></a></footer>';
    document.body.appendChild(doc.backdrop);
    document.body.appendChild(doc.el);
    doc.el.querySelector('#vwDocClose').addEventListener('click', () => VW.doc.close());

    // Com a gaveta aberta, as teclas são dela: Esc fecha e nada vaza para a
    // página de baixo (as setas não trocam de beat por trás da gaveta).
    // Com o lightbox aberto por cima, Esc fecha só o lightbox e as setas trocam a imagem.
    window.addEventListener('keydown', (ev) => {
      if (lbIsOpen()) {
        if (ev.key === 'Escape') { ev.preventDefault(); closeLightbox(); }
        else if (ev.key === 'ArrowLeft') { ev.preventDefault(); stepLightbox(-1); }
        else if (ev.key === 'ArrowRight') { ev.preventDefault(); stepLightbox(1); }
        ev.stopPropagation();
        return;
      }
      if (!VW.doc.isOpen()) return;
      if (ev.key === 'Escape') { ev.preventDefault(); VW.doc.close(); }
      ev.stopPropagation();
    }, true);

    // voltou para a aba do navegador com a gaveta aberta: relê as imagens já
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && VW.doc.isOpen()) pollImages(true);
    });
  }

  function imgPill(dir) {
    const im = doc.imgs.get(dir);
    if (!im || (!im.data && !im.error)) return { pill: '…', missing: false, fresh: false };
    if (!im.data) return { pill: '!', missing: true, fresh: false };
    const c = im.data.counts;
    return {
      pill: c.expected ? c.generated + '/' + c.expected : String(c.refs),
      missing: !c.refs && !c.expected,
      fresh: Boolean(im.fresh && im.fresh.size),
    };
  }

  function setTabs() {
    const st = doc.cache.get(doc.opts.dir) || {};
    const ip = imgPill(doc.opts.dir);
    const tabs = [
      { key: 'copy', label: 'Copy', pill: st.copy ? (st.copy.exists ? 'COPY.md' : 'falta') : '…', missing: st.copy && !st.copy.exists },
      { key: 'falas', label: 'Falas nos prompts', pill: st.falas ? String(st.falas.withDialogue) : '…', missing: st.falas && !st.falas.beats.length },
      { key: 'refs', label: 'Refs', pill: st.refs ? (st.refs.exists ? 'REFS.md' : 'falta') : '…', missing: st.refs && !st.refs.exists },
      { key: 'imagens', label: 'Imagens', pill: ip.pill, missing: ip.missing, fresh: ip.fresh },
    ];
    const nav = doc.el.querySelector('#vwDocTabs');
    nav.innerHTML = tabs.map((t) =>
      '<button class="vw-dtab' + (doc.tab === t.key ? ' is-active' : '') + '" role="tab" type="button" aria-selected="' + (doc.tab === t.key) + '" data-tab="' + t.key + '">' +
      VW.esc(t.label) + ' <span class="vw-pill' + (t.missing ? ' is-missing' : '') + (t.fresh ? ' is-new' : '') + '">' + VW.esc(t.pill) + '</span></button>').join('');
    nav.querySelectorAll('.vw-dtab').forEach((b) => b.addEventListener('click', () => selectTab(b.dataset.tab)));
    // no celular a faixa de abas rola: a aba ativa (ex.: deep link `tab=imagens`) fica à vista
    const active = nav.querySelector('.vw-dtab.is-active');
    if (active && nav.scrollWidth > nav.clientWidth) {
      const nr = nav.getBoundingClientRect();
      const ar = active.getBoundingClientRect();
      if (ar.right > nr.right) nav.scrollLeft += ar.right - nr.right + 12;
      else if (ar.left < nr.left) nav.scrollLeft -= nr.left - ar.left + 12;
    }
  }

  function selectTab(key) {
    if (!TABS.includes(key) || doc.tab === key) return;
    doc.tab = key;
    renderDrawer();
    if (doc.opts && typeof doc.opts.onTab === 'function') doc.opts.onTab(key);
    if (key === 'imagens') pollImages(false);
  }

  /* ------------------------------------------------- imagens (references/) */

  function imgState(dir) {
    if (!doc.imgs.has(dir)) doc.imgs.set(dir, { data: null, error: null, sig: '', loadedAt: 0, loading: null, baseline: null, fresh: new Map(), renderedAt: 0 });
    return doc.imgs.get(dir);
  }

  function imgSig(d) {
    return JSON.stringify([
      d.exists,
      d.refsDoc && d.refsDoc.updatedAt,
      d.items.map((i) => [i.path, i.mtimeMs, i.bytes]),
      d.expected.map((e) => [e.name, e.status, e.files.join(','), e.candidates.length]),
    ]);
  }

  /** Marca como "nova" o que apareceu (ou mudou) depois da primeira leitura desta página. */
  function trackFresh(st, data) {
    if (!st.baseline) {
      st.baseline = new Map(data.items.map((i) => [i.path, i.mtimeMs]));
      return;
    }
    const now = Date.now();
    for (const i of data.items) {
      if (st.baseline.get(i.path) === i.mtimeMs) continue;
      const f = st.fresh.get(i.path);
      if (!f || f.mtimeMs !== i.mtimeMs) st.fresh.set(i.path, { at: now, mtimeMs: i.mtimeMs });
    }
  }

  /** GET /api/refs. Resolve `true` se algo mudou desde a última leitura. */
  function fetchImages(dir) {
    const st = imgState(dir);
    if (st.loading) return st.loading;
    st.loading = VW.api('/api/refs?dir=' + encodeURIComponent(dir)).then((data) => {
      st.error = null;
      trackFresh(st, data);
      const sig = imgSig(data);
      const changed = sig !== st.sig || !st.data;
      st.sig = sig;
      st.data = data;
      return changed;
    }).catch((err) => {
      st.error = err.message;
      return !st.data;
    }).finally(() => {
      st.loadedAt = Date.now();
      st.loading = null;
    });
    return st.loading;
  }

  /** Relê se passou do intervalo (ou se `force`); re-renderiza só se mudou algo. */
  async function pollImages(force) {
    if (!doc.opts || !VW.doc.isOpen()) return;
    const dir = doc.opts.dir;
    const st = imgState(dir);
    updateLive();
    if (document.visibilityState !== 'visible') return;
    if (!force && st.loadedAt && Date.now() - st.loadedAt < IMG_POLL_MS - 400) return;
    const changed = await fetchImages(dir);
    if (!VW.doc.isOpen() || !doc.opts || doc.opts.dir !== dir) return;
    if (changed && doc.tab === 'imagens') renderDrawer(true);
    else { setTabs(); updateLive(); }
  }

  function startPoll() {
    stopPoll();
    doc.timer = setInterval(() => pollImages(false), 2500);
  }
  function stopPoll() {
    if (doc.timer) clearInterval(doc.timer);
    doc.timer = null;
  }

  function updateLive() {
    const el = doc.el && doc.el.querySelector('#vwLive');
    if (!el || !doc.opts) return;
    const st = doc.imgs.get(doc.opts.dir);
    if (!st) return;
    const label = el.querySelector('span');
    el.classList.toggle('is-loading', Boolean(st.loading));
    el.classList.toggle('is-error', Boolean(st.error));
    if (st.error) { label.textContent = 'falhou: ' + st.error; return; }
    if (st.loading) { label.textContent = 'relendo references/…'; return; }
    const s = Math.max(0, Math.round((Date.now() - st.loadedAt) / 1000));
    label.textContent = 'ao vivo · checado ' + (s < 3 ? 'agora' : 'há ' + s + ' s');
    el.title = 'A aba relê seedance-…/references/ a cada ' + Math.round(IMG_POLL_MS / 1000) + ' s enquanto a gaveta está aberta';
  }

  function isNewItem(st, i) {
    return st.fresh.has(i.path) || (i.kind !== 'guide' && Date.now() - i.mtimeMs < IMG_RECENT_MS);
  }

  function tileHtml(st, i, sec, idx) {
    const portrait = !i.width || !i.height || i.height / i.width >= 1.6;
    const isNew = isNewItem(st, i);
    const f = st.fresh.get(i.path);
    const justArrived = Boolean(f && f.at > st.renderedAt && st.renderedAt);
    const okTitle = i.expected ? (i.match === 'variant' ? 'variante de ' + i.expected + ' (REFS.md)' : 'listada no REFS.md') : '';
    return '<button class="vw-tile' + (justArrived ? ' is-fresh' : '') + '" type="button" data-sec="' + sec + '" data-i="' + idx + '" title="' + VW.esc(i.path) + '">' +
      '<span class="vw-thumb' + (portrait ? '' : ' is-contain') + '"><img loading="lazy" decoding="async" alt="" src="' + VW.esc(i.thumb) + '"></span>' +
      (isNew ? '<span class="vw-badge">nova</span>' : '') +
      (i.expected ? '<span class="vw-ok' + (i.match === 'variant' ? ' is-variant' : '') + '" title="' + VW.esc(okTitle) + '">' + ICONS.check + '</span>' : '') +
      '<span class="vw-tname">' + VW.esc(i.name) + '</span>' +
      '<span class="vw-tmeta">' + VW.esc(VW.fmtWhen(i.mtimeMs) + ' · ' + VW.fmtBytes(i.bytes)) + '</span>' +
    '</button>';
  }

  /**
   * Placeholder de uma ref esperada que ainda não existe. Clicar abre a descrição
   * no REFS.md; se já houver candidatos em rascunho (`_cand/ref9_…_attempt1.png`),
   * mostra as miniaturas e um atalho que abre o lightbox neles.
   */
  function placeholderHtml(st, e) {
    const edit = e.action === 'editar';
    const cands = doc.lists['cand:' + e.name] || [];
    const freshCand = cands.some((c) => isNewItem(st, c));
    const strip = cands.length
      ? '<span class="vw-ph-cands">' + cands.slice(-3).map((c) =>
        '<img loading="lazy" decoding="async" alt="" src="' + VW.esc(c.thumb.replace(/&w=\d+$/, '&w=160')) + '">').join('') +
        (cands.length > 3 ? '<span class="more">+' + (cands.length - 3) + '</span>' : '') +
        (freshCand ? '<span class="vw-badge is-inline" title="candidato novo">novo</span>' : '') + '</span>'
      : '';
    return '<div class="vw-tile is-missing">' +
      '<button class="vw-tile-main" type="button" data-exp="' + VW.esc(e.name) + '" title="' + VW.esc((e.detail || e.note || e.name) + ' — clique para ver no REFS.md') + '">' +
        '<span class="vw-thumb vw-ph">' +
          '<span class="vw-ph-tags"><span class="vw-ph-tag' + (edit ? ' is-edit' : '') + '">' + (edit ? 'editar' : 'criar') + '</span>' +
            (e.optional ? '<span class="vw-ph-tag is-opt">opcional</span>' : '') +
            (e.declared ? '<span class="vw-ph-tag is-opt">' + VW.esc(e.declared) + '</span>' : '') + '</span>' +
          (e.note ? '<span class="vw-ph-note">' + VW.esc(e.note) + '</span>' : '') +
          '<span class="vw-ph-detail">' + VW.esc(e.detail || '') + '</span>' +
          strip +
          '<span class="vw-ph-foot">' + ICONS.clock + (cands.length ? 'em andamento' : 'ainda não gerada') + '</span>' +
        '</span>' +
        '<span class="vw-tname">' + VW.esc(e.name) + '</span>' +
      '</button>' +
      (cands.length
        ? '<button class="vw-cand" type="button" data-cands="' + VW.esc(e.name) + '">' + VW.esc(VW.plural(cands.length, 'candidato', 'candidatos')) + ' em rascunho ›</button>'
        : '<span class="vw-tmeta">REFS.md · linha ' + e.line + '</span>') +
    '</div>';
  }

  /** Grade agrupada por pasta; cabeçalho de pasta só quando ajuda. */
  function groupsHtml(st, list, sec) {
    const groups = new Map();
    list.forEach((i, idx) => {
      if (!groups.has(i.group)) groups.set(i.group, []);
      groups.get(i.group).push(tileHtml(st, i, sec, idx));
    });
    const showHead = groups.size > 1 || (groups.size === 1 && !groups.has(''));
    let html = '';
    for (const [g, tiles] of groups) {
      if (showHead) html += '<div class="vw-grp">references/' + VW.esc(g ? g + '/' : '') + ' · ' + tiles.length + '</div>';
      html += '<div class="vw-grid">' + tiles.join('') + '</div>';
    }
    return html;
  }

  /** Ordem de exibição: refs geradas (por pasta, ordem natural) · esperadas · guias · rascunhos. */
  function renderImages(st) {
    if (!st || (!st.data && !st.error)) return '<div class="vw-loading">Lendo references/…</div>';
    if (!st.data) return '<div class="vw-empty"><strong>Não consegui ler as imagens</strong>' + VW.esc(st.error) + '</div>';
    const d = st.data;
    const c = d.counts;
    const byKind = (k) => d.items.filter((i) => i.kind === k);
    const refs = byKind('ref');
    const guides = byKind('guide');
    const drafts = byKind('draft');
    doc.lists = { refs, guides, drafts };
    const missing = d.expected.filter((e) => e.status === 'missing');
    // candidatos de cada esperada, do mais velho ao mais novo (o lightbox abre no último)
    for (const e of missing) {
      if (!e.candidates.length) continue;
      const set = new Set(e.candidates);
      doc.lists['cand:' + e.name] = drafts.filter((i) => set.has(i.path)).sort((a, b) => a.mtimeMs - b.mtimeMs);
    }
    const folder = VW.esc(d.root || (d.dir + '/references'));

    if (!d.items.length && !d.expected.length) {
      return '<div class="vw-img-sum"><span class="vw-live" id="vwLive"><i></i><span>…</span></span></div>' +
        '<div class="vw-empty"><strong>Nenhuma imagem ainda</strong>' +
        (d.exists ? 'A pasta <code>' + folder + '/</code> está vazia.' : 'A pasta <code>' + folder + '/</code> ainda não existe.') +
        ' Quando as refs forem salvas lá, elas aparecem aqui sozinhas — a aba checa a cada ' + Math.round(IMG_POLL_MS / 1000) + ' s.' +
        (d.refsDoc && !d.refsDoc.exists ? '<br>Sem <code>REFS.md</code>, não dá para saber quais refs faltam.' : '') + '</div>';
    }

    const freshN = d.items.filter((i) => st.fresh.has(i.path)).length;
    let html = '<div class="vw-img-sum">';
    if (c.expected) {
      const pct = Math.round((100 * c.generated) / c.expected);
      html += '<div class="vw-prog"><span class="vw-prog-n">' + c.generated + '<small>/' + c.expected + '</small></span>' +
        '<span class="vw-prog-txt' + (c.missing ? '' : ' is-done') + '">' +
        (c.missing ? 'geradas · faltam <b>' + c.missing + '</b>' + (c.optionalMissing ? ' (' + c.optionalMissing + ' opcional)' : '') : '<b>todas geradas</b>') +
        '</span><span class="vw-prog-bar" title="' + c.generated + ' de ' + c.expected + ' refs do REFS.md"><i style="width:' + pct + '%"></i></span></div>';
    }
    html += '<span><b>' + c.refs + '</b> ' + (c.refs === 1 ? 'ref' : 'refs') + '</span>';
    if (c.guides) html += '<span><b>' + c.guides + '</b> ' + (c.guides === 1 ? 'guia' : 'guias') + ' da fonte</span>';
    if (c.drafts) html += '<span><b>' + c.drafts + '</b> ' + (c.drafts === 1 ? 'rascunho' : 'rascunhos') + '</span>';
    if (freshN) html += '<span class="vw-newcount">' + freshN + ' ' + (freshN === 1 ? 'nova' : 'novas') + ' desde que abriu</span>';
    if (d.refsDoc && !d.refsDoc.exists) html += '<span title="Sem REFS.md não dá para listar as refs esperadas">sem REFS.md</span>';
    html += '<span class="vw-live" id="vwLive"><i></i><span>…</span></span></div>';

    html += '<section class="vw-sec"><h3 class="vw-sec-h">Geradas <span class="n">' + refs.length + '</span>' +
      (c.expected ? '<span class="hint">✓ = listada no REFS.md</span>' : '') + '</h3>' +
      (refs.length
        ? groupsHtml(st, refs, 'refs')
        : '<div class="vw-none">Nenhuma ref gerada ainda. ' + (d.exists ? '' : 'A pasta <code>' + folder + '/</code> ainda não existe. ') +
          'Quando o Codex salvar em <code>' + folder + '/</code>, ela aparece aqui sozinha.</div>') +
      '</section>';

    if (missing.length) {
      html += '<section class="vw-sec"><h3 class="vw-sec-h">Esperadas, ainda não geradas <span class="n">' + missing.length + '</span>' +
        '<span class="hint">do REFS.md · clique para ler a descrição</span></h3>' +
        '<div class="vw-grid">' + missing.map((e) => placeholderHtml(st, e)).join('') + '</div></section>';
    }

    const fold = (sec, title, hint, list) => '<details class="vw-sec" data-sec="' + sec + '"' + (doc.secOpen[sec] ? ' open' : '') + '>' +
      '<summary class="vw-sec-h">' + title + ' <span class="n">' + list.length + '</span><span class="hint">' + hint + '</span></summary>' +
      groupsHtml(st, list, sec) + '</details>';
    if (guides.length) html += fold('guides', 'Guias da fonte', 'só guia — não anexar', guides);
    if (drafts.length) html += fold('drafts', 'Rascunhos e candidatos', 'nomes ou pastas com _', drafts);
    return html;
  }

  function bindImages(body) {
    body.querySelectorAll('.vw-tile[data-sec]').forEach((b) => b.addEventListener('click', () => openLightbox(b.dataset.sec, Number(b.dataset.i), b)));
    body.querySelectorAll('[data-exp]').forEach((b) => b.addEventListener('click', () => showInRefsDoc(b.dataset.exp)));
    body.querySelectorAll('[data-cands]').forEach((b) => b.addEventListener('click', () => {
      const list = doc.lists['cand:' + b.dataset.cands] || [];
      openLightbox('cand:' + b.dataset.cands, list.length - 1, b);
    }));
    body.querySelectorAll('details[data-sec]').forEach((d) => d.addEventListener('toggle', () => { doc.secOpen[d.dataset.sec] = d.open; }));
    body.querySelectorAll('.vw-thumb img').forEach((img) => img.addEventListener('error', () => {
      img.replaceWith(Object.assign(document.createElement('span'), { className: 'vw-noimg', textContent: 'sem prévia' }));
    }, { once: true }));
  }

  /** Placeholder clicado: abre a aba Refs e rola até onde o REFS.md descreve aquela imagem. */
  function showInRefsDoc(name) {
    selectTab('refs');
    const body = doc.el.querySelector('#vwDocBody');
    const nodes = [...body.querySelectorAll('.vw-md h1, .vw-md h2, .vw-md h3, .vw-md h4, .vw-md td, .vw-md li, .vw-md p')];
    const hit = nodes.find((n) => n.textContent.includes(name));
    if (!hit) return;
    const target = hit.closest('tr') || hit;
    target.scrollIntoView({ block: 'center' });
    target.classList.add('vw-hit');
    setTimeout(() => target.classList.add('is-fading'), 900);
  }

  /* ------------------------------------------------------------- lightbox */

  function ensureLightbox() {
    if (doc.lb) return doc.lb;
    const el = document.createElement('div');
    el.className = 'vw-lb';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Imagem de referência');
    el.innerHTML =
      '<div class="vw-lb-stage">' +
        '<img class="vw-lb-img" alt="">' +
        '<button class="vw-lb-nav vw-lb-prev" type="button" aria-label="Anterior (←)">' + ICONS.prev + '</button>' +
        '<button class="vw-lb-nav vw-lb-next" type="button" aria-label="Próxima (→)">' + ICONS.next + '</button>' +
        '<button class="vw-lb-x" type="button" aria-label="Fechar (Esc)">×</button>' +
        '<span class="vw-lb-loading" hidden>carregando o original…</span>' +
      '</div>' +
      '<div class="vw-lb-bar"><div class="vw-lb-meta"><div class="vw-lb-name"></div><div class="vw-lb-sub"></div></div>' +
        '<span class="vw-lb-count"></span><a class="vw-lb-orig" target="_blank" rel="noopener">Original ↗</a></div>';
    document.body.appendChild(el);
    const lb = { el, list: [], i: 0, token: 0, returnFocus: null, touchX: null };
    doc.lb = lb;
    el.querySelector('.vw-lb-prev').addEventListener('click', () => stepLightbox(-1));
    el.querySelector('.vw-lb-next').addEventListener('click', () => stepLightbox(1));
    el.querySelector('.vw-lb-x').addEventListener('click', () => closeLightbox());
    const stage = el.querySelector('.vw-lb-stage');
    stage.addEventListener('click', (ev) => { if (ev.target === stage) closeLightbox(); });
    stage.addEventListener('touchstart', (ev) => { lb.touchX = ev.touches.length === 1 ? ev.touches[0].clientX : null; }, { passive: true });
    stage.addEventListener('touchend', (ev) => {
      if (lb.touchX == null) return;
      const dx = ev.changedTouches[0].clientX - lb.touchX;
      lb.touchX = null;
      if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
    }, { passive: true });
    return lb;
  }

  function lbIsOpen() {
    return Boolean(doc.lb && !doc.lb.el.hidden);
  }

  function openLightbox(sec, idx, from) {
    const list = (doc.lists[sec] || []).slice();
    if (!list[idx]) return;
    const lb = ensureLightbox();
    lb.list = list;
    lb.i = idx;
    lb.returnFocus = from || null;
    lb.el.hidden = false;
    requestAnimationFrame(() => lb.el.classList.add('is-open'));
    showLightbox();
    lb.el.querySelector('.vw-lb-x').focus({ preventScroll: true });
  }

  function showLightbox() {
    const lb = doc.lb;
    const it = lb.list[lb.i];
    if (!it) return;
    const token = ++lb.token;
    const img = lb.el.querySelector('.vw-lb-img');
    const loading = lb.el.querySelector('.vw-lb-loading');
    // a miniatura (já no cache do navegador) aparece na hora; o original troca quando chegar
    img.src = it.thumb;
    img.alt = it.name;
    loading.hidden = false;
    loading.textContent = 'carregando o original…';
    const full = new Image();
    full.decoding = 'async';
    full.onload = () => { if (token === lb.token) { img.src = it.url; loading.hidden = true; } };
    full.onerror = () => { if (token === lb.token) loading.textContent = 'não consegui abrir o original'; };
    full.src = it.url;

    const st = doc.opts ? doc.imgs.get(doc.opts.dir) : null;
    const sub = [];
    sub.push('<span>' + VW.esc((it.group ? 'references/' + it.group + '/' : 'references/')) + '</span>');
    sub.push('<span>' + VW.esc(VW.fmtStamp(it.mtime)) + ' · ' + VW.esc(VW.fmtAgo(it.mtime)) + '</span>');
    sub.push('<span>' + VW.esc(VW.fmtBytes(it.bytes)) + (it.width ? ' · ' + it.width + '×' + it.height : '') + '</span>');
    if (it.kind === 'guide') sub.push('<span class="is-guide">guia da fonte — não anexar</span>');
    else if (it.kind === 'draft') sub.push('<span>rascunho</span>');
    else if (it.expected) sub.push('<span class="is-ok">✓ ' + VW.esc(it.match === 'variant' ? 'variante de ' + it.expected : 'listada no REFS.md') + '</span>');
    if (st && isNewItem(st, it)) sub.push('<span class="is-ok">nova</span>');
    lb.el.querySelector('.vw-lb-name').textContent = it.name;
    lb.el.querySelector('.vw-lb-sub').innerHTML = sub.join('');
    lb.el.querySelector('.vw-lb-count').textContent = (lb.i + 1) + ' / ' + lb.list.length;
    lb.el.querySelector('.vw-lb-orig').href = it.url;
    lb.el.querySelector('.vw-lb-prev').disabled = lb.i === 0;
    lb.el.querySelector('.vw-lb-next').disabled = lb.i >= lb.list.length - 1;
  }

  function stepLightbox(delta) {
    const lb = doc.lb;
    if (!lb) return;
    const next = lb.i + delta;
    if (next < 0 || next >= lb.list.length) return;
    lb.i = next;
    showLightbox();
  }

  function closeLightbox() {
    const lb = doc.lb;
    if (!lb || lb.el.hidden) return;
    lb.token += 1;
    lb.el.classList.remove('is-open');
    lb.el.hidden = true;
    lb.el.querySelector('.vw-lb-img').removeAttribute('src');
    if (lb.returnFocus && document.contains(lb.returnFocus)) lb.returnFocus.focus({ preventScroll: true });
  }

  function wordCount(text) {
    return (String(text || '').replace(/["“”'‘’]/g, ' ').match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) || []).length;
  }

  function renderFalas(falas) {
    if (!falas || !falas.beats.length) {
      return '<div class="vw-empty"><strong>Nenhum beat nos PROMPT_n ainda</strong>Quando os prompts existirem, as FALAs de cada beat aparecem aqui, na ordem.</div>';
    }
    const totalWords = falas.beats.reduce((acc, b) => acc + wordCount(b.dialogue), 0);
    let html = '<div class="vw-falas-sum"><span><b>' + falas.withDialogue + '</b> de ' + falas.beats.length + ' beats com fala</span>' +
      '<span><b>' + totalWords + '</b> palavras</span>' +
      (falas.duration ? '<span><b>' + VW.fmtSec(falas.duration) + '</b> de vídeo</span>' : '') + '</div>';
    let chunk = null;
    for (const b of falas.beats) {
      if (b.chunk !== chunk) {
        chunk = b.chunk;
        html += '<div class="vw-chunk-h">Chunk ' + VW.esc(b.chunk) + ' · ' + VW.esc(b.chunkFile || '') + '</div>';
      }
      const words = wordCount(b.dialogue);
      const rate = words && b.duration ? words / b.duration : 0;
      const href = 'ui.html#/' + encodeURIComponent(doc.opts.dir) + '/' + encodeURIComponent(b.id);
      html += '<div class="vw-fala">' +
        '<a class="vw-fala-n" href="' + href + '" data-beat="' + VW.esc(b.id) + '" title="Abrir este beat">BEAT<em>' + b.position + '</em></a>' +
        '<div class="vw-fala-meta"><span class="vw-name">' + VW.esc(b.name || '') + '</span>' +
        '<span>' + VW.esc(VW.fmtSec(b.start)) + '–' + VW.esc(VW.fmtSec(b.end)) + '</span>' +
        (words ? '<span class="vw-rate' + (rate > 4 ? ' is-tight' : '') + '" title="palavras por segundo no tempo do beat">' + words + ' palavras · ' + rate.toFixed(1).replace('.', ',') + '/s</span>' : '') +
        '</div>' +
        (b.dialogue && b.dialogue.trim()
          ? '<div class="vw-fala-text">' + VW.esc(b.dialogue.trim()) + '</div>'
          : '<div class="vw-fala-text is-none">sem fala neste beat</div>') +
        '</div>';
    }
    return html;
  }

  function renderDocument(d, what) {
    if (!d) return '<div class="vw-loading">Carregando…</div>';
    if (d.error) return '<div class="vw-empty"><strong>Não consegui ler</strong>' + VW.esc(d.error) + '</div>';
    if (!d.exists) {
      return what === 'copy'
        ? '<div class="vw-empty"><strong>Este projeto ainda não tem COPY.md</strong>Veja as falas que já estão nos prompts na aba “Falas nos prompts”.</div>'
        : '<div class="vw-empty"><strong>Este projeto não tem REFS.md</strong>As referências de imagem ficam em <code>references/</code> e na página de assets.</div>';
    }
    if (!d.markdown.trim()) return '<div class="vw-empty"><strong>' + VW.esc(d.name) + ' está vazio</strong>Talvez ainda esteja sendo escrito.</div>';
    return '<article class="vw-md">' + renderMarkdown(d.markdown) + '</article>';
  }

  /** @param {boolean} [keepScroll] re-render de atualização (poll): não volta ao topo */
  function renderDrawer(keepScroll) {
    const st = doc.cache.get(doc.opts.dir) || {};
    setTabs();
    const body = doc.el.querySelector('#vwDocBody');
    const prevScroll = body.scrollTop;
    let path = '';
    if (doc.tab === 'imagens') {
      const im = doc.imgs.get(doc.opts.dir);
      body.innerHTML = renderImages(im);
      bindImages(body);
      if (im && im.data) im.renderedAt = Date.now();
      const d = im && im.data;
      path = (d ? d.root : doc.opts.dir + '/references') + '/' +
        (d && d.refsDoc && d.refsDoc.exists ? ' · esperadas do REFS.md' : '') + ' · relê a cada ' + Math.round(IMG_POLL_MS / 1000) + ' s';
      updateLive();
    } else if (doc.tab === 'copy') {
      body.innerHTML = renderDocument(st.copy, 'copy');
      if (st.copy && st.copy.exists) path = st.copy.path + (st.copy.updatedAt ? ' · editado ' + VW.fmtAgo(st.copy.updatedAt) : '');
    } else if (doc.tab === 'refs') {
      body.innerHTML = renderDocument(st.refs, 'refs');
      if (st.refs && st.refs.exists) path = st.refs.path + (st.refs.updatedAt ? ' · editado ' + VW.fmtAgo(st.refs.updatedAt) : '');
    } else {
      body.innerHTML = st.falas ? (st.falas.error ? '<div class="vw-empty"><strong>Não consegui ler os prompts</strong>' + VW.esc(st.falas.error) + '</div>' : renderFalas(st.falas)) : '<div class="vw-loading">Carregando…</div>';
      path = doc.opts.dir + '/PROMPT_n · FALA de cada beat';
      if (typeof doc.opts.onBeat === 'function') {
        body.querySelectorAll('a[data-beat]').forEach((a) => a.addEventListener('click', (ev) => {
          ev.preventDefault();
          const id = a.dataset.beat;
          VW.doc.close();
          doc.opts.onBeat(id);
        }));
      }
    }
    body.scrollTop = keepScroll ? prevScroll : 0;
    doc.el.querySelector('#vwDocPath').textContent = path;
  }

  async function loadDocs(dir) {
    const st = { copy: null, refs: null, falas: null };
    doc.cache.set(dir, st);
    const enc = encodeURIComponent(dir);
    const tasks = [
      VW.api('/api/doc?dir=' + enc + '&name=COPY.md').then((d) => { st.copy = d; }).catch((e) => { st.copy = { error: e.message }; }),
      VW.api('/api/doc?dir=' + enc + '&name=REFS.md').then((d) => { st.refs = d; }).catch((e) => { st.refs = { error: e.message }; }),
      VW.api('/api/project?dir=' + enc).then((d) => {
        const beats = d.project.beats;
        st.falas = {
          beats,
          withDialogue: beats.filter((b) => b.dialogue && b.dialogue.trim()).length,
          duration: d.project.end != null && d.project.start != null ? d.project.end - d.project.start : null,
        };
      }).catch((e) => { st.falas = { beats: [], withDialogue: 0, error: e.message }; }),
      // imagens: o estado por pasta sobrevive entre aberturas (é ele que sabe o que é "nova")
      fetchImages(dir),
    ];
    return { st, tasks };
  }

  VW.doc = {
    TABS,
    /**
     * @param {{dir:string, title?:string, kicker?:string, tab?:'copy'|'falas'|'refs'|'imagens',
     *          cta?:{href:string,label:string}|null, onBeat?:(id:string)=>void,
     *          onTab?:(tab:string)=>void, onClose?:()=>void}} opts
     */
    async open(opts) {
      ensureDrawer();
      const token = ++doc.token;
      doc.opts = opts;
      doc.lastFocus = document.activeElement;
      doc.el.querySelector('#vwDocTitle').textContent = opts.title || opts.dir;
      doc.el.querySelector('#vwDocKicker').textContent = opts.kicker || '';
      doc.el.querySelector('#vwDocDir').textContent = opts.dir;
      const cta = doc.el.querySelector('#vwDocCta');
      if (opts.cta && opts.cta.href) {
        cta.hidden = false;
        cta.href = opts.cta.href;
        cta.innerHTML = VW.esc(opts.cta.label || 'Abrir') + ' ' + ARROW;
      } else {
        cta.hidden = true;
      }
      doc.tab = TABS.includes(opts.tab) ? opts.tab : 'copy';
      closeLightbox();
      doc.backdrop.hidden = false;
      doc.el.hidden = false;
      requestAnimationFrame(() => { doc.backdrop.classList.add('is-open'); doc.el.classList.add('is-open'); });
      document.documentElement.style.overflow = 'hidden';
      doc.el.querySelector('#vwDocClose').focus({ preventScroll: true });

      const { st, tasks } = await loadDocs(opts.dir);
      renderDrawer();
      startPoll();
      await Promise.all(tasks.map((t) => t.then(() => { if (token === doc.token && doc.opts === opts) renderDrawer(); })));
      if (token !== doc.token) return;
      // sem COPY.md: abre direto nas falas, se houver
      if (!opts.tab && st.copy && !st.copy.exists && st.falas && st.falas.beats.length) {
        doc.tab = 'falas';
        renderDrawer();
      }
    },
    close() {
      if (!doc.el || doc.el.hidden) return;
      doc.token += 1;
      stopPoll();
      closeLightbox();
      doc.el.classList.remove('is-open');
      doc.backdrop.classList.remove('is-open');
      document.documentElement.style.overflow = '';
      const el = doc.el;
      const bd = doc.backdrop;
      setTimeout(() => { if (!el.classList.contains('is-open')) { el.hidden = true; bd.hidden = true; } }, 200);
      if (doc.opts && typeof doc.opts.onClose === 'function') doc.opts.onClose();
      if (doc.lastFocus && typeof doc.lastFocus.focus === 'function') doc.lastFocus.focus({ preventScroll: true });
    },
    isOpen() {
      return Boolean(doc.el && !doc.el.hidden && doc.el.classList.contains('is-open'));
    },
  };

  window.VW = VW;
})();
