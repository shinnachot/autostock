/**
 * Technical analysis indicators for buy/sell decision support
 * Formulas based on standard financial analysis
 */

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnalysisResult {
  rsi: number | null;
  sma20: number | null;
  sma50: number | null;
  macd: { macd: number; signal: number; histogram: number } | null;
  recommendation: "BUY" | "SELL" | "HOLD";
  signals: string[];
  score: number; // -100 to 100, positive = bullish
}

/**
 * RSI (Relative Strength Index) - 14 period default
 * Overbought > 70 = potential sell, Oversold < 30 = potential buy
 */
export function calculateRSI(prices: number[], period = 14): number | null {
  if (prices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Simple Moving Average
 */
export function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Exponential Moving Average
 */
export function calculateEMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  return ema;
}

/**
 * MACD (Moving Average Convergence Divergence)
 * Default: 12, 26, 9
 * Bullish: MACD > Signal, Bearish: MACD < Signal
 */
export function calculateMACD(
  prices: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9
): { macd: number; signal: number; histogram: number } | null {
  if (prices.length < slow + signalPeriod) return null;

  const emaFastMult = 2 / (fast + 1);
  const emaSlowMult = 2 / (slow + 1);
  const signalMult = 2 / (signalPeriod + 1);

  let emaFast = prices.slice(0, fast).reduce((a, b) => a + b, 0) / fast;
  let emaSlow = prices.slice(0, slow).reduce((a, b) => a + b, 0) / slow;

  const macdValues: number[] = [];

  for (let i = fast; i < prices.length; i++) {
    emaFast = (prices[i] - emaFast) * emaFastMult + emaFast;
    if (i >= slow) {
      emaSlow = (prices[i] - emaSlow) * emaSlowMult + emaSlow;
      macdValues.push(emaFast - emaSlow);
    }
  }

  if (macdValues.length < signalPeriod) return null;

  let signalLine = macdValues.slice(0, signalPeriod).reduce((a, b) => a + b, 0) / signalPeriod;
  for (let i = signalPeriod; i < macdValues.length; i++) {
    signalLine = (macdValues[i] - signalLine) * signalMult + signalLine;
  }

  const macdLine = macdValues[macdValues.length - 1];
  const histogram = macdLine - signalLine;

  return { macd: macdLine, signal: signalLine, histogram };
}

/**
 * Generate buy/sell recommendation from indicators
 */
export function analyzeStock(prices: PricePoint[]): AnalysisResult {
  const closes = prices.map((p) => p.close);
  const signals: string[] = [];
  let score = 0;

  const rsi = calculateRSI(closes);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const macd = calculateMACD(closes);
  const currentPrice = closes[closes.length - 1];

  // RSI signals
  if (rsi != null) {
    if (rsi < 30) {
      signals.push(`RSI oversold (${rsi.toFixed(1)}) - potential buy`);
      score += 25;
    } else if (rsi > 70) {
      signals.push(`RSI overbought (${rsi.toFixed(1)}) - potential sell`);
      score -= 25;
    } else if (rsi < 45) {
      signals.push(`RSI neutral-low (${rsi.toFixed(1)})`);
      score += 5;
    } else if (rsi > 55) {
      signals.push(`RSI neutral-high (${rsi.toFixed(1)})`);
      score -= 5;
    }
  }

  // Moving average signals (Golden Cross / Death Cross)
  if (sma20 != null && sma50 != null) {
    if (currentPrice > sma20 && sma20 > sma50) {
      signals.push("Price above SMA20, SMA20 above SMA50 - uptrend");
      score += 20;
    } else if (currentPrice < sma20 && sma20 < sma50) {
      signals.push("Price below SMA20, SMA20 below SMA50 - downtrend");
      score -= 20;
    } else if (currentPrice > sma20) {
      signals.push("Price above SMA20");
      score += 10;
    } else if (currentPrice < sma20) {
      signals.push("Price below SMA20");
      score -= 10;
    }
  }

  // MACD signals
  if (macd != null) {
    if (macd.histogram > 0) {
      signals.push("MACD bullish (above signal line)");
      score += 15;
    } else {
      signals.push("MACD bearish (below signal line)");
      score -= 15;
    }
  }

  // Price momentum (recent 5-day)
  if (closes.length >= 5) {
    const fiveDayAgo = closes[closes.length - 5];
    const momentum = ((currentPrice - fiveDayAgo) / fiveDayAgo) * 100;
    if (momentum > 2) {
      signals.push(`5-day momentum +${momentum.toFixed(1)}%`);
      score += 10;
    } else if (momentum < -2) {
      signals.push(`5-day momentum ${momentum.toFixed(1)}%`);
      score -= 10;
    }
  }

  score = Math.max(-100, Math.min(100, score));

  let recommendation: "BUY" | "SELL" | "HOLD" = "HOLD";
  if (score >= 30) recommendation = "BUY";
  else if (score <= -30) recommendation = "SELL";

  return {
    rsi,
    sma20,
    sma50,
    macd,
    recommendation,
    signals,
    score,
  };
}
