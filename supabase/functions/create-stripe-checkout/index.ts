import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICES = {
  monthly: Deno.env.get('STRIPE_PRICE_MONTHLY')!,
  annual: Deno.env.get('STRIPE_PRICE_ANNUAL')!,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) throw new Error('Unauthorized')

    const { tier } = await req.json() as { tier: 'monthly' | 'annual' }
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-09-30.acacia' })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: PRICES[tier], quantity: 1 }],
      success_url: `${Deno.env.get('APP_URL')}/dashboard?upgraded=1`,
      cancel_url: `${Deno.env.get('APP_URL')}/upgrade`,
      customer_email: user.email,
      metadata: { user_id: user.id, tier },
    })

    return new Response(JSON.stringify({ checkout_url: session.url }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
