---
name: video-method
description: Use when the user wants to actually generate a multi-chunk Seedance 2.5 video from a set of PROMPT_n chunk files (produced by video-prompt) via the Higgsfield MCP — building one hub video (omni_reference) and firing every other chunk as a parallel video_extension off that same hub, then assembling with ffmpeg. Triggers on "gera os vídeos no Seedance", "executa o método do hub", "renderiza esses prompts", "monta o vídeo final com Higgsfield", "faz as extensions em paralelo".
---

# THE METHOD — ONE HUB, MANY EXTENSIONS

Seedance 2.5 caps a single generation at 30 seconds, so a long video has to be made in pieces.

We do not build a chain (V1→V2→V3→V4). We build a hub:

```
[cleaned reference images + voice reference]
                    ↓
GEN 1 (mode: omni_reference, <30s)
                    ↓
VIDEO 1 ← the hub, the only thing that defines the world
                    |
        ┌───────────┼───────────┬───────────┐
        ↓           ↓           ↓           ↓
   extend(V1)   extend(V1)   extend(V1)   extend(V1)
   + PROMPT 2   + PROMPT 3   + PROMPT 4   + PROMPT 5
        ↓           ↓           ↓           ↓
      VIDEO 2    VIDEO 3     VIDEO 4     VIDEO 5
        └───────────┴───────────┴───────────┘
                    ↓
          assemble in order → FINAL VIDEO
```

Every extension branches off VIDEO 1 — never off another extension.

## Why this is the right topology

**No compounding drift.** Every clip is exactly one hop from V1. In a chain, V4 is a
copy-of-a-copy-of-a-copy and the face, wardrobe and grade slide away. Here nothing is ever
more than one generation removed from the hub, so identity and grade hold across the whole
video.

**Fully parallel.** Every extension needs only V1, which already exists — so V2...VN are submitted
all at once and generate simultaneously. A chain forces you to wait for each generation in
sequence. A failed clip = one cheap, isolated rerun. If V4 comes out wrong, regenerate V4 alone.
Nothing downstream depends on it. In a chain, a bad link poisons everything after it.

It's forgiving, provided each extension prompt is extremely detailed — see the critical rule below,
which is the one thing that makes or breaks this method.

## THE CRITICAL RULE — EVERY EXTENSION STARTS FROM V1'S ENDING

Each extension continues from V1's final state, because V1 is what it's extending. So V2, V3,
V4 and V5 all begin from the same visual starting point.

That means an extension prompt cannot assume it's following the previous chunk — it has no
idea V2 or V3 exist. Therefore every extension prompt must:

**Open with an explicit transition.** Begin with `CUT TO:` (or a stated transition) that moves us out of
V1's ending and into this chunk's scene. Without it, several clips will open looking identical.

**Fully establish its own scene from scratch** — framing, location, what's in shot, what the subject
is doing and wearing, the props on the table. Do not write "she continues explaining" — the model
doesn't know what she was explaining in a chunk it never saw.

**Carry the complete style bible** — subject description, wardrobe, set, camera, lighting, grade,
music, SFX. Repetition across files is intentional and required here.

**Re-state the negatives every time**, especially no captions, no subtitles, no on-screen text, no
watermark.

This is why the prompts must be very very detailed: the prompt carries the whole scene, and V1
only carries the world (who this person is, what the room looks like, how it's lit and graded).

**Rule of thumb: V1 supplies identity and look. The prompt supplies everything else.**

## THE MODEL — EXACT PARAMETERS

(Higgsfield MCP, model `seedance_2_5`)

Call `generate_video` (single) or `generate_video_batch` (parallel) with `parent_model:
"seedance_2_5"`.

| Param | Value | Notes |
|---|---|---|
| `mode` | `omni_reference` / `video_edit` / `video_extension` | V1 uses `omni_reference`; every extension uses `video_extension` |
| `duration` | 4–30 seconds | Hard cap 30 — the reason we chunk |
| `resolution` | 480p–720p | 720p costs materially more |
| `generate_audio` | true/false | Native audio including spoken dialogue |
| `extension_mode` | `forward` / `backward` | Required when `mode: video_extension`; forbidden otherwise. We use `forward`. |
| `aspect_ratio` | 9:16, 16:9... | Ignored for `video_extension` — inherited from V1. Set it on V1 and it propagates. |

`medias[]` roles: `start_image`, `end_image`, `image_references`, `video_references`, `audio_references`.

**The hub mechanic — no download/re-upload.** `medias[]` value accepts a `media_id` UUID or a
`job_id` from a previous generation. So every extension passes V1's `job_id` as `video_references`.
Capture V1's `job_id` once and reuse it for every extension.

## THE WORKFLOW

### STEP 0 — PREFLIGHT

Confirm the Higgsfield MCP is connected; check balance. Preflight one generation with
`get_cost: true`, multiply by the number of chunks, and tell me the total before spending.

Upload the cleaned reference images and the voice reference
(`media_upload` → `PUT` bytes → `media_confirm`); keep the `media_id`s.

If any reference still shows burned-in captions, a logo or UI, stop and clean it first. Seedance
will reproduce that text into every clip.

### STEP 1 — BUILD THE HUB (VIDEO 1)

`mode: omni_reference`

`medias`: cleaned stills as `image_references`, voice clip as `audio_references`, optional
`start_image` if we have a locked opening frame

`prompt`: the full text of PROMPT_1

`duration`: chunk 1's exact length (<30s) · `aspect_ratio`: 9:16 · resolution + audio per the brief

Wait with `jobs_wait`. Record V1's `job_id` — every extension depends on it.

### STEP 2 — QC GATE ON V1 (never skip)

V1 defines identity, wardrobe, set, lighting and grade for the entire video. Check and report:

- Identity and wardrobe match the references; face stable across the clip
- Zero hallucinated captions, text, logos or watermarks (instant fail — regenerate)
- Hands, faces, product geometry intact
- Dialogue correct, in sync, right voice
- Runs the full requested duration; grade and lighting match the brief

Do not generate a single extension until V1 passes. Every clip inherits its world from V1 — a
flawed hub means re-rendering the entire video.

### STEP 3 — FIRE ALL EXTENSIONS IN PARALLEL

For every remaining chunk, build an identical call shape:

`mode: video_extension`

`extension_mode: forward`

`medias`: V1's `job_id` as `video_references` + the original cleaned `image_references`
(re-attaching the stills measurably strengthens identity lock) + the voice reference

`prompt`: the full text of that chunk's prompt file

`duration`: that chunk's length

Do not pass `aspect_ratio` (inherited from V1)

Submit them together with `generate_video_batch` (up to 12 per submission, indexed), then await
with `jobs_wait` in groups of ≤12. For more than 12 chunks, submit in successive batches and
collect the indexed jobs. Finally display the whole set with one `show_generation_by_ids` call.

### STEP 4 — QC EVERY CLIP

Run the Step 2 checklist on each returned clip. Because every clip is one hop from V1, failures
are isolated — regenerate just that clip with a tightened prompt. Nothing else is affected.

Common fixes:

- **Clip opens looking like V1's ending** → the prompt's opening transition wasn't explicit enough;
  add a hard `CUT TO:` and describe the new framing in the first sentence.
- **Identity drifted** → re-attach the `image_references` (and add more angles of the subject).
- **Hallucinated captions appeared** → strengthen the negatives, and check the reference stills are
  clean.
- **Wrong scene entirely** → the prompt under-specified; it must establish the scene from scratch.

### STEP 5 — ASSEMBLE

Download all clips and concatenate in chunk order with ffmpeg:

```
# clips.txt file: V1.mp4 / V2.mp4 / ... in order

ffmpeg -f concat -safe 0 -i clips.txt -c copy final.mp4
```

If codecs/params differ between clips, re-encode instead:

```
ffmpeg -f concat -safe 0 -i clips.txt -c:v libx264 -c:a aac -movflags +faststart final.mp4
```

Because extensions branch from the hub rather than from each other, the joins between clips
are cuts, not continuous motion — which is what a multi-scene ad wants anyway. Cut on the beat.
Report the final duration and confirm it matches the intended structure.

## WHAT TO REPORT BACK TO ME

- Cost estimate for the full set before starting; actual credits spent after.
- V1's `job_id` and its QC result.
- The batch submission — how many extensions fired in parallel, and each `job_id`.
- Per-clip QC results, plus anything regenerated and why.
- Final assembled path and total duration.
- Anything Seedance could not produce faithfully — say it plainly rather than shipping a clip that
  misses the brief.

## HARD RULES

- Every extension references V1 — never another extension. No chaining.
- Never exceed duration 30 in a single call.
- Always pass `extension_mode: forward` with `video_extension`, and never pass it otherwise.
- Never pass `aspect_ratio` on an extension — set it once on V1.
- Never generate extensions before V1 passes QC.
- Every extension prompt must open with an explicit transition and establish its scene from
  scratch.
- Never let hallucinated captions or watermarks through — they defeat the entire method.

Start at Step 0: check the balance, estimate the total cost, confirm the references are clean, and
show me the plan before spending anything.
