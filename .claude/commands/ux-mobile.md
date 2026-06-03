# /ux-mobile — Mobile Navigation Audit & Polish

You are executing **Group F** of the Gravi UX/UI sprint.

Source audit: `DOCS/UX_UI/improvements.md` (Finding 16)  
Sprint tracker: `DOCS/UX_UI/sprint.md`

---

## Context

Finding 16 flagged that mobile navigation was completely absent. **Good news: it already exists.** `src/components/layout/MobileNav.tsx` is implemented and wired into `AppLayout.tsx`. Your job is to verify it's complete, polished, and matches the design system — not to build it from scratch.

---

## Audit tasks (read before touching anything)

**Step 1 — Read these files:**
- `src/components/layout/MobileNav.tsx`
- `src/components/layout/AppLayout.tsx`
- `tailwind.config.ts` (check for `mobile-safe-bottom` or safe-area utilities)

**Step 2 — Verify each of the following:**

### Check 1 — Active state gold dot indicator

The audit spec says: active items should have `text-gold` with a **small gold dot indicator** below the icon.

Current MobileNav uses `text-gold` for active items — that's correct. But does it have the gold dot?

If missing, add a dot beneath each active icon:
```tsx
{({ isActive }) => (
  <>
    <Icon size={22} className={isActive ? 'text-gold' : 'text-ivory-muted'} />
    <span className="text-[10px] font-sans font-medium">{label}</span>
    {isActive && (
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
    )}
  </>
)}
```

Make the tab button `relative` so the dot positions correctly.

### Check 2 — iOS safe-area padding

Verify `pb-safe` or `pb-[env(safe-area-inset-bottom)]` is applied to handle iPhone notch/home indicator. 

Current code has `mobile-safe-bottom` class on the nav. Check if this is defined in `tailwind.config.ts`. If it's not defined (which would mean it silently has no effect), replace with:
```tsx
style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
```
or add to Tailwind config:
```ts
'.mobile-safe-bottom': {
  paddingBottom: 'env(safe-area-inset-bottom, 8px)',
}
```

### Check 3 — Main content bottom padding

In `AppLayout.tsx`, the `<main>` should have `pb-20 lg:pb-0` so content is not obscured by the fixed bottom nav on mobile. Verify this exists. If `pb-20` is too much or too little (nav height is ~64px = pb-16), adjust.

### Check 4 — Nav items match sidebar

Current MobileNav tabs: Home, Studio, Debate, DNA, Profile  
Current Sidebar: Home, Studio, Debate Arena, Prompt Arena, Speech DNA, Sessions, Profile

MobileNav correctly limits to 5 items (max for bottom nav). Confirm the 5 chosen items are the right ones: Home, Studio, Debate, DNA, Profile. Sessions and Prompts are acceptable to omit (accessible via full nav). This is intentional — no change needed if the 5 items are correct.

### Check 5 — Transition animation

Add a subtle scale/opacity transition on the active state change. On each tab button, add:
```tsx
className={`... transition-all duration-200`}
```
This is likely already there, just confirm it's not missing.

---

## If everything is correct

If the mobile nav is already fully correct (dot indicator, safe-area padding, correct items, transitions), just confirm it and mark Finding 16 as done. Do not make changes just to make changes.

---

## Verification

- On a simulated mobile viewport (DevTools): bottom nav is visible at screen bottom
- Active tab shows gold text + gold dot
- No content is cut off behind the nav
- Safe-area padding is functional (no overlap with iPhone home indicator)

## Update sprint tracker

Mark Finding 16 as `[x]` done in `DOCS/UX_UI/sprint.md`.
