# PROMPT 1 — ESCADA DE FORNO DO PIZZAIOLO — 0,000–18,240s (18,24s)

**POLÍTICA DE TEXTO — ZERO GRAFISMO NA GERAÇÃO.** A fonte não tem legenda queimada nem chrome de plataforma, então não há nada a remover daí. E por decisão do cliente o modelo **não gera grafismo nenhum**: os quatro badges-cronômetro que existem na fonte (`1s` / `1 MIN` / `10 MIN` / `1HR`) **entram na edição depois**, compostos por cima. O Seedance entrega **apenas a chapa filmada** — nenhum badge, nenhum HUD, nenhum título, nenhum número na tela, nenhum ícone, nenhuma marca. Também **REMOVIDO por decisão do cliente:** todo o bloco publicitário OSMO × Walmart — não aparece neste chunk nem no seguinte. Nenhuma embalagem, nenhum logo de varejo, nenhum tempero em quadro.

**ANEXAR:** `ref1_host_frontal_at_oven.png` · `ref2_host_face_closeup_direct.png` · `ref3_host_holding_raw_pizza.png` · `ref4_host_biting_golden_pizza.png` · `ref5_host_tearing_charred_pizza.png` · `ref7_kitchen_oven_location_plate.png` · `ref8_pizza_state1_raw_1second.png` · `ref9_pizza_state2_perfect_1minute.png` · `ref10_pizza_state3_charred_10minutes.png` + `voice_reference_pizzaiolo_ptbr.mp3`

> ⚠️ **Nenhuma referência de badge é anexada e nenhum badge é descrito abaixo — de propósito.** Pedir ou mostrar grafismo ao Seedance faz ele tentar desenhar, e ele desenha errado (rótulo embaralhado, forma torta) — foi o que aconteceu no projeto anterior deste repositório com um "5 MIN". A única coisa que este prompt pede é **enquadrar deixando o topo do quadro limpo**, para os badges caberem na composição de pós. A arte de referência está em `references/_from_source/old_ref12_timer_badge_graphics_strip.png` — ela é para o After Effects/Figma, não para o gerador.

> ✅ **Referência de voz: existe, e é do próprio pizzaiolo.** `voice_reference_pizzaiolo_ptbr.mp3` — 12s, mono, 44,1 kHz, falante único, **português do Brasil**, extraía do vídeo gerado do projeto irmão `seedance-pizza-styles` (`out/FINAL_pizza_br.mp4`), onde **este mesmo personagem** — mesma bandana de alho, mesmos óculos ovais, mesmo dólmã, mesmo avental de jeans, mesmo pano de listras — narra em pt-BR. Cama de room tone de cozinha por baixo, sem trilha, sem segunda voz. **Anexe como `audio_references`.** O `voice_reference_source_host_EN.wav` em `references/_from_source/` é a voz do host da FONTE, em inglês — não use.

> **NOTA DE RITMO:** 31 palavras em 18,24s. Escalado = **51,0 palavras por 30s** — dentro da faixa conversacional de 50–65. Mas a entrega **não** é de 150 wpm: a fala ocupa só **8,42s**, ou seja **≈221 wpm**. Isso é deliberado e tem de ser dirigido. **9,82s (53,9%) deste chunk é não-verbal** — pizza entrando e saindo do forno, mastigação, dedo afundando na massa. 5 beats com média de **3,65s**. A *fonte* corta a cada 1,255s (46 cortes/min); os beats abaixo são unidades narrativas, cada uma contendo 1–2 cortes duros internos, listados explicitamente.

---

## BÍBLIA DE ESTILO

**Este arquivo é autossuficiente.** É o chunk 1 de 2. O chunk 2 (18,240–27,414s) existe mas você não precisa dele — tudo que é necessário para gerar este chunk está abaixo.

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
- **Interpretação:** direto para a câmera, caloroso, rápido, levemente sarcástico. Ele está *correndo*, não dando aula. Gestos econômicos e italianados — um dedo indicador levantado, uma pizza erguida ao quadro. Come em cena com a boca trabalhando visivelmente, sem pudor nenhum.

### Locação / set

A **cozinha de casa dele** — a mesma das referências, sem substituições:

- **À esquerda da câmera:** uma **porta branca almofadada de múltiplos painéis**.
- **Acima:** **armários de madeira quente**, tom médio, portas com moldura.
- **À direita da câmera:** um **fogão de aço inox com boca a gás** e coifa; sobre ele, uma **panela esmaltada vermelha** com tampa.
- **Ao fundo:** **backsplash de mosaico de seixos** pequenos, bege e cinza.
- **Borda direita do quadro:** um **pano de prato xadrez vermelho e branco** pendurado.
- **Inferior esquerdo:** uma **planta de manjericão** num **vaso de cerâmica colorido estampado** (azul, amarelo, vermelho).
- **Primeiro plano:** a **bancada de granito branco salpicado claro** atravessando a base do quadro. Nas tomadas de mesa, uma **tábua de açougueiro em bordo claro** apoiada sobre ela, com farelo e respingos acumulando ao longo do chunk.

### Eletrodoméstico-herói — o forno de pizza de bancada

Um **forno elétrico de pizza de bancada** compacto, casca em **inox e cinza-chumbo**, apoiado no granito. Tem uma **boca horizontal larga tipo letterbox** — muito mais larga que alta — com **interior brilhando âmbar-dourado** e **lastro de pedra clara**. Abaixo da boca, uma faixa de controle preta com **display digital de 7 segmentos azul-esbranquiçado** exibindo uma temperatura de três dígitos (**629 / 636 / 658 / 638** — ela oscila, é leitura viva, não número fixo) seguida de um ponto, e um **botão rotativo serrilhado em metal escovado** na ponta direita. Não coloque nenhum outro texto, marca ou etiqueta no forno.

### Luz

- **Principal:** ampla, suave, **frontal-alta**, vindo da frente-esquerda da câmera, por volta de **4800–5200 K** — luz de cozinha caseira quente, não estúdio. Queda suave. **Nenhuma sombra dura no rosto.**
- **Preenchimento:** rebote ambiente no granito claro e na porta branca; as sombras ficam abertas.
- **Contra:** nenhum. É um visual chapado, amigável e bem iluminado, não dramático.
- **Prático:** o **interior do forno é um prático quente forte (~2000 K âmbar)**. Nas tomadas de boca de forno ele toma o quadro e a imagem inteira vai para o dourado saturado. Esse contraste entre a cozinha neutra-quente e o âmbar do forno é o **único evento de luz do chunk**.

### Tratamento de cor

Quente-neutro, **baixo contraste**, sem LUT, sem push teal-orange, sem halação, sem bloom, sem grão adicionado, sem vinheta. Pretos abertos, brancos limpos — o dólmã e o granito **nunca podem estourar**. Acentos de cor: o laranja da pizza, o âmbar do forno, o vermelho da panela e do pano xadrez. O resto é creme, madeira, branco e inox.

### Câmera / formato

Vertical **9:16**. Três posições que se repetem, e só três:

- **Posição A — "frente do forno":** câmera na altura da bancada, frontal, o forno ocupando o terço inferior, o pizzaiolo atrás dele olhando para a lente por cima da pizza. Plano médio-fechado. **Travada.**
- **Posição B — "boca do forno":** câmera baixa e perto da abertura, o interior âmbar tomando a maior parte do quadro, a pizza quase em silhueta sobre a pedra. Leve deriva de câmera na mão, tilts e um chicote rápido.
- **Posição C — "mesa":** plano médio-fechado a fechado sobre a tábua de bordo, foco raso, cozinha dissolvida atrás.

Lente lê **normal a teleobjetiva curta** na posição C — **nenhuma distorção grande-angular no rosto**. Profundidade de campo rasa em toda tomada de mesa; o fundo nunca é legível.

### Ritmo de montagem

**Só cortes secos.** Sem dissolve, sem wipe, sem fade, sem transição de zoom. Plano médio da fonte é **1,255s**. Segure mais as duas tomadas de "assar", corte rápido em volta da comida.

### Música

**Sem trilha.** Não adicione música, batida, riser nem sting. A cama é room tone mais foley de cozinha, correndo continuamente e **sem nenhum silêncio** — nem um frame de silêncio digital verdadeiro depois do primeiro.

### SFX (lista completa de foley)

- **Zumbido de forno** grave contínuo e um **sopro de convecção** suave por baixo de tudo.
- **Pá de alumínio** raspando e retinindo contra a pedra — em toda enfornada e toda desenfornada.
- Farfalhar seco de **papel manteiga** quando a pizza desliza.
- **Chiado molhado de queijo** subindo quando a pizza está no forno.
- **Crocância de mordida** — **uma só no chunk inteiro**, aos 15,9s, seca e alta (é carvão). **Não existe mordida antes disso.**
- **Mastigação** suave e uma respiração pelo nariz depois dessa única mordida — **em plano sem fala**.
- Um pequeno **"squelch" de massa** quando o dedo afunda no centro, por volta de 10,8s.
- Ruído de **tecido e mão** ao erguer as pizzas.

### VFX e enquadramento — nada de grafismo, mas deixe o topo limpo

**Este prompt não gera grafismo nenhum.** Sem badge, sem cronômetro, sem HUD, sem título, sem número na tela, sem ícone. O único efeito em quadro no chunk inteiro é o **inserto do chef borrado no beat 1 (3,40–3,87s)**, e ele é imagem filmada, não grafismo.

O que o modelo **precisa** fazer é enquadrar pensando na composição que vem depois:

- **Mantenha a faixa superior do quadro — de y = 0 até y ≈ 0,20 — visualmente limpa e calma** em todas as posições de câmera: parede, armário fechado, fundo desfocado. Nada de detalhe ocupado, nada de objeto brilhante, nada de linha de alto contraste atravessando essa faixa.
- **Nada de essencial pode viver ali.** Rosto, mãos, pizza e display do forno ficam de y ≈ 0,22 para baixo. Se ele levanta uma pizza acima da linha dos olhos, ela ainda tem de terminar abaixo de y ≈ 0,22.
- É nessa faixa que os quatro badges serão compostos na edição. Se o modelo encher esse espaço com cenário, a composição vai cobrir informação e o plano se perde.

---

## FALA (verbatim, 31 palavras)

**Português do Brasil.** Voz masculina única, som direto em cena, homem de ~50 anos, **peito quente, timbre encorpado**, sotaque brasileiro neutro. **Rápida e cortada, ≈221 wpm**, para cima, levemente sarcástica. Sem narrador, sem segunda voz, sem eco, sem processamento.

> **PIZZAIOLO:** "Pizza de um segundo."
>
> **PIZZAIOLO:** "Pizza de um minuto."
>
> **PIZZAIOLO:** "Ó, olha que dourada."
>
> **PIZZAIOLO:** "Mas dentro não assou."
>
> **PIZZAIOLO:** "Pizza de dez minutos."
>
> **PIZZAIOLO:** "Não ficou nada mal."
>
> **PIZZAIOLO:** "A borda queimou, mas dentro tá perfeita."

---

## PLANO A PLANO — 5 beats

**BEAT 1 — 0:00,000–0:04,104 (4,104s) — PREMISSA + A PIZZA DE UM SEGUNDO.**
Abre na **posição A**, travada: o pizzaiolo atrás do forno de bancada, uma pizza **crua** sobre papel manteiga numa pá de alumínio larga à frente dele — borda de massa pálida, muçarela ralada não derretida, cinco discos de calabresa laranja e chatos. Ele olha direto para a lente e **levanta o dedo indicador direito** ao lado da cabeça. **Corte interno em 1,068s** para a **posição B**: a pá desliza para dentro da boca âmbar, borrão de movimento pesado, e a pizza assenta na pedra; segure até ~2,60s — é a janela onde o badge `1s` será composto depois, e o topo do quadro tem de estar limpo nela. **Corte interno em 3,170s** para a **posição C**: ele segura a pizza de um segundo **na vertical, de frente para a câmera**, ocupando os dois terços esquerdos. O queijo ainda está cru e ralado, a calabresa pálida, e **pedaços soltos caem na tábua**. Ele olha para ela, depois para a lente, nada impressionado. Por **≈0,47s (3,40–3,87s)** um **chef anônimo gritando** — um homem genérico de meia-idade, não-celebridade, de dólmã branco, boca escancarada num berro exasperado — pisca no **fundo** atrás dele: muito desfocado, opacidade parcial, preenchendo a metade superior, e some. *(Não tente nenhuma figura pública real ou reconhecível.)*

FALA: "Pizza de um segundo."

CÂMERA: A (PM fechado, travada, altura de bancada) → B (baixa, perto, boca do forno, leve deriva) → C (PM fechado, três-quartos, foco raso).

SFX: pá raspando a pedra; farfalhar de papel; zumbido do forno; o inserto do chef carrega um berro curto, distante e ininteligível, mixado baixo.

VFX: apenas o inserto de chef borrado, composto em 3,40–3,87s. Nenhum grafismo, nenhum badge.

---

**BEAT 2 — 0:04,104–0:08,408 (4,304s) — A ENFORNADA DE UM MINUTO.**
Corta de volta para a **posição A**, **exatamente o mesmo enquadramento do beat 1** — mesma altura, mesma distância, mesma pizza crua na pá. Ele está no meio da frase, boca aberta, sem dedo levantado desta vez. Essa repetição literal é o motor do formato e tem de bater. **Corte interno em 5,205s** para a **posição B**, e aqui a câmera **desce em tilt pela frente do forno** e assenta no painel de controle: a pizza aparece sobre a pedra com o queijo começando a borbulhar, e o display azul lê **`629.`** e depois **`636.`** conforme oscila. Segure até 8,30s — é a janela mais longa do chunk e é onde o badge `1 MIN` será composto depois. Deixa assar.

FALA: "Pizza de um minuto."

CÂMERA: A (PM fechado travado) → B (baixa, depois **tilt descendente** lento pela face do forno até o display, assentando).

SFX: pá na pedra; papel; queijo começando a chiar, subindo ao longo do beat; zumbido do forno engrossando um pouco.

VFX: nenhum.

---

**BEAT 3 — 0:08,408–0:11,278 (2,870s) — O VEREDITO DE UM MINUTO.**
Corta para a **posição C**: a pizza de um minuto é segurada **na horizontal**, de frente, ocupando uns 80% do quadro na altura dos olhos — só o topo da bandana aparece atrás dela. Ela está genuinamente bem feita: **muçarela derretida e brilhante, cinco calabresas encolhidas e lustrosas, borda estufada e dourada com manchas de leopardo reais.** Foco raso, a borda nítida, a cozinha dissolvida. **NESTE PRIMEIRO PLANO ELE NÃO ESTÁ COMENDO.** Ele ainda não deu mordida nenhuma: está apenas **mostrando a pizza à câmera**, orgulhoso, virando-a um pouco para pegar a luz. A **boca está vazia**, a fala sai **limpa e articulada**, e **não há nenhum som de mastigação, de boca cheia ou de deglutição por cima dessa fala**. Ele comenta a **aparência** dela, não o sabor — ele ainda não provou. **NÃO HÁ MORDIDA NENHUMA NESTE BEAT.** Ele **nunca** leva a pizza à boca aqui, nem encosta ela no rosto: a pizza fica **chapada de frente para a lente, na altura dos olhos**, entre as duas mãos, e assim permanece. **Segure esse plano até 10,310s** — ele é a chapa mais bonita do chunk e precisa de tempo no ar. Depois, **corte interno em 10,310s** para um **macro**: duas mãos, uma segurando a fatia, o indicador da outra **afundando no centro** — a massa cede visivelmente, abre um poço e o queijo ali é mais pálido e mais molhado, claramente **cru por dentro**. É sobre esse macro que cai a segunda fala.

FALA: "Ó, olha que dourada." *(dita no plano de apresentação, boca vazia, sem mastigar)* ... "Mas dentro não assou." *(dita sobre o macro do dedo afundando)*

CÂMERA: C (PM fechado, travada, a pizza chapada de frente — **segurado, sem corte**, até 10,310s) → **inserto macro**, muito raso, foco na ponta do dedo.

SFX: **este beat inteiro é limpo de som de boca** — só room tone, a voz e o squelch suave de massa quando o dedo afunda. **Nenhuma crocância, nenhuma mastigação, nenhuma deglutição em lugar nenhum do beat 3.**

VFX: nenhum.

---

**BEAT 4 — 0:11,278–0:15,883 (4,605s) — A ENFORNADA DE DEZ MINUTOS.**
Corta de volta para a **posição A**, terceira repetição idêntica, pizza crua na pá. **Corte interno em 12,179s** para a **posição B**: a pizza na pedra, ainda pálida, e a câmera dá um **chicote rápido** e reenquadra; o display lê **`658.`**, a leitura mais quente da peça. **Corte interno em 14,014s**, uma rajada de movimento rápido de câmera, e então assenta: dentro do forno a pizza está agora **visivelmente chamuscada** — o queijo virou uma crosta laranja-escura com bolhas pretas, a borda está pretejando, e uma **névoa cinza de fumaça** cruza a metade inferior do quadro.

FALA: "Pizza de dez minutos." ... "Não ficou nada mal."

CÂMERA: A (PM fechado travado) → B (baixa, um **chicote** rápido e reenquadre) → B (assentando, deriva de mão, fumaça em quadro).

SFX: pá na pedra; chiado virando agressivo e cuspindo; um crepitar grave; o zumbido do forno engrossando.

VFX: névoa de fumaça **prática** — fumaça real em cena, não efeito digital. Nenhum grafismo.

---

**BEAT 5 — 0:15,883–0:18,240 (2,357s) — O VEREDITO DE DEZ MINUTOS.**
Corta para a **posição C**, fechada: ele **morde a pizza de dez minutos**, segurando as duas beiradas. **CONTRASTE OBRIGATÓRIO — não erre isto:** esta pizza tem de ser **MUITO MAIS ESCURA que a do beat 3**, e a diferença tem de saltar aos olhos num corte só. A do beat 3 era dourada com pintinhas de leopardo; **esta está queimada**: a borda é **preta e bolhuda em toda a volta**, o queijo encrostou num **vermelho-acastanhado escuro** em vez de branco brilhante, e as cinco calabresas viraram discos escuros com **anel carbonizado preto** na beirada. Se esta pizza puder ser confundida com a de um minuto, o plano está errado. Pense **pão esquecido na grelha**, não pizza bem assada: mais preto que dourado, a borda em relevo carbonizado, farelo preto caindo dela. Olhos fechados, um sorrisinho durante a mastigada. **Corte interno em 16,450s** para uma **posição C mais aberta** — a única tomada do chunk em que a cozinha atrás dele fica legível (fogão inox, coifa, panela vermelha, mosaico de seixos, pano xadrez na borda direita). Ele **rasga a pizza ao meio com as duas mãos** à frente do peito, mostrando o interior, enquanto **a outra metade fica na tábua de bordo** na base do quadro. Ele olha para baixo enquanto fala. **Segure a última tomada 55 ms além do corte natural para que a palavra "perfeita." termine dentro deste chunk.**

FALA: "A borda queimou, mas dentro tá perfeita."

CÂMERA: C (PF, travada) → C (PM mais aberto, travado, fundo apenas legível).

SFX: uma crocância de mordida mais seca e mais alta que a do beat 3; mastigação; um rasgar/estalar suave quando a pizza se parte; farelos caindo na tábua.

VFX: nenhum.

---

## MATEMÁTICA DE TEMPO

| Beat | Duração | Palavras | Tempo de fala | Ar |
|---|---:|---:|---:|---:|
| 1 — Premissa + 1 segundo | 4,104 s | 4 | 1,086 s | 3,018 s (73,5%) |
| 2 — Enfornada de 1 minuto | 4,304 s | 4 | 1,086 s | 3,218 s (74,8%) |
| 3 — Veredito de 1 minuto | 2,870 s | 8 | 2,172 s | 0,698 s (24,3%) |
| 4 — Enfornada de 10 minutos | 4,605 s | 8 | 2,172 s | 2,433 s (52,8%) |
| 5 — Veredito de 10 minutos | 2,357 s | 7 | 1,900 s | 0,457 s (19,4%) |
| **TOTAL** | **18,240 s** | **31** | **8,416 s** | **9,824 s (53,9%)** |

Na linha de base de 150 wpm, 31 palavras precisariam de 12,4s de fala. Aqui elas são entregues em **8,42s → ≈221 wpm**. Dirija a voz rápido; **não** deixe o modelo esticar as falas para preencher os 18,24s, ou as quatro enfornadas perdem o silêncio delas.

---

## VERSÃO EM UM PARÁGRAFO

Vertical 9:16, cozinha de casa com armários de madeira quente, porta branca almofadada, fogão inox a gás e backsplash de mosaico de seixos, em luz suave e quente, filmada quase toda travada na altura da bancada. Um homem encorpado de uns cinquenta e cinco anos, pele oliva, sobrancelhas grossas, bandana preta estampada com alhos brancos desenhados, óculos ovais de metal fino, dólmã branco de mangas arregaçadas, avental de peito em jeans cinza-chumbo com alça de couro marrom e ilhós de latão, e um pano de prato creme de listras vermelhas no ombro, está atrás de um forno de pizza de bancada em inox cuja boca letterbox brilha âmbar e cujo painel azul mostra uma temperatura de três dígitos que oscila. Ele olha direto para a lente, levanta um dedo e diz "Pizza de um segundo", enfia uma pizza crua de muçarela e calabresa numa pá de alumínio e puxa de volta na hora — o queijo ainda ralado e não derretido, pedaços caindo enquanto ele ergue o disco pálido, enquanto um chef anônimo gritando pisca desfocado ao fundo por meio segundo. Ele repete a montagem idêntica para um minuto, e dessa vez sai dourada e leopardada; ele morde, afunda o dedo no centro mole e diz que ainda está meio crua. Depois dez minutos, que sai chamuscada e fumegando; ele morde e rasga ao meio para mostrar o miolo cozido. Luz frontal suave de cozinha por volta de 5000 K, baixo contraste, sem LUT, foco raso, só cortes secos, cerca de um corte a cada 1,3 segundo. O topo do quadro fica limpo e sem cenário, reservado para grafismos que serão compostos depois na edição. Sem legenda, sem badge, sem número na tela, sem UI de plataforma, sem publicidade.

---

## OBJETOS DE CENA

- **Pá de pizza de alumínio** larga, cabeça retangular, cabo curto de plástico preto.
- Folhas de **papel manteiga** branco sob cada pizza.
- **Quatro pizzas pequenas**, ~20 cm cada, em quatro estados distintos: (1) **crua** — massa pálida, muçarela ralada não derretida, cinco calabresas laranja chatas; (2) **1 minuto** — borda estufada e dourada com carvão leopardado, queijo derretido e brilhante, cinco calabresas encolhidas e lustrosas; (3) **10 minutos** — borda enegrecida, queijo vermelho-acastanhado encrostado, calabresa com anéis carbonizados; (4) crua de novo, para a quarta enfornada que começa no chunk 2.
- **Tábua de açougueiro em bordo claro** atravessando o primeiro plano.
- **Forno elétrico de pizza de bancada** com lastro de pedra, display azul de 7 segmentos, botão rotativo serrilhado de metal.
- Cenário de fundo: **porta branca almofadada**, **armários de madeira quente**, **fogão inox com boca a gás e coifa**, **panela esmaltada vermelha com tampa**, **backsplash de mosaico de seixos**, **pano de prato xadrez vermelho e branco**, **manjericão em vaso de cerâmica colorido estampado**, **bancada de granito branco salpicado**.

---

## CONTINUIDADE

**Passa o bastão para o chunk 2 em 18,240s.** Este chunk termina na posição C, plano médio mais aberto, o pizzaiolo tendo acabado de rasgar a pizza de dez minutos ao meio, a outra metade na tábua de bordo, na última sílaba de "perfeita."

O chunk 2 tem de abrir na **posição A — o mesmo enquadramento travado de frente do forno usado quatro vezes aqui** — com uma pizza crua nova na pá e o pizzaiolo dizendo "Pizza de uma hora,".

Tem de bater exatamente na emenda: **mesmo homem, mesmo rosto, mesma bandana estampada de alho, mesmos óculos ovais; o mesmo dólmã branco, o mesmo avental de jeans cinza-chumbo com alça de couro e ilhós de latão, o mesmo pano de prato creme de listras vermelhas no mesmo ombro; a mesma cozinha com a porta branca, os armários de madeira, o fogão inox, a panela vermelha, o mosaico de seixos, o pano xadrez e o manjericão; o mesmo forno de bancada; a mesma tábua de bordo; a mesma luz frontal suave e quente sem sombra dura; o mesmo visual de baixo contraste sem tratamento.**

**Grafismo na passagem:** nenhum, dos dois lados. Os dois chunks são gerados limpos, com o topo do quadro livre; os quatro badges são compostos por cima na edição, depois da montagem — e é lá que o `1HR` aparece.

O corte duro da fonte cai em 18,185s; movi a fronteira **55 ms para frente, para 18,240s**, para não partir a palavra "perfeita." Segure a tomada 13 esses 55 ms extras.

---

## NEGATIVOS

sem legenda queimada, sem legenda em karaokê palavra-a-palavra, sem cápsula de legenda, sem UI de rede social, sem logo do TikTok/Instagram/YouTube, sem @handle, sem marca d'água, sem barra de progresso, sem QR code, sem botão de seguir,

**sem NENHUM grafismo de tela: sem badge, sem cronômetro, sem contador, sem HUD, sem title card, sem lower-third, sem número sobreposto, sem porcentagem, sem gráfico de pizza, sem ícone, sem seta, sem moldura, sem qualquer elemento desenhado por cima da imagem** — tudo isso entra na edição depois,

sem mãos distorcidas, sem dedos a mais, sem rosto deformado, sem pele plástica, sem supersaturação, sem glitch,

sem texto ou marca no dólmã e no avental, sem chapéu de chef, sem relógio, sem anel, **a bandana é preta com desenhos de alho em linha branca e nada mais**,
sem marca nem logo no forno, sem texto legível no forno além da temperatura azul de três dígitos,
sem trilha, sem música, sem batida, sem riser, sem sting,
sem segundo falante, sem narrador em voz over, sem eco nem reverb na voz,
**sem som de mastigação, de boca cheia ou de deglutição por cima de qualquer fala** — quando ele fala, a boca está vazia; quando ele come, ele não fala,
**sem a palavra "crua" na fala** — o modelo pronuncia mal; o texto é "não assou",
**sem inglês — toda a fala é português do Brasil**,
sem dissolve, sem wipe, sem fade to black, sem speed ramp, sem câmera lenta,
sem distorção de grande-angular no rosto, sem drone nem grua,
**sem celebridade real ou figura pública reconhecível no inserto de fundo — apenas um chef anônimo genérico**,
**sem pote de tempero, sem OSMO, sem embalagem de produto, sem logo de varejo, sem publicidade de espécie alguma**.

---

## CONFIGURAÇÕES SEEDANCE 2.5

```
model: seedance_2_5
mode: omni_reference          # este é o vídeo HUB — o chunk 2 estende a partir dele
aspect_ratio: 9:16
duration: 18                  # alvo 18,24s; se só houver durações discretas, pegue a próxima
                              # acima e apare a cauda na pós — nunca apare a cabeça
resolution: 480p
generate_audio: true
language: pt-BR

medias (todas com role image_references):
  ref1_host_frontal_at_oven.png        # pizzaiolo + guarda-roupa + enquadramento posição A + forno
  ref2_host_face_closeup_direct.png    # trava de identidade do rosto, ângulo mais próximo
  ref3_host_holding_raw_pizza.png      # beat 1 — pose segurando a pizza crua
  ref4_host_biting_golden_pizza.png    # beat 3 — mordida na pizza de 1 minuto
  ref5_host_tearing_charred_pizza.png  # beat 5 — rasgando a de 10 minutos ao meio
  ref7_kitchen_oven_location_plate.png # locação limpa: porta, armários, fogão, mosaico, granito
  ref8_pizza_state1_raw_1second.png    # prato de comida — a pizza crua, na cozinha certa
  ref9_pizza_state2_perfect_1minute.png# prato de comida — a pizza dourada, na cozinha certa
  ref10_pizza_state3_charred_10minutes.png # prato de comida — a chamuscada sendo rasgada
  # (nenhuma referência de grafismo — o modelo não gera badge; ver nota no topo)

audio_references:
  voice_reference_pizzaiolo_ptbr.mp3   # 12s, pt-BR, o mesmo personagem, do projeto
                                       # seedance-pizza-styles — ver nota no topo
```

> **Por que os badges não são pedidos ao modelo.** No projeto Seedance anterior deste repositório um grafismo pedido no prompt ("5 MIN") **renderizou, e renderizou errado**. Em vez de brigar com isso, os badges saíram inteiramente do prompt: o Seedance entrega a chapa filmada com o topo do quadro limpo, e os quatro badges mais a animação de preenchimento radial são construídos no After Effects/Figma e compostos por cima na edição. A arte de referência está em `references/_from_source/old_ref12_timer_badge_graphics_strip.png`.

> **Segunda limitação conhecida.** O Seedance erra a pronúncia de palavras em português com frequência. Se a geração pronunciar "pizzaiolo", "carbonizada" ou qualquer número de forma estranha, **reescreva a linha** em vez de tentar de novo com o mesmo texto — foi o que resolveu no projeto anterior.
