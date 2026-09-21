# Video Workflow for Codex Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

**Goal:** Create a native Codex adapter for the existing video-workflow UI and orchestration process.

**Architecture:** The new Codex skill is a small, self-contained instruction layer in the user skill directory. It will reference the checked-in `.claude/skills/video-workflow` Node server as the sole review UI implementation, while routing work to Codex's available video skills and preserving the approval/QC gates.

**Tech Stack:** Codex skills (`SKILL.md`, `agents/openai.yaml`), Node.js 22 runtime, existing local HTML/MJS review UI.

---

### Task 1: Create the Codex skill adapter

**Files:**

- Create: `C:/Users/FELIP/.codex/skills/video-workflow/SKILL.md`
- Create: `C:/Users/FELIP/.codex/skills/video-workflow/agents/openai.yaml`
- Reference: `.claude/skills/video-workflow/server.mjs`
- Reference: `.claude/skills/video-workflow/assets.mjs`

**Step 1: Write the acceptance check**

Define the required assertions: the skill has valid frontmatter; it describes discovery/resume stages; it starts the existing server; it treats `assets/approved/<project>.json` as authoritative; it requires explicit cost approval and hub QC before generation; it makes no claim of unavailable Claude-only tools.

**Step 2: Run the check to verify the adapter is absent**

Run: `Test-Path 'C:/Users/FELIP/.codex/skills/video-workflow/SKILL.md'`

Expected: `False`.

**Step 3: Create the minimal adapter**

Write `SKILL.md` with:

```markdown
---
name: video-workflow
description: Orchestrate an end-to-end video recreation workflow using the local beat/assets review UI, from source inspection through approved multi-chunk generation.
---
```

Add compact stage routing for `watch`, `video-teardown`, `video-prompt`, the review UI, and `video-method`. Reference the existing server by absolute workspace path at runtime or the project-relative path from the current repository. Include the non-negotiable approval-state, cost, and hub-QC gates.

Write the companion `agents/openai.yaml` with matching display metadata and normal implicit invocation.

**Step 4: Run structural validation**

Run: `python 'C:/Users/FELIP/.codex/skills/.system/skill-creator/scripts/quick_validate.py' 'C:/Users/FELIP/.codex/skills/video-workflow'`

Expected: validation succeeds with no frontmatter, naming, or placeholder errors.

**Step 5: Commit repository documentation only**

The user-level Codex skill is outside the repository and must not be added to its Git history. Commit this implementation plan separately only if it has not already been committed with its design documentation.

### Task 2: Verify runtime integration without generation

**Files:**

- Verify: `.claude/skills/video-workflow/server.mjs`
- Verify: `C:/Users/FELIP/.codex/skills/video-workflow/SKILL.md`

**Step 1: Write the acceptance check**

The existing server must expose its CLI help and the adapter must point at the correct checked-in entrypoint. No paid-video request may be invoked during verification.

**Step 2: Run the server startup check on a free port**

Run: `node .claude/skills/video-workflow/server.mjs --port 7789`, confirm that it logs its root and `127.0.0.1:7789`, then stop that verification process.

Expected: the server starts without contacting a video provider. The CLI does not implement `--help`; its supported flags are verified from `server.mjs` (`--port`, `--root`, and `--host`).

**Step 3: Inspect adapter references**

Run: `rg -n "server\.mjs|assets/approved|cost|QC|video-method" 'C:/Users/FELIP/.codex/skills/video-workflow/SKILL.md'`

Expected: each required integration concept has a concrete instruction.

**Step 4: Preserve existing working state**

Run: `git status --short`

Expected: only the user's pre-existing files plus the two new planning documents appear; no `.claude/skills/video-workflow/*` implementation file is modified by this work.
