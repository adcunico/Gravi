# /ux-global — Global Component Fixes

You are executing **Group A** of the Gravi UX/UI sprint. These are global component fixes that other groups depend on — run this before `/ux-landing`, `/ux-debrief`, `/ux-dashboard`.

Source audit: `DOCS/UX_UI/improvements.md`  
Sprint tracker: `DOCS/UX_UI/sprint.md`

---

## Context

Gravi is a premium AI speech coaching platform. Design system: Cormorant Garamond for display headings, Inter/DM Sans for body, gold accent `#D4A85A`, near-black background `#0B0B0D`. All styling is Tailwind CSS.

---

## Findings to implement (in order)

### Finding 01 — Replace emoji icons with SVGs

**Problem:** Landing `FEATURES` array uses `🎤⚔️🧬` and Dashboard stat tiles use `⚡🔥⏱️🎯`. Emoji in a premium product destroys brand credibility.

**Fix 1 — Landing.tsx (`src/pages/Landing.tsx`)**

The `FEATURES` array currently is:
```js
const FEATURES = [
  { icon: '🎤', title: 'Guided Delivery', ... },
  { icon: '⚔️', title: 'Debate Arena', ... },
  { icon: '🧬', title: 'Speech DNA', ... },
]
```

Replace each `icon` string with a JSX element using the SVG icon components already defined at the bottom of `Sidebar.tsx`. Copy those three icon functions (`MicIcon`, `SwordsIcon`, `DNAIcon`) into Landing.tsx (or import them if you refactor to a shared file — but for now, define them locally at the bottom of Landing.tsx).

Change the FEATURES array to use `icon: <MicIcon size={28} className="text-gold/70" />` etc.

Where the features are rendered, wrap each icon in: `<div className="w-14 h-14 rounded-2xl bg-gold/8 border border-gold/15 flex items-center justify-center mb-4">{feature.icon}</div>`

**Fix 2 — Dashboard.tsx (`src/pages/Dashboard.tsx`)**

The stat tiles array (around line 202) currently has:
```js
{ label: 'Confidence Score', value: ..., sub: ..., icon: '⚡' },
{ label: 'Current Streak', value: ..., sub: ..., icon: '🔥' },
{ label: 'Minutes Practiced', value: ..., sub: ..., icon: '⏱️' },
{ label: 'Total Sessions', value: ..., sub: ..., icon: '🎯' },
```

Replace the emoji strings with JSX SVG components. Define these four icon functions locally at the bottom of Dashboard.tsx (or in a shared location):

- Lightning (⚡): `<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/60"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
- Flame (🔥): `<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/60"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
- Clock (⏱️): `<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/60"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
- Target (🎯): `<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/60"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`

Change the `icon` field type from string to `ReactNode` (or `JSX.Element`). In the render, replace `<span className="text-base">{stat.icon}</span>` with `{stat.icon}`.

---

### Finding 05 — Remove tracking-tight from display headings

**File:** `src/pages/Landing.tsx`

Find the hero `h1` (around line 54):
```
className="font-display text-5xl sm:text-6xl md:text-7xl leading-tight tracking-tight text-ivory"
```

Remove `tracking-tight`. The result should be `tracking-normal` (the Tailwind default) or add `tracking-normal` explicitly for clarity.

Check all other `font-display` headings in the file for `tracking-tight` and remove it from each. The small overline labels (`text-sm uppercase tracking-[0.35em]`) are correct — do not touch those.

---

### Finding 07 — Document 5-tier gold hierarchy

**File:** `tailwind.config.ts` (root of project)

Add a comment block near the gold color definitions documenting the usage tiers. Find where `gold` is defined in the theme and add above it:

```ts
// Gold Usage Hierarchy (5 tiers):
// Tier 1 — Background tints:  bg-gold/5 to bg-gold/8  (subtle fills, hover states)
// Tier 2 — Structural:        border-gold/20           (card borders on gold-variant cards)
// Tier 3 — Secondary:         text-gold/60             (inactive states, secondary labels, decorative numbers)
// Tier 4 — Primary accent:    text-gold / border-gold/40  (active nav, CTAs, key values)
// Tier 5 — Highlights only:   text-gold-light / shadow-gold  (score reveals, hover glow, positive moments)
```

No code changes needed — this is documentation only. The actual step number fix (text-gold/20 → text-gold/50) is handled in Finding 13 in `/ux-landing`.

---

### Finding 10 — ScoreBar visualization

**File:** `src/components/ui/ScoreBar.tsx`

Three changes:

1. Track height: Change `h-1` to `h-1.5` on the track `<div>` (around line 31)
2. Track background: Change `bg-white/5` to `bg-white/8` on the same element
3. Score label: Change `text-sm font-semibold font-sans` to `font-display text-base` on the score `<span>` (around line 29)

---

### Finding 12 — Button hover interactions

**File:** `src/components/ui/Button.tsx`

Current state: `whileHover={{ scale: 1.01 }}` on all buttons — imperceptible.

Replace the single `whileHover` with variant-aware behavior. You need to pass different hover props based on the `variant` prop.

The cleanest approach: remove the static `whileHover={{ scale: 1.01 }}` from the `motion.button` and instead define hover variants per button variant:

```tsx
const hoverAnimation =
  variant === 'gold'
    ? { boxShadow: '0 0 28px rgba(212,168,90,0.35)' }
    : variant === 'ghost'
    ? { backgroundColor: 'rgba(212,168,90,0.06)', borderColor: 'rgba(212,168,90,0.7)' }
    : { opacity: 0.85 }
```

Then on the `motion.button`: `whileHover={hoverAnimation} whileTap={{ scale: 0.97 }}`

Keep `whileTap={{ scale: 0.97 }}` — the tap-down is correct.

---

### Finding 15 — GlassCard gold variant

**File:** `src/components/ui/GlassCard.tsx`

Current: `gold ? 'border-gold/30' : ''`

Change to: `gold ? 'border-gold/30 bg-gold/3 shadow-gold' : ''`

This adds a barely perceptible warm gold tint to the card background and a subtle ambient glow — enough to differentiate featured cards (pricing, hero) from neutral glass cards.

---

## Verification

After making all changes:
1. Check `src/pages/Landing.tsx` — no emoji characters remain in FEATURES
2. Check `src/pages/Dashboard.tsx` — no emoji characters in the stat tiles array
3. Visually confirm ScoreBar looks thicker and more legible
4. Confirm Button hover on gold variant glows instead of scaling
5. Confirm GlassCard with `gold` prop looks warmer than a plain GlassCard

## Update sprint tracker

After completing, mark Findings 01, 05, 07, 10, 12, 15 as `[x]` done in `DOCS/UX_UI/sprint.md`.
