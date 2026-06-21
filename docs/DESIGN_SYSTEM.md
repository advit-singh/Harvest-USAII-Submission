# DESIGN_SYSTEM.md

# Harvest

## Design System Specification

Version: 1.0

Status: Source of Truth for Visual Design

---

# 1. Design Philosophy

Harvest should feel like:

"A trusted operations center for preventing food waste."

The interface must balance:

Operational Intelligence

*

Environmental Impact

*

Human Trust

*

AI Transparency

---

The user should feel:

Confident

Organized

In Control

Informed

Optimistic

---

Never:

Overwhelmed

Distracted

Confused

Manipulated

---

# 2. Brand Personality

Harvest combines:

### Notion

Document-first clarity

### Linear

Precision and polish

### Stripe

Professional trust

### Arc Browser

Thoughtful delight

### Sustainable Agriculture

Earthy warmth

---

Brand Attributes:

Calm

Intelligent

Transparent

Responsible

Helpful

Modern

Environmental

Human

---

# 3. Visual North Star

If Notion feels like:

"A beautifully organized desk"

Harvest should feel like:

"A beautifully organized sustainability operations center."

---

# 4. Color Philosophy

Colors should communicate:

Trust

Intelligence

Nature

Action

Impact

---

Unlike Notion:

Green becomes the primary brand color.

---

# 5. Core Brand Palette

## Primary Green

Harvest Green

```txt
#2F6B4F
```

Used for:

Primary Actions

Active States

Links

Charts

Key Metrics

---

Represents:

Sustainability

Growth

Responsibility

---

## Primary Active

Deep Forest

```txt
#24543E
```

Pressed state.

---

## Primary Soft

```txt
#E7F3EC
```

Subtle backgrounds.

---

# 6. Secondary Palette

## Deep Evergreen

```txt
#18392B
```

Dark hero sections.

Sidebar.

Premium surfaces.

---

## Moss

```txt
#557C68
```

Supporting accent.

---

## Sage

```txt
#DCE7DF
```

Soft backgrounds.

---

# 7. Canvas Colors

## Paper Canvas

```txt
#F7F6F3
```

Primary page background.

---

## Surface White

```txt
#FFFFFF
```

Cards.

Panels.

Inputs.

---

## Surface Elevated

```txt
#FCFBF9
```

Subtle variation.

---

# 8. Text Colors

## Primary Ink

```txt
#151515
```

---

## Secondary Ink

```txt
#3E413F
```

---

## Muted Ink

```txt
#676C69
```

---

## Faint Ink

```txt
#9A9E9C
```

---

# 9. Environmental Palette

Used exclusively for impact visualizations.

---

## Water

```txt
#4E92C8
```

---

## Food

```txt
#D89A4A
```

---

## Community

```txt
#A567D1
```

---

## Energy

```txt
#E0C85A
```

---

## Donation

```txt
#5A9E75
```

---

## Waste

```txt
#C9755A
```

---

# 10. Semantic Colors

## Success

```txt
#2E7D4F
```

---

## Warning

```txt
#D08A2F
```

---

## Danger

```txt
#B64B4B
```

---

## Info

```txt
#3D7FB6
```

---

# 11. AI Colors

Purpose:

Clearly identify AI-generated content.

Without making AI feel separate.

---

## AI Background

```txt
#F1F8F4
```

---

## AI Border

```txt
#C7DDD0
```

---

## AI Accent

```txt
#3E7A5E
```

---

Used for:

Recommendations

Forecast Explanations

Assistant Responses

Simulation Results

---

# 12. Typography Philosophy

Typography is the primary design tool.

Not color.

Not decoration.

---

# 13. Font Stack

Primary:

```txt
Inter
```

Fallback:

```txt
Inter,
system-ui,
Segoe UI,
sans-serif
```

---

# 14. Type Scale

## Display 1

```txt
64px
700
-2px tracking
```

Hero headlines.

---

## Display 2

```txt
52px
700
-1.5px
```

---

## H1

```txt
40px
700
```

---

## H2

```txt
30px
700
```

---

## H3

```txt
24px
700
```

---

## H4

```txt
20px
600
```

---

## Body

```txt
16px
400
1.5 line-height
```

---

## Small

```txt
14px
400
```

---

## Caption

```txt
12px
500
```

---

# 15. Typography Rules

Headlines:

Dense

Confident

Minimal

---

Body:

Comfortable

Readable

Scannable

---

Never use:

Decorative fonts

Serifs

All caps headlines

---

# 16. Spacing System

Base Unit:

```txt
8px
```

Scale:

```txt
4

8

12

16

24

32

40

48

64

80

96
```

---

# 17. Layout Philosophy

Large whitespace.

Clear grouping.

Document-first structure.

---

The UI should feel:

Organized

Not crowded.

---

# 18. Containers

## Standard Container

```txt
1280px max-width
```

---

## Reading Width

```txt
720px
```

Used for reports.

Assistant responses.

Settings documentation.

---

# 19. Border Radius

## XS

```txt
4px
```

---

## SM

```txt
8px
```

---

## MD

```txt
12px
```

---

## LG

```txt
16px
```

---

## XL

```txt
24px
```

---

## Full

```txt
9999px
```

---

# 20. Shape Philosophy

Soft.

Friendly.

Professional.

---

No sharp corners.

No excessive rounding.

---

# 21. Shadow Philosophy

Subtle.

Trustworthy.

Minimal.

---

# 22. Shadow Scale

## Level 1

```css
0 1px 2px rgba(0,0,0,.04)
```

---

## Level 2

```css
0 4px 12px rgba(0,0,0,.06)
```

---

## Level 3

```css
0 12px 32px rgba(0,0,0,.08)
```

---

# 23. Motion Philosophy

Motion should explain.

Never decorate.

---

Every animation must answer:

"What changed?"

---

# 24. Motion Timing

Fast:

150ms

Normal:

250ms

Large:

350ms

---

# 25. Dashboard Design Rules

Dashboard is:

Mission Control.

Not analytics overload.

---

Maximum:

8 widgets visible simultaneously.

---

Widgets:

Resizable.

Movable.

Hideable.

---

User-controlled.

---

# 26. Chart System

Charts should feel:

Executive-ready.

---

Preferred:

Line Charts

Bar Charts

Area Charts

Heatmaps

Forecast Bands

---

Avoid:

Pie Charts

3D Charts

Gauge Charts

---

# 27. Forecast Visualization

Forecasts require:

Historical Data

Prediction Range

Confidence Band

---

Always show uncertainty.

---

Never show:

Single unexplained number.

---

# 28. Recommendation Cards

Every recommendation card includes:

Title

Impact

Reasoning

Confidence

Actions

---

Visual hierarchy:

Problem

↓

Recommendation

↓

Expected Outcome

---

# 29. AI Components

AI-generated content should always display:

AI Badge

Confidence

Evidence Count

Timestamp

---

Users must always know:

What came from AI.

---

# 30. Upload Experience

Uploading is the most important workflow.

---

Design Goal:

Feel magical.

---

User drops file.

System immediately begins:

Classification

Extraction

Validation

Normalization

---

Live progress visible.

---

# 31. Assistant Experience

Assistant should feel:

Knowledgeable

Professional

Evidence-based

---

Never:

Chatbot-like

Playful

Casual

Human-imitating

---

# 32. Tables

Tables are a primary interface.

---

Requirements:

Column controls

Sorting

Filtering

Density controls

Export

Pinned columns

---

# 33. Empty States

Every empty state includes:

Explanation

Illustration

Recommended Action

Quick Start

---

# 34. Accessibility Standards

Target:

WCAG AA

Minimum.

---

Support:

Keyboard Navigation

Screen Readers

Reduced Motion

High Contrast

Focus Indicators

Color Independence

---

# 35. Dark Mode

Required.

---

Dark mode should use:

Deep Evergreen

instead of pure black.

---

Background:

```txt
#0F1F18
```

---

Surface:

```txt
#16271F
```

---

Primary:

Harvest Green

````

---

# 36. Illustration Style

Inspired by:

Notion

Linear

GitHub

---

Simple.

Flat.

Friendly.

---

Themes:

Food

Community

Sustainability

Operations

Impact

---

# 37. Iconography

Use:

Lucide Icons

---

Stroke-based.

Consistent.

Minimal.

---

# 38. Design Tokens

Every visual value must be tokenized.

Never hardcoded.

---

Colors

Typography

Spacing

Radius

Shadows

Motion

---

All originate from this document.

---

# 39. Responsive Design

Mobile First.

---

Breakpoints:

```txt
640

768

1024

1280

1536
````

---

# 40. Personalization

Users can customize:

Dashboard Layout

Widget Visibility

Density

Theme

Sidebar

Chart Preferences

Notifications

---

Settings persist.

---

# 41. Emotional Design

When users succeed:

Show impact.

---

Not:

"You saved money."

Instead:

```txt
42 meals rescued

$184 saved

91kg CO₂ avoided
```

---

Impact should feel tangible.

---

# 42. Demo Day Design Principle

Judges should understand value within:

10 seconds.

---

Dashboard must instantly communicate:

Waste Risk

Predictions

Recommendations

Impact

---

Without explanation.

---

# 43. Design North Star

Every screen should feel like:

"A trusted sustainability intelligence platform that helps organizations make better decisions before food becomes waste."

If a design choice increases visual noise, complexity, or uncertainty, it should be rejected.
