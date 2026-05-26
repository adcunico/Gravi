# Development Start Prompt — Gravi

## Goal
Start a new development session for the Gravi app using the current codebase state. The immediate objective is to build and stabilize the live speech coaching and debate experiences, while aligning docs and implementation to the actual workspace.

## Current app state
- Frontend: Vite + React 18 + TypeScript
- Styling: Tailwind CSS
- Auth/Data: Supabase Auth, PostgreSQL, storage, edge functions
- Existing frontend routes:
  - `/`
  - `/signin`
  - `/signup`
  - `/forgot-password`
  - `/dashboard`
  - `/studio`
  - `/studio/upload`
  - `/studio/generate`
  - `/studio/library`
  - `/studio/debrief/:sessionId`
  - `/studio/session`
  - `/debate`
  - `/debate/debrief/:sessionId`
  - `/debate/session`
  - `/prompts`
  - `/analytics`
  - `/sessions`
  - `/sessions/:sessionId`
  - `/profile`
  - `/upgrade`
- Session and recording flow is implemented in `src/pages/studio/TeleprompterSession.tsx`
- Debrief and replay flow is implemented in `src/pages/studio/Debrief.tsx`
- Debate entry and topic selection live in `src/pages/Debate.tsx`
- `src/pages/studio/TeleprompterSession.tsx` is reused for both `/studio/session` and `/debate/session`
- `src/pages/studio/Debrief.tsx` is reused for `/studio/debrief/:sessionId`, `/debate/debrief/:sessionId`, and `/sessions/:sessionId`
- Existing Supabase edge functions:
  - `transcribe-audio` (OpenAI Whisper)
  - `analyse-speech`
  - `generate-script`
  - `generate-topics`
  - `create-stripe-checkout`
  - `stripe-webhook`
- Debate topic generation uses `generate-topics` from the edge function layer
- Interview Practice is a future product vision, not implemented in this repo yet

## Development priorities
1. Stabilize the current live experience
   - Ensure `/studio` recording and debrief workflows are reliable and documented
   - Confirm `/debate` topic selection and `/debate/session` recording path works end-to-end
   - Keep the current session storage and navigation pattern intact
2. Align documentation to the actual app
   - Keep docs truthful to `/studio/*` and `/debate/*` routes
   - Remove stale references to `/app/*`, Deepgram, and interview features that do not exist yet
3. Preserve and improve the AI integration
   - Maintain Whisper transcription in `transcribe-audio`
   - Keep Claude and edge function analysis via `analyse-speech`
   - Use `generate-topics` for AI topic suggestions and `generate-script` for script generation
4. Hold interview practice as future scope
   - Do not implement interview mode unless the sprint explicitly includes it
   - Treat interview workflow as a later phase and document it accordingly

## What to build first
- Confirm the current `/studio` entry and recording flow works with script selection and analysis
- Confirm `/studio/debrief/:sessionId` renders session analysis properly for all studio modes
- Confirm `/debate` entry, topic browse, AI topic generation, and `/debate/session` launch works
- Verify reuse of `TeleprompterSession.tsx` for both studio and debate sessions
- Ensure the current billing flow remains intact via `create-stripe-checkout` and `stripe-webhook`
- Update docs to reflect actual behavior and code architecture rather than the earlier aspirational `/app` route plan

## Do not do yet
- Do not add `/app/*` routes or rename the current router unless it is part of a deliberate refactor plan
- Do not add Deepgram integration to the current sprint
- Do not add interview question generation, interview answer analysis, or interview-specific tables unless approved
- Do not build video recording or video upload

## Recommended first tasks
- Audit `src/App.tsx`, `src/pages/studio/TeleprompterSession.tsx`, `src/pages/studio/Debrief.tsx`, and `src/pages/Debate.tsx`
- Audit `supabase/functions/transcribe-audio/index.ts` and related edge functions for actual provider usage
- Execute and verify the current Supabase function calls in `src/lib/supabase.ts`
- Update `DOCS/00_README.md`, `DOCS/01_PRODUCT_OVERVIEW.md`, `DOCS/03_USER_FLOWS.md`, `DOCS/04_SCREEN_SPECS.md`, `DOCS/06_TECH_STACK.md`, and `DOCS/11_CONSTRAINTS_AND_DECISIONS.md` to reflect true implementation state

## Success criteria for the new session
- The app runs and authenticates successfully
- `/studio` and `/debate` flows are functional and stable
- The docs match the codebase, not the old spec
- The development prompt is based on the actual current state of the repository

## Notes for the developer
- Use the current route names in the codebase and avoid introducing mismatched route concepts
- Keep the current Supabase edge function names and existing feature branches
- If a design or feature in the docs does not exist, mark it as future scope rather than forcing it into this session
- Preserve the existing CLI and environment variable conventions for Supabase, OpenAI, Anthropic, and Stripe
