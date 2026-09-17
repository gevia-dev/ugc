# PROMPT 1 — Pizza de São Paulo (0:00–~24.5s)

> **Notas de versão (v3):**
>
> 1. **Nomes dos estilos trocados para cidades/país.** Era "paulistana / carioca / napolitana". O Seedance errou a pronúncia de duas ("PAULISTINA", "napolitana"), então o roteiro passou a usar **"de São Paulo / do Rio de Janeiro / da Itália"** — mais fácil de pronunciar, mais direto e igualmente claro para o público.
> 2. **Gráfico "5 MIN" removido.** A versão anterior tinha um contador/velocímetro de 5 minutos no plano final. Ele apareceu no vídeo gerado e não deve existir. **Este chunk agora não tem NENHUM gráfico na tela.**
> 3. **Referências de pizza adicionadas.** A primeira geração inventou pizzas pálidas e sem apetite porque não havia referência visual de comida. Agora existem seis referências geradas no Nano Banana Pro (inteira + fatia de cada um dos três estilos).
> 4. **Correção factual mantida (v2):** a pizza de São Paulo é de massa fina, borda baixa, recheio farto e forno rápido — não o deep-dish de Chicago (massa grossa, molho por cima, 30 min) que a adaptação original tinha herdado por engano.
> 5. **Host:** o pizzaiolo da foto `host_pizzaiolo_ref.png` (~50 anos). Cenário permanece a cozinha doméstica.
>
> Os números de tempo/WPM na Seção 4 são **estimativas** — não há gravação de voz real ainda.

## 1. STYLE BIBLE

**This document is fully self-contained.** It is chunk 1 of 3 independent recreation prompts for a vertical pizza-review video, split at natural sentence/silence boundaries. This chunk covers 0.000s–~24.5s (the São Paulo segment). Two other chunks exist (Rio de Janeiro, then Itália) but you do not need them — everything required to generate this chunk is below.

### Host
- Adult man, appears early-to-mid fifties. Solid/sturdy build, broad shoulders. Light-medium olive skin. Dark, thick, expressive eyebrows. Clean-shaven. Warm, animated, talkative face — a working pizzaiolo who enjoys explaining his craft.
- **Head**: a black bandana/head-wrap tied at the back, printed with small white line-drawn garlic-bulb illustrations. Hair short and mostly covered.
- **Glasses**: thin metal-frame oval eyeglasses.
- **Wardrobe**: a white chef's jacket (dólmã), sleeves rolled up to just below the elbows, under a dark charcoal/black denim bib apron with a **brown leather neck strap with a brass grommet** and a **brown-leather-trimmed chest pocket**. A cream/off-white kitchen towel with **red stripes** over his **left shoulder**.
- **Performance**: warm, energetic, direct-to-camera, expressive mouth, frequent hand gestures. A generous craftsman talking, not a slick influencer.

### Location / Set
- Home kitchen. Camera-left: a white multi-panel door and a small basil plant in a colorful patterned ceramic pot. Camera-right: medium-toned wood cabinets, a stainless-steel range/oven with a gas stovetop, a small-pebble-mosaic backsplash, a red enameled pot, a red-and-white checked towel at the right edge.
- Front counter: light speckled white granite/quartz — where the pizza box sits.
- Food inserts/overhead shots: a dark, multi-tone walnut herringbone end-grain butcher-block table.
- **Lighting**: warm, soft, practical/ambient kitchen lighting; no color grade/LUT; medium contrast; smartphone-camera look, not a studio rig.

### Camera / Format
- Vertical 9:16, framed for mobile feed.
- Mix of static overhead top-down shots and static/lightly-handheld medium-to-close shots of the host.
- One fast whip-pan with visible motion blur (beat 6) and one soft push-in (beat 8).
- Clean, slightly soft "shot on phone" look, not crisp studio 4K. No artificial grain.

### Editing Rhythm
- Fast cuts: a new shot roughly every 1–4s.
- Narration is continuous voice-over that does NOT pause for cuts — hard cuts land mid-sentence, picture changing under uninterrupted speech.

### On-Screen Text — NONE
- **(a) Burned-in karaoke captions** — **REMOVE**. Clean spoken audio only.
- **(b) Platform chrome** (app UI, watermark, handle, logo) — **NONE**.
- **(c) Designed graphics** — **NONE IN THIS CHUNK.** A previous version had a "5 MIN" + speedometer graphic on the final beat; it has been **deleted**. This chunk must contain **zero** on-screen text, numbers, timers, clocks, counters, gauges or callouts of any kind.
- Packaging graphics physically printed on the real box are props, not overlays — see PROPS.

### Voice / Audio
- Single voice: **male, roughly 50 years old** — warm, slightly gravelly, mid-to-low register, natural Brazilian Portuguese, clear enunciation, no reverb (close-mic). Energetic but not shouty.
- **Do NOT use the legacy `voice_reference_host.wav`** — a man in his late twenties speaking English; wrong age, wrong language. Generate the voice natively from the description above.
- Loudness target if mixing: -18.4 LUFS integrated, true peak ≤ -1.5 dBFS, LRA ≈4.6 LU.
- No background music verified. An optional light, low, constant instrumental bed is acceptable but UNVERIFIED.

## 2. SPOKEN DIALOGUE (verbatim, Brazilian Portuguese)

> "Qual pizza é melhor: de São Paulo, do Rio de Janeiro ou da Itália? Vamos começar por São Paulo — a capital mundial da pizza. Aqui a massa é fina e a borda é baixa, mas o recheio é caprichado: muita mussarela, bem distribuída até a beirada. Ela assa rápido, em poucos minutos, e o cardápio tem dezenas de sabores. Em São Paulo, pizza boa se come de garfo e faca."

**English gloss (for the production team, not for dubbing):** "Which pizza is better: from São Paulo, from Rio de Janeiro, or from Italy? Let's start with São Paulo — the pizza capital of the world. Here the dough is thin and the border is low, but the topping is generous: lots of mozzarella, spread all the way to the edge. It bakes fast, in just a few minutes, and the menu has dozens of flavors. In São Paulo, good pizza is eaten with a fork and knife."

- **Word count**: 70 words. **Estimated spoken span**: ~24s at ~173 wpm — an estimate, not a measurement.
- **Naming note:** the style adjectives ("paulistana", "carioca", "napolitana") were replaced with plain place names ("de São Paulo", "do Rio de Janeiro", "da Itália") after the TTS mispronounced two of them. Do not reintroduce the adjectives anywhere in the spoken track.
- **Factual grounding** (all claims are real São Paulo pizza traits): São Paulo genuinely has one of the highest pizzeria counts of any city in the world; the dough is thin with a low border; the mozzarella load is famously generous and runs to the edge; it bakes in a few minutes; SP menus routinely run 50+ flavors; and eating pizza with cutlery is a well-known paulistano habit.

Deliver as one continuous, uninterrupted voice-over read. Do not pause at shot cuts.

## 3. SHOT-BY-SHOT

**Beat 1 — 0.000s–2.833s**
Camera: static overhead top-down, locked off, looking straight down at the dark herringbone butcher-block table.
Action: hands enter frame and place three pizza slices onto the tabletop in a triangular arrangement — the Rio slice first, then the São Paulo slice, then the Itália slice.
SFX: light ambient kitchen room-tone; a soft "tap" as each slice lands. Clean cold-open, no music sting.

**Beat 2 — 2.833s–3.500s**
Camera: static insert, close, overhead or near-overhead.
Action: close on the **Rio de Janeiro slice** — a very large wide wedge, thin in the centre but pliable, red sauce, melted mozzarella, browned slightly cupped pepperoni, distinctly golden puffed-up outer rim with light charred freckles.
Reference: `rio_slice.png`.
SFX: quick hard cut, no transition.

**Beat 3 — 3.500s–4.375s**
Camera: static insert, close.
Action: close on the **São Paulo slice** — thin flat base, very low border, a thick generous blanket of melted mozzarella running right out to the edge, only a thin line of sauce beneath the cheese.
Reference: `sp_slice.png`.
SFX: hard cut, no transition.

**Beat 4 — 4.375s–5.667s**
Camera: static insert, close.
Action: close on the **Itália slice** — tall puffy cornicione heavily freckled with dark leopard-spot char, thin floppy centre, San Marzano tomato, torn patches of fior di latte, a basil leaf.
Reference: `italia_slice.png`.
SFX: hard cut; last of the three rapid inserts before the host appears.

**Beat 5 — 5.667s–6.958s**
Camera: static or lightly handheld medium shot, host facing camera, behind the speckled granite counter.
Action: host's first appearance — bandana, glasses, white chef's jacket, denim apron, red-striped towel. Both hands rest on a closed kraft-brown pizza box on the counter. Mid-sentence: "...vamos começar por São Paulo — a capital mundial da pizza..."
Reference: `host_pizzaiolo_ref.png` (essentially this exact framing).
SFX: hard cut in from beat 4; kitchen ambience under dialogue.

**Beat 6 — 6.958s–8.458s**
Camera: whip-pan/zoom-in with pronounced motion blur, diving from the closed box into the now-open box.
Action: the box opens, revealing a whole São Paulo pizza — round, thin, flat, low border, blanketed edge to edge in melted mozzarella with golden blistered spots, pre-cut into eight wedges.
Reference: `sp_whole.png`.
SFX: fast whip-pan with directional motion blur; optional soft "whoosh"; blur resolves into a sharp landing frame.

**Beat 7 — 8.458s–9.292s**
Camera: static medium shot, host at the counter.
Action: a white ceramic plate in front of him with a slice on it; he begins cutting with a fork and knife.
SFX: hard cut; subtle utensil-on-ceramic clink.

**Beat 8 — 9.292s–10.292s**
Camera: same setup, pushed slightly closer.
Action: he continues cutting; the cheese stretches as the knife pulls through.
SFX: gentle push-in, not a hard cut — a continuation of beat 7 from tighter.

**Beat 9 — 10.292s–11.167s**
Camera: extreme close-up, static.
Action: the fork lifts a cut piece off the plate, showing the cross-section — a thin, crisp, pale-golden base carrying a notably thick layer of molten mozzarella, with a thin line of tomato sauce between them. Long cheese pull.
Reference: `sp_slice.png`.
SFX: hard cut; hold steady the full ~0.9s — this is the visual proof-point for "massa fina, recheio caprichado."

**Beat 10 — 11.167s–12.375s**
Camera: static or lightly handheld medium shot, host standing.
Action: host pinches thumb and forefinger almost together to show how **thin** the base is, then opens both hands wide and flat to show how **far the cheese spreads**.
SFX: hard cut; gesture broad and readable in vertical frame, hands not clipped at the edges.

**Beat 11 — 12.375s–14.750s**
Camera: extreme close-up, static, overhead or near-overhead.
Action: a knife cuts vertically straight down, through the thick cheese layer and then meeting the thin crisp base with an audible snap.
SFX: hold static the full ~2.4s; soft wet cutting through cheese, then a distinct crisp snap. The longest beat in the chunk — deliberate and slow against the surrounding fast cuts.

**Beat 12 — 14.750s–17.500s**
Camera: static or lightly handheld medium shot, host facing camera.
Action: host gestures animatedly through "...ela assa rápido, em poucos minutos, e o cardápio tem dezenas de sabores." On "dezenas de sabores" he fans a hand outward as if running down a long menu.
SFX: hard cut in from beat 11; warm and confident, not comedic.

**Beat 13 — 17.500s–20.125s**
Camera: static or lightly handheld medium-close, angled down toward the open box.
Action: a black flat spatula slides under a slice and lifts it out; the thin base flexes slightly but holds.
SFX: hard cut; soft scrape/lift sound; smooth confident motion, slice intact.

**Beat 14 — 20.125s–24.5s**
Camera: static or lightly handheld medium shot, host facing camera, holding the lifted slice up in front of him.
Action: host holds the slice up, smiling directly at camera, and lands the closing line "...Em São Paulo, pizza boa se come de garfo e faca," then holds the pose through a brief silent tail.
**On-screen graphic: NONE.** (The earlier "5 MIN" speedometer has been removed — no timer, clock, counter, gauge, number or text may appear here or anywhere else in the chunk.)
SFX: hold the pose and smile through the silent tail — this is the frame the video hands off from into chunk 2 (Rio de Janeiro). End on a clean, energetic, still-smiling hold, not a slack/neutral expression.

## 4. TIMING MATH

**Note:** all values are **estimates**. The original English audio was really measured (24.208s, 69 words, 173 wpm); this Portuguese line has never been voiced. Re-measure once a real voice pass exists.

| Metric | Value |
|---|---|
| Total chunk duration (estimated) | ~24.5s |
| Word count (Portuguese) | 70 words |
| Estimated spoken duration | ~24.0s at ~173 wpm |
| Silent/non-verbal tail | ~0.3s |
| Chunk length ≤30s? | Yes — comfortably under the cap |
| Clean boundaries? | Yes — starts at the true video start (cold open) and ends after "...garfo e faca." completes, with a brief silent beat |

## 5. ONE-PARAGRAPH VERSION

Open on a static overhead shot of a dark walnut herringbone butcher-block table as hands place three pizza slices — a huge foldable pepperoni slice from Rio, a thin low-bordered edge-to-edge-mozzarella slice from São Paulo, and a leopard-charred puffy-rimmed Neapolitan slice from Italy — into a triangular arrangement, followed by three rapid close-up inserts on each, while a warm ~50-year-old male voice asks in Brazilian Portuguese, "Qual pizza é melhor: de São Paulo, do Rio de Janeiro ou da Itália?"; cut to the host — a solidly built man in his early fifties in a black bandana printed with white garlic illustrations, thin metal-frame glasses, a white chef's jacket with sleeves rolled to the elbow under a dark denim apron with a brown leather neck strap, a red-striped cream towel over his left shoulder — behind a speckled granite counter in a warm home kitchen, both hands on a closed kraft-brown pizza box, saying "Vamos começar por São Paulo — a capital mundial da pizza"; a fast whip-pan with motion blur dives into the now-open box revealing a whole thin, flat, low-bordered pie blanketed edge to edge in melted mozzarella; cut to him cutting a slice on a white ceramic plate with fork and knife as he says "Aqui a massa é fina e a borda é baixa, mas o recheio é caprichado: muita mussarela, bem distribuída até a beirada," then an extreme close-up of the fork lifting a piece to show a thin crisp pale-golden base under a thick layer of molten cheese with a long cheese pull; he pinches his fingers to show how thin the base is then opens both hands wide; an extreme close-up of a knife cutting straight down, through thick cheese then snapping crisply through the thin base; he gestures warmly through "Ela assa rápido, em poucos minutos, e o cardápio tem dezenas de sabores"; a black spatula lifts a slice out of the box; and finally he holds the slice up, smiling, landing "Em São Paulo, pizza boa se come de garfo e faca," holding the pose through a brief silent beat as the chunk ends — all shot in a clean, slightly soft vertical-phone-camera look with fast cuts every 1–4 seconds and continuous Portuguese narration running under every cut, with absolutely no on-screen text, graphics, captions or platform UI anywhere in frame.

## 6. PROPS

- **Dark walnut herringbone end-grain butcher-block tabletop** — foreground surface for overhead shots.
- **Light speckled white granite/quartz counter** — where the pizza box rests in host shots.
- **Three pizza slices** (opening arrangement):
  - **Rio de Janeiro slice** — very large wide wedge, thin but pliable/foldable, red sauce, mozzarella, browned cupped pepperoni, golden puffed outer rim with light char freckles. (`rio_slice.png`)
  - **São Paulo slice** — thin flat base, very low border, thick edge-to-edge mozzarella blanket, thin sauce line beneath. (`sp_slice.png`)
  - **Itália slice** — tall puffy leopard-charred cornicione, thin floppy centre, San Marzano tomato, torn fior di latte, basil. (`italia_slice.png`)
- **Kraft-brown pizza box**: corrugated brown cardboard, printed in dark ink with a line-drawn pizzaiolo in a chef's toque holding a pizza, a bold slab-serif **"PIZZA"** wordmark, a red-and-green checkered border, and **"TRADIÇÃO"** / **"QUALIDADE"** along the bottom edge. Generic packaging — **not a real brand**, no city name.
- **Whole São Paulo pizza**: round, thin, flat, low border, edge-to-edge melted mozzarella with golden blistered spots, pre-cut into eight wedges. (`sp_whole.png`)
- **White ceramic plate**, **metal fork**, **kitchen knife**, **black flat spatula**.
- **Basil plant** in a colorful patterned ceramic pot, counter camera-left.

## 7. CONTINUITY

- **Host appearance**: same ~50-year-old man — black garlic-print bandana, thin metal-frame oval glasses, clean-shaven, thick dark eyebrows, solid build.
- **Host wardrobe**: white chef's jacket with sleeves rolled below the elbow, dark denim bib apron with brown leather neck strap (brass grommet) and brown-leather-trimmed chest pocket, cream towel with red stripes over the **left** shoulder.
- **Set**: same butcher block, same white multi-panel door and basil plant camera-left, same wood cabinets / stainless range / gas stovetop / pebble-mosaic backsplash / red enameled pot / red-and-white checked towel camera-right, same speckled granite counter.
- **Lighting**: warm, soft, practical/ambient, no color grade, medium contrast, smartphone look.
- **Editing pace**: ~1 cut every 1–4s, narration continuous across cuts.
- **Language and voice**: Brazilian Portuguese throughout, same ~50-year-old warm mid-to-low male voice in every chunk. Place names, never style adjectives.
- **Handoff**: ends on beat 14 — host holding the São Paulo slice up, smiling at camera, during a brief silent tail. Mid-pose, mid-smile, not resolved. Chunk 2 (Rio de Janeiro) picks up from this exact energy.

## 8. NEGATIVES

Do NOT generate:
- **Any on-screen text, numbers, graphics, captions, subtitles, timers, clocks, stopwatches, counters, speedometers, gauges, callouts, lower-thirds or logos — anywhere, at any point in this chunk.** This chunk is completely free of overlay graphics. In particular do not render a "5 MIN" or "30 MIN" timer or any clock/counter near the final shot; that graphic existed in an earlier version and was explicitly removed.
- Any platform chrome — no app UI, no watermark, no handle/username, no logo bug.
- **A thick, deep-dish or pan-style São Paulo pizza.** The base must read thin and flat with a low border.
- **Tomato sauce layered on top of the cheese.** Normal layering only: base, thin sauce, thick mozzarella on top.
- **Pale, raw-looking, doughy or unappetising pizza.** Every pizza must look freshly baked, hot, glossy and appetising, matching the supplied pizza reference images.
- A young host. He is a man in his fifties. Do not render him in his twenties or thirties, and do not remove the bandana or the glasses.
- Any Chinese characters, "麻辣" embroidery, or a plain black t-shirt on the host — that was a previous host's wardrobe.
- English dialogue anywhere — the host speaks Brazilian Portuguese throughout.
- The style adjectives "paulistana", "carioca" or "napolitana" in the spoken track — use only the place names "São Paulo", "Rio de Janeiro", "Itália".
- A real, identifiable pizzeria brand on the box.
- Studio-crisp 4K sharpness, artificial film grain, or a stylized color grade/LUT.

## 9. SEEDANCE 2.5 SETTINGS

```
model: seedance_2_5
mode: omni_reference          # this is the HUB video — chunks 2 and 3 extend from it
aspect_ratio: 9:16
duration: 25
resolution: 480p
generate_audio: true
language: pt-BR

medias (all role image_references):
  host_pizzaiolo_ref.png  b03a9dcb-d1a4-4fe5-9bcf-583ff7cdfd9b   # host + wardrobe + kitchen set + kraft box
  sp_whole.png            bad31cf7-9c9e-434e-9792-cab04f3a67db   # beat 6 — whole SP pie in the box
  sp_slice.png            75e9e3cd-a71f-47b7-abb4-2d2228d08ff3   # beats 3, 9, 13, 14 — SP slice + cross-section
  rio_slice.png           416d70fd-ce6a-44dd-8a6d-e9581508cd7b   # beat 2 — Rio slice in the opening trio
  italia_slice.png        8d6abcff-f835-4124-96ff-020f6f6af030   # beat 4 — Itália slice in the opening trio

# Held for chunks 2 and 3:
#   rio_whole.png     3a16ff99-9756-4417-8d38-0a88d1e99bd5
#   italia_whole.png  33215f4f-c268-407e-9676-d3a72f9fadf8

# DELIBERATELY NOT ATTACHED (and why):
#   ref1 / ref3 / ref4  -> the previous host (a different person) + the "麻辣" apron.
#   ref6                -> its "paulistana" slice is visibly deep-dish with sauce on top; hands are the old host's.
#   ref2 / ref5 / ref7 / ref9 -> all Chicago deep-dish geometry; would re-introduce the corrected error.
#   ref8                -> the old box; the host photo already supplies the box.
#   voice_reference_host.wav -> a man in his late twenties speaking English. Wrong age, wrong language.

voice_notes: single male voice, roughly 50 years old, warm and slightly gravelly, mid-to-low
             register, natural Brazilian Portuguese, clear enunciation, close-mic / no reverb.
             Ends with a brief silence (host still on camera) before the hard cut out.

audio_mix:
  loudness_integrated_lufs: -18.4
  true_peak_dbfs_max: -1.5
  loudness_range_lu: ~4.6

negative_prompts:
  - any on-screen text, numbers, timers, clocks, counters, gauges, speedometers or callouts
  - burned-in captions or subtitles
  - watermark or app UI chrome
  - thick deep-dish / pan-style pizza
  - tomato sauce on top of the cheese
  - pale, raw, doughy or unappetising pizza
  - young host (twenties/thirties), host without bandana or glasses
  - Chinese characters / "麻辣" embroidery / plain black t-shirt
  - English dialogue
  - studio-crisp sharpness, heavy color grade, added film grain
```
