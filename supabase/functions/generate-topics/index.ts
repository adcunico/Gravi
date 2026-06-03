import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const { role, language, count = 3 } = await req.json()
    const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    const LANG_NAMES: Record<string, string> = {
      en: 'English', pt: 'Brazilian Portuguese', es: 'Spanish',
      fr: 'French', de: 'German', zh: 'Mandarin Chinese',
    }
    const languageName = LANG_NAMES[language] ?? language

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Generate ${count} debate topic(s) highly relevant to a ${role} professional. Respond entirely in ${languageName} — the title and description must be written in ${languageName}. Return ONLY valid JSON array: [{"title": string, "description": string, "category": string, "difficulty": "beginner"|"intermediate"|"advanced", "language": "${language}", "is_featured": false}]`,
      }],
    })

    const raw = (message.content[0] as { text: string }).text.trim()
    const match = raw.match(/\[[\s\S]*\]/)
    const topics = match ? JSON.parse(match[0]) : []

    return new Response(JSON.stringify({ topics }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err), topics: [] }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
