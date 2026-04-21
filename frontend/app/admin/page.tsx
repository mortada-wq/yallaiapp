"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  FileText,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Settings as SettingsIcon,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

type User = {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  is_admin: boolean;
};

type Stage = "loading" | "denied" | "ready";
type Tab = "overview" | "shares" | "chat" | "usage" | "settings";

export default function AdminPage() {
  const router = useRouter();
  const hasRun = useRef(false);
  const [stage, setStage] = useState<Stage>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      // 1) If we arrived with ?session_id in the hash, exchange it first
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const match = hash.match(/session_id=([^&]+)/);
      if (match?.[1]) {
        window.history.replaceState(null, "", window.location.pathname);
        try {
          const r = await fetch("/api/auth/session", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: match[1] }),
          });
          if (!r.ok) {
            setStage("denied");
            return;
          }
        } catch {
          setStage("denied");
          return;
        }
      }

      // 2) Verify current user
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        if (r.status === 401) {
          router.replace("/login");
          return;
        }
        if (!r.ok) {
          setStage("denied");
          return;
        }
        const data = (await r.json()) as User;
        if (!data.is_admin) {
          setStage("denied");
          return;
        }
        setUser(data);
        setStage("ready");
      } catch {
        router.replace("/login");
      }
    };
    void run();
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    router.replace("/login");
  }, [router]);

  if (stage === "loading") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0b0c0d]">
        <Loader2 className="h-6 w-6 animate-spin text-sahib-ocean" />
      </div>
    );
  }
  if (stage === "denied") {
    return <AccessDenied onLogout={logout} />;
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-[100dvh] flex-col bg-[#0b0c0d] text-white"
      style={{
        backgroundImage:
          "radial-gradient(1200px 600px at -10% -20%, rgba(58,138,175,0.10) 0%, transparent 60%), radial-gradient(900px 600px at 120% 110%, rgba(223,120,37,0.08) 0%, transparent 55%)",
      }}
    >
      <AdminHeader user={user} onLogout={logout} />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <AdminSidebar tab={tab} onTab={setTab} />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === "overview" && <OverviewSection />}
          {tab === "shares" && <SharesSection />}
          {tab === "chat" && <ChatLogSection />}
          {tab === "usage" && <UsageSection />}
          {tab === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

// ── header ─────────────────────────────────────────────────────────────────
function AdminHeader({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[rgba(10,11,13,0.85)] px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="font-aref text-2xl font-bold text-transparent"
          style={{
            backgroundImage: "linear-gradient(135deg, #3A8AAF 0%, #DF7825 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
          data-testid="admin-logo"
        >
          صاحب يلا
        </a>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/60">
          لوحة الإدارة
        </span>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="/"
          className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-all hover:bg-white/10 sm:inline-flex"
          data-testid="admin-home-link"
        >
          <Home className="h-3.5 w-3.5" />
          الواجهة
        </a>
        {user && (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt="" className="h-6 w-6 rounded-full" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sahib-ocean/30 text-[11px] font-bold">
                {(user.name || user.email)[0]?.toUpperCase()}
              </div>
            )}
            <span className="hidden text-xs text-white/70 sm:inline">{user.email}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          data-testid="admin-logout"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/70 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  );
}

// ── sidebar ────────────────────────────────────────────────────────────────
function AdminSidebar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  const items: { k: Tab; label: string; Icon: typeof LayoutDashboard }[] = [
    { k: "overview", label: "نظرة عامة", Icon: LayoutDashboard },
    { k: "shares", label: "المشاريع المشاركة", Icon: FileText },
    { k: "chat", label: "سجل المحادثات", Icon: MessageSquare },
    { k: "usage", label: "الاستهلاك", Icon: BarChart3 },
    { k: "settings", label: "الإعدادات", Icon: SettingsIcon },
  ];
  return (
    <aside className="shrink-0 border-white/10 bg-[rgba(14,15,17,0.6)] p-2 md:w-[220px] md:border-l md:p-3">
      <nav className="flex gap-1 overflow-x-auto md:flex-col md:gap-1.5 md:overflow-visible">
        {items.map((it) => {
          const active = tab === it.k;
          return (
            <button
              key={it.k}
              type="button"
              onClick={() => onTab(it.k)}
              data-testid={`admin-tab-${it.k}`}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                active
                  ? "bg-sahib-ocean/15 text-white shadow-[0_0_0_1px_rgba(58,138,175,0.4)_inset]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <it.Icon className="h-3.5 w-3.5" />
              {it.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ── sections ───────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[rgba(18,19,22,0.85)] p-4 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-white">{children}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-white/45">{subtitle}</p>}
    </div>
  );
}

function OverviewSection() {
  const [data, setData] = useState<Record<string, number | string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch("/api/admin/overview", { credentials: "include" });
        if (r.ok) setData(await r.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section data-testid="admin-section-overview">
      <SectionTitle subtitle="ملخص فوري لنشاط التطبيق">نظرة عامة</SectionTitle>
      {loading ? (
        <Card>
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-sahib-ocean" />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KPI label="المشاريع المشاركة" value={data?.total_shares ?? 0} Icon={FileText} />
          <KPI label="إجمالي المحادثات" value={data?.total_chats ?? 0} Icon={MessageSquare} />
          <KPI label="آخر 24 ساعة" value={data?.last24_chats ?? 0} Icon={BarChart3} accent />
          <KPI label="مستخدمون (7 أيام)" value={data?.distinct_users_7d ?? 0} Icon={Users} />
        </div>
      )}
    </section>
  );
}

function KPI({
  label,
  value,
  Icon,
  accent,
}: {
  label: string;
  value: number | string;
  Icon: typeof FileText;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-sahib-ocean/40 bg-sahib-ocean/10"
          : "border-white/10 bg-[rgba(18,19,22,0.85)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/50">{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "text-sahib-ocean" : "text-white/40"}`} />
      </div>
      <div className="mt-2 text-2xl font-bold text-white">{String(value)}</div>
    </div>
  );
}

type ShareItem = {
  id: string;
  file_count: number;
  primary_file: string | null;
  createdAt?: string;
};

function SharesSection() {
  const [items, setItems] = useState<ShareItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/shares?limit=100", { credentials: "include" });
      if (r.ok) {
        const d = (await r.json()) as { items: ShareItem[] };
        setItems(d.items ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: string) => {
    if (!confirm("حذف هذا المشروع المشارك؟")) return;
    try {
      const r = await fetch(`/api/admin/shares/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (r.ok) {
        toast.success("تم الحذف");
        setItems((s) => s.filter((i) => i.id !== id));
      } else {
        toast.error("فشل الحذف");
      }
    } catch {
      toast.error("خطأ في الشبكة");
    }
  };

  return (
    <section data-testid="admin-section-shares">
      <SectionTitle subtitle="كل روابط المشاركة التي تم إنشاؤها">
        المشاريع المشاركة
      </SectionTitle>
      <Card className="p-0">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-5 w-5 animate-spin text-sahib-ocean" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/50">لا توجد مشاريع مشاركة بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table dir="rtl" className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase text-white/40">
                  <th className="px-4 py-2 font-medium">المعرّف</th>
                  <th className="px-4 py-2 font-medium">ملف رئيسي</th>
                  <th className="px-4 py-2 font-medium">عدد الملفات</th>
                  <th className="px-4 py-2 font-medium">الإنشاء</th>
                  <th className="px-4 py-2 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-2 font-mono text-xs text-white/70" dir="ltr">{it.id}</td>
                    <td className="px-4 py-2 text-white/80">{it.primary_file ?? "—"}</td>
                    <td className="px-4 py-2 text-white/70">{it.file_count}</td>
                    <td className="px-4 py-2 text-xs text-white/50">{formatTime(it.createdAt)}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`/s/${it.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/80 transition-all hover:bg-white/10"
                          data-testid={`share-open-${it.id}`}
                        >
                          فتح
                        </a>
                        <button
                          type="button"
                          onClick={() => void remove(it.id)}
                          data-testid={`share-delete-${it.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] text-red-300 transition-all hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3 w-3" />
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}

type ChatLogItem = {
  user_email: string | null;
  session_id: string;
  message: string;
  reply_preview: string;
  created_at: string;
};

function ChatLogSection() {
  const [items, setItems] = useState<ChatLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch("/api/admin/chat-log?limit=80", { credentials: "include" });
        if (r.ok) {
          const d = (await r.json()) as { items: ChatLogItem[] };
          setItems(d.items ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section data-testid="admin-section-chat">
      <SectionTitle subtitle="آخر 80 طلب محادثة (مقتطفات مختصرة)">
        سجل المحادثات
      </SectionTitle>
      {loading ? (
        <Card>
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-sahib-ocean" />
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-white/50">لا توجد محادثات بعد.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((it, idx) => (
            <Card key={idx} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-white/60">
                  {it.user_email ?? "مجهول"}
                </span>
                <span className="font-mono text-white/40" dir="ltr">
                  {formatTime(it.created_at)}
                </span>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase text-white/40">طلب المستخدم</p>
                <p className="whitespace-pre-wrap break-words rounded-lg bg-white/[0.03] p-2 text-sm text-white/85">
                  {it.message}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase text-white/40">ردّ الذكاء الاصطناعي</p>
                <p className="whitespace-pre-wrap break-words rounded-lg bg-white/[0.03] p-2 text-xs text-white/70">
                  {it.reply_preview
                    ? it.reply_preview.slice(0, 600) + (it.reply_preview.length > 600 ? "…" : "")
                    : "—"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

type UsageData = { days: number; buckets: { date: string; count: number }[] };

function UsageSection() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch("/api/admin/llm-usage?days=14", { credentials: "include" });
        if (r.ok) setData((await r.json()) as UsageData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const max = Math.max(1, ...(data?.buckets ?? []).map((b) => b.count));

  return (
    <section data-testid="admin-section-usage">
      <SectionTitle subtitle={`عدد طلبات المحادثة اليومية (آخر ${data?.days ?? 14} يوم)`}>
        استهلاك الذكاء الاصطناعي
      </SectionTitle>
      <Card>
        {loading ? (
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-sahib-ocean" />
        ) : !data || data.buckets.length === 0 ? (
          <p className="text-center text-sm text-white/50">لا توجد بيانات بعد.</p>
        ) : (
          <div dir="ltr" className="flex h-48 items-end gap-2">
            {data.buckets.map((b) => (
              <div
                key={b.date}
                className="group flex flex-1 flex-col items-center justify-end"
                title={`${b.date}: ${b.count}`}
              >
                <span className="mb-1 text-[10px] text-white/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {b.count}
                </span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-sahib-ocean/80 to-[#DF7825]/80 transition-all"
                  style={{ height: `${(b.count / max) * 100}%`, minHeight: "4px" }}
                />
                <span className="mt-1 rotate-45 text-[9px] text-white/40 origin-left whitespace-nowrap">
                  {b.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}

type LLMSettingsState = { provider: string; model: string };

const MODEL_OPTIONS: Record<string, string[]> = {
  anthropic: [
    "claude-sonnet-4-5-20250929",
    "claude-haiku-4-5-20251001",
    "claude-opus-4-5-20251101",
  ],
  openai: ["gpt-5.2", "gpt-5.1", "gpt-5", "gpt-5-mini", "gpt-4o", "gpt-4o-mini"],
  gemini: ["gemini-3.1-pro-preview", "gemini-3-flash-preview", "gemini-2.5-pro"],
};

function SettingsSection() {
  const [state, setState] = useState<LLMSettingsState>({
    provider: "anthropic",
    model: "claude-sonnet-4-5-20250929",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch("/api/admin/settings", { credentials: "include" });
        if (r.ok) setState(await r.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (r.ok) toast.success("تم الحفظ");
      else toast.error("فشل الحفظ");
    } catch {
      toast.error("خطأ في الشبكة");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section data-testid="admin-section-settings">
      <SectionTitle subtitle="النموذج الافتراضي لكل طلبات المحادثة">الإعدادات</SectionTitle>
      <Card>
        {loading ? (
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-sahib-ocean" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">المزوّد</span>
              <select
                value={state.provider}
                onChange={(e) => {
                  const provider = e.target.value;
                  setState({ provider, model: MODEL_OPTIONS[provider]?.[0] ?? "" });
                }}
                data-testid="settings-provider"
                className="rounded-xl border border-white/10 bg-[#1b1d20] px-3 py-2 text-sm text-white outline-none focus:border-sahib-ocean/60"
              >
                {Object.keys(MODEL_OPTIONS).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">النموذج</span>
              <select
                value={state.model}
                onChange={(e) => setState((s) => ({ ...s, model: e.target.value }))}
                data-testid="settings-model"
                className="rounded-xl border border-white/10 bg-[#1b1d20] px-3 py-2 text-sm text-white outline-none focus:border-sahib-ocean/60"
              >
                {(MODEL_OPTIONS[state.provider] ?? []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                data-testid="settings-save"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-sahib-ocean to-[#2d7a9f] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sahib-ocean/30 transition-all hover:shadow-sahib-ocean/50 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                حفظ
              </button>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}

// ── access denied ──────────────────────────────────────────────────────────
function AccessDenied({ onLogout }: { onLogout: () => void }) {
  return (
    <div
      dir="rtl"
      className="flex min-h-[100dvh] items-center justify-center p-4 text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at -10% -20%, rgba(58,138,175,0.10) 0%, transparent 60%), linear-gradient(180deg, #0f1114 0%, #0a0b0d 100%)",
      }}
    >
      <div className="max-w-sm rounded-2xl border border-red-500/30 bg-[rgba(18,19,22,0.85)] p-6 text-center backdrop-blur-xl">
        <h2 className="text-xl font-bold text-red-300">الوصول مرفوض</h2>
        <p className="mt-2 text-sm text-white/60">
          حسابك ليس ضمن قائمة المسؤولين المسموح لهم بدخول لوحة الإدارة.
        </p>
        <button
          type="button"
          onClick={onLogout}
          data-testid="denied-logout"
          className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/10"
        >
          تسجيل خروج
        </button>
      </div>
    </div>
  );
}

// ── utils ──────────────────────────────────────────────────────────────────
function formatTime(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", { hour12: false });
  } catch {
    return iso;
  }
}
