# Video Workflow for Codex — Design

## Goal

Make the existing end-to-end video recreation workflow discoverable and usable by Codex without changing or duplicating its existing local UI implementation.

## Chosen approach

Create a native Codex skill at `C:\Users\FELIP\.codex\skills\video-workflow`. It is a thin orchestration adapter: it invokes the relevant Codex skills, starts the existing UI from this repository, and verifies the approval state on disk before handing off to generation.

The source implementation remains at `.claude/skills/video-workflow`. This avoids two independently maintained copies of the UI, parser, asset library, and local server.

## Components

- `SKILL.md`: Codex-specific entrypoint, trigger description, stage routing, safety gates, and local-server instructions.
- `agents/openai.yaml`: Codex UI metadata.
- Existing `.claude/skills/video-workflow/*`: unchanged runtime implementation for beat review and asset approval.

## Workflow

1. Detect the resumable stage from the supplied video/project artifacts.
2. Use the available Codex skills for viewing, teardown, prompt creation, and video generation.
3. Run the existing Node server only for the human review stage; it cannot invoke a paid provider.
4. Read `assets/approved/<project>.json` as the authoritative approval record.
5. Before generation, report the assembled inputs and require explicit user confirmation after a cost preflight.
6. Require QC approval of the hub clip before any parallel extensions.

## Codex adaptations

- Replace Claude-specific invocation language with the skills/tools available in Codex.
- Use Codex image generation/editing only when it is the authorized available image path; never route image work through the paid video provider.
- Do not claim a browser-only integration exists. If a required external image editor or video MCP is unavailable, report the dependency and stop at that gate.
- Preserve Portuguese user-facing communication and the existing project folder conventions.

## Validation

- Validate the new skill with Codex's `quick_validate.py`.
- Confirm the skill points to the checked-in server and that `node .../server.mjs --help` runs.
- Leave all pre-existing dirty files untouched.
