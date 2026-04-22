# DESIGN.md — صاحب يلا Design System

This is the authoritative design reference for all agents and developers working on this project. Follow these specifications exactly. Do not invent new colors, fonts, or patterns — extend from what is here.

---

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Ocean Blue | `#3A8AAF` | Primary accent, strokes, focus rings, glow effects, active states |
| Rust Orange Start | `#DF7825` | Gradient start — logo wordmark, primary buttons |
| Rust Orange End | `#CF571F` | Gradient end — logo wordmark, primary buttons |

### Surface Colors (Dark Theme — Default)
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0A0B0D` | Page background, overlay backgrounds |
| Chrome Surface | `#252526` | Top bar, sidebars, drawers, modal backgrounds |
| Editor Surface | `#1E1E1E` | Monaco editor background (matches VS Code Dark) |
| Card Surface | `rgba(37, 37, 38, 0.8)` | Cards, panels (with `backdrop-blur`) |
| Border | `rgba(58, 138, 175, 0.2)` | Subtle borders (Ocean Blue at 20% opacity) |
| Border Active | `rgba(58, 138, 175, 0.5)` | Active/focused borders |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Text Primary | `#E5E7EB` | Main body text |
| Text Secondary | `#9CA3AF` | Captions, placeholders, secondary labels |
| Text Muted | `#6B7280` | Disabled states, timestamps |
| Text Code | `#E5E7EB` | Code in blocks (always on dark background) |

### Status Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Success | `#22C55E` (green-500) | File added flash, success toasts |
| Error | `#EF4444` (red-500) | Runtime errors, error overlays |
| Warning | `#F59E0B` (amber-500) | Console warnings |

---

## Gradients

### Logo / Brand Gradient
```css
background: linear-gradient(to right, #3A8AAF, #DF7825);
/* or */
background: linear-gradient(135deg, #3A8AAF 0%, #DF7825 100%);
```
Used for: صاحب يلا wordmark, primary CTA buttons (send, apply), active tab underlines.

### Glow Effect (Ocean Blue)
```css
box-shadow: 0 0 20px rgba(58, 138, 175, 0.3);
/* Stronger glow for focused composer */
box-shadow: 0 0 0 2px rgba(58, 138, 175, 0.4), 0 8px 32px rgba(58, 138, 175, 0.2);
```

### Card Shadow
```css
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
```

---

## Typography

### Font Families
| Family | Variable | Tailwind Class | Usage |
|--------|----------|----------------|-------|
| Aref Ruqaa | `--font-aref-ruqaa` | `font-aref` | Logo wordmark "صاحب يلا", display headings |
| Inter | `--font-inter` | `font-sans` | All body text, UI labels, Arabic glyphs fallback |
| JetBrains Mono | `--font-jetbrains-mono` | `font-mono` | All code: Monaco editor, code blocks, terminal |

### Font Loading (Google Fonts)
```html
<!-- in app/layout.tsx head -->
<link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet" />
```

### Font Sizes (Tailwind scale)
| Usage | Class | Size |
|-------|-------|------|
| Logo wordmark | `text-2xl font-bold` | 24px |
| Section headers | `text-lg font-semibold` | 18px |
| Body / chat | `text-sm` | 14px |
| Captions / metadata | `text-xs` | 12px |
| Code | `text-sm font-mono` | 14px |

---

## Glassmorphism System

All panels, cards, and drawers use this pattern:

```css
/* Base glass surface */
background: rgba(37, 37, 38, 0.85);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(58, 138, 175, 0.15);
border-radius: 12px;

/* Heavier glass (modals, overlays) */
background: rgba(10, 11, 13, 0.9);
backdrop-filter: blur(32px);
```

**Tailwind equivalents:**
```
bg-[#252526]/85 backdrop-blur-xl border border-[#3A8AAF]/15 rounded-xl
```

---

## Border Radius

| Context | Value | Tailwind |
|---------|-------|---------|
| Cards, panels, drawers | `12px` | `rounded-xl` |
| Buttons, badges, chips | `8px` | `rounded-lg` |
| Input fields, textareas | `10px` | `rounded-[10px]` |
| Full pill (tab switcher) | `9999px` | `rounded-full` |
| Code blocks | `8px` | `rounded-lg` |

---

## Spacing

Use Tailwind's default scale. Key values:
- Inner padding on panels: `p-4` (16px)
- Gap between sibling components: `gap-3` (12px) or `gap-4` (16px)
- Top bar height: `h-12` (48px)
- Composer min height: `52px`, max: `180px`

---

## Component Patterns

### Primary Button (Send, Apply, CTA)
```tsx
<button className="bg-gradient-to-r from-[#3A8AAF] to-[#DF7825] text-white rounded-full px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity duration-200">
```

### Secondary Button / Ghost
```tsx
<button className="border border-[#3A8AAF]/30 text-[#9CA3AF] hover:text-[#E5E7EB] hover:border-[#3A8AAF]/60 rounded-lg px-3 py-1.5 text-sm transition-colors duration-200">
```

### Chat Message Bubble — User
```
bg-[#3A8AAF]/20 border border-[#3A8AAF]/30 rounded-xl rounded-tr-sm p-3 text-[#E5E7EB] text-sm
```

### Chat Message Bubble — Assistant
```
bg-[#252526]/80 border border-white/5 rounded-xl rounded-tl-sm p-3 text-[#E5E7EB] text-sm
```
(RTL: rounded-tl-sm is left corner which is the START for RTL)

### Input / Textarea (Composer)
```
bg-[#1E1E1E]/80 border border-[#3A8AAF]/20 focus:border-[#3A8AAF]/50 rounded-[10px] text-[#E5E7EB] placeholder:text-[#6B7280] resize-none outline-none
```
With glow on focus: `focus:shadow-[0_0_0_2px_rgba(58,138,175,0.3)]`

---

## Animations & Transitions

### Standard Transition
```css
transition: all 0.3s ease;
/* or Tailwind: */
transition-all duration-300 ease-in-out
```

### ThinkingIndicator — Pulsing Dots
Three ocean-blue dots, each with `animate-bounce` staggered (`delay-0`, `delay-150`, `delay-300`).
```tsx
<span className="w-2 h-2 rounded-full bg-[#3A8AAF] animate-bounce" style={{ animationDelay: '0ms' }} />
<span className="w-2 h-2 rounded-full bg-[#3A8AAF] animate-bounce" style={{ animationDelay: '150ms' }} />
<span className="w-2 h-2 rounded-full bg-[#3A8AAF] animate-bounce" style={{ animationDelay: '300ms' }} />
```

### Streaming Cursor
A pulsing vertical bar after the last streamed character:
```tsx
<span className="inline-block w-0.5 h-4 bg-[#3A8AAF] animate-pulse ml-0.5 align-middle" />
```

### Slide-in Drawer (CodeDrawer)
```css
transform: translateX(100%); /* closed, RTL: translateX(-100%) */
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## RTL Implementation Rules

1. **Root element**: always `<html dir="rtl" lang="ar">`
2. **Logical spacing**: use `ms-` (margin-start) and `me-` (margin-end), never `ml-` / `mr-` in layout components
3. **Code and Monaco**: always wrapped in `<div dir="ltr">` — code reads left-to-right regardless of UI direction
4. **Code blocks** in chat: `dir="ltr"` wrapper so syntax is readable
5. **Browser chrome** in LivePreview (traffic-light dots, URL bar): `dir="ltr"` — these are technical and convention-bound
6. **Textarea `dir` attribute**: use `dir="auto"` so Arabic text aligns right, Latin text aligns left automatically
7. **Flexbox row direction**: in RTL, `flex-row` automatically flows right-to-left. Verify visuals match intent.
8. **Icons**: directional icons (arrows, chevrons) should be flipped in RTL — use `rtl:rotate-180` on arrow icons where needed

---

## Arabic UI Strings Reference

### Navigation & Labels
| Context | Arabic |
|---------|--------|
| Chat tab | المحادثة |
| Code tab | الكود |
| Preview tab | المعاينة |
| Share button | مشاركة |
| Download | تنزيل |
| Clear chat | مسح |
| Start building | ابدأ البناء |
| Messages count | N رسالة |

### Chat Composer
| Context | Arabic |
|---------|--------|
| Empty placeholder | ماذا تريد أن تبني اليوم؟ |
| Active placeholder | اطلب تعديلات… (Shift+Enter لسطر جديد) |
| Character counter | 0/4000 · Enter للإرسال |
| Show code shortcut | عرض الكود ← |

### Code Block Action Buttons
| Action | Arabic |
|--------|--------|
| Insert to editor | إدراج في المحرر |
| Apply to preview | تطبيق على المعاينة |

### ThinkingIndicator Phrases (rotate every 1.8s)
1. أقرأ طلبك…
2. أخطط للبنية…
3. أكتب الكود…
4. أُحسّن التصميم…
5. أوصل القطع معًا…
6. اقتربنا…

### Toast Messages
| Event | Arabic |
|-------|--------|
| Share link copied | تم نسخ رابط المشاركة |
| Nothing to share | لا يوجد شيء لمشاركته بعد |
| Downloaded | تم التنزيل |
| Code copied | تم نسخ الكود كاملًا |
| Inserted to editor | أُدرج في المحرر |
| Applied to preview | طُبِّق على المعاينة |

### Empty State (Chat)
```
فلنبني شيئًا معًا
اوصف تطبيقك بكلماتك. جرّب أحد هذه الأفكار للبدء.
```

### Starter Chips (Empty State)
- صفحة هبوط
- تطبيق مهام
- لوحة تحكم
- معرض أعمال
- شاشة دخول

---

## Device Preview Breakpoints

| Label | Width | Toggle Label |
|-------|-------|-------------|
| Mobile | 375px | Mobile |
| Tablet | 768px | Tablet |
| Desktop | full | Desktop |

---

## What NOT To Do

- Do not use light backgrounds (`bg-white`, `bg-gray-100`) — this is a dark-only app
- Do not use `ml-` / `mr-` on layout elements — use `ms-` / `me-`
- Do not use English strings in the UI — translate to Arabic (see table above)
- Do not use a sans-serif font other than Inter for body text
- Do not use any color outside this palette without explicit approval
- Do not use `border-radius > 16px` — max is `rounded-xl` (12px) except for pills (`rounded-full`)
