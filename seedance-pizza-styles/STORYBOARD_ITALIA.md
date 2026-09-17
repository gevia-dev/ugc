# STORYBOARD — Chunk 3 (Itália) — plano a plano

Mesmo método aprovado no chunk 2: **um plano = uma geração**, cada uma partindo de um `start_image` já aprovado. 6 × 4s × 480p = 60 créditos, e um plano ruim custa 10 pra refazer em vez de 60.

## Origem do `start_image` de cada plano

| Plano | `start_image` | Origem |
|---|---|---|
| S1 | frame t=7.0s do `V1_saopaulo_v2.mp4` | reaproveitado |
| **S2** | `references/pizzas/italia_overhead.jpg` | **gerado no Gemini** |
| S3 | frame t=6.0s do `V1_saopaulo_v2.mp4` | reaproveitado |
| **S4** | `references/pizzas/italia_char_base.jpg` | **gerado no Gemini** |
| **S5** | `references/pizzas/italia_rim.jpg` | **gerado no Gemini** |
| S6 | frame t=5.0s do `V1_saopaulo_v2.mp4`, recortado mais fechado | reaproveitado |

Três imagens novas — os três planos de comida. Geradas no Gemini (plano Pro do usuário), zero crédito Higgsfield.

### Por que os frames do host são todos com a caixa fechada

Os frames óbvios pra host falando (t=15.0 e t=24.5 do V1) têm a **pizza paulistana** em quadro — massa fina, mussarela até a borda. Num chunk que fala da Itália isso contradiz a fala em cima da própria imagem. Os três frames escolhidos (t=5.0, 6.0, 7.0) têm só a **caixa kraft fechada**, que é o elemento de marca comum aos três chunks e não carrega estilo de pizza nenhum.

Como os três têm enquadramento parecido, a variação vem da **ação**, não do quadro: S1 bate na tampa da caixa, S3 mima abrir a massa com as mãos, S6 é um plano mais fechado (recorte de 384×683 reescalado) com um aceno de cabeça de fechamento.

## Correção factual herdada do arquivo original

O `PROMPT_3` original descrevia uma "massa mais fina e mais crocante" — isso é **New Haven apizza**, não napolitana. A napolitana tem borda **alta, cheia de ar e com manchas de leopardo**, miolo fino e macio, mussarela em pedaços rasgados (nunca ralada), forno a lenha muito quente, formato deliberadamente irregular. Os três stills e as seis falas seguem essa descrição.

## Áudio

`audio_references` = o próprio áudio aprovado do V1 (`voice_ref_host_ptbr.mp3`, 12s). Nativo pt-BR, continuidade perfeita de timbre com os chunks 1 e 2, custo zero. O Seedance continua sintetizando a fala a partir do texto do prompt.

**Fala completa (52 palavras, ~18,6s a 168 wpm):**

> "Na Itália, o berço da pizza, isso aqui não é só comida: é uma arte protegida pela UNESCO. A massa é aberta à mão, num formato bem mais livre, e assa num forno a lenha muito mais quente. Sai com a borda alta, cheia de ar e com manchas escuras — tostada, mas não queimada."

Enxuguei em relação ao arquivo pra reduzir risco de TTS: caiu "pouquíssimo tempo", "manchinhas" virou "manchas", e o "E" inicial saiu.

| Plano | Trecho da fala | Na tela |
|---|---|---|
| S1 | "Na Itália, o berço da pizza, isso aqui não é só comida:" | host, lip-sync |
| S2 | "é uma arte protegida pela UNESCO." | insert, voz off |
| S3 | "A massa é aberta à mão, num formato bem mais livre," | host, lip-sync |
| S4 | "e assa num forno a lenha muito mais quente." | insert, voz off |
| S5 | "Sai com a borda alta, cheia de ar e com manchas escuras," | insert, voz off |
| S6 | "tostada, mas não queimada." | host, lip-sync |

## Bíblia visual (vale para os 6 planos)

**Host:** homem de 50 e poucos anos, corpo robusto, pele oliva clara, sobrancelhas grossas escuras, barbeado, óculos ovais de armação metálica fina. Bandana preta com desenhos de alho em linha branca. Dólmã branco com mangas dobradas abaixo do cotovelo. Avental de sarja preta com alça de couro marrom (ilhós de latão) e bolso com vivo de couro marrom. Pano creme com listras vermelhas sobre o ombro esquerdo.

**Cenário:** cozinha residencial. À esquerda: porta branca almofadada e manjericão em vaso de cerâmica colorido. À direita: armários de madeira, fogão de aço inox, backsplash de pastilha. Bancada de granito branco mosqueado. Inserts de comida: madeira escura, fundo de cozinha desfocado.

**Caixa:** kraft marrom, impressa em tinta escura — pizzaiolo em traço de linha com chapéu, wordmark "PIZZA" em slab-serif, borda quadriculada vermelha e verde, "TRADIÇÃO" e "QUALIDADE" na base. Igual nos três chunks. Fica **fechada** o tempo todo neste chunk.

**Luz:** quente, suave, ambiente. Sem LUT, cor natural, contraste médio. Cara de celular na mão, levemente suave, sem over-sharpen, sem grão.

**Câmera:** estática em todos os seis planos. Nenhum movimento.

**Negativos (em todos os planos):** nenhum texto, número, legenda, cronômetro, velocímetro, logo, marca d'água ou UI. Nada de inglês. Nada de caracteres chineses ou avental "麻辣". Nada de host jovem, nada de tirar bandana ou óculos. Nada de fade ou dissolve.

---

## S1 — Abertura · 4s

**Start:** V1 t=7.0. Plano médio, host atrás da bancada, caixa kraft fechada à frente.
**Ação:** bate uma vez na tampa da caixa com a mão direita aberta, olhando para a lente.

## S2 — Pizza napolitana inteira, overhead · 4s ⚠ IMAGEM NOVA

**Start:** `italia_overhead.jpg`.
**Enquadramento:** top-down sobre tábua de nogueira em espinha de peixe.
**Pizza:** formato redondo deliberadamente irregular, borda alta e inflada com manchas de leopardo, miolo fino, molho vermelho, mussarela em pedaços rasgados, manjericão, fio de azeite.
**Ação:** nenhuma. Só uma leve deriva de vapor. Sem mãos.
**Proibido:** queijo ralado, pepperoni, massa pálida, mãos em quadro.

## S3 — Massa aberta à mão · 4s

**Start:** V1 t=6.0. Mesmo plano médio.
**Ação:** tira as mãos da caixa e mima abrir um disco de massa entre elas, abrindo num movimento circular largo; depois inclina a cabeça e dá de ombros pra sugerir formato irregular.
**Proibido:** massa ou pizza de verdade aparecer nas mãos dele.

## S4 — Base carbonizada · 4s ⚠ IMAGEM NOVA

**Start:** `italia_char_base.jpg`.
**Enquadramento:** insert, uma mão masculina segura uma fatia triangular **virada de cabeça para baixo**, base voltada para a lente.
**Base:** seca e firme, manchas pretas e marrons irregulares (leopardo), leve polvilhado de farinha. Borda da fatia alta e inflada. Fundo de cozinha totalmente desfocado.
**Ação:** a mão segura firme e gira a fatia uns poucos graus. Nada mais.
**Explicitamente proibido:** dobrar, entortar, apertar, rasgar, morder, tirar do quadro; segunda mão entrando; pizza redonda inteira em quadro. *(Mesma trava que resolveu o desastre da dobra no chunk 2 — a ação é descrita como estado, não como gesto.)*

## S5 — Borda alta em close · 4s ⚠ IMAGEM NOVA

**Start:** `italia_rim.jpg`.
**Enquadramento:** close em ângulo baixo e levemente lateral, quadro tomado pela borda externa.
**Borda:** alta, gorda, inflada, cheia de bolhas de ar, manchas escuras de forno a lenha sobre crosta dourada. Atrás dela o miolo fino com molho, mussarela rasgada e manjericão.
**Ação:** nenhuma. Só vapor. Sem mãos.

## S6 — Fechamento · 4s

**Start:** V1 t=5.0 recortado mais fechado (384×683 → 480×854). Plano médio fechado, do peito pra cima.
**Ação:** inclina levemente pra lente, dá um aceno de cabeça satisfeito e termina em pose parada e limpa.
**Fim:** corte seco. Sem fade, sem dissolve, sem cartela de encerramento.

---

## Orçamento

| Item | Créditos |
|---|---|
| 3 imagens (Gemini, plano do usuário) | 0 |
| 3 start images extraídas do V1 | 0 |
| Referência de voz (áudio do próprio V1) | 0 |
| 6 planos × 4s × 480p | 60 |
| **Total** | **60** |

Saldo antes: 751.
