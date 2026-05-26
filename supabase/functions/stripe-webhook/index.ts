import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-09-30.acacia' })
    const event = stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const tier = session.metadata?.tier as 'monthly' | 'annual'
      if (userId) {
        await supabase.from('profiles').update({
          subscription_status: 'pro',
          subscription_tier: tier,
          stripe_customer_id: session.customer as string,
          updated_at: new Date().toISOString(),
        }).eq('id', userId)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      await supabase.from('profiles').update({
        subscription_status: 'free',
        subscription_tier: null,
        updated_at: new Date().toISOString(),
      }).eq('stripe_customer_id', customerId)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 400 })
  }
})
