

# Premium Bitcoin & USDT Trading Platform

A professional paper-trading platform with real-time crypto data, styled like Binance with a dark theme. Fully client-side with localStorage — GitHub Pages ready (no backend needed).

---

## 1. Dashboard / Home Page
- **Market overview** showing BTC/USDT live price, 24h change, volume, and high/low
- **Portfolio summary** card with total balance, unrealized P&L, and asset allocation (pie chart)
- **Quick trade** widget for fast buy/sell access

## 2. Live Price Charts
- Real-time candlestick chart for BTC/USDT using free CoinGecko or Binance public API
- Timeframe toggles (1m, 5m, 15m, 1h, 4h, 1D)
- Volume bars below the chart
- Price indicators and moving averages overlay

## 3. Trading Panel (Buy & Sell)
- Market order and limit order types
- Buy/Sell toggle with green/red color coding
- Amount input with percentage quick-select (25%, 50%, 75%, 100% of balance)
- Order confirmation with estimated total
- Starting paper balance of $10,000 USDT

## 4. Order Book / Market Depth
- Live bid/ask order book display using Binance public WebSocket API
- Visual depth chart showing buy/sell walls
- Real-time updates with green (bids) and red (asks)

## 5. Trade History
- Complete log of all executed paper trades
- Columns: date, pair, side (buy/sell), price, amount, total, P&L
- Filterable and sortable table
- Export to CSV option

## 6. Portfolio View
- Current holdings breakdown (BTC balance, USDT balance)
- Average entry price and unrealized P&L per asset
- Allocation donut chart
- Balance history line chart over time

## 7. Design & UX
- **Dark Binance-style theme**: deep navy/charcoal background, green for buy/profit, red for sell/loss
- Professional typography and data-dense layout
- Responsive design for desktop and tablet
- Smooth animations on price updates and order execution
- Toast notifications for trade confirmations

## 8. Technical Approach
- Real-time price data from free public APIs (CoinGecko / Binance public endpoints)
- All account data (balance, trades, portfolio) stored in **localStorage**
- Static single-page app — **fully GitHub Pages compatible** (no server required)
- Single account system with no authentication needed

