# Mziza — mziza-app

Turns a Kenyan CBC report card into plain-language guidance for a parent, plus one
home activity built from items already in the house. Kiswahili and English side by
side, working offline by default.

Implements plan `2026-07-25-002-mzazi-coach-unified-processor`.

## Running it

```bash
npm install
cp .env.example .env.local   # optional; the app runs fully without a key
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Vitest suite (37 tests) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint via `next lint` |

## Architecture

Every input mode funnels through one entry point, `UnifiedProcessor.process`.

```
Client (image / text / kicd / ussd)
        |
   POST /api/process
        |
  UnifiedProcessor.process
        |
        +-- ussd  -> handleUSSDSession                    -> stateless menu reply
        +-- kicd  -> resolveKicdPrompt                    -> curriculum activity
        +-- image -> runOcr (Tesseract) ---+
        +-- text  -------------------------+-> extractBandsFromText
                                              -> generateTranslationsWithClaude
                                                   (falls back to offline bank)
                                              -> resolveKicdPrompt
                                              -> speech payload (Web Speech)
```

| File | Responsibility |
| --- | --- |
| `lib/types.ts` | Shared contracts for every stage |
| `lib/ocr.ts` | Tesseract runner, band regex extraction, band normalisation |
| `lib/offline-bank.ts` | Pre-written guidance, 6 subjects × 4 bands |
| `lib/claude.ts` | Anthropic call, reply validation, offline fallback |
| `lib/ussd.ts` | Stateless USSD menu machine |
| `lib/kicd-prompts.json` | Seed KICD curriculum prompts, grades 4-9 |
| `lib/processor.ts` | Stage orchestration for all four modes |
| `app/api/process/route.ts` | Single HTTP entry point (Node runtime) |
| `components/ResultsPanel.tsx` | Result rendering and Web Speech playback |

## Offline behaviour

Offline is the normal path, not the failure path. The app serves the offline bank
when any of these is true:

- `CLAUDE_API_KEY` is unset
- the API call fails or returns a non-2xx
- the call exceeds `CLAUDE_TIMEOUT_MS` (default 12s)
- the reply parses as JSON but fails shape validation

The UI states which source produced the guidance rather than hiding it.

## Environment

| Variable | Required | Default |
| --- | --- | --- |
| `CLAUDE_API_KEY` | No | unset, forces offline bank |
| `CLAUDE_MODEL` | No | `claude-3-5-sonnet-20241022` |
| `CLAUDE_TIMEOUT_MS` | No | `12000` |

## Data accuracy

`lib/kicd-prompts.json` is seed data written to exercise the resolver. Strands,
sub-strands and specific learning outcomes need checking against the current KICD
design before this reaches parents. Swahili copy in `lib/offline-bank.ts` should
get a native-speaker review pass for register and regional wording.
