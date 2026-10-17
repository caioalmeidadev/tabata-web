# TabataPro — Tabata & HIIT Web Timer

Cronômetro web responsivo de treino intervalado (Tabata / HIIT), projetado com visual esportivo de alto contraste, motor de tempo de alta precisão sem drift e síntese sonora via Web Audio API.

## ✨ Funcionalidades

- **Início Rápido e Presets Prontos:** Protocolos **Classic Tabata** (20s Work / 10s Rest × 8) e **HIIT** (40s Work / 20s Rest × 10) prontos para iniciar com 1 clique.
- **Criador e Editor de Treinos Personalizados:**
  - Configuração de tempo de preparação inicial (`Prepare`).
  - Múltiplos **Rounds** com número de repetições (`Repeats`) independente.
  - Múltiplos **Intervalos** por round (`Work`, `Rest`, `Prepare`, `Cooldown`) com nomes e durações customizáveis.
  - Configuração de **Ciclos (`Cycles`)** e descanso entre ciclos.
  - Seletor de cores de destaque e cálculo em tempo real da duração total.
- **Execução do Treino (Timer de Alta Precisão):**
  - Mudança dinâmica de cores de fundo em tela cheia de acordo com a etapa:
    - 🟨 **PREPARE** (`#FFFF2E`)
    - 🟩 **WORK** (`#83FF36`)
    - 🟥 **REST** (`#FF3B30`)
  - Exibição da próxima etapa, barra de progresso do intervalo/treino e contadores de `Repeats` e `Cycles` restantes.
  - Controles completos: **Pausar**, **Continuar**, **Avançar etapa**, **Voltar etapa**, **Parar** e **Modo Tela Cheia**.
  - Suporte a **Screen Wake Lock API** (mantém a tela acesa durante o treino).
- **Alertas Sonoros e Vibração:**
  - Beeps regressivos nos últimos 3 segundos (`3, 2, 1`) gerados via **Web Audio API** (zero latência e funcionamento 100% offline).
  - Alertas sonoros distintos para início de `WORK`, início de `REST` e conclusão do treino (`FINISHED`).
  - Feedback háptico via **Vibration API** em dispositivos móveis compatíveis.
- **Persistência Local:** Todos os treinos personalizados, preferências de áudio e último treino executado ficam salvos no `LocalStorage`.

---

## 🛠️ Stack Técnica

- **[Next.js 16](https://nextjs.org/)** (App Router + Turbopack)
- **[React 19](https://react.dev/)** + **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[Zustand](https://zustand-demo.pmnd.rs/)** (Gerenciamento de estado)
- **[Lucide React](https://lucide.dev/)** (Ícones)
- **Web APIs:** Web Audio API, Vibration API, Fullscreen API, Screen Wake Lock API, LocalStorage

---

## 🚀 Como Executar Localmente

1. **Instale as dependências:**

```bash
npm install
```

2. **Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```

3. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000).

4. **Build de produção:**

```bash
npm run build
npm start
```

---

## 📂 Estrutura do Projeto

```text
src/
├── app/
│   ├── page.tsx                    # Dashboard inicial (Quick Start, Meus Treinos, Presets)
│   └── workout/
│       ├── new/page.tsx            # Criação de novo treino
│       └── [id]/
│           ├── page.tsx            # Edição / personalização de treino
│           └── play/page.tsx       # Tela principal de execução do cronômetro
├── components/
│   ├── layout/                     # AppHeader, PageContainer, BottomActions
│   ├── timer/                      # TimerDisplay, TimerHeader, TimerControls, TimerNext, TimerStats, TimerProgress
│   ├── workout/                    # WorkoutCard, WorkoutEditor, RoundEditor, IntervalEditor, Inputs
│   └── ui/                         # Button, Card, Input
├── constants/                      # Presets oficiais e tokens do tema esportivo
├── engine/                         # Timer Engine (baseado em Date.now()) e Workout Runner
├── services/                       # Serviços de Web Audio/Vibração e LocalStorage
├── stores/                         # Stores Zustand (timer, workout, settings)
└── types/                          # Interfaces TypeScript (Workout, TimerState)
```

---

## 📄 Especificação

Para mais detalhes sobre requisitos funcionais, modelo de dados e roadmap futuro (PWA, autenticação e estatísticas), consulte o arquivo [SPEC-tabata-web.md](./SPEC-tabata-web.md).
