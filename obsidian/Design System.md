# Mzazi Coach — Design System (Stitch Archetype)

## Visual Architecture & Brand Identity

Mzazi Coach adopts the **Stitch Archetype** design system engineered for maximum visual impact, clarity, and performance across mobile and desktop environments.

### Core Tokens

#### Typography
- **Display Font**: `Outfit` (700, 800 weight, tight tracking `-0.025em`, line height `1.1`)
- **Body Font**: `Outfit` (400, 500 weight, line height `1.65`, 65ch max line length)
- **Monospace**: `ui-monospace`, `SF Mono`, `Cascadia Mono`

#### Palette
- **Canvas / Substrate**: Slate Light `#F8FAFC`
- **Surface Cards**: Pure White `#FFFFFF`
- **Primary Ink**: Slate Dark `#0F172A`
- **Soft Ink**: Slate `#334155`
- **Muted Ink**: Slate Muted `#64748B`
- **Accent**: Royal Blue `#2563EB` (Primary Signal Accent)
- **Accent Hover**: Deep Blue `#1D4ED8`
- **Subtle Line**: `#E2E8F0`

#### CBC Performance Bands
- **EE (Exceeding Expectations)**: `#EFF6FF` bg / `#1D4ED8` text
- **ME (Meeting Expectations)**: `#ECFDF5` bg / `#047857` text
- **AE (Approaching Expectations)**: `#FFFBEB` bg / `#B45309` text
- **BE (Below Expectations)**: `#FEF2F2` bg / `#B91C1C` text

#### Elevation & Radius
- **Border Radius**: `2.5rem` (`40px`) on main cards, `1rem` on buttons/pills
- **Card Shadow**: `0 30px 60px -15px rgba(15, 23, 42, 0.07)` with `1px solid rgba(226, 232, 240, 0.8)`
- **Loading State**: Proportional skeleton shimmer animation (`keyframes shimmer`). No circular spinners.

## Rules & Anti-Patterns
- **No Emojis**: Strictly prohibited across UI, code comments, and documentation.
- **No Generic Placeholders**: Use realistic Kenyan CBC subjects and names (e.g. Mathematics, Kiswahili, Grade 4-9).
- **Asymmetric Composition**: Left-aligned split hero sections and asymmetric Bento grids. No centered hero blocks.
