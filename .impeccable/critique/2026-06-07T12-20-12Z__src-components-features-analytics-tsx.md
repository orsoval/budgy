---
target: src/components/features/Analytics.tsx
total_score: 31
p0_count: 0
p1_count: 2
timestamp: 2026-06-07T12-20-12Z
slug: src-components-features-analytics-tsx
---
# Design Critique: src/components/features/Analytics.tsx

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Lacks a loading indicator if budget calculations or account changes are slow. |
| 2 | Match System / Real World | 4 | Solid terminology and formatting standard in French personal finance. |
| 3 | User Control and Freedom | 3 | Lacks a quick action to reset dropdown filters. |
| 4 | Consistency and Standards | 2 | Border-radii (16px) violate the 12px rule; chart colors are hardcoded Tailwind colors. |
| 5 | Error Prevention | 4 | Dropdowns successfully prevent any invalid state selections. |
| 6 | Recognition Rather Than Recall | 3 | Good legend and label layout on charts. |
| 7 | Flexibility and Efficiency | 3 | Works well, but lacks keyboard shortcuts or navigation accelerators. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean but defaults to a generic SaaS metric layout. |
| 9 | Error Recovery | 4 | Read-only view, no high-risk operations. |
| 10 | Help and Documentation | 2 | Lacks inline tooltips explaining the calculation logic of yearly stats. |
| **Total** | | **31/40** | **Good** |

## Anti-Patterns Verdict

- **LLM assessment**: The visual layout falls into the classic SaaS dashboard trope with 3 metrics boxes, a large chart box, and two small comparison cards. The border radius `rounded-2xl` is slightly too round for "The Mindful Vault" North Star (which demands crisp, restrained 12px rounded-md). The soft gradients (`from-emerald-500/5`) are well-controlled but can be replaced by clean solid border accents.
- **Deterministic scan**: The CLI scan ran successfully and detected 0 anti-patterns in the source file.

## Overall Impression
The component is well-structured and functional, using Recharts and CountUp correctly. However, it suffers from standard AI developer design tells: hardcoded Tailwind primary colors on charts, incorrect border-radius scales, and missing accessibility attributes (dropdown labels and chart table fallback).

## What's Working
- **Locale Formatting**: Currency formatting handles French spacing and decimal separators accurately.
- **Chart Tooltip**: The custom tooltip is highly readable, providing the exact balance and positive/negative styling for the month.
- **Micro-animations**: CountUp is used effectively to bring numbers to life without feeling distracting.

## Priority Issues
- **[P1] Accessibility - Dropdown Labels**: The `<select>` inputs for Year and Account selectors lack associated `<label>` or `aria-label` tags, rendering them inaccessible to screen readers.
  - *Fix*: Add `aria-label="Sélectionner le compte"` and `aria-label="Sélectionner l'année"` to the select tags.
  - *Suggested command*: `/impeccable audit`
- **[P1] Design System Consistency - Hardcoded Radii & Chart Colors**: The `rounded-2xl` classes specify a 16px radius, violating the design system's 12px limit (`rounded-xl` or `var(--radius)`). The chart bars use hardcoded `#10b981` and `#ef4444` instead of reading the system's `success` and `danger` theme colors.
  - *Fix*: Replace `rounded-2xl` with `rounded-xl` (or `rounded-md` configured for 12px) and pass theme color variables (or CSS variables) to the Recharts `Bar` elements.
  - *Suggested command*: `/impeccable polish`
- **[P2] Accessibility - Screen Reader Chart Alternative**: Recharts does not natively provide keyboard navigation or screen reader text.
  - *Fix*: Add a visually hidden summary table displaying monthly income/expense data for accessibility devices.
  - *Suggested command*: `/impeccable adapt`
- **[P2] Visual Rhythm - Metric Card Clutter**: The KPI cards use colored icon badges which feel slightly generic and SaaS-like.
  - *Fix*: Simplify card layouts to feel flatter and more structural, relying on typography weight and clean border separation.
  - *Suggested command*: `/impeccable layout`

## Persona Red Flags

- **Alex (Power User)**:
  - Alex cannot navigate between years or accounts using simple keyboard shortcuts or arrow keys without expanding the dropdown list.
  - Form filters have no batch reset action.

- **Sam (Accessibility)**:
  - Sam's screen reader will announce "select, group" without context because the selects lack labels or `aria-label` definitions.
  - The entire Recharts visualization is invisible to Sam; no fallback text summary of the monthly data is provided.

## Minor Observations
- The `CustomTooltip` imports its styles, but in dark mode it relies on `dark:bg-zinc-900` which may differ slightly from the theme's background.
- Let's replace the gradient backgrounds on the best/worst month cards (`from-emerald-500/5 to-transparent`) with a clean solid border accent or extremely subtle solid background.

## Questions to Consider
- What if we used a toggle button group instead of a dropdown for years to allow one-click switching?
- Should the best/worst month cards be unified into a single comparative list to save vertical space?
