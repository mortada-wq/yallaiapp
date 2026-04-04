export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface EditorFile {
  id: string;
  name: string;
  language: string;
  content: string;
  isDirty: boolean;
}

export type ViewMode = "split" | "editor" | "preview";

export type ConsoleLogLevel = "log" | "warn" | "error" | "info";

export interface ConsoleEntry {
  id: string;
  level: ConsoleLogLevel;
  args: string;
  timestamp: string;
}

export interface PreviewDeviceSize {
  label: string;
  width: string;
}

export interface CodeBlockExtract {
  language: string;
  code: string;
  suggestedFilename: string;
}

export interface ChatContextPayload {
  activeFileName?: string;
  activeFileContent?: string;
  fileTree?: string;
  consoleErrors?: string;
  selection?: string;
  projectInstructions?: string;
}

export type AiProvider = "bedrock" | "anthropic" | "openai" | "deepseek";

export interface AiProviderConfig {
  provider: AiProvider;
  /** API key — stored in localStorage, sent to server per-request */
  apiKey: string;
  model: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  instructions: string;
  files: EditorFile[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
