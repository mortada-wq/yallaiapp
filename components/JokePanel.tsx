"use client";

import { useCallback, useEffect, useState } from "react";
import { Laugh, RefreshCw } from "lucide-react";
import { SahibSecondaryButton } from "@/components/SahibButton";

type JokeApiResponse =
  | { error: false; type: "single"; joke: string; category: string; id: number }
  | {
      error: false;
      type: "twopart";
      setup: string;
      delivery: string;
      category: string;
      id: number;
    }
  | { error: true; message: string };

type JokeState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "single"; category: string; joke: string }
  | { status: "twopart"; category: string; setup: string; delivery: string };

const JOKE_API_URL =
  "https://v2.jokeapi.dev/joke/Any?safe-mode&blacklistFlags=nsfw,racist,sexist,explicit";

export function JokePanel() {
  const [jokeState, setJokeState] = useState<JokeState>({ status: "loading" });

  const fetchJoke = useCallback(async () => {
    setJokeState({ status: "loading" });
    try {
      const res = await fetch(JOKE_API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as JokeApiResponse;
      if (data.error) {
        setJokeState({ status: "error", message: data.message });
      } else if (data.type === "single") {
        setJokeState({ status: "single", category: data.category, joke: data.joke });
      } else {
        setJokeState({
          status: "twopart",
          category: data.category,
          setup: data.setup,
          delivery: data.delivery,
        });
      }
    } catch (e) {
      setJokeState({
        status: "error",
        message: e instanceof Error ? e.message : "Failed to fetch joke",
      });
    }
  }, []);

  useEffect(() => {
    void fetchJoke();
  }, [fetchJoke]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <Laugh className="h-3.5 w-3.5 text-[#3A8AAF]" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          Joke Generator
        </span>
      </div>

      <div className="studio-scroll flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
        {jokeState.status === "loading" && (
          <div className="flex flex-col items-center gap-2 py-6">
            <RefreshCw className="h-6 w-6 animate-spin text-sahib-ocean" />
            <p className="text-xs text-[#9CA3AF]">Fetching a joke…</p>
          </div>
        )}

        {jokeState.status === "error" && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-3 text-xs text-red-300">
            {jokeState.message}
          </div>
        )}

        {(jokeState.status === "single" || jokeState.status === "twopart") && (
          <div className="flex flex-col gap-3 rounded-xl border border-[rgba(58,138,175,0.3)] bg-[rgba(58,138,175,0.07)] px-4 py-4">
            <span className="inline-block rounded-full border border-[rgba(58,138,175,0.4)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#3A8AAF]">
              {jokeState.category}
            </span>

            {jokeState.status === "single" ? (
              <p className="text-sm leading-relaxed text-[#E5E7EB]">{jokeState.joke}</p>
            ) : (
              <>
                <p className="text-sm font-medium leading-relaxed text-[#E5E7EB]">
                  {jokeState.setup}
                </p>
                <p className="border-t border-[rgba(58,138,175,0.2)] pt-2 text-sm italic leading-relaxed text-[#9CA3AF]">
                  {jokeState.delivery}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#3c3c3c] p-3">
        <SahibSecondaryButton
          type="button"
          onClick={() => void fetchJoke()}
          disabled={jokeState.status === "loading"}
          className="flex w-full items-center justify-center gap-2"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${jokeState.status === "loading" ? "animate-spin" : ""}`}
          />
          {jokeState.status === "loading" ? "Loading…" : "Get Another Joke"}
        </SahibSecondaryButton>
      </div>
    </div>
  );
}
