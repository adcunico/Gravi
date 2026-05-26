# Subscription and Pricing

## Plans

| Feature | Free | Pro |
|---|---|---|
| Price | £0 | £9.99/month or £89/year |
| Total sessions | 3 | Unlimited |
| Record & Analyse | ✓ All sub-modes | ✓ All sub-modes |
| Debate topics | 2 only | All 10+ |
| Debate Extended format (10 min) | ✗ | ✓ |
| AI debate topic suggestions | ✗ | ✓ |
| Teleprompter | ✗ | ✓ |
| Interview Practice | 1 session only | Unlimited |
| Speech DNA history | Last session only | Full history |
| Audio replay in debrief | ✗ | ✓ |
| Vocabulary library | ✗ | ✓ |
| PDF export (future) | ✗ | ✓ |

Annual plan saves 26% vs monthly (£89 vs £119.88).

---

## Stripe Setup

**Products and prices to create in Stripe dashboard:**
1. Product: "Gravi Pro" — Monthly price: £9.99 GBP recurring monthly
2. Product: "Gravi Pro" — Annual price: £89.00 GBP recurring yearly

Store price IDs in environment variables:
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_PRO_ANNUAL_PRICE_ID`

---

## Edge Functions

### `create-checkout`
- Receives: `{ priceId, successUrl, cancelUrl }`
- Creates Stripe Checkout Session with `mode: 'subscription'`
- Returns: `{ checkoutUrl }`
- Frontend redirects user to Stripe hosted page

### `stripe-webhook`
- Receives Stripe webhook events
- Validate using `STRIPE_WEBHOOK_SECRET`
- Handle `checkout.session.completed`:
  - Get `customer_email` from session
  - Update `users.subscription_status = 'pro'`
  - Store `users.stripe_customer_id`
- Handle `customer.subscription.deleted`:
  - Update `users.subscription_status = 'free'`

---

## Paywall Trigger Logic

**Trigger A — Session limit:**
After a free user completes their 3rd session, the debrief screen shows an upgrade banner above the bottom action buttons.
- Check: `select count(*) from sessions where user_id = auth.uid()` before allowing new session
- If count ≥ 3 and subscription_status = 'free': redirect to /app/upgrade instead of allowing recording

**Trigger B — Feature gate:**
Free user attempts to access a Pro-only feature:
- Teleprompter: clicking nav item or quick action → redirect to /app/upgrade
- Locked debate topics (3–10): clicking "Start Debate →" on locked topic → upgrade modal
- Debate Extended format: clicking "Extended Case" chip → upgrade modal
- AI topic suggestion: clicking "Get Suggestions →" → upgrade modal
- Interview Practice (2nd+ session): attempting to start → upgrade modal
- Audio replay: playback controls shown as locked in debrief → upgrade modal

**Upgrade modal copy:**
> "This is a Pro feature."  
> "Upgrade to Gravi Pro to unlock unlimited sessions, all debate topics, teleprompter, interview practice, and full coaching history."  
> [Upgrade Now] [Maybe later]

---

## Upgrade Page (/app/upgrade)

- Header: "Gravi Pro" (Cormorant Garamond)
- Monthly / Annual toggle (Annual highlighted with "Save 26%")
- Two plan cards side by side: Free (left) vs Pro (right, highlighted gold border)
- Full feature comparison checklist
- "Upgrade Now →" CTA on Pro card → calls `create-checkout`
- After Stripe success: success screen → redirect to /app with Pro badge on user avatar

---

## Billing Management

- "Manage billing" link in /app/settings → Stripe Customer Portal
- Users can: view invoices, change payment method, cancel subscription
- On cancellation: subscription remains active until end of billing period, then webhook fires and status reverts to free
