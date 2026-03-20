import { NextRequest, NextResponse } from "next/server";

/**
 * Thailand stocks on Yahoo Finance use .BK suffix (e.g., AOT.BK, PTT.BK)
 * Data source: Yahoo Finance v8 Chart API (unofficial but widely used)
 * Alternative: SET website https://www.set.or.th/th/market/product/stock/quote/[symbol]/price
 */
const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

function toYahooSymbol(symbol: string): string {
  const clean = symbol.toUpperCase().trim();
  return clean.endsWith(".BK") ? clean : `${clean}.BK`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    const yahooSymbol = toYahooSymbol(symbol);

    // Fetch 6 months of daily data for technical analysis
    const url = `${YAHOO_CHART_URL}/${encodeURIComponent(yahooSymbol)}?interval=1d&range=6mo`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AutoStock/1.0; +https://github.com/autostock)",
      },
      next: { revalidate: 60 }, // Cache 1 minute
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (!data?.chart?.result?.[0]) {
      return NextResponse.json(
        { error: "No data found for symbol. Try AOT, PTT, BBL, etc." },
        { status: 404 }
      );
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp || [];

    const prices: { date: string; open: number; high: number; low: number; close: number; volume: number }[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const close = quotes?.close?.[i];
      if (close == null) continue;

      prices.push({
        date: new Date(timestamps[i] * 1000).toISOString().split("T")[0],
        open: quotes?.open?.[i] ?? close,
        high: quotes?.high?.[i] ?? close,
        low: quotes?.low?.[i] ?? close,
        close,
        volume: quotes?.volume?.[i] ?? 0,
      });
    }

    const currentPrice = meta.regularMarketPrice ?? prices[prices.length - 1]?.close;
    const prevClose = meta.previousClose ?? prices[prices.length - 2]?.close;
    const change = currentPrice - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;

    return NextResponse.json({
      symbol: meta.symbol?.replace(".BK", "") ?? symbol,
      name: meta.shortName ?? meta.longName ?? symbol,
      currency: meta.currency ?? "THB",
      currentPrice,
      prevClose,
      change,
      changePercent,
      prices,
      chartPreviousClose: meta.chartPreviousClose ?? prevClose,
    });
  } catch (err) {
    console.error("Stock API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
