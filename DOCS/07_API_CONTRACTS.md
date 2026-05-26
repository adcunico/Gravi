# API Contracts — Supabase Edge Functions

All edge functions are called via authenticated POST requests from the Gravi frontend. Every function validates the user's JWT before processing.

---

## `transcribe`

**Input:**
```json
{ "audioUrl": "string", "language": "en" }
```

**Deepgram call:**
```typescript
const response = await fetch(
  'https://api.deepgram.com/v1/listen?model=nova-2&filler_words=true&utterances=true&punctuate=true',
  {
    method: 'POST',
    headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}`, 'Content-Type': 'audio/wav' },
    body: audioBuffer
  }
);
```

**Output:**
```json
{
  "transcript": "string",
  "words": [{ "word": "string", "start": 0.0, "end": 0.0, "confidence": 0.0 }],
  "wpm": 145,
  "pause_count": 8,
  "pause_durations_ms": [320, 480, 210],
  "filler_words": { "um": 4, "uh": 2, "like": 6 },
  "duration_seconds": 187
}
```

---

## `analyse-speech`

**Input:**
```json
{
  "transcript": "string",
  "audioMetadata": { "wpm": 145, "pause_count": 8, "filler_words": {}, "duration_seconds": 187 },
  "sessionId": "uuid",
  "userRole": "executive",
  "mode": "live",
  "topic": "optional string"
}
```

**Claude system prompt:**
```
You are an expert communication coach for senior professionals.
Analyse this speech transcript alongside the audio metadata provided.
Use the audio metadata (WPM, pauses, filler word count from Deepgram) to inform your
pacing, vocal variety, and filler word scores — these are real measurements, not guesses.

Return ONLY valid JSON with no markdown, no preamble, no explanation:
{
  "clarity_score": 0-100,
  "confidence_score": 0-100,
  "persuasion_score": 0-100,
  "vocal_variety_score": 0-100,
  "pacing_score": 0-100,
  "conciseness_score": 0-100,
  "overall_score": 0-100,
  "filler_words": { "um": N, "uh": N, "like": N },
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "suggested_words": [
    { "word": "...", "pos": "noun/verb/phrase", "definition": "...", "example": "..." }
  ],
  "full_feedback": "2-3 sentence narrative coaching paragraph"
}
Scores reflect executive-level standards. Reference actual content from the transcript in feedback.
```

**Output:** JSON as above, written to `analysis` table.

---

## `analyse-teleprompter`

**Input:** Same as `analyse-speech` plus:
```json
{ "script": "full script text as string" }
```

**Additional processing:** LCS/Levenshtein diff between `script` and `transcript`, word by word.

**Additional output fields:**
```json
{
  "script_adherence_pct": 84,
  "script_diff": [{ "word": "string", "status": "match|skip|adlib" }],
  "adherence_feedback": "string",
  "notable_adlibs": [{ "phrase": "string", "note": "why this was effective/ineffective" }]
}
```

---

## `analyse-debate`

**Input:**
```json
{
  "transcript": "string",
  "audioMetadata": {},
  "sessionId": "uuid",
  "userRole": "string",
  "position": "for|against|neutral",
  "topicTitle": "string",
  "forSummary": "string",
  "againstSummary": "string"
}
```

**Claude system prompt:**
```
You are an expert debate coach and rhetoric trainer for senior professionals.
The user argued the [position] position on: "[topicTitle]"
FOR position framing: [forSummary]
AGAINST position framing: [againstSummary]

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
  "argument_feedback": "string",
  "delivery_feedback": "string",
  "language_feedback": "string",
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "persuasive_phrases": [{ "phrase": "exact quote", "note": "rhetorical explanation" }],
  "suggested_words": [{ "word": "...", "pos": "...", "definition": "...", "example": "..." }]
}
```

---

## `generate-interview-questions`

**Input:**
```json
{
  "interviewType": "behavioural|competency|strength|mixed",
  "roleLevel": "junior|mid|senior|executive|board",
  "industry": "optional string",
  "focusArea": "optional string",
  "questionCount": 3,
  "userRole": "string"
}
```

**Claude system prompt:**
```
You are an expert executive recruiter and interview coach.
Generate [questionCount] interview questions tailored to the inputs.
Questions must be realistic, challenging, and calibrated to the role level.

Return ONLY a valid JSON array:
[
  {
    "question_text": "string",
    "what_interviewer_tests": "string",
    "suggested_duration_seconds": 90,
    "framework_hint": "STAR|CAR|direct"
  }
]
```

---

## `analyse-interview-answer`

**Input:**
```json
{
  "transcript": "string",
  "audioMetadata": {},
  "question": "string",
  "whatInterviewerTests": "string",
  "frameworkHint": "STAR",
  "sessionId": "uuid",
  "questionIndex": 0
}
```

**Claude system prompt:**
```
You are an expert executive recruiter and interview coach.
Question: "[question]"
What the interviewer is assessing: "[whatInterviewerTests]"
Expected framework: [frameworkHint]

Return ONLY valid JSON:
{
  "overall_score": 0-100,
  "star_structure_score": 0-100,
  "answer_relevance_score": 0-100,
  "specificity_score": 0-100,
  "confidence_score": 0-100,
  "conciseness_score": 0-100,
  "filler_words": { "um": N },
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "model_answer_guide": "A strong answer here would... [2-4 sentences of structural guidance, not a script]"
}
```

---

## `generate-aggregate-interview-feedback`

**Input:**
```json
{
  "answers": [ /* array of analyse-interview-answer outputs */ ],
  "interviewType": "string",
  "roleLevel": "string",
  "questions": [ /* array of question objects */ ]
}
```

**Output:**
```json
{
  "overall_score": 78,
  "strongest_answer_index": 2,
  "weakest_answer_index": 0,
  "aggregate_feedback": "string (2-3 sentences)",
  "top_improvements": ["improvement 1", "improvement 2", "improvement 3"]
}
```

---

## `generate-script`

**Input:**
```json
{
  "occasion": "pitch|keynote|toast|networking|board-update|conference|media-interview|other",
  "duration": "30s|1min|2min|3min|5min",
  "keyMessage": "string",
  "keyPoints": ["string"],
  "tone": "formal|professional|conversational|inspiring|authoritative",
  "language": "en|pt|es|fr"
}
```

**Word count targets:** 30s≈65w · 1min≈130w · 2min≈260w · 3min≈390w · 5min≈650w

**Output:** Speech text only. No title, no stage directions, no preamble.

---

## `suggest-debate-topics`

**Input:**
```json
{ "userRole": "string", "subjectArea": "optional string" }
```

**Output:**
```json
[
  { "title": "string", "category": "string", "for_summary": "string", "against_summary": "string" }
]
```
(Array of 3)

---

## `create-checkout`

**Input:**
```json
{ "priceId": "stripe_price_id", "successUrl": "string", "cancelUrl": "string" }
```

**Output:** `{ "checkoutUrl": "string" }`

---

## `stripe-webhook`

**Events handled:**
- `checkout.session.completed` → set `users.subscription_status = 'pro'`, store `stripe_customer_id`
- `customer.subscription.deleted` → set `users.subscription_status = 'free'`
