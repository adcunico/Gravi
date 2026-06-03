-- ══════════════════════════════════════════════════
-- GRAVI — Daily Training: schema + seed content
-- ══════════════════════════════════════════════════

-- Add type + daily flag to prompts
alter table public.prompts
  add column if not exists prompt_type text default 'speech'
    check (prompt_type in ('speech', 'exercise')),
  add column if not exists is_daily boolean default false;

-- Backfill existing rows
update public.prompts set prompt_type = 'speech', is_daily = false
  where prompt_type is null;

-- ── Articulation exercises ─────────────────────────
insert into public.prompts (title, description, category, duration_minutes, difficulty, language, is_featured, prompt_type, is_daily) values
(
  'Sibilant Precision Drill',
  'Repeat these phrases clearly, exaggerating the "S" and "SH" sounds: "She sells seashells by the seashore. The shells she sells are surely seashells." Do three rounds — slow, medium, then full speed. Focus on crispness, not volume.',
  'Articulation', 1, 'beginner', 'en', false, 'exercise', false
),
(
  'Plosive Power Drill',
  'Master the explosive consonants P, B, T, D, K, G. Repeat clearly: "Peter Piper picked a peck of pickled peppers. Better butter makes a batter better." Then: "King Kong kicked a big black book." Three rounds, increasing speed each time.',
  'Articulation', 1, 'beginner', 'en', false, 'exercise', false
),
(
  'Liquid Sounds — L and R',
  'Many speakers blur L and R. Practice the contrast: "Red lorry, yellow lorry, red lorry, yellow lorry." Then: "Lemon, ribbon, lullaby, railroad, rural, literary." Go slowly, focusing on distinct tongue placement for each sound.',
  'Articulation', 1, 'beginner', 'en', false, 'exercise', false
),
(
  'Vowel Clarity Round',
  'Open your mouth fully and cycle through pure vowel sounds: A (as in "father"), E (as in "see"), I (as in "eye"), O (as in "go"), U (as in "you"). Now connect them in a sentence: "A great leader sees issues openly and pursues truth." Feel each vowel ring out clearly.',
  'Articulation', 1, 'beginner', 'en', true, 'exercise', false
),
(
  'Tongue Twister Speed Ladder',
  'Three twisters, three speeds each. Start slow, build to your limit without breaking clarity: "How much wood would a woodchuck chuck?" then "Unique New York, unique New York, you know you need unique New York." then "The sixth sick sheikh''s sixth sheep''s sick." Push the pace.',
  'Articulation', 2, 'intermediate', 'en', false, 'exercise', false
),
(
  'Consonant Cluster Clarity',
  'Professional speech requires crisp consonant clusters. Repeat ten times, getting faster: "strengths, sixths, crisp, scrumptious, glimpse." Then build a sentence with them: "The crisp, strong text glimpsed sixth-place strengths." Record yourself and listen for slurring.',
  'Articulation', 1, 'intermediate', 'en', false, 'exercise', false
),

-- ── Projection & breath ────────────────────────────
(
  'Diaphragm Breath and Project',
  'Breathe in deeply for 4 counts, expanding your belly — not your chest. Hold 2. Release over 8. On a fresh breath, project this sentence to the back of a large room: "Clarity of thought demands clarity of voice. Speak so the back row hears every word." Repeat three times, increasing projection.',
  'Projection', 2, 'beginner', 'en', true, 'exercise', false
),
(
  'Crescendo Drill',
  'Choose any sentence — try: "I believe this is the most important decision we will make this year." Deliver it five times starting in a near-whisper and building to a commanding room-filling voice by the fifth. Use diaphragm support, not throat strain.',
  'Projection', 2, 'intermediate', 'en', false, 'exercise', false
),
(
  'Resonance Warm-Up',
  'Hum a single note for 5 seconds, feeling vibration in your chest and face. Let it open into "mmmm-AH". Then speak: "My message matters. My voice carries weight." Repeat the hum → speak transition three times. Notice how the hum opens your resonance before each phrase.',
  'Projection', 1, 'beginner', 'en', false, 'exercise', false
),

-- ── Pace & rhythm ──────────────────────────────────
(
  'Deliberate Pause Drill',
  'Read this passage aloud with intentional pauses at the marked points: "The best leaders I have known [pause] don''t speak more — [pause] they say less, [pause] and mean every word." Now take a paragraph from your own work and insert three deliberate pauses. Pausing is power — own the silence.',
  'Pacing', 2, 'intermediate', 'en', true, 'exercise', false
),
(
  'Allegro to Adagio',
  'Read this passage at three speeds: "Innovation is not about technology. It is about how we think, how we challenge assumptions, and how we choose to solve the problems that matter most." First: rush through it. Second: conversational speed. Third: slow and deliberate, as if each word costs something.',
  'Pacing', 2, 'beginner', 'en', false, 'exercise', false
),
(
  'Stress and Emphasis',
  'The same sentence shifts meaning depending on which word you stress. Say this sentence six times, emphasising a different word each time: "I never said you took the money." Notice how the implied meaning changes completely. This is the power of deliberate emphasis.',
  'Pacing', 1, 'intermediate', 'en', false, 'exercise', false
),

-- ── Daily speech prompts ───────────────────────────
(
  'Your Personal Motto',
  'In one to two minutes, share the personal motto or guiding principle that drives your decisions. Where did it come from? How has it shaped a specific choice you made? Make it specific — generic wisdom is forgettable.',
  'Storytelling', 1, 'beginner', 'en', false, 'speech', true
),
(
  'What Is Worth Fighting For',
  'Choose one professional or personal belief you hold strongly enough to argue for in public. Make the case clearly, passionately, and with evidence. Practise conviction without aggression.',
  'Persuasion', 1, 'intermediate', 'en', false, 'speech', true
),
(
  'Describe Your Best Day at Work',
  'Recall your most energising, meaningful day at work. Describe it specifically — who was there, what happened, what made it matter. This exercise builds emotional authenticity and specificity in your speaking.',
  'Storytelling', 1, 'beginner', 'en', false, 'speech', true
),
(
  'One Skill You Are Mastering',
  'Talk about a skill you are actively building. Why does it matter to you? What is hard about it? What progress have you made? Use concrete, specific language — vague generalities are the enemy of credibility.',
  'Leadership', 1, 'beginner', 'en', false, 'speech', true
),
(
  'Advice to Your Younger Self',
  'If you could speak to yourself at the start of your career, what would you say? Choose one piece of advice that is specific, honest, and hard-won — not a cliché. Two minutes. Speak from experience.',
  'Storytelling', 2, 'intermediate', 'en', false, 'speech', true
),
(
  'What Leadership Means Right Now',
  'Leadership means different things at different stages. In one minute, share what leadership means to you today — not in theory, but in practice. Be specific to your current context and challenges.',
  'Leadership', 1, 'intermediate', 'en', false, 'speech', true
),
(
  'The Best Unplanned Decision',
  'Describe a major life or career decision you made without a plan — that turned out right. What did it teach you about instinct, risk, or opportunity? Keep it concrete, keep it brief.',
  'Storytelling', 2, 'intermediate', 'en', false, 'speech', true
);
