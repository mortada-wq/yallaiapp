"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PreviewFrame } from "@/components/PreviewFrame";
import { bundleCode, detectJsxProject } from "@/lib/codeProcessor";
import type { EditorFile } from "@/lib/types";

export default function ShareViewPage() {
  const params = useParams();
  const id = params.id as string;
  const [files, setFiles] = useState<EditorFile[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`/api/share/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json() as Promise<{ files: EditorFile[] }>;
      })
      .then((d) => setFiles(d.files ?? []))
      .catch(() => setErr("Invalid or expired share link."));
  }, [id]);

  const html = useMemo(() => {
    if (!files.length) return "<html><body><p>Loading…</p></body></html>";
    const h = files.find((f) => f.name.endsWith(".html"))?.content ?? "<body></body>";
    const css = files.find((f) => f.name.endsWith(".css"))?.content ?? "";
    const jsxFile = files.find((f) => f.name.endsWith(".jsx") || f.name.endsWith(".tsx"));
    const jsPlain = files.find((f) => f.name.endsWith(".js") && !f.name.endsWith(".jsx"));
    const jsx = detectJsxProject(files);
    const js = jsxFile?.content ?? jsPlain?.content ?? "";
    const b = bundleCode(h, css, js, jsx);
    return b.error ? `<html><body><pre>${b.error}</pre></body></html>` : b.html;
  }, [files]);

  if (err) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sahib-deep p-6 text-[#E5E7EB]">
        <p>{err}</p>
        <Link href="/" className="text-sahib-ocean underline transition-colors hover:text-white">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#1e1e1e]">
      <header className="flex items-center justify-between border-b border-[#3c3c3c] bg-[#252526] px-4 py-3">
        <span className="text-sm font-medium text-[#9CA3AF]">Shared preview</span>
        <Link
          href="/"
          className="rounded-xl border border-[rgba(58,138,175,0.55)] bg-[#252526] px-3 py-1.5 text-sm font-semibold transition-all hover:border-[rgba(58,138,175,0.8)] hover:shadow-sahib-ring"
        >
          <span className="text-[#E5E7EB]">sahib.chat</span>
        </Link>
      </header>
      <div className="flex-1 p-4">
        <PreviewFrame html={html} className="min-h-[480px]" />
      </div>
    </div>
  );
}
