# Teardown forense — "1 second / 1 minute / 10 minute / 1 hour pizza" (publi OSMO × Walmart)

**Fonte:** `C:\Users\FELIP\Downloads\videoplayback (1).mp4` → copiado para `D:\gevia\ugc\teardown-pizza-osmo\source.mp4`
**Duração:** 32.618667 s | **Resolução:** 360×640 (vertical, 9:16, `is_vertical: true`) | **FPS:** 29.97 (`30000/1001`, constante, 976 frames) | **Vídeo:** H.264 Constrained Baseline, yuv420p | **Áudio:** AAC-LC 48 kHz estéreo | **Bitrate total:** 599 488 bps | **Container:** mp4, tag `encoder: Google`, `major_brand: mp42`
**Sem faixa de legenda embutida** (`has_embedded_subtitle_stream: false`).

> ⚠️ **O arquivo analisado é uma recodificação de baixa qualidade** (360p vertical, ~600 kbps, perfil Constrained Baseline, nome `videoplayback`, tag de encoder `Google`) — quase certamente uma rendição 360p baixada do YouTube, não o master. Tudo que diz respeito a **grão, banding, nitidez, tratamento de cor e microdetalhe é medido sobre esse re-encode** e não sobre o original. Cortes, timing, áudio e texto na tela não são afetados por isso.

---

## FASE 0 — Intake & Probe

- `SKILL_DIR` = `C:\Users\FELIP\.claude\skills\video-teardown` — guard confirmado (`probe.py`, `grab.py`, `transcribe_local.py` presentes).
- Arquivo já era local. Sem `yt-dlp`, sem legenda nativa, sem `info.json` de plataforma. **Não tenho a URL de origem.**
- `probe.py` rodado com os limiares **default** (`--scene-floor 0.08`, `--hard-cut 0.25`). Nenhum ajuste foi necessário: a distribuição de scores é bimodal e limpa (25 eventos ≥ 0,29 contra 7 eventos ≤ 0,18), sem zona cinzenta.
- **Portão da Regra Dura nº 1:** sem caption track **e com** Whisper local configurado nesta máquina → **Whisper local é a fonte de verdade da fala.** Regra nº 1 cumprida integralmente.

---

## FASE 1 — Corte e ritmo

### 1.1 Contagem real

| métrica | valor medido |
|---|---|
| cortes duros | **25** |
| planos | **26** |
| `single_take` | **false** |
| duração média do plano | **1,255 s** |
| plano mais curto | **0,334 s** (plano 25) |
| plano mais longo | **3,203 s** (plano 5) |
| cortes por minuto | **45,99** |

`hard_cut_times` (s): `1.068, 3.170, 4.104, 5.205, 8.408, 9.576, 10.310, 11.278, 12.179, 14.014, 15.883, 16.450, 18.185, 19.386, 19.887, 20.954, 23.090, 25.526, 26.894, 28.295, 28.962, 29.596, 30.030, 31.064, 31.398`

### 1.2 Tabela de planos

| # | in | out | dur | o que está em quadro |
|---:|---:|---:|---:|---|
| 1 | 0,000 | 1,068 | 1,068 | MCU frontal; pizza crua na pá sobre o forno; indicador levantado |
| 2 | 1,068 | 3,170 | 2,102 | Boca do forno; pá entrando; selo `1s` preenchendo no centro |
| 3 | 3,170 | 4,104 | 0,934 | MCU; ergue a pizza de 1 s (crua) na vertical — **insert do chef gritando ao fundo** |
| 4 | 4,104 | 5,205 | 1,101 | Enquadramento-base do forno; nova pizza crua na pá |
| 5 | 5,205 | 8,408 | **3,203** | Tilt descendo a frente do forno; pizza assando; display `629.` → `636.` |
| 6 | 8,408 | 9,576 | 1,168 | Pizza de 1 min erguida à câmera — assada, queijo derretido |
| 7 | 9,576 | 10,310 | 0,734 | CU: morde a pizza segurando com as duas mãos |
| 8 | 10,310 | 11,278 | 0,968 | Macro: dedo afunda no centro da fatia (massa mole) |
| 9 | 11,278 | 12,179 | 0,901 | Enquadramento-base; pizza crua na pá |
| 10 | 12,179 | 14,014 | 1,835 | Interior do forno; display `658.`; whip da câmera |
| 11 | 14,014 | 15,883 | 1,869 | Pizza escurecendo dentro do forno, fumaça |
| 12 | 15,883 | 16,450 | 0,567 | CU frontal mordendo a pizza de 10 min (bordas pretas) |
| 13 | 16,450 | 18,185 | 1,735 | MCU; parte a pizza ao meio; outra metade na tábua de madeira |
| 14 | 18,185 | 19,386 | 1,201 | Enquadramento-base; pizza crua na pá |
| 15 | 19,386 | 19,887 | 0,501 | Boca do forno; pá entrando; `1 HR` em texto puro |
| 16 | 19,887 | 20,954 | 1,067 | Interior do forno; pizza já queimando; display `638.` |
| 17 | 20,954 | 23,090 | **2,136** | Pizza totalmente preta saindo na pá; interior dourado |
| 18 | 23,090 | 25,526 | **2,436** | MCU; sacode o pote OSMO sobre a pizza carbonizada |
| 19 | 25,526 | 26,894 | 1,368 | CU do pote OSMO na mão — rótulo legível |
| 20 | 26,894 | 28,295 | 1,401 | Pote à frente; **logo Walmart entra ~27,40** |
| 21 | 28,295 | 28,962 | 0,667 | Ergue a pizza preta inteira, frontal, duas mãos |
| 22 | 28,962 | 29,596 | 0,634 | CU mordendo a borda carbonizada |
| 23 | 29,596 | 30,030 | 0,434 | MCU talking-head, indicador levantado |
| 24 | 30,030 | 31,064 | 1,034 | MCU; corta a pizza preta com cortador de roda |
| 25 | 31,064 | 31,398 | **0,334** | Ergue uma metade preta torta para a câmera |
| 26 | 31,398 | 32,619 | 1,221 | Ergue a meia pizza; fatia isolada na pá em primeiro plano |

### 1.3 Desenho do ritmo

A média de 1,255 s esconde o desenho real. Por bloco:

| bloco | janela | cortes | cortes/min |
|---|---|---:|---:|
| hook + 1 s | 0,0 – 4,1 | 3 | 44 |
| 1 min | 4,1 – 14,0 | 7 | 42 |
| 10 min | 14,0 – 19,4 | 4 | 44 |
| reveal 1 h | 19,4 – 23,1 | 3 | 48 |
| **bloco publicitário** | 23,1 – 28,3 | 3 | **35** |
| **button final** | 28,3 – 32,6 | 5 | **70** |

Dois achados:

1. **O anúncio é a parte mais lenta do vídeo.** Os planos 17 e 18 (2,136 s e 2,436 s) são o 2º e o 3º mais longos de todo o corte, e estão colados: o reveal da pizza queimada e o sacudir do OSMO. O editor desacelera exatamente onde precisa que o espectador registre o produto. Fora esse par, só o plano 5 (3,203 s — a pizza de 1 min assando, que é o único "resultado bom" da peça) ganha tanto tempo de tela.
2. **O button acelera para o dobro.** Depois do CTA, os cinco planos finais somam 4,3 s (0,667 / 0,634 / 0,434 / 1,034 / 0,334 / 1,221) — o plano mais curto de todos está aí. É pressa deliberada para chegar ao fim antes que a pessoa role.

### 1.4 Candidatos fracos — nenhum é corte

Sete eventos de cena ficaram abaixo do limiar de 0,25. Extraí o frame imediatamente antes e depois de cada um e comparei:

| t (s) | score | frames comparados | veredito |
|---|---:|---|---|
| 5,772 | 0,1399 | 5,70 / 5,85 | **Movimento de câmera.** Mesmo plano 5; tilt descendo a frente do forno, selo `1 MIN` mantém posição relativa. |
| 6,139 | 0,1046 | 6,07 / (5,85) | **Movimento de câmera.** Continuação do mesmo tilt, que estabiliza sobre o display (`629.`). |
| 12,880 | 0,0830 | 12,81 / 12,95 | **Whip de câmera.** Mesmo plano 10; 12,81 está nítido, 12,95 é borrão de movimento da mesma boca de forno. |
| 14,147 | 0,1041 | 14,08 / 14,22 | **Eco pós-corte.** 133 ms depois do corte duro em 14,014; é o movimento rápido que sucede o corte, não um corte novo. |
| 14,214 | 0,0829 | 14,08 / 14,22 | **Eco pós-corte.** Idem, 200 ms depois de 14,014. |
| 20,988 | 0,0962 | — | **Eco pós-corte.** 34 ms depois do corte duro em 20,954: é a cauda da mesma transição. |
| 22,055 | 0,1760 | 21,98 / 22,13 | **Movimento de sujeito.** Mesmo plano 17; a pá puxa a pizza preta para fora, o fundo dourado dá lugar ao claro. |

**Nenhum match-cut escondido, nenhum corte disfarçado por movimento.** Os 25 cortes medidos são os 25 cortes que existem.

### 1.5 Cortes de vídeo × cortes de áudio

Cruzando `hard_cut_times` com os timestamps por palavra do Whisper:

- **12 dos 25 cortes caem DENTRO de uma palavra** (1,068 "pizza"; 5,205 "pizza"; 9,576 "okay"; 11,278 "raw"; 12,179 "pizza"; 18,185 "perfect"; 19,386 "pizza"; 26,894 "Osmo"; 28,295 "now"; 30,030 "on"; 31,064 "burnt"; e 15,883 exatamente no fim de "terrible").
- **1 corte cai exatamente na costura de frase:** 25,526, o limite entre `because` (termina 25,52) e `everything` (começa 25,52).
- Os demais caem em vãos de fala.

Traduzindo: **a narração é um leito contínuo e a imagem é cortada livremente por cima dela.** Não há respeito a fronteira de palavra — quase metade dos cortes acontece com a boca em movimento. Isso é J/L-cut sistemático, e é o que dá a sensação de ritmo sem que nenhum plano precise ser dramático.

E o corte que mais importa é o de 25,526: cai *exatamente* no ponto onde a frase publicitária vira ("…is Osmo because | everything tastes better with Osmo"). O editor gastou o único corte perfeitamente alinhado a fronteira de fala no pivô do anúncio.

---

## FASE 2 — Áudio é a fonte de verdade

### 2.1 Transcrição (Whisper local)

`transcribe_local.py`, modelo **`medium`**, `device=cpu`, `compute_type=int8`, `--language en`, `--words`. Realtime factor **1,14×**.

Confiança do modelo, por segmento: **`avg_logprob = -0,270`** e **`no_speech_prob = 0,011`** em todos os cinco segmentos. São números bons — bem acima do piso de ⚠️ (-0,8).

```
[00,00 – 11,32]  One second pizza, one minute pizza, it actually looks okay, still a little raw.
[11,36 – 18,24]  Ten minute pizza, it doesn't look terrible, the crust is burnt but the inside is perfect.
[18,38 – 25,52]  One hour pizza, oh no, the only thing that can make this taste better is Osmo because
[25,52 – 28,48]  everything tastes better with Osmo. Go try some at Walmart now.
[29,76 – 32,46]  Hold on, yeah it's burnt, I might kind of like it though.
```

**Timestamps por palavra** (os que importam para o corte e para o grafismo):

| palavra | in | out | p |
|---|---:|---:|---:|
| One / second / pizza, | 0,00 | 1,34 | 0,78 / 0,91 / 0,94 |
| one / minute / pizza, | 4,32 | 5,24 | 0,92 / 0,98 / 0,98 |
| it actually looks okay, | 8,56 | 9,74 | 0,78–1,00 |
| still a little raw. | 10,34 | 11,32 | 0,83–1,00 |
| **Ten** | 11,36 | 11,60 | **0,45 ⚠️** |
| minute / pizza, | 11,60 | 12,32 | 0,88 / 0,99 |
| it doesn't look terrible, | 14,82 | 15,88 | 0,90–1,00 |
| the crust is burnt but the inside is perfect. | 16,54 | 18,24 | 0,73–1,00 |
| One / hour / pizza, | 18,38 | 19,46 | 0,99 / 0,98 / 0,99 |
| oh / no, | 22,52 | 23,04 | 0,92 / 0,98 |
| the only thing that can make this taste better is **Osmo** because | 23,16 | 25,52 | 0,93 em "Osmo" |
| everything tastes better with **Osmo.** | 25,52 | 26,92 | 0,99 em "Osmo" |
| Go try some at **Walmart** now. | 27,00 | 28,48 | 0,78 em "Walmart" |
| Hold on, | 29,76 | 30,42 | 0,96 / 1,00 |
| yeah it's burnt, | 30,82 | 31,24 | 0,84–0,99 |
| I might **kind** of like it **though.** | 31,60 | 32,46 | 0,65 / 0,71 nas marcadas |

⚠️ **"Ten" (11,36–11,60) saiu com p = 0,45** — a palavra menos confiável da peça. Ver Ledger.

**Estrutura de pausas.** Cinco vãos longos sem fala, todos ≥ 1,2 s:

| vão | duração | o que acontece na imagem |
|---|---:|---|
| 1,34 → 4,32 | 2,98 s | pizza de 1 s entra e sai do forno; selo preenche |
| 5,24 → 8,56 | 3,32 s | pizza de 1 min assando (o plano mais longo do vídeo) |
| 12,32 → 14,82 | 2,50 s | pizza de 10 min assando |
| 19,46 → 22,52 | 3,06 s | pizza de 1 h assando e sendo retirada preta |
| 28,48 → 29,76 | 1,28 s | respiro entre o CTA e o button |

Os quatro primeiros são idênticos em função: **a fala anuncia o tempo, cala, e a imagem executa.** A narração nunca descreve o que está acontecendo enquanto acontece — só rotula antes e julga depois.

### 2.2 Diff das fontes de texto

Só existem **duas** fontes, não três:

| fonte | disponível | conteúdo |
|---|---|---|
| áudio (Whisper local) | ✅ | as cinco falas acima |
| caption track | ❌ | não existe (`has_embedded_subtitle_stream: false`, arquivo local sem `.vtt`) |
| texto queimado | ✅ | **nenhuma legenda** — só grafismo (ver Fase 3) |

**Resultado do diff: não há legenda queimada para divergir da fala.** Esse é o achado, não a ausência dele — ver §3.1. O único texto na tela que espelha fala é o par `10 MIN` / "Ten minute pizza" e `1 HR` / "One hour pizza", e nesses dois casos o grafismo **antecipa** o áudio:

| grafismo | entra | palavra correspondente | delta |
|---|---:|---|---:|
| `1 MIN` (texto no slot) | ≤ 4,15 | "one minute" em 4,32 | grafismo **0,17 s à frente** |
| `10 MIN` (texto no centro) | ≤ 12,81 | "Ten minute" em 11,36 | fala **1,45 s à frente** |
| `1 HR` (texto no centro) | ≈ 19,39 | "One hour" em 18,38 | fala **1,01 s à frente** |

Ou seja: nem sincronia, nem regra fixa. O grafismo segue o **evento da cozinha** (pizza entrando no forno), não a fala.

---

## FASE 3 — Texto na tela, três blocos separados

### 3.1 (a) LEGENDA QUEIMADA — **NÃO EXISTE**

Verificado, não presumido. Abri **os 26 frames de plano em resolução nativa** e, além deles, **seis recortes dedicados do terço inferior** (`--crop 0,0.62,1,1`, upscale 2×) em `0,534 / 9,000 / 17,318 / 24,308 / 27,595 / 32,009` — os seis foram abertos com `Read`, não apenas gerados. Em nenhum dos 32 há legenda, bloco de karaokê, faixa de texto ou transcrição de fala. O único texto que aparece no terço inferior em toda a peça é o lockup Walmart de 27,40–28,295 (§3.2), que é grafismo de marca, não legenda.

Isso é uma decisão editorial forte para um short de 2026: o vídeo **aposta inteiramente no áudio para a fala** e usa a tela só para o sistema de progresso. Consequência prática — assistido sem som, esse vídeo perde o pitch do produto inteiro e mantém apenas a piada visual.

### 3.2 (b) GRAFISMO DESENHADO

#### Elemento 1 — HUD de quatro selos (o sistema principal)

Presente do ~0,2 s até o último frame. **Ausente no frame de 0,05 s** (verificado em recorte 2× da faixa superior) — o HUD anima entrada durante o plano 1.

**Layout.** Quatro discos circulares em fila horizontal, no terço superior, centrados verticalmente em y ≈ 0,11–0,13 do quadro, distribuídos entre x ≈ 0,10 e x ≈ 0,88. Espaçamento regular.

**Dois estados por slot:**

- **Vazio (futuro):** círculo cinza translúcido (~30 % de opacidade) com o rótulo em cinza dentro. Legível, mas recuado para o fundo.
- **Cheio (concluído):** disco opaco com **ilustração de pizza vista de cima**, rótulo em branco por cima, tipografia com contorno preto grosso e leve sombra.

**Rótulos, verbatim:** `1s` · `1 MIN` · `10 MIN` · `1HR` — numeral grande, unidade pequena embaixo (ou à direita, no caso do `1HR`). Tipografia sans-serif pesada, itálica/oblíqua, arredondada, caixa alta na unidade.

**A animação — medida, não presumida.** Mapeei o ciclo do selo 1 e do selo 2 com varredura densa da faixa superior:

| t (s) | estado do selo em questão |
|---:|---|
| 0,05 | HUD ausente |
| 0,534 | selo 1 já cheio e encaixado; selos 2–4 fantasmas |
| 1,20 | **só o texto `1s`**, branco, destacado do slot, descendo em direção à boca do forno |
| 1,60 | `1s` centrado sobre o forno; **disco preenchendo por varredura radial horária**, ~65 % feito, translúcido |
| 2,60 | `1s` centrado; disco **100 % desenhado**, opaco, saturado |
| 3,10 | selo 1 de volta ao slot, pequeno e cheio |
| 4,15–5,15 | slot 2 mostra **`1 MIN` em texto branco puro, sem disco** |
| 5,30 | `1 MIN` desceu do slot, maior, ainda sem disco |
| 6,50 | `1 MIN` centrado sobre o forno; **disco ~50 % preenchido** pela mesma varredura radial |
| 8,30 | selo 2 encaixado e cheio |

**O mecanismo, em uma frase:** o rótulo do tempo corrente se solta do seu slot, desce e cresce sobre a boca do forno, e a ilustração de pizza se desenha atrás dele como um **gráfico de pizza literal** (varredura radial horária) enquanto aquele forno roda; ao completar, o selo sobe de volta e encaixa. Confirmado idêntico nos quatro selos (`10 MIN` em 12,81 → 13,097 → 14,949; `1 HR` em 19,637 → 20,421 → 22,022).

**Detalhe de arte que quase ninguém repara:** a ilustração de pizza de cada selo **muda conforme o resultado daquele forno**. Selo 1 = pizza pálida de queijo cru. Selo 2 = massa dourada assada. Selo 3 = laranja escuro, mais tostada. Selo 4 = **disco preto carbonizado**. O HUD não é só um contador de progresso — é um resumo visual do desfecho, e o quarto selo entrega o spoiler da piada antes da fala.

#### Elemento 2 — Insert de rosto no fundo (plano 3)

- **Janela medida:** ausente em 3,25 e em 3,35; presente em 3,45, 3,70 e 3,80; ausente em 3,90 e 4,05. → **≈ 3,40 → 3,87 (≈ 0,47 s)**, inteiramente dentro do plano 3.
- **O que é:** rosto masculino adulto, cabelo curto claro, olhos apertados, boca escancarada num grito, composto sobre o fundo da cozinha com desfoque e opacidade parcial — ocupa quase toda a metade superior do quadro, atrás do sujeito e da pizza crua.
- **Função:** reação cômica ao "produto" do forno de 1 segundo (massa crua).
- ⚠️ **Identidade:** a fisionomia é fortemente compatível com **Gordon Ramsay** no formato de meme de reação. Não afirmo como fato — o frame de origem é 360p, o insert está desfocado de propósito, e não há texto que confirme. Ver Ledger.

#### Elemento 3 — Lockup Walmart (o CTA)

- **Entrada medida:** ausente em 27,35, presente em 27,48 → **entra ≈ 27,40**.
- **Saída:** presente em 28,25, ausente em 28,30 → **sai em 28,295, exatamente no corte duro** que encerra o plano 20.
- **Duração ≈ 0,90 s.**
- **Conteúdo verbatim:** wordmark `Walmart` em azul (#0071CE aproximado), tipografia sans-serif arredondada de marca, seguido do símbolo **spark** de seis pétalas em amarelo. Contorno/halo branco em ambos para destacar do fundo.
- **Posição:** terço inferior, centrado horizontalmente, y ≈ 0,78 do quadro, sobre a pizza carbonizada desfocada.
- **Animação:** corte seco na entrada; sai junto com o corte de plano.
- **Sincronia com a fala:** "Walmart" é dito em **27,76–28,00**. O logo aparece em **27,40** — **0,36 s antes da palavra.**

#### Elemento 4 — Texto diegético (não é grafismo, mas é texto lido)

Não é overlay: é texto que existe dentro da cena. Reportado aqui porque a Regra nº 4 exige transcrição verbatim de tudo legível.

| t (s) | onde | leitura verbatim |
|---:|---|---|
| 6,070 | display do forno | `629.` |
| 6,807 | display do forno | `636.` |
| 13,097 | display do forno | `658.` |
| 20,421 | display do forno | `638.` |
| 26,210 | rótulo do pote, linha 1 | `PERFECT FOR` |
| 26,210 | rótulo do pote, linha 2 | `BURGERS & BBQ` |
| 26,210 | rótulo do pote, linha 3 (principal) | `OSMO` |
| 26,210 | rótulo do pote, linha 4 | ⚠️ **ilegível** — bloco de texto em vermelho/laranja sob o wordmark, ~2 palavras, não resolve em 360p nem a 4× |
| 4,655 | base do forno | ⚠️ `ooni` — wordmark minúsculo, cortado pela borda inferior do quadro; leitura parcial |

O display do forno **varia entre leituras** (629 → 636 → 658 → 638), o que é coerente com um termômetro ao vivo de forno de pizza de bancada, não com um número estático de arte. O ponto final após o número é parte do display de 7 segmentos.

**Design do pote OSMO:** frasco cilíndrico transparente com tempero laranja visível no topo e na base; rótulo central preto com faixas horizontais vermelha/laranja acima e abaixo; tampa preta com bico dosador articulado (visível aberto durante o sacudir, planos 18–20).

### 3.3 (c) CHROME DE PLATAFORMA — **NÃO EXISTE**

Nenhum logo de TikTok/Reels, nenhum `@handle`, nenhuma marca d'água, nenhum botão de UI, nenhum QR. Verificado nos 26 frames de plano em resolução nativa.

O que *indica* a procedência é o container, não a imagem: `encoder: Google`, `major_brand: mp42`, nome de arquivo `videoplayback`, 360×640 a ~600 kbps. Isso é uma rendição do YouTube baixada — provavelmente **YouTube Shorts**. Como não há marca d'água de nenhuma outra plataforma, **não há evidência de repost**: ou é nativo, ou foi exportado limpo antes de subir.

---

## FASE 4 — Shot a shot

> Enquadramento, luz e cor abaixo descrevem o que está visível no re-encode 360p. Cada entrada corresponde a um frame que abri em resolução nativa (upscale 2×, PNG, `--precise`).

**Gramática comum a todo o vídeo.** Três posições de câmera se repetem e formam o vocabulário inteiro:

- **A — "posição forno":** câmera na altura da bancada, frontal, o forno de bancada ocupando o terço inferior, o sujeito atrás olhando para a lente por cima da pizza. Planos 1, 4, 9, 14.
- **B — "dentro do forno":** câmera baixa e próxima da boca do forno, interior dourado saturado, pizza em silhueta/contraluz. Planos 2, 5, 10, 11, 15, 16, 17.
- **C — "mesa":** MCU/CU sobre a tábua de madeira clara, fundo da cozinha desfocado. Planos 3, 6, 7, 8, 12, 13, 18–26.

A luz é **chave suave frontal-alta** (aparentemente janela ampla ou softbox grande de frente), temperatura neutra-quente, contraste baixo, sem sombra dura no rosto. A exceção é a posição B, onde o interior do forno vira a fonte dominante e joga tudo para o âmbar saturado. Paleta geral: creme, madeira clara, branco, com o laranja da pizza como único acento — e, na segunda metade, o preto da pizza carbonizada como contraponto total.

Toda a peça é feita com **profundidade de campo rasa** e uma lente que lê como normal/curta-teleobjetiva na posição C (sem distorção de grande-angular no rosto) e mais aberta na B.

---

**Plano 1 — 0,000 → 1,068 (1,068 s)** · frame `0,534`
Posição A. MCU frontal. Sujeito centrado, camiseta branca lisa, cabelo castanho curto; headroom médio; olha direto na lente. Mão esquerda segura o cabo da pá de alumínio; mão direita levanta o **indicador** no canto direito do quadro — gesto que marca "número 1" e antecipa o formato. Pizza crua (queijo ralado, cinco pepperonis) sobre folha de papel na pá, no terço médio-baixo. Abaixo, o topo do forno de bancada e a fenda luminosa da boca. Fundo: prateleira branca com moedor, porta-facas preto, potes. Luz frontal suave, zero sombra dura.
**Áudio:** "One second pizza," (0,00–1,34). **HUD:** ausente em 0,05; presente e com slot 1 cheio em 0,534.

**Plano 2 — 1,068 → 3,170 (2,102 s)** · frame `2,119`
Posição B. A pá desliza para dentro; motion blur forte na metade inferior. Interior do forno em âmbar saturado dominando o quadro. Selo `1s` no centro geométrico, sobre a linha da boca do forno. **É aqui que o disco se desenha:** texto puro em 1,20 → 65 % em 1,60 → 100 % em 2,60. Espaço negativo ocupado pelo selo — o layout foi desenhado para isso.
**Áudio:** vão de fala (1,34–4,32). Só leito.

**Plano 3 — 3,170 → 4,104 (0,934 s)** · frames `3,220` / `3,450` / `3,700` / `3,900`
Posição C. MCU. Ergue a pizza de 1 segundo **na vertical**, virada para a lente, ocupando o terço esquerdo e central — o queijo está totalmente ralado e solto, os pepperonis cor de laranja crua, e **pedaços caem** sobre a tábua (visíveis em 3,90). O rosto do sujeito aparece no terço direito, semicerrado, olhando para a lente. Tábua de madeira clara na base.
**Insert de rosto (3,40–3,87)** preenche o fundo atrás dele. Em 3,22 e 4,05 o fundo é a cozinha normal (pia, torneira) — confirma que o insert é um flash, não um fundo.
**Áudio:** vão de fala.

**Plano 4 — 4,104 → 5,205 (1,101 s)** · frame `4,655`
Posição A, praticamente idêntica ao plano 1 — mesma altura, mesmo enquadramento, mesma pizza crua na pá. Diferença: o sujeito está com a boca aberta falando, não com o dedo levantado. **É a repetição literal do plano 1**, e é o que estabelece o loop de formato ("toda rodada começa igual").
**HUD:** slot 2 = `1 MIN` em texto branco puro, sem disco, ainda encaixado.
**Áudio:** "one minute pizza," (4,32–5,24).

**Plano 5 — 5,205 → 8,408 (3,203 s) — o plano mais longo** · frames `5,700` / `6,070` / `6,500` / `6,807` / `7,500` / `8,300`
Posição B com **movimento**: a câmera desce/tilta pela frente do forno (o evento de cena fraco em 5,772 e 6,139) e estabiliza sobre o painel. A pizza está visível na pedra, queijo começando a borbulhar. Display legível: `629.` em 6,07, `636.` em 6,807. Botão metálico giratório à direita do display.
**Selo:** `1 MIN` desce ao centro (5,30), preenche até ~50 % (6,50), completa e encaixa (8,30).
**Áudio:** vão de fala de 3,32 s — o mais longo do vídeo. É o único plano que respira.

**Plano 6 — 8,408 → 9,576 (1,168 s)** · frame `8,992`
Posição C. A pizza de 1 min preenche ~80 % do quadro, erguida na horizontal à frente do rosto (só o topo da cabeça aparece). Queijo derretido brilhante, cinco pepperonis encolhidos e brilhantes, borda com **pontos carbonizados** — assada de verdade. Foco raso: a borda está nítida, o fundo da cozinha dissolvido.
**Áudio:** "it actually looks okay," (8,56–9,74). O corte em 9,576 cai dentro de "okay".

**Plano 7 — 9,576 → 10,310 (0,734 s)** · frame `9,943`
Posição C, mais fechada. Morde a pizza segurando com as duas mãos pelas bordas; olhos fechados; a pizza dobra sob o próprio peso. Bancada de madeira no rodapé do quadro com migalhas visíveis.
**Áudio:** vão curto (9,74–10,34).

**Plano 8 — 10,310 → 11,278 (0,968 s)** · frame `10,794`
Macro. Duas mãos em quadro, uma segurando a fatia, a outra com o **indicador afundando no centro** — a massa cede visivelmente e o queijo está mais claro e úmido ali. É o plano-prova da afirmação.
**Áudio:** "still a little raw." (10,34–11,32). Corte em 11,278 cai dentro de "raw".

**Plano 9 — 11,278 → 12,179 (0,901 s)** · frame `11,729`
Posição A. Terceira repetição do enquadramento-base. Pizza crua na pá.
**HUD:** slots 1 e 2 cheios; slot 3 (`10 MIN`) ainda em cinza fantasma na varredura de 11,73.
**Áudio:** "Ten minute pizza," (11,36–12,32). Corte em 12,179 cai dentro de "pizza".

**Plano 10 — 12,179 → 14,014 (1,835 s)** · frames `12,810` / `12,950` / `13,097`
Posição B. Pizza na pedra, ainda pálida em 12,81; a câmera dá um **whip** (12,88) e reenquadra. Display `658.` em 13,097 — a leitura mais alta do vídeo.
**Selo:** `10 MIN` em texto puro (12,81) → disco parcial escuro (13,097).
**Áudio:** vão de fala (12,32–14,82).

**Plano 11 — 14,014 → 15,883 (1,869 s)** · frames `14,080` / `14,220` / `14,949`
Posição B. Movimento rápido logo após o corte (os "ecos" de 14,147/14,214), depois estabiliza: a pizza está **visivelmente escurecida**, o queijo virou uma crosta laranja-escura com manchas pretas, há fumaça/haze no quadro (o frame de 14,949 tem um véu cinza sobre toda a metade inferior). O selo `10 MIN` completa e sobe.
**Áudio:** vão de fala até 14,82, depois "it doesn't look terrible," (14,82–15,88). Corte em 15,883 cai exatamente no fim de "terrible".

**Plano 12 — 15,883 → 16,450 (0,567 s)** · frame `16,167`
Posição C, CU frontal. Morde a pizza de 10 min segurando pelas bordas; a peça está claramente mais escura que a de 1 min — bordas pretas, pepperonis com anéis carbonizados. Olhos fechados, sorriso durante a mordida.
**Áudio:** vão curto (15,88–16,54).

**Plano 13 — 16,450 → 18,185 (1,735 s)** · frame `17,318`
Posição C, MCU recuado — o único plano da segunda metade que mostra o corpo inteiro do torso e o fundo da cozinha nítido o bastante para ler o ambiente (pia, torneira, armários de madeira clara, fogão à direita). Parte a pizza ao meio com as duas mãos, mostrando o miolo; **a outra metade está na tábua**, no rodapé do quadro.
**Áudio:** "the crust is burnt but the inside is perfect." (16,54–18,24). Corte em 18,185 cai dentro de "perfect".

**Plano 14 — 18,185 → 19,386 (1,201 s)** · frame `18,786`
Posição A. Quarta e última repetição do enquadramento-base. Boca aberta, sobrancelhas levantadas.
**HUD:** slot 4 (`1HR`) em cinza fantasma.
**Áudio:** "One hour pizza," (18,38–19,46). Corte em 19,386 cai dentro de "pizza".

**Plano 15 — 19,386 → 19,887 (0,501 s)** · frame `19,637`
Posição B, curto. Pá entrando; interior dourado; `1 HR` em **texto branco puro sem disco**, centrado sobre a boca do forno.
**Áudio:** vão de fala (19,46–22,52) — o segundo mais longo.

**Plano 16 — 19,887 → 20,954 (1,067 s)** · frame `20,421`
Posição B. A pizza já está escurecendo na pedra; há haze/fumaça. Display `638.`. O selo `1 HR` mostra **disco parcialmente preenchido, e o disco é preto carbonizado** — o grafismo já entregou o resultado antes da revelação.
**Áudio:** vão de fala.

**Plano 17 — 20,954 → 23,090 (2,136 s)** · frames `21,980` / `22,022` / `22,130`
Posição B. **O reveal.** A pá puxa para fora um **disco totalmente preto** — borda carbonizada em relevo, superfície em crosta preta e laranja-ferrugem, pepperonis reduzidos a anéis pretos. O interior dourado do forno recua à medida que a pizza sai (é o evento fraco de 22,055). O selo 4 encaixa cheio (visível em 22,022).
**Áudio:** o pico mais alto de todo o vídeo, **−0,8 dBFS em ~22,25**, ou seja **0,27 s ANTES** de "oh no" (22,52). Há um impacto de sound design plantado no reveal, e a fala entra em cima dele.

**Plano 18 — 23,090 → 25,526 (2,436 s) — o segundo mais longo** · frames `23,600` / `24,100` / `24,308`
Posição C. MCU. Segura o pote OSMO na mão esquerda, tampa dosadora aberta, e **sacode sobre a pizza preta** — em 24,10 há um **jato laranja contínuo e visível** de tempero caindo no quadro, contra a camiseta branca. A pizza preta ocupa todo o terço inferior sobre a pá de alumínio. Fundo: micro-ondas vermelho, melancias fatiadas, armários claros — desfocados.
**Áudio:** o pitch inteiro. É o plano mais longo depois do 5, e o mais longo da metade final.

**Plano 19 — 25,526 → 26,894 (1,368 s)** · frame `26,210`
Posição C, CU do produto. O pote OSMO preenche o terço central vertical, segurado à frente do rosto (desfocado atrás). **Rótulo totalmente legível** pela primeira vez. Foco cravado no rótulo, fundo e rosto dissolvidos. É o **hero shot** do produto.
**Áudio:** "everything tastes better with Osmo." (25,52–26,92). O corte de entrada (25,526) é o único corte perfeitamente alinhado a fronteira de frase do vídeo.

**Plano 20 — 26,894 → 28,295 (1,401 s)** · frames `27,100` / `27,350` / `27,480` / `27,595`
Posição C. Continuação do hero shot, pote ligeiramente mais à frente/desfocado. **O lockup Walmart entra em ≈ 27,40** no terço inferior, sobre a pizza preta desfocada.
**Áudio:** "Go try some at Walmart now." (27,00–28,48). Corte em 28,295 cai dentro de "now" — e **leva o logo embora junto.**

**Plano 21 — 28,295 → 28,962 (0,667 s)** · frame `28,629`
Posição C. Ergue a pizza preta **inteira** com as duas mãos, frontal, à altura do rosto (só o topo da cabeça aparece). A peça preenche ~85 % do quadro: crosta preta em relevo, centro em mosaico de laranja/ferrugem/preto, cinco pepperonis como discos pretos. É o plano de catálogo do desastre.
**Áudio:** cauda de "now." + vão.

**Plano 22 — 28,962 → 29,596 (0,634 s)** · frame `29,279`
Posição C, CU. Morde a borda carbonizada; a fatia curva atravessa o quadro na horizontal; olhos apertados, sorriso. Ao fundo inferior, a outra metade na pá.
**Áudio:** vão (28,48–29,76).

**Plano 23 — 29,596 → 30,030 (0,434 s)** · frame `29,813`
Posição C, MCU talking-head — **o plano mais próximo do rosto em todo o vídeo**. Olha direto na lente, sobrancelha levantada, **indicador direito levantado** no terço direito. É a citação gestual do plano 1.
**Áudio:** "Hold on," (29,76–30,42). Corte em 30,030 cai dentro de "on".

**Plano 24 — 30,030 → 31,064 (1,034 s)** · frame `30,547`
Posição C. Corta a pizza preta ao meio com um **cortador de roda** sobre a pá; olha para baixo, boca fechada, expressão de avaliação. A pizza já está partida em duas na imagem.
**Áudio:** vão + "yeah" (30,82).

**Plano 25 — 31,064 → 31,398 (0,334 s) — o plano mais curto** · frame `31,231`
Posição C. Ergue uma metade preta, **torta e amassada**, para a lente, segurada pelas duas mãos. O interior exposto mostra laranja/amarelo sob a crosta preta. Abaixo, a outra metade na pá.
**Áudio:** "it's burnt," (30,82–31,24). Pico de **−0,9 dBFS em ~31,00**.

**Plano 26 — 31,398 → 32,619 (1,221 s)** · frame `32,009`
Posição C. Segura a meia pizza preta na horizontal à altura do peito; camiseta branca ocupa o fundo. Em primeiro plano inferior, **a fatia isolada sobre a pá de alumínio, com migalhas e tempero laranja espalhados na superfície metálica**. Termina sem fade, corte seco no fim do arquivo.
**Áudio:** "I might kind of like it though." (31,60–32,46) + pico de −0,9 dBFS em ~32,25.

---

## FASE 4.5 — Reconciliação com a leitura externa

A segunda leitura foi **solicitada e não chegou a tempo**. Procedimento executado:

1. `media_upload` → presigned URL; `curl PUT` do `source.mp4` → **HTTP 200**.
2. `media_confirm(type="video")` → `status: uploaded`, `media_id 3c991361-3e6c-4a4c-9ce4-f1fb18895e6c`.
3. `video_analysis_create(video_input_id=...)` → `id 5bcc928c-8103-4445-8716-f676eda3a2a7`, `status: queued`.
4. Poll em ~3 min e em ~18 min após a criação: **ainda `queued`** nas duas vezes, `scenes: null`, `fail_reason: null`.

Conforme a Fase 0.5 (*"se ainda não voltou quando você chegar na Fase 4, continue sem ele"*), o teardown foi fechado sem essa fonte.

**Nenhuma afirmação deste documento vem da Higgsfield.** Não há, portanto, nada a confirmar ou rejeitar nesta seção: 0 afirmações confirmadas, 0 rejeitadas, 0 incorporadas. Se a análise voltar depois, ela pode ser reconciliada contra os frames já extraídos em `shots/`, `face/`, `reads/` e `walmart/` sem precisar re-medir nada.

---

## FASE 5 — Desenho de áudio

### 5.1 Números

| métrica | valor |
|---|---|
| **LUFS integrado** | **−17,3** |
| **LRA** | **7,1 LU** |
| **True peak** | **−0,2 dBFS** |
| Peak level (astats) | −0,84 dBFS |
| RMS level | −20,3 dB |
| Crest factor | 9,38 |
| Canais | 2 (estéreo) |

Leitura: **−17,3 LUFS é mais alto que o alvo nominal de feed** (−14 a −16 é o normalizado típico das plataformas; abaixo disso é mais quieto). Aqui está no meio do caminho, com **true peak a −0,2 dBFS** — ou seja, **limitado até o teto**. Crest factor 9,38 e LRA 7,1 LU indicam compressão firme mas não esmagada: ainda há 7 LU de faixa entre o mais baixo e o mais alto, e essa faixa está sendo usada de propósito (§5.3).

### 5.2 Não há silêncio. Em lugar nenhum.

`silencedetect` com `noise=-32 dB, d=0.35 s` → **zero intervalos**. Reexecutei com o piso mais permissivo possível, `noise=-45 dB, d=0.20 s` → **ainda zero intervalos**.

Confirmado por medição direta nos vãos de fala:

| janela (sem fala) | mean | max |
|---|---:|---:|
| 1,5 – 4,1 | −27,1 dB | −3,9 dB |
| 5,4 – 8,4 | −27,9 dB | −9,1 dB |
| 19,6 – 22,4 | −23,0 dB | **−0,8 dB** |
| *(com fala)* 23,2 – 25,4 | −16,8 dB | −2,1 dB |

**Existe um leito de áudio contínuo do frame 1 ao último.** Nos vãos ele cai para ~−27 dB médio; sob a voz sobe para ~−16 dB. A diferença de ~11 dB é consistente com **ducking**.

### 5.3 Perfil momentâneo e picos — onde o som foi projetado

Varredura de pico a cada 250 ms sobre os 32,6 s. Os quatro picos que encostam em 0 dBFS:

| t (s) | max | o que está acontecendo |
|---:|---:|---|
| **22,25** | **−0,8 dBFS** | **o pico absoluto do vídeo.** Plano 17, a pizza preta saindo do forno. **0,27 s antes** de "oh no". |
| 31,00 | −0,9 dBFS | plano 25, durante "burnt," |
| 32,25 | −0,9 dBFS | plano 26, logo após "though." — sting final |
| 8,50 | −1,1 dBFS | plano 6, primeira exibição da pizza de 1 min |

Os vales mais fundos ficam em **14,50** (−36,3 dB médio, o ponto mais quieto da peça — pizza escurecendo em silêncio dentro do forno, plano 11) e em **28,75** (−34,6 dB — o respiro de 1,28 s entre o CTA e o button).

**O impacto de 22,25 é a peça-chave do desenho de som:** é um hit plantado exatamente no reveal visual, e ele *precede* a reação falada. O editor não deixou a voz carregar a surpresa — ele colocou um som embaixo dela.

### 5.4 O anúncio é o trecho mais alto do vídeo. Medido.

LUFS integrado por bloco retórico:

| bloco | janela | LUFS-I | LRA |
|---|---|---:|---:|
| hook + 1 s | 0,0 – 4,1 | −20,2 | 4,4 |
| 1 min | 4,1 – 14,0 | −17,7 | 8,8 |
| 10 min | 14,0 – 19,4 | −16,1 | 1,0 |
| reveal 1 h | 19,4 – 23,1 | −18,5 | 3,4 |
| **anúncio OSMO** | **23,1 – 28,3** | **−15,2** | **1,4** |
| button final | 28,3 – 32,6 | −20,5 | 1,3 |

**O bloco publicitário está 5,3 LU acima do button final e 5,0 LU acima do hook.** E com LRA de 1,4 LU — praticamente sem dinâmica, tudo achatado no mesmo nível. Isso não é acidente de gravação: é o pitch mixado mais alto e mais denso que o resto da peça, para não ser perdido se a pessoa estiver com o volume baixo.

### 5.5 Camadas — o que dá para separar

Gerei o espectrograma completo (`spectro.png`, `showspectrumpic`, escala log, 48 kHz estéreo) e li:

- **Corte abrupto em ~18,5 kHz** ao longo de todo o arquivo → lowpass do AAC. Esperado.
- **Estrutura vertical dominante, broadband.** Estrias verticais densas (transientes) sobre um piso de energia contínuo concentrado abaixo de ~4 kHz.
- **Nenhuma linha horizontal sustentada, nenhuma pilha harmônica estável, nenhum padrão rítmico periódico** em todo o espectrograma.

Conclusão do que dá para afirmar:
- **Voz** — presente, identificável, dominante. ✅
- **Foley / ambiente** — presente: o leito contínuo dos vãos de fala, com transientes fortes que coincidem com manipulação (pá, forno, mordida, cortador). ✅
- **SFX pontuais** — pelo menos um, o hit de 22,25. ✅
- ⚠️ **Música** — **não consigo confirmar nem descartar.** A ausência de conteúdo harmônico sustentado no espectrograma **descarta** uma trilha melódica/tonal audível. Não descarta um leito percussivo, atmosférico ou de nível muito baixo, que se confundiria com o ambiente. Ver Ledger.

### 5.6 Sincronia corte × áudio

Comparando `hard_cut_times` com o perfil de pico: **os cortes não caem nos picos.** O pico de 22,25 fica a 0,7 s do corte mais próximo (23,090); o de 31,00 fica a 0,064 s de 31,064 (esse sim, colado); o de 32,25 não tem corte depois.

Ou seja: **não há corte na batida.** Nem poderia haver — não há batida. O ritmo da peça vem do *conteúdo* dos planos e da fala contínua, não de alinhamento musical.

---

## FASE 6 — Estrutura retórica

### 6.1 O hook (0,00 – 3,17) — três apostas distintas

| canal | o que faz | t |
|---|---|---|
| **falado** | "One second pizza," — enuncia a premissa completa em 1,34 s, sem preâmbulo, sem "oi gente", sem se apresentar | 0,00–1,34 |
| **mostrado** | MCU frontal, olhando na lente, pizza crua na pá **já em posição sobre o forno**, dedo em "1" | 0,00 |
| **escrito** | nada em 0,05; o HUD de 4 selos anima entrada e em 0,534 já mostra a estrutura inteira do vídeo | ~0,2–0,5 |

As três apostas são coordenadas, não redundantes. A fala dá a premissa; a imagem dá o contexto físico (forno, pizza, pessoa); **o HUD dá o contrato** — quatro rodadas, e você já sabe quantas faltam. Essa terceira aposta é a que segura a retenção: o espectador consegue medir o próprio investimento.

**Promessa:** quatro pizzas, quatro tempos absurdos, você vai ver os quatro resultados.
**Pagamento:** integral, e rápido. O primeiro resultado (pizza crua) chega em **3,17 s**.

### 6.2 Arco

| beat | janela | o que acontece |
|---|---|---|
| **Premissa** | 0,00 – 3,17 | enuncia o formato; HUD estabelece o contrato |
| **Rodada 1 (gratuita)** | 3,17 – 4,10 | 1 s = crua. Piada barata, paga a promessa imediatamente |
| **Rodada 2 (a boa)** | 4,10 – 11,28 | 1 min = na real ficou boa. **Quebra de expectativa positiva** — é o que impede o vídeo de virar uma escada previsível |
| **Rodada 3 (a virada)** | 11,28 – 18,19 | 10 min = queimada por fora, perfeita por dentro. Introduz a ambiguidade que o final vai reciclar |
| **Reveal / tensão** | 18,19 – 23,09 | 1 h = carvão. Pico de áudio em 22,25, "oh no" em 22,52 |
| **Anúncio** | 23,09 – 28,48 | OSMO como "solução"; hero shot; logo Walmart; CTA |
| **Button** | 28,48 – 32,62 | come a pizza queimada mesmo assim e diz que gostou |

**O ponto estrutural que faz a peça funcionar:** a rodada de 1 hora não existe para ser informativa. Ela existe **para fabricar o problema** que o patrocinador resolve. Os três primeiros tempos são conteúdo genuíno (e o de 1 min é genuinamente útil); o quarto é o setup do anúncio. A costura é invisível porque o formato já prometeu quatro rodadas no segundo 0,5 — o espectador acha que está vendo a escada terminar, não um pitch começar.

### 6.3 Densidade de informação

Onze afirmações distintas em 32,6 s ≈ **3,4 por 10 s**. Distribuição:

| janela | afirmações |
|---|---:|
| 0–10 s | 4 ("1 s pizza", "1 min pizza", "parece ok", início de "ainda crua") |
| 10–20 s | 4 ("ainda crua", "10 min pizza", "não tá horrível", "borda queimada / dentro perfeito") |
| 20–30 s | 3 ("oh no", pitch OSMO, CTA Walmart) |
| 30–32,6 s | 2 ("tá queimada", "acho que gostei") |

A densidade **cai** na janela do anúncio (3 em 10 s) e no button. É coerente com a Fase 1 e a Fase 5: **o anúncio é mais lento, mais alto e menos denso** — três alavancas distintas empurrando na mesma direção, dar espaço para o produto respirar.

### 6.4 Fechamento e CTA

- **CTA falado:** "Go try some at Walmart now." — 27,00 a 28,48, ou seja, **começa a 5,6 s do fim** e termina com 4,1 s sobrando. Nunca no fim seco.
- **CTA visual:** lockup Walmart, 27,40 → 28,295 (0,90 s), terço inferior.
- **Hero shot do produto:** 25,53 → 28,30 (2,77 s somando os planos 19 e 20) = **8,5 % da duração total** dedicada a plano de produto com rótulo legível.
- **Direito de pedir?** Sim, e é por isso que funciona: o pedido chega depois de 23 s de conteúdo cumprido, com o problema (carvão) visível na tela no exato momento em que a solução é oferecida. A troca está explícita.

**O button (28,48 – 32,62) é o movimento mais esperto da peça.** Depois do CTA, o vídeo não acaba — ele volta ao conteúdo e come a pizza queimada mesmo assim ("tá queimada, mas acho que eu meio que gostei"). Isso faz duas coisas: (a) devolve ao espectador a sensação de que o vídeo era sobre pizza e não sobre o patrocinador, e (b) recicla a ambiguidade plantada na rodada de 10 min ("queimada mas boa"), fechando um arco temático que o anúncio tinha interrompido.

### 6.5 Loop — não fecha

| | conteúdo |
|---|---|
| primeiro frame (0,00) | Posição A, MCU frontal, **pizza crua branca** na pá, dedo levantado, HUD ausente |
| último frame (32,62) | Posição C, **meia pizza preta** erguida ao peito, fatia na pá em primeiro plano, HUD com 4 selos cheios |

**Não há loop.** Nem enquadramento, nem sujeito da imagem, nem estado do HUD conversam entre o início e o fim — e o HUD, especificamente, **torna o loop impossível por design**: no último frame os quatro selos estão cheios, no primeiro há um só. Um replay imediato exibe a contradição.

Isso é uma escolha, não um esquecimento. O vídeo aposta em **conclusão** (piada fechada, CTA entregue) em vez de em replay. Para uma peça patrocinada faz sentido: o valor está na impressão única com o CTA visto, não em minutos acumulados de re-exibição.

---

## FASE 7 — Spec de reconstrução

### 7.1 Spec visual global

- **Aspect ratio:** 9:16 vertical. **Resolução de entrega analisada:** 360×640 (⚠️ é o re-encode; produzir em 1080×1920).
- **FPS:** 29,97 constante.
- **Codec de referência:** H.264, AAC-LC 48 kHz estéreo.
- **Tratamento de cor:** contraste baixo, temperatura neutra-quente, sem LUT agressivo, sem halação, sem grão adicionado. Brancos preservados (camiseta e bancada nunca estouram). O único deslocamento de cor é diegético: o interior do forno joga o quadro inteiro para âmbar saturado na posição B.
- **Profundidade de campo:** rasa e consistente em todos os planos de mesa; o fundo da cozinha nunca fica legível o bastante para competir.
- **Cenário fixo:** uma cozinha, clara, armários de madeira clara, bancada branca, prateleira com moedor/porta-facas/potes, micro-ondas vermelho, melancias fatiadas, batedeira preta, pia com torneira. Tábua de madeira clara na frente. Forno de pizza de bancada com display digital e botão giratório (⚠️ wordmark parcial `ooni`).
- **Adereços:** pá de alumínio com cabo preto, cortador de pizza de roda, papel de forno, pote OSMO.
- **Figurino:** camiseta branca lisa de manga curta, sem estampa. Mesma peça o vídeo inteiro (permite regravar rodadas em qualquer ordem).

### 7.2 Shot list

Ver a tabela completa da Fase 1.2 (26 planos, in/out/duração exatos). Resumo executivo para a filmagem:

- **4 setups de câmera:** posição A (forno frontal), B (boca do forno), C (mesa). A posição A é reusada literalmente 4×, com o mesmo enquadramento — grave de uma vez só.
- **Duração-alvo:** média 1,255 s. Nada abaixo de 0,33 s, nada acima de 3,21 s.
- **Onde gastar tempo:** plano 5 (3,20 s, bake de 1 min), plano 18 (2,44 s, sacudir OSMO), plano 17 (2,14 s, reveal do carvão). Esses três são 24 % da duração total.
- **Onde correr:** os 5 planos após o CTA, somando 4,3 s.

### 7.3 Roteiro falado, com marcação de corte

Cada `|` é um corte duro caindo naquele ponto exato da fala.

```
[0,00]  One second pi|zza,                                   ← corte 1,068
        ................ (vão 2,98 s) ............           ← cortes 3,170 e 4,104
[4,32]  one minute pizz|a,                                   ← corte 5,205
        ................ (vão 3,32 s) ............           ← corte 8,408
[8,56]  it actually looks ok|ay,                             ← corte 9,576
        .. (vão 0,60 s) ..                                   ← corte 10,310
[10,34] still a little ra|w.                                 ← corte 11,278
[11,36] Ten minute piz|za,                                   ← corte 12,179
        ................ (vão 2,50 s) ............           ← corte 14,014
[14,82] it doesn't look terrible,|                           ← corte 15,883 (no fim da palavra)
        .. (vão 0,66 s) ..                                   ← corte 16,450
[16,54] the crust is burnt but the inside is perfe|ct.       ← corte 18,185
[18,38] One hour piz|za,                                     ← corte 19,386
        ................ (vão 3,06 s) ............           ← cortes 19,887 e 20,954
        [22,25 ► IMPACTO SFX, −0,8 dBFS]
[22,52] oh no,|                                              ← corte 23,090
[23,16] the only thing that can make this taste better
        is Osmo because|everything tastes better with Osm|o. ← cortes 25,526 e 26,894
[27,00] Go try some at Walmart no|w.                         ← corte 28,295
        .. (vão 1,28 s) ..                                   ← cortes 28,962 e 29,596
[29,76] Hold o|n,                                            ← corte 30,030
[30,82] yeah it's bur|nt,                                    ← corte 31,064
                                                             ← corte 31,398
[31,60] I might kind of like it though.
```

**Regra de edição extraída:** narração gravada contínua, imagem cortada por cima sem respeitar fronteira de palavra. **Não insira respiros na fala** — os vãos longos são estruturais (a pizza assando), não pausas retóricas.

### 7.4 Spec de texto na tela

**HUD de quatro selos** (elemento principal, presente ~0,2 s → fim)

| propriedade | spec |
|---|---|
| conteúdo | `1s` · `1 MIN` · `10 MIN` · `1HR` |
| posição | fila horizontal, y ≈ 0,11–0,13; x de ≈ 0,10 a ≈ 0,88; espaçamento regular |
| tipografia | sans-serif pesada, oblíqua, arredondada; numeral grande + unidade pequena abaixo; **contorno preto grosso** + sombra suave |
| estado vazio | círculo cinza ~30 % opacidade, rótulo em cinza |
| estado cheio | disco opaco com ilustração de pizza vista de cima, rótulo em branco |
| **arte por selo** | 1 s = queijo cru pálido · 1 MIN = dourada assada · 10 MIN = laranja escura tostada · 1 HR = **disco preto carbonizado** |
| animação | 1. rótulo se destaca do slot em texto puro → 2. desce e cresce, centrado sobre a boca do forno → 3. disco se desenha atrás por **varredura radial horária** (pie chart literal) → 4. ao completar, encaixa de volta no slot em escala pequena |
| tempos medidos (selo 1) | destaca 1,20 · 65 % em 1,60 · 100 % em 2,60 · encaixado em 3,10 |
| tempos medidos (selo 2) | texto no slot até 5,15 · desce 5,30 · 50 % em 6,50 · encaixado em 8,30 |
| gatilho | **o evento da cozinha** (pizza entrando no forno), não a fala |

**Insert de rosto**

| propriedade | spec |
|---|---|
| janela | ≈ 3,40 → 3,87 (0,47 s), dentro do plano 3 |
| conteúdo | rosto masculino em grito, ⚠️ compatível com meme de reação de Gordon Ramsay |
| tratamento | composto sobre o fundo, desfocado, opacidade parcial, ocupando a metade superior |
| animação | aparece e some por corte/fade rápido; sem escala |

**Lockup Walmart**

| propriedade | spec |
|---|---|
| janela | 27,40 → 28,295 (0,90 s); sai no corte de plano |
| conteúdo | wordmark `Walmart` azul + spark amarelo de 6 pétalas, com halo branco |
| posição | terço inferior, centrado, y ≈ 0,78 |
| animação | corte seco na entrada e na saída |
| sincronia | entra **0,36 s antes** da palavra "Walmart" (27,76) |

**Legenda queimada:** nenhuma. Não adicionar.
**Chrome de plataforma:** nenhum. Exportar limpo.

### 7.5 Spec de áudio

| parâmetro | alvo |
|---|---|
| LUFS integrado (peça inteira) | **−17,3** |
| LRA | **7,1 LU** |
| True peak | **−0,2 dBFS** (limitado no teto) |
| Silêncio | **zero.** Leito contínuo do frame 1 ao último |
| Nível do leito nos vãos de fala | ≈ −27 dB médio |
| Ducking sob a voz | ≈ 11 dB |
| **Bloco publicitário (23,1–28,3)** | **−15,2 LUFS, LRA 1,4** — 5 LU acima do resto, achatado |
| Hook (0–4,1) | −20,2 LUFS |
| Button (28,3–32,6) | −20,5 LUFS |
| Impacto SFX | **22,25 → −0,8 dBFS**, 0,27 s antes de "oh no" |
| Picos secundários | 31,00 (−0,9) · 32,25 (−0,9) · 8,50 (−1,1) |
| Ponto mais quieto | 14,50 (−36,3 dB médio) |
| Camadas | voz + foley/ambiente + SFX pontuais. ⚠️ música: sem conteúdo tonal sustentado detectável |
| Corte na batida | **não** — não há grade rítmica |

### 7.6 O que NÃO consegui determinar

1. **A URL e a plataforma de origem.** O arquivo chegou como `videoplayback (1).mp4`; os metadados apontam YouTube, mas não tenho o link, o canal, o título, a data nem as métricas.
2. **A identidade de quem apresenta.** Não há handle, não há marca d'água, não há apresentação falada.
3. **A identidade do rosto no insert de 3,40–3,87.** Ver Ledger.
4. **A quarta linha do rótulo OSMO** (o nome do sabor). Não resolve em 360p.
5. **Se existe trilha musical.** Ver Ledger.
6. **Modelo de câmera, lente, esquema de iluminação.** Inferíveis por aparência, não mensuráveis a partir do arquivo. Não há metadados de captura (o container só traz `encoder: Google`).
7. **Modelo exato do forno.** Wordmark parcialmente legível (⚠️ `ooni`), cortado pela borda do quadro.
8. **Se o display do forno é °F ou °C.** Os valores (629–658) só fazem sentido em **°F**, mas a unidade não aparece na tela. Não vou afirmar o que o display não mostra.
9. **Se a peça é nativa do YouTube Shorts ou foi publicada em várias plataformas.** Sem chrome, sem como saber.
10. **Quantas tomadas foram feitas / se as quatro rodadas são pizzas diferentes ou a mesma regravada.** Não determinável pela imagem.

---

## FASE 8 — Ledger de incerteza

| # | o que está incerto | por quê | o que resolveria |
|---|---|---|---|
| 1 | A palavra **"Ten"** em 11,36–11,60 | Whisper devolveu **p = 0,45**, a probabilidade mais baixa de toda a transcrição. O segmento em que ela está tem boa confiança geral (`avg_logprob −0,270`), mas a palavra isolada não. O selo `10 MIN` na tela é **corroboração independente**, não confirmação do áudio — a Regra nº 1 proíbe tratar texto na tela como fala. | Rodar `--model large-v3`, ou `--no-vad`, e comparar. |
| 2 | **Identidade do rosto** no insert de 3,40–3,87 | Fisionomia fortemente compatível com Gordon Ramsay em formato de meme de reação, mas o frame de origem é 360p, o insert está deliberadamente desfocado, e não há texto identificando. Afirmar seria plausibilidade, não medição. | O arquivo em resolução original, ou a URL do vídeo. |
| 3 | **Quarta linha do rótulo OSMO** (26,210) | Bloco de ~2 palavras em vermelho/laranja sob o wordmark. Não resolve nem com crop + upscale 4×. É o nome do sabor. | Master em 1080p, ou a página do produto. |
| 4 | **Wordmark na base do forno** (4,655) — leitura `ooni` | Minúsculas, cortado pela borda inferior do quadro, ~8 px de altura na fonte. A leitura é parcial. | Frame de outro plano onde a base apareça inteira; nenhum dos 26 planos mostra. |
| 5 | **Existe trilha musical?** | O espectrograma descarta conteúdo harmônico/tonal sustentado — não há trilha melódica audível. Não descarta leito percussivo, atmosférico ou de nível muito baixo, indistinguível do ambiente na análise espectral. | Separação de fontes (ex.: Demucs) sobre o áudio, ou os stems. |
| 6 | **Unidade do display do forno** (629/636/658/638) | Só numerais e ponto aparecem; nenhum `F` ou `°` na tela. Os valores são coerentes com °F, mas isso é inferência sobre fornos, não leitura do frame. | Frame onde a unidade apareça; nenhum dos extraídos mostra. |
| 7 | **Grão, banding, nitidez e tratamento de cor** | Todo o material analisado é um re-encode 360p a ~600 kbps, perfil Constrained Baseline. Qualquer julgamento de textura descreve o re-encode, não o master. | O arquivo original. |
| 8 | **Leitura externa (Higgsfield)** | Upload e criação bem-sucedidos (`5bcc928c-8103-4445-8716-f676eda3a2a7`), mas a análise seguia **`queued`** em dois polls (~3 min e ~18 min). Nenhuma afirmação dela entrou neste documento. | Repolling; os frames já extraídos permitem reconciliar depois sem re-medir. |

### Procedência

| item | detalhe |
|---|---|
| **Probe** | `probe.py`, limiares **default** (`--scene-floor 0.08`, `--hard-cut 0.25`). Sem ajuste — a distribuição de scores era bimodal e limpa. |
| **Cortes** | 25 cortes duros / 26 planos, **todos vindos do `probe.py`**. Nenhum corte foi contado no olho. |
| **Candidatos fracos** | 7 avaliados, **7 rejeitados** como movimento de câmera/sujeito ou eco pós-corte, cada um com par de frames antes/depois. |
| **Transcrição** | **Whisper local** — `transcribe_local.py`, modelo **`medium`**, `device=cpu`, `compute_type=int8`, `--language en`, `--words`. RTF 1,14×. **Sem rede, sem API.** |
| **Caption track** | Inexistente. Diff de três fontes reduzido a duas (§2.2). |
| **Áudio** | `probe.py` (LUFS/LRA/true peak/perfil momentâneo a 0,5 s) + `silencedetect` a −32 dB e a −45 dB + `volumedetect` em varredura de 250 ms sobre os 32,6 s (131 janelas) + `ebur128` por bloco retórico (6 blocos) + `astats` + `showspectrumpic`. |
| **Frames abertos com `Read`** | **76 imagens**, todas em PNG lossless via `grab.py --precise`, contagem exata por pasta: `shots/` 26 (midpoint de cada plano, upscale 2×) · `hudseq/` 13 (varredura densa da animação de selo) · `weak/` 9 (pares antes/depois dos 7 candidatos fracos) · `face/` 8 (janela do insert de rosto, crop 4×) · `walmart/` 7 (janela do lockup, crop 2–3×) · `lower/` 6 (terço inferior, verificação de legenda) · `reads/` 5 (display do forno e rótulo OSMO, crop 4×) · `brand/` 1 · `spectro.png` 1. A pasta `hud/` foi gerada mas **não aberta** — a `hudseq/` a tornou redundante. |
| **Frames de 512 px** | Os 26 frames da skill `/watch` foram vistos numa passagem anterior, mas **não sustentam nenhuma afirmação deste documento** — tudo foi re-extraído em resolução nativa. Isso importa: a 512 px o display do forno lia `635.`, e em nativo lê `638.`; e o insert de rosto do plano 3 era **invisível**. |
| **Leitura externa** | Higgsfield MCP acionado, `queued` nos dois polls, **0 afirmações incorporadas**. |
| **Arquivos de trabalho** | `probe.json`, `whisper.json`, `spectro.png`, `shots/`, `weak/`, `hud/`, `hudseq/`, `lower/`, `reads/`, `face/`, `walmart/`, `brand/` em `D:\gevia\ugc\teardown-pizza-osmo\`. |
