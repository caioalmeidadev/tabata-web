# SPEC — Tabata Web Timer

## 1. Visão Geral

**Nome provisório:** Tabata Web Timer  
**Plataforma inicial:** Web responsiva  
**Modelo inicial:** SPA/SSR com Next.js  
**Persistência inicial:** LocalStorage  
**Backend:** Não utilizar no MVP  
**Autenticação:** Não utilizar no MVP  

O produto será um cronômetro de treino intervalado inspirado em Tabata/HIIT, com foco em uso rápido, visual esportivo, alto contraste, funcionamento simples e boa experiência em dispositivos móveis e desktop.

O app deve permitir:

- criar treinos personalizados;
- configurar preparação, trabalho, descanso, repetições e ciclos;
- executar o treino com cronômetro visual;
- pausar, continuar, avançar e voltar etapas;
- emitir alertas sonoros;
- salvar treinos localmente;
- funcionar de forma responsiva;
- ser preparado para evolução futura como PWA.

---

# 2. Objetivo do MVP

Entregar uma aplicação web funcional onde o usuário consiga:

1. abrir o app;
2. escolher um treino padrão ou criar um novo;
3. configurar intervalos;
4. iniciar o treino;
5. acompanhar visualmente o estado atual;
6. pausar ou continuar;
7. avançar ou retroceder etapas;
8. concluir o treino;
9. reutilizar treinos salvos.

---

# 3. Stack Técnica

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Zustand
- Lucide React

## Persistência

- LocalStorage

## APIs Web

- Web Audio API
- Vibration API, quando suportado
- Fullscreen API, opcional no MVP

## Futuro

- PWA
- Supabase/PostgreSQL
- autenticação
- sincronização
- histórico
- estatísticas
- assinatura premium

---

# 4. Direção Visual

O app deve seguir o estilo das referências fornecidas:

- visual dark;
- aparência esportiva;
- alto contraste;
- tipografia condensada;
- números grandes;
- cores fortes por estado;
- sensação de movimento;
- interface limpa e focada no cronômetro.

## Paleta base

| Uso | Cor sugerida |
|---|---|
| Background | `#0A0A0A` |
| Surface | `#171717` |
| Surface Elevated | `#232323` |
| Texto principal | `#FFFFFF` |
| Texto secundário | `#9CA3AF` |
| Prepare | `#FFFF2E` |
| Work | `#83FF36` |
| Rest | `#FF3B30` |
| Repeats | `#249CFF` |
| Cycles | `#FFC62E` |

## Tipografia

Sugestão:

- títulos: Anton;
- labels: Barlow Condensed;
- textos auxiliares: Inter.

---

# 5. Responsividade

O layout deve ser **mobile-first**.

Breakpoints:

- mobile: até 767px;
- tablet: 768px a 1023px;
- desktop: 1024px ou mais.

No desktop, o layout não deve apenas esticar a interface mobile. Deve aumentar espaçamentos, largura útil e hierarquia visual mantendo o cronômetro centralizado.

---

# 6. Telas do MVP

## 6.1 Dashboard

Rota:

`/`

### Elementos

- logo/nome do app;
- botão de início rápido;
- cards de treinos salvos;
- presets;
- botão “Criar treino”.

### Presets iniciais

#### Classic Tabata

- Prepare: 10s
- Work: 20s
- Rest: 10s
- Repeats: 8
- Cycles: 1

#### HIIT

- Prepare: 10s
- Work: 40s
- Rest: 20s
- Repeats: 10
- Cycles: 1

---

## 6.2 Criar/Editar Treino

Rotas:

`/workout/new`

`/workout/[id]`

### Campos

- nome do treino;
- cor;
- tempo de preparação;
- rounds;
- intervals;
- repeats;
- cycles;
- descanso entre ciclos.

### Ações

- adicionar intervalo;
- remover intervalo;
- alterar duração;
- alterar tipo;
- adicionar round;
- remover round;
- definir número de repetições;
- salvar;
- cancelar.

---

## 6.3 Timer

Rota:

`/workout/[id]/play`

### Exibir

- estado atual;
- tempo restante;
- tempo total do treino;
- próximo estado;
- repeat atual;
- repeats restantes;
- cycle atual;
- cycles restantes.

### Controles

- pause;
- resume;
- next;
- previous;
- stop.

### Estados visuais

#### PREPARE

- background amarelo;
- label PREPARE;
- cronômetro grande;
- próximo estado visível.

#### WORK

- background verde;
- label WORK;
- cronômetro grande;
- próximo estado visível.

#### REST

- background vermelho/laranja;
- label REST;
- cronômetro grande;
- próximo estado visível.

#### PAUSED

- overlay escuro;
- texto PAUSED;
- botão para continuar.

#### FINISHED

- mensagem de treino finalizado;
- duração total;
- botão voltar;
- botão repetir treino.

---

# 7. Modelo de Dados

## IntervalType

```ts
export type IntervalType =
  | 'prepare'
  | 'work'
  | 'rest'
  | 'cooldown';
```

## WorkoutInterval

```ts
export interface WorkoutInterval {
  id: string;
  name: string;
  type: IntervalType;
  duration: number;
}
```

## WorkoutRound

```ts
export interface WorkoutRound {
  id: string;
  name: string;
  repeats: number;
  intervals: WorkoutInterval[];
}
```

## Workout

```ts
export interface Workout {
  id: string;
  name: string;
  color: string;

  prepareDuration: number;

  rounds: WorkoutRound[];

  cycles: number;

  restBetweenCycles: number;

  createdAt: string;
  updatedAt: string;
}
```

---

# 8. Estado do Timer

## TimerStatus

```ts
export type TimerStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'finished';
```

## TimerState

```ts
export interface TimerState {
  status: TimerStatus;

  workout: Workout | null;

  currentCycle: number;
  currentRound: number;
  currentRepeat: number;
  currentInterval: number;

  startedAt: number | null;
  endsAt: number | null;

  remainingMs: number;
}
```

---

# 9. Timer Engine

O cronômetro **não deve depender de decremento por segundo**.

Evitar:

```ts
setInterval(() => {
  seconds--;
}, 1000);
```

Usar timestamp absoluto:

```ts
const endsAt = Date.now() + durationMs;
```

Tempo restante:

```ts
const remainingMs = Math.max(
  0,
  endsAt - Date.now()
);
```

A atualização visual pode usar:

- `requestAnimationFrame`; ou
- `setInterval` curto.

A fonte de verdade deve ser sempre `Date.now()`.

---

# 10. Máquina de Estados

Fluxo base:

```text
idle
  ↓
prepare
  ↓
work
  ↓
rest
  ↓
work
  ↓
rest
  ↓
...
  ↓
finished
```

Com suporte a:

```text
running
  ↓
paused
  ↓
running
```

Regras:

- ao finalizar um intervalo, ir automaticamente ao próximo;
- ao finalizar um repeat, incrementar repeat;
- ao finalizar os repeats, ir ao próximo round;
- ao finalizar rounds, incrementar cycle;
- ao finalizar cycle, aplicar restBetweenCycles se houver;
- ao finalizar todos os cycles, marcar treino como finished.

---

# 11. Store Zustand

Sugestão:

```ts
interface TimerStore {
  timer: TimerState;

  start: (workout: Workout) => void;
  pause: () => void;
  resume: () => void;

  next: () => void;
  previous: () => void;

  stop: () => void;
  finish: () => void;

  tick: () => void;
}
```

Separar:

- `timer.store.ts`
- `workout.store.ts`
- `settings.store.ts`

---

# 12. Persistência

Usar LocalStorage.

## Chaves sugeridas

```text
tabata.workouts
tabata.settings
tabata.lastWorkout
```

## Salvar

- treinos;
- configurações;
- volume;
- áudio habilitado;
- último treino utilizado.

---

# 13. Áudio

Alertas mínimos:

- beep nos últimos 3 segundos;
- som de início do Work;
- som de início do Rest;
- som de fim de treino.

Configurações:

- áudio ligado/desligado;
- volume.

No MVP, usar arquivos locais ou Web Audio API.

---

# 14. Vibração

Usar somente quando suportado.

Exemplo:

```ts
navigator.vibrate?.(100);
```

Sugestão:

- últimos 3 segundos: vibração curta;
- mudança de estado: vibração média;
- treino finalizado: vibração dupla.

A ausência de suporte não pode impedir o funcionamento do app.

---

# 15. Componentes

## Timer

- `TimerDisplay`
- `TimerHeader`
- `TimerControls`
- `TimerNext`
- `TimerStats`
- `TimerProgress`

## Workout

- `WorkoutCard`
- `WorkoutEditor`
- `RoundEditor`
- `IntervalEditor`
- `DurationInput`
- `RepeatsInput`
- `CyclesInput`

## Layout

- `AppHeader`
- `PageContainer`
- `BottomActions`

---

# 16. Estrutura de Pastas

```text
src/

  app/

    page.tsx

    workout/

      new/
        page.tsx

      [id]/
        page.tsx

        play/
          page.tsx


  components/

    timer/

      TimerDisplay.tsx
      TimerHeader.tsx
      TimerControls.tsx
      TimerNext.tsx
      TimerStats.tsx
      TimerProgress.tsx

    workout/

      WorkoutCard.tsx
      WorkoutEditor.tsx
      RoundEditor.tsx
      IntervalEditor.tsx

    ui/


  engine/

    timer-engine.ts
    workout-runner.ts


  stores/

    timer.store.ts
    workout.store.ts
    settings.store.ts


  services/

    audio.service.ts
    storage.service.ts


  types/

    workout.ts
    timer.ts


  constants/

    presets.ts
    theme.ts
```

---

# 17. Requisitos Funcionais

## RF001 — Criar treino

O usuário deve conseguir criar um treino personalizado.

## RF002 — Editar treino

O usuário deve conseguir alterar um treino existente.

## RF003 — Excluir treino

O usuário deve conseguir excluir um treino salvo.

## RF004 — Executar treino

O usuário deve conseguir iniciar um treino configurado.

## RF005 — Pausar treino

O usuário deve conseguir pausar o cronômetro.

## RF006 — Continuar treino

O usuário deve conseguir continuar do ponto pausado.

## RF007 — Avançar intervalo

O usuário deve conseguir ir manualmente para o próximo intervalo.

## RF008 — Voltar intervalo

O usuário deve conseguir retornar para o intervalo anterior.

## RF009 — Finalizar treino

O treino deve ser concluído automaticamente após o último intervalo.

## RF010 — Persistir treino

Os treinos devem permanecer salvos ao fechar e abrir novamente o navegador.

## RF011 — Presets

O app deve fornecer presets prontos.

## RF012 — Alertas

O app deve emitir alertas sonoros nas mudanças de etapa.

---

# 18. Requisitos Não Funcionais

## RNF001 — Responsividade

A interface deve funcionar em mobile, tablet e desktop.

## RNF002 — Performance

Mudanças de estado do timer devem ocorrer sem atraso perceptível.

## RNF003 — Precisão

O cronômetro deve utilizar timestamps para evitar drift.

## RNF004 — Offline

O MVP deve funcionar sem backend após carregado.

## RNF005 — Persistência

Treinos devem ser armazenados localmente.

## RNF006 — Acessibilidade

Botões devem possuir labels acessíveis.

## RNF007 — Compatibilidade

Priorizar navegadores modernos:

- Chrome;
- Edge;
- Safari;
- Firefox.

---

# 19. Critérios de Aceite

## Dashboard

- usuário visualiza presets;
- usuário visualiza treinos salvos;
- usuário consegue criar novo treino;
- usuário consegue iniciar treino existente.

## Workout Editor

- usuário informa nome;
- usuário configura intervalos;
- usuário configura repeats;
- usuário configura cycles;
- usuário consegue salvar;
- dados permanecem após reload.

## Timer

- cronômetro inicia corretamente;
- contagem não sofre drift perceptível;
- estados mudam automaticamente;
- background muda de acordo com o tipo;
- próximo estado é exibido;
- pause funciona;
- resume funciona;
- next funciona;
- previous funciona;
- fim do treino é detectado automaticamente.

---

# 20. Fora do Escopo do MVP

Não implementar inicialmente:

- login;
- cadastro;
- backend;
- banco de dados remoto;
- compartilhamento;
- ranking;
- pagamento;
- assinatura;
- IA;
- integração com smartwatch;
- monitoramento cardíaco;
- histórico avançado;
- dashboard analítico;
- social;
- App Store;
- Play Store.

---

# 21. Roadmap

## Fase 1 — MVP Web

- design system;
- dashboard;
- editor;
- timer engine;
- execução de treino;
- áudio;
- LocalStorage;
- responsividade.

## Fase 2 — PWA

- manifest;
- service worker;
- instalação;
- offline;
- tela cheia.

## Fase 3 — Conta

- autenticação;
- Supabase;
- sincronização;
- histórico.

## Fase 4 — Premium

- templates avançados;
- estatísticas;
- voz;
- backups;
- treinos compartilháveis.

---

# 22. Ordem de Implementação

1. criar projeto Next.js;
2. configurar Tailwind;
3. configurar Shadcn/ui;
4. criar design tokens;
5. criar tipos;
6. criar presets;
7. implementar Timer Engine;
8. implementar Zustand;
9. criar tela Timer;
10. criar editor;
11. criar dashboard;
12. implementar LocalStorage;
13. implementar áudio;
14. testar responsividade;
15. preparar PWA.

---

# 23. Primeiro Passo Exato

Criar o projeto:

```bash
npx create-next-app@latest tabata-web
```

Configuração recomendada:

```text
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src/: Yes
App Router: Yes
Turbopack: Yes
```

Instalar dependências:

```bash
cd tabata-web

npm install zustand lucide-react clsx tailwind-merge

npx shadcn@latest init
```

O primeiro desenvolvimento funcional deve ser:

```text
Workout Model
      ↓
Timer Engine
      ↓
Zustand
      ↓
Timer UI
```

O objetivo é validar o núcleo do produto antes de expandir o editor e o dashboard.
