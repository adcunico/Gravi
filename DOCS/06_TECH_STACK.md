# Tech Stack

## Overview

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Vite + React 18 + TypeScript | Fast builds, excellent DX, strong typing |
| Styling | Tailwind CSS | Utility-first, consistent design tokens |
| Charts | Recharts | React-native charting, good Radial/Line chart support |
| Backend/DB | Supabase (PostgreSQL) | Auth + DB + Storage + Edge Functions in one platform |
| Auth | Supabase Auth | Email/password + Google OAuth, built-in RLS integration |
| Transcription | OpenAI Whisper | Current transcription service in the codebase. Returns transcript text, duration, and language. |
| AI Analysis | Anthropic Claude API (claude-sonnet-4-5 or latest) | Superior instruction following for structured JSON output |
| Payments | Stripe | Industry standard, excellent webhook support |
| Deployment | Vercel | Optimal for Vite/React, easy environment variable management |

---

## Frontend Details

**Framework:** Vite + React 18 + TypeScript
- Vite for fast hot module replacement during development
- React 18 for concurrent rendering
- TypeScript for type safety across the full codebase

**Styling:** Tailwind CSS
- CSS variables for design tokens (see 08_DESIGN_SYSTEM.md)
- No CSS-in-JS — Tailwind only

**Key packages:**
- `@supabase/supabase-js` — Supabase client
- `recharts` — analytics charts (RadialBarChart for score gauges, LineChart for trends)
- `react-hot-toast` — toast notifications
- `react-router-dom` v6 — client-side routing
- `wavesurfer.js` or `Web Audio API` — waveform visualisation during recording
- `diff` or custom LCS implementation — script adherence diff for teleprompter

**Audio recording:**
- Browser `MediaRecorder API` — captures audio in supported formats
- Fallback: check browser support, show graceful error if not supported
- Output format: `.webm` (Chrome/Firefox) or `.mp4` (Safari) — both accepted by the current server-side transcription workflow

---

## Backend Details

**Supabase Edge Functions (Deno runtime):**
All API calls are made server-side via edge functions. API keys are never exposed to the client.

| Edge Function | Trigger | Purpose |
|---|---|---|
| transcribe-audio | HTTP POST | OpenAI Whisper transcription |
| analyse-speech | HTTP POST | Claude speech analysis → JSON |
| generate-script | HTTP POST | Claude script writing |
| generate-topics | HTTP POST | Claude topic suggestions |
| create-stripe-checkout | HTTP POST | Stripe checkout session |
| stripe-webhook | HTTP POST (Stripe) | Handle payment events, update subscription |

> Note: Additional analysis edge functions such as `analyse-debate`, `analyse-teleprompter`, and interview-specific functions are part of the broader product vision but are not implemented in the current codebase.

---

## Current transcription service

The current codebase uses OpenAI Whisper for audio transcription. Whisper returns transcript text, duration, and language. The app then sends the transcript to Claude for analysis.

Future improvements may add Deepgram for richer audio metadata such as word-level timestamps, pause detection, and filler word counts.

**OpenAI model to use:** `whisper-1`

---

## Environment Variables Required

```
SUPABASE_URL=
SUPABASE_ANON_KEY=           # client-safe
SUPABASE_SERVICE_ROLE_KEY=   # server-only (edge functions)
OPENAI_API_KEY=              # server-only (edge functions)
ANTHROPIC_API_KEY=           # server-only (edge functions)
STRIPE_SECRET_KEY=           # server-only (edge functions)
STRIPE_WEBHOOK_SECRET=       # server-only (edge functions)
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
```

Never expose `SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `STRIPE_SECRET_KEY` in client-side code.
