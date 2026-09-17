# PROMPT 3 — Pizza da Itália (~0:45–1:07) — CHUNK FINAL

> **Notas de versão (v3) — alinhado ao V1 aprovado:**
>
> 1. **Host trocado.** Este arquivo ainda descrevia o apresentador antigo (final dos 20 anos, avental com bordado "麻辣"). Agora é o mesmo pizzaiolo de ~50 anos dos chunks 1 e 2.
> 2. **Nomes por lugar.** "Napolitana" saiu inteiramente da fala — o Seedance errou a pronúncia no primeiro teste. Agora é **"da Itália"**, exatamente como na pergunta de abertura do chunk 1.
> 3. **Gráficos removidos.** A placa azul de estrada "Bem-vindo a Nápoles / UNESCO" e o traçado oval desenhado à mão **foram deletados**. O V1 aprovado não tem nenhum gráfico e o contador que apareceu nele foi reprovado. Este chunk também é 100% limpo. O fato da UNESCO continua — mas **falado**, não escrito na tela.
> 4. **Caixa unificada.** A caixa branca fictícia "Antica Napoli" com ícone de cabeça de cachorro saiu; conflitava com a caixa kraft "PIZZA / TRADIÇÃO / QUALIDADE" que já está estabelecida no V1 e no chunk 2. É a mesma caixa nos três chunks.
> 5. **Correção factual.** A descrição herdada era de *New Haven apizza* ("crosta mais fina e crocante"), não de pizza napolitana. Pizza italiana de verdade tem **borda alta, aerada e com manchas de leopardo**, centro fino e macio, forno a lenha muito quente, assada em pouquíssimo tempo. Mesmo tipo de erro que foi corrigido na paulistana no chunk 1.
> 6. **Referências de pizza reais.** `italia_whole.png` e `italia_slice.png` (Nano Banana Pro).
>
> Este chunk é gerado como **`video_extension` a partir do V1** (job `151ba078-df5a-4734-a5b7-450d07b1a2c1`), não como geração independente e não encadeado no chunk 2.

## 1. STYLE BIBLE

**This document is fully self-contained.** It is chunk 3 of 3 and the **final chunk of the entire video**. It ends cold — no loop back to the opening frame, no CTA, no outro card. It is generated as a forward extension of the chunk-1 hub, so identity, wardrobe, set, lighting and grade are inherited — but the prompt must still establish the whole scene from scratch, because the model has never seen chunks 1 or 2.

### Host
Adult man, early-to-mid fifties — a working pizzaiolo. Solid/sturdy build, broad shoulders, light-medium olive skin, thick dark expressive eyebrows, clean-shaven, thin metal-frame oval eyeglasses. Warm, energetic, animated delivery with an expressive mouth and frequent hand gestures. In this chunk specifically: a touch of reverence on the UNESCO line, then a satisfied, playful closing expression on the final shot.

**Wardrobe (identical across the whole video):** a black bandana/head-wrap tied at the back, printed with small white line-drawn garlic-bulb illustrations; a white chef's jacket (dólmã) with sleeves rolled up to just below the elbows; over it a dark charcoal/black denim bib apron with a **brown leather neck strap with a brass grommet** and a **brown-leather-trimmed chest pocket**. A cream/off-white kitchen towel with **red stripes** over his **left shoulder**.

### Location / Set
Home kitchen. Camera-left: a white multi-panel door and a basil plant in a colorful patterned ceramic pot. Camera-right: medium-toned wood cabinets, a stainless steel range/oven with a gas stovetop, a small-pebble mosaic backsplash, a red enameled pot, a red-and-white checked towel at the right edge. Front counter: light speckled white granite. Overhead/tabletop food shots: a dark walnut herringbone end-grain butcher-block table.

**Lighting:** warm, soft, practical/ambient kitchen lighting. No stylized colour grade or LUT, natural colour, medium contrast. Handheld smartphone look, not a lit studio rig.

### Camera / Format
Vertical 9:16 (inherited from the hub — do not set it on the extension call). Mix of static overhead top-down shots and static/lightly-handheld medium-to-close shots. One slow digital push-in (shot 24). No whip-pans in this chunk. Clean, slightly soft "shot on phone" look. No over-sharpening, no artificial film grain.

### Editing Rhythm
Fast cuts, a new shot roughly every 2–4 seconds. Narration is a continuous voice-over that does NOT pause for cuts — hard cuts land mid-sentence, picture changing under uninterrupted speech.

**This chunk ends the video.** It ends on the final technical line ("tostada, mas não queimada") with the host's satisfied closing gesture. No fade, no music sting, no loop, no CTA.

### On-Screen Text — NONE
- **(a) Burned-in captions** — REMOVE. Clean spoken audio only.
- **(b) Platform chrome** — NONE.
- **(c) Designed graphics** — **NONE IN THIS CHUNK.** Earlier versions specified a blue Naples/UNESCO road-sign card and a hand-drawn oval outline over the pizza. **Both are deleted.** Zero on-screen text, numbers, signs, doodles or callouts anywhere.
- Packaging printed on the real box is a prop, not an overlay.
- The UNESCO fact survives as **spoken dialogue**, which is where it actually lands better anyway.

### Voice / Audio
Single voice: **male, roughly 50 years old** — warm, slightly gravelly, mid-to-low register, natural Brazilian Portuguese, clear enunciation, close-mic, no reverb. Energetic but not shouty. Must match the voice established in chunks 1 and 2. Let "UNESCO" land clearly as an emphasised standalone word.

**Do NOT use the legacy `voice_reference_host.wav`** — a man in his late twenties speaking English. Wrong age, wrong language.

Loudness target if mixing: -18.4 LUFS integrated, true peak ≤ -1.5 dBFS, LRA ≈4.6 LU. No background music verified; an optional low, constant instrumental bed is acceptable but UNVERIFIED — and if used it must have **no ending sting**, since the video stops cold.

## 2. SPOKEN DIALOGUE (verbatim, Brazilian Portuguese)

> "E na Itália, o berço da pizza, isso aqui não é só comida: é uma arte protegida pela UNESCO. A massa é aberta à mão, num formato bem mais livre, e assa num forno a lenha muito mais quente, em pouquíssimo tempo. Sai com a borda alta, cheia de ar e com manchinhas escuras — tostada, mas não queimada."

**English gloss (for the production team, not for dubbing):** "And in Italy, the birthplace of pizza, this isn't just food — it's an art form protected by UNESCO. The dough is hand-stretched into a much looser shape, and it bakes in a far hotter wood-fired oven, in almost no time at all. It comes out with a tall, airy rim covered in dark spots — charred, not burnt."

- **Word count**: 58 words. **Estimated spoken span**: ~21s at ~168 wpm (the pace Seedance actually delivered in the approved V1 — measured from its transcript).
- **Naming note:** "napolitana" is gone entirely, and so is "Nápoles". The segment is called **"a Itália"**, matching the opening question in chunk 1 ("de São Paulo, do Rio de Janeiro ou da Itália?"). Do not reintroduce either word.
- **Factual correction:** the previous line described a *thin, crispy* crust — that was the New Haven apizza description carried over from the American source. Real Neapolitan pizza has a **tall, puffy, air-filled, leopard-spotted cornicione** with a thin, soft centre. The line now describes that.
- **No spoken numbers**, no temperature, no bake time in minutes — "muito mais quente", "em pouquíssimo tempo".
- **Dropped joke:** the original's punchline was "ah-beetz" (New Haven locals' pronunciation of "apizza"), which has no Naples equivalent. It was replaced by the UNESCO fact — same narrative function (a surprising did-you-know that recontextualises the pizza), real and verifiable. The related "circle inspired?" gag and its hand-drawn oval overlay are both dropped along with the graphics.

Deliver as one continuous, uninterrupted voice-over read. Do not pause at shot cuts.

## 3. SHOT-BY-SHOT

**Shot 22 — opening (~0.0s–3.5s of this chunk)**
**Transition:** HARD CUT IN. Open on a **new, clearly different framing** — a medium shot of the host standing at the granite counter, lifting a large closed kraft-brown pizza box up to chest height with both hands, the printed lid facing camera. Do not open on a held slice.
**Action:** He presents the box to the lens, mid-delivery on "E na Itália, o berço da pizza...".
**On-screen graphic:** none.
**SFX:** ambient kitchen room tone.

**Shot 23 — (~3.5s–7.0s)**
**Framing:** Static insert, slow digital push-in toward the box lid, settling on a tight framing of the printed artwork.
**Action:** The push-in lands on the lid: a line-drawn pizzaiolo in a chef's toque holding a pizza, the bold slab-serif **"PIZZA"** wordmark, a red-and-green checkered border, **"TRADIÇÃO"** and **"QUALIDADE"**. His hands steady the box at the frame edges. The UNESCO line lands as the zoom settles.
**On-screen graphic:** none.
**SFX:** ambient room tone only — let "UNESCO" read clearly.

**Shot 24 — (~7.0s–10.5s)**
**Framing:** Medium-close, lightly handheld, angled down toward the box.
**Action:** He opens the lid, revealing the Italian pizza inside — noticeably **irregular and hand-shaped, not a machine-perfect circle**, with a tall puffed rim, a thin centre, torn white mozzarella, red San Marzano-style sauce and a few fresh basil leaves.
**Reference:** `italia_whole.png`.
**On-screen graphic:** none. (The hand-drawn oval doodle from earlier versions is deleted.)
**SFX:** soft cardboard-flex sound as the lid opens.

**Shot 25 — (~10.5s–14.0s)**
**Framing:** Static insert, close-to-medium, overhead or three-quarter angle over the butcher-block table.
**Action:** A slice is lifted out and flipped bottom-side up, revealing a **charred, dark-blistered underside** — visibly more scorched than the São Paulo or Rio crusts, with near-black leopard spots alongside toasted brown. The thin centre droops slightly under its own weight.
**Reference:** `italia_slice.png`.
**SFX:** hard cut in, no transition effect. The charred underside is the clear focal point, lit well enough to read the blistering despite the dark tone.

**Shot 26 — (~14.0s–17.5s)**
**Framing:** Extreme close-up, static, macro on the cut edge of the rim.
**Action:** The cross-section of the tall cornicione — charred exterior, large open air pockets inside, a soft airy crumb. "...tostada, mas não queimada" lands here.
**Reference:** `italia_slice.png`.
**SFX:** ambient room tone only.

**Shot 27 — (~17.5s–21.0s) — FINAL SHOT OF THE ENTIRE VIDEO**
**Framing:** Medium-close, static or lightly handheld, host facing camera.
**Action:** He holds the Italian slice up near shoulder height with a satisfied, slightly playful expression, one hand gesturing toward the lens as a direct-address closing beat. The kraft box is visible in the lower foreground. The last word resolves into a short silent hold.
**On-screen graphic:** none.
**SFX:** hard cut in. Hold on the satisfied expression through the silent tail, then **stop**. No fade to black, no music sting, no loop back to the opening, no CTA, no subscribe prompt. Cold ending by design — do not soften or extend it.

## 4. TIMING MATH

**Note:** the pace figure below is grounded — measured from the approved chunk-1 video's own transcript (70 words across ~25s ≈ 168 wpm), not carried over from the English original.

| Metric | Value |
|---|---|
| Target chunk duration | 22s |
| Word count (Portuguese) | 58 words |
| Estimated spoken duration | ~21s at ~168 wpm |
| Non-verbal tail | ~1s |
| Number of shots | 6 (shots 22–27) |
| Average shot length | ~3.5s |
| Chunk length ≤30s? | Yes |
| Clean start/end boundaries? | Yes — opens on a full sentence, ends after "...tostada, mas não queimada." completes |
| Next-chunk hand-off | **None.** Final chunk. Generate no continuation, loop or outro. |

## 5. ONE-PARAGRAPH VERSION

Hard cut to a medium shot of a pizzaiolo in his early fifties — black bandana printed with white garlic illustrations, thin metal-frame glasses, white chef's jacket with sleeves rolled to the elbow under a dark denim apron with a brown leather neck strap, a red-striped cream towel over his left shoulder — standing at a light speckled granite counter in a warm home kitchen (white paneled door and a basil plant camera-left, wood cabinets and a stainless range camera-right), lifting a large kraft-brown pizza box printed with a line-drawn pizzaiolo, a bold "PIZZA" wordmark, a red-and-green checkered border and the words "TRADIÇÃO" and "QUALIDADE"; speaking warmly in Brazilian Portuguese he says, "E na Itália, o berço da pizza, isso aqui não é só comida: é uma arte protegida pela UNESCO. A massa é aberta à mão, num formato bem mais livre, e assa num forno a lenha muito mais quente, em pouquíssimo tempo. Sai com a borda alta, cheia de ar e com manchinhas escuras — tostada, mas não queimada," while the camera pushes slowly in on the printed box lid, he opens it to reveal a hand-shaped, deliberately irregular Neapolitan pizza with a tall puffed rim, torn white mozzarella, red sauce and fresh basil, a slice is flipped to show a charred dark-blistered underside, an extreme macro reveals the big open air pockets inside the charred rim, and the video ends cold on the host holding the slice up near his shoulder with a satisfied expression and a gesture toward the lens — all in a soft, slightly low-resolution, handheld vertical phone-camera style with no on-screen text, no graphics, no captions, no platform UI and no colour grade.

## 6. PROPS

- **Kraft-brown pizza box** (same box as chunks 1 and 2): large, flat, brown corrugated cardboard, printed in dark ink with a line-drawn pizzaiolo in a chef's toque holding a pizza, a bold slab-serif **"PIZZA"** wordmark, a red-and-green checkered border, and **"TRADIÇÃO"** / **"QUALIDADE"** along the bottom edge. Generic packaging, not a real brand. The fictional "Antica Napoli" white box with a dog-head icon and "EST. 2021" is **removed** — it conflicted with the box already established in the approved hub.
- **The Italian (Neapolitan) pizza:** roughly 12–13 inches, hand-stretched into a deliberately **irregular, non-circular** shape. A **tall, puffed, airy outer rim (cornicione)** covered in dark leopard-spot blisters. Thin, soft, slightly wet centre — red San Marzano-style tomato sauce, torn white fior di latte mozzarella in irregular patches rather than an even grated layer, fresh basil leaves, a thread of olive oil. Underside charred with near-black spots over toasted brown. Cross-section of the rim shows large open air pockets. (`italia_whole.png`, `italia_slice.png`)
- **Dark walnut herringbone end-grain butcher-block tabletop** — same table as chunks 1 and 2.
- **Light speckled white granite counter** — same as chunks 1 and 2.

## 7. CONTINUITY

- **Host wardrobe/likeness:** same ~50-year-old man, same black garlic-print bandana, same thin metal-frame oval glasses, same white chef's jacket with rolled sleeves, same dark denim bib apron with brown leather neck strap and brown-leather-trimmed chest pocket, same cream towel with red stripes over the **left** shoulder. Same face, same build.
- **Set:** identical butcher-block table, white paneled door and basil plant camera-left, wood cabinets / stainless range / gas stovetop / pebble-mosaic backsplash / red enameled pot / red-and-white checked towel camera-right, same speckled granite counter.
- **Lighting:** same warm, soft, practical/ambient light, no grade shift, no white-balance shift between chunks.
- **Language and voice:** Brazilian Portuguese, same ~50-year-old warm mid-to-low male voice. Place names, never style adjectives.
- **Editing pace:** same fast-cut rhythm, same continuous-narration-under-cuts approach.
- **Opening:** picks up the energy from the previous segment — already mid-enthusiasm, moving straight into presenting the new box, not a cold restart. But the FRAMING must change immediately (see Shot 22 transition note) so the clip does not open looking like the hub's last frame.
- **Hard ending, no loop:** shot 27 is the last frame of the entire video. No return to the opening frame, no CTA overlay, no outro card, no follow/subscribe prompt, nothing generated after that point.

## 8. NEGATIVES

Do NOT generate:
- **Any on-screen text, numbers, graphics, captions, subtitles, timers, road signs, doodles, hand-drawn outlines, callouts, lower-thirds or logos — anywhere in this chunk.** In particular do not render the blue "Bem-vindo a Nápoles / UNESCO" road-sign card or the hand-drawn oval over the pizza; both existed in earlier versions and were removed.
- Any platform chrome — no app UI, no watermark, no handle, no logo bug.
- Any CTA, "subscribe", "follow", "comente aqui" or similar prompt.
- A looping final frame or any visual callback to the video's opening. The video ends cold.
- **Pale, raw-looking, doughy or unappetising pizza.** It must look freshly baked, hot and appetising, matching the supplied pizza references.
- A perfectly circular, machine-pressed Italian pizza — it is hand-stretched and deliberately irregular.
- A thin, flat, uniformly crispy cracker crust with no rim. The Italian pizza has a **tall, puffed, air-filled leopard-spotted rim** and a thin soft centre.
- An evenly grated blanket of mozzarella — it is torn white fior di latte in irregular patches.
- A white pizza box, a dog-head icon, an "Antica Napoli" wordmark or "EST. 2021" text. The box is the kraft "PIZZA / TRADIÇÃO / QUALIDADE" one.
- A young host. He is in his fifties. Do not remove the bandana or the glasses.
- Chinese characters, "麻辣" embroidery, or a plain black t-shirt — that was a previous host's wardrobe.
- English dialogue anywhere.
- The words "napolitana" or "Nápoles" in the spoken track — use "a Itália".
- Any spoken temperature, bake time in minutes, or other number.
- Extra dialogue, taglines or a spoken sign-off beyond the verbatim quote in Section 2.
- Over-sharpened studio-4K visuals, artificial film grain, or a stylized colour grade.
- A fade, dissolve or music sting at the end — hard stop on the final held frame.

## 9. SEEDANCE 2.5 SETTINGS

```
model: seedance_2_5
mode: video_extension
extension_mode: forward
duration: 22
resolution: 480p
generate_audio: true
language: pt-BR
# Do NOT pass aspect_ratio — inherited from the hub.

medias:
  video_references: 151ba078-df5a-4734-a5b7-450d07b1a2c1   # the approved chunk-1 hub
  image_references:
    host_pizzaiolo_ref.png  b03a9dcb-d1a4-4fe5-9bcf-583ff7cdfd9b   # identity lock
    italia_whole.png        33215f4f-c268-407e-9676-d3a72f9fadf8   # shot 24
    italia_slice.png        8d6abcff-f835-4124-96ff-020f6f6af030   # shots 25-27

# DELIBERATELY NOT ATTACHED:
#   ref1 / ref3 / ref4          -> the previous host (a different, much younger person).
#   ref11 / ref12               -> New Haven slice + the old white box logo.
#   voice_reference_host.wav    -> late-twenties man speaking English.

voice_notes: single male voice, roughly 50 years old, warm and slightly gravelly, mid-to-low
             register, natural Brazilian Portuguese, close-mic / no reverb — identical to the
             voice established in chunks 1 and 2. Let "UNESCO" land as an emphasised word.

ending_behavior: hard stop after shot 27 — no fade, no loop, no outro card, no music sting.
                 This is the final chunk of the video.

negative_prompts:
  - any on-screen text, numbers, road signs, doodles, hand-drawn outlines or callouts
  - "Bem-vindo a Nápoles" / UNESCO sign card, hand-drawn oval over the pizza
  - burned-in captions or subtitles
  - watermark or app UI chrome
  - CTA / subscribe / follow overlay
  - pale, raw, doughy or unappetising pizza
  - perfectly circular machine-pressed pizza
  - thin flat crispy crust with no rim
  - evenly grated mozzarella blanket
  - white pizza box, dog-head icon, "Antica Napoli", "EST. 2021"
  - young host, host without bandana or glasses
  - Chinese characters / "麻辣" embroidery
  - English dialogue
  - studio-crisp sharpness, heavy colour grade, added film grain
  - fade, dissolve or music sting at the end
```

---

*End of PROMPT_3_42-59s.md — chunk 3 of 3, final chunk.*
