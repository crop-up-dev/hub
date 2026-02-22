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
        background: { type: ColorType.Solid, color: 'hsl(220, 18%, 10%)' },
        textColor: 'hsl(215, 15%, 55%)',
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'hsl(220, 14%, 15%)' },
        horzLines: { color: 'hsl(220, 14%, 15%)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: 'hsl(45, 100%, 51%)', width: 1, style: 2 },
        horzLine: { color: 'hsl(45, 100%, 51%)', width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: 'hsl(220, 14%, 18%)',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: 'hsl(220, 14%, 18%)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: 'hsl(145, 63%, 49%)',
      downColor: 'hsl(0, 72%, 51%)',
      borderDownColor: 'hsl(0, 72%, 51%)',
      borderUpColor: 'hsl(145, 63%, 49%)',
      wickDownColor: 'hsl(0, 72%, 51%)',
      wickUpColor: 'hsl(145, 63%, 49%)',
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
        color: k.close >= k.open ? 'hsla(145, 63%, 49%, 0.3)' : 'hsla(0, 72%, 51%, 0.3)',
      }))
    );
  }, [klines]);

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground mr-2">Interval:</span>
        {INTERVALS.map(i => (
          <button
            key={i.value}
            onClick={() => setInterval(i.value)}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              interval === i.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
