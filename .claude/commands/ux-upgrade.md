# /ux-upgrade — Upgrade Page Fixes

You are executing **Group E** of the Gravi UX/UI sprint.

Source audit: `DOCS/UX_UI/improvements.md`  
Sprint tracker: `DOCS/UX_UI/sprint.md`  
Target file: `src/pages/Upgrade.tsx`

---

## Context

Gravi is a premium AI speech coaching platform. The upgrade page is where free users convert to Pro (£9.99/mo). The current page is emotionally inert — it reads like a 2019 SaaS pricing page. The target user is a founder or executive who doesn't buy tools, they join movements. The page must answer: "Why does this matter to someone like me?"

---

## Finding 08 — Upgrade page: invitation, not transaction

**File:** `src/pages/Upgrade.tsx`

Read the current file first to understand its structure before editing.

**Add a hero section above the price card:**

Insert this block before the existing toggle/price card:

```tsx
{/* Hero section */}
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="text-center space-y-4 mb-10"
>
  <h1 className="font-display text-4xl sm:text-5xl italic text-ivory">
    Your voice is your competitive advantage.
  </h1>
  <p className="text-sm text-ivory-secondary max-w-xl mx-auto leading-relaxed">
    Gravi Pro gives you the tools to develop it — with no session limits, full analytics, and audio replay to hear exactly what others hear.
  </p>

  {/* Role personas */}
  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
    {[
      { role: 'Founders', outcome: 'Command the room in every pitch.' },
      { role: 'Lawyers', outcome: 'Argue with precision and authority.' },
      { role: 'Executives', outcome: 'Lead with a voice people follow.' },
    ].map(({ role, outcome }) => (
      <div key={role} className="glass rounded-xl px-4 py-3 text-center min-w-[160px]">
        <div className="text-xs font-sans text-gold/70 uppercase tracking-[0.12em] mb-1">{role}</div>
        <div className="text-xs text-ivory-secondary leading-snug">{outcome}</div>
      </div>
    ))}
  </div>
</motion.div>
```

**Fix the already-Pro state:**

Find wherever the component renders the "already on Pro" state (search for `subscription_status === 'pro'` or `You're already on Pro` or similar). 

Replace any `✨` emoji with `✦` (the brand character).

The already-Pro message should read:
```tsx
<div className="text-center space-y-3 py-12">
  <span className="text-gold text-2xl">✦</span>
  <h2 className="font-display text-3xl text-ivory">Welcome to Gravi Pro.</h2>
  <p className="text-sm text-ivory-secondary">Unlimited sessions, full analytics, and audio replay are active on your account.</p>
</div>
```

If `motion` from `framer-motion` is not already imported in Upgrade.tsx, add it.

---

## Verification

- Hero section appears above the price card with italic headline
- Three role persona pills visible on the upgrade page
- No emoji characters (✨) in any state of the page — use ✦ instead
- Already-Pro state feels like a confirmation, not an afterthought

## Update sprint tracker

Mark Finding 08 as `[x]` done in `DOCS/UX_UI/sprint.md`.
