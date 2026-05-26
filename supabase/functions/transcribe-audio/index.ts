import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const formData = await req.formData()
    const audio = formData.get('audio') as File

    if (!audio) throw new Error('No audio file provided')

    // Forward to OpenAI Whisper
    const whisperForm = new FormData()
    whisperForm.append('file', audio, 'recording.webm')
    whisperForm.append('model', 'whisper-1')
    whisperForm.append('response_format', 'verbose_json')

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
      body: whisperForm,
    })

    if (!whisperRes.ok) {
      const err = await whisperRes.text()
      throw new Error(`Whisper API error: ${err}`)
    }

    const result = await whisperRes.json() as { text: string; duration: number; language: string }

    return new Response(
      JSON.stringify({
        transcript: result.text,
        duration_seconds: Math.round(result.duration || 0),
        language: result.language || 'en',
      }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
