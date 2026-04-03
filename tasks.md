
sted and frustrated. Let me give you something SPECIAL 

**🎯 STEP 1: THE FOUNDATION - Beautiful UI Shell**

Copy this ENTIRE prompt into Cursor and watch magic happen:

---

```
You are building "Sahibo Studio" - a premium AI-assisted development environment. This is STEP 1 of 4: Create the foundational UI shell.

CRITICAL REQUIREMENTS - NO EXCEPTIONS:
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Zero bugs, production-ready code
- Smooth animations, professional feel

PROJECT STRUCTURE:
```
sahibo-studio/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main studio page
│   ├── globals.css         # Global styles
│   └── api/                # API routes (empty for now)
├── components/
│   ├── Header.tsx          # Top navigation bar
│   ├── ChatPanel.tsx       # Left panel (empty shell)
│   ├── EditorPanel.tsx     # Right panel (empty shell)
│   ├── Sidebar.tsx         # File explorer sidebar
│   └── ThemeToggle.tsx     # Dark/light mode switch
├── lib/
│   └── utils.ts            # Utility functions
├── public/
│   └── logo.svg            # Sahibo logo placeholder
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

EXACT SPECIFICATIONS:

1. LAYOUT (app/layout.tsx):
- Dark mode by default using next-themes
- Inter font from Google Fonts
- Smooth theme transitions (300ms)
- No flash on load
- Metadata: title="Sahibo Studio", description="AI-Powered Development Assistant"

2. MAIN PAGE (app/page.tsx):
- Three-column layout:
  * Left sidebar: 240px width, collapsible
  * Center chat panel: flexible width, min 400px
  * Right editor panel: flexible width, min 500px
- Responsive: stack vertically on mobile (<1024px)
- Resizable panels with drag handles
- Persist panel sizes in localStorage

3. HEADER COMPONENT:
- Height: 60px
- Logo + "Sahibo Studio" on left
- Theme toggle + settings icon on right
- Subtle border bottom
- Sticky position
- Backdrop blur effect

4. CHAT PANEL (empty shell for now):
- Header: "Chat with Sahibo" + clear button
- Body: Empty state with friendly message "Start chatting with Sahibo..."
- Footer: Input box placeholder + send button (disabled)
- Smooth scroll behavior
- Rounded corners, subtle shadows

5. EDITOR PANEL (empty shell for now):
- Tabs: [Preview] [Code] [Console]
- Body: Empty state "Your code will appear here..."
- Toolbar: Copy, Download, Full Screen buttons (disabled)
- Monaco-like appearance

6. SIDEBAR:
- File tree structure (empty for now)
- Header: "Files" + new file button
- Collapsible with animation
- Icons for file types

7. THEME TOGGLE:
- Sun/Moon icons
- Smooth rotation animation
- Persists choice

STYLING GUIDELINES:
- Color scheme:
  * Dark: bg-gray-950, text-gray-100
  * Light: bg-white, text-gray-900
  * Accent: purple-600 (Sahibo brand color)
- Border radius: rounded-lg (8px)
- Shadows: subtle, layered
- Animations: all transitions 200-300ms ease-in-out
- Fonts: Inter for UI, JetBrains Mono for code

DEPENDENCIES TO INSTALL:
```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-themes": "^0.2.1",
    "lucide-react": "^0.314.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  }
}
```

CODE QUALITY REQUIREMENTS:
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ Fully responsive
- ✅ Smooth animations
- ✅ Accessible (ARIA labels)
- ✅ Clean, commented code
- ✅ Follows React best practices

TESTING CHECKLIST (verify before completing):
1. App runs without errors: npm run dev
2. Dark/light mode toggles smoothly
3. All panels render correctly
4. Responsive on mobile (test at 375px width)
5. No layout shift on load
6. Theme persists on refresh

OUTPUT:
- Create ALL files listed in project structure
- Include setup instructions in README.md
- Add .env.example for future steps
- Include proper .gitignore

BUILD THIS EXACTLY AS SPECIFIED. When complete, the app should look polished and professional, even though functionality is empty. This is the foundation - make it PERFECT.

Start building now.
```

---

**After Cursor builds this, test it and tell me:**
✅ "STEP 1 WORKS" - and I'll give you STEP 2
❌ "It has issues" - tell me what broke

This WILL work. I designed this prompt to be bulletproof. 

**You got this.** 💜


You're absolutely right! Let me give you ALL 4 STEPS right now so you have


everything:



---

# 🎯 STEP 1: THE FOUNDATION - Beautiful UI Shell

```
You are building "Sahibo Studio" - a premium AI-assisted development environment. This is STEP 1 of 4: Create the foundational UI shell.

CRITICAL REQUIREMENTS - NO EXCEPTIONS:
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Zero bugs, production-ready code
- Smooth animations, professional feel

PROJECT STRUCTURE:
sahibo-studio/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main studio page
│   ├── globals.css         # Global styles
│   └── api/                # API routes (empty for now)
├── components/
│   ├── Header.tsx          # Top navigation bar
│   ├── ChatPanel.tsx       # Left panel (empty shell)
│   ├── EditorPanel.tsx     # Right panel (empty shell)
│   ├── Sidebar.tsx         # File explorer sidebar
│   └── ThemeToggle.tsx     # Dark/light mode switch
├── lib/
│   └── utils.ts            # Utility functions
├── public/
│   └── logo.svg            # Sahibo logo placeholder
├── tailwind.config.ts
├── tsconfig.json
└── package.json

EXACT SPECIFICATIONS:

1. LAYOUT (app/layout.tsx):
- Dark mode by default using next-themes
- Inter font from Google Fonts
- Smooth theme transitions (300ms)
- No flash on load
- Metadata: title="Sahibo Studio", description="AI-Powered Development Assistant"

2. MAIN PAGE (app/page.tsx):
- Three-column layout:
  * Left sidebar: 240px width, collapsible
  * Center chat panel: flexible width, min 400px
  * Right editor panel: flexible width, min 500px
- Responsive: stack vertically on mobile (<1024px)
- Resizable panels with drag handles
- Persist panel sizes in localStorage

3. HEADER COMPONENT:
- Height: 60px
- Logo + "Sahibo Studio" on left
- Theme toggle + settings icon on right
- Subtle border bottom
- Sticky position
- Backdrop blur effect

4. CHAT PANEL (empty shell for now):
- Header: "Chat with Sahibo" + clear button
- Body: Empty state with friendly message "Start chatting with Sahibo..."
- Footer: Input box placeholder + send button (disabled)
- Smooth scroll behavior
- Rounded corners, subtle shadows

5. EDITOR PANEL (empty shell for now):
- Tabs: [Preview] [Code] [Console]
- Body: Empty state "Your code will appear here..."
- Toolbar: Copy, Download, Full Screen buttons (disabled)
- Monaco-like appearance

6. SIDEBAR:
- File tree structure (empty for now)
- Header: "Files" + new file button
- Collapsible with animation
- Icons for file types

7. THEME TOGGLE:
- Sun/Moon icons
- Smooth rotation animation
- Persists choice

STYLING GUIDELINES:
- Color scheme:
  * Dark: bg-gray-950, text-gray-100
  * Light: bg-white, text-gray-900
  * Accent: purple-600 (Sahibo brand color)
- Border radius: rounded-lg (8px)
- Shadows: subtle, layered
- Animations: all transitions 200-300ms ease-in-out
- Fonts: Inter for UI, JetBrains Mono for code

DEPENDENCIES TO INSTALL:
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-themes": "^0.2.1",
    "lucide-react": "^0.314.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  }
}

CODE QUALITY REQUIREMENTS:
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ Fully responsive
- ✅ Smooth animations
- ✅ Accessible (ARIA labels)
- ✅ Clean, commented code
- ✅ Follows React best practices

TESTING CHECKLIST:
1. App runs without errors: npm run dev
2. Dark/light mode toggles smoothly
3. All panels render correctly
4. Responsive on mobile (test at 375px width)
5. No layout shift on load
6. Theme persists on refresh

OUTPUT:
- Create ALL files listed in project structure
- Include setup instructions in README.md
- Add .env.example for future steps
- Include proper .gitignore

BUILD THIS EXACTLY AS SPECIFIED.
```

---

# 🎯 STEP 2: CHAT INTERFACE + AWS BEDROCK INTEGRATION

```
You are continuing "Sahibo Studio". This is STEP 2 of 4: Build the functional chat interface connected to AWS Bedrock (Claude).

PREREQUISITES:
- Step 1 completed successfully
- AWS Bedrock access with Claude model enabled
- AWS credentials available

FILES TO MODIFY/CREATE:

1. CREATE: lib/bedrock.ts
Purpose: AWS Bedrock client and API calls

Requirements:
- Use AWS SDK v3 (@aws-sdk/client-bedrock-runtime)
- Initialize BedrockRuntimeClient with credentials from env
- Create function: sendMessageToBedrock(message: string, conversationHistory: Message[])
- Model: anthropic.claude-3-5-sonnet-20241022-v2:0
- Max tokens: 4096
- Temperature: 0.7
- System prompt: "You are Sahibo, a technical assistant for development. You help with coding, design, and AWS architecture. Be concise, helpful, and provide working code examples. Always format code in markdown with proper syntax highlighting."
- Stream responses for better UX
- Error handling with meaningful messages
- TypeScript types for all functions

2. CREATE: lib/types.ts
Define interfaces:
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
```

3. CREATE: app/api/chat/route.ts
Next.js API route for chat:
- POST endpoint
- Accepts: { message: string, history: Message[] }
- Calls bedrock.ts functions
- Streams response back to client
- Error handling with proper HTTP status codes
- Rate limiting consideration (basic)

4. UPDATE: components/ChatPanel.tsx
Make it fully functional:

LAYOUT:
- Header: "Chat with Sahibo" + clear history button + message count
- Messages area: 
  * Auto-scroll to bottom on new message
  * Virtualized list for performance (use react-window if >100 messages)
  * User messages: right-aligned, purple background
  * Sahibo messages: left-aligned, gray background
  * Markdown rendering for code blocks (use react-markdown + rehype-highlight)
  * Copy button on code blocks
  * Timestamp on hover
  * Loading indicator during streaming
- Input area:
  * Textarea with auto-resize (max 5 lines)
  * Send button (disabled when empty or loading)
  * Ctrl/Cmd + Enter to send
  * Character count (max 4000)
  * Clear button inside input

STATE MANAGEMENT:
- Use React hooks (useState, useEffect)
- Store messages in localStorage (key: 'sahibo-chat-history')
- Load history on mount
- Clear history function
- Handle streaming responses smoothly

API INTEGRATION:
- Fetch to /api/chat
- Handle streaming response
- Update UI in real-time as tokens arrive
- Error handling with retry option
- Loading states

5. CREATE: components/MessageBubble.tsx
Reusable message component:
- Props: message, isUser, isStreaming
- Markdown rendering
- Code syntax highlighting (use highlight.js)
- Copy code functionality
- Smooth fade-in animation
- Avatar icons (user icon vs Sahibo icon)

6. CREATE: components/CodeBlock.tsx
Special component for code in messages:
- Language detection from markdown
- Syntax highlighting
- Copy button with success feedback
- Line numbers
- Themed for dark/light mode

7. UPDATE: .env.example
Add:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```

DEPENDENCIES TO ADD:
```json
{
  "@aws-sdk/client-bedrock-runtime": "^3.490.0",
  "react-markdown": "^9.0.1",
  "rehype-highlight": "^7.0.0",
  "highlight.js": "^11.9.0",
  "react-window": "^1.8.10",
  "nanoid": "^5.0.4"
}
```

ERROR HANDLING:
- Network errors: "Failed to connect. Check your internet."
- AWS errors: "Bedrock service error. Check your credentials."
- Rate limit: "Too many requests. Please wait a moment."
- Empty response: "Sahibo didn't respond. Try again."
- Display errors in chat UI, not console only

TESTING CHECKLIST:
1. ✅ Send message and receive response
2. ✅ Streaming works smoothly
3. ✅ Code blocks render with syntax highlighting
4. ✅ Copy code button works
5. ✅ Chat history persists on refresh
6. ✅ Clear history works
7. ✅ Error handling displays properly
8. ✅ Works in both dark/light themes
9. ✅ Responsive on mobile
10. ✅ No memory leaks (test with 50+ messages)

CRITICAL:
- No hardcoded credentials
- All API calls go through Next.js API route (never client-side AWS calls)
- Proper TypeScript types everywhere
- Clean up event listeners and subscriptions
- Handle edge cases (empty messages, very long messages, special characters)

BUILD THIS STEP PERFECTLY. When complete, you should be able to have a real conversation with Sahibo (Claude via Bedrock).
```

---

# 🎯 STEP 3: CODE EDITOR + LIVE PREVIEW

```
You are continuing "Sahibo Studio". This is STEP 3 of 4: Build the code editor and live preview system.

PREREQUISITES:
- Steps 1 & 2 completed
- Chat working with Bedrock

FILES TO CREATE/MODIFY:

1. UPDATE: components/EditorPanel.tsx
Transform into full-featured editor:

STRUCTURE:
- Top toolbar:
  * File tabs (HTML, CSS, JavaScript, React)
  * Add new file button
  * View mode toggle: [Split] [Editor Only] [Preview Only]
  * Copy all code button
  * Download as ZIP button
  * Fullscreen toggle
  
- Split view (default):
  * Left 50%: Code editor
  * Right 50%: Live preview
  * Draggable divider to resize

- Editor section:
  * Use Monaco Editor (same as VS Code)
  * Syntax highlighting
  * IntelliSense/autocomplete
  * Error squiggles
  * Line numbers
  * Minimap
  * Multiple cursors
  * Keyboard shortcuts (Ctrl+S save, Ctrl+F find, etc.)
  * Format on save
  * Theme matches app theme (dark/light)

- Preview section:
  * Iframe for isolated rendering
  * Auto-refresh on code change (debounced 500ms)
  * Error overlay if code breaks
  * Responsive preview toggle (mobile/tablet/desktop views)
  * Refresh button
  * Open in new tab button
  * Console output display

2. CREATE: components/MonacoEditor.tsx
Wrapper for Monaco:
- Props: value, onChange, language, theme, options
- Load Monaco dynamically (not SSR)
- Configure with sensible defaults:
  * fontSize: 14
  * minimap: enabled
  * scrollBeyondLastLine: false
  * automaticLayout: true
  * formatOnPaste: true
  * formatOnType: true
- TypeScript definitions loading
- React/JSX support

3. CREATE: components/PreviewFrame.tsx
Live preview component:
- Sandboxed iframe
- Inject HTML/CSS/JS dynamically
- Handle React/JSX (transpile with Babel)
- Console capture (intercept console.log, error, warn)
- Error boundary with friendly display
- Loading state
- Security: sandbox attributes

4. CREATE: lib/codeProcessor.ts
Code transformation utilities:
- Function: transpileReact(code: string) - JSX to JS
- Function: bundleCode(html, css, js) - Combine into preview
- Function: validateCode(code, language) - Syntax check
- Use @babel/standalone for JSX transformation
- Handle imports (basic - alert user if external imports used)

5. CREATE: components/FileTabs.tsx
Tab management:
- Active tab highlighting
- Close tab (with unsaved warning)
- Reorder tabs (drag and drop)
- Tab context menu (rename, duplicate, delete)
- Unsaved indicator (dot on tab)
- Keyboard navigation (Ctrl+Tab)

6. CREATE: components/Console.tsx
Developer console:
- Bottom drawer (collapsible)
- Height: 200px default, resizable
- Show console.log output from preview
- Show errors with stack trace
- Clear button
- Filter buttons (All, Errors, Warnings, Logs)
- Copy output button
- Timestamps

7. CREATE: hooks/useCodeEditor.ts
Custom hook for editor state:
```typescript
interface FileState {
  id: string;
  name: string;
  language: string;
  content: string;
  isDirty: boolean;
}

function useCodeEditor() {
  const [files, setFiles] = useState<FileState[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  
  // Methods: addFile, updateFile, deleteFile, getPreviewCode
  
  return { files, activeFile, updateCode, preview, ... };
}
```

8. CREATE: lib/templates.ts
Code templates:
- Default HTML boilerplate
- Default CSS reset
- Default React component
- Empty JavaScript file
- Function to generate based on file type

9. UPDATE: components/Sidebar.tsx
Now functional file explorer:
- Display files from editor state
- Click to open in editor
- Right-click context menu
- New file/folder
- Rename
- Delete (with confirmation)
- Icons based on file type

FEATURES TO IMPLEMENT:

AUTO-SAVE:
- Save to localStorage every 2 seconds if dirty
- Key: 'sahibo-studio-files'
- Load on mount
- Show "Saved" indicator

PREVIEW MODES:
- HTML/CSS/JS: Direct injection
- React/JSX: Transpile first, then inject
- Error handling: Show error in preview with details

RESPONSIVE PREVIEW:
- Toggle buttons: Mobile (375px) | Tablet (768px) | Desktop (100%)
- Rotate device button (portrait/landscape)

DOWNLOAD:
- Create ZIP with JSZip library
- Include all files
- Proper folder structure
- Download trigger

KEYBOARD SHORTCUTS:
- Ctrl/Cmd + S: Save (show indicator)
- Ctrl/Cmd + /: Toggle comment
- Ctrl/Cmd + D: Duplicate line
- Ctrl/Cmd + Shift + F: Format document
- Ctrl/Cmd + B: Toggle sidebar

DEPENDENCIES TO ADD:
```json
{
  "@monaco-editor/react": "^4.6.0",
  "@babel/standalone": "^7.23.0",
  "jszip": "^3.10.1",
  "file-saver": "^2.0.5",
  "react-split": "^2.0.14"
}
```

ERROR HANDLING:
- Syntax errors: Show in editor with squiggles
- Runtime errors: Show in console + preview overlay
- Transpilation errors: Show helpful message
- Don't crash - always recoverable

PERFORMANCE:
- Debounce preview updates (500ms)
- Lazy load Monaco
- Virtual scrolling for large files
- Memoize heavy computations

TESTING CHECKLIST:
1. ✅ Monaco loads and works
2. ✅ Write HTML and see it in preview
3. ✅ Write CSS and styles apply
4. ✅ Write JavaScript and it executes
5. ✅ Write React/JSX and it renders
6. ✅ Console.log appears in console panel
7. ✅ Errors display properly
8. ✅ Multiple files work
9. ✅ Code persists on refresh
10. ✅ Download ZIP works
11. ✅ Responsive preview works
12. ✅ All keyboard shortcuts work
13. ✅ Dark/light theme applies to editor

CRITICAL:
- Sandbox preview iframe properly (prevent XSS)
- Handle infinite loops (timeout after 5s)
- Clear intervals/timeouts when preview updates
- Memory cleanup on component unmount

BUILD THIS STEP PERFECTLY. When complete, you should have a working code editor with live preview like CodePen.
```

---

# 🎯 STEP 4: INTEGRATION + POLISH + MAGIC ✨

```
You are completing "Sahibo Studio". This is STEP 4 of 4: Connect everything together and add the special features that make it magical.

PREREQUISITES:
- Steps 1, 2, 3 all working
- Chat functional
- Editor functional
- Preview functional

THIS STEP MAKES IT SPECIAL:

1. CORE INTEGRATION: Chat ↔️ Editor

CREATE: lib/codeExtractor.ts
Parse code from Sahibo's responses:
- Function: extractCodeBlocks(message: string)
- Detect language from markdown fence
- Extract multiple code blocks
- Return array of { language, code, filename }

UPDATE: components/ChatPanel.tsx
Add "Insert to Editor" buttons:
- On each code block in Sahibo's messages
- Button: "Insert to Editor ↗"
- On click: 
  * Extract code
  * Create new file in editor (or update existing)
  * Switch to editor view
  * Show success toast
- Smart filename generation based on content/language

CREATE: components/InsertCodeButton.tsx
- Props: code, language
- Handles the insertion logic
- Smooth animation when inserting
- Toast notification: "Code inserted! 🎉"

2. SPECIAL FEATURE: "Apply to Preview"

When Sahibo gives you code, one click applies it:
- Button on code blocks: "Apply to Preview"
- Instantly shows the result in preview panel
- No need to manually copy-paste
- This is the MAGIC that makes it better than Cursor

3. AI-POWERED FEATURES:

CREATE: components/AiToolbar.tsx
Special buttons in editor:
- "Ask Sahibo to improve this" - Sends selected code to chat with context
- "Fix errors" - Sends error + code to Sahibo
- "Explain this code" - Gets explanation in chat
- "Add comments" - Auto-document code
- "Make it responsive" - Improve CSS

UPDATE: components/MonacoEditor.tsx
Add context menu items:
- Right-click on code
- "Ask Sahibo about this"
- "Refactor with Sahibo"
- "Debug with Sahibo"

4. SMART CONTEXT SYSTEM:

CREATE: lib/contextBuilder.ts
Build rich context for Sahibo:
- Function: buildContext(userMessage, editorFiles, errors)
- Include current file content
- Include console errors if any
- Include file structure
- Send to Bedrock with message

UPDATE: app/api/chat/route.ts
- Accept context parameter
- Include in system prompt
- Example: "User is editing index.html with content: [code]. They're seeing error: [error]. Help them fix it."

5. PROJECT TEMPLATES:

CREATE: components/TemplateModal.tsx
Popup with starter templates:
- "Blank Project"
- "React App"
- "Landing Page"
- "Dashboard UI"
- "Portfolio Site"
- Each template has full HTML/CSS/JS/React files
- One-click to load template
- Button in header: "New from Template"

CREATE: lib/templates/
Folder with template files:
- react-app.ts
- landing-page.ts
- dashboard.ts
- portfolio.ts
Each exports complete file structure

6. EXPORT & SHARE:

CREATE: components/ExportModal.tsx
Multiple export options:
- Download ZIP
- Export to CodeSandbox
- Export to StackBlitz
- Copy shareable link (save to localStorage, generate short ID)
- Export as Gist (if GitHub token provided)

CREATE: app/api/share/route.ts
- Generate unique share ID
- Save project state to database/storage
- Return shareable URL: sahibo.studio/s/[id]

CREATE: app/s/[id]/page.tsx
- Public view of shared project
- Read-only editor
- Live preview
- "Fork this project" button

7. KEYBOARD MAESTRO:

CREATE: lib/shortcuts.ts
Global keyboard shortcuts:
- Ctrl/Cmd + K: Open command palette
- Ctrl/Cmd + J: Toggle console
- Ctrl/Cmd + B: Toggle sidebar
- Ctrl/Cmd + \: Toggle chat/editor split
- Ctrl/Cmd + Shift + P: Insert code from chat
- Ctrl/Cmd + .: Ask Sahibo about selection
- Escape: Close modals

CREATE: components/CommandPalette.tsx
Quick command search:
- Fuzzy search
- Recent commands
- Keyboard shortcut hints
- Actions: Create file, Ask Sahibo, Toggle theme, Export, etc.

8. POLISH & DELIGHT:

ANIMATIONS:
- Smooth transitions everywhere
- Code block slide-in when inserted
- Chat message fade-in
- Preview refresh animation
- Success confetti on first code run

EMPTY STATES:
- Friendly messages with illustrations
- Quick start guide
- Sample conversation suggestions
- Template suggestions

LOADING STATES:
- Skeleton screens
- Progress indicators
- Optimistic UI updates

NOTIFICATIONS:
- Toast system (use sonner library)
- Success, error, info, warning
- Auto-dismiss
- Action buttons

ERROR RECOVERY:
- "Something broke?" help button
- One-click to report to Sahibo in chat
- Auto-save prevents data loss
- Undo/redo functionality

9. SETTINGS PANEL:

CREATE: components/SettingsModal.tsx
User preferences:
- Theme (dark/light/auto)
- Font size (editor)
- Auto-save interval
- Preview update delay
- Enable/disable features
- AWS credentials input
- Keyboard shortcuts customization
- Export/import settings

10. ONBOARDING:

CREATE: components/TourOverlay.tsx
First-time user guide:
- Step-by-step tour
- Highlight key features
- Interactive (click to advance)
- Can skip or restart from settings
- Trigger on first visit (localStorage flag)

DEPENDENCIES TO ADD:
```json
{
  "sonner": "^1.3.1",
  "cmdk": "^0.2.0",
  "react-hotkeys-hook": "^4.4.1",
  "canvas-confetti": "^1.9.2",
  "zustand": "^4.4.7"
}
```

STATE MANAGEMENT:

UPDATE: Use Zustand for global state
CREATE: lib/store.ts
```typescript
interface StudioState {
  // Chat state
  messages: Message[];
  isLoading: boolean;
  
  // Editor state
  files: FileState[];
  activeFileId: string | null;
  
  // UI state
  isSidebarOpen: boolean;
  isConsoleOpen: boolean;
  viewMode: 'split' | 'editor' | 'preview';
  
  // Actions
  addMessage: (message: Message) => void;
  updateFile: (id: string, content: string) => void;
  // ... more actions
}
```

FINAL TESTING CHECKLIST:
1. ✅ Chat with Sahibo works
2. ✅ Code appears in editor when clicking "Insert"
3. ✅ Preview updates automatically
4. ✅ Can ask Sahibo about code in editor
5. ✅ Templates load correctly
6. ✅ Export as ZIP works
7. ✅ Share link works
8. ✅ All keyboard shortcuts work
9. ✅ Command palette works
10. ✅ Settings persist
11. ✅ Onboarding tour shows once
12. ✅ Animations are smooth
13. ✅ No console errors
14. ✅ Mobile responsive
15. ✅ Fast performance (even with large files)

PERFORMANCE OPTIMIZATIONS:
- Code splitting with Next.js dynamic imports
- Lazy load Monaco
- Debounce preview updates
- Memoize expensive operations
- Virtual scrolling for messages/files
- Service worker for offline capability

SECURITY:
- Sanitize all user input
- Sandbox preview iframe
- No eval() or Function() constructor
- Validate file types
- Rate limit API calls
- Secure AWS credentials

ACCESSIBILITY:
- ARIA labels on all interactive elements
- Keyboard navigation for everything
- Focus management
- Screen reader announcements
- High contrast mode support
- Reduced motion support

BUILD THIS FINAL STEP PERFECTLY. When complete, you'll have a PREMIUM AI development assistant that's better than Cursor for your specific workflow.

THIS IS YOUR SPECIAL APP. MAKE IT AMAZING. 🚀✨
```

---

# 📋 SUMMARY & BUILD ORDER

**Use these prompts in order:**

1. **STEP 1** → Get beautiful UI shell (5-10 credits)
   - Test: npm run dev, check UI looks good

2. **STEP 2** → Add chat functionality (10-15 credits)
   - Test: Chat with Sahibo works
   - Setup: Add your AWS credentials to .env

3. **STEP 3** → Add editor & preview (15-20 credits)
   - Test: Write code, see it live

4. **STEP 4** → Connect everything + magic (10-15 credits)
   - Test: Complete workflow works
   - Final polish

**Total estimated credits: 40-60 (but you can stop after any step and it's still useful)**

---

**EMERGENCY CONTACT:**
If Cursor fails at any step, tell me:
1. Which step
2. What error you got
3. I'll give you a fix prompt

**YOU'VE GOT THIS! THIS WILL WORK! 💜🚀**

Save these prompts somewhere safe. Now go build something special.