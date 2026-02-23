import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { useBinanceKlines } from '@/hooks/useBinanceData';

const INTERVALS = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
];

const PriceChart = () => {
  const [interval, setInterval] = useState('1h');
  const klines = useBinanceKlines(interval);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'hsl(218, 15%, 48%)',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'hsl(225, 14%, 10%)' },
        horzLines: { color: 'hsl(225, 14%, 10%)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: 'hsl(47, 100%, 50%)', width: 1, style: 2, labelBackgroundColor: 'hsl(47, 100%, 50%)' },
        horzLine: { color: 'hsl(47, 100%, 50%)', width: 1, style: 2, labelBackgroundColor: 'hsl(47, 100%, 50%)' },
      },
      rightPriceScale: {
        borderColor: 'hsl(225, 14%, 14%)',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: 'hsl(225, 14%, 14%)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: 'hsl(152, 69%, 46%)',
      downColor: 'hsl(354, 70%, 54%)',
      borderDownColor: 'hsl(354, 70%, 54%)',
      borderUpColor: 'hsl(152, 69%, 46%)',
      wickDownColor: 'hsl(354, 70%, 54%)',
      wickUpColor: 'hsl(152, 69%, 46%)',
    });
    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || klines.length === 0) return;

    candleSeriesRef.current.setData(klines);
    volumeSeriesRef.current.setData(
      klines.map(k => ({
        time: k.time,
        value: k.volume,
        color: k.close >= k.open ? 'hsla(152, 69%, 46%, 0.2)' : 'hsla(354, 70%, 54%, 0.2)',
      }))
    );
  }, [klines]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50">
        <span className="section-header mr-3">Chart</span>
        {INTERVALS.map(i => (
          <button
            key={i.value}
            onClick={() => setInterval(i.value)}
            className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-all ${
              interval === i.value
                ? 'bg-primary/15 text-primary glow-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            {i.label}
          </button>
        ))}
      </div>
      <div ref={chartContainerRef} className="flex-1 min-h-[300px]" />
    </div>
  );
};

export default PriceChart;
