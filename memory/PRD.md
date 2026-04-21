# صاحب يلا (Sahib Yalla) — Product Requirements

## Original problem statement (ongoing)
- "fix it to be a full stack… i can use it in mobile browser and here… i can build apps by it using api"
- "let's enhance the app more… really complicated UI… I mostly going to use this by mobile… responsive… like vibe coding (replit agent) with thinking/awaiting animation"
- "make sure the whole app is RTL, remove the current logo, replace with text **صاحب يلا** in Google **Aref Ruqaa** font"

## Identity
- **Name**: صاحب يلا (Sahib Yalla)
- **Logo**: Arabic word-mark "صاحب يلا" set in Google Aref Ruqaa, with a linear gradient `#3A8AAF → #DF7825`. No square icon.
- **Direction**: RTL (Arabic-first). `<html lang="ar" dir="rtl">`.
- **Fonts**:
  - Logo / display: `Aref Ruqaa` (Google Fonts) → `--font-aref-ruqaa` → `font-aref` utility
  - Body: `Inter` (Latin) + system fallback for Arabic glyphs
  - Code / Monaco: `JetBrains Mono`

## Architecture
- **Frontend** (`/app/frontend`): Next.js 14 App Router, TypeScript, Tailwind, Zustand, Monaco, `@babel/standalone`. `yarn start` → `next dev -H 0.0.0.0 -p 3000`.
- **Backend** (`/app/backend`): FastAPI on `0.0.0.0:8001` (uvicorn --reload).
- **Database**: MongoDB today, migrating to **Neon Postgres** (user has free credits).
- **LLM**: Claude Sonnet 4.5 via Emergent LLM key (`emergentintegrations`). Non-streaming call chunked in the backend into a text stream for smooth UI.

## Vibe-coding UI (2026-04-21, now fully RTL)
- **Top bar** (preserved from previous iteration, now RTL): logo on the right, buttons on the left: الكود(N) (+ green flash when a new file added) · مشاركة · Copy · Download.
- **Hero preview** (browser chrome with traffic-light dots + device toggle; preview chrome kept LTR since labels are technical). Device toggle: Mobile · Tablet · Desktop.
- **Chat column** (left of the viewport in RTL):
  - Header: ✨ المحادثة · N رسالة / ابدأ البناء · مسح
  - Empty state: "فلنبني شيئًا معًا / اوصف تطبيقك بكلماتك. جرّب أحد هذه الأفكار للبدء." + chips: صفحة هبوط · تطبيق مهام · لوحة تحكم · معرض أعمال · شاشة دخول
  - Messages with MessageBubble; code blocks forced to `dir="ltr"` so code is readable.
  - **ThinkingIndicator** (Replit-Agent style): 3 pulsing ocean-blue dots + rotating Arabic phrases ("أقرأ طلبك…", "أخطط للبنية…", "أكتب الكود…", "أُحسّن التصميم…", "أوصل القطع معًا…", "اقتربنا…") every 1.8s.
  - Streaming cursor (pulsing ocean-blue bar) after the last char.
  - **Action buttons** inside assistant code blocks: "إدراج في المحرر" / "تطبيق على المعاينة".
  - Composer: large glowing textarea (52px min height, grows to 180px), ocean-blue gradient send button (ArrowUp). Placeholder: "ماذا تريد أن تبني اليوم؟" (empty) / "اطلب تعديلات… (Shift+Enter لسطر جديد)" (after first message). `dir="auto"` on textarea so user text is aligned per character.
  - Counter: "0/4000 · Enter للإرسال" and "عرض الكود ←" shortcut.
- **Code drawer** (slide-over / bottom-sheet, dir="ltr"): wraps Monaco + FileTabs + Preview + Console. Lazy-mounted so files aren't auto-seeded until first use.
- **Mobile tabs**: المحادثة / المعاينة, pill switcher at top.
- **Toasts** in Arabic: تم نسخ رابط المشاركة, لا يوجد شيء لمشاركته بعد, تم التنزيل, تم نسخ الكود كاملًا, أُدرج في المحرر, طُبِّق على المعاينة.

### RTL implementation notes
- `<html dir="rtl" lang="ar">` in `app/layout.tsx`.
- Layout uses flex + `ms-` / `me-` logical spacing; no hard-coded `ml-` in the vibe shell.
- `CodeBlock` and `CodeDrawer > EditorPanel` are wrapped in `dir="ltr"` (code and Monaco must stay LTR).
- `LivePreview`'s browser chrome bar is `dir="ltr"` (traffic-light dots convention).
- Preview iframe renders whatever the model produced (usually `dir="rtl"` when asked; chips instruct the model to set it).

## API (unchanged)
| Method | Path              | Purpose |
|--------|-------------------|---------|
| GET    | `/api/health`     | Health check |
| POST   | `/api/chat`       | Streamed Claude Sonnet 4.5 reply |
| POST   | `/api/share`      | Create snapshot → `{ id, path }` |
| GET    | `/api/share/{id}` | Retrieve snapshot |

## Verified end-to-end
- Arabic prompt → thinking phrases (Arabic) → streamed code block (LTR inside bubble) → "تطبيق على المعاينة" → toast "طُبِّق على المعاينة" → iframe renders "مرحبا يا صاحبي" in RTL. ✅
- Desktop (1440×900) and Mobile (390×780). ✅

## Prioritized backlog
- **P0** Migrate MongoDB → **Neon Postgres** once connection string is provided.
- **P1** Persist projects + chat history in DB (currently only localStorage on the client).
- **P1** Tiny Settings popover with model dropdown (Claude 4.5 / GPT-5.2 / Gemini 3 Pro — all via Emergent key today; one env flip → AWS Bedrock later).
- **P2** Public `POST /api/generate` with app-token so Arabic iOS / Android webviews / cURL can call Sahib Yalla from elsewhere.
- **P2** True token-level streaming from the LLM.
- **P3** Single-user auth on top of persistent DB; multi-user later.
- **P3** Re-mix button on `/s/{id}` share pages.

## Files touched in the RTL session
- `app/layout.tsx` — `dir="rtl" lang="ar"`, Aref Ruqaa font, Arabic metadata.
- `tailwind.config.ts` — `font-aref` family.
- `components/vibe/VibeChrome.tsx` — logo becomes "صاحب يلا" in `font-aref` with gradient, all top-bar/tab strings to Arabic, toasts to Arabic.
- `components/vibe/VibeChat.tsx` — all strings to Arabic, chips relabeled, prompts updated to ask the model for Arabic + `dir="rtl"` output.
- `components/vibe/ThinkingIndicator.tsx` — phrases in Arabic.
- `components/vibe/LivePreview.tsx` — empty state in Arabic, chrome kept LTR.
- `components/vibe/CodeDrawer.tsx` — labels in Arabic, body wrapped `dir="ltr"` for Monaco.
- `components/CodeBlock.tsx` — wrapped in `dir="ltr"`, copy button in Arabic.
- `components/InsertCodeButton.tsx` — buttons in Arabic, toasts in Arabic.
- `components/MessageBubble.tsx` — streaming cursor uses logical margin.
