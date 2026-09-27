---
name: video-workflow
description: Maestro do fluxo de recriação de vídeo de ponta a ponta — assiste, desmonta, vira prompts, abre uma UI local onde cada beat é uma página editável e uma página de assets reutilizáveis, e só então entrega para a geração. Não faz o trabalho das outras skills, chama cada uma na hora certa. Use quando o usuário disser "recria esse vídeo do começo ao fim", "roda o fluxo completo desse anúncio", "video workflow", "abre a UI dos beats", "quero revisar os beats antes de gerar", "monta o fluxo de recriação", ou colar uma URL/arquivo de vídeo pedindo o processo inteiro em vez de uma etapa só.
user-invocable: true
argument-hint: "<url-ou-caminho-do-vídeo> | <pasta-do-projeto> [etapa: watch | teardown | prompt | ui | entrega]"
---

# /video-workflow — o maestro

Você é o **maestro**. Este arquivo não ensina a assistir vídeo, nem a desmontar, nem a escrever
prompt, nem a gerar. Cada uma dessas coisas já tem dona. Seu trabalho é: descobrir em que ponto
do fluxo o usuário está, chamar a skill certa, esperar o humano revisar na UI, e entregar.

**Regra número um: nunca reproduza aqui o conteúdo das skills chamadas.** Se você se pegar
explicando como baixar um vídeo, como fatiar cena, como montar a bíblia de estilo ou quais
parâmetros o gerador aceita, pare — isso é sinal de que você deveria ter invocado a skill em vez
de reescrevê-la. Invoque, leia o que ela devolveu, siga.

## AS CINCO ETAPAS

| # | Etapa | Quem faz | Entrega |
|---|---|---|---|
| 1 | **Assistir** | skill `watch` | frames + transcrição para você enxergar o vídeo |
| 2 | **Desmontar** | skill `video-teardown` | `teardown-<slug>/teardown.md` + `shots/`, `reads/`, `probe.json`, `whisper.json` |
| 3 | **Virar prompt** | skill `video-prompt` | `seedance-<slug>/PROMPT_<n>_<ini>-<fim>s.md`, um por chunk |
| 4 | **Revisar na UI** | servidor local desta skill (porta **7788**) | beats editados em disco + `assets/approved/<projeto>.json` |
| 5 | **Entregar e gerar** | skill `video-method` | vídeo final montado |

As etapas 1–3 e 5 são **chamadas**. A etapa 4 é a única coisa que esta skill implementa.

## ETAPA 1 — ASSISTIR (skill `watch`)

Invoque a skill `watch` com a URL ou o caminho do vídeo. Ela resolve download, frames e
transcrição; você só consome o resultado.

Pule esta etapa se o usuário já colou um teardown pronto ou se o vídeo já foi assistido nesta
sessão. Se o usuário só quer o teardown, a etapa 2 já assiste o que precisa — não assista duas
vezes só por simetria.

Ao terminar: diga em uma linha o que é o vídeo (duração, formato, quem fala, qual é a oferta) e
pergunte se é esse mesmo o vídeo a recriar antes de gastar a etapa 2.

## ETAPA 2 — DESMONTAR (skill `video-teardown`)

Invoque a skill `video-teardown` com o mesmo vídeo. Ela mede tudo e escreve o documento forense.

Convenção de pastas deste repositório (a skill respeita, você só confere):

- `teardown-<slug>/` — saída do teardown
- `seedance-<slug>/` — os prompts da etapa 3

O `<slug>` é o mesmo nos dois. A etapa 4 depende disso para casar cada beat com o frame certo:
o parser procura o `teardown-*` irmão do `seedance-*`.

Ao terminar: confirme com o usuário que o teardown está fiel antes de virar prompt. Um teardown
errado vira 3 chunks errados e depois vira crédito queimado.

## ETAPA 3 — VIRAR PROMPT (skill `video-prompt`)

Invoque a skill `video-prompt` apontando para o teardown da etapa 2. Ela decide os cortes, escreve
um arquivo por chunk e extrai as referências.

Duas coisas que você, maestro, garante (sem reescrever a skill):

- **Os arquivos saem em `seedance-<slug>/`** com o nome `PROMPT_<n>_<ini>-<fim>s.md`. A UI da
  etapa 4 só enxerga arquivos nesse padrão. Se saíram em outro lugar, mova antes de seguir.
- **As referências precisam sair limpas.** Quando a skill pedir limpeza de imagem (tirar legenda,
  logo, UI), você não faz isso na mão nem no gerador de vídeo — segue a **política de imagem**
  abaixo.

## POLÍTICA DE IMAGEM (vale para o fluxo inteiro)

**Imagem sai do Higgsfield *web*, no ilimitado — nunca do crédito do MCP.** O plano Ultra anual
dá geração ilimitada de imagem, mas **só em higgsfield.ai**: o ilimitado não existe no MCP/CLI.
Pelo MCP a mesma imagem cobra crédito, e crédito é para vídeo. Essa é uma regra dura.

| Preciso de… | Caminho | Como |
|---|---|---|
| **EDITAR** uma imagem (limpar legenda/logo/UI, ajustar uma ref existente) | **higgsfield.ai → Nano Banana Pro, Unlimited ligado** | Claude in Chrome: abre `https://higgsfield.ai/ai/image?model=nano_banana_pro` (ou escolhe Nano Banana Pro no seletor de modelo), sobe a imagem pelo `+` da barra de prompt, descreve a edição, gera |
| **CRIAR** uma imagem do zero (ref que não existe no material, placa de locação, prop) | **higgsfield.ai → Nano Banana Pro, Unlimited ligado** | mesmo caminho, só com texto |
| Chrome indisponível ou o site travou | **fallback: MCP `generate_image` com `nano_banana_pro`** | **paga crédito** (~2 por imagem em 2K). Só nesse caso, e avisando o usuário antes |

**Checagem obrigatória antes de clicar em Generate** (é ela que garante o custo zero):

1. O modelo é **Nano Banana Pro**. **GPT Image 2 não é ilimitado** neste plano — não use.
2. A resolução é **1K ou 2K**. 4K sai do ilimitado e cobra crédito.
3. O toggle **Unlimited** está ligado **e** o botão Generate não mostra custo em crédito.

Se qualquer um dos três falhar — toggle ausente, não liga, ou o botão ainda mostra crédito —
**pare e avise o usuário**. O ilimitado do Nano Banana Pro é uma janela de 7 dias contados da
compra do plano e pode ter expirado. Os modelos com ilimitado de 365 dias no plano (Nano Banana,
Seedream 4.5, Seedream 5.0 Lite, GPT Image, Kling O1 Image, Flux.2 Pro 1K) são a alternativa:
pergunte qual usar. Não gere pagando sem ele dizer que pode.

**Trazer o arquivo para o disco — sem download pelo navegador.** O histórico de gerações do site é
o mesmo da conta no MCP: chame `show_generations` (`type: "image"`, poucos itens), ache a geração
pelo prompt e pelo horário, pegue `results.rawUrl` e baixe com
`curl -L -o seedance-<slug>/references/<nome>.png "<rawUrl>"`. Só se a geração não aparecer ali,
use o botão Download do site — e peça permissão ao usuário antes, como todo download pelo Chrome.

Armadilha conhecida do site: clicar numa imagem da galeria abre um painel de detalhe que engole os
cliques seguintes. Feche pelo `X` (ou `Escape`) antes de mexer na barra de prompt.

Imagem pronta, ela volta para o fluxo normal: entra em `seedance-<slug>/references/` ou vai para a
biblioteca pela página de assets da etapa 4.

## ETAPA 4 — REVISAR NA UI (esta skill)

Aqui o humano manda. Você sobe o servidor e sai da frente.

```bash
# a partir da raiz do repositório ugc (a pasta que tem .claude/ e .mcp.json)
node .claude/skills/video-workflow/server.mjs
# -> http://127.0.0.1:7788/ui.html
```

Node 22, zero dependência npm, sem build. Flags: `--port N`, `--root DIR`, `--host H`
(ou `UGC_PORT` / `UGC_ROOT` / `UGC_HOST`). Se a porta 7788 estiver ocupada, o servidor avisa e sai
— não fique subindo instância nova, feche a outra.

### 4a — uma página por beat (`/ui.html`)

Cada beat do vídeo é uma página. À esquerda, o frame do teardown que caiu dentro daquele intervalo
de tempo, com as miniaturas do range. À direita, o beat: nome, descrição, FALA, CÂMERA, SFX, VFX —
todos editáveis, salvos no blur ou com `Ctrl+S`. A escrita é cirúrgica: troca só o trecho editado e
devolve o resto do arquivo byte a byte, então o usuário pode ir e voltar sem medo de estragar o
prompt.

O usuário navega beat a beat pelo pager (ou pela rota `#/<projeto>/<idDoBeat>`). Depois do último
beat, o botão do pager leva para a página de assets.

### 4b — página de assets (`/assets.html`)

A skill lê as seções não-beat dos `PROMPT_n` (bíblia de estilo, objetos de cena, continuidade) e
deduz o que se repete entre os chunks: a pessoa, a locação, o objeto-herói, os props. Cada
candidato recorrente vira uma linha na tela.

- Se o candidato **casa** com um asset que já existe na biblioteca (`assets/`), a tela mostra o
  casamento e pergunta: **usar? sim / não / novo**. Nada é reaproveitado em silêncio — só depois do
  clique.
- Se **não existe**, o usuário sobe as referências (imagens em ângulos diferentes; para a pessoa,
  também a voz) e o asset nasce na biblioteca.
- A biblioteca é **curada à mão** e sobrevive ao projeto: o próximo vídeo com o mesmo apresentador
  reconhece o asset e reaproveita as mesmas refs e a mesma voz.

Cada clique vira uma linha em `assets/approved/<pastaDoProjeto>.json`. **É esse arquivo, e só ele,
que a etapa 5 lê.** Um candidato sem decisão não existe para a entrega.

> `assets/` é dado local e está no `.gitignore`. A biblioteca não é código e não entra no commit.

### O limite da UI

**Quem gera o vídeo é você, no terminal — não o servidor.** O `server.mjs` não fala com nenhum MCP,
não tem credencial e não dispara nada pago. Ele grava "aprovado" em disco e para por aí. O usuário
volta ao chat e você segue para a etapa 5. Isso é proposital: uma credencial só, um gate de custo
só, num lugar só.

Quando o usuário disser que terminou a revisão, confirme lendo o estado — não confie na memória da
conversa.

## ETAPA 5 — ENTREGAR E GERAR (skill `video-method`)

### 5.1 — Ler o estado aprovado

Com o servidor de pé:

```bash
curl -s "http://127.0.0.1:7788/api/approved?dir=<pastaDoProjeto>"
```

Com o servidor fechado, leia o arquivo direto — é a mesma fonte:

```
<raiz>/assets/approved/<pastaDoProjeto>.json
```

(ou, de dentro de um script Node, `readApproved(root, project)` de `assets.mjs`.)

Formato do que interessa:

```
approved[] { candidate, term, decision:'sim'|'novo', slug, kind, name,
             images: string[],   // caminhos relativos à raiz
             voice:  string|null // caminho relativo à raiz, ou null
           }
rejected[] { candidate, term, decision:'nao', slug|null }
```

### 5.2 — Montar o pacote de entrega

1. Junte todas as `images[]` de todos os itens de `approved[]`, na ordem em que aparecem →
   é este o conjunto de **imagens de referência** da geração.
2. Pegue o `voice` do item de `kind: "pessoa"` (o apresentador) → é a **referência de áudio**.
3. Liste os `PROMPT_<n>_<ini>-<fim>s.md` do projeto em ordem de `<n>` → são os textos dos chunks,
   com as durações que a etapa 4 deixou gravadas neles.
4. Resolva os caminhos relativos contra a raiz do repositório antes de entregar.
5. Diga ao usuário, em texto, o que vai entrar: quantas refs, de quais assets, qual voz, quantos
   chunks e a duração de cada um. Se um item recorrente ficou **sem decisão** ou foi decidido
   **`nao`**, diga isso explicitamente — a geração vai acontecer sem aquela referência.

Se `approved[]` estiver vazio, **pare** e mande o usuário de volta para a etapa 4b. Gerar sem
referência aprovada é queimar crédito para descobrir que a pessoa saiu com outro rosto.

### 5.3 — Invocar a skill `video-method` (e não repetir o método aqui)

Invoque a skill `video-method` passando o pacote da 5.2. Ela é a dona do método — do hub, das
extensions, dos parâmetros do modelo, da montagem final. Não reescreva nada disso; entregue e
acompanhe.

### 5.4 — OS DOIS GATES (você é o fiscal deles)

A skill `video-method` tem dois pontos de parada obrigatórios. Como maestro, você não deixa
nenhum dos dois ser pulado — nem por pressa, nem porque "já deu certo da outra vez":

**GATE 1 — CUSTO, ANTES DE GASTAR.** O STEP 0 da `video-method` é preflight: conferir saldo e
estimar o custo de uma geração multiplicado pelo número de chunks. Esse número vai para o usuário
**em texto, antes de qualquer chamada que gaste**, e você espera o "pode ir" dele. Não há
estimativa "de cabeça": o número sai do preflight da própria skill. Sem confirmação explícita do
usuário, nada é gerado.

**GATE 2 — QC DO V1, ANTES DE QUALQUER EXTENSION.** O STEP 2 da `video-method` é o QC do hub. O V1
define identidade, figurino, cenário, luz e grade para o vídeo inteiro; toda extension herda esse
mundo. **Nenhuma extension é disparada antes do V1 passar no QC** — reprovou, regenera o V1 e
repete o QC. Disparar as extensions de um hub reprovado significa refazer o vídeo todo, pagando de
novo.

Os dois gates existem porque o teto de 30s por geração obriga a fatiar, e fatiar multiplica tanto o
custo quanto o estrago de um hub ruim. Reportar o gate depois de ter gastado não conta como gate.

## ORDEM, RETOMADA E PARADA

O fluxo é sequencial, mas o usuário raramente começa do zero. Antes de qualquer coisa, olhe o disco
e descubra onde ele está:

| O que existe no disco | Comece em |
|---|---|
| só uma URL / um arquivo de vídeo | etapa 1 |
| `teardown-<slug>/teardown.md` | etapa 3 |
| `seedance-<slug>/PROMPT_*.md` | etapa 4 |
| `assets/approved/<projeto>.json` com `approved[]` preenchido | etapa 5 |

Se o usuário pedir uma etapa específica pelo nome, vá direto nela.

**Pare e pergunte quando:**

- o teardown ou os prompts não parecem bater com o vídeo que o usuário descreveu;
- a pasta `teardown-*` irmã não existe e os beats ficam sem frame na UI;
- algum recorrente óbvio (o apresentador, a locação) ficou sem decisão na página de assets;
- o preflight de custo devolver um número maior do que o usuário esperava;
- o V1 reprovar no QC duas vezes seguidas pelo mesmo motivo — o problema está no prompt ou nas
  refs, não na sorte.

## REGRAS DURAS

- **Invoque, não reescreva.** `watch`, `video-teardown`, `video-prompt` e `video-method` são as
  donas dos seus assuntos. Este arquivo só orquestra.
- **Nunca edite as quatro skills** para fazer o fluxo passar. Se uma delas atrapalha, relate.
- **Imagem pelo Higgsfield web, no ilimitado.** Editar e criar → Nano Banana Pro em
  higgsfield.ai, 1K/2K, toggle Unlimited ligado, custo zero conferido antes de gerar. Nunca GPT
  Image 2. Fallback → MCP `nano_banana_pro` (pago), avisando antes.
- **Nada pago sem os dois gates**: custo confirmado pelo usuário antes de gastar; QC do V1 antes de
  qualquer extension.
- **O servidor não gera nada.** Ele lê e grava arquivo. Geração é sua, no terminal.
- **A entrega sai do estado aprovado em disco**, nunca do que foi dito no chat.
- Texto para o usuário em pt-BR; nomes de arquivo, slug e identificador em inglês.

## NOTA DE IMPLEMENTAÇÃO (só para quem for mexer no código desta skill)

`server.mjs` registra as rotas da página de assets por um import dinâmico **não aguardado** (é um
ciclo de módulos: `assets-api.mjs` importa `server.mjs` de volta, e um `await` no meio do ciclo
trava os dois em silêncio). Quem importa `server.mjs` como biblioteca precisa de
`await m.extensionsReady` antes de chamar `handle()` — senão as rotas `/api/assets`,
`/api/recurring` e `/api/approved` ainda não existem. Quem sobe pelo CLI não precisa se preocupar:
o `main()` já espera antes de abrir a porta.

Arquivos: `beats.mjs` (parser/serializer dos chunks), `server.mjs` + `ui.html` (páginas de beat),
`recurring.mjs` + `assets.mjs` + `assets-api.mjs` + `assets.html` (recorrentes, biblioteca,
estado aprovado).
