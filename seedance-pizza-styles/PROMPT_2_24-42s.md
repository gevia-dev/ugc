# PROMPT 2 — Pizza do Rio de Janeiro (~0:25–0:45)

> **Notas de versão (v3) — alinhado ao V1 aprovado:**
>
> 1. **Nomes por lugar, não por adjetivo.** "Carioca" saiu da fala; agora é **"do Rio de Janeiro"**. O Seedance errou a pronúncia dos adjetivos no primeiro teste ("Paulistina", "Napaligiana"), e o V1 aprovado já usa nomes de cidade.
> 2. **Gráficos removidos.** As versões anteriores tinham um callout "18″" e um velocímetro "260°C / FORNO A GÁS". O V1 aprovado não tem gráfico nenhum, e o contador que apareceu nele foi reprovado — então **este chunk também não tem nenhum gráfico na tela**.
> 3. **Caixa unificada.** A caixa com ilustração de corrente/punho fechado era da referência americana. Agora é a mesma caixa kraft "PIZZA / TRADIÇÃO / QUALIDADE" estabelecida no V1.
> 4. **Referências de pizza reais.** `rio_whole.png` e `rio_slice.png` (Nano Banana Pro), para não repetir as pizzas pálidas da primeira geração.
> 5. **Host:** o pizzaiolo de ~50 anos do V1. Mesmo cenário.
>
> Este chunk é gerado como **`video_extension` a partir do V1** (job `151ba078-df5a-4734-a5b7-450d07b1a2c1`), não como geração independente.

## 1. STYLE BIBLE

**This document is fully self-contained.** It is chunk 2 of 3. It covers the Rio de Janeiro segment. It is generated as a forward extension of the chunk-1 hub video, so identity, wardrobe, set, lighting and grade are inherited — but the prompt must still establish the whole scene from scratch, because the model has never seen chunks 1 or 3.

### Host
Adult man, early-to-mid fifties — a working pizzaiolo. Solid/sturdy build, broad shoulders, light-medium olive skin, thick dark expressive eyebrows, clean-shaven, thin metal-frame oval eyeglasses. Warm, energetic, animated delivery with an expressive mouth and frequent hand gestures — a generous craftsman explaining something he knows well, not a slick influencer. Comfortable handling pizza and boxes bare-handed, direct-to-camera.

**Wardrobe (identical across the whole video):** a black bandana/head-wrap tied at the back, printed with small white line-drawn garlic-bulb illustrations; a white chef's jacket (dólmã) with sleeves rolled up to just below the elbows; over it a dark charcoal/black denim bib apron with a **brown leather neck strap with a brass grommet** and a **brown-leather-trimmed chest pocket**. A cream/off-white kitchen towel with **red stripes** over his **left shoulder**.

### Location / Set
Home kitchen. Camera-left: a white multi-panel door and a basil plant in a colorful patterned ceramic pot. Camera-right: medium-toned wood cabinets, a stainless steel range/oven with a gas stovetop, a small-pebble mosaic backsplash, a red enameled pot, a red-and-white checked towel at the right edge. Front counter: light speckled white granite. Overhead/tabletop food shots: a dark walnut herringbone end-grain butcher-block table.

**Lighting:** warm, soft, practical/ambient kitchen lighting. No stylized color grade or LUT, natural colour, medium contrast. Handheld smartphone look, not a lit studio rig.

### Camera / Format
Vertical 9:16 (inherited from the hub — do not set it on the extension call). Mix of static overhead top-down shots and static/lightly-handheld medium-to-close shots. Clean, slightly soft "shot on phone" look. No over-sharpening, no artificial film grain.

### Editing Rhythm
Fast cuts, a new shot roughly every 1–4 seconds. Narration is a continuous voice-over that does NOT pause for cuts — hard cuts land mid-sentence, picture changing under uninterrupted speech.

### On-Screen Text — NONE
- **(a) Burned-in captions** — REMOVE. Clean spoken audio only.
- **(b) Platform chrome** — NONE.
- **(c) Designed graphics** — **NONE IN THIS CHUNK.** Earlier versions specified an "18″" callout and a "260°C / FORNO A GÁS" speedometer. Both are **deleted**. Zero on-screen text, numbers, timers, gauges or callouts anywhere.
- Packaging printed on the real box is a prop, not an overlay.

### Voice / Audio
Single voice: **male, roughly 50 years old** — warm, slightly gravelly, mid-to-low register, natural Brazilian Portuguese, clear enunciation, close-mic, no reverb. Energetic but not shouty. Must match the voice established in chunk 1.

**Do NOT use the legacy `voice_reference_host.wav`** — a man in his late twenties speaking English. Wrong age, wrong language.

Loudness target if mixing: -18.4 LUFS integrated, true peak ≤ -1.5 dBFS, LRA ≈4.6 LU. No background music verified; an optional low, constant instrumental bed is acceptable but UNVERIFIED.

## 2. SPOKEN DIALOGUE (verbatim, Brazilian Portuguese)

> "A pizza do Rio de Janeiro é tão icônica quanto o Cristo Redentor. A massa é aberta à mão, num grande círculo, e sai uma fatia tão grande que uma só já resolve. Ela assa num forno a gás um pouco mais quente, até ganhar uma crosta dourada e inflada, crocante mas ainda dobrável."

**English gloss (for the production team, not for dubbing):** "Rio de Janeiro's pizza is as iconic as Christ the Redeemer. The dough is hand-stretched into a big circle, and the slice comes out so large that a single one already does the job. It bakes in a slightly hotter gas oven until it gets a golden, puffed-up crust that's crispy but still foldable."

- **Word count**: 54 words. **Estimated spoken span**: ~19s at ~168 wpm (the pace Seedance actually delivered in the approved V1 — measured from its transcript, not guessed).
- **Naming note:** "carioca" was replaced with "do Rio de Janeiro". Do not reintroduce the adjective in the spoken track.
- **Cultural reference:** "Cristo Redentor" replaces the original's "Statue of Liberty" — the Rio landmark with equivalent instant-recognition weight.
- **Never speak a temperature.** Earlier versions carried a visual-only "260°C" gauge; the gauge is gone and no number is spoken. Keep the oven description qualitative ("um pouco mais quente").

Deliver as one continuous, uninterrupted voice-over read. Do not pause at shot cuts.

## 3. SHOT-BY-SHOT

**Shot 15 — opening (~0.0s–3.5s of this chunk)**
**Transition:** HARD CUT IN. The previous chunk ended on the host holding up a São Paulo slice; this chunk opens on a **new, clearly different framing** — a medium shot of him behind the granite counter with a large closed kraft-brown pizza box in front of him. Do not open on a held slice.
**Action:** The host opens the large flat kraft-brown pizza box. The lid swings up and open toward camera.
**On-screen graphic:** none.
**SFX:** soft cardboard-lid creak/rustle as the box opens.

**Shot 16 — (~3.5s–6.5s)**
**Framing:** Medium close-up, static, on his face and upper body.
**Action:** He holds up a whole enormous Rio slice in front of his chest and face as a size sight-gag — big enough to partially obscure him — with a big, amused, animated expression.
**Reference:** `rio_slice.png` (slice appearance and proportions).
**SFX:** ambient kitchen room tone only.

**Shot 17 — (~6.5s–9.5s)**
**Framing:** Static overhead top-down, camera looking straight down at the butcher-block table.
**Action:** Close-up of the whole Rio pizza lying on the tabletop — very large, hand-stretched, red sauce, melted mozzarella, browned slightly cupped pepperoni pooling a little orange oil, a distinctly golden puffed outer rim with light charred freckles.
**Reference:** `rio_whole.png`.
**SFX:** ambient room tone.

**Shot 18 — (~9.5s–10.5s)**
**Framing:** Very short static overhead transition, same top-down angle.
**Action:** Hands enter frame and begin to lift and crease one slice lengthwise. Brief connective beat, about a second.
**SFX:** soft dough rustle as hands make contact.

**Shot 19 — (~10.5s–13.5s)**
**Framing:** Overhead or high-angle close-up on the tabletop.
**Action:** Hands fold the slice lengthwise down its centre; the base is visibly bending and holding its shape — demonstrating "crocante mas ainda dobrável", which lands right around this beat.
**On-screen graphic:** none.
**SFX:** soft crease/fold sound as the slice bends.

**Shot 20 — (~13.5s–16.5s)**
**Framing:** Extreme close-up macro, static, on the folded crust's cut edge.
**Action:** A thumb presses into the side of the folded crust, compressing it and revealing the airy crumb structure and open air pockets inside the golden puffed rim.
**SFX:** a soft, slightly springy "squish" as the thumb presses in. A slight push-in or rack focus suits the macro detail.

**Shot 21 — (~16.5s–20.0s) — FINAL BEAT OF THIS CHUNK**
**Framing:** Medium shot, static, back on the host facing camera.
**Action:** He holds the folded Rio slice up toward the camera, presenting it — a confident, satisfied hold with no new dialogue (this falls in the non-verbal tail). End on a clear held pose so chunk 3 can pick up cleanly.
**On-screen graphic:** none.
**SFX:** ambient room tone. No fade, no dissolve — end on a clean static hold.

## 4. TIMING MATH

**Note:** the pace figure below is now grounded — it is measured from the approved chunk-1 video's own transcript (70 words across ~25s ≈ 168 wpm), not carried over from the English original.

| Metric | Value |
|---|---|
| Target chunk duration | 20s |
| Word count (Portuguese) | 54 words |
| Estimated spoken duration | ~19s at ~168 wpm |
| Non-verbal tail | ~1s |
| Chunk length ≤30s? | Yes |
| Clean start/end boundaries? | Yes — starts on a full sentence, ends after "...crocante mas ainda dobrável." completes |

## 5. ONE-PARAGRAPH VERSION

Hard cut to a medium shot of a pizzaiolo in his early fifties — black bandana printed with white garlic illustrations, thin metal-frame glasses, white chef's jacket with sleeves rolled to the elbow under a dark denim apron with a brown leather neck strap, a red-striped cream towel over his left shoulder — standing behind a light speckled granite counter in a warm home kitchen (white paneled door and a basil plant camera-left, wood cabinets and a stainless range camera-right), opening a large flat kraft-brown pizza box printed with a line-drawn pizzaiolo, a bold "PIZZA" wordmark, a red-and-green checkered border and the words "TRADIÇÃO" and "QUALIDADE"; speaking warmly in Brazilian Portuguese he says, "A pizza do Rio de Janeiro é tão icônica quanto o Cristo Redentor. A massa é aberta à mão, num grande círculo, e sai uma fatia tão grande que uma só já resolve. Ela assa num forno a gás um pouco mais quente, até ganhar uma crosta dourada e inflada, crocante mas ainda dobrável," while the video cuts rapidly between him holding an enormous slice up in front of his face as a size gag, an overhead close-up of the whole large pepperoni pie on a dark herringbone butcher-block table with its golden puffed freckled rim, hands folding a slice lengthwise so the base bends and holds, an extreme macro of a thumb pressing into the folded crust to reveal its airy open crumb, and finally the host holding the folded slice up toward camera in a satisfied silent beat — all in a soft, slightly low-resolution, handheld vertical phone-camera style with no on-screen text, no graphics, no captions, no platform UI and no colour grade.

## 6. PROPS

- **Kraft-brown pizza box** (same box as chunk 1): large, flat, brown corrugated cardboard, printed in dark ink with a line-drawn pizzaiolo in a chef's toque holding a pizza, a bold slab-serif **"PIZZA"** wordmark, a red-and-green checkered border, and **"TRADIÇÃO"** / **"QUALIDADE"** along the bottom edge. Generic packaging, not a real brand.
- **Rio de Janeiro pizza** (whole pie, then one slice): very large diameter, hand-stretched, thin in the centre but pliable and foldable rather than cracker-crisp, red tomato sauce, melted mozzarella, plenty of browned slightly cupped pepperoni rounds pooling a little orange oil, and a distinctly golden puffed-up airy outer rim with light charred freckles. A single slice is proportionally huge against the host's face. (`rio_whole.png`, `rio_slice.png`)
- **Dark walnut herringbone end-grain butcher-block tabletop** — same table as chunk 1, used for the overhead fold/press shots.
- **Light speckled white granite counter** — same as chunk 1.

## 7. CONTINUITY

- **Host wardrobe/likeness:** same ~50-year-old man, same black garlic-print bandana, same thin metal-frame oval glasses, same white chef's jacket with rolled sleeves, same dark denim bib apron with brown leather neck strap and brown-leather-trimmed chest pocket, same cream towel with red stripes over the **left** shoulder. Same face, same build.
- **Set:** identical butcher-block table, white paneled door and basil plant camera-left, wood cabinets / stainless range / gas stovetop / pebble-mosaic backsplash / red enameled pot / red-and-white checked towel camera-right, same speckled granite counter.
- **Lighting:** same warm, soft, practical/ambient light, no grade shift, no white-balance shift between chunks.
- **Language and voice:** Brazilian Portuguese, same ~50-year-old warm mid-to-low male voice. Place names, never style adjectives.
- **Editing pace:** same fast-cut rhythm, same continuous-narration-under-cuts approach.
- **Opening:** picks up the energy from chunk 1's end — mid-enthusiasm, moving straight into opening the new box, not a cold restart. But the FRAMING must change immediately (see Shot 15 transition note), so the clip does not open looking like chunk 1's last frame.
- **Closing hand-off:** ends on shot 21, the host holding the folded Rio slice up toward camera in a satisfied pose. Chunk 3 picks up from exactly this beat. Do not button it with an extra reaction shot, extra dialogue, or a fade.

## 8. NEGATIVES

Do NOT generate:
- **Any on-screen text, numbers, graphics, captions, subtitles, timers, clocks, counters, speedometers, gauges, callouts, lower-thirds or logos — anywhere in this chunk.** In particular do not render an "18″" callout or a "260°C" / "FORNO A GÁS" gauge; both existed in earlier versions and were removed.
- Any platform chrome — no app UI, no watermark, no handle, no logo bug.
- **Pale, raw-looking, doughy or unappetising pizza.** It must look freshly baked, hot, glossy and appetising, matching the supplied pizza references.
- A thin cracker-crisp Rio base that cannot fold, or a thick deep-dish one. It is thin in the centre but pliable, with a puffed golden rim.
- A young host. He is in his fifties. Do not remove the bandana or the glasses.
- Chinese characters, "麻辣" embroidery, or a plain black t-shirt — that was a previous host's wardrobe.
- A thumbs-up gesture or a chain-and-fist illustration on the box lid — that art came from the American source and is gone; the box is the kraft "PIZZA / TRADIÇÃO / QUALIDADE" one.
- English dialogue anywhere.
- The word "carioca" in the spoken track — use "do Rio de Janeiro".
- Any spoken temperature or number.
- Over-sharpened studio-4K visuals, artificial film grain, or a stylized colour grade.
- A fade or dissolve out of the final shot — end on a clean static hold.

## 9. SEEDANCE 2.5 SETTINGS

```
model: seedance_2_5
mode: video_extension
extension_mode: forward
duration: 20
resolution: 480p
generate_audio: true
language: pt-BR
# Do NOT pass aspect_ratio — inherited from the hub.

medias:
  video_references: 151ba078-df5a-4734-a5b7-450d07b1a2c1   # the approved chunk-1 hub
  image_references:
    host_pizzaiolo_ref.png  b03a9dcb-d1a4-4fe5-9bcf-583ff7cdfd9b   # identity lock
    rio_whole.png           3a16ff99-9756-4417-8d38-0a88d1e99bd5   # shot 17
    rio_slice.png           416d70fd-ce6a-44dd-8a6d-e9581508cd7b   # shots 16, 19-21

# DELIBERATELY NOT ATTACHED:
#   ref1 / ref3 / ref4 / ref10  -> the previous host (a different, much younger person).
#   voice_reference_host.wav    -> late-twenties man speaking English.

voice_notes: single male voice, roughly 50 years old, warm and slightly gravelly, mid-to-low
             register, natural Brazilian Portuguese, close-mic / no reverb — identical to the
             voice established in chunk 1.

negative_prompts:
  - any on-screen text, numbers, timers, gauges, speedometers or callouts
  - "18" inch callout, "260°C", "FORNO A GÁS" text
  - burned-in captions or subtitles
  - watermark or app UI chrome
  - pale, raw, doughy or unappetising pizza
  - young host, host without bandana or glasses
  - Chinese characters / "麻辣" embroidery
  - thumbs-up or chain-and-fist art on the box lid
  - English dialogue
  - studio-crisp sharpness, heavy colour grade, added film grain
  - fade or dissolve at the end
```
