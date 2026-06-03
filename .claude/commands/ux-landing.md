# /ux-landing — Landing Page Fixes

You are executing **Group B** of the Gravi UX/UI sprint. Run `/ux-global` before this.

Source audit: `DOCS/UX_UI/improvements.md`  
Sprint tracker: `DOCS/UX_UI/sprint.md`  
Target file: `src/pages/Landing.tsx`

---

## Context

Gravi is a premium AI speech coaching platform for executives, founders, and lawyers. The landing page must communicate luxury and authority. Font: Cormorant Garamond (display/headings), Inter/DM Sans (body). Gold accent: `#D4A85A` (`text-gold`). All styling is Tailwind CSS.

---

## Findings to implement (in order)

### Finding 04 — Rewrite the hero headline

**Problem:** The current h1 is 18 words trying to be both a tagline and a product description. Neither lands.

**Current state (around line 54):**
```tsx
<h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-tight tracking-tight text-ivory">
  Speak with elite presence. Train with AI that understands the way you speak.
</h1>
<p className="text-base sm:text-lg text-ivory-muted max-w-2xl mx-auto leading-relaxed">
  The private communication studio for founders, executives, lawyers, and consultants who demand more from every word.
</p>
```

**Replace with:**
```tsx
<h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-tight tracking-normal text-ivory">
  Speak with{' '}
  <em className="italic text-gold not-italic" style={{ fontStyle: 'italic' }}>authority.</em>
</h1>
<p className="text-base sm:text-lg text-ivory-secondary max-w-2xl mx-auto leading-relaxed">
  The private studio for founders, executives, and lawyers who take communication seriously.
</p>
```

Note: `not-italic` is wrong here — the word "authority" should be italic. Use `className="italic text-gold"` without `not-italic`. The Cormorant Garamond italic in gold is the visual anchor of the brand.

---

### Finding 13 — Step numbers visibility

**Problem:** Step numbers "01", "02", "03" at `text-gold/20` are nearly invisible ghosts — neither decorative nor functional.

**Fix:** In the "How it works" section, find the step number spans (they render `{step.n}`). Change their className from whatever currently includes `text-gold/20` to `text-gold/50`. Also change from `text-5xl` to `text-6xl` if not already at that size.

Also add a subtle connector between steps. If the steps are in a `flex-col sm:flex-row gap-6` layout, add a left border treatment on each step (except the first) at mobile:
```tsx
// On each step container div, add:
className="... sm:border-l sm:border-white/6 sm:pl-6 first:border-l-0 first:pl-0"
```

---

### Finding 17 — Free tier pricing checkmarks

**Problem:** Free tier uses plain `✓` text characters. Pro tier uses animated gold SVG checkmarks. The free tier looks like a placeholder.

**Fix:** Find the pricing section where the Free tier lists features. Replace every `✓` plain-text character with a grey SVG checkmark component. Define a `GreyCheck` component locally:

```tsx
function GreyCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(158,154,146,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
```

Replace `✓` in the free tier list items with `<GreyCheck />`. Keep the Pro tier's existing animated gold checkmarks unchanged. The contrast between grey (free) and gold animated (pro) communicates tier difference visually.

---

### Finding 18 — Hero pill badges

**Problem:** Three glass box pills ("Personalized delivery coaching", "Session-level Speech DNA", "Private, secure practice studio") look like nav buttons, not value propositions.

**Current state (around line 60):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm sm:text-base font-sans text-ivory-secondary">
  <div className="glass rounded-2xl px-4 py-3">Personalized delivery coaching</div>
  <div className="glass rounded-2xl px-4 py-3">Session-level Speech DNA</div>
  <div className="glass rounded-2xl px-4 py-3">Private, secure practice studio</div>
</div>
```

**Replace with:**
```tsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 text-sm font-sans text-ivory-secondary">
  <span><span className="text-gold/60 mr-1.5">✦</span>Personalized delivery coaching</span>
  <span className="hidden sm:block text-ivory-muted/30 mx-4">·</span>
  <span><span className="text-gold/60 mr-1.5">✦</span>Session-level Speech DNA</span>
  <span className="hidden sm:block text-ivory-muted/30 mx-4">·</span>
  <span><span className="text-gold/60 mr-1.5">✦</span>Private, secure practice studio</span>
</div>
```

This is a pure editorial treatment — no boxes, just text with the ✦ character already used elsewhere in the brand.

---

### Finding 20 — Footer logo and copyright

**Problem:** Logo is too small, wordmark color too faint, and copyright still says 2025.

**Find the footer section** (search for `GraviLogo` in the footer). Make these changes:

1. Change `size={28}` to `size={32}` on `<GraviLogo>`
2. If there's a `<span>` with `text-ivory-secondary` for the "GRAVI" wordmark next to the logo, change to `text-ivory/70`
3. Find `© 2025 Gravi` and change to `© 2026 Gravi`

---

## Verification

After all changes:
- Hero h1 says "Speak with authority." and "authority" is italic gold
- No tracking-tight on h1 (should already be fixed by /ux-global but confirm)
- Step numbers are clearly visible at text-gold/50
- Free tier has grey SVG checkmarks, Pro tier has gold SVG checkmarks
- Pills in hero are plain text with ✦ prefix, no glass boxes
- Footer logo is 32px and copyright reads 2026

## Update sprint tracker

Mark Findings 04, 13, 17, 18, 20 as `[x]` done in `DOCS/UX_UI/sprint.md`.
