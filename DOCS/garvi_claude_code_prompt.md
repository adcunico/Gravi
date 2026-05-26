# GARVI — MASTER CLAUDE CODE PROMPT (v3)
**AI-powered communication coach for professionals**

> **V1 scope: AUDIO ONLY.** No video recording, no video upload, no camera access in this version. Video is a future feature — do not build it.

---

## PRODUCT VISION

Build a premium, mobile-responsive web app called **Garvi**. AI-powered public speaking and communication coach for professionals — executives, presenters, media personalities, communication leaders. Clean, minimal, sophisticated. No gamification, no cartoon mascots, no streaks. Think *Calm meets LinkedIn meets a high-end SaaS tool*.

**Tagline:** *Speak with authority. Think on your feet. Sound like yourself — only better.*

**Four core practice modes:**
1. **Record & Analyse** — record or upload audio → AI coaching debrief
2. **Debate Arena** — choose a topic, pick a side (FOR / AGAINST), argue it → AI debate coaching debrief
3. **Teleprompter** — load or generate a script → read while recording audio → script adherence + speech debrief
4. **Interview Practice** — choose interview type and level → answer AI-generated questions sequentially → per-answer + aggregate debrief

All four modes share the same backend pipeline: audio → transcription (Deepgram) → AI analysis (Claude) → debrief screen. The differences are in the setup flow, the Claude prompt, and the debrief rendering.

---

## TECH STACK

- **Vite + React** (TypeScript)
- **Supabase** — auth, database, storage, edge functions
- **Stripe** — subscriptions
- **Deepgram API** — speech-to-text transcription with word timestamps, pause detection, WPM, and filler word detection (replaces OpenAI Whisper — gives real audio metadata for accurate pacing and filler word scores)
- **Anthropic Claude API** — analysis, script generation, debate coaching, interview question generation
- **Tailwind CSS**
- **Recharts** — analytics charts
- **Vercel** — deployment

### Why Deepgram over Whisper
Deepgram returns the transcript plus structured audio metadata: word-level timestamps, speaking pace (WPM), pause durations and placement, and automatic filler word detection (um, uh, like, you know). This means Pacing, Vocal Variety, and Filler Word scores are grounded in real audio data, not inferred from text alone. Claude then receives both the transcript and this metadata to produce far more accurate coaching. Same edge function architecture as Whisper — just a different API call.

---

## DESIGN SYSTEM

### Colour Palette
```
--color-bg:              #0D0F14   /* deep near-black */
--color-surface:         #141720   /* card surface */
--color-border:          #1E2230   /* subtle borders */
--color-gold:            #C9A84C   /* primary accent */
--color-gold-light:      #E2C97E   /* hover */
--color-text:            #F4F4F5   /* primary text */
--color-muted:           #8B8FA8   /* secondary text */
--color-success:         #4CAF7C   /* positive */
--color-error:           #E05C5C   /* negative */
--color-debate-for:      #4C8FC9   /* blue — FOR position */
--color-debate-against:  #C94C4C   /* red — AGAINST position */
--color-interview:       #8B6FCB   /* purple — interview mode */
```

### Typography
- **Display/headings:** Cormorant Garamond (Google Fonts)
- **Body/UI:** DM Sans (Google Fonts)

### Principles
- `1px solid var(--color-border)` card borders, `border-radius: 12px`
- No heavy shadows — use border contrast
- Generous whitespace, mobile-first
- Gold for primary CTAs and key metrics
- Blue/red accent system exclusive to Debate Arena (FOR = blue, AGAINST = red)
- Purple accent exclusive to Interview Practice mode
- Animated gold waveform while recording
- Skeleton loaders for all async states (never spinners alone)
- Page transitions: 150ms fade

---

## SUPABASE DATABASE SCHEMA

```sql
-- Users
create table users (
  id uuid primary key references auth.users(id),
  email text unique not null,
  full_name text,
  role text check (role in ('executive','presenter','media','sales','legal','other')),
  language text default 'en',
  subscription_status text default 'free' check (subscription_status in ('free','pro')),
  stripe_customer_id text,
  onboarding_complete boolean default false,
  goals_json jsonb,
  created_at timestamptz default now()
);

-- Sessions (covers all four modes)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  mode text check (mode in ('upload','live','free','teleprompter','debate','interview')),
  topic text,
  transcript text,
  script_used text,
  duration_seconds int,
  audio_url text,
  language text default 'en',
  -- Deepgram metadata stored as JSON
  audio_metadata_json jsonb,      -- { wpm, pause_count, pause_durations, filler_words }
  -- Debate-specific
  debate_position text check (debate_position in ('for','against','neutral') or debate_position is null),
  debate_topic_id uuid,
  -- Teleprompter-specific
  script_adherence_pct int,       -- % of script words spoken (0-100), null for non-teleprompter
  -- Interview-specific
  interview_session_id uuid,      -- FK to interview_sessions, null for non-interview modes
  created_at timestamptz default now()
);

-- Analysis (shared + mode-specific nullable fields)
create table analysis (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,

  -- Core metrics (all modes except interview, which has per-answer analysis)
  clarity_score int,
  confidence_score int,
  persuasion_score int,
  vocal_variety_score int,
  pacing_score int,
  conciseness_score int,
  overall_score int,
  filler_word_count int,
  filler_words_json jsonb,        -- { "um": 4, "uh": 2, "like": 6 }
  strengths_json jsonb,
  improvements_json jsonb,
  suggested_words_json jsonb,
  full_feedback text,

  -- Teleprompter-specific (null for other modes)
  script_adherence_pct int,
  script_diff_json jsonb,         -- highlighted diff between script and transcript
  adherence_feedback text,        -- coaching note on where/why they departed from script

  -- Debate-specific (null for non-debate modes)
  argument_strength_score int,
  logical_flow_score int,
  evidence_use_score int,
  counterargument_score int,
  conviction_score int,
  rhetorical_strength_score int,
  argument_feedback text,
  delivery_feedback text,
  language_feedback text,
  persuasive_phrases_json jsonb,

  created_at timestamptz default now()
);

-- Scripts
create table scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  content text not null,
  occasion text,
  language text default 'en',
  is_favourite boolean default false,
  created_at timestamptz default now()
);

-- Debate topics (seed data, publicly readable, no RLS needed)
create table debate_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text check (category in ('business','technology','leadership','ethics','economics','society','innovation','philosophy','startups')),
  difficulty text check (difficulty in ('beginner','intermediate','advanced')),
  for_position_summary text,
  against_position_summary text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Interview sessions (one per interview practice attempt)
create table interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  interview_type text check (interview_type in ('behavioural','competency','strength','mixed')),
  role_level text check (role_level in ('junior','mid','senior','executive','board')),
  industry text,
  focus_area text,
  question_count int,
  questions_json jsonb,           -- array of { question_text, what_interviewer_tests }
  overall_score int,
  strongest_answer_index int,
  weakest_answer_index int,
  aggregate_feedback text,
  top_improvements_json jsonb,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Interview answers (one row per question answered)
create table interview_answers (
  id uuid primary key default gen_random_uuid(),
  interview_session_id uuid references interview_sessions(id) on delete cascade,
  question_index int not null,    -- 0-based index into questions_json
  question_text text,
  transcript text,
  audio_url text,
  duration_seconds int,
  audio_metadata_json jsonb,
  -- Per-answer scores
  overall_score int,
  star_structure_score int,       -- Situation / Task / Action / Result
  answer_relevance_score int,
  specificity_score int,
  confidence_score int,
  conciseness_score int,
  filler_word_count int,
  filler_words_json jsonb,
  strengths_json jsonb,
  improvements_json jsonb,
  model_answer_guide text,        -- Claude's structural guide for a strong answer
  created_at timestamptz default now()
);

-- Vocabulary
create table vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  word text not null,
  definition text,
  example text,
  source_session_id uuid references sessions(id),
  created_at timestamptz default now()
);

-- RLS
alter table users enable row level security;
alter table sessions enable row level security;
alter table analysis enable row level security;
alter table scripts enable row level security;
alter table vocabulary enable row level security;
alter table interview_sessions enable row level security;
alter table interview_answers enable row level security;

create policy "own users" on users for all using (auth.uid() = id);
create policy "own sessions" on sessions for all using (auth.uid() = user_id);
create policy "own analysis" on analysis for all using (
  session_id in (select id from sessions where user_id = auth.uid()));
create policy "own scripts" on scripts for all using (auth.uid() = user_id);
create policy "own vocabulary" on vocabulary for all using (auth.uid() = user_id);
create policy "own interview_sessions" on interview_sessions for all using (auth.uid() = user_id);
create policy "own interview_answers" on interview_answers for all using (
  interview_session_id in (select id from interview_sessions where user_id = auth.uid()));
```

### Seed debate topics
```sql
insert into debate_topics (title, category, difficulty, for_position_summary, against_position_summary) values
('AI will eliminate more jobs than it creates', 'technology', 'intermediate',
 'Automation displaces workers faster than new roles emerge',
 'Technology historically creates more jobs than it destroys'),
('Remote work makes teams less effective', 'business', 'beginner',
 'Collaboration, culture, and innovation suffer without physical proximity',
 'Autonomy and reduced commuting improve productivity and retention'),
('Four-day work weeks should be standard', 'business', 'beginner',
 'Same output in less time improves wellbeing and attracts talent',
 'Many industries and roles cannot function on compressed schedules'),
('Social media does more harm than good', 'society', 'beginner',
 'Mental health damage and misinformation outweigh connectivity benefits',
 'Access to community, information, and economic opportunity is transformative'),
('Companies have a duty to prioritise ESG over profit', 'ethics', 'intermediate',
 'Long-term sustainability requires internalising social and environmental costs',
 'Profit maximisation within the law produces the best social outcomes'),
('Crypto will transform global finance', 'technology', 'advanced',
 'Decentralisation and programmable money will reshape financial systems',
 'Volatility, regulation risk, and energy costs prevent mainstream adoption'),
('Universities are no longer worth the investment', 'society', 'intermediate',
 'Alternatives like bootcamps deliver better ROI for most careers',
 'Network, signalling, and depth of university education cannot be replicated'),
('Leaders are born, not made', 'leadership', 'beginner',
 'Innate traits like charisma and vision cannot be fully taught',
 'Leadership is a skill set developed through experience and coaching'),
('Startups should prioritise growth over profitability', 'startups', 'intermediate',
 'Capturing market share early creates defensible moats that justify short-term losses',
 'Growth at all costs destroys value and leaves companies exposed in downturns'),
('Open borders would benefit the global economy', 'economics', 'advanced',
 'Labour mobility reduces inequality and corrects demographic imbalances',
 'Social cohesion and public services face unsustainable pressure without controls');
```

---

## AUTHENTICATION

- Supabase Auth: email/password + Google OAuth
- All `/app/*` routes protected — unauthenticated → `/login`
- On first login → onboarding flow
- Create row in `users` table on signup via Supabase Auth trigger or client-side insert

---

## APP ROUTES

```
/                            Landing page (public)
/login                       Login / signup
/app                         Dashboard
/app/record                  Record & Analyse
/app/debate                  Debate Arena — entry + topic library
/app/debate/:topicId         Debate session (position select + record)
/app/teleprompter            Teleprompter — setup + record
/app/interview               Interview Practice — setup
/app/interview/:sessionId    Interview session (active Q&A recording)
/app/interview/:sessionId/debrief   Interview aggregate debrief
/app/scripts                 Script library
/app/scripts/new             Generate / create script
/app/analytics               Speech DNA
/app/session/:id             Session debrief (speech, debate, teleprompter modes)
/app/vocabulary              Vocabulary library
/app/settings                Settings
/app/upgrade                 Pricing / upgrade
```

---

## ONBOARDING (3 steps, first login only)

### Step 1 — Welcome
Full-screen panel. Garvi logo centred. 
- Headline (Cormorant Garamond): *"Your AI-powered communication coach"*
- Subtext (DM Sans): *"Practice. Analyse. Improve. Speak with confidence."*
- Single CTA: "Let's get started →" (gold button)

### Step 2 — Your Role
- Question: *"What best describes your work?"*
- Six option cards (single select, 2×3 grid):
  - 🏢 Executive / Senior Leader
  - 🎤 Presenter / Speaker
  - 📺 Media / Journalist / Broadcaster
  - 💼 Sales / Business Development
  - ⚖️ Legal / Policy Professional
  - 👤 Other Professional
- "Next →" CTA, disabled until selection made

### Step 3 — Your Goals
- Question: *"What would you like to improve most?"*
- Eight option chips (multi-select, pick up to 2):
  - Reduce filler words
  - Speak more confidently
  - Improve clarity and structure
  - Expand professional vocabulary
  - Improve pacing and delivery
  - Sound more persuasive
  - Sharpen argumentation and debate skills
  - Prepare for job interviews
- "Get started →" CTA

On completion: save `role` and `goals_json` to `users` table, set `onboarding_complete = true`, redirect to `/app`.

---

## DASHBOARD (/app)

**Layout:** Sidebar nav (desktop, 240px fixed) | Bottom tab bar (mobile, 5 tabs max)

### Sidebar nav groups
**Practice**
- 🏠 Home
- 🎙 Record & Analyse
- ⚔️ Debate Arena
- 📜 Teleprompter
- 🎯 Interview Practice

**Review**
- 📊 Speech DNA
- 📚 Vocabulary Library

**Tools**
- 📁 Script Library
- ⚙️ Settings

### Dashboard content
- Time-of-day greeting: *"Good morning / afternoon / evening, [First Name]"* (Cormorant Garamond, large)
- **Quick actions row** (4 cards, 2×2 on mobile):
  - "Record a Speech" → `/app/record`
  - "Enter Debate Arena" → `/app/debate`
  - "Practice Interview" → `/app/interview`
  - "Use Teleprompter" → `/app/teleprompter`
- **Overall Confidence Score** — large circular progress ring, gold fill, 0–100, label beneath
- **Recent Sessions** (last 5): title, mode badge, date, overall score, replay icon
- **Stat strip:** Total sessions · Total minutes · Best score · Current streak
- **Empty state for new users:** Warm illustration + *"Start your first session to see your progress here"* + "Record now →" CTA

---

## RECORD & ANALYSE (/app/record)

**V1: Audio only.**
Accepted formats: `.mp3` `.wav` `.m4a` `.webm` `.ogg`
If `.mp4` or `.mov` uploaded: friendly inline message — *"Video support is coming soon. Please upload an audio file."*

### Tabs (3)

**Tab 1 — Upload Audio**
- Drag-and-drop zone with dashed border
- Or "Browse files" link
- File format hint: *"Accepts .mp3, .wav, .m4a, .webm, .ogg"*
- After file selected: filename shown, file size, estimated duration if readable
- Optional text field: *"What is this speech about?"* (topic, used in analysis context)
- "Analyse Speech" gold button
- On submit → upload to Supabase Storage → trigger processing pipeline

**Tab 2 — Record Live**
- Microphone permission request if not yet granted (friendly explainer: *"Garvi needs microphone access to record your speech"*)
- Once granted: large circular record button (deep red when idle, pulsing gold ring when recording)
- Animated gold waveform across the full width while recording
- Live duration timer: `00:00` counting up
- Optional topic field (collapsed by default, expandable)
- "Stop Recording" button replaces record button when active
- On stop → file uploaded to Supabase Storage → trigger processing pipeline

**Tab 3 — Free Practice**
- Topic prompt card (full width, surface card):
  - Prompt text shown large: *"Describe a decision you made under pressure that you're proud of."*
  - "Refresh prompt ↺" link (cycles through 20+ hardcoded prompts, no API call)
  - Topic is automatically passed as context to analysis
- Same record UI as Tab 2 below the prompt card

### Hardcoded Free Practice prompts (20+)
Include: professional journey in 90 seconds, convince a sceptical board, introduce yourself to 500 people at a conference, explain your biggest professional failure and what you learnt, pitch your current project to a stranger on a train, describe your leadership philosophy, summarise your industry's biggest challenge in 2 minutes, make the case for a decision your team disagreed with, describe a time you changed someone's mind, give feedback to a high performer, open a town hall meeting with energy, close a sales meeting, welcome a new team member, respond to a hostile question in a press conference, announce a difficult restructuring decision, pitch to a VC in 3 minutes, introduce a keynote speaker, thank your team after a difficult project, articulate your vision for the next 5 years, describe what makes your organisation different.

### Processing state (all modes)
Full-screen loading overlay:
- Garvi logo small at top
- Animated dots or subtle waveform
- Step labels cycling: *"Transcribing your speech..."* → *"Analysing delivery..."* → *"Generating feedback..."*
- Estimated time note: *"This usually takes 15–30 seconds"*
- Do not allow navigation away during processing (warn if back button pressed)

**After processing → `/app/session/:id`**

---

## DEBATE ARENA

### Entry Screen (/app/debate)

- Page header: *"Debate Arena"* (Cormorant Garamond, large)
- Subtitle: *"Challenge your thinking. Sharpen your arguments."*
- Two equal-weight entry cards side by side (stacked on mobile):

**Card 1 — Browse Topics**
  - Icon: 📚
  - Label: *"Choose a topic"*
  - Subtext: *"Browse our library of professionally curated debate topics"*
  - CTA: "Browse Topics →"
  - Opens the topic library grid below (same page, scroll or tab)

**Card 2 — AI Suggestion**
  - Icon: ✨
  - Label: *"Suggest a topic"*
  - Subtext: *"Let AI generate a topic tailored to your role and interests"*
  - CTA: "Get Suggestions →"
  - Opens AI suggestion panel (floating panel or inline expand)

---

### Topic Library (grid on /app/debate)

- Search bar: *"Search topics..."*
- Filter chips row: All · Business · Technology · Leadership · Ethics · Economics · Society · Startups · Philosophy
- Difficulty filter: All · Beginner · Intermediate · Advanced
- Topic cards grid (2 cols desktop, 1 col mobile):
  - Topic title (medium weight, Cormorant Garamond)
  - Category badge (muted colour chip)
  - Difficulty badge: green chip = Beginner · amber = Intermediate · red = Advanced
  - FOR/AGAINST summaries shown as two small lines of muted text
  - "Start Debate →" button (gold)
  - **Free tier:** topics 3–10 show a lock icon overlay + *"Pro"* badge; clicking shows upgrade modal

---

### AI Topic Suggestion Panel

Inline expandable panel (not a new page):
- User role pre-filled as read-only from profile: *"Your role: Executive / Senior Leader"*
- Optional text field: *"Any subject area you'd like to explore?"* (placeholder: *"e.g. sustainability, AI, leadership..."*)
- "Generate Topics" button
- Loading state: *"Generating topics for you..."* (~3–5s)
- Result: 3 topic cards, same style as library cards but with a subtle ✨ badge
- User taps a card → proceeds to Position Selection

**Edge function: `suggest-debate-topics`**
Input: `{ userRole, subjectArea? }`
Returns JSON array of 3:
```json
[{ "title": "...", "category": "...", "for_summary": "...", "against_summary": "..." }]
```

---

### Position Selection (/app/debate/:topicId)

- Back link: "← Debate Arena"
- Topic title displayed large in Cormorant Garamond (full width)
- Three position cards stacked vertically (full width each):

  **FOR card** (blue left border, `--color-debate-for`)
  - Badge: "FOR"
  - Label: *"Argue in favour"*
  - FOR summary text beneath in muted type

  **AGAINST card** (red left border, `--color-debate-against`)
  - Badge: "AGAINST"
  - Label: *"Argue against"*
  - AGAINST summary text beneath

  **NEUTRAL ANALYSIS card** (gold left border)
  - Badge: "NEUTRAL"
  - Label: *"Present both sides objectively"*
  - Subtext: *"Analyse the topic without taking a position"*

- Selected card gets a solid border and background tint; unselected cards are dimmer

- Format selection (3 option chips below the position cards):
  - **Impromptu** — 2 min — *"No preparation. Pure instinct."*
  - **Structured Argument** — 5 min — *"Build your case methodically."*
  - **Extended Case** — 10 min — *"Full argumentation and rebuttal."* (Pro only — lock icon if free)

- "Begin Debate →" gold CTA (disabled until position + format selected)

---

### Debate Recording Screen

- Full-screen dark mode (no nav, no sidebar)
- Top bar (minimal):
  - Left: back arrow (tapping shows confirmation modal: *"End this debate? Your recording will be lost."*)
  - Centre: topic title truncated
  - Right: Position badge — FOR (blue pill) / AGAINST (red pill) / NEUTRAL (gold pill)
- Timer: target duration shown in muted text (e.g. *"0:00 / 5:00"*), counts up during recording
- **Argument structure prompts** (shown as ghost/muted text in a panel, dismissible with ✕):
  - *"1. Open with your main claim"*
  - *"2. Support with evidence or examples"*
  - *"3. Anticipate the strongest counterargument"*
  - *"4. Close with a clear, memorable statement"*
  - These fade slightly as the timer progresses to reduce distraction mid-debate
- Centre: large circular record button (pulsing when active)
- Below button: animated gold waveform (visible when recording)
- "Stop & Analyse" button appears once recording starts (replaces the start prompt)
- 3-second countdown before recording begins

**V1: Audio only. No camera access.**

On stop → processing overlay → `/app/session/:id` with `mode = 'debate'`

---

## SESSION DEBRIEF (/app/session/:id)

Same route and layout shell for all non-interview modes (speech, debate, teleprompter). Content sections switch based on `mode`.

### Shared header (all modes)
- Back link: "← Dashboard" or "← [Mode Name]"
- Session title / topic (Cormorant Garamond)
- Row of badges: Mode badge · Date · Duration
- For debate: Position badge (FOR blue / AGAINST red / NEUTRAL gold) inline

---

### Speech Debrief (modes: upload, live, free)

**Hero section:**
- Large circular gauge (Recharts RadialBarChart), gold gradient fill, 0–100
- Score number large in centre
- Label beneath: *"Confidence Score"*
- Trend note: *"+5 from your last session"* in success green, or *"First session — baseline set"*

**Speech DNA Grid (2×3 cards):**

| Metric | Icon | Score bar | Descriptor |
|---|---|---|---|
| Clarity | 💎 | gold bar | one-line descriptor |
| Confidence | 🎯 | gold bar | one-line descriptor |
| Persuasion | ⚡ | gold bar | one-line descriptor |
| Vocal Variety | 🎵 | gold bar | one-line descriptor |
| Pacing | ⏱ | gold bar | one-line descriptor |
| Conciseness | ✂️ | gold bar | one-line descriptor |

Each descriptor is generated by Claude and specific (e.g. *"Your pacing was measured but slowed notably in the second half"*), not generic.

**Filler Words Panel:**
- Total count badge with severity: green (0–3) / amber (4–10) / red (11+)
- Word frequency breakdown: *"um × 7 · like × 4 · you know × 2"*
- Comparison line: *"vs your average of 8 per session"*

**Transcript Panel (collapsible, closed by default):**
- Full transcript
- Filler words highlighted in amber
- Strong vocabulary highlighted in gold
- Expandable with "Show transcript ↓" toggle

**AI Coaching Feedback:**
- Two-column layout (stacks on mobile):
  - ✅ *"What worked well"* — 3 specific bullet points
  - 💛 *"Areas to improve"* — 3 specific bullet points
- Narrative coaching paragraph below: 2–3 sentences, specific to this session

**Vocabulary Upgrade section:**
- Heading: *"Words to add to your toolkit"*
- 5 cards, each:
  - Word (large, gold)
  - Part of speech badge (noun / verb / phrase)
  - One-line definition
  - Example in context (italic)
  - "Save to library" button (✦ icon)

**Audio Playback:**
- Waveform scrubber (visual waveform if possible, otherwise simple scrub bar)
- Play / pause button
- Current time / total time
- Speed control: 0.75× · 1× · 1.25× · 1.5×

**Bottom actions row:**
- "Practice again with this topic" → `/app/record` with topic pre-filled
- "Download transcript" → exports `.txt`

---

### Teleprompter Debrief (mode: teleprompter)

Everything from the Speech Debrief is included, plus a **Script Adherence section** inserted between the Speech DNA Grid and the Filler Words panel.

**Script Adherence section:**
- Large percentage badge: *"84% match"* (gold if ≥80%, amber if 60–79%, red if <60%)
- Subtext: *"You delivered 84% of your script as written"*
- Coaching note from Claude: either praise for smart ad-libs or a note on where the departure hurt delivery
- **Script diff panel** (collapsible):
  - Side-by-side or annotated view of script vs transcript
  - Green highlights = spoken as written
  - Amber highlights = departed from script (ad-libbed)
  - Red highlights = words in script that were skipped entirely
  - Gold underline = ad-lib that Claude flags as particularly effective
- Adherence insight: *"You ad-libbed in 3 places. Your improvised close was more natural than the scripted version — consider updating your script."*

All other sections (Filler Words, Transcript, AI Feedback, Vocabulary, Playback) identical to Speech Debrief.

---

### Debate Debrief (mode: debate)

**Hero section:**
- Same circular gauge, labelled *"Argument Score"*
- Position badge displayed prominently beside the score

**Argument Strength Panel (replaces Speech DNA Grid):**

| Metric | What it measures |
|---|---|
| Argument Strength | Overall quality and coherence of claims |
| Logical Flow | Structure, sequencing, and reasoning chain |
| Evidence Use | Grounding claims in examples, data, or analogy |
| Counterargument Anticipation | Acknowledging and addressing the opposing view |
| Conviction | Confidence, commitment, and energy in delivery |
| Rhetorical Strength | Use of persuasive devices, language, and framing |

Each card: score (0–100), gold progress bar, one-line Claude-generated descriptor.

**Delivery Metrics panel (collapsible secondary, closed by default):**
- Clarity · Pacing · Confidence — same metric cards but collapsed and secondary
- Heading: *"Delivery"* with toggle

**Filler Words Panel:** identical to speech debrief

**Transcript panel (collapsible):**
- Filler words in amber
- Persuasive phrases highlighted in gold (not vocabulary — rhetorical language)

**AI Debate Coaching — 3 tabs:**

*Tab 1: Argument*
- Analysis of logical structure, claim quality, use of evidence
- Specific note on whether counterargument was anticipated
- 3 strength bullets + 3 improvement bullets

*Tab 2: Delivery*
- Analysis of conviction, energy, pacing
- Note on how delivery affected persuasiveness
- 3 strength bullets + 3 improvement bullets

*Tab 3: Language*
- Strong phrases identified by Claude with a note on why they worked
- Weak or hedging language flagged (e.g. *"phrases like 'I think maybe' undermine authority"*)
- 3 suggested stronger phrases with examples

**Persuasive Phrases panel:**
- Phrases from the transcript that Claude flagged as rhetorically strong
- Each: phrase in quotes + brief note: *"Strong epistrophe — repetition of the closing phrase reinforces the argument"*

**Vocabulary Upgrade section:** same 5-word format as speech debrief

**Audio Playback:** same as speech debrief

**Bottom actions:**
- "Debate Again — Opposite Position" → pre-fills the inverse position (FOR → AGAINST, AGAINST → FOR), same topic, same format
- "Try a New Topic" → `/app/debate`
- "Download transcript (.txt)"

---

## TELEPROMPTER (/app/teleprompter)

The Teleprompter's value in a voice-only app is rehearsal with accountability — you read your script aloud, it scrolls with you, and the debrief shows how faithfully and fluently you delivered it.

### Step 1 — Script Selection

Full-width panel. Three options as tabs or segmented control:

**Tab 1 — Load from Library**
- Search field: *"Search your scripts..."*
- Dropdown list of saved scripts with title, occasion badge, and word count
- Select → script populates preview below
- If no scripts yet: *"No saved scripts yet. Generate one or paste your own."*

**Tab 2 — Paste Text**
- Large textarea: *"Paste your script here..."*
- Word count + estimated speaking time shown live beneath (e.g. *"312 words · approx. 2 min 24 sec"*)
- Optional: title field for saving later

**Tab 3 — Generate Script**
- Compact form (not a new page):
  - Occasion (select): Pitch · Keynote · Interview · Networking · Board update · Toast · Other
  - Duration target (chips): 1 min · 2 min · 3 min · 5 min
  - Key message (text field, required): *"What's the one thing you want them to remember?"*
  - Up to 3 key points (add/remove rows)
  - Tone (chips): Formal · Professional · Conversational · Inspiring
- "Generate Script" button → loading *"Writing your script..."* (~5–8s) → script appears in an editable preview
- Edit before proceeding
- Option to save to library before recording

**"Continue to Setup →"** gold CTA once a script is loaded/written/generated

---

### Step 2 — Teleprompter Setup

Preview of the script in teleprompter style (dark background, large centred text) on the right half of screen (desktop) or as a full preview (mobile).

Settings panel (left desktop / stacked above on mobile):

**Font size** — 3 preset buttons: Small (18px) · Medium (24px) · Large (32px)

**Scroll speed** — 3 preset buttons: Slow · Medium · Fast
- Approximate WPM targets: Slow ≈ 100 wpm · Medium ≈ 130 wpm · Fast ≈ 160 wpm

**Scroll mode** — toggle:
- Auto-scroll: script scrolls continuously at the set speed
- Manual scroll: user advances with spacebar, down arrow, or tap

**Read-through mode** — checkbox:
- *"Show script for 30 seconds before recording starts"*
- When enabled: script is shown statically for 30s, then a countdown begins

**Mirror text** — toggle (for use with physical teleprompter hardware on a separate screen — flips text horizontally)

"Start Recording →" gold CTA

---

### Step 3 — Recording Screen

Full-screen dark mode. No nav/sidebar.

**Layout:**
- Top status bar (minimal): elapsed time left, target time right, e.g. *"0:45 / 3:00"*
- Speed controls (subtle, top-right corner): two small buttons ▲ / ▼ to nudge scroll speed up or down during recording without stopping
- **Script display area** (centre, takes most of the screen):
  - Current paragraph/sentence highlighted in full white
  - Previous text: 60% opacity, scrolls upward
  - Upcoming text: 70% opacity, fades in as it approaches
  - Font: DM Sans (not Cormorant — easier to read quickly)
- **Record indicator** (bottom-right corner, unobtrusive):
  - Small red pulsing dot with elapsed timer when recording
  - Animated mini gold waveform beside it
- **"Stop & Analyse" button** (bottom-centre, appears 3 seconds after recording starts to prevent accidental tap)

**Read-through mode flow (if enabled):**
- Script shown statically for 30 seconds
- Progress bar beneath: *"Read-through: 15s remaining"*
- After 30s: *"Recording starts in 3... 2... 1..."*

**Auto-scroll behaviour:**
- Scroll pauses automatically when recording pauses (if user taps to pause recording mid-session)
- Spacebar or tap anywhere: pause/resume scroll without stopping recording
- ▲/▼ buttons: increase/decrease scroll speed by one step in real time

**Manual scroll behaviour:**
- Spacebar / down arrow / tap bottom half: advance one line
- Up arrow / tap top half: scroll back one line

On stop → upload audio → processing overlay → `/app/session/:id` with `mode = 'teleprompter'` and `script_used` populated

---

## INTERVIEW PRACTICE

### Entry / Setup Screen (/app/interview)

- Page header: *"Interview Practice"* (Cormorant Garamond)
- Subtitle: *"Answer real interview questions. Get specific, actionable feedback."*
- Mode badge: purple accent (`--color-interview`)

**Setup form (single scrollable page, not multi-step — keeps it fast):**

**Interview Type** (single select chips):
- Behavioural *(Tell me about a time...)*
- Competency-based *(Describe your approach to...)*
- Strength-based *(What are you naturally good at?)*
- Mixed *(combination of all)*

**Role Level** (single select chips):
- Junior · Mid · Senior · Executive · Board

**Industry** (optional — select dropdown):
- Technology · Finance · Consulting · Media · Legal · Healthcare · Public Sector · Other

**Focus Area** (optional — single select chips):
- Leadership · Conflict resolution · Strategy · Stakeholder management · Career transitions · Culture fit · Problem solving

**Number of questions** (single select chips):
- 3 questions *(~10 min)* · 5 questions *(~20 min)* · 8 questions *(~30 min)*

**"Generate Questions & Start →"** gold CTA

On submit → call `generate-interview-questions` edge function → store questions in `interview_sessions` table → redirect to `/app/interview/:sessionId`

---

### Interview Session (/app/interview/:sessionId)

This screen handles the full Q&A recording flow. It is distinct from the debate and speech recording screens — it is sequential and multi-answer.

**Page layout:**
- Top bar: *"Interview Practice"* · progress indicator: *"Question 2 of 5"* (pill)
- No sidebar/nav shown — full focus mode

**Question display area:**
- Question number: *"Question 2"* (muted, small)
- Question text: large, Cormorant Garamond, full width: *"Tell me about a time you had to make a difficult decision with incomplete information."*
- What's being tested (subtle collapsed section, expandable): *"The interviewer is assessing: decision-making under uncertainty, risk tolerance, and how you communicate your reasoning process."*
- Suggested answer duration: *"Aim for 60–90 seconds"*

**Think time (optional, before recording):**
- "Take 30 seconds to think" button — starts a silent countdown timer
- Or "Skip — record now"
- When countdown ends: automatic prompt to start recording

**Recording controls:**
- Large circular record button (purple ring — interview mode colour)
- Animated gold waveform when recording
- Live timer
- "Done — Next Question →" button (appears after 20 seconds to prevent accidental early tap)
  - On last question: "Done — Finish Interview →"
  - Tapping saves the current recording and moves to the next question

**Between questions (brief transition screen, 3 seconds):**
- *"Answer saved ✓"*
- *"Next: Question 3 of 5"*
- No feedback shown yet (aggregate debrief is at the end — no per-question interruption in v1)

**After final answer:**
- Processing overlay: *"Analysing your interview..."*
- Processes all answers in sequence (parallel edge function calls if possible)
- Redirect to `/app/interview/:sessionId/debrief`

---

### Interview Debrief (/app/interview/:sessionId/debrief)

This is a dedicated route separate from the standard session debrief — it handles multiple answers.

**Page header:**
- *"Interview Debrief"* (Cormorant Garamond)
- Purple mode badge + date + total duration

**Overall Interview Score:**
- Large circular gauge (purple gradient this time, using interview accent colour)
- Score 0–100
- Label: *"Interview Score"*
- Two callouts below the gauge:
  - *"Strongest answer: Q3 — Conflict resolution"* (link to that answer's detail)
  - *"Area to focus on: Answer specificity"*

**Aggregate Feedback panel:**
- Top 3 strengths across the whole interview (3 bullet points)
- Top 3 improvements across the whole interview (3 bullet points)
- Narrative paragraph: 2–3 sentences of overall coaching

---

**Per-Answer Cards** (one card per question, collapsible, first card expanded by default):

Each card header:
- Question number + question text (truncated)
- Overall answer score badge (0–100)
- Expand/collapse toggle

Expanded card content:

*Score breakdown row (5 metrics as horizontal mini-bars):*

| Metric | What it measures |
|---|---|
| STAR Structure | Did the answer follow Situation → Task → Action → Result? |
| Answer Relevance | Did they actually answer the question asked? |
| Specificity | Were examples concrete and real, or vague and generic? |
| Confidence | Delivery conviction and authority |
| Conciseness | Did they stay within the target duration without rambling? |

*Filler words:* count + breakdown (same as speech debrief)

*Transcript (collapsible):* full transcript of this answer, filler words in amber

*AI Feedback (2 columns):*
- ✅ What worked well — 2–3 specific points
- 💛 Improve — 2–3 specific points

*Model Answer Guide:*
- Heading: *"How a strong answer might be structured"*
- Surface card with gold left border
- Claude's structural guide — not a script to memorise, but a framework: *"A strong answer here would open by naming the specific project context, then describe the decision criteria you used, show one concrete action you took that others might not have, and close with a measurable outcome or lesson learned."*
- This section should feel like advice from a senior coach, not a template

*Audio Playback for this answer:* same play/pause/scrub control

---

**Bottom actions:**
- "Practice again — same questions" → creates a new `interview_session` with the same `questions_json`, restarts the flow
- "Change settings — new questions" → back to `/app/interview` setup form
- "Download full transcript (.txt)" → all answers concatenated with question headings

---

## SCRIPT LIBRARY (/app/scripts)

**Header:** *"Script Library"* + "New Script" button (opens `/app/scripts/new`)

**Filters/search row:**
- Search: *"Search scripts..."*
- Filter tabs: All · Pitches · Keynotes · Interviews · Toasts · Other
- Sort: Most recent · Favourites · Longest

**Script card:**
- Title
- Occasion badge (colour-coded chip)
- Word count + estimated speaking time (e.g. *"412 words · approx. 3 min 10 sec"*)
- Date last modified
- Action icons: Edit (pencil) · Use in Teleprompter (↗) · Duplicate · Delete · ☆ Favourite

**Script editor (/app/scripts/:id):**
- Full-width clean textarea
- Title field at top (editable inline)
- Occasion selector
- Word count + speaking time shown live
- Auto-save every 2 seconds (debounced) — *"Saved"* indicator
- "Open in Teleprompter" button

---

## SCRIPT GENERATOR (/app/scripts/new)

**Form fields:**
- Occasion (select): Pitch · Keynote · Networking · Meeting update · Board update · Toast · Conference talk · Media interview · Other
- Duration (chips): 30 sec · 1 min · 2 min · 3 min · 5 min
- Key message (required text field): *"What's the single most important thing you want your audience to remember?"*
- Key points (up to 5, add/remove rows): *"Supporting points to include"*
- Tone (chips): Formal · Professional · Conversational · Inspiring · Authoritative
- Language (select): English · Portuguese · Spanish · French

**On submit:**
- Loader: *"Crafting your script..."* (~5–8 seconds)
- Result shown in editable textarea
- Actions: Edit inline · Regenerate (same params) · Save to Library · Open in Teleprompter

---

## SPEECH DNA ANALYTICS (/app/analytics)

**Header:** *"Speech DNA"* (Cormorant Garamond) · *"Track your communication evolution"*

**Filters row:**
- Date range: Last 7 days · Last 30 days · All time
- Session type: All · Speech · Debate · Teleprompter · Interview

**When "Interview" selected:** metric cards swap to interview metrics (STAR, Relevance, Specificity, Confidence, Conciseness). The trend chart renders aggregate interview score over time.

**Overall score gauge** (Recharts RadialBarChart, gold/purple depending on filter):
- Current period score
- Trend vs previous period (e.g. *"+7 this month"*)

**Score trend line chart** (Recharts LineChart):
- Gold line on dark background
- Smooth curves, minimal grid, no axis clutter
- Toggle between metrics (click metric name to isolate on chart)

**6 metric cards** (grid, switches based on session type filter):
Each: metric name · current score · trend arrow · progress bar · delta vs last period

**Session history table:**
- Columns: Title · Mode · Position/Level · Score · Duration · Date · Replay (icon)
- Mode badge: gold = speech/teleprompter · blue/red = debate · purple = interview
- Paginated (10 per page)
- Clicking any row → session debrief or interview debrief

**Summary stats strip:**
Total sessions · Total minutes practised · Most improved area · Current streak (days)

---

## API INTEGRATIONS (Supabase Edge Functions)

All AI and transcription calls go through Supabase edge functions. Never expose API keys client-side.

### `transcribe` (Deepgram)
```typescript
// Input: { audioUrl: string, language: string }
// Downloads audio from Supabase Storage, sends to Deepgram
// Returns: { transcript, words, wpm, pauses, filler_words }

const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&filler_words=true&utterances=true&punctuate=true', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${DEEPGRAM_API_KEY}`,
    'Content-Type': 'audio/wav'
  },
  body: audioBuffer
});
// Extract: transcript, words array (with timestamps), detected filler words, speaking rate
```

### `analyse-speech`
```typescript
// Input: { transcript, audioMetadata, sessionId, userRole, mode, topic? }
// audioMetadata: { wpm, pause_count, filler_words, total_duration }
const systemPrompt = `
You are an expert communication coach for senior professionals.
Analyse this speech transcript alongside the audio metadata provided.
Use the audio metadata (WPM, pauses, filler word count from Deepgram) to inform your pacing,
vocal variety, and filler word scores — these are real measurements, not guesses.

Return ONLY valid JSON:
{
  "clarity_score": 0-100,
  "confidence_score": 0-100,
  "persuasion_score": 0-100,
  "vocal_variety_score": 0-100,
  "pacing_score": 0-100,
  "conciseness_score": 0-100,
  "overall_score": 0-100,
  "filler_words": { "um": N, "uh": N, "like": N, ... },
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "suggested_words": [
    { "word": "...", "pos": "noun/verb/phrase", "definition": "...", "example": "..." }
  ],
  "full_feedback": "2-3 sentence specific narrative coaching paragraph"
}
Scores reflect executive-level standards. Be specific — reference actual content from the transcript.
No markdown, no preamble, no explanation outside the JSON.
`;
```

### `analyse-teleprompter`
```typescript
// Input: { transcript, script, audioMetadata, sessionId, userRole }
// Runs analyse-speech first, then adds script adherence diff
// Uses diff algorithm (Levenshtein / LCS) to compare script vs transcript word by word
// Returns speech analysis JSON plus:
// {
//   "script_adherence_pct": 0-100,
//   "script_diff": [ { "word": "...", "status": "match|skip|adlib" } ],
//   "adherence_feedback": "specific note on departures",
//   "notable_adlibs": [ { "phrase": "...", "note": "why this was effective/ineffective" } ]
// }
```

### `analyse-debate`
```typescript
// Input: { transcript, audioMetadata, sessionId, userRole, position, topicTitle, forSummary, againstSummary }
const systemPrompt = `
You are an expert debate coach and rhetoric trainer for senior professionals.
The user argued the ${position} position on the topic: "${topicTitle}"

FOR position framing: ${forSummary}
AGAINST position framing: ${againstSummary}

Analyse their argument using the transcript and audio metadata.
Return ONLY valid JSON:
{
  "overall_score": 0-100,
  "argument_strength_score": 0-100,
  "logical_flow_score": 0-100,
  "evidence_use_score": 0-100,
  "counterargument_score": 0-100,
  "conviction_score": 0-100,
  "rhetorical_strength_score": 0-100,
  "clarity_score": 0-100,
  "pacing_score": 0-100,
  "confidence_score": 0-100,
  "argument_feedback": "specific analysis of claim quality, evidence, and logical structure",
  "delivery_feedback": "specific analysis of conviction, pacing, and authority",
  "language_feedback": "specific analysis of persuasive language and rhetorical devices used",
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "persuasive_phrases": [
    { "phrase": "exact quote from transcript", "note": "why this worked rhetorically" }
  ],
  "suggested_words": [
    { "word": "...", "pos": "...", "definition": "...", "example": "..." }
  ]
}
Evaluate against professional debate and advocacy standards.
No markdown, no preamble.
`;
```

### `generate-interview-questions`
```typescript
// Input: { interviewType, roleLevel, industry?, focusArea?, questionCount, userRole }
const systemPrompt = `
You are an expert executive recruiter and interview coach.
Generate ${questionCount} interview questions tailored to the inputs provided.
Questions should be realistic, professionally calibrated to the role level, and genuinely challenging.

Return ONLY valid JSON array:
[
  {
    "question_text": "Tell me about a time you had to make a difficult decision with incomplete information.",
    "what_interviewer_tests": "Decision-making under uncertainty, risk tolerance, and ability to communicate reasoning",
    "suggested_duration_seconds": 90,
    "framework_hint": "STAR"
  }
]
No markdown, no preamble.
`;
```

### `analyse-interview-answer`
```typescript
// Input: { transcript, audioMetadata, question, whatInterviewerTests, frameworkHint, sessionId, questionIndex }
// Called once per answer (can be parallelised for all answers after session ends)
const systemPrompt = `
You are an expert executive recruiter and interview coach providing feedback on a candidate's answer.

Question: "${question}"
What the interviewer is assessing: "${whatInterviewerTests}"
Expected framework: ${frameworkHint}

Evaluate the transcript and return ONLY valid JSON:
{
  "overall_score": 0-100,
  "star_structure_score": 0-100,
  "answer_relevance_score": 0-100,
  "specificity_score": 0-100,
  "confidence_score": 0-100,
  "conciseness_score": 0-100,
  "filler_words": { "um": N, ... },
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "model_answer_guide": "A strong answer here would... [structural guidance, not a script. 2-4 sentences.]"
}
Be direct, specific, and calibrated to senior professional standards.
No markdown, no preamble.
`;
```

### `generate-aggregate-interview-feedback`
```typescript
// Input: { answers: AnalysedAnswer[], interviewType, roleLevel, questions }
// Called once after all answers are analysed
// Returns: { overall_score, strongest_answer_index, weakest_answer_index, aggregate_feedback, top_improvements }
```

### `generate-script`
```typescript
// Word count targets: 30s≈65w · 1min≈130w · 2min≈260w · 3min≈390w · 5min≈650w
// Return speech text only. No title, no notes, no stage directions, no preamble.
```

### `suggest-debate-topics`
```typescript
// Input: { userRole, subjectArea? }
// Return JSON array of 3 topics with title, category, for_summary, against_summary
```

---

## STRIPE SUBSCRIPTION

| Feature | Free | Pro (£9.99/mo or £89/yr) |
|---|---|---|
| Sessions total | 3 | Unlimited |
| Speech modes | All | All |
| Debate topics | 2 only | All 10+ |
| Debate Extended format (10 min) | ✗ | ✓ |
| AI topic suggestions | ✗ | ✓ |
| Teleprompter | ✗ | ✓ |
| Interview Practice | 1 session only | Unlimited |
| Speech DNA history | Last session only | Full history |
| Audio replay | ✗ | ✓ |
| Vocabulary library | ✗ | ✓ |

**Edge functions:**
- `create-checkout` → Stripe Checkout session
- `stripe-webhook` → handles `checkout.session.completed` and `customer.subscription.deleted` → updates `users.subscription_status`

**Upgrade page (/app/upgrade):**
- Pricing toggle: Monthly / Annual (annual highlighted as *"Save 26%"*)
- Free vs Pro feature comparison table
- *"Upgrade Now →"* → `create-checkout` → Stripe hosted checkout → success screen → redirect to dashboard with Pro badge

**Paywall triggers:**
- After 3rd session completed → debrief shows upgrade banner above CTAs
- Clicking any Pro-only feature → modal: *"This is a Pro feature. Upgrade to keep training."*
- Trying to access locked debate topics → lock icon + upgrade prompt

---

## VOCABULARY LIBRARY (/app/vocabulary)

**Header:** *"Vocabulary Library"* · total saved word count badge

**Filter:** All · From Speech · From Debate · From Interview

**Table view:**
- Columns: Word · Definition · Example · Source mode (badge) · Date
- Sort by: Recently added · Alphabetical
- Delete button per row

**Flashcard practice mode** (toggle to switch view):
- One card at a time: word shown
- Tap to reveal definition + example
- Two buttons: *"Got it ✓"* (removes from active deck) · *"Review again"* (keeps in deck)
- Progress: *"12 of 32 words mastered"*

---

## SETTINGS (/app/settings)

- Display name (editable inline)
- Profile photo (Supabase Storage upload)
- Role (re-selectable — affects AI analysis framing and interview question calibration)
- Language preference
- Email preferences: weekly progress digest (toggle)
- Connected accounts: Google OAuth status + connect/disconnect
- Subscription status + *"Manage billing"* link → Stripe customer portal
- Danger zone: *"Delete account"* (confirmation modal, requires typing "DELETE")

---

## LANDING PAGE (/)

Full public marketing page. Sections:

1. **Hero** — Full dark background, Cormorant Garamond headline (*"Speak with authority. Sound like yourself — only better."*), DM Sans subtext, *"Start free"* gold CTA + *"Sign in"* ghost CTA

2. **Problem** — *"Most professionals know they need to communicate better. Few have a safe space to practise."* Three pain point columns: no feedback loop, no time for coaching, no realistic practice environment

3. **Four pillars** — Record & Analyse · Debate Arena · Teleprompter · Interview Practice — each with icon, label, and 2-line description

4. **Speech DNA callout** — full-width dark section featuring a mock-up of the debrief screen with animated score reveal

5. **How it works** — 3 steps: Record (or read/debate/answer) → Get specific AI feedback → Improve over time

6. **Testimonials** — 3 placeholder cards with executive personas, job titles, quote, initials avatar

7. **Pricing** — Free vs Pro cards with full feature list, annual/monthly toggle, *"Upgrade Now"* gold CTA on Pro card

8. **FAQ** — 6 questions (what's Deepgram/AI doing with my audio, is this for all industries, how is this different from Orai, does it work on mobile, what languages are supported, how is my data protected)

9. **Footer** — Garvi logo, nav links, Privacy Policy, Terms of Service, *"© 2025 Garvi. All rights reserved."*

---

## IMPLEMENTATION ORDER

Build in this sequence. Do not move to the next phase until the current phase is working end-to-end with real data.

**Phase 1 — Core loop (MVP)**
1. Project setup — Vite + React + TypeScript + Tailwind + Supabase client configured
2. Supabase schema — all migrations run, debate topics seeded
3. Auth — email/password login, signup, Google OAuth, protected route wrapper
4. Onboarding — 3-step flow, saves to `users` table
5. Dashboard — layout, sidebar, bottom tab bar (mobile), empty states
6. Record page — all 3 tabs (upload, live, free practice) with audio recording + upload to Supabase Storage
7. `transcribe` edge function — Deepgram integration returning transcript + audio metadata
8. `analyse-speech` edge function — Claude analysis returning scored JSON
9. Speech session debrief — full layout with all sections, wired to real data
10. Stripe — `create-checkout`, `stripe-webhook`, upgrade page, paywall triggers

**Phase 2 — Debate Arena**
11. Debate entry screen + topic library + AI suggestion panel
12. `suggest-debate-topics` edge function
13. Position selection screen
14. Debate recording screen
15. `analyse-debate` edge function
16. Debate debrief screen

**Phase 3 — Teleprompter**
17. Script library (CRUD) + script generator form
18. `generate-script` edge function
19. Teleprompter setup screen (font/speed/mode settings)
20. Teleprompter recording screen (auto-scroll + manual override + speed controls)
21. `analyse-teleprompter` edge function (speech analysis + script diff)
22. Teleprompter debrief (adds Script Adherence section)

**Phase 4 — Interview Practice**
23. Interview setup form
24. `generate-interview-questions` edge function
25. Interview session screen (sequential Q&A recording)
26. `analyse-interview-answer` edge function
27. `generate-aggregate-interview-feedback` edge function
28. Interview debrief screen (per-answer cards + aggregate)

**Phase 5 — Analytics & Library**
29. Speech DNA analytics page (Recharts, all filters, session history table)
30. Vocabulary library (table + flashcard mode)

**Phase 6 — Polish**
31. Landing page
32. Settings page
33. Empty states, error states, loading states for every async operation
34. Mobile QA pass (all 4 modes on iOS Safari + Android Chrome)
35. Audio file auto-deletion scheduled function (30-day cleanup)

---

## CRITICAL CONSTRAINTS

- **V1 is audio only.** No video recording, upload, playback, or camera access. If `.mp4`/`.mov` uploaded anywhere: *"Video support is coming soon. Please upload an audio file."*
- Never expose API keys client-side. All transcription and AI calls go through Supabase edge functions.
- All audio files: Supabase Storage, private bucket, accessed via signed URLs, auto-deleted after 30 days via scheduled edge function.
- Handle loading and error states on every async operation — especially the processing pipeline.
- Skeleton loaders for all content loading states (not spinners).
- All UI copy in British English.
- The session debrief (in all its variants) is the most important screen in the product. Invest disproportionate care in its layout, data display, and the quality of the AI feedback prompts.
- The interview debrief is a separate route and separate component from the speech/debate debrief — do not try to merge them.
- Interview answer recordings are individual audio files (one per question) stored separately in Supabase Storage, all linked to the same `interview_session_id`.

---

*End of Garvi Master Prompt v3*
