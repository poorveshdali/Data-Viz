# Design System — "Why Is Everyone Building Ports?"
### Interactive Scrollytelling Article Spec

Source reference: 4-panel infographic on global port strategy, maritime trade, and geopolitical chokepoints (Sri Lanka / Hambantota case study).

---

## 1. Concept & Tone

A moody, cartographic, "intelligence briefing" aesthetic — dark ocean-navy canvas, single-file container ships gliding across it, terse monospace annotations, and one hot accent color reserved for the numbers that matter. The page should feel like a classified shipping-lane dossier, not a corporate slide deck. Content is a vertical scroll narrative that moves from a global statistic → a single ship → a single country → a single port → the geopolitical stakes.

**Single job of the page:** make the reader feel, viscerally, that a small dot on a map (a port) is a lever on global trade — and that one country is quietly collecting those levers.

---

## 2. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-navy-deep` | `#0A1628` | Base background, deepest sections (footer, transitions) |
| `--bg-navy-mid` | `#0F2440` | Primary section background |
| `--bg-navy-light` | `#16304F` | Card/panel fills, elevated surfaces |
| `--accent-coral` | `#FF6F5E` | Primary highlight — key stats, containers, alert dots, headline emphasis |
| `--accent-gold` | `#E8A73D` | Secondary highlight — supporting data, alternating containers, minor markers |
| `--accent-sky` | `#5B9BF5` | Flow lines, shipping routes, connective threads, node dots |
| `--accent-cream` | `#F5F0DC` | Landmass fills (country silhouettes), high-contrast map shapes |
| `--text-primary` | `#FFFFFF` | Headlines |
| `--text-secondary` | `#B8C4D4` | Body copy, captions |
| `--text-muted` | `#6E7F99` | De-emphasized labels, axis text |
| `--line-border` | `rgba(255,255,255,0.15)` | Card outlines, dividers, chart gridlines |
| `--danger-red` | `#E8483C` | Critical-emphasis data (e.g. country highlighted on world map) |

**Rule:** coral is scarce and load-bearing — it marks the single most important number or object per screen. Gold is its quieter sibling for secondary emphasis. Sky-blue is exclusively motion/connection (routes, timelines, links) — never used for emphasis text. Never introduce a fifth accent hue.

---

## 3. Typography

| Role | Face | Notes |
|---|---|---|
| Display / Headline | **Söhne** or **General Sans**, Bold/Black | Large, tight tracking, sits directly on navy — e.g. "Why Is Everyone Building Ports?" |
| Body / Narrative | **Inter** or **IBM Plex Sans**, Regular/Medium | Used sparingly — this design leans on data + monospace over paragraphs |
| Data / Annotation / Caption | **IBM Plex Mono** or **JetBrains Mono**, Regular | ALL statistic callouts, map labels, "For example" markers, chart axis text — this is the dossier voice |

**Type scale (desktop base 16px):**
- H1 (hero headline): 64px / 1.05 / -0.02em, white, bold
- H2 (section headline): 36px / 1.15, white, semibold
- Eyebrow/kicker (italic coral): 16px / 1.4, coral, italic, medium
- Body: 18px / 1.6, secondary text
- Mono caption/label: 14px / 1.5, uppercase optional, letter-spacing 0.02em
- Big stat number: 48–96px, mono or display bold, coral

Mono type is the connective tissue of the whole piece — every map label, dot annotation, and "for example" aside uses it. This is what separates it from a generic editorial layout.

---

## 4. Layout & Grid

- **Canvas:** full-bleed dark navy, vertical scroll, content column max-width ~720px, left-aligned with generous left gutter (matches source: text/graphics sit left, right side often intentionally empty/negative space).
- **Negative space is a feature.** Several panels in the source use less than 40% of horizontal width for content — resist the urge to center or fill. Asymmetry reads as confident, editorial.
- **Vertical rhythm:** sections separated by large empty scroll distance (300–600px of breathing room) so each beat lands before the next begins.
- **Background texture:** faint dotted world-map pattern (low-opacity dot grid, `--text-muted` at 8–12% opacity) sits behind hero and select sections — subtle, not decorative noise.

## 5. Accessibility Checklist

- Coral-on-navy and cream-on-navy both pass AA for large text; verify mono caption text (14px) against navy-mid background meets AA (bump `--text-secondary` lightness if needed).
- All scroll-triggered animations respect `prefers-reduced-motion`.
- Map/chart data must have a non-visual equivalent (table or aria-description) for screen readers — the ship grid and route maps are decorative-adjacent but underlying stats need text equivalents.
- Visible keyboard focus states on any interactive controls (nav dots, replay buttons if added).
