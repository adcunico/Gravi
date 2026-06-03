# /ux-dashboard — Dashboard & Sidebar Fixes

You are executing **Group D** of the Gravi UX/UI sprint. Run `/ux-global` before this.

Source audit: `DOCS/UX_UI/improvements.md`  
Sprint tracker: `DOCS/UX_UI/sprint.md`

---

## Context

Gravi is a premium AI speech coaching platform. The dashboard is the first screen after login. The sidebar is the primary navigation. Both must feel intentional and premium — no dead ends, no confusion about where to go.

---

## Findings to implement

### Finding 09 — Empty states: motivational, not confrontational

**File:** `src/pages/Dashboard.tsx`

**Problem:** New users see "No sessions yet" and "Complete a session to see your DNA" everywhere. This is the moment of maximum motivation — they've just signed up. The empty state should create desire, not communicate emptiness.

**Fix 1 — Speech DNA panel empty state** (around lines 274–278)

Current:
```tsx
<div className="py-8 text-center">
  <p className="text-sm text-ivory-muted">No sessions yet</p>
  <p className="text-xs text-ivory-muted mt-1">Complete a session to see your DNA</p>
</div>
```

Replace with a ghost/skeleton version of the DNA panel that shows what they'll get:
```tsx
<div className="py-4 space-y-4">
  {/* Ghost score gauge */}
  <div className="flex justify-center mb-4">
    <div className="w-[120px] h-[120px] rounded-full border-4 border-dashed border-white/10 flex items-center justify-center opacity-40">
      <span className="font-display text-3xl text-ivory-muted">—</span>
    </div>
  </div>
  {/* Ghost score bars */}
  <div className="space-y-3 opacity-30">
    {['Clarity', 'Confidence', 'Persuasion', 'Vocal Variety', 'Pacing', 'Conciseness'].map((label) => (
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

**Fix 2 — Recent sessions empty state** (search for the recent sessions section)

Find where recent sessions renders an empty state. The copy should be:
- Heading: "Your first session starts here."
- Subtitle: "Record, get analysed, and see exactly where you stand in minutes."
- Keep the existing CTA button

If no recent sessions empty state exists at the component level (sessions list section), add one wherever sessions would be listed when `sessions.length === 0`.

---

### Finding 11 — Sidebar navigation grouping

**File:** `src/components/layout/Sidebar.tsx`

**Problem:** Seven nav items at identical visual weight mix destinations (Home, Profile) with practice modes (Studio, Debate, Prompts) and analytics (DNA, Sessions). No mental model.

**Fix:** The `nav` array currently is:
```ts
const nav = [
  { to: '/dashboard', label: 'Home', icon: HomeIcon },
  { to: '/studio', label: 'Studio', icon: MicIcon },
  { to: '/debate', label: 'Debate Arena', icon: SwordsIcon },
  { to: '/prompts', label: 'Prompt Arena', icon: LibraryIcon },
  { to: '/analytics', label: 'Speech DNA', icon: DNAIcon },
  { to: '/sessions', label: 'Sessions', icon: HistoryIcon },
  { to: '/profile', label: 'Profile', icon: UserIcon },
]
```

Split into two groups and insert a divider between them. The cleanest approach: keep the array but add a divider after the 4th item in the render.

Change the `nav` render block from a single `.map()` to:

```tsx
<nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Main navigation">
  {/* Practice destinations */}
  {nav.slice(0, 4).map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} className={...}>
      {/* existing render */}
    </NavLink>
  ))}

  {/* Divider */}
  <div className="h-px bg-white/6 mx-1 my-2" />

  {/* Analytics & history */}
  {nav.slice(4, 6).map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} className={...}>
      {/* existing render */}
    </NavLink>
  ))}
</nav>
```

Profile stays in the user footer section below the sign-out divider (it already is — do not move it).

Remove `space-y-1` from the `<nav>` if using the sliced approach, and add `space-y-1` inside each group div:

```tsx
<div className="space-y-1">{/* practice items */}</div>
<div className="h-px bg-white/6 mx-1 my-2" />
<div className="space-y-1">{/* analytics items */}</div>
```

---

## Verification

After all changes:
- New user dashboard: Speech DNA panel shows ghost skeleton with label, not "No sessions yet"
- Sidebar: faint horizontal line separates Studio/Debate/Prompts from Speech DNA/Sessions
- Profile still lives in the bottom user footer, not the nav list
- No layout breaks at any breakpoint

## Update sprint tracker

Mark Findings 09 and 11 as `[x]` done in `DOCS/UX_UI/sprint.md`.
