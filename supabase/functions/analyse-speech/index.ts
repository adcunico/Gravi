import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { transcript, mode, language, role, occasion, debate_position, script_used } = await req.json()

    if (!transcript || transcript.trim().length < 10) {
      throw new Error('Transcript too short to analyse')
    }

    const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    const systemPrompt = `You are an expert executive communication coach with 20 years of experience coaching Fortune 500 CEOs, TED speakers, and top lawyers. Analyse this speech transcript with precision and intelligence. Return ONLY a valid JSON object — no markdown, no explanation, just the JSON.`

    const userPrompt = `Analyse this ${mode} speech transcript.

Language: ${language}
Speaker role: ${role}
Mode: ${mode}
${occasion ? `Occasion: ${occasion}` : ''}
${debate_position ? `Debate position: ${debate_position}` : ''}
${script_used ? `Original script provided: yes` : 'Impromptu / no script'}

TRANSCRIPT:
"""
${transcript}
"""

Return this exact JSON structure:
{
  "overall_score": <0-100>,
  "clarity_score": <0-100>,
  "confidence_score": <0-100>,
  "persuasion_score": <0-100>,
  "vocal_variety_score": <0-100>,
  "pacing_score": <0-100>,
  "conciseness_score": <0-100>,
  "pace_rating": "too slow" | "good" | "too fast",
  "wpm": <estimated words per minute>,
  "filler_words": [{"word": string, "count": number, "timestamps": []}],
  "strengths": [<2 specific strengths as strings>],
  "improvements": [<3 specific, actionable improvements as strings>],
  "vocabulary_upgrades": [{"original": string, "suggested": string, "reason": string}],
  "overall_summary": "<2-3 sentence professional analysis>",
  "debate_argument_score": ${mode === 'debate' ? '<0-100>' : 'null'},
  "debate_logic_score": ${mode === 'debate' ? '<0-100>' : 'null'},
  "debate_conviction_score": ${mode === 'debate' ? '<0-100>' : 'null'}
}

Be analytically precise. Feedback must be specific, actionable, and professional. Never be vague.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = (message.content[0] as { text: string }).text.trim()

    // Extract JSON from response (handle any wrapping)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No valid JSON in response')

    const analysis = JSON.parse(jsonMatch[0])

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
