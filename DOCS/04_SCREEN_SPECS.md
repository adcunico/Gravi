# Screen Specifications

## Navigation Structure

### Desktop Sidebar (240px fixed)

**Practice group:**
- 🏠 Dashboard → /dashboard
- 🎙 Communication Studio → /studio
- ⚔️ Debate Arena → /debate
- 📜 Prompts → /prompts

**Review group:**
- 📊 Speech DNA → /analytics
- 📚 Sessions → /sessions

**Tools group:**
- ⚙️ Profile → /profile
- ⬆️ Upgrade → /upgrade

### Mobile Bottom Tab Bar (5 tabs max)
Home · Studio · Debate · More (reveals analytics/sessions/profile/upgrade)

---

## Screen: Dashboard (/dashboard)

**Purpose:** Home screen after login. Shows progress, quick actions, and recent sessions.

**Sections:**
1. Time-of-day greeting — "Good morning / afternoon / evening, [First Name]" (Cormorant Garamond, large)
2. Quick actions (2×2 grid on mobile, 4-card row on desktop):
   - "Enter Communication Studio" → /studio
   - "Enter Debate Arena" → /debate
   - "Use Prompts" → /prompts
   - "Open Analytics" → /analytics
3. Overall Confidence Score — circular gold gauge, 0–100, label beneath, trend note
4. Recent Sessions — last 5: title, mode badge (colour-coded), date, score, replay icon
5. Stat strip — Total sessions · Total minutes · Best score · Current streak
6. Empty state (new users) — illustrated prompt + "Record now →" CTA

---

## Screen: Record & Analyse (/app/record)

**Purpose:** Entry point for speech recording. Three tabs.

**Tab 1 — Upload Audio:**
- Drag-and-drop zone (dashed border)
- "Browse files" link
- Format hint: "Accepts .mp3, .wav, .m4a, .webm, .ogg"
- After selection: filename, size, estimated duration
- Optional topic field: "What is this speech about?"
- "Analyse Speech" gold button

**Tab 2 — Record Live:**
- Microphone permission request (if needed)
- Large circular record button (red idle, gold pulsing when active)
- Full-width animated gold waveform when recording
- Timer (00:00 counting up)
- Optional expandable topic field
- "Stop Recording" button replaces record button

**Tab 3 — Free Practice:**
- Topic prompt card showing one prompt
- "Refresh ↺" link (cycles 20+ prompts, no API)
- Same record UI below prompt card

**Processing overlay (all tabs):**
- Gravi logo small at top
- Step labels cycling: Transcribing → Analysing → Generating feedback
- "This usually takes 15–30 seconds"
- Block navigation during processing (warn on back)

---

## Screen: Session Debrief (/app/session/:id)

**Purpose:** Primary output screen. Most important screen in the product.

**Shared header:**
- Back link
- Session title (Cormorant Garamond)
- Badges row: Mode · Date · Duration
- Debate: Position badge inline

**Speech/Free/Upload/Live mode sections (in order):**
1. Hero gauge — "Confidence Score", 0–100, gold, trend note
2. Speech DNA grid — 2×3 cards (Clarity, Confidence, Persuasion, Vocal Variety, Pacing, Conciseness). Each: score, gold bar, one-line Claude descriptor
3. Filler Words panel — count, severity badge, word breakdown, vs user average
4. Transcript (collapsible) — filler words amber, strong vocab gold
5. AI Coaching — 2-column (✅ What worked / 💛 Improve) + narrative paragraph
6. Vocabulary Upgrade — 5 word cards with save button
7. Audio Playback — scrubber, play/pause, 0.75×/1×/1.25×/1.5× speed
8. Actions — "Practice again with this topic" · "Download transcript (.txt)"

**Teleprompter mode adds Script Adherence section (between DNA grid and Filler Words):**
- % match badge (gold ≥80%, amber 60–79%, red <60%)
- Adherence coaching note from Claude
- Script diff panel (collapsible): green = match, amber = adlib, red = skip, gold = effective adlib
- Insight: note on whether departures helped or hurt

**Debate mode replaces DNA grid with Argument Strength panel:**
- 6 debate metrics: Argument Strength / Logical Flow / Evidence Use / Counterargument Anticipation / Conviction / Rhetorical Strength
- Each: score, gold bar, one-line descriptor
- Delivery panel (collapsible secondary): Clarity · Pacing · Confidence
- Transcript: persuasive phrases highlighted gold
- Debate Coaching tabs: Argument / Delivery / Language
- Persuasive Phrases panel: flagged quotes with rhetorical note
- Actions: "Debate Again — Opposite Position" · "Try a New Topic" · "Download transcript"

---

## Screen: Debate Arena — Entry (/app/debate)

**Purpose:** Entry point for debate mode. Two paths.

**Header:** "Debate Arena" (Cormorant Garamond) + subtitle
**Two entry cards (equal weight):**
- Browse Topics → scrolls to topic library grid
- Suggest a Topic → expands inline AI suggestion panel

**Topic library grid:**
- Search bar + category chips + difficulty filter
- Topic cards: title, category badge, difficulty badge (green/amber/red), FOR/AGAINST summaries, "Start Debate →"
- Free tier: topics 3–10 locked

**AI suggestion panel:**
- Role pre-filled
- Optional subject area field
- "Generate Topics" → 3 result cards with ✨ badge

---

## Screen: Position Selection (/app/debate/:topicId)

**Purpose:** Choose position and format before recording.

- Back link
- Topic title (Cormorant Garamond, large)
- 3 position cards (full width, stacked):
  - FOR (blue left border): badge + "Argue in favour" + FOR summary
  - AGAINST (red left border): badge + "Argue against" + AGAINST summary
  - NEUTRAL (gold left border): badge + "Present both sides" + description
- Format chips: Impromptu 2min / Structured 5min / Extended 10min (Pro)
- "Begin Debate →" CTA (disabled until both selected)

---

## Screen: Debate Recording

**Purpose:** Full-screen recording environment.

- No nav/sidebar
- Top bar: back arrow (with confirm modal) · topic (truncated) · position badge
- Argument prompts (ghost text panel, dismissible): 4 structural hints
- Timer: counts up / target shown muted
- Record button (centre, pulsing when active)
- Gold waveform (visible when recording)
- "Stop & Analyse" button (appears after recording starts)
- 3-second countdown before recording begins

---

## Screen: Teleprompter Setup (/app/teleprompter)

**Purpose:** Configure and load script before recording.

**Step 1 — Script Selection tabs:**
- Load from Library · Paste Text · Generate Script
- Live word count + estimated speaking time on paste/generate
- "Continue to Setup →" CTA

**Step 2 — Setup panel:**
- Script preview (right/above)
- Font size: Small / Medium / Large
- Scroll speed: Slow / Medium / Fast (labelled with WPM targets)
- Scroll mode: Auto / Manual
- Read-through mode checkbox
- Mirror text toggle
- "Start Recording →" CTA

---

## Screen: Teleprompter Recording

**Purpose:** Full-screen teleprompter with simultaneous audio recording.

- No nav/sidebar
- Status bar: elapsed / target time
- Speed controls (▲/▼) top-right
- Script area: current section = 100% white, previous = 60% opacity, upcoming = 70% opacity
- Record indicator: red dot + timer + mini waveform (bottom-right corner)
- "Stop & Analyse" button (bottom-centre, appears after 3 seconds)
- Auto-scroll: pauses on tap, resumes on tap
- Manual scroll: spacebar / arrows / tap half-screen

---

## Screen: Interview Setup (/app/interview)

**Purpose:** Configure interview session parameters.

- Header: "Interview Practice" (Cormorant Garamond) + purple badge
- Single scrollable form:
  - Interview Type chips: Behavioural / Competency / Strength / Mixed
  - Role Level chips: Junior / Mid / Senior / Executive / Board
  - Industry dropdown (optional)
  - Focus Area chips (optional)
  - Question count chips: 3 / 5 / 8
- "Generate Questions & Start →" gold CTA

---

## Screen: Interview Session (/app/interview/:sessionId)

**Purpose:** Sequential question-and-answer recording flow.

- No sidebar/nav — full focus
- Progress indicator: "Question N of N" pill (top)
- Question text (Cormorant Garamond, large)
- "What's being tested" expandable (muted)
- Suggested duration note
- Think time option: "Take 30 seconds to think" or "Skip — record now"
- Purple record button, gold waveform, live timer
- "Done — Next Question →" (appears after 20s) / "Done — Finish Interview →" (last)
- 3-second transition screen between questions: "Answer saved ✓ · Next: Q N of N"
- End: processing overlay → redirect to debrief

---

## Screen: Interview Debrief (/app/interview/:sessionId/debrief)

**Purpose:** Comprehensive multi-answer debrief.

- Header: "Interview Debrief" (Cormorant Garamond) + purple badge + date + total duration
- Overall score gauge (purple gradient) + strongest/weakest answer callouts
- Aggregate: 3 strengths + 3 improvements + narrative paragraph
- Per-answer cards (collapsible, first expanded):
  - Header: question text + score badge
  - Score mini-bars: STAR / Relevance / Specificity / Confidence / Conciseness
  - Filler words count + breakdown
  - Transcript (collapsible, filler in amber)
  - AI feedback: 2 columns
  - Model Answer Guide: gold left border card with structural coaching
  - Audio playback
- Bottom actions: practice same questions / change settings / download transcript
