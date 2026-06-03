import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { occasion, topic, key_points, tone, length_minutes, language, role } = await req.json()

    const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    const systemPrompt = `You are an elite speechwriter for C-suite executives and world-class presenters. Write a compelling, authoritative speech in ${language === 'en' ? 'English' : language}. Tone: ${tone}. Speaker role: ${role}. No filler phrases. Every word must earn its place. Return ONLY the speech text — no titles, no markdown, no commentary.`

    const userPrompt = `Write a ${length_minutes}-minute ${occasion} speech about: "${topic}".${key_points ? `\n\nKey points to include:\n${key_points}` : ''}\n\nTarget word count: ${Math.round(length_minutes * 130)} words. Strong opening, clear body, powerful close.`

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
