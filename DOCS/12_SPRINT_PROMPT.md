# Sprint Prompt — Gravi Alignment Sprint

## Objective
Align the Gravi codebase and documentation with the current product vision while only applying changes that can be delivered cleanly and seamlessly.

## Current workspace state
- The app is built with Vite + React + TypeScript and uses Supabase for auth, storage, and edge functions.
- The current route structure is mostly `/studio/*` for recording workflows and `/debate/*` for debate workflows.
- A teleprompter recording flow exists in `src/pages/studio/TeleprompterSession.tsx` and a debrief page exists in `src/pages/studio/Debrief.tsx`.
- Debate flow is implemented in `src/pages/Debate.tsx`, including topic browsing and AI-generated topics via `supabase/functions/generate-topics`.
- Existing Supabase edge functions are:
  - `transcribe-audio`
  - `generate-script`
  - `generate-topics`
  - `create-stripe-checkout`
  - `stripe-webhook`
- The current transcription pipeline uses OpenAI Whisper in `transcribe-audio`, not Deepgram.
- The current app does not include an interview practice workflow or interview-related edge functions.
- The current app does not include dedicated `analyse-debate` or `analyse-teleprompter` edge functions.

## Sprint goal
Build the missing product capabilities that make the current app match the new Gravi plan and documentation, while avoiding changes that cannot be supported end-to-end in this sprint.

## What must be delivered
1. A clear alignment between docs and code. Either:
   - update documentation to reflect the current working route and feature structure, or
   - refactor the app routes and pages to match the new `/app/...` naming and V1 practice-mode structure.
2. Guarantee the Debate Arena path is seamless:
   - keep `/debate` entry and `/debate/session` recording flow
   - support AI topic generation via `generate-topics`
   - add `analyse-debate` if required to produce debate-specific coaching analysis
3. Guarantee the Teleprompter path is seamless:
   - keep the teleprompter recording flow in `src/pages/studio/TeleprompterSession.tsx`
   - add a dedicated analysis edge function `analyse-teleprompter` or clearly document that teleprompter uses the existing speech analyser
   - implement script adherence diff support if the product plan requires it
4. Add the Interview Practice workflow only if it can be delivered end-to-end this sprint:
   - new routes and pages for interview setup, session, and debrief
   - edge functions: `generate-interview-questions`, `analyse-interview-answer`, `generate-aggregate-interview-feedback`
   - session storage of answers and audio uploads per question
5. Keep Stripe billing and subscription handling working with the current `create-stripe-checkout` and `stripe-webhook` edge functions.
6. If existing files or docs do not align to this delivery plan, overwrite or remove them rather than leaving stale content.

## Technical constraints
- Do not expose secret API keys in client-side code.
- Do not implement video features in V1.
- Use the existing Supabase edge functions pattern and current route structure unless a rewrite is part of this sprint.
- Preserve the user-facing product goal: audio-first coaching with Debate, Teleprompter, Record & Analyse, and Interview modes.

## Sprint checklist
- [ ] Confirm current routes and docs are aligned or update them.
- [ ] Validate the Debate flow works end-to-end with topic selection, position selection, recording, and debrief navigation.
- [ ] Validate the Teleprompter flow works end-to-end with script load, recording, and debrief.
- [ ] Build or define the missing Interview Practice flow if the sprint can include it.
- [ ] Add or revise analysis edge functions only if they directly support the new product plan.
- [ ] Remove or overwrite stale documentation and unused route references.

## Notes for execution
- Treat `src/pages/studio/*` as the current core recording/studio area.
- Treat `src/pages/Debate.tsx` as the current Debate Arena entry point.
- Do not assume `analyse-speech` exists unless it is added as part of the sprint.
- If implementing interview practice, use `profiles` as the user table and store subscription state in `profiles.subscription_status`.
