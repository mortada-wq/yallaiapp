# sahib.chat

Glassmorphic **AI coding workspace**: chat with an assistant (AWS Bedrock), edit in **Monaco**, live **HTML/CSS/JS** preview.

📚 **[View Complete Architecture & Development Guide](./ARCHITECTURE.md)**

## Brand & UI

- **Palette:** ocean blue `#3A8AAF`, sunset / rust oranges `#DF7825` → `#CF571F`
- **Background:** `linear-gradient(180deg, #485157 0%, #1B3748 100%)`
- **Surfaces:** frosted glass (`backdrop-blur`, translucent slate), gradient-stroked primary actions (no flat purple fills)
- **Logo:** `public/logo.svg` (gradient wordmark)

Theme tokens live in `app/globals.css` (`.sahib-glass`, `.sahib-input`, `.sahib-msg-user`, etc.) and `lib/sahib-theme.ts`.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_APP_URL` in production so metadata and copied share links use **https://sahib.chat**.

## Stack

Next.js 14, TypeScript, Tailwind, Zustand, Monaco, Bedrock Runtime, `cmdk`, `react-markdown`.

## API routes

- `POST /api/chat` — streamed text
- `POST /api/share`, `GET /api/share/[id]` — snapshots (dev: in-memory)
