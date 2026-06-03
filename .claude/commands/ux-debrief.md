# /ux-debrief — Debrief Page Fixes

You are executing **Group C** of the Gravi UX/UI sprint. Run `/ux-global` before this.

Source audit: `DOCS/UX_UI/improvements.md`  
Sprint tracker: `DOCS/UX_UI/sprint.md`  
Primary files: `src/pages/studio/Debrief.tsx`, `src/components/ui/ScoreGauge.tsx`

---

## Context

Gravi is a premium AI speech coaching platform. The Debrief page is the climactic moment of the user journey — the user just finished speaking and sees their score. Every visual choice here should communicate judgment, coaching, and authority. Design system: Cormorant Garamond (display), Inter/DM Sans (body), gold `#D4A85A`.

---

## Findings to implement (in order)

### Finding 19 — Fix tab bar classes (do this first — unblocks visual verification)

**File:** `src/pages/studio/Debrief.tsx`

**Problem:** Tabs use `tab-active` and `tab-inactive` CSS classes that may not be defined anywhere in Tailwind.

**Find the tab bar render** (search for `tab === t.id` or `tab-active`). Replace with explicit inline Tailwind:

```tsx
className={
  tab === t.id
    ? 'border-b-2 border-gold text-ivory pb-3 px-5 text-sm font-sans transition-colors duration-200'
    : 'border-b-2 border-transparent text-ivory-muted hover:text-ivory pb-3 px-5 text-sm font-sans transition-colors duration-200'
}
```

The tab container row should have `border-b border-white/8` so there's a faint baseline under the inactive tabs.

---

### Finding 02 — Score reveal ceremony

**File:** `src/components/ui/ScoreGauge.tsx`

Three changes:

**Change 1 — Remove /100 from SVG**

Find and delete the entire `<text>` element that renders `/ 100` (around lines 111–119). The arc shape communicates "out of 100" without needing the label. Adjust the score number's `y` position to `center` (vertically centered) instead of `center - 4` now that /100 is gone.

**Change 2 — Add glow pulse ring after animation**

Add a new state: `const [showPulse, setShowPulse] = useState(false)`

In the existing `useEffect` that fires the number animation, after the 1200ms animation completes, trigger the pulse:
```tsx
setTimeout(() => setShowPulse(true), 1200)
setTimeout(() => setShowPulse(false), 1700)
```

Add a `<circle>` element beneath the fill circle in the SVG (add it between the track circle and the fill circle):
```tsx
{showPulse && (
  <circle
    cx={center} cy={center} r={r + 4}
    fill="none"
    stroke="url(#goldGradient)"
    strokeWidth={2}
    strokeDasharray={`${arcLength} ${circumference}`}
    strokeDashoffset={0}
    transform={`rotate(${startAngle}, ${center}, ${center})`}
    style={{
      transformOrigin: `${center}px ${center}px`,
      opacity: 0.4,
      animation: 'pulseRing 500ms ease-out forwards',
    }}
  />
)}
```

Add the keyframe via a `<style>` tag inside the SVG or as a global style injection:
```tsx
<defs>
  {/* existing gradient */}
  <style>{`
    @keyframes pulseRing {
      0% { opacity: 0.4; r: ${r}; }
      100% { opacity: 0; r: ${r + 8}; }
    }
  `}</style>
</defs>
```

Note: SVG `r` attribute is not CSS-animatable via keyframes in all browsers. A simpler alternative: animate `opacity` and `strokeWidth` only:
```tsx
style={{
  opacity: showPulse ? 0 : 0.4,
  transition: 'opacity 500ms ease-out',
  strokeWidth: 6,
}}
```
Use the simpler approach — it's cross-browser safe.

**Change 3 — Promote score label**

Find the `showLabel` section (around line 121):
```tsx
<span className="text-xs font-sans text-ivory-secondary mt-1 tracking-wide uppercase">
  {label}
</span>
```

Replace with:
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

Import `motion` from `framer-motion` if not already imported. Remove `uppercase` — the label in Cormorant Garamond at 2xl should not be uppercased.

---

### Finding 03 — Custom audio player

**File:** `src/pages/studio/Debrief.tsx`

**Problem:** The Voice tab renders `<audio controls src={audioSrc} className="w-full rounded-lg accent-[#D4A85A]" />` — a native browser audio element in the Pro debrief. This is the flagship Pro feature and it deserves a custom player.

**Build a minimal custom audio player component** directly in Debrief.tsx (or as a separate file `src/components/ui/AudioPlayer.tsx` — the latter is cleaner for reuse).

The component receives `src: string` and renders:

```tsx
function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) audioRef.current.pause()
    else audioRef.current.play()
    setPlaying(!playing)
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

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
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        )}
      </button>
      <div className="flex-1 space-y-1.5">
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={current}
          onChange={(e) => {
            const t = Number(e.target.value)
            if (audioRef.current) audioRef.current.currentTime = t
            setCurrent(t)
          }}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #D4A85A ${(current / (duration || 1)) * 100}%, rgba(255,255,255,0.08) 0%)`,
          }}
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

In the Voice tab where `<audio controls ...>` currently renders, replace it with `<AudioPlayer src={audioSrc} />`.

---

### Finding 06 — Debrief overview: one document, not four cards

**File:** `src/pages/studio/Debrief.tsx`

**Problem:** The overview tab renders four separate `<GlassCard>` components (summary, strengths, areas to improve, vocabulary upgrades) with identical visual weight.

**Fix:** Find the overview tab render block. Replace the four GlassCards with one single GlassCard containing internal section dividers:

```tsx
<GlassCard>
  {/* Summary */}
  <p className="text-base text-ivory leading-relaxed">{analysis.summary}</p>

  {/* Strengths */}
  <div className="border-t border-white/6 pt-5 mt-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-gold rounded-full" />
      <span className="text-xs font-sans text-ivory-secondary uppercase tracking-[0.12em]">Strengths</span>
    </div>
    <ul className="space-y-2">
      {analysis.strengths?.map((s, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-ivory-secondary leading-relaxed">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1"><polyline points="20 6 9 17 4 12"/></svg>
          {s}
        </li>
      ))}
    </ul>
  </div>

  {/* Areas to Improve */}
  <div className="border-t border-white/6 pt-5 mt-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-amber-400/70 rounded-full" />
      <span className="text-xs font-sans text-ivory-secondary uppercase tracking-[0.12em]">Areas to Improve</span>
    </div>
    <ul className="space-y-2">
      {analysis.improvements?.map((imp, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-ivory-secondary leading-relaxed">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          {imp}
        </li>
      ))}
    </ul>
  </div>

  {/* Vocabulary Upgrades */}
  {analysis.vocabulary_upgrades?.length > 0 && (
    <div className="border-t border-white/6 pt-5 mt-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-white/20 rounded-full" />
        <span className="text-xs font-sans text-ivory-secondary uppercase tracking-[0.12em]">Vocabulary Upgrades</span>
      </div>
      <div className="space-y-2">
        {analysis.vocabulary_upgrades.map((v, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-ivory-muted line-through">{v.original}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/50"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            <span className="text-ivory">{v.improved}</span>
          </div>
        ))}
      </div>
    </div>
  )}
</GlassCard>
```

Adapt to match the actual field names in the `Analysis` type — check `src/types/index.ts` for the exact shape.

---

### Finding 14 — Pace ruler: calculate from actual WPM

**File:** `src/pages/studio/Debrief.tsx`

**Problem:** The pace marker snaps to one of three hardcoded positions (10%, 50%, 85%) based on string comparison. Users at 145 WPM and 158 WPM see the same marker.

**Find the pace ruler render** in the Voice tab. Replace the hardcoded position logic with:

```tsx
// WPM scale: 60 = 0%, 240 = 100%
const wpm = analysis.wpm ?? 130
const pacePercent = Math.max(0, Math.min(100, ((wpm - 60) / 180) * 100))
// Good zone: 120-160 WPM = 33% to 56%
```

Update the marker element to use:
```tsx
style={{ left: `${pacePercent}%` }}
```

Update the good zone highlight:
```tsx
className="absolute h-full bg-gold/10 rounded-full"
style={{ left: '33%', right: '44%' }}
```

Add tick marks at 80, 120, 160, 200 WPM as faint 2px marks above the track:
- 80 WPM = `((80-60)/180)*100` = ~11%
- 120 WPM = ~33%
- 160 WPM = ~56%
- 200 WPM = ~78%

```tsx
{[80, 120, 160, 200].map(wpmTick => (
  <div
    key={wpmTick}
    className="absolute top-0 w-px h-2 bg-white/10"
    style={{ left: `${((wpmTick - 60) / 180) * 100}%` }}
  />
))}
```

Check `src/types/index.ts` for the exact field name — it may be `wpm`, `words_per_minute`, or `pace`. Use whatever the type says.

---

## Verification

After all changes:
- Tab bar shows clear gold underline on active tab, no undefined class warnings
- ScoreGauge shows no "/100", label appears with delay after gauge fills, pulse glow fires at completion
- Voice tab shows custom player: play/pause button, gold progress bar, timestamp
- Overview tab is a single card with internal sections separated by hairlines
- Pace ruler marker moves to a continuous calculated position based on actual WPM

## Update sprint tracker

Mark Findings 02, 03, 06, 14, 19 as `[x]` done in `DOCS/UX_UI/sprint.md`.
