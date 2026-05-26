# Gravi — Design System
## "Speak with Impact"

### Brand Identity
Gravi is a premium AI-powered communication and public speaking coach for executives and professionals. The aesthetic is cinematic, minimal, and luxury — Apple meets premium fintech. Every screen should feel like a high-performance tool, not a consumer app.

---

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| background-primary | #0B0B0D | Main app background (matte black) |
| background-secondary | #141417 | Card and panel backgrounds (deep charcoal) |
| background-elevated | #1C1C21 | Elevated surfaces, modals |
| gold-primary | #D4A85A | Primary accent — CTAs, highlights, gauges, borders |
| gold-light | #F2D28B | Champagne gold — secondary accents, sparkle effects |
| gold-glow | rgba(212,168,90,0.15) | Soft gold glow behind elements |
| text-primary | #F7F3EA | Warm ivory — primary body text |
| text-secondary | #9E9A92 | Muted warm grey — secondary labels |
| text-muted | #5A5852 | Tertiary text, placeholders |
| border-gold | rgba(212,168,90,0.25) | Glassmorphism card borders |
| border-subtle | rgba(247,243,234,0.06) | Subtle dividers |

### Typography

**Headings (Cormorant Garamond or EB_GARAMOND)**
- Display: 40px / italic / warm ivory
- H1: 32px / semi-bold
- H2: 26px / regular
- H3: 20px / regular italic

**Body (Inter or INTER)**
- Body Large: 16px / regular / 1.6 line height
- Body: 14px / regular
- Caption: 12px / regular / text-secondary
- Label: 11px / medium / letter-spacing 0.08em / uppercase

### Spacing & Grid
- Base unit: 8px
- Mobile screen: 390×844px
- Horizontal padding: 20px
- Card border-radius: 16px
- Button border-radius: 12px

### Component Tokens

**Glass Card**
- background: rgba(20,20,23,0.7)
- border: 1px solid rgba(212,168,90,0.25)
- backdrop-filter: blur(20px)
- box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(212,168,90,0.05)

**Primary Button (Gold)**
- background: linear-gradient(135deg, #D4A85A, #F2D28B)
- text: #0B0B0D (dark)
- border-radius: 12px
- font: 14px Inter medium
- padding: 14px 24px

**Secondary Button (Ghost)**
- background: transparent
- border: 1px solid rgba(212,168,90,0.4)
- text: #D4A85A
- border-radius: 12px

**Gold Circular Gauge**
- Track color: rgba(212,168,90,0.15)
- Fill color: linear-gradient arc #D4A85A → #F2D28B
- Center score: 52px Cormorant, warm ivory
- Label: 11px Inter uppercase, text-secondary

**Score Bar**
- Track: rgba(247,243,234,0.06)
- Fill: linear-gradient(90deg, #D4A85A, #F2D28B)
- Height: 4px, border-radius: 2px

### Iconography
- Style: thin line icons (1.5px stroke), warm ivory
- Size: 24px standard, 20px compact
- No filled icons except for active/selected states (gold fill)

### Motion & Effects
- Micro-animations: 200ms ease-out
- Card hover: subtle upward translate + glow increase
- Gold sparkle: radial particle burst, gold-light color, 0.3s fade
- Waveform: animated bars, heights vary 4px–24px, gold color
- Gauge fill: 1.2s ease-in-out arc animation on load
