declare module "@babel/standalone" {
  export function transform(
    code: string,
    opts?: { presets?: string[]; filename?: string },
  ): { code?: string | null };
}
