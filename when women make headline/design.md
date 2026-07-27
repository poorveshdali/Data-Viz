# Design System — "When Women Make Headlines" (The Pudding)

> ⚠️ **Source note:** I could not directly download the live CSS file for this
> article (its asset URLs aren't exposed through the tools I have access to),
> so the exact hex codes, pixel values, and font-family strings below are a
> **best-effort reconstruction** based on (1) the article's actual content/DOM
> structure and (2) The Pudding's well-documented, consistent house style used
> across their visual essays. Anything marked **[verify]** is an educated
> approximation — open the live page in Chrome DevTools → Elements/Computed,
> or Inspect on a specific element, to confirm exact values before treating
> this as pixel-perfect.

---

## 1. Overall Aesthetic

A long-form **scrollytelling data journalism** piece. The visual language is
deliberately restrained — editorial, newspaper-adjacent, high-contrast black
on off-white — so that the data visualizations (which carry their own
saturated accent colors) are what pop. Chrome (nav, footer, body copy) stays
quiet; charts and interactive widgets are the visual event.

**Design principles observed in the piece:**
- Text-first narrative interrupted by full-bleed or sticky-pinned
  visualizations ("scrollytelling")
- Generous vertical whitespace between sections/chapters
- One serif display face for headlines, one clean sans-serif for body/UI
- A single accent hue system reserved almost entirely for data (word themes,
  polarity charts), never used decoratively in the chrome
- Minimal, low-contrast wayfinding (small caps labels, thin rules, no heavy
  boxes/cards for text)

---

## 2. Color Palette

### Chrome / base (editorial layer)
| Role | Approx. value | Notes |
|---|---|---|
| Page background | `#ffffff` / off-white `#fafaf8` **[verify]** | `meta-theme-color` on the page is confirmed `#ffffff` |
| Primary text | near-black, e.g. `#1a1a1a` **[verify]** | Not pure `#000` — Pudding typically softens body text slightly |
| Secondary/muted text (captions, bylines, source lines) | mid-gray `#6b6b6b` **[verify]** | Used for "MAY 2015 \| TELEGRAPH.CO.UK" style eyebrow labels |
| Links / hover state | inherited near-black with underline, not a bright link-blue **[verify]** | Editorial sites like this avoid browser-default blue links |
| Rule lines / dividers | light gray `#e5e5e5` **[verify]** | |

### Data / theme colors (the actual visual signature of this piece)
The piece groups words into **four narrative themes**, each almost certainly
assigned its own accent color used consistently across every chart
(word-cloud/stacked bars, bubble charts, trend lines). Reconstructed from the
legend order given in the article:

| Theme | Suggested role/hue family **[verify exact hex on live site]** |
|---|---|
| Crime & Violence | red / dark red — signals danger, the largest and darkest-coded theme |
| Empowerment | teal or green — positive/hopeful hue, contrasts crime red |
| Gendered Language | purple or mauve — sits "between" positive/negative |
| Race, Ethnicity, & Identity | gold / amber — warm, distinct from the other three |
| Uncategorized / gray-area words | neutral gray | e.g. "hope," "first," "stand" |
| News-event bubbles (timeline annotations) | muted navy or black outline dots | distinct from the theme-fill palette |

**Polarity/bias charts** use a two-series comparison palette:
- "Headlines about women" = one saturated accent (likely the same red/crime
  hue, since sensationalism is framed negatively)
- "Headlines about other topics" = flat gray or muted blue, deliberately
  desaturated so the "women" series visually dominates

**Practical recreation tip:** since I can't confirm hex values, pick a
4–5 color qualitative palette with this logic — one alarming/red hue for
crime, one hopeful/green-teal for empowerment, one purple/mauve for gendered
language, one warm gold for identity, and neutral gray for "unthemed" —
and keep saturation moderate (not neon) to match the restrained editorial
tone.

---

## 3. Typography

| Role | Likely treatment | Notes |
|---|---|---|
| H1 (article title) — "When Women Make Headlines" | Large serif or slab-serif display face, bold, tight leading | Pudding essays commonly pair a characterful serif headline with a plain sans body |
| H2 (subhead) — "A visual essay about the (mis)representation of women in the news" | Lighter weight, same or a lighter serif/sans, larger size than body | Functions as dek/standfirst |
| Byline | Small sans-serif, uppercase or regular, gray | "By Leonardo Nicoletti and Sahiti Sarva" |
| Section headers (## Headlines about women are more sensational, etc.) | Bold sans or serif, notably larger than body, generous top margin | Marks chapter breaks in the scrollytelling flow |
| Body copy | Clean sans-serif (something in the Helvetica/Inter/system-sans family) **[verify exact family]**, comfortable line-height (~1.6), medium column width (~600–700px) for readability | Long-form paragraphs throughout |
| Eyebrow/meta labels ("MAY 2015 \| TELEGRAPH.CO.UK") | Small caps or uppercase, letter-spaced, muted gray, sans-serif | Used above example headline callouts |
| Callout headline quotes (the actual news headlines shown as examples) | Larger, bolder, sometimes italic or in quotation styling to set them apart from essay prose | e.g. "Mum lets 6 year old daughter shave her head..." |
| UI labels ("Filter by," "clear," "Shuffle") | Small sans, often as buttons/pills with subtle border | Interactive controls |
| Footer / methods section | Smaller sans, gray, denser paragraph spacing | Sits below a horizontal rule (`---`) separating it from the main essay |

**Font pairing to use if recreating from scratch:** a serif with some
personality for H1/H2 (e.g. a Tiempos/Freight/Georgia-adjacent face) + a
neutral grotesque sans for everything else (e.g. Inter, Söhne, or system-ui).
This mirrors the "editorial magazine meets data-viz lab" feel typical of The
Pudding without claiming to be their exact licensed typeface (The Pudding's
own fonts are explicitly not licensed for reuse — see their public repo
notes).

---

## 4. Layout & Structure

The piece follows a clear **linear scrollytelling architecture**:

1. **Masthead** — tiny top-left wordmark link back to pudding.cool ("Skip to
   main content" a11y link precedes it)
2. **Hero** — H1 title, H2 dek, byline, all centered or left-aligned in a
   constrained max-width column
3. **Intro essay block** — several paragraphs of narrative sans/serif body
   text, single column, ~600–700px max width, generous line-height
4. **Chapter 1 — Word frequency visualization**
   - Full-bleed or wide interactive chart (arranged words by frequency,
     colored by theme)
   - "Hover over the colored blocks or search below" — implies a search/
     filter input sits directly under/beside the chart
   - "clear" button — small text link/pill to reset a filter or search state
5. **Chapter 2 — Stacked theme comparison chart** — narrower explanatory
   text interleaved with another full-width chart
6. **Chapter 3 — Example headline carousel** — a card-like or ticker
   component showing one example headline at a time with a "Shuffle" button
   to cycle through more
7. **Chapter 4 — Sensationalism / polarity section**
   - H2 section header
   - Explanatory paragraph
   - Horizontal bar/diverging chart comparing outlet polarity, with a legend
     row ("Headlines about other topics" / "Headlines about women") and axis
     labels ("← Less Polarizing" / "More Polarizing →")
8. **Chapter 5 — Bubble chart (viewership × polarity)**
   - Filter controls ("Filter by country," "Filter by publication") — likely
     rendered as dropdown selects or pill/tag toggles
   - Collapsible "Read more about our polarity calculations" detail box —
     styled as an expandable/accordion element, probably with a subtly
     bordered or tinted background to set it apart from body text
9. **Chapter 6 — Bias index bubble chart** — same pattern as above, its own
   "Read more about our bias calculations" expandable
10. **Chapter 7 — Trend-over-time chart** — filterable by country and by the
    four themes (rendered likely as a toggleable legend acting as a filter),
    with annotated "News Events" bubbles plotted along a timeline strip
    above/behind the main chart
11. **Closing essay block** — narrative wrap-up paragraphs, same styling as
    the intro
12. **`---` horizontal rule**
13. **Methods section** — smaller/denser typography, H4-level header
    ("#### Methods"), technical/academic tone, lots of inline citation links
14. **Footer** — social links row (Facebook/Twitter/Instagram/Patreon), then
    legal links row (About/Privacy/Newsletter/RSS), then a one-line masthead
    description of The Pudding itself

**Grid behavior:** narrative text is constrained to a comfortable reading
column; charts break out to full container width (or full viewport width)
— this contrast between narrow-text / wide-chart is the core layout rhythm
of the whole piece and the single most important thing to replicate.

---

## 5. Components to Rebuild

- **Sticky/pinned chart container** during scroll-driven sections (standard
  Pudding scrollytelling pattern — chart stays fixed while annotated text
  scrolls past or updates the chart state)
- **Search input** (word lookup in Chapter 1)
- **Filter pills/dropdowns** (country, publication, theme toggles)
- **Expandable "Read more" methodology boxes** (accordion)
- **Example-headline card with "Shuffle" button**
- **Legend-as-filter** (click a theme name to isolate it in the chart)
- **Tooltip-on-hover** for bubbles/bars showing the underlying headline text
  and source

---

## 6. Tone/Voice Notes (affects visual choices)
- Charts are the "argument" of the piece — text supports and interprets
  them, never overwhelms them
- No decorative imagery/illustration — this is a data-forward, not
  illustration-forward, essay
- Color is functional (theme-coding) not decorative — resist the urge to
  add color anywhere outside the charts

---

## 7. How to Get Exact Values (recommended next step)
Since I couldn't scrape the live stylesheet, for pixel-perfect recreation:
1. Open https://pudding.cool/2022/02/women-in-headlines/ in Chrome
2. DevTools → Elements → click the H1, body paragraph, and a chart legend
   swatch → check the **Computed** tab for `font-family`, `font-size`,
   `color`, `background-color`
3. Use the eyedropper/color picker on chart elements to grab exact theme
   hex values
4. Check `Network` tab for the actual webfont file names being loaded

I'm happy to update this file with those real values if you paste them back
to me, or if you can share the page's HTML/CSS source directly.
