---
name: video-teardown
description: Desmonta um vídeo por completo — todo corte, todo frame, toda palavra falada, todo elemento na tela, toda escolha de áudio — e devolve um documento forense detalhado o bastante para um editor competente reconstruir o vídeo só pelas notas, sem nunca ver o original. Mede tudo que afirma (scene detection, ffprobe, Whisper, frames em resolução nativa) em vez de resumir de olho. Use quando o usuário disser "faz um teardown desse vídeo", "analisa esse vídeo a fundo", "desmonta esse Reels/TikTok/short", "quero engenharia reversa desse vídeo", ou colar uma URL/arquivo de vídeo pedindo análise.
version: "1.1"
user-invocable: true
allowed-tools: Read, Bash, Glob, Grep, AskUserQuestion, Write, Artifact, mcp__higgsfield__media_upload, mcp__higgsfield__media_confirm, mcp__higgsfield__video_analysis_create, mcp__higgsfield__video_analysis_status
argument-hint: "<url-ou-caminho-do-vídeo> [foco opcional: 'copy', 'edição', 'áudio', 'hook']"
---

# /video-teardown

**PAPEL.** Você é um analista forense de vídeo de formato curto. O usuário te deu
um vídeo. Seu trabalho é desmontá-lo por completo — todo corte, todo frame, toda
palavra falada, todo elemento na tela, toda escolha de áudio — e devolver um
documento de teardown detalhado o bastante para **um editor competente
reconstruir o vídeo a partir das suas notas apenas, sem nunca ter visto o
original**.

Não resuma. Não passe os olhos. Não chute. **Meça tudo que você afirmar.**

---

## REGRAS DURAS

Violar qualquer uma delas **invalida o teardown**. Não são preferências de
estilo; são o que separa um teardown de um resumo com timestamps inventados.

**1. Legenda NÃO é o roteiro.** Texto queimado no vídeo frequentemente é
diferente do que é de fato dito. Você tem de transcrever o áudio **em separado**
e tratar essa transcrição como fonte de verdade. Nunca leia um texto na tela e
apresente como fala.

**2. Separe três tipos de texto na tela, e reporte cada um no seu bloco:**

| | o que é | exemplo |
|---|---|---|
| **(a) legenda queimada** | a sobreposição palavra-a-palavra ou frase-a-frase que transcreve a fala | karaokê de TikTok, bloco branco centralizado |
| **(b) grafismo desenhado** | title card, gráfico animado, lower-third, end card, motion graphic cujo texto é parte do design | "3 ERROS QUE VOCÊ COMETE" em tipografia tratada |
| **(c) chrome de plataforma** | logo do TikTok, @handle, marca d'água, botões de UI, QR "scan me" | overlay do app, não do criador |

Não são intercambiáveis. **Um title card animado não é uma legenda.**

**3. Nunca presuma o ritmo de corte.** Rode scene detection e reporte o **número
real** de cortes e seus timestamps exatos. Vídeo que "parece" cortado rápido pode
ser um take único travado; vídeo que parece lento pode ter match-cut escondido.
Só o `probe.py` decide isso — nunca o seu olho passando pelos frames.

**4. Leia por inteiro todo texto legível na tela**, extraindo aquele frame em
resolução cheia. Se o vídeo mostra um prompt, um rótulo, uma tela de app ou um
documento, **transcreva verbatim** — esse conteúdo costuma ser a parte mais
valiosa do teardown inteiro.

**5. Declare sua incerteza.** Se uma linha da transcrição está truncada ou um
detalhe está ilegível, diga isso explicitamente e marque ⚠️. **Nunca invente uma
palavra plausível para preencher buraco.**

**6. Timestamp vem de ferramenta, não de vibe.** Toda vez que você escrever
`0:14`, tem de ser rastreável a um evento de scene detection, um segmento do
Whisper, ou um frame que você realmente extraiu.

**7. Leitura externa é hipótese, não verdade.** Se você usar uma ferramenta de
terceiros pra descrever o vídeo (Higgsfield MCP ou qualquer outra — ver Fase
0.5), toda afirmação dela é candidata a confirmação, nunca fato aceito de
graça — mesmo vindo com timestamp, mesmo em tom confiante. Confirme contra o
frame que você mesmo abriu antes de escrever qualquer coisa que veio de lá.
Isso vale em dobro pra descrição que soa observação visual mas é na real
paráfrase da fala (textura, temperatura de forno, sabor) — nada disso é
visível num frame. E a contagem/timestamp de corte são sempre os do
`probe.py`; a segmentação de "cenas" de uma ferramenta externa nunca
substitui os seus planos medidos.

---

## Resolva `SKILL_DIR` antes de qualquer comando

Todo comando abaixo roda um script em `SKILL_DIR/scripts/`. `SKILL_DIR` é o
**diretório absoluto que contém ESTE SKILL.md que você acabou de ler** — o
harness te deu esse caminho no resultado do Read. Tipicamente:

```
<raiz do repo ugc>/.claude/skills/video-teardown     (skill do projeto — o caso normal)
~/.claude/skills/video-teardown                      (install do usuário, se houver)
```

No **Windows use `python`**, não `python3` (o `python3` é o stub da Microsoft
Store e não roda o script). No **macOS/Linux use `python3`** onde este arquivo
diz `python`. Guard uma vez no começo:

```bash
SKILL_DIR="<diretório absoluto deste SKILL.md>"
test -f "$SKILL_DIR/scripts/probe.py" || { echo "SKILL_DIR errado: $SKILL_DIR" >&2; exit 1; }
```

---

## FASE 0 — INTAKE & PROBE

Estabeleça a verdade de base **antes** de qualquer análise. Nada de opinião
nesta fase.

### 0.1 — Obtenha o arquivo local

O teardown precisa do **arquivo de vídeo em disco**. Sem ele não há scene
detection, não há frame em resolução nativa, não há áudio para o Whisper — e
metade das regras duras vira impossível.

- **URL** (YouTube, TikTok, Reels, Vimeo, X…): baixe com `yt-dlp`, junto das
  legendas nativas e dos metadados, num diretório de trabalho dedicado:

  ```bash
  WORK="./teardown-<slug>"; mkdir -p "$WORK"
  yt-dlp --write-subs --write-auto-subs --sub-langs "all" --write-info-json \
         --no-playlist -o "$WORK/source.%(ext)s" "<URL>"
  ```

- **Arquivo local**: use o caminho direto. Se o usuário anexou o vídeo ao chat
  sem caminho em disco, **peça o caminho** — você não consegue medir um anexo.

Se `yt-dlp` não estiver no PATH desta sessão (comum no Windows logo após
instalar), ele está em
`%LOCALAPPDATA%\Microsoft\WinGet\Packages\yt-dlp.yt-dlp_*\yt-dlp.exe`.
Os scripts desta skill já fazem esse fallback sozinhos para `ffmpeg`/`ffprobe`.

### 0.2 — Meça o arquivo

```bash
python "$SKILL_DIR/scripts/probe.py" "$WORK/source.mp4" --out "$WORK/probe.json"
```

Isso devolve, tudo medido e nada inferido:

- **metadata** — duração, resolução, aspect ratio (`is_vertical`), fps real,
  codecs, bitrate, canais de áudio, se há stream de legenda embutida, tags do
  container;
- **cut_stats** — contagem de cortes duros, timestamps exatos, duração de cada
  shot, média/mín/máx, cortes por minuto, e o booleano **`single_take`**;
- **weak_cut_candidates** — eventos de cena com score abaixo do limiar duro:
  é aqui que **match-cut escondido** aparece. Olhe cada um antes de descartar;
- **silence** — intervalos de silêncio (respiração, pausa retórica, corte seco);
- **loudness** — LUFS integrado, LRA, true peak, e um **perfil de loudness
  momentâneo** a cada 0,5 s — é com ele que você localiza onde a música entra,
  onde é duckada sob a voz, e onde bate o pico.

Ajuste os limiares quando o material pedir, e **declare no relatório qual usou**:

```bash
# material com câmera na mão: sobe o limiar de corte duro para não contar tremida como corte
python "$SKILL_DIR/scripts/probe.py" VIDEO --hard-cut 0.35
# material com jump-cut sutil no mesmo enquadramento: baixa o piso
python "$SKILL_DIR/scripts/probe.py" VIDEO --scene-floor 0.04 --hard-cut 0.15
```

### 0.3 — Frames + transcrição base (`/watch`)

A skill `watch` (plugin `watch@claude-video`) faz o transporte: extrai frames
com consciência de cena e traz a transcrição. Use-a — não reimplemente.

```bash
python "<WATCH_SKILL_DIR>/scripts/watch.py" "<url-ou-arquivo>" \
       --detail balanced --out-dir "$WORK/watch"
```

`WATCH_SKILL_DIR` é a pasta irmã desta skill: `"$SKILL_DIR/../watch"` (as duas
moram lado a lado em `.claude/skills/`). Confira com
`test -f "$SKILL_DIR/../watch/scripts/watch.py"`. Se a skill `watch` não estiver
lá, a saída dela pode ser substituída por frames do `grab.py` + Whisper manual,
mas **diga isso no relatório**.

Depois **`Read` cada frame** que o `watch` listou. Frames que você não abriu não
existem para o teardown; não escreva sobre um shot cujo frame você não viu.

### 0.4 — Portão da Regra Dura nº 1

Antes de seguir, determine **de onde virá a transcrição do áudio**. Você não
escuta o vídeo; sua única via até o áudio é o Whisper (ou uma caption track já
existente). Isso decide se o teardown é possível:

| situação | o que fazer |
|---|---|
| Há caption track nativa **e** chave Whisper | Rode **as duas** e faça o diff (§2.2). O melhor caso. |
| Sem caption track, **com** chave Whisper | Whisper é a fonte de verdade. Prossiga. |
| Há caption track, **sem** chave Whisper | Prossiga, mas marque **⚠️ toda** a transcrição como "caption track não verificada contra o áudio" e diga que a Regra nº 1 está **parcialmente cumprida**. |
| Sem caption track, **sem** chave Whisper | **PARE.** Diga ao usuário que o teardown não pode cumprir a Regra nº 1 e que falta uma chave em `~/.config/watch/.env` (`GROQ_API_KEY`, mais barato, ou `OPENAI_API_KEY`). Ofereça o teardown **visual apenas**, rotulado como tal, com a seção de fala vazia. **Nunca** preencha esse buraco lendo a legenda queimada dos frames. |

Estado atual da chave:

```bash
python "<WATCH_SKILL_DIR>/scripts/setup.py" --json
```

---

## FASE 0.5 — SEGUNDA LEITURA OPCIONAL (Higgsfield MCP)

Se o MCP `higgsfield` estiver conectado neste projeto, rode a análise de
vídeo deles em paralelo com o resto da Fase 0 — ela serve só como **gerador
de hipótese** para enriquecer a Fase 4, nunca como fonte de verdade (Regra
Dura nº 7). Se o servidor `higgsfield` não estiver configurado ou conectado
nesta sessão, **pule esta fase inteira** e siga o teardown como sempre —
declare isso no ledger da Fase 8 ("leitura cruzada Higgsfield não aplicada —
MCP indisponível").

### 0.5.1 — Envie o vídeo

- **Fonte já é `youtube.com`/`youtu.be`:** passe a URL original direto —
  `video_analysis_create(youtube_url=...)`. Não baixe de novo pra isso.
- **Qualquer outra fonte** (TikTok, Reels, Vimeo, X, arquivo local): o
  `video_analysis_create` só aceita YouTube ou um `video_input_id` já
  confirmado. Suba o `$WORK/source.mp4` que a Fase 0.1 já baixou:

  ```
  media_upload(filename="source.mp4", content_type="video/mp4")
  # PUT os bytes na upload_url retornada:
  # curl -X PUT -H "Content-Type: video/mp4" --data-binary @source.mp4 "<upload_url>"
  media_confirm(type="video", media_id="<media_id>")
  video_analysis_create(video_input_id="<media_id>")
  ```

### 0.5.2 — Espere e guarde

Poll `video_analysis_status(video_analyze_id=...)` a cada 20-30s até
`status="completed"` (ou `"failed"` — se falhar, siga sem essa fonte e
declare no ledger). Em clipes curtos costuma voltar em menos de um minuto,
mas não trave o teardown nisso: se ainda não voltou quando você chegar na
Fase 4, continue sem ele e reconcilie na Fase 4.5 se a resposta chegar antes
da entrega.

Salve o JSON bruto em `$WORK/higgsfield_scenes.json` — é evidência, não
rascunho; ele sustenta a procedência da Fase 8.

⚠️ A própria ferramenta avisa que a precisão cai em vídeos longos. Acima de
~3 minutos, trate a saída dela com ainda mais ceticismo do que o normal (ou
nem chame — o custo de verificar claim a claim cresce mais rápido que o
benefício). Confira `balance`/`transactions` do Higgsfield antes de rodar em
lote muitos vídeos — o custo por chamada pode variar por plano.

---

## FASE 1 — CORTE E RITMO

Fonte: `cut_stats` + `weak_cut_candidates` do `probe.json`. **Não olhe os frames
para contar corte** — os frames são amostra, o scene score é medida.

Entregue:

1. **Contagem real de cortes** e a lista de timestamps.
2. **Tabela de shots**: `#`, entrada, saída, duração, o que está em quadro.
3. **Ritmo**: duração média, mín, máx, cortes/minuto — e o **desenho** do ritmo
   (acelera ao longo? desacelera no CTA? shot longo isolado onde a informação
   pesa?).
4. **`single_take: true`** é um achado de primeira linha, não um detalhe — diga
   explicitamente que o vídeo é um take único e que a sensação de ritmo vem de
   outro lugar (fala, legenda animada, zoom digital).
5. **Candidatos fracos**: para cada um, extraia o frame imediatamente antes e
   depois (`grab.py --at`) e decida — match-cut, corte disfarçado por movimento,
   ou só movimento de câmera? Declare a decisão e a evidência.
6. **Cortes de áudio vs cortes de vídeo**: cruze `silence.intervals` com
   `cut_stats.hard_cut_times`. Corte de vídeo que cai dentro de silêncio é
   respiro; corte que cai no meio da palavra é J/L-cut ou jump-cut agressivo.
   Isso é medível e quase ninguém mede.

---

## FASE 2 — ÁUDIO É A FONTE DE VERDADE

### 2.1 — Transcrição do áudio

**O caminho padrão é o Whisper LOCAL** — sem chave de API, sem rede, e com os
timestamps medidos que a Regra nº 6 exige:

```bash
WHISPER_PY="$(sed -n 's/^WATCH_LOCAL_WHISPER_PYTHON=//p' ~/.config/watch/.env | tr -d '\r')"
test -x "$WHISPER_PY" || test -f "$WHISPER_PY" || { echo "Whisper local não configurado — rode o setup do repo (README)" >&2; }
"$WHISPER_PY" "$SKILL_DIR/scripts/transcribe_local.py" "$WORK/source.mp4" \
  --words --out "$WORK/whisper.json"
```

O interpretador é o do venv dedicado, **não** o `python` do PATH — é lá que o
`faster-whisper` está instalado. O caminho dele é por máquina e mora em
`WATCH_LOCAL_WHISPER_PYTHON` no `~/.config/watch/.env` (o setup do repo, `setup/`,
cria o venv e grava a chave). Os pesos ficam em `~/.cache/whisper-local/models`
(SSD, por decisão medida: ver §2.3).

Flags que importam no teardown:

- **`--words`** — timestamps por palavra. É o que permite responder se a legenda
  queimada em karaokê está **em sincronia** com o áudio ou correndo à frente.
  Não peça se não for usar: infla o JSON.
- **`--language pt`** — force quando a autodetecção errar (áudio curto com
  música alta é onde ela erra).
- **`--no-vad`** — o filtro de voz engole fala quando a música está alta demais.
  Se a transcrição vier com buracos, tente sem ele antes de marcar ⚠️.
- **`--model`** — ver §2.3.
- **`--device cuda`** — ver §2.3. **Não use sem ler.**

Guarde o JSON: ele é a **fonte de verdade da fala** e o lado esquerdo do diff da
§2.2. Cada segmento traz `avg_logprob` e `no_speech_prob` — a confiança do
próprio modelo. Segmento com `avg_logprob` muito baixo (abaixo de ~-0,8) ou
`no_speech_prob` alto é candidato a ⚠️ **com número para citar** no ledger da
Fase 8, em vez de "achei que estava ruim".

Se o `/watch` tiver trazido uma caption track nativa, ela **não substitui** isto
— ela é a segunda coluna do diff da §2.2.

Alternativa por API (Groq/OpenAI), caso um dia haja chave configurada:
`python "<WATCH_SKILL_DIR>/scripts/whisper.py" "$WORK/source.mp4"`. Mesmo formato
de segmentos, então o resto do teardown não muda.

### 2.3 — Modelo, disco e GPU

Os números abaixo foram medidos na máquina onde esta skill nasceu (Windows, SSD
NVMe no `C:` + HD mecânico no `D:`, GTX 1650). Em outra máquina os tempos mudam,
mas as conclusões valem.

**Os pesos moram no SSD, e isso não é preferência.** Mesmo modelo, mesmo código:
carregar do HD mecânico levou **327 s**; do SSD NVMe, **2,0 s**. O venv pode
ficar num disco lento — os pesos são relidos a cada execução. O default do script
já aponta para `~/.cache/whisper-local/models`, que fica no disco do sistema.

**Modelo: o default é `medium`** (o setup do repo já baixa ele). Medido no mesmo
clipe de 19 s, CPU int8:

| modelo | disco | load | RTF frio | RTF quente | acertou a frase de teste? |
|---|---:|---:|---:|---:|---|
| `small` | 467 MB | 2,0 s | 3,3× | — | **não** — "one of the elephants" (p=0,91 na palavra errada) |
| **`medium`** | **1,5 GB** | 17,9 s frio / 4,6 s quente | 0,50× | **1,23×** | **sim** — "in front of the elephants" |
| `large-v3` | ~3,1 GB | — | — | — | não medido (não cabia no SSD da máquina de origem) |

**Frio e quente diferem 2,5×** porque na primeira execução o SO ainda não tem os
pesos em cache. Conte com o pior caso ao planejar: um Reels de 60 s leva de ~50 s
(quente) a ~2 min (frio). Se for transcrever vários vídeos seguidos, só o
primeiro paga o preço cheio.

Pedir `--model small` ou `large-v3` **funciona**, mas dispara download na
primeira vez (medium levou 48 s; large-v3 leva minutos) e grava em
`~/.cache/whisper-local/models` — cheque o espaço em disco antes. **Declare sempre no relatório qual modelo
produziu a transcrição**: faz parte da procedência da Fase 8, e a tabela acima
mostra que o modelo muda o que a fala diz.

**GPU: use `--device cuda` apenas deliberadamente** (e nunca no macOS — lá não
existe CUDA; o default CPU é o caminho). Na máquina de origem (GTX 1650,
driver 581.57, CUDA 13.0) o CTranslate2 inicializa o contexto CUDA, aloca
341 MiB e **trava** a 0% de utilização — reproduzido com `tiny` e `small`, com
cuBLAS 12.9 + cuDNN 9.25 **e** com o par 12.4.5.8 + 9.1.0.70. Por isso o default
é CPU: a cascata de fallback do script captura exceção, e travamento não lança
exceção nenhuma. Se um dia a GPU for consertada, `--device cuda` volta a valer o
teste.

Reporte a transcrição **com timestamps por segmento**, marcando ⚠️ em toda
palavra duvidosa. Não "limpe" a fala: hesitação, repetição e frase quebrada são
dado — muito hook curto vive exatamente da hesitação.

### 2.2 — O diff das três fontes (o achado mais valioso do teardown)

Você tem até três versões do mesmo texto. **Elas divergem, e a divergência é
informação de edição:**

| fonte | de onde vem | o que revela |
|---|---|---|
| **áudio** (Whisper) | o que foi de fato dito | o roteiro real |
| **caption track** (`.vtt` do yt-dlp) | arquivo de legenda | auto-gerada ≈ áudio; enviada pelo criador pode ser reescrita |
| **texto queimado** (lido dos frames) | pixels | o que o criador quis que fosse **lido**, não ouvido |

Monte a tabela de divergências: `timestamp | falado | queimado | delta`.
Palavra encurtada para caber na tela, palavrão trocado por asterisco, número
arredondado no áudio e exato na tela, promessa que só existe na legenda — cada
uma dessas é uma decisão editorial deliberada e entra no relatório.

Sem divergência nenhuma, **diga isso** ("legenda queimada bate 1:1 com o áudio
nos N pontos verificados") — é resultado, não ausência de resultado.

---

## FASE 3 — TEXTO NA TELA, TRÊS BLOCOS SEPARADOS

Regra Dura nº 2 vira três seções, **nunca uma lista misturada**.

Para cada elemento de texto, extraia o frame em resolução nativa e leia:

```bash
# frame cheio, com upscale para tipografia pequena sobreviver
python "$SKILL_DIR/scripts/grab.py" "$WORK/source.mp4" \
       --at 3 7.5 0:14 1:02 --out-dir "$WORK/reads" --upscale 2

# só a faixa da legenda (terço inferior), ampliada 3x
python "$SKILL_DIR/scripts/grab.py" "$WORK/source.mp4" \
       --at 0:09 --out-dir "$WORK/reads" --crop 0,0.7,1,1 --upscale 3
```

Depois **`Read` cada PNG** e transcreva **verbatim**. Se um prompt, uma tela de
app, um gráfico ou um documento aparece em quadro, ele é transcrito por inteiro —
Regra nº 4. Ilegível é ⚠️, nunca preenchido por plausibilidade.

Para cada bloco reporte: timestamp de entrada e saída, posição no quadro
(terço superior/central/inferior, alinhamento), tipografia (família aparente,
peso, caixa, cor, contorno/sombra/fundo), animação (corte seco, fade, pop,
karaokê palavra-a-palavra, typewriter) e **função** (o que esse texto faz que a
fala não faz).

**(a) legenda queimada** — estilo, posição, cadência, e se acompanha a fala ou
antecipa. **(b) grafismo desenhado** — cada card, gráfico, lower-third, end card,
com o texto completo e o desenho. **(c) chrome de plataforma** — handle, marca
d'água, UI; útil para identificar a plataforma de origem e se o vídeo é repost.

---

## FASE 4 — SHOT A SHOT

Uma entrada por shot da tabela da Fase 1. Para cada um:

- **Entrada/saída/duração** (da medição, não do olho).
- **Enquadramento e lente aparente** — plano fechado/médio/aberto, altura da
  câmera, distorção de grande-angular, profundidade de campo.
- **Movimento** — travelling, pan, zoom digital (dá para ver: bordas do frame
  aparando), estabilização, câmera na mão vs tripé.
- **Composição** — onde o sujeito está no quadro, headroom, regra dos terços ou
  centralizado, o que ocupa o espaço negativo (é onde a legenda vai).
- **Luz e cor** — direção da chave, dureza, temperatura, contraste, cor
  dominante, se há tratamento (LUT, halação, grão).
- **Conteúdo** — quem/o quê está em quadro, o que muda em relação ao shot
  anterior.
- **O que o áudio está dizendo neste shot** (cruze com a Fase 2).

**Se a Fase 0.5 rodou:** depois de montar sua própria descrição do plano a
partir do frame que você abriu, veja o que a cena correspondente do
Higgsfield descreve para aquela janela de tempo. Só incorpore um detalhe dela
se você conseguir apontar, no mesmo frame que já abriu, exatamente onde ele
está — cor de roupa, texto legível numa caixa, lateralidade de mão, tipo de
objeto. **Nunca incorpore:** (a) qualquer coisa que só faz sentido como
paráfrase da fala ("crosta amanteigada", "forno a gás", "muito crocante") —
é inferência da narração vestida de observação visual, não é visível num
frame; (b) uma ação ou revelação que o frame não mostra ("revela a pizza
inteira" com a caixa fechada); (c) o enquadramento/tipo de plano dela quando
diverge do que você vê. A contagem de cortes e os timestamps de plano
continuam sendo sempre os do `probe.py` — a segmentação de "cenas" da
Higgsfield é mais grossa por natureza e não re-agrupa os seus planos
medidos.

---

## FASE 4.5 — RECONCILIAÇÃO COM A LEITURA EXTERNA

Só existe se a Fase 0.5 rodou. Uma tabela curta, não uma repetição da Fase 4:

| Cena Higgsfield (janela) | Afirmação | Veredito | Frame usado |
|---|---|---|---|
| 0:27–0:30 | "revela pizza de pepperoni inteira" | rejeitado — caixa fechada no frame | frame_0018 |
| 0:05–0:07 | "avental preto com dois caracteres vermelhos" | confirmado, incorporado ao shot 5 | frame_0005 |

Feche com uma frase objetiva: quantas afirmações da Higgsfield você
confirmou, quantas rejeitou, e se algum padrão de erro se repetiu (ex.:
sempre que a caixa está fechada, ela alucina o conteúdo interno — isso é
diagnóstico útil pra próxima vez, não só desta rodada). **Esta seção é sobre
a ferramenta externa, nunca sobre você mesmo** — suas próprias medições
(`probe.py`, Whisper, frames) não entram nesta reconciliação porque não são
hipótese, são a fonte de verdade contra a qual a Higgsfield está sendo
checada.

---

## FASE 5 — DESENHO DE ÁUDIO

Do bloco `loudness` e `silence` do `probe.json`, mais os frames:

- **LUFS integrado, LRA, true peak** — e o que isso diz (LRA baixo = compressão
  pesada, o padrão de fala para feed; true peak perto de 0 dBFS = limitado).
- **Perfil de loudness momentâneo** — leia a curva: onde entra música, onde ela
  é duckada sob a voz, onde há um pico deliberado (whoosh, impacto, riser).
- **Camadas** — voz, música, SFX, som ambiente. Diga quais consegue distinguir e
  quais não — ⚠️ em cima do que é palpite.
- **Silêncio como edição** — cada intervalo de `silence.intervals` acima de
  ~0,4 s no meio da fala é pausa retórica ou corte; diga qual e por quê.
- **Sincronia** — corte de vídeo caindo na batida? Compare `hard_cut_times` com
  os picos do perfil momentâneo. Isso é medível.

---

## FASE 6 — ESTRUTURA RETÓRICA

Agora, e só agora, interpretação — sempre ancorada nos timestamps das fases
anteriores:

- **O hook** (0:00–0:03): a primeira coisa dita, a primeira coisa mostrada, a
  primeira coisa escrita — as três, separadamente, porque frequentemente são
  três apostas diferentes. O que ele promete e como paga.
- **Arco**: promessa → tensão → entrega → fechamento. Marque cada virada com
  timestamp.
- **Densidade de informação**: quantas afirmações distintas por 10 s.
- **Fechamento e CTA**: o que pede, quando, e se o vídeo ganha o direito de
  pedir. Se não pede nada, diga que não pede — é decisão.
- **Loop**: o último frame conversa com o primeiro? (Repost em feed depende
  disso.)

---

## FASE 7 — SPEC DE RECONSTRUÇÃO

**É o teste da skill inteira.** Uma seção da qual um editor que nunca viu o
vídeo consegue reconstruí-lo:

1. **Shot list** com duração exata, enquadramento e conteúdo.
2. **Roteiro falado**, com marcação de onde cada corte cai dentro da fala.
3. **Spec de texto na tela**: conteúdo, tempo de entrada/saída, posição,
   tipografia, animação.
4. **Spec de áudio**: alvo de loudness, onde a música entra/sai, SFX por
   timestamp.
5. **Spec visual**: aspect ratio, resolução, fps, tratamento de cor.
6. **A lista do que você NÃO conseguiu determinar** — a fonte exata, o nome da
   música, o modelo da câmera. Buraco declarado vale mais que buraco preenchido.

---

## FASE 8 — LEDGER DE INCERTEZA

Seção final obrigatória, **sempre presente, mesmo vazia**. Toda marca ⚠️ das
fases anteriores recolhida numa lista, cada uma com: o que está incerto, por que
(áudio truncado, texto ilegível, frame não extraído, sem chave Whisper), e o que
resolveria (frame em outra resolução, chave de API, o arquivo original).

Termine com a **procedência do teardown**: quais ferramentas rodaram, quais
limiares foram usados, quantos frames você de fato abriu, e qual foi a fonte da
transcrição. O leitor precisa saber o que foi medido e o que foi lido.

---

## Entrega

Salve o teardown como `.md` no diretório de trabalho (`$WORK/teardown.md`) — ele
é longo demais para viver só no scroll do terminal, e o usuário vai voltar nele.
Depois **ofereça em uma linha** publicar como Artifact para leitura/compartilhamento.

Idioma do relatório: o mesmo do vídeo, salvo pedido em contrário.

---

## Modos de falha (o que invalida o trabalho)

- ❌ Contar cortes olhando os frames em vez de rodar o `probe.py`.
- ❌ Apresentar texto queimado como fala.
- ❌ Chamar de "legenda" um title card desenhado.
- ❌ Escrever um timestamp que você não pode rastrear a uma medição.
- ❌ Preencher palavra ilegível com a plausível.
- ❌ Descrever um shot cujo frame você não abriu com `Read`.
- ❌ Entregar teardown "visual apenas" sem rotular como tal quando faltou o áudio.
- ❌ Resumir. O pedido é o oposto de resumo.
- ❌ Herdar uma afirmação da Higgsfield (ou de qualquer leitura externa) sem
  apontar o frame que a confirma.
- ❌ Deixar a segmentação de "cenas" de uma ferramenta externa substituir os
  cortes medidos pelo `probe.py`.
