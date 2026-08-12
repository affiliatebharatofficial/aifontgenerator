# FONT STYLE DNA CONTRACT & ARCHITECTURAL SPECIFICATION

## Overview
The **Font Style DNA (`FontStyleDNA`)** is the formal, machine-validated specification contract between the **AI Typography Director** and the **Style-Aware Glyph Generation Engine**.

It completely replaces heuristic keyword guessing with a deep, structured parameterization of typeface physics, stroke dynamics, terminal anatomy, and visual complexity.

---

## 1. Typographic Enums

### `styleFamily`
Primary typographic classification.
- **Allowed Values**: `SANS`, `GROTESK`, `HUMANIST_SANS`, `GEOMETRIC`, `SERIF`, `SLAB_SERIF`, `DIDONE_SERIF`, `HANDWRITTEN`, `SCRIPT`, `BRUSH`, `GOTHIC`, `BLACKLETTER`, `MONOSPACE`, `DISPLAY`, `FUTURISTIC`, `RETRO`, `PSYCHEDELIC`, `BUBBLE`, `CARTOON`, `HORROR`, `OCCULT`, `DECORATIVE`
- **Glyph Engine Meaning**: Determines macro-level glyph silhouette, historical archetype rules, and baseline structural skeletons.

### `strokeModel`
Governs how stroke thickness changes along path trajectories.
- **Allowed Values**: `MONOLINE`, `MODULATED`, `HIGH_CONTRAST`, `LOW_CONTRAST`, `BRUSH`, `CALLIGRAPHIC`, `CONSTRUCTED`
- **Glyph Engine Meaning**: 
  - `MONOLINE`: Uniform stroke width throughout.
  - `MODULATED`: Moderate expansion at apexes and bows.
  - `HIGH_CONTRAST`: Thin hairlines on crossbars/left stems, thick downstrokes (Didone/Bodoni model).
  - `BRUSH`: Pressure-dependent organic tapering.
  - `CALLIGRAPHIC`: Broad-nib angled nib pen trajectory.
  - `CONSTRUCTED`: Segmented, geometric rectilinear strokes.

### `terminalStyle`
Anatomy of stroke ends.
- **Allowed Values**: `FLAT`, `ROUND`, `SHARP`, `TAPERED`, `CUT`, `WEDGE`, `BRUSH`, `FLARED`, `SERIFED`, `ORNAMENTAL`
- **Glyph Engine Meaning**: Shapes the tips of strokes (e.g. on C, S, J, 1, 7, f, r).
  - `FLAT`: Clean perpendicular cut.
  - `ROUND`: Half-circle rounded ball terminal.
  - `SHARP`: Pointed fang or spike spur.
  - `SERIFED`: Horizontal/bracketed foot or beak.
  - `WEDGE`: Medieval diamond chisel angle.

### `cornerStyle`
Path vertex joining model at stroke intersections.
- **Allowed Values**: `SHARP`, `ROUND`, `SOFT`, `CHAMFERED`, `CUT`, `IRREGULAR`
- **Glyph Engine Meaning**: 
  - `SHARP`: Standard mitred vertex.
  - `ROUND`: Continuous radius curvature fillet.
  - `CHAMFERED`: 45-degree bevelled corner cut (techno/futuristic).
  - `IRREGULAR`: Jittered or organic hand-cut vertices.

### `curveModel`
Mathematical formulation of Bézier curvature.
- **Allowed Values**: `GEOMETRIC`, `CIRCULAR`, `ORGANIC`, `CALLIGRAPHIC`, `IRREGULAR`, `ANGULAR`
- **Glyph Engine Meaning**: Controls Bézier control point placement.
  - `CIRCULAR`: Standard circle/ellipse arcs ($k = 0.55228$).
  - `ORGANIC`: Asymmetric tension with natural hand-drawn acceleration.
  - `ANGULAR`: Segmented polyline approximation of curves.

### `counterStyle`
Geometry of internal negative spaces (counters).
- **Allowed Values**: `OPEN`, `CLOSED`, `ROUND`, `OVAL`, `ANGULAR`, `NARROW`, `WIDE`, `IRREGULAR`
- **Glyph Engine Meaning**: Governs the inner loop geometry of characters like `O, D, B, P, R, A, e, o, b, d, g`.

### `baselineBehavior`
Vertical alignment physics along the text line.
- **Allowed Values**: `STABLE`, `SUBTLE_VARIATION`, `HANDWRITTEN`, `IRREGULAR`, `BOUNCY`
- **Glyph Engine Meaning**: 
  - `STABLE`: Strict $y = 0$ alignment for technical readability.
  - `HANDWRITTEN` / `BOUNCY`: Dynamic vertical wave and per-glyph elevation offsets.

### `spacing`
Default tracking and side-bearing density.
- **Allowed Values**: `TIGHT`, `NORMAL`, `OPEN`, `DISPLAY`
- **Glyph Engine Meaning**: Modulates left and right advance width side-bearings relative to glyph bounding box.

### `decorationLevel`
Intensity of typographic embellishments.
- **Allowed Values**: `NONE`, `SUBTLE`, `MODERATE`, `STRONG`
- **Glyph Engine Meaning**: Controls presence of swashes, stencils, chamfers, spurs, or ball terminals without altering character readability.

### `glyphVariation`
Controlled stylistic variation between different characters across the font.
- **Allowed Values**: `NONE`, `SUBTLE`, `MODERATE`, `STRONG`
- **Glyph Engine Meaning**: Controls organic variation or intentional irregularity across identical letterforms.

### `visualComplexity`
Architectural path density.
- **Allowed Values**: `MINIMAL`, `MODERATE`, `COMPLEX`
- **Glyph Engine Meaning**: Node count budget and detail density per glyph contour.

---

## 2. Normalized Mathematical Parameters

All numeric parameters are validated within strict mathematical boundaries:

| Parameter | Type | Valid Range | Standard Default | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| `strokeWidth` | `float` | `0.02` – `0.30` | `0.08` | Normalized main stem thickness (at 1000 UPM, `0.08` = 80 units). |
| `strokeContrast` | `float` | `0.00` – `1.00` | `0.20` | Contrast ratio between thin and thick stems (`0.0` = monoline, `1.0` = Didone). |
| `roundness` | `float` | `0.00` – `1.00` | `0.50` | $0.0$ = razor angular, $1.0$ = inflated bubble cushion. |
| `angularity` | `float` | `0.00` – `1.00` | `0.20` | $0.0$ = smooth organic, $1.0$ = hard faceted techno polygons. |
| `distortion` | `float` | `0.00` – `0.85` | `0.00` | $0.0$ = clean geometric, $0.85$ = heavily distressed/cursed. |
| `symmetry` | `float` | `0.00` – `1.00` | `0.85` | $0.0$ = dynamic asymmetry, $1.0$ = strict bilateral symmetry. |
| `slant` | `float` | `-0.25` – `0.35` | `0.00` | Shear angle in radians ($0.0$ = upright, $0.20$ = standard italic). |

### `proportions` (Normalized Em Metrics)
| Proportion | Range | Default | Meaning |
| :--- | :--- | :--- | :--- |
| `width` | `0.60` – `1.40` | `1.00` | Glyph advance width scaling ($0.80$ = condensed, $1.20$ = expanded). |
| `xHeight` | `0.35` – `0.70` | `0.50` | Lowercase character height ratio (500 units @ 1000 UPM). |
| `capHeight` | `0.60` – `0.85` | `0.70` | Uppercase capital height ratio (700 units @ 1000 UPM). |
| `ascender` | `0.65` – `0.95` | `0.80` | Ascender line for tall characters like `b, d, f, h, k, l` (800 units). |
| `descender` | `-0.35` – `-0.10` | `-0.20` | Descender depth for characters like `g, j, p, q, y` (-200 units). |

---

## 3. Serialization & Persistence
- `FontStyleDNA` is stored in the database under `public.font_generations.style_dna` (indexed with GIN for fast JSON queries).
- Stored DNA is completely reproducible: re-compiling a past font generation retrieves the exact same DNA without requiring new AI requests.
