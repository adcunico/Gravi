# Gravi — Product Documentation

**Version:** 1.0  
**Last updated:** 26 May 2026  
**Status:** V1 specification — ready for development

---

## What is Gravi?

Gravi is a premium AI-powered communication coaching platform for professionals. It helps executives, presenters, sales professionals, legal practitioners, and media professionals practise and improve their spoken communication through four distinct practice modes, AI-powered analysis, and a rich coaching debrief.

**Tagline:** *Speak with authority. Think on your feet. Sound like yourself — only better.*

---

## How to use this documentation

| File | Purpose |
|---|---|
| 01_PRODUCT_OVERVIEW.md | Vision, modes, target users, positioning |
| 02_USER_PERSONAS.md | Detailed personas for each user type |
| 03_USER_FLOWS.md | Step-by-step user journeys for every mode |
| 04_SCREEN_SPECS.md | Detailed specification for every screen |
| 05_DATABASE_SCHEMA.md | Complete Supabase/PostgreSQL schema with SQL |
| 06_TECH_STACK.md | Full technology choices with rationale |
| 07_API_CONTRACTS.md | All edge function inputs, outputs, and Claude prompts |
| 08_DESIGN_SYSTEM.md | Colours, typography, components, principles |
| 09_SUBSCRIPTION_AND_PRICING.md | Free vs Pro tiers, Stripe setup, paywall logic |
| 10_IMPLEMENTATION_PHASES.md | Phased build order, 6 phases |
| 11_CONSTRAINTS_AND_DECISIONS.md | Critical constraints, V1 scope decisions, rationale |

---

## V1 Scope Statement

**V1 is audio only.** No video recording, no video upload, no camera access. Video is explicitly a future feature and must not be built in V1.

The current build implements:
1. Record & Analyse
2. Debate Arena
3. Teleprompter

Interview Practice is part of the long-term product vision but is not implemented in this codebase yet.

The current execution pipeline is:
- Audio capture / upload
- `supabase/functions/transcribe-audio` → OpenAI Whisper transcription
- `analyse-speech` edge function → Claude analysis
- Save session and redirect to debrief

Current route structure in the app:
`/dashboard`, `/studio`, `/studio/upload`, `/studio/generate`, `/studio/library`, `/studio/session`, `/studio/debrief/:sessionId`, `/debate`, `/debate/session`, `/debate/debrief/:sessionId`, `/prompts`, `/analytics`, `/sessions`, `/sessions/:sessionId`, `/profile`, `/upgrade`.
