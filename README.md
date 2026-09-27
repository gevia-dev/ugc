# ugc — fluxo de recriação de vídeo

Cinco skills do Claude Code que levam um vídeo de referência (URL ou arquivo) até um vídeo
recriado no Seedance via Higgsfield:

| # | Skill | O que faz |
|---|---|---|
| 1 | `watch` | baixa o vídeo, tira frames e transcreve |
| 2 | `video-teardown` | desmonta tudo (cortes, falas, tela, áudio) em `teardown-<slug>/` |
| 3 | `video-prompt` | vira prompts de 30s em `seedance-<slug>/PROMPT_<n>_<ini>-<fim>s.md` |
| 4 | `video-workflow` | **o maestro**: chama as outras e abre a UI local de revisão (beats + assets) |
| 5 | `video-method` | gera no Higgsfield (hub + extensions) e monta o vídeo final |

No dia a dia você só chama **`/video-workflow <url-do-vídeo>`**: ele descobre em que etapa o
projeto está e chama cada skill na hora certa.

---

## Instalação (uma vez por máquina)

Funciona em **Windows** e **macOS**. Leva uns 10–15 min, a maior parte baixando o modelo de
transcrição (~1,5 GB).

### 1. Claude Code

Você precisa de uma conta Claude (Pro ou Max) sua.

- **Windows** (PowerShell):
  ```powershell
  winget install --id Git.Git -e
  winget install --id GitHub.cli -e
  irm https://claude.ai/install.ps1 | iex
  ```
- **macOS** (Terminal; se não tiver Homebrew, instale antes em https://brew.sh):
  ```bash
  brew install git gh
  curl -fsSL https://claude.ai/install.sh | bash
  ```

Feche e abra o terminal, rode `claude` uma vez e faça login.

### 2. Clonar o repositório

Aceite o convite do repositório `gevia-dev/ugc` que chegou no seu e-mail do GitHub. Depois:

```bash
gh auth login          # escolha GitHub.com > HTTPS > login pelo navegador
gh repo clone gevia-dev/ugc
cd ugc
```

### 3. Rodar o setup

Instala só o que falta (Node 22+, Python 3.13, ffmpeg, yt-dlp), cria o ambiente do Whisper local,
baixa o modelo e configura o `/watch`. Pode rodar de novo quantas vezes quiser.

- **Windows** (PowerShell comum, não precisa ser admin, dentro da pasta `ugc`):
  ```powershell
  powershell -ExecutionPolicy Bypass -File setup\windows.ps1
  ```
- **macOS** (dentro da pasta `ugc`):
  ```bash
  bash setup/macos.sh
  ```

No fim aparece um quadro com `[ok]` em cada linha e a frase `ready`. Qualquer `[!!]` diz o que
falta. Para só conferir, sem instalar nada: `python setup/bootstrap.py --check` (no Mac, `python3`).

**Abra um terminal novo depois do setup**, para ele enxergar o PATH atualizado.

### 4. Conectar o Higgsfield (geração de vídeo)

O servidor MCP do Higgsfield já vem configurado no repositório (`.mcp.json`).

1. Dentro da pasta `ugc`, rode `claude`.
2. Ele pergunta se aprova o servidor MCP `higgsfield` do projeto: **aprove**.
3. Digite `/mcp`, escolha `higgsfield` → **Authenticate** e faça login no navegador com a
   **conta Higgsfield da empresa** (a mesma conta Ultra; peça o login a quem administra a conta).

Como a conta é compartilhada, **o saldo de crédito e o histórico de gerações também são**. Os
dois gates de custo da skill (orçamento confirmado antes de gastar, QC do V1 antes das extensions)
valem para os dois — e ao baixar uma imagem pelo histórico, confira prompt **e** horário para não
pegar a geração do outro.

### 5. Conectar o Chrome (imagens no ilimitado)

A política de imagem do fluxo manda gerar e editar imagem **no site** higgsfield.ai (Nano Banana
Pro, toggle Unlimited), nunca pelo crédito do MCP. O Claude faz isso pilotando o seu Chrome:

1. Instale a extensão **Claude in Chrome** pela Chrome Web Store e faça login com a sua conta Claude.
2. No Chrome, entre em higgsfield.ai com a mesma conta da empresa do passo 4.
3. No Claude Code, rode `/chrome` para conectar.

---

## Primeiro uso

```bash
cd ugc
claude
```

E no Claude Code:

```
/video-workflow https://www.instagram.com/reel/...
```

Ele assiste, desmonta, pede sua confirmação entre as etapas e, na etapa 4, sobe a UI de revisão em
http://127.0.0.1:7788/ui.html. Na primeira vez o Claude vai pedir permissão para rodar comandos
(`python`, `node`, `ffmpeg`, `yt-dlp`, `curl`): pode aprovar.

## Dia a dia

- **Antes de começar**, pegue a versão mais nova das skills: `git pull`.
- **Melhorou uma skill?** Commit e push (ou peça ao Claude: "commita e sobe essa melhoria").
  Mensagens no padrão `feat:`, `fix:`, `docs:`, `refactor:`.

## O que NÃO vem pelo git (fica só na sua máquina)

| O quê | Onde | Por quê |
|---|---|---|
| Vídeos, frames, imagens, áudio | `*.mp4`, `*.png`, `shots/`, `references/`… | pesado e recriável |
| Biblioteca de assets (pessoas, vozes, refs aprovadas) | `assets/` | dado local, curado à mão |
| Estado da revisão | `review/` | dado local |
| Chaves e tokens | `.env`, `~/.config/watch/.env` | segredo |

Se quiserem compartilhar a biblioteca de assets, passem a pasta `assets/` por fora (Drive, por
exemplo) e coloquem na raiz do `ugc`.

## Problemas comuns

- **`python` abre a Microsoft Store (Windows):** Configurações → Aplicativos → Configurações
  avançadas de aplicativos → Aliases de execução de aplicativo → desligue `python.exe` e
  `python3.exe`. Rode o setup de novo.
- **Erro de "Long Path" no pip (Windows):** o Windows limita caminhos a 260 caracteres. O setup
  instala em `%LOCALAPPDATA%\whisper-local\venv`, que costuma caber; se falhar, ative caminhos
  longos (PowerShell como admin):
  `New-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force`
- **Porta 7788 ocupada:** já tem uma UI aberta em outro terminal. Feche a outra; não suba duas.
- **Primeira transcrição demora:** o modelo `medium` carrega do zero na primeira vez (~1–2 min
  para um Reels). As seguintes são mais rápidas.
- **`/mcp` mostra o higgsfield desconectado:** refaça o Authenticate.
