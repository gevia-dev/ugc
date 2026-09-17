# Teardown forense — "Which American pizza style is the best?" (Chicago vs. New York vs. New Haven)

**Fonte:** `C:\Users\FELIP\Downloads\videoplayback.mp4` (arquivo local, copiado para `D:\gevia\ugc\teardown-pizza-styles\source.mp4`)
**Duração:** 59.178667 s | **Resolução:** 360×640 (vertical, 9:16, `is_vertical: true`) | **FPS:** 24 (constante) | **Codec vídeo:** H.264 (Constrained Baseline) | **Codec áudio:** AAC-LC, 48 kHz estéreo | **Bitrate:** 592,951 bps | **Container:** mp4 (tag `encoder: Google` — provavelmente recodificado/exportado por um app Google/Android em algum ponto da cadeia)
**Sem faixa de legenda embutida** (`has_embedded_subtitle_stream: false`).

---

## FASE 0 — Intake & Probe

- `SKILL_DIR` = `C:\Users\FELIP\.claude\skills\video-teardown`. Guard confirmado (`probe.py`, `grab.py`, `transcribe_local.py` presentes).
- Arquivo já era local — sem `yt-dlp`, sem legenda nativa, sem `info.json` de plataforma.
- `probe.py` rodado com limiares padrão (`--hard-cut 0.25` default, `--scene-floor` default): `python probe.py source.mp4 --out probe.json`. Resultado salvo em `probe.json`.
- `/watch` (plugin `claude-video`, `WATCH_SKILL_DIR = C:\Users\FELIP\.claude\plugins\cache\claude-video\watch\0.2.0\skills\watch`) rodado com `--detail balanced --no-whisper` (Whisper desativado deliberadamente aqui — ver desvio #2 abaixo) → 31 frames extraídos por scene-detection em `watch\frames\`.
- Chave Whisper: `setup.py --json` → `has_api_key: false`, `has_local_whisper: true`. **Portão da Regra Dura nº 1:** situação = "sem caption track, sem chave cloud" → mas com Whisper **local** disponível, então não é o caso de parada total; segui para transcrição local (fonte de verdade = Whisper local).

---

## FASE 0.5 — Segunda leitura (Higgsfield MCP)

MCP `higgsfield` estava conectado. Como o vídeo é arquivo local (não YouTube), segui o fluxo de upload:

1. `media_upload(filename="source.mp4", content_type="video/mp4")` → `media_id = 5a99ce72-c043-47ce-a29f-1a3eb3d161e6`, `upload_url` presignada (S3, expira em 24h).
2. `curl -X PUT -H "Content-Type: video/mp4" --data-binary @source.mp4 "<upload_url>"` → **HTTP 200**.
3. `media_confirm(type="video", media_id=...)` → `status: uploaded`.
4. `video_analysis_create(video_input_id="5a99ce72-c043-47ce-a29f-1a3eb3d161e6")` → `video_analyze_id = 5a16472c-3666-4e2b-973a-e1ff0d226ac3`, `status: queued` (criado às 16:53:55 UTC).
5. Poll único em `video_analysis_status` → `status: completed` às 16:54:47 UTC. **Tempo total: ~52 segundos** (bem abaixo da estimativa de 3–5 min da própria ferramenta para clipes curtos).

JSON bruto salvo em `higgsfield_scenes.json` (27 "cenas", granularidade ~1–4s, cada uma com `audio`, `visual`, `shot_type`, `label`). Esse resultado é tratado como **hipótese**, nunca como fato — ver Fase 4.5.

---

## FASE 1 — Corte e ritmo (medido, `probe.json`)

**Limiares usados:** hard-cut = 0.25 (default), scene-floor = default. Não precisei ajustar — o material não é handheld trêmulo nem jump-cut sutil no mesmo enquadramento.

- **`single_take: false`.**
- **26 cortes duros → 27 planos.**
- **Duração de plano:** média 2.192 s | mín 0.667 s | máx 4.083 s.
- **Ritmo:** 26.36 cortes/minuto — edição rápida, típica de vídeo de comida vertical para feed.
- **Desenho do ritmo:** não é uniforme. O bloco de abertura (0–5.667s) tem 4 planos de <1.3s cada (2.833/0.667/0.875/1.292s) — rajada de cortes no hook. O miolo (Chicago + NY) tem planos de 0.8–4s alternando fala-a-câmera com inserts de comida. Os dois planos mais longos do vídeo (4.083s em 20.125–24.208 e 3.959s em 24.208–28.167) são exatamente onde a explicação técnica (tempo de forno, "Statue of Liberty") precisa de espaço para respirar — plano longo isolado onde a informação pesa, confirmando a regra do "shot longo onde a informação pesa" prevista pela skill.

### Tabela de shots (27, timestamps exatos de `cut_stats.hard_cut_times`)

| # | Entrada | Saída | Dur. (s) | Conteúdo (frame verificado) |
|---|---|---|---|---|
| 1 | 0.000 | 2.833 | 2.833 | Overhead estático, tábua de madeira. Mãos colocam 3 fatias formando triângulo (NY→Chicago→New Haven). Legenda karaokê "WHICH"→"PIZZA"→"BEST" |
| 2 | 2.833 | 3.500 | 0.667 | Insert fechado só na fatia NY. Legenda "NEW YORK" |
| 3 | 3.500 | 4.375 | 0.875 | Insert fechado na fatia Chicago (corte transversal vermelho). Legenda "CHICAGO" |
| 4 | 4.375 | 5.667 | 1.292 | "OR" → "NEW HAVEN" sobre a fatia escura/carbonizada |
| 5 | 5.667 | 6.958 | 1.291 | Host aparece pela 1ª vez, avental preto "麻辣", segura caixa fechada. "LET'S START" |
| 6 | 6.958 | 8.458 | 1.500 | Whip/zoom (motion blur visível) para dentro da caixa aberta — deep dish de Chicago inteira. "WITH CHICAGO" |
| 7 | 8.458 | 9.292 | 0.834 | Host sentado, prato branco, garfo+faca cortando a fatia. "THIS PIZZA" |
| 8 | 9.292 | 10.292 | 1.000 | Continua cortando, câmera mais perto. "IS A REAL"/"FORK AND KNIFE JOB" |
| 9 | 10.292 | 11.167 | 0.875 | Extreme close-up: garfo levanta corte transversal (crosta clara, queijo, pepperoni, molho por cima). "THE CRUST" |
| 10 | 11.167 | 12.375 | 1.208 | Host de pé, gesto de mãos (duas alturas = camadas). "AND THE TOPPINGS" |
| 11 | 12.375 | 14.750 | 2.375 | Extreme close-up, faca cortando verticalmente o corte transversal |
| 12 | 14.750 | 17.500 | 2.625 | Host gesticulando ("bottomings, or fillings"). "BOTTOMINGS" |
| 13 | 17.500 | 20.125 | 2.625 | Espátula preta levanta fatia da caixa. "FROM BURNING" |
| 14 | 20.125 | 24.208 | 4.083 | Host segura fatia NY na vertical, sorrindo. "30 MINS" + ícone de velocímetro (grafismo) sobrepõe a fatia sendo erguida; depois "AS THE STATUE OF LIBERTY"/"THE NEW YORK SLICE" |
| 15 | 24.208 | 28.167 | 3.959 | Host abre caixa grande de pizza NY 18″ (ilustração de torrão com corrente e pingente de pizza na tampa). "THE DOUGH IS GONNA BE" + grafismo **"18″"** |
| 16 | 28.167 | 30.833 | 2.666 | Fatia inteira segurando à frente do rosto (gag de tamanho). "LARGE ENOUGH SO THAT" |
| 17 | 30.833 | 33.500 | 2.667 | Fatia NY deitada na tábua, close |
| 18 | 33.500 | 34.292 | 0.792 | Plano curtíssimo de transição (dobra da fatia) |
| 19 | 34.292 | 37.000 | 2.708 | Mãos dobrando a fatia NY ao comprimento; base da crosta visível. "IT'S COOKED IN A" → grafismo **"500°F"** (velocímetro) |
| 20 | 37.000 | 39.875 | 2.875 | Extreme close-up: polegar pressiona a lateral da crosta (miolo/alvéolos visíveis). "UNTIL IT HAS A" + grafismo "500°F"+"GAS OVEN" |
| 21 | 39.875 | 41.458 | 1.583 | Host segura fatia dobrada de frente para a lente |
| 22 | 41.458 | 44.875 | 3.417 | Host com caixa nova (logo "Ozzy's Apizza"). "AND IN NEW HAVEN, CT" + cartão desenhado "Welcome to New Haven, Connecticut..." |
| 23 | 44.875 | 48.833 | 3.958 | Zoom na tampa da caixa (logo chihuahua). "PIZZA..."/"ISN'T PIZZA"/"IT'S..."/**"AH-BEETZ"** |
| 24 | 48.833 | 52.292 | 3.459 | Host abre a caixa, mostra a apizza (formato irregular). "THE CRUST IS TYPICALLY"→"CIRCLE"→ grafismo de contorno oval desenhado →"INSPIRED?" |
| 25 | 52.292 | 55.792 | 3.500 | Fatia de New Haven virada, base carbonizada à mostra. "AND COOKED IN A" |
| 26 | 55.792 | 57.750 | 1.958 | Extreme close-up do corte transversal, borda carbonizada/oca. "GIVING YOU A CRISPIER" |
| 27 | 57.750 | 59.179 | 1.429 | Host segura a fatia de New Haven, expressão satisfeita, aponta. "CHARRED" |

### Candidatos fracos de corte (20 eventos, todos avaliados com frame extraído)

Nenhum se revelou corte disfarçado. Classificação:

| t (s) | Veredito | Evidência |
|---|---|---|
| 0.042, 0.792, 1.625 | Movimento de mão (colocação de fatias) dentro do plano 1, câmera estática | Frames em 0.0/0.8/1.6/2.4s mostram a 2ª e 3ª fatia entrando em quadro progressivamente — sem corte de câmera |
| 3.542 | Assentamento pós-corte (0.042s após o corte em 3.5) | — |
| 5.708 | Assentamento pós-corte (0.041s após o corte em 5.667) | — |
| 7.0, 7.125 | Motion blur do whip/zoom para dentro da caixa (não um 2º corte) | Frame em 6.7s mostra listra branca de blur atravessando o quadro |
| 18.125 | Movimento corporal do host durante fala contínua ("bottomings, or fillings") | Frame em 18.125s: host gesticulando, plano 12 contínuo |
| 21.458 | Pop-in do grafismo "30 MINS" + velocímetro (grande delta de pixel, não corte) | Frame em 21.458s confirma o ícone aparecendo sobre a fatia erguida |
| 26.042, 27.292 | Micro-movimento de cabeça/mão durante fala a câmera | Frames confirmam plano 14 contínuo ("STATUE OF LIBERTY") |
| 34.333, 35.0, 35.042 | Reposicionamento da fatia na mão + pop-in do grafismo "500°F" | Frames em 34.3–34.9s ("IT'S COOKED IN A") e 35.3–35.8s (grafismo aparecendo) |
| 37.042 | Assentamento pós-corte (0.042s após corte em 37.0) | Frame confirma "UNTIL IT HAS A", plano 20 já em curso |
| 42.833 | Micro-movimento de mão/cabeça durante fala | Frame confirma plano 22 contínuo (caixa Ozzy's) |
| 46.917, 46.958 | Zoom contínuo de aproximação sobre o logo da caixa (não corte) | Frame em 46.94s: "IT'S..." em close extremo já em curso |
| 48.875 | Assentamento pós-corte (0.042s após corte em 48.833) | — |
| 55.833 | Assentamento pós-corte (0.041s após corte em 55.792) | — |

### Cortes de áudio vs. cortes de vídeo

`silence.intervals` (5 no total, limiar -32 dB / mín 0.35s): `[17.217–17.573]`, `[18.327–19.087]`, `[40.376–40.966]`, `[46.684–47.104]`, `[50.922–51.333]`.

Cruzando com os 26 `hard_cut_times`: **apenas 1 dos 26 cortes cai dentro de um intervalo de silêncio** — o corte em **17.5s** cai exatamente dentro de `[17.217, 17.573]`. É o único "corte limpo" (na respiração). **Os outros 25 cortes acontecem em cima da fala contínua** — a narração nunca pausa para os cortes, ela "costura" por cima deles (estilo voice-over corrido, cortes só na imagem). Isso é uma escolha de ritmo deliberada, não um acidente.

---

## FASE 2 — Áudio é a fonte de verdade

### 2.1 — Transcrição (Whisper local)

```
D:/tools/whisper-local/venv/Scripts/python.exe transcribe_local.py source.mp4 --words --out whisper.json
```

- **Backend:** `local:faster-whisper` | **Modelo: `medium`** (default — funcionou de primeira, sem OOM desta vez; ver desvio #1) | **Device:** CPU, `int8` | **Idioma detectado:** inglês, `language_probability: 1.0`.
- `model_load_s: 14.0` | `transcribe_s: 66.9` | `realtime_factor: 0.88` (mais lento que tempo real, consistente com CPU int8).
- 16 segmentos, `avg_logprob` entre -0.096 e -0.198 (nenhum abaixo do limiar de alerta -0.8 em nível de segmento).

### Transcrição completa (com timestamps de segmento)

| t (s) | Texto |
|---|---|
| 0.00–5.08 | "Which American pizza style is the best? New York, Chicago, or New Haven?" |
| 5.44–8.50 | "Let's start with Chicago Deep Dish." |
| 8.68–10.72 | "This pizza is a real fork and knife job." |
| 10.98–14.82 | "The crust is thick and buttery, and the toppings are inverted with the sauce on top." |
| 15.06–19.54 | "This is to protect the cheese and other toppings, bottomings, or fillings," |
| 19.92–23.90 | "from burning while the pizza cooks for 30 minutes at around 425 degrees." |
| 24.10–27.22 | "The New York slice is as iconic as the Statue of Liberty." |
| 27.22–30.50 | "The dough is going to be hand-tossed in a large circle." |
| 30.82–34.30 | "Large enough so that a single slice about the size of your face is all you need." |
| 34.44–38.10 | "It's cooked in a slightly hotter gas oven until it has a bulging, golden crust that is crispy but still foldable." |
| 41.66–45.04 | "And in New Haven, Connecticut, the pizza capital of the U.S.," |
| 45.04–48.58 | "pizza isn't pizza. It's \"a-beets\"." ⚠️ ver nota abaixo |
| 49.00–55.52 | "The crust is typically circle inspired and cooked in a charcoal oven at a much higher temp," |
| 55.52–59.06 | "giving you a crispier and thinner crust, charred, not burnt." |

⚠️ **Palavras de baixa confiança marcadas pelo próprio Whisper** (probabilidade por palavra): "Deep" (0.345, 7.28–8.0s — contexto resolve: "Chicago Deep Dish"), "The" (0.506, 27.22s), "going" (0.599, 28.08s), "about" (0.717, 32.14s), "but" (0.597, 39.66s), "U" (0.551, 44.36s — parte de "U.S."), **"a" (0.191) + "-beets" (0.648) em 48.04–48.58s**, **"inspired" (0.308, 50.7–52.12s)**.

**As duas últimas foram verificadas e resolvidas via cruzamento com a legenda queimada (§2.2) — ambas confirmadas corretas, não são erro de transcrição.**

### 2.2 — Diff das fontes (áudio × legenda queimada)

Não havia caption track nativa (arquivo local, sem `.vtt`) nem chave cloud — as únicas duas fontes de texto são o **áudio (Whisper)** e a **legenda queimada nos frames**. Comparei ponto a ponto em 27+ momentos distintos (uma amostra por card de legenda, cobrindo o vídeo inteiro):

- **Zero divergências de conteúdo em qualquer ponto verificado.** A legenda karaokê acompanha a fala palavra-por-palavra, sem paráfrase, sem arredondamento de número, sem substituição.
- Os dois pontos de baixa confiança do Whisper foram **confirmados, não desmentidos**, pela legenda:
  - Em 48.1–48.4s a legenda queimada mostra literalmente **`"AH-BEETZ"`** (entre aspas, itálico — grafia fonética deliberada do criador para "apizza"). Isso confirma que o Whisper ouviu certo ("a-beets" ≈ "ah-beetz"), apesar da baixa probabilidade nas palavras.
  - Em 50.4–51.6s a legenda mostra **`"CIRCLE"`** seguido de **`"INSPIRED?"`** (com interrogação) — confirma que "circle inspired" não é erro de transcrição, é a frase real, e o "?" é reforçado por um grafismo: um contorno oval desenhado à mão sobre a pizza, deliberadamente assimétrico em relação à fatia real, ilustrando a piada de que a apizza de New Haven **não é** de fato um círculo perfeito.
- Único grafismo (não-legenda) que **diverge do áudio**: ver Fase 4.5 — o "500°F" é informação visual adicional, não dita em nenhum momento pela narração.

---

## FASE 3 — Texto na tela, três blocos separados

### (a) Legenda queimada (karaokê, 1–4 palavras por card, branco bold com contorno preto/sombra, sempre centralizada no terço inferior, sincronizada por palavra com a fala)

Cobre a fala inteira, sem exceção observada: WHICH → PIZZA → BEST → NEW YORK → CHICAGO → OR → NEW HAVEN → LET'S START → WITH CHICAGO → THIS PIZZA → IS A REAL → FORK AND KNIFE JOB → THE CRUST → AND THE TOPPINGS → BOTTOMINGS → FROM BURNING → AS THE STATUE OF LIBERTY → THE NEW YORK SLICE → THE DOUGH IS GONNA BE → LARGE ENOUGH SO THAT → IT'S COOKED IN A → UNTIL IT HAS A → AND IN NEW HAVEN, CT → PIZZA... → ISN'T PIZZA → IT'S... → "AH-BEETZ" → THE CRUST IS TYPICALLY → CIRCLE → INSPIRED? → AND COOKED IN A → GIVING YOU A CRISPIER → CHARRED.

### (b) Grafismo desenhado (ícones/cartões com estilo consistente — texto bold com contorno preto grosso, +ícone quando aplicável — categoricamente diferente da legenda simples)

| Momento (~s) | Conteúdo verbatim | Descrição visual | Função |
|---|---|---|---|
| ~28.9–30.5 | **"18″"** | Texto branco bold com contorno preto, estático, sobre a pizza NY aberta na caixa grande | Prova numérica de tamanho, não dita na fala nesse ponto |
| ~20.1–24.2 | **"30 MINS"** + ícone de velocímetro (ponteiro vermelho na parte baixa da escala) | Sobreposto à fatia de Chicago sendo erguida com espátula | Reforça visualmente o tempo de forno citado na fala ("cooks for 30 minutes") |
| ~35.3–39.9 | **"500°F"** (velocímetro, ponteiro no topo) seguido de **"GAS OVEN"** | Sobre a fatia NY sendo dobrada/pressionada | Adiciona um dado numérico que **não existe na fala** (ver Fase 4.5) |
| ~42.8–44.9 | Cartão azul de sinalização: "Welcome to New Haven, / [logo circular 'C'] CONNECTICUT / Home of the / PIZZA CAPITAL OF THE U.S. / P.S. it's pronounced \"ah-beetz\" [ícone de pizza fatiada] / HVN [logo do aeroporto Tweed New Haven]" | Cartão de sinalização rodoviária estilizado, ocupa quase a tela toda, por cima do rosto do host | Piada visual/informativa — funciona como "placa de boas-vindas" e já entrega o spoiler da pronúncia antes da fala chegar lá |
| ~51.0–51.6 | Contorno oval desenhado à mão, sem texto | Sobreposto à pizza de New Haven na caixa, deliberadamente assimétrico ao contorno real da pizza | Reforça visualmente "circle inspired?" — mostra que a forma real não é um círculo |

### (c) Chrome de plataforma

**Nenhum elemento de chrome de plataforma foi identificado em nenhum dos ~70 frames abertos** — sem logo de TikTok/Instagram, sem @handle, sem marca d'água, sem botões de UI de app, sem QR code. Ou o arquivo foi baixado/exportado sem overlay de plataforma, ou a fonte original já era um corte limpo (ex.: câmera direta, sem repost). Isso impede identificar a plataforma de origem só pelo vídeo.

---

## FASE 4 — Shot a shot (síntese; detalhe pleno na tabela da Fase 1)

Cada um dos 27 planos foi coberto por ao menos um frame aberto com `Read` (ver lista de arquivos no ledger da Fase 8). Composição recorrente: câmera de celular vertical, mistura de planos aéreos estáticos (tábua de madeira escura, iluminação quente lateral) com planos médios do host (cozinha doméstica, porta branca de painéis à esquerda, armários de madeira à direita, fogão a gás visível ao fundo). Grão de imagem consistente com captura de smartphone em compressão de app — sem tratamento de cor perceptível (sem LUT visível, sem halação, contraste médio). Zoom digital é usado pelo menos duas vezes de forma clara (aproximação ao logo da caixa Ozzy's em 44.9–48.8s; aproximação inicial de 6.958–8.458s tem motion blur mais consistente com whip-pan manual do que zoom digital puro — bordas do quadro não mostram esticamento típico de crop digital).

Avental do host: preto, com "麻辣" (málà, "dormente-e-picante", termo de tempero sichuanês) bordado em vermelho — sem relação temática com o conteúdo (pizza americana), provavelmente avental genérico/decorativo do apresentador, não um patrocínio identificável.

---

## FASE 4.5 — Reconciliação claim-a-claim com a leitura externa (Higgsfield)

| Cena Higgsfield (janela) | Afirmação | Veredito | Frame usado |
|---|---|---|---|
| 0:00–0:05 (cenas 1–5) | "Mãos colocam 3 fatias formando arranjo triangular; 2ª fatia (Chicago) à direita da 1ª; 3ª fatia (New Haven) na parte de baixo; plano segura nas 3 juntas" | **Confirmado** — arranjo, ordem e posições relativas batem exatamente | frames em 0.0s, 0.8s, 1.6s, 2.4s |
| 0:05–0:07 (cena 6) | "Avental preto com caracteres chineses vermelhos no peito; cozinha com portas brancas e armários de madeira" | **Confirmado** | frame_0005 (t≈00:06) |
| 0:20–0:24 (cena 13) | "...cooks for 30 minutes..." | **Confirmado** (bate com Whisper e com o grafismo "30 MINS") | frame em 21.458s |
| 0:27–0:30 (cena 15) | "Dentro da tampa da caixa: ilustração em preto-e-branco de um homem fazendo positivo com o polegar (thumbs up)" | **Rejeitado** — o frame mostra um torrão/pescoço estilizado com corrente/pingente de pizza e um punho fechado; não há um polegar levantado identificável | frames em 27.6s, 28.0s, 29.2–30.0s |
| 0:34–0:37 (cena 18) | "...cooked in a slightly hotter gas oven **at 500 degrees**..." (a Higgsfield inclui isso como parte da FALA) | **Rejeitado — alucinação confirmada.** O Whisper (modelo medium, alta confiança nesse trecho, todas as palavras >0.88 de probabilidade) não contém "500" nem "degrees" em nenhum ponto dessa frase. O "500°F" existe **só como grafismo na tela** (ver Fase 3b), não como fala. A Higgsfield confundiu texto visual com áudio — exatamente o erro que a Regra Dura nº 1 existe para prevenir | frames em 34.3–36.3s + `whisper.json` segmento 34.44–38.10 |
| 0:10–0:12 (cena 9) | "...crosta amarela, **amanteigada**..." | **Rejeitado** — "amanteigada" é adjetivo de sabor/textura, paráfrase da fala ("The crust is thick and buttery"), não uma observação visual pura | frame em 11.167s (cor da crosta é visível e clara/amarelada — isso é confirmável; "amanteigada" como qualidade não é) |
| 0:34–0:37 (cena 18) | "...textura ligeiramente acastanhada e mosqueada, **característica de forno a gás**" | **Rejeitado** — atribuir a causa ("forno a gás") a partir da cor da crosta é inferência da narração, não observação visual | frame em 37.042s |
| 0:37–0:40 (cena 19) | "...mostrando sua textura leve e **crocante**" | **Rejeitado** — crocância não é visível numa imagem estática; paráfrase de "crispy" da fala | frame em 37.042s |
| 0:52–0:55 (cena 25) | "...parte de baixo carbonizada, **indicando forno a carvão de alta temperatura**" | **Parcialmente confirmado / parcialmente rejeitado** — o carbonizado em si é visível e confirmado; a inferência causal ("indicando forno a carvão") é da narração, não do pixel | frame em 55.833s |
| 0:58–0:59 (cena 27) | "Design de som descritivo: música de violão acústico, animada, do início ao fim" | **Não verificável / rejeitado por falta de método** — é uma afirmação sobre áudio (instrumentação musical) que nenhuma ferramenta de imagem pode confirmar; o `probe.json` mede LUFS/silêncio, não identifica instrumento. Sem espectrograma dedicado, não posso nem confirmar nem negar | nenhum (áudio, não frame) |
| 0:41–0:45 (cena 21) | "Caixa branca com texto preto-e-branco e um logo; aponta para a caixa com o indicador" | **Confirmado parcialmente** — caixa e logo (Ozzy's Apizza, cabeça de chihuahua, "EST. 2021") batem; o gesto exato de "apontar com o indicador" não é claramente distinguível no frame (mão em posição ambígua) | frame em 42.833s |
| 0:45–0:48 (cena 22) | "Nome 'Ozzy's Apizza' em fonte estilizada com gráfico de cabeça de cachorro" | **Confirmado** | frames em 45.2–47.3s |

**Fechamento:** de **11 afirmações** checadas claim-a-claim, **4 confirmadas integralmente**, **2 parcialmente confirmadas/parcialmente rejeitadas**, **5 rejeitadas**. O padrão de erro mais claro e mais grave: a Higgsfield **inseriu um número ("500 degrees") na transcrição da fala que na verdade só existe como grafismo na tela** — confusão categórica exata entre texto visual e áudio (Regra Dura nº 1). O segundo padrão: qualquer adjetivo de sabor/textura/causa de forno ("amanteigada", "crocante", "característica de forno a gás/carvão") é sistematicamente paráfrase da narração vestida de observação visual — nenhum desses é confirmável a partir de uma imagem parada, e todos foram rejeitados por princípio, não caso a caso. Nenhuma das 26 contagens/timestamps de corte usadas neste teardown veio da Higgsfield — todas vêm do `probe.py`.

---

## FASE 5 — Desenho de áudio

- **LUFS integrado: -18.4** | **LRA (loudness range): 4.6 LU** | **True peak: -1.5 dBFS**. LRA baixo é consistente com compressão de dinâmica pesada, padrão de vídeo de feed vertical (fala precisa ficar inteligível em alto-falante de celular). True peak com 1.5 dB de headroom — não está "brickwalled" a 0 dBFS, tem alguma margem para normalização de plataforma.
- **Perfil de loudness momentâneo:** oscila fortemente entre -11 e -42 LUFS a cada 0.5s, basicamente acompanhando ênfase de fala (picos em sílabas tônicas, vales em pausas/respiração). Não há um piso constante de música de fundo claramente separável da voz nesse perfil — ⚠️ não consigo confirmar nem negar a presença de uma trilha musical distinta por trás da fala usando só os números de LUFS; precisaria de análise espectral dedicada (fora do escopo do `probe.py`).
- **Camadas identificáveis:** voz (dominante, clara, sem reverb perceptível — provável gravação com microfone de lapela/próximo) e possíveis efeitos sonoros pontuais não confirmáveis sem forma de onda detalhada. ⚠️ Não consigo confirmar a claim externa de "violão acústico ao fundo" (ver Fase 4.5).
- **Silêncio como edição:** os 5 intervalos de silêncio (17.217–17.573s, 18.327–19.087s, 40.376–40.966s, 46.684–47.104s, 50.922–51.333s) são todos pausas retóricas de 0.35–0.76s dentro de frases — nenhum é longo o bastante para sugerir corte de conteúdo removido.
- **Sincronia corte×áudio:** como já visto na Fase 1, só 1 dos 26 cortes (17.5s) cai dentro de uma janela de silêncio. Os outros 25 cortes acontecem com a voz ainda falando por cima — não há indício de corte sincronizado a uma batida musical identificável (não há como isolar "batida" no perfil de LUFS disponível).

---

## FASE 6 — Estrutura retórica

- **O hook (0:00–0:03):**
  - **Primeira coisa dita:** "Which American pizza style is the best?" — pergunta direta, sem preâmbulo.
  - **Primeira coisa mostrada:** uma fatia de pizza pepperoni sendo colocada numa tábua de madeira por mãos — imagem de comida pura, sem rosto.
  - **Primeira coisa escrita:** "WHICH" — a legenda karaokê reforça a primeira palavra dita, não adianta informação nova.
  - Promessa: um comparativo definitivo entre 3 estilos regionais de pizza. Paga a promessa com estrutura simétrica (3 blocos de ~15-19s cada, um por estilo).
- **Arco:** promessa (0–5s, as 3 fatias) → Chicago deep dish (5.4–24s, com camadas, tempo/temperatura de forno) → New York slice (24–41.6s, tamanho icônico + forno mais quente) → New Haven apizza (41.6–59s, revelação de nome/pronúncia + forno a carvão). Cada bloco segue o mesmo molde: nome do estilo → visual da caixa/pizza inteira → close no corte transversal → dado técnico de forno. Estrutura repetitiva e previsível — funciona como um "checklist" comparativo.
- **Densidade de informação:** alta. Contando afirmações distintas (fato de crosta, fato de forno, fato de tempo/temperatura, fato de nome/pronúncia): ~1 afirmação nova a cada 4–5s ao longo do vídeo inteiro — sem trecho de "enchimento".
- **Fechamento e CTA:** o vídeo **não pede nada explicitamente** — nenhuma legenda ou fala de "segue", "comenta qual é o seu favorito", "assista até o fim". Termina em 57.75–59.179s com o host satisfeito segurando a fatia de New Haven, "CHARRED" na tela, e a frase final "giving you a crispier and thinner crust, charred, not burnt." — fecha no dado técnico, não num apelo. É uma decisão editorial de deixar o comparativo falar por si.
- **Loop:** o último frame (host sorrindo com fatia de New Haven, prestes a morder) não replica visualmente o primeiro frame (fatia sendo colocada por mãos numa tábua vazia) — não há loop fechado óbvio para replay automático em feed.

---

## FASE 7 — Spec de reconstrução

### 1. Shot list
Ver tabela completa na Fase 1 (27 planos, timestamps exatos, duração, enquadramento, conteúdo).

### 2. Roteiro falado (com marcação de corte)
Ver tabela de transcrição completa na Fase 2.1. Pontos onde um corte de vídeo cai **no meio** de uma frase falada (a fala não pausa): 2.833 (meio de "New York, Chicago..."), 6.958 (meio de "...with Chicago Deep Dish"), 9.292, 10.292, 11.167, 12.375 (meio de "the toppings are inverted..."), 14.75, 20.125 (meio de "...30 minutes at around 425 degrees"), 24.208, 28.167 (meio de "The dough is going to be..."), 30.833, 33.5, 34.292, 37.0 (meio de "...until it has a bulging..."), 39.875, 41.458, 44.875 (meio de "pizza isn't pizza..."), 48.833, 52.292, 55.792 (meio de "giving you a crispier..."), 57.75. Único corte limpo na respiração: **17.5s**.

### 3. Spec de texto na tela
Ver Fase 3 completa (três blocos separados, com timestamps, posição, tipografia e função).

### 4. Spec de áudio
- Alvo de loudness: **-18.4 LUFS integrado**, true peak ≤ **-1.5 dBFS**, LRA ≈ **4.6 LU** (compressão pesada, consistente).
- Sem música de fundo isolável tecnicamente das medições disponíveis — se reconstruindo, considerar uma trilha instrumental leve e constante por baixo da narração (não confirmado, apenas hipótese razoável de gênero, dado o claim não verificado da Higgsfield).
- Nenhum SFX distinto foi isolável no perfil de LUFS disponível.

### 5. Spec visual
- Aspect ratio 9:16 (360×640), 24fps constante, H.264 Constrained Baseline, sem tratamento de cor visível, iluminação quente/prática (cozinha doméstica + luz de mesa para os inserts de comida).

### 6. O que **não** consegui determinar
- Fonte tipográfica exata da legenda/grafismos (aparenta ser um bold sans-serif genérico tipo Montserrat/Proxima Nova Black com contorno — não confirmável sem os metadados do editor).
- Nome/artista da eventual trilha musical (não isolável do áudio combinado; claim da Higgsfield não verificável).
- Modelo da câmera/celular usado na gravação (sem metadados EXIF/tag de dispositivo no container — só `encoder: Google` genérico).
- Plataforma de origem/publicação (nenhum chrome de plataforma no arquivo — ver Fase 3c).
- Tagline exata impressa na caixa de pizza do Chicago (ilegível mesmo em upscale 4x — banner vermelho com texto cursivo pequeno).
- Significado exato de "Lom" escrito à mão na caixa do Chicago (possível abreviação de tamanho, não confirmável).
- Se a fonte original tinha um watermark de plataforma que foi cortado/removido antes de chegar a este arquivo.

---

## FASE 8 — Ledger de incerteza

| # | O que está incerto | Por quê | O que resolveria |
|---|---|---|---|
| 1 | Palavras "Deep" (0.345), "The" (0.506), "going" (0.599), "about" (0.717), "but" (0.597), "U" (0.551) no Whisper | Probabilidade de palavra abaixo de ~0.75, mas contexto e legenda queimada não deixam dúvida sobre o texto correto | Já resolvido por contexto/legenda; citado aqui só por completude da Regra Dura nº 5 |
| 2 | "a"+"-beets" (0.191/0.648) | Baixa probabilidade | **Resolvido**: legenda queimada em 48.1–48.4s confirma `"AH-BEETZ"` |
| 3 | "inspired" (0.308) | Baixa probabilidade | **Resolvido**: legenda queimada em 51.0–51.6s confirma `"INSPIRED?"` |
| 4 | Tagline impressa na caixa do Chicago (banner vermelho abaixo da ilustração do chef) | Ilegível mesmo em upscale 4x (`read_00-06-700.png`) | Frame em resolução nativa mais alta que 360×640 (o vídeo fonte já é de baixa resolução — não há como melhorar sem outro arquivo-fonte) |
| 5 | "Lom" escrito à mão na caixa do Chicago | Caligrafia ambígua, possível abreviação | Não resolvível a partir deste arquivo |
| 6 | Presença/ausência de trilha musical distinta da voz | `probe.json` mede LUFS agregado, não separa fontes; claim da Higgsfield não é confiável (ver Fase 4.5) | Separação de fonte de áudio (ex. Demucs) ou audição direta, fora do escopo desta skill |
| 7 | Fonte tipográfica exata dos grafismos/legendas | Sem metadados do editor | Acesso ao projeto de edição original |
| 8 | Gesto exato "aponta com o indicador" (claim Higgsfield cena 21) | Mão em posição ambígua no frame disponível | Frame adicional em ~0.1s de resolução mais fina no mesmo instante (marginal, baixo valor) |
| 9 | Se o "500°F" foi dito em algum ponto fora dos segmentos transcritos | Whisper cobriu 0–59.06s quase integralmente (gaps só nos 5 intervalos de silêncio, todos <0.8s, nenhum comporta uma frase inteira) | Nenhuma ação adicional necessária — cobertura já é completa |

### Procedência do teardown

- **Ferramentas rodadas:** `probe.py` (limiares default: hard-cut 0.25), `/watch` v0.2.0 (`--detail balanced --no-whisper`), `transcribe_local.py` (Whisper local, modelo `medium`, CPU int8, `--words`), `grab.py` (múltiplas chamadas para frames adicionais/crops), MCP `higgsfield` (`media_upload` → `media_confirm` → `video_analysis_create` → `video_analysis_status`).
- **Frames de fato abertos com `Read`:** **70 frames distintos** — os 31 da extração base do `/watch` (`frame_0001.jpg`...`frame_0031.jpg`, cobrindo os 27 planos) mais 39 extrações adicionais dirigidas via `grab.py` para: cross-check dos 20 candidatos fracos de corte, leitura verbatim de texto em caixas/grafismos, e resolução das duas palavras de baixa confiança do Whisper.
- **Fonte da transcrição:** Whisper local (`faster-whisper`, modelo `medium`, CPU), única fonte de fala disponível nesta máquina (sem chave cloud, sem caption track nativa no arquivo local) — mas suficiente e de alta confiança (ver Fase 2).
- **Leitura externa:** Higgsfield `video_analysis` (Fase 0.5), tratada como hipótese e reconciliada claim-a-claim na Fase 4.5 (4 confirmadas, 2 parciais, 5 rejeitadas, de 11 checadas).
- Todos os timestamps de corte citados neste documento vêm de `cut_stats.hard_cut_times` do `probe.json` — a segmentação de "cenas" da Higgsfield nunca substituiu essa contagem.
