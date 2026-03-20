"use client";

import type { AnalysisResult } from "@/lib/indicators";

interface StockAnalysisProps {
  analysis: AnalysisResult;
  symbol: string;
  currentPrice: number;
  changePercent: number;
}

export function StockAnalysis({
  analysis,
  symbol,
  currentPrice,
  changePercent,
}: StockAnalysisProps) {
  const { recommendation, score, signals, rsi, sma20, sma50, macd } = analysis;

  const recColor =
    recommendation === "BUY"
      ? "text-emerald-500"
      : recommendation === "SELL"
        ? "text-red-500"
        : "text-amber-500";

  const recBg =
    recommendation === "BUY"
      ? "bg-emerald-500/20 border-emerald-500/50"
      : recommendation === "SELL"
        ? "bg-red-500/20 border-red-500/50"
        : "bg-amber-500/20 border-amber-500/50";

  return (
    <div className="space-y-6">
      <div
        className={`rounded-xl border-2 p-6 ${recBg} transition-colors`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
              Recommendation
            </p>
            <p className={`text-3xl font-bold ${recColor}`}>{recommendation}</p>
            <p className="mt-1 text-sm text-zinc-500">
              Score: {score} (-100 bearish → +100 bullish)
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ฿{currentPrice.toFixed(2)}
            </p>
            <p
              className={
                changePercent >= 0 ? "text-emerald-500" : "text-red-500"
              }
            >
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {rsi != null && (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500">RSI (14)</p>
            <p className="text-xl font-semibold">{rsi.toFixed(1)}</p>
            <p className="text-xs text-zinc-400">
              {rsi < 30 ? "Oversold" : rsi > 70 ? "Overbought" : "Neutral"}
            </p>
          </div>
        )}
        {sma20 != null && (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500">SMA 20</p>
            <p className="text-xl font-semibold">฿{sma20.toFixed(2)}</p>
            <p className="text-xs text-zinc-400">
              {currentPrice > sma20 ? "Above" : "Below"} price
            </p>
          </div>
        )}
        {sma50 != null && (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500">SMA 50</p>
            <p className="text-xl font-semibold">฿{sma50.toFixed(2)}</p>
            <p className="text-xs text-zinc-400">
              {currentPrice > sma50 ? "Above" : "Below"} price
            </p>
          </div>
        )}
      </div>

      {macd != null && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">MACD</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <span>MACD: {macd.macd.toFixed(4)}</span>
            <span>Signal: {macd.signal.toFixed(4)}</span>
            <span
              className={
                macd.histogram > 0 ? "text-emerald-500" : "text-red-500"
              }
            >
              Histogram: {macd.histogram > 0 ? "+" : ""}
              {macd.histogram.toFixed(4)}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {macd.histogram > 0 ? "Bullish" : "Bearish"} momentum
          </p>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="mb-2 text-sm font-medium text-zinc-500">Signals</p>
        <ul className="space-y-1 text-sm">
          {signals.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-zinc-500">
        Data from Yahoo Finance. Thai stocks use .BK suffix. This is for
        educational purposes only—not financial advice.
      </p>
    </div>
  );
}
