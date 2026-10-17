<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Diretrizes do Projeto Tabata Web Timer

Este documento orienta agentes de IA e desenvolvedores que atuam no código do **Tabata Web Timer**. A especificação completa do produto encontra-se em `SPEC-tabata-web.md`.

## 1. Visão Geral e Arquitetura

- **Framework:** Next.js 16+ (App Router + Turbopack + Partial Prerendering / Cache Components habilitados)
- **Linguagem:** TypeScript (`strict: true`)
- **Estilização:** Tailwind CSS v4 (`@import "tailwindcss";` e `@theme inline` em `src/app/globals.css`)
- **Gerenciamento de Estado:** Zustand (`src/stores/`)
- **Persistência (MVP):** `localStorage` via `src/services/storage.service.ts` (sem backend no MVP)
- **Áudio & Háptica:** Síntese sonora de baixa latência via **Web Audio API** e **Vibration API** (`src/services/audio.service.ts`)

## 2. Regras Críticas de Engenharia

1. **Precisão do Timer (`Date.now()`)**:
   - **NUNCA** utilize `setInterval(() => seconds--, 1000)` para decrementar o tempo.
   - A fonte de verdade deve ser sempre o timestamp absoluto `endsAt = Date.now() + durationMs` e `remainingMs = Math.max(0, endsAt - Date.now())` (ver `src/engine/timer-engine.ts`).
2. **Next.js 16 Prerendering & Client Hooks**:
   - Componentes Client que utilizam `useParams()` ou `useSearchParams()` devem estar envolvidos em `<Suspense fallback={...}>` na página da rota (ex.: `/workout/[id]` e `/workout/[id]/play`).
   - Evite chamadas não determinísticas como `Date.now()` ou `Math.random()` durante a renderização inicial de um Client Component para não quebrar a pré-renderização estática do Next.js 16; execute-as apenas dentro de `useEffect` ou em handlers de eventos.
3. **SSR Safety com APIs do Navegador**:
   - Sempre verifique `typeof window !== "undefined"` ou `typeof navigator !== "undefined"` antes de acessar `localStorage`, `AudioContext`, `navigator.vibrate`, `navigator.wakeLock` ou `document.documentElement.requestFullscreen`.
4. **Direção Visual e Acessibilidade**:
   - Manter estética **dark / esportiva de alto contraste**:
     - Background `#0A0A0A`, Surface `#171717`, Surface Elevated `#232323`
     - Prepare `#FFFF2E`, Work `#83FF36`, Rest `#FF3B30`, Repeats `#249CFF`, Cycles `#FFC62E`
   - Fontes: `font-display` (**Anton** para números e títulos), `font-condensed` (**Barlow Condensed** para labels) e `font-sans` (**Inter**).
   - Todos os botões de ícone devem conter `aria-label` descritivo em português.

## 3. Estrutura de Pastas

```text
src/
  app/                  # Rotas App Router (/, /workout/new, /workout/[id], /workout/[id]/play)
  components/
    layout/             # AppHeader, PageContainer, BottomActions
    timer/              # TimerDisplay, TimerHeader, TimerControls, TimerNext, TimerStats, TimerProgress
    workout/            # WorkoutCard, WorkoutEditor, RoundEditor, IntervalEditor, inputs numéricos
    ui/                 # Primitivos base (Button, Card, Input)
  constants/            # presets.ts (Classic Tabata, HIIT) e theme.ts
  engine/               # timer-engine.ts e workout-runner.ts (máquina de estados pura)
  services/             # audio.service.ts e storage.service.ts
  stores/               # timer.store.ts, workout.store.ts, settings.store.ts
  types/                # workout.ts e timer.ts
```

## 4. Comandos de Validação

Antes de concluir qualquer alteração ou realizar commits, valide:

```bash
npx tsc --noEmit
npm run build
```
