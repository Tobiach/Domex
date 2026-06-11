import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, BarChart3, Globe, Activity } from 'lucide-react';
import { TradingViewWidget } from '../components/Widgets/TradingViewWidget';
import { cn } from '../lib/utils';

type TabType = 'CRIPTO' | 'ACCIONES' | 'FOREX';

export default function Mercado() {
  const [activeTab, setActiveTab] = useState<TabType>('CRIPTO');

  const tabs: { id: TabType; label: string; Icon: any; color: string }[] = [
    { id: 'CRIPTO',   label: 'CRIPTO',   Icon: Activity,  color: '#F97316' },
    { id: 'ACCIONES', label: 'ACCIONES', Icon: BarChart3, color: '#10B981' },
    { id: 'FOREX',    label: 'FOREX',    Icon: Globe,     color: '#3B82F6' },
  ];

  const getChartSymbol = () => {
    if (activeTab === 'CRIPTO')   return 'BINANCE:BTCUSDT';
    if (activeTab === 'ACCIONES') return 'INDEX:SPX';
    return 'FX:EURUSD';
  };

  const activeColor = tabs.find(t => t.id === activeTab)?.color ?? 'var(--color-accent)';

  return (
    <div className="space-y-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Ticker tape */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <TradingViewWidget
          height={46}
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
          config={{
            symbols: [
              { proName: 'BINANCE:BTCUSDT', title: 'Bitcoin' },
              { proName: 'BINANCE:ETHUSDT', title: 'Ethereum' },
              { proName: 'BINANCE:SOLUSDT', title: 'Solana' },
              { proName: 'NASDAQ:TSLA',     title: 'Tesla' },
              { proName: 'NASDAQ:AAPL',     title: 'Apple' },
              { proName: 'NASDAQ:NVDA',     title: 'NVIDIA' },
              { proName: 'INDEX:SPX',       title: 'S&P 500' },
              { proName: 'FX:EURUSD',       title: 'EUR/USD' },
              { proName: 'FX:USDJPY',       title: 'USD/JPY' },
            ],
            colorTheme: 'dark',
            isTransparent: true,
            displayMode: 'adaptive',
            locale: 'es',
          }}
        />
      </div>

      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="live-dot" />
            <span className="sys-label">DATOS FINANCIEROS · REAL TIME</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Mercado</h1>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${activeColor}10`, border: `1px solid ${activeColor}20` }}>
          <TrendingUp size={18} style={{ color: activeColor }} />
        </div>
      </header>

      {/* Tab selector */}
      <div className="bm-card p-1 flex gap-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all relative overflow-hidden"
              style={active
                ? { background: `${tab.color}15`, border: `1px solid ${tab.color}30`, color: tab.color }
                : { color: 'rgba(255,255,255,0.3)' }
              }
            >
              <tab.Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Category widget */}
      <div className="bm-card overflow-hidden" style={{ '--bm-accent': activeColor } as any}>
        <div className="p-3 border-b" style={{ borderColor: `${activeColor}15` }}>
          <div className="flex items-center gap-2">
            {React.createElement(tabs.find(t => t.id === activeTab)!.Icon, { size: 11, style: { color: activeColor } })}
            <span className="sys-label" style={{ color: activeColor, opacity: 1 }}>
              {activeTab === 'CRIPTO' ? 'HEATMAP CRIPTO' : activeTab === 'ACCIONES' ? 'ÍNDICES + TECH' : 'TIPO DE CAMBIO'}
            </span>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'CRIPTO' && (
              <TradingViewWidget
                height={420}
                scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js"
                config={{ dataSource: 'Crypto', blockSize: 'market_cap_calc', blockColor: 'change', locale: 'es', colorTheme: 'dark', isTransparent: true }}
              />
            )}
            {activeTab === 'ACCIONES' && (
              <TradingViewWidget
                height={420}
                scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
                config={{
                  colorTheme: 'dark', dateRange: '1D', showChart: true, locale: 'es', isTransparent: true,
                  tabs: [
                    { title: 'Índices', symbols: [{ s: 'INDEX:SPX' }, { s: 'INDEX:NDX' }, { s: 'INDEX:DJI' }] },
                    { title: 'Tech', symbols: [{ s: 'NASDAQ:NVDA' }, { s: 'NASDAQ:TSLA' }, { s: 'NASDAQ:AAPL' }, { s: 'NASDAQ:MSFT' }] },
                  ],
                }}
              />
            )}
            {activeTab === 'FOREX' && (
              <TradingViewWidget
                height={420}
                scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-forex-rates.js"
                config={{ base: 'USD', colorTheme: 'dark', isTransparent: true, locale: 'es' }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Advanced chart */}
      <div className="bm-card overflow-hidden" style={{ '--bm-accent': activeColor } as any}>
        <div className="p-3 border-b" style={{ borderColor: `${activeColor}15` }}>
          <div className="flex items-center gap-2">
            <BarChart3 size={11} style={{ color: activeColor }} />
            <span className="sys-label" style={{ color: activeColor, opacity: 1 }}>ANÁLISIS TÉCNICO · {getChartSymbol()}</span>
          </div>
        </div>
        <TradingViewWidget
          height={460}
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
          config={{
            symbol: getChartSymbol(), interval: 'D', timezone: 'Etc/UTC', theme: 'dark', style: '1', locale: 'es',
            enable_publishing: false, allow_symbol_change: true, container_id: 'tradingview_chart',
            backgroundColor: 'rgba(6,6,14,0)', gridColor: 'rgba(255,255,255,0.04)',
            hide_top_toolbar: false, hide_legend: false, save_image: false,
          }}
        />
      </div>
    </div>
  );
}
