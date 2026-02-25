import { useState, useEffect, useRef, useCallback } from 'react';

export interface TickerData {
  price: number;
  priceChange: number;
  priceChangePercent: number;
  high: number;
  low: number;
  volume: number;
  quoteVolume: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export function useBinanceTicker(symbol = 'btcusdt') {
  const [ticker, setTicker] = useState<TickerData>({
    price: 0, priceChange: 0, priceChangePercent: 0,
    high: 0, low: 0, volume: 0, quoteVolume: 0,
  });
  const [prevPrice, setPrevPrice] = useState(0);

  useEffect(() => {
    setTicker({ price: 0, priceChange: 0, priceChangePercent: 0, high: 0, low: 0, volume: 0, quoteVolume: 0 });
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTicker(prev => {
        setPrevPrice(prev.price);
        return {
          price: parseFloat(data.c),
          priceChange: parseFloat(data.p),
          priceChangePercent: parseFloat(data.P),
          high: parseFloat(data.h),
          low: parseFloat(data.l),
          volume: parseFloat(data.v),
          quoteVolume: parseFloat(data.q),
        };
      });
    };
    return () => ws.close();
  }, [symbol]);

  return { ticker, prevPrice };
}

export function useBinanceOrderBook(symbol = 'btcusdt', depth = 20) {
  const [orderBook, setOrderBook] = useState<OrderBookData>({ bids: [], asks: [] });

  useEffect(() => {
    setOrderBook({ bids: [], asks: [] });
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth${depth}@100ms`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const processEntries = (entries: string[][]): OrderBookEntry[] => {
        let cumTotal = 0;
        return entries.slice(0, depth).map(([p, q]) => {
          const price = parseFloat(p);
          const quantity = parseFloat(q);
          cumTotal += quantity;
          return { price, quantity, total: cumTotal };
        });
      };
      setOrderBook({
        bids: processEntries(data.bids || data.b || []),
        asks: processEntries((data.asks || data.a || []).reverse()),
      });
    };
    return () => ws.close();
  }, [symbol, depth]);

  return orderBook;
}

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function useBinanceKlines(symbol = 'btcusdt', interval = '1h') {
  const [klines, setKlines] = useState<KlineData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchHistorical = useCallback(async (sym: string, intv: string) => {
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${sym.toUpperCase()}&interval=${intv}&limit=200`
      );
      const data = await res.json();
      const parsed: KlineData[] = data.map((k: any[]) => ({
        time: Math.floor(k[0] / 1000),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
      setKlines(parsed);
    } catch (e) {
      console.error('Failed to fetch klines:', e);
    }
  }, []);

  useEffect(() => {
    setKlines([]);
    fetchHistorical(symbol, interval);

    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const k = data.k;
      const newKline: KlineData = {
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v),
      };
      setKlines(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].time === newKline.time) {
          updated[updated.length - 1] = newKline;
        } else {
          updated.push(newKline);
        }
        return updated;
      });
    };

    return () => ws.close();
  }, [symbol, interval, fetchHistorical]);

  return klines;
}

export function useRecentTrades(symbol = 'btcusdt') {
  const [trades, setTrades] = useState<{ price: number; qty: number; isBuyerMaker: boolean; time: number }[]>([]);

  useEffect(() => {
    setTrades([]);
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTrades(prev => [
        { price: parseFloat(data.p), qty: parseFloat(data.q), isBuyerMaker: data.m, time: data.T },
        ...prev.slice(0, 49),
      ]);
    };
    return () => ws.close();
  }, [symbol]);

  return trades;
}

export const SUPPORTED_ASSETS = [
  { symbol: 'btcusdt', base: 'BTC', name: 'Bitcoin' },
  { symbol: 'ethusdt', base: 'ETH', name: 'Ethereum' },
  { symbol: 'solusdt', base: 'SOL', name: 'Solana' },
  { symbol: 'xrpusdt', base: 'XRP', name: 'XRP' },
  { symbol: 'adausdt', base: 'ADA', name: 'Cardano' },
] as const;
