# PROMPT 2 — ESCADA DE FORNO DO PIZZAIOLO — 18,240–27,414s (9,17s)

**POLÍTICA DE TEXTO — ZERO GRAFISMO NA GERAÇÃO.** A fonte não tem legenda queimada nem chrome de plataforma, então não há nada a remover daí. E por decisão do cliente o modelo **não gera grafismo nenhum**: os quatro badges-cronômetro que existem na fonte (`1s` / `1 MIN` / `10 MIN` / `1HR`, incluindo o `1HR` preto que fecharia neste chunk) **entram na edição depois**, compostos por cima. O Seedance entrega **apenas a chapa filmada** — nenhum badge, nenhum HUD, nenhum título, nenhum número na tela, nenhum ícone, nenhuma marca. Também **REMOVIDO por decisão do cliente:** todo o bloco publicitário OSMO × Walmart que na fonte ocupava 23,090–28,295s — o pote de tempero, o rótulo, o lockup do Walmart e as duas frases de publi saíram inteiros. Nenhuma embalagem, nenhum logo de varejo, nenhum tempero em quadro.

**ANEXAR:** `ref1_host_frontal_at_oven.png` · `ref2_host_face_closeup_direct.png` · `ref5_host_tearing_charred_pizza.png` · `ref6_host_holding_burnt_pizza.png` · `ref7_kitchen_oven_location_plate.png` · `ref11_pizza_state4_carbonised_1hour.png` + `voice_reference_pizzaiolo_ptbr.mp3`

> ⚠️ **Nenhuma referência de badge é anexada e nenhum badge é descrito abaixo — de propósito.** Pedir ou mostrar grafismo ao Seedance faz ele tentar desenhar, e ele desenha errado (rótulo embaralhado, forma torta) — foi o que aconteceu no projeto anterior deste repositório com um "5 MIN". A única coisa que este prompt pede é **enquadrar deixando o topo do quadro limpo**, para os badges caberem na composição de pós. A arte de referência está em `references/_from_source/old_ref12_timer_badge_graphics_strip.png` — ela é para o After Effects/Figma, não para o gerador.

> ✅ **Referência de voz: existe, e é do próprio pizzaiolo.** `voice_reference_pizzaiolo_ptbr.mp3` — 12s, mono, 44,1 kHz, falante único, **português do Brasil**, extraía do vídeo gerado do projeto irmão `seedance-pizza-styles` (`out/FINAL_pizza_br.mp4`), onde **este mesmo personagem** — mesma bandana de alho, mesmos óculos ovais, mesmo dólmã, mesmo avental de jeans, mesmo pano de listras — narra em pt-BR. Cama de room tone de cozinha por baixo, sem trilha, sem segunda voz. **Anexe como `audio_references`.** O `voice_reference_source_host_EN.wav` em `references/_from_source/` é a voz do host da FONTE, em inglês — não use.

> **NOTA DE RITMO:** 15 palavras em 9,17s. Escalado = **49,1 palavras por 30s** — logo abaixo da faixa conversacional de 50–65, de propósito: este é o chunk da revelação e da piada final, e ele vive do ar. **4,67s (50,9%) é não-verbal** — fumaça saindo, a pizza preta subindo ao quadro, uma mordida seca, a mastigada, a sobrancelha. 3 beats com média de **3,06s**. Mas os *planos* são o oposto: **9 cortes em 9,17s → 58,9 cortes/min, plano médio de 0,917s**, mais rápido que o chunk 1. Muita coisa curta acontecendo dentro de poucas unidades narrativas longas.

> **NOTA DE ESTRUTURA — leia antes de gerar.** Com a publi removida o vídeo inteiro passa a ter **27,414s**, o que cabe num único take do Seedance (limite 30s). Mantive dois chunks porque gerações mais curtas seguram melhor a identidade e permitem regerar só metade. Se preferir **zero emenda**, dá para concatenar os dois arquivos numa geração só de 27–28s — é uma escolha legítima, e a única coisa a ajustar é `mode` (tudo vira `omni_reference`).

---

## BÍBLIA DE ESTILO

**Este arquivo é autossuficiente.** É o chunk 2 de 2, o último. O chunk 1 (0,000–18,240s) existe mas você não precisa dele — tudo que é necessário para gerar este chunk está abaixo.

### Sujeito — o pizzaiolo (uma pessoa, em cena o tempo todo)

- Homem adulto, lê como **início a meados dos cinquenta**. Pele oliva/mediterrânea. Constituição encorpada, ombros largos. Rosto caloroso e expressivo, bem barbeado.
- **Sobrancelhas** escuras, grossas, muito móveis — é com elas que ele atua. Olhos castanho-escuros. Cabelo escuro curto, quase todo coberto.
- **Guarda-roupa, exatamente e sem variação:**
  - **Bandana preta** amarrada atrás da cabeça, estampada com **bulbos de alho e utensílios de cozinha desenhados em linha branca**;
  - **óculos ovais de armação metálica fina**;
  - **dólmã branco** de gola padre, **mangas arregaçadas até logo abaixo do cotovelo**;
  - por cima, **avental de peito em jeans cinza-chumbo escuro**, com **alça de pescoço em couro marrom** presa por **ilhós de latão** e **bolso no peito com vivo de couro marrom**;
  - **pano de prato cor de creme com listras vermelho-salmão** pendurado no ombro.
- **Nada além disso.** Sem relógio, sem anel, sem pulseira, sem corrente, sem chapéu de chef.
- **Interpretação neste chunk:** o arco vai de confiante → derrotado → curioso → conformado e satisfeito. Ele não faz drama grande; a decepção é de sobrancelha e ombro, não de grito. A piada final é entregue **baixo e direto na lente**, quase como confissão.

### Locação / set

A **cozinha de casa dele** — a mesma do chunk 1, sem substituições:

- **À esquerda da câmera:** uma **porta branca almofadada de múltiplos painéis**.
- **Acima:** **armários de madeira quente**, tom médio, portas com moldura.
- **À direita da câmera:** um **fogão de aço inox com boca a gás** e coifa; sobre ele, uma **panela esmaltada vermelha** com tampa.
- **Ao fundo:** **backsplash de mosaico de seixos** pequenos, bege e cinza.
- **Borda direita do quadro:** um **pano de prato xadrez vermelho e branco** pendurado.
- **Inferior esquerdo:** uma **planta de manjericão** num **vaso de cerâmica colorido estampado**.
- **Primeiro plano:** a **bancada de granito branco salpicado claro**, com a **tábua de açougueiro em bordo claro** sobre ela. **A tábua agora está suja** — farelo preto, uma mancha de queijo queimado, e a metade da pizza de dez minutos abandonada da tomada anterior. Não limpe o set entre os chunks.

### Eletrodoméstico-herói — o forno de pizza de bancada

Um **forno elétrico de pizza de bancada** compacto, casca em **inox e cinza-chumbo**, apoiado no granito. **Boca horizontal larga tipo letterbox**, **interior brilhando âmbar-dourado**, **lastro de pedra clara**. Abaixo da boca, faixa de controle preta com **display digital de 7 segmentos azul-esbranquiçado** mostrando três dígitos (**638.** neste chunk) e um **botão rotativo serrilhado em metal escovado** na ponta direita. Nenhum outro texto, marca ou etiqueta no forno.

### Luz

- **Principal:** ampla, suave, **frontal-alta**, frente-esquerda da câmera, **4800–5200 K**. Queda suave. **Nenhuma sombra dura no rosto.**
- **Preenchimento:** rebote ambiente no granito claro e na porta branca.
- **Contra:** nenhum.
- **Prático:** o interior do forno continua sendo um **âmbar quente forte (~2000 K)** — mas neste chunk a pizza preta o **absorve**, e a boca do forno fica mais escura e mais fechada que em qualquer momento do chunk 1. Esse escurecimento é o evento de luz do chunk.

### Tratamento de cor

Quente-neutro, **baixo contraste**, sem LUT, sem push teal-orange, sem halação, sem bloom, sem grão adicionado, sem vinheta. **O preto da pizza carbonizada tem de continuar sendo um preto aberto e com textura, não um borrão chapado** — dá para ver o relevo da borda, a crosta laranja-ferrugem e os anéis pretos da calabresa. Brancos limpos: o dólmã e o granito nunca podem estourar.

### Câmera / formato

Vertical **9:16**. As mesmas três posições do chunk 1, e só três:

- **Posição A — "frente do forno":** câmera na altura da bancada, frontal, o forno no terço inferior, o pizzaiolo atrás olhando para a lente por cima da pizza. Plano médio-fechado. **Travada.** Esta é a quarta e última repetição do enquadramento-motor.
- **Posição B — "boca do forno":** câmera baixa e perto da abertura, interior âmbar dominando, a pizza em silhueta sobre a pedra. Leve deriva de mão.
- **Posição C — "mesa":** plano médio-fechado a fechado sobre a tábua de bordo, foco raso, cozinha dissolvida atrás.

Lente **normal a teleobjetiva curta** na posição C — **nenhuma distorção grande-angular no rosto**.

### Ritmo de montagem

**Só cortes secos.** Sem dissolve, sem wipe, sem fade, sem transição de zoom. **9 cortes em 9,17s**, plano médio **0,917s**, mais curto **0,334s**, mais longo **2,136s**. O plano mais longo do chunk é a revelação carbonizada — **segure-o**, é a única coisa que segura. Depois dele, o botão é picado curto.

> **A emenda editorial em 23,090s.** Nesse ponto a fonte entrava na publi. Aqui ela **não existe**: o corte em 23,090s emenda direto o "Ai, não" na abertura do botão, e vira mais um corte seco como qualquer outro. Não deixe buraco, não deixe respiro extra, não deixe nada sobrar do que foi cortado.

### Música

**Sem trilha.** Não adicione música, batida, riser nem sting. A cama é room tone mais foley de cozinha, correndo continuamente e **sem nenhum silêncio digital verdadeiro**.

### SFX (lista completa de foley)

- **Zumbido de forno** grave contínuo e sopro de convecção suave por baixo de tudo — mais abafado que no chunk 1.
- **Chiado seco** e crepitar de coisa passada do ponto; um **estalo** ocasional.
- **Pá de alumínio** raspando e retinindo contra a pedra na enfornada.
- **Um transiente alto e isolado em 22,250s** — a pizza carbonizada aterrissando na tábua de madeira, um baque seco de bateria. **Ele vem 0,27s ANTES da fala "Ai, não" (22,520s)**, e essa ordem é o beat de comédia inteiro. Não sincronize os dois.
- **Crocância de carvão** em 25,1s — nada parecida com as mordidas do chunk 1: **seca, quebradiça, alta**, mais biscoito quebrando que pizza.
- **Mastigação** lenta e crocante, e uma respiração pelo nariz.
- Farelo preto **caindo** na tábua.
- Ruído de **tecido e mão** ao erguer a pizza.

### VFX e enquadramento — nada de grafismo, mas deixe o topo limpo

**Este prompt não gera grafismo nenhum.** Sem badge, sem cronômetro, sem HUD, sem título, sem número na tela, sem ícone. Não há efeito nenhum em quadro neste chunk — a fumaça é prática, filmada em cena.

O que o modelo **precisa** fazer é enquadrar pensando na composição que vem depois:

- **Mantenha a faixa superior do quadro — de y = 0 até y ≈ 0,20 — visualmente limpa e calma** em todas as posições de câmera: parede, armário fechado, fundo desfocado. Nada de detalhe ocupado, nada de objeto brilhante, nada de linha de alto contraste atravessando essa faixa.
- **Nada de essencial pode viver ali.** Rosto, mãos, pizza e display do forno ficam de y ≈ 0,22 para baixo. Se ele levanta uma pizza acima da linha dos olhos, ela ainda tem de terminar abaixo de y ≈ 0,22.
- É nessa faixa que os quatro badges serão compostos na edição. Se o modelo encher esse espaço com cenário, a composição vai cobrir informação e o plano se perde.

---

## FALA (verbatim, 15 palavras)

**Português do Brasil.** Voz masculina única, som direto em cena, homem de ~50 anos, **peito quente, timbre encorpado**, sotaque brasileiro neutro. Média do chunk **≈200 wpm**, mas **variável de propósito**: a linha de abertura sai rápida e por cima como no chunk 1; "Ai, não" é **esticado e murcho**; o botão volta rápido e termina **baixo, íntimo, meio rindo**. Sem narrador, sem segunda voz, sem eco, sem processamento.

**SINCRONISMO BOCA/ÁUDIO.** Regra geral: quando ele fala, a boca está vazia e a fala sai limpa; quando ele come, ele não fala. Vale para "Pizza de uma hora.", "Ai, não.", "Peraí." e "É, queimou." — todas ditas **antes** de ele provar qualquer coisa.
**Única exceção, e ela é deliberada:** a última linha, "Mas sabe que eu até gostei?", é dita **de boca ainda ocupada**, mastigando o caco de carvão. É a piada do fecho: ele aprova enquanto ainda está mastigando a coisa queimada. Essa fala pode — e deve — sair um pouco abafada.

> **PIZZAIOLO:** "Pizza de uma hora."
>
> **PIZZAIOLO:** "Ai, não."
>
> **PIZZAIOLO:** "Peraí."
>
> **PIZZAIOLO:** "É, queimou."
>
> **PIZZAIOLO:** "Mas sabe que eu até gostei?"

---

## PLANO A PLANO — 3 beats

**BEAT 1 — 0:18,240–0:20,954 (2,714s) — A ENFORNADA DE UMA HORA.**
Abre na **posição A**, travada — **a quarta repetição exata do enquadramento do chunk 1**: mesma altura, mesma distância, uma pizza crua nova sobre papel manteiga na pá de alumínio, o pizzaiolo atrás do forno olhando para a lente. Ele está confiante; essa confiança é a armadilha. **Corte interno em 19,386s** para a **posição B**: a pá desliza para dentro da boca âmbar e a pizza assenta na pedra. **Corte interno em 19,887s** — 0,501s, o segundo plano mais curto do chunk — um flash rápido do display lendo **`638.`** com o botão serrilhado em foco raso à direita. Esses dois planos cobrem a janela até ~20,8s, que é onde o badge `1HR` será composto depois; deixe o topo do quadro limpo neles.

FALA: "Pizza de uma hora."

CÂMERA: A (PM fechado, travada, altura de bancada) → B (baixa, perto, boca do forno, leve deriva) → B (inserto rápido no display, foco raso).

SFX: pá raspando a pedra; farfalhar de papel; zumbido do forno mais abafado que antes; chiado seco começando.

VFX: nenhum.

---

**BEAT 2 — 0:20,954–0:23,090 (2,136s) — A REVELAÇÃO CARBONIZADA.**
**Plano único, o mais longo do chunk — segure-o.** Corta para a **posição C**: o pizzaiolo ergue a pizza de uma hora com as **duas mãos**, de frente para a câmera na altura do peito, e ela **toma quase o quadro inteiro**. Está **completamente carbonizada**: borda preta fosca em relevo, superfície de crosta preta e laranja-ferrugem, as cinco calabresas reduzidas a anéis pretos com um pó alaranjado no centro. Só o topo da bandana e os olhos dele aparecem por cima da borda. Fumaça fina subindo pela lateral do quadro. Ele olha para ela, depois por cima dela para a lente, **desinflando** — sobrancelhas caindo, ombros baixando. **Em 22,250s ele deixa a pizza cair na tábua de bordo**: baque seco, alto, isolado — **o pico de áudio de toda a peça**. **Só 0,27s depois, em 22,520s**, ele fala. Essa ordem — impacto primeiro, reação depois — é a piada. Não junte os dois.

FALA: "Ai, não."

CÂMERA: C (PM fechado, travado, pouquíssimo micro-handheld; foco na borda preta, cozinha dissolvida).

SFX: crepitar seco; farelo preto se soltando; **o baque isolado em 22,250s**; um suspiro nasal curto sob a fala.

VFX: nenhum. A fumaça é **prática** — fumaça real em cena, não efeito digital.

---

**BEAT 3 — 0:23,090–0:27,414 (4,324s) — O BOTÃO.**
O corte em 23,090s é a **emenda editorial** onde a publi foi removida — trate-o como corte seco comum. Seis planos, o trecho mais picado do vídeo:

- **23,090–23,757 (0,667s)** — **posição C, fechada:** só a pizza preta na tábua, vista de cima em ângulo, fumaça fina cruzando. **Sem fala.** Deixa respirar.
- **23,757–24,391 (0,634s)** — **posição C, PM:** ele em quadro olhando para baixo para ela, derrotado, mão no quadril.
- **24,391–24,825 (0,434s)** — **posição C mais fechada:** ele levanta a mão e para no ar. A palavra cai em ~24,555s.
- **24,825–25,859 (1,034s)** — **posição C:** ele **quebra um pedaço da borda preta e morde**. A crocância é **seca e quebradiça**, alta. Ele mastiga devagar, avaliando.
- **25,859–26,193 (0,334s)** — **o plano mais curto do vídeo**, inserto rápido: o caco preto entre os dedos, farelo caindo.
- **26,193–27,414 (1,221s)** — **posição C, PM, direto na lente:** ainda mastigando, ele **levanta uma sobrancelha**, dá um meio sorriso e um dar-de-ombros mínimo. Termina no meio da mastigada, sem pose final, sem CTA, sem olhar para fora. **O vídeo acaba no frame 27,414 — corte seco, sem fade.**

FALA: "Peraí." ... "É, queimou." ... "Mas sabe que eu até gostei?"

CÂMERA: C (PF, travada) → C (PM, travada) → C (mais fechada, micro-handheld) → C (PM, travada) → **inserto macro** muito raso → C (PM, travada, olho na lente).

SFX: crepitar residual; **a crocância seca de carvão em ~25,1s**; mastigação lenta e crocante; farelo caindo na tábua; uma risada curta pelo nariz na última linha.

VFX: nenhum.

---

## MATEMÁTICA DE TEMPO

| Beat | Duração | Palavras | Tempo de fala | Ar |
|---|---:|---:|---:|---:|
| 1 — Enfornada de 1 hora | 2,714 s | 4 | 1,09 s | 1,624 s (59,8%) |
| 2 — Revelação carbonizada | 2,136 s | 2 | 0,90 s | 1,236 s (57,9%) |
| 3 — O botão | 4,324 s | 9 | 2,51 s | 1,814 s (42,0%) |
| **TOTAL** | **9,174 s** | **15** | **4,50 s** | **4,674 s (50,9%)** |

Na linha de base de 150 wpm, 15 palavras precisariam de 6,0s de fala. Aqui elas são entregues em **4,50s → ≈200 wpm**. O beat 2 é o único que anda contra essa média: **2 palavras em 0,90s** é *devagar* de propósito (133 wpm) — "Ai, não" é uma reação esticada, não uma frase. Não deixe o modelo emparelhar a velocidade dos três beats.

**Duração total do vídeo com os dois chunks: 18,240 + 9,174 = 27,414s.**

---

## VERSÃO EM UM PARÁGRAFO

Vertical 9:16, cozinha de casa com armários de madeira quente, porta branca almofadada, fogão inox a gás, panela vermelha e backsplash de mosaico de seixos, em luz frontal suave e quente, filmada travada na altura da bancada com foco raso. Um homem encorpado de uns cinquenta e cinco anos, pele oliva, sobrancelhas grossas, bandana preta estampada com alhos brancos desenhados, óculos ovais de metal fino, dólmã branco de mangas arregaçadas, avental de peito em jeans cinza-chumbo com alça de couro marrom e ilhós de latão, e um pano de prato creme de listras vermelhas no ombro, está atrás de um forno de pizza de bancada em inox cujo painel azul lê 638. Ele olha para a lente, diz "Pizza de uma hora" e enfia uma pizza crua na boca âmbar. Ele ergue a pizza com as duas mãos e ela está completamente carbonizada — borda preta em relevo, crosta preta e ferrugem, calabresa virada anel preto — e a larga cair na tábua com um baque seco antes de dizer "Ai, não". Corta direto para ele olhando para a ruína, quebrando um pedaço da borda preta, mordendo com uma crocância seca de biscoito quebrando, mastigando devagar, levantando uma sobrancelha para a lente e admitindo baixinho que até gostou. Baixo contraste, sem LUT, só cortes secos, cerca de um corte a cada 0,9 segundo, sem trilha, só foley de cozinha. O topo do quadro fica limpo, reservado para grafismos compostos depois na edição. Sem legenda, sem badge, sem número na tela, sem UI de plataforma, sem publicidade.

---

## OBJETOS DE CENA

- **Pá de pizza de alumínio** larga, cabeça retangular, cabo curto de plástico preto.
- Folha de **papel manteiga** branco sob a pizza crua.
- **Uma pizza crua** (~20 cm) — massa pálida, muçarela ralada não derretida, cinco calabresas laranja chatas — para a enfornada do beat 1.
- **Uma pizza completamente carbonizada** (~20 cm) — **borda preta fosca em relevo, superfície de crosta preta e laranja-ferrugem, cinco calabresas reduzidas a anéis pretos com centro de pó alaranjado**. É o objeto-herói do chunk; mande fazer com capricho.
- **A metade abandonada da pizza de dez minutos** do chunk 1, ainda na tábua.
- **Tábua de açougueiro em bordo claro**, já suja de farelo preto e queijo queimado.
- **Forno elétrico de pizza de bancada** com lastro de pedra, display azul de 7 segmentos lendo **638.**, botão rotativo serrilhado de metal.
- Cenário de fundo: **porta branca almofadada**, **armários de madeira quente**, **fogão inox com boca a gás e coifa**, **panela esmaltada vermelha com tampa**, **backsplash de mosaico de seixos**, **pano de prato xadrez vermelho e branco**, **manjericão em vaso de cerâmica colorido estampado**, **bancada de granito branco salpicado**.

---

## CONTINUIDADE

**Pega o bastão do chunk 1 em 18,240s.** O chunk 1 termina na posição C, plano médio mais aberto, o pizzaiolo tendo acabado de rasgar a pizza de dez minutos ao meio, a outra metade na tábua de bordo, na última sílaba de "perfeita."

**Este chunk abre na posição A** — o mesmo enquadramento travado de frente do forno usado quatro vezes no chunk 1 — com uma pizza crua nova na pá.

Tem de bater exatamente na emenda: **mesmo homem, mesmo rosto, mesma bandana estampada de alho, mesmos óculos ovais; o mesmo dólmã branco, o mesmo avental de jeans cinza-chumbo com alça de couro e ilhós de latão, o mesmo pano de prato creme de listras vermelhas no mesmo ombro; a mesma cozinha com a porta branca, os armários de madeira, o fogão inox, a panela vermelha, o mosaico de seixos, o pano xadrez e o manjericão; o mesmo forno de bancada; a mesma tábua de bordo, agora suja; a mesma luz frontal suave e quente sem sombra dura; o mesmo visual de baixo contraste sem tratamento.**

**Grafismo na entrada:** nenhum. Os dois chunks são gerados limpos, com o topo do quadro livre; os quatro badges — o `1HR` em arte preta carbonizada inclusive — são compostos por cima na edição, depois da montagem.

**Não entrega nada para frente.** Este é o último chunk. Termina em corte seco no frame 27,414s, no meio de uma mastigada — **sem fade, sem card final, sem CTA, sem logo, sem tela de "siga"**.

**O que mudou em relação à fonte:** na fonte, entre o "oh no" e o botão havia 5,205s de publicidade (23,090–28,295s). Ela foi removida inteira. O que era o corte em 28,295s da fonte vira o corte em **23,090s** aqui, e nada mais foi alterado — os cinco cortes internos do botão mantêm os intervalos originais, só deslocados 5,205s para trás.

---

## NEGATIVOS

sem legenda queimada, sem legenda em karaokê palavra-a-palavra, sem cápsula de legenda, sem UI de rede social, sem logo do TikTok/Instagram/YouTube, sem @handle, sem marca d'água, sem barra de progresso, sem QR code, sem botão de seguir,

**sem NENHUM grafismo de tela: sem badge, sem cronômetro, sem contador, sem HUD, sem title card, sem lower-third, sem número sobreposto, sem porcentagem, sem gráfico de pizza, sem ícone, sem seta, sem moldura, sem qualquer elemento desenhado por cima da imagem** — tudo isso entra na edição depois,

**sem pote de tempero, sem OSMO, sem qualquer embalagem de produto, sem rótulo, sem lockup de varejo, sem Walmart, sem lower-third de marca, sem frase publicitária, sem nada que soe a patrocínio** — o bloco de publi foi removido de propósito e não pode voltar por nenhum caminho,

sem mãos distorcidas, sem dedos a mais, sem rosto deformado, sem pele plástica, sem supersaturação, sem glitch,

sem texto ou marca no dólmã e no avental, sem chapéu de chef, sem relógio, sem anel, **a bandana é preta com desenhos de alho em linha branca e nada mais**,
sem marca nem logo no forno, sem texto legível no forno além da temperatura azul de três dígitos,
sem trilha, sem música, sem batida, sem riser, sem sting,
sem segundo falante, sem narrador em voz over, sem eco nem reverb na voz,
**sem som de mastigação ou de boca cheia por cima das quatro primeiras falas** — nelas ele ainda não provou nada; só a última linha é dita mastigando, e essa é de propósito,
**sem inglês — toda a fala é português do Brasil**,
sem dissolve, sem wipe, sem fade to black, sem speed ramp, sem câmera lenta,
sem distorção de grande-angular no rosto, sem drone nem grua,
**a pizza de uma hora não pode sair só "bem tostada" — ela é preta, carbonizada, inequívoca**,
sem chapar o preto num borrão sem textura,
sem card final, sem CTA, sem tela de inscrição, sem logo de fechamento.

---

## CONFIGURAÇÕES SEEDANCE 2.5

```
model: seedance_2_5
mode: video_extension         # estende a partir do chunk 1 (o hub, omni_reference)
                              # se for gerar os dois num take só de 27,4s, troque para omni_reference
aspect_ratio: 9:16
duration: 10                  # alvo 9,17s; se só houver durações discretas, pegue a próxima
                              # acima e apare a cauda na pós — nunca apare a cabeça
resolution: 480p
generate_audio: true
language: pt-BR

medias (todas com role image_references):
  ref1_host_frontal_at_oven.png        # pizzaiolo + guarda-roupa + enquadramento posição A + forno
  ref2_host_face_closeup_direct.png    # trava de identidade do rosto, ângulo mais próximo
  ref5_host_tearing_charred_pizza.png  # mãos na pizza, textura de carvão, cozinha atrás
  ref6_host_holding_burnt_pizza.png    # beat 2 — a pose exata da revelação carbonizada
  ref7_kitchen_oven_location_plate.png # locação limpa: porta, armários, fogão, mosaico, granito
  ref11_pizza_state4_carbonised_1hour.png # prato de comida — a pizza preta, na cozinha certa
  # (nenhuma referência de grafismo — o modelo não gera badge; ver nota no topo)

audio_references:
  voice_reference_pizzaiolo_ptbr.mp3   # 12s, pt-BR, o mesmo personagem, do projeto
                                       # seedance-pizza-styles — ver nota no topo
```

> **Por que os badges não são pedidos ao modelo.** No projeto Seedance anterior deste repositório um grafismo pedido no prompt ("5 MIN") **renderizou, e renderizou errado**. Em vez de brigar com isso, os badges saíram inteiramente do prompt: o Seedance entrega a chapa filmada com o topo do quadro limpo, e os quatro badges mais a animação de preenchimento radial são construídos no After Effects/Figma e compostos por cima na edição. A arte de referência está em `references/_from_source/old_ref12_timer_badge_graphics_strip.png`.

> **Segunda limitação conhecida.** O Seedance erra a pronúncia de palavras em português com frequência. "Peraí" é o risco maior deste chunk — se sair estranho, troque por "Calma aí" e regere só esta linha.

> **Terceira limitação — o transiente de 22,250s.** O baque isolado 0,27s antes de "Ai, não" é o beat de comédia e o `generate_audio` provavelmente **não** vai acertar essa separação sozinho. Se a geração juntar os dois, **corrija na pós**: mova o baque para 0,27s antes da fala. É uma edição de áudio de trinta segundos e vale a pena.
