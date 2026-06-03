# /ux-sprint — Full UX/UI Sprint

You are a senior frontend engineer executing a complete UX/UI polish sprint for Gravi — a premium AI speech coaching platform for executives, founders, and lawyers. Design system: Cormorant Garamond (display), Inter/DM Sans (body), gold `#D4A85A` (`text-gold`), near-black `#0B0B0D`. All styling is Tailwind CSS + Framer Motion.

Sprint tracker: `DOCS/UX_UI/sprint.md` — update status to `[x]` as you complete each finding.

**Execute all findings below in order. Read each target file before editing it.**

---

## GROUP A — Global Components (run first — other groups depend on these)

### F01 — Replace emoji icons with SVGs

**`src/pages/Landing.tsx`** — FEATURES array uses `🎤⚔️🧬`. Replace each icon string with JSX. Define these locally at the bottom of Landing.tsx:

```tsx
function MicIcon({ size = 28, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
}
function SwordsIcon({ size = 28, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/></svg>
}
function DNAIcon({ size = 28, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M2 15C8 15 16 9 22 9"/><path d="M2 9c6 0 14 6 20 6"/></svg>
}
```

Change FEATURES to:
```ts
const FEATURES = [
  { icon: <MicIcon className="text-gold/70" />, title: 'Guided Delivery', desc: '...' },
  { icon: <SwordsIcon className="text-gold/70" />, title: 'Debate Arena', desc: '...' },
  { icon: <DNAIcon className="text-gold/70" />, title: 'Speech DNA', desc: '...' },
]
```

Wrap each icon in the feature card render: `<div className="w-14 h-14 rounded-2xl bg-gold/8 border border-gold/15 flex items-center justify-center mb-4">{feature.icon}</div>`

**`src/pages/Dashboard.tsx`** — stat tiles array uses `⚡🔥⏱️🎯`. Define these SVG components locally at the bottom of Dashboard.tsx and replace the emoji strings with JSX elements. Change the `icon` field to `ReactNode`:

- Lightning: `<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/60"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
- Flame: `<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/60"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
- Clock: `<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/60"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
- Target: `<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/60"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`

In the render, replace `<span className="text-base">{stat.icon}</span>` with `{stat.icon}`.

### F05 — Remove tracking-tight from display headings

**`src/pages/Landing.tsx`** — find the hero h1 with `tracking-tight` and remove it. Use `tracking-normal` instead. Check all other `font-display` headings for `tracking-tight` and remove it. Do not touch small overline labels with `tracking-[0.35em]`.

### F07 — Document gold hierarchy

**`tailwind.config.ts`** — find where gold is defined and add this comment block above it:
```ts
// Gold Usage Hierarchy:
// Tier 1 — bg-gold/5 to bg-gold/8     → background tints, hover fills
// Tier 2 — border-gold/20             → card borders (gold variant)
// Tier 3 — text-gold/60               → secondary labels, icons, inactive
// Tier 4 — text-gold / border-gold/40 → active nav, CTAs, key values
// Tier 5 — text-gold-light / shadow-gold → score reveals, glow, highlights
```

### F10 — ScoreBar: thicker and more legible

**`src/components/ui/ScoreBar.tsx`**:
1. Track `<div>`: change `h-1` → `h-1.5`, change `bg-white/5` → `bg-white/8`
2. Score `<span>`: change `text-sm font-semibold font-sans` → `font-display text-base`

### F12 — Button hover: glow not scale

**`src/components/ui/Button.tsx`** — compute hover animation based on variant:

```tsx
const hoverAnimation =
  variant === 'gold'
    ? { boxShadow: '0 0 28px rgba(212,168,90,0.35)' }
    : variant === 'ghost'
    ? { backgroundColor: 'rgba(212,168,90,0.06)', borderColor: 'rgba(212,168,90,0.7)' }
    : { opacity: 0.85 }
```

Replace `whileHover={{ scale: 1.01 }}` on the `motion.button` with `whileHover={hoverAnimation}`. Keep `whileTap={{ scale: 0.97 }}` unchanged.

### F15 — GlassCard gold variant: warmer background

**`src/components/ui/GlassCard.tsx`** — change:
```tsx
gold ? 'border-gold/30' : ''
```
to:
```tsx
gold ? 'border-gold/30 bg-gold/3 shadow-gold' : ''
```

---

## GROUP B — Landing Page

### F04 — Hero headline

**`src/pages/Landing.tsx`** — replace the h1 and subtitle:

```tsx
<h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-tight tracking-normal text-ivory">
  Speak with{' '}
  <em className="italic text-gold">authority.</em>
</h1>
<p className="text-base sm:text-lg text-ivory-secondary max-w-2xl mx-auto leading-relaxed">
  The private studio for founders, executives, and lawyers who take communication seriously.
</p>
```

### F13 — Step numbers: visible, not ghosted

**`src/pages/Landing.tsx`** — in the How It Works section, find where step numbers render (they show "01", "02", "03"). Change their opacity from `text-gold/20` to `text-gold/50`. If step size is `text-5xl`, change to `text-6xl`. On each step wrapper div add `sm:border-l sm:border-white/6 sm:pl-6` (except the first: `first:border-l-0 first:pl-0`).

### F17 — Free tier checkmarks: grey SVGs

**`src/pages/Landing.tsx`** — in the pricing section free tier, find every plain `✓` and replace with a grey SVG check. Define locally:

```tsx
function GreyCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(158,154,146,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
```

Replace `✓` occurrences in the free tier list items with `<GreyCheck />`. Leave Pro tier checkmarks unchanged.

### F18 — Hero pill badges: editorial text, not glass boxes

**`src/pages/Landing.tsx`** — find the three glass pill `<div>` elements in the hero (Personalized delivery coaching / Session-level Speech DNA / Private, secure practice studio). Replace the entire grid with:

```tsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 text-sm font-sans text-ivory-secondary">
  <span><span className="text-gold/60 mr-1.5">✦</span>Personalized delivery coaching</span>
  <span className="hidden sm:block text-ivory-muted/30 mx-4">·</span>
  <span><span className="text-gold/60 mr-1.5">✦</span>Session-level Speech DNA</span>
  <span className="hidden sm:block text-ivory-muted/30 mx-4">·</span>
  <span><span className="text-gold/60 mr-1.5">✦</span>Private, secure practice studio</span>
</div>
```

### F20 — Footer logo and copyright

**`src/pages/Landing.tsx`** — in the footer: change `size={28}` → `size={32}` on GraviLogo. Change any `text-ivory-secondary` on the "GRAVI" wordmark span to `text-ivory/70`. Change `© 2025` → `© 2026`.

---

## GROUP C — Debrief

### F19 — Tab bar classes (do this first)

**`src/pages/studio/Debrief.tsx`** — find the tab bar render (search for `tab-active` or `tab === t.id`). Replace with explicit Tailwind:

```tsx
className={
  tab === t.id
    ? 'border-b-2 border-gold text-ivory pb-3 px-5 text-sm font-sans transition-colors duration-200'
    : 'border-b-2 border-transparent text-ivory-muted hover:text-ivory pb-3 px-5 text-sm font-sans transition-colors duration-200'
}
```

Ensure the tab row container has `border-b border-white/8`.

### F02 — Score reveal ceremony

**`src/components/ui/ScoreGauge.tsx`**:

1. **Remove /100**: Delete the `<text>` element that renders `/ 100`. Move the score number `y` to `center` (vertically centered).

2. **Add glow pulse**: Add state `const [showPulse, setShowPulse] = useState(false)`. In the number animation `useEffect`, after the 1200ms animation completes add: `setTimeout(() => { setShowPulse(true); setTimeout(() => setShowPulse(false), 500) }, 1200)`. Add a pulse circle between the track and fill circles:
```tsx
{showPulse && (
  <circle
    cx={center} cy={center} r={r + 3}
    fill="none"
    stroke="url(#goldGradient)"
    strokeWidth={3}
    strokeDasharray={`${arcLength} ${circumference}`}
    transform={`rotate(${startAngle}, ${center}, ${center})`}
    style={{ transformOrigin: `${center}px ${center}px`, opacity: 0.35, transition: 'opacity 500ms ease-out' }}
  />
)}
```

3. **Promote score label**: Replace the `showLabel` span with:
```tsx
<motion.span
  initial={{ opacity: 0, y: 4 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.5, duration: 0.4 }}
  className="font-display text-2xl text-ivory mt-2"
>
  {label}
</motion.span>
```
Import `motion` from `framer-motion` if not already imported.

### F03 — Custom audio player

**`src/pages/studio/Debrief.tsx`** — define an `AudioPlayer` component (inline in Debrief.tsx or as `src/components/ui/AudioPlayer.tsx`):

```tsx
function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    if (!audioRef.current) return
    playing ? audioRef.current.pause() : audioRef.current.play()
    setPlaying(!playing)
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-midnight-graphite/40">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors flex-shrink-0"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        }
      </button>
      <div className="flex-1 space-y-1.5">
        <input
          type="range" min={0} max={duration || 1} value={current}
          onChange={e => { const t = Number(e.target.value); if (audioRef.current) audioRef.current.currentTime = t; setCurrent(t) }}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #D4A85A ${(current / (duration || 1)) * 100}%, rgba(255,255,255,0.08) 0%)` }}
        />
        <div className="flex justify-between text-xs text-ivory-muted font-sans">
          <span>{fmt(current)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  )
}
```

Add `useRef` to the React import. Replace `<audio controls src={audioSrc} ... />` with `<AudioPlayer src={audioSrc} />`.

### F06 — Debrief overview: one document

**`src/pages/studio/Debrief.tsx`** — find the overview tab block. Replace all four separate GlassCards with one single GlassCard. Check `src/types/index.ts` for exact field names on the Analysis type. Structure:

```tsx
<GlassCard>
  <p className="text-base text-ivory leading-relaxed">{analysis.summary}</p>

  {analysis.strengths?.length > 0 && (
    <div className="border-t border-white/6 pt-5 mt-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-gold rounded-full" />
        <span className="text-xs font-sans text-ivory-secondary uppercase tracking-[0.12em]">Strengths</span>
      </div>
      <ul className="space-y-2">
        {analysis.strengths.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ivory-secondary leading-relaxed">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1"><polyline points="20 6 9 17 4 12"/></svg>
            {s}
          </li>
        ))}
      </ul>
    </div>
  )}

  {analysis.improvements?.length > 0 && (
    <div className="border-t border-white/6 pt-5 mt-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-amber-400/70 rounded-full" />
        <span className="text-xs font-sans text-ivory-secondary uppercase tracking-[0.12em]">Areas to Improve</span>
      </div>
      <ul className="space-y-2">
        {analysis.improvements.map((imp, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ivory-secondary leading-relaxed">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            {imp}
          </li>
        ))}
      </ul>
    </div>
  )}

  {analysis.vocabulary_upgrades?.length > 0 && (
    <div className="border-t border-white/6 pt-5 mt-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-white/20 rounded-full" />
        <span className="text-xs font-sans text-ivory-secondary uppercase tracking-[0.12em]">Vocabulary Upgrades</span>
      </div>
      <div className="space-y-2">
        {analysis.vocabulary_upgrades.map((v, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-ivory-muted line-through">{v.original ?? v}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/50"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            <span className="text-ivory">{v.improved ?? ''}</span>
          </div>
        ))}
      </div>
    </div>
  )}
</GlassCard>
```

Adapt field names to match whatever `Analysis` type has in `src/types/index.ts`.

### F14 — Pace ruler: calculated from WPM

**`src/pages/studio/Debrief.tsx`** — in the Voice tab, find the pace ruler. Check `src/types/index.ts` for the WPM field name (may be `wpm`, `words_per_minute`, or `pace`). Replace hardcoded position logic with:

```tsx
const wpm = analysis.wpm ?? analysis.words_per_minute ?? 130
const pacePercent = Math.max(0, Math.min(100, ((wpm - 60) / 180) * 100))
```

Set the marker position with `style={{ left: `${pacePercent}%` }}`.

Good zone: `style={{ left: '33%', right: '44%' }}` (120–160 WPM).

Add tick marks:
```tsx
{[80, 120, 160, 200].map(tick => (
  <div key={tick} className="absolute top-0 w-px h-2 bg-white/10"
    style={{ left: `${((tick - 60) / 180) * 100}%` }} />
))}
```

---

## GROUP D — Dashboard & Sidebar

### F09 — Empty states: motivational

**`src/pages/Dashboard.tsx`** — find the Speech DNA panel empty state (where `sessions.length === 0`). Replace "No sessions yet / Complete a session to see your DNA" with:

```tsx
<div className="py-4 space-y-4">
  <div className="flex justify-center">
    <div className="w-[120px] h-[120px] rounded-full border-4 border-dashed border-white/10 flex items-center justify-center opacity-40">
      <span className="font-display text-3xl text-ivory-muted">—</span>
    </div>
  </div>
  <div className="space-y-3 opacity-30">
    {['Clarity', 'Confidence', 'Persuasion', 'Vocal Variety', 'Pacing', 'Conciseness'].map(label => (
      <div key={label} className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-xs text-ivory-secondary">{label}</span>
          <span className="text-xs text-ivory-muted">—</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full" />
      </div>
    ))}
  </div>
  <div className="text-center pt-2 space-y-1">
    <p className="text-sm text-ivory-secondary">Your Speech DNA appears after your first session.</p>
    <p className="text-xs text-ivory-muted">6 scores. Tracked over time. Every session sharpens the picture.</p>
  </div>
</div>
```

Also find any recent sessions empty state and update its copy to: "Your first session starts here." with subtitle "Record, get analysed, and see exactly where you stand in minutes."

### F11 — Sidebar navigation grouping

**`src/components/layout/Sidebar.tsx`** — the `nav` array has 7 items. In the render, split into two groups with a divider after item index 3 (after Prompt Arena, before Speech DNA):

```tsx
<nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Main navigation">
  <div className="space-y-1">
    {nav.slice(0, 4).map(({ to, label, icon: Icon }) => (
      <NavLink key={to} to={to} className={...}>{/* existing */}</NavLink>
    ))}
  </div>
  <div className="h-px bg-white/6 mx-1 my-2" />
  <div className="space-y-1">
    {nav.slice(4, 6).map(({ to, label, icon: Icon }) => (
      <NavLink key={to} to={to} className={...}>{/* existing */}</NavLink>
    ))}
  </div>
</nav>
```

Profile stays in the bottom user footer — do not move it.

---

## GROUP E — Upgrade Page

### F08 — Hero section and already-Pro state

**`src/pages/Upgrade.tsx`** — read the file first. Add a hero section before the existing toggle/price card:

```tsx
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

Find the already-Pro state. Replace any `✨` with `✦`. Update the message to:
```tsx
<div className="text-center space-y-3 py-12">
  <span className="text-gold text-2xl">✦</span>
  <h2 className="font-display text-3xl text-ivory">Welcome to Gravi Pro.</h2>
  <p className="text-sm text-ivory-secondary">Unlimited sessions, full analytics, and audio replay are active on your account.</p>
</div>
```

Import `motion` from `framer-motion` if not already imported.

---

## GROUP F — Mobile Nav

### F16 — Verify MobileNav (already exists)

**`src/components/layout/MobileNav.tsx`** — MobileNav already exists and is wired into AppLayout. Verify:

1. Active items show `text-gold` ✓ — if missing gold dot indicator, add:
```tsx
{isActive && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />}
```
Make the tab button `relative` for the dot to position correctly.

2. Check `mobile-safe-bottom` is defined in `tailwind.config.ts`. If not defined, add inline safe-area style to the `<nav>`: `style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}`

3. Verify `AppLayout.tsx` main has `pb-20 lg:pb-0` so content isn't hidden under the nav.

---

## After all groups complete

1. Update every finding in `DOCS/UX_UI/sprint.md` to `[x]`
2. Report: files changed, any findings that needed adaptation (e.g. field name differences in Analysis type), any type errors to watch for
