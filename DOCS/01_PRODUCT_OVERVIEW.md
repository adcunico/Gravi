# Product Overview

## Vision

Gravi is an AI-powered communication coach built for professionals who need to speak with authority — in board rooms, media interviews, job interviews, investor pitches, and keynote stages. It gives users a private, judgment-free space to practise, receive detailed AI coaching, and track improvement over time.

The product ethos: clean, minimal, sophisticated. No gamification. No streaks. No cartoon mascots. The design and tone should feel like a premium executive coaching service, not a language-learning app.

**Comparable products:** Calm (tone), LinkedIn (professional context), a high-end SaaS tool (design standard).

---

## The Four Practice Modes

### 1. Record & Analyse
The core mode. Users record their voice or upload an audio file on any topic. The AI transcribes, scores, and delivers a comprehensive Speech DNA debrief covering six metrics: Clarity, Confidence, Persuasion, Vocal Variety, Pacing, and Conciseness.

Three sub-modes:
- **Upload Audio** — upload a pre-recorded file
- **Record Live** — record directly in the browser
- **Free Practice** — record against a rotating AI-generated topic prompt

### 2. Debate Arena
Users select a debate topic from a curated library (or request an AI-suggested topic), choose their position (FOR / AGAINST / NEUTRAL), and record their argument. The AI evaluates argument quality, logical structure, evidence use, counterargument anticipation, conviction, and rhetorical strength — with three tabs of coaching feedback (Argument, Delivery, Language).

Three formats:
- **Impromptu** — 2 minutes
- **Structured Argument** — 5 minutes
- **Extended Case** — 10 minutes (Pro only)

### 3. Teleprompter
Users load or generate a script, configure scroll speed and font size, then record themselves reading it. The AI analyses delivery and also performs a script adherence diff — showing what was read as written, what was ad-libbed, and what was skipped — with coaching on whether departures helped or hurt.

### 4. Interview Practice
Planned for future releases. The current codebase does not yet include this mode.

---

## Current implementation status

The current app ships the core speech coaching experience through the Communication Studio and Debate Arena.

- Speech practice is available through `/studio` workflows: upload your script, generate a script, or choose a curated prompt.
- Teleprompter-style recording sessions are supported via `/studio/session`.
- Debate practice is available through `/debate`, including curated topics and AI-generated topic suggestions.

Interview Practice and its interview-specific analysis flow are part of the product vision but are not implemented in the current codebase.

---

## Target Users

**Primary:**
- Executives and senior leaders preparing for board presentations, media appearances, or stakeholder meetings
- Presenters and public speakers rehearsing keynotes or conference talks
- Sales and BD professionals refining pitches and client conversations

**Secondary:**
- Media professionals and journalists preparing for on-camera or on-air delivery
- Legal professionals preparing for advocacy, depositions, or tribunal appearances
- Professionals actively interviewing for senior roles

---

## Positioning

Gravi competes with Orai and Yoodli in the speech coaching category but differentiates on:

1. **Professional positioning** — designed for senior professionals, not general audiences
2. **Four distinct modes** — no competitor combines speech coaching, debate practice, teleprompter rehearsal, and interview prep in one product
3. **Whisper transcription** — the current implementation uses OpenAI Whisper for audio transcription; richer audio metadata is a future enhancement
4. **Script adherence analysis** — unique to the teleprompter mode; no competitor offers this
5. **Interview coaching with STAR scoring** — structured feedback on answer frameworks

---

## Business Model

- **Free tier:** 3 sessions total, limited features
- **Pro tier:** £9.99/month or £89/year — unlimited sessions, all modes, full history
- **Future:** Teams tier for corporate comms training
