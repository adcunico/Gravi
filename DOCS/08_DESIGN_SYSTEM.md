# Design System

## Design Philosophy

Gravi looks and feels like a premium executive coaching service. The visual language is calm, authoritative, and focused. Nothing should distract from the content. The design earns trust before the user says a word.

**Tone:** Calm meets LinkedIn meets a high-end SaaS tool.  
**Anti-patterns:** No gamification badges. No confetti. No streaks. No cartoon mascots. No purple gradient on white (the default AI aesthetic). No generic fonts.

---

## Colour Palette

```css
:root {
  /* Backgrounds */
  --color-bg:              #0D0F14;   /* deep near-black — main background */
  --color-surface:         #141720;   /* card and panel surfaces */
  --color-border:          #1E2230;   /* subtle card borders */

  /* Brand accent */
  --color-gold:            #C9A84C;   /* primary accent — CTAs, scores, icons */
  --color-gold-light:      #E2C97E;   /* hover state of gold elements */

  /* Text */
  --color-text:            #F4F4F5;   /* primary text */
  --color-muted:           #8B8FA8;   /* secondary / helper text */

  /* Status */
  --color-success:         #4CAF7C;   /* positive indicators */
  --color-error:           #E05C5C;   /* errors and warnings */

  /* Mode accents (used exclusively for their respective modes) */
  --color-debate-for:      #4C8FC9;   /* Debate Arena — FOR position */
  --color-debate-against:  #C94C4C;   /* Debate Arena — AGAINST position */
  --color-interview:       #8B6FCB;   /* Interview Practice mode */
}
```

**Usage rules:**
- Gold is used only for CTAs, score values, key metrics, and active highlights
- Blue/red are used ONLY in the Debate Arena — never anywhere else
- Purple is used ONLY in the Interview Practice mode
- Never use white backgrounds — always `--color-bg` or `--color-surface`

---

## Typography

**Display / headings:** Cormorant Garamond (Google Fonts)
- Used for: page titles, session titles, score labels, hero copy
- Weight: 400 regular and 600 semibold
- Provides elegance and gravitas without being stuffy

**Body / UI:** DM Sans (Google Fonts)
- Used for: all body copy, labels, buttons, form fields, metadata
- Weight: 400 regular and 500 medium
- Clean and highly readable at small sizes

**Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```

**Type scale (approximate):**
- Page title: Cormorant Garamond 32–40px
- Section heading: Cormorant Garamond 22–28px
- Body: DM Sans 14–16px
- Label / badge: DM Sans 11–13px
- Stat numbers: Cormorant Garamond 48–64px (score gauges)

---

## Component Principles

**Cards:**
- Background: `--color-surface`
- Border: `1px solid var(--color-border)`
- Border radius: `12px`
- No heavy drop shadows — border contrast creates depth
- Hover: border becomes slightly lighter or gold-tinted on interactive cards

**Buttons:**
- Primary: gold background, dark text, `border-radius: 8px`
- Ghost / secondary: transparent background, gold border, gold text
- Destructive: error red
- Disabled: 40% opacity, no hover effect

**Progress bars / score bars:**
- Track: `--color-border`
- Fill: `--color-gold`
- Height: 4–6px, `border-radius: 999px`

**Badges / chips:**
- Small pill shape, `border-radius: 999px`
- Coloured by context (mode badge = gold, debate position = blue/red, interview = purple, difficulty = green/amber/red)

**Score gauge:**
- Recharts `RadialBarChart`
- Background arc: `--color-border`
- Filled arc: gold gradient
- Score number centred in Cormorant Garamond (large)
- Label text in DM Sans (muted) beneath

---

## Animation Principles

- Page transitions: 150ms fade (`opacity 0 → 1`)
- Waveform: animated SVG bars or Web Audio API visualiser, gold colour, shown only when recording
- Skeleton loaders: pulse animation on placeholder shapes — never use spinners alone
- Score reveal: gauge arc animates from 0 to value on debrief load (500ms ease-out)
- Processing steps: step labels fade in sequentially

---

## Spacing System

Tailwind default spacing scale. Key values:
- `gap-4` (16px) between cards
- `p-6` (24px) card internal padding
- `gap-6` (24px) between major sections
- `px-8` (32px) page horizontal padding (desktop)
- `px-4` (16px) page horizontal padding (mobile)

---

## Responsive Breakpoints

- Mobile: <768px — single column, bottom tab bar
- Tablet: 768–1024px — sidebar collapses or slides out
- Desktop: >1024px — fixed 240px sidebar + content area

---

## Recording UI Standards

When recording is active, the following apply across ALL four modes:
- Animated gold waveform visible (reinforces that audio is being captured)
- Timer counting up clearly visible
- "Stop" / "Stop & Analyse" button must be clearly visible and tappable
- No accidental-tap protection except in Interview mode (20-second delay on "Done")
