"use client";

import { useState } from "react";
import { StockChart } from "@/components/StockChart";
import { StockAnalysis } from "@/components/StockAnalysis";
import { analyzeStock } from "@/lib/indicators";

const POPULAR_SYMBOLS = ["BDMS",  "BEM", "PTT", "BBL", "CPALL", "ADVANC", "SCB", "KBANK", "PTTEP"];

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState<{
    symbol: string;
    name: string;
    currentPrice: number;
    changePercent: number;
    prices: { date: string; open: number; high: number; low: number; close: number; volume: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchStock(sym?: string) {
    const target = (sym ?? searchInput).trim().toUpperCase();
    if (!target) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stock/${encodeURIComponent(target)}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch");
      }

      setData(json);
      setSearchInput(json.symbol);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const analysis = data?.prices ? analyzeStock(data.prices) : null;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            AutoStock Thailand
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Real-time SET stock prices with technical analysis for buy/sell decisions
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-3">
          <div className="flex flex-1 min-w-[200px] gap-2">
            <input
              type="text"
              placeholder="Stock symbol (e.g. AOT, PTT)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && fetchStock()}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
            <button
              onClick={() => fetchStock()}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Analyze"}
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {POPULAR_SYMBOLS.map((s) => (
            <button
              key={s}
              onClick={() => fetchStock(s)}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {data && analysis && (
          <div className="space-y-8">
            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {data.symbol}
                  </h2>
                  <p className="text-sm text-zinc-500">{data.name}</p>
                </div>
                <a
                  href={`https://www.set.or.th/th/market/product/stock/quote/${data.symbol}/price`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  View on SET →
                </a>
              </div>
              <StockChart
                data={data.prices}
                sma20={analysis.sma20}
                sma50={analysis.sma50}
              />
            </section>

            <section>
              <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Analysis & Recommendation
              </h3>
              <StockAnalysis
                analysis={analysis}
                symbol={data.symbol}
                currentPrice={data.currentPrice}
                changePercent={data.changePercent}
              />
            </section>
          </div>
        )}

        {!data && !loading && !error && (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-100/50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="text-zinc-500 dark:text-zinc-400">
              Enter a Thailand SET stock symbol (e.g. AOT, PTT, BBL) and click Analyze
            </p>
            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
              Data source: Yahoo Finance (Thai stocks use .BK suffix)
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
