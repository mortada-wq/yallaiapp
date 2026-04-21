"use client";

import { useState } from "react";
import { Layers, Plus, X, ChevronDown, ChevronRight, Search, Tag, Trash2 } from "lucide-react";
import { useKnowledgeStore } from "@/lib/knowledgeStore";
import { useProjectStore } from "@/lib/projectStore";
import { cn } from "@/lib/utils";
import type { KnowledgeEntry } from "@/lib/types";

export function KnowledgeTowerPanel() {
  const entries = useKnowledgeStore((s) => s.entries);
  const addEntry = useKnowledgeStore((s) => s.addEntry);
  const updateEntry = useKnowledgeStore((s) => s.updateEntry);
  const deleteEntry = useKnowledgeStore((s) => s.deleteEntry);
  const projects = useProjectStore((s) => s.projects);

  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formLinked, setFormLinked] = useState<string[]>([]);

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormTags("");
    setFormLinked([]);
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (entry: KnowledgeEntry) => {
    setFormTitle(entry.title);
    setFormContent(entry.content);
    setFormTags(entry.tags.join(", "));
    setFormLinked(entry.linkedProjectIds);
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleSave = () => {
    const tags = formTags.split(",").map((t) => t.trim()).filter(Boolean);
    if (editingId) {
      updateEntry(editingId, { title: formTitle, content: formContent, tags, linkedProjectIds: formLinked });
    } else {
      addEntry({ title: formTitle, content: formContent, tags, linkedProjectIds: formLinked });
    }
    resetForm();
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-[#3A8AAF]" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Knowledge Tower
          </span>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          title="Add entry"
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-[#3A8AAF] transition hover:bg-[rgba(58,138,175,0.1)]"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-white/10 px-2 py-2">
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#1a1a1a] px-2 py-1">
          <Search className="h-3 w-3 shrink-0 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="flex-1 bg-transparent text-[11px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none"
          />
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="border-b border-[rgba(58,138,175,0.3)] bg-[rgba(58,138,175,0.05)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#E5E7EB]">
              {editingId ? "Edit Entry" : "New Entry"}
            </span>
            <button type="button" onClick={resetForm} className="text-[#9CA3AF] hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Title"
            className="mb-2 w-full rounded border border-white/10 bg-[#1a1a1a] px-2 py-1 text-xs text-[#E5E7EB] placeholder-[#6B7280] focus:border-[rgba(58,138,175,0.5)] focus:outline-none"
          />
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="Content / notes..."
            rows={3}
            className="studio-scroll mb-2 w-full resize-none rounded border border-white/10 bg-[#1a1a1a] px-2 py-1 text-xs text-[#E5E7EB] placeholder-[#6B7280] focus:border-[rgba(58,138,175,0.5)] focus:outline-none"
          />
          <input
            type="text"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="mb-2 w-full rounded border border-white/10 bg-[#1a1a1a] px-2 py-1 text-xs text-[#E5E7EB] placeholder-[#6B7280] focus:border-[rgba(58,138,175,0.5)] focus:outline-none"
          />
          {projects.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-[10px] text-[#6B7280]">Link to projects:</p>
              <div className="flex flex-wrap gap-1">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setFormLinked((prev) =>
                        prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id],
                      )
                    }
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] transition",
                      formLinked.includes(p.id)
                        ? "bg-[rgba(58,138,175,0.3)] text-[#3A8AAF]"
                        : "bg-white/5 text-[#9CA3AF] hover:bg-white/10",
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!formTitle.trim()}
              className="rounded bg-[#3A8AAF] px-3 py-1 text-[11px] font-medium text-white transition hover:bg-[#2d7a9f] disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded px-3 py-1 text-[11px] text-[#9CA3AF] transition hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Entries list */}
      <div className="studio-scroll flex-1 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Layers className="h-8 w-8 text-[#4B5563]" />
            <p className="text-[11px] text-[#6B7280]">
              {search ? "No entries match your search." : "No knowledge entries yet."}
            </p>
            {!search && (
              <button
                type="button"
                onClick={openAddForm}
                className="text-[11px] text-[#3A8AAF] transition hover:underline"
              >
                Add your first entry
              </button>
            )}
          </div>
        ) : (
          filtered.map((entry) => {
            const expanded = expandedIds.has(entry.id);
            const linkedProjects = projects.filter((p) => entry.linkedProjectIds.includes(p.id));
            return (
              <div
                key={entry.id}
                className="knowledge-tower-entry mx-2 my-1 rounded-md border border-white/5 bg-[#1a1a1a]"
              >
                <div
                  className="flex cursor-pointer items-center gap-2 px-2 py-2"
                  onClick={() => toggleExpand(entry.id)}
                >
                  {expanded ? (
                    <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
                  ) : (
                    <ChevronRight className="h-3 w-3 shrink-0 text-[#6B7280]" />
                  )}
                  <span className="flex-1 truncate text-[12px] font-medium text-[#E5E7EB]">
                    {entry.title}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openEditForm(entry); }}
                    className="rounded p-0.5 text-[#6B7280] opacity-0 transition hover:text-[#3A8AAF] group-hover:opacity-100"
                    title="Edit"
                  >
                    <Plus className="h-3 w-3 rotate-45" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                    className="rounded p-0.5 text-[#6B7280] opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-2 pb-1">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] text-[#6B7280]"
                      >
                        <Tag className="h-2 w-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {expanded && (
                  <div className="border-t border-white/5 px-2 py-2">
                    <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-[#9CA3AF]">
                      {entry.content || <span className="italic text-[#6B7280]">No content.</span>}
                    </p>
                    {linkedProjects.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-[10px] text-[#6B7280]">Linked:</span>
                        {linkedProjects.map((p) => (
                          <span
                            key={p.id}
                            className="rounded bg-[rgba(58,138,175,0.15)] px-1.5 py-0.5 text-[10px] text-[#3A8AAF]"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(entry)}
                        className="text-[10px] text-[#3A8AAF] transition hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-[10px] text-red-400 transition hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
