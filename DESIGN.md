---
name: App Directory Design System
description: Official design system specification and tokens for App Directory (Bookmarks & Web Applications Manager)
version: 1.0.0
tokens:
  color:
    light:
      background:
        primary: "#f5f5f7"
        secondary: "#ffffff"
        tertiary: "#f0f0f2"
        hover: "#e8e8ec"
      text:
        primary: "#1d1d1f"
        secondary: "#6e6e73"
        tertiary: "#aeaeb2"
      border:
        default: "#d2d2d7"
        light: "#e5e5ea"
      accent:
        default: "#0071e3"
        hover: "#0077ed"
        subtle: "rgba(0, 113, 227, 0.08)"
      status:
        danger: "#ff3b30"
        dangerHover: "#ff453a"
        success: "#34c759"
        warning: "#ff9f0a"
      surface:
        card: "#ffffff"
        cardBorder: "#e5e5ea"
        modal: "#ffffff"
        modalBackdrop: "rgba(0, 0, 0, 0.4)"
        toast: "#1d1d1f"
        toastText: "#ffffff"
        input: "#f5f5f7"
        inputBorder: "#e5e5ea"
      tag:
        background: "rgba(0, 113, 227, 0.10)"
        text: "#0071e3"
      favorite: "#ff9f0a"
    dark:
      background:
        primary: "#0d0d0f"
        secondary: "#1c1c1e"
        tertiary: "#2c2c2e"
        hover: "#3a3a3c"
      text:
        primary: "#f5f5f7"
        secondary: "#a1a1a6"
        tertiary: "#636366"
      border:
        default: "#38383a"
        light: "#2c2c2e"
      accent:
        default: "#0a84ff"
        hover: "#409cff"
        subtle: "rgba(10, 132, 255, 0.12)"
      status:
        danger: "#ff453a"
        dangerHover: "#ff6961"
        success: "#30d158"
        warning: "#ffd60a"
      surface:
        card: "#1c1c1e"
        cardBorder: "#2c2c2e"
        modal: "#1c1c1e"
        modalBackdrop: "rgba(0, 0, 0, 0.6)"
        toast: "#f5f5f7"
        toastText: "#1d1d1f"
        input: "#0d0d0f"
        inputBorder: "#2c2c2e"
      tag:
        background: "rgba(10, 132, 255, 0.15)"
        text: "#0a84ff"
      favorite: "#ffd60a"
  typography:
    fontFamily:
      sans: "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif"
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize:
      xs: "11px"
      sm: "12px"
      base: "14px"
      md: "15px"
      lg: "18px"
      xl: "22px"
      display: "28px"
    fontWeight:
      regular: 400
      medium: 500
      semibold: 600
      bold: 700
    lineHeight:
      tight: 1.2
      normal: 1.45
      relaxed: 1.6
  radii:
    xs: "4px"
    sm: "8px"
    md: "12px"
    lg: "16px"
    pill: "9999px"
  shadows:
    sm: "0 1px 3px rgba(0, 0, 0, 0.08)"
    md: "0 4px 16px rgba(0, 0, 0, 0.12)"
    lg: "0 8px 32px rgba(0, 0, 0, 0.18)"
    spotlight: "radial-gradient(400px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255, 255, 255, 0.06), transparent 80%)"
  transitions:
    fast: "0.15s ease"
    default: "0.2s ease"
    smooth: "0.25s cubic-bezier(0.16, 1, 0.3, 1)"
  layout:
    maxWidth: "1680px"
    sidebarWidth: "260px"
    headerHeight: "60px"
---

# App Directory — Design System & UI Specification

Welcome to the **App Directory** design system. This document serves as the single source of truth for design tokens, visual principles, component patterns, and AI-grounded explorations (such as **Stitch by Google**).

---

## 1. Design Philosophy

- **Apple-Grade Precision & Subtlety:** Quiet, refined, neutral canvas with subtle borders (`--border`), soft corners (`--radius: 12px`), and backdrop blur (`blur(20px)`). The user's content and website favicons are the heroes.
- **High-Density Utility:** Tailored for power users, developers, and researchers organizing hundreds of web apps and links. Controls are compact, legible, and accompanied by keyboard shortcuts (`Ctrl+K`).
- **Tactile & Responsive Feedback:** Micro-interactions feature subtle scale shifts, spotlight ambient glow on cursor movement, smooth transitions, and instant visual state feedback.
- **Privacy & Offline First:** Local-first mental model; visuals emphasize local storage security, health status, and export safety.

---

## 2. Shell & Layout Architecture

```
+-------------------------------------------------------------------------------+
| TOP NAVIGATION (Smart Reveal / Sticky Floating Header)                       |
| [📂 App Directory]   [Search / Filter / Sort / Views]   [Sync / Export / Theme]|
+-------------------+-----------------------------------------------------------+
| FOLDERS SIDEBAR   | MAIN CANVAS                                               |
| - All Bookmarks   | - Active Folder / Filter Banner                           |
| - Favorites       | - Insights & Analytics Drawer (Collapsible)               |
| - Unorganized     | - View Container (Cards Bento / Compact Table / Icons)    |
| - Broken Links    |                                                           |
| - Collections...  |                                                           |
+-------------------+-----------------------------------------------------------+
```

### 1. Smart Reveal Top Navigation (`.top-nav-wrapper`)
- **Static at top:** Sits comfortably above content with transparent/solid matching background.
- **Floating on scroll:** Transforms into a floating bar (`position: fixed; backdrop-filter: blur(20px)`) that hides smoothly and reveals on mouse-up / hover.
- **Left:** Sidebar collapse toggle + App title / reset logo.
- **Right:** Sync / Refresh icons progress, broken link checker, import button, split backup/export dropdown, theme customizer, passcode lock, and dark/light mode toggle.

### 2. Collapsible Folders Sidebar (`.folders-sidebar`)
- Fixed width (~`260px`), collapsible into main content area.
- Quick Views: `All Bookmarks`, `Favorites (⭐)`, `Unorganized (📂)`, and dynamic `Broken Links (⚠️)`.
- Collections tree with count badges and drag-and-drop target highlighting (`.drag-over`).

### 3. Toolbar & View Switcher (`.toolbar`)
- **Search Box:** Quick input with clear button and `Ctrl+K` command palette badge.
- **Category Multi-Filter:** Dropdown with Union / Intersection matching mode.
- **Sort Select:** Date added, Name (A-Z), Visit frequency, Recent activity.
- **View Mode Switcher:**
  - **Cards (Bento Grid):** High-density cards with ambient spotlight glow.
  - **Table View:** Compact row-based layout for sorting, audits, and bulk operations.
  - **Icons Grid:** Minimalist Speed Dial inspired by modern browser home screens.

---

## 3. Core Component Specifications

### 3.1 Bento Bookmark Card (`.card`)
- **Surface:** `var(--card-bg)` with `1px solid var(--card-border)`, `border-radius: var(--radius)`.
- **Spotlight Effect:** Radial gradient tracking `--mouse-x` and `--mouse-y` coordinates for an ambient glow under the cursor.
- **Header:** Website favicon / custom icon (36x36px with rounded corners), website title, domain subtitle, favorite star toggle (`⭐`), and health indicator dot (`green`/`orange`/`red`).
- **Body:** Optional user notes/description and category tag pills.
- **Footer / Hover Bar:** Quick launch button (`Open ↗`), copy URL, edit modal trigger, and delete action.

### 3.2 Category & Tag Pills (`.tag`)
- Rounded pills (`border-radius: var(--radii-pill)`).
- Subdued tinted background (`rgba(accent, 0.1)`) with vibrant text.
- Supports category-specific color tokens (configured via Category Manager).

### 3.3 Command Palette (`.cmd-palette`)
- Centered modal dialog with dark backdrop blur.
- Instant fuzzy search across titles, URLs, tags, and quick actions (export, theme switch, check links).
- Arrow-key navigation with active item highlight (`var(--bg-hover)`).

### 3.4 Insights & Usage Dashboard Drawer (`.insights-drawer`)
- Expandable panel showing top launched applications, recent additions, category distribution charts, and dormant link cleanup recommendations.

---

## 4. Google Stitch Exploration Guide

When using **Google Stitch** to generate alternate designs, copy and paste the prompt templates below into Stitch. Stitch will remain strictly grounded in your code's token names and structure.

### Stitch Prompt 1: Modern Bento Grid Exploration
> **Role:** Senior Design Technologist & UI Architect
> **Context:** You are redesigning the main canvas of App Directory using the tokens from `DESIGN.md`.
> **Tokens to use:** Background `--bg-primary` (`#0d0d0f`), Surface `--card-bg` (`#1c1c1e`), Border `--border` (`#38383a`), Accent `--accent` (`#0a84ff`), Radius `--radius` (`12px`).
> **Goal:** Create an alternate Bento Grid layout. Cards should vary subtly in size based on usage frequency (most visited apps get a larger 2x2 bento card with preview cards or quick sub-links, standard apps get 1x1 cards). Retain the favicon, title, category tags, and health status dot.

### Stitch Prompt 2: High-Density Power User Table / Split View
> **Role:** FinTech / Developer Tools UX Designer
> **Context:** Redesign App Directory into an ultra-dense, keyboard-first split screen view.
> **Layout:** Left panel: collapsible folder & tag tree; Middle: compact list/table with multi-select checkboxes, favicon, title, domain, click counter, and status indicator; Right panel: quick preview sheet with full metadata, launch button, and edit fields.
> **Aesthetic:** Clean, dark mode, 1px subtle borders, no unnecessary whitespace, macOS Finder / Linear style.

### Stitch Prompt 3: Minimalist Speed Dial / Focus Mode
> **Role:** Minimalist Browser UI Designer
> **Context:** Design a distraction-free "Speed Dial" alternate home screen.
> **Layout:** Centered search & command bar with subtle glow, followed by a grid of app icons (48x48px favicons with smooth squircle background badges and label underneath). Folders appear as compact group pills at the top. Everything else recedes into a minimalist floating action dock.
