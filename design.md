# Data Viz — Design Philosophy

## Direction

**Data Viz** is designed as a small editorial publication rather than a generic project page. The interface treats each visualization as a feature story: numbered, framed, and given enough space to be read before it is interacted with.

The visual language sits between a printed journal and a digital lab notebook. A warm paper ground, fine rules, oversized serif typography, and restrained red accents create an editorial rhythm. The visualization remains the focus; the interface should feel considered but never compete with the work.

## Principles

### 1. Make the hierarchy feel printed

Large display type establishes the publication title and each feature. Small uppercase labels act like running heads and metadata. Thin rules provide structure in place of heavy cards, shadows, and decorative UI.

### 2. Frame the work, do not decorate it

Interactive embeds sit inside simple ink-colored frames. The red and pink tones are reserved for moments of emphasis and connect the two studies without forcing them into the same visual treatment.

### 3. Use contrast with restraint

The palette is intentionally limited:

- **Paper** (`#f3f0e9`) keeps the page warm and tactile.
- **Ink** (`#171717`) supplies typography and structure.
- **Muted gray** (`#6f6a61`) carries secondary information.
- **Signal red** (`#d94c35`) marks active or editorial emphasis.
- **Pink** is contained within the generative sketch as its stage.

### 4. Let the layout breathe

Generous vertical spacing separates studies like magazine spreads. The opening statement introduces the point of view before the first interactive. On smaller screens, the two-column compositions collapse into a single reading column without losing the numbered sequence.

### 5. Keep interaction legible

Navigation exposes the contents and uses visible hover and focus states. Embedded work keeps its own interaction model. Reduced-motion preferences are respected so the surrounding interface does not add unnecessary movement for visitors who request less animation.

## Typography

The display face uses an available editorial serif stack (`Iowan Old Style`, `Baskerville`, then `Times New Roman`) for character and contrast. Interface labels use the system sans-serif stack for clarity at small sizes. Oversized type uses tight tracking and compact line-height to make the page feel like a cover and spread rather than a dashboard.

## Layout system

- The content is capped at `1180px` and centered.
- Horizontal padding scales with the viewport and becomes `1.25rem` on narrow screens.
- A subtle four-column vertical grid sits behind the page as a quiet publishing reference.
- Feature headings use a `01` / `02` index to make the sequence scannable.
- The Observable embed remains full-width within its feature frame.
- The p5.js sketch receives a two-column treatment: editorial label on the left, canvas on the right.

## Accessibility and resilience

Semantic headings, a labelled navigation region, descriptive iframe text, and an accessible description for the SVG provide context beyond the visual treatment. CSS resets remove browser inconsistencies without removing focus visibility. Responsive rules keep embeds usable on small screens, while `prefers-reduced-motion` disables smooth scrolling and transitions when requested.
