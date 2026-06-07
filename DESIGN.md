---
name: Budgy Design System
description: Clean, reliable, and approachable design system for personal budgeting.
colors:
  primary: "#7364E3"
  foreground: "#0F0F1A"
  background: "#F5F6FF"
  card: "#FFFFFF"
  border: "#E4E4E7"
  muted-foreground: "#71717A"
  success: "#00D68F"
  danger: "#FF6B6B"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.card}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
---

# Design System: Budgy

## 1. Overview

**Creative North Star: "The Mindful Vault"**

The design of Budgy revolves around the metaphor of a modern, clean vault—a safe, silent place where financial data is tracked with absolute precision, clarity, and zero visual noise. By eliminating distracting backgrounds, flashy gradients, and heavy shadows, the system fosters a sense of composure, security, and calm.

Key depth is conveyed through light structural borders and crisp background shifts rather than drop shadows. Every dashboard widget, form input, and chart is designed to serve a functional purpose, keeping cognitive load to a minimum.

**Key Characteristics:**
- Minimalist, high-density layouts that prioritize data readability.
- Clear structural borders (1px) for container separation.
- Tabular numeric alignment for easily scannable balances and transactions.
- Highly readable typography utilizing the Inter font stack.

## 2. Colors

The color palette features a calm contrast between light mist backgrounds and solid, functional primary indigo actions.

### Primary
- **Electric Trust Indigo** (`#7364E3` / `hsl(247, 69%, 64%)`): Used strictly for interactive elements, focus states, and key call-to-actions.

### Neutral
- **Vault Foreground** (`#0F0F1A` / `hsl(240, 27%, 8%)`): High-contrast ink for body text, headings, and labels.
- **Mist Background** (`#F5F6FF` / `hsl(231, 100%, 98%)`): Soft off-white tinted neutral for body and section backgrounds.
- **Vault Border** (`#E4E4E7` / `hsl(240, 5.9%, 90%)`): Precise, light gray for boundaries, dividers, and card borders.

### Named Rules
**The Minimal Accent Rule.** Primary indigo is reserved strictly for interactive states, navigation targets, and focus actions. It must not exceed 10% of any given screen layout.

## 3. Typography

**Display Font:** Inter, sans-serif
**Body Font:** Inter, sans-serif

### Hierarchy
- **Display** (Bold (700), `clamp(2rem, 5vw, 3rem)`, 1.2): Used for key dashboard balances, metrics, and page titles.
- **Headline** (Semibold (600), 1.5rem, 1.3): Used for section headers and modal titles.
- **Body** (Regular (400), 1rem, 1.5): Used for standard text, transaction lists, and labels. Max line length 65–75ch.
- **Label** (Medium (500), 0.875rem, 1.4): Used for tags, secondary action buttons, and small status pills.

### Named Rules
**The Tabular Numbers Rule.** All financial amounts, transaction dates, and balances must use `font-variant-numeric: tabular-nums` to ensure perfect column alignment.

## 4. Elevation

Budgy uses a flat-by-default layout. Depth is represented using structural 1px borders rather than visual shadows.

### Named Rules
**The Shadow Prohibition.** Box shadows are prohibited on cards, badges, and containers. They are reserved exclusively for temporary floating UI elements (such as select menus, active tooltips, or open dialog overlays).

## 5. Components

Components are refined, restrained, and use minimal padding to maintain layout density.

### Buttons
- **Shape:** Softly curved corners (8px / `var(--radius)`)
- **Primary:** Solid `#7364E3` with white text. Padding is precisely `10px 20px`.
- **Secondary:** Light background `#F5F6FF` with `#0F0F1A` text.

### Cards / Containers
- **Corner Style:** Medium curved corners (12px)
- **Background:** Pure white (`#FFFFFF`) in light mode, dark navy (`#1F1F2E`) in dark mode.
- **Border:** Thin 1px solid `#E4E4E7`.

### Inputs / Fields
- **Style:** 1px solid border, 8px border-radius, background matches card.
- **Focus:** 2px ring using primary indigo (`#7364E3`) to indicate active state clearly.

## 6. Do's and Don'ts

### Do:
- **Do** align all numerical data columns using tabular numbers.
- **Do** use exact 1px solid borders for container boundaries.
- **Do** maintain high contrast with a minimum of 4.5:1 for body copy.

### Don't:
- **Don't** use decorative gradients on backgrounds or text.
- **Don't** use drop shadows for standard dashboard cards or containers.
- **Don't** nest cards inside other cards; use simple lists or thin dividers instead.
- **Don't** use all-caps for body text or large labels.
