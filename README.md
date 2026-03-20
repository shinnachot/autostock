# AutoStock Thailand

Thailand SET stock analysis app with real-time prices, technical indicators, and buy/sell recommendations.

## Features

- **Live price data** – Current price and daily change for Thailand stocks
- **Price chart** – 6-month history with SMA 20 and SMA 50
- **Technical indicators** – RSI, MACD, Moving Averages
- **Buy/Sell recommendation** – Score-based suggestion (BUY / SELL / HOLD)

## Data Sources

### Current & Historical Price Data

- **Yahoo Finance** – Used for both current and historical prices
  - Thai stocks use `.BK` suffix (e.g. AOT.BK, PTT.BK)
  - API: `https://query1.finance.yahoo.com/v8/finance/chart/[SYMBOL].BK`
  - Provides 6 months of daily OHLCV data

### SET Website Reference

- **SET Official** – For reference and verification
  - URL: https://www.set.or.th/th/market/product/stock/quote/[ชื่อหุ้น]/price
  - Example: https://www.set.or.th/th/market/product/stock/quote/AOT/price

### Why Yahoo Finance?

The SET official API (SMART Marketplace) requires a paid subscription (5,000–15,000 THB/month). Yahoo Finance offers free historical data for Thai stocks and is widely used for this purpose.

## Technical Analysis Formulas

| Indicator | Formula | Buy Signal | Sell Signal |
|-----------|---------|------------|-------------|
| **RSI (14)** | Relative Strength Index | RSI < 30 (oversold) | RSI > 70 (overbought) |
| **SMA 20/50** | Simple Moving Average | Price > SMA20, SMA20 > SMA50 | Price < SMA20, SMA20 < SMA50 |
| **MACD** | 12, 26, 9 EMA crossover | Histogram > 0 | Histogram < 0 |

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Popular Symbols

AOT, PTT, BBL, CPALL, ADVANC, SCB, KBANK, PTTEP, TOP

---

*For educational purposes only. Not financial advice.*
# autostock
