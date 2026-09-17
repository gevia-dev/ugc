# STORYBOARD — Chunk 2 (Rio de Janeiro) — v4, plano a plano

## Por que este arquivo existe

O take de 20s (`V2_rio.mp4`) foi gerado como **uma geração só**, com 7 cortes descritos num parágrafo. O Seedance inventou os cortes e produziu a cena da dobra errada: pegou a **pizza inteira**, dobrou ao meio e amassou.

A causa é rastreável no meu prompt. Os beats diziam *"hands fold the slice"*, mas o beat anterior tinha deixado a **pizza inteira** em quadro e eu nunca escrevi que uma fatia foi separada. O modelo dobrou o que estava na frente dele.

**Correção estrutural:** um plano = uma geração, cada um partindo de um `start_image` aprovado. Custo igual (6 × 4s × 10 = 60 créditos, mesmo que 1 × 20s = 60), mas a composição é aprovada antes e um plano ruim custa 10 pra refazer em vez de 60.

## Origem do `start_image` de cada plano

Quatro planos do take atual ficaram corretos. **Extraio o frame do próprio vídeo** e uso como `start_image` — custo zero e garantidamente on-model (host, roupa, cozinha e luz já batendo com o V1).

| Plano | `start_image` | Origem |
|---|---|---|
| R1 | frame t=0.3s de `V2_rio.mp4` | reaproveitado |
| R2 | frame t=3.2s de `V2_rio.mp4` | reaproveitado |
| R3 | frame t=7.6s de `V2_rio.mp4` | reaproveitado |
| **R4** | `references/pizzas/rio_slice_alone.jpg` | **gerado no Gemini** |
| **R5** | `references/pizzas/rio_cheesepull.jpg` | **gerado no Gemini** |
| R6 | frame t=19.9s de `V2_rio.mp4` | reaproveitado |

Só 2 imagens novas — exatamente os dois beats que quebraram. Geradas no Gemini (plano Pro do usuário), zero crédito Higgsfield.

## A dobra foi cortada

Tentei três vezes gerar a fatia dobrada como still. As três saíram erradas do mesmo jeito: a fatia lia como **rasgada e aberta em V**, não dobrada, e a massa saía pálida. Falhar três vezes igual não é azar, é a descrição que não funciona — e o vídeo tinha errado exatamente a mesma coisa.

Duas razões para tirar a cena em vez de insistir:

1. **A dobra é herança de Nova York.** Veio do vídeo americano original, junto com a "fatia do tamanho do seu rosto" que você já tinha estranhado. Não é um gesto que identifica pizza carioca.
2. **A puxada de queijo é mais confiável e mais apetitosa.** Saiu certa na primeira tentativa, e é o plano de comida mais forte que existe.

A fala muda no fim para acompanhar: `"crocante mas que ainda dobra na mão"` → `"crocante por fora e macia por dentro"`.

## Áudio

`audio_references` no Seedance, conforme decidido. Amostra de voz ElevenLabs pt-BR anexada como referência de timbre; o Seedance continua sintetizando a fala a partir do texto do prompt.

**Fala (54 palavras, ~19s a 168 wpm):**

> "A pizza do Rio de Janeiro é tão famosa quanto o Pão de Açúcar. A massa é aberta à mão, num círculo bem grande, e sai um pedaço tão largo que um só já resolve. Ela assa num forno a gás um pouco mais quente, até ganhar uma crosta dourada e inflada, crocante por fora e macia por dentro."

Três trocas em relação ao take anterior, todas por palavras que o TTS errou (confirmado por transcrição em janela isolada, três vezes cada):

| Antes | Saiu como | Agora |
|---|---|---|
| Cristo **Redentor** | "Redisentor" | **Pão de Açúcar** |
| **fatia** | "fatilha" | **pedaço** |
| ainda **dobrável** | "abondável" | **que ainda dobra na mão** |

A fala é contínua sobre os 6 planos. Cada geração de plano carrega **só o trecho que cai nela**, para o lip-sync não brigar com o corte.

| Plano | Trecho da fala |
|---|---|
| R1 | "A pizza do Rio de Janeiro é tão famosa quanto o Pão de Açúcar." |
| R2 | "A massa é aberta à mão, num círculo bem grande," |
| R3 | "e sai um pedaço tão largo que um só já resolve." |
| R4 | "Ela assa num forno a gás um pouco mais quente," |
| R5 | "até ganhar uma crosta dourada e inflada," |
| R6 | "crocante por fora e macia por dentro." |

## Bíblia visual (vale para os 6 planos)

**Host:** homem de 50 e poucos anos, corpo robusto, pele oliva clara, sobrancelhas grossas escuras, barbeado, óculos ovais de armação metálica fina. Bandana preta com desenhos de alho em linha branca. Dólmã branco com mangas dobradas abaixo do cotovelo. Avental de sarja preta com alça de couro marrom (ilhós de latão) e bolso com vivo de couro marrom. Pano creme com listras vermelhas sobre o ombro esquerdo.

**Cenário:** cozinha residencial. À esquerda: porta branca almofadada e manjericão em vaso de cerâmica colorido. À direita: armários de madeira, fogão de aço inox, backsplash de pastilha, panela vermelha esmaltada, pano xadrez vermelho e branco. Bancada de granito branco mosqueado. Inserts de comida: tábua de nogueira escura em espinha de peixe.

**Luz:** quente, suave, ambiente. Sem LUT, cor natural, contraste médio. Cara de celular na mão, levemente suave, sem over-sharpen, sem grão.

**Negativos (em todos os planos):** nenhum texto, número, legenda, cronômetro, velocímetro, marca d'água ou UI. Nada de pizza pálida ou crua. Nada de host jovem, nada de tirar bandana ou óculos. Nada de caracteres chineses ou avental "麻辣". Nada de inglês. Nada de fade ou dissolve.

---

## R1 — Abertura da caixa · 4s

**Start image:** frame t=0.3s do take atual.
**Enquadramento:** plano médio estático, host atrás da bancada de granito, caixa kraft fechada à frente.
**Ação:** ele abre a tampa da caixa, que sobe em direção à câmera. Olha para a lente, energia alta.
**Caixa:** kraft marrom, impressa em tinta escura — pizzaiolo em traço de linha com chapéu, wordmark "PIZZA" em slab-serif, borda quadriculada vermelha e verde, "TRADIÇÃO" e "QUALIDADE" na base.
**Som:** rangido leve de papelão.

## R2 — Gag do tamanho · 4s

**Start image:** frame t=3.2s do take atual.
**Enquadramento:** plano médio fechado, estático, no rosto e tronco.
**Ação:** ele segura **um pedaço enorme** na frente do peito e do rosto, grande o bastante para cobrir parte dele. Expressão divertida.
**Nota de lip-sync:** a boca fica parcialmente coberta pelo pedaço. Plano bom para colocar fala.

## R3 — Pizza inteira, overhead · 4s

**Start image:** frame t=7.6s do take atual.
**Enquadramento:** top-down estático, direto sobre a tábua de nogueira.
**Ação:** a pizza inteira parada na tábua. Sem mãos em quadro. Leve deriva de vapor.
**Pizza:** diâmetro grande, aberta à mão, molho vermelho, mussarela derretida, pepperoni levemente encanoado soltando óleo alaranjado, borda dourada e inflada com manchinhas de forno.

## R4 — Um pedaço sozinho, começando a dobrar · 4s ⚠ IMAGEM NOVA

**Start image:** a gerar. **Este é o plano que quebrou.**
**Enquadramento:** top-down estático sobre a tábua de nogueira.
**O que TEM que estar em quadro:** **um único pedaço triangular, sozinho, no centro da tábua.** A pizza inteira está **fora de quadro** — não há nenhuma outra fatia visível.
**Ação:** duas mãos entram por baixo do quadro e começam a levantar as duas bordas do pedaço no sentido do **comprimento** (da ponta até a crosta), formando um vinco raso no meio.
**Explicitamente proibido:** dobrar a pizza inteira; qualquer pizza redonda inteira em quadro; apertar, espremer ou amassar; a fatia ainda ligada ao resto da pizza; dobrar no sentido da largura.

## R5 — Puxada de queijo · 4s ⚠ IMAGEM NOVA

**Start image:** `references/pizzas/rio_cheesepull.jpg`. **Substitui a antiga cena da dobra.**
**Enquadramento:** vista de cima em ângulo, sobre a tábua.
**Ação:** uma mão levanta um pedaço tirando-o do resto da pizza. Longos fios de mussarela derretida se esticam entre o pedaço erguido e a pizza embaixo. A ponta do pedaço cede levemente pelo próprio peso, mostrando que a massa é macia.
**Ponto da cena:** provar "crocante por fora e macia por dentro" com a imagem mais apetitosa que existe.
**Explicitamente proibido:** apertar ou espremer a massa; dobrar a pizza inteira; fatia rasgada ou partida; fios de queijo com aparência de plástico; massa pálida.

## R6 — Fechamento · 4s

**Start image:** frame t=19.9s do take atual.
**Enquadramento:** plano médio estático, host de frente para a câmera.
**Ação:** ele levanta o pedaço em direção à lente, expressão satisfeita e confiante. Termina em pose parada e limpa.
**Fim:** corte seco. Sem fade, sem dissolve, sem trilha de encerramento.

---

## Imagens a gerar (2)

Geradas no navegador (ChatGPT, fallback Gemini) para não consumir crédito Higgsfield.

### IMG-R4

> Fotografia vertical 9:16 tirada com celular, vista de cima, direto para baixo, sobre uma tábua de madeira de nogueira escura com padrão espinha de peixe. No centro do quadro há **uma única fatia triangular de pizza, sozinha** — não há mais nenhuma pizza nem nenhuma outra fatia em lugar nenhum do quadro. A fatia é grande, estilo carioca: massa fina mas maleável, molho de tomate vermelho, mussarela derretida, rodelas de pepperoni douradas e levemente encanoadas soltando um pouco de óleo alaranjado, e uma borda externa dourada, inflada e aerada com manchinhas escuras de forno. Duas mãos masculinas entram pela borda inferior do quadro e levantam com delicadeza as duas laterais da fatia no sentido do comprimento, da ponta até a borda, formando um vinco raso e limpo no meio da fatia. A fatia continua inteira e apetitosa. Luz de cozinha residencial quente e suave, cor natural, contraste médio, levemente suave como foto de celular. Sem texto, sem números, sem legenda, sem marca d'água.

**Negativo:** pizza redonda inteira em quadro; mais de uma fatia; a fatia sendo apertada, espremida ou amassada; recheio escorrendo; massa rachando; pizza pálida ou crua; estúdio 4K nítido demais; qualquer texto.

### IMG-R5

> Fotografia vertical 9:16 tirada com celular, close, ângulo levemente de perfil e um pouco de cima, sobre uma tábua de madeira de nogueira escura em espinha de peixe ao fundo desfocado. Uma mão masculina segura **uma fatia de pizza já dobrada ao meio no sentido do comprimento**, pela borda da crosta, levantada alguns centímetros acima da tábua. A dobra formou um vinco central limpo; as duas metades se encostam e o recheio fica contido dentro. A ponta da fatia cede levemente para baixo por causa do próprio peso, mostrando que a massa dobra sem quebrar. Dá pra ver a borda dourada e inflada, o miolo aerado no corte, mussarela derretida e pepperoni. A fatia está inteira, quente e apetitosa. Luz de cozinha residencial quente e suave, cor natural, contraste médio, levemente suave como foto de celular. Sem texto, sem números, sem legenda, sem marca d'água.

**Negativo:** polegar apertando a crosta; fatia espremida ou amassada; fatia partida ao meio; massa rachada; recheio escorrendo pra fora; pizza pálida ou crua; pizza inteira em quadro; qualquer texto.

## Orçamento

| Item | Créditos |
|---|---|
| 2 imagens (navegador, plano do usuário) | 0 |
| 4 start images extraídas do take atual | 0 |
| 6 planos × 4s × 480p | 60 |
| **Total** | **60** |

Saldo antes: 801.
